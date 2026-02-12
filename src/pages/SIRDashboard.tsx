import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, RadialBarChart, RadialBar, Legend,
    ComposedChart, Scatter
} from 'recharts'
import {
    DollarSign, Users, Shield, TrendingUp, TrendingDown,
    ChevronRight, ChevronDown, BarChart3, Brain, Target,
    RefreshCw, Download, Calendar, AlertCircle, Layers,
    Activity, ArrowUpRight, ArrowDownRight, Sparkles, Zap,
    Eye, Filter, Search, X, ExternalLink, ChevronLeft,
    Play, Pause, Settings, Bell, Maximize2, Grid3X3,
    PieChart as PieChartIcon, LineChart as LineChartIcon,
    LayoutDashboard, Clock, Info, AlertTriangle, CheckCircle,
    TrendingUp as TrendIcon
} from 'lucide-react'
import './SIRDashboard.css'

// ============================================================
// TYPES
// ============================================================

interface DrillDownState {
    isOpen: boolean
    type: 'claims' | 'member' | 'insight' | 'stoploss' | null
    data: any
}

// ============================================================
// DATA - Rich Analytics Data
// ============================================================

const kpiData = [
    { id: '1', label: 'Total Paid Claims', value: '$14.29M', numValue: 14290000, change: 8.3, target: 13800000, trend: 'up' as const, sparkline: [12, 14, 13, 15, 14, 16, 18, 17, 19, 21] },
    { id: '2', label: 'PEPM', value: '$1,285', numValue: 1285, change: -2.1, target: 1312, trend: 'down' as const, sparkline: [15, 14, 13, 14, 12, 13, 12, 11, 12, 11] },
    { id: '3', label: 'High-Cost Claimants', value: '12', numValue: 12, change: 3, target: 10, trend: 'up' as const, sparkline: [8, 9, 10, 9, 11, 10, 12, 11, 13, 12] },
    { id: '4', label: 'Stop-Loss Util', value: '67.4%', numValue: 67.4, change: 12.3, target: 75, trend: 'neutral' as const, sparkline: [45, 48, 52, 55, 58, 61, 63, 65, 66, 67] },
    { id: '5', label: 'Loss Ratio', value: '84.2%', numValue: 84.2, change: -1.8, target: 85, trend: 'down' as const, sparkline: [88, 87, 86, 85, 86, 85, 84, 85, 84, 84] },
]

const claimsTimeSeriesData = [
    { month: 'Jan', claims: 1.1, budget: 1.2, incurred: 1.15, trend: 1.18 },
    { month: 'Feb', claims: 1.18, budget: 1.2, incurred: 1.22, trend: 1.19 },
    { month: 'Mar', claims: 1.32, budget: 1.2, incurred: 1.28, trend: 1.21 },
    { month: 'Apr', claims: 1.08, budget: 1.2, incurred: 1.12, trend: 1.15 },
    { month: 'May', claims: 1.41, budget: 1.2, incurred: 1.38, trend: 1.25 },
    { month: 'Jun', claims: 1.22, budget: 1.2, incurred: 1.25, trend: 1.22 },
    { month: 'Jul', claims: 1.35, budget: 1.2, incurred: 1.32, trend: 1.28 },
    { month: 'Aug', claims: 0.98, budget: 1.2, incurred: 1.05, trend: 1.18 },
    { month: 'Sep', claims: 1.18, budget: 1.2, incurred: 1.22, trend: 1.19 },
    { month: 'Oct', claims: 1.42, budget: 1.2, incurred: 1.45, trend: 1.32 },
    { month: 'Nov', claims: 1.28, budget: 1.2, incurred: 1.32, trend: 1.28 },
    { month: 'Dec', claims: 1.38, budget: 1.2, incurred: 1.42, trend: 1.35 },
]

const claimsCategoryData = [
    { name: 'Inpatient', value: 3300000, percent: 23.1, change: -5.2, color: '#6366f1' },
    { name: 'Outpatient', value: 2900000, percent: 20.3, change: -2.1, color: '#8b5cf6' },
    { name: 'Professional', value: 2900000, percent: 20.3, change: -3.8, color: '#a855f7' },
    { name: 'Pharmacy', value: 1100000, percent: 7.7, change: 12.5, color: '#ec4899' },
    { name: 'Specialty Rx', value: 463000, percent: 3.2, change: -18.2, color: '#f43f5e' },
    { name: 'Other', value: 287000, percent: 2.0, change: -1.2, color: '#64748b' },
]

