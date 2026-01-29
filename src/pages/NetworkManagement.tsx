import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Network,
    Building2,
    MapPin,
    Users,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Search,
    Filter,
    Download,
    Plus,
    Edit3,
    Trash2,
    Globe,
    Shield,
    Star
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './NetworkManagement.css'

interface NetworkTier {
    id: string
    name: string
    type: 'preferred' | 'standard' | 'basic' | 'out_of_network'
    providerCount: number
    states: number
    avgDiscount: number
    memberAccess: number
    status: 'active' | 'pending' | 'inactive'
}

interface ProviderNetwork {
    id: string
    name: string
    specialty: string
    location: string
    tier: 'preferred' | 'standard' | 'basic'
    npi: string
    contractEnd: string
    qualityScore: number
    status: 'active' | 'pending_renewal' | 'terminated'
}

const networkTiers: NetworkTier[] = [
    { id: 'tier-1', name: 'Preferred Plus Network', type: 'preferred', providerCount: 12500, states: 45, avgDiscount: 45, memberAccess: 92, status: 'active' },
    { id: 'tier-2', name: 'Standard Care Network', type: 'standard', providerCount: 28000, states: 50, avgDiscount: 32, memberAccess: 98, status: 'active' },
    { id: 'tier-3', name: 'Value Network', type: 'basic', providerCount: 8500, states: 30, avgDiscount: 25, memberAccess: 75, status: 'active' }
]

const networkProviders: ProviderNetwork[] = [
    { id: 'prov-1', name: 'Premier Medical Associates', specialty: 'Multi-Specialty', location: 'Los Angeles, CA', tier: 'preferred', npi: '1234567890', contractEnd: '2025-12-31', qualityScore: 4.8, status: 'active' },
    { id: 'prov-2', name: 'Heart Care Institute', specialty: 'Cardiology', location: 'New York, NY', tier: 'preferred', npi: '0987654321', contractEnd: '2025-06-30', qualityScore: 4.9, status: 'active' },
    { id: 'prov-3', name: 'Community Health Center', specialty: 'Primary Care', location: 'Chicago, IL', tier: 'standard', npi: '1122334455', contractEnd: '2024-03-15', qualityScore: 4.5, status: 'pending_renewal' },
    { id: 'prov-4', name: 'Valley Orthopedics', specialty: 'Orthopedics', location: 'Phoenix, AZ', tier: 'standard', npi: '5544332211', contractEnd: '2025-09-30', qualityScore: 4.6, status: 'active' }
]

