import { useState, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import {
    Heart,
    Activity,
    Brain,
    Moon,
    Footprints,
    Apple,
    TrendingUp,
    TrendingDown,
    Minus,
    Sparkles,
    ChevronRight,
    Info
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './HealthScoreWidget.css'

// Health metrics data
interface HealthMetric {
    id: string
    name: string
    icon: React.ReactNode
    score: number
    maxScore: number
    trend: 'up' | 'down' | 'stable'
    change: number
    description: string
    color: string
}

const healthMetrics: HealthMetric[] = [
    {
        id: 'cardio',
        name: 'Cardiovascular',
        icon: <Heart size={20} />,
        score: 85,
        maxScore: 100,
        trend: 'up',
        change: 5,
        description: 'Heart rate, blood pressure, cholesterol',
        color: '#ef4444'
    },
    {
        id: 'activity',
        name: 'Physical Activity',
        icon: <Footprints size={20} />,
        score: 72,
        maxScore: 100,
        trend: 'up',
        change: 8,
        description: 'Steps, exercise minutes, active days',
        color: '#22c55e'
    },
    {
        id: 'sleep',
        name: 'Sleep Quality',
        icon: <Moon size={20} />,
        score: 68,
        maxScore: 100,
        trend: 'stable',
        change: 0,
        description: 'Duration, consistency, deep sleep',
        color: '#8b5cf6'
    },
    {
        id: 'nutrition',
        name: 'Nutrition',
        icon: <Apple size={20} />,
        score: 78,
        maxScore: 100,
        trend: 'down',
        change: -3,
        description: 'Diet balance, hydration, nutrients',
        color: '#f59e0b'
    },
    {
        id: 'mental',
        name: 'Mental Wellness',
        icon: <Brain size={20} />,
        score: 82,
        maxScore: 100,
        trend: 'up',
        change: 4,
        description: 'Stress levels, mood, mindfulness',
        color: '#06b6d4'
    }
]

// AI Recommendations
interface Recommendation {
    id: string
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    category: string
    impact: string
}

const recommendations: Recommendation[] = [
    {
        id: 'rec-1',
        title: 'Increase daily steps by 2,000',
        description: 'Based on your activity patterns, adding a 15-minute walk after lunch could significantly improve your cardiovascular health.',
        priority: 'high',
        category: 'Physical Activity',
        impact: '+5 Health Score'
    },
    {
        id: 'rec-2',
        title: 'Improve sleep consistency',
        description: 'Your sleep schedule varies by 2+ hours. Try setting a consistent bedtime to improve sleep quality.',
        priority: 'medium',
        category: 'Sleep Quality',
        impact: '+3 Health Score'
    },
    {
        id: 'rec-3',
        title: 'Schedule preventive screening',
        description: 'You\'re due for an annual wellness check. Early detection can prevent 90% of common health issues.',
        priority: 'high',
        category: 'Preventive Care',
        impact: 'Risk Reduction'
    }
]

export function HealthScoreWidget() {
    const [overallScore, setOverallScore] = useState(0)
    const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null)
    const [showRecommendations, setShowRecommendations] = useState(false)
    const controls = useAnimation()

    // Calculate overall score
    const calculatedScore = Math.round(
        healthMetrics.reduce((sum, m) => sum + m.score, 0) / healthMetrics.length
    )

    // Animate score on mount
    useEffect(() => {
        const animateScore = async () => {
            for (let i = 0; i <= calculatedScore; i += 2) {
                setOverallScore(Math.min(i, calculatedScore))
                await new Promise(r => setTimeout(r, 20))
            }
            setOverallScore(calculatedScore)
        }
        animateScore()
    }, [calculatedScore])

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp size={14} />
            case 'down': return <TrendingDown size={14} />
            default: return <Minus size={14} />
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10b981'
        if (score >= 60) return '#f59e0b'
        return '#ef4444'
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'critical'
            case 'medium': return 'warning'
            default: return 'info'
        }
    }

    return (
        <div className="health-score-widget">
            {/* Main Score Ring */}
            <div className="health-score-main">
                <div className="health-score-ring">
                    <svg viewBox="0 0 200 200" className="health-score-ring__svg">
                        {/* Background ring */}
                        <circle
                            cx="100"
                            cy="100"
                            r="85"
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="12"
                        />
                        {/* Score ring */}
                        <motion.circle
                            cx="100"
                            cy="100"
                            r="85"
                            fill="none"
                            stroke="url(#healthGradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray="534"
                            initial={{ strokeDashoffset: 534 }}
                            animate={{ strokeDashoffset: 534 - (overallScore / 100) * 534 }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            transform="rotate(-90 100 100)"
                        />
                        {/* Gradient definition */}
                        <defs>
                            <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#14b8a6" />
                                <stop offset="50%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#22c55e" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Score Display */}
                    <div className="health-score-ring__content">
                        <motion.span
                            className="health-score-ring__value"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                        >
                            {overallScore}
                        </motion.span>
                        <span className="health-score-ring__label">Health Score</span>
                        <Badge variant="success" size="sm" icon={<TrendingUp size={10} />}>
                            +6 this month
                        </Badge>
                    </div>
                </div>

                {/* Score Description */}
                <div className="health-score-info">
                    <h3>Great Progress!</h3>
                    <p>Your health score is above average. Keep up the good work with your exercise routine.</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<Sparkles size={14} />}
                        onClick={() => setShowRecommendations(!showRecommendations)}
                    >
                        AI Recommendations
                    </Button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="health-metrics-grid">
                {healthMetrics.map((metric, index) => (
                    <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        onClick={() => setSelectedMetric(selectedMetric?.id === metric.id ? null : metric)}
                    >
                        <GlassCard className={`health-metric-card ${selectedMetric?.id === metric.id ? 'selected' : ''}`}>
                            <div className="health-metric-card__icon" style={{ backgroundColor: `${metric.color}20`, color: metric.color }}>
                                {metric.icon}
                            </div>
                            <div className="health-metric-card__content">
                                <span className="health-metric-card__name">{metric.name}</span>
                                <div className="health-metric-card__score">
                                    <span style={{ color: getScoreColor(metric.score) }}>{metric.score}</span>
                                    <span className="health-metric-card__max">/{metric.maxScore}</span>
                                </div>
                            </div>
                            <div className={`health-metric-card__trend health-metric-card__trend--${metric.trend}`}>
                                {getTrendIcon(metric.trend)}
                                <span>{metric.change > 0 ? '+' : ''}{metric.change}</span>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Selected Metric Detail */}
            {selectedMetric && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="health-metric-detail"
                >
                    <GlassCard>
                        <div className="health-metric-detail__header">
                            <div className="health-metric-detail__icon" style={{ backgroundColor: `${selectedMetric.color}20`, color: selectedMetric.color }}>
                                {selectedMetric.icon}
                            </div>
                            <div>
                                <h4>{selectedMetric.name}</h4>
                                <p>{selectedMetric.description}</p>
                            </div>
                        </div>
                        <div className="health-metric-detail__progress">
                            <div className="health-metric-detail__bar">
                                <motion.div
                                    className="health-metric-detail__fill"
                                    style={{ backgroundColor: selectedMetric.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${selectedMetric.score}%` }}
                                    transition={{ duration: 0.8 }}
                                />
                            </div>
                            <span className="health-metric-detail__score">{selectedMetric.score}/100</span>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* AI Recommendations Panel */}
            {showRecommendations && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="health-recommendations"
                >
                    <div className="health-recommendations__header">
                        <Sparkles size={18} />
                        <h3>AI-Powered Insights</h3>
                    </div>
                    <div className="health-recommendations__list">
                        {recommendations.map((rec, index) => (
                            <motion.div
                                key={rec.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="health-recommendation"
                            >
                                <div className="health-recommendation__header">
                                    <Badge variant={getPriorityColor(rec.priority) as any} size="sm">
                                        {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                                    </Badge>
                                    <span className="health-recommendation__category">{rec.category}</span>
                                </div>
                                <h4 className="health-recommendation__title">{rec.title}</h4>
                                <p className="health-recommendation__description">{rec.description}</p>
                                <div className="health-recommendation__footer">
                                    <span className="health-recommendation__impact">
                                        <TrendingUp size={14} />
                                        {rec.impact}
                                    </span>
                                    <Button variant="ghost" size="sm" icon={<ChevronRight size={14} />}>
                                        Take Action
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    )
}

export default HealthScoreWidget
