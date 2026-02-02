import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Lock, User, ArrowRight, Shield, Zap, BarChart3, Brain, Activity,
    Globe, Play, Sparkles, CheckCircle, TrendingUp, Award, Clock,
    DollarSign, Heart, Building2, FileText, Users, Stethoscope,
    CreditCard, AlertTriangle, Network, ClipboardCheck, Calculator,
    Workflow, Eye, Pill, Video, MessageSquare, FileCheck, Settings,
    ChevronRight, Search, Star, BadgeCheck, ShieldCheck, Scale,
    Landmark, Server, Database, Lock as LockIcon, Cpu
} from 'lucide-react'
import { Button, Input, Badge, GlassCard } from '../components/common'
import './Landing.css'

// ============================================================================
// CLAIMSLINK-INSPIRED ENTERPRISE LANDING PAGE
// Premium Module Grid with Category-Based Navigation
// ============================================================================

// Module categories - Institutional Enterprise Design
const moduleCategories = [
    {
        id: 'claims',
        name: 'Claims Intelligence',
        description: 'AI-powered adjudication and payment integrity',
        icon: FileText,
        modules: [
            { name: 'Claims Processing', path: '/claims', icon: FileText, desc: 'Intelligent adjudication engine' },
            { name: 'Prior Authorization', path: '/prior-auth', icon: ClipboardCheck, desc: 'AI-assisted pre-approval' },
            { name: 'Fraud Detection', path: '/fraud-detection', icon: AlertTriangle, desc: 'ML anomaly detection' },
            { name: 'Payment Integrity', path: '/payment-processing', icon: CreditCard, desc: 'Error prevention system' },
            { name: 'Appeals Management', path: '/appeals', icon: Scale, desc: 'Dispute resolution workflow' },
            { name: 'EOB Viewer', path: '/eob', icon: FileCheck, desc: 'Explanation of benefits' },
        ]
    },
    {
        id: 'provider',
        name: 'Provider Network',
        description: 'Network management and credentialing',
        icon: Stethoscope,
        modules: [
            { name: 'Provider Directory', path: '/providers', icon: Search, desc: 'Find in-network providers' },
            { name: 'Credentialing', path: '/credentialing', icon: BadgeCheck, desc: 'Provider verification' },
            { name: 'Network Adequacy', path: '/network-adequacy', icon: Network, desc: 'Coverage analysis' },
            { name: 'Fee Schedules', path: '/fee-schedule', icon: DollarSign, desc: 'Rate management' },
            { name: 'Provider Portal', path: '/provider-portal', icon: Building2, desc: 'Self-service tools' },
        ]
    },
    {
        id: 'member',
        name: 'Member Experience',
        description: 'Digital-first member engagement',
        icon: Heart,
        modules: [
            { name: 'Member 360', path: '/member-360', icon: User, desc: 'Unified member view' },
            { name: 'Benefits Navigator', path: '/benefits', icon: Heart, desc: 'Coverage explorer' },
            { name: 'Care Journey', path: '/care-journey', icon: Activity, desc: 'Health timeline' },
            { name: 'Digital ID Card', path: '/digital-id', icon: CreditCard, desc: 'Mobile wallet card' },
            { name: 'HSA/FSA Wallet', path: '/hsa', icon: DollarSign, desc: 'Spending accounts' },
            { name: 'Telehealth', path: '/telehealth', icon: Video, desc: 'Virtual visits' },
            { name: 'Pharmacy', path: '/pharmacy', icon: Pill, desc: 'Rx management' },
        ]
    },
    {
        id: 'analytics',
        name: 'Analytics & AI',
        description: 'Predictive insights and reporting',
        icon: Brain,
        modules: [
            { name: 'Executive Dashboard', path: '/executive', icon: BarChart3, desc: 'C-suite insights' },
            { name: 'Advanced Analytics', path: '/advanced-analytics', icon: Brain, desc: 'AI-powered analysis' },
            { name: 'Population Health', path: '/population-health', icon: Users, desc: 'Cohort analytics' },
            { name: 'Claims Prediction', path: '/claims-prediction', icon: TrendingUp, desc: 'Forecasting engine' },
            { name: 'Value-Based Care', path: '/value-based-care', icon: Award, desc: 'Quality metrics' },
            { name: 'Custom Reports', path: '/report-builder', icon: FileText, desc: 'Report builder' },
        ]
    },
    {
        id: 'compliance',
        name: 'Compliance & Security',
        description: 'Regulatory adherence and audit readiness',
        icon: Shield,
        modules: [
            { name: 'Compliance Center', path: '/compliance-center', icon: ShieldCheck, desc: 'Regulatory hub' },
            { name: 'Audit Dashboard', path: '/audit', icon: Eye, desc: 'Activity tracking' },
            { name: 'HIPAA Controls', path: '/compliance', icon: Lock, desc: 'Privacy management' },
            { name: 'CMS EDE Portal', path: '/regulatory-hub', icon: Landmark, desc: 'Marketplace integration' },
            { name: 'Data Integration', path: '/data-integration', icon: Database, desc: 'EDI management' },
        ]
    },
    {
        id: 'operations',
        name: 'Operations & Admin',
        description: 'Platform management and workflows',
        icon: Settings,
        modules: [
            { name: 'Workflow Builder', path: '/workflows', icon: Workflow, desc: 'Process automation' },
            { name: 'Task Queue', path: '/task-queue', icon: ClipboardCheck, desc: 'Work management' },
            { name: 'User Management', path: '/user-management', icon: Users, desc: 'Access control' },
            { name: 'System Health', path: '/system-health', icon: Server, desc: 'Monitoring' },
            { name: 'API Management', path: '/api-management', icon: Cpu, desc: 'Developer tools' },
        ]
    },
]

