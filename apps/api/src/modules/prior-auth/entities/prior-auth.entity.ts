import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export enum PriorAuthStatus {
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  PENDING_INFO = 'pending_info',
  APPROVED = 'approved',
  PARTIALLY_APPROVED = 'partially_approved',
  DENIED = 'denied',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum PriorAuthUrgency {
  STANDARD = 'standard',
  URGENT = 'urgent',
  RETROSPECTIVE = 'retrospective',
}

export enum PriorAuthType {
  INPATIENT = 'inpatient',
  OUTPATIENT = 'outpatient',
  PROCEDURE = 'procedure',
  MEDICATION = 'medication',
  DME = 'dme',
  IMAGING = 'imaging',
  THERAPY = 'therapy',
}

export enum SlaStatus {
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  OVERDUE = 'overdue',
}

export interface RequestedProcedure {
  code: string;
  codeSystem: string;
  description: string;
  quantity?: number;
  unitOfMeasure?: string;
  fromDate?: string;
  toDate?: string;
}

export interface AiSimilarCase {
  caseId: string;
  similarity: number;
  decision: string;
  diagnosisCode: string;
  procedureCode: string;
}

@Entity({ schema: 'claims', name: 'prior_authorizations' })
@Index(['organizationId', 'status'])
@Index(['organizationId', 'memberId'])
@Index(['organizationId', 'urgency'])
@Index(['organizationId', 'slaStatus'])
@Index(['organizationId', 'reviewerId'])
@Index(['organizationId', 'authNumber'], { unique: true })
export class PriorAuthEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ name: 'auth_number', type: 'varchar', length: 50 })
  authNumber: string;

  // ─── Status & Classification ─────────────────────
  @Column({ type: 'enum', enum: PriorAuthStatus, default: PriorAuthStatus.SUBMITTED })
  status: PriorAuthStatus;

  @Column({ type: 'enum', enum: PriorAuthUrgency, default: PriorAuthUrgency.STANDARD })
  urgency: PriorAuthUrgency;

  @Column({ type: 'enum', enum: PriorAuthType })
  type: PriorAuthType;

  // ─── Member Information ──────────────────────────
  @Column({ name: 'member_id', type: 'varchar', length: 100 })
  @Index()
  memberId: string;

  @Column({ name: 'member_name', type: 'varchar', length: 255 })
  memberName: string;

  @Column({ name: 'member_dob', type: 'date' })
  memberDob: Date;

  @Column({ name: 'plan_id', type: 'uuid', nullable: true })
  planId?: string;

  // ─── Requesting Provider ─────────────────────────
  @Column({ name: 'requesting_provider_id', type: 'varchar', length: 100, nullable: true })
  requestingProviderId?: string;

  @Column({ name: 'requesting_provider_npi', type: 'varchar', length: 20 })
  requestingProviderNpi: string;

  @Column({ name: 'requesting_provider_name', type: 'varchar', length: 255 })
  requestingProviderName: string;

  @Column({ name: 'requesting_provider_specialty', type: 'varchar', length: 100, nullable: true })
  requestingProviderSpecialty?: string;

  // ─── Servicing Provider (if different) ───────────
  @Column({ name: 'servicing_provider_id', type: 'varchar', length: 100, nullable: true })
  servicingProviderId?: string;

  @Column({ name: 'servicing_provider_npi', type: 'varchar', length: 20, nullable: true })
  servicingProviderNpi?: string;

  @Column({ name: 'servicing_provider_name', type: 'varchar', length: 255, nullable: true })
  servicingProviderName?: string;

  // ─── Facility ────────────────────────────────────
  @Column({ name: 'facility_id', type: 'varchar', length: 100, nullable: true })
  facilityId?: string;

  @Column({ name: 'facility_name', type: 'varchar', length: 255, nullable: true })
  facilityName?: string;

  // ─── Diagnosis ───────────────────────────────────
  @Column({ name: 'primary_diagnosis_code', type: 'varchar', length: 20 })
  primaryDiagnosisCode: string;

  @Column({ name: 'primary_diagnosis_description', type: 'varchar', length: 500 })
  primaryDiagnosisDescription: string;

  @Column({ name: 'additional_diagnosis_codes', type: 'jsonb', default: '[]' })
  additionalDiagnosisCodes: string[];

  // ─── Procedures ──────────────────────────────────
  @Column({ name: 'requested_procedures', type: 'jsonb', default: '[]' })
  requestedProcedures: RequestedProcedure[];

  // ─── Clinical Documentation ──────────────────────
  @Column({ name: 'clinical_notes', type: 'text', nullable: true })
  clinicalNotes?: string;

  @Column({ name: 'clinical_documents', type: 'text', array: true, nullable: true })
  clinicalDocuments?: string[];

  // ─── Review Decision ─────────────────────────────
  @Column({ name: 'reviewer_id', type: 'uuid', nullable: true })
  reviewerId?: string;

  @Column({ name: 'reviewer_name', type: 'varchar', length: 255, nullable: true })
  reviewerName?: string;

  @Column({ name: 'review_decision', type: 'varchar', length: 50, nullable: true })
  reviewDecision?: string;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes?: string;

  @Column({ name: 'review_date', type: 'timestamptz', nullable: true })
  reviewDate?: Date;

  // ─── Denial Information ──────────────────────────
  @Column({ name: 'denial_reason', type: 'text', nullable: true })
  denialReason?: string;

  @Column({ name: 'denial_reason_code', type: 'varchar', length: 50, nullable: true })
  denialReasonCode?: string;

  // ─── Approval Details ────────────────────────────
  @Column({ name: 'approved_units', type: 'integer', nullable: true })
  approvedUnits?: number;

  @Column({ name: 'approved_from_date', type: 'date', nullable: true })
  approvedFromDate?: Date;

  @Column({ name: 'approved_to_date', type: 'date', nullable: true })
  approvedToDate?: Date;

  // ─── AI Assistance ───────────────────────────────
  @Column({ name: 'ai_recommendation', type: 'varchar', length: 50, nullable: true })
  aiRecommendation?: string;

  @Column({ name: 'ai_confidence_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
  aiConfidenceScore?: number;

  @Column({ name: 'ai_clinical_rationale', type: 'text', nullable: true })
  aiClinicalRationale?: string;

  @Column({ name: 'ai_similar_cases', type: 'jsonb', nullable: true })
  aiSimilarCases?: AiSimilarCase[];

  // ─── SLA Tracking ────────────────────────────────
  @Column({ name: 'submitted_at', type: 'timestamptz', default: () => 'NOW()' })
  submittedAt: Date;

  @Column({ name: 'sla_deadline', type: 'timestamptz', nullable: true })
  slaDeadline?: Date;

  @Column({ name: 'sla_status', type: 'enum', enum: SlaStatus, default: SlaStatus.ON_TRACK })
  slaStatus: SlaStatus;

  @Column({ name: 'days_in_review', type: 'integer', default: 0 })
  daysInReview: number;

  // ─── FHIR Integration ───────────────────────────
  @Column({ name: 'fhir_claim_response_id', type: 'varchar', length: 255, nullable: true })
  fhirClaimResponseId?: string;

  // ─── Timestamps ──────────────────────────────────
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
