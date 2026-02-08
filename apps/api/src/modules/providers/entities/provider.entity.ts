import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export type ProviderType = 'individual' | 'organization' | 'facility';
export type ProviderStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'terminated';
export type NetworkTier = 'preferred' | 'standard' | 'basic' | 'out_of_network';
export type CredentialingStatus = 'application_received' | 'in_review' | 'committee_review' | 'approved' | 'denied' | 'expired';

export interface ProviderAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
}

export interface BoardCertification {
  board: string;
  specialty: string;
  certificationDate: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'pending';
}

export interface MalpracticeInsurance {
  carrier: string;
  policyNumber: string;
  expirationDate: string;
  coverageAmount: number;
}

@Entity({ schema: 'provider', name: 'providers' })
@Index(['organizationId', 'npi'], { unique: true })
@Index(['organizationId', 'status'])
@Index(['organizationId', 'specialty'])
@Index(['organizationId', 'networkTier'])
export class ProviderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ type: 'varchar', length: 10 })
  @Index()
  npi: string;

  @Column({ type: 'varchar', length: 20, default: 'individual' })
  type: ProviderType;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: ProviderStatus;

  @Column({ name: 'network_tier', type: 'varchar', length: 20, default: 'standard' })
  networkTier: NetworkTier;

  // ─── Demographics ────────────────────────────────────
  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Column({ name: 'organization_name', type: 'varchar', length: 200, nullable: true })
  organizationName?: string;

  @Column({ name: 'display_name', type: 'varchar', length: 200 })
  displayName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  credentials?: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  specialty: string;

  @Column({ type: 'text', array: true, default: '{}' })
  subspecialties: string[];

  @Column({ name: 'taxonomy_code', type: 'varchar', length: 20, nullable: true })
  taxonomyCode?: string;

  // ─── Contact ─────────────────────────────────────────
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  fax?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website?: string;

  @Column({ type: 'jsonb', default: '{}' })
  address: ProviderAddress;

  // ─── Contract / Network ──────────────────────────────
  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  contractId?: string;

  @Column({ name: 'contract_effective_date', type: 'date', nullable: true })
  contractEffectiveDate?: string;

  @Column({ name: 'contract_term_date', type: 'date', nullable: true })
  contractTermDate?: string;

  @Column({ name: 'fee_schedule_id', type: 'uuid', nullable: true })
  feeScheduleId?: string;

  @Column({ name: 'accepting_new_patients', type: 'boolean', default: true })
  acceptingNewPatients: boolean;

  @Column({ name: 'panel_size', type: 'integer', nullable: true })
  panelSize?: number;

  @Column({ name: 'panel_capacity', type: 'integer', nullable: true })
  panelCapacity?: number;

  // ─── Credentialing ───────────────────────────────────
  @Column({ name: 'credentialing_status', type: 'varchar', length: 30, default: 'application_received' })
  credentialingStatus: CredentialingStatus;

  @Column({ name: 'credentialing_date', type: 'date', nullable: true })
  credentialingDate?: string;

  @Column({ name: 'recredentialing_date', type: 'date', nullable: true })
  recredentialingDate?: string;

  @Column({ name: 'license_number', type: 'varchar', length: 50, nullable: true })
  licenseNumber?: string;

  @Column({ name: 'license_state', type: 'varchar', length: 5, nullable: true })
  licenseState?: string;

  @Column({ name: 'license_expiration_date', type: 'date', nullable: true })
  licenseExpirationDate?: string;

  @Column({ name: 'dea_number', type: 'varchar', length: 20, nullable: true })
  deaNumber?: string;

  @Column({ name: 'dea_expiration_date', type: 'date', nullable: true })
  deaExpirationDate?: string;

  @Column({ name: 'board_certified', type: 'boolean', default: false })
  boardCertified: boolean;

  @Column({ name: 'board_certifications', type: 'jsonb', default: '[]' })
  boardCertifications: BoardCertification[];

  @Column({ name: 'malpractice_insurance', type: 'jsonb', nullable: true })
  malpracticeInsurance?: MalpracticeInsurance;

  // ─── Performance ─────────────────────────────────────
  @Column({ name: 'quality_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityScore?: number;

  @Column({ name: 'patient_satisfaction_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  patientSatisfactionScore?: number;

  @Column({ name: 'cost_efficiency_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  costEfficiencyScore?: number;

  // ─── Metadata ────────────────────────────────────────
  @Column({ type: 'text', array: true, default: '{}' })
  languages: string[];

  @Column({ name: 'hospital_affiliations', type: 'text', array: true, default: '{}' })
  hospitalAffiliations: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  // ─── Timestamps ──────────────────────────────────────
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // ─── Computed ────────────────────────────────────────
  get fullName(): string {
    if (this.type === 'individual') {
      return [this.firstName, this.lastName].filter(Boolean).join(' ');
    }
    return this.organizationName || this.displayName;
  }
}
