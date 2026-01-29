import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Calendar,
    Filter,
    Download,
    RefreshCw
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './RevenueAnalytics.css'

interface RevenueMetric {
    label: string
    value: string
    change: number
    changeType: 'increase' | 'decrease'
}

const metrics: RevenueMetric[] = [
    { label: 'Total Revenue', value: '$4.2M', change: 12.5, changeType: 'increase' },
    { label: 'Claims Collected', value: '$3.8M', change: 8.3, changeType: 'increase' },
    { label: 'Outstanding AR', value: '$425K', change: 5.2, changeType: 'decrease' },
    { label: 'Denial Rate', value: '6.8%', change: 1.2, changeType: 'decrease' }
]

const payerMix = [
    { name: 'Commercial', percentage: 45, color: 'var(--apex-teal)' },
    { name: 'Medicare', percentage: 30, color: 'var(--apex-purple)' },
    { name: 'Medicaid', percentage: 15, color: 'var(--apex-info)' },
    { name: 'Self-Pay', percentage: 10, color: 'var(--apex-warning)' }
]

export function RevenueAnalytics() {
    const [dateRange, setDateRange] = useState('mtd')

    return (
        <div className="revenue-analytics-page">
            {/* Header */}
            <div className="revenue__header">
                <div>
                    <h1 className="revenue__title">Revenue Analytics</h1>
                    <p className="revenue__subtitle">
                        Revenue cycle management dashboards and KPIs
                    </p>
                </div>
                <div className="revenue__actions">
                    <div className="date-selector">
                        {['mtd', 'qtd', 'ytd'].map(range => (
                            <button
                                key={range}
                                className={`date-btn ${dateRange === range ? 'active' : ''}`}
                                onClick={() => setDateRange(range)}
                            >
                                {range.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <Button variant="secondary" icon={<Download size={16} />}>Export</Button>
                    <Button variant="ghost" icon={<RefreshCw size={16} />} />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="revenue__kpis">
                {metrics.map((metric, index) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <GlassCard className="kpi-card">
                            <div className="kpi-header">
                                <span className="kpi-label">{metric.label}</span>
                                <span className={`kpi-change ${metric.changeType}`}>
                                    {metric.changeType === 'increase' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {metric.change}%
                                </span>
                            </div>
                            <span className="kpi-value">{metric.value}</span>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="revenue__charts">
                <GlassCard className="chart-card revenue-trend">
                    <div className="chart-header">
                        <h3>Revenue Trend</h3>
                        <Badge variant="teal">+12.5% YoY</Badge>
                    </div>
                    <div className="chart-placeholder">
                        <BarChart3 size={48} />
                        <span>Revenue trend chart</span>
                    </div>
                </GlassCard>

                <GlassCard className="chart-card payer-mix">
                    <div className="chart-header">
                        <h3>Payer Mix</h3>
                    </div>
                    <div className="payer-mix-chart">
                        <div className="pie-placeholder">
                            <PieChart size={80} />
                        </div>
                        <div className="payer-legend">
                            {payerMix.map(payer => (
                                <div key={payer.name} className="legend-item">
                                    <span className="legend-dot" style={{ background: payer.color }} />
                                    <span className="legend-name">{payer.name}</span>
                                    <span className="legend-value">{payer.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Bottom Row */}
            <div className="revenue__bottom">
                <GlassCard className="ar-aging">
                    <div className="chart-header">
                        <h3>AR Aging Summary</h3>
                    </div>
                    <div className="aging-buckets">
                        {[
                            { range: '0-30 days', amount: '$125,000', percentage: 30 },
                            { range: '31-60 days', amount: '$95,000', percentage: 22 },
                            { range: '61-90 days', amount: '$85,000', percentage: 20 },
                            { range: '91-120 days', amount: '$70,000', percentage: 16 },
                            { range: '120+ days', amount: '$50,000', percentage: 12 }
                        ].map(bucket => (
                            <div key={bucket.range} className="aging-bucket">
                                <div className="bucket-header">
                                    <span className="bucket-range">{bucket.range}</span>
                                    <span className="bucket-amount">{bucket.amount}</span>
                                </div>
                                <div className="bucket-bar">
                                    <div className="bucket-fill" style={{ width: `${bucket.percentage}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard className="collections-rate">
                    <div className="chart-header">
                        <h3>Collection Rate by Payer</h3>
                    </div>
                    <div className="collection-list">
                        {[
                            { payer: 'Aetna', rate: 94.5 },
                            { payer: 'BCBS', rate: 92.8 },
                            { payer: 'UnitedHealthcare', rate: 91.2 },
                            { payer: 'Medicare', rate: 98.5 },
                            { payer: 'Self-Pay', rate: 45.2 }
                        ].map(item => (
                            <div key={item.payer} className="collection-item">
                                <span className="collection-payer">{item.payer}</span>
                                <div className="collection-bar-wrapper">
                                    <div className="collection-bar">
                                        <div className="collection-fill" style={{ width: `${item.rate}%` }} />
                                    </div>
                                    <span className="collection-rate">{item.rate}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default RevenueAnalytics
