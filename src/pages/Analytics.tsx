import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    Activity,
    PieChart,
    BarChart3,
    Clock,
    DollarSign,
    Users,
    FileCheck,
    AlertTriangle,
    Brain,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './Analytics.css'

// Analytics data types
interface MetricData {
    label: string
    value: string | number
    change: number
    trend: 'up' | 'down'
    color: string
}

interface ChartDataPoint {
    label: string
    value: number
    color?: string
}

export function Analytics() {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

    // KPI Metrics
    const metrics: MetricData[] = [
        { label: 'Claims Processed', value: '12,847', change: 15.2, trend: 'up', color: 'teal' },
        { label: 'Avg Processing Time', value: '2.3 hrs', change: -18.5, trend: 'down', color: 'success' },
        { label: 'Auto-Approval Rate', value: '68.4%', change: 5.2, trend: 'up', color: 'success' },
        { label: 'Cost per Claim', value: '$4.82', change: -12.3, trend: 'down', color: 'success' },
    ]

    // Processing funnel data
    const funnelData: ChartDataPoint[] = [
        { label: 'Received', value: 12847, color: 'var(--apex-teal)' },
        { label: 'Validated', value: 12456, color: 'var(--apex-info)' },
        { label: 'AI Analyzed', value: 11234, color: 'var(--apex-teal-soft)' },
        { label: 'Auto-Approved', value: 8784, color: 'var(--apex-success)' },
        { label: 'HITL Review', value: 2450, color: 'var(--apex-warning)' },
        { label: 'Completed', value: 11892, color: 'var(--apex-success)' },
    ]

    // AI Performance metrics
    const aiMetrics = [
        { label: 'Accuracy', value: 94.2, target: 95 },
        { label: 'Confidence Avg', value: 87.5, target: 85 },
        { label: 'False Positives', value: 2.1, target: 3 },
        { label: 'HITL Reduction', value: 45.0, target: 50 },
    ]

    // Claims by category
    const claimsByCategory: ChartDataPoint[] = [
        { label: 'Medical', value: 45 },
        { label: 'Dental', value: 18 },
        { label: 'Vision', value: 12 },
        { label: 'Pharmacy', value: 20 },
        { label: 'Mental Health', value: 5 },
    ]

    // Recent trends
    const weeklyTrends = [65, 72, 68, 85, 78, 92, 88]

    return (
        <div className="analytics">
            {/* Header */}
            <div className="analytics__header">
                <div>
                    <h1 className="analytics__title">Analytics & Insights</h1>
                    <p className="analytics__subtitle">Real-time performance metrics and AI intelligence</p>
                </div>
                <div className="analytics__controls">
                    <div className="analytics__time-selector">
                        {(['7d', '30d', '90d', '1y'] as const).map(range => (
                            <button
                                key={range}
                                className={`analytics__time-btn ${timeRange === range ? 'analytics__time-btn--active' : ''}`}
                                onClick={() => setTimeRange(range)}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <Button variant="primary" icon={<Sparkles size={16} />}>
                        AI Insights
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="analytics__metrics">
                {metrics.map((metric, index) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <GlassCard className="analytics__metric-card">
                            <div className="analytics__metric-header">
                                <span className="analytics__metric-label">{metric.label}</span>
                                <Badge
                                    variant={metric.trend === 'up' ? 'success' : 'success'}
                                    size="sm"
                                >
                                    {metric.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {Math.abs(metric.change)}%
                                </Badge>
                            </div>
                            <span className="analytics__metric-value">{metric.value}</span>
                            <div className="analytics__metric-trend">
                                <div className="analytics__sparkline">
                                    {weeklyTrends.map((val, i) => (
                                        <div
                                            key={i}
                                            className="analytics__sparkline-bar"
                                            style={{ height: `${val}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Main Charts Grid */}
            <div className="analytics__grid">
                {/* Processing Funnel */}
                <GlassCard className="analytics__card analytics__card--funnel">
                    <div className="analytics__card-header">
                        <h3>
                            <BarChart3 size={18} className="text-teal" />
                            Processing Funnel
                        </h3>
                        <Badge variant="teal">Live</Badge>
                    </div>
                    <div className="analytics__funnel">
                        {funnelData.map((item, index) => {
                            const width = (item.value / funnelData[0].value) * 100
                            return (
                                <motion.div
                                    key={item.label}
                                    className="analytics__funnel-item"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${width}%` }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                >
                                    <div
                                        className="analytics__funnel-bar"
                                        style={{ background: item.color }}
                                    />
                                    <div className="analytics__funnel-info">
                                        <span className="analytics__funnel-label">{item.label}</span>
                                        <span className="analytics__funnel-value">
                                            {item.value.toLocaleString()}
                                        </span>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </GlassCard>

                {/* AI Performance */}
                <GlassCard className="analytics__card analytics__card--ai">
                    <div className="analytics__card-header">
                        <h3>
                            <Brain size={18} className="text-teal" />
                            AI Performance
                        </h3>
                        <span className="analytics__card-meta">Gemini 2.0</span>
                    </div>
                    <div className="analytics__ai-metrics">
                        {aiMetrics.map((metric, index) => {
                            const isGood = metric.label === 'False Positives'
                                ? metric.value <= metric.target
                                : metric.value >= metric.target
                            return (
                                <motion.div
                                    key={metric.label}
                                    className="analytics__ai-metric"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="analytics__ai-metric-header">
                                        <span className="analytics__ai-metric-label">{metric.label}</span>
                                        <span className={`analytics__ai-metric-value ${isGood ? 'text-success' : 'text-warning'}`}>
                                            {metric.value}%
                                        </span>
                                    </div>
                                    <div className="analytics__ai-metric-bar">
                                        <motion.div
                                            className={`analytics__ai-metric-fill ${isGood ? 'analytics__ai-metric-fill--good' : 'analytics__ai-metric-fill--warn'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${metric.value}%` }}
                                            transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                        />
                                        <div
                                            className="analytics__ai-metric-target"
                                            style={{ left: `${metric.target}%` }}
                                        />
                                    </div>
                                    <span className="analytics__ai-metric-target-label">
                                        Target: {metric.target}%
                                    </span>
                                </motion.div>
                            )
                        })}
                    </div>
                </GlassCard>

                {/* Claims Distribution */}
                <GlassCard className="analytics__card analytics__card--distribution">
                    <div className="analytics__card-header">
                        <h3>
                            <PieChart size={18} className="text-teal" />
                            Claims by Category
                        </h3>
                    </div>
                    <div className="analytics__pie-chart">
                        <svg viewBox="0 0 100 100" className="analytics__pie-svg">
                            {(() => {
                                let cumulativePercent = 0
                                const colors = ['#06B6D4', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6']
                                return claimsByCategory.map((item, i) => {
                                    const percent = item.value
                                    const startX = Math.cos(2 * Math.PI * cumulativePercent / 100) * 40 + 50
                                    const startY = Math.sin(2 * Math.PI * cumulativePercent / 100) * 40 + 50
                                    cumulativePercent += percent
                                    const endX = Math.cos(2 * Math.PI * cumulativePercent / 100) * 40 + 50
                                    const endY = Math.sin(2 * Math.PI * cumulativePercent / 100) * 40 + 50
                                    const largeArc = percent > 50 ? 1 : 0

                                    return (
                                        <path
                                            key={item.label}
                                            d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
                                            fill={colors[i]}
                                            className="analytics__pie-segment"
                                        />
                                    )
                                })
                            })()}
                            <circle cx="50" cy="50" r="25" fill="var(--apex-obsidian-soft)" />
                        </svg>
                        <div className="analytics__pie-legend">
                            {claimsByCategory.map((item, i) => {
                                const colors = ['#06B6D4', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6']
                                return (
                                    <div key={item.label} className="analytics__pie-legend-item">
                                        <span
                                            className="analytics__pie-legend-dot"
                                            style={{ background: colors[i] }}
                                        />
                                        <span className="analytics__pie-legend-label">{item.label}</span>
                                        <span className="analytics__pie-legend-value">{item.value}%</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </GlassCard>

                {/* Recent Alerts */}
                <GlassCard className="analytics__card analytics__card--alerts">
                    <div className="analytics__card-header">
                        <h3>
                            <AlertTriangle size={18} className="text-warning" />
                            AI Insights & Alerts
                        </h3>
                        <Badge variant="warning">3 New</Badge>
                    </div>
                    <div className="analytics__alerts">
                        <motion.div
                            className="analytics__alert analytics__alert--warning"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <AlertTriangle size={16} />
                            <div className="analytics__alert-content">
                                <span className="analytics__alert-title">
                                    Unusual spike in dental claims from Provider #2847
                                </span>
                                <span className="analytics__alert-meta">2 hours ago • Review recommended</span>
                            </div>
                        </motion.div>
                        <motion.div
                            className="analytics__alert analytics__alert--success"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <TrendingUp size={16} />
                            <div className="analytics__alert-content">
                                <span className="analytics__alert-title">
                                    Auto-approval rate increased 5.2% this week
                                </span>
                                <span className="analytics__alert-meta">AI model optimization effective</span>
                            </div>
                        </motion.div>
                        <motion.div
                            className="analytics__alert analytics__alert--info"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Clock size={16} />
                            <div className="analytics__alert-content">
                                <span className="analytics__alert-title">
                  HITL queue has 12 items pending over 24 hours
                                </span>
                                <span className="analytics__alert-meta">Consider workload rebalancing</span>
                            </div>
                        </motion.div>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default Analytics
