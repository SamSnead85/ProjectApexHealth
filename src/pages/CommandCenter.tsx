import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigation } from '../context/NavigationContext'
import {
    Search, Bell, Settings, LogOut, ChevronRight, Sparkles, Shield, ArrowRight,
    FileText, ClipboardCheck, AlertTriangle, CreditCard, Scale, FileCheck,
    Stethoscope, BadgeCheck, Network, DollarSign, Building2, Heart, User,
    Activity, Video, Pill, Brain, BarChart3, Users, TrendingUp, Award,
    ShieldCheck, Eye, Lock, Landmark, Database, Workflow, Server, Cpu,
    Clock, Zap, HelpCircle
} from 'lucide-react'
import { Badge, Button } from '../components/common'
import { PremiumMetricCard, type CardVariant, type TrendDirection } from '../components/ui/PremiumMetricCard'
import { PageSkeleton } from '../components/common/LoadingSkeleton'
import './CommandCenter.css'

// ============================================================================
// COMMAND CENTER - CLAIMSLINK DESIGN
// Photography-based cards with glass overlays, minimal text, premium feel
// ============================================================================

// Core modules with premium images
const coreModules = [
    {
        id: 'claims-processing',
        name: 'Claims Intelligence',
        subtitle: 'AI-Powered Adjudication',
        path: '/claims',
        image: '/images/modules/claims-intelligence.png',
        accentColor: '#06b6d4',
        icon: FileText,
        isNew: false,
    },
    {
        id: 'executive',
        name: 'Executive Analytics',
        subtitle: 'Command Center',
        path: '/executive',
        image: '/images/modules/executive-analytics.png',
        accentColor: '#a855f7',
        icon: Brain,
        isNew: false,
    },
    {
        id: 'member-360',
        name: 'Member Experience',
        subtitle: 'Care Management',
        path: '/member-360',
        image: '/images/modules/member-experience.png',
        accentColor: '#f97316',
        icon: Heart,
        isNew: true,
    },
    {
        id: 'compliance-center',
        name: 'Compliance Hub',
        subtitle: 'Regulatory Intelligence',
        path: '/compliance-center',
        image: '/images/modules/compliance-hub.png',
        accentColor: '#34d399',
        icon: Shield,
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

// Enhanced quick stats with sparklines and variants
const quickStats: Array<{
    label: string
    value: string
    icon: typeof Clock
    trend: { direction: TrendDirection; value: string }
    variant: CardVariant
    sparkline: number[]
}> = [
        {
            label: 'Pending Tasks',
            value: '24',
            icon: Clock,
            trend: { direction: 'down', value: '12%' },
            variant: 'amber',
            sparkline: [40, 35, 38, 32, 28, 30, 24]
        },
        {
            label: 'Claims Today',
            value: '1,247',
            icon: FileText,
            trend: { direction: 'up', value: '8%' },
            variant: 'teal',
            sparkline: [950, 1020, 1100, 1150, 1180, 1220, 1247]
        },
        {
            label: 'Active Members',
            value: '12.4M',
            icon: Users,
            trend: { direction: 'up', value: '3%' },
            variant: 'purple',
            sparkline: [11.8, 11.9, 12.0, 12.1, 12.2, 12.3, 12.4]
        },
        {
            label: 'System Uptime',
            value: '99.9%',
            icon: Zap,
            trend: { direction: 'neutral', value: '0%' },
            variant: 'emerald',
            sparkline: [99.95, 99.92, 99.98, 99.90, 99.92, 99.95, 99.90]
        },
    ]


interface CommandCenterProps {
    portal: 'admin' | 'broker' | 'employer' | 'member'
    userName?: string
    onLogout: () => void
}

// Premium Image Card - Large centered title for clear module identification
function OrbCard({ module, onClick }: { module: typeof coreModules[0], onClick: () => void }) {
    const Icon = module.icon
    return (
        <motion.button
            className="cc-hero-card"
            onClick={onClick}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ '--accent-color': module.accentColor } as React.CSSProperties}
        >
            {/* Full Background Image */}
            <div className="cc-hero-card__image">
                <img src={module.image} alt={module.name} />
            </div>

            {/* Gradient Overlay */}
            <div className="cc-hero-card__overlay" />

            {/* NEW Badge */}
            {module.isNew && (
                <span className="cc-hero-card__badge">NEW</span>
            )}

            {/* Centered Title Block - The Hero Element */}
            <div className="cc-hero-card__center">
                <div className="cc-hero-card__icon-lg">
                    <Icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="cc-hero-card__title-lg">{module.name}</h3>
                <p className="cc-hero-card__subtitle-lg">{module.subtitle}</p>
            </div>

            {/* Bottom Arrow on Hover */}
            <div className="cc-hero-card__footer">
                <span className="cc-hero-card__cta">Open Module</span>
                <ArrowRight size={16} />
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

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function CommandCenter({ portal, userName = 'Demo User', onLogout }: CommandCenterProps) {
    const { navigate } = useNavigation()
    const [loading, setLoading] = useState(true)
    const [systemStatus, setSystemStatus] = useState<any>(null)

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    // Fetch real-time system health from API
    useEffect(() => {
        if (!API_BASE) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/v1/health/ready`);
                if (res.ok) {
                    const data = await res.json();
                    setSystemStatus(data);
                }
            } catch { /* offline mode */ }
        })();
    }, []);
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('claims')

    if (loading) return <PageSkeleton />

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
                    <div className="cc-premium-stats">
                        {quickStats.map((stat, idx) => (
                            <PremiumMetricCard
                                key={idx}
                                value={stat.value}
                                label={stat.label}
                                icon={<stat.icon size={22} />}
                                trend={stat.trend}
                                variant={stat.variant}
                                sparklineData={stat.sparkline}
                                compact
                            />
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
                                <OrbCard
                                    module={module}
                                    onClick={() => handleModuleClick(module.path)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* All Modules - Horizontal Rails */}
                <section className="cc-modules">
                    <div className="cc-section-header">
                        <h2>All Modules</h2>
                    </div>

                    {/* Horizontal Rails for Each Category */}
                    {categories.map((cat, catIdx) => {
                        const catModules = allModules[cat.key as keyof typeof allModules] || []
                        const Icon = cat.icon
                        return (
                            <motion.div
                                key={cat.key}
                                className="cc-rail"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: catIdx * 0.1 }}
                            >
                                <div className="cc-rail__header">
                                    <Icon size={18} className="cc-rail__icon" />
                                    <h3 className="cc-rail__title">{cat.name}</h3>
                                    <span className="cc-rail__count">{catModules.length}</span>
                                </div>
                                <div className="cc-rail__scroll">
                                    {catModules.map((module, idx) => (
                                        <motion.div
                                            key={module.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <MiniCard
                                                module={module}
                                                onClick={() => handleModuleClick(module.path)}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )
                    })}
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
        </div >
    )
}

export default CommandCenter
