import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'
import {
    Star,
    TrendingUp,
    TrendingDown,
    Activity,
    Shield,
    Heart,
    Pill,
    Users,
    MessageSquare,
    PhoneCall,
    Target,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Sparkles,
    Download,
    FileText,
    Calendar,
    Award,
    Brain,
    Zap,
    ChevronUp,
    ChevronDown
} from 'lucide-react'
import { PageSkeleton } from '../components/common'

// ─── Mock Data ──────────────────────────────────────────────────────────────

interface DomainCard {
    name: string
    stars: number
    weight: string
    icon: React.ReactNode
    color: string
    description: string
    measures: number
    atTarget: number
}

interface HedisMeasure {
    name: string
    id: string
    currentRate: number
    goal: number
    gap: number
    status: 'on-track' | 'at-risk' | 'below-target'
    yoyChange: number
}

interface CahpsScore {
    name: string
    score: number
    nationalAvg: number
}

interface BenchmarkItem {
    metric: string
    yourPlan: string
    nationalAvg: string
    peerGroup: string
    delta: string
    positive: boolean
}

interface ActionItem {
    id: number
    title: string
    description: string
    priority: 'Critical' | 'High' | 'Medium'
    starImpact: string
    domain: string
}

const domainCards: DomainCard[] = [
    {
        name: 'Staying Healthy',
        stars: 4.5,
        weight: '1.5x',
        icon: <Shield size={22} />,
        color: 'var(--apex-success, #10B981)',
        description: 'Preventive screenings, immunizations, wellness visits',
        measures: 12,
        atTarget: 10
    },
    {
        name: 'Managing Chronic Conditions',
        stars: 3.8,
        weight: '3x',
        icon: <Heart size={22} />,
        color: 'var(--apex-amber, #F59E0B)',
        description: 'Diabetes, blood pressure, medication adherence',
        measures: 15,
        atTarget: 10
    },
    {
        name: 'Member Experience',
        stars: 4.3,
        weight: '2x',
        icon: <Users size={22} />,
        color: 'var(--apex-cyan, #06B6D4)',
        description: 'CAHPS survey results, satisfaction, engagement',
        measures: 8,
        atTarget: 7
    },
    {
        name: 'Complaints & Access',
        stars: 4.0,
        weight: '2x',
        icon: <PhoneCall size={22} />,
        color: 'var(--apex-purple, #8B5CF6)',
        description: 'Appeals, complaints, access to care, timeliness',
        measures: 6,
        atTarget: 5
    },
    {
        name: 'Drug Plan Services',
        stars: 4.6,
        weight: '1x',
        icon: <Pill size={22} />,
        color: 'var(--apex-teal, #14B8A6)',
        description: 'Medication adherence, drug safety, formulary access',
        measures: 5,
        atTarget: 5
    }
]

const hedisMeasures: HedisMeasure[] = [
    { name: 'Breast Cancer Screening', id: 'BCS', currentRate: 78.9, goal: 80.0, gap: -1.1, status: 'at-risk', yoyChange: 2.3 },
    { name: 'Colorectal Cancer Screening', id: 'COL', currentRate: 72.4, goal: 70.0, gap: 2.4, status: 'on-track', yoyChange: 4.1 },
    { name: 'HbA1c Poor Control (<8%)', id: 'HBD', currentRate: 68.2, goal: 72.0, gap: -3.8, status: 'below-target', yoyChange: 1.5 },
    { name: 'Controlling Blood Pressure', id: 'CBP', currentRate: 74.6, goal: 75.0, gap: -0.4, status: 'at-risk', yoyChange: 3.2 },
    { name: 'Med Adherence — Diabetes', id: 'MAD', currentRate: 81.5, goal: 80.0, gap: 1.5, status: 'on-track', yoyChange: 2.8 },
    { name: 'Med Adherence — Hypertension', id: 'MAH', currentRate: 83.2, goal: 82.0, gap: 1.2, status: 'on-track', yoyChange: 1.9 },
    { name: 'Med Adherence — Cholesterol', id: 'MAC', currentRate: 79.8, goal: 82.0, gap: -2.2, status: 'at-risk', yoyChange: -0.4 },
    { name: 'Childhood Immunization Status', id: 'CIS', currentRate: 76.3, goal: 75.0, gap: 1.3, status: 'on-track', yoyChange: 3.7 },
    { name: 'Prenatal & Postpartum Care', id: 'PPC', currentRate: 85.1, goal: 84.0, gap: 1.1, status: 'on-track', yoyChange: 1.2 },
    { name: 'Follow-Up After ED Visit', id: 'FMC', currentRate: 52.6, goal: 58.0, gap: -5.4, status: 'below-target', yoyChange: -1.8 }
]

