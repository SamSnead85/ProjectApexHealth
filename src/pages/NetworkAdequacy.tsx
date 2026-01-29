import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    MapPin,
    Users,
    Building2,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    Filter,
    Download,
    Search
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './NetworkAdequacy.css'

interface NetworkMetric {
    specialty: string
    required: number
    current: number
    status: 'adequate' | 'marginal' | 'deficient'
    gap: number
}

interface GeographicArea {
    name: string
    county: string
    population: number
    providerCount: number
    status: 'adequate' | 'marginal' | 'deficient'
    ratio: string
}

const networkMetrics: NetworkMetric[] = [
    { specialty: 'Primary Care', required: 150, current: 178, status: 'adequate', gap: 0 },
    { specialty: 'Cardiology', required: 45, current: 42, status: 'marginal', gap: 3 },
    { specialty: 'Oncology', required: 30, current: 28, status: 'marginal', gap: 2 },
    { specialty: 'Pediatrics', required: 90, current: 95, status: 'adequate', gap: 0 },
    { specialty: 'Mental Health', required: 60, current: 45, status: 'deficient', gap: 15 },
    { specialty: 'OB/GYN', required: 50, current: 52, status: 'adequate', gap: 0 }
]

const geographicAreas: GeographicArea[] = [
    { name: 'Metro Central', county: 'Central County', population: 450000, providerCount: 285, status: 'adequate', ratio: '1:1,578' },
    { name: 'North District', county: 'North County', population: 180000, providerCount: 92, status: 'marginal', ratio: '1:1,956' },
    { name: 'South Valley', county: 'South County', population: 220000, providerCount: 78, status: 'deficient', ratio: '1:2,820' },
    { name: 'East Region', county: 'East County', population: 150000, providerCount: 98, status: 'adequate', ratio: '1:1,530' }
]

export function NetworkAdequacy() {
    const [selectedView, setSelectedView] = useState<'specialty' | 'geographic'>('specialty')

    const getStatusBadge = (status: 'adequate' | 'marginal' | 'deficient') => {
        switch (status) {
            case 'adequate': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Adequate</Badge>
            case 'marginal': return <Badge variant="warning">Marginal</Badge>
            case 'deficient': return <Badge variant="critical" icon={<AlertTriangle size={10} />}>Deficient</Badge>
        }
    }

    const adequateCount = networkMetrics.filter(m => m.status === 'adequate').length
    const deficientCount = networkMetrics.filter(m => m.status === 'deficient').length

    return (
        <div className="network-adequacy-page">
            {/* Header */}
            <div className="adequacy__header">
                <div>
                    <h1 className="adequacy__title">Network Adequacy</h1>
                    <p className="adequacy__subtitle">
                        Provider network analysis and gap reporting
                    </p>
                </div>
                <div className="adequacy__actions">
                    <Button variant="secondary" icon={<Download size={16} />}>Export Report</Button>
                </div>
            </div>

            {/* Stats */}
            <div className="adequacy__stats">
                <GlassCard className="stat-card success">
                    <CheckCircle2 size={24} />
                    <div>
                        <span className="stat-value">{adequateCount}</span>
                        <span className="stat-label">Adequate Specialties</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card warning">
                    <AlertTriangle size={24} />
                    <div>
                        <span className="stat-value">{networkMetrics.filter(m => m.status === 'marginal').length}</span>
                        <span className="stat-label">Marginal</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card critical">
                    <AlertTriangle size={24} />
                    <div>
                        <span className="stat-value">{deficientCount}</span>
                        <span className="stat-label">Deficient</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <TrendingUp size={24} />
                    <div>
                        <span className="stat-value">94.2%</span>
                        <span className="stat-label">Overall Score</span>
                    </div>
                </GlassCard>
            </div>

            {/* View Toggle */}
            <div className="adequacy__toggle">
                <button
                    className={`toggle-btn ${selectedView === 'specialty' ? 'active' : ''}`}
                    onClick={() => setSelectedView('specialty')}
                >
                    <Users size={16} /> By Specialty
                </button>
                <button
                    className={`toggle-btn ${selectedView === 'geographic' ? 'active' : ''}`}
                    onClick={() => setSelectedView('geographic')}
                >
                    <MapPin size={16} /> By Geography
                </button>
            </div>

            {/* Content */}
            {selectedView === 'specialty' ? (
                <GlassCard className="metrics-card">
                    <table className="metrics-table">
                        <thead>
                            <tr>
                                <th>Specialty</th>
                                <th>Required</th>
                                <th>Current</th>
                                <th>Gap</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {networkMetrics.map((metric, index) => (
                                <motion.tr
                                    key={metric.specialty}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <td className="specialty-name">{metric.specialty}</td>
                                    <td>{metric.required}</td>
                                    <td>{metric.current}</td>
                                    <td className={metric.gap > 0 ? 'gap-value' : ''}>{metric.gap > 0 ? `-${metric.gap}` : '—'}</td>
                                    <td>{getStatusBadge(metric.status)}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </GlassCard>
            ) : (
                <GlassCard className="geo-card">
                    <div className="geo-list">
                        {geographicAreas.map((area, index) => (
                            <motion.div
                                key={area.name}
                                className="geo-item"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="geo-item__info">
                                    <div className="geo-item__header">
                                        <MapPin size={16} />
                                        <span className="geo-name">{area.name}</span>
                                    </div>
                                    <span className="geo-county">{area.county}</span>
                                </div>
                                <div className="geo-item__stats">
                                    <div className="geo-stat">
                                        <span className="geo-stat-label">Population</span>
                                        <span className="geo-stat-value">{area.population.toLocaleString()}</span>
                                    </div>
                                    <div className="geo-stat">
                                        <span className="geo-stat-label">Providers</span>
                                        <span className="geo-stat-value">{area.providerCount}</span>
                                    </div>
                                    <div className="geo-stat">
                                        <span className="geo-stat-label">Ratio</span>
                                        <span className="geo-stat-value">{area.ratio}</span>
                                    </div>
                                </div>
                                {getStatusBadge(area.status)}
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            )}
        </div>
    )
}

export default NetworkAdequacy
