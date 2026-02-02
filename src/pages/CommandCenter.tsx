import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    LayoutGrid, Search, Bell, Settings, LogOut, ChevronRight, Sparkles,
    FileText, ClipboardCheck, AlertTriangle, CreditCard, Scale, FileCheck,
    Stethoscope, BadgeCheck, Network, DollarSign, Building2, Heart, User,
    Activity, Video, Pill, Brain, BarChart3, Users, TrendingUp, Award,
    Shield, ShieldCheck, Eye, Lock, Landmark, Database, Workflow, Server, Cpu,
    Calendar, MessageSquare, Clock, Star, Zap, Filter, Plus, Home
} from 'lucide-react'
import { GlassCard, Badge, Button, Input } from '../components/common'
import './CommandCenter.css'

// ============================================================================
// COMMAND CENTER - MODULAR ENTERPRISE DASHBOARD
// Role-based module visibility showcasing a la carte platform capabilities
// ============================================================================

// Module definitions with authorization levels
const allModules = {
    // Claims Intelligence
    claims: [
        { id: 'claims-processing', name: 'Claims Processing', path: '/claims', icon: FileText, desc: 'AI-powered adjudication engine', category: 'Claims Intelligence', color: 'cyan' },
        { id: 'prior-auth', name: 'Prior Authorization', path: '/prior-auth', icon: ClipboardCheck, desc: 'Intelligent pre-approval workflows', category: 'Claims Intelligence', color: 'cyan' },
        { id: 'fraud-detection', name: 'Fraud Detection', path: '/fraud-detection', icon: AlertTriangle, desc: 'ML anomaly detection', category: 'Claims Intelligence', color: 'cyan' },
        { id: 'payment-integrity', name: 'Payment Integrity', path: '/payment-processing', icon: CreditCard, desc: 'Error prevention system', category: 'Claims Intelligence', color: 'cyan' },
        { id: 'appeals', name: 'Appeals Management', path: '/appeals', icon: Scale, desc: 'Dispute resolution', category: 'Claims Intelligence', color: 'cyan' },
        { id: 'eob', name: 'EOB Viewer', path: '/eob', icon: FileCheck, desc: 'Explanation of benefits', category: 'Claims Intelligence', color: 'cyan' },
    ],
    // Provider Network
    provider: [
        { id: 'provider-directory', name: 'Provider Directory', path: '/providers', icon: Search, desc: 'Find in-network providers', category: 'Provider Network', color: 'violet' },
        { id: 'credentialing', name: 'Credentialing', path: '/credentialing', icon: BadgeCheck, desc: 'Provider verification', category: 'Provider Network', color: 'violet' },
        { id: 'network-adequacy', name: 'Network Adequacy', path: '/network-adequacy', icon: Network, desc: 'Coverage analysis', category: 'Provider Network', color: 'violet' },
        { id: 'fee-schedules', name: 'Fee Schedules', path: '/fee-schedule', icon: DollarSign, desc: 'Rate management', category: 'Provider Network', color: 'violet' },
        { id: 'provider-portal', name: 'Provider Portal', path: '/provider-portal', icon: Building2, desc: 'Self-service tools', category: 'Provider Network', color: 'violet' },
    ],
    // Member Experience
    member: [
        { id: 'member-360', name: 'Member 360', path: '/member-360', icon: User, desc: 'Unified member view', category: 'Member Experience', color: 'pink' },
        { id: 'benefits', name: 'Benefits Navigator', path: '/benefits', icon: Heart, desc: 'Coverage explorer', category: 'Member Experience', color: 'pink' },
        { id: 'care-journey', name: 'Care Journey', path: '/care-journey', icon: Activity, desc: 'Health timeline', category: 'Member Experience', color: 'pink' },
        { id: 'digital-id', name: 'Digital ID Card', path: '/digital-id', icon: CreditCard, desc: 'Mobile wallet ready', category: 'Member Experience', color: 'pink' },
        { id: 'hsa', name: 'HSA/FSA Wallet', path: '/hsa', icon: DollarSign, desc: 'Spending accounts', category: 'Member Experience', color: 'pink' },
        { id: 'telehealth', name: 'Telehealth', path: '/telehealth', icon: Video, desc: 'Virtual visits', category: 'Member Experience', color: 'pink' },
        { id: 'pharmacy', name: 'Pharmacy', path: '/pharmacy', icon: Pill, desc: 'Rx management', category: 'Member Experience', color: 'pink' },
    ],
    // Analytics & AI
    analytics: [
        { id: 'executive', name: 'Executive Dashboard', path: '/executive', icon: BarChart3, desc: 'C-suite insights', category: 'Analytics & AI', color: 'amber' },
        { id: 'advanced-analytics', name: 'Advanced Analytics', path: '/advanced-analytics', icon: Brain, desc: 'AI-powered analysis', category: 'Analytics & AI', color: 'amber' },
        { id: 'population-health', name: 'Population Health', path: '/population-health', icon: Users, desc: 'Cohort analytics', category: 'Analytics & AI', color: 'amber' },
        { id: 'claims-prediction', name: 'Claims Prediction', path: '/claims-prediction', icon: TrendingUp, desc: 'Forecasting engine', category: 'Analytics & AI', color: 'amber' },
        { id: 'value-based-care', name: 'Value-Based Care', path: '/value-based-care', icon: Award, desc: 'Quality metrics', category: 'Analytics & AI', color: 'amber' },
        { id: 'report-builder', name: 'Report Builder', path: '/report-builder', icon: FileText, desc: 'Custom reports', category: 'Analytics & AI', color: 'amber' },
    ],
    // Compliance & Security
    compliance: [
        { id: 'compliance-center', name: 'Compliance Center', path: '/compliance-center', icon: ShieldCheck, desc: 'Regulatory hub', category: 'Compliance & Security', color: 'emerald' },
        { id: 'audit', name: 'Audit Dashboard', path: '/audit', icon: Eye, desc: 'Activity tracking', category: 'Compliance & Security', color: 'emerald' },
        { id: 'hipaa', name: 'HIPAA Controls', path: '/compliance', icon: Lock, desc: 'Privacy management', category: 'Compliance & Security', color: 'emerald' },
        { id: 'cms-ede', name: 'CMS EDE Portal', path: '/regulatory-hub', icon: Landmark, desc: 'Marketplace integration', category: 'Compliance & Security', color: 'emerald' },
        { id: 'data-integration', name: 'Data Integration', path: '/data-integration', icon: Database, desc: 'EDI management', category: 'Compliance & Security', color: 'emerald' },
    ],
    // Operations & Admin
    operations: [
        { id: 'workflows', name: 'Workflow Builder', path: '/workflows', icon: Workflow, desc: 'Process automation', category: 'Operations & Admin', color: 'slate' },
        { id: 'task-queue', name: 'Task Queue', path: '/task-queue', icon: ClipboardCheck, desc: 'Work management', category: 'Operations & Admin', color: 'slate' },
        { id: 'user-management', name: 'User Management', path: '/user-management', icon: Users, desc: 'Access control', category: 'Operations & Admin', color: 'slate' },
        { id: 'system-health', name: 'System Health', path: '/system-health', icon: Server, desc: 'Monitoring', category: 'Operations & Admin', color: 'slate' },
        { id: 'api-management', name: 'API Gateway', path: '/api-management', icon: Cpu, desc: 'Developer tools', category: 'Operations & Admin', color: 'slate' },
    ],
}

