import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Calculator,
    TrendingUp,
    TrendingDown,
    PieChart,
    BarChart3,
    DollarSign,
    Users,
    Activity,
    Calendar,
    Download,
    RefreshCw,
    AlertTriangle,
    Target,
    Percent
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './ActuarialTools.css'

interface LossRatio {
    period: string
    premiums: number
    claims: number
    adminCosts: number
    mlr: number
    targetMlr: number
}

interface ReserveEstimate {
    category: string
    ibnr: number
    reported: number
    total: number
    change: number
}

const lossRatios: LossRatio[] = [
    { period: 'Q4 2023', premiums: 45000000, claims: 36000000, adminCosts: 4500000, mlr: 80.0, targetMlr: 85.0 },
    { period: 'Q3 2023', premiums: 43500000, claims: 34800000, adminCosts: 4350000, mlr: 80.0, targetMlr: 85.0 },
    { period: 'Q2 2023', premiums: 42000000, claims: 35700000, adminCosts: 4200000, mlr: 85.0, targetMlr: 85.0 },
    { period: 'Q1 2023', premiums: 41000000, claims: 34850000, adminCosts: 4100000, mlr: 85.0, targetMlr: 85.0 }
]

const reserveEstimates: ReserveEstimate[] = [
    { category: 'Medical Claims', ibnr: 8500000, reported: 12500000, total: 21000000, change: 2.3 },
    { category: 'Pharmacy Claims', ibnr: 2100000, reported: 4800000, total: 6900000, change: -1.2 },
    { category: 'Mental Health', ibnr: 890000, reported: 1450000, total: 2340000, change: 5.8 },
    { category: 'Specialty', ibnr: 1200000, reported: 2800000, total: 4000000, change: 3.1 }
]

