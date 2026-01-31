import { motion } from 'framer-motion'
import './ProgressBar.css'

interface ProgressBarProps {
    value: number
    max?: number
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'success' | 'warning' | 'error' | 'teal'
    showLabel?: boolean
    animate?: boolean
    className?: string
}

export function ProgressBar({
    value,
    max = 100,
    size = 'md',
    variant = 'default',
    showLabel = false,
    animate = true,
    className = ''
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
        <div className={`progress-bar progress-bar--${size} ${className}`}>
            <div className="progress-bar__track">
                <motion.div
                    className={`progress-bar__fill progress-bar__fill--${variant}`}
                    initial={animate ? { width: 0 } : { width: `${percentage}%` }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.div
                    className="progress-bar__glow"
                    style={{ width: `${percentage}%` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </div>
            {showLabel && (
                <span className="progress-bar__label">
                    {Math.round(percentage)}%
                </span>
            )}
        </div>
    )
}

// Circular progress variant
interface CircularProgressProps {
    value: number
    max?: number
    size?: number
    strokeWidth?: number
    variant?: 'default' | 'success' | 'warning' | 'error' | 'teal'
    showLabel?: boolean
    className?: string
}

export function CircularProgress({
    value,
    max = 100,
    size = 64,
    strokeWidth = 4,
    variant = 'teal',
    showLabel = true,
    className = ''
}: CircularProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    const variantColors = {
        default: 'var(--apex-silver)',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        teal: 'var(--apex-teal)'
    }

    return (
        <div className={`circular-progress ${className}`}>
            <svg width={size} height={size}>
                <circle
                    className="circular-progress__track"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <motion.circle
                    className="circular-progress__fill"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke={variantColors[variant]}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            {showLabel && (
                <span className="circular-progress__label">
                    {Math.round(percentage)}%
                </span>
            )}
        </div>
    )
}

export default ProgressBar
