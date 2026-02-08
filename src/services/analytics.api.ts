// ═══════════════════════════════════════════════════════
// Apex Health Platform - Analytics API Service
// Dashboards, reports, quality measures, and Star Ratings
// ═══════════════════════════════════════════════════════

import { apiClient } from './api-client';
import type {
  ClaimsDashboardStats,
  OperationalDashboardStats,
  QualityMeasure,
  StarRating,
  ReportDefinition,
  DashboardMetric,
  MetricPeriod,
} from '../../packages/shared/src/types/analytics';

const BASE = '/api/v1/analytics';

// ─── Analytics API ───────────────────────────────────────

export const analyticsApi = {
  // ── Dashboards ────────────────────────────────────

  /**
   * Get claims dashboard statistics (totals, breakdowns, trends).
   */
  async getClaimsDashboard(period?: MetricPeriod): Promise<ClaimsDashboardStats> {
    return apiClient.get<ClaimsDashboardStats>(`${BASE}/dashboards/claims`, period ? { period } : undefined);
  },

  /**
   * Get operational dashboard statistics (membership, network, SLA, satisfaction).
   */
  async getOperationalDashboard(period?: MetricPeriod): Promise<OperationalDashboardStats> {
    return apiClient.get<OperationalDashboardStats>(`${BASE}/dashboards/operational`, period ? { period } : undefined);
  },

  /**
   * Get executive-level KPI metrics.
   */
  async getExecutiveMetrics(): Promise<DashboardMetric[]> {
    return apiClient.get<DashboardMetric[]>(`${BASE}/dashboards/executive`);
  },

  // ── Quality Measures ──────────────────────────────

  /**
   * Get quality measures (HEDIS, NQF, Stars).
   */
  async getQualityMeasures(category?: string): Promise<QualityMeasure[]> {
    return apiClient.get<QualityMeasure[]>(`${BASE}/quality/measures`, category ? { category } : undefined);
  },

  /**
   * Get Star Ratings summary with projected revenue impact.
   */
  async getStarRatings(): Promise<StarRating> {
    return apiClient.get<StarRating>(`${BASE}/quality/star-ratings`);
  },

  // ── Reports ───────────────────────────────────────

  /**
   * List available report definitions.
   */
  async listReports(category?: string): Promise<ReportDefinition[]> {
    return apiClient.get<ReportDefinition[]>(`${BASE}/reports`, category ? { category } : undefined);
  },

  /**
   * Get a specific report definition.
   */
  async getReport(id: string): Promise<ReportDefinition> {
    return apiClient.get<ReportDefinition>(`${BASE}/reports/${id}`);
  },

  /**
   * Create or update a report definition.
   */
  async saveReport(data: Partial<ReportDefinition>): Promise<ReportDefinition> {
    if (data.id) {
      return apiClient.put<ReportDefinition>(`${BASE}/reports/${data.id}`, data);
    }
    return apiClient.post<ReportDefinition>(`${BASE}/reports`, data);
  },

  /**
   * Execute a report and get the results.
   */
  async executeReport(id: string, params?: Record<string, unknown>): Promise<{
    reportId: string;
    generatedAt: string;
    rowCount: number;
    data: Record<string, unknown>[];
    aggregations?: Record<string, number>;
  }> {
    return apiClient.post(`${BASE}/reports/${id}/execute`, params);
  },

  /**
   * Export a report in a specified format.
   * Returns a download URL.
   */
  async exportReport(id: string, format: 'pdf' | 'csv' | 'xlsx'): Promise<{ downloadUrl: string }> {
    return apiClient.post(`${BASE}/reports/${id}/export`, { format });
  },

  /**
   * Delete a report definition.
   */
  async deleteReport(id: string): Promise<void> {
    await apiClient.delete(`${BASE}/reports/${id}`);
  },

  // ── Ad-hoc Metrics ────────────────────────────────

  /**
   * Get a specific metric by ID with optional date range.
   */
  async getMetric(
    metricId: string,
    params?: { from?: string; to?: string; period?: MetricPeriod },
  ): Promise<DashboardMetric> {
    return apiClient.get<DashboardMetric>(`${BASE}/metrics/${metricId}`, params as Record<string, unknown>);
  },
};

export default analyticsApi;
