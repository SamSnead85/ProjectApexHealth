import { useState } from 'react'
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
    Crown,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Activity,
    Shield,
    Brain,
    Sparkles,
    FileText,
    Download,
    RefreshCw,
    Target,
    Zap,
    AlertTriangle,
    Clock,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import './ExecutiveDashboard.css'

interface KPI {
    id: string
    title: string
    value: string
    trend: 'up' | 'down'
    trendValue: string
    benchmark: string
    status: 'success' | 'warning' | 'critical' | 'neutral'
    icon: React.ReactNode
}

interface AIInsight {
    id: string
    type: 'opportunity' | 'risk' | 'trend'
    text: string
    impact?: string
}

const kpis: KPI[] = [
    { id: '1', title: 'Total Claims Cost', value: '$24.7M', trend: 'down', trendValue: '-4.2%', benchmark: 'vs $25.8M budget', status: 'success', icon: <DollarSign size={18} /> },
    { id: '2', title: 'Medical Loss Ratio', value: '82.4%', trend: 'down', trendValue: '-1.8%', benchmark: 'Target: 85%', status: 'success', icon: <Activity size={18} /> },
    { id: '3', title: 'Member Enrollment', value: '47,892', trend: 'up', trendValue: '+3.1%', benchmark: '+1,423 this quarter', status: 'success', icon: <Users size={18} /> },
    { id: '4', title: 'PMPM Cost', value: '$487', trend: 'up', trendValue: '+2.3%', benchmark: 'Industry: $512', status: 'warning', icon: <Target size={18} /> },
]

const aiInsights: AIInsight[] = [
    { id: '1', type: 'opportunity', text: 'Diabetes management program showing 23% cost reduction potential for 847 high-risk members', impact: '+$1.2M annual savings' },
    { id: '2', type: 'risk', text: '34 members identified with rising specialty drug costs - recommend case management intervention', impact: 'Risk: $890K exposure' },
    { id: '3', type: 'trend', text: 'Mental health utilization up 18% YoY - consider expanding behavioral health network', impact: 'Trending: +$450K' },
]

const revenueData = [
    { month: 'Jul', revenue: 4.2, claims: 3.4 },
    { month: 'Aug', revenue: 4.1, claims: 3.6 },
    { month: 'Sep', revenue: 4.3, claims: 3.2 },
    { month: 'Oct', revenue: 4.4, claims: 3.5 },
    { month: 'Nov', revenue: 4.5, claims: 3.3 },
    { month: 'Dec', revenue: 4.6, claims: 3.4 },
    { month: 'Jan', revenue: 4.8, claims: 3.6 },
]

const categoryData = [
    { name: 'Inpatient', value: 35, color: '#14b8a6' },
    { name: 'Outpatient', value: 28, color: '#06b6d4' },
    { name: 'Rx', value: 22, color: '#818cf8' },
    { name: 'Professional', value: 15, color: '#f59e0b' },
]

const benchmarks = [
    { label: 'Admin Cost %', you: '8.2%', industry: '11.4%', delta: '-28%', positive: true },
    { label: 'Claims Turnaround', you: '3.2 days', industry: '5.1 days', delta: '-37%', positive: true },
    { label: 'Member Satisfaction', you: '4.6/5', industry: '4.1/5', delta: '+12%', positive: true },
    { label: 'First Pass Rate', you: '94.2%', industry: '88.7%', delta: '+6.2%', positive: true },
]

