import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Shield,
    AlertTriangle,
    ChevronRight,
    ChevronDown,
    BarChart3,
    Zap,
    Brain,
    Target,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    Sparkles,
    RefreshCw,
    Download,
    Filter,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Info,
    ExternalLink,
    MoreHorizontal,
    Search,
    Settings,
    Bell,
    Eye,
    Layers,
    Activity
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './SIRDashboard.css'
import '../styles/enterprise.css'

// ============================================================
// TYPES - Healthcare Domain Models
// ============================================================

interface ExecutiveKPI {
    id: string
    label: string
    shortLabel: string
    value: number
    formattedValue: string
    variance: number
    varianceLabel: string
    benchmark?: number
    benchmarkLabel?: string
    trend: 'favorable' | 'unfavorable' | 'neutral'
    icon: React.ElementType
    priority: 'primary' | 'secondary'
}

interface ClaimCategorySummary {
    categoryCode: string
    categoryName: string
    paidAmount: number
    claimCount: number
    memberCount: number
    percentOfTotal: number
    priorPeriodVariance: number
    pmpm: number
    avgClaimAmount: number
    color: string
}

interface HighCostMember {
    memberId: string
    riskStratificationScore: number
    predictedAnnualCost: number
    actualYTDSpend: number
    primaryConditions: string[]
    riskCategory: 'critical' | 'high' | 'rising'
    careManagementProgram: string
    enrollmentStatus: 'active' | 'enrolled' | 'referred' | 'declined'
    lastClaimDate: string
    providerNetwork: string
}

interface StopLossPosition {
    coverageType: 'ISL' | 'ASL'
    contractLimit: number
    currentExposure: number
    attachmentPoint: number
    utilizationPercent: number
    membersApproaching: number
    projectedRecoveries: number
    runRate: number
    lasrMonth: number
    projectedYearEnd: number
    status: 'green' | 'yellow' | 'red'
}

interface AIInsight {
    insightId: string
    category: 'anomaly' | 'prediction' | 'recommendation' | 'alert'
    severity: 'critical' | 'high' | 'medium' | 'low'
    title: string
    summary: string
    impact: string
    confidence: number
    actionRequired: boolean
    generatedAt: string
    sourceModels: string[]
}

interface MonthlyClaimsTrend {
    period: string
    periodLabel: string
    paidClaims: number
    incurredClaims: number
    budgetAllocation: number
    memberMonths: number
    pmpm: number
    ibnrEstimate: number
}

// ============================================================
// MOCK DATA - Realistic Healthcare Analytics
// ============================================================

const executiveKPIs: ExecutiveKPI[] = [
    {
        id: 'total-claims-ytd',
        label: 'Total Paid Claims YTD',
        shortLabel: 'Claims YTD',
        value: 14287650,
        formattedValue: '$14.29M',
        variance: 8.3,
        varianceLabel: 'vs prior YTD',
        benchmark: 13800000,
        benchmarkLabel: 'budget',
        trend: 'unfavorable',
        icon: DollarSign,
        priority: 'primary'
    },
    {
        id: 'pepm',
        label: 'Per Employee Per Month',
        shortLabel: 'PEPM',
        value: 1285.42,
        formattedValue: '$1,285',
        variance: -2.1,
        varianceLabel: 'vs benchmark',
        benchmark: 1312,
        benchmarkLabel: 'industry avg',
        trend: 'favorable',
        icon: Users,
        priority: 'primary'
    },
    {
        id: 'hcc-count',
        label: 'High-Cost Claimants',
        shortLabel: 'HCCs',
        value: 12,
        formattedValue: '12',
        variance: 3,
        varianceLabel: 'new this quarter',
        trend: 'unfavorable',
        icon: AlertTriangle,
        priority: 'secondary'
    },
    {
        id: 'stoploss-util',
        label: 'Stop-Loss Utilization',
        shortLabel: 'SL Util.',
        value: 67.4,
        formattedValue: '67.4%',
        variance: 12.3,
        varianceLabel: 'of aggregate limit',
        trend: 'neutral',
        icon: Shield,
        priority: 'secondary'
    },
    {
        id: 'loss-ratio',
        label: 'Medical Loss Ratio',
        shortLabel: 'MLR',
        value: 84.2,
        formattedValue: '84.2%',
        variance: -1.8,
        varianceLabel: 'vs prior period',
        benchmark: 85,
        benchmarkLabel: 'target',
        trend: 'favorable',
        icon: Activity,
        priority: 'secondary'
    },
    {
        id: 'ibnr-reserve',
        label: 'IBNR Reserve',
        shortLabel: 'IBNR',
        value: 892450,
        formattedValue: '$892K',
        variance: 4.2,
        varianceLabel: 'vs actuarial estimate',
        trend: 'neutral',
        icon: Layers,
        priority: 'secondary'
    }
]

