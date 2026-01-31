import { ReactNode, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, ArrowRight, Info, RefreshCw, Calendar, Download, MoreHorizontal, Maximize2 } from 'lucide-react'
import './DashboardWidgets.css'

// Stat Card
interface StatCardProps {
    title: string
    value: string | number
    change?: { value: number; period?: string }
    icon?: ReactNode
    color?: string
    loading?: boolean
    onRefresh?: () => void
    onClick?: () => void
}

export function StatCard({
    title,
    value,
    change,
    icon,
    color = 'var(--apex-teal)',
    loading = false,
    onRefresh,
    onClick
}: StatCardProps) {
    const getTrendIcon = () => {
        if (!change) return null
        if (change.value > 0) return <TrendingUp size={14} />
        if (change.value < 0) return <TrendingDown size={14} />
        return <Minus size={14} />
    }

    const getTrendClass = () => {
        if (!change) return ''
        if (change.value > 0) return 'stat-card__change--positive'
        if (change.value < 0) return 'stat-card__change--negative'
        return 'stat-card__change--neutral'
    }

    return (
        <motion.div
            className={`stat-card ${onClick ? 'stat-card--clickable' : ''}`}
            onClick={onClick}
            whileHover={onClick ? { y: -2 } : undefined}
        >
            {loading && <div className="stat-card__loading" />}

            <div className="stat-card__header">
                <span className="stat-card__title">{title}</span>
                {onRefresh && (
                    <button className="stat-card__refresh" onClick={(e) => { e.stopPropagation(); onRefresh() }}>
                        <RefreshCw size={14} />
                    </button>
                )}
            </div>

            <div className="stat-card__value" style={{ color }}>{value}</div>

            {change && (
                <div className={`stat-card__change ${getTrendClass()}`}>
                    {getTrendIcon()}
                    <span>{Math.abs(change.value)}%</span>
                    {change.period && <span>vs {change.period}</span>}
                </div>
            )}

            {icon && (
                <div className="stat-card__icon" style={{ color }}>
                    {icon}
                </div>
            )}
        </motion.div>
    )
}

// Progress Card
interface ProgressCardProps {
    title: string
    value: number
    max?: number
    label?: string
    color?: string
    size?: 'sm' | 'md' | 'lg'
}

export function ProgressCard({ title, value, max = 100, label, color = 'var(--apex-teal)', size = 'md' }: ProgressCardProps) {
    const percentage = Math.min((value / max) * 100, 100)

    return (
        <div className={`progress-card progress-card--${size}`}>
            <div className="progress-card__header">
                <span className="progress-card__title">{title}</span>
                <span className="progress-card__value" style={{ color }}>{value} / {max}</span>
            </div>
            <div className="progress-card__bar">
                <motion.div
                    className="progress-card__fill"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6 }}
                />
            </div>
            {label && <div className="progress-card__label">{label}</div>}
        </div>
    )
}

// Activity Feed
interface ActivityItem {
    id: string
    icon?: ReactNode
    title: string
    description?: string
    timestamp: Date
    type?: 'default' | 'success' | 'warning' | 'error'
}

interface ActivityFeedProps {
    items: ActivityItem[]
    maxItems?: number
    showTimestamp?: boolean
    onViewAll?: () => void
}

export function ActivityFeed({ items, maxItems = 5, showTimestamp = true, onViewAll }: ActivityFeedProps) {
    const displayItems = items.slice(0, maxItems)

    const formatTime = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        return `${days}d ago`
    }

    return (
        <div className="activity-feed">
            {displayItems.map((item, index) => (
                <motion.div
                    key={item.id}
                    className={`activity-feed__item activity-feed__item--${item.type || 'default'}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    {item.icon && <div className="activity-feed__icon">{item.icon}</div>}
                    <div className="activity-feed__content">
                        <div className="activity-feed__title">{item.title}</div>
                        {item.description && <div className="activity-feed__desc">{item.description}</div>}
                    </div>
                    {showTimestamp && (
                        <div className="activity-feed__time">{formatTime(item.timestamp)}</div>
                    )}
                </motion.div>
            ))}

            {onViewAll && items.length > maxItems && (
                <button className="activity-feed__view-all" onClick={onViewAll}>
                    View all activity
                    <ArrowRight size={14} />
                </button>
            )}
        </div>
    )
}

// Widget Container
interface WidgetProps {
    title: string
    subtitle?: string
    actions?: ReactNode
    children: ReactNode
    loading?: boolean
    collapsible?: boolean
    defaultCollapsed?: boolean
    onExpand?: () => void
    className?: string
}

export function Widget({
    title,
    subtitle,
    actions,
    children,
    loading = false,
    collapsible = false,
    defaultCollapsed = false,
    onExpand,
    className = ''
}: WidgetProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed)

    return (
        <div className={`widget ${collapsed ? 'widget--collapsed' : ''} ${className}`}>
            <div className="widget__header">
                <div className="widget__title-group">
                    <h3 className="widget__title">{title}</h3>
                    {subtitle && <span className="widget__subtitle">{subtitle}</span>}
                </div>

                <div className="widget__actions">
                    {actions}
                    {onExpand && (
                        <button className="widget__action" onClick={onExpand}>
                            <Maximize2 size={14} />
                        </button>
                    )}
                    {collapsible && (
                        <button
                            className="widget__action widget__action--collapse"
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            <motion.span animate={{ rotate: collapsed ? 180 : 0 }}>▲</motion.span>
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        className="widget__content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        {loading ? (
                            <div className="widget__loading">
                                <RefreshCw size={20} className="spin" />
                            </div>
                        ) : (
                            children
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Quick Stats Grid
interface QuickStat {
    label: string
    value: string | number
    color?: string
}

interface QuickStatsProps {
    stats: QuickStat[]
    columns?: number
}

export function QuickStats({ stats, columns = 4 }: QuickStatsProps) {
    return (
        <div className="quick-stats" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {stats.map((stat, index) => (
                <div key={index} className="quick-stats__item">
                    <span className="quick-stats__value" style={{ color: stat.color }}>
                        {stat.value}
                    </span>
                    <span className="quick-stats__label">{stat.label}</span>
                </div>
            ))}
        </div>
    )
}

export default { StatCard, ProgressCard, ActivityFeed, Widget, QuickStats }