const cahpsScores: CahpsScore[] = [
    { name: 'Getting Needed Care', score: 87, nationalAvg: 83 },
    { name: 'Getting Appointments', score: 84, nationalAvg: 81 },
    { name: 'Customer Service', score: 89, nationalAvg: 85 },
    { name: 'Care Coordination', score: 82, nationalAvg: 80 },
    { name: 'Rating of Health Plan', score: 86, nationalAvg: 82 }
]

const benchmarkData: BenchmarkItem[] = [
    { metric: 'Overall Star Rating', yourPlan: '4.2★', nationalAvg: '3.8★', peerGroup: '4.0★', delta: '+0.4', positive: true },
    { metric: 'HEDIS Composite', yourPlan: '76.8%', nationalAvg: '72.4%', peerGroup: '74.1%', delta: '+4.4%', positive: true },
    { metric: 'CAHPS Composite', yourPlan: '85.6%', nationalAvg: '82.2%', peerGroup: '83.8%', delta: '+3.4%', positive: true },
    { metric: 'Medication Adherence', yourPlan: '81.5%', nationalAvg: '78.9%', peerGroup: '80.2%', delta: '+2.6%', positive: true },
    { metric: 'Member Retention', yourPlan: '91.2%', nationalAvg: '87.5%', peerGroup: '89.1%', delta: '+3.7%', positive: true },
    { metric: 'Complaint Rate', yourPlan: '1.2‰', nationalAvg: '1.8‰', peerGroup: '1.5‰', delta: '-0.6‰', positive: true }
]

const actionItems: ActionItem[] = [
    {
        id: 1,
        title: 'Deploy targeted HbA1c outreach for uncontrolled diabetics',
        description: 'AI identified 1,247 members with HbA1c > 9% who have not completed lab work in 6+ months. Automated care gap outreach recommended.',
        priority: 'Critical',
        starImpact: '+0.15 stars',
        domain: 'Managing Chronic Conditions'
    },
    {
        id: 2,
        title: 'Expand post-ED follow-up program',
        description: 'Follow-up after ED visit rate at 52.6% — significantly below 58% target. Recommend same-day telephonic outreach and PCP appointment scheduling.',
        priority: 'Critical',
        starImpact: '+0.12 stars',
        domain: 'Managing Chronic Conditions'
    },
    {
        id: 3,
        title: 'Enhance cholesterol medication adherence interventions',
        description: 'Statin adherence declining YoY. Recommend pharmacy-led MTM sessions and 90-day supply incentive program for 3,450 identified members.',
        priority: 'High',
        starImpact: '+0.08 stars',
        domain: 'Drug Plan Services'
    },
    {
        id: 4,
        title: 'Launch breast cancer screening reminder campaign',
        description: 'BCS rate at 78.9%, just 1.1% below target. Targeted outreach to 890 overdue members can close the gap before measurement year end.',
        priority: 'High',
        starImpact: '+0.05 stars',
        domain: 'Staying Healthy'
    },
    {
        id: 5,
        title: 'Improve blood pressure control through RPM pilot',
        description: 'Pilot remote patient monitoring for 500 members with uncontrolled hypertension. Expected 8-12% improvement in control rates within 6 months.',
        priority: 'Medium',
        starImpact: '+0.04 stars',
        domain: 'Managing Chronic Conditions'
    }
]

const starTrendData = [
    { year: '2022', rating: 3.6 },
    { year: '2023', rating: 3.8 },
    { year: '2024', rating: 4.0 },
    { year: '2025', rating: 4.2 },
    { year: '2026 Target', rating: 4.5 }
]

// ─── Styles ──────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
}

const tooltipStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontSize: '12px',
    color: '#111827'
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function StarRatings() {
    const [loading, setLoading] = useState(true)
    useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t) }, [])
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null)

    const overallRating = 4.2
    const previousRating = 4.0
    const targetRating = 4.5

    const renderStars = (rating: number, size: number = 18) => {
        return (
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(i => {
                    const filled = i <= Math.floor(rating)
                    const half = !filled && i === Math.ceil(rating) && rating % 1 >= 0.3
                    return (
                        <Star
                            key={i}
                            size={size}
                            fill={filled ? '#F59E0B' : half ? 'url(#halfStar)' : 'transparent'}
                            stroke={filled || half ? '#F59E0B' : 'rgba(0,0,0,0.15)'}
                            strokeWidth={1.5}
                            style={{ filter: filled ? 'drop-shadow(0 0 4px rgba(245,158,11,0.4))' : 'none' }}
                        />
                    )
                })}
            </div>
        )
    }

    const getStatusStyle = (status: HedisMeasure['status']): React.CSSProperties => {
        switch (status) {
            case 'on-track':
                return { background: 'rgba(16,185,129,0.12)', color: 'var(--apex-success, #10B981)', border: '1px solid rgba(16,185,129,0.2)' }
            case 'at-risk':
                return { background: 'rgba(245,158,11,0.12)', color: 'var(--apex-amber, #F59E0B)', border: '1px solid rgba(245,158,11,0.2)' }
            case 'below-target':
                return { background: 'rgba(239,68,68,0.12)', color: 'var(--apex-red, #EF4444)', border: '1px solid rgba(239,68,68,0.2)' }
        }
    }

    const getStatusIcon = (status: HedisMeasure['status']) => {
        switch (status) {
            case 'on-track': return <CheckCircle2 size={12} />
            case 'at-risk': return <AlertTriangle size={12} />
            case 'below-target': return <XCircle size={12} />
        }
    }

    const getStatusLabel = (status: HedisMeasure['status']) => {
        switch (status) {
            case 'on-track': return 'On Track'
            case 'at-risk': return 'At Risk'
            case 'below-target': return 'Below Target'
        }
    }

    const getPriorityStyle = (priority: ActionItem['priority']): React.CSSProperties => {
        switch (priority) {
            case 'Critical':
                return { background: 'rgba(239,68,68,0.15)', color: 'var(--apex-red, #EF4444)', border: '1px solid rgba(239,68,68,0.25)' }
            case 'High':
                return { background: 'rgba(245,158,11,0.15)', color: 'var(--apex-amber, #F59E0B)', border: '1px solid rgba(245,158,11,0.25)' }
            case 'Medium':
                return { background: 'rgba(6,182,212,0.15)', color: 'var(--apex-cyan, #06B6D4)', border: '1px solid rgba(6,182,212,0.25)' }
        }
    }

    const measuresOnTrack = hedisMeasures.filter(m => m.status === 'on-track').length
    const measuresAtRisk = hedisMeasures.filter(m => m.status === 'at-risk').length
    const measuresBelowTarget = hedisMeasures.filter(m => m.status === 'below-target').length

    if (loading) return <PageSkeleton />

    return (
        <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* SVG Defs for half-star gradient */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <linearGradient id="halfStar" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="50%" stopColor="#F59E0B" />
                        <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                </defs>
            </svg>

            {/* ── 1. Header ──────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}
            >
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        <Star size={28} style={{ color: '#F59E0B', filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.5))' }} />
                        CMS Star Ratings & Quality
                    </h1>
                    <p style={{ color: 'var(--apex-steel, #94A3B8)', fontSize: '15px', margin: '8px 0 0 0' }}>
                        HEDIS performance tracking and CMS compliance
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(245,158,11,0.12)', color: '#F59E0B',
                        border: '1px solid rgba(245,158,11,0.25)',
                        borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: 600
                    }}>
                        <Calendar size={14} />
                        2026 Measurement Year
                    </span>
                </div>
            </motion.div>

            {/* ── 2. Overall Star Rating Display ─────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                style={{
                    ...cardStyle,
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '32px',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative glow */}
                <div style={{
                    position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px',
                    background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{
                        width: '88px', height: '88px', borderRadius: '20px',
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 100%)',
                        border: '1px solid rgba(245,158,11,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Award size={40} style={{ color: '#F59E0B' }} />
                    </div>
                    <div>
                        <div style={{ color: 'var(--apex-steel, #94A3B8)', fontSize: '13px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Overall CMS Star Rating
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '48px', fontWeight: 800, color: '#111827', lineHeight: 1, letterSpacing: '-1px' }}>
                                {overallRating}
                            </span>
                            <span style={{ fontSize: '16px', color: 'var(--apex-steel, #94A3B8)', fontWeight: 500 }}>/ 5.0</span>
                        </div>
                        {renderStars(overallRating, 24)}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                <TrendingUp size={14} style={{ color: 'var(--apex-success, #10B981)' }} />
                                <span style={{ color: 'var(--apex-success, #10B981)', fontWeight: 600 }}>{previousRating}</span>
                                <ArrowRight size={12} style={{ color: 'var(--apex-steel, #94A3B8)' }} />
                                <span style={{ color: 'var(--apex-success, #10B981)', fontWeight: 600 }}>{overallRating}</span>
                                <span style={{ color: 'var(--apex-steel, #94A3B8)' }}>YoY</span>
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
                                background: 'rgba(13,148,136,0.1)', padding: '3px 10px', borderRadius: '12px',
                                border: '1px solid rgba(13,148,136,0.2)'
                            }}>
                                <Target size={12} style={{ color: 'var(--apex-teal, #0D9488)' }} />
                                <span style={{ color: 'var(--apex-teal, #0D9488)', fontWeight: 600 }}>Target: {targetRating}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Star Rating Trend Mini Chart */}
                <div style={{ height: '160px' }}>
                    <div style={{ color: 'var(--apex-steel, #94A3B8)', fontSize: '12px', fontWeight: 500, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Star Rating Trend
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={starTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="starTrendGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                            <YAxis domain={[3, 5]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} Stars`, 'Rating']} />
                            <Area
                                type="monotone" dataKey="rating" stroke="#F59E0B" fill="url(#starTrendGrad)"
                                strokeWidth={3}
                                dot={{ fill: '#F59E0B', strokeWidth: 2, stroke: '#FFFFFF', r: 5 }}
                                activeDot={{ r: 7, fill: '#F59E0B', stroke: 'rgba(245,158,11,0.3)', strokeWidth: 6 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* ── Summary Stats Row ──────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                    { label: 'Measures On Track', value: `${measuresOnTrack}/${hedisMeasures.length}`, icon: <CheckCircle2 size={20} />, color: 'var(--apex-success, #10B981)', change: '+3 vs prior year' },
                    { label: 'Measures At Risk', value: measuresAtRisk.toString(), icon: <AlertTriangle size={20} />, color: 'var(--apex-amber, #F59E0B)', change: '−1 vs prior year' },
                    { label: 'Below Target', value: measuresBelowTarget.toString(), icon: <XCircle size={20} />, color: 'var(--apex-red, #EF4444)', change: '−2 vs prior year' },
                    { label: 'Bonus Opportunity', value: '$3.8M', icon: <Award size={20} />, color: 'var(--apex-teal, #0D9488)', change: '+$420K if 4.5★' }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + index * 0.05, duration: 0.4 }}
                        style={{
                            ...cardStyle,
                            display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px'
                        }}
                    >
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: `${stat.color}15`, border: `1px solid ${stat.color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: stat.color, flexShrink: 0
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--apex-steel, #94A3B8)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{stat.label}</div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{stat.value}</div>
                            <div style={{ fontSize: '11px', color: 'var(--apex-steel, #94A3B8)', marginTop: '2px' }}>{stat.change}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── 3. Five Domain Cards ───────────────────────────────────── */}
            <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={20} style={{ color: 'var(--apex-teal, #0D9488)' }} />
                    Star Rating Domains
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                    {domainCards.map((domain, index) => (
                        <motion.div
                            key={domain.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.06, duration: 0.4 }}
                            onClick={() => setSelectedDomain(selectedDomain === domain.name ? null : domain.name)}
                            style={{
                                ...cardStyle,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                border: selectedDomain === domain.name
                                    ? `1px solid ${domain.color}40`
                                    : '1px solid #E5E7EB',
                                boxShadow: selectedDomain === domain.name
                                    ? `0 0 20px ${domain.color}15`
                                    : 'none'
                            }}
                        >
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '12px',
                                background: `${domain.color}15`, border: `1px solid ${domain.color}25`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: domain.color, marginBottom: '14px'
                            }}>
                                {domain.icon}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '6px', lineHeight: 1.3 }}>
                                {domain.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '26px', fontWeight: 700, color: '#111827' }}>
                                    {domain.stars}
                                </span>
                                {renderStars(domain.stars, 14)}
                            </div>
                            <div style={{
                                fontSize: '11px', fontWeight: 600,
                                color: domain.color,
                                background: `${domain.color}12`,
                                padding: '3px 8px', borderRadius: '8px',
                                display: 'inline-block', marginBottom: '10px'
                            }}>
                                Weight: {domain.weight}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--apex-steel, #94A3B8)', lineHeight: 1.4, marginBottom: '10px' }}>
                                {domain.description}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--apex-steel, #94A3B8)', borderTop: '1px solid #E5E7EB', paddingTop: '10px' }}>
                                <span>{domain.measures} measures</span>
                                <span style={{ color: 'var(--apex-success, #10B981)', fontWeight: 600 }}>{domain.atTarget} at target</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── 4. HEDIS Measure Tracking Table ────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                style={cardStyle}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={18} style={{ color: 'var(--apex-teal, #0D9488)' }} />
                        HEDIS Measure Performance
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--apex-steel, #94A3B8)' }}>
                        {hedisMeasures.length} measures tracked
                    </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: '13px' }}>
                        <thead>
                            <tr>
                                {['Measure', 'Current Rate', 'Goal', 'Gap', 'Status', 'YoY Change'].map(h => (
                                    <th key={h} style={{
                                        textAlign: h === 'Measure' ? 'left' : 'center',
                                        padding: '10px 14px', color: 'var(--apex-steel, #94A3B8)',
                                        fontWeight: 500, fontSize: '11px', textTransform: 'uppercase',
                                        letterSpacing: '0.5px', borderBottom: '1px solid #E5E7EB'
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {hedisMeasures.map((measure, index) => (
                                <motion.tr
                                    key={measure.id}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.03 }}
                                    style={{
                                        background: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <td style={{ padding: '12px 14px', color: '#111827', fontWeight: 500 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                fontSize: '10px', fontWeight: 600, color: 'var(--apex-steel, #94A3B8)',
                                                background: 'rgba(0,0,0,0.04)', padding: '2px 6px',
                                                borderRadius: '4px', fontFamily: 'monospace'
                                            }}>
                                                {measure.id}
                                            </span>
                                            {measure.name}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '12px 14px', fontWeight: 600, color: '#111827' }}>
                                        {measure.currentRate}%
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '12px 14px', color: 'var(--apex-steel, #94A3B8)' }}>
                                        {measure.goal}%
                                    </td>
                                    <td style={{
                                        textAlign: 'center', padding: '12px 14px', fontWeight: 600,
                                        color: measure.gap >= 0 ? 'var(--apex-success, #10B981)' : measure.gap > -2 ? 'var(--apex-amber, #F59E0B)' : 'var(--apex-red, #EF4444)'
                                    }}>
                                        {measure.gap >= 0 ? '+' : ''}{measure.gap.toFixed(1)}%
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '12px 14px' }}>
                                        <span style={{
                                            ...getStatusStyle(measure.status),
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600
                                        }}>
                                            {getStatusIcon(measure.status)}
                                            {getStatusLabel(measure.status)}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '12px 14px' }}>
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            color: measure.yoyChange >= 0 ? 'var(--apex-success, #10B981)' : 'var(--apex-red, #EF4444)',
                                            fontWeight: 600, fontSize: '12px'
                                        }}>
                                            {measure.yoyChange >= 0
                                                ? <ChevronUp size={14} />
                                                : <ChevronDown size={14} />
                                            }
                                            {measure.yoyChange >= 0 ? '+' : ''}{measure.yoyChange.toFixed(1)}%
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ── 5. CAHPS Survey Scores Chart ───────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                style={cardStyle}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={18} style={{ color: 'var(--apex-cyan, #06B6D4)' }} />
                        CAHPS Survey Composite Scores
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--apex-steel, #94A3B8)' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#0D9488', display: 'inline-block' }} />
                            Your Plan
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--apex-steel, #94A3B8)' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(148,163,184,0.4)', display: 'inline-block' }} />
                            National Avg
                        </span>
                    </div>
                </div>
                <div style={{ height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cahpsScores} margin={{ top: 10, right: 20, left: 0, bottom: 10 }} barGap={6}>
                            <defs>
                                <linearGradient id="cahpsBarGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0D9488" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#0D9488" stopOpacity={0.6} />
                                </linearGradient>
                                <linearGradient id="cahpsNatGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#64748b" stopOpacity={0.5} />
                                    <stop offset="100%" stopColor="#64748b" stopOpacity={0.2} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                            <XAxis
                                dataKey="name" axisLine={false} tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 11 }}
                                interval={0}
                                angle={0}
                                height={50}
                                tickFormatter={(value: string) => value.length > 20 ? value.slice(0, 18) + '...' : value}
                            />
                            <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                formatter={(value: number, name: string) => [`${value}%`, name === 'score' ? 'Your Plan' : 'National Avg']}
                            />
                            <Bar dataKey="score" name="score" fill="url(#cahpsBarGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="nationalAvg" name="nationalAvg" fill="url(#cahpsNatGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* ── 6. Benchmark Comparison ─────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
            >
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={18} style={{ color: 'var(--apex-teal, #0D9488)' }} />
                    Benchmark Comparison
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {benchmarkData.map((item, index) => (
                        <motion.div
                            key={item.metric}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.52 + index * 0.04, duration: 0.4 }}
                            style={{
                                ...cardStyle,
                                padding: '20px'
                            }}
                        >
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--apex-steel, #94A3B8)', marginBottom: '14px' }}>
                                {item.metric}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '10px', color: 'var(--apex-steel, #94A3B8)', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>Your Plan</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--apex-teal, #0D9488)' }}>{item.yourPlan}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', color: 'var(--apex-steel, #94A3B8)', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>National</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{item.nationalAvg}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', color: 'var(--apex-steel, #94A3B8)', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>Peer Group</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{item.peerGroup}</div>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                fontSize: '12px', fontWeight: 600,
                                color: item.positive ? 'var(--apex-success, #10B981)' : 'var(--apex-red, #EF4444)',
                                background: item.positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                padding: '4px 10px', borderRadius: '8px',
                                border: item.positive ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)',
                                width: 'fit-content'
                            }}>
                                {item.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {item.delta} vs National
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ── 7. Improvement Action Items ─────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                style={cardStyle}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Brain size={18} style={{ color: 'var(--apex-purple, #8B5CF6)' }} />
                    AI-Generated Improvement Recommendations
                    </h3>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '11px', fontWeight: 600, color: '#8B5CF6',
                        background: 'rgba(139,92,246,0.1)', padding: '4px 10px',
                        borderRadius: '12px', border: '1px solid rgba(139,92,246,0.2)'
                    }}>
                        <Sparkles size={12} />
                        Powered by Apex AI
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {actionItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.65 + index * 0.05 }}
                            style={{
                                background: 'rgba(0,0,0,0.02)',
                                border: '1px solid #E5E7EB',
                                borderRadius: '12px',
                                padding: '18px 20px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '16px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: item.priority === 'Critical' ? 'rgba(239,68,68,0.15)' :
                                    item.priority === 'High' ? 'rgba(245,158,11,0.15)' : 'rgba(6,182,212,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                color: item.priority === 'Critical' ? '#EF4444' :
                                    item.priority === 'High' ? '#F59E0B' : '#06B6D4'
                            }}>
                                {item.priority === 'Critical' ? <Zap size={16} /> :
                                    item.priority === 'High' ? <AlertTriangle size={16} /> : <Activity size={16} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{item.title}</span>
                                    <span style={{
                                        ...getPriorityStyle(item.priority),
                                        display: 'inline-flex', alignItems: 'center',
                                        padding: '2px 8px', borderRadius: '8px',
                                        fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px'
                                    }}>
                                        {item.priority}
                                    </span>
                                </div>
                                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--apex-steel, #94A3B8)', lineHeight: 1.5 }}>
                                    {item.description}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        color: 'var(--apex-success, #10B981)', fontWeight: 600,
                                        background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '6px'
                                    }}>
                                        <TrendingUp size={10} />
                                        {item.starImpact}
                                    </span>
                                    <span style={{ color: 'var(--apex-steel, #94A3B8)' }}>
                                        Domain: {item.domain}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ── 8. Export Actions ───────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.5 }}
                style={{
                    display: 'flex', justifyContent: 'flex-end', gap: '12px',
                    paddingTop: '8px', paddingBottom: '16px'
                }}
            >
                <button
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '12px 24px', borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        background: 'rgba(0,0,0,0.04)',
                        color: '#111827', fontSize: '14px', fontWeight: 500,
                        cursor: 'pointer', transition: 'all 0.2s ease'
                    }}
                >
                    <FileText size={16} />
                    Generate CMS Report
                </button>
                <button
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '12px 24px', borderRadius: '12px',
                        border: '1px solid rgba(13,148,136,0.3)',
                        background: 'linear-gradient(135deg, rgba(13,148,136,0.2) 0%, rgba(13,148,136,0.1) 100%)',
                        color: 'var(--apex-teal, #0D9488)', fontSize: '14px', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s ease'
                    }}
                >
                    <Download size={16} />
                    Download HEDIS Data
                </button>
            </motion.div>
        </div>
    )
}
