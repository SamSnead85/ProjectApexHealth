import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export type EdiTransactionType = '270' | '271' | '276' | '277' | '278' | '834' | '835' | '837P' | '837I' | '820' | '999';
export type EdiDirection = 'inbound' | 'outbound';
export type EdiStatus = 'received' | 'parsing' | 'parsed' | 'validated' | 'processing' | 'processed' | 'error' | 'rejected';

export type SnipLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface EdiValidationError {
  segment: string;
  element: string;
  code: string;
  message: string;
  snipLevel: SnipLevel;
}

@Entity({ schema: 'edi', name: 'transactions' })
@Index(['organizationId', 'transactionType'])
@Index(['organizationId', 'status'])
@Index(['organizationId', 'createdAt'])
@Index(['interchangeControlNumber'])
export class EdiTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ name: 'transaction_type', type: 'varchar', length: 10 })
  transactionType: EdiTransactionType;

  @Column({ type: 'varchar', length: 10, default: 'inbound' })
  direction: EdiDirection;

  @Column({ type: 'varchar', length: 20, default: 'received' })
  status: EdiStatus;

  // ─── Interchange Envelope ────────────────────────────
  @Column({ name: 'interchange_control_number', type: 'varchar', length: 20, nullable: true })
  interchangeControlNumber?: string;

  @Column({ name: 'sender_id', type: 'varchar', length: 50, nullable: true })
  senderId?: string;

  @Column({ name: 'receiver_id', type: 'varchar', length: 50, nullable: true })
  receiverId?: string;

  @Column({ name: 'functional_group_control_number', type: 'varchar', length: 20, nullable: true })
  functionalGroupControlNumber?: string;

  @Column({ name: 'transaction_set_control_number', type: 'varchar', length: 20, nullable: true })
  transactionSetControlNumber?: string;

  // ─── Content ─────────────────────────────────────────
  @Column({ name: 'raw_content', type: 'text', nullable: true })
  rawContent?: string;

  @Column({ name: 'parsed_data', type: 'jsonb', nullable: true })
  parsedData?: Record<string, any>;

  @Column({ name: 'segment_count', type: 'integer', nullable: true })
  segmentCount?: number;

  @Column({ name: 'file_size', type: 'integer', nullable: true })
  fileSize?: number;

  @Column({ name: 'file_name', type: 'varchar', length: 500, nullable: true })
  fileName?: string;

  // ─── Validation ──────────────────────────────────────
  @Column({ name: 'is_valid', type: 'boolean', nullable: true })
  isValid?: boolean;

  @Column({ name: 'validation_errors', type: 'jsonb', default: '[]' })
  validationErrors: EdiValidationError[];

  @Column({ name: 'snip_level_validated', type: 'integer', nullable: true })
  snipLevelValidated?: SnipLevel;

  // ─── Processing ──────────────────────────────────────
  @Column({ name: 'claim_count', type: 'integer', nullable: true })
  claimCount?: number;

  @Column({ name: 'member_count', type: 'integer', nullable: true })
  memberCount?: number;

  @Column({ name: 'total_charge_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalChargeAmount?: number;

  @Column({ name: 'processed_count', type: 'integer', default: 0 })
  processedCount: number;

  @Column({ name: 'error_count', type: 'integer', default: 0 })
  errorCount: number;

  // ─── Linked Entities ─────────────────────────────────
  @Column({ name: 'related_entity_ids', type: 'jsonb', default: '[]' })
  relatedEntityIds: string[];

  // ─── Metadata ────────────────────────────────────────
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'processed_by', type: 'uuid', nullable: true })
  processedBy?: string;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt?: Date;

  // ─── Timestamps ──────────────────────────────────────
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
