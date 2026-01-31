import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import './Card.css'

interface CardProps {
    children: ReactNode
    variant?: 'default' | 'glass' | 'elevated' | 'outlined' | 'interactive'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    onClick?: () => void
    href?: string
    className?: string
    style?: React.CSSProperties
}

export function Card({
    children,
    variant = 'default',
    padding = 'md',
    onClick,
    href,
    className = '',
    style
}: CardProps) {
    const isClickable = onClick || href
    const Component = href ? 'a' : onClick ? motion.div : 'div'

    const props = {
        className: `card card--${variant} card--padding-${padding} ${isClickable ? 'card--clickable' : ''} ${className}`,
        style,
        ...(onClick && { onClick, whileHover: { scale: 1.01 }, whileTap: { scale: 0.99 } }),
        ...(href && { href })
    }

    return <Component {...props}>{children}</Component>
}

// Card header
interface CardHeaderProps {
    title: string
    subtitle?: string
    icon?: ReactNode
    action?: ReactNode
    className?: string
}

export function CardHeader({ title, subtitle, icon, action, className = '' }: CardHeaderProps) {
    return (
        <div className={`card-header ${className}`}>
            <div className="card-header__content">
                {icon && <span className="card-header__icon">{icon}</span>}
                <div className="card-header__text">
                    <h3 className="card-header__title">{title}</h3>
                    {subtitle && <p className="card-header__subtitle">{subtitle}</p>}
                </div>
            </div>
            {action && <div className="card-header__action">{action}</div>}
        </div>
    )
}

// Card body
interface CardBodyProps {
    children: ReactNode
    className?: string
}

export function CardBody({ children, className = '' }: CardBodyProps) {
    return <div className={`card-body ${className}`}>{children}</div>
}

// Card footer
interface CardFooterProps {
    children: ReactNode
    align?: 'left' | 'center' | 'right' | 'between'
    className?: string
}

export function CardFooter({ children, align = 'right', className = '' }: CardFooterProps) {
    return <div className={`card-footer card-footer--${align} ${className}`}>{children}</div>
}

// Stat Card
interface StatCardProps {
    label: string
    value: string | number
    change?: { value: number; direction: 'up' | 'down' }
    icon?: ReactNode
    color?: 'teal' | 'blue' | 'green' | 'red' | 'orange' | 'purple'
    onClick?: () => void
}

export function StatCard({ label, value, change, icon, color = 'teal', onClick }: StatCardProps) {
    return (
        <motion.div
            className={`stat-card stat-card--${color} ${onClick ? 'stat-card--clickable' : ''}`}
            onClick={onClick}
            whileHover={onClick ? { scale: 1.02, y: -2 } : undefined}
            whileTap={onClick ? { scale: 0.98 } : undefined}
        >
            {icon && <div className="stat-card__icon">{icon}</div>}
            <div className="stat-card__content">
                <span className="stat-card__label">{label}</span>
                <span className="stat-card__value">{value}</span>
                {change && (
                    <span className={`stat-card__change stat-card__change--${change.direction}`}>
                        {change.direction === 'up' ? '+' : ''}{change.value}%
                    </span>
                )}
            </div>
        </motion.div>
    )
}

// Link Card
interface LinkCardProps {
    title: string
    description?: string
    icon?: ReactNode
    href: string
    external?: boolean
}

export function LinkCard({ title, description, icon, href, external = false }: LinkCardProps) {
    return (
        <motion.a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="link-card"
            whileHover={{ x: 4 }}
        >
            {icon && <div className="link-card__icon">{icon}</div>}
            <div className="link-card__content">
                <span className="link-card__title">{title}</span>
                {description && <span className="link-card__description">{description}</span>}
            </div>
            <div className="link-card__arrow">
                {external ? <ArrowUpRight size={16} /> : <ArrowRight size={16} />}
            </div>
        </motion.a>
    )
}

export default Card

// Alias exports for backward compatibility
export { Card as GlassCard }
