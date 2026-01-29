import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import './MetricCard.css'

export interface MetricCardProps {
    title: string
    value: string | number
    subtitle?: string
    trend?: {
        value: number
        direction: 'up' | 'down' | 'neutral'
    }
    change?: {
        value: number
        type: 'increase' | 'decrease' | 'neutral'
    }
    icon?: ReactNode
    variant?: 'default' | 'success' | 'warning' | 'critical' | 'teal'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function MetricCard({
    title,
    value,
    subtitle,
    trend,
    change,
    icon,
    variant = 'default',
    size = 'md',
    className = ''
}: MetricCardProps) {
    const baseClass = 'metric-card'
    const variantClass = `metric-card--${variant}`
    const sizeClass = `metric-card--${size}`

    const classes = [baseClass, variantClass, sizeClass, className]
        .filter(Boolean)
        .join(' ')

    // Normalize change to trend format
    const effectiveTrend = trend || (change ? {
        value: change.value,
        direction: change.type === 'increase' ? 'up' as const : change.type === 'decrease' ? 'down' as const : 'neutral' as const
    } : undefined)

    const getTrendIcon = () => {
        if (!effectiveTrend) return null
        switch (effectiveTrend.direction) {
            case 'up': return <TrendingUp size={14} />
            case 'down': return <TrendingDown size={14} />
            default: return <Minus size={14} />
        }
    }

    return (
        <motion.div
            className={classes}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="metric-card__header">
                <span className="metric-card__title">{title}</span>
                {icon && <span className="metric-card__icon">{icon}</span>}
            </div>

            <div className="metric-card__body">
                <span className="metric-card__value">{value}</span>

                {effectiveTrend && (
                    <span className={`metric-card__trend metric-card__trend--${effectiveTrend.direction}`}>
                        {getTrendIcon()}
                        <span>{Math.abs(effectiveTrend.value)}%</span>
                    </span>
                )}
            </div>

            {subtitle && (
                <div className="metric-card__footer">
                    <span className="metric-card__subtitle">{subtitle}</span>
                </div>
            )}
        </motion.div>
    )
}

export default MetricCard
