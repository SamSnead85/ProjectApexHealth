import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Heart,
    Activity,
    Target,
    Award,
    TrendingUp,
    Footprints,
    Droplets,
    Moon,
    Apple,
    Zap,
    ChevronRight,
    Plus,
    Check,
    Gift,
    Trophy,
    Shield,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    Brain,
    Dumbbell
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard, PageSkeleton } from '../components/common'
import './Wellness.css'

interface WellnessGoal {
    id: string
    name: string
    icon: React.ReactNode
    current: number
    target: number
    unit: string
    streak: number
    color: string
}

interface WellnessProgram {
    id: string
    name: string
    description: string
    category: 'fitness' | 'nutrition' | 'mental' | 'preventive'
    reward: number
    progress: number
    enrolled: boolean
}

interface PreventiveCareItem {
    id: string
    name: string
    status: 'completed' | 'due' | 'overdue' | 'upcoming' | 'not-due'
    date?: string
    detail?: string
}

interface WellnessChallenge {
    id: string
    name: string
    icon: React.ReactNode
    current: number
    target: number
    unit: string
    daysLeft: number
    color: string
    participants: number
}

const mockGoals: WellnessGoal[] = [
    { id: 'steps', name: 'Daily Steps', icon: <Footprints size={20} />, current: 7850, target: 10000, unit: 'steps', streak: 5, color: '#22c55e' },
    { id: 'water', name: 'Water Intake', icon: <Droplets size={20} />, current: 6, target: 8, unit: 'glasses', streak: 12, color: '#3b82f6' },
    { id: 'sleep', name: 'Sleep', icon: <Moon size={20} />, current: 7.5, target: 8, unit: 'hours', streak: 3, color: '#a855f7' },
    { id: 'mindfulness', name: 'Mindfulness', icon: <Zap size={20} />, current: 10, target: 15, unit: 'minutes', streak: 7, color: '#f59e0b' }
]

const mockPrograms: WellnessProgram[] = [
    { id: 'prog-1', name: 'Annual Physical Completed', description: 'Schedule and complete your annual wellness visit', category: 'preventive', reward: 100, progress: 100, enrolled: true },
    { id: 'prog-2', name: '10,000 Steps Challenge', description: 'Walk 10,000 steps a day for 30 days', category: 'fitness', reward: 50, progress: 65, enrolled: true },
    { id: 'prog-3', name: 'Stress Management Course', description: '8-week mindfulness and stress reduction program', category: 'mental', reward: 75, progress: 25, enrolled: true },
    { id: 'prog-4', name: 'Nutrition Tracking', description: 'Log your meals for 14 consecutive days', category: 'nutrition', reward: 25, progress: 0, enrolled: false }
]

// Health Score contributing factors
const healthScoreFactors = [
    { label: 'Exercise', value: 85, color: '#22c55e' },
    { label: 'Nutrition', value: 72, color: '#f59e0b' },
    { label: 'Sleep', value: 80, color: '#a855f7' },
    { label: 'Preventive Care', value: 65, color: '#3b82f6' },
    { label: 'Mental Health', value: 82, color: '#ec4899' },
]

// Preventive Care Checklist
const preventiveCareItems: PreventiveCareItem[] = [
    { id: 'pc-1', name: 'Annual Physical', status: 'completed', date: 'Oct 15, 2025' },
    { id: 'pc-2', name: 'Flu Vaccine', status: 'due', detail: 'Due now' },
    { id: 'pc-3', name: 'Dental Cleaning', status: 'overdue', detail: 'Overdue by 2 months' },
    { id: 'pc-4', name: 'Eye Exam', status: 'upcoming', detail: 'Due in 3 months' },
    { id: 'pc-5', name: 'Colonoscopy Screening', status: 'not-due', detail: 'Not due until age 45' },
    { id: 'pc-6', name: 'Mammogram / PSA', status: 'due', detail: 'Due this year' },
]

