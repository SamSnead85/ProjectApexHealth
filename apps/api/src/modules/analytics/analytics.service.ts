import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface ClaimsDashboard {
  totalClaims: number;
  totalChargedAmount: number;
  totalPaidAmount: number;
  averageTurnaroundDays: number;
  autoAdjudicationRate: number;
  denialRate: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  monthlyTrend: { month: string; received: number; processed: number; paid: number }[];
  topDenialReasons: { reason: string; count: number }[];
}

export interface OperationalDashboard {
  activeMemberCount: number;
  activeProviderCount: number;
  pendingPriorAuths: number;
  openInvoices: number;
  claimsInQueue: number;
  averageProcessingTime: number;
  phiAccessToday: number;
  systemUptime: number;
}

export interface QualityMeasures {
  hedisScores: { measure: string; rate: number; benchmark: number; status: string }[];
  starRating: { category: string; stars: number; weight: number }[];
  overallStarRating: number;
  careGapsClosed: number;
  careGapsOpen: number;
}

export interface FinancialDashboard {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  medicalLossRatio: number;
  adminExpenseRatio: number;
  pmpm: { medical: number; admin: number; total: number };
  monthlyFinancials: { month: string; revenue: number; claims: number; admin: number }[];
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getClaimsDashboard(organizationId: string): Promise<ClaimsDashboard> {
    const qr = this.dataSource.createQueryRunner();

    try {
      // Total claims count and amounts
      const totals = await qr.query(
        `SELECT
          COUNT(*) as total_claims,
          COALESCE(SUM(total_charged_amount), 0) as total_charged,
          COALESCE(SUM(total_paid_amount), 0) as total_paid
        FROM claims.claims
        WHERE organization_id = $1`,
        [organizationId],
      ).catch(() => [{ total_claims: 0, total_charged: 0, total_paid: 0 }]);

      // Claims by status
      const statusRows = await qr.query(
        `SELECT status, COUNT(*) as count
        FROM claims.claims
        WHERE organization_id = $1
        GROUP BY status`,
        [organizationId],
      ).catch(() => []);

      const byStatus: Record<string, number> = {};
      for (const row of statusRows) {
        byStatus[row.status] = parseInt(row.count, 10);
      }

      // Claims by type
      const typeRows = await qr.query(
        `SELECT type, COUNT(*) as count
        FROM claims.claims
        WHERE organization_id = $1
        GROUP BY type`,
        [organizationId],
      ).catch(() => []);

      const byType: Record<string, number> = {};
      for (const row of typeRows) {
        byType[row.type] = parseInt(row.count, 10);
      }

      // Average turnaround (received -> processed)
      const turnaround = await qr.query(
        `SELECT COALESCE(AVG(processed_date::date - received_date::date), 0) as avg_days
        FROM claims.claims
        WHERE organization_id = $1 AND processed_date IS NOT NULL`,
        [organizationId],
      ).catch(() => [{ avg_days: 0 }]);

      // Auto-adjudication rate
      const autoRate = await qr.query(
        `SELECT
          COUNT(*) FILTER (WHERE ai_confidence_score > 0.95) as auto_count,
          COUNT(*) as total
        FROM claims.claims
        WHERE organization_id = $1 AND status NOT IN ('received', 'validated')`,
        [organizationId],
      ).catch(() => [{ auto_count: 0, total: 1 }]);

      // Denial rate
      const denialRate = await qr.query(
        `SELECT
          COUNT(*) FILTER (WHERE status = 'denied') as denied,
          COUNT(*) as total
        FROM claims.claims
        WHERE organization_id = $1 AND status NOT IN ('received', 'validated')`,
        [organizationId],
      ).catch(() => [{ denied: 0, total: 1 }]);

      // Monthly trend (last 12 months)
      const monthlyTrend = await qr.query(
        `SELECT
          TO_CHAR(received_date::date, 'YYYY-MM') as month,
          COUNT(*) as received,
          COUNT(*) FILTER (WHERE processed_date IS NOT NULL) as processed,
          COUNT(*) FILTER (WHERE status = 'paid') as paid
        FROM claims.claims
        WHERE organization_id = $1
          AND received_date >= (CURRENT_DATE - INTERVAL '12 months')
        GROUP BY month
        ORDER BY month`,
        [organizationId],
      ).catch(() => []);

      const total = parseInt(totals[0]?.total_claims ?? '0', 10);
      const autoTotal = parseInt(autoRate[0]?.total ?? '1', 10);
      const denialTotal = parseInt(denialRate[0]?.total ?? '1', 10);

      return {
        totalClaims: total,
        totalChargedAmount: parseFloat(totals[0]?.total_charged ?? '0'),
        totalPaidAmount: parseFloat(totals[0]?.total_paid ?? '0'),
        averageTurnaroundDays: parseFloat(turnaround[0]?.avg_days ?? '0'),
        autoAdjudicationRate: autoTotal > 0
          ? parseFloat(autoRate[0]?.auto_count ?? '0') / autoTotal
          : 0,
        denialRate: denialTotal > 0
          ? parseFloat(denialRate[0]?.denied ?? '0') / denialTotal
          : 0,
        byStatus,
        byType,
        monthlyTrend: monthlyTrend.map((r: any) => ({
          month: r.month,
          received: parseInt(r.received, 10),
          processed: parseInt(r.processed, 10),
          paid: parseInt(r.paid, 10),
        })),
        topDenialReasons: [],
      };
    } finally {
      await qr.release();
    }
  }