const claimCategories: ClaimCategorySummary[] = [
    { categoryCode: 'IP', categoryName: 'Inpatient Facility', paidAmount: 4125000, claimCount: 287, memberCount: 156, percentOfTotal: 28.9, priorPeriodVariance: 5.2, pmpm: 371.25, avgClaimAmount: 14373, color: '#dc2626' },
    { categoryCode: 'OP', categoryName: 'Outpatient Facility', paidAmount: 3285000, claimCount: 4521, memberCount: 892, percentOfTotal: 23.0, priorPeriodVariance: -2.1, pmpm: 295.65, avgClaimAmount: 727, color: '#2563eb' },
    { categoryCode: 'PRO', categoryName: 'Professional Services', paidAmount: 2875000, claimCount: 18432, memberCount: 1847, percentOfTotal: 20.1, priorPeriodVariance: 3.8, pmpm: 258.75, avgClaimAmount: 156, color: '#059669' },
    { categoryCode: 'RX', categoryName: 'Pharmacy (Medical)', paidAmount: 2420000, claimCount: 8956, memberCount: 1523, percentOfTotal: 16.9, priorPeriodVariance: 12.5, pmpm: 217.80, avgClaimAmount: 270, color: '#7c3aed' },
    { categoryCode: 'SPE', categoryName: 'Specialty Pharmacy', paidAmount: 1120000, claimCount: 89, memberCount: 34, percentOfTotal: 7.8, priorPeriodVariance: 18.2, pmpm: 100.80, avgClaimAmount: 12584, color: '#ea580c' },
    { categoryCode: 'OTH', categoryName: 'Other Services', paidAmount: 462650, claimCount: 1256, memberCount: 423, percentOfTotal: 3.2, priorPeriodVariance: 1.2, pmpm: 41.64, avgClaimAmount: 368, color: '#64748b' }
]

const highCostMembers: HighCostMember[] = [
    {
        memberId: 'MBR-78432',
        riskStratificationScore: 945,
        predictedAnnualCost: 185000,
        actualYTDSpend: 142000,
        primaryConditions: ['ESRD (N18.6)', 'T2DM w/ complications (E11.65)'],
        riskCategory: 'critical',
        careManagementProgram: 'Renal Care Coordination',
        enrollmentStatus: 'enrolled',
        lastClaimDate: '2024-01-24',
        providerNetwork: 'In-Network (Tier 1)'
    },
    {
        memberId: 'MBR-45891',
        riskStratificationScore: 892,
        predictedAnnualCost: 156000,
        actualYTDSpend: 98000,
        primaryConditions: ['Metastatic Breast CA (C79.81)', 'Chronic Pain (G89.29)'],
        riskCategory: 'critical',
        careManagementProgram: 'Oncology Navigation',
        enrollmentStatus: 'enrolled',
        lastClaimDate: '2024-01-22',
        providerNetwork: 'In-Network (COE)'
    },
    {
        memberId: 'MBR-92341',
        riskStratificationScore: 847,
        predictedAnnualCost: 134000,
        actualYTDSpend: 67000,
        primaryConditions: ['CAD (I25.10)', 'CHF (I50.9)', 'CKD Stage 4 (N18.4)'],
        riskCategory: 'high',
        careManagementProgram: 'Cardiac Rehabilitation',
        enrollmentStatus: 'referred',
        lastClaimDate: '2024-01-18',
        providerNetwork: 'In-Network (Tier 2)'
    },
    {
        memberId: 'MBR-67234',
        riskStratificationScore: 823,
        predictedAnnualCost: 128000,
        actualYTDSpend: 45000,
        primaryConditions: ['MS - Relapsing (G35)'],
        riskCategory: 'high',
        careManagementProgram: 'Specialty Rx Management',
        enrollmentStatus: 'active',
        lastClaimDate: '2024-01-20',
        providerNetwork: 'In-Network (Tier 1)'
    },
    {
        memberId: 'MBR-34521',
        riskStratificationScore: 798,
        predictedAnnualCost: 112000,
        actualYTDSpend: 38000,
        primaryConditions: ['Hemophilia A (D66)', 'Arthropathy (M36.2)'],
        riskCategory: 'rising',
        careManagementProgram: 'Pending Assessment',
        enrollmentStatus: 'referred',
        lastClaimDate: '2024-01-25',
        providerNetwork: 'In-Network (Tier 1)'
    }
]