// Wellness Challenges
const mockChallenges: WellnessChallenge[] = [
    {
        id: 'ch-1',
        name: '10K Steps Challenge',
        icon: <Footprints size={20} />,
        current: 6234,
        target: 10000,
        unit: 'steps',
        daysLeft: 18,
        color: '#22c55e',
        participants: 1243,
    },
    {
        id: 'ch-2',
        name: 'Water Intake Goal',
        icon: <Droplets size={20} />,
        current: 6,
        target: 8,
        unit: 'glasses',
        daysLeft: 5,
        color: '#3b82f6',
        participants: 876,
    },
    {
        id: 'ch-3',
        name: 'Mindful Minutes',
        icon: <Brain size={20} />,
        current: 45,
        target: 60,
        unit: 'min/week',
        daysLeft: 12,
        color: '#a855f7',
        participants: 654,
    },
]

// Rewards data
const rewardsData = {
    totalPoints: 2450,
    nextRewardThreshold: 3000,
    nextRewardName: '$50 Gift Card',
    recentRewards: [
        { name: '$25 Wellness Credit', points: 1500, redeemed: true },
        { name: 'Fitness Tracker Band', points: 2000, redeemed: true },
    ],
    availableRewards: [
        { name: '$50 Gift Card', points: 3000 },
        { name: 'Premium Gym Month', points: 3500 },
        { name: '$100 Health Store', points: 5000 },
    ],
}

