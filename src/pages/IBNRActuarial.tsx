import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calculator,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    Info,
    ChevronRight,
    Download,
    RefreshCw,
    Settings,
    BarChart3,
    PieChart,
    Layers,
    Clock,
    FileText,
    Filter,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './IBNRActuarial.css'

// Types
interface ReserveEstimate {
    type: string
    current: number
    prior: number
    change: number
    confidence: number
    method: string
}

interface LagTriangleCell {
    value: number
    developed: boolean
}

interface FundingStatus {
    category: string
    funded: number
    required: number
    variance: number
    status: 'adequate' | 'warning' | 'critical'
}

// Mock Data
const reserveEstimates: ReserveEstimate[] = [
    { type: 'Medical IBNR', current: 892000, prior: 845000, change: 5.6, confidence: 94, method: 'Chain-Ladder' },
    { type: 'Pharmacy IBNR', current: 125000, prior: 118000, change: 5.9, confidence: 92, method: 'Bornhuetter-Ferguson' },
    { type: 'Dental IBNR', current: 45000, prior: 48000, change: -6.3, confidence: 96, method: 'Expected Loss' },
    { type: 'Claims Reserve', current: 1250000, prior: 1185000, change: 5.5, confidence: 91, method: 'Chain-Ladder' },
    { type: 'Premium Deficiency', current: 0, prior: 0, change: 0, confidence: 98, method: 'Premium Adequacy' },
]

const totalReserves = {
    ibnr: 1062000,
    claimsReserve: 1250000,
    totalLiability: 2312000,
    fundedAmount: 2450000,
    fundingRatio: 106
}

// Lag development triangle data (simplified)
const lagTriangleData = {
    incurredMonths: ['Oct-23', 'Nov-23', 'Dec-23', 'Jan-24', 'Feb-24', 'Mar-24'],
    developmentMonths: [1, 2, 3, 4, 5, 6],
    values: [
        [245000, 312000, 358000, 372000, 378000, 380000],
        [268000, 345000, 398000, 418000, 425000, null],
        [312000, 402000, 465000, 485000, null, null],
        [285000, 368000, 425000, null, null, null],
        [298000, 385000, null, null, null, null],
        [275000, null, null, null, null, null],
    ] as (number | null)[][],
    completionFactors: [1.55, 1.23, 1.08, 1.03, 1.01, 1.00]
}

const fundingStatus: FundingStatus[] = [
    { category: 'Medical Claims', funded: 1850000, required: 1750000, variance: 100000, status: 'adequate' },
    { category: 'Pharmacy', funded: 380000, required: 350000, variance: 30000, status: 'adequate' },
    { category: 'Dental/Vision', funded: 120000, required: 112000, variance: 8000, status: 'adequate' },
    { category: 'Admin/Fees', funded: 100000, required: 100000, variance: 0, status: 'adequate' },
]

const monthlyActuals = [
    { month: 'Oct', incurred: 380000, paid: 245000, ibnr: 135000 },
    { month: 'Nov', incurred: 425000, paid: 268000, ibnr: 157000 },
    { month: 'Dec', incurred: 485000, paid: 312000, ibnr: 173000 },
    { month: 'Jan', incurred: 445000, paid: 285000, ibnr: 160000 },
    { month: 'Feb', incurred: 428000, paid: 298000, ibnr: 130000 },
    { month: 'Mar', incurred: 275000, paid: 275000, ibnr: 0 },
]

// Utility functions
const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(2)}M`
    } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toLocaleString()}`
}

