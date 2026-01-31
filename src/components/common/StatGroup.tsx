import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import './StatGroup.css'

interface StatProps {
    label: string
    value: string | number
    change?: number
    prefix?: string
    suffix?: string
    icon?: ReactNode
}

interface StatGroupProps {
    stats: StatProps[]
    columns?: 2 | 3 | 4
    className?: string
}

export function StatGroup({ stats, columns = 4, className = '' }: StatGroupProps) {
    return (
        <div className={`stat-group stat-group--${columns}cols ${className}`}>
            {stats.map((stat, index) => (
                <Stat key={index} {...stat} index={index} />
            ))}
        </div>
    )
}

function Stat({ label, value, change, prefix, suffix, icon, index = 0 }: StatProps & { index?: number }) {
    const isPositive = change !== undefined && change > 0
    const isNegative = change !== undefined && change < 0

    return (
        <motion.div
            className="stat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <div className="stat__header">
                {icon && <span className="stat__icon">{icon}</span>}
                <span className="stat__label">{label}</span>
            </div>
            <div className="stat__value">
                {prefix && <span className="stat__prefix">{prefix}</span>}
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                >
                    {value}
                </motion.span>
                {suffix && <span className="stat__suffix">{suffix}</span>}
            </div>
            {change !== undefined && (
                <div className={`stat__change ${isPositive ? 'stat__change--positive' : ''} ${isNegative ? 'stat__change--negative' : ''}`}>
                    {isPositive && <TrendingUp size={12} />}
                    {isNegative && <TrendingDown size={12} />}
                    <span>{isPositive ? '+' : ''}{change}%</span>
                </div>
            )}
        </motion.div>
    )
}

// Inline stat for compact display
export function InlineStat({ label, value, className = '' }: { label: string; value: string | number; className?: string }) {
    return (
        <div className={`inline-stat ${className}`}>
            <span className="inline-stat__label">{label}:</span>
            <span className="inline-stat__value">{value}</span>
        </div>
    )
}

export default StatGroup
