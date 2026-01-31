import { ReactNode } from 'react'
import './Badge.css'

export interface BadgeProps {
    children: ReactNode
    variant?: 'default' | 'success' | 'warning' | 'critical' | 'info' | 'teal' | 'purple' | 'error' | 'subtle' | 'secondary'
    size?: 'sm' | 'md'
    icon?: ReactNode
    dot?: boolean
    pulse?: boolean
    className?: string
    style?: React.CSSProperties
}

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    icon,
    dot = false,
    pulse = false,
    className = '',
    style
}: BadgeProps) {
    const baseClass = 'apex-badge'
    const variantClass = `apex-badge--${variant}`
    const sizeClass = `apex-badge--${size}`
    const pulseClass = pulse ? 'apex-badge--pulse' : ''

    const classes = [baseClass, variantClass, sizeClass, pulseClass, className]
        .filter(Boolean)
        .join(' ')

    return (
        <span className={classes} style={style}>
            {dot && <span className="apex-badge__dot" />}
            {icon && <span className="apex-badge__icon">{icon}</span>}
            <span className="apex-badge__text">{children}</span>
        </span>
    )
}

export default Badge
