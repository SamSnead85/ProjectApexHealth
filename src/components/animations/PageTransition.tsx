import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'

// Page transition variants
export const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.98,
        transition: {
            duration: 0.2
        }
    }
}

// Fade variants
export const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
}

// Slide variants
export const slideUpVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } }
}

export const slideDownVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
}

export const slideInRightVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: 100, transition: { duration: 0.2 } }
}

export const slideInLeftVariants = {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }
}

// Scale variants
export const scaleVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
}

// Staggered container
export const staggerContainerVariants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
}

// Staggered item
export const staggerItemVariants = {
    initial: { opacity: 0, y: 15 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut'
        }
    }
}

// Card hover
export const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2, ease: 'easeOut' }
    },
    tap: { scale: 0.98 }
}

// Button animations
export const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.97 }
}

// Page Transition Component
interface PageTransitionProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode
    variant?: 'page' | 'fade' | 'slideUp' | 'slideDown' | 'scale'
}

export function PageTransition({
    children,
    variant = 'page',
    ...props
}: PageTransitionProps) {
    const variants = {
        page: pageVariants,
        fade: fadeVariants,
        slideUp: slideUpVariants,
        slideDown: slideDownVariants,
        scale: scaleVariants
    }

    return (
        <motion.div
            variants={variants[variant]}
            initial="initial"
            animate="animate"
            exit="exit"
            {...props}
        >
            {children}
        </motion.div>
    )
}

// Staggered List
interface StaggeredListProps {
    children: React.ReactNode[]
    className?: string
    delay?: number
}

export function StaggeredList({ children, className, delay = 0 }: StaggeredListProps) {
    return (
        <motion.div
            className={className}
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
            transition={{ delayChildren: delay }}
        >
            {React.Children.map(children, (child) => (
                <motion.div variants={staggerItemVariants}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    )
}

// Animated Card
interface AnimatedCardProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode
}

export function AnimatedCard({ children, ...props }: AnimatedCardProps) {
    return (
        <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            {...props}
        >
            {children}
        </motion.div>
    )
}

// Fade In When Visible
interface FadeInWhenVisibleProps {
    children: React.ReactNode
    delay?: number
    className?: string
}

export function FadeInWhenVisible({ children, delay = 0, className }: FadeInWhenVisibleProps) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    )
}

// Success animation
export const successAnimation = {
    initial: { scale: 0, rotate: -180 },
    animate: {
        scale: 1,
        rotate: 0,
        transition: {
            type: 'spring',
            stiffness: 260,
            damping: 20
        }
    }
}

// Error shake animation
export const errorShakeAnimation = {
    animate: {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
    }
}

// Pulse animation for important elements
export const pulseAnimation = {
    animate: {
        scale: [1, 1.02, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop' as const
        }
    }
}

export default PageTransition
