import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Job } from 'bull';
import { ClaimEntity } from './entities/claim.entity';
import { ClaimsService } from './claims.service';

// ─── Job Interfaces ──────────────────────────────────
interface ValidateClaimJob {
  claimId: string;
  organizationId: string;
}

interface BatchAdjudicationJob {
  claimIds: string[];
  organizationId: string;
  initiatedBy: string;
}

interface EdiImportJob {
  ediFileUrl: string;
  ediType: '837P' | '837I' | '837D';
  organizationId: string;
  initiatedBy: string;
}

interface PaymentBatchJob {
  claimIds: string[];
  organizationId: string;
  checkDate: string;
  initiatedBy: string;
}

@Processor('claims-processing')
export class ClaimsProcessor {
  private readonly logger = new Logger(ClaimsProcessor.name);

  constructor(
    @InjectRepository(ClaimEntity)
    private readonly claimRepository: Repository<ClaimEntity>,
    private readonly claimsService: ClaimsService,
  ) {}

  // ═══════════════════════════════════════════════════════
  // QUEUE LIFECYCLE HOOKS
  // ═══════════════════════════════════════════════════════

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} (${job.name}) - attempt ${job.attemptsMade + 1}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} (${job.name}) completed successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} (${job.name}) failed on attempt ${job.attemptsMade}: ${error.message}`,
      error.stack,
    );
  }

  // ═══════════════════════════════════════════════════════
  // CLAIM VALIDATION (after initial submission)
  // ═══════════════════════════════════════════════════════

  @Process('validate-claim')
  async handleValidateClaim(job: Job<ValidateClaimJob>): Promise<{ status: string; claimId: string }> {
    const { claimId, organizationId } = job.data;
    this.logger.log(`Validating claim ${claimId}`);

    try {
      const claim = await this.claimRepository.findOne({
        where: { id: claimId, organizationId },
        relations: ['serviceLines'],
      });

      if (!claim) {
        throw new Error(`Claim ${claimId} not found`);
      }

      // Basic structural validation
      const errors: string[] = [];

      if (!claim.memberId) errors.push('Missing member ID');
      if (!claim.renderingProviderNpi) errors.push('Missing rendering provider NPI');
      if (!claim.primaryDiagnosisCode) errors.push('Missing primary diagnosis code');
      if (!claim.serviceLines || claim.serviceLines.length === 0) {
        errors.push('No service lines present');
      }
      if (!claim.serviceFromDate) errors.push('Missing service from date');
      if (Number(claim.totalChargedAmount) <= 0) errors.push('Total charged amount must be > 0');

      // Validate each service line
      for (const line of claim.serviceLines || []) {
        if (!line.procedureCode) {
          errors.push(`Line ${line.lineNumber}: Missing procedure code`);
        }
        if (Number(line.chargedAmount) <= 0) {
          errors.push(`Line ${line.lineNumber}: Charged amount must be > 0`);
        }
      }

      if (errors.length > 0) {
        claim.status = 'suspended';
        claim.notes = [
          ...claim.notes,
          {
            id: `val-${Date.now()}`,
            userId: 'system',
            userName: 'Validation Engine',
            noteType: 'system',
            content: `Validation failed with ${errors.length} error(s): ${errors.join('; ')}`,
            createdAt: new Date().toISOString(),
          },
        ];
      } else {
        claim.status = 'validated';
        claim.notes = [
          ...claim.notes,
          {
            id: `val-${Date.now()}`,
            userId: 'system',
            userName: 'Validation Engine',
            noteType: 'system',
            content: 'Claim passed structural validation. Ready for adjudication.',
            createdAt: new Date().toISOString(),
          },
        ];
      }

      await this.claimRepository.save(claim);

      this.logger.log(
        `Claim ${claim.claimNumber} validation ${errors.length > 0 ? 'failed' : 'passed'} ` +
        `(${errors.length} errors)`,
      );

      return { status: claim.status, claimId };
    } catch (error) {
      this.logger.error(`Validation error for claim ${claimId}: ${error.message}`);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════
  // BATCH ADJUDICATION
  // ═══════════════════════════════════════════════════════

  @Process('batch-adjudicate')
  async handleBatchAdjudication(
    job: Job<BatchAdjudicationJob>,
  ): Promise<{ processed: number; succeeded: number; failed: number; results: any[] }> {
    const { claimIds, organizationId, initiatedBy } = job.data;
    this.logger.log(`Batch adjudication started: ${claimIds.length} claims by ${initiatedBy}`);

    const results: Array<{ claimId: string; status: string; error?: string }> = [];
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < claimIds.length; i++) {
      const claimId = claimIds[i];
      try {
        const claim = await this.claimsService.adjudicate(claimId, organizationId);
        results.push({ claimId, status: claim.status });
        succeeded++;
      } catch (error) {
        results.push({ claimId, status: 'error', error: error.message });
        failed++;
        this.logger.warn(`Batch adjudication failed for claim ${claimId}: ${error.message}`);
      }

      // Update progress
      await job.progress(Math.round(((i + 1) / claimIds.length) * 100));
    }

    this.logger.log(
      `Batch adjudication complete: ${succeeded} succeeded, ${failed} failed out of ${claimIds.length}`,
    );

    return { processed: claimIds.length, succeeded, failed, results };
  }

  // ═══════════════════════════════════════════════════════
  // EDI 837 IMPORT PROCESSING
  // ═══════════════════════════════════════════════════════

  @Process('edi-import')
  async handleEdiImport(
    job: Job<EdiImportJob>,
  ): Promise<{ imported: number; errors: number; claimNumbers: string[] }> {
    const { ediFileUrl, ediType, organizationId, initiatedBy } = job.data;
    this.logger.log(`EDI ${ediType} import started from ${ediFileUrl} by ${initiatedBy}`);

    // In a full implementation, this would:
    // 1. Download and parse the EDI 837 file
    // 2. Extract claim data from ISA/GS/ST segments
    // 3. Map EDI fields to CreateClaimDto
    // 4. Create each claim via ClaimsService.create()
    // 5. Track success/failure per claim

    const claimNumbers: string[] = [];
    let imported = 0;
    let errors = 0;

    // Placeholder: simulate EDI processing
    this.logger.log(`EDI import processing ${ediType} file...`);

    await job.progress(100);

    this.logger.log(
      `EDI import complete: ${imported} claims imported, ${errors} errors`,
    );

    return { imported, errors, claimNumbers };
  }

  // ═══════════════════════════════════════════════════════
  // PAYMENT BATCH GENERATION
  // ═══════════════════════════════════════════════════════

  @Process('payment-batch')
  async handlePaymentBatch(
    job: Job<PaymentBatchJob>,
  ): Promise<{ processed: number; totalPaid: number; checkNumbers: string[] }> {
    const { claimIds, organizationId, checkDate, initiatedBy } = job.data;
    this.logger.log(`Payment batch started: ${claimIds.length} claims, check date ${checkDate}`);

    let totalPaid = 0;
    const checkNumbers: string[] = [];
    let processed = 0;

    const claims = await this.claimRepository.find({
      where: { id: In(claimIds), organizationId, status: 'approved' as any },
    });

    for (let i = 0; i < claims.length; i++) {
      const claim = claims[i];
      try {
        // Generate check number
        const checkNumber = `CHK-${checkDate.replace(/-/g, '')}-${String(i + 1).padStart(5, '0')}`;

        claim.status = 'paid';
        claim.paidDate = checkDate;
        claim.checkNumber = checkNumber;
        claim.notes = [
          ...claim.notes,
          {
            id: `pay-${Date.now()}-${i}`,
            userId: initiatedBy,
            userName: 'Payment Processor',
            noteType: 'system',
            content: `Payment issued. Check #${checkNumber}, amount: $${Number(claim.totalPaidAmount).toFixed(2)}`,
            createdAt: new Date().toISOString(),
          },
        ];

        await this.claimRepository.save(claim);

        totalPaid += Number(claim.totalPaidAmount);
        checkNumbers.push(checkNumber);
        processed++;
      } catch (error) {
        this.logger.error(`Payment failed for claim ${claim.claimNumber}: ${error.message}`);
      }

      await job.progress(Math.round(((i + 1) / claims.length) * 100));
    }

    this.logger.log(
      `Payment batch complete: ${processed} claims paid, total: $${totalPaid.toFixed(2)}`,
    );

    return { processed, totalPaid, checkNumbers };
  }
}
