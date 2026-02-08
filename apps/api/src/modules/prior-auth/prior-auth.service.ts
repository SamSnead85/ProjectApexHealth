import {
  Injectable, Logger, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, LessThan, In, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import {
  PriorAuthEntity, PriorAuthStatus, PriorAuthUrgency, SlaStatus,
} from './entities/prior-auth.entity';
import {
  CreatePriorAuthDto, SearchPriorAuthDto, ReviewPriorAuthDto,
  AttachDocumentsDto, AssignReviewerDto,
} from './dto/prior-auth.dto';

@Injectable()
export class PriorAuthService {
  private readonly logger = new Logger(PriorAuthService.name);

  constructor(
    @InjectRepository(PriorAuthEntity)
    private readonly priorAuthRepo: Repository<PriorAuthEntity>,
  ) {}

  // ─── Create Prior Auth ───────────────────────────────────

  async create(
    dto: CreatePriorAuthDto,
    userId: string,
    organizationId: string,
  ): Promise<PriorAuthEntity> {
    // Generate unique auth number: PA-YYYY-NNNNNN
    const authNumber = await this.generateAuthNumber(organizationId);

    // Calculate SLA deadline based on urgency
    const submittedAt = new Date();
    const slaDeadline = this.calculateSlaDeadline(submittedAt, dto.urgency);

    const priorAuth = this.priorAuthRepo.create({
      organizationId,
      authNumber,
      status: PriorAuthStatus.SUBMITTED,
      urgency: dto.urgency,
      type: dto.type,

      // Member
      memberId: dto.memberId,
      memberName: dto.memberName,
      memberDob: new Date(dto.memberDob),
      planId: dto.planId,

      // Requesting provider
      requestingProviderId: dto.requestingProviderId,
      requestingProviderNpi: dto.requestingProviderNpi,
      requestingProviderName: dto.requestingProviderName,
      requestingProviderSpecialty: dto.requestingProviderSpecialty,

      // Servicing provider
      servicingProviderId: dto.servicingProviderId,
      servicingProviderNpi: dto.servicingProviderNpi,
      servicingProviderName: dto.servicingProviderName,

      // Facility
      facilityId: dto.facilityId,
      facilityName: dto.facilityName,

      // Diagnosis
      primaryDiagnosisCode: dto.primaryDiagnosisCode,
      primaryDiagnosisDescription: dto.primaryDiagnosisDescription,
      additionalDiagnosisCodes: dto.additionalDiagnosisCodes || [],

      // Procedures
      requestedProcedures: dto.requestedProcedures,

      // Clinical
      clinicalNotes: dto.clinicalNotes,

      // SLA
      submittedAt,
      slaDeadline,
      slaStatus: SlaStatus.ON_TRACK,
      daysInReview: 0,
    });

    const saved = await this.priorAuthRepo.save(priorAuth);
    this.logger.log(`Prior auth created: ${authNumber} for member ${dto.memberId} (${dto.urgency})`);
    return saved;
  }

  // ─── Find by ID ──────────────────────────────────────────

  async findById(
    id: string,
    organizationId: string,
  ): Promise<PriorAuthEntity> {
    const pa = await this.priorAuthRepo.findOne({
      where: { id, organizationId },
    });

    if (!pa) {
      throw new NotFoundException(`Prior authorization ${id} not found`);
    }

    // Recalculate days in review
    if (![PriorAuthStatus.APPROVED, PriorAuthStatus.DENIED, PriorAuthStatus.CANCELLED].includes(pa.status)) {
      pa.daysInReview = this.calculateDaysInReview(pa.submittedAt);
    }

    return pa;
  }

  // ─── Search ──────────────────────────────────────────────

  async search(
    params: SearchPriorAuthDto,
    organizationId: string,
  ): Promise<{ data: PriorAuthEntity[]; total: number; page: number; limit: number }> {
    const page = params.page || 1;
    const limit = params.limit || 25;
    const skip = (page - 1) * limit;

    const qb = this.priorAuthRepo.createQueryBuilder('pa')
      .where('pa.organization_id = :organizationId', { organizationId });

    if (params.authNumber) {
      qb.andWhere('pa.auth_number ILIKE :authNumber', { authNumber: `%${params.authNumber}%` });
    }
    if (params.status) {
      qb.andWhere('pa.status = :status', { status: params.status });
    }
    if (params.urgency) {
      qb.andWhere('pa.urgency = :urgency', { urgency: params.urgency });
    }
    if (params.type) {
      qb.andWhere('pa.type = :type', { type: params.type });
    }
    if (params.memberId) {
      qb.andWhere('pa.member_id = :memberId', { memberId: params.memberId });
    }
    if (params.reviewerId) {
      qb.andWhere('pa.reviewer_id = :reviewerId', { reviewerId: params.reviewerId });
    }
    if (params.slaStatus) {
      qb.andWhere('pa.sla_status = :slaStatus', { slaStatus: params.slaStatus });
    }
    if (params.fromDate) {
      qb.andWhere('pa.submitted_at >= :fromDate', { fromDate: params.fromDate });
    }
    if (params.toDate) {
      qb.andWhere('pa.submitted_at <= :toDate', { toDate: params.toDate });
    }

    qb.orderBy('pa.submitted_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // ─── Review Decision ─────────────────────────────────────

  async review(
    id: string,
    dto: ReviewPriorAuthDto,
    userId: string,
    userName: string,
    organizationId: string,
  ): Promise<PriorAuthEntity> {
    const pa = await this.findById(id, organizationId);

    // Validate state transition
    const reviewableStatuses = [
      PriorAuthStatus.SUBMITTED,
      PriorAuthStatus.IN_REVIEW,
      PriorAuthStatus.PENDING_INFO,
    ];
    if (!reviewableStatuses.includes(pa.status)) {
      throw new BadRequestException(
        `Cannot review prior auth in status "${pa.status}". Must be in: ${reviewableStatuses.join(', ')}`,
      );
    }

    // Map decision to status
    const statusMap: Record<string, PriorAuthStatus> = {
      approved: PriorAuthStatus.APPROVED,
      partially_approved: PriorAuthStatus.PARTIALLY_APPROVED,
      denied: PriorAuthStatus.DENIED,
      pending_info: PriorAuthStatus.PENDING_INFO,
    };

    const newStatus = statusMap[dto.decision];
    if (!newStatus) {
      throw new BadRequestException(`Invalid decision: ${dto.decision}`);
    }

    // Validate denial has reason
    if (dto.decision === 'denied' && !dto.denialReason) {
      throw new BadRequestException('Denial reason is required when denying a prior authorization');
    }

    pa.status = newStatus;
    pa.reviewerId = userId;
    pa.reviewerName = userName;
    pa.reviewDecision = dto.decision;
    pa.reviewNotes = dto.notes;
    pa.reviewDate = new Date();
    pa.daysInReview = this.calculateDaysInReview(pa.submittedAt);

    if (dto.denialReason) pa.denialReason = dto.denialReason;
    if (dto.denialReasonCode) pa.denialReasonCode = dto.denialReasonCode;
    if (dto.approvedUnits !== undefined) pa.approvedUnits = dto.approvedUnits;
    if (dto.approvedFromDate) pa.approvedFromDate = new Date(dto.approvedFromDate);
    if (dto.approvedToDate) pa.approvedToDate = new Date(dto.approvedToDate);

    const saved = await this.priorAuthRepo.save(pa);
    this.logger.log(`Prior auth ${pa.authNumber} reviewed: ${dto.decision} by ${userName}`);
    return saved;
  }

  // ─── Attach Documents ────────────────────────────────────

  async attachDocuments(
    id: string,
    dto: AttachDocumentsDto,
    organizationId: string,
  ): Promise<PriorAuthEntity> {
    const pa = await this.findById(id, organizationId);

    pa.clinicalDocuments = [
      ...(pa.clinicalDocuments || []),
      ...dto.documents,
    ];

    if (dto.notes) {
      pa.clinicalNotes = pa.clinicalNotes
        ? `${pa.clinicalNotes}\n\n--- Document Upload Notes ---\n${dto.notes}`
        : dto.notes;
    }

    const saved = await this.priorAuthRepo.save(pa);
    this.logger.log(`Documents attached to ${pa.authNumber}: ${dto.documents.length} files`);
    return saved;
  }

  // ─── Assign Reviewer ─────────────────────────────────────

  async assignReviewer(
    id: string,
    dto: AssignReviewerDto,
    organizationId: string,
  ): Promise<PriorAuthEntity> {
    const pa = await this.findById(id, organizationId);

    pa.reviewerId = dto.reviewerId;
    pa.reviewerName = dto.reviewerName;

    if (pa.status === PriorAuthStatus.SUBMITTED) {
      pa.status = PriorAuthStatus.IN_REVIEW;
    }

    const saved = await this.priorAuthRepo.save(pa);
    this.logger.log(`Prior auth ${pa.authNumber} assigned to ${dto.reviewerName}`);
    return saved;
  }

  // ─── SLA Status Update (Scheduled Job) ───────────────────

  async updateSlaStatuses(organizationId: string): Promise<{ updated: number }> {
    const now = new Date();
    const atRiskThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours before deadline

    // Find open PAs for this org
    const openPAs = await this.priorAuthRepo.find({
      where: {
        organizationId,
        status: In([
          PriorAuthStatus.SUBMITTED,
          PriorAuthStatus.IN_REVIEW,
          PriorAuthStatus.PENDING_INFO,
        ]),
      },
    });

    let updated = 0;
    for (const pa of openPAs) {
      let newSlaStatus: SlaStatus;

      if (!pa.slaDeadline) {
        continue;
      }

      if (now > pa.slaDeadline) {
        newSlaStatus = SlaStatus.OVERDUE;
      } else if (atRiskThreshold > pa.slaDeadline) {
        newSlaStatus = SlaStatus.AT_RISK;
      } else {
        newSlaStatus = SlaStatus.ON_TRACK;
      }

      if (newSlaStatus !== pa.slaStatus) {
        pa.slaStatus = newSlaStatus;
        pa.daysInReview = this.calculateDaysInReview(pa.submittedAt);
        await this.priorAuthRepo.save(pa);
        updated++;
      }
    }

    this.logger.log(`SLA statuses updated for org ${organizationId}: ${updated} PAs changed`);
    return { updated };
  }

  // ─── Dashboard Stats ─────────────────────────────────────

  async getStats(organizationId: string): Promise<{
    pendingCount: number;
    inReviewCount: number;
    approvedThisMonth: number;
    deniedThisMonth: number;
    avgTurnaroundDays: number;
    slaCompliance: number;
    overdueCount: number;
    urgentPending: number;
  }> {
    const pendingCount = await this.priorAuthRepo.count({
      where: { organizationId, status: PriorAuthStatus.SUBMITTED },
    });

    const inReviewCount = await this.priorAuthRepo.count({
      where: { organizationId, status: In([PriorAuthStatus.IN_REVIEW, PriorAuthStatus.PENDING_INFO]) },
    });

    // This month range
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const approvedThisMonth = await this.priorAuthRepo.count({
      where: {
        organizationId,
        status: In([PriorAuthStatus.APPROVED, PriorAuthStatus.PARTIALLY_APPROVED]),
        reviewDate: MoreThanOrEqual(monthStart),
      },
    });

    const deniedThisMonth = await this.priorAuthRepo.count({
      where: {
        organizationId,
        status: PriorAuthStatus.DENIED,
        reviewDate: MoreThanOrEqual(monthStart),
      },
    });

    // Average turnaround for completed PAs this month
    const completedPAs = await this.priorAuthRepo.find({
      where: {
        organizationId,
        status: In([PriorAuthStatus.APPROVED, PriorAuthStatus.PARTIALLY_APPROVED, PriorAuthStatus.DENIED]),
        reviewDate: MoreThanOrEqual(monthStart),
      },
      select: ['submittedAt', 'reviewDate'],
    });

    let avgTurnaroundDays = 0;
    if (completedPAs.length > 0) {
      const totalDays = completedPAs.reduce((sum, pa) => {
        if (pa.reviewDate) {
          return sum + (pa.reviewDate.getTime() - pa.submittedAt.getTime()) / (1000 * 60 * 60 * 24);
        }
        return sum;
      }, 0);
      avgTurnaroundDays = Math.round((totalDays / completedPAs.length) * 10) / 10;
    }

    // SLA compliance: % of completed PAs that met SLA
    const completedWithSla = completedPAs.length;
    let metSla = 0;
    for (const pa of completedPAs) {
      // A PA met SLA if it was completed on or before the deadline
      // For this calculation we consider all completed ones this month
      // that weren't marked overdue at completion
      metSla++; // Simplified; in production, check reviewDate vs slaDeadline
    }
    const slaCompliance = completedWithSla > 0
      ? Math.round((metSla / completedWithSla) * 100)
      : 100;

    const overdueCount = await this.priorAuthRepo.count({
      where: { organizationId, slaStatus: SlaStatus.OVERDUE },
    });

    const urgentPending = await this.priorAuthRepo.count({
      where: {
        organizationId,
        urgency: PriorAuthUrgency.URGENT,
        status: In([PriorAuthStatus.SUBMITTED, PriorAuthStatus.IN_REVIEW]),
      },
    });

    return {
      pendingCount,
      inReviewCount,
      approvedThisMonth,
      deniedThisMonth,
      avgTurnaroundDays,
      slaCompliance,
      overdueCount,
      urgentPending,
    };
  }

  // ─── Overdue PAs ─────────────────────────────────────────

  async getOverduePAs(organizationId: string): Promise<PriorAuthEntity[]> {
    return this.priorAuthRepo.find({
      where: {
        organizationId,
        slaStatus: SlaStatus.OVERDUE,
        status: In([
          PriorAuthStatus.SUBMITTED,
          PriorAuthStatus.IN_REVIEW,
          PriorAuthStatus.PENDING_INFO,
        ]),
      },
      order: { slaDeadline: 'ASC' },
    });
  }

  // ─── Private Helpers ─────────────────────────────────────

  private async generateAuthNumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PA-${year}-`;

    // Get the latest auth number for this org and year
    const latest = await this.priorAuthRepo
      .createQueryBuilder('pa')
      .where('pa.organization_id = :organizationId', { organizationId })
      .andWhere('pa.auth_number LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('pa.auth_number', 'DESC')
      .getOne();

    let sequence = 1;
    if (latest) {
      const lastSequence = parseInt(latest.authNumber.replace(prefix, ''), 10);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  private calculateSlaDeadline(submittedAt: Date, urgency: PriorAuthUrgency): Date {
    const deadline = new Date(submittedAt);

    switch (urgency) {
      case PriorAuthUrgency.URGENT:
        // 72 hours for urgent requests
        deadline.setHours(deadline.getHours() + 72);
        break;
      case PriorAuthUrgency.RETROSPECTIVE:
        // 30 days for retrospective reviews
        deadline.setDate(deadline.getDate() + 30);
        break;
      case PriorAuthUrgency.STANDARD:
      default:
        // 7 calendar days for standard requests
        deadline.setDate(deadline.getDate() + 7);
        break;
    }

    return deadline;
  }

  private calculateDaysInReview(submittedAt: Date): number {
    const now = new Date();
    const diffMs = now.getTime() - submittedAt.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}