// Compliance certifications with details
const complianceBadges = [
    {
        name: 'HIPAA',
        fullName: 'Health Insurance Portability and Accountability Act',
        status: 'Compliant',
        icon: Shield,
        description: 'Full PHI protection and privacy controls'
    },
    {
        name: 'HITRUST CSF',
        fullName: 'Health Information Trust Alliance',
        status: 'r2 Certified',
        icon: ShieldCheck,
        description: 'Comprehensive security framework certification'
    },
    {
        name: 'SOC 2',
        fullName: 'Service Organization Control',
        status: 'Type II',
        icon: BadgeCheck,
        description: 'Trust services criteria compliance'
    },
    {
        name: 'CMS EDE',
        fullName: 'Enhanced Direct Enrollment',
        status: 'Certified',
        icon: Landmark,
        description: 'Direct marketplace enrollment capability'
    },
]

// Enterprise statistics
const platformStats = [
    { value: '500M+', label: 'Claims Processed', icon: FileText },
    { value: '$4.2B', label: 'Savings Identified', icon: DollarSign },
    { value: '99.99%', label: 'Platform Uptime', icon: Zap },
    { value: '12M+', label: 'Members Served', icon: Users },
]

// Enterprise clients
const enterpriseClients = [
    'Blue Shield', 'Aetna', 'Kaiser Permanente', 'UnitedHealth',
    'Cigna', 'Humana', 'Anthem', 'Centene'
]

interface LandingProps {
    onLogin: (portal: 'admin' | 'broker' | 'employer' | 'member') => void
}

// Module Card Component - ClaimsLink Style with Photography
const moduleImages: Record<string, string> = {
    '/claims': 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
    '/prior-auth': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop',
    '/fraud-detection': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop',
    '/payment-processing': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    '/appeals': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
    '/eob': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop',
    '/providers': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
    '/credentialing': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
    '/network-adequacy': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop',
    '/fee-schedule': 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&h=300&fit=crop',
    '/provider-portal': 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=300&fit=crop',
    '/member-360': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop',
    '/benefits': 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=400&h=300&fit=crop',
    '/care-journey': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop',
    '/digital-id': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
    '/hsa': 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=300&fit=crop',
    '/telehealth': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
    '/pharmacy': 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=300&fit=crop',
    '/executive': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    '/advanced-analytics': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    '/population-health': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop',
    '/claims-prediction': 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
    '/value-based-care': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
    '/report-builder': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    '/compliance-center': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop',
    '/audit': 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&h=300&fit=crop',
    '/compliance': 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=400&h=300&fit=crop',
    '/regulatory-hub': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
    '/data-integration': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
    '/workflows': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    '/task-queue': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop',
    '/user-management': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    '/system-health': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    '/api-management': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
}

