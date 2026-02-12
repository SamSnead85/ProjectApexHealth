import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import './PremiumMetricCard.css'

export type CardVariant = 'teal' | 'purple' | 'amber' | 'rose' | 'emerald'
export type TrendDirection = 'up' | 'down' | 'neutral'

interface PremiumMetricCardProps {
    value: string | number
    label: string
    icon?: React.ReactNode
    trend?: {
        direction: TrendDirection
        value: string
    }
    variant?: CardVariant
    sparklineData?: number[]
    compact?: boolean
    loading?: boolean
    animate?: boolean
    className?: string
    onClick?: () => void
}

export function PremiumMetricCard({
    value,
    label,
    icon,
    trend,
    variant = 'teal',
    sparklineData,
    compact = false,
    loading = false,
    animate = true,
    className = '',
    onClick
}: PremiumMetricCardProps) {
    const [displayValue, setDisplayValue] = useState(animate ? '0' : String(value))

    // Animate number counting up
    useEffect(() => {
        if (!animate || loading) return

        const numericValue = typeof value === 'string'
            ? parseFloat(value.replace(/[^0-9.-]/g, ''))
            : value

        if (isNaN(numericValue)) {
            setDisplayValue(String(value))
            return
        }

        const prefix = typeof value === 'string' ? value.match(/^[^0-9-]*/)?.[0] || '' : ''
        const suffix = typeof value === 'string' ? value.match(/[^0-9.]*$/)?.[0] || '' : ''
        const decimals = String(value).includes('.') ? String(value).split('.')[1]?.replace(/[^0-9]/g, '').length || 0 : 0

        let start = 0
        const duration = 1000
        const startTime = performance.now()

        const animateCount = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // Ease out cubic

            const current = start + (numericValue - start) * eased
            setDisplayValue(`${prefix}${current.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            })}${suffix}`)

            if (progress < 1) {
                requestAnimationFrame(animateCount)
            }
        }

        requestAnimationFrame(animateCount)
    }, [value, animate, loading])

    const TrendIcon = trend?.direction === 'up'
        ? TrendingUp
        : trend?.direction === 'down'
            ? TrendingDown
            : Minus

    const cardClasses = [
        'premium-metric-card',
        `premium-metric-card--${variant}`,
        compact && 'premium-metric-card--compact',
        loading && 'premium-metric-card--loading',
        className
    ].filter(Boolean).join(' ')

    // Generate sparkline path
    const generateSparklinePath = (data: number[]) => {
        if (!data || data.length < 2) return { linePath: '', areaPath: '' }

        const height = 40
        const width = 200
        const padding = 2
        const max = Math.max(...data)
        const min = Math.min(...data)
        const range = max - min || 1

        const points = data.map((val, i) => ({
            x: padding + (i / (data.length - 1)) * (width - padding * 2),
            y: padding + ((max - val) / range) * (height - padding * 2)
        }))

        const linePath = points.reduce((path, point, i) => {
            return path + (i === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`)
        }, '')

        const areaPath = linePath +
            ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

        return { linePath, areaPath }
    }

    const sparkline = sparklineData ? generateSparklinePath(sparklineData) : null

    return (
        <motion.div
            className={cardClasses}
            onClick={onClick}
            whileHover={onClick ? { scale: 1.02 } : undefined}
            whileTap={onClick ? { scale: 0.98 } : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div className="premium-metric-card__header">
                {icon && (
                    <div className="premium-metric-card__icon">
                        {icon}
                    </div>
                )}
                {trend && (
                    <div className={`premium-metric-card__trend premium-metric-card__trend--${trend.direction}`}>
                        <TrendIcon size={14} />
                        <span>{trend.value}</span>
                    </div>
                )}
            </div>

            <div className="premium-metric-card__content">
                <div className="premium-metric-card__value">
                    {loading ? '---' : displayValue}
                </div>
                <div className="premium-metric-card__label">
                    {loading ? 'Loading...' : label}
                </div>
            </div>

            {sparkline && !loading && (
                <div className="premium-metric-card__sparkline">
                    <svg viewBox="0 0 200 40" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id={`sparkline-gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                                <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
                            </linearGradient>
                            <linearGradient id={`sparkline-area-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                            </linearGradient>
                        </defs>
                        <path
                            className="premium-metric-card__sparkline-area"
                            d={sparkline.areaPath}
                            fill={`url(#sparkline-area-${variant})`}
                        />
                        <path
                            className="premium-metric-card__sparkline-path"
                            d={sparkline.linePath}
                            stroke={`url(#sparkline-gradient-${variant})`}
                        />
                    </svg>
                </div>
            )}
        </motion.div>
    )
}

export default PremiumMetricCard
