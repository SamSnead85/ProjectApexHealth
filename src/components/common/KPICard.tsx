import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react'
import './KPICard.css'

interface KPICardProps {
    title: string
    value: string | number
    previousValue?: number
    change?: number
    changeLabel?: string
    icon?: ReactNode
    trend?: 'up' | 'down' | 'neutral'
    format?: 'number' | 'currency' | 'percent'
    href?: string
    onClick?: () => void
    className?: string
}

export function KPICard({
    title,
    value,
    change,
    changeLabel = 'vs last period',
    icon,
    trend,
    className = '',
    href,
    onClick
}: KPICardProps) {
    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp size={14} />
        if (trend === 'down') return <TrendingDown size={14} />
        return <Minus size={14} />
    }

    const getTrendClass = () => {
        if (trend === 'up') return 'kpi-card__change--up'
        if (trend === 'down') return 'kpi-card__change--down'
        return 'kpi-card__change--neutral'
    }

    const content = (
        <>
            <div className="kpi-card__header">
                {icon && <div className="kpi-card__icon">{icon}</div>}
                <span className="kpi-card__title">{title}</span>
                {(href || onClick) && <ArrowUpRight size={14} className="kpi-card__arrow" />}
            </div>
            <motion.div
                className="kpi-card__value"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {value}
            </motion.div>
            {change !== undefined && (
                <motion.div
                    className={`kpi-card__change ${getTrendClass()}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {getTrendIcon()}
                    <span>{change > 0 ? '+' : ''}{change}%</span>
                    <span className="kpi-card__change-label">{changeLabel}</span>
                </motion.div>
            )}
        </>
    )

    if (href) {
        return (
            <motion.a
                href={href}
                className={`kpi-card kpi-card--clickable ${className}`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
            >
                {content}
            </motion.a>
        )
    }

    if (onClick) {
        return (
            <motion.button
                className={`kpi-card kpi-card--clickable ${className}`}
                onClick={onClick}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
            >
                {content}
            </motion.button>
        )
    }

    return (
        <motion.div
            className={`kpi-card ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {content}
        </motion.div>
    )
}

// Grid layout helper for KPI cards
export function KPIGrid({ children, columns = 4, className = '' }: {
    children: ReactNode
    columns?: 2 | 3 | 4 | 5
    className?: string
}) {
    return (
        <div className={`kpi-grid kpi-grid--${columns}cols ${className}`}>
            {children}
        </div>
    )
}

export default KPICard
