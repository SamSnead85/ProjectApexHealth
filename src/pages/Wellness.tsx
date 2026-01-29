import { useState } from 'react'
import { motion } from 'framer-motion'
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
    Check
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
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

export function Wellness() {
    const [goals] = useState<WellnessGoal[]>(mockGoals)
    const [programs] = useState<WellnessProgram[]>(mockPrograms)

    const totalPoints = 325
    const totalEarned = 175

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

            {/* Points Progress */}
            <GlassCard className="wellness__progress-card">
                <div className="wellness__progress-header">
                    <h3>2024 Wellness Points</h3>
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

            {/* Health Score */}
            <GlassCard className="health-score-card">
                <div className="health-score__header">
                    <h3>Your Health Score</h3>
                    <Badge variant="success">Above Average</Badge>
                </div>
                <div className="health-score__display">
                    <div className="health-score__circle">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                            <motion.circle
                                cx="50" cy="50" r="45"
                                fill="none"
                                stroke="url(#scoreGradient)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray="283"
                                initial={{ strokeDashoffset: 283 }}
                                animate={{ strokeDashoffset: 283 - (283 * 0.78) }}
                                transition={{ duration: 1.5 }}
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
                            <span className="health-score__number">78</span>
                            <span className="health-score__label">out of 100</span>
                        </div>
                    </div>
                    <div className="health-score__breakdown">
                        <div className="health-score__item">
                            <span className="health-score__item-label">Activity</span>
                            <div className="health-score__item-bar">
                                <div className="health-score__item-fill" style={{ width: '82%' }} />
                            </div>
                            <span className="health-score__item-value">82</span>
                        </div>
                        <div className="health-score__item">
                            <span className="health-score__item-label">Nutrition</span>
                            <div className="health-score__item-bar">
                                <div className="health-score__item-fill" style={{ width: '75%' }} />
                            </div>
                            <span className="health-score__item-value">75</span>
                        </div>
                        <div className="health-score__item">
                            <span className="health-score__item-label">Sleep</span>
                            <div className="health-score__item-bar">
                                <div className="health-score__item-fill" style={{ width: '70%' }} />
                            </div>
                            <span className="health-score__item-value">70</span>
                        </div>
                        <div className="health-score__item">
                            <span className="health-score__item-label">Mental</span>
                            <div className="health-score__item-bar">
                                <div className="health-score__item-fill" style={{ width: '85%' }} />
                            </div>
                            <span className="health-score__item-value">85</span>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    )
}

export default Wellness
