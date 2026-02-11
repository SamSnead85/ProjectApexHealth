import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Brush
} from 'recharts'
import {
    Crown, TrendingUp, TrendingDown, DollarSign, Users, Activity, Shield,
    Brain, Sparkles, FileText, Download, RefreshCw, Target, Zap, AlertTriangle,
    Clock, ArrowUpRight, ArrowDownRight, ChevronDown, X, Calendar, Filter,
    BarChart3
} from 'lucide-react'
import { PremiumMetricCard, type CardVariant, type TrendDirection } from '../components/ui/PremiumMetricCard'
import { PageSkeleton } from '../components/common'
import './ExecutiveDashboard.css'

// ── TIME RANGES ──
const timeRanges = ['Today', 'Week', 'Month', 'Quarter', 'Year'] as const
type TimeRange = typeof timeRanges[number]

const comparisonModes = ['vs Last Period', 'vs Budget', 'vs Forecast'] as const
type ComparisonMode = typeof comparisonModes[number]

// ── KPI DATA ──
interface KPI {
    id: string; title: string; value: string; trend: { direction: TrendDirection; value: string }
    benchmark: string; status: 'success' | 'warning' | 'critical' | 'neutral'
    icon: React.ReactNode; variant: CardVariant; sparkline: number[]
    drilldown: { label: string; value: string; change: string }[]
    threshold?: { warn: number; crit: number; current: number }
}

const kpis: KPI[] = [
    {
        id: '1', title: 'Total Claims Cost', value: '$24.7M',
        trend: { direction: 'down', value: '4.2%' }, benchmark: 'vs $25.8M budget',
        status: 'success', icon: <DollarSign size={22} />, variant: 'emerald',
        sparkline: [26.5, 26.1, 25.8, 25.4, 25.0, 24.9, 24.7],
        drilldown: [
            { label: 'Inpatient', value: '$8.6M', change: '-5.1%' },
            { label: 'Outpatient', value: '$6.9M', change: '-3.2%' },
            { label: 'Rx', value: '$5.4M', change: '+1.8%' },
            { label: 'Professional', value: '$3.8M', change: '-2.4%' },
        ]
    },
    {
        id: '2', title: 'Medical Loss Ratio', value: '82.4%',
        trend: { direction: 'down', value: '1.8%' }, benchmark: 'Target: 85%',
        status: 'success', icon: <Activity size={22} />, variant: 'teal',
        sparkline: [85.2, 84.8, 84.2, 83.8, 83.2, 82.8, 82.4],
        drilldown: [
            { label: 'Medical Costs', value: '$20.3M', change: '-3.1%' },
            { label: 'Premium Revenue', value: '$24.7M', change: '+1.2%' },
            { label: 'Admin Expense', value: '$2.0M', change: '-8.4%' },
            { label: 'Quality Improvement', value: '$0.9M', change: '+2.1%' },
        ],
        threshold: { warn: 84, crit: 88, current: 82.4 }
    },
    {
        id: '3', title: 'Member Enrollment', value: '47,892',
        trend: { direction: 'up', value: '3.1%' }, benchmark: '+1,423 this quarter',
        status: 'success', icon: <Users size={22} />, variant: 'purple',
        sparkline: [46000, 46400, 46800, 47100, 47400, 47700, 47892],
        drilldown: [
            { label: 'New Enrollees', value: '2,341', change: '+12.3%' },
            { label: 'Terminations', value: '918', change: '-4.2%' },
            { label: 'Net Change', value: '+1,423', change: '+8.1%' },
            { label: 'Retention Rate', value: '96.8%', change: '+0.4%' },
        ]
    },
    {
        id: '4', title: 'PMPM Cost', value: '$487',
        trend: { direction: 'up', value: '2.3%' }, benchmark: 'Industry: $512',
        status: 'warning', icon: <Target size={22} />, variant: 'amber',
        sparkline: [470, 475, 478, 480, 483, 485, 487],
        drilldown: [
            { label: 'Medical PMPM', value: '$412', change: '+2.8%' },
            { label: 'Rx PMPM', value: '$75', change: '+0.9%' },
            { label: 'High-Cost Claimants', value: '142', change: '+3.2%' },
            { label: 'vs Benchmark', value: '-$25', change: '-4.9%' },
        ],
        threshold: { warn: 500, crit: 550, current: 487 }
    },
]

