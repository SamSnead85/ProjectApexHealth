import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Activity,
    Target,
    BarChart3,
    PieChart,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { GlassCard, Badge } from '../components/common'
import './ExecutiveDashboards.css'

interface KPI {
    id: string
    name: string
    value: string
    change: number
    trend: 'up' | 'down' | 'neutral'
    target: string
    status: 'on_track' | 'at_risk' | 'off_track'
}

const kpis: KPI[] = [
    { id: 'revenue', name: 'Total Revenue', value: '$24.8M', change: 8.5, trend: 'up', target: '$25M', status: 'on_track' },
    { id: 'mlr', name: 'Medical Loss Ratio', value: '82.3%', change: -1.2, trend: 'down', target: '85%', status: 'on_track' },
    { id: 'membership', name: 'Total Membership', value: '125,340', change: 3.8, trend: 'up', target: '130,000', status: 'at_risk' },
    { id: 'satisfaction', name: 'Member Satisfaction', value: '4.2/5', change: 0.3, trend: 'up', target: '4.5/5', status: 'at_risk' },
    { id: 'claims', name: 'Claims Processed', value: '48,290', change: 12.1, trend: 'up', target: '50,000', status: 'on_track' },
    { id: 'denials', name: 'Denial Rate', value: '8.2%', change: -2.1, trend: 'down', target: '7%', status: 'at_risk' }
]

export function ExecutiveDashboards() {
    const getStatusBadge = (status: KPI['status']) => {
        switch (status) {
            case 'on_track': return <Badge variant="success">On Track</Badge>
            case 'at_risk': return <Badge variant="warning">At Risk</Badge>
            case 'off_track': return <Badge variant="critical">Off Track</Badge>
        }
    }

    return (
        <div className="executive-dashboards-page">
            {/* Header */}
            <div className="executive__header">
                <div>
                    <h1 className="executive__title">Executive Dashboard</h1>
                    <p className="executive__subtitle">
                        Real-time organizational performance metrics
                    </p>
                </div>
                <div className="period-selector">
                    <button className="period-btn active">MTD</button>
                    <button className="period-btn">QTD</button>
                    <button className="period-btn">YTD</button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="kpi-grid">
                {kpis.map((kpi, index) => (
                    <motion.div
                        key={kpi.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                    >
                        <GlassCard className="kpi-card">
                            <div className="kpi-card__header">
                                <span className="kpi-name">{kpi.name}</span>
                                {getStatusBadge(kpi.status)}
                            </div>
                            <div className="kpi-card__value">{kpi.value}</div>
                            <div className="kpi-card__footer">
                                <div className={`kpi-change ${kpi.trend === 'up' ? 'positive' : 'negative'}`}>
                                    {kpi.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    <span>{Math.abs(kpi.change)}%</span>
                                </div>
                                <div className="kpi-target">
                                    <Target size={12} />
                                    <span>Target: {kpi.target}</span>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                <GlassCard className="chart-card large">
                    <div className="chart-header">
                        <h3>Revenue Trend</h3>
                        <BarChart3 size={18} />
                    </div>
                    <div className="chart-placeholder">
                        <TrendingUp size={48} />
                        <span>Revenue by Month</span>
                    </div>
                </GlassCard>
                <GlassCard className="chart-card">
                    <div className="chart-header">
                        <h3>Membership Distribution</h3>
                        <PieChart size={18} />
                    </div>
                    <div className="chart-placeholder">
                        <Users size={48} />
                        <span>By Plan Type</span>
                    </div>
                </GlassCard>
            </div>

            {/* Bottom Row */}
            <div className="bottom-row">
                <GlassCard className="summary-card">
                    <div className="summary-header">
                        <DollarSign size={20} />
                        <h4>Financial Summary</h4>
                    </div>
                    <div className="summary-items">
                        <div className="summary-item">
                            <span>Premium Revenue</span>
                            <span className="value">$22.4M</span>
                        </div>
                        <div className="summary-item">
                            <span>Claims Paid</span>
                            <span className="value">$18.4M</span>
                        </div>
                        <div className="summary-item">
                            <span>Admin Costs</span>
                            <span className="value">$2.8M</span>
                        </div>
                        <div className="summary-item highlight">
                            <span>Net Income</span>
                            <span className="value positive">$1.2M</span>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="summary-card">
                    <div className="summary-header">
                        <Activity size={20} />
                        <h4>Operational Health</h4>
                    </div>
                    <div className="summary-items">
                        <div className="summary-item">
                            <span>Claims Turnaround</span>
                            <span className="value">4.2 days</span>
                        </div>
                        <div className="summary-item">
                            <span>Call Center Wait</span>
                            <span className="value">45 sec</span>
                        </div>
                        <div className="summary-item">
                            <span>Portal Uptime</span>
                            <span className="value">99.9%</span>
                        </div>
                        <div className="summary-item">
                            <span>First Call Resolution</span>
                            <span className="value">87%</span>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default ExecutiveDashboards
