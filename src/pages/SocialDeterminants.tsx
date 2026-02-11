import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'
import {
    Heart,
    Users,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    TrendingDown,
    MapPin,
    Home,
    Car,
    DollarSign,
    BookOpen,
    UserX,
    Utensils,
    Sparkles,
    Brain,
    Activity,
    FileText,
    Phone,
    Clock,
    ArrowRight,
    Shield,
    Target,
    Building2,
    Handshake,
    ClipboardList
} from 'lucide-react'

// ─── Mock Data ──────────────────────────────────────────────────────────────

const sdohRiskCategories = [
    { category: 'Financial Strain', percentage: 22, members: 2846, color: 'var(--apex-red, #EF4444)' },
    { category: 'Food Insecurity', percentage: 18, members: 2312, color: 'var(--apex-amber, #F59E0B)' },
    { category: 'Transportation Barriers', percentage: 15, members: 1927, color: 'var(--apex-purple, #8B5CF6)' },
    { category: 'Housing Instability', percentage: 12, members: 1542, color: 'var(--apex-cyan, #06B6D4)' },
    { category: 'Social Isolation', percentage: 8, members: 1028, color: 'var(--apex-teal, #0D9488)' },
    { category: 'Education/Literacy', percentage: 6, members: 771, color: 'var(--apex-blue, #6366F1)' },
]

const outcomesComparison = [
    { metric: 'ER Visits (per 1K)', withIntervention: 42, without: 78 },
    { metric: 'Hospital Readmissions', withIntervention: 8, without: 19 },
    { metric: 'Preventive Care (%)', withIntervention: 82, without: 54 },
    { metric: 'Medication Adherence (%)', withIntervention: 88, without: 61 },
    { metric: 'PCP Visits (per year)', withIntervention: 4.2, without: 1.8 },
]

const heatMapData: { zip: string; risk: 'low' | 'moderate' | 'high' | 'critical'; score: number; members: number }[][] = [
    [
        { zip: '10001', risk: 'moderate', score: 42, members: 312 },
        { zip: '10002', risk: 'high', score: 71, members: 487 },
        { zip: '10003', risk: 'low', score: 18, members: 201 },
        { zip: '10004', risk: 'moderate', score: 38, members: 156 },
        { zip: '10005', risk: 'low', score: 22, members: 289 },
        { zip: '10006', risk: 'high', score: 68, members: 534 },
        { zip: '10007', risk: 'moderate', score: 45, members: 178 },
    ],
    [
        { zip: '10008', risk: 'low', score: 15, members: 245 },
        { zip: '10009', risk: 'critical', score: 89, members: 612 },
        { zip: '10010', risk: 'high', score: 74, members: 398 },
        { zip: '10011', risk: 'moderate', score: 51, members: 267 },
        { zip: '10012', risk: 'high', score: 66, members: 445 },
        { zip: '10013', risk: 'low', score: 20, members: 312 },
        { zip: '10014', risk: 'moderate', score: 41, members: 189 },
    ],
    [
        { zip: '10015', risk: 'high', score: 78, members: 523 },
        { zip: '10016', risk: 'moderate', score: 44, members: 287 },
        { zip: '10017', risk: 'low', score: 12, members: 198 },
        { zip: '10018', risk: 'critical', score: 92, members: 701 },
        { zip: '10019', risk: 'moderate', score: 47, members: 234 },
        { zip: '10020', risk: 'high', score: 63, members: 389 },
        { zip: '10021', risk: 'low', score: 25, members: 156 },
    ],
    [
        { zip: '10022', risk: 'moderate', score: 39, members: 278 },
        { zip: '10023', risk: 'low', score: 19, members: 312 },
        { zip: '10024', risk: 'high', score: 72, members: 467 },
        { zip: '10025', risk: 'moderate', score: 48, members: 198 },
        { zip: '10026', risk: 'critical', score: 86, members: 589 },
        { zip: '10027', risk: 'moderate', score: 43, members: 234 },
        { zip: '10028', risk: 'low', score: 21, members: 167 },
    ],
    [
        { zip: '10029', risk: 'high', score: 69, members: 412 },
        { zip: '10030', risk: 'moderate', score: 46, members: 289 },
        { zip: '10031', risk: 'low', score: 16, members: 178 },
        { zip: '10032', risk: 'moderate', score: 52, members: 256 },
        { zip: '10033', risk: 'high', score: 65, members: 345 },
        { zip: '10034', risk: 'low', score: 14, members: 201 },
        { zip: '10035', risk: 'moderate', score: 40, members: 223 },
    ],
]

