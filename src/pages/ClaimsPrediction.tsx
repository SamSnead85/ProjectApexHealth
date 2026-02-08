import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    ComposedChart,
    AreaChart,
    RadialBarChart,
    RadialBar
} from 'recharts'
import {
    Brain,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Users,
    DollarSign,
    Activity,
    Target,
    Zap,
    Shield,
    Eye,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight,
    Clock
} from 'lucide-react'
import './ClaimsPrediction.css'

interface RiskMember {
    id: string
    name: string
    initials: string
    riskScore: number
    predictedClaims: number
    primaryCondition: string
    intervention: string
}

interface MonthlyData {
    month: string
    actual: number | null
    predicted: number
    highRisk: number
    confidence: number
}

const mockMonthlyData: MonthlyData[] = [
    { month: 'Aug', actual: 2450000, predicted: 2380000, highRisk: 450000, confidence: 92 },
    { month: 'Sep', actual: 2680000, predicted: 2620000, highRisk: 520000, confidence: 94 },
    { month: 'Oct', actual: 2890000, predicted: 2950000, highRisk: 610000, confidence: 91 },
    { month: 'Nov', actual: 3120000, predicted: 3080000, highRisk: 680000, confidence: 95 },
    { month: 'Dec', actual: 3340000, predicted: 3280000, highRisk: 720000, confidence: 93 },
    { month: 'Jan', actual: 3180000, predicted: 3150000, highRisk: 690000, confidence: 96 },
    { month: 'Feb', actual: null, predicted: 3420000, highRisk: 780000, confidence: 88 },
    { month: 'Mar', actual: null, predicted: 3680000, highRisk: 850000, confidence: 85 },
    { month: 'Apr', actual: null, predicted: 3520000, highRisk: 810000, confidence: 82 },
]

const mockHighRiskMembers: RiskMember[] = [
    { id: '1', name: 'James Mitchell', initials: 'JM', riskScore: 94, predictedClaims: 285000, primaryCondition: 'End Stage Renal Disease', intervention: 'Care Management' },
    { id: '2', name: 'Patricia Garcia', initials: 'PG', riskScore: 89, predictedClaims: 215000, primaryCondition: 'Congestive Heart Failure', intervention: 'Disease Program' },
    { id: '3', name: 'Robert Chen', initials: 'RC', riskScore: 86, predictedClaims: 178000, primaryCondition: 'Diabetes w/ Complications', intervention: 'Medication Review' },
    { id: '4', name: 'Linda Thompson', initials: 'LT', riskScore: 82, predictedClaims: 156000, primaryCondition: 'Multiple Sclerosis', intervention: 'Specialty Rx Review' },
    { id: '5', name: 'Michael Davis', initials: 'MD', riskScore: 78, predictedClaims: 134000, primaryCondition: 'COPD Severe', intervention: 'Pulmonary Rehab' },
]

const riskDistribution = [
    { label: 'Low', percentage: 62, count: 2480, color: '#10b981' },
    { label: 'Medium', percentage: 24, count: 960, color: '#f59e0b' },
    { label: 'High', percentage: 11, count: 440, color: '#ef4444' },
    { label: 'Critical', percentage: 3, count: 120, color: '#dc2626' },
]

const radialData = [
    { name: 'Model Accuracy', value: 94.2, fill: '#06b6d4' },
    { name: 'Confidence', value: 87.8, fill: '#8b5cf6' },
    { name: 'Coverage', value: 98.5, fill: '#10b981' },
]

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
}