function ModuleCard({ module, onNavigate, isNew = false }: { module: any, onNavigate: () => void, isNew?: boolean }) {
    const imageUrl = moduleImages[module.path] || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop'

    return (
        <motion.button
            className="module-card"
            onClick={onNavigate}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <img
                src={imageUrl}
                alt={module.name}
                className="module-card__image"
                loading="lazy"
            />
            <div className="module-card__overlay" />
            {isNew && <span className="module-card__badge">NEW</span>}
            <div className="module-card__content">
                <div className="module-card__icon">
                    <module.icon size={18} />
                </div>
                <h4 className="module-card__name">{module.name}</h4>
                <p className="module-card__desc">{module.desc}</p>
            </div>
        </motion.button>
    )
}

// Category Section Component - Institutional Enterprise Style
function CategorySection({ category, onNavigate, index }: { category: typeof moduleCategories[0], onNavigate: (path: string) => void, index: number }) {
    return (
        <motion.section
            className="category-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <div className="category-section__header">
                <div className="category-section__icon">
                    <category.icon size={20} strokeWidth={1.5} />
                </div>
                <div className="category-section__info">
                    <h3 className="category-section__title">{category.name}</h3>
                    <p className="category-section__description">{category.description}</p>
                </div>
                <span className="category-section__count">
                    {category.modules.length} MODULES
                </span>
            </div>
            <div className="category-section__modules">
                {category.modules.map((module, idx) => (
                    <ModuleCard
                        key={module.path}
                        module={module}
                        onNavigate={() => onNavigate(module.path)}
                        isNew={idx === 0 && index === 0}
                    />
                ))}
            </div>
        </motion.section>
    )
}

// Compliance Badge Component
function ComplianceBadge({ badge }: { badge: typeof complianceBadges[0] }) {
    return (
        <motion.div
            className="compliance-badge-card"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
        >
            <div className="compliance-badge-card__icon">
                <badge.icon size={20} />
            </div>
            <div className="compliance-badge-card__content">
                <span className="compliance-badge-card__name">{badge.name}</span>
                <span className="compliance-badge-card__status">{badge.status}</span>
            </div>
            <CheckCircle size={16} className="compliance-badge-card__check" />
        </motion.div>
    )
}