interface MemberProfile {
    id: string
    name: string
    age: number
    plan: string
    riskScore: number
    screeningDate: string
    riskFactors: { factor: string; severity: 'high' | 'moderate' | 'low' }[]
    interventionStatus: 'active' | 'pending' | 'completed'
    interventions: string[]
}

const memberProfiles: MemberProfile[] = [
    {
        id: 'MBR-48291',
        name: 'Maria Gonzalez',
        age: 62,
        plan: 'Medicare Advantage',
        riskScore: 84,
        screeningDate: '2026-01-14',
        riskFactors: [
            { factor: 'Food Insecurity', severity: 'high' },
            { factor: 'Transportation Barriers', severity: 'high' },
            { factor: 'Social Isolation', severity: 'moderate' },
        ],
        interventionStatus: 'active',
        interventions: ['Food bank referral', 'Medical transport enrollment', 'Community wellness program'],
    },
    {
        id: 'MBR-73104',
        name: 'James Williams',
        age: 45,
        plan: 'Medicaid',
        riskScore: 72,
        screeningDate: '2026-01-22',
        riskFactors: [
            { factor: 'Housing Instability', severity: 'high' },
            { factor: 'Financial Strain', severity: 'high' },
        ],
        interventionStatus: 'active',
        interventions: ['Housing assistance program', 'Financial counseling referral'],
    },
    {
        id: 'MBR-51887',
        name: 'Susan Chen',
        age: 38,
        plan: 'Commercial HMO',
        riskScore: 56,
        screeningDate: '2026-02-01',
        riskFactors: [
            { factor: 'Education/Literacy', severity: 'moderate' },
            { factor: 'Financial Strain', severity: 'moderate' },
        ],
        interventionStatus: 'pending',
        interventions: ['Health literacy program enrollment pending'],
    },
    {
        id: 'MBR-29456',
        name: 'Robert Jackson',
        age: 71,
        plan: 'Medicare Advantage',
        riskScore: 91,
        screeningDate: '2025-12-18',
        riskFactors: [
            { factor: 'Food Insecurity', severity: 'high' },
            { factor: 'Housing Instability', severity: 'high' },
            { factor: 'Social Isolation', severity: 'high' },
            { factor: 'Transportation Barriers', severity: 'moderate' },
        ],
        interventionStatus: 'active',
        interventions: ['Meals on Wheels', 'Senior housing referral', 'Companion program', 'Non-emergency transport'],
    },
]

interface CommunityResource {
    name: string
    type: string
    location: string
    referrals: number
    successRate: number
    capacity: 'available' | 'limited' | 'waitlist'
    phone: string
}

const communityResources: CommunityResource[] = [
    { name: 'Metro Food Alliance', type: 'Food Assistance', location: 'Downtown District', referrals: 487, successRate: 89, capacity: 'available', phone: '(555) 234-5678' },
    { name: 'SafeHaven Housing', type: 'Housing Support', location: 'Eastside', referrals: 312, successRate: 74, capacity: 'limited', phone: '(555) 345-6789' },
    { name: 'RideHealth Transit', type: 'Transportation', location: 'Citywide', referrals: 624, successRate: 92, capacity: 'available', phone: '(555) 456-7890' },
    { name: 'Financial Empowerment Center', type: 'Financial Counseling', location: 'Central Office', referrals: 198, successRate: 81, capacity: 'available', phone: '(555) 567-8901' },
    { name: 'Community Wellness Hub', type: 'Social Support', location: 'West Side', referrals: 156, successRate: 86, capacity: 'limited', phone: '(555) 678-9012' },
    { name: 'Literacy Bridge Program', type: 'Education', location: 'Multiple Locations', referrals: 89, successRate: 78, capacity: 'available', phone: '(555) 789-0123' },
]

interface ZCode {
    code: string
    description: string
    category: string
    count: number
    trend: 'up' | 'down' | 'stable'
    percentChange: number
    topSubcodes: string[]
}