// Premium Custom Tooltip
const PremiumTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="premium-tooltip">
            <div className="premium-tooltip__header">
                <span className="premium-tooltip__month">{label}</span>
                <Sparkles size={12} className="premium-tooltip__sparkle" />
            </div>
            <div className="premium-tooltip__content">
                {payload.map((p: any, i: number) => (
                    <div key={i} className="premium-tooltip__row">
                        <span className="premium-tooltip__dot" style={{ background: p.color || p.stroke }} />
                        <span className="premium-tooltip__label">{p.name}</span>
                        <span className="premium-tooltip__value">{formatCurrency(p.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Animated Progress Ring
const ProgressRing = ({ value, label, color, size = 120 }: { value: number; label: string; color: string; size?: number }) => {
    const radius = (size - 16) / 2
    const circumference = 2 * Math.PI * radius
    const progress = (value / 100) * circumference

    return (
        <div className="progress-ring" style={{ width: size, height: size }}>
            <svg viewBox={`0 0 ${size} ${size}`}>
                <defs>
                    <linearGradient id={`ring-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={color} />
                    </linearGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="8"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={`url(#ring-${label})`}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - progress }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    filter="url(#glow)"
                />
            </svg>
            <div className="progress-ring__content">
                <span className="progress-ring__value">{value}%</span>
                <span className="progress-ring__label">{label}</span>
            </div>
        </div>
    )
}

// Glowing Stat Card
const GlowingStatCard = ({
    title,
    value,
    change,
    isPositive,
    icon: Icon,
    color = '#06b6d4',
    delay = 0
}: {
    title: string
    value: string
    change: string
    isPositive: boolean
    icon: any
    color?: string
    delay?: number
}) => (
    <motion.div
        className="glowing-stat-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5, ease: "easeOut" }}
        style={{ '--glow-color': color } as any}
    >
        <div className="glowing-stat-card__glow" />
        <div className="glowing-stat-card__icon" style={{ background: `${color}15`, color }}>
            <Icon size={22} />
        </div>
        <div className="glowing-stat-card__content">
            <span className="glowing-stat-card__title">{title}</span>
            <div className="glowing-stat-card__value-row">
                <span className="glowing-stat-card__value">{value}</span>
                <span className={`glowing-stat-card__change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {change}
                </span>
            </div>
        </div>
    </motion.div>
)

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function ClaimsPrediction() {
    const [activeMetric, setActiveMetric] = useState<'actual' | 'predicted' | 'both'>('both')
    const [apiPredictions, setApiPredictions] = useState<any>(null)

    // Fetch predictions from AI services with mock fallback
    useEffect(() => {
        if (!API_BASE) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/v1/analytics/claims-predictions`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.data) setApiPredictions(data.data);
                }
            } catch { /* use mock data */ }
        })();
    }, []);

    return (
        <div className="claims-prediction-v2">
            {/* Premium Header */}
            <motion.header
                className="predictions-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="predictions-header__content">
                    <div className="predictions-header__title-row">
                        <div className="predictions-header__icon">
                            <Brain size={28} />
                            <div className="predictions-header__pulse" />
                        </div>
                        <div>
                            <h1>Claims Prediction Engine</h1>
                            <p>ML-powered forecasting with real-time risk intelligence</p>
                        </div>
                    </div>
                    <div className="predictions-header__badges">
                        <div className="predictions-header__badge predictions-header__badge--live">
                            <span className="predictions-header__badge-dot" />
                            Live Predictions
                        </div>
                        <div className="predictions-header__badge">
                            <Zap size={14} />
                            94.2% Accuracy
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Premium Stats Grid */}
            <div className="predictions-stats">
                <GlowingStatCard
                    title="Next Quarter Forecast"
                    value="$10.6M"
                    change="+8.2%"
                    isPositive={false}
                    icon={TrendingUp}
                    color="#f59e0b"
                    delay={0.1}
                />
                <GlowingStatCard
                    title="High-Risk Members"
                    value="560"
                    change="+12"
                    isPositive={false}
                    icon={AlertTriangle}
                    color="#ef4444"
                    delay={0.15}
                />
                <GlowingStatCard
                    title="Preventable Claims"
                    value="$1.8M"
                    change="-15%"
                    isPositive={true}
                    icon={Shield}
                    color="#10b981"
                    delay={0.2}
                />
                <GlowingStatCard
                    title="Model Confidence"
                    value="94.2%"
                    change="+1.3%"
                    isPositive={true}
                    icon={Brain}
                    color="#8b5cf6"
                    delay={0.25}
                />
            </div>

            {/* Main Chart - Premium Design */}
            <motion.div
                className="predictions-main-chart"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="predictions-main-chart__header">
                    <div className="predictions-main-chart__title">
                        <Activity size={20} />
                        <h2>Claims Forecast</h2>
                        <span className="predictions-main-chart__ai-tag">
                            <Sparkles size={12} />
                            AI Generated
                        </span>
                    </div>
                    <div className="predictions-main-chart__controls">
                        {(['actual', 'predicted', 'both'] as const).map(metric => (
                            <button
                                key={metric}
                                className={`predictions-main-chart__control ${activeMetric === metric ? 'active' : ''}`}
                                onClick={() => setActiveMetric(metric)}
                            >
                                {metric.charAt(0).toUpperCase() + metric.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="predictions-main-chart__container">
                    <ResponsiveContainer width="100%" height={360}>
                        <ComposedChart data={mockMonthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                {/* Premium Gradients */}
                                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.6} />
                                    <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="highRiskGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                                {/* Glow Filters */}
                                <filter id="actualGlow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                                    <feColorMatrix in="blur" values="0 0 0 0 0.024 0 0 0 0 0.714 0 0 0 0 0.831 0 0 0 0.8 0" />
                                </filter>
                                <filter id="predictedGlow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                                    <feColorMatrix in="blur" values="0 0 0 0 0.545 0 0 0 0 0.361 0 0 0 0 0.965 0 0 0 0.8 0" />
                                </filter>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.04)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11 }}
                                tickFormatter={formatCurrency}
                                dx={-10}
                            />
                            <Tooltip content={<PremiumTooltip />} />

                            {/* High Risk Area - always visible as background */}
                            <Area
                                type="monotone"
                                dataKey="highRisk"
                                name="High Risk"
                                fill="url(#highRiskGradient)"
                                stroke="transparent"
                            />

                            {/* Actual Claims */}
                            {(activeMetric === 'actual' || activeMetric === 'both') && (
                                <>
                                    <Area
                                        type="monotone"
                                        dataKey="actual"
                                        name="Actual"
                                        fill="url(#actualGradient)"
                                        stroke="#06b6d4"
                                        strokeWidth={3}
                                        connectNulls={false}
                                        dot={{
                                            fill: '#06b6d4',
                                            strokeWidth: 3,
                                            stroke: '#0a0a12',
                                            r: 5
                                        }}
                                        activeDot={{
                                            r: 8,
                                            fill: '#06b6d4',
                                            stroke: 'rgba(6, 182, 212, 0.3)',
                                            strokeWidth: 8
                                        }}
                                    />
                                </>
                            )}

                            {/* Predicted Claims */}
                            {(activeMetric === 'predicted' || activeMetric === 'both') && (
                                <Line
                                    type="monotone"
                                    dataKey="predicted"
                                    name="Predicted"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    strokeDasharray="8 4"
                                    dot={{
                                        fill: '#8b5cf6',
                                        strokeWidth: 3,
                                        stroke: '#0a0a12',
                                        r: 5
                                    }}
                                    activeDot={{
                                        r: 8,
                                        fill: '#8b5cf6',
                                        stroke: 'rgba(139, 92, 246, 0.3)',
                                        strokeWidth: 8
                                    }}
                                />
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className="predictions-main-chart__legend">
                    <div className="predictions-main-chart__legend-item">
                        <span className="predictions-main-chart__legend-line predictions-main-chart__legend-line--actual" />
                        Actual Claims
                    </div>
                    <div className="predictions-main-chart__legend-item">
                        <span className="predictions-main-chart__legend-line predictions-main-chart__legend-line--predicted" />
                        AI Predicted
                    </div>
                    <div className="predictions-main-chart__legend-item">
                        <span className="predictions-main-chart__legend-area" />
                        High-Risk Impact
                    </div>
                </div>
            </motion.div>

            {/* Dual Panel: Risk + Model Intelligence */}
            <div className="predictions-panels">
                {/* Risk Distribution */}
                <motion.div
                    className="predictions-panel predictions-panel--risk"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="predictions-panel__header">
                        <Target size={18} />
                        <h3>Risk Distribution</h3>
                    </div>
                    <div className="predictions-panel__risk-bars">
                        {riskDistribution.map((risk, index) => (
                            <div key={risk.label} className="risk-bar-v2">
                                <div className="risk-bar-v2__label">{risk.label}</div>
                                <div className="risk-bar-v2__track">
                                    <motion.div
                                        className="risk-bar-v2__fill"
                                        style={{
                                            background: `linear-gradient(90deg, ${risk.color}80, ${risk.color})`,
                                            boxShadow: `0 0 20px ${risk.color}40`
                                        }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${risk.percentage}%` }}
                                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                                    />
                                </div>
                                <div className="risk-bar-v2__values">
                                    <span className="risk-bar-v2__count">{risk.count.toLocaleString()}</span>
                                    <span className="risk-bar-v2__percent">{risk.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Model Intelligence */}
                <motion.div
                    className="predictions-panel predictions-panel--model"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 }}
                >
                    <div className="predictions-panel__header">
                        <Brain size={18} />
                        <h3>Model Intelligence</h3>
                    </div>
                    <div className="predictions-panel__rings">
                        <ProgressRing value={94.2} label="Accuracy" color="#06b6d4" size={110} />
                        <ProgressRing value={87.8} label="Confidence" color="#8b5cf6" size={110} />
                        <ProgressRing value={98.5} label="Coverage" color="#10b981" size={110} />
                    </div>
                    <div className="predictions-panel__model-info">
                        <div className="predictions-panel__model-stat">
                            <Clock size={14} />
                            <span>Last trained: 2 hours ago</span>
                        </div>
                        <div className="predictions-panel__model-stat">
                            <Zap size={14} />
                            <span>1.2M training samples</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* High Risk Members Table */}
            <motion.div
                className="predictions-members"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="predictions-members__header">
                    <div className="predictions-members__title">
                        <AlertTriangle size={18} />
                        <h3>High-Risk Members</h3>
                        <span className="predictions-members__badge">{mockHighRiskMembers.length} Critical</span>
                    </div>
                    <button className="predictions-members__view-all">
                        View All <ArrowUpRight size={14} />
                    </button>
                </div>
                <div className="predictions-members__table">
                    <div className="predictions-members__row predictions-members__row--header">
                        <span>Member</span>
                        <span>Risk Score</span>
                        <span>Predicted Claims</span>
                        <span>Primary Condition</span>
                        <span>Intervention</span>
                    </div>
                    {mockHighRiskMembers.map((member, index) => (
                        <motion.div
                            key={member.id}
                            className="predictions-members__row"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.05 }}
                        >
                            <div className="predictions-members__member">
                                <div className="predictions-members__avatar">{member.initials}</div>
                                <span>{member.name}</span>
                            </div>
                            <div className="predictions-members__score">
                                <div className="predictions-members__score-bar">
                                    <div
                                        className="predictions-members__score-fill"
                                        style={{
                                            width: `${member.riskScore}%`,
                                            background: member.riskScore >= 90 ? '#ef4444' : member.riskScore >= 80 ? '#f59e0b' : '#3b82f6'
                                        }}
                                    />
                                </div>
                                <span>{member.riskScore}</span>
                            </div>
                            <span className="predictions-members__claims">{formatCurrency(member.predictedClaims)}</span>
                            <span className="predictions-members__condition">{member.primaryCondition}</span>
                            <button className="predictions-members__intervention">
                                {member.intervention}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
