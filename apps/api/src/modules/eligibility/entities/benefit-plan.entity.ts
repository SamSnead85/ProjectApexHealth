import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export enum PlanType {
  HMO = 'HMO',
  PPO = 'PPO',
  EPO = 'EPO',
  POS = 'POS',
  HDHP = 'HDHP',
  MEDICARE = 'Medicare',
  MEDICAID = 'Medicaid',
}

export enum MetalLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  CATASTROPHIC = 'catastrophic',
}

export interface PlanBenefits {
  [serviceType: string]: {
    inNetwork?: { copay?: number; coinsurance?: number; requiresAuth?: boolean };
    outOfNetwork?: { copay?: number; coinsurance?: number; requiresAuth?: boolean };
    description?: string;
    limitations?: string;
  };
}

export interface PlanDeductibles {
  individualInNetwork?: number;
  individualOutOfNetwork?: number;
  familyInNetwork?: number;
  familyOutOfNetwork?: number;
}

export interface OopMaximums {
  individualInNetwork?: number;
  individualOutOfNetwork?: number;
  familyInNetwork?: number;
  familyOutOfNetwork?: number;
}

export interface PlanPremiums {
  individual?: number;
  individualPlusSpouse?: number;
  individualPlusChildren?: number;
  family?: number;
  employerContribution?: number;
}

@Entity({ schema: 'member', name: 'benefit_plans' })
@Index(['organizationId', 'isActive'])
@Index(['organizationId', 'planType'])
export class BenefitPlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ name: 'plan_name', type: 'varchar', length: 255 })
  planName: string;

  @Column({ name: 'plan_id', type: 'varchar', length: 100 })
  @Index()
  planId: string;

  @Column({ name: 'plan_type', type: 'enum', enum: PlanType })
  planType: PlanType;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: Date;

  @Column({ name: 'termination_date', type: 'date', nullable: true })
  terminationDate?: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'metal_level', type: 'enum', enum: MetalLevel, nullable: true })
  metalLevel?: MetalLevel;

  @Column({ type: 'jsonb', default: '{}' })
  benefits: PlanBenefits;

  @Column({ type: 'jsonb', default: '{}' })
  deductibles: PlanDeductibles;

  @Column({ name: 'oop_maximums', type: 'jsonb', default: '{}' })
  oopMaximums: OopMaximums;

  @Column({ type: 'jsonb', default: '{}' })
  premiums: PlanPremiums;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
