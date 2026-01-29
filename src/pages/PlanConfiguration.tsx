import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FileText,
    CheckCircle2,
    Settings,
    Calendar,
    DollarSign,
    Network,
    Building2,
    Upload,
    ChevronRight,
    Eye,
    Edit2,
    Search,
    Filter,
    Plus,
    AlertCircle
} from 'lucide-react'
import { GlassCard, Button, Badge, MetricCard } from '../components/common'

// Mock plan catalog data
const plans = [
    { id: 1, name: 'Gold PPO 500', carrier: 'Blue Shield', type: 'Medical', status: 'active', lives: 3420, lastUpdated: '2024-01-15' },
    { id: 2, name: 'Gold PPO 1000', carrier: 'Blue Shield', type: 'Medical', status: 'active', lives: 2180, lastUpdated: '2024-01-15' },
    { id: 3, name: 'Silver HMO', carrier: 'Kaiser', type: 'Medical', status: 'pending', lives: 0, lastUpdated: '2024-01-20' },
    { id: 4, name: 'Delta Dental PPO', carrier: 'Delta Dental', type: 'Dental', status: 'active', lives: 4850, lastUpdated: '2024-01-10' },
    { id: 5, name: 'VSP Vision Choice', carrier: 'VSP', type: 'Vision', status: 'active', lives: 4200, lastUpdated: '2024-01-10' },
]

const configSections = [
    { id: 'intake', label: 'Plan Data Intake', icon: Upload, description: 'Upload or import plan data' },
    { id: 'validation', label: 'Plan Validation', icon: CheckCircle2, description: 'Validate by product type' },
    { id: 'attributes', label: 'Benefit Attributes', icon: Settings, description: 'Configure deductibles, copays, OOP' },
    { id: 'effective', label: 'Effective Dates', icon: Calendar, description: 'Manage plan effective dates' },
    { id: 'rating', label: 'Rate Banding', icon: DollarSign, description: 'Configure age/geo rating' },
    { id: 'network', label: 'Network Association', icon: Network, description: 'Associate provider networks' },
    { id: 'documents', label: 'Plan Documents', icon: FileText, description: 'SBC, SPD, EOC management' },
    { id: 'visibility', label: 'Plan Visibility', icon: Eye, description: 'Portal access controls' },
]

export function PlanConfiguration() {
    const [activeSection, setActiveSection] = useState('intake')
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div style={{ padding: 'var(--space-2xl)', background: 'var(--apex-obsidian)', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2xl)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--apex-white)', margin: 0 }}>Plan & Benefit Configuration</h1>
                    <p style={{ fontSize: 'var(--text-base)', color: 'var(--apex-steel)' }}>
                        Intake, validate, and manage plan data, options, benefit structures, and rates
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <Button variant="ghost" size="sm">
                        <Upload size={16} />
                        Import Plans
                    </Button>
                    <Button variant="primary" size="sm">
                        <Plus size={16} />
                        New Plan
                    </Button>
                </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                <MetricCard label="Total Plans" value="127" icon={<FileText size={20} />} />
                <MetricCard label="Active" value="98" icon={<CheckCircle2 size={20} />} iconColor="#10B981" />
                <MetricCard label="Pending Validation" value="12" icon={<AlertCircle size={20} />} iconColor="#F59E0B" />
                <MetricCard label="Carriers" value="14" icon={<Building2 size={20} />} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-xl)' }}>
                {/* Config Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    {configSections.map((section) => (
                        <motion.button
                            key={section.id}
                            whileHover={{ x: 4 }}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-md)',
                                padding: 'var(--space-md)',
                                background: activeSection === section.id ? 'rgba(6,182,212,0.1)' : 'transparent',
                                border: '1px solid',
                                borderColor: activeSection === section.id ? 'rgba(6,182,212,0.3)' : 'transparent',
                                borderRadius: 'var(--radius-lg)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: 36, height: 36,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: activeSection === section.id ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.05)',
                                borderRadius: 'var(--radius-md)',
                                color: activeSection === section.id ? 'var(--apex-teal)' : 'var(--apex-steel)'
                            }}>
                                <section.icon size={16} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: activeSection === section.id ? 'var(--apex-white)' : 'var(--apex-silver)', fontWeight: 500, fontSize: 'var(--text-sm)' }}>{section.label}</div>
                                <div style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-xs)' }}>{section.description}</div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Main Content */}
                <div>
                    {/* Search & Filter */}
                    <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--apex-steel)' }} />
                            <input
                                type="text"
                                placeholder="Search plans..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 40px',
                                    background: 'var(--apex-obsidian-elevated)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--apex-white)',
                                    fontSize: 'var(--text-sm)'
                                }}
                            />
                        </div>
                        <Button variant="ghost" size="sm"><Filter size={16} /> Filter</Button>
                    </div>

                    {/* Plan Catalog */}
                    <GlassCard>
                        <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--apex-white)', margin: 0 }}>Product Catalog</h2>
                            <Badge variant="info">{plans.length} plans</Badge>
                        </div>
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', padding: 'var(--space-md) var(--space-lg)', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase' }}>Plan</span>
                                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase' }}>Type</span>
                                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase' }}>Lives</span>
                                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase' }}>Status</span>
                                <span></span>
                            </div>
                            {plans.map((plan, i) => (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
                                        padding: 'var(--space-md) var(--space-lg)',
                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div>
                                        <div style={{ color: 'var(--apex-white)', fontWeight: 500 }}>{plan.name}</div>
                                        <div style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-xs)' }}>{plan.carrier}</div>
                                    </div>
                                    <Badge variant={plan.type === 'Medical' ? 'teal' : plan.type === 'Dental' ? 'success' : 'info'}>
                                        {plan.type}
                                    </Badge>
                                    <span style={{ color: 'var(--apex-silver)', fontFamily: 'var(--font-mono)' }}>
                                        {plan.lives.toLocaleString()}
                                    </span>
                                    <Badge variant={plan.status === 'active' ? 'success' : 'warning'}>
                                        {plan.status}
                                    </Badge>
                                    <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                                        <button style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'var(--apex-steel)', cursor: 'pointer' }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'var(--apex-steel)', cursor: 'pointer' }}>
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}

export default PlanConfiguration
