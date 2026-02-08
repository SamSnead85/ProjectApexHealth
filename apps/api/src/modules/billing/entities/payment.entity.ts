import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index, ManyToOne, JoinColumn,
} from 'typeorm';
import { InvoiceEntity } from './invoice.entity';

export type TransactionType = 'claim_payment' | 'premium' | 'refund' | 'adjustment' | 'capitation' | 'withhold' | 'bonus';
export type PaymentMethod = 'ach' | 'wire' | 'check' | 'eft' | 'credit_card';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'reversed' | 'refunded';

@Entity({ schema: 'billing', name: 'payments' })
@Index(['organizationId', 'referenceNumber'])
@Index(['organizationId', 'status'])
@Index(['organizationId', 'paymentDate'])
@Index(['invoiceId'])
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ name: 'invoice_id', type: 'uuid', nullable: true })
  invoiceId?: string;

  @Column({ name: 'transaction_type', type: 'varchar', length: 30 })
  transactionType: TransactionType;

  @Column({ name: 'payment_method', type: 'varchar', length: 20 })
  paymentMethod: PaymentMethod;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // ─── Payer / Payee ───────────────────────────────────
  @Column({ name: 'payer_entity_type', type: 'varchar', length: 30 })
  payerEntityType: string;

  @Column({ name: 'payer_entity_id', type: 'uuid' })
  payerEntityId: string;

  @Column({ name: 'payer_entity_name', type: 'varchar', length: 200 })
  payerEntityName: string;

  @Column({ name: 'payee_entity_type', type: 'varchar', length: 30 })
  payeeEntityType: string;

  @Column({ name: 'payee_entity_id', type: 'uuid' })
  payeeEntityId: string;

  @Column({ name: 'payee_entity_name', type: 'varchar', length: 200 })
  payeeEntityName: string;

  // ─── Reference Numbers ───────────────────────────────
  @Column({ name: 'reference_number', type: 'varchar', length: 100 })
  referenceNumber: string;

  @Column({ name: 'check_number', type: 'varchar', length: 50, nullable: true })
  checkNumber?: string;

  @Column({ name: 'eft_trace_number', type: 'varchar', length: 100, nullable: true })
  eftTraceNumber?: string;

  // ─── Dates ───────────────────────────────────────────
  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: string;

  @Column({ name: 'processed_date', type: 'date', nullable: true })
  processedDate?: string;

  @Column({ name: 'settled_date', type: 'date', nullable: true })
  settledDate?: string;

  // ─── Metadata ────────────────────────────────────────
  @Column({ name: 'edi_transaction_id', type: 'uuid', nullable: true })
  ediTransactionId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // ─── Timestamps ──────────────────────────────────────
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // ─── Relations ───────────────────────────────────────
  @ManyToOne(() => InvoiceEntity, (invoice) => invoice.payments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice?: InvoiceEntity;
}
