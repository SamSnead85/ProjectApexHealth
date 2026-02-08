// ═══════════════════════════════════════════════════════
// Apex Health Platform - Prior Authorization API Service
// CMS-0057-F compliant prior auth management
// ═══════════════════════════════════════════════════════

import { apiClient } from './api-client';
import type {
  PriorAuthorization,
  PriorAuthSearchParams,
  CreatePriorAuthDto,
} from '../../packages/shared/src/types/prior-auth';
import type { PaginatedResponse } from '../../packages/shared/src/types/api';

const BASE = '/api/v1/prior-auth';

// ─── Prior Auth Stats ───────────────────────────────────

export interface PriorAuthStats {
  total: number;
  pending: number;
  approved: number;
  denied: number;
  averageTurnaroundDays: number;
  slaComplianceRate: number;
  urgentPending: number;
  aiAutoApprovalRate: number;
}

// ─── Prior Authorization API ────────────────────────────

export const priorAuthApi = {
  /**
   * Search prior authorizations with filtering, sorting, and pagination.
   */
  async searchPriorAuths(params: PriorAuthSearchParams): Promise<PaginatedResponse<PriorAuthorization>> {
    return apiClient.get<PaginatedResponse<PriorAuthorization>>(BASE, params as Record<string, unknown>);
  },

  /**
   * Get a single prior authorization by ID.
   */
  async getPriorAuth(id: string): Promise<PriorAuthorization> {
    return apiClient.get<PriorAuthorization>(`${BASE}/${id}`);
  },

  /**
   * Submit a new prior authorization request.
   */
  async createPriorAuth(data: CreatePriorAuthDto): Promise<PriorAuthorization> {
    return apiClient.post<PriorAuthorization>(BASE, data);
  },

  /**
   * Review and render a decision on a prior authorization.
   */
  async reviewPriorAuth(
    id: string,
    decision: {
      reviewDecision: 'approved' | 'denied' | 'partially_approved' | 'pended';
      reviewNotes?: string;
      denialReason?: string;
      denialReasonCode?: string;
      approvedUnits?: number;
      approvedFromDate?: string;
      approvedToDate?: string;
    },
  ): Promise<PriorAuthorization> {
    return apiClient.post<PriorAuthorization>(`${BASE}/${id}/review`, decision);
  },

  /**
   * Cancel a prior authorization (if still in reviewable state).
   */
  async cancelPriorAuth(id: string, reason: string): Promise<PriorAuthorization> {
    return apiClient.post<PriorAuthorization>(`${BASE}/${id}/cancel`, { reason });
  },

  /**
   * Attach a clinical document to a prior auth request.
   */
  async attachDocument(priorAuthId: string, documentId: string): Promise<void> {
    await apiClient.post(`${BASE}/${priorAuthId}/documents`, { documentId });
  },

  /**
   * Get aggregate prior-auth statistics.
   */
  async getPriorAuthStats(): Promise<PriorAuthStats> {
    return apiClient.get<PriorAuthStats>(`${BASE}/stats`);
  },
};

export default priorAuthApi;
