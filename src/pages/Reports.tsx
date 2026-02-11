import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    RadialBarChart,
    RadialBar,
    ComposedChart,
} from 'recharts'
import {
    TrendingUp,
    TrendingDown,
    Download,
    Calendar,
    RefreshCw,
    DollarSign,
    FileText,
    Users,
    Activity,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    LayoutDashboard,
    Zap,
    Target,
    Shield,
    Heart,
    Clock,
    Filter,
    Plus,
    MoreHorizontal,
    ChevronRight,
    Maximize2,
    Eye,
    Share2,
    Settings,
    Brain
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import { exportToCSV, printReport } from '../utils/exportData'
import './Reports.css'

// Premium color palette
const COLORS = {
    primary: '#06B6D4',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    gradient: ['#06B6D4', '#8B5CF6'],
}

const CHART_COLORS = ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6']

// Executive KPIs
const executiveKPIs = [
    {
        id: 'medical-spend',
        label: 'Medical Spend',
        value: '$2.4M',
        change: -8.2,
        target: '$2.6M',
        progress: 92,
        icon: DollarSign,
        color: '#06B6D4',
        sparkline: [45, 52, 48, 55, 60, 58, 52, 48, 45, 42, 38, 35]
    },
    {
        id: 'claims-processed',
        label: 'Claims Processed',
        value: '12,847',
        change: 15.4,
        target: '12,000',
        progress: 107,
        icon: FileText,
        color: '#10B981',
        sparkline: [20, 25, 30, 35, 45, 55, 60, 70, 80, 95, 110, 128]
    },
    {
        id: 'member-satisfaction',
        label: 'Member NPS',
        value: '78',
        change: 12,
        target: '75',
        progress: 104,
        icon: Heart,
        color: '#8B5CF6',
        sparkline: [65, 68, 70, 72, 74, 73, 75, 76, 77, 78, 78, 78]
    },
    {
        id: 'cost-per-member',
        label: 'Cost Per Member',
        value: '$847',
        change: -5.3,
        target: '$900',
        progress: 94,
        icon: Target,
        color: '#F59E0B',
        sparkline: [920, 910, 895, 880, 870, 865, 858, 855, 850, 848, 847, 847]
    }
]

// Spending trend data
const spendingTrend = [
    { month: 'Jan', medical: 245000, pharmacy: 85000, admin: 32000, benchmark: 350000 },
    { month: 'Feb', medical: 230000, pharmacy: 78000, admin: 30000, benchmark: 350000 },
    { month: 'Mar', medical: 285000, pharmacy: 92000, admin: 35000, benchmark: 350000 },
    { month: 'Apr', medical: 220000, pharmacy: 75000, admin: 28000, benchmark: 350000 },
    { month: 'May', medical: 265000, pharmacy: 88000, admin: 33000, benchmark: 350000 },
    { month: 'Jun', medical: 242000, pharmacy: 82000, admin: 31000, benchmark: 350000 },
    { month: 'Jul', medical: 198000, pharmacy: 72000, admin: 27000, benchmark: 350000 },
    { month: 'Aug', medical: 215000, pharmacy: 79000, admin: 29000, benchmark: 350000 },
    { month: 'Sep', medical: 235000, pharmacy: 84000, admin: 32000, benchmark: 350000 },
    { month: 'Oct', medical: 248000, pharmacy: 86000, admin: 33000, benchmark: 350000 },
    { month: 'Nov', medical: 225000, pharmacy: 80000, admin: 30000, benchmark: 350000 },
    { month: 'Dec', medical: 210000, pharmacy: 76000, admin: 28000, benchmark: 350000 },
]

// Claims by category
const claimsDistribution = [
    { name: 'Inpatient', value: 35, amount: '$840K', color: '#06B6D4' },
    { name: 'Outpatient', value: 28, amount: '$672K', color: '#8B5CF6' },
    { name: 'Pharmacy', value: 20, amount: '$480K', color: '#10B981' },
    { name: 'Professional', value: 12, amount: '$288K', color: '#F59E0B' },
    { name: 'Other', value: 5, amount: '$120K', color: '#64748B' },
]

// Provider performance
const providerPerformance = [
    { name: 'Premier Health', quality: 94, cost: 82, volume: 450, efficiency: 92 },
    { name: 'Metro Medical', quality: 88, cost: 78, volume: 380, efficiency: 85 },
    { name: 'City Hospital', quality: 91, cost: 85, volume: 520, efficiency: 88 },
    { name: 'Valley Care', quality: 86, cost: 75, volume: 290, efficiency: 82 },
    { name: 'Sunset Clinic', quality: 92, cost: 90, volume: 340, efficiency: 90 },
]

// Risk stratification
const riskDistribution = [
    { name: 'Low Risk', members: 4500, fill: '#10B981' },
    { name: 'Moderate', members: 2800, fill: '#F59E0B' },
    { name: 'High Risk', members: 1200, fill: '#EF4444' },
    { name: 'Very High', members: 350, fill: '#DC2626' },
]

// Real-time activity feed
const activityFeed = [
    { id: 1, type: 'claim', message: 'Large claim flagged for review', amount: '$45,200', time: '2 min ago', status: 'pending' },
    { id: 2, type: 'report', message: 'Monthly utilization report generated', time: '15 min ago', status: 'complete' },
    { id: 3, type: 'alert', message: 'Stop-loss threshold approaching', amount: '$125K remaining', time: '1 hr ago', status: 'warning' },
    { id: 4, type: 'insight', message: 'AI detected 23% pharmacy savings opportunity', time: '2 hrs ago', status: 'insight' },
]

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="reports__chart-tooltip">
                <p className="reports__chart-tooltip-label">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }}>
                        {entry.name}: ${(entry.value / 1000).toFixed(0)}K
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export function Reports() {
    const [dateRange, setDateRange] = useState('ytd')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedView, setSelectedView] = useState<'overview' | 'claims' | 'members' | 'providers'>('overview')

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsRefreshing(false)
    }

    const totalSpend = useMemo(() => {
        return spendingTrend.reduce((acc, month) => acc + month.medical + month.pharmacy + month.admin, 0)
    }, [])

    return (
        <div className="reports-page reports-page--modern">
            {/* Executive Header */}
            <motion.header
                className="reports__executive-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="reports__header-content">
                    <div className="reports__header-left">
                        <div className="reports__header-icon">
                            <LayoutDashboard size={24} />
                        </div>
                        <div>
                            <h1 className="reports__title">Analytics Command Center</h1>
                            <p className="reports__subtitle">
                                Real-time healthcare intelligence • Last synced 2 min ago
                            </p>
                        </div>
                    </div>
                    <div className="reports__header-actions">
                        <div className="reports__view-toggle">
                            {(['overview', 'claims', 'members', 'providers'] as const).map((view) => (
                                <button
                                    key={view}
                                    className={`reports__view-btn ${selectedView === view ? 'active' : ''}`}
                                    onClick={() => setSelectedView(view)}
                                >
                                    {view.charAt(0).toUpperCase() + view.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="reports__date-selector">
                            <Calendar size={16} />
                            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                                <option value="ytd">Year to Date</option>
                                <option value="12m">Last 12 Months</option>
                                <option value="6m">Last 6 Months</option>
                                <option value="q4">Q4 2025</option>
                            </select>
                            <ChevronDown size={16} />
                        </div>
                        <Button
                            variant="secondary"
                            icon={isRefreshing ? <RefreshCw size={16} className="spinning" /> : <RefreshCw size={16} />}
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            Sync
                        </Button>
                        <Button variant="primary" icon={<Download size={16} />} onClick={() => exportToCSV(spendingTrend.map(row => ({
                            'Month': row.month,
                            'Medical': row.medical,
                            'Pharmacy': row.pharmacy,
                            'Admin': row.admin,
                            'Benchmark': row.benchmark,
                        })), 'analytics_report')}>
                            Export
                        </Button>
                        <Button variant="secondary" icon={<FileText size={16} />} onClick={() => printReport('Analytics Command Center')}>
                            Print
                        </Button>
                    </div>
                </div>
            </motion.header>

            {/* Executive KPI Strip */}
            <motion.section
                className="reports__kpi-strip"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {executiveKPIs.map((kpi, index) => {
                    const Icon = kpi.icon
                    return (
                        <motion.div
                            key={kpi.id}
                            className="reports__kpi-card"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -2, transition: { duration: 0.2 } }}
                        >
                            <div className="reports__kpi-header">
                                <div className="reports__kpi-icon" style={{ background: `${kpi.color}20`, color: kpi.color }}>
                                    <Icon size={18} />
                                </div>
                                <div className={`reports__kpi-change ${kpi.change >= 0 ? 'positive' : 'negative'}`}>
                                    {kpi.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {Math.abs(kpi.change)}%
                                </div>
                            </div>
                            <div className="reports__kpi-value">{kpi.value}</div>
                            <div className="reports__kpi-label">{kpi.label}</div>
                            <div className="reports__kpi-sparkline">
                                <ResponsiveContainer width="100%" height={32}>
                                    <AreaChart data={kpi.sparkline.map((v, i) => ({ value: v }))}>
                                        <defs>
                                            <linearGradient id={`spark-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={kpi.color} stopOpacity={0.3} />
                                                <stop offset="100%" stopColor={kpi.color} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={kpi.color}
                                            strokeWidth={1.5}
                                            fill={`url(#spark-${kpi.id})`}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="reports__kpi-target">
                                <span>Target: {kpi.target}</span>
                                <span className={kpi.progress >= 100 ? 'achieved' : ''}>
                                    {kpi.progress >= 100 ? '✓ Achieved' : `${kpi.progress}%`}
                                </span>
                            </div>
                        </motion.div>
                    )
                })}
            </motion.section>

            {/* Main Analytics Grid */}
            <div className="reports__analytics-grid">
                {/* Spending Trend - Large Chart */}
                <motion.div
                    className="reports__chart-card reports__chart-card--large"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="reports__chart-header">
                        <div>
                            <h3>Spending Trend Analysis</h3>
                            <p>Medical, pharmacy, and administrative costs vs. benchmark</p>
                        </div>
                        <div className="reports__chart-actions">
                            <Badge variant="teal">
                                <TrendingDown size={12} /> 8% below budget
                            </Badge>
                            <button className="reports__chart-action-btn">
                                <Maximize2 size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="reports__chart-container">
                        <ResponsiveContainer width="100%" height={320}>
                            <ComposedChart data={spendingTrend}>
                                <defs>
                                    <linearGradient id="medicalGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="pharmacyGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                                <YAxis
                                    stroke="rgba(255,255,255,0.4)"
                                    fontSize={12}
                                    tickFormatter={(value) => `$${value / 1000}K`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="circle"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="medical"
                                    name="Medical"
                                    stroke="#06B6D4"
                                    strokeWidth={2}
                                    fill="url(#medicalGradient)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="pharmacy"
                                    name="Pharmacy"
                                    stroke="#8B5CF6"
                                    strokeWidth={2}
                                    fill="url(#pharmacyGradient)"
                                />
                                <Bar dataKey="admin" name="Admin" fill="#64748B" opacity={0.6} radius={[4, 4, 0, 0]} />
                                <Line
                                    type="monotone"
                                    dataKey="benchmark"
                                    name="Budget"
                                    stroke="#F59E0B"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Claims Distribution */}
                <motion.div
                    className="reports__chart-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="reports__chart-header">
                        <div>
                            <h3>Claims Distribution</h3>
                            <p>By service category</p>
                        </div>
                    </div>
                    <div className="reports__donut-container">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={claimsDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {claimsDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number, name: string) => [`${value}%`, name]}
                                    contentStyle={{
                                        background: 'rgba(10, 10, 14, 0.95)',
                                        border: '1px solid rgba(6, 182, 212, 0.3)',
                                        borderRadius: '8px',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="reports__donut-center">
                            <span className="reports__donut-total">${(totalSpend / 1000000).toFixed(1)}M</span>
                            <span className="reports__donut-label">Total Spend</span>
                        </div>
                    </div>
                    <div className="reports__legend">
                        {claimsDistribution.map((item) => (
                            <div key={item.name} className="reports__legend-item">
                                <span className="reports__legend-dot" style={{ background: item.color }} />
                                <span className="reports__legend-name">{item.name}</span>
                                <span className="reports__legend-value">{item.amount}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Risk Stratification */}
                <motion.div
                    className="reports__chart-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="reports__chart-header">
                        <div>
                            <h3>Population Risk</h3>
                            <p>Member stratification by risk level</p>
                        </div>
                        <Badge variant="warning">
                            <Shield size={12} /> 350 high-risk
                        </Badge>
                    </div>
                    <div className="reports__risk-bars">
                        {riskDistribution.map((risk, index) => (
                            <motion.div
                                key={risk.name}
                                className="reports__risk-bar"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                            >
                                <div className="reports__risk-info">
                                    <span className="reports__risk-dot" style={{ background: risk.fill }} />
                                    <span>{risk.name}</span>
                                </div>
                                <div className="reports__risk-track">
                                    <motion.div
                                        className="reports__risk-fill"
                                        style={{ background: risk.fill }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(risk.members / 4500) * 100}%` }}
                                        transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                                    />
                                </div>
                                <span className="reports__risk-count">{risk.members.toLocaleString()}</span>
                            </motion.div>
                        ))}
                    </div>
                    <div className="reports__risk-summary">
                        <div className="reports__risk-stat">
                            <span className="reports__risk-stat-value">8,850</span>
                            <span className="reports__risk-stat-label">Total Members</span>
                        </div>
                        <div className="reports__risk-stat">
                            <span className="reports__risk-stat-value">91%</span>
                            <span className="reports__risk-stat-label">Care Compliance</span>
                        </div>
                    </div>
                </motion.div>

                {/* Provider Performance */}
                <motion.div
                    className="reports__chart-card reports__chart-card--wide"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="reports__chart-header">
                        <div>
                            <h3>Provider Performance Matrix</h3>
                            <p>Quality score vs. cost efficiency</p>
                        </div>
                        <div className="reports__chart-actions">
                            <Button variant="ghost" size="sm" icon={<Filter size={14} />}>
                                Filter
                            </Button>
                            <Button variant="ghost" size="sm" icon={<Download size={14} />}>
                                Export
                            </Button>
                        </div>
                    </div>
                    <div className="reports__chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={providerPerformance} layout="vertical" barSize={16}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                                <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={12} domain={[0, 100]} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="rgba(255,255,255,0.4)"
                                    fontSize={12}
                                    width={120}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(10, 10, 14, 0.95)',
                                        border: '1px solid rgba(6, 182, 212, 0.3)',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="quality" name="Quality" fill="#10B981" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="cost" name="Cost Eff." fill="#06B6D4" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="efficiency" name="Efficiency" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* AI Insights Panel */}
                <motion.div
                    className="reports__insights-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="reports__insights-header">
                        <div className="reports__insights-icon">
                            <Brain size={20} />
                        </div>
                        <div>
                            <h3>AI-Generated Insights</h3>
                            <p>Powered by Gemini Analytics</p>
                        </div>
                        <Badge variant="teal">Live</Badge>
                    </div>
                    <div className="reports__insights-list">
                        <motion.div
                            className="reports__insight"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <div className="reports__insight-icon reports__insight-icon--savings">
                                <DollarSign size={16} />
                            </div>
                            <div className="reports__insight-content">
                                <h4>Pharmacy Savings Opportunity</h4>
                                <p>Biosimilar conversion could save <strong>$125K annually</strong> based on current specialty drug utilization.</p>
                            </div>
                            <ChevronRight size={16} />
                        </motion.div>
                        <motion.div
                            className="reports__insight"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <div className="reports__insight-icon reports__insight-icon--risk">
                                <Shield size={16} />
                            </div>
                            <div className="reports__insight-content">
                                <h4>High-Risk Member Alert</h4>
                                <p><strong>23 members</strong> predicted to become high-cost in next 90 days. Early intervention recommended.</p>
                            </div>
                            <ChevronRight size={16} />
                        </motion.div>
                        <motion.div
                            className="reports__insight"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 }}
                        >
                            <div className="reports__insight-icon reports__insight-icon--trend">
                                <TrendingUp size={16} />
                            </div>
                            <div className="reports__insight-content">
                                <h4>Utilization Trend</h4>
                                <p>ED visits down <strong>18%</strong> since virtual care program launch. Continue investment.</p>
                            </div>
                            <ChevronRight size={16} />
                        </motion.div>
                    </div>
                    <Button variant="ghost" className="reports__insights-more">
                        <Sparkles size={16} />
                        Generate Detailed Analysis
                    </Button>
                </motion.div>

                {/* Activity Feed */}
                <motion.div
                    className="reports__activity-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <div className="reports__activity-header">
                        <h3>Recent Activity</h3>
                        <Badge variant="info">
                            <Activity size={12} /> Live Feed
                        </Badge>
                    </div>
                    <div className="reports__activity-list">
                        {activityFeed.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className={`reports__activity-item reports__activity-item--${item.status}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + index * 0.1 }}
                            >
                                <div className="reports__activity-indicator" />
                                <div className="reports__activity-content">
                                    <p>{item.message}</p>
                                    {item.amount && <span className="reports__activity-amount">{item.amount}</span>}
                                </div>
                                <span className="reports__activity-time">{item.time}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions Bar */}
            <motion.div
                className="reports__quick-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <div className="reports__quick-actions-inner">
                    <span className="reports__quick-actions-label">Quick Actions</span>
                    <div className="reports__quick-actions-buttons">
                        <Button variant="ghost" size="sm" icon={<Plus size={14} />}>New Report</Button>
                        <Button variant="ghost" size="sm" icon={<Share2 size={14} />}>Share Dashboard</Button>
                        <Button variant="ghost" size="sm" icon={<Clock size={14} />}>Schedule Export</Button>
                        <Button variant="ghost" size="sm" icon={<Settings size={14} />}>Configure Alerts</Button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default Reports
