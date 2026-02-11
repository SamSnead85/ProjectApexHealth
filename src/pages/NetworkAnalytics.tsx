import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Network,
    Building2,
    MapPin,
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Star,
    Clock,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    ChevronRight,
    Download,
    RefreshCw,
    Filter,
    Search,
    BarChart3,
    PieChart,
    Target,
    Award,
    Activity,
    Heart,
    Stethoscope,
    ArrowUpRight,
    ArrowDownRight,
    Percent,
    Map,
    Phone
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import { useToast } from '../components/common/Toast'
import { exportToCSV } from '../utils/exportData'
import './NetworkAnalytics.css'

// Types
interface Provider {
    id: string
    name: string
    specialty: string
    tier: 'preferred' | 'standard' | 'out-of-network'
    location: string
    qualityScore: number
    costIndex: number
    utilizationRate: number
    patientCount: number
    avgReimbursement: number
    status: 'active' | 'pending' | 'terminated'
}

interface NetworkMetric {
    label: string
    value: string | number
    change: number
    trend: 'up' | 'down' | 'neutral'
    icon: React.ElementType
    color: string
}

interface SpecialtyBreakdown {
    specialty: string
    providerCount: number
    patientVolume: number
    avgCost: number
    qualityScore: number
    adequacy: 'adequate' | 'marginal' | 'deficient'
}

interface GeographicCoverage {
    region: string
    providerCount: number
    memberCount: number
    ratio: number
    status: 'good' | 'fair' | 'poor'
}

// Mock Data
const networkMetrics: NetworkMetric[] = [
    { label: 'Total Providers', value: 8450, change: 4.2, trend: 'up', icon: Stethoscope, color: '#3B82F6' },
    { label: 'Network Adequacy', value: '96.2%', change: 1.5, trend: 'up', icon: CheckCircle2, color: '#10B981' },
    { label: 'Avg Quality Score', value: 4.2, change: 0.3, trend: 'up', icon: Star, color: '#F59E0B' },
    { label: 'Cost Efficiency', value: '12%', change: 3.8, trend: 'down', icon: DollarSign, color: '#8B5CF6' },
]

const providers: Provider[] = [
    { id: 'PRV-001', name: 'Summit Medical Group', specialty: 'Primary Care', tier: 'preferred', location: 'Downtown Metro', qualityScore: 4.8, costIndex: 0.92, utilizationRate: 85, patientCount: 2450, avgReimbursement: 185, status: 'active' },
    { id: 'PRV-002', name: 'Valley Cardiology Associates', specialty: 'Cardiology', tier: 'preferred', location: 'West Side', qualityScore: 4.6, costIndex: 1.05, utilizationRate: 78, patientCount: 890, avgReimbursement: 425, status: 'active' },
    { id: 'PRV-003', name: 'Northside Orthopedics', specialty: 'Orthopedics', tier: 'standard', location: 'North County', qualityScore: 4.2, costIndex: 1.12, utilizationRate: 65, patientCount: 650, avgReimbursement: 385, status: 'active' },
    { id: 'PRV-004', name: 'Metro Behavioral Health', specialty: 'Mental Health', tier: 'preferred', location: 'Central', qualityScore: 4.4, costIndex: 0.88, utilizationRate: 92, patientCount: 1280, avgReimbursement: 145, status: 'active' },
    { id: 'PRV-005', name: 'Coastal Imaging Center', specialty: 'Radiology', tier: 'standard', location: 'Beach Area', qualityScore: 3.9, costIndex: 1.18, utilizationRate: 72, patientCount: 520, avgReimbursement: 580, status: 'pending' },
    { id: 'PRV-006', name: 'Premier Surgery Center', specialty: 'Surgery', tier: 'preferred', location: 'Medical District', qualityScore: 4.7, costIndex: 0.95, utilizationRate: 68, patientCount: 340, avgReimbursement: 2850, status: 'active' },
]

const specialtyBreakdown: SpecialtyBreakdown[] = [
    { specialty: 'Primary Care', providerCount: 2450, patientVolume: 45000, avgCost: 185, qualityScore: 4.4, adequacy: 'adequate' },
    { specialty: 'Cardiology', providerCount: 380, patientVolume: 8500, avgCost: 425, qualityScore: 4.5, adequacy: 'adequate' },
    { specialty: 'Orthopedics', providerCount: 290, patientVolume: 6200, avgCost: 385, qualityScore: 4.1, adequacy: 'marginal' },
    { specialty: 'Mental Health', providerCount: 850, patientVolume: 12800, avgCost: 145, qualityScore: 4.2, adequacy: 'deficient' },
    { specialty: 'Radiology', providerCount: 180, patientVolume: 9400, avgCost: 320, qualityScore: 4.0, adequacy: 'adequate' },
    { specialty: 'Surgery', providerCount: 420, patientVolume: 3200, avgCost: 2850, qualityScore: 4.6, adequacy: 'adequate' },
]

