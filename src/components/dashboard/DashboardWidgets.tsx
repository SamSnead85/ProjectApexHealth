import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Activity,
    Shield,
    Calendar,
    Clock,
    ChevronRight,
    Sparkles,
    Target,
    Zap,
    Heart
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './DashboardWidgets.css'

// Spending Summary Widget
interface SpendingSummaryProps {
    ytdSpending: number
    deductible: number
    deductibleMet: number
    oopMax: number
    oopMet: number
}

export function SpendingSummary({
    ytdSpending = 2450,
    deductible = 3000,
    deductibleMet = 1850,
    oopMax = 8000,
    oopMet = 2450
}: SpendingSummaryProps) {
    const deductiblePercent = Math.min((deductibleMet / deductible) * 100, 100)
    const oopPercent = Math.min((oopMet / oopMax) * 100, 100)

    return (
        <GlassCard className="spending-summary">
            <div className="spending-summary__header">
                <div className="spending-summary__title">
                    <DollarSign size={20} />
                    <h3>Spending Summary</h3>
                </div>
                <Badge variant="info" size="sm">2024 YTD</Badge>
            </div>

            <div className="spending-summary__total">
                <span className="spending-summary__amount">${ytdSpending.toLocaleString()}</span>
                <span className="spending-summary__label">Total Healthcare Spending</span>
            </div>

            <div className="spending-summary__trackers">
                {/* Deductible Tracker */}
                <div className="tracker">
                    <div className="tracker__header">
                        <span className="tracker__label">Individual Deductible</span>
                        <span className="tracker__value">${deductibleMet.toLocaleString()} / ${deductible.toLocaleString()}</span>
                    </div>
                    <div className="tracker__bar">
                        <motion.div
                            className="tracker__fill tracker__fill--deductible"
                            initial={{ width: 0 }}
                            animate={{ width: `${deductiblePercent}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                    <span className="tracker__remaining">
                        ${(deductible - deductibleMet).toLocaleString()} remaining
                    </span>
                </div>

                {/* OOP Max Tracker */}
                <div className="tracker">
                    <div className="tracker__header">
                        <span className="tracker__label">Out-of-Pocket Maximum</span>
                        <span className="tracker__value">${oopMet.toLocaleString()} / ${oopMax.toLocaleString()}</span>
                    </div>
                    <div className="tracker__bar">
                        <motion.div
                            className="tracker__fill tracker__fill--oop"
                            initial={{ width: 0 }}
                            animate={{ width: `${oopPercent}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                        />
                    </div>
                    <span className="tracker__remaining">
                        ${(oopMax - oopMet).toLocaleString()} to max
                    </span>
                </div>
            </div>
        </GlassCard>
    )
}

// Quick Actions Widget
interface QuickAction {
    id: string
    label: string
    icon: React.ReactNode
    href?: string
    onClick?: () => void
    badge?: string
}

const defaultActions: QuickAction[] = [
    { id: 'claims', label: 'Submit a Claim', icon: <DollarSign size={20} /> },
    { id: 'find-doctor', label: 'Find a Doctor', icon: <Heart size={20} /> },
    { id: 'id-card', label: 'View ID Card', icon: <Shield size={20} /> },
    { id: 'schedule', label: 'Schedule Appointment', icon: <Calendar size={20} />, badge: '2 upcoming' },
    { id: 'messages', label: 'Messages', icon: <Zap size={20} />, badge: '3 new' },
    { id: 'benefits', label: 'View Benefits', icon: <Target size={20} /> }
]

export function QuickActions({ actions = defaultActions }: { actions?: QuickAction[] }) {
    return (
        <GlassCard className="quick-actions">
            <div className="quick-actions__header">
                <Sparkles size={20} />
                <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions__grid">
                {actions.map((action, index) => (
                    <motion.button
                        key={action.id}
                        className="quick-action-btn"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={action.onClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="quick-action-btn__icon">{action.icon}</div>
                        <span className="quick-action-btn__label">{action.label}</span>
                        {action.badge && (
                            <Badge variant="teal" size="sm" className="quick-action-btn__badge">
                                {action.badge}
                            </Badge>
                        )}
                        <ChevronRight size={16} className="quick-action-btn__arrow" />
                    </motion.button>
                ))}
            </div>
        </GlassCard>
    )
}

// Coverage Countdown Widget
interface CoverageCountdownProps {
    renewalDate: Date
    planName: string
    planType: string
}

export function CoverageCountdown({
    renewalDate = new Date('2024-12-31'),
    planName = 'Apex Gold PPO',
    planType = 'Family Coverage'
}: CoverageCountdownProps) {
    const [daysRemaining, setDaysRemaining] = useState(0)

    useEffect(() => {
        const now = new Date()
        const diff = renewalDate.getTime() - now.getTime()
        setDaysRemaining(Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }, [renewalDate])

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }

    return (
        <GlassCard className="coverage-countdown">
            <div className="coverage-countdown__header">
                <Shield size={20} />
                <div>
                    <h3>{planName}</h3>
                    <span className="coverage-countdown__type">{planType}</span>
                </div>
                <Badge variant="success" size="sm">Active</Badge>
            </div>

            <div className="coverage-countdown__timer">
                <div className="countdown-ring">
                    <svg viewBox="0 0 100 100">
                        <circle
                            className="countdown-ring__bg"
                            cx="50"
                            cy="50"
                            r="45"
                        />
                        <motion.circle
                            className="countdown-ring__fill"
                            cx="50"
                            cy="50"
                            r="45"
                            strokeDasharray={`${(daysRemaining / 365) * 283} 283`}
                            initial={{ strokeDasharray: '0 283' }}
                            animate={{ strokeDasharray: `${(daysRemaining / 365) * 283} 283` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                    </svg>
                    <div className="countdown-ring__content">
                        <span className="countdown-ring__days">{daysRemaining}</span>
                        <span className="countdown-ring__label">days</span>
                    </div>
                </div>
                <div className="coverage-countdown__info">
                    <span className="coverage-countdown__text">Coverage renews</span>
                    <span className="coverage-countdown__date">{formatDate(renewalDate)}</span>
                </div>
            </div>

            <Button variant="ghost" size="sm" className="coverage-countdown__btn">
                View Plan Details <ChevronRight size={14} />
            </Button>
        </GlassCard>
    )
}

// Recent Activity Widget
interface ActivityItem {
    id: string
    type: 'claim' | 'payment' | 'appointment' | 'message'
    title: string
    description: string
    date: Date
    amount?: number
    status?: 'pending' | 'completed' | 'denied'
}

const recentActivity: ActivityItem[] = [
    {
        id: '1',
        type: 'claim',
        title: 'Claim Processed',
        description: 'Office Visit - Dr. Sarah Chen',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        amount: 125,
        status: 'completed'
    },
    {
        id: '2',
        type: 'payment',
        title: 'Payment Made',
        description: 'Monthly Premium',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        amount: 450
    },
    {
        id: '3',
        type: 'appointment',
        title: 'Appointment Scheduled',
        description: 'Annual Physical - Feb 15',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
]

export function RecentActivity({ activities = recentActivity }: { activities?: ActivityItem[] }) {
    const formatDate = (date: Date) => {
        const diff = Date.now() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        if (days === 0) return 'Today'
        if (days === 1) return 'Yesterday'
        return `${days} days ago`
    }

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'completed': return 'success'
            case 'pending': return 'warning'
            case 'denied': return 'critical'
            default: return 'info'
        }
    }

    return (
        <GlassCard className="recent-activity">
            <div className="recent-activity__header">
                <Activity size={20} />
                <h3>Recent Activity</h3>
                <Button variant="ghost" size="sm">View All</Button>
            </div>

            <div className="recent-activity__list">
                {activities.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        className="activity-item"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="activity-item__icon">
                            {activity.type === 'claim' && <DollarSign size={16} />}
                            {activity.type === 'payment' && <DollarSign size={16} />}
                            {activity.type === 'appointment' && <Calendar size={16} />}
                            {activity.type === 'message' && <Zap size={16} />}
                        </div>
                        <div className="activity-item__content">
                            <div className="activity-item__header">
                                <span className="activity-item__title">{activity.title}</span>
                                <span className="activity-item__date">{formatDate(activity.date)}</span>
                            </div>
                            <span className="activity-item__description">{activity.description}</span>
                        </div>
                        {activity.amount && (
                            <span className="activity-item__amount">${activity.amount}</span>
                        )}
                        {activity.status && (
                            <Badge variant={getStatusColor(activity.status) as any} size="sm">
                                {activity.status}
                            </Badge>
                        )}
                    </motion.div>
                ))}
            </div>
        </GlassCard>
    )
}

// Health Score Mini Widget
export function HealthScoreMini({ score = 78 }: { score?: number }) {
    const getScoreColor = (s: number) => {
        if (s >= 80) return 'var(--apex-success)'
        if (s >= 60) return 'var(--apex-warning)'
        return 'var(--apex-danger)'
    }

    return (
        <GlassCard className="health-score-mini">
            <div className="health-score-mini__content">
                <div className="health-score-mini__ring">
                    <svg viewBox="0 0 60 60">
                        <circle
                            className="score-ring__bg"
                            cx="30"
                            cy="30"
                            r="25"
                        />
                        <motion.circle
                            className="score-ring__fill"
                            cx="30"
                            cy="30"
                            r="25"
                            style={{ stroke: getScoreColor(score) }}
                            strokeDasharray={`${(score / 100) * 157} 157`}
                            initial={{ strokeDasharray: '0 157' }}
                            animate={{ strokeDasharray: `${(score / 100) * 157} 157` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                    </svg>
                    <span className="score-ring__value">{score}</span>
                </div>
                <div className="health-score-mini__info">
                    <h4>Health Score</h4>
                    <span className="health-score-mini__trend">
                        <TrendingUp size={14} />
                        +5 this month
                    </span>
                </div>
            </div>
            <Button variant="ghost" size="sm">View Insights</Button>
        </GlassCard>
    )
}

export default {
    SpendingSummary,
    QuickActions,
    CoverageCountdown,
    RecentActivity,
    HealthScoreMini
}