export function Wellness() {
    const [loading, setLoading] = useState(true)
    useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t) }, [])
    const [goals] = useState<WellnessGoal[]>(mockGoals)
    const [programs] = useState<WellnessProgram[]>(mockPrograms)
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set(['pc-1']))

    const totalPoints = 325
    const totalEarned = 175

    const toggleChecked = (id: string) => {
        setCheckedItems(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const getStatusIcon = (status: PreventiveCareItem['status']) => {
        switch (status) {
            case 'completed': return <CheckCircle size={18} />
            case 'due': return <AlertCircle size={18} />
            case 'overdue': return <XCircle size={18} />
            case 'upcoming': return <Clock size={18} />
            case 'not-due': return <Shield size={18} />
        }
    }

    const getStatusColor = (status: PreventiveCareItem['status']) => {
        switch (status) {
            case 'completed': return '#22c55e'
            case 'due': return '#f59e0b'
            case 'overdue': return '#ef4444'
            case 'upcoming': return '#3b82f6'
            case 'not-due': return 'var(--apex-steel)'
        }
    }

    const overallHealthScore = 78

    if (loading) return <PageSkeleton />

    return (
        <div className="wellness-page">
            {/* Header */}
            <div className="wellness__header">
                <div>
                    <h1 className="wellness__title">Wellness Center</h1>
                    <p className="wellness__subtitle">
                        Track your health goals and earn wellness rewards
                    </p>
                </div>
                <div className="wellness__points">
                    <Award size={24} />
                    <div className="wellness__points-info">
                        <span className="wellness__points-value">{totalEarned}</span>
                        <span className="wellness__points-label">of {totalPoints} points earned</span>
                    </div>
                </div>
            </div>

            {/* Personal Health Score - Enhanced */}
            <GlassCard className="health-score-card health-score-card--enhanced">
                <div className="health-score__header">
                    <h3>Personal Health Score</h3>
                    <Badge variant="success">Above Average</Badge>
                </div>
                <div className="health-score__display">
                    <div className="health-score__circle">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                            <motion.circle
                                cx="50" cy="50" r="45"
                                fill="none"
                                stroke="url(#scoreGradient)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray="283"
                                initial={{ strokeDashoffset: 283 }}
                                animate={{ strokeDashoffset: 283 - (283 * (overallHealthScore / 100)) }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                            />
                            <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="var(--apex-teal)" />
                                    <stop offset="100%" stopColor="var(--apex-electric-purple)" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="health-score__value">
                            <motion.span
                                className="health-score__number"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                            >
                                {overallHealthScore}
                            </motion.span>
                            <span className="health-score__label">out of 100</span>
                        </div>
                    </div>
                    <div className="health-score__breakdown">
                        {healthScoreFactors.map((factor, index) => (
                            <motion.div
                                key={factor.label}
                                className="health-score__item"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                            >
                                <span className="health-score__item-label">{factor.label}</span>
                                <div className="health-score__item-bar">
                                    <motion.div
                                        className="health-score__item-fill"
                                        style={{ background: factor.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${factor.value}%` }}
                                        transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                                    />
                                </div>
                                <span className="health-score__item-value">{factor.value}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </GlassCard>

            {/* Points Progress */}
            <GlassCard className="wellness__progress-card">
                <div className="wellness__progress-header">
                    <h3>2026 Wellness Points</h3>
                    <Badge variant="teal">${(totalEarned * 0.50).toFixed(0)} in rewards</Badge>
                </div>
                <div className="wellness__progress-bar">
                    <motion.div
                        className="wellness__progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${(totalEarned / totalPoints) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </div>
                <div className="wellness__progress-labels">
                    <span>0</span>
                    <span>100</span>
                    <span>200</span>
                    <span>325</span>
                </div>
            </GlassCard>

            {/* Preventive Care Checklist + Rewards side-by-side */}
            <div className="wellness__two-column">
                {/* Preventive Care Checklist */}
                <div className="preventive-care">
                    <div className="wellness__section-header">
                        <h3 className="wellness__section-title">Preventive Care Checklist</h3>
                        <Badge variant="info">{checkedItems.size}/{preventiveCareItems.length}</Badge>
                    </div>
                    <div className="preventive-care__list">
                        {preventiveCareItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className={`preventive-care__item preventive-care__item--${item.status}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.06 }}
                                onClick={() => toggleChecked(item.id)}
                            >
                                <div
                                    className="preventive-care__check"
                                    style={{ color: getStatusColor(item.status) }}
                                >
                                    {getStatusIcon(item.status)}
                                </div>
                                <div className="preventive-care__info">
                                    <span className="preventive-care__name">{item.name}</span>
                                    <span
                                        className="preventive-care__detail"
                                        style={{ color: getStatusColor(item.status) }}
                                    >
                                        {item.status === 'completed' ? `Completed ${item.date}` : item.detail}
                                    </span>
                                </div>
                                <div className={`preventive-care__status-badge preventive-care__status-badge--${item.status}`}>
                                    {item.status === 'completed' ? 'Done' :
                                     item.status === 'due' ? 'Due' :
                                     item.status === 'overdue' ? 'Overdue' :
                                     item.status === 'upcoming' ? 'Upcoming' : 'N/A'}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Rewards Display */}
                <div className="rewards-display">
                    <div className="wellness__section-header">
                        <h3 className="wellness__section-title">Wellness Rewards</h3>
                        <Gift size={20} style={{ color: 'var(--apex-teal)' }} />
                    </div>

                    {/* Points Summary */}
                    <GlassCard className="rewards__points-card">
                        <div className="rewards__points-top">
                            <Trophy size={28} style={{ color: '#f59e0b' }} />
                            <div className="rewards__points-numbers">
                                <motion.span
                                    className="rewards__total-points"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {rewardsData.totalPoints.toLocaleString()}
                                </motion.span>
                                <span className="rewards__points-unit">points earned</span>
                            </div>
                        </div>
                        <div className="rewards__next-reward">
                            <div className="rewards__next-info">
                                <span className="rewards__next-label">Next Reward:</span>
                                <span className="rewards__next-name">{rewardsData.nextRewardName}</span>
                            </div>
                            <div className="rewards__next-bar">
                                <motion.div
                                    className="rewards__next-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(rewardsData.totalPoints / rewardsData.nextRewardThreshold) * 100}%` }}
                                    transition={{ duration: 1 }}
                                />
                            </div>
                            <div className="rewards__next-progress-label">
                                <span>{rewardsData.totalPoints.toLocaleString()} / {rewardsData.nextRewardThreshold.toLocaleString()} pts</span>
                                <span>{rewardsData.nextRewardThreshold - rewardsData.totalPoints} to go</span>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Available Rewards */}
                    <div className="rewards__available">
                        <span className="rewards__available-label">Available Rewards</span>
                        {rewardsData.availableRewards.map((reward, i) => (
                            <div key={i} className={`rewards__reward-item ${rewardsData.totalPoints >= reward.points ? 'rewards__reward-item--redeemable' : ''}`}>
                                <Gift size={14} />
                                <span className="rewards__reward-name">{reward.name}</span>
                                <span className="rewards__reward-cost">{reward.points.toLocaleString()} pts</span>
                                {rewardsData.totalPoints >= reward.points && (
                                    <Button variant="primary" size="sm">Redeem</Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Wellness Challenges */}
            <h3 className="wellness__section-title">Active Challenges</h3>
            <div className="wellness-challenges">
                {mockChallenges.map((challenge, index) => (
                    <motion.div
                        key={challenge.id}
                        className="challenge-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="challenge-card__header">
                            <div
                                className="challenge-card__icon"
                                style={{ background: `${challenge.color}20`, color: challenge.color }}
                            >
                                {challenge.icon}
                            </div>
                            <div className="challenge-card__title-area">
                                <h4 className="challenge-card__name">{challenge.name}</h4>
                                <span className="challenge-card__participants">
                                    {challenge.participants.toLocaleString()} participants
                                </span>
                            </div>
                            <Badge variant="teal">{challenge.daysLeft}d left</Badge>
                        </div>
                        <div className="challenge-card__progress-section">
                            <div className="challenge-card__values">
                                <span className="challenge-card__current">
                                    {challenge.current.toLocaleString()}
                                </span>
                                <span className="challenge-card__target">
                                    / {challenge.target.toLocaleString()} {challenge.unit}
                                </span>
                            </div>
                            <div className="challenge-card__bar">
                                <motion.div
                                    className="challenge-card__bar-fill"
                                    style={{ background: challenge.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(challenge.current / challenge.target) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                                />
                            </div>
                            <span className="challenge-card__percent">
                                {Math.round((challenge.current / challenge.target) * 100)}% complete
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Daily Goals */}
            <h3 className="wellness__section-title">Daily Goals</h3>
            <div className="daily-goals">
                {goals.map((goal, index) => (
                    <motion.div
                        key={goal.id}
                        className="goal-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="goal-card__icon" style={{ background: `${goal.color}20`, color: goal.color }}>
                            {goal.icon}
                        </div>
                        <div className="goal-card__info">
                            <span className="goal-card__name">{goal.name}</span>
                            <div className="goal-card__progress">
                                <span className="goal-card__current">{goal.current}</span>
                                <span className="goal-card__target">/ {goal.target} {goal.unit}</span>
                            </div>
                        </div>
                        <div className="goal-card__ring">
                            <svg viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                                <motion.circle
                                    cx="18" cy="18" r="15.9"
                                    fill="none"
                                    stroke={goal.color}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeDasharray="100"
                                    initial={{ strokeDashoffset: 100 }}
                                    animate={{ strokeDashoffset: 100 - (goal.current / goal.target) * 100 }}
                                    transition={{ duration: 1 }}
                                    style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                                />
                            </svg>
                            <span className="goal-card__percent">{Math.round((goal.current / goal.target) * 100)}%</span>
                        </div>
                        <div className="goal-card__streak">
                            <TrendingUp size={12} />
                            {goal.streak} day streak
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Programs */}
            <h3 className="wellness__section-title">Wellness Programs</h3>
            <div className="wellness-programs">
                {programs.map((program, index) => (
                    <motion.div
                        key={program.id}
                        className={`program-card ${program.progress === 100 ? 'completed' : ''}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="program-card__status">
                            {program.progress === 100 ? (
                                <div className="program-card__check">
                                    <Check size={16} />
                                </div>
                            ) : (
                                <div className="program-card__progress-ring">
                                    <svg viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                                        <circle
                                            cx="18" cy="18" r="15.9"
                                            fill="none"
                                            stroke="var(--apex-teal)"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeDasharray="100"
                                            strokeDashoffset={100 - program.progress}
                                            style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                                        />
                                    </svg>
                                    <span>{program.progress}%</span>
                                </div>
                            )}
                        </div>
                        <div className="program-card__info">
                            <h4>{program.name}</h4>
                            <p>{program.description}</p>
                        </div>
                        <div className="program-card__reward">
                            <Award size={16} />
                            <span>{program.reward} pts</span>
                        </div>
                        {program.enrolled ? (
                            program.progress < 100 && (
                                <Button variant="secondary" size="sm">Continue</Button>
                            )
                        ) : (
                            <Button variant="primary" size="sm" icon={<Plus size={14} />}>Enroll</Button>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default Wellness
