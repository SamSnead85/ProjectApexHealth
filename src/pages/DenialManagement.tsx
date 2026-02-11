import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import {
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Brain,
    Sparkles,
    CheckCircle2,
    Clock,
    ArrowRight,
    Send,
    RefreshCw,
    Save,
    Shield,
    FileText,
    Zap,
    Target,
    Flag,
    Layers,
    GitBranch,
    Activity
} from 'lucide-react'
import { PageSkeleton } from '../components/common'

// ============================================
// MOCK DATA
// ============================================

const denialRateTrend = [
    { month: 'Feb', rate: 14.2 },
    { month: 'Mar', rate: 13.5 },
    { month: 'Apr', rate: 12.1 },
    { month: 'May', rate: 11.4 },
    { month: 'Jun', rate: 10.2 },
    { month: 'Jul', rate: 9.1 },
    { month: 'Aug', rate: 8.3 },
    { month: 'Sep', rate: 7.4 },
    { month: 'Oct', rate: 6.5 },
    { month: 'Nov', rate: 5.8 },
    { month: 'Dec', rate: 5.2 },
    { month: 'Jan', rate: 4.8 },
]

const denialCategories = [
    { name: 'Technical', value: 28, color: 'var(--apex-amber, #F59E0B)', description: 'Missing info, wrong codes' },
    { name: 'Clinical', value: 24, color: 'var(--apex-red, #EF4444)', description: 'Medical necessity' },
    { name: 'Authorization', value: 22, color: 'var(--apex-purple, #8B5CF6)', description: 'No prior auth' },
    { name: 'Eligibility', value: 16, color: 'var(--apex-teal, #0D9488)', description: 'Coverage issues' },
    { name: 'Duplicate', value: 10, color: 'var(--apex-blue, #6366F1)', description: 'Duplicate claims' },
]

const topDenialReasons = [
    { code: 'CO-16', type: 'CARC', description: 'Claim lacks information needed for adjudication', count: 1243, trend: 'down' as const, recovery: 82, aiRec: 'Auto-attach missing modifier codes from encounter data' },
    { code: 'CO-4', type: 'CARC', description: 'Procedure code inconsistent with modifier or not covered', count: 987, trend: 'down' as const, recovery: 76, aiRec: 'Cross-reference CPT-modifier combinations pre-submission' },
    { code: 'CO-197', type: 'CARC', description: 'Precertification/authorization/notification absent', count: 856, trend: 'up' as const, recovery: 65, aiRec: 'Integrate real-time prior auth verification at scheduling' },
    { code: 'PR-1', type: 'CARC', description: 'Deductible amount', count: 734, trend: 'down' as const, recovery: 91, aiRec: 'Auto-calculate patient responsibility pre-claim' },
    { code: 'CO-18', type: 'CARC', description: 'Exact duplicate claim/service', count: 612, trend: 'down' as const, recovery: 95, aiRec: 'Enable duplicate detection engine pre-submission' },
    { code: 'CO-50', type: 'CARC', description: 'Non-covered service per plan provisions', count: 543, trend: 'up' as const, recovery: 58, aiRec: 'Verify coverage eligibility at point of care' },
    { code: 'N30', type: 'RARC', description: 'Patient not eligible for benefit on DOS', count: 421, trend: 'down' as const, recovery: 72, aiRec: 'Real-time eligibility check 48hrs before service' },
    { code: 'MA130', type: 'RARC', description: 'Claim submitted to incorrect payer', count: 298, trend: 'down' as const, recovery: 88, aiRec: 'Auto-route claims based on COB hierarchy' },
]

const pipelineSteps = [
    { label: 'Flagged', count: 23, icon: Flag, color: 'var(--apex-red, #EF4444)' },
    { label: 'Categorize', count: 18, icon: Layers, color: 'var(--apex-amber, #F59E0B)' },
    { label: 'Route', count: 12, icon: GitBranch, color: 'var(--apex-purple, #8B5CF6)' },
    { label: 'Appeal', count: 8, icon: Send, color: 'var(--apex-teal, #0D9488)' },
    { label: 'Resolved', count: 342, icon: CheckCircle2, color: 'var(--apex-success, #10B981)', subtitle: 'this month' },
]

