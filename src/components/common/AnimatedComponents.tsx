import { ReactNode, useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, Variants, useReducedMotion } from 'framer-motion'
import './AnimatedComponents.css'

// Fade In on View
interface FadeInViewProps {
    children: ReactNode
    direction?: 'up' | 'down' | 'left' | 'right' | 'none'
    distance?: number
    delay?: number
    duration?: number
    once?: boolean
    className?: string
}

export function FadeInView({
    children,
    direction = 'up',
    distance = 24,
    delay = 0,
    duration = 0.5,
    once = true,
    className = ''
}: FadeInViewProps) {
    const prefersReducedMotion = useReducedMotion()

    const getInitial = () => {
        if (prefersReducedMotion) return { opacity: 0 }
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
            className={`fade-in-view ${className}`}
            initial={getInitial()}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once }}
            transition={{ duration, delay, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    )
}

// Staggered List
interface StaggeredListProps {
    children: ReactNode[]
    staggerDelay?: number
    className?: string
}

export function StaggeredList({ children, staggerDelay = 0.08, className = '' }: StaggeredListProps) {
    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay
            }
        }
    }

    const item: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            className={`staggered-list ${className}`}
            variants={container}
            initial="hidden"
            animate="show"
        >
            {children.map((child, i) => (
                <motion.div key={i} variants={item}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    )
}

// Page Transition Wrapper
interface PageTransitionProps {
    children: ReactNode
    type?: 'fade' | 'slide' | 'scale' | 'slideUp'
    className?: string
}

export function PageTransition({ children, type = 'fade', className = '' }: PageTransitionProps) {
    const variants: Record<string, Variants> = {
        fade: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 }
        },
        slide: {
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -20 }
        },
        scale: {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 1.05 }
        },
        slideUp: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 }
        }
    }

    return (
        <motion.div
            className={`page-transition ${className}`}
            variants={variants[type]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    )
}

// Hover Scale
interface HoverScaleProps {
    children: ReactNode
    scale?: number
    className?: string
}

export function HoverScale({ children, scale = 1.05, className = '' }: HoverScaleProps) {
    return (
        <motion.div
            className={`hover-scale ${className}`}
            whileHover={{ scale }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
            {children}
        </motion.div>
    )
}

// Tap Scale
interface TapScaleProps {
    children: ReactNode
    scale?: number
    className?: string
}

export function TapScale({ children, scale = 0.97, className = '' }: TapScaleProps) {
    return (
        <motion.div
            className={`tap-scale ${className}`}
            whileTap={{ scale }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
            {children}
        </motion.div>
    )
}

// Animated Counter
interface AnimatedCounterProps {
    value: number
    duration?: number
    prefix?: string
    suffix?: string
    decimals?: number
    className?: string
}

export function AnimatedCounter({
    value,
    duration = 1,
    prefix = '',
    suffix = '',
    decimals = 0,
    className = ''
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0)
    const previousValue = useRef(0)

    useEffect(() => {
        const start = previousValue.current
        const end = value
        const startTime = Date.now()
        const endTime = startTime + duration * 1000

        const animate = () => {
            const now = Date.now()
            if (now >= endTime) {
                setDisplayValue(end)
                previousValue.current = end
                return
            }

            const progress = (now - startTime) / (duration * 1000)
            const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
            const current = start + (end - start) * eased
            setDisplayValue(current)
            requestAnimationFrame(animate)
        }

        animate()
    }, [value, duration])

    return (
        <span className={`animated-counter ${className}`}>
            {prefix}{displayValue.toFixed(decimals)}{suffix}
        </span>
    )
}

// Typewriter Effect
interface TypewriterProps {
    text: string
    speed?: number
    delay?: number
    cursor?: boolean
    onComplete?: () => void
    className?: string
}

export function Typewriter({
    text,
    speed = 50,
    delay = 0,
    cursor = true,
    onComplete,
    className = ''
}: TypewriterProps) {
    const [displayText, setDisplayText] = useState('')
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        let timeout: NodeJS.Timeout
        let index = 0

        const startTyping = () => {
            if (index < text.length) {
                setDisplayText(text.slice(0, index + 1))
                index++
                timeout = setTimeout(startTyping, speed)
            } else {
                setIsComplete(true)
                onComplete?.()
            }
        }

        const delayTimeout = setTimeout(startTyping, delay)

        return () => {
            clearTimeout(delayTimeout)
            clearTimeout(timeout)
        }
    }, [text, speed, delay, onComplete])

    return (
        <span className={`typewriter ${className}`}>
            {displayText}
            {cursor && !isComplete && <span className="typewriter__cursor">|</span>}
        </span>
    )
}

// Parallax Scroll
interface ParallaxProps {
    children: ReactNode
    speed?: number
    className?: string
}

export function Parallax({ children, speed = 0.5, className = '' }: ParallaxProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [offset, setOffset] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            if (!ref.current) return
            const rect = ref.current.getBoundingClientRect()
            const scrolled = window.innerHeight - rect.top
            setOffset(scrolled * speed * 0.1)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [speed])

    return (
        <div ref={ref} className={`parallax ${className}`}>
            <div style={{ transform: `translateY(${offset}px)` }}>
                {children}
            </div>
        </div>
    )
}

// Shimmer Effect
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

// Pulse Animation
interface PulseProps {
    children: ReactNode
    duration?: number
    scale?: number
    className?: string
}

export function Pulse({ children, duration = 2, scale = 1.05, className = '' }: PulseProps) {
    return (
        <motion.div
            className={`pulse ${className}`}
            animate={{ scale: [1, scale, 1] }}
            transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    )
}

// Bounce
interface BounceProps {
    children: ReactNode
    height?: number
    duration?: number
    className?: string
}

export function Bounce({ children, height = 10, duration = 0.5, className = '' }: BounceProps) {
    return (
        <motion.div
            className={`bounce ${className}`}
            animate={{ y: [0, -height, 0] }}
            transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    )
}

export default { FadeInView, StaggeredList, PageTransition, HoverScale, TapScale, AnimatedCounter, Typewriter, Parallax, Shimmer, Pulse, Bounce }
