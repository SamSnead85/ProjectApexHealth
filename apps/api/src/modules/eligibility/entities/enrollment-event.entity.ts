import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export enum EnrollmentEventType {
  NEW_HIRE = 'new_hire',
  OPEN_ENROLLMENT = 'open_enrollment',
  QUALIFYING_EVENT = 'qualifying_event',
  COBRA = 'cobra',
  TERMINATION = 'termination',
  DEPENDENT_ADD = 'dependent_add',
  DEPENDENT_REMOVE = 'dependent_remove',
  PLAN_CHANGE = 'plan_change',
  ADDRESS_CHANGE = 'address_change',
  REINSTATEMENT = 'reinstatement',
}

export enum EnrollmentEventStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
  REJECTED = 'rejected',
}

@Entity({ schema: 'member', name: 'enrollment_events' })
@Index(['organizationId', 'status'])
@Index(['organizationId', 'memberId'])
@Index(['organizationId', 'type'])
export class EnrollmentEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ type: 'enum', enum: EnrollmentEventType })
  type: EnrollmentEventType;

  @Column({ name: 'member_id', type: 'varchar', length: 100 })
  @Index()
  memberId: string;

  @Column({ name: 'subscriber_id', type: 'varchar', length: 100 })
  subscriberId: string;

  @Column({ name: 'group_id', type: 'varchar', length: 100, nullable: true })
  groupId?: string;

  @Column({ name: 'plan_id', type: 'uuid', nullable: true })
  planId?: string;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: Date;

  @Column({ name: 'received_date', type: 'timestamptz', default: () => 'NOW()' })
  receivedDate: Date;

  @Column({ name: 'processed_date', type: 'timestamptz', nullable: true })
  processedDate?: Date;

  @Column({ type: 'enum', enum: EnrollmentEventStatus, default: EnrollmentEventStatus.PENDING })
  status: EnrollmentEventStatus;

  @Column({ name: 'error_messages', type: 'text', array: true, nullable: true })
  errorMessages?: string[];

  @Column({ name: 'edi_transaction_id', type: 'varchar', length: 100, nullable: true })
  ediTransactionId?: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