const stopLossPositions: StopLossPosition[] = [
    {
        coverageType: 'ISL',
        contractLimit: 150000,
        currentExposure: 0,
        attachmentPoint: 150000,
        utilizationPercent: 0,
        membersApproaching: 4,
        projectedRecoveries: 285000,
        runRate: 158000,
        lasrMonth: 142000,
        projectedYearEnd: 425000,
        status: 'yellow'
    },
    {
        coverageType: 'ASL',
        contractLimit: 5200000,
        currentExposure: 3504893,
        attachmentPoint: 5200000,
        utilizationPercent: 67.4,
        membersApproaching: 0,
        projectedRecoveries: 0,
        runRate: 4850000,
        lasrMonth: 4200000,
        projectedYearEnd: 5100000,
        status: 'green'
    }
]

const aiInsights: AIInsight[] = [
    {
        insightId: 'INS-2024-0892',
        category: 'anomaly',
        severity: 'high',
        title: 'Specialty Pharmacy Spend Anomaly Detected',
        summary: 'GLP-1 agonist utilization increased 34% MoM with 3 new high-cost prescriptions (Ozempic, Mounjaro). Pattern consistent with off-label weight management prescribing.',
        impact: 'Projected +$145K annual impact',
        confidence: 94,
        actionRequired: true,
        generatedAt: '2024-01-29T06:42:00Z',
        sourceModels: ['Utilization Forecaster', 'Rx Trend Analyzer']
    },
    {
        insightId: 'INS-2024-0891',
        category: 'prediction',
        severity: 'medium',
        title: 'Q2 High-Cost Claimant Emergence Forecast',
        summary: 'Predictive model identifies 2-3 members with elevated probability of becoming high-cost claimants. Member MBR-78432 shows early ESRD progression markers.',
        impact: 'Early intervention could reduce costs by $52K',
        confidence: 87,
        actionRequired: true,
        generatedAt: '2024-01-28T14:15:00Z',
        sourceModels: ['HCC Predictor (LightGBM)', 'Clinical Risk Stratifier']
    },
    {
        insightId: 'INS-2024-0889',
        category: 'recommendation',
        severity: 'medium',
        title: 'Network Steerage Opportunity Identified',
        summary: 'Analysis of 12 planned orthopedic procedures shows $142K potential savings through steering to Centers of Excellence. 8 knee replacements, 4 spinal fusions.',
        impact: 'Potential savings: $142K (23% cost reduction)',
        confidence: 91,
        actionRequired: false,
        generatedAt: '2024-01-26T09:30:00Z',
        sourceModels: ['Network Optimizer', 'Procedure Cost Analyzer']
    }
]

const monthlyTrend: MonthlyClaimsTrend[] = [
    { period: '2024-01', periodLabel: 'Jan', paidClaims: 1380000, incurredClaims: 1420000, budgetAllocation: 1400000, memberMonths: 1105, pmpm: 1249, ibnrEstimate: 42000 },
    { period: '2024-02', periodLabel: 'Feb', paidClaims: 1425000, incurredClaims: 1485000, budgetAllocation: 1400000, memberMonths: 1108, pmpm: 1286, ibnrEstimate: 58000 },
    { period: '2024-03', periodLabel: 'Mar', paidClaims: 1365000, incurredClaims: 1395000, budgetAllocation: 1400000, memberMonths: 1112, pmpm: 1228, ibnrEstimate: 35000 },
    { period: '2024-04', periodLabel: 'Apr', paidClaims: 1410000, incurredClaims: 1465000, budgetAllocation: 1400000, memberMonths: 1115, pmpm: 1265, ibnrEstimate: 52000 },
    { period: '2024-05', periodLabel: 'May', paidClaims: 1545000, incurredClaims: 1610000, budgetAllocation: 1400000, memberMonths: 1118, pmpm: 1382, ibnrEstimate: 68000 },
    { period: '2024-06', periodLabel: 'Jun', paidClaims: 1490000, incurredClaims: 1540000, budgetAllocation: 1400000, memberMonths: 1120, pmpm: 1330, ibnrEstimate: 55000 },
    { period: '2024-07', periodLabel: 'Jul', paidClaims: 1575000, incurredClaims: 1645000, budgetAllocation: 1400000, memberMonths: 1125, pmpm: 1400, ibnrEstimate: 72000 },
    { period: '2024-08', periodLabel: 'Aug', paidClaims: 1520000, incurredClaims: 1580000, budgetAllocation: 1400000, memberMonths: 1128, pmpm: 1348, ibnrEstimate: 62000 },
    { period: '2024-09', periodLabel: 'Sep', paidClaims: 1485000, incurredClaims: 1525000, budgetAllocation: 1400000, memberMonths: 1130, pmpm: 1314, ibnrEstimate: 45000 },
    { period: '2024-10', periodLabel: 'Oct', paidClaims: 1492000, incurredClaims: 1545000, budgetAllocation: 1400000, memberMonths: 1132, pmpm: 1318, ibnrEstimate: 58000 }
]

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const formatCurrency = (value: number, compact = false): string => {
    if (compact) {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
}

const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value)

