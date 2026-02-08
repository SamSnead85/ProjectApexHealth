import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index, OneToMany,
} from 'typeorm';
import { ClaimServiceLineEntity } from './claim-service-line.entity';

export type ClaimType = 'professional' | 'institutional' | 'dental' | 'pharmacy' | 'vision';

export type ClaimStatus =
  | 'received'
  | 'validated'
  | 'pending_info'
  | 'in_review'
  | 'priced'
  | 'adjudicated'
  | 'approved'
  | 'denied'
  | 'partially_approved'
  | 'appealed'
  | 'paid'
  | 'voided'
  | 'suspended';

export type ClaimSource = 'edi_837' | 'portal' | 'fhir' | 'paper' | 'api';

@Entity({ schema: 'claims', name: 'claims' })
@Index(['organizationId', 'claimNumber'], { unique: true })
@Index(['organizationId', 'status'])
@Index(['organizationId', 'receivedDate'])
@Index(['memberId'])
@Index(['renderingProviderNpi'])
export class ClaimEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ name: 'claim_number', type: 'varchar', length: 50 })
  @Index()
  claimNumber: string;

  @Column({ type: 'varchar', length: 20 })
  type: ClaimType;

  @Column({ type: 'varchar', length: 30, default: 'received' })
  @Index()
  status: ClaimStatus;

  @Column({ type: 'varchar', length: 20, default: 'api' })
  source: ClaimSource;

  // ─── Subscriber / Patient ───────────────────────────
  @Column({ name: 'member_id', type: 'uuid' })
  memberId: string;

  @Column({ name: 'subscriber_id', type: 'varchar', length: 50 })
  subscriberId: string;

  @Column({ name: 'patient_first_name', type: 'varchar', length: 100 })
  patientFirstName: string;

  @Column({ name: 'patient_last_name', type: 'varchar', length: 100 })
  patientLastName: string;

  @Column({ name: 'patient_dob', type: 'date' })
  patientDob: string;

  @Column({ name: 'patient_gender', type: 'varchar', length: 10 })
  patientGender: string;

  @Column({ name: 'member_plan_id', type: 'varchar', length: 50 })
  memberPlanId: string;

  // ─── Rendering Provider ─────────────────────────────
  @Column({ name: 'rendering_provider_id', type: 'uuid' })
  renderingProviderId: string;

  @Column({ name: 'rendering_provider_npi', type: 'varchar', length: 10 })
  renderingProviderNpi: string;

  @Column({ name: 'rendering_provider_name', type: 'varchar', length: 200 })
  renderingProviderName: string;

  // ─── Billing Provider ───────────────────────────────
  @Column({ name: 'billing_provider_id', type: 'uuid', nullable: true })
  billingProviderId?: string;

  @Column({ name: 'billing_provider_npi', type: 'varchar', length: 10, nullable: true })
  billingProviderNpi?: string;

  @Column({ name: 'billing_provider_name', type: 'varchar', length: 200, nullable: true })
  billingProviderName?: string;

  // ─── Facility ───────────────────────────────────────
  @Column({ name: 'facility_id', type: 'uuid', nullable: true })
  facilityId?: string;

  @Column({ name: 'facility_name', type: 'varchar', length: 200, nullable: true })
  facilityName?: string;

  @Column({ name: 'place_of_service_code', type: 'varchar', length: 5 })
  placeOfServiceCode: string;

  // ─── Dates ──────────────────────────────────────────
  @Column({ name: 'service_from_date', type: 'date' })
  serviceFromDate: string;

  @Column({ name: 'service_to_date', type: 'date' })
  serviceToDate: string;

  @Column({ name: 'received_date', type: 'date' })
  @Index()
  receivedDate: string;

  @Column({ name: 'processed_date', type: 'date', nullable: true })
  processedDate?: string;

  @Column({ name: 'paid_date', type: 'date', nullable: true })
  paidDate?: string;

  // ─── Diagnosis ──────────────────────────────────────
  @Column({ name: 'primary_diagnosis_code', type: 'varchar', length: 20 })
  primaryDiagnosisCode: string;

  @Column({ name: 'primary_diagnosis_description', type: 'varchar', length: 500 })
  primaryDiagnosisDescription: string;

  @Column({ name: 'additional_diagnosis_codes', type: 'jsonb', default: '[]' })
  additionalDiagnosisCodes: Array<{ code: string; description: string; type: string; qualifier: string }>;

  // ─── Financial (all decimal 12,2) ───────────────────
  @Column({ name: 'total_charged_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalChargedAmount: number;

  @Column({ name: 'total_allowed_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAllowedAmount: number;

  @Column({ name: 'total_paid_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPaidAmount: number;

  @Column({ name: 'total_member_responsibility', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalMemberResponsibility: number;

  @Column({ name: 'total_deductible', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDeductible: number;

  @Column({ name: 'total_copay', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCopay: number;

  @Column({ name: 'total_coinsurance', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCoinsurance: number;

  // ─── Processing / AI ────────────────────────────────
  @Column({ name: 'adjudication_rules', type: 'jsonb', nullable: true })
  adjudicationRules?: Array<Record<string, any>>;

  @Column({ name: 'ai_confidence_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
  aiConfidenceScore?: number;

  @Column({ name: 'ai_recommendation', type: 'varchar', length: 30, nullable: true })
  aiRecommendation?: string;

  @Column({ name: 'ai_analysis', type: 'jsonb', nullable: true })
  aiAnalysis?: Record<string, any>;

  // ─── Assignment ─────────────────────────────────────
  @Column({ name: 'assigned_processor_id', type: 'uuid', nullable: true })
  assignedProcessorId?: string;

  @Column({ name: 'assigned_processor_name', type: 'varchar', length: 200, nullable: true })
  assignedProcessorName?: string;

  // ─── Audit / Reference ──────────────────────────────
  @Column({ type: 'jsonb', default: '[]' })
  notes: Array<Record<string, any>>;

  @Column({ name: 'adjustment_codes', type: 'jsonb', default: '[]' })
  adjustmentCodes: Array<Record<string, any>>;

  @Column({ name: 'edi_reference_number', type: 'varchar', length: 50, nullable: true })
  ediReferenceNumber?: string;

  @Column({ name: 'check_number', type: 'varchar', length: 50, nullable: true })
  checkNumber?: string;

  // ─── Timestamps ─────────────────────────────────────
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // ─── Relations ──────────────────────────────────────
  @OneToMany(() => ClaimServiceLineEntity, (line) => line.claim, {
    cascade: true,
    eager: false,
  })
  serviceLines: ClaimServiceLineEntity[];

  // ─── Computed ───────────────────────────────────────
  get patientFullName(): string {
    return `${this.patientFirstName} ${this.patientLastName}`;
  }
}
