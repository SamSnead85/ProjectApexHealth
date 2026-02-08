// ═══════════════════════════════════════════════════════
// Analytics & Reporting Types
// ═══════════════════════════════════════════════════════

export type MetricPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface DashboardMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  changePercent?: number;
  trend: TrendDirection;
  format: 'number' | 'currency' | 'percent' | 'duration';
  period: MetricPeriod;
  category: string;
  sparklineData?: number[];
}

export interface ClaimsDashboardStats {
  totalClaims: number;
  claimsByStatus: Record<string, number>;
  claimsByType: Record<string, number>;
  totalChargedAmount: number;
  totalPaidAmount: number;
  averageProcessingDays: number;
  autoAdjudicationRate: number;
  denialRate: number;
  appealRate: number;
  avgCostPerClaim: number;
  medicalLossRatio: number;
  claimsTrend: TimeSeriesData[];
}

export interface OperationalDashboardStats {
  activeMembers: number;
  memberGrowthRate: number;
  networkProviders: number;
  averageStarRating: number;
  hedisComplianceRate: number;
  priorAuthTurnaroundDays: number;
  callCenterWaitTime: number;
  memberSatisfactionScore: number;
  claimsInventory: number;
  claimsInventoryAging: AgingBucket[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface AgingBucket {
  range: string;
  count: number;
  amount: number;
}

export interface ReportDefinition {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  category: 'claims' | 'eligibility' | 'financial' | 'quality' | 'compliance' | 'operational' | 'custom';
  dataSource: string;
  filters: ReportFilter[];
  columns: ReportColumn[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  groupBy?: string[];
  aggregations?: ReportAggregation[];
  schedule?: ReportSchedule;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'contains' | 'starts_with';
  value: any;
}

export interface ReportColumn {
  field: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'currency' | 'percent' | 'boolean';
  width?: number;
  visible: boolean;
}

export interface ReportAggregation {
  field: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';
  label: string;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  recipients: string[];
  format: 'pdf' | 'csv' | 'xlsx';
  enabled: boolean;
}

// Quality Metrics (HEDIS/Star Ratings)
export interface QualityMeasure {
  id: string;
  measureId: string;         // e.g., 'NQF-0059' or 'HEDIS-CBP'
  name: string;
  description: string;
  category: 'effectiveness' | 'access' | 'experience' | 'process' | 'outcome';
  domain: string;
  numerator: number;
  denominator: number;
  rate: number;
  target: number;
  benchmark: number;
  trend: TrendDirection;
  starRatingImpact: number;
  improvementOpportunity: number;
}

export interface StarRating {
  overall: number;
  categories: Array<{
    name: string;
    rating: number;
    weight: number;
    measures: QualityMeasure[];
  }>;
  bonusEligible: boolean;
  projectedRevenueImpact: number;
}