// Role-based module entitlements
const roleEntitlements: Record<string, string[]> = {
    admin: Object.values(allModules).flat().map(m => m.id), // All modules
    broker: [
        'claims-processing', 'benefits', 'member-360', 'executive',
        'report-builder', 'provider-directory', 'compliance-center'
    ],
    employer: [
        'benefits', 'member-360', 'executive', 'report-builder',
        'user-management', 'hsa', 'population-health'
    ],
    member: [
        'benefits', 'care-journey', 'digital-id', 'hsa', 'telehealth',
        'pharmacy', 'provider-directory', 'claims-processing'
    ],
}

// Quick stats for the dashboard
const quickStats = [
    { label: 'Pending Tasks', value: 24, icon: Clock, trend: -12, color: 'amber' },
    { label: 'Claims Today', value: 1247, icon: FileText, trend: 8, color: 'cyan' },
    { label: 'Active Members', value: '12.4M', icon: Users, trend: 3, color: 'emerald' },
    { label: 'System Health', value: '99.9%', icon: Zap, trend: 0, color: 'violet' },
]

interface CommandCenterProps {
    portal: 'admin' | 'broker' | 'employer' | 'member'
    userName?: string
    onLogout: () => void
}

// Module Card Component
function ModuleCard({ module, onClick }: { module: typeof allModules.claims[0], onClick: () => void }) {
    return (
        <motion.button
            className={`cc-module-card cc-module-card--${module.color}`}
            onClick={onClick}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
            <div className="cc-module-card__icon">
                <module.icon size={24} />
            </div>
            <div className="cc-module-card__content">
                <span className="cc-module-card__name">{module.name}</span>
                <span className="cc-module-card__desc">{module.desc}</span>
            </div>
            <div className="cc-module-card__category">
                {module.category}
            </div>
            <ChevronRight size={18} className="cc-module-card__arrow" />
        </motion.button>
    )
}