export function ActuarialTools() {
    const [ratios] = useState<LossRatio[]>(lossRatios)
    const [reserves] = useState<ReserveEstimate[]>(reserveEstimates)

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(amount)

    const formatFullCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

    const totalIbnr = reserves.reduce((sum, r) => sum + r.ibnr, 0)
    const totalReserves = reserves.reduce((sum, r) => sum + r.total, 0)
    const currentMlr = ratios[0]?.mlr || 0

    return (
        <div className="actuarial-tools-page">
            {/* Header */}
            <div className="actuarial__header">
                <div>
                    <h1 className="actuarial__title">Actuarial Tools</h1>
                    <p className="actuarial__subtitle">
                        Loss ratio analysis, reserve estimation, and financial projections
                    </p>
                </div>
                <div className="actuarial__actions">
                    <Button variant="secondary" icon={<Calendar size={16} />}>
                        Period
                    </Button>
                    <Button variant="secondary" icon={<Download size={16} />}>
                        Export
                    </Button>
                    <Button variant="primary" icon={<RefreshCw size={16} />}>
                        Run Model
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="actuarial__metrics">
                <MetricCard
                    label="Medical Loss Ratio"
                    value={`${currentMlr}%`}
                    change={-0.5}
                    trend="down"
                    icon={<Percent size={20} />}
                />
                <MetricCard
                    label="IBNR Reserve"
                    value={formatCurrency(totalIbnr)}
                    change={3.2}
                    trend="up"
                    icon={<Calculator size={20} />}
                />
                <MetricCard
                    label="Total Reserves"
                    value={formatCurrency(totalReserves)}
                    icon={<DollarSign size={20} />}
                />
                <MetricCard
                    label="Claims Trend"
                    value="+4.2%"
                    change={-1.1}
                    trend="down"
                    icon={<TrendingUp size={20} />}
                />
            </div>

            {/* MLR Analysis */}
            <GlassCard className="mlr-analysis">
                <div className="mlr-analysis__header">
                    <h3>Medical Loss Ratio Analysis</h3>
                    <Badge variant={currentMlr >= 80 ? 'success' : 'warning'}>
                        {currentMlr >= 80 ? 'ACA Compliant' : 'Below Threshold'}
                    </Badge>
                </div>

                <table className="mlr-table">
                    <thead>
                        <tr>
                            <th>Period</th>
                            <th>Premiums</th>
                            <th>Claims Paid</th>
                            <th>Admin Costs</th>
                            <th>MLR</th>
                            <th>Target</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ratios.map((ratio, index) => (
                            <motion.tr
                                key={ratio.period}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <td className="period">{ratio.period}</td>
                                <td className="currency">{formatCurrency(ratio.premiums)}</td>
                                <td className="currency">{formatCurrency(ratio.claims)}</td>
                                <td className="currency">{formatCurrency(ratio.adminCosts)}</td>
                                <td className={`mlr-value ${ratio.mlr >= 80 ? 'good' : 'warning'}`}>
                                    {ratio.mlr.toFixed(1)}%
                                </td>
                                <td>{ratio.targetMlr}%</td>
                                <td>
                                    <Badge
                                        variant={ratio.mlr >= ratio.targetMlr ? 'success' : ratio.mlr >= 80 ? 'info' : 'warning'}
                                        size="sm"
                                    >
                                        {ratio.mlr >= ratio.targetMlr ? 'On Target' : ratio.mlr >= 80 ? 'Compliant' : 'Below'}
                                    </Badge>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>

            {/* Reserve Estimates */}
            <GlassCard className="reserve-estimates">
                <div className="reserve-estimates__header">
                    <h3>Claim Reserve Estimates</h3>
                    <div className="reserve-legend">
                        <span><span className="legend-dot ibnr"></span>IBNR</span>
                        <span><span className="legend-dot reported"></span>Reported</span>
                    </div>
                </div>

                <div className="reserve-estimates__grid">
                    {reserves.map((reserve, index) => (
                        <motion.div
                            key={reserve.category}
                            className="reserve-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="reserve-card__header">
                                <h4>{reserve.category}</h4>
                                <div className={`reserve-card__change ${reserve.change >= 0 ? 'up' : 'down'}`}>
                                    {reserve.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {Math.abs(reserve.change)}%
                                </div>
                            </div>

                            <div className="reserve-card__total">
                                {formatFullCurrency(reserve.total)}
                            </div>

                            <div className="reserve-card__breakdown">
                                <div className="reserve-bar">
                                    <div
                                        className="reserve-bar__ibnr"
                                        style={{ width: `${(reserve.ibnr / reserve.total) * 100}%` }}
                                    />
                                    <div
                                        className="reserve-bar__reported"
                                        style={{ width: `${(reserve.reported / reserve.total) * 100}%` }}
                                    />
                                </div>
                                <div className="reserve-details">
                                    <span>IBNR: {formatCurrency(reserve.ibnr)}</span>
                                    <span>Reported: {formatCurrency(reserve.reported)}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </GlassCard>

            {/* Projections */}
            <div className="actuarial__projections">
                <GlassCard className="projection-card">
                    <div className="projection-card__header">
                        <Target size={20} />
                        <h4>Premium Adequacy</h4>
                    </div>
                    <div className="projection-card__value">102.3%</div>
                    <p className="projection-card__desc">Current premiums are adequate for projected claims</p>
                </GlassCard>
                <GlassCard className="projection-card warning">
                    <div className="projection-card__header">
                        <AlertTriangle size={20} />
                        <h4>Risk Corridor</h4>
                    </div>
                    <div className="projection-card__value">$1.2M</div>
                    <p className="projection-card__desc">Estimated risk corridor payment</p>
                </GlassCard>
                <GlassCard className="projection-card">
                    <div className="projection-card__header">
                        <Activity size={20} />
                        <h4>Trend Factor</h4>
                    </div>
                    <div className="projection-card__value">1.042</div>
                    <p className="projection-card__desc">Year-over-year claims trend multiplier</p>
                </GlassCard>
            </div>
        </div>
    )
}

export default ActuarialTools