  async getOperationalDashboard(organizationId: string): Promise<OperationalDashboard> {
    const qr = this.dataSource.createQueryRunner();

    try {
      // Active members
      const members = await qr.query(
        `SELECT COUNT(*) as count FROM member.members
        WHERE organization_id = $1 AND status = 'active'`,
        [organizationId],
      ).catch(() => [{ count: 0 }]);

      // Active providers
      const providers = await qr.query(
        `SELECT COUNT(*) as count FROM provider.providers
        WHERE organization_id = $1 AND status = 'active'`,
        [organizationId],
      ).catch(() => [{ count: 0 }]);

      // Claims in queue
      const claimsQueue = await qr.query(
        `SELECT COUNT(*) as count FROM claims.claims
        WHERE organization_id = $1 AND status IN ('received', 'validated', 'in_review')`,
        [organizationId],
      ).catch(() => [{ count: 0 }]);

      // Open invoices
      const openInvoices = await qr.query(
        `SELECT COUNT(*) as count FROM billing.invoices
        WHERE organization_id = $1 AND status IN ('sent', 'partial', 'overdue')`,
        [organizationId],
      ).catch(() => [{ count: 0 }]);

      // PHI access today
      const phiAccess = await qr.query(
        `SELECT COUNT(*) as count FROM audit.hipaa_audit_log
        WHERE organization_id = $1
          AND phi_accessed = true
          AND timestamp >= CURRENT_DATE`,
        [organizationId],
      ).catch(() => [{ count: 0 }]);

      return {
        activeMemberCount: parseInt(members[0]?.count ?? '0', 10),
        activeProviderCount: parseInt(providers[0]?.count ?? '0', 10),
        pendingPriorAuths: 0, // Would query prior_auth schema
        openInvoices: parseInt(openInvoices[0]?.count ?? '0', 10),
        claimsInQueue: parseInt(claimsQueue[0]?.count ?? '0', 10),
        averageProcessingTime: 0,
        phiAccessToday: parseInt(phiAccess[0]?.count ?? '0', 10),
        systemUptime: Math.floor(process.uptime()),
      };
    } finally {
      await qr.release();
    }
  }

