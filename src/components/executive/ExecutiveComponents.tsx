import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Sparkles, Zap, Shield, Brain } from 'lucide-react'
import './ExecutiveComponents.css'

// ============================================
// EXECUTIVE STAT CARD
// ============================================
interface ExecStatProps {
    value: string | number
    label: string
    change?: {
        value: number
        period?: string
    }
    icon?: ReactNode
    variant?: 'default' | 'highlight' | 'premium'
}

export function ExecStat({ value, label, change, icon, variant = 'default' }: ExecStatProps) {
    const getTrendIcon = () => {
        if (!change) return null
        if (change.value > 0) return <TrendingUp size={14} />
        if (change.value < 0) return <TrendingDown size={14} />
        return <Minus size={14} />
    }

    const getTrendClass = () => {
        if (!change) return ''
        if (change.value > 0) return 'exec-stat__change--positive'
        if (change.value < 0) return 'exec-stat__change--negative'
        return 'exec-stat__change--neutral'
    }

    return (
        <motion.div
            className={`exec-stat exec-stat--${variant}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {icon && <div className="exec-stat__icon">{icon}</div>}
            <div className="exec-stat__value">{value}</div>
            <div className="exec-stat__label">{label}</div>
            {change && (
                <div className={`exec-stat__change ${getTrendClass()}`}>
                    {getTrendIcon()}
                    <span>{change.value > 0 ? '+' : ''}{change.value}%</span>
                    {change.period && <span className="exec-stat__period">{change.period}</span>}
                </div>
            )}
        </motion.div>
    )
}

// ============================================
// KPI CARD
// ============================================
interface KpiCardProps {
    title: string
    value: string | number
    subtitle?: string
    trend?: {
        value: number
        label?: string
    }
    icon?: ReactNode
    iconColor?: 'teal' | 'purple' | 'blue' | 'gold' | 'success' | 'warning'
    sparkline?: number[]
    onClick?: () => void
}

export function KpiCard({
    title,
    value,
    subtitle,
    trend,
    icon,
    iconColor = 'teal',
    sparkline,
    onClick
}: KpiCardProps) {
    return (
        <motion.div
            className={`kpi-card ${onClick ? 'kpi-card--clickable' : ''}`}
            onClick={onClick}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <div className="kpi-card__header">
                {icon && (
                    <div className={`kpi-card__icon kpi-card__icon--${iconColor}`}>
                        {icon}
                    </div>
                )}
                {trend && (
                    <div className={`kpi-card__trend ${trend.value >= 0 ? 'kpi-card__trend--up' : 'kpi-card__trend--down'}`}>
                        {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
            <div className="kpi-card__value">{value}</div>
            <div className="kpi-card__label">{title}</div>
            {subtitle && <div className="kpi-card__subtitle">{subtitle}</div>}
            {sparkline && <MiniSparkline data={sparkline} />}
        </motion.div>
    )
}

// ============================================
// MINI SPARKLINE
// ============================================
function MiniSparkline({ data, color = '#0D9488' }: { data: number[], color?: string }) {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const width = 100
    const height = 24

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((val - min) / range) * height
        return `${x},${y}`
    }).join(' ')

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="kpi-card__sparkline">
            <defs>
                <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <motion.polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />
        </svg>
    )
}

// ============================================
// EXECUTIVE BADGE
// ============================================
interface ExecBadgeProps {
    variant: 'ai' | 'premium' | 'enterprise' | 'secure' | 'new' | 'beta'
    label?: string
    icon?: ReactNode
}

export function ExecBadge({ variant, label, icon }: ExecBadgeProps) {
    const defaultLabels: Record<string, string> = {
        ai: 'AI-Powered',
        premium: 'Premium',
        enterprise: 'Enterprise',
        secure: 'Secure',
        new: 'New',
        beta: 'Beta'
    }

    const defaultIcons: Record<string, ReactNode> = {
        ai: <Brain size={12} />,
        premium: <Sparkles size={12} />,
        enterprise: <Shield size={12} />,
        secure: <Shield size={12} />,
        new: <Zap size={12} />,
        beta: <Zap size={12} />
    }

    return (
        <motion.span
            className={`exec-badge exec-badge--${variant}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {icon || defaultIcons[variant]}
            {label || defaultLabels[variant]}
        </motion.span>
    )
}

// ============================================
// PROGRESS RING
// ============================================
interface ProgressRingProps {
    progress: number
    size?: number
    strokeWidth?: number
    color?: string
    showValue?: boolean
    label?: string
}

export function ProgressRing({
    progress,
    size = 80,
    strokeWidth = 6,
    color = '#0D9488',
    showValue = true,
    label
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (progress / 100) * circumference

    return (
        <div className="progress-ring" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="progress-ring__circle">
                <circle
                    className="progress-ring__track"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <motion.circle
                    className="progress-ring__fill"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke={color}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </svg>
            {showValue && (
                <div className="progress-ring__value" style={{ fontSize: size * 0.25 }}>
                    {Math.round(progress)}%
                </div>
            )}
            {label && <div className="progress-ring__label">{label}</div>}
        </div>
    )
}

// ============================================
// FEATURE HIGHLIGHT CARD
// ============================================
interface FeatureCardProps {
    icon: ReactNode
    title: string
    description: string
    badge?: string
    onClick?: () => void
}

export function FeatureCard({ icon, title, description, badge, onClick }: FeatureCardProps) {
    return (
        <motion.div
            className="feature-card"
            onClick={onClick}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
        >
            <div className="feature-card__icon">{icon}</div>
            <div className="feature-card__content">
                <h4 className="feature-card__title">
                    {title}
                    {badge && <ExecBadge variant="new" label={badge} />}
                </h4>
                <p className="feature-card__description">{description}</p>
            </div>
        </motion.div>
    )
}

// ============================================
// METRIC COMPARISON
// ============================================
interface MetricComparisonProps {
    current: { value: number; label: string }
    previous: { value: number; label: string }
    format?: (val: number) => string
}

export function MetricComparison({ current, previous, format = (v) => v.toString() }: MetricComparisonProps) {
    const change = ((current.value - previous.value) / previous.value) * 100

    return (
        <div className="metric-comparison">
            <div className="metric-comparison__current">
                <span className="metric-comparison__value">{format(current.value)}</span>
                <span className="metric-comparison__label">{current.label}</span>
            </div>
            <div className="metric-comparison__vs">vs</div>
            <div className="metric-comparison__previous">
                <span className="metric-comparison__value">{format(previous.value)}</span>
                <span className="metric-comparison__label">{previous.label}</span>
            </div>
            <div className={`metric-comparison__change ${change >= 0 ? 'positive' : 'negative'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </div>
        </div>
    )
}

// ============================================
// AI INSIGHT PANEL
// ============================================
interface AiInsightProps {
    title: string
    insight: string
    confidence?: number
    actions?: Array<{ label: string; onClick: () => void }>
}

export function AiInsight({ title, insight, confidence, actions }: AiInsightProps) {
    return (
        <motion.div
            className="ai-insight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="ai-insight__header">
                <Brain size={18} />
                <span className="ai-insight__title">{title}</span>
                {confidence && (
                    <span className="ai-insight__confidence">{confidence}% confidence</span>
                )}
            </div>
            <p className="ai-insight__text">{insight}</p>
            {actions && (
                <div className="ai-insight__actions">
                    {actions.map((action, i) => (
                        <button key={i} className="ai-insight__action" onClick={action.onClick}>
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    )
}

export default {
    ExecStat,
    KpiCard,
    ExecBadge,
    ProgressRing,
    FeatureCard,
    MetricComparison,
    AiInsight
}