// Category Header
function CategoryHeader({ name, count, icon: Icon, color }: { name: string, count: number, icon: any, color: string }) {
    return (
        <div className={`cc-category-header cc-category-header--${color}`}>
            <div className="cc-category-header__icon">
                <Icon size={20} />
            </div>
            <h3 className="cc-category-header__name">{name}</h3>
            <Badge variant="secondary">{count} modules</Badge>
        </div>
    )
}

// Quick Stat Card
function QuickStatCard({ stat }: { stat: typeof quickStats[0] }) {
    return (
        <motion.div
            className={`cc-stat-card cc-stat-card--${stat.color}`}
            whileHover={{ scale: 1.02 }}
        >
            <div className="cc-stat-card__icon">
                <stat.icon size={20} />
            </div>
            <div className="cc-stat-card__content">
                <span className="cc-stat-card__value">{stat.value}</span>
                <span className="cc-stat-card__label">{stat.label}</span>
            </div>
            {stat.trend !== 0 && (
                <div className={`cc-stat-card__trend ${stat.trend > 0 ? 'cc-stat-card__trend--up' : 'cc-stat-card__trend--down'}`}>
                    {stat.trend > 0 ? '+' : ''}{stat.trend}%
                </div>
            )}
        </motion.div>
    )
}

export function CommandCenter({ portal, userName = 'Demo User', onLogout }: CommandCenterProps) {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    // Get entitled modules based on role
    const entitledModuleIds = roleEntitlements[portal] || []

    const entitledModules = useMemo(() => {
        const allMods = Object.values(allModules).flat()
        return allMods.filter(m => entitledModuleIds.includes(m.id))
    }, [entitledModuleIds])

    // Filter modules by search and category
    const filteredModules = useMemo(() => {
        let mods = entitledModules
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            mods = mods.filter(m =>
                m.name.toLowerCase().includes(q) ||
                m.desc.toLowerCase().includes(q) ||
                m.category.toLowerCase().includes(q)
            )
        }
        if (selectedCategory) {
            mods = mods.filter(m => m.category === selectedCategory)
        }
        return mods
    }, [entitledModules, searchQuery, selectedCategory])

    // Group by category
    const groupedModules = useMemo(() => {
        const groups: Record<string, typeof entitledModules> = {}
        filteredModules.forEach(mod => {
            if (!groups[mod.category]) groups[mod.category] = []
            groups[mod.category].push(mod)
        })
        return groups
    }, [filteredModules])

    const categories = Object.keys(groupedModules)

    const handleModuleClick = (path: string) => {
        navigate(path)
    }

    const portalLabels = {
        admin: 'Administrator',
        broker: 'Broker',
        employer: 'Employer',
        member: 'Member'
    }

    return (
        <div className="command-center">
            {/* Header */}
            <header className="cc-header">
                <div className="cc-header__left">
                    <div className="cc-header__logo">
                        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="ccLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#06B6D4" />
                                </linearGradient>
                            </defs>
                            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#ccLogoGrad)" />
                            <rect x="5" y="5" width="30" height="30" rx="8" fill="#030712" fillOpacity="0.9" />
                            <path d="M20 10L30 28H10L20 10Z" fill="none" stroke="url(#ccLogoGrad)" strokeWidth="2" />
                            <circle cx="20" cy="17" r="2" fill="#06B6D4" />
                        </svg>
                        <div className="cc-header__brand">
                            <span className="cc-header__name">APEX</span>
                            <span className="cc-header__tag">Command Center</span>
                        </div>
                    </div>
                </div>

                <div className="cc-header__center">
                    <div className="cc-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search modules..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="cc-header__right">
                    <button className="cc-header__action">
                        <Bell size={20} />
                        <span className="cc-header__badge">3</span>
                    </button>
                    <button className="cc-header__action">
                        <Settings size={20} />
                    </button>
                    <div className="cc-header__user">
                        <div className="cc-header__avatar">
                            {userName.charAt(0)}
                        </div>
                        <div className="cc-header__user-info">
                            <span className="cc-header__user-name">{userName}</span>
                            <span className="cc-header__user-role">{portalLabels[portal]}</span>
                        </div>
                    </div>
                    <button className="cc-header__logout" onClick={onLogout}>
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Welcome Section */}
            <section className="cc-welcome">
                <div className="cc-welcome__content">
                    <Badge variant="teal" dot pulse>
                        <Sparkles size={12} /> AI-Powered Platform
                    </Badge>
                    <h1 className="cc-welcome__title">
                        Welcome back, {userName.split(' ')[0]}
                    </h1>
                    <p className="cc-welcome__subtitle">
                        You have access to {entitledModules.length} modules. Select any module below to begin.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="cc-quick-stats">
                    {quickStats.map((stat, idx) => (
                        <QuickStatCard key={idx} stat={stat} />
                    ))}
                </div>
            </section>

            {/* Category Filters */}
            <section className="cc-filters">
                <button
                    className={`cc-filter-btn ${!selectedCategory ? 'cc-filter-btn--active' : ''}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    <LayoutGrid size={16} />
                    All Modules
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`cc-filter-btn ${selectedCategory === cat ? 'cc-filter-btn--active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                        <Badge variant="secondary">{groupedModules[cat]?.length}</Badge>
                    </button>
                ))}
            </section>

            {/* Module Grid */}
            <main className="cc-main">
                <AnimatePresence mode="wait">
                    {categories.length === 0 ? (
                        <motion.div
                            className="cc-empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Search size={48} />
                            <h3>No modules found</h3>
                            <p>Try adjusting your search or filters</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={selectedCategory || 'all'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="cc-modules-container"
                        >
                            {categories.map((category) => (
                                <section key={category} className="cc-category">
                                    <CategoryHeader
                                        name={category}
                                        count={groupedModules[category].length}
                                        icon={getCategoryIcon(category)}
                                        color={groupedModules[category][0]?.color || 'slate'}
                                    />
                                    <div className="cc-category__grid">
                                        {groupedModules[category].map((module) => (
                                            <ModuleCard
                                                key={module.id}
                                                module={module}
                                                onClick={() => handleModuleClick(module.path)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="cc-footer">
                <div className="cc-footer__compliance">
                    {['HIPAA Compliant', 'HITRUST Certified', 'SOC 2 Type II', 'CMS EDE Certified'].map(badge => (
                        <span key={badge} className="cc-footer__badge">
                            <Shield size={12} />
                            {badge}
                        </span>
                    ))}
                </div>
                <span className="cc-footer__copyright">
                    © 2026 Apex Health Intelligence. All rights reserved.
                </span>
            </footer>
        </div>
    )
}

// Helper to get category icon
function getCategoryIcon(category: string) {
    const icons: Record<string, any> = {
        'Claims Intelligence': FileText,
        'Provider Network': Stethoscope,
        'Member Experience': Heart,
        'Analytics & AI': Brain,
        'Compliance & Security': Shield,
        'Operations & Admin': Settings,
    }
    return icons[category] || LayoutGrid
}

export default CommandCenter
