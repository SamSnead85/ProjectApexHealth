import { ReactNode, useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Flame, Footprints, Heart, Timer, Target, TrendingUp, Trophy, Medal, Dumbbell, Bike, Waves, Mountain, Play, Pause, RotateCcw, Check, ChevronRight, Calendar, Clock, Users } from 'lucide-react'
import './SportsAndFitnessComponents.css'

// Workout Summary Card
interface WorkoutSummary { type: string; duration: number; caloriesBurned: number; heartRateAvg?: number; heartRateMax?: number; date: Date }

interface WorkoutSummaryCardProps { workout: WorkoutSummary; onClick?: () => void; className?: string }

export function WorkoutSummaryCard({ workout, onClick, className = '' }: WorkoutSummaryCardProps) {
    const formatDuration = (mins: number) => `${Math.floor(mins / 60)}h ${mins % 60}m`

    const typeIcons: Record<string, ReactNode> = {
        running: <Footprints size={20} />,
        cycling: <Bike size={20} />,
        swimming: <Waves size={20} />,
        hiking: <Mountain size={20} />,
        strength: <Dumbbell size={20} />,
        default: <Activity size={20} />
    }

    return (
        <div className={`workout-summary-card ${className}`} onClick={onClick}>
            <div className="workout-summary-card__icon">{typeIcons[workout.type.toLowerCase()] || typeIcons.default}</div>
            <div className="workout-summary-card__content">
                <span className="workout-summary-card__type">{workout.type}</span>
                <span className="workout-summary-card__date">{workout.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="workout-summary-card__stats">
                <div className="workout-summary-card__stat"><Timer size={14} /> {formatDuration(workout.duration)}</div>
                <div className="workout-summary-card__stat"><Flame size={14} /> {workout.caloriesBurned} cal</div>
                {workout.heartRateAvg && <div className="workout-summary-card__stat"><Heart size={14} /> {workout.heartRateAvg} bpm</div>}
            </div>
            <ChevronRight size={18} className="workout-summary-card__arrow" />
        </div>
    )
}

// Exercise Timer
interface ExerciseTimerProps { initialTime: number; type?: 'countdown' | 'stopwatch'; autoStart?: boolean; onComplete?: () => void; className?: string }

export function ExerciseTimer({ initialTime, type = 'countdown', autoStart = false, onComplete, className = '' }: ExerciseTimerProps) {
    const [time, setTime] = useState(type === 'countdown' ? initialTime : 0)
    const [isRunning, setIsRunning] = useState(autoStart)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isRunning) {
            interval = setInterval(() => {
                setTime(t => {
                    if (type === 'countdown') {
                        if (t <= 1) { setIsRunning(false); onComplete?.(); return 0 }
                        return t - 1
                    }
                    return t + 1
                })
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isRunning, type, onComplete])

    const formatTime = (s: number) => {
        const h = Math.floor(s / 3600)
        const m = Math.floor((s % 3600) / 60)
        const sec = s % 60
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }

    const progress = type === 'countdown' ? ((initialTime - time) / initialTime) * 100 : 0

    const reset = () => { setTime(type === 'countdown' ? initialTime : 0); setIsRunning(false) }

    return (
        <div className={`exercise-timer ${className}`}>
            <div className="exercise-timer__display">
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" className="exercise-timer__bg" />
                    {type === 'countdown' && (
                        <circle cx="50" cy="50" r="45" className="exercise-timer__progress"
                            style={{ strokeDasharray: `${progress * 2.83} 283` }} />
                    )}
                </svg>
                <span className="exercise-timer__time">{formatTime(time)}</span>
            </div>
            <div className="exercise-timer__controls">
                <button onClick={() => setIsRunning(!isRunning)}>
                    {isRunning ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button onClick={reset}><RotateCcw size={20} /></button>
            </div>
        </div>
    )
}

// Activity Ring
interface ActivityRingProps { label: string; value: number; goal: number; color: string; icon?: ReactNode; className?: string }

export function ActivityRing({ label, value, goal, color, icon, className = '' }: ActivityRingProps) {
    const percentage = Math.min(100, (value / goal) * 100)
    const circumference = 2 * Math.PI * 40

    return (
        <div className={`activity-ring ${className}`}>
            <div className="activity-ring__circle">
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="activity-ring__bg" />
                    <circle cx="50" cy="50" r="40" className="activity-ring__progress"
                        style={{ stroke: color, strokeDasharray: `${(percentage / 100) * circumference} ${circumference}` }} />
                </svg>
                <div className="activity-ring__icon" style={{ color }}>{icon}</div>
            </div>
            <div className="activity-ring__info">
                <span className="activity-ring__label">{label}</span>
                <span className="activity-ring__value" style={{ color }}>{value}<small>/{goal}</small></span>
            </div>
        </div>
    )
}

// Leaderboard Entry
interface LeaderboardEntry { rank: number; name: string; avatar?: string; value: number; unit: string; isCurrentUser?: boolean; change?: 'up' | 'down' | 'same' }

interface LeaderboardListProps { entries: LeaderboardEntry[]; title?: string; className?: string }

export function LeaderboardList({ entries, title, className = '' }: LeaderboardListProps) {
    return (
        <div className={`leaderboard-list ${className}`}>
            {title && <h4 className="leaderboard-list__title">{title}</h4>}
            <div className="leaderboard-list__entries">
                {entries.map(entry => (
                    <div key={entry.rank} className={`leaderboard-list__entry ${entry.isCurrentUser ? 'current-user' : ''}`}>
                        <span className={`leaderboard-list__rank ${entry.rank <= 3 ? `top-${entry.rank}` : ''}`}>
                            {entry.rank <= 3 ? <Medal size={16} /> : entry.rank}
                        </span>
                        <div className="leaderboard-list__avatar">{entry.avatar ? <img src={entry.avatar} alt="" /> : entry.name.charAt(0)}</div>
                        <span className="leaderboard-list__name">{entry.name}</span>
                        <span className="leaderboard-list__value">{entry.value.toLocaleString()} {entry.unit}</span>
                        {entry.change && entry.change !== 'same' && (
                            <span className={`leaderboard-list__change leaderboard-list__change--${entry.change}`}>
                                <TrendingUp size={12} />
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Challenge Card
interface Challenge { id: string; title: string; description: string; goal: number; current: number; unit: string; endDate: Date; participants: number; reward?: string }

interface ChallengeCardProps { challenge: Challenge; onJoin?: () => void; isJoined?: boolean; className?: string }

export function ChallengeCard({ challenge, onJoin, isJoined = false, className = '' }: ChallengeCardProps) {
    const progress = (challenge.current / challenge.goal) * 100
    const daysLeft = Math.ceil((challenge.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    return (
        <div className={`challenge-card ${className}`}>
            <div className="challenge-card__header">
                <Trophy size={24} className="challenge-card__icon" />
                <div className="challenge-card__meta">
                    <span className="challenge-card__days">{daysLeft} days left</span>
                    <span className="challenge-card__participants"><Users size={12} /> {challenge.participants}</span>
                </div>
            </div>
            <h4 className="challenge-card__title">{challenge.title}</h4>
            <p className="challenge-card__description">{challenge.description}</p>
            <div className="challenge-card__progress">
                <div className="challenge-card__progress-bar" style={{ width: `${progress}%` }} />
                <span>{challenge.current.toLocaleString()} / {challenge.goal.toLocaleString()} {challenge.unit}</span>
            </div>
            {challenge.reward && <div className="challenge-card__reward">🏆 {challenge.reward}</div>}
            <button className={`challenge-card__action ${isJoined ? 'joined' : ''}`} onClick={onJoin}>
                {isJoined ? <><Check size={16} /> Joined</> : 'Join Challenge'}
            </button>
        </div>
    )
}

// Fitness Class Card
interface FitnessClass { id: string; name: string; instructor: string; instructorPhoto?: string; time: string; duration: number; level: 'beginner' | 'intermediate' | 'advanced'; type: string; spotsLeft: number; totalSpots: number }

interface FitnessClassCardProps { fitnessClass: FitnessClass; onBook?: () => void; className?: string }

export function FitnessClassCard({ fitnessClass, onBook, className = '' }: FitnessClassCardProps) {
    const levelColors = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' }

    return (
        <div className={`fitness-class-card ${className}`}>
            <div className="fitness-class-card__header">
                <span className="fitness-class-card__type">{fitnessClass.type}</span>
                <span className="fitness-class-card__level" style={{ background: `${levelColors[fitnessClass.level]}20`, color: levelColors[fitnessClass.level] }}>
                    {fitnessClass.level}
                </span>
            </div>
            <h4 className="fitness-class-card__name">{fitnessClass.name}</h4>
            <div className="fitness-class-card__instructor">
                <div className="fitness-class-card__instructor-photo">
                    {fitnessClass.instructorPhoto ? <img src={fitnessClass.instructorPhoto} alt="" /> : fitnessClass.instructor.charAt(0)}
                </div>
                <span>{fitnessClass.instructor}</span>
            </div>
            <div className="fitness-class-card__details">
                <span><Clock size={14} /> {fitnessClass.time}</span>
                <span><Timer size={14} /> {fitnessClass.duration} min</span>
            </div>
            <div className="fitness-class-card__footer">
                <span className={`fitness-class-card__spots ${fitnessClass.spotsLeft <= 3 ? 'low' : ''}`}>
                    {fitnessClass.spotsLeft} spots left
                </span>
                <button onClick={onBook} disabled={fitnessClass.spotsLeft === 0}>
                    {fitnessClass.spotsLeft === 0 ? 'Full' : 'Book'}
                </button>
            </div>
        </div>
    )
}

export default { WorkoutSummaryCard, ExerciseTimer, ActivityRing, LeaderboardList, ChallengeCard, FitnessClassCard }