export function NetworkManagement() {
    const [tiers] = useState<NetworkTier[]>(networkTiers)
    const [providers] = useState<ProviderNetwork[]>(networkProviders)
    const [activeView, setActiveView] = useState<'tiers' | 'providers'>('tiers')

    const getTierBadge = (tier: string) => {
        switch (tier) {
            case 'preferred': return <Badge variant="teal" icon={<Star size={10} />}>Preferred</Badge>
            case 'standard': return <Badge variant="info">Standard</Badge>
            case 'basic': return <Badge variant="warning">Basic</Badge>
            default: return <Badge variant="info">{tier}</Badge>
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Active</Badge>
            case 'pending_renewal': return <Badge variant="warning" icon={<AlertCircle size={10} />}>Renewal Due</Badge>
            case 'terminated': return <Badge variant="critical">Terminated</Badge>
            case 'pending': return <Badge variant="warning">Pending</Badge>
            case 'inactive': return <Badge variant="info">Inactive</Badge>
            default: return <Badge variant="info">{status}</Badge>
        }
    }

    return (
        <div className="network-management-page">
            {/* Header */}
            <div className="network-management__header">
                <div>
                    <h1 className="network-management__title">Network Management</h1>
                    <p className="network-management__subtitle">
                        Configure provider networks, tiers, and contract management
                    </p>
                </div>
                <div className="network-management__actions">
                    <Button variant="secondary" icon={<Download size={16} />}>
                        Export Directory
                    </Button>
                    <Button variant="primary" icon={<Plus size={16} />}>
                        Add Network
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="network-management__overview">
                <MetricCard
                    title="Total Providers"
                    value="49,000+"
                    change={{ value: 5.2, type: 'increase' }}
                    icon={<Users size={20} />}
                />
                <MetricCard
                    title="Network Coverage"
                    value="50 States"
                    icon={<Globe size={20} />}
                />
                <MetricCard
                    title="Avg. Discount"
                    value="34%"
                    change={{ value: 2.1, type: 'increase' }}
                    icon={<TrendingUp size={20} />}
                />
                <MetricCard
                    title="Quality Score"
                    value="4.7/5.0"
                    change={{ value: 0.3, type: 'increase' }}
                    icon={<Star size={20} />}
                />
            </div>

            {/* View Tabs */}
            <div className="network-management__tabs">
                <button
                    className={`network-management__tab ${activeView === 'tiers' ? 'active' : ''}`}
                    onClick={() => setActiveView('tiers')}
                >
                    <Network size={16} /> Network Tiers
                </button>
                <button
                    className={`network-management__tab ${activeView === 'providers' ? 'active' : ''}`}
                    onClick={() => setActiveView('providers')}
                >
                    <Building2 size={16} /> Provider Contracts
                </button>
            </div>

            {/* Network Tiers View */}
            {activeView === 'tiers' && (
                <div className="network-tiers">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className={`network-tier-card network-tier-card--${tier.type}`}>
                                <div className="network-tier-card__header">
                                    <div className="network-tier-card__title">
                                        <h3>{tier.name}</h3>
                                        {getTierBadge(tier.type)}
                                    </div>
                                    <div className="network-tier-card__actions">
                                        <Button variant="ghost" size="sm" icon={<Edit3 size={14} />}>Edit</Button>
                                    </div>
                                </div>

                                <div className="network-tier-card__stats">
                                    <div className="network-tier-stat">
                                        <Users size={16} />
                                        <div className="network-tier-stat__info">
                                            <span className="network-tier-stat__value">{tier.providerCount.toLocaleString()}</span>
                                            <span className="network-tier-stat__label">Providers</span>
                                        </div>
                                    </div>
                                    <div className="network-tier-stat">
                                        <Globe size={16} />
                                        <div className="network-tier-stat__info">
                                            <span className="network-tier-stat__value">{tier.states}</span>
                                            <span className="network-tier-stat__label">States</span>
                                        </div>
                                    </div>
                                    <div className="network-tier-stat">
                                        <TrendingUp size={16} />
                                        <div className="network-tier-stat__info">
                                            <span className="network-tier-stat__value">{tier.avgDiscount}%</span>
                                            <span className="network-tier-stat__label">Avg Discount</span>
                                        </div>
                                    </div>
                                    <div className="network-tier-stat">
                                        <Shield size={16} />
                                        <div className="network-tier-stat__info">
                                            <span className="network-tier-stat__value">{tier.memberAccess}%</span>
                                            <span className="network-tier-stat__label">Member Access</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="network-tier-card__footer">
                                    {getStatusBadge(tier.status)}
                                    <Button variant="secondary" size="sm">View Providers</Button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Provider Contracts View */}
            {activeView === 'providers' && (
                <GlassCard className="provider-contracts">
                    <div className="provider-contracts__header">
                        <h3>Provider Contracts</h3>
                        <div className="provider-contracts__filters">
                            <div className="provider-contracts__search">
                                <Search size={16} />
                                <input type="text" placeholder="Search providers..." />
                            </div>
                            <Button variant="ghost" size="sm" icon={<Filter size={14} />}>Filter</Button>
                        </div>
                    </div>

                    <table className="provider-contracts__table">
                        <thead>
                            <tr>
                                <th>Provider</th>
                                <th>Specialty</th>
                                <th>Location</th>
                                <th>Network Tier</th>
                                <th>NPI</th>
                                <th>Contract End</th>
                                <th>Quality</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {providers.map((provider) => (
                                <tr key={provider.id}>
                                    <td className="provider-name">{provider.name}</td>
                                    <td>{provider.specialty}</td>
                                    <td><MapPin size={12} /> {provider.location}</td>
                                    <td>{getTierBadge(provider.tier)}</td>
                                    <td className="mono">{provider.npi}</td>
                                    <td>{new Date(provider.contractEnd).toLocaleDateString()}</td>
                                    <td>
                                        <span className="quality-score">
                                            <Star size={12} /> {provider.qualityScore}
                                        </span>
                                    </td>
                                    <td>{getStatusBadge(provider.status)}</td>
                                    <td>
                                        <div className="table-actions">
                                            <Button variant="ghost" size="sm" icon={<Edit3 size={12} />} />
                                            <Button variant="ghost" size="sm" icon={<Trash2 size={12} />} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </GlassCard>
            )}
        </div>
    )
}

export default NetworkManagement
