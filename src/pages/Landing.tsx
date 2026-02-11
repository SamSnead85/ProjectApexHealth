import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
    Lock, User, ArrowRight, Shield, Zap, BarChart3, Brain, Activity,
    Globe, Play, Sparkles, CheckCircle, TrendingUp, Award, Clock,
    DollarSign, Heart, Building2, FileText, Users, Stethoscope,
    CreditCard, AlertTriangle, Network, ClipboardCheck, Calculator,
    Workflow, Eye, Pill, Video, MessageSquare, FileCheck, Settings,
    ChevronRight, Search, Star, BadgeCheck, ShieldCheck, Scale,
    Landmark, Server, Database, Lock as LockIcon, Cpu, Check,
    ChevronDown, ArrowDown, Quote, Minus, Plus, Phone, Bot, Layers,
    Target, Monitor, Cloud, Wifi
} from 'lucide-react'
import { Button, Input, Badge, GlassCard } from '../components/common'
import { useToast } from '../components/common/Toast'
import './Landing.css'

// ============================================================================
// DATA
// ============================================================================

const platformStats = [
    { value: 500, suffix: 'M+', label: 'Claims Processed', icon: FileText },
    { value: 4.2, suffix: 'B', prefix: '$', label: 'Savings Identified', icon: DollarSign },
    { value: 99.99, suffix: '%', label: 'Platform Uptime', icon: Zap },
    { value: 12, suffix: 'M+', label: 'Members Served', icon: Users },
]

const complianceBadges = [
    { name: 'HIPAA', status: 'Compliant', icon: Shield },
    { name: 'HITRUST CSF', status: 'r2 Certified', icon: ShieldCheck },
    { name: 'SOC 2', status: 'Type II', icon: BadgeCheck },
    { name: 'CMS EDE', status: 'Certified', icon: Landmark },
]

const enterpriseClients = [
    'Blue Shield', 'Aetna', 'Kaiser Permanente', 'UnitedHealth',
    'Cigna', 'Humana', 'Anthem', 'Centene'
]

const testimonials = [
    {
        quote: "Apex reduced our claims processing time by 68% and eliminated $2.3M in annual FWA losses. The AI-powered adjudication engine is unlike anything else on the market.",
        name: "Sarah Chen",
        title: "SVP, Claims Operations",
        company: "Pacific Health Partners",
        initials: "SC",
        metric: "68%",
        metricLabel: "Faster Processing"
    },
    {
        quote: "We evaluated TriZetto, QNXT, and HealthEdge before choosing Apex. The modern UX alone saves our team 4 hours per day. The ROI was evident within 90 days.",
        name: "Marcus Williams",
        title: "CTO",
        company: "Meridian Benefits Group",
        initials: "MW",
        metric: "4hrs",
        metricLabel: "Saved Daily"
    },
    {
        quote: "Our denial rate dropped from 14.2% to 4.8% after implementing Apex's predictive analytics. The AI pre-screens every claim before submission — it's a game changer.",
        name: "Dr. Rebecca Torres",
        title: "Chief Medical Officer",
        company: "Summit Health Plan",
        initials: "RT",
        metric: "66%",
        metricLabel: "Fewer Denials"
    },
    {
        quote: "The member portal transformed our CAHPS scores. Members actually love using it — our satisfaction rating went from 3.8 to 4.7 stars in one enrollment cycle.",
        name: "James Park",
        title: "VP, Member Experience",
        company: "Horizon Care Network",
        initials: "JP",
        metric: "4.7★",
        metricLabel: "Member Rating"
    },
]

const comparisonFeatures = [
    { feature: 'AI-Native Architecture', apex: true, legacy: false },
    { feature: 'Real-Time Claims Adjudication', apex: true, legacy: false },
    { feature: 'Agentic Workflow Builder', apex: true, legacy: false },
    { feature: 'Voice AI Call Center', apex: true, legacy: false },
    { feature: 'FHIR R4 & CMS-0057-F Ready', apex: true, legacy: 'partial' as const },
    { feature: 'Predictive Fraud Detection', apex: true, legacy: false },
    { feature: 'Modern Dark/Light UI', apex: true, legacy: false },
    { feature: 'Modular Standalone Licensing', apex: true, legacy: false },
    { feature: 'Sub-3 Day Implementation', apex: true, legacy: false },
    { feature: 'HIPAA + SOC 2 + HITRUST', apex: true, legacy: true },
]

