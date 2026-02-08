import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Package, Shield, Activity, Users, CreditCard, FileText,
    Brain, Phone, BarChart3, Settings, Zap, CheckCircle2,
    AlertTriangle, XCircle, ToggleLeft, ToggleRight, Lock,
    Eye, Download, Search, ChevronDown, ChevronUp,
    Database, Clock, Layers, Grid3x3, Star, TrendingUp,
    Stethoscope, Scale, Pill, Headphones
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './ModuleLicensing.css'

// ============================================================================
// MODULE LICENSING - Module Activation/Deactivation
// Manage platform modules, dependencies, and usage metrics
// ============================================================================

interface Module {
    id: string
    name: string
    description: string
    icon: typeof Package
    iconColor: string
    status: 'active' | 'inactive'
    featureCount: number
    dependencies: string[]
    dependents: string[]
    apiCalls: string
    activeUsers: number
    storage: string
    tier: 'core' | 'professional' | 'enterprise'
    price?: string
}

const modules: Module[] = [
    {
        id: 'claims', name: 'Claims Processing', description: 'End-to-end claims adjudication, auto-adjudication rules, and payment processing with EDI 837/835 support.',
        icon: CreditCard, iconColor: '#14b8a6', status: 'active', featureCount: 24,
        dependencies: [], dependents: ['analytics', 'billing', 'appeals'],
        apiCalls: '45.2K/day', activeUsers: 156, storage: '12.4 GB', tier: 'core'
    },
    {
        id: 'eligibility', name: 'Eligibility & Enrollment', description: 'Real-time eligibility verification, member enrollment, and coverage management with FHIR R4 integration.',
        icon: Shield, iconColor: '#3b82f6', status: 'active', featureCount: 18,
        dependencies: [], dependents: ['claims', 'prior-auth', 'member-portal'],
        apiCalls: '28.7K/day', activeUsers: 234, storage: '8.2 GB', tier: 'core'
    },
    {
        id: 'prior-auth', name: 'Prior Authorization', description: 'AI-powered prior authorization workflow with clinical decision support and Da Vinci PAS compliance.',
        icon: FileText, iconColor: '#8b5cf6', status: 'active', featureCount: 16,
        dependencies: ['eligibility', 'provider-network'], dependents: ['analytics'],
        apiCalls: '12.3K/day', activeUsers: 89, storage: '4.1 GB', tier: 'professional'
    },
    {
        id: 'provider-network', name: 'Provider Network', description: 'Provider credentialing, directory management, network adequacy analysis, and fee schedule management.',
        icon: Stethoscope, iconColor: '#06b6d4', status: 'active', featureCount: 22,
        dependencies: [], dependents: ['prior-auth', 'claims'],
        apiCalls: '8.9K/day', activeUsers: 67, storage: '6.7 GB', tier: 'core'
    },
    {
        id: 'analytics', name: 'Advanced Analytics', description: 'Executive dashboards, actuarial tools, PMPM analysis, MLR reporting, and predictive modeling.',
        icon: BarChart3, iconColor: '#f59e0b', status: 'active', featureCount: 30,
        dependencies: ['claims', 'eligibility'], dependents: [],
        apiCalls: '15.1K/day', activeUsers: 45, storage: '22.8 GB', tier: 'professional'
    },
    {
        id: 'ai-copilot', name: 'AI Copilot', description: 'Gemini-powered AI assistant for claims review, document analysis, coding suggestions, and member support.',
        icon: Brain, iconColor: '#ec4899', status: 'active', featureCount: 12,
        dependencies: [], dependents: ['voice-agents'],
        apiCalls: '7.5K/day', activeUsers: 178, storage: '2.1 GB', tier: 'enterprise', price: '$2,500/mo'
    },
    {
        id: 'voice-agents', name: 'Voice AI Agents', description: 'Intelligent voice agents for member service, provider support, and outreach campaigns with NLU/NLP.',
        icon: Headphones, iconColor: '#7c3aed', status: 'active', featureCount: 14,
        dependencies: ['ai-copilot'], dependents: [],
        apiCalls: '22.4K/day', activeUsers: 3, storage: '5.3 GB', tier: 'enterprise', price: '$3,000/mo'
    },
    {
        id: 'billing', name: 'Premium Billing', description: 'Member premium billing, payment processing, dunning management, and reconciliation.',
        icon: CreditCard, iconColor: '#22c55e', status: 'active', featureCount: 15,
        dependencies: ['claims'], dependents: [],
        apiCalls: '6.2K/day', activeUsers: 34, storage: '3.8 GB', tier: 'professional'
    },
    {
        id: 'compliance', name: 'Compliance Center', description: 'HIPAA compliance monitoring, audit trail, breach response, data retention policies, and regulatory reporting.',
        icon: Scale, iconColor: '#ef4444', status: 'active', featureCount: 20,
        dependencies: [], dependents: [],
        apiCalls: '3.4K/day', activeUsers: 12, storage: '18.2 GB', tier: 'core'
    },
    {
        id: 'appeals', name: 'Appeals & Grievances', description: 'Member appeals workflow, grievance tracking, external review management, and outcome reporting.',
        icon: FileText, iconColor: '#64748b', status: 'inactive', featureCount: 11,
        dependencies: ['claims'], dependents: [],
        apiCalls: '0', activeUsers: 0, storage: '0 GB', tier: 'professional'
    },
]