// Components
const ReserveCard = ({ estimate, index }: { estimate: ReserveEstimate; index: number }) => (
    <motion.div
        className="ibnr-reserve-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
    >
        <div className="ibnr-reserve-card__header">
            <h4>{estimate.type}</h4>
            <Badge
                variant={estimate.confidence >= 95 ? 'success' : estimate.confidence >= 90 ? 'info' : 'warning'}
                size="sm"
            >
                {estimate.confidence}% CI
            </Badge>
        </div>
        <div className="ibnr-reserve-card__value">{formatCurrency(estimate.current)}</div>
        <div className="ibnr-reserve-card__footer">
            <div className={`ibnr-reserve-card__change ${estimate.change >= 0 ? 'up' : 'down'}`}>
                {estimate.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{Math.abs(estimate.change)}%</span>
            </div>
            <span className="ibnr-reserve-card__method">{estimate.method}</span>
        </div>
    </motion.div>
)

const LagTriangle = () => {
    const maxValue = Math.max(...lagTriangleData.values.flat().filter((v): v is number => v !== null))

    return (
        <div className="ibnr-lag-triangle">
            <div className="ibnr-lag-triangle__header">
                <div className="ibnr-lag-triangle__corner">Incurred / Dev</div>
                {lagTriangleData.developmentMonths.map((m) => (
                    <div key={m} className="ibnr-lag-triangle__dev-header">{m}</div>
                ))}
            </div>
            {lagTriangleData.values.map((row, rowIndex) => (
                <div key={rowIndex} className="ibnr-lag-triangle__row">
                    <div className="ibnr-lag-triangle__month">{lagTriangleData.incurredMonths[rowIndex]}</div>
                    {row.map((value, colIndex) => (
                        <motion.div
                            key={colIndex}
                            className={`ibnr-lag-triangle__cell ${value === null ? 'empty' : ''}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: (rowIndex * 6 + colIndex) * 0.02 }}
                            style={{
                                backgroundColor: value !== null
                                    ? `rgba(59, 130, 246, ${0.1 + (value / maxValue) * 0.4})`
                                    : undefined
                            }}
                        >
                            {value !== null ? formatCurrency(value) : '—'}
                        </motion.div>
                    ))}
                </div>
            ))}
            <div className="ibnr-lag-triangle__factors">
                <div className="ibnr-lag-triangle__factor-label">LDF</div>
                {lagTriangleData.completionFactors.map((factor, index) => (
                    <div key={index} className="ibnr-lag-triangle__factor">{factor.toFixed(2)}</div>
                ))}
            </div>
        </div>
    )
}

const FundingStatusBar = ({ status, index }: { status: FundingStatus; index: number }) => {
    const percentage = (status.funded / status.required) * 100

    return (
        <motion.div
            className="ibnr-funding-bar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <div className="ibnr-funding-bar__header">
                <span className="ibnr-funding-bar__category">{status.category}</span>
                <span className={`ibnr-funding-bar__status ibnr-funding-bar__status--${status.status}`}>
                    {status.status === 'adequate' && <CheckCircle2 size={14} />}
                    {status.status === 'warning' && <AlertTriangle size={14} />}
                    {status.status === 'critical' && <AlertTriangle size={14} />}
                    {status.status}
                </span>
            </div>
            <div className="ibnr-funding-bar__track">
                <motion.div
                    className="ibnr-funding-bar__fill"
                    style={{
                        background: status.status === 'adequate' ? '#10B981' :
                            status.status === 'warning' ? '#F59E0B' : '#EF4444'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                />
                <div className="ibnr-funding-bar__threshold" style={{ left: '100%' }} />
            </div>
            <div className="ibnr-funding-bar__values">
                <span>Funded: {formatCurrency(status.funded)}</span>
                <span>Required: {formatCurrency(status.required)}</span>
                <span className={status.variance >= 0 ? 'positive' : 'negative'}>
                    {status.variance >= 0 ? '+' : ''}{formatCurrency(status.variance)}
                </span>
            </div>
        </motion.div>
    )
}

const IncurredPaidChart = () => {
    const maxValue = Math.max(...monthlyActuals.map(m => m.incurred))

    return (
        <div className="ibnr-chart">
            <div className="ibnr-chart__bars">
                {monthlyActuals.map((month, index) => (
                    <div key={month.month} className="ibnr-chart__bar-group">
                        <motion.div
                            className="ibnr-chart__bar ibnr-chart__bar--incurred"
                            initial={{ height: 0 }}
                            animate={{ height: `${(month.incurred / maxValue) * 100}%` }}
                            transition={{ delay: index * 0.05, duration: 0.4 }}
                        />
                        <motion.div
                            className="ibnr-chart__bar ibnr-chart__bar--paid"
                            initial={{ height: 0 }}
                            animate={{ height: `${(month.paid / maxValue) * 100}%` }}
                            transition={{ delay: index * 0.05 + 0.1, duration: 0.4 }}
                        />
                    </div>
                ))}
            </div>
            <div className="ibnr-chart__labels">
                {monthlyActuals.map(month => (
                    <span key={month.month}>{month.month}</span>
                ))}
            </div>
            <div className="ibnr-chart__legend">
                <span><span className="dot incurred" /> Incurred</span>
                <span><span className="dot paid" /> Paid</span>
                <span><span className="dot ibnr" /> IBNR</span>
            </div>
        </div>
    )
}

export function IBNRActuarial() {
    const [selectedMethod, setSelectedMethod] = useState('chain-ladder')
    const [selectedPeriod, setSelectedPeriod] = useState('ytd')

    return (
        <div className="ibnr-page">
            {/* Header */}
            <div className="ibnr-page__header">
                <div className="ibnr-page__header-content">
                    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        IBNR & Actuarial Engine
                    </motion.h1>
                    <p>Reserve Estimation • Lag Development • Funding Analysis</p>
                </div>
                <div className="ibnr-page__header-actions">
                    <Button variant="ghost" icon={<RefreshCw size={16} />}>Recalculate</Button>
                    <Button variant="secondary" icon={<Download size={16} />}>Export Report</Button>
                    <Button variant="primary" icon={<Settings size={16} />}>Configure</Button>
                </div>
            </div>

            {/* Summary Cards */}
            <section className="ibnr-page__summary">
                <motion.div
                    className="ibnr-summary-card ibnr-summary-card--primary"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="ibnr-summary-card__icon">
                        <Calculator size={24} />
                    </div>
                    <div className="ibnr-summary-card__content">
                        <span>Total IBNR Reserve</span>
                        <strong>{formatCurrency(totalReserves.ibnr)}</strong>
                    </div>
                </motion.div>

                <motion.div
                    className="ibnr-summary-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 }}
                >
                    <div className="ibnr-summary-card__icon">
                        <Layers size={24} />
                    </div>
                    <div className="ibnr-summary-card__content">
                        <span>Claims Reserve</span>
                        <strong>{formatCurrency(totalReserves.claimsReserve)}</strong>
                    </div>
                </motion.div>

                <motion.div
                    className="ibnr-summary-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="ibnr-summary-card__icon">
                        <DollarSign size={24} />
                    </div>
                    <div className="ibnr-summary-card__content">
                        <span>Total Liability</span>
                        <strong>{formatCurrency(totalReserves.totalLiability)}</strong>
                    </div>
                </motion.div>

                <motion.div
                    className="ibnr-summary-card ibnr-summary-card--success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="ibnr-summary-card__icon">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="ibnr-summary-card__content">
                        <span>Funding Ratio</span>
                        <strong>{totalReserves.fundingRatio}%</strong>
                    </div>
                </motion.div>
            </section>

            {/* Main Grid */}
            <div className="ibnr-page__grid">
                {/* Reserve Estimates */}
                <GlassCard className="ibnr-page__card ibnr-page__card--reserves">
                    <div className="ibnr-page__card-header">
                        <h3><Calculator size={18} /> Reserve Estimates</h3>
                        <select
                            value={selectedMethod}
                            onChange={(e) => setSelectedMethod(e.target.value)}
                            className="ibnr-page__method-select"
                        >
                            <option value="chain-ladder">Chain-Ladder</option>
                            <option value="bf">Bornhuetter-Ferguson</option>
                            <option value="expected-loss">Expected Loss</option>
                        </select>
                    </div>
                    <div className="ibnr-page__reserves-grid">
                        {reserveEstimates.map((estimate, index) => (
                            <ReserveCard key={estimate.type} estimate={estimate} index={index} />
                        ))}
                    </div>
                </GlassCard>

                {/* Lag Triangle */}
                <GlassCard className="ibnr-page__card ibnr-page__card--triangle">
                    <div className="ibnr-page__card-header">
                        <h3><BarChart3 size={18} /> Lag Development Triangle</h3>
                        <Badge variant="info" size="sm">Paid Basis</Badge>
                    </div>
                    <LagTriangle />
                </GlassCard>

                {/* Incurred vs Paid */}
                <GlassCard className="ibnr-page__card ibnr-page__card--chart">
                    <div className="ibnr-page__card-header">
                        <h3><TrendingUp size={18} /> Incurred vs Paid</h3>
                        <span className="ibnr-page__card-subtitle">Last 6 months</span>
                    </div>
                    <IncurredPaidChart />
                </GlassCard>

                {/* Funding Status */}
                <GlassCard className="ibnr-page__card ibnr-page__card--funding">
                    <div className="ibnr-page__card-header">
                        <h3><DollarSign size={18} /> Funding Status</h3>
                        <Badge variant="success" size="sm" icon={<CheckCircle2 size={10} />}>
                            Adequately Funded
                        </Badge>
                    </div>
                    <div className="ibnr-page__funding-list">
                        {fundingStatus.map((status, index) => (
                            <FundingStatusBar key={status.category} status={status} index={index} />
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Actuarial Notes */}
            <GlassCard className="ibnr-page__notes">
                <div className="ibnr-page__notes-header">
                    <Info size={18} />
                    <h4>Actuarial Notes & Assumptions</h4>
                </div>
                <ul className="ibnr-page__notes-list">
                    <li>IBNR calculated using weighted Chain-Ladder methodology with 24-month claim development history</li>
                    <li>Completion factors adjusted for seasonality and known large claims</li>
                    <li>Premium deficiency tested quarterly; currently no reserve required</li>
                    <li>Pharmacy IBNR includes PBM rebate adjustments (estimated at 18% of gross spend)</li>
                    <li>Next actuarial certification due: Q2 2024</li>
                </ul>
            </GlassCard>
        </div>
    )
}

export default IBNRActuarial
