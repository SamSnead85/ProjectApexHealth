import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEntity } from './entities/member.entity';
import { CreateMemberDto, UpdateMemberDto, SearchMemberDto } from './dto/member.dto';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);

  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
  ) {}

  async create(dto: CreateMemberDto, organizationId: string): Promise<MemberEntity> {
    const existing = await this.memberRepository.findOne({
      where: { memberId: dto.memberId, organizationId },
    });

    if (existing) {
      throw new ConflictException(`Member with ID ${dto.memberId} already exists in this organization`);
    }

    const member = this.memberRepository.create({
      ...dto,
      organizationId,
      status: 'active',
      // If SSN provided, it would be encrypted here in production
      ssnEncrypted: dto.ssn ? `ENC:${Buffer.from(dto.ssn).toString('base64')}` : undefined,
    });

    // Remove plain SSN before save
    delete (member as any).ssn;

    const saved = await this.memberRepository.save(member);
    this.logger.log(`Member created: ${saved.memberId} (${saved.fullName}) in org ${organizationId}`);
    return saved;
  }

  async findById(id: string, organizationId: string): Promise<MemberEntity> {
    const member = await this.memberRepository.findOne({
      where: { id, organizationId },
    });

    if (!member) {
      throw new NotFoundException(`Member ${id} not found`);
    }

    return member;
  }

  async findByMemberId(memberId: string, organizationId: string): Promise<MemberEntity> {
    const member = await this.memberRepository.findOne({
      where: { memberId, organizationId },
    });

    if (!member) {
      throw new NotFoundException(`Member with member ID ${memberId} not found`);
    }

    return member;
  }

  async search(params: SearchMemberDto, organizationId: string): Promise<{
    data: MemberEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 25;
    const sortBy = params.sortBy ?? 'lastName';
    const sortOrder = (params.sortOrder ?? 'asc').toUpperCase() as 'ASC' | 'DESC';

    const qb = this.memberRepository.createQueryBuilder('m');
    qb.where('m.organization_id = :organizationId', { organizationId });

    if (params.query) {
      qb.andWhere(
        '(m.first_name ILIKE :query OR m.last_name ILIKE :query OR m.member_id ILIKE :query OR m.subscriber_id ILIKE :query)',
        { query: `%${params.query}%` },
      );
    }

    if (params.memberId) {
      qb.andWhere('m.member_id = :memberId', { memberId: params.memberId });
    }

    if (params.firstName) {
      qb.andWhere('m.first_name ILIKE :firstName', { firstName: `%${params.firstName}%` });
    }

    if (params.lastName) {
      qb.andWhere('m.last_name ILIKE :lastName', { lastName: `%${params.lastName}%` });
    }

    if (params.dateOfBirth) {
      qb.andWhere('m.date_of_birth = :dateOfBirth', { dateOfBirth: params.dateOfBirth });
    }

    if (params.groupId) {
      qb.andWhere('m.group_id = :groupId', { groupId: params.groupId });
    }

    if (params.planId) {
      qb.andWhere('m.plan_id = :planId', { planId: params.planId });
    }

    if (params.status) {
      qb.andWhere('m.status = :status', { status: params.status });
    }

    const sortColumnMap: Record<string, string> = {
      lastName: 'm.last_name',
      firstName: 'm.first_name',
      memberId: 'm.member_id',
      status: 'm.status',
      effectiveDate: 'm.effective_date',
      createdAt: 'm.created_at',
    };
    const sortColumn = sortColumnMap[sortBy] || 'm.last_name';
    qb.orderBy(sortColumn, sortOrder);

    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMember360(id: string, organizationId: string): Promise<{
    member: MemberEntity;
    recentClaims: any[];
    activePriorAuths: any[];
    careTeam: any[];
    alerts: any[];
    riskFactors: any[];
  }> {
    const member = await this.findById(id, organizationId);

    // In a full implementation, these would query related services/repositories.
    // For now, return the member with placeholder data structures.
    return {
      member,
      recentClaims: [],
      activePriorAuths: [],
      careTeam: member.pcpProviderId
        ? [{
            providerId: member.pcpProviderId,
            providerName: member.pcpProviderName,
            role: 'Primary Care Physician',
            specialty: 'Primary Care',
          }]
        : [],
      alerts: [],
      riskFactors: member.riskScore
        ? [{
            category: 'Overall',
            description: `HCC Risk Score: ${member.riskScore}`,
            score: Number(member.riskScore),
            trend: 'stable',
          }]
        : [],
    };
  }

  async update(id: string, dto: UpdateMemberDto, organizationId: string): Promise<MemberEntity> {
    const member = await this.findById(id, organizationId);

    if (dto.memberId && dto.memberId !== member.memberId) {
      const existing = await this.memberRepository.findOne({
        where: { memberId: dto.memberId, organizationId },
      });
      if (existing) {
        throw new ConflictException(`Member with ID ${dto.memberId} already exists`);
      }
    }

    // Handle SSN encryption if provided
    if (dto.ssn) {
      (dto as any).ssnEncrypted = `ENC:${Buffer.from(dto.ssn).toString('base64')}`;
      delete dto.ssn;
    }

    Object.assign(member, dto);
    const updated = await this.memberRepository.save(member);
    this.logger.log(`Member updated: ${updated.id} in org ${organizationId}`);
    return updated;
  }

  async getAlerts(id: string, organizationId: string): Promise<any[]> {
    const member = await this.findById(id, organizationId);
    const alerts: any[] = [];

    // Care gap alerts
    if (!member.pcpProviderId) {
      alerts.push({
        id: `alert-no-pcp-${member.id}`,
        type: 'care_gap',
        severity: 'medium',
        title: 'No PCP Assigned',
        description: 'Member does not have a Primary Care Physician assigned.',
        actionRequired: true,
        createdAt: new Date().toISOString(),
      });
    }

    // Risk score alerts
    if (member.riskScore && Number(member.riskScore) > 2.0) {
      alerts.push({
        id: `alert-risk-${member.id}`,
        type: 'care_gap',
        severity: 'high',
        title: 'High Risk Score',
        description: `Member has a risk score of ${member.riskScore}, indicating high complexity.`,
        actionRequired: true,
        createdAt: new Date().toISOString(),
      });
    }

    // Termination date approaching
    if (member.terminationDate) {
      const termDate = new Date(member.terminationDate);
      const daysUntilTerm = Math.ceil((termDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilTerm > 0 && daysUntilTerm <= 30) {
        alerts.push({
          id: `alert-term-${member.id}`,
          type: 'authorization',
          severity: 'medium',
          title: 'Coverage Ending Soon',
          description: `Member coverage terminates in ${daysUntilTerm} days on ${member.terminationDate}.`,
          actionRequired: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return alerts;
  }

  async getCareTeam(id: string, organizationId: string): Promise<any[]> {
    const member = await this.findById(id, organizationId);

    const careTeam: any[] = [];

    if (member.pcpProviderId) {
      careTeam.push({
        id: `ct-pcp-${member.id}`,
        providerId: member.pcpProviderId,
        providerName: member.pcpProviderName || 'Unknown Provider',
        specialty: 'Primary Care',
        role: 'Primary Care Physician',
      });
    }

    // In production, this would join with claims/prior-auth data to find
    // other providers this member has been seeing.
    return careTeam;
  }
}
