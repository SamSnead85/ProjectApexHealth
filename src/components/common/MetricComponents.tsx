import { ReactNode, useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gauge, TrendingUp, TrendingDown, Activity, Target, Zap, BarChart2, LineChart, PieChart, ArrowUp, ArrowDown, Minus, Info, AlertCircle, CheckCircle } from 'lucide-react'
import './MetricComponents.css'

// Metric Card
interface MetricCardProps {
    label?: string;
    title?: string; // Alias for label (backward compatibility)
    value: string | number;
    change?: number | { value: number; type?: string; direction?: string };
    changeLabel?: string;
    subtitle?: string; // Alias for changeLabel (backward compatibility)
    icon?: ReactNode;
    iconColor?: string; // Optional color for icon (backward compatibility)
    trend?: 'up' | 'down' | 'neutral' | { value: number; direction: string };
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'teal';
    className?: string;
}

export function MetricCard({
    label,
    title,
    value,
    change,
    changeLabel,
    subtitle,
    icon,
    iconColor,
    trend,
    variant = 'default',
    className = ''
}: MetricCardProps) {
    // Support both label and title props
    const displayLabel = label || title || '';

    // Support both changeLabel and subtitle props
    const displayChangeLabel = changeLabel || subtitle;

    // Normalize change value - support both number and object format
    const normalizedChange = typeof change === 'object' ? change.value : change;

    // Normalize trend - support both string and object format
    let normalizedTrend: 'up' | 'down' | 'neutral' | undefined;
    if (typeof trend === 'object') {
        normalizedTrend = trend.direction as 'up' | 'down' | 'neutral';
    } else if (trend) {
        normalizedTrend = trend;
    } else if (typeof change === 'object') {
        // Derive trend from change object if not provided
        normalizedTrend = change.direction === 'up' || change.type === 'increase' ? 'up' :
            change.direction === 'down' || change.type === 'decrease' ? 'down' : 'neutral';
    }

    // Map 'teal' variant to 'success' for styling
    const mappedVariant = variant === 'teal' ? 'success' : variant;

    const TrendIcon = normalizedTrend === 'up' ? TrendingUp : normalizedTrend === 'down' ? TrendingDown : Minus;

    return (
        <div className={`metric-card metric-card--${mappedVariant} ${className}`}>
            {icon && <div className="metric-card__icon">{icon}</div>}
            <div className="metric-card__content">
                <span className="metric-card__label">{displayLabel}</span>
                <span className="metric-card__value">{value}</span>
                {normalizedChange !== undefined && (
                    <div className={`metric-card__change ${normalizedTrend || 'neutral'}`}>
                        <TrendIcon size={12} />
                        <span>{normalizedChange > 0 ? '+' : ''}{normalizedChange}%</span>
                        {displayChangeLabel && <span className="metric-card__change-label">{displayChangeLabel}</span>}
                    </div>
                )}
            </div>
        </div>
    )
}

// Mini Sparkline
interface MiniSparklineProps { data: number[]; width?: number; height?: number; color?: string; fill?: boolean; className?: string }

export function MiniSparkline({ data, width = 100, height = 30, color = 'var(--apex-teal)', fill = false, className = '' }: MiniSparklineProps) {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((v - min) / range) * (height - 4) - 2
        return `${x},${y}`
    }).join(' ')

    const fillPath = `M0,${height} L${points} L${width},${height} Z`

    return (
        <svg className={`mini-sparkline ${className}`} width={width} height={height}>
            {fill && <path d={fillPath} fill={color} opacity="0.2" />}
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={(data.length - 1) * (width / (data.length - 1))} cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2} r="3" fill={color} />
        </svg>
    )
}

// Gauge Chart
interface GaugeChartProps { value: number; max?: number; label?: string; showValue?: boolean; size?: number; thickness?: number; className?: string }

