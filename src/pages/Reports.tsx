import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Download,
    Calendar,
    Filter,
    RefreshCw,
    DollarSign,
    FileText,
    Users,
    Clock,
    Activity,
    ChevronDown,
    PieChart,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './Reports.css'

interface ReportMetric {
    id: string
    label: string
    value: string | number
    change: number
    changeLabel: string
    icon: React.ReactNode
}

interface ChartData {
    label: string
    value: number
    color: string
}

const memberMetrics: ReportMetric[] = [
    {
        id: 'total-claims',
        label: 'Total Claims YTD',
        value: '$2,847.50',
        change: -12,
        changeLabel: 'vs last year',
        icon: <FileText size={20} />
    },
    {
        id: 'out-of-pocket',
        label: 'Out-of-Pocket Spent',
        value: '$1,200',
        change: 8,
        changeLabel: 'vs last year',
        icon: <DollarSign size={20} />
    },
    {
        id: 'provider-visits',
        label: 'Provider Visits',
        value: 7,
        change: 0,
        changeLabel: 'same as last year',
        icon: <Users size={20} />
    },
    {
        id: 'savings',
        label: 'In-Network Savings',
        value: '$1,423',
        change: 15,
        changeLabel: 'saved this year',
        icon: <TrendingUp size={20} />
    }
]

const claimsByCategory: ChartData[] = [
    { label: 'Preventive Care', value: 35, color: '#22c55e' },
    { label: 'Primary Care', value: 25, color: '#3b82f6' },
    { label: 'Specialist', value: 20, color: '#a855f7' },
    { label: 'Prescriptions', value: 15, color: '#f59e0b' },
    { label: 'Lab/Imaging', value: 5, color: '#06b6d4' }
]

const monthlySpending = [
    { month: 'Jan', amount: 245 },
    { month: 'Feb', amount: 180 },
    { month: 'Mar', amount: 320 },
    { month: 'Apr', amount: 150 },
    { month: 'May', amount: 410 },
    { month: 'Jun', amount: 275 },
    { month: 'Jul', amount: 195 },
    { month: 'Aug', amount: 340 },
    { month: 'Sep', amount: 220 },
    { month: 'Oct', amount: 285 },
    { month: 'Nov', amount: 160 },
    { month: 'Dec', amount: 125 }
]