const getVarianceClass = (value: number, isGoodWhenNegative = false): string => {
    if (value === 0) return 'neutral'
    const isPositive = value > 0
    return (isPositive && !isGoodWhenNegative) || (!isPositive && isGoodWhenNegative) ? 'unfavorable' : 'favorable'
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

const KPICard = ({ kpi, index }: { kpi: ExecutiveKPI; index: number }) => {
    const Icon = kpi.icon
    const varianceClass = kpi.trend === 'favorable' ? 'favorable' : kpi.trend === 'unfavorable' ? 'unfavorable' : 'neutral'

    return (
        <motion.div
            className={`sir-kpi-card sir-kpi-card--${kpi.priority}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
        >
            <div className="sir-kpi-card__header">
                <div className="sir-kpi-card__icon">
                    <Icon size={16} strokeWidth={1.5} />
                </div>
                <div className={`sir-kpi-card__variance sir-kpi-card__variance--${varianceClass}`}>
                    {kpi.trend === 'favorable' ? <TrendingDown size={12} /> : kpi.trend === 'unfavorable' ? <TrendingUp size={12} /> : null}
                    <span>{kpi.variance > 0 ? '+' : ''}{kpi.variance}%</span>
                </div>
            </div>
            <div className="sir-kpi-card__body">
                <div className="sir-kpi-card__value">{kpi.formattedValue}</div>
                <div className="sir-kpi-card__label">{kpi.label}</div>
            </div>
            <div className="sir-kpi-card__footer">
                <span className="sir-kpi-card__context">{kpi.varianceLabel}</span>
                {kpi.benchmark && (
                    <span className="sir-kpi-card__benchmark">
                        {kpi.benchmarkLabel}: {typeof kpi.benchmark === 'number' && kpi.benchmark > 1000 ? formatCurrency(kpi.benchmark, true) : kpi.benchmark}
                    </span>
                )}
            </div>
        </motion.div>
    )
}

const ClaimsCategoryRow = ({ category, maxAmount }: { category: ClaimCategorySummary; maxAmount: number }) => {
    const barWidth = (category.paidAmount / maxAmount) * 100

    return (
        <div className="sir-claims-row">
            <div className="sir-claims-row__category">
                <span className="sir-claims-row__code" style={{ background: `${category.color}15`, color: category.color }}>{category.categoryCode}</span>
                <span className="sir-claims-row__name">{category.categoryName}</span>
            </div>
            <div className="sir-claims-row__bar-container">
                <motion.div
                    className="sir-claims-row__bar"
                    style={{ background: category.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <span className="sir-claims-row__bar-label">{formatCurrency(category.paidAmount, true)}</span>
            </div>
            <div className="sir-claims-row__percent">{category.percentOfTotal.toFixed(1)}%</div>
            <div className={`sir-claims-row__variance ${category.priorPeriodVariance > 0 ? 'unfavorable' : 'favorable'}`}>
                {category.priorPeriodVariance > 0 ? '+' : ''}{category.priorPeriodVariance.toFixed(1)}%
            </div>
            <div className="sir-claims-row__pmpm">${category.pmpm.toFixed(0)}</div>
        </div>
    )
}

const HighCostMemberRow = ({ member, index }: { member: HighCostMember; index: number }) => {
    const riskColor = member.riskCategory === 'critical' ? '#dc2626' : member.riskCategory === 'high' ? '#d97706' : '#2563eb'
    const statusVariant = member.enrollmentStatus === 'enrolled' ? 'success' : member.enrollmentStatus === 'active' ? 'info' : member.enrollmentStatus === 'referred' ? 'warning' : 'critical'

    return (
        <motion.div
            className="sir-hcc-member"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
        >
            <div className="sir-hcc-member__risk">
                <svg className="sir-hcc-member__risk-ring" viewBox="0 0 36 36">
                    <path
                        className="sir-hcc-member__risk-track"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                        className="sir-hcc-member__risk-fill"
                        stroke={riskColor}
                        strokeDasharray={`${member.riskStratificationScore / 10}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                </svg>
                <span className="sir-hcc-member__risk-score">{member.riskStratificationScore}</span>
            </div>
            <div className="sir-hcc-member__info">
                <div className="sir-hcc-member__id-row">
                    <span className="sir-hcc-member__id">{member.memberId}</span>
                    <Badge variant={statusVariant} size="sm">{member.enrollmentStatus}</Badge>
                </div>
                <div className="sir-hcc-member__conditions">{member.primaryConditions.join(' • ')}</div>
            </div>
            <div className="sir-hcc-member__costs">
                <div className="sir-hcc-member__cost">
                    <span className="sir-hcc-member__cost-label">Predicted</span>
                    <span className="sir-hcc-member__cost-value">{formatCurrency(member.predictedAnnualCost, true)}</span>
                </div>
                <div className="sir-hcc-member__cost">
                    <span className="sir-hcc-member__cost-label">Actual YTD</span>
                    <span className="sir-hcc-member__cost-value">{formatCurrency(member.actualYTDSpend, true)}</span>
                </div>
            </div>
            <div className="sir-hcc-member__program">
                <span>{member.careManagementProgram}</span>
                <ChevronRight size={14} className="sir-hcc-member__arrow" />
            </div>
        </motion.div>
    )
}

const StopLossCard = ({ position }: { position: StopLossPosition }) => {
    const statusColor = position.status === 'green' ? '#059669' : position.status === 'yellow' ? '#d97706' : '#dc2626'

    return (
        <div className="sir-stoploss">
            <div className="sir-stoploss__header">
                <div className="sir-stoploss__title">
                    <span className="sir-stoploss__type">{position.coverageType === 'ISL' ? 'Individual Stop-Loss' : 'Aggregate Stop-Loss'}</span>
                    <span className="sir-stoploss__attachment">Attachment: {formatCurrency(position.attachmentPoint, true)}</span>
                </div>
                <div className="sir-stoploss__status" style={{ background: `${statusColor}15`, color: statusColor }}>
                    <span className="sir-stoploss__status-dot" style={{ background: statusColor }} />
                    {position.utilizationPercent.toFixed(1)}% utilized
                </div>
            </div>
            <div className="sir-stoploss__gauge">
                <div className="sir-stoploss__gauge-track">
                    <motion.div
                        className="sir-stoploss__gauge-fill"
                        style={{ background: position.utilizationPercent > 80 ? 'linear-gradient(90deg, #d97706, #dc2626)' : 'linear-gradient(90deg, #059669, #2563eb)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(position.utilizationPercent, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                    <div className="sir-stoploss__gauge-marker" style={{ left: '80%' }} />
                </div>
                <div className="sir-stoploss__gauge-labels">
                    <span>$0</span>
                    <span className="sir-stoploss__gauge-threshold">80%</span>
                    <span>{formatCurrency(position.contractLimit, true)}</span>
                </div>
            </div>
            <div className="sir-stoploss__metrics">
                <div className="sir-stoploss__metric">
                    <span className="sir-stoploss__metric-label">Current Exposure</span>
                    <span className="sir-stoploss__metric-value">{formatCurrency(position.currentExposure, true)}</span>
                </div>
                <div className="sir-stoploss__metric">
                    <span className="sir-stoploss__metric-label">Run Rate (Annual)</span>
                    <span className="sir-stoploss__metric-value">{formatCurrency(position.runRate, true)}</span>
                </div>
                {position.membersApproaching > 0 && (
                    <div className="sir-stoploss__metric sir-stoploss__metric--alert">
                        <span className="sir-stoploss__metric-label">Members Approaching</span>
                        <span className="sir-stoploss__metric-value">{position.membersApproaching}</span>
                    </div>
                )}
                {position.projectedRecoveries > 0 && (
                    <div className="sir-stoploss__metric sir-stoploss__metric--success">
                        <span className="sir-stoploss__metric-label">Proj. Recoveries</span>
                        <span className="sir-stoploss__metric-value">{formatCurrency(position.projectedRecoveries, true)}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

const InsightCard = ({ insight, index }: { insight: AIInsight; index: number }) => {
    const getIcon = () => {
        switch (insight.category) {
            case 'anomaly': return AlertCircle
            case 'prediction': return Brain
            case 'recommendation': return Target
            default: return Info
        }
    }
    const Icon = getIcon()
    const severityClass = insight.severity

    return (
        <motion.div
            className={`sir-insight sir-insight--${severityClass}`}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
        >
            <div className="sir-insight__header">
                <div className="sir-insight__icon"><Icon size={16} /></div>
                <div className="sir-insight__meta">
                    <span className="sir-insight__category">{insight.category}</span>
                    <span className="sir-insight__confidence">{insight.confidence}% confidence</span>
                </div>
            </div>
            <h4 className="sir-insight__title">{insight.title}</h4>
            <p className="sir-insight__summary">{insight.summary}</p>
            <div className="sir-insight__footer">
                <span className="sir-insight__impact">{insight.impact}</span>
                {insight.actionRequired && (
                    <Button variant="ghost" size="sm" className="sir-insight__action">
                        Take Action <ChevronRight size={12} />
                    </Button>
                )}
            </div>
        </motion.div>
    )
}

const MonthlyTrendChart = ({ data }: { data: MonthlyClaimsTrend[] }) => {
    const maxValue = Math.max(...data.map(d => Math.max(d.paidClaims, d.budgetAllocation))) * 1.1

    return (
        <div className="sir-trend">
            <div className="sir-trend__chart">
                {data.map((month, index) => {
                    const claimHeight = (month.paidClaims / maxValue) * 100
                    const budgetPosition = (month.budgetAllocation / maxValue) * 100
                    const isOverBudget = month.paidClaims > month.budgetAllocation

                    return (
                        <div key={month.period} className="sir-trend__bar-group">
                            <motion.div
                                className="sir-trend__bar"
                                style={{ background: isOverBudget ? '#dc2626' : '#2563eb' }}
                                initial={{ height: 0 }}
                                animate={{ height: `${claimHeight}%` }}
                                transition={{ delay: index * 0.03, duration: 0.4 }}
                                data-value={formatCurrency(month.paidClaims, true)}
                            />
                            <div className="sir-trend__budget-marker" style={{ bottom: `${budgetPosition}%` }} />
                        </div>
                    )
                })}
            </div>
            <div className="sir-trend__axis">
                {data.map(month => <span key={month.period}>{month.periodLabel}</span>)}
            </div>
            <div className="sir-trend__legend">
                <div className="sir-trend__legend-item"><span style={{ background: '#2563eb' }} />Under Budget</div>
                <div className="sir-trend__legend-item"><span style={{ background: '#dc2626' }} />Over Budget</div>
                <div className="sir-trend__legend-item"><span className="sir-trend__legend-line" />Monthly Budget</div>
            </div>
        </div>
    )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SIRDashboard() {
    const [selectedPeriod, setSelectedPeriod] = useState('ytd')
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ claims: true, hcc: true, stoploss: true })

    const maxClaimAmount = useMemo(() => Math.max(...claimCategories.map(c => c.paidAmount)), [])
    const totalClaims = useMemo(() => claimCategories.reduce((sum, c) => sum + c.paidAmount, 0), [])

    return (
        <div className="sir-dashboard">
            {/* Page Header */}
            <header className="sir-dashboard__header">
                <div className="sir-dashboard__header-content">
                    <div className="sir-dashboard__breadcrumb">
                        <span>Analytics</span>
                        <ChevronRight size={12} />
                        <span>Self-Insured Reporting</span>
                    </div>
                    <h1 className="sir-dashboard__title">SIR Analytics Command Center</h1>
                    <p className="sir-dashboard__subtitle">Self-Insured Employer Risk Analytics • Real-time Claims Intelligence</p>
                </div>
                <div className="sir-dashboard__header-actions">
                    <div className="sir-dashboard__period-tabs">
                        {['MTD', 'QTD', 'YTD', 'Rolling 12'].map(period => (
                            <button
                                key={period}
                                className={`sir-dashboard__period-tab ${selectedPeriod === period.toLowerCase().replace(' ', '') ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod(period.toLowerCase().replace(' ', ''))}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                    <div className="sir-dashboard__actions-group">
                        <Button variant="ghost" icon={<RefreshCw size={14} />}>Refresh</Button>
                        <Button variant="secondary" icon={<Download size={14} />}>Export</Button>
                    </div>
                </div>
            </header>

            {/* Executive KPIs */}
            <section className="sir-dashboard__kpis">
                {executiveKPIs.map((kpi, index) => (
                    <KPICard key={kpi.id} kpi={kpi} index={index} />
                ))}
            </section>

            {/* Main Content Grid */}
            <div className="sir-dashboard__grid">
                {/* Claims by Category Panel */}
                <div className="sir-dashboard__panel sir-dashboard__panel--claims">
                    <div className="sir-dashboard__panel-header">
                        <div className="sir-dashboard__panel-title">
                            <BarChart3 size={18} />
                            <span>Claims Distribution by Category</span>
                        </div>
                        <div className="sir-dashboard__panel-meta">
                            <span className="sir-dashboard__panel-total">Total: {formatCurrency(totalClaims, true)}</span>
                            <Button variant="ghost" size="sm" icon={<MoreHorizontal size={14} />} />
                        </div>
                    </div>
                    <div className="sir-dashboard__claims-header">
                        <span>Category</span>
                        <span>Paid Amount</span>
                        <span>% Total</span>
                        <span>vs Prior</span>
                        <span>PMPM</span>
                    </div>
                    <div className="sir-dashboard__claims-body">
                        {claimCategories.map(category => (
                            <ClaimsCategoryRow key={category.categoryCode} category={category} maxAmount={maxClaimAmount} />
                        ))}
                    </div>
                </div>

                {/* Monthly Trend Panel */}
                <div className="sir-dashboard__panel sir-dashboard__panel--trend">
                    <div className="sir-dashboard__panel-header">
                        <div className="sir-dashboard__panel-title">
                            <TrendingUp size={18} />
                            <span>Monthly Claims vs Budget</span>
                        </div>
                        <Button variant="ghost" size="sm">View Details</Button>
                    </div>
                    <MonthlyTrendChart data={monthlyTrend} />
                </div>

                {/* AI Insights Panel */}
                <div className="sir-dashboard__panel sir-dashboard__panel--insights">
                    <div className="sir-dashboard__panel-header">
                        <div className="sir-dashboard__panel-title">
                            <Sparkles size={18} />
                            <span>AI Insights</span>
                            <span className="sir-dashboard__panel-badge">{aiInsights.length} Active</span>
                        </div>
                        <Button variant="ghost" size="sm" icon={<Settings size={14} />} />
                    </div>
                    <div className="sir-dashboard__insights-list">
                        {aiInsights.map((insight, index) => (
                            <InsightCard key={insight.insightId} insight={insight} index={index} />
                        ))}
                    </div>
                </div>

                {/* High-Cost Claimants Panel */}
                <div className="sir-dashboard__panel sir-dashboard__panel--hcc">
                    <div className="sir-dashboard__panel-header">
                        <div className="sir-dashboard__panel-title">
                            <AlertTriangle size={18} />
                            <span>High-Cost Claimants</span>
                        </div>
                        <div className="sir-dashboard__panel-meta">
                            <span className="sir-dashboard__panel-accuracy">ML Accuracy: 91.2%</span>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>
                    </div>
                    <div className="sir-dashboard__hcc-list">
                        {highCostMembers.map((member, index) => (
                            <HighCostMemberRow key={member.memberId} member={member} index={index} />
                        ))}
                    </div>
                </div>

                {/* Stop-Loss Position Panel */}
                <div className="sir-dashboard__panel sir-dashboard__panel--stoploss">
                    <div className="sir-dashboard__panel-header">
                        <div className="sir-dashboard__panel-title">
                            <Shield size={18} />
                            <span>Stop-Loss Position</span>
                        </div>
                        <Button variant="ghost" size="sm">Manage Policy</Button>
                    </div>
                    <div className="sir-dashboard__stoploss-list">
                        {stopLossPositions.map(position => (
                            <StopLossCard key={position.coverageType} position={position} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SIRDashboard