const predictiveRisks = [
    { claimId: 'CLM-2026-89234', member: 'Sarah Mitchell', amount: '$4,250', risk: 'High' as const, score: 92, reason: 'Missing prior auth for MRI', action: 'Obtain auth retroactively' },
    { claimId: 'CLM-2026-89301', member: 'James Cooper', amount: '$12,800', risk: 'High' as const, score: 87, reason: 'Out-of-network specialist', action: 'Verify gap exception eligibility' },
    { claimId: 'CLM-2026-89445', member: 'Linda Park', amount: '$2,100', risk: 'Medium' as const, score: 64, reason: 'Modifier mismatch on CPT 99214', action: 'Correct modifier before submission' },
    { claimId: 'CLM-2026-89502', member: 'Robert Chen', amount: '$890', risk: 'Low' as const, score: 23, reason: 'Timely filing approaching deadline', action: 'Expedite submission within 48hrs' },
]

// ============================================
// STYLES
// ============================================

const styles = {
    page: {
        padding: '32px',
        maxWidth: '1440px',
        margin: '0 auto',
        fontFamily: 'inherit',
    } as React.CSSProperties,

    header: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '32px',
    } as React.CSSProperties,

    headerLeft: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
    } as React.CSSProperties,

    titleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
    } as React.CSSProperties,

    title: {
        fontSize: '28px',
        fontWeight: 700,
        color: '#111827',
        margin: 0,
        letterSpacing: '-0.02em',
    } as React.CSSProperties,

    aiBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.10))',
        border: '1px solid rgba(139, 92, 246, 0.35)',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 600,
        color: '#a78bfa',
        letterSpacing: '0.05em',
        textTransform: 'uppercase' as const,
    } as React.CSSProperties,

    subtitle: {
        fontSize: '14px',
        color: 'var(--apex-steel, #8892a4)',
        margin: 0,
    } as React.CSSProperties,

    kpiRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '28px',
    } as React.CSSProperties,

    card: {
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    } as React.CSSProperties,

    kpiCard: {
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
    } as React.CSSProperties,

    kpiHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    } as React.CSSProperties,

    kpiLabel: {
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--apex-steel, #8892a4)',
        letterSpacing: '0.01em',
    } as React.CSSProperties,

    kpiValue: {
        fontSize: '32px',
        fontWeight: 700,
        color: '#111827',
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
    } as React.CSSProperties,

    kpiFooter: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        fontWeight: 500,
    } as React.CSSProperties,

    twoCol: {
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '20px',
        marginBottom: '28px',
    } as React.CSSProperties,

    cardTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '16px',
        fontWeight: 600,
        color: '#111827',
        margin: '0 0 20px 0',
    } as React.CSSProperties,

    chartContainer: {
        width: '100%',
        height: '280px',
    } as React.CSSProperties,

    fullWidth: {
        marginBottom: '28px',
    } as React.CSSProperties,

    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
    } as React.CSSProperties,

    th: {
        textAlign: 'left' as const,
        padding: '10px 14px',
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--apex-steel, #8892a4)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
        borderBottom: '1px solid #E5E7EB',
    } as React.CSSProperties,

    td: {
        padding: '12px 14px',
        fontSize: '13px',
        color: '#4B5563',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    } as React.CSSProperties,

    codeBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        background: 'rgba(0, 0, 0, 0.04)',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: 'monospace',
        color: '#111827',
    } as React.CSSProperties,

    aiRecBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 10px',
        background: 'rgba(139, 92, 246, 0.12)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '8px',
        fontSize: '11px',
        color: '#a78bfa',
        maxWidth: '260px',
    } as React.CSSProperties,

    appealCard: {
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06), #FFFFFF)',
        border: '1px solid rgba(139, 92, 246, 0.18)',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        marginBottom: '28px',
    } as React.CSSProperties,

    appealPreview: {
        background: 'rgba(0, 0, 0, 0.03)',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '20px',
        margin: '16px 0',
        fontSize: '13px',
        lineHeight: 1.7,
        color: '#4B5563',
        fontStyle: 'italic' as const,
    } as React.CSSProperties,

    confidenceMeter: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '16px 0',
    } as React.CSSProperties,

    confidenceBar: {
        flex: 1,
        height: '6px',
        background: 'rgba(0, 0, 0, 0.06)',
        borderRadius: '3px',
        overflow: 'hidden' as const,
    } as React.CSSProperties,

    btnGroup: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px',
        flexWrap: 'wrap' as const,
    } as React.CSSProperties,

    btnPrimary: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
        border: 'none',
        borderRadius: '10px',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
    } as React.CSSProperties,

    btnSecondary: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: 'rgba(0, 0, 0, 0.04)',
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        color: '#4B5563',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
    } as React.CSSProperties,

    btnGhost: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: 'transparent',
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        color: '#6B7280',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
    } as React.CSSProperties,

    pipeline: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0',
        padding: '12px 0',
        flexWrap: 'wrap' as const,
    } as React.CSSProperties,

    pipelineStep: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '10px',
        minWidth: '120px',
    } as React.CSSProperties,

    pipelineIconWrap: {
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative' as const,
    } as React.CSSProperties,

    pipelineCount: {
        fontSize: '20px',
        fontWeight: 700,
        color: '#111827',
    } as React.CSSProperties,

    pipelineLabel: {
        fontSize: '12px',
        fontWeight: 500,
        color: 'var(--apex-steel, #8892a4)',
    } as React.CSSProperties,

    pipelineArrow: {
        color: 'rgba(0, 0, 0, 0.2)',
        margin: '0 8px',
        flexShrink: 0,
    } as React.CSSProperties,

    financialGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '20px',
    } as React.CSSProperties,

    financialItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.02)',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
    } as React.CSSProperties,

    financialLabel: {
        fontSize: '12px',
        color: 'var(--apex-steel, #8892a4)',
        fontWeight: 500,
    } as React.CSSProperties,

    financialValue: {
        fontSize: '22px',
        fontWeight: 700,
        color: '#111827',
    } as React.CSSProperties,

    bottomRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '28px',
    } as React.CSSProperties,

    riskRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: '10px',
        background: 'rgba(0, 0, 0, 0.02)',
        marginBottom: '10px',
        border: '1px solid #E5E7EB',
    } as React.CSSProperties,

    riskBadge: (risk: 'High' | 'Medium' | 'Low') => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 600,
        background: risk === 'High' ? 'rgba(239, 68, 68, 0.15)' : risk === 'Medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
        color: risk === 'High' ? 'var(--apex-red, #EF4444)' : risk === 'Medium' ? 'var(--apex-amber, #F59E0B)' : 'var(--apex-success, #10B981)',
        border: `1px solid ${risk === 'High' ? 'rgba(239, 68, 68, 0.25)' : risk === 'Medium' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
    }) as React.CSSProperties,

    statFooter: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 0 0 0',
        borderTop: '1px solid #E5E7EB',
        marginTop: '12px',
        fontSize: '12px',
        color: '#6B7280',
    } as React.CSSProperties,

    progressBarOuter: {
        flex: 1,
        height: '8px',
        background: 'rgba(0, 0, 0, 0.06)',
        borderRadius: '4px',
        overflow: 'hidden' as const,
    } as React.CSSProperties,

    recoveryBar: (pct: number) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    }) as React.CSSProperties,

    legendDot: (color: string) => ({
        width: '10px',
        height: '10px',
        borderRadius: '3px',
        background: color,
        flexShrink: 0,
    }) as React.CSSProperties,

    pieCenter: {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center' as const,
        pointerEvents: 'none' as const,
    } as React.CSSProperties,

    pieCenterValue: {
        fontSize: '22px',
        fontWeight: 700,
        color: '#111827',
        display: 'block',
    } as React.CSSProperties,

    pieCenterLabel: {
        fontSize: '11px',
        color: 'var(--apex-steel, #8892a4)',
    } as React.CSSProperties,
}

// ============================================
// TOOLTIP STYLE (reused across charts)
// ============================================

const tooltipStyle = {
    contentStyle: {
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontSize: '12px',
        color: '#111827',
    },
}

// ============================================
// COMPONENT
// ============================================

export default function DenialManagement() {
    const [loading, setLoading] = useState(true)
    useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t) }, [])
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'appeals'>('overview')

    if (loading) return <PageSkeleton />

    return (
        <div style={styles.page}>
            {/* ========== HEADER ========== */}
            <motion.div
                style={styles.header}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div style={styles.headerLeft}>
                    <div style={styles.titleRow}>
                        <AlertTriangle size={28} style={{ color: '#F59E0B' }} />
                        <h1 style={styles.title}>Denial Management</h1>
                        <span style={styles.aiBadge}>
                            <Sparkles size={12} />
                            AI Powered
                        </span>
                    </div>
                    <p style={styles.subtitle}>AI-powered denial prevention and recovery</p>
                </div>
            </motion.div>

            {/* ========== TAB BAR ========== */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', padding: '4px', border: '1px solid #E5E7EB', width: 'fit-content' }}>
                {([
                    { key: 'overview' as const, label: 'Overview', icon: <Activity size={14} /> },
                    { key: 'analytics' as const, label: 'Analytics', icon: <TrendingUp size={14} /> },
                    { key: 'appeals' as const, label: 'Appeals', icon: <Send size={14} /> },
                ]).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 18px',
                            fontSize: '13px',
                            fontWeight: activeTab === tab.key ? 600 : 500,
                            color: activeTab === tab.key ? '#111827' : '#6B7280',
                            background: activeTab === tab.key ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                            border: activeTab === tab.key ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ========== TAB CONTENT ========== */}
            {activeTab === 'overview' && <>
            {/* ========== KPI ROW ========== */}
            <div style={styles.kpiRow} aria-live="polite" role="region" aria-label="Denial management key metrics">
                {[
                    { label: 'Current Denial Rate', value: '4.8%', prev: 'from 14.2%', trend: 'down', trendValue: '66.2%', color: 'var(--apex-success, #10B981)', icon: <Activity size={18} /> },
                    { label: 'Dollars Recovered (YTD)', value: '$3.4M', prev: '+$1.2M vs prior year', trend: 'up', trendValue: '54.5%', color: 'var(--apex-teal, #0D9488)', icon: <DollarSign size={18} /> },
                    { label: 'Appeal Success Rate', value: '78.2%', prev: 'industry avg: 52%', trend: 'up', trendValue: '12.3%', color: 'var(--apex-purple, #8B5CF6)', icon: <Target size={18} /> },
                    { label: 'Avg Resolution Time', value: '4.2 days', prev: 'from 12.8 days', trend: 'down', trendValue: '67.2%', color: 'var(--apex-amber, #F59E0B)', icon: <Clock size={18} /> },
                ].map((kpi, index) => (
                    <motion.div
                        key={kpi.label}
                        style={styles.kpiCard}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.07, duration: 0.4 }}
                    >
                        <div style={styles.kpiHeader}>
                            <span style={styles.kpiLabel}>{kpi.label}</span>
                            <span style={{ color: kpi.color, opacity: 0.7 }}>{kpi.icon}</span>
                        </div>
                        <span style={styles.kpiValue}>{kpi.value}</span>
                        <div style={styles.kpiFooter}>
                            {kpi.trend === 'down' ? (
                                <TrendingDown size={14} style={{ color: 'var(--apex-success, #10B981)' }} />
                            ) : (
                                <TrendingUp size={14} style={{ color: 'var(--apex-success, #10B981)' }} />
                            )}
                            <span style={{ color: 'var(--apex-success, #10B981)' }}>{kpi.trendValue}</span>
                            <span style={{ color: 'var(--apex-steel, #8892a4)', marginLeft: '4px' }}>{kpi.prev}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ========== CHARTS ROW: Denial Trend + Pie ========== */}
            <div style={styles.twoCol}>
                {/* Denial Rate Trend */}
                <motion.div
                    style={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.45 }}
                >
                    <h3 style={styles.cardTitle}>
                        <TrendingDown size={18} style={{ color: 'var(--apex-success, #10B981)' }} />
                        Denial Rate Trend (12 Months)
                    </h3>
                    <div style={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={denialRateTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="denialGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.45} />
                                        <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.12} />
                                        <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    tickFormatter={(v) => `${v}%`}
                                    domain={[0, 16]}
                                />
                                <Tooltip
                                    {...tooltipStyle}
                                    formatter={(value: number) => [`${value}%`, 'Denial Rate']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="rate"
                                    stroke="#F59E0B"
                                    fill="url(#denialGradient)"
                                    strokeWidth={3}
                                    dot={{ fill: '#F59E0B', strokeWidth: 2, stroke: '#FFFFFF', r: 4 }}
                                    activeDot={{ r: 7, fill: '#F59E0B', stroke: 'rgba(245, 158, 11, 0.3)', strokeWidth: 6 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Denial Categorization PieChart */}
                <motion.div
                    style={{ ...styles.card, position: 'relative' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.45 }}
                >
                    <h3 style={styles.cardTitle}>
                        <Shield size={18} style={{ color: 'var(--apex-amber, #F59E0B)' }} />
                        Denial Categorization
                    </h3>
                    <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    {denialCategories.map((entry, index) => (
                                        <linearGradient key={index} id={`denialPie${index}`} x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <Pie
                                    data={denialCategories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={88}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="rgba(0,0,0,0.3)"
                                    strokeWidth={2}
                                >
                                    {denialCategories.map((_entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`url(#denialPie${index})`}
                                            style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.3))' }}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    {...tooltipStyle}
                                    formatter={(value: number, _name: string, props: any) => [`${value}% — ${props.payload.description}`, props.payload.name]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={styles.pieCenter}>
                            <span style={styles.pieCenterValue}>5 Types</span>
                            <span style={styles.pieCenterLabel}>Categories</span>
                        </div>
                    </div>
                    {/* Legend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        {denialCategories.map((cat) => (
                            <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                                <span style={styles.legendDot(cat.color)} />
                                <span style={{ color: 'var(--apex-silver, #b0b8c8)', flex: 1 }}>{cat.name}</span>
                                <span style={{ color: '#111827', fontWeight: 600 }}>{cat.value}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ========== TOP DENIAL REASONS TABLE ========== */}
            <motion.div
                style={{ ...styles.card, ...styles.fullWidth }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.45 }}
            >
                <h3 style={styles.cardTitle}>
                    <FileText size={18} style={{ color: 'var(--apex-amber, #F59E0B)' }} />
                    Top Denial Reasons
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table} role="table" aria-label="Top denial reasons">
                        <thead>
                            <tr>
                                <th style={styles.th}>Code</th>
                                <th style={styles.th}>Type</th>
                                <th style={styles.th}>Description</th>
                                <th style={{ ...styles.th, textAlign: 'right' }}>Count</th>
                                <th style={{ ...styles.th, textAlign: 'center' }}>Trend</th>
                                <th style={{ ...styles.th, textAlign: 'right' }}>Recovery</th>
                                <th style={styles.th}>AI Recommendation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topDenialReasons.map((reason) => (
                                <tr key={reason.code} style={{ transition: 'background 0.2s' }}>
                                    <td style={styles.td}>
                                        <span style={styles.codeBadge}>{reason.code}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: reason.type === 'CARC' ? 'var(--apex-teal, #0D9488)' : 'var(--apex-purple, #8B5CF6)',
                                            padding: '2px 8px',
                                            background: reason.type === 'CARC' ? 'rgba(13, 148, 136, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                                            borderRadius: '4px',
                                        }}>
                                            {reason.type}
                                        </span>
                                    </td>
                                    <td style={{ ...styles.td, color: '#111827', maxWidth: '240px' }}>
                                        {reason.description}
                                    </td>
                                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                                        {reason.count.toLocaleString()}
                                    </td>
                                    <td style={{ ...styles.td, textAlign: 'center' }}>
                                        {reason.trend === 'down' ? (
                                            <TrendingDown size={16} style={{ color: 'var(--apex-success, #10B981)' }} />
                                        ) : (
                                            <TrendingUp size={16} style={{ color: 'var(--apex-red, #EF4444)' }} />
                                        )}
                                    </td>
                                    <td style={{ ...styles.td, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                            <div style={{ width: '48px', height: '5px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${reason.recovery}%`,
                                                    height: '100%',
                                                    borderRadius: '3px',
                                                    background: reason.recovery >= 80 ? 'var(--apex-success, #10B981)' : reason.recovery >= 60 ? 'var(--apex-amber, #F59E0B)' : 'var(--apex-red, #EF4444)',
                                                }} />
                                            </div>
                                            <span style={{ fontWeight: 600, color: reason.recovery >= 80 ? 'var(--apex-success, #10B981)' : reason.recovery >= 60 ? 'var(--apex-amber, #F59E0B)' : 'var(--apex-red, #EF4444)', fontSize: '12px', fontVariantNumeric: 'tabular-nums' }}>
                                                {reason.recovery}%
                                            </span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.aiRecBadge}>
                                            <Zap size={10} style={{ flexShrink: 0 }} />
                                            {reason.aiRec}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            </>}

            {activeTab === 'analytics' && <>
                {/* KPI Row for Analytics */}
                <div style={styles.kpiRow} aria-live="polite" role="region" aria-label="Denial analytics metrics">
                    {[
                        { label: 'Current Denial Rate', value: '4.8%', prev: 'from 14.2%', trend: 'down', trendValue: '66.2%', color: 'var(--apex-success, #10B981)', icon: <Activity size={18} /> },
                        { label: 'Dollars Recovered (YTD)', value: '$3.4M', prev: '+$1.2M vs prior year', trend: 'up', trendValue: '54.5%', color: 'var(--apex-teal, #0D9488)', icon: <DollarSign size={18} /> },
                        { label: 'Appeal Success Rate', value: '78.2%', prev: 'industry avg: 52%', trend: 'up', trendValue: '12.3%', color: 'var(--apex-purple, #8B5CF6)', icon: <Target size={18} /> },
                        { label: 'Avg Resolution Time', value: '4.2 days', prev: 'from 12.8 days', trend: 'down', trendValue: '67.2%', color: 'var(--apex-amber, #F59E0B)', icon: <Clock size={18} /> },
                    ].map((kpi, index) => (
                        <motion.div key={kpi.label} style={styles.kpiCard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.07, duration: 0.4 }}>
                            <div style={styles.kpiHeader}>
                                <span style={styles.kpiLabel}>{kpi.label}</span>
                                <span style={{ color: kpi.color, opacity: 0.7 }}>{kpi.icon}</span>
                            </div>
                            <span style={styles.kpiValue}>{kpi.value}</span>
                            <div style={styles.kpiFooter}>
                                {kpi.trend === 'down' ? <TrendingDown size={14} style={{ color: 'var(--apex-success, #10B981)' }} /> : <TrendingUp size={14} style={{ color: 'var(--apex-success, #10B981)' }} />}
                                <span style={{ color: 'var(--apex-success, #10B981)' }}>{kpi.trendValue}</span>
                                <span style={{ color: 'var(--apex-steel, #8892a4)', marginLeft: '4px' }}>{kpi.prev}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Denial Rate Trend Chart */}
                <motion.div style={{ ...styles.card, ...styles.fullWidth }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.45 }}>
                    <h3 style={styles.cardTitle}><TrendingDown size={18} style={{ color: 'var(--apex-success, #10B981)' }} /> Denial Rate Trend (12 Months)</h3>
                    <div style={{ ...styles.chartContainer, height: '340px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={denialRateTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="denialGradientAnalytics" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.45} />
                                        <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.12} />
                                        <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, 16]} />
                                <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value}%`, 'Denial Rate']} />
                                <Area type="monotone" dataKey="rate" stroke="#F59E0B" fill="url(#denialGradientAnalytics)" strokeWidth={3} dot={{ fill: '#F59E0B', strokeWidth: 2, stroke: '#FFFFFF', r: 4 }} activeDot={{ r: 7, fill: '#F59E0B', stroke: 'rgba(245, 158, 11, 0.3)', strokeWidth: 6 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Top Denial Reasons Table (also in analytics) */}
                <motion.div style={{ ...styles.card, ...styles.fullWidth }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.45 }}>
                    <h3 style={styles.cardTitle}><FileText size={18} style={{ color: 'var(--apex-amber, #F59E0B)' }} /> Denial Reason Breakdown</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table} role="table" aria-label="Denial reason breakdown">
                            <thead><tr><th style={styles.th}>Code</th><th style={styles.th}>Type</th><th style={styles.th}>Description</th><th style={{ ...styles.th, textAlign: 'right' }}>Count</th><th style={{ ...styles.th, textAlign: 'right' }}>Recovery</th></tr></thead>
                            <tbody>
                                {topDenialReasons.map((reason) => (
                                    <tr key={reason.code}>
                                        <td style={styles.td}><span style={styles.codeBadge}>{reason.code}</span></td>
                                        <td style={styles.td}><span style={{ fontSize: '11px', fontWeight: 600, color: reason.type === 'CARC' ? 'var(--apex-teal, #0D9488)' : 'var(--apex-purple, #8B5CF6)', padding: '2px 8px', background: reason.type === 'CARC' ? 'rgba(13, 148, 136, 0.12)' : 'rgba(139, 92, 246, 0.12)', borderRadius: '4px' }}>{reason.type}</span></td>
                                        <td style={{ ...styles.td, color: '#111827', maxWidth: '240px' }}>{reason.description}</td>
                                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{reason.count.toLocaleString()}</td>
                                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600, color: reason.recovery >= 80 ? 'var(--apex-success, #10B981)' : reason.recovery >= 60 ? 'var(--apex-amber, #F59E0B)' : 'var(--apex-red, #EF4444)' }}>{reason.recovery}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </>}

            {activeTab === 'appeals' && <>
            {/* ========== AI APPEAL GENERATION PANEL ========== */}
            <motion.div
                style={styles.appealCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.45 }}
            >
                <h3 style={{ ...styles.cardTitle, marginBottom: '8px' }}>
                    <Brain size={20} style={{ color: 'var(--apex-purple, #8B5CF6)' }} />
                    AI-Generated Appeal Draft
                    <span style={{
                        ...styles.aiBadge,
                        fontSize: '10px',
                        padding: '3px 10px',
                        marginLeft: '4px',
                    }}>
                        <Sparkles size={10} />
                        GPT-4 Enhanced
                    </span>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--apex-steel, #8892a4)', margin: '0 0 4px 0' }}>
                    Claim CLM-2026-45678 — CO-197: Precertification absent — $4,250.00
                </p>

                <div style={styles.appealPreview}>
                    <p style={{ margin: '0 0 12px 0' }}>
                        Dear Claims Review Committee,
                    </p>
                    <p style={{ margin: '0 0 12px 0' }}>
                        We are writing to formally appeal the denial of Claim #CLM-2026-45678 under adjustment reason code CO-197
                        (Precertification/Authorization/Notification absent). Upon thorough review of the member's medical records
                        and the treating physician's clinical documentation, the requested MRI of the lumbar spine (CPT 72148) meets
                        the criteria for medical necessity under the plan's clinical policy guidelines (Section 4.2.1 — Advanced Imaging).
                    </p>
                    <p style={{ margin: '0 0 12px 0' }}>
                        The member presented with progressive radiculopathy unresponsive to 6 weeks of conservative treatment including
                        physical therapy and NSAIDs, satisfying the step-therapy requirement. Furthermore, the referring physician
                        initiated the prior authorization request on 01/15/2026 (Reference #PA-2026-8834), which was received but
                        not processed within the contractual 72-hour window per the provider agreement (Section 8.3).
                    </p>
                    <p style={{ margin: 0 }}>
                        Based on the clinical evidence and the procedural lapse in authorization processing, we respectfully request
                        that this denial be overturned and the claim be reprocessed for payment at the contracted allowed amount.
                    </p>
                </div>

                {/* Confidence Score */}
                <div style={styles.confidenceMeter}>
                    <span style={{ fontSize: '12px', color: 'var(--apex-steel, #8892a4)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        Confidence Score
                    </span>
                    <div style={styles.confidenceBar}>
                        <motion.div
                            style={{
                                height: '100%',
                                borderRadius: '3px',
                                background: 'linear-gradient(90deg, #8B5CF6, #a78bfa)',
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: '92%' }}
                            transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#a78bfa', fontVariantNumeric: 'tabular-nums' }}>92%</span>
                </div>

                {/* Buttons */}
                <div style={styles.btnGroup}>
                    <button style={styles.btnPrimary} aria-label="Edit and send appeal">
                        <Send size={14} />
                        Edit & Send
                    </button>
                    <button style={styles.btnSecondary} aria-label="Regenerate appeal draft">
                        <RefreshCw size={14} />
                        Regenerate
                    </button>
                    <button style={styles.btnGhost} aria-label="Save appeal draft">
                        <Save size={14} />
                        Save Draft
                    </button>
                </div>

                {/* Stats footer */}
                <div style={styles.statFooter}>
                    <Zap size={14} style={{ color: 'var(--apex-purple, #8B5CF6)' }} />
                    <span><strong style={{ color: '#111827' }}>847</strong> appeals auto-generated this month</span>
                    <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
                    <span><strong style={{ color: 'var(--apex-success, #10B981)' }}>78%</strong> success rate</span>
                </div>
            </motion.div>

            {/* ========== DENIAL WORKFLOW PIPELINE ========== */}
            <motion.div
                style={{ ...styles.card, ...styles.fullWidth }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.45 }}
            >
                <h3 style={styles.cardTitle}>
                    <GitBranch size={18} style={{ color: 'var(--apex-teal, #0D9488)' }} />
                    Denial Workflow Pipeline
                </h3>
                <div style={styles.pipeline}>
                    {pipelineSteps.map((step, index) => {
                        const Icon = step.icon
                        return (
                            <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
                                <motion.div
                                    style={styles.pipelineStep}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.65 + index * 0.1, duration: 0.35 }}
                                >
                                    <div style={{
                                        ...styles.pipelineIconWrap,
                                        background: `${step.color}18`,
                                        border: `1px solid ${step.color}30`,
                                    }}>
                                        <Icon size={22} style={{ color: step.color }} />
                                    </div>
                                    <span style={styles.pipelineCount}>{step.count}</span>
                                    <span style={styles.pipelineLabel}>
                                        {step.label}
                                        {step.subtitle && (
                                            <span style={{ display: 'block', fontSize: '10px', color: 'var(--apex-success, #10B981)', fontWeight: 600 }}>
                                                {step.subtitle}
                                            </span>
                                        )}
                                    </span>
                                </motion.div>
                                {index < pipelineSteps.length - 1 && (
                                    <motion.div
                                        style={styles.pipelineArrow}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.7 + index * 0.1 }}
                                    >
                                        <ArrowRight size={20} />
                                    </motion.div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </motion.div>

            {/* ========== BOTTOM ROW: Financial Impact + Predictive Risk ========== */}
            <div style={styles.bottomRow}>
                {/* Financial Impact Summary */}
                <motion.div
                    style={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65, duration: 0.45 }}
                >
                    <h3 style={styles.cardTitle}>
                        <DollarSign size={18} style={{ color: 'var(--apex-success, #10B981)' }} />
                        Financial Impact Summary
                    </h3>

                    {/* Total Denials Value */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--apex-steel, #8892a4)', marginBottom: '6px' }}>Total Denials Value</div>
                        <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>$8.2M</div>
                    </div>

                    {/* Stacked Recovery Bar */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', height: '12px', background: 'rgba(0,0,0,0.04)' }}>
                            <motion.div
                                style={{ background: '#10B981', height: '100%' }}
                                initial={{ width: 0 }}
                                animate={{ width: '41%' }}
                                transition={{ delay: 0.9, duration: 0.8 }}
                            />
                            <motion.div
                                style={{ background: '#F59E0B', height: '100%' }}
                                initial={{ width: 0 }}
                                animate={{ width: '26%' }}
                                transition={{ delay: 1.0, duration: 0.8 }}
                            />
                            <motion.div
                                style={{ background: '#EF4444', height: '100%', opacity: 0.7 }}
                                initial={{ width: 0 }}
                                animate={{ width: '33%' }}
                                transition={{ delay: 1.1, duration: 0.8 }}
                            />
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div style={styles.financialGrid}>
                        <div style={styles.financialItem}>
                            <span style={styles.financialLabel}>
                                <span style={{ ...styles.legendDot('#10B981'), display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
                                Recovered
                            </span>
                            <span style={{ ...styles.financialValue, fontSize: '18px', color: 'var(--apex-success, #10B981)' }}>$3.4M</span>
                            <span style={{ fontSize: '11px', color: 'var(--apex-steel, #8892a4)' }}>41% of total</span>
                        </div>
                        <div style={styles.financialItem}>
                            <span style={styles.financialLabel}>
                                <span style={{ ...styles.legendDot('#F59E0B'), display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
                                In Progress
                            </span>
                            <span style={{ ...styles.financialValue, fontSize: '18px', color: 'var(--apex-amber, #F59E0B)' }}>$2.1M</span>
                            <span style={{ fontSize: '11px', color: 'var(--apex-steel, #8892a4)' }}>26% of total</span>
                        </div>
                        <div style={styles.financialItem}>
                            <span style={styles.financialLabel}>
                                <span style={{ ...styles.legendDot('#EF4444'), display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
                                Written Off
                            </span>
                            <span style={{ ...styles.financialValue, fontSize: '18px', color: 'var(--apex-red, #EF4444)' }}>$2.7M</span>
                            <span style={{ fontSize: '11px', color: 'var(--apex-steel, #8892a4)' }}>33% of total</span>
                        </div>
                    </div>

                    {/* Cost & ROI */}
                    <div style={{ display: 'flex', gap: '20px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', color: 'var(--apex-steel, #8892a4)', marginBottom: '4px' }}>Cost to Recover</div>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>$142<span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--apex-steel, #8892a4)' }}> / claim</span></div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', color: 'var(--apex-steel, #8892a4)', marginBottom: '4px' }}>Recovery ROI</div>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--apex-success, #10B981)' }}>12:1</div>
                        </div>
                    </div>
                </motion.div>

                {/* Predictive Risk Scoring */}
                <motion.div
                    style={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.45 }}
                >
                    <h3 style={styles.cardTitle}>
                        <Brain size={18} style={{ color: 'var(--apex-purple, #8B5CF6)' }} />
                        Predictive Denial Risk
                        <span style={{
                            ...styles.aiBadge,
                            fontSize: '10px',
                            padding: '2px 8px',
                            marginLeft: 'auto',
                        }}>
                            <Sparkles size={10} />
                            Real-time
                        </span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {predictiveRisks.map((claim, index) => (
                            <motion.div
                                key={claim.claimId}
                                style={styles.riskRow}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.75 + index * 0.08 }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>
                                            {claim.claimId}
                                        </span>
                                        <span style={styles.riskBadge(claim.risk)}>
                                            {claim.risk === 'High' && <AlertTriangle size={10} />}
                                            {claim.risk === 'Medium' && <Clock size={10} />}
                                            {claim.risk === 'Low' && <CheckCircle2 size={10} />}
                                            {claim.risk} — {claim.score}%
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--apex-silver, #b0b8c8)', marginBottom: '3px' }}>
                                        {claim.member} · {claim.amount}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--apex-steel, #8892a4)' }}>
                                        {claim.reason}
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    color: 'var(--apex-teal, #0D9488)',
                                    background: 'rgba(13, 148, 136, 0.1)',
                                    border: '1px solid rgba(13, 148, 136, 0.2)',
                                    padding: '5px 10px',
                                    borderRadius: '8px',
                                    whiteSpace: 'nowrap',
                                    marginLeft: '16px',
                                    maxWidth: '180px',
                                }}>
                                    <Zap size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                    {claim.action}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
            </>}
        </div>
    )
}