// ── AI NARRATIVE ──
const aiNarratives: Record<TimeRange, string> = {
    Today: "Claims volume is 8% above daily average with 2,847 processed. Auto-adjudication rate at 94.2%. One high-cost claim ($142K) flagged for medical director review. Member portal engagement up 12% — digital ID card downloads driving traffic.",
    Week: "Weekly claims cost down 3.1% ($5.8M vs $6.0M budget). Denial rate held steady at 4.8%. AI fraud detection identified 3 suspicious provider billing patterns worth $420K. Prior auth turnaround improved to 18 hours average.",
    Month: "Monthly MLR improved to 82.4% (target 85%). Member enrollment grew by 892 net new members. Pharmacy costs trending 1.8% above forecast — specialty drug utilization driving increase. STAR ratings projected to improve 0.2 points.",
    Quarter: "Quarterly claims cost $24.7M vs $25.8M budget (4.2% under). PMPM trending at $487 vs industry $512. AI-powered denial management recovered $3.4M YTD. Network adequacy exceeding CMS standards in all 47 service areas.",
    Year: "YTD performance exceeds targets across all domains. Total savings of $4.2M identified through AI analytics. Member satisfaction (CAHPS) projected at 4.6/5. Admin cost ratio at 8.2% vs industry 11.4% — 28% more efficient."
}

// ── CHART DATA ──
const revenueData = [
    { month: 'Jul', revenue: 4.2, claims: 3.4, budget: 4.0 },
    { month: 'Aug', revenue: 4.1, claims: 3.6, budget: 4.1 },
    { month: 'Sep', revenue: 4.3, claims: 3.2, budget: 4.1 },
    { month: 'Oct', revenue: 4.4, claims: 3.5, budget: 4.2 },
    { month: 'Nov', revenue: 4.5, claims: 3.3, budget: 4.3 },
    { month: 'Dec', revenue: 4.6, claims: 3.4, budget: 4.3 },
    { month: 'Jan', revenue: 4.8, claims: 3.6, budget: 4.4 },
]

const categoryData = [
    { name: 'Inpatient', value: 35, color: 'var(--apex-teal, #14b8a6)' },
    { name: 'Outpatient', value: 28, color: 'var(--apex-cyan, #06b6d4)' },
    { name: 'Rx', value: 22, color: 'var(--apex-purple, #818cf8)' },
    { name: 'Professional', value: 15, color: 'var(--apex-amber, #f59e0b)' },
]

const benchmarks = [
    { label: 'Admin Cost %', you: '8.2%', industry: '11.4%', delta: '-28%', positive: true },
    { label: 'Claims Turnaround', you: '3.2 days', industry: '5.1 days', delta: '-37%', positive: true },
    { label: 'Member Satisfaction', you: '4.6/5', industry: '4.1/5', delta: '+12%', positive: true },
    { label: 'First Pass Rate', you: '94.2%', industry: '88.7%', delta: '+6.2%', positive: true },
]

const aiInsights = [
    { id: '1', type: 'opportunity' as const, text: 'Diabetes management program showing 23% cost reduction potential for 847 high-risk members', impact: '+$1.2M annual savings' },
    { id: '2', type: 'risk' as const, text: '34 members identified with rising specialty drug costs - recommend case management intervention', impact: 'Risk: $890K exposure' },
    { id: '3', type: 'trend' as const, text: 'Mental health utilization up 18% YoY - consider expanding behavioral health network', impact: 'Trending: +$450K' },
]

