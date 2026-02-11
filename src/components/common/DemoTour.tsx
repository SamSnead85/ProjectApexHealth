import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, ChevronLeft, ChevronRight, Play, RotateCcw, Calendar,
    FileText, Shield, Brain, BarChart3, Crown, Users, Building2,
    Target, Activity, Heart, Workflow, Phone, Sparkles, CheckCircle,
    ArrowRight, Clock, Zap, Eye, AlertTriangle, LayoutDashboard
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface DemoTourProps {
    isOpen: boolean
    onClose: () => void
    onNavigate: (path: string) => void
}

interface TourStep {
    id: string
    title: string
    description: string
    path: string
    icon: React.ReactNode
}

interface TourPath {
    id: string
    title: string
    subtitle: string
    description: string
    icon: React.ReactNode
    color: string
    estimatedTime: string
    steps: TourStep[]
}

// ============================================================================
// TOUR PATHS DATA
// ============================================================================

const tourPaths: TourPath[] = [
    {
        id: 'claims-admin',
        title: 'Claims Administrator',
        subtitle: 'Operations & Efficiency',
        description: 'Walk through the claims lifecycle from intake to resolution. See how AI automates adjudication, flags fraud, and manages denials — reducing turnaround by 68%.',
        icon: <FileText size={24} />,
        color: '#0D9488',
        estimatedTime: '6 min',
        steps: [
            {
                id: 'ca-1',
                title: 'Command Center',
                description: 'Your operational nerve center. Real-time KPIs, AI-generated alerts, and a unified view of every claim, authorization, and escalation across the organization.',
                path: '/command-center',
                icon: <LayoutDashboard size={20} />,
            },
            {
                id: 'ca-2',
                title: 'Claims Processing',
                description: 'AI-powered auto-adjudication handles 85% of claims touchlessly. Review the pend queue, view edit logic, and track each claim from receipt through payment.',
                path: '/admin/claims',
                icon: <FileText size={20} />,
            },
            {
                id: 'ca-3',
                title: 'Prior Authorization',
                description: 'Intelligent prior auth workflows that pull clinical evidence automatically. Reduce determination time from days to hours while staying compliant with CMS interoperability rules.',
                path: '/admin/prior-auth',
                icon: <Shield size={20} />,
            },
            {
                id: 'ca-4',
                title: 'Fraud Detection',
                description: 'Machine-learning models analyze billing patterns, provider networks, and member histories in real time. Flag suspicious claims before they\'re paid — not after.',
                path: '/admin/fraud-detection',
                icon: <Brain size={20} />,
            },
            {
                id: 'ca-5',
                title: 'Denial Management',
                description: 'Track denial root causes, auto-generate appeal letters, and monitor overturn rates. The AI suggests corrective actions to prevent recurring denials across payers.',
                path: '/admin/denial-management',
                icon: <AlertTriangle size={20} />,
            },
            {
                id: 'ca-6',
                title: 'Analytics & Insights',
                description: 'Drill into claims lag, cost trends, and processing throughput. Custom dashboards surface the metrics your ops team needs — without SQL or IT requests.',
                path: '/admin/insights',
                icon: <BarChart3 size={20} />,
            },
        ],
    },
    {
        id: 'executive',
        title: 'C-Suite Executive',
        subtitle: 'Strategy & Oversight',
        description: 'See the metrics that matter to leadership. Track MLR, enrollment growth, STAR ratings, and financial performance with board-ready visualizations.',
        icon: <Crown size={24} />,
        color: '#8B5CF6',
        estimatedTime: '5 min',
        steps: [
            {
                id: 'ex-1',
                title: 'Executive Dashboard',
                description: 'A single pane of glass for C-suite oversight. Monitor total claims cost, MLR, member enrollment, and provider satisfaction with real-time benchmarking.',
                path: '/admin/executive-dashboard',
                icon: <Crown size={20} />,
            },
            {
                id: 'ex-2',
                title: 'Advanced Analytics',
                description: 'Predictive models and trend analysis across every line of business. Identify emerging risks, forecast expenses, and surface optimization opportunities.',
                path: '/admin/insights',
                icon: <BarChart3 size={20} />,
            },
            {
                id: 'ex-3',
                title: 'STAR Ratings',
                description: 'Track CMS Star Ratings across all contracts and measures. See where you\'re excelling, where gaps exist, and what initiatives will move the needle.',
                path: '/admin/star-ratings',
                icon: <Target size={20} />,
            },
            {
                id: 'ex-4',
                title: 'Population Health',
                description: 'Stratify your member population by risk, chronic conditions, and social determinants. Drive targeted interventions that improve outcomes and reduce costs.',
                path: '/admin/social-determinants',
                icon: <Heart size={20} />,
            },
            {
                id: 'ex-5',
                title: 'Board Report Generator',
                description: 'Auto-generate comprehensive board packages with the latest financials, quality metrics, and strategic KPIs. Export to PDF or present directly from the platform.',
                path: '/admin/sir',
                icon: <Activity size={20} />,
            },
        ],
    },
    {
        id: 'evaluator',
        title: 'Platform Evaluator',
        subtitle: 'Full Capabilities Tour',
        description: 'A comprehensive walkthrough of every major module. Ideal for RFP evaluations, technical assessments, and stakeholder demonstrations.',
        icon: <Eye size={24} />,
        color: '#F59E0B',
        estimatedTime: '10 min',
        steps: [
            {
                id: 'ev-1',
                title: 'Command Center',
                description: 'The unified operations hub that aggregates every signal across your health plan. AI-prioritized alerts, real-time queues, and instant navigation to any workflow.',
                path: '/command-center',
                icon: <LayoutDashboard size={20} />,
            },
            {
                id: 'ev-2',
                title: 'Claims Processing',
                description: 'End-to-end claims management with AI adjudication, configurable edit libraries, and real-time status tracking. Processes 500M+ claims annually at 99.99% uptime.',
                path: '/admin/claims',
                icon: <FileText size={20} />,
            },
            {
                id: 'ev-3',
                title: 'Member 360°',
                description: 'A holistic view of every member — eligibility, claims history, care gaps, risk scores, and engagement activity in a single longitudinal record.',
                path: '/admin/member-360',
                icon: <Users size={20} />,
            },
            {
                id: 'ev-4',
                title: 'Provider Network',
                description: 'Manage contracts, credentialing, network adequacy, and performance scorecards. GeoJSON mapping ensures every member has access to in-network care.',
                path: '/admin/providers',
                icon: <Building2 size={20} />,
            },
            {
                id: 'ev-5',
                title: 'Compliance Center',
                description: 'HIPAA, HITRUST, SOC 2, and CMS audit trails in one place. Automated policy enforcement, real-time monitoring, and one-click evidence export.',
                path: '/admin/compliance-center',
                icon: <Shield size={20} />,
            },
            {
                id: 'ev-6',
                title: 'AI Workflow Builder',
                description: 'Drag-and-drop workflow canvas with 50+ pre-built healthcare nodes. Build, test, and deploy automation for claims, auth, outreach, and more — no code required.',
                path: '/admin/workflows',
                icon: <Workflow size={20} />,
            },
            {
                id: 'ev-7',
                title: 'Voice Agents',
                description: 'AI-powered voice agents handle member calls for eligibility, claims status, and appointment scheduling. Real-time sentiment analysis and seamless live-agent handoff.',
                path: '/admin/voice-agent-builder',
                icon: <Phone size={20} />,
            },
            {
                id: 'ev-8',
                title: 'Analytics Suite',
                description: 'From operational dashboards to predictive modeling — the analytics layer that ties it all together. Custom reports, scheduled exports, and embedded BI.',
                path: '/admin/insights',
                icon: <BarChart3 size={20} />,
            },
        ],
    },
]

