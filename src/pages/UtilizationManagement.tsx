import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ClipboardList,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Users,
    Building2,
    Activity,
    Filter,
    Download,
    Calendar,
    BarChart3,
    PieChart,
    Target
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './UtilizationManagement.css'

interface UtilizationMetric {
    category: string
    icon: typeof Activity
    current: number
    benchmark: number
    trend: 'up' | 'down' | 'stable'
    variance: number
}

interface ServiceCategory {
    name: string
    admissions: number
    avgLos: number
    cost: number
    perMember: number
    status: 'normal' | 'high' | 'critical'
}

const utilizationMetrics: UtilizationMetric[] = [
    { category: 'Inpatient Admissions', icon: Building2, current: 82.5, benchmark: 85.0, trend: 'down', variance: -2.9 },
    { category: 'ED Visits', icon: Activity, current: 245, benchmark: 220, trend: 'up', variance: 11.4 },
    { category: 'Readmission Rate', icon: TrendingDown, current: 12.3, benchmark: 15.0, trend: 'down', variance: -18.0 },
    { category: 'Avg Length of Stay', icon: Clock, current: 4.2, benchmark: 4.5, trend: 'down', variance: -6.7 }
]

const serviceCategories: ServiceCategory[] = [
    { name: 'Inpatient Medical', admissions: 1245, avgLos: 4.2, cost: 12450000, perMember: 245.50, status: 'normal' },
    { name: 'Inpatient Surgical', admissions: 856, avgLos: 3.8, cost: 18900000, perMember: 372.85, status: 'normal' },
    { name: 'Emergency Services', admissions: 4520, avgLos: 0.3, cost: 5680000, perMember: 112.15, status: 'high' },
    { name: 'Outpatient Surgery', admissions: 2340, avgLos: 0.5, cost: 8920000, perMember: 176.05, status: 'normal' },
    { name: 'Skilled Nursing', admissions: 420, avgLos: 18.5, cost: 3450000, perMember: 68.10, status: 'normal' },
    { name: 'Behavioral Health', admissions: 680, avgLos: 6.2, cost: 2890000, perMember: 57.05, status: 'high' }
]

export function UtilizationManagement() {
    const [metrics] = useState<UtilizationMetric[]>(utilizationMetrics)
    const [services] = useState<ServiceCategory[]>(serviceCategories)

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(amount)

    const getStatusBadge = (status: ServiceCategory['status']) => {
        switch (status) {
            case 'normal': return <Badge variant="success" size="sm">Normal</Badge>
            case 'high': return <Badge variant="warning" size="sm">Above Target</Badge>
            case 'critical': return <Badge variant="critical" size="sm">Critical</Badge>
        }
    }

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return <TrendingUp size={14} />
            case 'down': return <TrendingDown size={14} />
            case 'stable': return <Activity size={14} />
        }
    }

    return (
        <div className="utilization-management-page">
            {/* Header */}
            <div className="utilization__header">
                <div>
                    <h1 className="utilization__title">Utilization Management</h1>
                    <p className="utilization__subtitle">
                        Monitor healthcare utilization patterns and cost trends
                    </p>
                </div>
                <div className="utilization__actions">
                    <Button variant="secondary" icon={<Calendar size={16} />}>
                        Date Range
                    </Button>
                    <Button variant="secondary" icon={<Download size={16} />}>
                        Export
                    </Button>
                    <Button variant="primary" icon={<BarChart3 size={16} />}>
                        Run Analysis
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="utilization__metrics">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon
                    return (
                        <motion.div
                            key={metric.category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className={`utilization-metric ${metric.variance > 0 && metric.category !== 'Readmission Rate' ? 'warning' : 'success'}`}>
                                <div className="utilization-metric__header">
                                    <div className="utilization-metric__icon">
                                        <Icon size={20} />
                                    </div>
                                    <div className={`utilization-metric__trend ${metric.trend}`}>
                                        {getTrendIcon(metric.trend)}
                                        <span>{Math.abs(metric.variance).toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div className="utilization-metric__value">
                                    {metric.current.toLocaleString()}
                                </div>
                                <div className="utilization-metric__label">{metric.category}</div>
                                <div className="utilization-metric__benchmark">
                                    Benchmark: {metric.benchmark.toLocaleString()}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )
                })}
            </div>

            {/* Service Categories Table */}
            <GlassCard className="service-categories">
                <div className="service-categories__header">
                    <h3>Service Category Analysis</h3>
                    <div className="service-categories__actions">
                        <Button variant="ghost" size="sm" icon={<Filter size={14} />}>Filter</Button>
                    </div>
                </div>

                <table className="service-categories__table">
                    <thead>
                        <tr>
                            <th>Service Category</th>
                            <th>Admissions</th>
                            <th>Avg LOS</th>
                            <th>Total Cost</th>
                            <th>Per Member</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service, index) => (
                            <motion.tr
                                key={service.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <td className="service-name">{service.name}</td>
                                <td>{service.admissions.toLocaleString()}</td>
                                <td>{service.avgLos} days</td>
                                <td className="mono">{formatCurrency(service.cost)}</td>
                                <td className="mono">${service.perMember.toFixed(2)}</td>
                                <td>{getStatusBadge(service.status)}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td><strong>Total</strong></td>
                            <td><strong>{services.reduce((sum, s) => sum + s.admissions, 0).toLocaleString()}</strong></td>
                            <td>—</td>
                            <td className="mono"><strong>{formatCurrency(services.reduce((sum, s) => sum + s.cost, 0))}</strong></td>
                            <td className="mono"><strong>${services.reduce((sum, s) => sum + s.perMember, 0).toFixed(2)}</strong></td>
                            <td>—</td>
                        </tr>
                    </tfoot>
                </table>
            </GlassCard>

            {/* Insights */}
            <div className="utilization__insights">
                <GlassCard className="insight-card">
                    <div className="insight-card__icon success">
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="insight-card__content">
                        <h4>Readmission Rate Improvement</h4>
                        <p>Readmission rate decreased by 18% compared to benchmark, indicating effective care transitions.</p>
                    </div>
                </GlassCard>
                <GlassCard className="insight-card">
                    <div className="insight-card__icon warning">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="insight-card__content">
                        <h4>ED Utilization Alert</h4>
                        <p>Emergency department visits are 11.4% above target. Consider expanding urgent care access.</p>
                    </div>
                </GlassCard>
                <GlassCard className="insight-card">
                    <div className="insight-card__icon info">
                        <Target size={20} />
                    </div>
                    <div className="insight-card__content">
                        <h4>Cost Opportunity</h4>
                        <p>Shifting 10% of ED visits to urgent care could save approximately $568K annually.</p>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default UtilizationManagement
