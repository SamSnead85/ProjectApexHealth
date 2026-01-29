import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Target,
    TrendingUp,
    TrendingDown,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Settings
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './KPITracking.css'

interface KPI {
    id: string
    name: string
    category: 'financial' | 'operational' | 'quality' | 'member'
    current: number
    target: number
    unit: string
    trend: 'up' | 'down' | 'neutral'
    changePercent: number
    status: 'on_track' | 'at_risk' | 'off_track'
}

const kpis: KPI[] = [
    { id: 'KPI-001', name: 'Medical Loss Ratio', category: 'financial', current: 82.3, target: 85, unit: '%', trend: 'down', changePercent: -1.2, status: 'on_track' },
    { id: 'KPI-002', name: 'Claims Processing Time', category: 'operational', current: 4.2, target: 5, unit: 'days', trend: 'down', changePercent: -8.5, status: 'on_track' },
    { id: 'KPI-003', name: 'Member Satisfaction', category: 'member', current: 4.2, target: 4.5, unit: '/5', trend: 'up', changePercent: 3.2, status: 'at_risk' },
    { id: 'KPI-004', name: 'First Call Resolution', category: 'operational', current: 87, target: 90, unit: '%', trend: 'up', changePercent: 2.1, status: 'at_risk' },
    { id: 'KPI-005', name: 'HEDIS Score', category: 'quality', current: 4.1, target: 4.0, unit: 'stars', trend: 'up', changePercent: 2.5, status: 'on_track' },
    { id: 'KPI-006', name: 'Denial Rate', category: 'operational', current: 8.2, target: 7, unit: '%', trend: 'down', changePercent: -2.1, status: 'at_risk' }
]

export function KPITracking() {
    const [allKPIs] = useState<KPI[]>(kpis)
    const [filterCategory, setFilterCategory] = useState('all')

    const getStatusBadge = (status: KPI['status']) => {
        switch (status) {
            case 'on_track': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>On Track</Badge>
            case 'at_risk': return <Badge variant="warning" icon={<AlertTriangle size={10} />}>At Risk</Badge>
            case 'off_track': return <Badge variant="critical">Off Track</Badge>
        }
    }

    const filteredKPIs = filterCategory === 'all'
        ? allKPIs
        : allKPIs.filter(k => k.category === filterCategory)

    const onTrackCount = allKPIs.filter(k => k.status === 'on_track').length
    const atRiskCount = allKPIs.filter(k => k.status === 'at_risk').length

    return (
        <div className="kpi-tracking-page">
            <div className="kpi__header">
                <div>
                    <h1 className="kpi__title">KPI Tracking</h1>
                    <p className="kpi__subtitle">Monitor organizational performance metrics</p>
                </div>
                <Button variant="secondary" icon={<Settings size={16} />}>Configure KPIs</Button>
            </div>

            <div className="kpi__stats">
                <GlassCard className="stat-card success">
                    <CheckCircle2 size={24} />
                    <div>
                        <span className="stat-value">{onTrackCount}</span>
                        <span className="stat-label">On Track</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card warning">
                    <AlertTriangle size={24} />
                    <div>
                        <span className="stat-value">{atRiskCount}</span>
                        <span className="stat-label">At Risk</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <Target size={24} />
                    <div>
                        <span className="stat-value">{allKPIs.length}</span>
                        <span className="stat-label">Total KPIs</span>
                    </div>
                </GlassCard>
            </div>

            <div className="kpi__filters">
                {['all', 'financial', 'operational', 'quality', 'member'].map(cat => (
                    <button
                        key={cat}
                        className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
                        onClick={() => setFilterCategory(cat)}
                    >
                        {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            <div className="kpi-grid">
                {filteredKPIs.map((kpi, index) => (
                    <motion.div
                        key={kpi.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <GlassCard className="kpi-card">
                            <div className="kpi-card__header">
                                <Badge variant="default" size="sm">{kpi.category}</Badge>
                                {getStatusBadge(kpi.status)}
                            </div>
                            <h4 className="kpi-card__name">{kpi.name}</h4>
                            <div className="kpi-card__value">
                                <span className="current">{kpi.current}{kpi.unit}</span>
                                <div className={`change ${kpi.trend === 'up' ? 'up' : 'down'}`}>
                                    {kpi.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {Math.abs(kpi.changePercent)}%
                                </div>
                            </div>
                            <div className="kpi-card__progress">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }} />
                                </div>
                                <div className="progress-labels">
                                    <span>0</span>
                                    <span>Target: {kpi.target}{kpi.unit}</span>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default KPITracking