const pricingTiers = [
    {
        name: 'Essentials',
        price: 'Custom',
        period: 'per member/month',
        description: 'Core claims and benefits administration for growing organizations.',
        features: [
            'Claims processing & adjudication',
            'Member eligibility verification',
            'Provider directory',
            'Basic analytics dashboard',
            'EDI 837/835 transactions',
            'Standard compliance reporting',
            'Email support',
        ],
        cta: 'Contact Sales',
        popular: false
    },
    {
        name: 'Professional',
        price: 'Custom',
        period: 'per member/month',
        description: 'Advanced intelligence and automation for mid-market payers and TPAs.',
        features: [
            'Everything in Essentials',
            'AI-powered fraud detection',
            'Predictive claims analytics',
            'Prior authorization automation',
            'Denial management center',
            'FHIR R4 API suite',
            'Custom workflow builder',
            'Dedicated success manager',
        ],
        cta: 'Contact Sales',
        popular: true
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: 'per member/month',
        description: 'Full platform with AI agents, voice center, and white-label capabilities.',
        features: [
            'Everything in Professional',
            'Voice AI call center',
            'Document intelligence (OCR)',
            'Population health analytics',
            'STAR ratings & HEDIS dashboard',
            'White-label branding',
            'SSO / SAML integration',
            'Dedicated infrastructure',
            '24/7 premium support + SLA',
        ],
        cta: 'Schedule Demo',
        popular: false
    },
]

const integrations = [
    { name: 'Epic', category: 'EHR' },
    { name: 'Cerner', category: 'EHR' },
    { name: 'athenahealth', category: 'EHR' },
    { name: 'Availity', category: 'Clearinghouse' },
    { name: 'Change Healthcare', category: 'Clearinghouse' },
    { name: 'Trizetto', category: 'Clearinghouse' },
    { name: 'Surescripts', category: 'PBM' },
    { name: 'Express Scripts', category: 'PBM' },
    { name: 'Salesforce', category: 'CRM' },
    { name: 'Workday', category: 'HR' },
    { name: 'AWS', category: 'Cloud' },
    { name: 'Azure', category: 'Cloud' },
    { name: 'Snowflake', category: 'Data' },
    { name: 'Tableau', category: 'Analytics' },
    { name: 'Okta', category: 'Identity' },
    { name: 'DocuSign', category: 'Workflow' },
]

const faqs = [
    {
        q: "How long does implementation take?",
        a: "Most organizations are live within 8-12 weeks. Our modular architecture allows phased rollouts — start with claims processing and expand to additional modules over time. We handle data migration, EDI testing, and user training as part of onboarding."
    },
    {
        q: "Is Apex compliant with HIPAA, HITRUST, and SOC 2?",
        a: "Yes. Apex maintains HIPAA compliance, HITRUST CSF r2 certification, and SOC 2 Type II attestation. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We provide a signed BAA and undergo annual third-party security audits."
    },
    {
        q: "Can we use individual modules standalone?",
        a: "Absolutely. Every module (Claims, Eligibility, Provider Network, Analytics, etc.) is independently licensable and works as a standalone product. They also share data seamlessly when used together, giving you a unified platform experience without vendor lock-in."
    },
    {
        q: "How does the AI-powered claims adjudication work?",
        a: "Our adjudication engine uses ML models trained on millions of claims to auto-adjudicate clean claims in real-time. It cross-references benefit configurations, provider contracts, medical policies, and historical patterns to make determinations — flagging only edge cases for human review. First-pass rates average 94%+."
    },
    {
        q: "What EDI transactions are supported?",
        a: "All HIPAA-mandated X12 transactions: 837 (claims), 835 (remittance), 270/271 (eligibility), 276/277 (claim status), 278 (prior auth), 834 (enrollment), and 820 (premium payment). We also support FHIR R4 APIs for CMS-0057-F compliance."
    },
    {
        q: "Can we white-label the member portal?",
        a: "Yes. Enterprise customers can fully customize branding, colors, logos, domain, and email templates. The member-facing portal, digital ID cards, and communications can all be branded to your organization."
    },
]