  async getQualityMeasures(organizationId: string): Promise<QualityMeasures> {
    // HEDIS/Star Rating measures would be computed from claims and member data.
    // This provides the data structure with placeholder calculations.
    return {
      hedisScores: [
        { measure: 'Breast Cancer Screening', rate: 0.72, benchmark: 0.75, status: 'below' },
        { measure: 'Colorectal Cancer Screening', rate: 0.68, benchmark: 0.65, status: 'above' },
        { measure: 'Diabetes HbA1c Testing', rate: 0.85, benchmark: 0.80, status: 'above' },
        { measure: 'Controlling High Blood Pressure', rate: 0.62, benchmark: 0.60, status: 'above' },
        { measure: 'Medication Adherence - Diabetes', rate: 0.78, benchmark: 0.80, status: 'below' },
        { measure: 'Plan All-Cause Readmissions', rate: 0.12, benchmark: 0.10, status: 'below' },
        { measure: 'Follow-Up After ED Visit', rate: 0.55, benchmark: 0.50, status: 'above' },
        { measure: 'Immunizations for Adolescents', rate: 0.42, benchmark: 0.45, status: 'below' },
      ],
      starRating: [
        { category: 'Staying Healthy', stars: 4, weight: 3 },
        { category: 'Managing Chronic Conditions', stars: 3, weight: 3 },
        { category: 'Member Experience', stars: 4, weight: 2 },
        { category: 'Complaints & Access', stars: 3, weight: 2 },
        { category: 'Health Plan Operations', stars: 4, weight: 1 },
      ],
      overallStarRating: 3.5,
      careGapsClosed: 0,
      careGapsOpen: 0,
    };
  }

  async getFinancialDashboard(organizationId: string): Promise<FinancialDashboard> {
    const qr = this.dataSource.createQueryRunner();

    try {
      // Total claims paid
      const claimsPaid = await qr.query(
        `SELECT COALESCE(SUM(total_paid_amount), 0) as total
        FROM claims.claims
        WHERE organization_id = $1 AND status = 'paid'`,
        [organizationId],
      ).catch(() => [{ total: 0 }]);

      // Total revenue (premium payments)
      const revenue = await qr.query(
        `SELECT COALESCE(SUM(amount), 0) as total
        FROM billing.payments
        WHERE organization_id = $1
          AND status = 'completed'
          AND transaction_type = 'premium'`,
        [organizationId],
      ).catch(() => [{ total: 0 }]);

      const totalRevenue = parseFloat(revenue[0]?.total ?? '0');
      const totalExpenses = parseFloat(claimsPaid[0]?.total ?? '0');
      const netIncome = totalRevenue - totalExpenses;

      // Medical Loss Ratio = Claims Paid / Premium Revenue
      const mlr = totalRevenue > 0 ? totalExpenses / totalRevenue : 0;

      // Monthly financials (last 12 months)
      const monthly = await qr.query(
        `SELECT
          TO_CHAR(payment_date::date, 'YYYY-MM') as month,
          COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'premium'), 0) as revenue,
          COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'claim_payment'), 0) as claims,
          COALESCE(SUM(amount) FILTER (WHERE transaction_type NOT IN ('premium', 'claim_payment')), 0) as admin
        FROM billing.payments
        WHERE organization_id = $1
          AND status = 'completed'
          AND payment_date >= (CURRENT_DATE - INTERVAL '12 months')
        GROUP BY month
        ORDER BY month`,
        [organizationId],
      ).catch(() => []);

      return {
        totalRevenue,
        totalExpenses,
        netIncome,
        medicalLossRatio: mlr,
        adminExpenseRatio: 0.15, // placeholder
        pmpm: { medical: 0, admin: 0, total: 0 },
        monthlyFinancials: monthly.map((r: any) => ({
          month: r.month,
          revenue: parseFloat(r.revenue),
          claims: parseFloat(r.claims),
          admin: parseFloat(r.admin),
        })),
      };
    } finally {
      await qr.release();
    }
  }
}
