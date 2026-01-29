import { ReactNode, CSSProperties } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import './GlassCard.css'

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children: ReactNode
    variant?: 'default' | 'elevated' | 'subtle' | 'accent'
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    hoverable?: boolean
    glowOnHover?: boolean
    className?: string
    style?: CSSProperties
}

export function GlassCard({
    children,
    variant = 'default',
    padding = 'lg',
    hoverable = false,
    glowOnHover = false,
    className = '',
    style,
    ...motionProps
}: GlassCardProps) {
    const baseClass = 'glass-card'
    const variantClass = `glass-card--${variant}`
    const paddingClass = padding !== 'none' ? `glass-card--p-${padding}` : ''
    const hoverClass = hoverable ? 'glass-card--hoverable' : ''
    const glowClass = glowOnHover ? 'glass-card--glow' : ''

    const classes = [baseClass, variantClass, paddingClass, hoverClass, glowClass, className]
        .filter(Boolean)
        .join(' ')

    return (
        <motion.div
            className={classes}
            style={style}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            {...motionProps}
        >
            {children}
        </motion.div>
    )
}

export default GlassCard
