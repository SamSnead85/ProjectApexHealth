import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    TrendingUp, TrendingDown, Minus, Info, ChevronDown,
    MoreHorizontal, Download, Filter, Calendar, Maximize2
} from 'lucide-react'
import './DataVizComponents.css'

// ============================================
// ANIMATED METRIC
// ============================================
interface AnimatedMetricProps {
    value: number
    prefix?: string
    suffix?: string
    decimals?: number
    duration?: number
    label: string
    sublabel?: string
    trend?: { value: number; period: string }
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function AnimatedMetric({
    value,
    prefix = '',
    suffix = '',
    decimals = 0,
    duration = 1.5,
    label,
    sublabel,
    trend,
    size = 'md'
}: AnimatedMetricProps) {
    const [displayValue, setDisplayValue] = useState(0)

    // Animate the number on mount (simplified - real version would use requestAnimationFrame)
    useState(() => {
        const steps = 60
        const increment = value / steps
        let current = 0
        const timer = setInterval(() => {
            current += increment
            if (current >= value) {
                setDisplayValue(value)
                clearInterval(timer)
            } else {
                setDisplayValue(current)
            }
        }, (duration * 1000) / steps)
        return () => clearInterval(timer)
    })

    return (
        <motion.div
            className={`animated-metric animated-metric--${size}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="animated-metric__value">
                {prefix}
                <span className="animated-metric__number">
                    {displayValue.toFixed(decimals)}
                </span>
                {suffix}
            </div>
            <div className="animated-metric__label">{label}</div>
            {sublabel && <div className="animated-metric__sublabel">{sublabel}</div>}
            {trend && (
                <div className={`animated-metric__trend ${trend.value >= 0 ? 'positive' : 'negative'}`}>
                    {trend.value >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{Math.abs(trend.value)}% {trend.period}</span>
                </div>
            )}
        </motion.div>
    )
}

// ============================================
// COMPARISON BAR
// ============================================
interface ComparisonBarProps {
    label: string
    value: number
    maxValue: number
    comparisonValue?: number
    format?: (val: number) => string
    color?: string
}

export function ComparisonBar({
    label,
    value,
    maxValue,
    comparisonValue,
    format = (v) => v.toString(),
    color = '#0D9488'
}: ComparisonBarProps) {
    const percentage = (value / maxValue) * 100
    const comparisonPercentage = comparisonValue ? (comparisonValue / maxValue) * 100 : 0

    return (
        <div className="comparison-bar">
            <div className="comparison-bar__header">
                <span className="comparison-bar__label">{label}</span>
                <span className="comparison-bar__value">{format(value)}</span>
            </div>
            <div className="comparison-bar__track">
                {comparisonValue && (
                    <motion.div
                        className="comparison-bar__comparison"
                        initial={{ width: 0 }}
                        animate={{ width: `${comparisonPercentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                )}
                <motion.div
                    className="comparison-bar__fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                    style={{ backgroundColor: color }}
                />
            </div>
            {comparisonValue && (
                <div className="comparison-bar__footer">
                    <span>vs {format(comparisonValue)} previous</span>
                    <span className={value >= comparisonValue ? 'positive' : 'negative'}>
                        {value >= comparisonValue ? '+' : ''}{((value - comparisonValue) / comparisonValue * 100).toFixed(1)}%
                    </span>
                </div>
            )}
        </div>
    )
}

// ============================================
// DONUT CHART
// ============================================
interface DonutSegment {
    label: string
    value: number
    color: string
}

interface DonutChartProps {
    segments: DonutSegment[]
    size?: number
    strokeWidth?: number
    centerLabel?: string
    centerValue?: string
}

export function DonutChart({
    segments,
    size = 160,
    strokeWidth = 20,
    centerLabel,
    centerValue
}: DonutChartProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const total = segments.reduce((sum, seg) => sum + seg.value, 0)

    let cumulativePercent = 0

    return (
        <div className="donut-chart" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {segments.map((segment, index) => {
                    const percent = segment.value / total
                    const offset = circumference * (1 - cumulativePercent)
                    const length = circumference * percent
                    cumulativePercent += percent

                    return (
                        <motion.circle
                            key={segment.label}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${length} ${circumference - length}`}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        />
                    )
                })}
            </svg>
            {(centerLabel || centerValue) && (
                <div className="donut-chart__center">
                    {centerValue && <span className="donut-chart__value">{centerValue}</span>}
                    {centerLabel && <span className="donut-chart__label">{centerLabel}</span>}
                </div>
            )}
        </div>
    )
}

// ============================================
// STAT GRID
// ============================================
interface StatItem {
    label: string
    value: string | number
    change?: number
    icon?: ReactNode
}

interface StatGridProps {
    stats: StatItem[]
    columns?: 2 | 3 | 4
}

export function StatGrid({ stats, columns = 4 }: StatGridProps) {
    return (
        <div className={`stat-grid stat-grid--cols-${columns}`}>
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    className="stat-grid__item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    {stat.icon && <div className="stat-grid__icon">{stat.icon}</div>}
                    <div className="stat-grid__content">
                        <span className="stat-grid__value">{stat.value}</span>
                        <span className="stat-grid__label">{stat.label}</span>
                        {stat.change !== undefined && (
                            <span className={`stat-grid__change ${stat.change >= 0 ? 'positive' : 'negative'}`}>
                                {stat.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {Math.abs(stat.change)}%
                            </span>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// HEAT CALENDAR
// ============================================
interface HeatCalendarDay {
    date: Date
    value: number
}

interface HeatCalendarProps {
    data: HeatCalendarDay[]
    maxValue: number
    colorScale?: string[]
}

export function HeatCalendar({
    data,
    maxValue,
    colorScale = ['#1E1E2A', '#134e4a', '#0d9488', '#14b8a6', '#2dd4bf']
}: HeatCalendarProps) {
    const getColor = (value: number) => {
        const index = Math.min(
            Math.floor((value / maxValue) * (colorScale.length - 1)),
            colorScale.length - 1
        )
        return colorScale[index]
    }

    const weeks: HeatCalendarDay[][] = []
    let currentWeek: HeatCalendarDay[] = []

    data.forEach((day, i) => {
        currentWeek.push(day)
        if ((i + 1) % 7 === 0) {
            weeks.push(currentWeek)
            currentWeek = []
        }
    })
    if (currentWeek.length > 0) weeks.push(currentWeek)

    return (
        <div className="heat-calendar">
            <div className="heat-calendar__grid">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="heat-calendar__week">
                        {week.map((day, dayIndex) => (
                            <motion.div
                                key={dayIndex}
                                className="heat-calendar__day"
                                style={{ backgroundColor: getColor(day.value) }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                                title={`${day.date.toLocaleDateString()}: ${day.value}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="heat-calendar__legend">
                <span>Less</span>
                {colorScale.map((color, i) => (
                    <div key={i} className="heat-calendar__legend-item" style={{ backgroundColor: color }} />
                ))}
                <span>More</span>
            </div>
        </div>
    )
}

// ============================================
// DATA TABLE HEADER
// ============================================
interface TableHeaderProps {
    title: string
    subtitle?: string
    onFilter?: () => void
    onExport?: () => void
    onRefresh?: () => void
    actions?: ReactNode
}

export function TableHeader({
    title,
    subtitle,
    onFilter,
    onExport,
    onRefresh,
    actions
}: TableHeaderProps) {
    return (
        <div className="table-header">
            <div className="table-header__text">
                <h3 className="table-header__title">{title}</h3>
                {subtitle && <p className="table-header__subtitle">{subtitle}</p>}
            </div>
            <div className="table-header__actions">
                {onFilter && (
                    <button className="table-header__btn" onClick={onFilter}>
                        <Filter size={16} /> Filter
                    </button>
                )}
                {onExport && (
                    <button className="table-header__btn" onClick={onExport}>
                        <Download size={16} /> Export
                    </button>
                )}
                {actions}
            </div>
        </div>
    )
}

// ============================================
// INSIGHT SPOTLIGHT
// ============================================
interface InsightSpotlightProps {
    variant: 'positive' | 'negative' | 'neutral' | 'ai'
    title: string
    description: string
    metric?: { value: string; label: string }
    action?: { label: string; onClick: () => void }
}

export function InsightSpotlight({
    variant,
    title,
    description,
    metric,
    action
}: InsightSpotlightProps) {
    return (
        <motion.div
            className={`insight-spotlight insight-spotlight--${variant}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="insight-spotlight__indicator" />
            <div className="insight-spotlight__content">
                <h4 className="insight-spotlight__title">{title}</h4>
                <p className="insight-spotlight__description">{description}</p>
                {metric && (
                    <div className="insight-spotlight__metric">
                        <span className="insight-spotlight__metric-value">{metric.value}</span>
                        <span className="insight-spotlight__metric-label">{metric.label}</span>
                    </div>
                )}
                {action && (
                    <button className="insight-spotlight__action" onClick={action.onClick}>
                        {action.label}
                    </button>
                )}
            </div>
        </motion.div>
    )
}

export default {
    AnimatedMetric,
    ComparisonBar,
    DonutChart,
    StatGrid,
    HeatCalendar,
    TableHeader,
    InsightSpotlight
}
