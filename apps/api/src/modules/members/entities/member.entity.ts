import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export type MemberStatus = 'active' | 'inactive' | 'terminated' | 'cobra' | 'pending';
export type Gender = 'male' | 'female' | 'other' | 'unknown';
export type RelationshipCode = 'self' | 'spouse' | 'child' | 'domestic_partner' | 'other';

export interface MemberAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
}

@Entity({ schema: 'member', name: 'members' })
@Index(['organizationId', 'memberId'], { unique: true })
@Index(['organizationId', 'subscriberId'])
@Index(['organizationId', 'status'])
@Index(['organizationId', 'lastName', 'firstName'])
@Index(['planId', 'status'])
@Index(['groupId'])
@Index(['pcpProviderId'])
export class MemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ name: 'member_id', type: 'varchar', length: 100 })
  @Index()
  memberId: string;

  @Column({ name: 'subscriber_id', type: 'varchar', length: 100 })
  subscriberId: string;

  @Column({ type: 'varchar', length: 20, default: 'self' })
  relationship: RelationshipCode;

  // ─── Demographics ────────────────────────────────────
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'middle_name', type: 'varchar', length: 100, nullable: true })
  middleName?: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: string;

  @Column({ type: 'varchar', length: 10, default: 'unknown' })
  gender: Gender;

  @Column({ name: 'ssn_encrypted', type: 'varchar', length: 500, nullable: true })
  ssnEncrypted?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'jsonb', default: '{}' })
  address: MemberAddress;

  // ─── Plan / Coverage ─────────────────────────────────
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: MemberStatus;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: string;

  @Column({ name: 'termination_date', type: 'date', nullable: true })
  terminationDate?: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @Column({ name: 'plan_name', type: 'varchar', length: 200 })
  planName: string;

  @Column({ name: 'group_id', type: 'varchar', length: 100, nullable: true })
  groupId?: string;

  @Column({ name: 'group_name', type: 'varchar', length: 200, nullable: true })
  groupName?: string;

  // ─── Care ────────────────────────────────────────────
  @Column({ name: 'pcp_provider_id', type: 'uuid', nullable: true })
  pcpProviderId?: string;

  @Column({ name: 'pcp_provider_name', type: 'varchar', length: 200, nullable: true })
  pcpProviderName?: string;

  // ─── Risk ────────────────────────────────────────────
  @Column({ name: 'risk_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  riskScore?: number;

  @Column({ name: 'hcc_codes', type: 'text', array: true, default: '{}' })
  hccCodes: string[];

  // ─── Metadata ────────────────────────────────────────
  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  // ─── Timestamps ──────────────────────────────────────
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // ─── Computed ────────────────────────────────────────
  get fullName(): string {
    return [this.firstName, this.middleName, this.lastName].filter(Boolean).join(' ');
  }
}
