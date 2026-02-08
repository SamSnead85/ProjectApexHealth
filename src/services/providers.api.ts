// ═══════════════════════════════════════════════════════
// Apex Health Platform - Providers API Service
// Provider network search and management
// ═══════════════════════════════════════════════════════

import { apiClient } from './api-client';
import type {
  Provider,
  ProviderSearchParams,
} from '../../packages/shared/src/types/provider';
import type { PaginatedResponse } from '../../packages/shared/src/types/api';

const BASE = '/api/v1/providers';

// ─── Providers API ──────────────────────────────────────

export const providersApi = {
  /**
   * Search providers with filtering, sorting, and pagination.
   */
  async searchProviders(params: ProviderSearchParams): Promise<PaginatedResponse<Provider>> {
    return apiClient.get<PaginatedResponse<Provider>>(BASE, params as Record<string, unknown>);
  },

  /**
   * Get a single provider by ID.
   */
  async getProvider(id: string): Promise<Provider> {
    return apiClient.get<Provider>(`${BASE}/${id}`);
  },

  /**
   * Get a provider by NPI number.
   */
  async getProviderByNpi(npi: string): Promise<Provider> {
    return apiClient.get<Provider>(`${BASE}/npi/${npi}`);
  },

  /**
   * Update provider information.
   */
  async updateProvider(id: string, data: Partial<Provider>): Promise<Provider> {
    return apiClient.patch<Provider>(`${BASE}/${id}`, data);
  },

  /**
   * Get provider quality/performance scores.
   */
  async getProviderScores(id: string): Promise<{
    qualityScore: number;
    patientSatisfactionScore: number;
    costEfficiencyScore: number;
  }> {
    return apiClient.get(`${BASE}/${id}/scores`);
  },
};

export default providersApi;
