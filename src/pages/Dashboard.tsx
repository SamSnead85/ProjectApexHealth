import { useState } from 'react'
import {
    Users,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Activity,
    Zap,
    Brain,
    Target,
    DollarSign,
    Sparkles,
    BarChart3,
    RefreshCw,
    ChevronRight,
    Shield
} from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard, MetricCard, Badge, Button } from '../components/common'
import './Dashboard.css'

interface DashboardProps {
    portalType: 'admin' | 'broker' | 'employer' | 'member'
}

// AI Forecast data simulation
const forecastData = {
    claimsTrend: [65, 72, 68, 85, 78, 92, 88, 95, 102],
    projectedSavings: '$2.4M',
    confidenceScore: 94,
    timeframe: 'Q1 2026'
}

// Smart Actions based on AI analysis
const smartActions = [
    { id: '1', title: 'Review 47 pending prior auths', priority: 'high', impact: 'Prevent $23K delays', icon: Clock },
    { id: '2', title: 'Approve batch of 23 routine claims', priority: 'medium', impact: 'Save 4 hours', icon: CheckCircle2 },
    { id: '3', title: 'Investigate Provider #7845 pattern', priority: 'high', impact: 'Potential $45K savings', icon: AlertTriangle },
    { id: '4', title: 'Complete compliance attestation', priority: 'medium', impact: 'Due in 3 days', icon: Shield },
]

// Animated Sparkline component
const Sparkline = ({ data, color = '#0D9488' }: { data: number[], color?: string }) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const width = 120
    const height = 40

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((val - min) / range) * height
        return `${x},${y}`
    }).join(' ')

    return (
        <svg width={width} height={height} className="dashboard__sparkline">
            <defs>
                <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <motion.polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />
        </svg>
    )
}

// AI Confidence Ring
const ConfidenceRing = ({ score }: { score: number }) => {
    const radius = 28
    const circumference = 2 * Math.PI * radius
    const progress = (score / 100) * circumference

    return (
        <div className="dashboard__confidence-ring">
            <svg width="70" height="70" viewBox="0 0 70 70">
                <circle
                    cx="35"
                    cy="35"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="4"
                />
                <motion.circle
                    cx="35"
                    cy="35"
                    r={radius}
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - progress }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    transform="rotate(-90 35 35)"
                />
            </svg>
            <div className="dashboard__confidence-value">
                <span>{score}%</span>
                <span className="dashboard__confidence-label">Confidence</span>
            </div>
        </div>
    )
}

