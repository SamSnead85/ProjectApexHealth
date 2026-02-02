import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    Search, Bell, Settings, LogOut, ChevronRight, ChevronLeft, Sparkles,
    FileText, ClipboardCheck, AlertTriangle, CreditCard, Scale, FileCheck,
    Stethoscope, BadgeCheck, Network, DollarSign, Building2, Heart, User,
    Activity, Video, Pill, Brain, BarChart3, Users, TrendingUp, Award,
    Shield, ShieldCheck, Eye, Lock, Landmark, Database, Workflow, Server, Cpu,
    Clock, Zap, ArrowRight, HelpCircle
} from 'lucide-react'
import { Badge, Button } from '../components/common'
import './CommandCenter.css'

// ============================================================================
// COMMAND CENTER - PREMIUM CLAIMSLINK-INSPIRED DESIGN
// Netflix-style horizontal rails, large hero cards, institutional aesthetic
// ============================================================================

// Module definitions
const allModules = {
    claims: [
        { id: 'claims-processing', name: 'Claims Processing', path: '/claims', icon: FileText, desc: 'AI-powered adjudication engine with real-time decision support', color: 'cyan', featured: true },
        { id: 'prior-auth', name: 'Prior Authorization', path: '/prior-auth', icon: ClipboardCheck, desc: 'Intelligent pre-approval workflows', color: 'cyan' },
        { id: 'fraud-detection', name: 'Fraud Detection', path: '/fraud-detection', icon: AlertTriangle, desc: 'ML anomaly detection', color: 'cyan' },
        { id: 'payment-integrity', name: 'Payment Integrity', path: '/payment-processing', icon: CreditCard, desc: 'Error prevention system', color: 'cyan' },
        { id: 'appeals', name: 'Appeals Management', path: '/appeals', icon: Scale, desc: 'Dispute resolution', color: 'cyan' },
        { id: 'eob', name: 'EOB Viewer', path: '/eob', icon: FileCheck, desc: 'Explanation of benefits', color: 'cyan' },
    ],
    provider: [
        { id: 'provider-directory', name: 'Provider Directory', path: '/providers', icon: Search, desc: 'Find in-network providers', color: 'violet' },
        { id: 'credentialing', name: 'Credentialing', path: '/credentialing', icon: BadgeCheck, desc: 'Provider verification', color: 'violet' },
        { id: 'network-adequacy', name: 'Network Adequacy', path: '/network-adequacy', icon: Network, desc: 'Coverage analysis', color: 'violet' },
        { id: 'fee-schedules', name: 'Fee Schedules', path: '/fee-schedule', icon: DollarSign, desc: 'Rate management', color: 'violet' },
        { id: 'provider-portal', name: 'Provider Portal', path: '/provider-portal', icon: Building2, desc: 'Self-service tools', color: 'violet' },
    ],
    member: [
        { id: 'member-360', name: 'Member 360', path: '/member-360', icon: User, desc: 'Unified member view', color: 'pink' },
        { id: 'benefits', name: 'Benefits Navigator', path: '/benefits', icon: Heart, desc: 'Coverage explorer', color: 'pink' },
        { id: 'care-journey', name: 'Care Journey', path: '/care-journey', icon: Activity, desc: 'Health timeline', color: 'pink' },
        { id: 'digital-id', name: 'Digital ID Card', path: '/digital-id', icon: CreditCard, desc: 'Mobile wallet ready', color: 'pink' },
        { id: 'hsa', name: 'HSA/FSA Wallet', path: '/hsa', icon: DollarSign, desc: 'Spending accounts', color: 'pink' },
        { id: 'telehealth', name: 'Telehealth', path: '/telehealth', icon: Video, desc: 'Virtual visits', color: 'pink' },
        { id: 'pharmacy', name: 'Pharmacy', path: '/pharmacy', icon: Pill, desc: 'Rx management', color: 'pink' },
    ],
    analytics: [
        { id: 'executive', name: 'Executive Dashboard', path: '/executive', icon: BarChart3, desc: 'C-suite insights with predictive analytics and real-time KPIs', color: 'amber', featured: true },
        { id: 'advanced-analytics', name: 'Advanced Analytics', path: '/advanced-analytics', icon: Brain, desc: 'AI-powered analysis', color: 'amber' },
        { id: 'population-health', name: 'Population Health', path: '/population-health', icon: Users, desc: 'Cohort analytics', color: 'amber' },
        { id: 'claims-prediction', name: 'Claims Prediction', path: '/claims-prediction', icon: TrendingUp, desc: 'Forecasting engine', color: 'amber' },
        { id: 'value-based-care', name: 'Value-Based Care', path: '/value-based-care', icon: Award, desc: 'Quality metrics', color: 'amber' },
        { id: 'report-builder', name: 'Report Builder', path: '/report-builder', icon: FileText, desc: 'Custom reports', color: 'amber' },
    ],
    compliance: [
        { id: 'compliance-center', name: 'Compliance Center', path: '/compliance-center', icon: ShieldCheck, desc: 'Complete regulatory command with HIPAA, HITRUST, and CMS tracking', color: 'emerald', featured: true },
        { id: 'audit', name: 'Audit Dashboard', path: '/audit', icon: Eye, desc: 'Activity tracking', color: 'emerald' },
        { id: 'hipaa', name: 'HIPAA Controls', path: '/compliance', icon: Lock, desc: 'Privacy management', color: 'emerald' },
        { id: 'cms-ede', name: 'CMS EDE Portal', path: '/regulatory-hub', icon: Landmark, desc: 'Marketplace integration', color: 'emerald' },
        { id: 'data-integration', name: 'Data Integration', path: '/data-integration', icon: Database, desc: 'EDI management', color: 'emerald' },
    ],
    operations: [
        { id: 'workflows', name: 'Workflow Builder', path: '/workflows', icon: Workflow, desc: 'Process automation', color: 'slate' },
        { id: 'task-queue', name: 'Task Queue', path: '/task-queue', icon: ClipboardCheck, desc: 'Work management', color: 'slate' },
        { id: 'user-management', name: 'User Management', path: '/user-management', icon: Users, desc: 'Access control', color: 'slate' },
        { id: 'system-health', name: 'System Health', path: '/system-health', icon: Server, desc: 'Monitoring', color: 'slate' },
        { id: 'api-management', name: 'API Gateway', path: '/api-management', icon: Cpu, desc: 'Developer tools', color: 'slate' },
    ],
}