const zCodes: ZCode[] = [
    { code: 'Z59', description: 'Problems related to housing and economic circumstances', category: 'Housing', count: 1542, trend: 'up', percentChange: 12.3, topSubcodes: ['Z59.0 Homelessness', 'Z59.1 Inadequate housing', 'Z59.7 Insufficient social insurance'] },
    { code: 'Z55', description: 'Problems related to education and literacy', category: 'Education', count: 771, trend: 'stable', percentChange: 1.2, topSubcodes: ['Z55.0 Illiteracy', 'Z55.3 Underachievement in school', 'Z55.9 Unspecified'] },
    { code: 'Z56', description: 'Problems related to employment and unemployment', category: 'Employment', count: 1198, trend: 'up', percentChange: 8.7, topSubcodes: ['Z56.0 Unemployment', 'Z56.1 Change of job', 'Z56.9 Unspecified'] },
    { code: 'Z57', description: 'Occupational exposure to risk factors', category: 'Occupational', count: 432, trend: 'down', percentChange: -3.4, topSubcodes: ['Z57.1 Occupational exposure to radiation', 'Z57.5 Exposure to toxic agents'] },
    { code: 'Z60', description: 'Problems related to social environment', category: 'Social Environment', count: 1028, trend: 'up', percentChange: 15.1, topSubcodes: ['Z60.2 Living alone', 'Z60.4 Social exclusion', 'Z60.8 Other social environment'] },
]

const interventionOutcomesPie = [
    { name: 'Positive Outcome', value: 76, color: 'var(--apex-success, #10B981)' },
    { name: 'In Progress', value: 15, color: 'var(--apex-teal, #0D9488)' },
    { name: 'No Change', value: 6, color: 'var(--apex-amber, #F59E0B)' },
    { name: 'Declined', value: 3, color: 'var(--apex-red, #EF4444)' },
]

// ─── Styles ──────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
}

const tooltipStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontSize: '12px',
    color: '#111827',
}

const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 14px',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--apex-steel, #8892a4)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '1px solid #E5E7EB',
}

