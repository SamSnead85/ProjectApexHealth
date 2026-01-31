import { useState, useRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Tooltip.css'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
    content: ReactNode
    children: ReactNode
    position?: TooltipPosition
    delay?: number
    className?: string
}

export function Tooltip({
    content,
    children,
    position = 'top',
    delay = 200,
    className = ''
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => setIsVisible(true), delay)
    }

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setIsVisible(false)
    }

    const positionVariants = {
        top: { x: '-50%', y: -8 },
        bottom: { x: '-50%', y: 8 },
        left: { x: -8, y: '-50%' },
        right: { x: 8, y: '-50%' }
    }

    const originMap = {
        top: 'bottom center',
        bottom: 'top center',
        left: 'center right',
        right: 'center left'
    }

    return (
        <div
            className={`tooltip-wrapper ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className={`tooltip tooltip--${position}`}
                        initial={{ opacity: 0, scale: 0.9, ...positionVariants[position] }}
                        animate={{ opacity: 1, scale: 1, ...positionVariants[position] }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        style={{ transformOrigin: originMap[position] }}
                    >
                        {content}
                        <div className={`tooltip__arrow tooltip__arrow--${position}`} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Tooltip
