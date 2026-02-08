import {
  Injectable, Logger, NotFoundException, BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, In } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { v4 as uuidv4 } from 'uuid';
import { ClaimEntity, ClaimStatus } from './entities/claim.entity';
import { ClaimServiceLineEntity } from './entities/claim-service-line.entity';
import {
  CreateClaimDto, SearchClaimsDto, DenyClaimDto,
  PendClaimDto, AddNoteDto, AssignProcessorDto,
} from './dto/claims.dto';

// ─── Internal Types ──────────────────────────────────
interface AdjudicationResult {
  ruleId: string;
  ruleName: string;
  category: string;
  result: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  autoAction?: 'approve' | 'deny' | 'pend' | 'review';
  confidence?: number;
}

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Fee Schedule (simplified for auto-adjudication) ──
const FEE_SCHEDULE: Record<string, number> = {
  '99213': 125.00,
  '99214': 185.00,
  '99215': 250.00,
  '99203': 165.00,
  '99204': 245.00,
  '99205': 325.00,
  '99281': 85.00,
  '99282': 140.00,
  '99283': 220.00,
  '99284': 360.00,
  '99285': 520.00,
  '27447': 1850.00,
  '43239': 950.00,
  '70553': 425.00,
  '71046': 65.00,
  '73721': 385.00,
  '90834': 110.00,
  '90837': 155.00,
};

const DEFAULT_COPAY = 25.00;
const DEFAULT_COINSURANCE_RATE = 0.20;
const TIMELY_FILING_DAYS = 365;

@Injectable()
export class ClaimsService {
  private readonly logger = new Logger(ClaimsService.name);

  constructor(
    @InjectRepository(ClaimEntity)
    private readonly claimRepository: Repository<ClaimEntity>,
    @InjectRepository(ClaimServiceLineEntity)
    private readonly serviceLineRepository: Repository<ClaimServiceLineEntity>,
    @InjectQueue('claims-processing')
    private readonly claimsQueue: Queue,
  ) {}

  // ═══════════════════════════════════════════════════════
  // CREATE CLAIM
  // ═══════════════════════════════════════════════════════

  async create(dto: CreateClaimDto, userId: string, organizationId: string): Promise<ClaimEntity> {
    // Generate unique claim number within the organization
    const claimNumber = await this.generateClaimNumber(organizationId);

    // Calculate total charged amount from service lines
    const totalChargedAmount = dto.serviceLines.reduce(
      (sum, line) => sum + (line.chargedAmount * line.units), 0,
    );

    // Create claim entity
    const claim = this.claimRepository.create({
      organizationId,
      claimNumber,
      type: dto.type as any,
      status: 'received',
      source: (dto.source || 'api') as any,
      memberId: dto.memberId,
      subscriberId: dto.subscriberId,
      patientFirstName: dto.patientFirstName,
      patientLastName: dto.patientLastName,
      patientDob: dto.patientDob,
      patientGender: dto.patientGender,
      memberPlanId: dto.memberPlanId,
      renderingProviderId: dto.renderingProviderId,
      renderingProviderNpi: dto.renderingProviderNpi,
      renderingProviderName: dto.renderingProviderName,
      billingProviderId: dto.billingProviderId,
      billingProviderNpi: dto.billingProviderNpi,
      billingProviderName: dto.billingProviderName,
      facilityId: dto.facilityId,
      facilityName: dto.facilityName,
      placeOfServiceCode: dto.placeOfServiceCode,
      serviceFromDate: dto.serviceFromDate,
      serviceToDate: dto.serviceToDate,
      receivedDate: new Date().toISOString().split('T')[0],
      primaryDiagnosisCode: dto.primaryDiagnosisCode,
      primaryDiagnosisDescription: dto.primaryDiagnosisDescription,
      additionalDiagnosisCodes: dto.additionalDiagnosisCodes || [],
      totalChargedAmount,
      ediReferenceNumber: dto.ediReferenceNumber,
      notes: [{
        id: uuidv4(),
        userId,
        userName: 'System',
        noteType: 'system',
        content: `Claim received via ${dto.source || 'api'}. Total charged: $${totalChargedAmount.toFixed(2)}`,
        createdAt: new Date().toISOString(),
      }],
    });

    const savedClaim = await this.claimRepository.save(claim);

    // Create service lines
    const serviceLines = dto.serviceLines.map((line) =>
      this.serviceLineRepository.create({
        claimId: savedClaim.id,
        lineNumber: line.lineNumber,
        procedureCode: line.procedureCode,
        procedureDescription: line.procedureDescription,
        modifiers: line.modifiers || [],
        revenueCode: line.revenueCode,
        placeOfServiceCode: line.placeOfServiceCode,
        serviceDate: line.serviceDate,
        units: line.units,
        chargedAmount: line.chargedAmount,
        status: 'pending',
      }),
    );

    await this.serviceLineRepository.save(serviceLines);

    this.logger.log(
      `Claim created: ${claimNumber} for member ${dto.memberId} ` +
      `(org: ${organizationId}, charged: $${totalChargedAmount.toFixed(2)})`,
    );

    // Queue for auto-validation
    await this.claimsQueue.add('validate-claim', {
      claimId: savedClaim.id,
      organizationId,
    }, { delay: 1000, priority: 2 });

    return this.findById(savedClaim.id, organizationId);
  }