const tdStyle: React.CSSProperties = {
    padding: '12px 14px',
    fontSize: '13px',
    color: '#4B5563',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getRiskColor = (risk: 'low' | 'moderate' | 'high' | 'critical') => {
    switch (risk) {
        case 'low': return 'var(--apex-success, #10B981)'
        case 'moderate': return 'var(--apex-amber, #F59E0B)'
        case 'high': return 'var(--apex-red, #EF4444)'
        case 'critical': return 'var(--apex-critical, #DC2626)'
    }
}

const getRiskBg = (risk: 'low' | 'moderate' | 'high' | 'critical') => {
    switch (risk) {
        case 'low': return 'rgba(16, 185, 129, 0.35)'
        case 'moderate': return 'rgba(245, 158, 11, 0.4)'
        case 'high': return 'rgba(239, 68, 68, 0.45)'
        case 'critical': return 'rgba(220, 38, 38, 0.6)'
    }
}

const getSeverityStyle = (severity: 'high' | 'moderate' | 'low'): React.CSSProperties => {
    switch (severity) {
        case 'high':
            return { background: 'rgba(239,68,68,0.12)', color: 'var(--apex-red, #EF4444)', border: '1px solid rgba(239,68,68,0.2)' }
        case 'moderate':
            return { background: 'rgba(245,158,11,0.12)', color: 'var(--apex-amber, #F59E0B)', border: '1px solid rgba(245,158,11,0.2)' }
        case 'low':
            return { background: 'rgba(16,185,129,0.12)', color: 'var(--apex-success, #10B981)', border: '1px solid rgba(16,185,129,0.2)' }
    }
}

const getInterventionStatusStyle = (status: 'active' | 'pending' | 'completed'): React.CSSProperties => {
    switch (status) {
        case 'active':
            return { background: 'rgba(13,148,136,0.12)', color: 'var(--apex-teal, #0D9488)', border: '1px solid rgba(13,148,136,0.2)' }
        case 'pending':
            return { background: 'rgba(245,158,11,0.12)', color: 'var(--apex-amber, #F59E0B)', border: '1px solid rgba(245,158,11,0.2)' }
        case 'completed':
            return { background: 'rgba(16,185,129,0.12)', color: 'var(--apex-success, #10B981)', border: '1px solid rgba(16,185,129,0.2)' }
    }
}

const getCapacityStyle = (capacity: 'available' | 'limited' | 'waitlist'): React.CSSProperties => {
    switch (capacity) {
        case 'available':
            return { background: 'rgba(16,185,129,0.12)', color: 'var(--apex-success, #10B981)', border: '1px solid rgba(16,185,129,0.2)' }
        case 'limited':
            return { background: 'rgba(245,158,11,0.12)', color: 'var(--apex-amber, #F59E0B)', border: '1px solid rgba(245,158,11,0.2)' }
        case 'waitlist':
            return { background: 'rgba(239,68,68,0.12)', color: 'var(--apex-red, #EF4444)', border: '1px solid rgba(239,68,68,0.2)' }
    }
}

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'Food Insecurity': return <Utensils size={16} />
        case 'Housing Instability': return <Home size={16} />
        case 'Transportation Barriers': return <Car size={16} />
        case 'Financial Strain': return <DollarSign size={16} />
        case 'Social Isolation': return <UserX size={16} />
        case 'Education/Literacy': return <BookOpen size={16} />
        default: return <Activity size={16} />
    }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function SocialDeterminants() {
    const [hoveredZip, setHoveredZip] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    return (
        <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* ── 1. Header ──────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}
            >
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        <Heart size={28} style={{ color: 'var(--apex-teal, #0D9488)', filter: 'drop-shadow(0 0 8px rgba(13,148,136,0.5))' }} />
                        Social Determinants of Health
                    </h1>
                    <p style={{ color: 'var(--apex-steel, #94A3B8)', fontSize: '15px', margin: '8px 0 0 0' }}>
                        SDOH screening, risk assessment, and community resource management
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.10))',
                        border: '1px solid rgba(139, 92, 246, 0.35)',
                        borderRadius: '20px', padding: '6px 14px', fontSize: '11px', fontWeight: 600,
                        color: '#a78bfa', letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>
                        <Brain size={14} />
                        AI-Powered Risk Scoring
                    </span>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(13,148,136,0.12)', color: '#0D9488',
                        border: '1px solid rgba(13,148,136,0.25)',
                        borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: 600,
                    }}>
                        <ClipboardList size={14} />
                        Q1 2026 Report
                    </span>
                </div>
            </motion.div>

            {/* ── 2. KPI Row ─────────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                    { label: 'Members Screened', value: '12,847', subtitle: '68% of eligible', icon: <Users size={20} />, color: 'var(--apex-teal, #0D9488)', trend: '+2,340 this quarter' },
                    { label: 'High-Risk Identified', value: '2,341', subtitle: '18.2% of screened', icon: <AlertTriangle size={20} />, color: 'var(--apex-red, #EF4444)', trend: '+312 new this month' },
                    { label: 'Interventions Active', value: '1,892', subtitle: '80.8% of high-risk', icon: <Handshake size={20} />, color: 'var(--apex-purple, #8B5CF6)', trend: '+156 initiated' },
                    { label: 'Positive Outcomes', value: '76%', subtitle: 'of completed interventions', icon: <CheckCircle2 size={20} />, color: 'var(--apex-success, #10B981)', trend: '+4.2% vs last quarter' },
                ].map((kpi, index) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
                        style={{
                            ...cardStyle,
                            display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px',
                        }}
                    >
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '14px',
                            background: `${kpi.color}15`, border: `1px solid ${kpi.color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: kpi.color, flexShrink: 0,
                        }}>
                            {kpi.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', color: 'var(--apex-steel, #94A3B8)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{kpi.label}</div>
                            <div style={{ fontSize: '26px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{kpi.value}</div>
                            <div style={{ fontSize: '11px', color: 'var(--apex-steel, #94A3B8)', marginTop: '2px' }}>{kpi.subtitle}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11px', color: 'var(--apex-success, #10B981)' }}>
                                <TrendingUp size={11} />
                                {kpi.trend}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── 3. Risk Categories & Intervention Outcomes ──────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                {/* SDOH Risk Categories Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    style={cardStyle}
                >
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity size={18} style={{ color: 'var(--apex-teal, #0D9488)' }} />
                        SDOH Risk Categories
                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--apex-steel, #94A3B8)', fontWeight: 400 }}>% of screened members affected</span>
                    </h3>
                    <div style={{ width: '100%', height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={sdohRiskCategories}
                                layout="vertical"
                                margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                                <XAxis type="number" domain={[0, 30]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
                                <YAxis
                                    type="category"
                                    dataKey="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                                    width={160}
                                />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    formatter={(value: number, _name: string, props: any) => [`${value}% (${props?.payload?.members?.toLocaleString() ?? '—'} members)`, 'Prevalence']}
                                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                />
                                <Bar dataKey="percentage" radius={[0, 8, 8, 0]} maxBarSize={28}>
                                    {sdohRiskCategories.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Category pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                        {sdohRiskCategories.map(cat => (
                            <button
                                key={cat.category}
                                onClick={() => setSelectedCategory(selectedCategory === cat.category ? null : cat.category)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 500,
background: selectedCategory === cat.category ? `${cat.color}20` : 'rgba(0,0,0,0.04)',
                                                    border: selectedCategory === cat.category ? `1px solid ${cat.color}40` : '1px solid #E5E7EB',
                                    color: selectedCategory === cat.category ? cat.color : 'var(--apex-steel, #94A3B8)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                            >
                                {getCategoryIcon(cat.category)}
                                {cat.category}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Intervention Outcomes Pie */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    style={cardStyle}
                >
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Target size={18} style={{ color: 'var(--apex-success, #10B981)' }} />
                        Intervention Outcomes
                    </h3>
                    <div style={{ width: '100%', height: '240px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={interventionOutcomesPie}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {interventionOutcomesPie.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, 'Percentage']} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            textAlign: 'center', pointerEvents: 'none',
                        }}>
                            <span style={{ display: 'block', fontSize: '28px', fontWeight: 700, color: '#111827' }}>76%</span>
                            <span style={{ fontSize: '11px', color: 'var(--apex-steel, #94A3B8)' }}>Positive</span>
                        </div>
                    </div>
                    {/* Legend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                        {interventionOutcomesPie.map(item => (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color, flexShrink: 0 }} />
                                <span style={{ flex: 1, fontSize: '13px', color: 'var(--apex-silver, #b0b8c8)' }}>{item.name}</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── 4. Geospatial Heat Map ─────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={cardStyle}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MapPin size={18} style={{ color: 'var(--apex-teal, #0D9488)' }} />
                        Geospatial SDOH Risk Distribution
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px' }}>
                        {[
                            { label: 'Low', color: '#10B981' },
                            { label: 'Moderate', color: '#F59E0B' },
                            { label: 'High', color: '#EF4444' },
                            { label: 'Critical', color: '#DC2626' },
                        ].map(l => (
                            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: l.color, opacity: 0.7 }} />
                                <span style={{ color: 'var(--apex-steel, #94A3B8)', fontWeight: 500 }}>{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {heatMapData.map((row, rowIdx) => (
                        <div key={rowIdx} style={{ display: 'flex', gap: '4px' }}>
                            {row.map((cell) => (
                                <div
                                    key={cell.zip}
                                    onMouseEnter={() => setHoveredZip(cell.zip)}
                                    onMouseLeave={() => setHoveredZip(null)}
                                    style={{
                                        flex: 1,
                                        height: '64px',
                                        borderRadius: '8px',
                                        background: getRiskBg(cell.risk),
                                        border: hoveredZip === cell.zip ? `2px solid ${getRiskColor(cell.risk)}` : '2px solid transparent',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', transition: 'all 0.2s',
                                        position: 'relative',
                                        transform: hoveredZip === cell.zip ? 'scale(1.05)' : 'scale(1)',
                                        zIndex: hoveredZip === cell.zip ? 10 : 1,
                                        boxShadow: hoveredZip === cell.zip ? `0 4px 20px ${getRiskColor(cell.risk)}40` : 'none',
                                    }}
                                >
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#111827', opacity: 0.9 }}>{cell.zip}</span>
                                    <span style={{ fontSize: '10px', color: 'rgba(0,0,0,0.5)' }}>Score: {cell.score}</span>
                                    {hoveredZip === cell.zip && (
                                        <div style={{
                                            position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                                            background: '#FFFFFF',
                                            border: '1px solid #E5E7EB', borderRadius: '10px',
                                            padding: '10px 14px', whiteSpace: 'nowrap', zIndex: 100,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        }}>
                                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>ZIP {cell.zip}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--apex-steel, #94A3B8)' }}>Risk Score: {cell.score} · {cell.members} members</div>
                                            <div style={{ fontSize: '11px', color: getRiskColor(cell.risk), fontWeight: 600, marginTop: '2px', textTransform: 'capitalize' }}>{cell.risk} Risk</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', fontSize: '12px', color: 'var(--apex-steel, #94A3B8)' }}>
                    <Sparkles size={14} style={{ color: 'var(--apex-purple, #8B5CF6)' }} />
                    AI identifies 3 critical zones requiring immediate community outreach expansion
                </div>
            </motion.div>

            {/* ── 5. Member SDOH Profiles ──────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
            >
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={20} style={{ color: 'var(--apex-teal, #0D9488)' }} />
                    Member SDOH Profiles
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--apex-steel, #94A3B8)', fontWeight: 400 }}>Showing high-priority members</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {memberProfiles.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.06, duration: 0.4 }}
                            style={{
                                ...cardStyle,
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Risk score glow */}
                            <div style={{
                                position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px',
                                background: `radial-gradient(circle, ${member.riskScore >= 80 ? 'rgba(239,68,68,0.08)' : member.riskScore >= 60 ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)'} 0%, transparent 70%)`,
                                borderRadius: '50%', pointerEvents: 'none',
                            }} />

                            {/* Header row */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{member.name}</span>
                                        <span style={{
                                            fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '6px',
                                            background: 'rgba(0,0,0,0.04)', color: '#6B7280',
                                            fontFamily: 'monospace',
                                        }}>
                                            {member.id}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--apex-steel, #94A3B8)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span>Age {member.age}</span>
                                        <span>·</span>
                                        <span>{member.plan}</span>
                                        <span>·</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={11} />
                                            Screened {member.screeningDate}
                                        </span>
                                    </div>
                                </div>
                                <div style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    padding: '8px 14px', borderRadius: '12px',
                                    background: member.riskScore >= 80 ? 'rgba(239,68,68,0.12)' : member.riskScore >= 60 ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                                    border: `1px solid ${member.riskScore >= 80 ? 'rgba(239,68,68,0.2)' : member.riskScore >= 60 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
                                }}>
                                    <span style={{
                                        fontSize: '20px', fontWeight: 700, lineHeight: 1,
                                        color: member.riskScore >= 80 ? 'var(--apex-red, #EF4444)' : member.riskScore >= 60 ? 'var(--apex-amber, #F59E0B)' : 'var(--apex-success, #10B981)',
                                    }}>
                                        {member.riskScore}
                                    </span>
                                    <span style={{ fontSize: '9px', fontWeight: 500, color: 'var(--apex-steel, #94A3B8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Risk Score</span>
                                </div>
                            </div>

                            {/* Risk Factors */}
                            <div style={{ marginBottom: '14px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--apex-steel, #94A3B8)', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '8px' }}>
                                    Risk Factors
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {member.riskFactors.map(rf => (
                                        <span key={rf.factor} style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                            padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                                            ...getSeverityStyle(rf.severity),
                                        }}>
                                            {getCategoryIcon(rf.factor)}
                                            {rf.factor}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Intervention Status & Actions */}
                            <div style={{
                                padding: '12px', borderRadius: '10px',
                                background: 'rgba(0,0,0,0.02)', border: '1px solid #E5E7EB',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--apex-steel, #94A3B8)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                        Interventions
                                    </span>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                                        textTransform: 'uppercase',
                                        ...getInterventionStatusStyle(member.interventionStatus),
                                    }}>
                                        {member.interventionStatus === 'active' && <Activity size={10} />}
                                        {member.interventionStatus === 'pending' && <Clock size={10} />}
                                        {member.interventionStatus === 'completed' && <CheckCircle2 size={10} />}
                                        {member.interventionStatus}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {member.interventions.map((intervention, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--apex-silver, #b0b8c8)' }}>
                                            <ArrowRight size={10} style={{ color: 'var(--apex-teal, #0D9488)', flexShrink: 0 }} />
                                            {intervention}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ── 6. Community Resource Directory ──────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                style={cardStyle}
            >
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Building2 size={18} style={{ color: 'var(--apex-teal, #0D9488)' }} />
                    Community Resource Directory
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--apex-steel, #94A3B8)', fontWeight: 400 }}>{communityResources.length} active partners</span>
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Organization</th>
                                <th style={thStyle}>Resource Type</th>
                                <th style={thStyle}>Location</th>
                                <th style={thStyle}>Referrals Made</th>
                                <th style={thStyle}>Success Rate</th>
                                <th style={thStyle}>Capacity</th>
                                <th style={thStyle}>Contact</th>
                            </tr>
                        </thead>
                        <tbody>
                            {communityResources.map((resource) => (
                                <tr key={resource.name} style={{ transition: 'background 0.15s' }}>
                                    <td style={{ ...tdStyle, fontWeight: 600, color: '#111827' }}>{resource.name}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                                            background: 'rgba(13,148,136,0.1)', color: 'var(--apex-teal, #0D9488)', border: '1px solid rgba(13,148,136,0.2)',
                                        }}>
                                            {resource.type}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <MapPin size={12} style={{ color: 'var(--apex-steel, #94A3B8)' }} />
                                            {resource.location}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, fontWeight: 600, color: '#111827' }}>{resource.referrals.toLocaleString()}</td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden', maxWidth: '80px' }}>
                                                <div style={{
                                                    width: `${resource.successRate}%`, height: '100%', borderRadius: '3px',
                                                    background: resource.successRate >= 85 ? 'var(--apex-success, #10B981)' : resource.successRate >= 75 ? 'var(--apex-amber, #F59E0B)' : 'var(--apex-red, #EF4444)',
                                                }} />
                                            </div>
                                            <span style={{ fontWeight: 600, color: resource.successRate >= 85 ? 'var(--apex-success, #10B981)' : resource.successRate >= 75 ? 'var(--apex-amber, #F59E0B)' : 'var(--apex-red, #EF4444)' }}>
                                                {resource.successRate}%
                                            </span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                                            textTransform: 'capitalize',
                                            ...getCapacityStyle(resource.capacity),
                                        }}>
                                            {resource.capacity}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--apex-steel, #94A3B8)' }}>
                                            <Phone size={11} />
                                            {resource.phone}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ── 7. Z-Code Tracking ──────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                style={cardStyle}
            >
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} style={{ color: 'var(--apex-purple, #8B5CF6)' }} />
                    ICD-10 Z-Code Tracking
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        marginLeft: '12px', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 500,
                        background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)',
                    }}>
                        <Sparkles size={11} />
                        AI auto-capture enabled
                    </span>
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Z-Code</th>
                                <th style={thStyle}>Description</th>
                                <th style={thStyle}>Category</th>
                                <th style={thStyle}>Count</th>
                                <th style={thStyle}>Trend</th>
                                <th style={thStyle}>Top Subcodes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zCodes.map((zCode) => (
                                <tr key={zCode.code}>
                                    <td style={tdStyle}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center',
                                            padding: '3px 10px', background: 'rgba(0,0,0,0.04)',
                                            borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                                            fontFamily: 'monospace', color: '#111827',
                                        }}>
                                            {zCode.code}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, maxWidth: '280px' }}>{zCode.description}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                            padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                                            background: 'rgba(13,148,136,0.1)', color: 'var(--apex-teal, #0D9488)', border: '1px solid rgba(13,148,136,0.2)',
                                        }}>
                                            {zCode.category}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, fontWeight: 600, color: '#111827', fontSize: '14px' }}>{zCode.count.toLocaleString()}</td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {zCode.trend === 'up' && <TrendingUp size={14} style={{ color: 'var(--apex-red, #EF4444)' }} />}
                                            {zCode.trend === 'down' && <TrendingDown size={14} style={{ color: 'var(--apex-success, #10B981)' }} />}
                                            {zCode.trend === 'stable' && <ArrowRight size={14} style={{ color: 'var(--apex-steel, #94A3B8)' }} />}
                                            <span style={{
                                                fontWeight: 600, fontSize: '12px',
                                                color: zCode.trend === 'up' ? 'var(--apex-red, #EF4444)' : zCode.trend === 'down' ? 'var(--apex-success, #10B981)' : 'var(--apex-steel, #94A3B8)',
                                            }}>
                                                {zCode.percentChange > 0 ? '+' : ''}{zCode.percentChange}%
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ ...tdStyle, maxWidth: '300px' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {zCode.topSubcodes.map((sub, i) => (
                                                <span key={i} style={{
                                                    fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                                                    background: 'rgba(0,0,0,0.04)', color: '#6B7280',
                                                    border: '1px solid #E5E7EB',
                                                }}>
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ── 8. Impact on Clinical Outcomes ──────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.5 }}
                style={cardStyle}
            >
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={18} style={{ color: 'var(--apex-teal, #0D9488)' }} />
                    Impact on Clinical Outcomes
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--apex-steel, #94A3B8)', fontWeight: 400 }}>
                        SDOH Intervention vs No Intervention cohort comparison
                    </span>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--apex-steel, #94A3B8)', margin: '0 0 20px 0' }}>
                    Members receiving SDOH interventions demonstrate significantly improved health outcomes across all measured categories
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Chart */}
                    <div style={{ width: '100%', height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={outcomesComparison}
                                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                                <XAxis
                                    dataKey="metric"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                    angle={-15}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend
                                    wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                                    formatter={(value: string) => <span style={{ color: '#94A3B8' }}>{value}</span>}
                                />
                                <Bar dataKey="withIntervention" name="With SDOH Intervention" fill="#0D9488" radius={[6, 6, 0, 0]} maxBarSize={36} />
                                <Bar dataKey="without" name="Without Intervention" fill="rgba(0,0,0,0.12)" radius={[6, 6, 0, 0]} maxBarSize={36} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Outcome detail cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                        {[
                            { label: 'ER Visit Reduction', value: '46%', desc: '42 vs 78 per 1,000 members', icon: <Activity size={16} />, color: 'var(--apex-success, #10B981)' },
                            { label: 'Readmission Reduction', value: '58%', desc: '8% vs 19% readmission rate', icon: <Shield size={16} />, color: 'var(--apex-teal, #0D9488)' },
                            { label: 'Preventive Care Increase', value: '+52%', desc: '82% vs 54% compliance rate', icon: <Heart size={16} />, color: 'var(--apex-purple, #8B5CF6)' },
                            { label: 'Medication Adherence', value: '+44%', desc: '88% vs 61% adherence rate', icon: <Target size={16} />, color: 'var(--apex-cyan, #06B6D4)' },
                            { label: 'Annual Cost Savings', value: '$4,200', desc: 'per member with active interventions', icon: <DollarSign size={16} />, color: 'var(--apex-amber, #F59E0B)' },
                        ].map((outcome) => (
                            <div key={outcome.label} style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '14px 16px', borderRadius: '12px',
                                background: 'rgba(0,0,0,0.02)', border: '1px solid #E5E7EB',
                            }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    background: `${outcome.color}15`, border: `1px solid ${outcome.color}25`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: outcome.color, flexShrink: 0,
                                }}>
                                    {outcome.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '12px', color: 'var(--apex-steel, #94A3B8)', fontWeight: 500 }}>{outcome.label}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--apex-steel, #94A3B8)', marginTop: '2px' }}>{outcome.desc}</div>
                                </div>
                                <span style={{ fontSize: '20px', fontWeight: 700, color: outcome.color }}>{outcome.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Insight Footer */}
                <div style={{
                    marginTop: '20px', padding: '14px 18px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06), #FFFFFF)',
                    border: '1px solid rgba(139, 92, 246, 0.18)',
                    display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                    <Brain size={18} style={{ color: '#a78bfa', flexShrink: 0 }} />
                    <div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#a78bfa' }}>AI Insight: </span>
                        <span style={{ fontSize: '12px', color: 'var(--apex-silver, #b0b8c8)' }}>
                            Members with 3+ SDOH risk factors who receive coordinated interventions show 2.3x greater improvement in clinical outcomes.
                            Expanding the food insecurity program to 800 additional members could save an estimated $3.4M annually.
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
