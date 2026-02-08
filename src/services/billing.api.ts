// ═══════════════════════════════════════════════════════
// Apex Health Platform - Billing API Service
// Invoice management, payment processing, financial ops
// ═══════════════════════════════════════════════════════

import { apiClient } from './api-client';
import type {
  Invoice,
  Payment,
  PaymentSearchParams,
} from '../../packages/shared/src/types/billing';
import type { PaginatedResponse } from '../../packages/shared/src/types/api';

const INVOICES_BASE = '/api/v1/billing/invoices';
const PAYMENTS_BASE = '/api/v1/billing/payments';

// ─── Invoice Search Params ──────────────────────────────

export interface InvoiceSearchParams {
  query?: string;
  invoiceNumber?: string;
  entityId?: string;
  entityType?: 'employer_group' | 'member' | 'provider' | 'broker';
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Process Payment DTO ────────────────────────────────

export interface ProcessPaymentDto {
  invoiceId: string;
  amount: number;
  paymentMethod: 'ach' | 'wire' | 'check' | 'eft' | 'credit_card';
  referenceNumber?: string;
  checkNumber?: string;
  notes?: string;
}

// ─── Billing API ─────────────────────────────────────────

export const billingApi = {
  // ── Invoices ──────────────────────────────────────

  /**
   * Search invoices with filtering, sorting, and pagination.
   */
  async searchInvoices(params: InvoiceSearchParams): Promise<PaginatedResponse<Invoice>> {
    return apiClient.get<PaginatedResponse<Invoice>>(INVOICES_BASE, params as Record<string, unknown>);
  },

  /**
   * Get a single invoice by ID.
   */
  async getInvoice(id: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`${INVOICES_BASE}/${id}`);
  },

  /**
   * Create a new invoice.
   */
  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    return apiClient.post<Invoice>(INVOICES_BASE, data);
  },

  /**
   * Update an existing invoice.
   */
  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    return apiClient.patch<Invoice>(`${INVOICES_BASE}/${id}`, data);
  },

  /**
   * Void an invoice.
   */
  async voidInvoice(id: string, reason: string): Promise<Invoice> {
    return apiClient.post<Invoice>(`${INVOICES_BASE}/${id}/void`, { reason });
  },

  // ── Payments ──────────────────────────────────────

  /**
   * Search payments with filtering, sorting, and pagination.
   */
  async searchPayments(params: PaymentSearchParams): Promise<PaginatedResponse<Payment>> {
    return apiClient.get<PaginatedResponse<Payment>>(PAYMENTS_BASE, params as Record<string, unknown>);
  },

  /**
   * Get a single payment by ID.
   */
  async getPayment(id: string): Promise<Payment> {
    return apiClient.get<Payment>(`${PAYMENTS_BASE}/${id}`);
  },

  /**
   * Process a payment against an invoice.
   */
  async processPayment(data: ProcessPaymentDto): Promise<Payment> {
    return apiClient.post<Payment>(PAYMENTS_BASE, data);
  },

  /**
   * Reverse a payment (refund).
   */
  async reversePayment(id: string, reason: string): Promise<Payment> {
    return apiClient.post<Payment>(`${PAYMENTS_BASE}/${id}/reverse`, { reason });
  },

  /**
   * Get billing summary/statistics.
   */
  async getBillingSummary(): Promise<{
    totalOutstanding: number;
    totalOverdue: number;
    totalCollected: number;
    invoiceCount: number;
    overdueInvoiceCount: number;
    averageDaysToPayment: number;
  }> {
    return apiClient.get('/api/v1/billing/summary');
  },
};

export default billingApi;
