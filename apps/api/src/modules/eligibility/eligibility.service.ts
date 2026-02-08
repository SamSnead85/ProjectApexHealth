import {
  Injectable, Logger, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MemberEligibilityEntity, EligibilityStatus, Accumulators } from './entities/member-eligibility.entity';
import { BenefitPlanEntity } from './entities/benefit-plan.entity';
import { EnrollmentEventEntity, EnrollmentEventStatus, EnrollmentEventType } from './entities/enrollment-event.entity';
import {
  VerifyEligibilityDto, EligibilityResponse, EnrollMemberDto,
  TerminateMemberDto, SearchMembersDto, UpdateAccumulatorsDto,
} from './dto/eligibility.dto';

@Injectable()
export class EligibilityService {
  private readonly logger = new Logger(EligibilityService.name);

  constructor(
    @InjectRepository(MemberEligibilityEntity)
    private readonly eligibilityRepo: Repository<MemberEligibilityEntity>,

    @InjectRepository(BenefitPlanEntity)
    private readonly planRepo: Repository<BenefitPlanEntity>,

    @InjectRepository(EnrollmentEventEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEventEntity>,
  ) {}

  // ─── Real-time Eligibility Verification (EDI 270/271) ────

  async verifyEligibility(
    inquiry: VerifyEligibilityDto,
    organizationId: string,
  ): Promise<EligibilityResponse> {
    const transactionId = `ELG-${Date.now()}-${uuidv4().substring(0, 8)}`;
    this.logger.log(`Eligibility inquiry ${transactionId}: ${JSON.stringify({
      memberId: inquiry.memberId,
      subscriberId: inquiry.subscriberId,
    })}`);

    // Look up member by ID or demographics
    let eligibility: MemberEligibilityEntity | null = null;

    if (inquiry.memberId) {
      eligibility = await this.eligibilityRepo.findOne({
        where: { memberId: inquiry.memberId, organizationId },
      });
    } else if (inquiry.subscriberId) {
      eligibility = await this.eligibilityRepo.findOne({
        where: { subscriberId: inquiry.subscriberId, organizationId },
      });
    }

    if (!eligibility) {
      return {
        eligible: false,
        memberId: inquiry.memberId || '',
        subscriberId: inquiry.subscriberId || '',
        memberName: 'Unknown',
        status: EligibilityStatus.INACTIVE,
        planInfo: { planId: '', planName: '', planType: '' },
        coverageDates: { effectiveDate: '' },
        accumulators: {},
        relationship: eligibility?.relationship || undefined as any,
        verifiedAt: new Date().toISOString(),
        transactionId,
      };
    }

    // Check active coverage for the service date
    const serviceDate = inquiry.serviceDate
      ? new Date(inquiry.serviceDate)
      : new Date();

    const isActive = eligibility.status === EligibilityStatus.ACTIVE
      && new Date(eligibility.effectiveDate) <= serviceDate
      && (!eligibility.terminationDate || new Date(eligibility.terminationDate) >= serviceDate);

    // Load benefit plan details
    const plan = await this.planRepo.findOne({
      where: { id: eligibility.planId, organizationId },
    });

    const response: EligibilityResponse = {
      eligible: isActive,
      memberId: eligibility.memberId,
      subscriberId: eligibility.subscriberId,
      memberName: eligibility.memberId, // In production, join with member demographics
      status: eligibility.status,
      planInfo: {
        planId: plan?.planId || eligibility.planId,
        planName: plan?.planName || 'Unknown Plan',
        planType: plan?.planType || 'Unknown',
        groupId: eligibility.groupId,
      },
      coverageDates: {
        effectiveDate: eligibility.effectiveDate.toString(),
        terminationDate: eligibility.terminationDate?.toString(),
      },
      benefits: plan?.benefits || {},
      accumulators: {
        individualDeductible: eligibility.accumulators?.individualDeductible,
        familyDeductible: eligibility.accumulators?.familyDeductible,
        individualOopMax: eligibility.accumulators?.individualOopMax,
        familyOopMax: eligibility.accumulators?.familyOopMax,
      },
      relationship: eligibility.relationship,
      verifiedAt: new Date().toISOString(),
      transactionId,
    };

    this.logger.log(`Eligibility verified: ${transactionId} - eligible=${isActive}, member=${eligibility.memberId}`);
    return response;
  }

  // ─── Enrollment ──────────────────────────────────────────

  async enroll(
    dto: EnrollMemberDto,
    organizationId: string,
    userId?: string,
  ): Promise<EnrollmentEventEntity> {
    this.logger.log(`Processing enrollment: member=${dto.memberId}, plan=${dto.planId}, type=${dto.type}`);

    // Validate plan exists and is active
    const plan = await this.planRepo.findOne({
      where: { id: dto.planId, organizationId, isActive: true },
    });
    if (!plan) {
      throw new BadRequestException(`Benefit plan ${dto.planId} not found or inactive`);
    }

    // Create enrollment event
    const event = this.enrollmentRepo.create({
      organizationId,
      type: dto.type,
      memberId: dto.memberId,
      subscriberId: dto.subscriberId,
      groupId: dto.groupId,
      planId: dto.planId,
      effectiveDate: new Date(dto.effectiveDate),
      status: EnrollmentEventStatus.PROCESSING,
      createdBy: userId,
    });

    const savedEvent = await this.enrollmentRepo.save(event);

    // Create or update eligibility record
    try {
      let eligibility = await this.eligibilityRepo.findOne({
        where: { memberId: dto.memberId, organizationId },
      });

      if (eligibility) {
        eligibility.planId = dto.planId;
        eligibility.groupId = dto.groupId;
        eligibility.effectiveDate = new Date(dto.effectiveDate);
        eligibility.status = EligibilityStatus.ACTIVE;
        eligibility.terminationDate = undefined;
        if (dto.relationship) {
          eligibility.relationship = dto.relationship;
        }
      } else {
        eligibility = this.eligibilityRepo.create({
          organizationId,
          memberId: dto.memberId,
          subscriberId: dto.subscriberId,
          planId: dto.planId,
          groupId: dto.groupId,
          effectiveDate: new Date(dto.effectiveDate),
          status: EligibilityStatus.ACTIVE,
          relationship: dto.relationship,
          accumulators: {
            individualDeductible: { used: 0, limit: plan.deductibles?.individualInNetwork || 0 },
            familyDeductible: { used: 0, limit: plan.deductibles?.familyInNetwork || 0 },
            individualOopMax: { used: 0, limit: plan.oopMaximums?.individualInNetwork || 0 },
            familyOopMax: { used: 0, limit: plan.oopMaximums?.familyInNetwork || 0 },
            planYear: new Date().getFullYear().toString(),
            lastUpdated: new Date().toISOString(),
          },
        });
      }

      await this.eligibilityRepo.save(eligibility);

      // Mark event as completed
      savedEvent.status = EnrollmentEventStatus.COMPLETED;
      savedEvent.processedDate = new Date();
      await this.enrollmentRepo.save(savedEvent);

      this.logger.log(`Enrollment completed: event=${savedEvent.id}, member=${dto.memberId}`);
    } catch (error) {
      savedEvent.status = EnrollmentEventStatus.ERROR;
      savedEvent.errorMessages = [error instanceof Error ? error.message : 'Unknown error'];
      await this.enrollmentRepo.save(savedEvent);
      throw error;
    }

    return savedEvent;
  }

  // ─── Termination ─────────────────────────────────────────

  async terminate(
    dto: TerminateMemberDto,
    organizationId: string,
    userId?: string,
  ): Promise<EnrollmentEventEntity> {
    this.logger.log(`Processing termination: member=${dto.memberId}, reason=${dto.reason}`);

    const eligibility = await this.eligibilityRepo.findOne({
      where: { memberId: dto.memberId, organizationId, status: EligibilityStatus.ACTIVE },
    });

    if (!eligibility) {
      throw new NotFoundException(`No active eligibility found for member ${dto.memberId}`);
    }

    // Create termination enrollment event
    const event = this.enrollmentRepo.create({
      organizationId,
      type: EnrollmentEventType.TERMINATION,
      memberId: dto.memberId,
      subscriberId: eligibility.subscriberId,
      groupId: eligibility.groupId,
      planId: eligibility.planId,
      effectiveDate: new Date(dto.effectiveDate),
      status: EnrollmentEventStatus.PROCESSING,
      createdBy: userId,
    });

    const savedEvent = await this.enrollmentRepo.save(event);

    // Update eligibility record
    eligibility.status = EligibilityStatus.TERMINATED;
    eligibility.terminationDate = new Date(dto.effectiveDate);
    await this.eligibilityRepo.save(eligibility);

    // Complete the event
    savedEvent.status = EnrollmentEventStatus.COMPLETED;
    savedEvent.processedDate = new Date();
    await this.enrollmentRepo.save(savedEvent);

    this.logger.log(`Termination completed: member=${dto.memberId}, effective=${dto.effectiveDate}`);
    return savedEvent;
  }

  // ─── Accumulators ────────────────────────────────────────

  async getAccumulators(
    memberId: string,
    organizationId: string,
  ): Promise<Accumulators> {
    const eligibility = await this.eligibilityRepo.findOne({
      where: { memberId, organizationId },
    });

    if (!eligibility) {
      throw new NotFoundException(`Member ${memberId} not found`);
    }

    return eligibility.accumulators;
  }

  async updateAccumulators(
    memberId: string,
    dto: UpdateAccumulatorsDto,
    organizationId: string,
  ): Promise<Accumulators> {
    const eligibility = await this.eligibilityRepo.findOne({
      where: { memberId, organizationId },
    });

    if (!eligibility) {
      throw new NotFoundException(`Member ${memberId} not found`);
    }

    const accumulators = { ...eligibility.accumulators };

    if (dto.deductibleAmount && accumulators.individualDeductible) {
      accumulators.individualDeductible = {
        ...accumulators.individualDeductible,
        used: accumulators.individualDeductible.used + dto.deductibleAmount,
      };
    }

    if (dto.oopAmount && accumulators.individualOopMax) {
      accumulators.individualOopMax = {
        ...accumulators.individualOopMax,
        used: accumulators.individualOopMax.used + dto.oopAmount,
      };
    }

    if (dto.familyDeductibleAmount && accumulators.familyDeductible) {
      accumulators.familyDeductible = {
        ...accumulators.familyDeductible,
        used: accumulators.familyDeductible.used + dto.familyDeductibleAmount,
      };
    }

    if (dto.familyOopAmount && accumulators.familyOopMax) {
      accumulators.familyOopMax = {
        ...accumulators.familyOopMax,
        used: accumulators.familyOopMax.used + dto.familyOopAmount,
      };
    }

    accumulators.lastUpdated = new Date().toISOString();

    eligibility.accumulators = accumulators;
    await this.eligibilityRepo.save(eligibility);

    this.logger.log(`Accumulators updated: member=${memberId}, claim=${dto.claimId || 'manual'}`);
    return accumulators;
  }

  // ─── Member Search ───────────────────────────────────────

  async searchMembers(
    params: SearchMembersDto,
    organizationId: string,
  ): Promise<{ data: MemberEligibilityEntity[]; total: number; page: number; limit: number }> {
    const page = params.page || 1;
    const limit = params.limit || 25;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<MemberEligibilityEntity> = { organizationId };

    if (params.memberId) where.memberId = params.memberId;
    if (params.subscriberId) where.subscriberId = params.subscriberId;
    if (params.status) where.status = params.status;
    if (params.planId) where.planId = params.planId;

    const [data, total] = await this.eligibilityRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { updatedAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  // ─── Member Detail ───────────────────────────────────────

  async getMemberEligibility(
    memberId: string,
    organizationId: string,
  ): Promise<MemberEligibilityEntity> {
    const eligibility = await this.eligibilityRepo.findOne({
      where: { memberId, organizationId },
    });

    if (!eligibility) {
      throw new NotFoundException(`Member ${memberId} not found`);
    }

    return eligibility;
  }

  // ─── Benefit Plans ───────────────────────────────────────

  async getBenefitPlan(
    planId: string,
    organizationId: string,
  ): Promise<BenefitPlanEntity> {
    const plan = await this.planRepo.findOne({
      where: { id: planId, organizationId },
    });

    if (!plan) {
      throw new NotFoundException(`Benefit plan ${planId} not found`);
    }

    return plan;
  }

  async listBenefitPlans(
    organizationId: string,
    activeOnly = true,
  ): Promise<BenefitPlanEntity[]> {
    const where: FindOptionsWhere<BenefitPlanEntity> = { organizationId };
    if (activeOnly) where.isActive = true;

    return this.planRepo.find({
      where,
      order: { planName: 'ASC' },
    });
  }
}
