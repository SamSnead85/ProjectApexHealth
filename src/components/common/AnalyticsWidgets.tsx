import { ReactNode, useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus, BarChart2, PieChart, Activity, Target, Zap, Users, DollarSign, Clock, Calendar, Eye, MousePointer, ShoppingCart, Heart } from 'lucide-react'
import './AnalyticsWidgets.css'

// KPI Card
interface KPICardProps {
    title: string
    value: string | number
    change?: number
    changeLabel?: string
    icon?: ReactNode
    trend?: 'up' | 'down' | 'neutral'
    format?: 'number' | 'currency' | 'percentage'
    sparkline?: number[]
    className?: string
}

export function KPICard({
    title,
    value,
    change,
    changeLabel = 'vs last period',
    icon,
    trend,
    format = 'number',
    sparkline,
    className = ''
}: KPICardProps) {
    const formatValue = (val: string | number) => {
        if (typeof val === 'string') return val
        switch (format) {
            case 'currency': return `$${val.toLocaleString()}`
            case 'percentage': return `${val}%`
            default: return val.toLocaleString()
        }
    }

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
    const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : 'var(--apex-steel)'

    return (
        <div className={`kpi-card ${className}`}>
            <div className="kpi-card__header">
                <span className="kpi-card__title">{title}</span>
                {icon && <div className="kpi-card__icon">{icon}</div>}
            </div>

            <div className="kpi-card__value">{formatValue(value)}</div>

            {change !== undefined && (
                <div className="kpi-card__change" style={{ color: trendColor }}>
                    <TrendIcon size={14} />
                    <span>{change > 0 ? '+' : ''}{change}%</span>
                    <span className="kpi-card__change-label">{changeLabel}</span>
                </div>
            )}

            {sparkline && sparkline.length > 0 && (
                <div className="kpi-card__sparkline">
                    <svg viewBox={`0 0 ${sparkline.length * 10} 30`} preserveAspectRatio="none">
                        <polyline
                            fill="none"
                            stroke={trendColor}
                            strokeWidth="2"
                            points={sparkline.map((v, i) => {
                                const max = Math.max(...sparkline)
                                const min = Math.min(...sparkline)
                                const y = 30 - ((v - min) / (max - min || 1)) * 28
                                return `${i * 10},${y}`
                            }).join(' ')}
                        />
                    </svg>
                </div>
            )}
        </div>
    )
}

// Metric Comparison
interface MetricComparisonProps {
    title: string
    current: number
    previous: number
    target?: number
    format?: 'number' | 'currency' | 'percentage'
    className?: string
}