interface DependencyWarning {
    show: boolean
    module: Module | null
    affectedModules: string[]
}

export default function ModuleLicensing() {
    const [moduleList, setModuleList] = useState<Module[]>(modules)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterTier, setFilterTier] = useState<string>('all')
    const [showComparison, setShowComparison] = useState(false)
    const [warning, setWarning] = useState<DependencyWarning>({ show: false, module: null, affectedModules: [] })

    const toggleModule = useCallback((moduleId: string) => {
        const mod = moduleList.find(m => m.id === moduleId)
        if (!mod) return

        // If deactivating, check dependents
        if (mod.status === 'active' && mod.dependents.length > 0) {
            const activeDependents = mod.dependents.filter(depId =>
                moduleList.find(m => m.id === depId)?.status === 'active'
            )
            if (activeDependents.length > 0) {
                setWarning({
                    show: true,
                    module: mod,
                    affectedModules: activeDependents.map(id => moduleList.find(m => m.id === id)?.name || id)
                })
                return
            }
        }

        // If activating, check dependencies
        if (mod.status === 'inactive' && mod.dependencies.length > 0) {
            const inactiveDeps = mod.dependencies.filter(depId =>
                moduleList.find(m => m.id === depId)?.status === 'inactive'
            )
            if (inactiveDeps.length > 0) {
                // Auto-activate dependencies
                setModuleList(prev => prev.map(m =>
                    inactiveDeps.includes(m.id) ? { ...m, status: 'active' as const } : m
                ))
            }
        }

        setModuleList(prev => prev.map(m =>
            m.id === moduleId ? { ...m, status: m.status === 'active' ? 'inactive' as const : 'active' as const } : m
        ))
    }, [moduleList])

    const confirmDeactivation = useCallback(() => {
        if (!warning.module) return
        const moduleId = warning.module.id
        // Deactivate dependents first
        const depIds = warning.module.dependents
        setModuleList(prev => prev.map(m =>
            m.id === moduleId || depIds.includes(m.id)
                ? { ...m, status: 'inactive' as const }
                : m
        ))
        setWarning({ show: false, module: null, affectedModules: [] })
    }, [warning])

    const getTierBadge = (tier: Module['tier']) => {
        switch (tier) {
            case 'core': return <Badge variant="teal" size="sm">Core</Badge>
            case 'professional': return <Badge variant="purple" size="sm">Professional</Badge>
            case 'enterprise': return <Badge variant="warning" size="sm" icon={<Star size={10} />}>Enterprise</Badge>
        }
    }

    const activeModules = moduleList.filter(m => m.status === 'active')
    const totalApiCalls = '149.7K'
    const totalStorage = '83.6 GB'

    const filteredModules = moduleList.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTier = filterTier === 'all' || m.tier === filterTier
        return matchesSearch && matchesTier
    })

    return (
        <div className="module-licensing">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="ml-header">
                    <div>
                        <h1 className="ml-title">
                            <Layers size={28} />
                            Module Licensing
                            <Badge variant="teal" icon={<CheckCircle2 size={10} />}>{activeModules.length} Active</Badge>
                        </h1>
                        <p className="ml-subtitle">Activate, deactivate, and manage platform modules for your organization</p>
                    </div>
                    <div className="ml-header-actions">
                        <Button
                            variant="secondary"
                            icon={<Grid3x3 size={16} />}
                            onClick={() => setShowComparison(!showComparison)}
                        >
                            {showComparison ? 'Hide' : 'Show'} Comparison
                        </Button>
                        <Button variant="primary" icon={<Download size={16} />}>Export License Report</Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="ml-kpis">
                    <MetricCard
                        label="Active Modules"
                        value={`${activeModules.length}/${moduleList.length}`}
                        icon={<Package size={20} />}
                        subtitle="Modules activated"
                        variant="success"
                    />
                    <MetricCard
                        label="Total API Calls"
                        value={totalApiCalls}
                        icon={<Activity size={20} />}
                        change={14.2}
                        subtitle="Across all modules"
                    />
                    <MetricCard
                        label="Active Users"
                        value="818"
                        icon={<Users size={20} />}
                        change={6.8}
                        subtitle="Unique this month"
                    />
                    <MetricCard
                        label="Storage Used"
                        value={totalStorage}
                        icon={<Database size={20} />}
                        subtitle="of 200 GB allocated"
                    />
                </div>

                {/* Filters */}
                <div className="ml-filters">
                    <div className="ml-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search modules..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="ml-tier-filters">
                        {['all', 'core', 'professional', 'enterprise'].map(tier => (
                            <button
                                key={tier}
                                className={`ml-tier-btn ${filterTier === tier ? 'active' : ''}`}
                                onClick={() => setFilterTier(tier)}
                            >
                                {tier === 'all' ? 'All Tiers' : tier.charAt(0).toUpperCase() + tier.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Module Grid */}
                <div className="ml-modules-grid">
                    {filteredModules.map((mod, index) => {
                        const Icon = mod.icon
                        return (
                            <motion.div
                                key={mod.id}
                                className={`ml-module-card ${mod.status}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="ml-module-header">
                                    <div className="ml-module-icon" style={{ background: `${mod.iconColor}15`, color: mod.iconColor }}>
                                        <Icon size={22} />
                                    </div>
                                    <div className="ml-module-info">
                                        <span className="ml-module-name">{mod.name}</span>
                                        <div className="ml-module-badges">
                                            {getTierBadge(mod.tier)}
                                            <Badge variant={mod.status === 'active' ? 'success' : 'default'} size="sm">
                                                {mod.featureCount} features
                                            </Badge>
                                        </div>
                                    </div>
                                    <button
                                        className={`ml-toggle ${mod.status === 'active' ? 'on' : 'off'}`}
                                        onClick={() => toggleModule(mod.id)}
                                        title={mod.status === 'active' ? 'Deactivate' : 'Activate'}
                                    >
                                        {mod.status === 'active' ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                    </button>
                                </div>

                                <p className="ml-module-desc">{mod.description}</p>

                                {mod.dependencies.length > 0 && (
                                    <div className="ml-dependencies">
                                        <Lock size={10} />
                                        <span>Requires: {mod.dependencies.map(d => moduleList.find(m => m.id === d)?.name).join(', ')}</span>
                                    </div>
                                )}

                                {mod.status === 'active' && (
                                    <div className="ml-module-metrics">
                                        <div className="ml-mod-metric">
                                            <Zap size={12} />
                                            <span>{mod.apiCalls}</span>
                                        </div>
                                        <div className="ml-mod-metric">
                                            <Users size={12} />
                                            <span>{mod.activeUsers} users</span>
                                        </div>
                                        <div className="ml-mod-metric">
                                            <Database size={12} />
                                            <span>{mod.storage}</span>
                                        </div>
                                    </div>
                                )}

                                {mod.price && (
                                    <div className="ml-module-price">
                                        <span>{mod.price}</span>
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>

                {/* Module Comparison Table */}
                <AnimatePresence>
                    {showComparison && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <GlassCard className="ml-comparison">
                                <h3 className="ml-section-title">
                                    <Grid3x3 size={18} />
                                    Module Comparison
                                </h3>
                                <div className="ml-comparison-table">
                                    <div className="ml-comp-header">
                                        <span>Module</span>
                                        <span>Status</span>
                                        <span>Tier</span>
                                        <span>Features</span>
                                        <span>API Calls</span>
                                        <span>Users</span>
                                        <span>Storage</span>
                                    </div>
                                    {moduleList.map((mod) => (
                                        <div key={mod.id} className={`ml-comp-row ${mod.status}`}>
                                            <span className="ml-comp-name">{mod.name}</span>
                                            <span>
                                                <Badge variant={mod.status === 'active' ? 'success' : 'default'} size="sm">
                                                    {mod.status}
                                                </Badge>
                                            </span>
                                            <span>{getTierBadge(mod.tier)}</span>
                                            <span>{mod.featureCount}</span>
                                            <span>{mod.apiCalls}</span>
                                            <span>{mod.activeUsers}</span>
                                            <span>{mod.storage}</span>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dependency Warning Modal */}
                <AnimatePresence>
                    {warning.show && (
                        <motion.div
                            className="ml-warning-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setWarning({ show: false, module: null, affectedModules: [] })}
                        >
                            <motion.div
                                className="ml-warning-modal"
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="ml-warning-icon">
                                    <AlertTriangle size={36} />
                                </div>
                                <h3>Dependency Warning</h3>
                                <p>
                                    Deactivating <strong>{warning.module?.name}</strong> will also deactivate
                                    the following dependent modules:
                                </p>
                                <div className="ml-warning-deps">
                                    {warning.affectedModules.map(name => (
                                        <Badge key={name} variant="warning" size="sm" icon={<AlertTriangle size={10} />}>
                                            {name}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="ml-warning-actions">
                                    <Button variant="ghost" onClick={() => setWarning({ show: false, module: null, affectedModules: [] })}>
                                        Cancel
                                    </Button>
                                    <Button variant="danger" icon={<XCircle size={16} />} onClick={confirmDeactivation}>
                                        Deactivate All
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