const riskDistributionData = [
    { name: 'Critical', value: 3, fill: '#ef4444' },
    { name: 'High', value: 5, fill: '#f59e0b' },
    { name: 'Rising', value: 12, fill: '#3b82f6' },
    { name: 'Moderate', value: 45, fill: '#22c55e' },
    { name: 'Low', value: 847, fill: '#6b7280' },
]

const highCostMembers = [
    { id: '1', memberId: 'MBR-78432', riskScore: 945, riskLevel: 'critical' as const, condition: 'ESRD (N18.6) + Type 2 Diabetes', predicted: 185000, actual: 142000, status: 'enrolled', trend: [120, 128, 135, 138, 142], aiPrediction: 'High risk of dialysis initiation within 60 days' },
    { id: '2', memberId: 'MBR-45891', riskScore: 892, riskLevel: 'critical' as const, condition: 'Metastatic Breast Carcinoma', predicted: 156000, actual: 98000, status: 'enrolled', trend: [45, 58, 72, 85, 98], aiPrediction: 'Chemotherapy regimen change recommended' },
    { id: '3', memberId: 'MBR-92341', riskScore: 847, riskLevel: 'high' as const, condition: 'CKD Stage III + CHF', predicted: 134000, actual: 67000, status: 'referred', trend: [35, 42, 48, 56, 67], aiPrediction: 'Care coordination intervention opportunity' },
    { id: '4', memberId: 'MBR-67234', riskScore: 812, riskLevel: 'high' as const, condition: 'Multiple Sclerosis', predicted: 128000, actual: 89000, status: 'active', trend: [65, 72, 78, 82, 89], aiPrediction: 'Specialty pharmacy optimization available' },
]

const aiInsights = [
    { id: '1', type: 'anomaly' as const, severity: 'critical' as const, title: 'Specialty Rx Spend Anomaly', summary: 'GLP-1 agonist utilization +34% MoM. 3 new high-cost scripts detected.', impact: '+$54K projected annual impact', confidence: 94.3, actionable: true, models: ['ClaimsAI', 'RxAnalyzer'] },
    { id: '2', type: 'prediction' as const, severity: 'high' as const, title: 'Emerging High-Cost Risk', summary: 'ML model identifies 2-3 members with 78% probability of HCC escalation.', impact: 'Early intervention: -$52K potential savings', confidence: 87.1, actionable: true, models: ['RiskML', 'HCCPredictor'] },
    { id: '3', type: 'opportunity' as const, severity: 'medium' as const, title: 'Network Steering Opportunity', summary: '12 orthopedic procedures eligible for COE routing. Estimated savings: $142K.', impact: '23% cost reduction available', confidence: 91.2, actionable: true, models: ['NetworkOptimizer'] },
    { id: '4', type: 'trend' as const, severity: 'low' as const, title: 'Positive PMPM Trend', summary: 'PMPM declining for 3 consecutive months. Below benchmark by 2.1%.', impact: 'Favorable trend continuing', confidence: 96.8, actionable: false, models: ['TrendAnalyzer'] },
]

const stopLossPositions = [
    { type: 'ISL', label: 'Individual Stop-Loss', attachment: 150000, exposure: 158000, utilization: 80, projectedRecoveries: 285000, membersAtRisk: 4, status: 'warning' as const, trend: [65, 68, 72, 75, 78, 80] },
    { type: 'ASL', label: 'Aggregate Stop-Loss', attachment: 5200000, exposure: 3500000, utilization: 67.4, projectedRecoveries: 0, membersAtRisk: 0, status: 'healthy' as const, trend: [45, 52, 58, 61, 64, 67] },
]

// ============================================================
// CUSTOM COMPONENTS
// ============================================================

const MiniSparkline = ({ data, color = '#3b82f6', height = 24 }: { data: number[], color?: string, height?: number }) => (
    <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data.map((v, i) => ({ v, i }))}>
            <defs>
                <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} fill={`url(#spark-${color})`} strokeWidth={1.5} />
        </AreaChart>
    </ResponsiveContainer>
)