export function MetricComparison({
    title,
    current,
    previous,
    target,
    format = 'number',
    className = ''
}: MetricComparisonProps) {
    const change = ((current - previous) / previous) * 100
    const targetProgress = target ? (current / target) * 100 : undefined

    const formatValue = (val: number) => {
        switch (format) {
            case 'currency': return `$${val.toLocaleString()}`
            case 'percentage': return `${val}%`
            default: return val.toLocaleString()
        }
    }

    return (
        <div className={`metric-comparison ${className}`}>
            <div className="metric-comparison__header">
                <h4>{title}</h4>
                {target && (
                    <span className="metric-comparison__target">
                        Target: {formatValue(target)}
                    </span>
                )}
            </div>

            <div className="metric-comparison__values">
                <div className="metric-comparison__current">
                    <span className="metric-comparison__label">Current</span>
                    <span className="metric-comparison__value">{formatValue(current)}</span>
                </div>
                <div className="metric-comparison__vs">
                    {change >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    <span className={change >= 0 ? 'positive' : 'negative'}>
                        {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                    </span>
                </div>
                <div className="metric-comparison__previous">
                    <span className="metric-comparison__label">Previous</span>
                    <span className="metric-comparison__value">{formatValue(previous)}</span>
                </div>
            </div>

            {targetProgress !== undefined && (
                <div className="metric-comparison__progress">
                    <div className="metric-comparison__progress-bar">
                        <motion.div
                            className="metric-comparison__progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, targetProgress)}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                    <span>{targetProgress.toFixed(0)}% of target</span>
                </div>
            )}
        </div>
    )
}

// Goal Tracker
interface Goal {
    id: string
    name: string
    current: number
    target: number
    unit?: string
    color?: string
}

interface GoalTrackerProps {
    goals: Goal[]
    className?: string
}

export function GoalTracker({ goals, className = '' }: GoalTrackerProps) {
    return (
        <div className={`goal-tracker ${className}`}>
            <h4 className="goal-tracker__title">
                <Target size={18} /> Goals
            </h4>
            <div className="goal-tracker__list">
                {goals.map(goal => {
                    const progress = (goal.current / goal.target) * 100
                    const isComplete = progress >= 100

                    return (
                        <div
                            key={goal.id}
                            className={`goal-tracker__item ${isComplete ? 'goal-tracker__item--complete' : ''}`}
                        >
                            <div className="goal-tracker__item-header">
                                <span className="goal-tracker__item-name">{goal.name}</span>
                                <span className="goal-tracker__item-values">
                                    {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                                </span>
                            </div>
                            <div className="goal-tracker__item-bar">
                                <motion.div
                                    className="goal-tracker__item-fill"
                                    style={{ backgroundColor: goal.color || 'var(--apex-teal)' }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, progress)}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                            </div>
                            <span className="goal-tracker__item-progress">
                                {isComplete ? '✓ Complete' : `${progress.toFixed(0)}%`}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Funnel Chart
interface FunnelStage {
    name: string
    value: number
    color?: string
}

interface FunnelChartProps {
    stages: FunnelStage[]
    showPercentages?: boolean
    className?: string
}

export function FunnelChart({ stages, showPercentages = true, className = '' }: FunnelChartProps) {
    const maxValue = stages[0]?.value || 1

    return (
        <div className={`funnel-chart ${className}`}>
            {stages.map((stage, i) => {
                const width = (stage.value / maxValue) * 100
                const conversionRate = i > 0 ? (stage.value / stages[i - 1].value) * 100 : 100

                return (
                    <div key={i} className="funnel-chart__stage">
                        <div className="funnel-chart__bar" style={{ width: `${width}%` }}>
                            <motion.div
                                className="funnel-chart__fill"
                                style={{ backgroundColor: stage.color || `hsl(${180 + i * 20}, 70%, 50%)` }}
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            />
                        </div>
                        <div className="funnel-chart__info">
                            <span className="funnel-chart__name">{stage.name}</span>
                            <span className="funnel-chart__value">{stage.value.toLocaleString()}</span>
                            {showPercentages && i > 0 && (
                                <span className="funnel-chart__rate">{conversionRate.toFixed(1)}%</span>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// Live Counter
interface LiveCounterProps {
    value: number
    label: string
    icon?: ReactNode
    pulseColor?: string
    className?: string
}

export function LiveCounter({ value, label, icon, pulseColor = '#10b981', className = '' }: LiveCounterProps) {
    const [displayValue, setDisplayValue] = useState(value)

    useEffect(() => {
        const duration = 1000
        const start = displayValue
        const diff = value - start
        const startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplayValue(Math.round(start + diff * eased))

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        animate()
    }, [value])

    return (
        <div className={`live-counter ${className}`}>
            <div className="live-counter__pulse" style={{ '--pulse-color': pulseColor } as React.CSSProperties} />
            <div className="live-counter__content">
                {icon && <div className="live-counter__icon">{icon}</div>}
                <span className="live-counter__value">{displayValue.toLocaleString()}</span>
                <span className="live-counter__label">{label}</span>
            </div>
        </div>
    )
}

// Mini Stat
interface MiniStatProps {
    label: string
    value: string | number
    subValue?: string
    icon?: ReactNode
    className?: string
}

export function MiniStat({ label, value, subValue, icon, className = '' }: MiniStatProps) {
    return (
        <div className={`mini-stat ${className}`}>
            {icon && <div className="mini-stat__icon">{icon}</div>}
            <div className="mini-stat__content">
                <span className="mini-stat__value">{value}</span>
                <span className="mini-stat__label">{label}</span>
                {subValue && <span className="mini-stat__sub">{subValue}</span>}
            </div>
        </div>
    )
}

export default { KPICard, MetricComparison, GoalTracker, FunnelChart, LiveCounter, MiniStat }
