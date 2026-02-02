import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    Search, Bell, Settings, LogOut, ChevronRight, Sparkles, Shield, ArrowRight,
    FileText, ClipboardCheck, AlertTriangle, CreditCard, Scale, FileCheck,
    Stethoscope, BadgeCheck, Network, DollarSign, Building2, Heart, User,
    Activity, Video, Pill, Brain, BarChart3, Users, TrendingUp, Award,
    ShieldCheck, Eye, Lock, Landmark, Database, Workflow, Server, Cpu,
    Clock, Zap, HelpCircle
} from 'lucide-react'
import { Badge, Button } from '../components/common'
import './CommandCenter.css'

// ============================================================================
// COMMAND CENTER - CLAIMSLINK DESIGN
// Photography-based cards with glass overlays, minimal text, premium feel
// ============================================================================

// Core modules with photography
const coreModules = [
    {
        id: 'claims-processing',
        name: 'Claims Intelligence',
        subtitle: 'AI-Powered Adjudication',
        path: '/claims',
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=900&fit=crop&q=80',
        isNew: false,
    },
    {
        id: 'executive',
        name: 'Executive Analytics',
        subtitle: 'Command Center',
        path: '/executive',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=900&fit=crop&q=80',
        isNew: false,
    },
    {
        id: 'member-360',
        name: 'Member Experience',
        subtitle: 'Care Management',
        path: '/member-360',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=900&fit=crop&q=80',
        isNew: true,
    },
    {
        id: 'compliance-center',
        name: 'Compliance Hub',
        subtitle: 'Regulatory Intelligence',
        path: '/compliance-center',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=900&fit=crop&q=80',
        isNew: false,
    },
]

// All modules grouped by category
const allModules = {
    claims: [
        { id: 'claims-processing', name: 'Claims Processing', path: '/claims', icon: FileText, desc: 'AI adjudication' },
        { id: 'prior-auth', name: 'Prior Authorization', path: '/prior-auth', icon: ClipboardCheck, desc: 'Pre-approval workflows' },
        { id: 'fraud-detection', name: 'Fraud Detection', path: '/fraud-detection', icon: AlertTriangle, desc: 'ML anomaly detection' },
        { id: 'payment-integrity', name: 'Payment Integrity', path: '/payment-processing', icon: CreditCard, desc: 'Error prevention' },
        { id: 'appeals', name: 'Appeals Management', path: '/appeals', icon: Scale, desc: 'Dispute resolution' },
        { id: 'eob', name: 'EOB Viewer', path: '/eob', icon: FileCheck, desc: 'Benefits explanation' },
    ],
    provider: [
        { id: 'provider-directory', name: 'Provider Directory', path: '/providers', icon: Search, desc: 'Find providers' },
        { id: 'credentialing', name: 'Credentialing', path: '/credentialing', icon: BadgeCheck, desc: 'Verification' },
        { id: 'network-adequacy', name: 'Network Adequacy', path: '/network-adequacy', icon: Network, desc: 'Coverage analysis' },
        { id: 'fee-schedules', name: 'Fee Schedules', path: '/fee-schedule', icon: DollarSign, desc: 'Rate management' },
        { id: 'provider-portal', name: 'Provider Portal', path: '/provider-portal', icon: Building2, desc: 'Self-service' },
    ],
    member: [
        { id: 'member-360', name: 'Member 360', path: '/member-360', icon: User, desc: 'Unified view' },
        { id: 'benefits', name: 'Benefits Navigator', path: '/benefits', icon: Heart, desc: 'Coverage explorer' },
        { id: 'care-journey', name: 'Care Journey', path: '/care-journey', icon: Activity, desc: 'Health timeline' },
        { id: 'digital-id', name: 'Digital ID Card', path: '/digital-id', icon: CreditCard, desc: 'Mobile wallet' },
        { id: 'hsa', name: 'HSA/FSA Wallet', path: '/hsa', icon: DollarSign, desc: 'Spending accounts' },
        { id: 'telehealth', name: 'Telehealth', path: '/telehealth', icon: Video, desc: 'Virtual visits' },
        { id: 'pharmacy', name: 'Pharmacy', path: '/pharmacy', icon: Pill, desc: 'Rx management' },
    ],
    analytics: [
        { id: 'executive', name: 'Executive Dashboard', path: '/executive', icon: BarChart3, desc: 'C-suite insights' },
        { id: 'advanced-analytics', name: 'Advanced Analytics', path: '/advanced-analytics', icon: Brain, desc: 'AI analysis' },
        { id: 'population-health', name: 'Population Health', path: '/population-health', icon: Users, desc: 'Cohort analytics' },
        { id: 'claims-prediction', name: 'Claims Prediction', path: '/claims-prediction', icon: TrendingUp, desc: 'Forecasting' },
        { id: 'value-based-care', name: 'Value-Based Care', path: '/value-based-care', icon: Award, desc: 'Quality metrics' },
        { id: 'report-builder', name: 'Report Builder', path: '/report-builder', icon: FileText, desc: 'Custom reports' },
    ],
    compliance: [
        { id: 'compliance-center', name: 'Compliance Center', path: '/compliance-center', icon: ShieldCheck, desc: 'Regulatory hub' },
        { id: 'audit', name: 'Audit Dashboard', path: '/audit', icon: Eye, desc: 'Activity tracking' },
        { id: 'hipaa', name: 'HIPAA Controls', path: '/compliance', icon: Lock, desc: 'Privacy mgmt' },
        { id: 'cms-ede', name: 'CMS EDE Portal', path: '/regulatory-hub', icon: Landmark, desc: 'Marketplace' },
        { id: 'data-integration', name: 'Data Integration', path: '/data-integration', icon: Database, desc: 'EDI management' },
    ],
    operations: [
        { id: 'workflows', name: 'Workflow Builder', path: '/workflows', icon: Workflow, desc: 'Automation' },
        { id: 'task-queue', name: 'Task Queue', path: '/task-queue', icon: ClipboardCheck, desc: 'Work mgmt' },
        { id: 'user-management', name: 'User Management', path: '/user-management', icon: Users, desc: 'Access control' },
        { id: 'system-health', name: 'System Health', path: '/system-health', icon: Server, desc: 'Monitoring' },
        { id: 'api-management', name: 'API Gateway', path: '/api-management', icon: Cpu, desc: 'Dev tools' },
    ],
}

