// ═══════════════════════════════════════════════════════
// Apex Health Platform - Claims API Service
// Claims processing, adjudication, and management
// ═══════════════════════════════════════════════════════

import { apiClient } from './api-client';
import type {
  Claim,
  ClaimSearchParams,
  ClaimsSummaryStats,
} from '../../packages/shared/src/types/claims';
import type { PaginatedResponse } from '../../packages/shared/src/types/api';

const BASE = '/api/v1/claims';

// ─── Claims API ─────────────────────────────────────────

export const claimsApi = {
  /**
   * Search claims with filtering, sorting, and pagination.
   */
  async searchClaims(params: ClaimSearchParams): Promise<PaginatedResponse<Claim>> {
    return apiClient.get<PaginatedResponse<Claim>>(BASE, params as Record<string, unknown>);
  },

  /**
   * Get a single claim by ID.
   */
  async getClaim(id: string): Promise<Claim> {
    return apiClient.get<Claim>(`${BASE}/${id}`);
  },

  /**
   * Create a new claim submission.
   */
  async createClaim(data: Partial<Claim>): Promise<Claim> {
    return apiClient.post<Claim>(BASE, data);
  },

  /**
   * Update an existing claim.
   */
  async updateClaim(id: string, data: Partial<Claim>): Promise<Claim> {
    return apiClient.patch<Claim>(`${BASE}/${id}`, data);
  },

  /**
   * Trigger auto-adjudication for a claim.
   */
  async adjudicateClaim(id: string): Promise<Claim> {
    return apiClient.post<Claim>(`${BASE}/${id}/adjudicate`);
  },

  /**
   * Approve a claim (requires claims:approve permission).
   */
  async approveClaim(id: string, notes?: string): Promise<Claim> {
    return apiClient.post<Claim>(`${BASE}/${id}/approve`, { notes });
  },

  /**
   * Deny a claim with a reason (requires claims:approve permission).
   */
  async denyClaim(id: string, reason: string, reasonCode?: string): Promise<Claim> {
    return apiClient.post<Claim>(`${BASE}/${id}/deny`, { reason, reasonCode });
  },

  /**
   * Void a claim (requires claims:void permission).
   */
  async voidClaim(id: string, reason: string): Promise<Claim> {
    return apiClient.post<Claim>(`${BASE}/${id}/void`, { reason });
  },

  /**
   * Add a note to a claim.
   */
  async addClaimNote(
    claimId: string,
    content: string,
    noteType: 'internal' | 'system' | 'adjudication' | 'appeal' = 'internal',
  ): Promise<void> {
    await apiClient.post(`${BASE}/${claimId}/notes`, { content, noteType });
  },

  /**
   * Assign a claim to a processor.
   */
  async assignClaim(claimId: string, processorId: string): Promise<Claim> {
    return apiClient.post<Claim>(`${BASE}/${claimId}/assign`, { processorId });
  },

  /**
   * Get aggregate claims statistics.
   */
  async getClaimsStats(): Promise<ClaimsSummaryStats> {
    return apiClient.get<ClaimsSummaryStats>(`${BASE}/stats`);
  },

  /**
   * Batch adjudicate multiple claims at once.
   */
  async batchAdjudicate(claimIds: string[]): Promise<{ processed: number; failed: number }> {
    return apiClient.post(`${BASE}/batch/adjudicate`, { claimIds });
  },
};

export default claimsApi;
