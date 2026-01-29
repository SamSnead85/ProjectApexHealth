import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    Heart,
    Pill,
    Calendar,
    Filter,
    Download,
    ChevronDown
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './HealthAnalytics.css'

// Spending Data
interface SpendingItem {
    category: string
    amount: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
    color: string
}

const spendingBreakdown: SpendingItem[] = [
    { category: 'Office Visits', amount: 850, percentage: 35, trend: 'stable', color: 'var(--apex-teal)' },
    { category: 'Prescriptions', amount: 620, percentage: 26, trend: 'up', color: 'var(--apex-purple)' },
    { category: 'Lab Work', amount: 450, percentage: 19, trend: 'down', color: 'var(--apex-success)' },
    { category: 'Specialist Care', amount: 320, percentage: 13, trend: 'up', color: 'var(--apex-warning)' },
    { category: 'Emergency', amount: 180, percentage: 7, trend: 'down', color: 'var(--apex-danger)' }
]

// Monthly spending for chart
const monthlySpending = [
    { month: 'Jul', amount: 180 },
    { month: 'Aug', amount: 320 },
    { month: 'Sep', amount: 150 },
    { month: 'Oct', amount: 480 },
    { month: 'Nov', amount: 220 },
    { month: 'Dec', amount: 390 },
    { month: 'Jan', amount: 280 }
]

// Health metrics
interface HealthMetric {
    name: string
    value: number | string
    unit: string
    trend: 'up' | 'down' | 'stable'
    status: 'good' | 'warning' | 'alert'
    change: string
}

const healthMetrics: HealthMetric[] = [
    { name: 'Resting Heart Rate', value: 68, unit: 'bpm', trend: 'down', status: 'good', change: '-3 from last month' },
    { name: 'Blood Pressure', value: '118/76', unit: 'mmHg', trend: 'stable', status: 'good', change: 'Stable' },
    { name: 'Weight', value: 172, unit: 'lbs', trend: 'down', status: 'good', change: '-2 lbs this month' },
    { name: 'Sleep Average', value: 7.2, unit: 'hours', trend: 'up', status: 'good', change: '+0.5 hrs' },
    { name: 'Steps Average', value: '8,420', unit: 'daily', trend: 'up', status: 'good', change: '+12% vs goal' },
    { name: 'Cholesterol', value: 185, unit: 'mg/dL', trend: 'down', status: 'good', change: '-15 from last test' }
]

// Spending Chart Component
function SpendingChart() {
    const maxAmount = Math.max(...monthlySpending.map(m => m.amount))

    return (
        <GlassCard className="spending-chart">
            <div className="chart-header">
                <h3>Monthly Spending Trend</h3>
                <div className="chart-controls">
                    <select defaultValue="6m">
                        <option value="3m">3 months</option>
                        <option value="6m">6 months</option>
                        <option value="1y">1 year</option>
                    </select>
                </div>
            </div>
            <div className="chart-container">
                <div className="chart-bars">
                    {monthlySpending.map((item, index) => (
                        <div key={item.month} className="chart-bar-container">
                            <motion.div
                                className="chart-bar"
                                initial={{ height: 0 }}
                                animate={{ height: `${(item.amount / maxAmount) * 100}%` }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <span className="bar-value">${item.amount}</span>
                            </motion.div>
                            <span className="bar-label">{item.month}</span>
                        </div>
                    ))}
                </div>
            </div>
        </GlassCard>
    )
}

// Spending Breakdown Component
function SpendingBreakdown() {
    return (
        <GlassCard className="spending-breakdown">
            <div className="breakdown-header">
                <h3>Spending by Category</h3>
                <span className="total">Total: $2,420</span>
            </div>
            <div className="breakdown-list">
                {spendingBreakdown.map((item, index) => (
                    <motion.div
                        key={item.category}
                        className="breakdown-item"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="item-header">
                            <div className="item-info">
                                <span
                                    className="item-dot"
                                    style={{ background: item.color }}
                                />
                                <span className="item-category">{item.category}</span>
                            </div>
                            <div className="item-values">
                                <span className="item-amount">${item.amount}</span>
                                <span className={`item-trend item-trend--${item.trend}`}>
                                    {item.trend === 'up' && <TrendingUp size={12} />}
                                    {item.trend === 'down' && <TrendingDown size={12} />}
                                </span>
                            </div>
                        </div>
                        <div className="item-bar">
                            <motion.div
                                className="item-bar__fill"
                                style={{ background: item.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percentage}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </GlassCard>
    )
}

// Health Metrics Grid
function HealthMetricsGrid() {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good': return 'var(--apex-success)'
            case 'warning': return 'var(--apex-warning)'
            case 'alert': return 'var(--apex-danger)'
            default: return 'var(--apex-steel)'
        }
    }

    return (
        <div className="health-metrics-section">
            <div className="section-header">
                <h3>Health Metrics</h3>
                <Button variant="ghost" size="sm" icon={<Filter size={14} />}>
                    Filter
                </Button>
            </div>
            <div className="metrics-grid">
                {healthMetrics.map((metric, index) => (
                    <motion.div
                        key={metric.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <GlassCard className="metric-card">
                            <div className="metric-header">
                                <span className="metric-name">{metric.name}</span>
                                <span
                                    className="metric-status-dot"
                                    style={{ background: getStatusColor(metric.status) }}
                                />
                            </div>
                            <div className="metric-value-row">
                                <span className="metric-value">{metric.value}</span>
                                <span className="metric-unit">{metric.unit}</span>
                            </div>
                            <div className={`metric-change metric-change--${metric.trend}`}>
                                {metric.trend === 'up' && <TrendingUp size={12} />}
                                {metric.trend === 'down' && <TrendingDown size={12} />}
                                {metric.change}
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

// Main Analytics Dashboard
export function HealthAnalytics() {
    return (
        <div className="health-analytics">
            <div className="analytics-header">
                <div>
                    <h1>Health Analytics</h1>
                    <p>Track your health trends and spending patterns</p>
                </div>
                <Button variant="secondary" icon={<Download size={16} />}>
                    Export Report
                </Button>
            </div>

            <div className="analytics-grid">
                <SpendingChart />
                <SpendingBreakdown />
            </div>

            <HealthMetricsGrid />
        </div>
    )
}

export default HealthAnalytics
