import { ReactNode, useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, Trophy, Heart, Star, Zap, Clock, Users, ChevronUp, ChevronDown, Play, Pause, RotateCcw, Award, Target, Flame, Crown, Medal } from 'lucide-react'
import './GameComponents.css'

// Game Score Display
interface GameScoreProps { score: number; label?: string; animated?: boolean; prefix?: string; suffix?: string; className?: string }

export function GameScore({ score, label, animated = true, prefix, suffix, className = '' }: GameScoreProps) {
    const [displayScore, setDisplayScore] = useState(0)

    useEffect(() => {
        if (animated) {
            const duration = 500
            const steps = 20
            const increment = (score - displayScore) / steps
            let current = displayScore
            const interval = setInterval(() => {
                current += increment
                if ((increment > 0 && current >= score) || (increment < 0 && current <= score)) {
                    setDisplayScore(score)
                    clearInterval(interval)
                } else {
                    setDisplayScore(Math.floor(current))
                }
            }, duration / steps)
            return () => clearInterval(interval)
        } else {
            setDisplayScore(score)
        }
    }, [score])

    return (
        <div className={`game-score ${className}`}>
            {label && <span className="game-score__label">{label}</span>}
            <span className="game-score__value">{prefix}{displayScore.toLocaleString()}{suffix}</span>
        </div>
    )
}

// Health Bar
interface HealthBarProps { current: number; max: number; label?: string; showText?: boolean; variant?: 'health' | 'mana' | 'energy' | 'shield'; className?: string }

export function HealthBar({ current, max, label, showText = true, variant = 'health', className = '' }: HealthBarProps) {
    const percentage = (current / max) * 100
    const colors = { health: '#ef4444', mana: '#3b82f6', energy: '#f59e0b', shield: '#06b6d4' }

    return (
        <div className={`health-bar ${className}`}>
            {label && <span className="health-bar__label">{label}</span>}
            <div className="health-bar__track">
                <motion.div className="health-bar__fill" initial={{ width: 0 }} animate={{ width: `${percentage}%` }}
                    style={{ background: colors[variant] }} />
            </div>
            {showText && <span className="health-bar__text">{current}/{max}</span>}
        </div>
    )
}

// XP Progress
interface XPProgressProps { current: number; required: number; level: number; className?: string }

export function XPProgress({ current, required, level, className = '' }: XPProgressProps) {
    const percentage = (current / required) * 100

    return (
        <div className={`xp-progress ${className}`}>
            <div className="xp-progress__level"><Star size={14} fill="currentColor" /> Level {level}</div>
            <div className="xp-progress__bar">
                <div className="xp-progress__fill" style={{ width: `${percentage}%` }} />
            </div>
            <span className="xp-progress__text">{current.toLocaleString()} / {required.toLocaleString()} XP</span>
        </div>
    )
}

// Game Stats Card
interface Stat { label: string; value: string | number; icon?: ReactNode; change?: number }

interface GameStatsCardProps { stats: Stat[]; title?: string; className?: string }

export function GameStatsCard({ stats, title, className = '' }: GameStatsCardProps) {
    return (
        <div className={`game-stats-card ${className}`}>
            {title && <h4 className="game-stats-card__title">{title}</h4>}
            <div className="game-stats-card__grid">
                {stats.map((stat, i) => (
                    <div key={i} className="game-stats-card__stat">
                        {stat.icon && <div className="game-stats-card__icon">{stat.icon}</div>}
                        <div className="game-stats-card__info">
                            <span className="game-stats-card__value">{stat.value}</span>
                            <span className="game-stats-card__label">{stat.label}</span>
                        </div>
                        {stat.change !== undefined && (
                            <span className={`game-stats-card__change ${stat.change >= 0 ? 'positive' : 'negative'}`}>
                                {stat.change >= 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                {Math.abs(stat.change)}%
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Achievement Popup
interface AchievementPopupProps { title: string; description: string; icon?: ReactNode; rarity?: 'common' | 'rare' | 'epic' | 'legendary'; onClose?: () => void; className?: string }

export function AchievementPopup({ title, description, icon, rarity = 'common', onClose, className = '' }: AchievementPopupProps) {
    const rarityColors = { common: 'var(--apex-steel)', rare: '#3b82f6', epic: '#8b5cf6', legendary: '#f59e0b' }

    useEffect(() => {
        const timer = setTimeout(() => onClose?.(), 5000)
        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <motion.div className={`achievement-popup achievement-popup--${rarity} ${className}`}
            initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            style={{ '--rarity-color': rarityColors[rarity] } as React.CSSProperties}>
            <div className="achievement-popup__icon">{icon || <Trophy size={24} />}</div>
            <div className="achievement-popup__content">
                <span className="achievement-popup__label">Achievement Unlocked!</span>
                <span className="achievement-popup__title">{title}</span>
                <span className="achievement-popup__description">{description}</span>
            </div>
        </motion.div>
    )
}

// Streak Counter
interface StreakCounterProps { count: number; label?: string; maxStreak?: number; className?: string }

export function StreakCounter({ count, label = 'Day Streak', maxStreak, className = '' }: StreakCounterProps) {
    return (
        <div className={`streak-counter ${className}`}>
            <div className="streak-counter__icon"><Flame size={24} /></div>
            <div className="streak-counter__content">
                <span className="streak-counter__count">{count}</span>
                <span className="streak-counter__label">{label}</span>
            </div>
            {maxStreak && <span className="streak-counter__max">Best: {maxStreak}</span>}
        </div>
    )
}

// Rank Badge
interface RankBadgeProps { rank: number; title: string; icon?: ReactNode; className?: string }

export function RankBadge({ rank, title, icon, className = '' }: RankBadgeProps) {
    const getIcon = () => {
        if (icon) return icon
        if (rank === 1) return <Crown size={20} />
        if (rank === 2) return <Medal size={20} />
        if (rank === 3) return <Award size={20} />
        return <Target size={20} />
    }

    return (
        <div className={`rank-badge rank-badge--${rank <= 3 ? rank : 'other'} ${className}`}>
            <div className="rank-badge__icon">{getIcon()}</div>
            <div className="rank-badge__info">
                <span className="rank-badge__rank">#{rank}</span>
                <span className="rank-badge__title">{title}</span>
            </div>
        </div>
    )
}

// Lives Display
interface LivesDisplayProps { lives: number; maxLives: number; icon?: ReactNode; className?: string }

export function LivesDisplay({ lives, maxLives, icon, className = '' }: LivesDisplayProps) {
    return (
        <div className={`lives-display ${className}`}>
            {Array.from({ length: maxLives }).map((_, i) => (
                <span key={i} className={`lives-display__heart ${i < lives ? 'filled' : 'empty'}`}>
                    {icon || <Heart size={20} fill={i < lives ? 'currentColor' : 'none'} />}
                </span>
            ))}
        </div>
    )
}

export default { GameScore, HealthBar, XPProgress, GameStatsCard, AchievementPopup, StreakCounter, RankBadge, LivesDisplay }
