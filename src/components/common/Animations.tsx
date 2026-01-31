import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import './Animations.css'

// Fade In component
interface FadeInProps {
    children: ReactNode
    delay?: number
    duration?: number
    direction?: 'up' | 'down' | 'left' | 'right' | 'none'
    distance?: number
    className?: string
}

export function FadeIn({
    children,
    delay = 0,
    duration = 0.5,
    direction = 'up',
    distance = 20,
    className = ''
}: FadeInProps) {
    const getInitial = () => {
        switch (direction) {
            case 'up': return { opacity: 0, y: distance }
            case 'down': return { opacity: 0, y: -distance }
            case 'left': return { opacity: 0, x: distance }
            case 'right': return { opacity: 0, x: -distance }
            default: return { opacity: 0 }
        }
    }

    return (
        <motion.div
            className={className}
            initial={getInitial()}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration, delay, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    )
}

// Scale In component
interface ScaleInProps {
    children: ReactNode
    delay?: number
    duration?: number
    scale?: number
    className?: string
}

export function ScaleIn({
    children,
    delay = 0,
    duration = 0.4,
    scale = 0.9,
    className = ''
}: ScaleInProps) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, scale }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration, delay, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    )
}

// Stagger Children component
interface StaggerContainerProps {
    children: ReactNode
    staggerDelay?: number
    initialDelay?: number
    className?: string
}

export function StaggerContainer({
    children,
    staggerDelay = 0.1,
    initialDelay = 0,
    className = ''
}: StaggerContainerProps) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: staggerDelay,
                        delayChildren: initialDelay
                    }
                }
            }}
        >
            {children}
        </motion.div>
    )
}

// Stagger Item (child of StaggerContainer)
interface StaggerItemProps {
    children: ReactNode
    direction?: 'up' | 'down' | 'left' | 'right'
    distance?: number
    className?: string
}

export function StaggerItem({
    children,
    direction = 'up',
    distance = 20,
    className = ''
}: StaggerItemProps) {
    const getAnimation = () => {
        switch (direction) {
            case 'up': return { hidden: { opacity: 0, y: distance }, visible: { opacity: 1, y: 0 } }
            case 'down': return { hidden: { opacity: 0, y: -distance }, visible: { opacity: 1, y: 0 } }
            case 'left': return { hidden: { opacity: 0, x: distance }, visible: { opacity: 1, x: 0 } }
            case 'right': return { hidden: { opacity: 0, x: -distance }, visible: { opacity: 1, x: 0 } }
        }
    }

    return (
        <motion.div
            className={className}
            variants={getAnimation()}
            transition={{ ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    )
}

// Pulse effect
interface PulseProps {
    children: ReactNode
    intensity?: number
    duration?: number
    className?: string
}

export function Pulse({ children, intensity = 1.05, duration = 1, className = '' }: PulseProps) {
    return (
        <motion.div
            className={className}
            animate={{ scale: [1, intensity, 1] }}
            transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    )
}

// Float effect
interface FloatProps {
    children: ReactNode
    amplitude?: number
    duration?: number
    className?: string
}

export function Float({ children, amplitude = 10, duration = 3, className = '' }: FloatProps) {
    return (
        <motion.div
            className={className}
            animate={{ y: [-amplitude, amplitude, -amplitude] }}
            transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    )
}

// Shimmer effect (loading highlight)
interface ShimmerProps {
    width?: string | number
    height?: string | number
    borderRadius?: string | number
    className?: string
}

export function Shimmer({
    width = '100%',
    height = 16,
    borderRadius = 4,
    className = ''
}: ShimmerProps) {
    return (
        <div
            className={`shimmer ${className}`}
            style={{ width, height, borderRadius }}
        />
    )
}

// Typing effect
interface TypewriterProps {
    text: string
    speed?: number
    delay?: number
    className?: string
}

export function Typewriter({ text, speed = 50, delay = 0, className = '' }: TypewriterProps) {
    return (
        <motion.span
            className={className}
            initial={{ width: 0 }}
            animate={{ width: 'auto' }}
            transition={{ delay }}
        >
            {text.split('').map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay + i * (speed / 1000) }}
                >
                    {char}
                </motion.span>
            ))}
        </motion.span>
    )
}

export default FadeIn
