import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, Index,
} from 'typeorm';
import { ClaimEntity } from './claim.entity';

export type ServiceLineStatus = 'approved' | 'denied' | 'adjusted' | 'pending';

@Entity({ schema: 'claims', name: 'claim_service_lines' })
@Index(['claimId', 'lineNumber'], { unique: true })
export class ClaimServiceLineEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'claim_id', type: 'uuid' })
  @Index()
  claimId: string;

  @Column({ name: 'line_number', type: 'integer' })
  lineNumber: number;

  @Column({ name: 'procedure_code', type: 'varchar', length: 20 })
  procedureCode: string;

  @Column({ name: 'procedure_description', type: 'varchar', length: 500 })
  procedureDescription: string;

  @Column({ type: 'text', array: true, default: '{}' })
  modifiers: string[];

  @Column({ name: 'revenue_code', type: 'varchar', length: 10, nullable: true })
  revenueCode?: string;

  @Column({ name: 'place_of_service_code', type: 'varchar', length: 5 })
  placeOfServiceCode: string;

  @Column({ name: 'service_date', type: 'date' })
  serviceDate: string;

  @Column({ type: 'integer', default: 1 })
  units: number;

  // ─── Financial (all decimal 12,2) ───────────────────
  @Column({ name: 'charged_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  chargedAmount: number;

  @Column({ name: 'allowed_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  allowedAmount: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ name: 'deductible_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  deductibleAmount: number;

  @Column({ name: 'copay_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  copayAmount: number;

  @Column({ name: 'coinsurance_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  coinsuranceAmount: number;

  // ─── Adjudication ───────────────────────────────────
  @Column({ name: 'adjustment_codes', type: 'jsonb', default: '[]' })
  adjustmentCodes: Array<Record<string, any>>;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: ServiceLineStatus;

  @Column({ name: 'denial_reason_code', type: 'varchar', length: 20, nullable: true })
  denialReasonCode?: string;

  @Column({ name: 'denial_reason_description', type: 'varchar', length: 500, nullable: true })
  denialReasonDescription?: string;

  // ─── Relations ──────────────────────────────────────
  @ManyToOne(() => ClaimEntity, (claim) => claim.serviceLines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'claim_id' })
  claim: ClaimEntity;
}