export function Dashboard({ portalType }: DashboardProps) {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [lastUpdated, setLastUpdated] = useState(new Date())

    const getPortalTitle = () => {
        switch (portalType) {
            case 'admin': return 'Platform Intelligence'
            case 'broker': return 'Sales Command Center'
            case 'employer': return 'Benefits Intelligence'
            case 'member': return 'My Health Dashboard'
            default: return 'Dashboard'
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await new Promise(resolve => setTimeout(resolve, 1200))
        setLastUpdated(new Date())
        setIsRefreshing(false)
    }

    return (
        <div className="dashboard">
            {/* Premium Header with AI Status */}
            <div className="dashboard__header">
                <div className="dashboard__header-left">
                    <div className="dashboard__title-row">
                        <h1 className="dashboard__title">{getPortalTitle()}</h1>
                        <Badge variant="teal" dot pulse>
                            <Brain size={12} />
                            AI Active
                        </Badge>
                    </div>
                    <p className="dashboard__subtitle">
                        Powered by predictive intelligence • Last updated {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
                <div className="dashboard__header-right">
                    <Badge variant="success" dot pulse>Live Data</Badge>
                    <Button
                        variant="secondary"
                        icon={<RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />}
                        onClick={handleRefresh}
                    >
                        Refresh
                    </Button>
                    <Button variant="primary" icon={<Zap size={16} />}>
                        Quick Action
                    </Button>
                </div>
            </div>

            {/* AI Forecast Banner */}
            <motion.div
                className="dashboard__forecast-banner"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="dashboard__forecast-content">
                    <div className="dashboard__forecast-icon">
                        <Sparkles size={24} />
                    </div>
                    <div className="dashboard__forecast-text">
                        <span className="dashboard__forecast-label">AI Forecast</span>
                        <span className="dashboard__forecast-value">
                            Projected {forecastData.projectedSavings} in cost savings for {forecastData.timeframe}
                        </span>
                    </div>
                    <Sparkline data={forecastData.claimsTrend} />
                    <ConfidenceRing score={forecastData.confidenceScore} />
                </div>
            </motion.div>

            {/* Enhanced Metrics Grid */}
            <div className="dashboard__metrics">
                <MetricCard
                    title="Total Claims"
                    value="2,847"
                    trend={{ value: 12.5, direction: 'up' }}
                    subtitle="vs last month"
                    icon={<Activity size={18} />}
                    variant="teal"
                />
                <MetricCard
                    title="Auto-Approved"
                    value="2,156"
                    trend={{ value: 8.2, direction: 'up' }}
                    subtitle="94% STP rate"
                    icon={<CheckCircle2 size={18} />}
                    variant="success"
                />
                <MetricCard
                    title="Pending Review"
                    value="428"
                    trend={{ value: 3.1, direction: 'down' }}
                    subtitle="Avg 2.3 day resolution"
                    icon={<Clock size={18} />}
                    variant="warning"
                />
                <MetricCard
                    title="Cost Savings"
                    value="$847K"
                    trend={{ value: 23.4, direction: 'up' }}
                    subtitle="This quarter"
                    icon={<DollarSign size={18} />}
                    variant="teal"
                />
            </div>

            {/* Main Content Grid */}
            <div className="dashboard__grid dashboard__grid--enhanced">
                {/* Smart Actions Panel */}
                <GlassCard className="dashboard__card dashboard__card--actions">
                    <div className="dashboard__card-header">
                        <h3 className="dashboard__card-title">
                            <Target size={18} className="text-teal" />
                            Smart Actions
                        </h3>
                        <Badge variant="critical">{smartActions.filter(a => a.priority === 'high').length} Urgent</Badge>
                    </div>
                    <div className="dashboard__actions-list">
                        {smartActions.map((action, idx) => (
                            <motion.div
                                key={action.id}
                                className={`dashboard__action-item dashboard__action-item--${action.priority}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="dashboard__action-icon">
                                    <action.icon size={16} />
                                </div>
                                <div className="dashboard__action-content">
                                    <span className="dashboard__action-title">{action.title}</span>
                                    <span className="dashboard__action-impact">{action.impact}</span>
                                </div>
                                <ChevronRight size={16} className="dashboard__action-arrow" />
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* AI Insights Panel */}
                <GlassCard className="dashboard__card dashboard__card--insights">
                    <div className="dashboard__card-header">
                        <h3 className="dashboard__card-title">
                            <Brain size={18} className="text-teal" />
                            AI Insights
                        </h3>
                        <Badge variant="teal">3 New</Badge>
                    </div>
                    <div className="dashboard__insights">
                        <motion.div
                            className="dashboard__insight"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="dashboard__insight-icon dashboard__insight-icon--warning">
                                <AlertTriangle size={16} />
                            </div>
                            <div className="dashboard__insight-content">
                                <span className="dashboard__insight-title">
                                    Anomaly Detected: Provider X claims 45% above average
                                </span>
                                <span className="dashboard__insight-action">Review flagged claims →</span>
                            </div>
                        </motion.div>

                        <motion.div
                            className="dashboard__insight"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="dashboard__insight-icon dashboard__insight-icon--success">
                                <TrendingUp size={16} />
                            </div>
                            <div className="dashboard__insight-content">
                                <span className="dashboard__insight-title">
                                    Cost savings opportunity: $127K via automation rules
                                </span>
                                <span className="dashboard__insight-action">Configure auto-approval →</span>
                            </div>
                        </motion.div>

                        <motion.div
                            className="dashboard__insight"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="dashboard__insight-icon dashboard__insight-icon--info">
                                <Users size={16} />
                            </div>
                            <div className="dashboard__insight-content">
                                <span className="dashboard__insight-title">
                                    12 members approaching deductible threshold
                                </span>
                                <span className="dashboard__insight-action">View member list →</span>
                            </div>
                        </motion.div>
                    </div>
                </GlassCard>

                {/* Real-Time Activity */}
                <GlassCard className="dashboard__card dashboard__card--activity">
                    <div className="dashboard__card-header">
                        <h3 className="dashboard__card-title">
                            <Activity size={18} className="text-teal" />
                            Real-Time Activity
                        </h3>
                        <span className="dashboard__card-meta">Last 24 hours</span>
                    </div>
                    <div className="dashboard__activity-list">
                        {[
                            { time: '2 min ago', action: 'Claim #CLM-2847 auto-approved', actor: 'AI Engine', type: 'success' },
                            { time: '15 min ago', action: 'Prior Auth #PA-1294 flagged for review', actor: 'Rules Engine', type: 'warning' },
                            { time: '32 min ago', action: 'Batch processing complete: 156 claims', actor: 'System', type: 'info' },
                            { time: '1 hr ago', action: 'Member enrollment verified', actor: 'AI Verification', type: 'success' },
                            { time: '2 hr ago', action: 'Compliance check initiated', actor: 'Scheduler', type: 'info' },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                className="dashboard__activity-item"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className={`dashboard__activity-dot dashboard__activity-dot--${item.type}`} />
                                <div className="dashboard__activity-content">
                                    <span className="dashboard__activity-action">{item.action}</span>
                                    <span className="dashboard__activity-meta">
                                        {item.actor} • {item.time}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Processing Overview with Enhanced Visuals */}
                <GlassCard className="dashboard__card dashboard__card--stats">
                    <div className="dashboard__card-header">
                        <h3 className="dashboard__card-title">
                            <BarChart3 size={18} className="text-teal" />
                            Processing Overview
                        </h3>
                    </div>
                    <div className="dashboard__stats-bars">
                        <div className="dashboard__stat-bar">
                            <div className="dashboard__stat-bar-header">
                                <span>Auto-Approved</span>
                                <span className="text-success">68%</span>
                            </div>
                            <div className="dashboard__stat-bar-track">
                                <motion.div
                                    className="dashboard__stat-bar-fill dashboard__stat-bar-fill--success"
                                    initial={{ width: 0 }}
                                    animate={{ width: '68%' }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                />
                            </div>
                        </div>
                        <div className="dashboard__stat-bar">
                            <div className="dashboard__stat-bar-header">
                                <span>Human Review</span>
                                <span className="text-warning">24%</span>
                            </div>
                            <div className="dashboard__stat-bar-track">
                                <motion.div
                                    className="dashboard__stat-bar-fill dashboard__stat-bar-fill--warning"
                                    initial={{ width: 0 }}
                                    animate={{ width: '24%' }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                />
                            </div>
                        </div>
                        <div className="dashboard__stat-bar">
                            <div className="dashboard__stat-bar-header">
                                <span>Denied</span>
                                <span className="text-critical">8%</span>
                            </div>
                            <div className="dashboard__stat-bar-track">
                                <motion.div
                                    className="dashboard__stat-bar-fill dashboard__stat-bar-fill--critical"
                                    initial={{ width: 0 }}
                                    animate={{ width: '8%' }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Key Performance Indicators */}
                    <div className="dashboard__kpi-grid">
                        <div className="dashboard__kpi">
                            <span className="dashboard__kpi-value">2.3 days</span>
                            <span className="dashboard__kpi-label">Avg. Processing Time</span>
                        </div>
                        <div className="dashboard__kpi">
                            <span className="dashboard__kpi-value">99.2%</span>
                            <span className="dashboard__kpi-label">Accuracy Rate</span>
                        </div>
                        <div className="dashboard__kpi">
                            <span className="dashboard__kpi-value">$127K</span>
                            <span className="dashboard__kpi-label">Monthly Savings</span>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default Dashboard
