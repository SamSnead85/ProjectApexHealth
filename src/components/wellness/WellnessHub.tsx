import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Activity,
    Trophy,
    Target,
    Flame,
    Footprints,
    Moon,
    Droplets,
    Apple,
    Heart,
    TrendingUp,
    Award,
    Gift,
    ChevronRight,
    Calendar,
    Zap,
    Star
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './WellnessHub.css'

// Wellness Goals
interface WellnessGoal {
    id: string
    name: string
    icon: React.ReactNode
    current: number
    target: number
    unit: string
    streak: number
}

const dailyGoals: WellnessGoal[] = [
    { id: 'steps', name: 'Steps', icon: <Footprints size={20} />, current: 7234, target: 10000, unit: 'steps', streak: 12 },
    { id: 'water', name: 'Water', icon: <Droplets size={20} />, current: 5, target: 8, unit: 'glasses', streak: 8 },
    { id: 'sleep', name: 'Sleep', icon: <Moon size={20} />, current: 7.5, target: 8, unit: 'hours', streak: 5 },
    { id: 'exercise', name: 'Exercise', icon: <Flame size={20} />, current: 35, target: 30, unit: 'min', streak: 14 }
]

// Points/Rewards
interface Reward {
    id: string
    name: string
    points: number
    image?: string
}

export function WellnessHub() {
    const [totalPoints] = useState(2450)
    const [level] = useState(12)
    const [nextLevelPoints] = useState(3000)

    return (
        <div className="wellness-hub">
            {/* Hero Stats */}
            <GlassCard className="wellness-hero">
                <div className="wellness-hero__content">
                    <div className="wellness-level">
                        <div className="level-badge">
                            <Star size={24} />
                            <span className="level-number">{level}</span>
                        </div>
                        <div className="level-info">
                            <h2>Wellness Champion</h2>
                            <div className="level-progress-container">
                                <div className="level-progress">
                                    <motion.div
                                        className="level-progress__fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(totalPoints / nextLevelPoints) * 100}%` }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                                <span className="level-progress__text">
                                    {totalPoints} / {nextLevelPoints} XP to Level {level + 1}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="wellness-points">
                        <Trophy size={24} />
                        <div>
                            <span className="points-value">{totalPoints.toLocaleString()}</span>
                            <span className="points-label">Wellness Points</span>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Daily Goals */}
            <div className="wellness-section">
                <div className="section-header">
                    <h3><Target size={20} /> Daily Goals</h3>
                    <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="goals-grid">
                    {dailyGoals.map((goal, index) => {
                        const progress = Math.min((goal.current / goal.target) * 100, 100)
                        const completed = goal.current >= goal.target

                        return (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <GlassCard className={`goal-card ${completed ? 'completed' : ''}`}>
                                    <div className="goal-card__header">
                                        <div className="goal-icon">{goal.icon}</div>
                                        {goal.streak > 0 && (
                                            <div className="streak-badge">
                                                <Flame size={12} />
                                                {goal.streak}
                                            </div>
                                        )}
                                    </div>
                                    <div className="goal-card__content">
                                        <span className="goal-name">{goal.name}</span>
                                        <div className="goal-values">
                                            <span className="goal-current">{goal.current.toLocaleString()}</span>
                                            <span className="goal-target">/ {goal.target.toLocaleString()} {goal.unit}</span>
                                        </div>
                                    </div>
                                    <div className="goal-progress">
                                        <motion.div
                                            className="goal-progress__fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                        />
                                    </div>
                                    {completed && (
                                        <div className="goal-complete-badge">✓</div>
                                    )}
                                </GlassCard>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Challenges */}
            <div className="wellness-section">
                <div className="section-header">
                    <h3><Zap size={20} /> Active Challenges</h3>
                    <Button variant="ghost" size="sm">Browse Challenges</Button>
                </div>
                <div className="challenges-list">
                    <GlassCard className="challenge-card">
                        <div className="challenge-icon">
                            <Footprints size={24} />
                        </div>
                        <div className="challenge-content">
                            <h4>30-Day Step Challenge</h4>
                            <p>Walk 10,000 steps daily for 30 days</p>
                            <div className="challenge-progress">
                                <div className="challenge-progress__bar">
                                    <motion.div
                                        className="challenge-progress__fill"
                                        style={{ width: '60%' }}
                                    />
                                </div>
                                <span>18/30 days</span>
                            </div>
                        </div>
                        <div className="challenge-reward">
                            <Gift size={16} />
                            <span>500 pts</span>
                        </div>
                    </GlassCard>

                    <GlassCard className="challenge-card">
                        <div className="challenge-icon challenge-icon--sleep">
                            <Moon size={24} />
                        </div>
                        <div className="challenge-content">
                            <h4>Sleep Week</h4>
                            <p>Get 8+ hours of sleep for 7 nights</p>
                            <div className="challenge-progress">
                                <div className="challenge-progress__bar">
                                    <motion.div
                                        className="challenge-progress__fill challenge-progress__fill--sleep"
                                        style={{ width: '42%' }}
                                    />
                                </div>
                                <span>3/7 nights</span>
                            </div>
                        </div>
                        <div className="challenge-reward">
                            <Gift size={16} />
                            <span>250 pts</span>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Rewards Preview */}
            <div className="wellness-section">
                <div className="section-header">
                    <h3><Award size={20} /> Rewards</h3>
                    <Button variant="ghost" size="sm">Rewards Shop</Button>
                </div>
                <GlassCard className="rewards-preview">
                    <div className="rewards-preview__content">
                        <span className="rewards-available">You have {totalPoints} points to redeem</span>
                        <div className="featured-rewards">
                            <div className="reward-item">
                                <div className="reward-image">🎧</div>
                                <span className="reward-name">Premium Headphones</span>
                                <span className="reward-points">5,000 pts</span>
                            </div>
                            <div className="reward-item">
                                <div className="reward-image">💪</div>
                                <span className="reward-name">Gym Membership</span>
                                <span className="reward-points">3,000 pts</span>
                            </div>
                            <div className="reward-item">
                                <div className="reward-image">🧘</div>
                                <span className="reward-name">Wellness Retreat</span>
                                <span className="reward-points">10,000 pts</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="primary" icon={<ChevronRight size={16} />}>
                        Browse All Rewards
                    </Button>
                </GlassCard>
            </div>
        </div>
    )
}

export default WellnessHub