// Category metadata
const categories = [
    { key: 'claims', name: 'Claims Intelligence', icon: FileText, color: 'cyan' },
    { key: 'analytics', name: 'Analytics & AI', icon: Brain, color: 'amber' },
    { key: 'compliance', name: 'Compliance & Security', icon: Shield, color: 'emerald' },
    { key: 'provider', name: 'Provider Network', icon: Stethoscope, color: 'violet' },
    { key: 'member', name: 'Member Experience', icon: Heart, color: 'pink' },
    { key: 'operations', name: 'Operations & Admin', icon: Settings, color: 'slate' },
]

// Role entitlements
const roleEntitlements: Record<string, string[]> = {
    admin: Object.values(allModules).flat().map(m => m.id),
    broker: ['claims-processing', 'benefits', 'member-360', 'executive', 'report-builder', 'provider-directory', 'compliance-center'],
    employer: ['benefits', 'member-360', 'executive', 'report-builder', 'user-management', 'hsa', 'population-health'],
    member: ['benefits', 'care-journey', 'digital-id', 'hsa', 'telehealth', 'pharmacy', 'provider-directory', 'claims-processing'],
}

// Quick stats
const quickStats = [
    { label: 'Pending Tasks', value: 24, icon: Clock, trend: -12, color: 'amber' },
    { label: 'Claims Today', value: '1,247', icon: FileText, trend: 8, color: 'cyan' },
    { label: 'Active Members', value: '12.4M', icon: Users, trend: 3, color: 'emerald' },
    { label: 'System Uptime', value: '99.9%', icon: Zap, trend: 0, color: 'violet' },
]

interface CommandCenterProps {
    portal: 'admin' | 'broker' | 'employer' | 'member'
    userName?: string
    onLogout: () => void
}

// Hero Featured Card - Large premium cards
function HeroCard({ module, onClick }: { module: any, onClick: () => void }) {
    return (
        <motion.button
            className={`cc-hero-card cc-hero-card--${module.color}`}
            onClick={onClick}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
            <div className="cc-hero-card__gradient" />
            <div className="cc-hero-card__content">
                <div className="cc-hero-card__icon">
                    <module.icon size={48} strokeWidth={1.5} />
                </div>
                <h3 className="cc-hero-card__title">{module.name}</h3>
                <p className="cc-hero-card__desc">{module.desc}</p>
                <div className="cc-hero-card__action">
                    <span>Open Module</span>
                    <ArrowRight size={18} />
                </div>
            </div>
            <div className="cc-hero-card__glow" />
        </motion.button>
    )
}

// Rail Module Card - For horizontal scrolling rails
function RailCard({ module, onClick }: { module: any, onClick: () => void }) {
    return (
        <motion.button
            className={`cc-rail-card cc-rail-card--${module.color}`}
            onClick={onClick}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="cc-rail-card__icon">
                <module.icon size={28} />
            </div>
            <div className="cc-rail-card__info">
                <span className="cc-rail-card__name">{module.name}</span>
                <span className="cc-rail-card__desc">{module.desc}</span>
            </div>
            <ChevronRight size={18} className="cc-rail-card__arrow" />
        </motion.button>
    )
}

