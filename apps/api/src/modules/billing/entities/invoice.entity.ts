import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index, OneToMany,
} from 'typeorm';
import { PaymentEntity } from './payment.entity';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'void';
export type InvoiceEntityType = 'employer_group' | 'member' | 'provider' | 'broker';

export interface InvoiceLineItem {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  groupId?: string;
  planId?: string;
  memberCount?: number;
}

@Entity({ schema: 'billing', name: 'invoices' })
@Index(['organizationId', 'invoiceNumber'], { unique: true })
@Index(['organizationId', 'status'])
@Index(['organizationId', 'dueDate'])
@Index(['entityType', 'entityId'])
export class InvoiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ name: 'invoice_number', type: 'varchar', length: 50 })
  @Index()
  invoiceNumber: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: InvoiceStatus;

  // ─── Billed Entity ───────────────────────────────────
  @Column({ name: 'entity_type', type: 'varchar', length: 30 })
  entityType: InvoiceEntityType;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ name: 'entity_name', type: 'varchar', length: 200 })
  entityName: string;

  // ─── Amounts ─────────────────────────────────────────
  @Column({ name: 'subtotal_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotalAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'adjustment_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  adjustmentAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ name: 'balance_due', type: 'decimal', precision: 12, scale: 2, default: 0 })
  balanceDue: number;

  // ─── Dates ───────────────────────────────────────────
  @Column({ name: 'invoice_date', type: 'date' })
  invoiceDate: string;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column({ name: 'period_start_date', type: 'date' })
  periodStartDate: string;

  @Column({ name: 'period_end_date', type: 'date' })
  periodEndDate: string;

  @Column({ name: 'paid_date', type: 'date', nullable: true })
  paidDate?: string;

  // ─── Line Items ──────────────────────────────────────
  @Column({ name: 'line_items', type: 'jsonb', default: '[]' })
  lineItems: InvoiceLineItem[];

  // ─── Metadata ────────────────────────────────────────
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'edi_transaction_id', type: 'uuid', nullable: true })
  ediTransactionId?: string;

  // ─── Timestamps ──────────────────────────────────────
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // ─── Relations ───────────────────────────────────────
  @OneToMany(() => PaymentEntity, (payment) => payment.invoice, {
    cascade: false,
    eager: false,
  })
  payments: PaymentEntity[];
}