export function Reports() {
    const [dateRange, setDateRange] = useState('ytd')
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsRefreshing(false)
    }

    const maxSpending = Math.max(...monthlySpending.map(m => m.amount))

    return (
        <div className="reports-page">
            {/* Header */}
            <div className="reports__header">
                <div>
                    <h1 className="reports__title">Reports & Analytics</h1>
                    <p className="reports__subtitle">
                        Insights into your healthcare spending and utilization
                    </p>
                </div>
                <div className="reports__actions">
                    <div className="reports__date-selector">
                        <Calendar size={16} />
                        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                            <option value="ytd">Year to Date</option>
                            <option value="12m">Last 12 Months</option>
                            <option value="6m">Last 6 Months</option>
                            <option value="3m">Last 3 Months</option>
                        </select>
                        <ChevronDown size={16} />
                    </div>
                    <Button
                        variant="secondary"
                        icon={isRefreshing ? <RefreshCw size={16} className="spinning" /> : <RefreshCw size={16} />}
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        Refresh
                    </Button>
                    <Button variant="primary" icon={<Download size={16} />}>
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="reports__metrics">
                {memberMetrics.map((metric, index) => (
                    <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <GlassCard className="metric-card-custom">
                            <div className="metric-card-custom__header">
                                <div className="metric-card-custom__icon">{metric.icon}</div>
                                <div className={`metric-card-custom__change ${metric.change > 0 ? 'positive' : metric.change < 0 ? 'negative' : 'neutral'}`}>
                                    {metric.change > 0 && <ArrowUpRight size={14} />}
                                    {metric.change < 0 && <ArrowDownRight size={14} />}
                                    {metric.change !== 0 && `${Math.abs(metric.change)}%`}
                                    {metric.change === 0 && '—'}
                                </div>
                            </div>
                            <div className="metric-card-custom__value">{metric.value}</div>
                            <div className="metric-card-custom__label">{metric.label}</div>
                            <div className="metric-card-custom__sublabel">{metric.changeLabel}</div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="reports__charts">
                {/* Monthly Spending Chart */}
                <GlassCard className="chart-card">
                    <div className="chart-card__header">
                        <div>
                            <h3>Monthly Spending</h3>
                            <p>Your healthcare expenses over time</p>
                        </div>
                        <Badge variant="teal">
                            <TrendingDown size={12} /> 12% lower than last year
                        </Badge>
                    </div>
                    <div className="bar-chart">
                        {monthlySpending.map((month, index) => (
                            <motion.div
                                key={month.month}
                                className="bar-chart__item"
                                initial={{ opacity: 0, scaleY: 0 }}
                                animate={{ opacity: 1, scaleY: 1 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                            >
                                <div className="bar-chart__bar-container">
                                    <motion.div
                                        className="bar-chart__bar"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(month.amount / maxSpending) * 100}%` }}
                                        transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                                    />
                                    <span className="bar-chart__value">${month.amount}</span>
                                </div>
                                <span className="bar-chart__label">{month.month}</span>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Claims by Category */}
                <GlassCard className="chart-card">
                    <div className="chart-card__header">
                        <div>
                            <h3>Claims by Category</h3>
                            <p>Distribution of your healthcare services</p>
                        </div>
                        <Badge variant="info">
                            <PieChart size={12} /> 5 categories
                        </Badge>
                    </div>
                    <div className="pie-chart-container">
                        <div className="pie-chart">
                            <svg viewBox="0 0 100 100" className="pie-chart__svg">
                                {claimsByCategory.reduce((acc, category, index) => {
                                    const prevTotal = acc.total
                                    acc.total += category.value
                                    const startAngle = (prevTotal / 100) * 360
                                    const endAngle = (acc.total / 100) * 360
                                    const largeArc = category.value > 50 ? 1 : 0

                                    const startX = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180)
                                    const startY = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180)
                                    const endX = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180)
                                    const endY = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180)

                                    acc.paths.push(
                                        <motion.path
                                            key={category.label}
                                            d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
                                            fill={category.color}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                        />
                                    )
                                    return acc
                                }, { paths: [] as JSX.Element[], total: 0 }).paths}
                                <circle cx="50" cy="50" r="25" fill="var(--apex-obsidian-soft)" />
                            </svg>
                        </div>
                        <div className="pie-chart__legend">
                            {claimsByCategory.map((category, index) => (
                                <motion.div
                                    key={category.label}
                                    className="pie-chart__legend-item"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <span className="pie-chart__legend-dot" style={{ background: category.color }} />
                                    <span className="pie-chart__legend-label">{category.label}</span>
                                    <span className="pie-chart__legend-value">{category.value}%</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Summary Cards */}
            <div className="reports__summary">
                <GlassCard className="summary-card">
                    <h4>Top Provider</h4>
                    <p className="summary-card__value">Premier Medical Associates</p>
                    <p className="summary-card__detail">5 visits • $1,245 total</p>
                </GlassCard>
                <GlassCard className="summary-card">
                    <h4>Most Common Service</h4>
                    <p className="summary-card__value">Office Visit (99213)</p>
                    <p className="summary-card__detail">4 claims • $25 avg copay</p>
                </GlassCard>
                <GlassCard className="summary-card">
                    <h4>Prescription Spending</h4>
                    <p className="summary-card__value">$240.00</p>
                    <p className="summary-card__detail">6 fills • 3 medications</p>
                </GlassCard>
                <GlassCard className="summary-card">
                    <h4>Deductible Progress</h4>
                    <p className="summary-card__value">30% Complete</p>
                    <p className="summary-card__detail">$450 of $1,500 used</p>
                </GlassCard>
            </div>

            {/* Report Downloads */}
            <GlassCard className="reports__downloads">
                <h3>Available Reports</h3>
                <div className="downloads__grid">
                    <button className="download-item">
                        <FileText size={24} />
                        <span className="download-item__title">Annual Summary</span>
                        <span className="download-item__desc">Complete yearly overview</span>
                        <Download size={16} />
                    </button>
                    <button className="download-item">
                        <Activity size={24} />
                        <span className="download-item__title">Claim History</span>
                        <span className="download-item__desc">Detailed claim records</span>
                        <Download size={16} />
                    </button>
                    <button className="download-item">
                        <DollarSign size={24} />
                        <span className="download-item__title">HSA Statement</span>
                        <span className="download-item__desc">Account transactions</span>
                        <Download size={16} />
                    </button>
                    <button className="download-item">
                        <Clock size={24} />
                        <span className="download-item__title">Tax Documents</span>
                        <span className="download-item__desc">1095-A, 1095-B forms</span>
                        <Download size={16} />
                    </button>
                </div>
            </GlassCard>
        </div>
    )
}

export default Reports