const geographicCoverage: GeographicCoverage[] = [
    { region: 'Downtown Metro', providerCount: 2850, memberCount: 18500, ratio: 6.5, status: 'good' },
    { region: 'North County', providerCount: 1420, memberCount: 12200, ratio: 8.6, status: 'good' },
    { region: 'West Side', providerCount: 980, memberCount: 9800, ratio: 10.0, status: 'fair' },
    { region: 'East Valley', providerCount: 650, memberCount: 8400, ratio: 12.9, status: 'poor' },
    { region: 'South Bay', providerCount: 1180, memberCount: 7800, ratio: 6.6, status: 'good' },
]

// Utility functions
const formatCurrency = (value: number): string => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toLocaleString()}`
}

const getTierColor = (tier: string): string => {
    switch (tier) {
        case 'preferred': return '#10B981'
        case 'standard': return '#3B82F6'
        case 'out-of-network': return '#EF4444'
        default: return '#6B7280'
    }
}

// Components
const MetricCard = ({ metric, index }: { metric: NetworkMetric; index: number }) => {
    const Icon = metric.icon

    return (
        <motion.div
            className="network-metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <div className="network-metric-card__header">
                <div className="network-metric-card__icon" style={{ background: `${metric.color}15`, color: metric.color }}>
                    <Icon size={20} />
                </div>
                <div className={`network-metric-card__trend network-metric-card__trend--${metric.trend}`}>
                    {metric.trend === 'up' ? <ArrowUpRight size={14} /> : metric.trend === 'down' ? <ArrowDownRight size={14} /> : null}
                    <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
                </div>
            </div>
            <div className="network-metric-card__value">{metric.value}</div>
            <div className="network-metric-card__label">{metric.label}</div>
        </motion.div>
    )
}

const ProviderRow = ({ provider, index }: { provider: Provider; index: number }) => (
    <motion.div
        className="provider-row"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
    >
        <div className="provider-row__info">
            <span className="provider-row__name">{provider.name}</span>
            <span className="provider-row__id">{provider.id}</span>
        </div>
        <span className="provider-row__specialty">{provider.specialty}</span>
        <Badge
            variant={provider.tier === 'preferred' ? 'success' : provider.tier === 'standard' ? 'info' : 'critical'}
            size="sm"
        >
            {provider.tier}
        </Badge>
        <div className="provider-row__quality">
            <Star size={12} fill="#F59E0B" color="#F59E0B" />
            <span>{provider.qualityScore}</span>
        </div>
        <span className={`provider-row__cost ${provider.costIndex <= 1 ? 'low' : 'high'}`}>
            {(provider.costIndex * 100).toFixed(0)}%
        </span>
        <span className="provider-row__patients">{provider.patientCount.toLocaleString()}</span>
        <Button variant="ghost" size="sm">View</Button>
    </motion.div>
)

const SpecialtyCard = ({ specialty, index }: { specialty: SpecialtyBreakdown; index: number }) => (
    <motion.div
        className="specialty-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
    >
        <div className="specialty-card__header">
            <span className="specialty-card__name">{specialty.specialty}</span>
            <Badge
                variant={specialty.adequacy === 'adequate' ? 'success' : specialty.adequacy === 'marginal' ? 'warning' : 'critical'}
                size="sm"
            >
                {specialty.adequacy}
            </Badge>
        </div>
        <div className="specialty-card__stats">
            <div className="specialty-card__stat">
                <span>Providers</span>
                <strong>{specialty.providerCount.toLocaleString()}</strong>
            </div>
            <div className="specialty-card__stat">
                <span>Volume</span>
                <strong>{(specialty.patientVolume / 1000).toFixed(1)}K</strong>
            </div>
            <div className="specialty-card__stat">
                <span>Avg Cost</span>
                <strong>{formatCurrency(specialty.avgCost)}</strong>
            </div>
            <div className="specialty-card__stat">
                <span>Quality</span>
                <strong>{specialty.qualityScore} ★</strong>
            </div>
        </div>
    </motion.div>
)

const CoverageRow = ({ coverage, index }: { coverage: GeographicCoverage; index: number }) => (
    <motion.div
        className="coverage-row"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
    >
        <div className="coverage-row__region">
            <MapPin size={14} />
            <span>{coverage.region}</span>
        </div>
        <span className="coverage-row__providers">{coverage.providerCount.toLocaleString()}</span>
        <span className="coverage-row__members">{coverage.memberCount.toLocaleString()}</span>
        <div className="coverage-row__ratio">
            <div className="coverage-row__ratio-bar">
                <div
                    className="coverage-row__ratio-fill"
                    style={{
                        width: `${Math.min(100, (10 / coverage.ratio) * 100)}%`,
                        background: coverage.status === 'good' ? '#10B981' : coverage.status === 'fair' ? '#F59E0B' : '#EF4444'
                    }}
                />
            </div>
            <span>1:{coverage.ratio.toFixed(1)}</span>
        </div>
        <Badge
            variant={coverage.status === 'good' ? 'success' : coverage.status === 'fair' ? 'warning' : 'critical'}
            size="sm"
        >
            {coverage.status}
        </Badge>
    </motion.div>
)

export function NetworkAnalytics() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [tierFilter, setTierFilter] = useState('all')

    const filteredProviders = useMemo(() => {
        let provs = providers
        if (tierFilter !== 'all') {
            provs = provs.filter(p => p.tier === tierFilter)
        }
        if (searchTerm) {
            provs = provs.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.specialty.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        return provs
    }, [tierFilter, searchTerm])

    return (
        <div className="network-analytics">
            {/* Header */}
            <div className="network-analytics__header">
                <div className="network-analytics__header-content">
                    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        Network Analytics
                    </motion.h1>
                    <p>Provider Performance • Network Adequacy • Cost Optimization</p>
                </div>
                <div className="network-analytics__header-actions">
                    <Button variant="secondary" icon={<Download size={16} />} onClick={() => {
                        exportToCSV(providers.map(p => ({
                            'ID': p.id,
                            'Name': p.name,
                            'Specialty': p.specialty,
                            'Tier': p.tier,
                            'Location': p.location,
                            'Quality Score': p.qualityScore,
                            'Cost Index': p.costIndex,
                            'Utilization': `${p.utilizationRate}%`,
                            'Patients': p.patientCount,
                            'Avg Reimbursement': `$${p.avgReimbursement}`,
                            'Status': p.status,
                        })), 'network_analytics')
                        addToast({ type: 'success', title: 'Export Complete', message: 'Network data exported to CSV', duration: 3000 })
                    }}>Export</Button>
                    <Button variant="primary" icon={<RefreshCw size={16} />}>Refresh Data</Button>
                </div>
            </div>

            {/* Metrics */}
            <section className="network-analytics__metrics">
                {networkMetrics.map((metric, index) => (
                    <MetricCard key={metric.label} metric={metric} index={index} />
                ))}
            </section>

            {/* Main Grid */}
            <div className="network-analytics__grid">
                {/* Provider Directory */}
                <GlassCard className="network-analytics__card network-analytics__card--providers">
                    <div className="network-analytics__card-header">
                        <h3><Stethoscope size={18} /> Provider Directory</h3>
                        <div className="network-analytics__filters">
                            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
                                <option value="all">All Tiers</option>
                                <option value="preferred">Preferred</option>
                                <option value="standard">Standard</option>
                                <option value="out-of-network">Out of Network</option>
                            </select>
                            <div className="network-analytics__search">
                                <Search size={14} />
                                <input
                                    type="text"
                                    placeholder="Search providers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="network-analytics__provider-header">
                        <span>Provider</span>
                        <span>Specialty</span>
                        <span>Tier</span>
                        <span>Quality</span>
                        <span>Cost Index</span>
                        <span>Patients</span>
                        <span></span>
                    </div>
                    <div className="network-analytics__provider-list">
                        {filteredProviders.map((provider, index) => (
                            <ProviderRow key={provider.id} provider={provider} index={index} />
                        ))}
                    </div>
                </GlassCard>

                {/* Specialty Breakdown */}
                <GlassCard className="network-analytics__card network-analytics__card--specialties">
                    <div className="network-analytics__card-header">
                        <h3><Activity size={18} /> Specialty Adequacy</h3>
                    </div>
                    <div className="network-analytics__specialty-grid">
                        {specialtyBreakdown.map((specialty, index) => (
                            <SpecialtyCard key={specialty.specialty} specialty={specialty} index={index} />
                        ))}
                    </div>
                </GlassCard>

                {/* Geographic Coverage */}
                <GlassCard className="network-analytics__card network-analytics__card--coverage">
                    <div className="network-analytics__card-header">
                        <h3><Map size={18} /> Geographic Coverage</h3>
                    </div>
                    <div className="network-analytics__coverage-header">
                        <span>Region</span>
                        <span>Providers</span>
                        <span>Members</span>
                        <span>Ratio</span>
                        <span>Status</span>
                    </div>
                    <div className="network-analytics__coverage-list">
                        {geographicCoverage.map((coverage, index) => (
                            <CoverageRow key={coverage.region} coverage={coverage} index={index} />
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default NetworkAnalytics
