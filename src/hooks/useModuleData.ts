/**
 * Healthcare Module Data Hooks
 * 
 * Pre-configured data hooks for each business module, using
 * useApiData under the hood with proper type mapping and fallback.
 */

import { useApiData, useApiMutation } from './useApiData';

// ═══════════════════════════════════════════════════
// Claims Module
// ═══════════════════════════════════════════════════

export interface ClaimSummary {
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  deniedClaims: number;
  totalCharged: number;
  totalPaid: number;
  autoAdjudicationRate: number;
  averageProcessingDays: number;
}

const MOCK_CLAIMS_SUMMARY: ClaimSummary = {
  totalClaims: 12847,
  pendingClaims: 147,
  approvedClaims: 11234,
  deniedClaims: 1466,
  totalCharged: 24700000,
  totalPaid: 18200000,
  autoAdjudicationRate: 78.3,
  averageProcessingDays: 4.2,
};

export function useClaimsSummary() {
  return useApiData<ClaimSummary>(
    '/api/v1/analytics/dashboard',
    MOCK_CLAIMS_SUMMARY,
    {
      transform: (data: any) => ({
        totalClaims: data.totalClaims ?? MOCK_CLAIMS_SUMMARY.totalClaims,
        pendingClaims: data.pendingClaims ?? MOCK_CLAIMS_SUMMARY.pendingClaims,
        approvedClaims: data.approvedClaims ?? MOCK_CLAIMS_SUMMARY.approvedClaims,
        deniedClaims: data.deniedClaims ?? MOCK_CLAIMS_SUMMARY.deniedClaims,
        totalCharged: data.totalCharged ?? MOCK_CLAIMS_SUMMARY.totalCharged,
        totalPaid: data.totalPaid ?? MOCK_CLAIMS_SUMMARY.totalPaid,
        autoAdjudicationRate: data.autoAdjudicationRate ?? MOCK_CLAIMS_SUMMARY.autoAdjudicationRate,
        averageProcessingDays: data.averageProcessingDays ?? MOCK_CLAIMS_SUMMARY.averageProcessingDays,
      }),
      refreshInterval: 60000, // Refresh every minute
    }
  );
}

// ═══════════════════════════════════════════════════
// Eligibility Module
// ═══════════════════════════════════════════════════

export interface EligibilitySummary {
  totalMembers: number;
  activeMembers: number;
  pendingEnrollments: number;
  recentTerminations: number;
  verificationRequests: number;
  averageResponseTime: string;
}

const MOCK_ELIGIBILITY_SUMMARY: EligibilitySummary = {
  totalMembers: 45200,
  activeMembers: 42800,
  pendingEnrollments: 234,
  recentTerminations: 56,
  verificationRequests: 1847,
  averageResponseTime: '< 1 sec',
};

export function useEligibilitySummary() {
  return useApiData<EligibilitySummary>(
    '/api/v1/eligibility/summary',
    MOCK_ELIGIBILITY_SUMMARY,
    { refreshInterval: 120000 }
  );
}

// ═══════════════════════════════════════════════════
// Prior Authorization Module
// ═══════════════════════════════════════════════════

export interface PriorAuthSummary {
  totalRequests: number;
  pendingReview: number;
  approvedCount: number;
  deniedCount: number;
  urgentPending: number;
  avgTurnaroundHours: number;
  slaComplianceRate: number;
  overduePAs: number;
}

const MOCK_PA_SUMMARY: PriorAuthSummary = {
  totalRequests: 1234,
  pendingReview: 23,
  approvedCount: 987,
  deniedCount: 124,
  urgentPending: 5,
  avgTurnaroundHours: 48,
  slaComplianceRate: 94.7,
  overduePAs: 3,
};

export function usePriorAuthSummary() {
  return useApiData<PriorAuthSummary>(
    '/api/v1/prior-auth/summary',
    MOCK_PA_SUMMARY,
    { refreshInterval: 30000 } // Prior auth needs faster updates
  );
}

// ═══════════════════════════════════════════════════
// Analytics / Dashboard Module
// ═══════════════════════════════════════════════════

export interface DashboardKPIs {
  medicalLossRatio: number;
  claimsDenialRate: number;
  firstPassRate: number;
  memberSatisfaction: number;
  providerNetworkSize: number;
  starRating: number;
  hedisComplianceRate: number;
  ibnrEstimate: number;
  fraudRiskClaims: number;
  revenueCycleEfficiency: number;
}

const MOCK_DASHBOARD_KPIS: DashboardKPIs = {
  medicalLossRatio: 82.4,
  claimsDenialRate: 8.2,
  firstPassRate: 78.3,
  memberSatisfaction: 4.2,
  providerNetworkSize: 12450,
  starRating: 4.0,
  hedisComplianceRate: 91.2,
  ibnrEstimate: 3200000,
  fraudRiskClaims: 47,
  revenueCycleEfficiency: 94.1,
};

export function useDashboardKPIs() {
  return useApiData<DashboardKPIs>(
    '/api/v1/analytics/kpis',
    MOCK_DASHBOARD_KPIS,
    { refreshInterval: 300000 } // Refresh every 5 minutes
  );
}

// ═══════════════════════════════════════════════════
// Provider Module
// ═══════════════════════════════════════════════════

export interface ProviderSummary {
  totalProviders: number;
  activeProviders: number;
  pendingCredentialing: number;
  expiringContracts: number;
  averageQualityScore: number;
}

const MOCK_PROVIDER_SUMMARY: ProviderSummary = {
  totalProviders: 12450,
  activeProviders: 11230,
  pendingCredentialing: 89,
  expiringContracts: 34,
  averageQualityScore: 87.3,
};

export function useProviderSummary() {
  return useApiData<ProviderSummary>(
    '/api/v1/providers/summary',
    MOCK_PROVIDER_SUMMARY,
    { refreshInterval: 300000 }
  );
}

// ═══════════════════════════════════════════════════
// Billing Module
// ═══════════════════════════════════════════════════

export interface BillingSummary {
  outstandingBalance: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  collectionRate: number;
}

const MOCK_BILLING_SUMMARY: BillingSummary = {
  outstandingBalance: 2340000,
  monthlyRevenue: 8500000,
  pendingInvoices: 67,
  overdueInvoices: 12,
  collectionRate: 97.2,
};

export function useBillingSummary() {
  return useApiData<BillingSummary>(
    '/api/v1/billing/summary',
    MOCK_BILLING_SUMMARY,
    { refreshInterval: 300000 }
  );
}

// ═══════════════════════════════════════════════════
// Mutations (Write Operations)
// ═══════════════════════════════════════════════════

export function useApproveClaim() {
  return useApiMutation<{ claimId: string; notes: string }>(
    '/api/v1/claims/approve',
    'POST'
  );
}

export function useDenyClaim() {
  return useApiMutation<{ claimId: string; reasonCode: string; notes: string }>(
    '/api/v1/claims/deny',
    'POST'
  );
}

export function useSubmitPriorAuth() {
  return useApiMutation<any>(
    '/api/v1/prior-auth',
    'POST'
  );
}

export function useVerifyEligibility() {
  return useApiMutation<{ memberId: string; serviceDate: string }>(
    '/api/v1/eligibility/verify',
    'POST'
  );
}