const moduleCategories = [
    { id: 'claims', name: 'Claims Intelligence', description: 'AI-powered adjudication and payment integrity', icon: FileText,
        modules: [
            { name: 'Claims Processing', path: '/claims', icon: FileText, desc: 'Intelligent adjudication engine' },
            { name: 'Prior Authorization', path: '/prior-auth', icon: ClipboardCheck, desc: 'AI-assisted pre-approval' },
            { name: 'Fraud Detection', path: '/fraud-detection', icon: AlertTriangle, desc: 'ML anomaly detection' },
            { name: 'Payment Integrity', path: '/payment-processing', icon: CreditCard, desc: 'Error prevention system' },
            { name: 'Appeals Management', path: '/appeals', icon: Scale, desc: 'Dispute resolution workflow' },
            { name: 'EOB Viewer', path: '/eob', icon: FileCheck, desc: 'Explanation of benefits' },
        ]
    },
    { id: 'provider', name: 'Provider Network', description: 'Network management and credentialing', icon: Stethoscope,
        modules: [
            { name: 'Provider Directory', path: '/providers', icon: Search, desc: 'Find in-network providers' },
            { name: 'Credentialing', path: '/credentialing', icon: BadgeCheck, desc: 'Provider verification' },
            { name: 'Network Adequacy', path: '/network-adequacy', icon: Network, desc: 'Coverage analysis' },
            { name: 'Fee Schedules', path: '/fee-schedule', icon: DollarSign, desc: 'Rate management' },
            { name: 'Provider Portal', path: '/provider-portal', icon: Building2, desc: 'Self-service tools' },
        ]
    },
    { id: 'member', name: 'Member Experience', description: 'Digital-first member engagement', icon: Heart,
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
    { id: 'analytics', name: 'Analytics & AI', description: 'Predictive insights and reporting', icon: Brain,
        modules: [
            { name: 'Executive Dashboard', path: '/executive', icon: BarChart3, desc: 'C-suite insights' },
            { name: 'Advanced Analytics', path: '/advanced-analytics', icon: Brain, desc: 'AI-powered analysis' },
            { name: 'Population Health', path: '/population-health', icon: Users, desc: 'Cohort analytics' },
            { name: 'Claims Prediction', path: '/claims-prediction', icon: TrendingUp, desc: 'Forecasting engine' },
            { name: 'Value-Based Care', path: '/value-based-care', icon: Award, desc: 'Quality metrics' },
            { name: 'Custom Reports', path: '/report-builder', icon: FileText, desc: 'Report builder' },
        ]
    },
    { id: 'compliance', name: 'Compliance & Security', description: 'Regulatory adherence and audit readiness', icon: Shield,
        modules: [
            { name: 'Compliance Center', path: '/compliance-center', icon: ShieldCheck, desc: 'Regulatory hub' },
            { name: 'Audit Dashboard', path: '/audit', icon: Eye, desc: 'Activity tracking' },
            { name: 'HIPAA Controls', path: '/compliance', icon: Lock, desc: 'Privacy management' },
            { name: 'CMS EDE Portal', path: '/regulatory-hub', icon: Landmark, desc: 'Marketplace integration' },
            { name: 'Data Integration', path: '/data-integration', icon: Database, desc: 'EDI management' },
        ]
    },
    { id: 'operations', name: 'Operations & Admin', description: 'Platform management and workflows', icon: Settings,
        modules: [
            { name: 'Workflow Builder', path: '/workflows', icon: Workflow, desc: 'Process automation' },
            { name: 'Task Queue', path: '/task-queue', icon: ClipboardCheck, desc: 'Work management' },
            { name: 'User Management', path: '/user-management', icon: Users, desc: 'Access control' },
            { name: 'System Health', path: '/system-health', icon: Server, desc: 'Monitoring' },
            { name: 'API Management', path: '/api-management', icon: Cpu, desc: 'Developer tools' },
        ]
    },
]

const moduleImages: Record<string, string> = {
    '/claims': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop',
    '/prior-auth': 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=300&fit=crop',
    '/fraud-detection': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop',
    '/payment-processing': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
    '/appeals': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
    '/eob': 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&h=300&fit=crop',
    '/providers': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop',
    '/credentialing': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
    '/network-adequacy': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop',
    '/fee-schedule': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop',
    '/provider-portal': 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=300&fit=crop',
    '/member-360': 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&h=300&fit=crop',
    '/benefits': 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400&h=300&fit=crop',
    '/care-journey': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop',
    '/digital-id': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
    '/hsa': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
    '/telehealth': 'https://images.unsplash.com/photo-1609904288889-79629be02c85?w=400&h=300&fit=crop',
    '/pharmacy': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop',
    '/executive': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    '/advanced-analytics': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    '/population-health': 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=400&h=300&fit=crop',
    '/claims-prediction': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    '/value-based-care': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop',
    '/report-builder': 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop',
    '/compliance-center': 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=400&h=300&fit=crop',
    '/audit': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop',
    '/compliance': 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=400&h=300&fit=crop',
    '/regulatory-hub': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
    '/data-integration': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
    '/workflows': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
    '/task-queue': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop',
    '/user-management': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    '/system-health': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
    '/api-management': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
}

// ============================================================================
// ANIMATED COUNTER HOOK
// ============================================================================
function useAnimatedCounter(end: number, duration = 2000, startOnView = false, isInView = true) {
    const [count, setCount] = useState(0)
    const started = useRef(false)
    useEffect(() => {
        if (startOnView && !isInView) return
        if (started.current) return
        started.current = true
        const startTime = performance.now()
        const tick = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
            setCount(eased * end)
            if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
    }, [end, duration, startOnView, isInView])
    return count
}

function AnimatedStat({ stat, isInView }: { stat: typeof platformStats[0]; isInView: boolean }) {
    const count = useAnimatedCounter(stat.value, 2200, true, isInView)
    const display = stat.value % 1 !== 0 ? count.toFixed(stat.value < 10 ? 1 : 0) : Math.round(count).toLocaleString()
    return (
        <div className="landing__stat">
            <span className="landing__stat-value">{stat.prefix || ''}{display}{stat.suffix}</span>
            <span className="landing__stat-label">{stat.label}</span>
        </div>
    )
}

// ============================================================================
// ROI CALCULATOR
// ============================================================================
function ROICalculator() {
    const [claimsVolume, setClaimsVolume] = useState(100000)
    const [denialRate, setDenialRate] = useState(12)
    const [adminCostPerClaim, setAdminCostPerClaim] = useState(8)

    const projectedDenialRate = Math.max(denialRate * 0.35, 2)
    const denialSavings = (denialRate - projectedDenialRate) / 100 * claimsVolume * 250
    const adminSavings = claimsVolume * adminCostPerClaim * 0.45
    const fraudSavings = claimsVolume * 0.015 * 450
    const totalSavings = denialSavings + adminSavings + fraudSavings

    return (
        <div className="roi-calculator">
            <div className="roi-calculator__inputs">
                <div className="roi-input-group">
                    <label>Annual Claims Volume</label>
                    <input type="range" min={10000} max={2000000} step={10000} value={claimsVolume}
                        onChange={e => setClaimsVolume(Number(e.target.value))} />
                    <span className="roi-input-value">{claimsVolume.toLocaleString()}</span>
                </div>
                <div className="roi-input-group">
                    <label>Current Denial Rate</label>
                    <input type="range" min={2} max={25} step={0.5} value={denialRate}
                        onChange={e => setDenialRate(Number(e.target.value))} />
                    <span className="roi-input-value">{denialRate}%</span>
                </div>
                <div className="roi-input-group">
                    <label>Admin Cost Per Claim</label>
                    <input type="range" min={2} max={25} step={0.5} value={adminCostPerClaim}
                        onChange={e => setAdminCostPerClaim(Number(e.target.value))} />
                    <span className="roi-input-value">${adminCostPerClaim}</span>
                </div>
            </div>
            <div className="roi-calculator__results">
                <div className="roi-result-card roi-result-card--total">
                    <DollarSign size={24} />
                    <div className="roi-result-value">${(totalSavings / 1000000).toFixed(1)}M</div>
                    <div className="roi-result-label">Projected Annual Savings</div>
                </div>
                <div className="roi-result-card">
                    <TrendingUp size={18} />
                    <div className="roi-result-value">${(denialSavings / 1000000).toFixed(1)}M</div>
                    <div className="roi-result-label">Denial Recovery</div>
                </div>
                <div className="roi-result-card">
                    <Zap size={18} />
                    <div className="roi-result-value">${(adminSavings / 1000000).toFixed(1)}M</div>
                    <div className="roi-result-label">Admin Efficiency</div>
                </div>
                <div className="roi-result-card">
                    <Shield size={18} />
                    <div className="roi-result-value">${(fraudSavings / 1000000).toFixed(1)}M</div>
                    <div className="roi-result-label">Fraud Prevention</div>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// FAQ ACCORDION
// ============================================================================
function FAQItem({ faq, isOpen, onToggle }: { faq: typeof faqs[0]; isOpen: boolean; onToggle: () => void }) {
    return (
        <div className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
            <button className="faq-item__question" onClick={onToggle} aria-expanded={isOpen} aria-label={`FAQ: ${faq.q}`}>
                <span>{faq.q}</span>
                <span className="faq-item__toggle">{isOpen ? <Minus size={18} /> : <Plus size={18} />}</span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="faq-item__answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p>{faq.a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ============================================================================
// MODULE CARD (for modules view)
// ============================================================================
function ModuleCard({ module, onNavigate, isNew = false }: { module: any; onNavigate: () => void; isNew?: boolean }) {
    const imageUrl = moduleImages[module.path] || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop'
    return (
        <motion.button className="module-card" onClick={onNavigate}
            whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <img src={imageUrl} alt={module.name} className="module-card__image" loading="lazy" />
            <div className="module-card__overlay" />
            {isNew && <span className="module-card__badge">NEW</span>}
            <div className="module-card__content">
                <div className="module-card__icon"><module.icon size={18} /></div>
                <h4 className="module-card__name">{module.name}</h4>
                <p className="module-card__desc">{module.desc}</p>
            </div>
        </motion.button>
    )
}

const CategorySection = memo(function CategorySection({ category, onNavigate, index }: { category: typeof moduleCategories[0]; onNavigate: (path: string) => void; index: number }) {
    return (
        <motion.section className="category-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}>
            <div className="category-section__header">
                <div className="category-section__icon"><category.icon size={20} strokeWidth={1.5} /></div>
                <div className="category-section__info">
                    <h3 className="category-section__title">{category.name}</h3>
                    <p className="category-section__description">{category.description}</p>
                </div>
                <span className="category-section__count">{category.modules.length} MODULES</span>
            </div>
            <div className="category-section__modules">
                {category.modules.map((module, idx) => (
                    <ModuleCard key={module.path} module={module} onNavigate={() => onNavigate(module.path)} isNew={idx === 0 && index === 0} />
                ))}
            </div>
        </motion.section>
    )
})

// ============================================================================
// MAIN LANDING COMPONENT
// ============================================================================

interface LandingProps {
    onLogin: (portal: 'admin' | 'broker' | 'employer' | 'member') => void
}

export function Landing({ onLogin }: LandingProps) {
    const { addToast } = useToast()
    const [activeView, setActiveView] = useState<'hero' | 'modules'>('hero')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [emailError, setEmailError] = useState('')

    const handleComingSoon = useCallback(() => {
        addToast({
            type: 'info',
            title: 'Feature Coming Soon',
            message: 'Our sales team portal is under development. Try the demo instead!',
            duration: 4000,
        })
    }, [addToast])
    const [isLoading, setIsLoading] = useState(false)
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [showSticky, setShowSticky] = useState(false)

    const statsRef = useRef<HTMLDivElement>(null)
    const statsInView = useInView(statsRef, { once: true, margin: '-100px' })

    // Sticky CTA bar on scroll
    useEffect(() => {
        const onScroll = () => setShowSticky(window.scrollY > 600)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const handleLogin = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        setEmailError('')
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (email && !emailPattern.test(email)) {
            setEmailError('Please enter a valid email address')
            return
        }
        setIsLoading(true)
        setTimeout(() => { onLogin('admin'); setIsLoading(false) }, 800)
    }, [onLogin, email])

    const handleNavigateToModule = useCallback((path: string) => {
        // Store the intended path for post-login navigation
        sessionStorage.setItem('apex_initial_path', path)
        onLogin('admin')
    }, [onLogin])

    return (
        <div className="landing">
            {/* Background */}
            <div className="landing__bg">
                <div className="landing__bg-base" />
                <div className="landing__bg-glow" />
                <div className="landing__bg-grid" />
                <div className="landing__bg-vignette" />
                <div className="landing__bg-noise" />
            </div>

            <div className="landing__container">
                {/* ── HEADER ── */}
                <motion.header className="landing__header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="landing__logo">
                        <div className="landing__logo-mark">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="apexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="50%" stopColor="#06B6D4" />
                                        <stop offset="100%" stopColor="#34d399" />
                                    </linearGradient>
                                    <filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
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
                    <nav className="landing__nav" aria-label="Main navigation">
                        <button onClick={() => setActiveView('hero')} className={activeView === 'hero' ? 'active' : ''} aria-label="View platform overview">Platform</button>
                        <button onClick={() => setActiveView('modules')} className={activeView === 'modules' ? 'active' : ''} aria-label="View platform modules">Modules</button>
                        <a href="#pricing">Pricing</a>
                        <a href="#roi">ROI</a>
                        <a href="#compliance-section">Security</a>
                        <Button variant="ghost" size="sm" onClick={() => onLogin('admin')}>Schedule Demo</Button>
                    </nav>
                </motion.header>

                <AnimatePresence mode="wait">
                    {activeView === 'hero' ? (
                        <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                            {/* ── HERO ── */}
                            <main className="landing__hero">
                                <motion.div className="landing__content" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
                                    <div className="landing__badge"><Brain size={14} /><span>AI-Native Health Payer Operating System</span></div>
                                    <h1 className="landing__headline">Healthcare Intelligence,<br /><span className="landing__headline-em">Unified</span></h1>
                                    <p className="landing__description">
                                        The AI-native platform that transforms healthcare administration.
                                        From claims processing and member experience to provider networks,
                                        compliance, and analytics — all in one intelligent ecosystem.
                                    </p>
                                    <div className="landing__ctas">
                                        <Button size="lg" icon={<Play size={16} />} onClick={() => onLogin('admin')}>Start Demo</Button>
                                        <Button variant="secondary" size="lg" icon={<ArrowRight size={16} />} iconPosition="right" onClick={() => setActiveView('modules')}>Explore Modules</Button>
                                    </div>
                                    <div className="landing__stats" ref={statsRef}>
                                        {platformStats.map((stat, idx) => (
                                            <AnimatedStat key={idx} stat={stat} isInView={statsInView} />
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Login Card */}
                                <motion.div className="landing__card-wrapper" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
                                    <div className="landing__card">
                                        <div className="landing__card-header">
                                            <div className="landing__card-icon"><Shield size={20} /></div>
                                            <h2 className="landing__card-title">Secure Access</h2>
                                            <p className="landing__card-subtitle">Enterprise portal login</p>
                                        </div>
                                        <form onSubmit={handleLogin} className="landing__form">
                                            <Input label="Email" type="email" placeholder="you@company.com" value={email} onChange={e => { setEmail(e.target.value); setEmailError('') }} error={emailError} icon={<User size={18} />} fullWidth />
                                            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} icon={<Lock size={18} />} fullWidth />
                                            <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign In'}</Button>
                                        </form>
                                        <div className="landing__sso"><div className="landing__sso-divider"><span>or continue as</span></div></div>
                                        <div className="landing__demo-personas">
                                            <button className="landing__demo-persona" onClick={() => onLogin('admin')}>
                                                <div className="landing__demo-icon landing__demo-icon--admin"><Shield size={18} /></div>
                                                <div className="landing__demo-text"><span className="landing__demo-role">Administrator</span><span className="landing__demo-desc">Full platform access</span></div>
                                            </button>
                                            <button className="landing__demo-persona" onClick={() => onLogin('broker')}>
                                                <div className="landing__demo-icon landing__demo-icon--broker"><BarChart3 size={18} /></div>
                                                <div className="landing__demo-text"><span className="landing__demo-role">Broker</span><span className="landing__demo-desc">Sales & commissions</span></div>
                                            </button>
                                            <button className="landing__demo-persona" onClick={() => onLogin('member')}>
                                                <div className="landing__demo-icon landing__demo-icon--member"><User size={18} /></div>
                                                <div className="landing__demo-text"><span className="landing__demo-role">Member</span><span className="landing__demo-desc">Benefits & care</span></div>
                                            </button>
                                            <button className="landing__demo-persona" onClick={() => onLogin('employer')}>
                                                <div className="landing__demo-icon landing__demo-icon--employer"><Building2 size={18} /></div>
                                                <div className="landing__demo-text"><span className="landing__demo-role">Employer</span><span className="landing__demo-desc">HR administration</span></div>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </main>

                            {/* ── ENTERPRISE LOGOS ── */}
                            <motion.section className="landing__enterprise" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                                <span className="landing__enterprise-label"><Building2 size={14} />Trusted by leading healthcare organizations</span>
                                <div className="landing__enterprise-marquee">
                                    <div className="landing__enterprise-track">
                                        {[...enterpriseClients, ...enterpriseClients].map((client, idx) => (
                                            <div key={idx} className="landing__enterprise-logo"><span className="landing__enterprise-name">{client}</span></div>
                                        ))}
                                    </div>
                                </div>
                            </motion.section>

                            {/* ── PLATFORM PREVIEW / DEMO SECTION ── */}
                            <section className="landing-section" id="platform-preview">
                                <div className="section-header">
                                    <Badge variant="teal" dot><Monitor size={12} /> Platform Preview</Badge>
                                    <h2 className="section-title">See Apex in Action</h2>
                                    <p className="section-subtitle">A unified command center for every healthcare operation — from claims adjudication to AI-powered insights.</p>
                                </div>
                                <div className="platform-preview-card">
                                    <div className="platform-preview-screen">
                                        <div className="preview-topbar">
                                            <div className="preview-dots"><span /><span /><span /></div>
                                            <span className="preview-url">app.apexhealth.io/command-center</span>
                                        </div>
                                        <div className="preview-content">
                                            <div className="preview-sidebar">
                                                {['Dashboard', 'Claims', 'Eligibility', 'Analytics', 'AI Insights', 'Compliance'].map(item => (
                                                    <div key={item} className="preview-nav-item">{item}</div>
                                                ))}
                                            </div>
                                            <div className="preview-main">
                                                <div className="preview-kpi-row">
                                                    {[
                                                        { label: 'Claims Today', val: '2,847', color: '#10b981' },
                                                        { label: 'Auto-Adjudicated', val: '94.2%', color: '#06b6d4' },
                                                        { label: 'Denial Rate', val: '4.8%', color: '#f59e0b' },
                                                        { label: 'AI Flagged', val: '23', color: '#8b5cf6' },
                                                    ].map(kpi => (
                                                        <div key={kpi.label} className="preview-kpi">
                                                            <div className="preview-kpi-val" style={{ color: kpi.color }}>{kpi.val}</div>
                                                            <div className="preview-kpi-label">{kpi.label}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="preview-chart-area">
                                                    <div className="preview-chart-placeholder">
                                                        {[40, 55, 45, 65, 50, 70, 60, 75, 65, 80, 70, 85].map((h, i) => (
                                                            <div key={i} className="preview-bar" style={{ height: `${h}%` }} />
                                                        ))}
                                                    </div>
                                                    <div className="preview-ai-panel">
                                                        <div className="preview-ai-header"><Brain size={14} /> AI Insights</div>
                                                        <div className="preview-ai-item">12 claims flagged for review</div>
                                                        <div className="preview-ai-item">$420K savings identified</div>
                                                        <div className="preview-ai-item">3 fraud patterns detected</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Button size="lg" icon={<Play size={16} />} onClick={() => onLogin('admin')} style={{ marginTop: '24px' }}>
                                        Launch Interactive Demo
                                    </Button>
                                </div>
                            </section>

                            {/* ── ROI CALCULATOR ── */}
                            <section className="landing-section" id="roi">
                                <div className="section-header">
                                    <Badge variant="teal" dot><Calculator size={12} /> ROI Calculator</Badge>
                                    <h2 className="section-title">Calculate Your Savings</h2>
                                    <p className="section-subtitle">See the projected annual savings from switching to Apex based on your organization's claims profile.</p>
                                </div>
                                <ROICalculator />
                            </section>

                            {/* ── TESTIMONIALS ── */}
                            <section className="landing-section">
                                <div className="section-header">
                                    <Badge variant="teal" dot><Star size={12} /> Customer Stories</Badge>
                                    <h2 className="section-title">Trusted by Industry Leaders</h2>
                                    <p className="section-subtitle">Healthcare organizations achieving measurable results with Apex.</p>
                                </div>
                                <div className="testimonials-grid">
                                    {testimonials.map((t, idx) => (
                                        <motion.div key={idx} className="testimonial-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                                            <div className="testimonial-metric">
                                                <span className="testimonial-metric-value">{t.metric}</span>
                                                <span className="testimonial-metric-label">{t.metricLabel}</span>
                                            </div>
                                            <blockquote className="testimonial-quote">"{t.quote}"</blockquote>
                                            <div className="testimonial-author">
                                                <div className="testimonial-avatar">{t.initials}</div>
                                                <div className="testimonial-info">
                                                    <span className="testimonial-name">{t.name}</span>
                                                    <span className="testimonial-role">{t.title}</span>
                                                    <span className="testimonial-company">{t.company}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>

                            {/* ── WHY APEX COMPARISON ── */}
                            <section className="landing-section">
                                <div className="section-header">
                                    <Badge variant="teal" dot><Zap size={12} /> Why Apex</Badge>
                                    <h2 className="section-title">Built for the Future, Not the Past</h2>
                                    <p className="section-subtitle">See how Apex compares to legacy platforms like TriZetto QNXT and Facets.</p>
                                </div>
                                <div className="comparison-table" role="table" aria-label="Apex vs Legacy platform comparison">
                                    <div className="comparison-header" role="row">
                                        <div className="comparison-feature-col">Feature</div>
                                        <div className="comparison-apex-col">Apex</div>
                                        <div className="comparison-legacy-col">Legacy Platforms</div>
                                    </div>
                                    {comparisonFeatures.map((row, idx) => (
                                        <div key={idx} className="comparison-row" role="row">
                                            <div className="comparison-feature-col">{row.feature}</div>
                                            <div className="comparison-apex-col">
                                                {row.apex ? <CheckCircle size={18} className="comparison-check" /> : <Minus size={18} className="comparison-x" />}
                                            </div>
                                            <div className="comparison-legacy-col">
                                                {row.legacy === true ? <CheckCircle size={18} className="comparison-check comparison-check--muted" /> :
                                                    row.legacy === 'partial' ? <span className="comparison-partial">Partial</span> :
                                                        <Minus size={18} className="comparison-x" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* ── PRICING ── */}
                            <section className="landing-section" id="pricing">
                                <div className="section-header">
                                    <Badge variant="teal" dot><CreditCard size={12} /> Pricing</Badge>
                                    <h2 className="section-title">Transparent, Modular Pricing</h2>
                                    <p className="section-subtitle">Pay only for the modules you need. Scale as you grow.</p>
                                </div>
                                <div className="pricing-grid">
                                    {pricingTiers.map((tier, idx) => (
                                        <motion.div key={idx} className={`pricing-card ${tier.popular ? 'pricing-card--popular' : ''}`}
                                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                                            {tier.popular && <div className="pricing-popular-badge">Most Popular</div>}
                                            <h3 className="pricing-name">{tier.name}</h3>
                                            <div className="pricing-price">
                                                <span className="pricing-amount">{tier.price}</span>
                                                <span className="pricing-period">{tier.period}</span>
                                            </div>
                                            <p className="pricing-description">{tier.description}</p>
                                            <ul className="pricing-features">
                                                {tier.features.map((feat, i) => (
                                                    <li key={i}><Check size={16} className="pricing-check" />{feat}</li>
                                                ))}
                                            </ul>
                                            <Button fullWidth variant={tier.popular ? 'primary' : 'secondary'} onClick={() => { tier.cta === 'Contact Sales' ? handleComingSoon() : onLogin('admin') }}>{tier.cta}</Button>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>

                            {/* ── INTEGRATIONS ── */}
                            <section className="landing-section">
                                <div className="section-header">
                                    <Badge variant="teal" dot><Layers size={12} /> Ecosystem</Badge>
                                    <h2 className="section-title">Connects to Everything</h2>
                                    <p className="section-subtitle">Pre-built integrations with leading healthcare, cloud, and enterprise systems.</p>
                                </div>
                                <div className="integrations-grid">
                                    {integrations.map((int, idx) => (
                                        <div key={idx} className="integration-chip">
                                            <Cloud size={14} />
                                            <span className="integration-name">{int.name}</span>
                                            <span className="integration-cat">{int.category}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* ── COMPLIANCE BADGES ── */}
                            <section className="landing-section" id="compliance-section">
                                <div className="section-header">
                                    <Badge variant="teal" dot><ShieldCheck size={12} /> Security</Badge>
                                    <h2 className="section-title">Enterprise-Grade Security & Compliance</h2>
                                    <p className="section-subtitle">Built from the ground up with healthcare security requirements. Annual audits, encryption everywhere, zero-trust architecture.</p>
                                </div>
                                <div className="landing__compliance-grid">
                                    {complianceBadges.map(badge => (
                                        <motion.div key={badge.name} className="compliance-badge-card" whileHover={{ y: -2 }}>
                                            <div className="compliance-badge-card__icon"><badge.icon size={20} /></div>
                                            <div className="compliance-badge-card__content">
                                                <span className="compliance-badge-card__name">{badge.name}</span>
                                                <span className="compliance-badge-card__status">{badge.status}</span>
                                            </div>
                                            <CheckCircle size={16} className="compliance-badge-card__check" />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>

                            {/* ── FAQ ── */}
                            <section className="landing-section" id="faq">
                                <div className="section-header">
                                    <Badge variant="teal" dot><MessageSquare size={12} /> FAQ</Badge>
                                    <h2 className="section-title">Frequently Asked Questions</h2>
                                </div>
                                <div className="faq-list">
                                    {faqs.map((faq, idx) => (
                                        <FAQItem key={idx} faq={faq} isOpen={openFaq === idx} onToggle={() => setOpenFaq(openFaq === idx ? null : idx)} />
                                    ))}
                                </div>
                            </section>

                            {/* ── CTA BANNER ── */}
                            <section className="cta-banner">
                                <h2>Ready to Transform Healthcare Administration?</h2>
                                <p>Join the organizations saving millions with AI-native claims processing, compliance automation, and member engagement.</p>
                                <div className="cta-banner__buttons">
                                    <Button size="lg" icon={<Play size={16} />} onClick={() => onLogin('admin')}>Start Free Demo</Button>
                                    <Button size="lg" variant="secondary" icon={<Phone size={16} />} onClick={handleComingSoon}>Talk to Sales</Button>
                                </div>
                            </section>

                        </motion.div>
                    ) : (
                        /* ── MODULES VIEW ── */
                        <motion.div key="modules" className="landing__modules-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                            <div className="modules-header">
                                <div className="modules-header__content">
                                    <Badge variant="teal" dot><Sparkles size={12} /> 40+ Modules</Badge>
                                    <h2 className="modules-header__title">Platform Modules</h2>
                                    <p className="modules-header__subtitle">Comprehensive healthcare administration capabilities. Click any module to explore.</p>
                                </div>
                                <Button variant="primary" size="lg" icon={<Play size={16} />} onClick={() => onLogin('admin')}>Start Full Demo</Button>
                            </div>
                            <div className="modules-grid">
                                {moduleCategories.map((category, idx) => (
                                    <CategorySection key={category.id} category={category} index={idx} onNavigate={handleNavigateToModule} />
                                ))}
                            </div>
                            <div className="modules-footer">
                                <div className="modules-footer__badges">
                                    {complianceBadges.map(badge => (
                                        <div key={badge.name} className="modules-footer__badge"><badge.icon size={16} /><span>{badge.name}</span><CheckCircle size={12} /></div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── FOOTER ── */}
                <footer className="landing__footer">
                    <div className="landing__footer-main">
                        <div className="landing__footer-brand">
                            <span className="landing__footer-name">APEX Health Intelligence</span>
                            <p className="landing__footer-desc">The AI-native platform transforming healthcare benefits administration for payers, TPAs, and health plans.</p>
                        </div>
                        <div className="landing__footer-links-grid">
                            <div className="landing__footer-col">
                                <h4>Platform</h4>
                                <a href="#platform-preview">Product Tour</a>
                                <a href="#pricing">Pricing</a>
                                <a href="#roi">ROI Calculator</a>
                                <a href="#faq">FAQ</a>
                            </div>
                            <div className="landing__footer-col">
                                <h4>Solutions</h4>
                                <a href="#">Claims Processing</a>
                                <a href="#">Member Engagement</a>
                                <a href="#">Provider Networks</a>
                                <a href="#">Compliance</a>
                            </div>
                            <div className="landing__footer-col">
                                <h4>Company</h4>
                                <a href="#">About</a>
                                <a href="#">Careers</a>
                                <a href="#">Blog</a>
                                <a href="#">Contact</a>
                            </div>
                        </div>
                    </div>
                    <div className="landing__footer-bottom">
                        <span>&copy; 2026 Project Apex Health Intelligence. All rights reserved.</span>
                        <div className="landing__footer-legal">
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                            <a href="#">Security</a>
                            <a href="#">BAA</a>
                        </div>
                    </div>
                </footer>
            </div>

            {/* ── STICKY CTA BAR ── */}
            <AnimatePresence>
                {showSticky && activeView === 'hero' && (
                    <motion.div className="sticky-cta" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: 'spring', damping: 20 }}>
                        <span className="sticky-cta__text">Ready to see Apex in action?</span>
                        <div className="sticky-cta__buttons">
                            <Button size="sm" onClick={() => onLogin('admin')}>Start Demo</Button>
                            <Button size="sm" variant="secondary" onClick={handleComingSoon}>Contact Sales</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Landing