export default function ExecutiveDashboard() {
    const [refreshing, setRefreshing] = useState(false)

    const handleRefresh = () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 1500)
    }

    return (
        <div className="executive-dashboard">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <Crown size={28} style={{ color: '#eab308' }} />
                    Executive Dashboard
                    <span className="executive-badge">
                        <Sparkles size={12} />
                        C-Suite View
                    </span>
                </h1>
                <p className="page-subtitle">
                    Strategic insights and key performance indicators
                    <span className="last-updated">
                        <Clock size={14} />
                        Updated 2 min ago
                    </span>
                </p>
            </motion.div>

            {/* Executive KPIs */}
            <div className="executive-kpis">
                {kpis.map((kpi, index) => (
                    <motion.div
                        key={kpi.id}
                        className={`kpi-card ${kpi.status}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                    >
                        <div className="kpi-header">
                            <span className="kpi-title">{kpi.title}</span>
                            <div className="kpi-icon">{kpi.icon}</div>
                        </div>
                        <div className="kpi-value">{kpi.value}</div>
                        <div className="kpi-comparison">
                            <span className={`kpi-trend ${kpi.trend}`}>
                                {kpi.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {kpi.trendValue}
                            </span>
                            <span className="kpi-benchmark">{kpi.benchmark}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* AI Insights Panel */}
            <motion.div
                className="ai-insights-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="insights-header">
                    <h2>
                        <Brain size={20} className="ai-glow" />
                        AI Strategic Insights
                    </h2>
                    <button
                        className="action-btn secondary"
                        onClick={handleRefresh}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
                <div className="insights-grid">
                    {aiInsights.map((insight, index) => (
                        <motion.div
                            key={insight.id}
                            className={`insight-card ${insight.type}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 + index * 0.05 }}
                        >
                            <div className="insight-label">
                                {insight.type === 'opportunity' && <Zap size={12} style={{ marginRight: '0.25rem' }} />}
                                {insight.type === 'risk' && <AlertTriangle size={12} style={{ marginRight: '0.25rem' }} />}
                                {insight.type === 'trend' && <TrendingUp size={12} style={{ marginRight: '0.25rem' }} />}
                                {insight.type}
                            </div>
                            <p className="insight-text">{insight.text}</p>
                            {insight.impact && (
                                <div className="insight-impact">{insight.impact}</div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Executive Charts */}
            <div className="executive-charts">
                <motion.div
                    className="chart-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                >
                    <h3>
                        <TrendingUp size={18} />
                        Revenue vs Claims Trend
                    </h3>
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
                                    <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'linear-gradient(180deg, rgba(25, 25, 40, 0.98) 0%, rgba(15, 15, 25, 0.98) 100%)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                                    }}
                                    formatter={(value: number) => [`$${value}M`, '']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10b981"
                                    fill="url(#revenueGradient)"
                                    strokeWidth={3}
                                    name="Revenue"
                                    dot={{ fill: '#10b981', strokeWidth: 2, stroke: '#0a0a12', r: 4 }}
                                    activeDot={{ r: 7, fill: '#10b981', stroke: 'rgba(16, 185, 129, 0.3)', strokeWidth: 6 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="claims"
                                    stroke="#f59e0b"
                                    fill="url(#claimsGradient)"
                                    strokeWidth={3}
                                    name="Claims"
                                    dot={{ fill: '#f59e0b', strokeWidth: 2, stroke: '#0a0a12', r: 4 }}
                                    activeDot={{ r: 7, fill: '#f59e0b', stroke: 'rgba(245, 158, 11, 0.3)', strokeWidth: 6 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    className="chart-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3>
                        <Activity size={18} />
                        Cost by Category
                    </h3>
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
                                    <filter id="pieGlow" x="-30%" y="-30%" width="160%" height="160%">
                                        <feGaussianBlur stdDeviation="4" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={95}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="rgba(0,0,0,0.3)"
                                    strokeWidth={2}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`url(#pieGrad${index})`}
                                            style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))' }}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'linear-gradient(180deg, rgba(25, 25, 40, 0.98) 0%, rgba(15, 15, 25, 0.98) 100%)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
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
            <motion.div
                className="benchmark-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
            >
                <h3>
                    <Target size={18} />
                    Industry Benchmark Comparison
                </h3>
                <div className="benchmark-grid">
                    {benchmarks.map((bench, index) => (
                        <div key={index} className="benchmark-card">
                            <div className="benchmark-label">{bench.label}</div>
                            <div className="benchmark-values">
                                <div className="benchmark-you">
                                    <div className="value">{bench.you}</div>
                                    <div className="label">Your Plan</div>
                                </div>
                                <div className="benchmark-industry">
                                    <div className="value">{bench.industry}</div>
                                    <div className="label">Industry</div>
                                </div>
                            </div>
                            <div className={`benchmark-delta ${bench.positive ? 'positive' : 'negative'}`}>
                                {bench.positive ? '✓' : '!'} {bench.delta} vs Industry
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Action Bar */}
            <motion.div
                className="executive-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <button className="action-btn secondary">
                    <FileText size={16} />
                    Generate Board Report
                </button>
                <button className="action-btn primary">
                    <Download size={16} />
                    Export to PowerPoint
                </button>
            </motion.div>
        </div>
    )
}