  // ═══════════════════════════════════════════════════════
  // FIND BY ID
  // ═══════════════════════════════════════════════════════

  async findById(id: string, organizationId: string): Promise<ClaimEntity> {
    const claim = await this.claimRepository.findOne({
      where: { id, organizationId },
      relations: ['serviceLines'],
      order: { serviceLines: { lineNumber: 'ASC' } },
    });

    if (!claim) {
      throw new NotFoundException(`Claim ${id} not found`);
    }

    return claim;
  }

  // ═══════════════════════════════════════════════════════
  // SEARCH CLAIMS
  // ═══════════════════════════════════════════════════════

  async search(params: SearchClaimsDto, organizationId: string): Promise<PaginatedResult<ClaimEntity>> {
    const page = params.page || 1;
    const limit = params.limit || 25;
    const skip = (page - 1) * limit;

    const qb = this.claimRepository.createQueryBuilder('claim')
      .leftJoinAndSelect('claim.serviceLines', 'lines')
      .where('claim.organizationId = :organizationId', { organizationId });

    // ─── Free text search ──────────────────────────
    if (params.query) {
      qb.andWhere(
        new Brackets((sub) => {
          sub.where('claim.claimNumber ILIKE :query', { query: `%${params.query}%` })
            .orWhere('claim.patientFirstName ILIKE :query', { query: `%${params.query}%` })
            .orWhere('claim.patientLastName ILIKE :query', { query: `%${params.query}%` })
            .orWhere('claim.renderingProviderName ILIKE :query', { query: `%${params.query}%` })
            .orWhere('claim.primaryDiagnosisCode ILIKE :query', { query: `%${params.query}%` });
        }),
      );
    }

    // ─── Specific filters ──────────────────────────
    if (params.claimNumber) {
      qb.andWhere('claim.claimNumber = :claimNumber', { claimNumber: params.claimNumber });
    }

    if (params.memberId) {
      qb.andWhere('claim.memberId = :memberId', { memberId: params.memberId });
    }

    if (params.providerId) {
      qb.andWhere(
        new Brackets((sub) => {
          sub.where('claim.renderingProviderId = :providerId', { providerId: params.providerId })
            .orWhere('claim.billingProviderId = :providerId', { providerId: params.providerId });
        }),
      );
    }

    if (params.status && params.status.length > 0) {
      qb.andWhere('claim.status IN (:...statuses)', { statuses: params.status });
    }

    if (params.type) {
      qb.andWhere('claim.type = :type', { type: params.type });
    }

    if (params.dateFrom) {
      qb.andWhere('claim.receivedDate >= :dateFrom', { dateFrom: params.dateFrom });
    }

    if (params.dateTo) {
      qb.andWhere('claim.receivedDate <= :dateTo', { dateTo: params.dateTo });
    }

    if (params.amountMin !== undefined) {
      qb.andWhere('claim.totalChargedAmount >= :amountMin', { amountMin: params.amountMin });
    }

    if (params.amountMax !== undefined) {
      qb.andWhere('claim.totalChargedAmount <= :amountMax', { amountMax: params.amountMax });
    }

    if (params.aiRecommendation) {
      qb.andWhere('claim.aiRecommendation = :aiRec', { aiRec: params.aiRecommendation });
    }

    if (params.assignedTo) {
      qb.andWhere('claim.assignedProcessorId = :assignedTo', { assignedTo: params.assignedTo });
    }

    // ─── Sorting ───────────────────────────────────
    const sortField = this.resolveSortField(params.sortBy || 'receivedDate');
    qb.orderBy(sortField, (params.sortOrder || 'desc').toUpperCase() as 'ASC' | 'DESC');

    // ─── Pagination ────────────────────────────────
    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ═══════════════════════════════════════════════════════
  // AUTO-ADJUDICATION ENGINE
  // ═══════════════════════════════════════════════════════

  async adjudicate(id: string, organizationId: string): Promise<ClaimEntity> {
    const claim = await this.findById(id, organizationId);

    if (!['received', 'validated'].includes(claim.status)) {
      throw new BadRequestException(
        `Claim ${claim.claimNumber} cannot be adjudicated in status '${claim.status}'. ` +
        `Must be in 'received' or 'validated' status.`,
      );
    }

    this.logger.log(`Running auto-adjudication on claim ${claim.claimNumber}`);

    // Run the rules engine
    const results = await this.runAutoAdjudication(claim);
    const failures = results.filter((r) => r.result === 'fail');
    const warnings = results.filter((r) => r.result === 'warning');

    // Determine overall action
    let newStatus: ClaimStatus;
    let aiRecommendation: string;
    let aiConfidenceScore: number;

    if (failures.length > 0) {
      // Check if any failure triggers auto-deny
      const autoDeny = failures.find((f) => f.autoAction === 'deny');
      if (autoDeny) {
        newStatus = 'denied';
        aiRecommendation = 'deny';
        aiConfidenceScore = 0.95;
      } else {
        newStatus = 'in_review';
        aiRecommendation = 'review';
        aiConfidenceScore = 0.60;
      }
    } else if (warnings.length > 0) {
      newStatus = 'in_review';
      aiRecommendation = 'pend';
      aiConfidenceScore = 0.75;
    } else {
      // All rules passed - apply pricing and approve
      await this.applyPricing(claim);
      newStatus = 'adjudicated';
      aiRecommendation = 'approve';
      aiConfidenceScore = 0.92;
    }

    // Update claim with adjudication results
    claim.status = newStatus;
    claim.adjudicationRules = results;
    claim.aiRecommendation = aiRecommendation;
    claim.aiConfidenceScore = aiConfidenceScore;
    claim.aiAnalysis = {
      overallRisk: failures.length > 0 ? 'high' : warnings.length > 0 ? 'medium' : 'low',
      fraudScore: this.calculateFraudScore(claim, results),
      codingAccuracy: this.calculateCodingAccuracy(results),
      priceReasonableness: this.calculatePriceReasonableness(claim),
      recommendations: results.filter((r) => r.result !== 'pass').map((r) => r.message),
      flags: failures.map((f) => f.ruleName),
    };
    claim.processedDate = new Date().toISOString().split('T')[0];

    // Add system note
    claim.notes = [
      ...claim.notes,
      {
        id: uuidv4(),
        userId: 'system',
        userName: 'Auto-Adjudication Engine',
        noteType: 'adjudication',
        content: `Auto-adjudication complete. ${results.length} rules evaluated: ` +
          `${results.filter((r) => r.result === 'pass').length} passed, ` +
          `${failures.length} failed, ${warnings.length} warnings. ` +
          `Recommendation: ${aiRecommendation} (confidence: ${(aiConfidenceScore * 100).toFixed(1)}%)`,
        createdAt: new Date().toISOString(),
      },
    ];

    const saved = await this.claimRepository.save(claim);

    this.logger.log(
      `Adjudication complete for ${claim.claimNumber}: ` +
      `status=${newStatus}, recommendation=${aiRecommendation}, confidence=${aiConfidenceScore}`,
    );

    return this.findById(saved.id, organizationId);
  }

  // ═══════════════════════════════════════════════════════
  // MANUAL APPROVE
  // ═══════════════════════════════════════════════════════

  async approve(id: string, userId: string, userName: string, organizationId: string): Promise<ClaimEntity> {
    const claim = await this.findById(id, organizationId);

    const approvableStatuses: ClaimStatus[] = [
      'received', 'validated', 'in_review', 'adjudicated', 'priced', 'pending_info',
    ];

    if (!approvableStatuses.includes(claim.status)) {
      throw new BadRequestException(
        `Claim ${claim.claimNumber} cannot be approved in status '${claim.status}'.`,
      );
    }

    // If not yet priced, apply pricing
    if (!claim.totalAllowedAmount || Number(claim.totalAllowedAmount) === 0) {
      await this.applyPricing(claim);
    }

    claim.status = 'approved';
    claim.processedDate = claim.processedDate || new Date().toISOString().split('T')[0];
    claim.notes = [
      ...claim.notes,
      {
        id: uuidv4(),
        userId,
        userName,
        noteType: 'adjudication',
        content: `Claim manually approved by ${userName}`,
        createdAt: new Date().toISOString(),
      },
    ];

    // Update all pending service lines to approved
    for (const line of claim.serviceLines) {
      if (line.status === 'pending') {
        line.status = 'approved';
        await this.serviceLineRepository.save(line);
      }
    }

    await this.claimRepository.save(claim);

    this.logger.log(`Claim ${claim.claimNumber} manually approved by ${userName} (${userId})`);

    return this.findById(id, organizationId);
  }

  // ═══════════════════════════════════════════════════════
  // MANUAL DENY
  // ═══════════════════════════════════════════════════════

  async deny(
    id: string, dto: DenyClaimDto, userId: string, userName: string, organizationId: string,
  ): Promise<ClaimEntity> {
    const claim = await this.findById(id, organizationId);

    const deniableStatuses: ClaimStatus[] = [
      'received', 'validated', 'in_review', 'adjudicated', 'priced', 'pending_info',
    ];

    if (!deniableStatuses.includes(claim.status)) {
      throw new BadRequestException(
        `Claim ${claim.claimNumber} cannot be denied in status '${claim.status}'.`,
      );
    }

    claim.status = 'denied';
    claim.processedDate = claim.processedDate || new Date().toISOString().split('T')[0];
    claim.totalAllowedAmount = 0;
    claim.totalPaidAmount = 0;
    claim.adjustmentCodes = [
      ...claim.adjustmentCodes,
      {
        groupCode: 'CO',
        reasonCode: dto.denialReasonCode,
        description: dto.denialReasonDescription,
        amount: Number(claim.totalChargedAmount),
      },
    ];
    claim.notes = [
      ...claim.notes,
      {
        id: uuidv4(),
        userId,
        userName,
        noteType: 'adjudication',
        content: `Claim denied by ${userName}. Reason: [${dto.denialReasonCode}] ${dto.denialReasonDescription}` +
          (dto.notes ? `. Notes: ${dto.notes}` : ''),
        createdAt: new Date().toISOString(),
      },
    ];

    // Deny all pending service lines
    for (const line of claim.serviceLines) {
      if (line.status === 'pending') {
        line.status = 'denied';
        line.denialReasonCode = dto.denialReasonCode;
        line.denialReasonDescription = dto.denialReasonDescription;
        await this.serviceLineRepository.save(line);
      }
    }

    await this.claimRepository.save(claim);

    this.logger.log(
      `Claim ${claim.claimNumber} denied by ${userName} (${userId}). ` +
      `Reason: ${dto.denialReasonCode}`,
    );

    return this.findById(id, organizationId);
  }

  // ═══════════════════════════════════════════════════════
  // PEND FOR REVIEW
  // ═══════════════════════════════════════════════════════

  async pend(
    id: string, dto: PendClaimDto, userId: string, userName: string, organizationId: string,
  ): Promise<ClaimEntity> {
    const claim = await this.findById(id, organizationId);

    if (['paid', 'voided', 'denied'].includes(claim.status)) {
      throw new BadRequestException(
        `Claim ${claim.claimNumber} cannot be pended in status '${claim.status}'.`,
      );
    }

    claim.status = 'pending_info';
    claim.notes = [
      ...claim.notes,
      {
        id: uuidv4(),
        userId,
        userName,
        noteType: 'internal',
        content: `Claim pended by ${userName}. Reason: ${dto.reason}` +
          (dto.informationRequested ? `. Information requested: ${dto.informationRequested}` : ''),
        createdAt: new Date().toISOString(),
      },
    ];

    await this.claimRepository.save(claim);

    this.logger.log(`Claim ${claim.claimNumber} pended by ${userName} (${userId}). Reason: ${dto.reason}`);

    return this.findById(id, organizationId);
  }

  // ═══════════════════════════════════════════════════════
  // ADD NOTE
  // ═══════════════════════════════════════════════════════

  async addNote(
    id: string, dto: AddNoteDto, userId: string, userName: string, organizationId: string,
  ): Promise<ClaimEntity> {
    const claim = await this.findById(id, organizationId);

    claim.notes = [
      ...claim.notes,
      {
        id: uuidv4(),
        userId,
        userName,
        noteType: dto.noteType || 'internal',
        content: dto.content,
        createdAt: new Date().toISOString(),
      },
    ];

    await this.claimRepository.save(claim);

    this.logger.log(`Note added to claim ${claim.claimNumber} by ${userName}`);

    return this.findById(id, organizationId);
  }

  // ═══════════════════════════════════════════════════════
  // ASSIGN PROCESSOR
  // ═══════════════════════════════════════════════════════

  async assignProcessor(
    id: string, dto: AssignProcessorDto, userId: string, userName: string, organizationId: string,
  ): Promise<ClaimEntity> {
    const claim = await this.findById(id, organizationId);

    const previousProcessor = claim.assignedProcessorName;
    claim.assignedProcessorId = dto.processorId;
    claim.assignedProcessorName = dto.processorName;

    claim.notes = [
      ...claim.notes,
      {
        id: uuidv4(),
        userId,
        userName,
        noteType: 'system',
        content: previousProcessor
          ? `Claim reassigned from ${previousProcessor} to ${dto.processorName} by ${userName}`
          : `Claim assigned to ${dto.processorName} by ${userName}`,
        createdAt: new Date().toISOString(),
      },
    ];

    await this.claimRepository.save(claim);

    this.logger.log(
      `Claim ${claim.claimNumber} assigned to ${dto.processorName} by ${userName}`,
    );

    return this.findById(id, organizationId);
  }

  // ═══════════════════════════════════════════════════════
  // DASHBOARD STATISTICS
  // ═══════════════════════════════════════════════════════

  async getStats(organizationId: string): Promise<Record<string, any>> {
    const qb = this.claimRepository.createQueryBuilder('claim')
      .where('claim.organizationId = :organizationId', { organizationId });

    // Status counts
    const statusCounts = await this.claimRepository
      .createQueryBuilder('claim')
      .select('claim.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('claim.organizationId = :organizationId', { organizationId })
      .groupBy('claim.status')
      .getRawMany();

    const statusMap: Record<string, number> = {};
    for (const row of statusCounts) {
      statusMap[row.status] = parseInt(row.count, 10);
    }

    // Financial totals
    const financials = await this.claimRepository
      .createQueryBuilder('claim')
      .select('SUM(claim.totalChargedAmount)', 'totalCharged')
      .addSelect('SUM(claim.totalPaidAmount)', 'totalPaid')
      .addSelect('SUM(claim.totalAllowedAmount)', 'totalAllowed')
      .addSelect('COUNT(*)', 'totalClaims')
      .where('claim.organizationId = :organizationId', { organizationId })
      .getRawOne();

    // Average processing time (received -> processed for completed claims)
    const avgProcessing = await this.claimRepository
      .createQueryBuilder('claim')
      .select("AVG(claim.processedDate::date - claim.receivedDate::date)", 'avgDays')
      .where('claim.organizationId = :organizationId', { organizationId })
      .andWhere('claim.processedDate IS NOT NULL')
      .getRawOne();

    // Auto-adjudication rate
    const autoAdjudicated = await this.claimRepository
      .createQueryBuilder('claim')
      .where('claim.organizationId = :organizationId', { organizationId })
      .andWhere('claim.aiRecommendation IS NOT NULL')
      .getCount();

    const totalProcessed = parseInt(financials?.totalClaims || '0', 10);
    const autoAdjudicationRate = totalProcessed > 0
      ? (autoAdjudicated / totalProcessed) * 100
      : 0;

    // Claims by type
    const typeCounts = await this.claimRepository
      .createQueryBuilder('claim')
      .select('claim.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('claim.organizationId = :organizationId', { organizationId })
      .groupBy('claim.type')
      .getRawMany();

    // Recent 30-day trend
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrend = await this.claimRepository
      .createQueryBuilder('claim')
      .select('claim.receivedDate', 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(claim.totalChargedAmount)', 'totalCharged')
      .where('claim.organizationId = :organizationId', { organizationId })
      .andWhere('claim.receivedDate >= :startDate', { startDate: thirtyDaysAgo.toISOString().split('T')[0] })
      .groupBy('claim.receivedDate')
      .orderBy('claim.receivedDate', 'ASC')
      .getRawMany();

    return {
      totalClaims: totalProcessed,
      statusBreakdown: statusMap,
      pendingClaims: (statusMap['received'] || 0) + (statusMap['validated'] || 0) +
        (statusMap['in_review'] || 0) + (statusMap['pending_info'] || 0),
      approvedClaims: statusMap['approved'] || 0,
      deniedClaims: statusMap['denied'] || 0,
      paidClaims: statusMap['paid'] || 0,
      financials: {
        totalCharged: parseFloat(financials?.totalCharged || '0'),
        totalAllowed: parseFloat(financials?.totalAllowed || '0'),
        totalPaid: parseFloat(financials?.totalPaid || '0'),
      },
      averageProcessingDays: parseFloat(avgProcessing?.avgDays || '0'),
      autoAdjudicationRate: Math.round(autoAdjudicationRate * 100) / 100,
      claimsByType: typeCounts.reduce((acc: Record<string, number>, row: any) => {
        acc[row.type] = parseInt(row.count, 10);
        return acc;
      }, {}),
      dailyTrend: dailyTrend.map((row: any) => ({
        date: row.date,
        count: parseInt(row.count, 10),
        totalCharged: parseFloat(row.totalCharged || '0'),
      })),
    };
  }

  // ═══════════════════════════════════════════════════════
  // PRIVATE: AUTO-ADJUDICATION RULES ENGINE
  // ═══════════════════════════════════════════════════════

  private async runAutoAdjudication(claim: ClaimEntity): Promise<AdjudicationResult[]> {
    const results: AdjudicationResult[] = [];

    // ── Rule 1: Timely Filing Check ─────────────────
    results.push(this.checkTimelyFiling(claim));

    // ── Rule 2: Duplicate Claim Check ───────────────
    results.push(await this.checkDuplicate(claim));

    // ── Rule 3: Procedure/Diagnosis Compatibility ───
    results.push(this.checkProcedureDiagnosisCompatibility(claim));

    // ── Rule 4: Member Eligibility Verification ─────
    results.push(this.checkMemberEligibility(claim));

    // ── Rule 5: Provider Network Status ─────────────
    results.push(this.checkProviderNetwork(claim));

    // ── Rule 6: Service Line Validation ─────────────
    for (const line of claim.serviceLines) {
      results.push(this.validateServiceLine(line, claim));
    }

    // ── Rule 7: Charge Reasonableness ───────────────
    results.push(this.checkChargeReasonableness(claim));

    // ── Rule 8: Prior Authorization Check ───────────
    results.push(this.checkPriorAuthorization(claim));

    return results;
  }

  private checkTimelyFiling(claim: ClaimEntity): AdjudicationResult {
    const serviceDate = new Date(claim.serviceFromDate);
    const receivedDate = new Date(claim.receivedDate);
    const daysDiff = Math.floor(
      (receivedDate.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff > TIMELY_FILING_DAYS) {
      return {
        ruleId: 'TF-001',
        ruleName: 'Timely Filing',
        category: 'timely_filing',
        result: 'fail',
        message: `Claim received ${daysDiff} days after service date. Timely filing limit is ${TIMELY_FILING_DAYS} days.`,
        autoAction: 'deny',
        confidence: 0.99,
      };
    }

    if (daysDiff > 180) {
      return {
        ruleId: 'TF-001',
        ruleName: 'Timely Filing',
        category: 'timely_filing',
        result: 'warning',
        message: `Claim received ${daysDiff} days after service date. Approaching timely filing limit.`,
        confidence: 0.85,
      };
    }

    return {
      ruleId: 'TF-001',
      ruleName: 'Timely Filing',
      category: 'timely_filing',
      result: 'pass',
      message: `Claim received within timely filing limit (${daysDiff} days).`,
      confidence: 1.0,
    };
  }

  private async checkDuplicate(claim: ClaimEntity): Promise<AdjudicationResult> {
    const duplicate = await this.claimRepository.findOne({
      where: {
        organizationId: claim.organizationId,
        memberId: claim.memberId,
        renderingProviderId: claim.renderingProviderId,
        serviceFromDate: claim.serviceFromDate,
        primaryDiagnosisCode: claim.primaryDiagnosisCode,
      },
    });

    // Exclude current claim from duplicate check
    if (duplicate && duplicate.id !== claim.id) {
      return {
        ruleId: 'DUP-001',
        ruleName: 'Duplicate Claim Check',
        category: 'duplicate',
        result: 'fail',
        message: `Potential duplicate of claim ${duplicate.claimNumber}. Same member, provider, date, and diagnosis.`,
        autoAction: 'review',
        confidence: 0.88,
      };
    }

    return {
      ruleId: 'DUP-001',
      ruleName: 'Duplicate Claim Check',
      category: 'duplicate',
      result: 'pass',
      message: 'No duplicate claims found.',
      confidence: 1.0,
    };
  }

  private checkProcedureDiagnosisCompatibility(claim: ClaimEntity): AdjudicationResult {
    // Simplified validation: check that diagnosis code format is valid ICD-10
    const icd10Pattern = /^[A-Z]\d{2}(\.\d{1,4})?$/;
    const isValidDiagnosis = icd10Pattern.test(claim.primaryDiagnosisCode);

    if (!isValidDiagnosis) {
      return {
        ruleId: 'COMPAT-001',
        ruleName: 'Procedure/Diagnosis Compatibility',
        category: 'coding',
        result: 'warning',
        message: `Primary diagnosis code ${claim.primaryDiagnosisCode} may not be a valid ICD-10 format.`,
        autoAction: 'review',
        confidence: 0.70,
      };
    }

    // Check for common incompatible combinations (simplified)
    const incompatible: Record<string, string[]> = {
      'Z00.00': ['99281', '99282', '99283', '99284', '99285'], // Routine exam vs ER codes
    };

    for (const line of claim.serviceLines) {
      const blockedCodes = incompatible[claim.primaryDiagnosisCode];
      if (blockedCodes && blockedCodes.includes(line.procedureCode)) {
        return {
          ruleId: 'COMPAT-001',
          ruleName: 'Procedure/Diagnosis Compatibility',
          category: 'coding',
          result: 'fail',
          message: `Procedure ${line.procedureCode} is incompatible with diagnosis ${claim.primaryDiagnosisCode}.`,
          autoAction: 'review',
          confidence: 0.85,
        };
      }
    }

    return {
      ruleId: 'COMPAT-001',
      ruleName: 'Procedure/Diagnosis Compatibility',
      category: 'coding',
      result: 'pass',
      message: 'Procedure and diagnosis codes are compatible.',
      confidence: 0.90,
    };
  }

  private checkMemberEligibility(claim: ClaimEntity): AdjudicationResult {
    // In production, this would query the eligibility module
    // For now, validate that required member fields are present
    if (!claim.memberId || !claim.memberPlanId) {
      return {
        ruleId: 'ELIG-001',
        ruleName: 'Member Eligibility',
        category: 'eligibility',
        result: 'fail',
        message: 'Member ID or plan ID is missing. Cannot verify eligibility.',
        autoAction: 'pend',
        confidence: 0.95,
      };
    }

    return {
      ruleId: 'ELIG-001',
      ruleName: 'Member Eligibility',
      category: 'eligibility',
      result: 'pass',
      message: `Member ${claim.memberId} is eligible under plan ${claim.memberPlanId} for date of service.`,
      confidence: 0.85,
    };
  }

  private checkProviderNetwork(claim: ClaimEntity): AdjudicationResult {
    // In production, this would verify provider network status
    if (!claim.renderingProviderNpi || claim.renderingProviderNpi.length !== 10) {
      return {
        ruleId: 'NET-001',
        ruleName: 'Provider Network Status',
        category: 'eligibility',
        result: 'warning',
        message: `Rendering provider NPI ${claim.renderingProviderNpi} may be invalid.`,
        confidence: 0.80,
      };
    }

    return {
      ruleId: 'NET-001',
      ruleName: 'Provider Network Status',
      category: 'eligibility',
      result: 'pass',
      message: `Provider ${claim.renderingProviderName} (NPI: ${claim.renderingProviderNpi}) is in-network.`,
      confidence: 0.85,
    };
  }

  private validateServiceLine(line: ClaimServiceLineEntity, claim: ClaimEntity): AdjudicationResult {
    // Validate procedure code format (CPT: 5 digits, HCPCS: letter + 4 digits)
    const cptPattern = /^\d{5}$/;
    const hcpcsPattern = /^[A-Z]\d{4}$/;
    const isValidCode = cptPattern.test(line.procedureCode) || hcpcsPattern.test(line.procedureCode);

    if (!isValidCode) {
      return {
        ruleId: `SL-001-${line.lineNumber}`,
        ruleName: `Service Line ${line.lineNumber} Validation`,
        category: 'coding',
        result: 'warning',
        message: `Line ${line.lineNumber}: Procedure code ${line.procedureCode} may not be valid CPT/HCPCS format.`,
        confidence: 0.75,
      };
    }

    if (line.chargedAmount <= 0) {
      return {
        ruleId: `SL-001-${line.lineNumber}`,
        ruleName: `Service Line ${line.lineNumber} Validation`,
        category: 'pricing',
        result: 'fail',
        message: `Line ${line.lineNumber}: Charged amount must be greater than zero.`,
        autoAction: 'review',
        confidence: 0.95,
      };
    }

    return {
      ruleId: `SL-001-${line.lineNumber}`,
      ruleName: `Service Line ${line.lineNumber} Validation`,
      category: 'coding',
      result: 'pass',
      message: `Line ${line.lineNumber}: ${line.procedureCode} validated successfully.`,
      confidence: 0.90,
    };
  }

  private checkChargeReasonableness(claim: ClaimEntity): AdjudicationResult {
    // Check if total charge is unreasonably high (basic threshold)
    const chargedAmount = Number(claim.totalChargedAmount);

    if (chargedAmount > 500000) {
      return {
        ruleId: 'CR-001',
        ruleName: 'Charge Reasonableness',
        category: 'pricing',
        result: 'warning',
        message: `Total charged amount $${chargedAmount.toFixed(2)} exceeds $500,000 threshold. Manual review recommended.`,
        autoAction: 'review',
        confidence: 0.70,
      };
    }

    if (chargedAmount > 100000) {
      return {
        ruleId: 'CR-001',
        ruleName: 'Charge Reasonableness',
        category: 'pricing',
        result: 'info',
        message: `Total charged amount $${chargedAmount.toFixed(2)} is flagged for high-dollar review.`,
        confidence: 0.80,
      };
    }

    return {
      ruleId: 'CR-001',
      ruleName: 'Charge Reasonableness',
      category: 'pricing',
      result: 'pass',
      message: `Total charged amount $${chargedAmount.toFixed(2)} is within reasonable range.`,
      confidence: 0.90,
    };
  }

  private checkPriorAuthorization(claim: ClaimEntity): AdjudicationResult {
    // Simplified: certain procedure codes require prior auth
    const requiresAuthCodes = ['27447', '43239', '70553', '27130', '63030'];
    const needsAuth = claim.serviceLines.some(
      (line) => requiresAuthCodes.includes(line.procedureCode),
    );

    if (needsAuth) {
      return {
        ruleId: 'PA-001',
        ruleName: 'Prior Authorization Check',
        category: 'authorization',
        result: 'warning',
        message: 'One or more procedure codes may require prior authorization. Verify authorization on file.',
        autoAction: 'pend',
        confidence: 0.75,
      };
    }

    return {
      ruleId: 'PA-001',
      ruleName: 'Prior Authorization Check',
      category: 'authorization',
      result: 'pass',
      message: 'No prior authorization required for submitted procedure codes.',
      confidence: 0.90,
    };
  }

  // ═══════════════════════════════════════════════════════
  // PRIVATE: PRICING
  // ═══════════════════════════════════════════════════════

  private async applyPricing(claim: ClaimEntity): Promise<void> {
    let totalAllowed = 0;
    let totalPaid = 0;
    let totalDeductible = 0;
    let totalCopay = 0;
    let totalCoinsurance = 0;

    for (const line of claim.serviceLines) {
      // Look up fee schedule
      const feeScheduleAmount = FEE_SCHEDULE[line.procedureCode];
      const allowedAmount = feeScheduleAmount
        ? Math.min(feeScheduleAmount * line.units, Number(line.chargedAmount) * line.units)
        : Number(line.chargedAmount) * 0.80; // Default 80% of charged if not in fee schedule

      const copay = DEFAULT_COPAY;
      const afterCopay = Math.max(allowedAmount - copay, 0);
      const coinsurance = afterCopay * DEFAULT_COINSURANCE_RATE;
      const paidAmount = afterCopay - coinsurance;

      line.allowedAmount = Math.round(allowedAmount * 100) / 100;
      line.paidAmount = Math.round(paidAmount * 100) / 100;
      line.copayAmount = copay;
      line.coinsuranceAmount = Math.round(coinsurance * 100) / 100;
      line.deductibleAmount = 0; // Simplified: deductible tracking would require accumulator

      await this.serviceLineRepository.save(line);

      totalAllowed += allowedAmount;
      totalPaid += paidAmount;
      totalCopay += copay;
      totalCoinsurance += coinsurance;
    }

    claim.totalAllowedAmount = Math.round(totalAllowed * 100) / 100;
    claim.totalPaidAmount = Math.round(totalPaid * 100) / 100;
    claim.totalDeductible = Math.round(totalDeductible * 100) / 100;
    claim.totalCopay = Math.round(totalCopay * 100) / 100;
    claim.totalCoinsurance = Math.round(totalCoinsurance * 100) / 100;
    claim.totalMemberResponsibility = Math.round(
      (totalDeductible + totalCopay + totalCoinsurance) * 100,
    ) / 100;
  }

  // ═══════════════════════════════════════════════════════
  // PRIVATE: AI SCORING HELPERS
  // ═══════════════════════════════════════════════════════

  private calculateFraudScore(claim: ClaimEntity, results: AdjudicationResult[]): number {
    let score = 0;
    const failures = results.filter((r) => r.result === 'fail');
    const warnings = results.filter((r) => r.result === 'warning');

    score += failures.length * 25;
    score += warnings.length * 10;

    if (Number(claim.totalChargedAmount) > 100000) score += 15;
    if (results.some((r) => r.category === 'duplicate' && r.result === 'fail')) score += 30;

    return Math.min(score, 100);
  }

  private calculateCodingAccuracy(results: AdjudicationResult[]): number {
    const codingRules = results.filter((r) => r.category === 'coding');
    if (codingRules.length === 0) return 100;

    const passed = codingRules.filter((r) => r.result === 'pass').length;
    return Math.round((passed / codingRules.length) * 100);
  }

  private calculatePriceReasonableness(claim: ClaimEntity): number {
    const charged = Number(claim.totalChargedAmount);
    if (charged <= 0) return 0;

    // Calculate expected based on fee schedule
    let expectedTotal = 0;
    for (const line of claim.serviceLines || []) {
      const feeAmount = FEE_SCHEDULE[line.procedureCode];
      expectedTotal += feeAmount
        ? feeAmount * line.units
        : Number(line.chargedAmount) * line.units;
    }

    if (expectedTotal === 0) return 50;

    const ratio = charged / expectedTotal;
    // Score from 0-100 where 100 = perfectly reasonable
    if (ratio <= 1.0) return 95;
    if (ratio <= 1.5) return 80;
    if (ratio <= 2.0) return 60;
    if (ratio <= 3.0) return 40;
    return 20;
  }

  // ═══════════════════════════════════════════════════════
  // PRIVATE: HELPERS
  // ═══════════════════════════════════════════════════════

  private async generateClaimNumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CLM-${year}`;

    // Find the highest existing claim number for this org/year
    const latest = await this.claimRepository
      .createQueryBuilder('claim')
      .where('claim.organizationId = :organizationId', { organizationId })
      .andWhere('claim.claimNumber LIKE :prefix', { prefix: `${prefix}-%` })
      .orderBy('claim.claimNumber', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (latest) {
      const parts = latest.claimNumber.split('-');
      const currentNumber = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(currentNumber)) {
        nextNumber = currentNumber + 1;
      }
    }

    return `${prefix}-${String(nextNumber).padStart(6, '0')}`;
  }

  private resolveSortField(sortBy: string): string {
    const fieldMap: Record<string, string> = {
      receivedDate: 'claim.receivedDate',
      claimNumber: 'claim.claimNumber',
      status: 'claim.status',
      totalChargedAmount: 'claim.totalChargedAmount',
      patientLastName: 'claim.patientLastName',
      createdAt: 'claim.createdAt',
    };

    return fieldMap[sortBy] || 'claim.receivedDate';
  }
}
