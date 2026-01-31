import { motion } from 'framer-motion'
import './StatusIndicator.css'

type Status = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'neutral'

interface StatusIndicatorProps {
    status: Status
    label?: string
    pulse?: boolean
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function StatusIndicator({
    status,
    label,
    pulse = false,
    size = 'md',
    className = ''
}: StatusIndicatorProps) {
    return (
        <div className={`status-indicator status-indicator--${size} ${className}`}>
            <motion.span
                className={`status-indicator__dot status-indicator__dot--${status} ${pulse ? 'status-indicator__dot--pulse' : ''}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            />
            {label && <span className="status-indicator__label">{label}</span>}
        </div>
    )
}

interface StatusBadgeProps {
    status: Status
    children: React.ReactNode
    className?: string
}

export function StatusBadge({ status, children, className = '' }: StatusBadgeProps) {
    return (
        <span className={`status-badge status-badge--${status} ${className}`}>
            <span className="status-badge__dot" />
            {children}
        </span>
    )
}

// Traffic light component for quick status overview
interface TrafficLightProps {
    values: {
        success: number
        warning: number
        error: number
    }
    showLabels?: boolean
    className?: string
}

export function TrafficLight({ values, showLabels = false, className = '' }: TrafficLightProps) {
    const total = values.success + values.warning + values.error
    const percentages = {
        success: (values.success / total) * 100,
        warning: (values.warning / total) * 100,
        error: (values.error / total) * 100
    }

    return (
        <div className={`traffic-light ${className}`}>
            <div className="traffic-light__bar">
                <motion.div
                    className="traffic-light__segment traffic-light__segment--success"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentages.success}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                />
                <motion.div
                    className="traffic-light__segment traffic-light__segment--warning"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentages.warning}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                />
                <motion.div
                    className="traffic-light__segment traffic-light__segment--error"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentages.error}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                />
            </div>
            {showLabels && (
                <div className="traffic-light__labels">
                    <span className="traffic-light__label traffic-light__label--success">
                        {values.success} healthy
                    </span>
                    <span className="traffic-light__label traffic-light__label--warning">
                        {values.warning} warning
                    </span>
                    <span className="traffic-light__label traffic-light__label--error">
                        {values.error} critical
                    </span>
                </div>
            )}
        </div>
    )
}

export default StatusIndicator
