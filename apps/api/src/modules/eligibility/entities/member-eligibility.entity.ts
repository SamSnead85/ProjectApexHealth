import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export enum EligibilityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
  COBRA = 'cobra',
  PENDING = 'pending',
}

export enum MemberRelationship {
  SELF = 'self',
  SPOUSE = 'spouse',
  CHILD = 'child',
  DOMESTIC_PARTNER = 'domestic_partner',
}

export interface Accumulators {
  individualDeductible?: { used: number; limit: number };
  familyDeductible?: { used: number; limit: number };
  individualOopMax?: { used: number; limit: number };
  familyOopMax?: { used: number; limit: number };
  planYear?: string;
  lastUpdated?: string;
}

@Entity({ schema: 'member', name: 'eligibility' })
@Index(['organizationId', 'memberId'])
@Index(['organizationId', 'subscriberId'])
@Index(['organizationId', 'status'])
@Index(['planId', 'status'])
export class MemberEligibilityEntity {
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

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @Column({ name: 'group_id', type: 'varchar', length: 100, nullable: true })
  groupId?: string;

  @Column({ type: 'enum', enum: EligibilityStatus, default: EligibilityStatus.PENDING })
  status: EligibilityStatus;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: Date;

  @Column({ name: 'termination_date', type: 'date', nullable: true })
  terminationDate?: Date;

  @Column({ type: 'enum', enum: MemberRelationship, default: MemberRelationship.SELF })
  relationship: MemberRelationship;

  @Column({ type: 'jsonb', default: '{}' })
  accumulators: Accumulators;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