// Horizontal Rail with scroll
function ModuleRail({ category, modules, onModuleClick }: {
    category: typeof categories[0],
    modules: any[],
    onModuleClick: (path: string) => void
}) {
    const railRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const updateScrollButtons = () => {
        if (railRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = railRef.current
            setCanScrollLeft(scrollLeft > 10)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    const scroll = (direction: 'left' | 'right') => {
        if (railRef.current) {
            const scrollAmount = direction === 'left' ? -400 : 400
            railRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
            setTimeout(updateScrollButtons, 300)
        }
    }

    const Icon = category.icon

    return (
        <section className="cc-rail">
            <div className="cc-rail__header">
                <div className={`cc-rail__icon cc-rail__icon--${category.color}`}>
                    <Icon size={20} />
                </div>
                <h2 className="cc-rail__title">{category.name}</h2>
                <span className="cc-rail__count">{modules.length} modules</span>
                <div className="cc-rail__controls">
                    <button
                        className={`cc-rail__scroll-btn ${!canScrollLeft ? 'cc-rail__scroll-btn--disabled' : ''}`}
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        className={`cc-rail__scroll-btn ${!canScrollRight ? 'cc-rail__scroll-btn--disabled' : ''}`}
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
            <div
                className="cc-rail__track"
                ref={railRef}
                onScroll={updateScrollButtons}
            >
                {modules.map(module => (
                    <RailCard
                        key={module.id}
                        module={module}
                        onClick={() => onModuleClick(module.path)}
                    />
                ))}
            </div>
        </section>
    )
}

// Stat Card
function StatCard({ stat }: { stat: typeof quickStats[0] }) {
    return (
        <div className={`cc-stat cc-stat--${stat.color}`}>
            <div className="cc-stat__icon">
                <stat.icon size={20} />
            </div>
            <div className="cc-stat__data">
                <span className="cc-stat__value">{stat.value}</span>
                <span className="cc-stat__label">{stat.label}</span>
            </div>
            {stat.trend !== 0 && (
                <span className={`cc-stat__trend ${stat.trend > 0 ? 'cc-stat__trend--up' : 'cc-stat__trend--down'}`}>
                    {stat.trend > 0 ? '+' : ''}{stat.trend}%
                </span>
            )}
        </div>
    )
}

export function CommandCenter({ portal, userName = 'Demo User', onLogout }: CommandCenterProps) {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    const entitledModuleIds = roleEntitlements[portal] || []

    // Get featured modules
    const featuredModules = useMemo(() => {
        return Object.values(allModules).flat()
            .filter(m => (m as any).featured && entitledModuleIds.includes(m.id))
            .slice(0, 3)
    }, [entitledModuleIds])

    // Get modules per category
    const modulesByCategory = useMemo(() => {
        const result: Record<string, any[]> = {}
        categories.forEach(cat => {
            const catModules = allModules[cat.key as keyof typeof allModules] || []
            result[cat.key] = catModules.filter(m => entitledModuleIds.includes(m.id))
        })
        return result
    }, [entitledModuleIds])

    // Filter by search
    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories.filter(c => modulesByCategory[c.key].length > 0)

        const q = searchQuery.toLowerCase()
        return categories.filter(c => {
            const catModules = modulesByCategory[c.key]
            return catModules.some(m =>
                m.name.toLowerCase().includes(q) ||
                m.desc.toLowerCase().includes(q)
            )
        })
    }, [searchQuery, modulesByCategory])

    const handleModuleClick = (path: string) => navigate(path)

    const portalLabels = {
        admin: 'Super Administrator',
        broker: 'Broker',
        employer: 'Employer',
        member: 'Member'
    }

    return (
        <div className="command-center">
            {/* Header */}
            <header className="cc-header">
                <div className="cc-header__brand">
                    <svg viewBox="0 0 40 40" fill="none" className="cc-header__logo">
                        <defs>
                            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#06B6D4" />
                            </linearGradient>
                        </defs>
                        <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#logoGrad)" />
                        <rect x="5" y="5" width="30" height="30" rx="8" fill="#030712" fillOpacity="0.9" />
                        <path d="M20 10L30 28H10L20 10Z" fill="none" stroke="url(#logoGrad)" strokeWidth="2" />
                        <circle cx="20" cy="17" r="2" fill="#06B6D4" />
                    </svg>
                    <div>
                        <h1 className="cc-header__name">APEX</h1>
                        <span className="cc-header__tag">Command Center</span>
                    </div>
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
                        <span className="cc-header__badge">3</span>
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
                {/* Welcome */}
                <section className="cc-welcome">
                    <div>
                        <Badge variant="teal" dot pulse>
                            <Sparkles size={12} /> AI-Powered Platform
                        </Badge>
                        <h2 className="cc-welcome__title">Welcome back, {userName.split(' ')[0]}</h2>
                        <p className="cc-welcome__sub">Your healthcare intelligence command center</p>
                    </div>
                    <div className="cc-stats">
                        {quickStats.map((stat, idx) => <StatCard key={idx} stat={stat} />)}
                    </div>
                </section>

                {/* Featured Hero Cards */}
                <section className="cc-featured">
                    <h2 className="cc-section-title">Featured Modules</h2>
                    <div className="cc-hero-grid">
                        {featuredModules.map(module => (
                            <HeroCard
                                key={module.id}
                                module={module}
                                onClick={() => handleModuleClick(module.path)}
                            />
                        ))}
                    </div>
                </section>

                {/* Category Rails */}
                <section className="cc-rails">
                    <AnimatePresence>
                        {filteredCategories.map((category, idx) => (
                            <motion.div
                                key={category.key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <ModuleRail
                                    category={category}
                                    modules={modulesByCategory[category.key]}
                                    onModuleClick={handleModuleClick}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
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