const AnimatedCounter = ({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) => {
    return <span>{prefix}{value.toLocaleString()}{suffix}</span>
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="sir-tooltip">
            <p className="sir-tooltip__label">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="sir-tooltip__value" style={{ color: p.color }}>
                    {p.name}: ${(p.value).toFixed(2)}M
                </p>
            ))}
        </div>
    )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SIRDashboard() {
    const [activePeriod, setActivePeriod] = useState<'MTD' | 'QTD' | 'YTD'>('YTD')
    const [chartView, setChartView] = useState<'area' | 'bar' | 'composed'>('composed')
    const [drillDown, setDrillDown] = useState<DrillDownState>({ isOpen: false, type: null, data: null })
    const [activeInsight, setActiveInsight] = useState<string | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [showAIPanel, setShowAIPanel] = useState(true)

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true)
        setTimeout(() => setIsRefreshing(false), 2000)
    }, [])

    const openDrillDown = useCallback((type: DrillDownState['type'], data: any) => {
        setDrillDown({ isOpen: true, type, data })
    }, [])

    const closeDrillDown = useCallback(() => {
        setDrillDown({ isOpen: false, type: null, data: null })
    }, [])

    return (
        <div className="sir-analytics">
            {/* Header */}
            <header className="sir-analytics__header">
                <div className="sir-analytics__header-left">
                    <div className="sir-analytics__breadcrumb">
                        <LayoutDashboard size={14} />
                        <span>Analytics</span>
                        <ChevronRight size={12} />
                        <span className="sir-analytics__breadcrumb--active">Performance Intelligence</span>
                    </div>
                    <h1 className="sir-analytics__title">
                        <span className="sir-analytics__title-icon"><Zap /></span>
                        Performance Intelligence Center
                    </h1>
                </div>
                <div className="sir-analytics__header-right">
                    <div className="sir-analytics__period-selector">
                        {(['MTD', 'QTD', 'YTD'] as const).map(period => (
                            <button
                                key={period}
                                className={`sir-analytics__period-btn ${activePeriod === period ? 'active' : ''}`}
                                onClick={() => setActivePeriod(period)}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                    <div className="sir-analytics__actions">
                        <button className="sir-analytics__action-btn" onClick={handleRefresh}>
                            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                        <button className="sir-analytics__action-btn">
                            <Filter size={16} />
                        </button>
                        <button className="sir-analytics__action-btn sir-analytics__action-btn--primary">
                            <Download size={16} />
                            Export
                        </button>
                    </div>
                </div>
            </header>

            {/* AI Insights Banner */}
            <motion.div
                className="sir-analytics__ai-banner"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="sir-analytics__ai-banner-content">
                    <Sparkles className="sir-analytics__ai-icon" />
                    <span className="sir-analytics__ai-text">
                        <strong>AI Analysis:</strong> 4 insights detected • 2 require attention • $196K savings opportunity identified
                    </span>
                </div>
                <button className="sir-analytics__ai-banner-action" onClick={() => setShowAIPanel(!showAIPanel)}>
                    {showAIPanel ? 'Hide Insights' : 'Show Insights'}
                    <ChevronRight size={14} />
                </button>
            </motion.div>

            {/* KPI Cards */}
            <section className="sir-analytics__kpis">
                {kpiData.map((kpi, i) => (
                    <motion.div
                        key={kpi.id}
                        className="sir-kpi-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        onClick={() => openDrillDown('claims', kpi)}
                    >
                        <div className="sir-kpi-card__header">
                            <span className="sir-kpi-card__label">{kpi.label}</span>
                            <span className={`sir-kpi-card__badge sir-kpi-card__badge--${kpi.trend}`}>
                                {kpi.trend === 'up' ? <ArrowUpRight size={12} /> : kpi.trend === 'down' ? <ArrowDownRight size={12} /> : null}
                                {kpi.change > 0 ? '+' : ''}{kpi.change}%
                            </span>
                        </div>
                        <div className="sir-kpi-card__value">{kpi.value}</div>
                        <div className="sir-kpi-card__sparkline">
                            <MiniSparkline
                                data={kpi.sparkline}
                                color={kpi.trend === 'up' ? '#ef4444' : kpi.trend === 'down' ? '#22c55e' : '#3b82f6'}
                            />
                        </div>
                        <div className="sir-kpi-card__footer">
                            <span className="sir-kpi-card__target">Target: {kpi.target.toLocaleString()}</span>
                            <Eye size={12} className="sir-kpi-card__drill" />
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* Main Dashboard Grid */}
            <div className={`sir-analytics__grid ${showAIPanel ? 'sir-analytics__grid--with-panel' : ''}`}>
                {/* Left Column - Charts */}
                <div className="sir-analytics__main">
                    {/* Claims Trend Chart */}
                    <motion.div
                        className="sir-analytics__panel sir-analytics__panel--chart"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="sir-analytics__panel-header">
                            <div className="sir-analytics__panel-title">
                                <Activity size={18} />
                                Claims Trend Analysis
                            </div>
                            <div className="sir-analytics__chart-controls">
                                <button
                                    className={`sir-analytics__chart-btn ${chartView === 'area' ? 'active' : ''}`}
                                    onClick={() => setChartView('area')}
                                >
                                    <LineChartIcon size={14} />
                                </button>
                                <button
                                    className={`sir-analytics__chart-btn ${chartView === 'bar' ? 'active' : ''}`}
                                    onClick={() => setChartView('bar')}
                                >
                                    <BarChart3 size={14} />
                                </button>
                                <button
                                    className={`sir-analytics__chart-btn ${chartView === 'composed' ? 'active' : ''}`}
                                    onClick={() => setChartView('composed')}
                                >
                                    <Grid3X3 size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="sir-analytics__chart-container">
                            <ResponsiveContainer width="100%" height={280}>
                                <ComposedChart data={claimsTimeSeriesData}>
                                    <defs>
                                        <linearGradient id="claimsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="claims" stroke="#6366f1" fill="url(#claimsGradient)" strokeWidth={2} />
                                    <Line type="monotone" dataKey="budget" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                    <Line type="monotone" dataKey="trend" stroke="#22c55e" strokeWidth={1.5} dot={false} />
                                    <Bar dataKey="incurred" fill="rgba(99, 102, 241, 0.3)" radius={[4, 4, 0, 0]} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="sir-analytics__chart-legend">
                            <span><span className="dot" style={{ background: '#6366f1' }} /> Paid Claims</span>
                            <span><span className="dot" style={{ background: '#f59e0b' }} /> Budget</span>
                            <span><span className="dot" style={{ background: '#22c55e' }} /> Trend Line</span>
                        </div>
                    </motion.div>

                    {/* Claims Category Distribution */}
                    <div className="sir-analytics__split-panels">
                        <motion.div
                            className="sir-analytics__panel"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="sir-analytics__panel-header">
                                <div className="sir-analytics__panel-title">
                                    <PieChartIcon size={18} />
                                    Claims by Category
                                </div>
                            </div>
                            <div className="sir-analytics__pie-container">
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={claimsCategoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {claimsCategoryData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} stroke="transparent" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, 'Amount']}
                                            contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#111827' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="sir-analytics__pie-center">
                                    <span className="sir-analytics__pie-total">$14.3M</span>
                                    <span className="sir-analytics__pie-label">Total</span>
                                </div>
                            </div>
                            <div className="sir-analytics__category-list">
                                {claimsCategoryData.slice(0, 4).map(cat => (
                                    <div key={cat.name} className="sir-analytics__category-item">
                                        <span className="sir-analytics__category-dot" style={{ background: cat.color }} />
                                        <span className="sir-analytics__category-name">{cat.name}</span>
                                        <span className="sir-analytics__category-percent">{cat.percent}%</span>
                                        <span className={`sir-analytics__category-change ${cat.change < 0 ? 'positive' : 'negative'}`}>
                                            {cat.change > 0 ? '+' : ''}{cat.change}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            className="sir-analytics__panel"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35 }}
                        >
                            <div className="sir-analytics__panel-header">
                                <div className="sir-analytics__panel-title">
                                    <Users size={18} />
                                    Risk Distribution
                                </div>
                            </div>
                            <div className="sir-analytics__radial-container">
                                <ResponsiveContainer width="100%" height={220}>
                                    <RadialBarChart
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="30%"
                                        outerRadius="90%"
                                        data={riskDistributionData}
                                        startAngle={180}
                                        endAngle={0}
                                    >
                                        <RadialBar
                                            background={{ fill: 'rgba(0,0,0,0.04)' }}
                                            dataKey="value"
                                            cornerRadius={4}
                                        />
                                        <Tooltip
                                            contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#111827' }}
                                        />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="sir-analytics__risk-legend">
                                {riskDistributionData.map(r => (
                                    <div key={r.name} className="sir-analytics__risk-item">
                                        <span className="sir-analytics__risk-dot" style={{ background: r.fill }} />
                                        <span>{r.name}</span>
                                        <span className="sir-analytics__risk-count">{r.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* High-Cost Claimants */}
                    <motion.div
                        className="sir-analytics__panel"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="sir-analytics__panel-header">
                            <div className="sir-analytics__panel-title">
                                <AlertTriangle size={18} />
                                High-Cost Claimants
                                <span className="sir-analytics__panel-badge">AI-Powered</span>
                            </div>
                            <button className="sir-analytics__view-all">
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="sir-analytics__members-grid">
                            {highCostMembers.map((member, i) => (
                                <motion.div
                                    key={member.id}
                                    className={`sir-analytics__member-card sir-analytics__member-card--${member.riskLevel}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.05 }}
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => openDrillDown('member', member)}
                                >
                                    <div className="sir-analytics__member-risk">
                                        <span className="sir-analytics__member-score">{member.riskScore}</span>
                                        <span className="sir-analytics__member-level">{member.riskLevel}</span>
                                    </div>
                                    <div className="sir-analytics__member-info">
                                        <div className="sir-analytics__member-id">{member.memberId}</div>
                                        <div className="sir-analytics__member-condition">{member.condition}</div>
                                        <div className="sir-analytics__member-ai">
                                            <Brain size={10} /> {member.aiPrediction}
                                        </div>
                                    </div>
                                    <div className="sir-analytics__member-metrics">
                                        <div className="sir-analytics__member-metric">
                                            <span className="value">${(member.predicted / 1000).toFixed(0)}K</span>
                                            <span className="label">Predicted</span>
                                        </div>
                                        <div className="sir-analytics__member-metric">
                                            <span className="value">${(member.actual / 1000).toFixed(0)}K</span>
                                            <span className="label">YTD</span>
                                        </div>
                                    </div>
                                    <div className="sir-analytics__member-trend">
                                        <MiniSparkline data={member.trend} color={member.riskLevel === 'critical' ? '#ef4444' : '#f59e0b'} height={30} />
                                    </div>
                                    <span className={`sir-analytics__member-status sir-analytics__member-status--${member.status}`}>
                                        {member.status}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Stop-Loss Position */}
                    <motion.div
                        className="sir-analytics__panel"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="sir-analytics__panel-header">
                            <div className="sir-analytics__panel-title">
                                <Shield size={18} />
                                Stop-Loss Position
                            </div>
                        </div>
                        <div className="sir-analytics__stoploss-grid">
                            {stopLossPositions.map(sl => (
                                <div key={sl.type} className={`sir-analytics__stoploss-card sir-analytics__stoploss-card--${sl.status}`}>
                                    <div className="sir-analytics__stoploss-header">
                                        <span className="sir-analytics__stoploss-type">{sl.label}</span>
                                        <span className={`sir-analytics__stoploss-util sir-analytics__stoploss-util--${sl.status}`}>
                                            {sl.utilization.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="sir-analytics__stoploss-bar">
                                        <motion.div
                                            className="sir-analytics__stoploss-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${sl.utilization}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                        />
                                    </div>
                                    <div className="sir-analytics__stoploss-trend">
                                        <MiniSparkline data={sl.trend} color={sl.status === 'healthy' ? '#22c55e' : '#f59e0b'} height={32} />
                                    </div>
                                    <div className="sir-analytics__stoploss-metrics">
                                        <div>
                                            <span className="value">${(sl.attachment / 1000).toFixed(0)}K</span>
                                            <span className="label">Attachment</span>
                                        </div>
                                        <div>
                                            <span className="value">${(sl.exposure / 1000).toFixed(0)}K</span>
                                            <span className="label">Exposure</span>
                                        </div>
                                        <div>
                                            <span className="value">{sl.membersAtRisk}</span>
                                            <span className="label">At Risk</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Panel - AI Insights */}
                <AnimatePresence>
                    {showAIPanel && (
                        <motion.aside
                            className="sir-analytics__ai-panel"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                        >
                            <div className="sir-analytics__ai-header">
                                <div className="sir-analytics__ai-title">
                                    <Brain size={18} />
                                    AI Insights
                                </div>
                                <span className="sir-analytics__ai-count">{aiInsights.length}</span>
                            </div>
                            <div className="sir-analytics__ai-list">
                                {aiInsights.map((insight, i) => (
                                    <motion.div
                                        key={insight.id}
                                        className={`sir-analytics__insight sir-analytics__insight--${insight.severity}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.08 }}
                                        whileHover={{ scale: 1.01 }}
                                        onClick={() => setActiveInsight(activeInsight === insight.id ? null : insight.id)}
                                    >
                                        <div className="sir-analytics__insight-header">
                                            <span className={`sir-analytics__insight-type sir-analytics__insight-type--${insight.type}`}>
                                                {insight.type === 'anomaly' && <AlertCircle size={12} />}
                                                {insight.type === 'prediction' && <TrendIcon size={12} />}
                                                {insight.type === 'opportunity' && <Target size={12} />}
                                                {insight.type === 'trend' && <Activity size={12} />}
                                                {insight.type}
                                            </span>
                                            <span className="sir-analytics__insight-confidence">{insight.confidence}%</span>
                                        </div>
                                        <h4 className="sir-analytics__insight-title">{insight.title}</h4>
                                        <p className="sir-analytics__insight-summary">{insight.summary}</p>
                                        <div className="sir-analytics__insight-impact">{insight.impact}</div>
                                        <AnimatePresence>
                                            {activeInsight === insight.id && (
                                                <motion.div
                                                    className="sir-analytics__insight-expanded"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                >
                                                    <div className="sir-analytics__insight-models">
                                                        Models: {insight.models.join(', ')}
                                                    </div>
                                                    {insight.actionable && (
                                                        <button className="sir-analytics__insight-action">
                                                            Take Action <ArrowUpRight size={12} />
                                                        </button>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* Drill-Down Modal */}
            <AnimatePresence>
                {drillDown.isOpen && (
                    <motion.div
                        className="sir-analytics__modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDrillDown}
                    >
                        <motion.div
                            className="sir-analytics__modal"
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="sir-analytics__modal-header">
                                <h2>
                                    {drillDown.type === 'member' && `Member Details: ${drillDown.data?.memberId}`}
                                    {drillDown.type === 'claims' && `Metric Details: ${drillDown.data?.label}`}
                                </h2>
                                <button onClick={closeDrillDown}><X size={20} /></button>
                            </div>
                            <div className="sir-analytics__modal-body">
                                {drillDown.type === 'member' && drillDown.data && (
                                    <div className="sir-analytics__member-detail">
                                        <div className="sir-analytics__detail-grid">
                                            <div className="sir-analytics__detail-card">
                                                <h4>Risk Assessment</h4>
                                                <div className="sir-analytics__detail-score">{drillDown.data.riskScore}</div>
                                                <p>Risk Level: <strong>{drillDown.data.riskLevel}</strong></p>
                                            </div>
                                            <div className="sir-analytics__detail-card">
                                                <h4>Cost Projection</h4>
                                                <ResponsiveContainer width="100%" height={100}>
                                                    <AreaChart data={drillDown.data.trend.map((v: number, i: number) => ({ v, i }))}>
                                                        <Area type="monotone" dataKey="v" stroke="#ef4444" fill="rgba(239,68,68,0.2)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        <div className="sir-analytics__detail-ai">
                                            <Brain size={16} />
                                            <p><strong>AI Prediction:</strong> {drillDown.data.aiPrediction}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default SIRDashboard