const categories = [
    { key: 'claims', name: 'Claims Intelligence', icon: FileText },
    { key: 'analytics', name: 'Analytics & AI', icon: Brain },
    { key: 'compliance', name: 'Compliance', icon: Shield },
    { key: 'provider', name: 'Provider Network', icon: Stethoscope },
    { key: 'member', name: 'Member Experience', icon: Heart },
    { key: 'operations', name: 'Operations', icon: Settings },
]

const quickStats = [
    { label: 'Pending Tasks', value: '24', icon: Clock, trend: -12 },
    { label: 'Claims Today', value: '1,247', icon: FileText, trend: 8 },
    { label: 'Active Members', value: '12.4M', icon: Users, trend: 3 },
    { label: 'System Uptime', value: '99.9%', icon: Zap, trend: 0 },
]

interface CommandCenterProps {
    portal: 'admin' | 'broker' | 'employer' | 'member'
    userName?: string
    onLogout: () => void
}

// Photography Card (ClaimsLink Style)
function PhotoCard({ module, onClick }: { module: typeof coreModules[0], onClick: () => void }) {
    return (
        <motion.button
            className="cc-photo-card"
            onClick={onClick}
            whileHover={{ y: -12, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <img
                src={module.image}
                alt={module.name}
                className="cc-photo-card__image"
            />
            <div className="cc-photo-card__overlay" />
            {module.isNew && (
                <span className="cc-photo-card__badge">NEW</span>
            )}
            <div className="cc-photo-card__content">
                <h3 className="cc-photo-card__title">{module.name}</h3>
                <p className="cc-photo-card__subtitle">{module.subtitle}</p>
            </div>
        </motion.button>
    )
}

// Mini Module Card
function MiniCard({ module, onClick }: { module: any, onClick: () => void }) {
    const Icon = module.icon
    return (
        <motion.button
            className="cc-mini-card"
            onClick={onClick}
            whileHover={{ x: 4 }}
        >
            <div className="cc-mini-card__icon">
                <Icon size={18} />
            </div>
            <div className="cc-mini-card__info">
                <span className="cc-mini-card__name">{module.name}</span>
                <span className="cc-mini-card__desc">{module.desc}</span>
            </div>
            <ChevronRight size={16} className="cc-mini-card__arrow" />
        </motion.button>
    )
}

export function CommandCenter({ portal, userName = 'Demo User', onLogout }: CommandCenterProps) {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('claims')

    const handleModuleClick = (path: string) => navigate(path)

    const filteredModules = useMemo(() => {
        const catModules = allModules[activeCategory as keyof typeof allModules] || []
        if (!searchQuery) return catModules
        const q = searchQuery.toLowerCase()
        return catModules.filter(m =>
            m.name.toLowerCase().includes(q) ||
            m.desc.toLowerCase().includes(q)
        )
    }, [activeCategory, searchQuery])

    const portalLabels = {
        admin: 'Super Administrator',
        broker: 'Broker',
        employer: 'Employer',
        member: 'Member'
    }

    return (
        <div className="command-center">
            {/* Premium Layered Background */}
            <div className="cc-grid-bg" />
            <div className="cc-honeycomb" />

            {/* Header */}
            <header className="cc-header">
                <div className="cc-header__brand">
                    <svg viewBox="0 0 32 32" fill="none" className="cc-header__logo">
                        <defs>
                            <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#34d399" />
                            </linearGradient>
                        </defs>
                        <path d="M20 6H12C8.686 6 6 8.686 6 12V20C6 23.314 8.686 26 12 26H20" stroke="url(#logoGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />
                        <path d="M26 12V20C26 20.5 25.8 21 25.5 21.5M16 16H26" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                        <circle cx="16" cy="16" r="3" fill="url(#logoGrad)" />
                    </svg>
                    <span className="cc-header__name">APEX</span>
                </div>

                <div className="cc-header__search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search modules..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="cc-header__actions">
                    <button className="cc-header__btn"><HelpCircle size={20} /></button>
                    <button className="cc-header__btn">
                        <Bell size={20} />
                        <span className="cc-header__notif">3</span>
                    </button>
                    <button className="cc-header__btn"><Settings size={20} /></button>
                    <div className="cc-header__user">
                        <div className="cc-header__avatar">{userName.charAt(0)}</div>
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

            <main className="cc-main">
                {/* Welcome + Stats */}
                <section className="cc-welcome">
                    <div className="cc-welcome__text">
                        <Badge variant="teal" dot pulse>
                            <Sparkles size={12} /> AI-Native Platform
                        </Badge>
                        <h1 className="cc-welcome__title">
                            Welcome back, <span className="cc-welcome__name">{userName.split(' ')[0]}</span>
                        </h1>
                        <p className="cc-welcome__sub">Healthcare intelligence at your command</p>
                    </div>
                    <div className="cc-stats">
                        {quickStats.map((stat, idx) => (
                            <div key={idx} className="cc-stat">
                                <stat.icon size={20} className="cc-stat__icon" />
                                <span className="cc-stat__value">{stat.value}</span>
                                <span className="cc-stat__label">{stat.label}</span>
                                {stat.trend !== 0 && (
                                    <span className={`cc-stat__trend ${stat.trend > 0 ? 'cc-stat__trend--up' : 'cc-stat__trend--down'}`}>
                                        {stat.trend > 0 ? '+' : ''}{stat.trend}%
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Core Capabilities - Photo Cards */}
                <section className="cc-core">
                    <div className="cc-section-header">
                        <h2>Core Capabilities</h2>
                        <ChevronRight size={20} />
                    </div>
                    <div className="cc-photo-grid">
                        {coreModules.map((module, idx) => (
                            <motion.div
                                key={module.id}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <PhotoCard
                                    module={module}
                                    onClick={() => handleModuleClick(module.path)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* All Modules */}
                <section className="cc-modules">
                    <div className="cc-section-header">
                        <h2>All Modules</h2>
                        <ChevronRight size={20} />
                    </div>

                    {/* Category Tabs */}
                    <div className="cc-tabs">
                        {categories.map(cat => {
                            const Icon = cat.icon
                            const isActive = activeCategory === cat.key
                            return (
                                <button
                                    key={cat.key}
                                    className={`cc-tab ${isActive ? 'cc-tab--active' : ''}`}
                                    onClick={() => setActiveCategory(cat.key)}
                                >
                                    <Icon size={16} />
                                    <span>{cat.name}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Module List */}
                    <div className="cc-module-list">
                        <AnimatePresence mode="wait">
                            {filteredModules.map((module, idx) => (
                                <motion.div
                                    key={module.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <MiniCard
                                        module={module}
                                        onClick={() => handleModuleClick(module.path)}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="cc-footer">
                <div className="cc-footer__badges">
                    {['HIPAA', 'HITRUST', 'SOC 2', 'CMS EDE'].map(badge => (
                        <span key={badge} className="cc-footer__badge">
                            <Shield size={12} /> {badge}
                        </span>
                    ))}
                </div>
                <span className="cc-footer__copy">© 2026 Apex Health Intelligence</span>
            </footer>
        </div>
    )
}

export default CommandCenter