export function Landing({ onLogin }: LandingProps) {
    const [activeView, setActiveView] = useState<'hero' | 'modules'>('hero')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setTimeout(() => {
            onLogin('admin')
            setIsLoading(false)
        }, 800)
    }

    const handleExploreModules = () => {
        setActiveView('modules')
    }

    const handleNavigateToModule = (path: string) => {
        onLogin('admin')
        // Navigation will be handled after login
    }

    return (
        <div className="landing">
            {/* Premium Background */}
            <div className="landing__bg">
                <div className="landing__bg-base" />
                <div className="landing__bg-glow" />
                <div className="landing__bg-grid" />
                <div className="landing__bg-vignette" />
                <div className="landing__bg-noise" />
            </div>

            <div className="landing__container">
                {/* Header */}
                <motion.header
                    className="landing__header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="landing__logo">
                        <div className="landing__logo-mark">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="apexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="50%" stopColor="#06B6D4" />
                                        <stop offset="100%" stopColor="#34d399" />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#apexGradient)" filter="url(#glow)" />
                                <rect x="6" y="6" width="36" height="36" rx="9" fill="#030712" fillOpacity="0.9" />
                                <path d="M24 12L36 34H12L24 12Z" fill="none" stroke="url(#apexGradient)" strokeWidth="2.5" strokeLinejoin="round" />
                                <path d="M22 25H26M24 23V27" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="24" cy="20" r="2" fill="#6366f1" />
                                <circle cx="18" cy="30" r="1.5" fill="#34d399" fillOpacity="0.7" />
                                <circle cx="30" cy="30" r="1.5" fill="#34d399" fillOpacity="0.7" />
                            </svg>
                        </div>
                        <div className="landing__logo-text">
                            <span className="landing__logo-name">APEX</span>
                            <span className="landing__logo-tag">Health Intelligence</span>
                        </div>
                    </div>
                    <nav className="landing__nav">
                        <button onClick={() => setActiveView('hero')} className={activeView === 'hero' ? 'active' : ''}>Platform</button>
                        <button onClick={handleExploreModules} className={activeView === 'modules' ? 'active' : ''}>Modules</button>
                        <a href="#enterprise">Enterprise</a>
                        <a href="#compliance">Security</a>
                        <Button variant="ghost" size="sm">Contact Sales</Button>
                    </nav>
                </motion.header>

                <AnimatePresence mode="wait">
                    {activeView === 'hero' ? (
                        <motion.div
                            key="hero"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Hero Section */}
                            <main className="landing__hero">
                                <motion.div
                                    className="landing__content"
                                    initial={{ opacity: 0, x: -40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.7, delay: 0.2 }}
                                >
                                    <div className="landing__badge">
                                        <Brain size={14} />
                                        <span>AI-Native Health Payer Operating System</span>
                                    </div>

                                    <h1 className="landing__headline">
                                        Healthcare Intelligence,
                                        <br />
                                        <span className="landing__headline-em">Unified</span>
                                    </h1>

                                    <p className="landing__description">
                                        The AI-native platform that transforms healthcare administration.
                                        From claims processing and member experience to provider networks,
                                        compliance, and analytics — all in one intelligent ecosystem.
                                    </p>

                                    <div className="landing__ctas">
                                        <Button
                                            size="lg"
                                            icon={<Play size={16} />}
                                            onClick={() => onLogin('admin')}
                                        >
                                            Start Demo
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            icon={<ArrowRight size={16} />}
                                            iconPosition="right"
                                            onClick={handleExploreModules}
                                        >
                                            Explore Modules
                                        </Button>
                                    </div>

                                    {/* Platform Stats */}
                                    <div className="landing__stats">
                                        {platformStats.map((stat, idx) => (
                                            <div key={idx} className="landing__stat">
                                                <span className="landing__stat-value">{stat.value}</span>
                                                <span className="landing__stat-label">{stat.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Login Card */}
                                <motion.div
                                    className="landing__card-wrapper"
                                    initial={{ opacity: 0, x: 40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.7, delay: 0.3 }}
                                >
                                    <div className="landing__card">
                                        <div className="landing__card-header">
                                            <div className="landing__card-icon">
                                                <Shield size={20} />
                                            </div>
                                            <h2 className="landing__card-title">Secure Access</h2>
                                            <p className="landing__card-subtitle">Enterprise portal login</p>
                                        </div>

                                        <form onSubmit={handleLogin} className="landing__form">
                                            <Input
                                                label="Email"
                                                type="email"
                                                placeholder="you@company.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                icon={<User size={18} />}
                                                fullWidth
                                            />
                                            <Input
                                                label="Password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                icon={<Lock size={18} />}
                                                fullWidth
                                            />
                                            <Button type="submit" fullWidth loading={isLoading}>
                                                Sign In
                                            </Button>
                                        </form>

                                        <div className="landing__sso">
                                            <div className="landing__sso-divider"><span>or continue as</span></div>
                                        </div>

                                        <div className="landing__demo-personas">
                                            <button className="landing__demo-persona" onClick={() => onLogin('admin')}>
                                                <div className="landing__demo-icon landing__demo-icon--admin">
                                                    <Shield size={18} />
                                                </div>
                                                <div className="landing__demo-text">
                                                    <span className="landing__demo-role">Administrator</span>
                                                    <span className="landing__demo-desc">Full platform access</span>
                                                </div>
                                            </button>
                                            <button className="landing__demo-persona" onClick={() => onLogin('broker')}>
                                                <div className="landing__demo-icon landing__demo-icon--broker">
                                                    <BarChart3 size={18} />
                                                </div>
                                                <div className="landing__demo-text">
                                                    <span className="landing__demo-role">Broker</span>
                                                    <span className="landing__demo-desc">Sales & commissions</span>
                                                </div>
                                            </button>
                                            <button className="landing__demo-persona" onClick={() => onLogin('member')}>
                                                <div className="landing__demo-icon landing__demo-icon--member">
                                                    <User size={18} />
                                                </div>
                                                <div className="landing__demo-text">
                                                    <span className="landing__demo-role">Member</span>
                                                    <span className="landing__demo-desc">Benefits & care</span>
                                                </div>
                                            </button>
                                            <button className="landing__demo-persona" onClick={() => onLogin('employer')}>
                                                <div className="landing__demo-icon landing__demo-icon--employer">
                                                    <Building2 size={18} />
                                                </div>
                                                <div className="landing__demo-text">
                                                    <span className="landing__demo-role">Employer</span>
                                                    <span className="landing__demo-desc">HR administration</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </main>

                            {/* Compliance Badges */}
                            <motion.section
                                className="landing__compliance-section"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <h3 className="landing__compliance-title">
                                    <ShieldCheck size={18} />
                                    Enterprise-Grade Security & Compliance
                                </h3>
                                <div className="landing__compliance-grid">
                                    {complianceBadges.map((badge) => (
                                        <ComplianceBadge key={badge.name} badge={badge} />
                                    ))}
                                </div>
                            </motion.section>

                            {/* Enterprise Clients */}
                            <motion.section
                                className="landing__enterprise"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <span className="landing__enterprise-label">
                                    <Building2 size={14} />
                                    Trusted by leading healthcare organizations
                                </span>
                                <div className="landing__enterprise-marquee">
                                    <div className="landing__enterprise-track">
                                        {[...enterpriseClients, ...enterpriseClients].map((client, idx) => (
                                            <div key={idx} className="landing__enterprise-logo">
                                                <span className="landing__enterprise-name">{client}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.section>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="modules"
                            className="landing__modules-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Module Grid Header */}
                            <div className="modules-header">
                                <div className="modules-header__content">
                                    <Badge variant="teal" dot>
                                        <Sparkles size={12} /> 40+ Modules
                                    </Badge>
                                    <h2 className="modules-header__title">Platform Modules</h2>
                                    <p className="modules-header__subtitle">
                                        Comprehensive healthcare administration capabilities.
                                        Click any module to explore.
                                    </p>
                                </div>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    icon={<Play size={16} />}
                                    onClick={() => onLogin('admin')}
                                >
                                    Start Full Demo
                                </Button>
                            </div>

                            {/* Category Grid */}
                            <div className="modules-grid">
                                {moduleCategories.map((category, idx) => (
                                    <CategorySection
                                        key={category.id}
                                        category={category}
                                        index={idx}
                                        onNavigate={handleNavigateToModule}
                                    />
                                ))}
                            </div>

                            {/* Compliance Footer */}
                            <div className="modules-footer">
                                <div className="modules-footer__badges">
                                    {complianceBadges.map((badge) => (
                                        <div key={badge.name} className="modules-footer__badge">
                                            <badge.icon size={16} />
                                            <span>{badge.name}</span>
                                            <CheckCircle size={12} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <footer className="landing__footer">
                    <div className="landing__footer-bottom">
                        <span>© 2026 Project Apex Health Intelligence. All rights reserved.</span>
                        <div className="landing__footer-legal">
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                            <a href="#">Security</a>
                            <a href="#">BAA</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default Landing