export function GaugeChart({ value, max = 100, label, showValue = true, size = 120, thickness = 10, className = '' }: GaugeChartProps) {
    const percentage = Math.min(100, (value / max) * 100)
    const radius = (size - thickness) / 2
    const circumference = Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    const getColor = () => {
        if (percentage >= 80) return '#10b981'
        if (percentage >= 50) return '#f59e0b'
        return '#ef4444'
    }

    return (
        <div className={`gauge-chart ${className}`} style={{ width: size, height: size / 2 + 20 }}>
            <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
                <path d={`M ${thickness / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - thickness / 2} ${size / 2}`}
                    fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={thickness} strokeLinecap="round" />
                <path d={`M ${thickness / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - thickness / 2} ${size / 2}`}
                    fill="none" stroke={getColor()} strokeWidth={thickness} strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
            </svg>
            {showValue && <span className="gauge-chart__value">{value}</span>}
            {label && <span className="gauge-chart__label">{label}</span>}
        </div>
    )
}

// Comparison Bar
interface ComparisonBarProps { label: string; valueA: number; valueB: number; labelA?: string; labelB?: string; max?: number; className?: string }

export function ComparisonBar({ label, valueA, valueB, labelA = 'A', labelB = 'B', max, className = '' }: ComparisonBarProps) {
    const actualMax = max || Math.max(valueA, valueB)
    const percentA = (valueA / actualMax) * 100
    const percentB = (valueB / actualMax) * 100

    return (
        <div className={`comparison-bar ${className}`}>
            <span className="comparison-bar__label">{label}</span>
            <div className="comparison-bar__container">
                <div className="comparison-bar__row">
                    <span className="comparison-bar__value-label">{labelA}</span>
                    <div className="comparison-bar__track"><div className="comparison-bar__fill comparison-bar__fill--a" style={{ width: `${percentA}%` }} /></div>
                    <span className="comparison-bar__value">{valueA}</span>
                </div>
                <div className="comparison-bar__row">
                    <span className="comparison-bar__value-label">{labelB}</span>
                    <div className="comparison-bar__track"><div className="comparison-bar__fill comparison-bar__fill--b" style={{ width: `${percentB}%` }} /></div>
                    <span className="comparison-bar__value">{valueB}</span>
                </div>
            </div>
        </div>
    )
}

// Progress Ring
interface ProgressRingProps { value: number; max?: number; size?: number; thickness?: number; label?: string; color?: string; className?: string }

export function ProgressRing({ value, max = 100, size = 80, thickness = 8, label, color = 'var(--apex-teal)', className = '' }: ProgressRingProps) {
    const percentage = (value / max) * 100
    const radius = (size - thickness) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div className={`progress-ring ${className}`} style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={thickness} />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={thickness}
                    strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
            </svg>
            <div className="progress-ring__content">
                <span className="progress-ring__value">{Math.round(percentage)}%</span>
                {label && <span className="progress-ring__label">{label}</span>}
            </div>
        </div>
    )
}

// Stat Group
interface Stat { label: string; value: string | number; icon?: ReactNode }

interface StatGroupProps { stats: Stat[]; columns?: number; className?: string }

export function StatGroup({ stats, columns = 4, className = '' }: StatGroupProps) {
    return (
        <div className={`stat-group ${className}`} style={{ '--stat-columns': columns } as React.CSSProperties}>
            {stats.map((stat, i) => (
                <div key={i} className="stat-group__item">
                    {stat.icon && <div className="stat-group__icon">{stat.icon}</div>}
                    <div className="stat-group__info">
                        <span className="stat-group__value">{stat.value}</span>
                        <span className="stat-group__label">{stat.label}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

// Delta Indicator
interface DeltaIndicatorProps { value: number; suffix?: string; size?: 'sm' | 'md' | 'lg'; className?: string }

export function DeltaIndicator({ value, suffix = '%', size = 'md', className = '' }: DeltaIndicatorProps) {
    const isPositive = value > 0
    const isNeutral = value === 0

    return (
        <span className={`delta-indicator delta-indicator--${size} ${isPositive ? 'positive' : isNeutral ? 'neutral' : 'negative'} ${className}`}>
            {isPositive ? <ArrowUp size={size === 'sm' ? 10 : size === 'lg' ? 16 : 12} /> : isNeutral ? <Minus size={size === 'sm' ? 10 : size === 'lg' ? 16 : 12} /> : <ArrowDown size={size === 'sm' ? 10 : size === 'lg' ? 16 : 12} />}
            {Math.abs(value)}{suffix}
        </span>
    )
}

export default { MetricCard, MiniSparkline, GaugeChart, ComparisonBar, ProgressRing, StatGroup, DeltaIndicator }