// ── DRILLDOWN PANEL ──
function DrilldownPanel({ kpi, onClose }: { kpi: KPI; onClose: () => void }) {
    return (
        <motion.div
            className="drilldown-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="drilldown-panel"
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                exit={{ x: 400 }}
                transition={{ type: 'spring', damping: 25 }}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-label={`${kpi.title} breakdown`}
            >
                <div className="drilldown-header">
                    <h3>{kpi.title} — Breakdown</h3>
                    <button onClick={onClose} className="drilldown-close" aria-label="Close drilldown panel"><X size={18} /></button>
                </div>
                <div className="drilldown-value">{kpi.value}</div>
                <div className="drilldown-benchmark">{kpi.benchmark}</div>

                {/* Sparkline chart */}
                <div style={{ height: 120, marginTop: 16 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={kpi.sparkline.map((v, i) => ({ i, v }))}>
                            <defs>
                                <linearGradient id="drillGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0D9488" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#0D9488" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="v" stroke="#0D9488" fill="url(#drillGrad)" strokeWidth={2} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Contributing factors */}
                <h4 style={{ color: 'var(--apex-silver)', fontSize: 13, fontWeight: 600, margin: '20px 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contributing Factors</h4>
                <div className="drilldown-factors">
                    {kpi.drilldown.map((item, idx) => (
                        <div key={idx} className="drilldown-factor">
                            <span className="drilldown-factor-label">{item.label}</span>
                            <span className="drilldown-factor-value">{item.value}</span>
                            <span className={`drilldown-factor-change ${item.change.startsWith('+') ? 'up' : 'down'}`}>{item.change}</span>
                        </div>
                    ))}
                </div>

                {/* Threshold indicator */}
                {kpi.threshold && (
                    <div style={{ marginTop: 20, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: 12, color: 'var(--apex-steel)', marginBottom: 8 }}>Threshold Status</div>
                        <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                            <div style={{
                                position: 'absolute', height: '100%', borderRadius: 4,
                                width: `${Math.min((kpi.threshold.current / kpi.threshold.crit) * 100, 100)}%`,
                                background: kpi.threshold.current > kpi.threshold.crit ? 'var(--apex-red, #ef4444)' : kpi.threshold.current > kpi.threshold.warn ? 'var(--apex-amber, #f59e0b)' : 'var(--apex-teal, #10b981)'
                            }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--apex-steel)' }}>
                            <span>Current: {kpi.threshold.current}</span>
                            <span>Warn: {kpi.threshold.warn}</span>
                            <span>Critical: {kpi.threshold.crit}</span>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    )
}

// ── MAIN COMPONENT ──
export default function ExecutiveDashboard() {
    const [loading, setLoading] = useState(true)
    useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t) }, [])
    const [refreshing, setRefreshing] = useState(false)
    const [timeRange, setTimeRange] = useState<TimeRange>('Quarter')
    const [comparison, setComparison] = useState<ComparisonMode>('vs Budget')
    const [drilldownKpi, setDrilldownKpi] = useState<KPI | null>(null)
    const [showTimeDropdown, setShowTimeDropdown] = useState(false)
    const [showCompDropdown, setShowCompDropdown] = useState(false)

    const handleRefresh = () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 1500)
    }

    if (loading) return <PageSkeleton />

    return (
        <div className="executive-dashboard">
            {/* Drilldown panel */}
            <AnimatePresence>
                {drilldownKpi && <DrilldownPanel kpi={drilldownKpi} onClose={() => setDrilldownKpi(null)} />}
            </AnimatePresence>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1>
                            <Crown size={28} style={{ color: 'var(--apex-amber, #eab308)' }} />
                            Executive Dashboard
                            <span className="executive-badge"><Sparkles size={12} />C-Suite View</span>
                        </h1>
                        <p className="page-subtitle">
                            Strategic insights and key performance indicators
                            <span className="last-updated"><Clock size={14} />Updated 2 min ago</span>
                        </p>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {/* Time range selector */}
                        <div style={{ position: 'relative' }}>
                            <button className="exec-control-btn" onClick={() => { setShowTimeDropdown(!showTimeDropdown); setShowCompDropdown(false) }} aria-label="Select time range" aria-expanded={showTimeDropdown} aria-haspopup="listbox">
                                <Calendar size={14} />{timeRange}<ChevronDown size={14} />
                            </button>
                            {showTimeDropdown && (
                                <div className="exec-dropdown" role="listbox" aria-label="Time range options">
                                    {timeRanges.map(t => (
                                        <button key={t} className={`exec-dropdown-item ${t === timeRange ? 'active' : ''}`}
                                            onClick={() => { setTimeRange(t); setShowTimeDropdown(false) }}>{t}</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Comparison mode */}
                        <div style={{ position: 'relative' }}>
                            <button className="exec-control-btn" onClick={() => { setShowCompDropdown(!showCompDropdown); setShowTimeDropdown(false) }} aria-label="Select comparison mode" aria-expanded={showCompDropdown} aria-haspopup="listbox">
                                <Filter size={14} />{comparison}<ChevronDown size={14} />
                            </button>
                            {showCompDropdown && (
                                <div className="exec-dropdown" role="listbox" aria-label="Comparison mode options">
                                    {comparisonModes.map(c => (
                                        <button key={c} className={`exec-dropdown-item ${c === comparison ? 'active' : ''}`} role="option" aria-selected={c === comparison}
                                            onClick={() => { setComparison(c); setShowCompDropdown(false) }}>{c}</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button className="action-btn secondary" onClick={handleRefresh}>
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />Refresh
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* AI Narrative Summary */}
            <motion.div className="ai-narrative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="ai-narrative-header">
                    <Brain size={18} className="ai-glow" />
                    <span>AI Executive Summary — {timeRange}</span>
                </div>
                <p className="ai-narrative-text">{aiNarratives[timeRange]}</p>
            </motion.div>

            {/* KPIs - clickable for drilldown */}
            <div className="executive-kpis" aria-label="Executive dashboard KPIs" role="region">
                {kpis.map((kpi) => (
                    <div key={kpi.id} onClick={() => setDrilldownKpi(kpi)} style={{ cursor: 'pointer' }}
                        className={kpi.threshold && kpi.threshold.current > kpi.threshold.warn ? 'kpi-threshold-warn' : ''}>
                        <PremiumMetricCard
                            value={kpi.value}
                            label={kpi.title}
                            icon={kpi.icon}
                            trend={kpi.trend}
                            variant={kpi.variant}
                            sparklineData={kpi.sparkline}
                        />
                    </div>
                ))}
            </div>

            {/* AI Insights Panel */}
            <motion.div className="ai-insights-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="insights-header">
                    <h2><Brain size={20} className="ai-glow" />AI Strategic Insights</h2>
                    <button className="action-btn secondary" onClick={handleRefresh}>
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />Refresh
                    </button>
                </div>
                <div className="insights-grid">
                    {aiInsights.map((insight, index) => (
                        <motion.div key={insight.id} className={`insight-card ${insight.type}`}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + index * 0.05 }}>
                            <div className="insight-label">
                                {insight.type === 'opportunity' && <Zap size={12} style={{ marginRight: '0.25rem' }} />}
                                {insight.type === 'risk' && <AlertTriangle size={12} style={{ marginRight: '0.25rem' }} />}
                                {insight.type === 'trend' && <TrendingUp size={12} style={{ marginRight: '0.25rem' }} />}
                                {insight.type}
                            </div>
                            <p className="insight-text">{insight.text}</p>
                            {insight.impact && <div className="insight-impact">{insight.impact}</div>}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Charts */}
            <div className="executive-charts">
                <motion.div className="chart-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} role="figure" aria-labelledby="revenue-chart-title" aria-describedby="revenue-chart-desc">
                    <h3 id="revenue-chart-title"><TrendingUp size={18} />Revenue vs Claims Trend</h3>
                    <p id="revenue-chart-desc" className="sr-only">Area chart comparing monthly revenue and claims cost trends over the past 7 months</p>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                                        <stop offset="50%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="claimsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                                        <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.1} />
                                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'linear-gradient(180deg, rgba(25,25,40,0.98), rgba(15,15,25,0.98))',
                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                    }}
                                    formatter={(value: number) => [`$${value}M`, '']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revenueGradient)" strokeWidth={3} name="Revenue"
                                    dot={{ fill: '#10b981', strokeWidth: 2, stroke: '#0a0a12', r: 4 }}
                                    activeDot={{ r: 7, fill: '#10b981', stroke: 'rgba(16,185,129,0.3)', strokeWidth: 6 }} />
                                <Area type="monotone" dataKey="claims" stroke="#f59e0b" fill="url(#claimsGradient)" strokeWidth={3} name="Claims"
                                    dot={{ fill: '#f59e0b', strokeWidth: 2, stroke: '#0a0a12', r: 4 }}
                                    activeDot={{ r: 7, fill: '#f59e0b', stroke: 'rgba(245,158,11,0.3)', strokeWidth: 6 }} />
                                {comparison === 'vs Budget' && (
                                    <Area type="monotone" dataKey="budget" stroke="#64748b" fill="none" strokeWidth={2} strokeDasharray="6 4" name="Budget" dot={false} />
                                )}
                                <Brush dataKey="month" height={24} stroke="rgba(13,148,136,0.3)" fill="rgba(10,15,26,0.8)"
                                    tickFormatter={() => ''} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div className="chart-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} role="figure" aria-labelledby="category-chart-title" aria-describedby="category-chart-desc">
                    <h3 id="category-chart-title"><Activity size={18} />Cost by Category</h3>
                    <p id="category-chart-desc" className="sr-only">Pie chart showing cost distribution: Inpatient 35%, Outpatient 28%, Rx 22%, Professional 15%</p>
                    <div className="chart-container chart-container--pie">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    {categoryData.map((entry, index) => (
                                        <linearGradient key={index} id={`pieGrad${index}`} x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3}
                                    dataKey="value" stroke="rgba(0,0,0,0.3)" strokeWidth={2}>
                                    {categoryData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#pieGrad${index})`} style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))' }} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'linear-gradient(180deg, rgba(25,25,40,0.98), rgba(15,15,25,0.98))',
                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                    }}
                                    formatter={(value: number) => [`${value}%`, '']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pie-center-label">
                            <span className="pie-center-value">$24.7M</span>
                            <span className="pie-center-text">Total Cost</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Benchmark Comparison */}
            <motion.div className="benchmark-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                <h3><Target size={18} />Industry Benchmark Comparison</h3>
                <div className="benchmark-grid">
                    {benchmarks.map((bench, index) => (
                        <div key={index} className="benchmark-card">
                            <div className="benchmark-label">{bench.label}</div>
                            <div className="benchmark-values">
                                <div className="benchmark-you"><div className="value">{bench.you}</div><div className="label">Your Plan</div></div>
                                <div className="benchmark-industry"><div className="value">{bench.industry}</div><div className="label">Industry</div></div>
                            </div>
                            <div className={`benchmark-delta ${bench.positive ? 'positive' : 'negative'}`}>
                                {bench.positive ? '✓' : '!'} {bench.delta} vs Industry
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Actions */}
            <motion.div className="executive-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <button className="action-btn secondary"><FileText size={16} />Generate Board Report</button>
                <button className="action-btn primary"><Download size={16} />Export to PowerPoint</button>
            </motion.div>
        </div>
    )
}
