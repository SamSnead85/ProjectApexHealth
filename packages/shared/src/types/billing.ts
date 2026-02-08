// ═══════════════════════════════════════════════════════
// Billing & Payment Types
// ═══════════════════════════════════════════════════════

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'void';
export type PaymentMethod = 'ach' | 'wire' | 'check' | 'eft' | 'credit_card';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'reversed' | 'refunded';
export type TransactionType = 'claim_payment' | 'premium' | 'refund' | 'adjustment' | 'capitation' | 'withhold' | 'bonus';

export interface Invoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  status: InvoiceStatus;

  // Billed Entity
  entityType: 'employer_group' | 'member' | 'provider' | 'broker';
  entityId: string;
  entityName: string;

  // Amounts
  subtotalAmount: number;
  taxAmount: number;
  adjustmentAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;

  // Dates
  invoiceDate: string;
  dueDate: string;
  periodStartDate: string;
  periodEndDate: string;
  paidDate?: string;

  // Line Items
  lineItems: InvoiceLineItem[];

  // Payment
  payments: Payment[];

  // Metadata
  notes?: string;
  ediTransactionId?: string;    // EDI 820 reference

  createdAt: string;
  updatedAt: string;
}

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

export interface Payment {
  id: string;
  organizationId: string;
  invoiceId?: string;
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;

  amount: number;
  currency: string;

  payerEntityType: string;
  payerEntityId: string;
  payerEntityName: string;
  payeeEntityType: string;
  payeeEntityId: string;
  payeeEntityName: string;

  referenceNumber: string;
  checkNumber?: string;
  eftTraceNumber?: string;

  paymentDate: string;
  processedDate?: string;
  settledDate?: string;

  ediTransactionId?: string;    // EDI 835 reference

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSearchParams {
  query?: string;
  invoiceId?: string;
  entityId?: string;
  status?: PaymentStatus;
  transactionType?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