// ============================================================================
// STYLES
// ============================================================================

const s = {
    overlay: {
        position: 'fixed' as const,
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
    } as React.CSSProperties,

    entryModal: {
        background: 'rgba(10, 15, 26, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '820px',
        width: '90vw',
        maxHeight: '90vh',
        overflowY: 'auto' as const,
        backdropFilter: 'blur(40px)',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.5)',
    } as React.CSSProperties,

    entryHeader: {
        textAlign: 'center' as const,
        marginBottom: '36px',
    } as React.CSSProperties,

    entryBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.25), rgba(13, 148, 136, 0.08))',
        border: '1px solid rgba(13, 148, 136, 0.35)',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#0D9488',
        letterSpacing: '0.05em',
        textTransform: 'uppercase' as const,
        marginBottom: '16px',
    } as React.CSSProperties,

    entryTitle: {
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--apex-white, #ffffff)',
        margin: '0 0 8px 0',
        letterSpacing: '-0.02em',
    } as React.CSSProperties,

    entrySubtitle: {
        fontSize: '15px',
        color: 'var(--apex-steel, #8892a4)',
        margin: 0,
        lineHeight: 1.6,
    } as React.CSSProperties,

    pathsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
    } as React.CSSProperties,

    pathCard: (color: string, isHovered: boolean) => ({
        background: isHovered
            ? `linear-gradient(135deg, ${color}15, rgba(10, 15, 26, 0.8))`
            : 'rgba(10, 15, 26, 0.6)',
        border: isHovered
            ? `1px solid ${color}40`
            : '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
        position: 'relative' as const,
        overflow: 'hidden',
    } as React.CSSProperties),

    pathIconWrap: (color: string) => ({
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: `linear-gradient(135deg, ${color}30, ${color}10)`,
        border: `1px solid ${color}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        flexShrink: 0,
    } as React.CSSProperties),

    pathTitle: {
        fontSize: '16px',
        fontWeight: 700,
        color: 'var(--apex-white, #ffffff)',
        margin: 0,
        letterSpacing: '-0.01em',
    } as React.CSSProperties,

    pathSubtitle: {
        fontSize: '12px',
        fontWeight: 500,
        color: 'var(--apex-steel, #8892a4)',
        margin: '2px 0 0 0',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.04em',
    } as React.CSSProperties,

    pathDesc: {
        fontSize: '13px',
        color: 'var(--apex-silver, #a0aab8)',
        lineHeight: 1.6,
        margin: 0,
        flex: 1,
    } as React.CSSProperties,

    pathFooter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    } as React.CSSProperties,

    pathTime: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '12px',
        color: 'var(--apex-steel, #8892a4)',
        fontWeight: 500,
    } as React.CSSProperties,

    pathSteps: {
        fontSize: '12px',
        color: 'var(--apex-steel, #8892a4)',
        fontWeight: 500,
    } as React.CSSProperties,

    closeBtn: {
        position: 'absolute' as const,
        top: '16px',
        right: '16px',
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(255, 255, 255, 0.04)',
        color: 'var(--apex-steel, #8892a4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    } as React.CSSProperties,

    // ── Tour Panel (floating bottom card) ──
    tourOverlay: {
        position: 'fixed' as const,
        inset: 0,
        zIndex: 9998,
        background: 'rgba(0, 0, 0, 0.35)',
        pointerEvents: 'none' as const,
    } as React.CSSProperties,

    tourPanel: {
        position: 'fixed' as const,
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: '680px',
        maxWidth: 'calc(100vw - 48px)',
        background: 'rgba(10, 15, 26, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        backdropFilter: 'blur(40px)',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
    } as React.CSSProperties,

    progressBar: {
        height: '3px',
        background: 'rgba(255, 255, 255, 0.04)',
        width: '100%',
    } as React.CSSProperties,

    progressFill: (progress: number) => ({
        height: '100%',
        background: 'linear-gradient(90deg, #0D9488, #14B8A6)',
        borderRadius: '0 2px 2px 0',
        width: `${progress}%`,
        transition: 'width 0.4s ease',
    } as React.CSSProperties),

    tourBody: {
        padding: '24px 28px 20px',
    } as React.CSSProperties,

    tourTopRow: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '16px',
    } as React.CSSProperties,

    tourStepLabel: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#0D9488',
        letterSpacing: '0.05em',
        textTransform: 'uppercase' as const,
        margin: 0,
    } as React.CSSProperties,

    tourCloseBtn: {
        width: '28px',
        height: '28px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'transparent',
        color: 'var(--apex-steel, #8892a4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
    } as React.CSSProperties,

    tourContent: {
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
    } as React.CSSProperties,

    tourIcon: {
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.20), rgba(13, 148, 136, 0.06))',
        border: '1px solid rgba(13, 148, 136, 0.30)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#14B8A6',
        flexShrink: 0,
    } as React.CSSProperties,

    tourTextWrap: {
        flex: 1,
        minWidth: 0,
    } as React.CSSProperties,

    tourTitle: {
        fontSize: '18px',
        fontWeight: 700,
        color: 'var(--apex-white, #ffffff)',
        margin: '0 0 6px 0',
        letterSpacing: '-0.01em',
    } as React.CSSProperties,

    tourDesc: {
        fontSize: '14px',
        color: 'var(--apex-silver, #a0aab8)',
        lineHeight: 1.65,
        margin: 0,
    } as React.CSSProperties,

    tourActions: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    } as React.CSSProperties,

    tourNavBtns: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    } as React.CSSProperties,

    btnSecondary: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        background: 'rgba(255, 255, 255, 0.04)',
        color: 'var(--apex-silver, #a0aab8)',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    } as React.CSSProperties,

    btnPrimary: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 20px',
        borderRadius: '10px',
        border: '1px solid rgba(13, 148, 136, 0.4)',
        background: 'linear-gradient(135deg, #0D9488, #0F766E)',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
    } as React.CSSProperties,

    btnNavigate: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '10px',
        border: '1px solid rgba(13, 148, 136, 0.25)',
        background: 'rgba(13, 148, 136, 0.10)',
        color: '#14B8A6',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    } as React.CSSProperties,

    // ── Completion CTA ──
    completionCard: {
        background: 'rgba(10, 15, 26, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '48px 40px',
        maxWidth: '520px',
        width: '90vw',
        textAlign: 'center' as const,
        backdropFilter: 'blur(40px)',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.5)',
    } as React.CSSProperties,

    completionIcon: {
        width: '64px',
        height: '64px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.25), rgba(13, 148, 136, 0.08))',
        border: '1px solid rgba(13, 148, 136, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#14B8A6',
        margin: '0 auto 24px',
    } as React.CSSProperties,

    completionTitle: {
        fontSize: '24px',
        fontWeight: 700,
        color: 'var(--apex-white, #ffffff)',
        margin: '0 0 8px 0',
        letterSpacing: '-0.02em',
    } as React.CSSProperties,

    completionSubtitle: {
        fontSize: '15px',
        color: 'var(--apex-steel, #8892a4)',
        margin: '0 0 32px 0',
        lineHeight: 1.6,
    } as React.CSSProperties,

    scheduleBtnLarge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 32px',
        borderRadius: '12px',
        border: '1px solid rgba(13, 148, 136, 0.4)',
        background: 'linear-gradient(135deg, #0D9488, #0F766E)',
        color: '#ffffff',
        fontSize: '15px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 8px 24px rgba(13, 148, 136, 0.3)',
        marginBottom: '16px',
    } as React.CSSProperties,

    restartLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        border: 'none',
        background: 'transparent',
        color: 'var(--apex-steel, #8892a4)',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    } as React.CSSProperties,

    // ── Step dots in tour panel ──
    stepDots: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    } as React.CSSProperties,

    stepDot: (isActive: boolean, isCompleted: boolean) => ({
        width: isActive ? '20px' : '8px',
        height: '8px',
        borderRadius: '4px',
        background: isActive
            ? '#0D9488'
            : isCompleted
                ? 'rgba(13, 148, 136, 0.5)'
                : 'rgba(255, 255, 255, 0.12)',
        transition: 'all 0.3s ease',
    } as React.CSSProperties),
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DemoTour({ isOpen, onClose, onNavigate }: DemoTourProps) {
    const [phase, setPhase] = useState<'select' | 'touring' | 'complete'>('select')
    const [selectedPath, setSelectedPath] = useState<TourPath | null>(null)
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [hoveredPath, setHoveredPath] = useState<string | null>(null)

    // Reset when closed
    useEffect(() => {
        if (!isOpen) {
            setPhase('select')
            setSelectedPath(null)
            setCurrentStepIndex(0)
            setHoveredPath(null)
        }
    }, [isOpen])

    // Escape key handler
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose()
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    const handleSelectPath = useCallback((path: TourPath) => {
        setSelectedPath(path)
        setCurrentStepIndex(0)
        setPhase('touring')
    }, [])

    const handleNext = useCallback(() => {
        if (!selectedPath) return
        if (currentStepIndex < selectedPath.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1)
        } else {
            setPhase('complete')
        }
    }, [selectedPath, currentStepIndex])

    const handlePrev = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1)
        }
    }, [currentStepIndex])

    const handleNavigateStep = useCallback(() => {
        if (!selectedPath) return
        const step = selectedPath.steps[currentStepIndex]
        onNavigate(step.path)
    }, [selectedPath, currentStepIndex, onNavigate])

    const handleRestart = useCallback(() => {
        setPhase('select')
        setSelectedPath(null)
        setCurrentStepIndex(0)
    }, [])

    if (!isOpen) return null

    const currentStep = selectedPath?.steps[currentStepIndex]
    const totalSteps = selectedPath?.steps.length ?? 0
    const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0

    return (
        <AnimatePresence mode="wait">
            {/* ─── PHASE: Role Selection ─── */}
            {phase === 'select' && (
                <motion.div
                    key="select-overlay"
                    style={s.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        style={{ ...s.entryModal, position: 'relative' as const }}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <button
                            style={s.closeBtn}
                            onClick={onClose}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
                                ;(e.currentTarget as HTMLElement).style.color = '#fff'
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                                ;(e.currentTarget as HTMLElement).style.color = 'var(--apex-steel, #8892a4)'
                            }}
                            aria-label="Close demo tour"
                        >
                            <X size={16} />
                        </button>

                        <div style={s.entryHeader}>
                            <div style={s.entryBadge}>
                                <Play size={12} />
                                Interactive Demo
                            </div>
                            <h2 style={s.entryTitle}>Choose Your Demo Experience</h2>
                            <p style={s.entrySubtitle}>
                                Select a guided path tailored to your role. Each tour highlights the features and workflows that matter most to you.
                            </p>
                        </div>

                        <div style={s.pathsGrid}>
                            {tourPaths.map(path => (
                                <motion.div
                                    key={path.id}
                                    style={s.pathCard(path.color, hoveredPath === path.id)}
                                    onMouseEnter={() => setHoveredPath(path.id)}
                                    onMouseLeave={() => setHoveredPath(null)}
                                    onClick={() => handleSelectPath(path)}
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div style={s.pathIconWrap(path.color)}>
                                        {path.icon}
                                    </div>
                                    <div>
                                        <h3 style={s.pathTitle}>{path.title}</h3>
                                        <p style={s.pathSubtitle}>{path.subtitle}</p>
                                    </div>
                                    <p style={s.pathDesc}>{path.description}</p>
                                    <div style={s.pathFooter}>
                                        <span style={s.pathTime}>
                                            <Clock size={13} />
                                            {path.estimatedTime}
                                        </span>
                                        <span style={s.pathSteps}>
                                            {path.steps.length} steps
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* ─── PHASE: Step-by-step Tour ─── */}
            {phase === 'touring' && currentStep && (
                <>
                    <motion.div
                        key="tour-scrim"
                        style={s.tourOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                    <motion.div
                        key="tour-panel"
                        style={s.tourPanel}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Progress bar */}
                        <div style={s.progressBar}>
                            <motion.div
                                style={s.progressFill(progress)}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                            />
                        </div>

                        <div style={s.tourBody}>
                            {/* Top row: step label + dots + close */}
                            <div style={s.tourTopRow}>
                                <div>
                                    <p style={s.tourStepLabel}>
                                        Step {currentStepIndex + 1} of {totalSteps} — {selectedPath?.title}
                                    </p>
                                    <div style={{ ...s.stepDots, marginTop: '10px' }}>
                                        {selectedPath?.steps.map((_, i) => (
                                            <div
                                                key={i}
                                                style={s.stepDot(i === currentStepIndex, i < currentStepIndex)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <button
                                    style={s.tourCloseBtn}
                                    onClick={onClose}
                                    aria-label="Close tour"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Step content */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep.id}
                                    style={s.tourContent}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <div style={s.tourIcon}>
                                        {currentStep.icon}
                                    </div>
                                    <div style={s.tourTextWrap}>
                                        <h3 style={s.tourTitle}>{currentStep.title}</h3>
                                        <p style={s.tourDesc}>{currentStep.description}</p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Action buttons */}
                            <div style={s.tourActions}>
                                <div style={s.tourNavBtns}>
                                    <button
                                        style={{
                                            ...s.btnSecondary,
                                            opacity: currentStepIndex === 0 ? 0.4 : 1,
                                            pointerEvents: currentStepIndex === 0 ? 'none' : 'auto',
                                        }}
                                        onClick={handlePrev}
                                    >
                                        <ChevronLeft size={14} />
                                        Previous
                                    </button>
                                    <button
                                        style={s.btnNavigate}
                                        onClick={handleNavigateStep}
                                    >
                                        <ArrowRight size={14} />
                                        Navigate
                                    </button>
                                </div>
                                <button
                                    style={s.btnPrimary}
                                    onClick={handleNext}
                                >
                                    {currentStepIndex === totalSteps - 1 ? 'Finish Tour' : 'Next'}
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}

            {/* ─── PHASE: Completion CTA ─── */}
            {phase === 'complete' && (
                <motion.div
                    key="complete-overlay"
                    style={s.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        style={s.completionCard}
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 24 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div style={s.completionIcon}>
                            <CheckCircle size={28} />
                        </div>
                        <h2 style={s.completionTitle}>
                            Ready to see your data in Apex?
                        </h2>
                        <p style={s.completionSubtitle}>
                            You've completed the {selectedPath?.title} tour. Schedule a personalized demo to see how Apex transforms your specific workflows.
                        </p>
                        <div>
                            <button
                                style={s.scheduleBtnLarge}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                                    ;(e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(13, 148, 136, 0.4)'
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                                    ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(13, 148, 136, 0.3)'
                                }}
                            >
                                <Calendar size={18} />
                                Schedule a Live Demo
                            </button>
                        </div>
                        <div>
                            <button
                                style={s.restartLink}
                                onClick={handleRestart}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.color = 'var(--apex-white, #fff)'
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.color = 'var(--apex-steel, #8892a4)'
                                }}
                            >
                                <RotateCcw size={14} />
                                Restart Tour
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default DemoTour
