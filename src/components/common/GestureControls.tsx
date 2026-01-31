import { ReactNode, useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion'
import { MousePointer, Hand, Grab, Crosshair, Move, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import './GestureControls.css'

// Swipeable Container
interface SwipeableProps {
    children: ReactNode
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
    threshold?: number
    className?: string
}

export function Swipeable({
    children,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    className = ''
}: SwipeableProps) {
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const [swiped, setSwiped] = useState(false)

    const handleDragEnd = (_: any, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
        if (swiped) return

        const { offset, velocity } = info
        const swipe = Math.abs(offset.x) > Math.abs(offset.y) ? 'horizontal' : 'vertical'

        if (swipe === 'horizontal') {
            if (offset.x > threshold || velocity.x > 500) {
                onSwipeRight?.()
                setSwiped(true)
            } else if (offset.x < -threshold || velocity.x < -500) {
                onSwipeLeft?.()
                setSwiped(true)
            }
        } else {
            if (offset.y > threshold || velocity.y > 500) {
                onSwipeDown?.()
                setSwiped(true)
            } else if (offset.y < -threshold || velocity.y < -500) {
                onSwipeUp?.()
                setSwiped(true)
            }
        }

        setTimeout(() => setSwiped(false), 100)
    }

    return (
        <motion.div
            className={`swipeable ${className}`}
            style={{ x, y }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
        >
            {children}
        </motion.div>
    )
}

// Pinch to Zoom
interface PinchZoomProps {
    children: ReactNode
    minScale?: number
    maxScale?: number
    onZoomChange?: (scale: number) => void
    className?: string
}

export function PinchZoom({
    children,
    minScale = 1,
    maxScale = 3,
    onZoomChange,
    className = ''
}: PinchZoomProps) {
    const [scale, setScale] = useState(1)
    const [origin, setOrigin] = useState({ x: 0.5, y: 0.5 })
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        let initialDistance = 0
        let initialScale = 1

        const getDistance = (touches: TouchList) => {
            return Math.hypot(
                touches[0].clientX - touches[1].clientX,
                touches[0].clientY - touches[1].clientY
            )
        }

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                initialDistance = getDistance(e.touches)
                initialScale = scale
            }
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault()
                const currentDistance = getDistance(e.touches)
                const delta = currentDistance / initialDistance
                const newScale = Math.min(maxScale, Math.max(minScale, initialScale * delta))
                setScale(newScale)
                onZoomChange?.(newScale)

                // Set origin to center of pinch
                const rect = container.getBoundingClientRect()
                const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
                const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2
                setOrigin({
                    x: (centerX - rect.left) / rect.width,
                    y: (centerY - rect.top) / rect.height
                })
            }
        }

        container.addEventListener('touchstart', handleTouchStart, { passive: true })
        container.addEventListener('touchmove', handleTouchMove, { passive: false })

        return () => {
            container.removeEventListener('touchstart', handleTouchStart)
            container.removeEventListener('touchmove', handleTouchMove)
        }
    }, [scale, minScale, maxScale, onZoomChange])

    return (
        <div ref={containerRef} className={`pinch-zoom ${className}`}>
            <div
                className="pinch-zoom__content"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: `${origin.x * 100}% ${origin.y * 100}%`
                }}
            >
                {children}
            </div>
        </div>
    )
}

// Long Press
interface LongPressProps {
    children: ReactNode
    onLongPress: () => void
    duration?: number
    className?: string
}

export function LongPress({ children, onLongPress, duration = 500, className = '' }: LongPressProps) {
    const timeoutRef = useRef<NodeJS.Timeout>()
    const [pressing, setPressing] = useState(false)

    const handleStart = () => {
        setPressing(true)
        timeoutRef.current = setTimeout(() => {
            onLongPress()
            setPressing(false)
        }, duration)
    }

    const handleEnd = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        setPressing(false)
    }

    return (
        <div
            className={`long-press ${pressing ? 'long-press--active' : ''} ${className}`}
            onMouseDown={handleStart}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchEnd={handleEnd}
        >
            {children}
            {pressing && (
                <div className="long-press__indicator">
                    <div
                        className="long-press__progress"
                        style={{ animationDuration: `${duration}ms` }}
                    />
                </div>
            )}
        </div>
    )
}

// Double Tap
interface DoubleTapProps {
    children: ReactNode
    onDoubleTap: () => void
    onSingleTap?: () => void
    delay?: number
    className?: string
}

export function DoubleTap({
    children,
    onDoubleTap,
    onSingleTap,
    delay = 300,
    className = ''
}: DoubleTapProps) {
    const lastTap = useRef(0)
    const singleTapTimeout = useRef<NodeJS.Timeout>()

    const handleTap = () => {
        const now = Date.now()
        const timeDiff = now - lastTap.current

        if (singleTapTimeout.current) {
            clearTimeout(singleTapTimeout.current)
        }

        if (timeDiff < delay && timeDiff > 0) {
            onDoubleTap()
        } else {
            singleTapTimeout.current = setTimeout(() => {
                onSingleTap?.()
            }, delay)
        }

        lastTap.current = now
    }

    return (
        <div className={`double-tap ${className}`} onClick={handleTap}>
            {children}
        </div>
    )
}

// Draggable Item
interface DraggableProps {
    children: ReactNode
    bounds?: 'parent' | { left: number; right: number; top: number; bottom: number }
    axis?: 'x' | 'y' | 'both'
    onDragStart?: () => void
    onDragEnd?: (position: { x: number; y: number }) => void
    className?: string
}

export function Draggable({
    children,
    bounds = 'parent',
    axis = 'both',
    onDragStart,
    onDragEnd,
    className = ''
}: DraggableProps) {
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const dragConstraints = bounds === 'parent' ? bounds : {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom
    }

    const dragDirections = axis === 'both' ? true : axis

    return (
        <motion.div
            className={`draggable ${className}`}
            style={{ x: axis !== 'y' ? x : 0, y: axis !== 'x' ? y : 0 }}
            drag={dragDirections}
            dragConstraints={dragConstraints}
            dragElastic={0.05}
            onDragStart={onDragStart}
            onDragEnd={(_, info) => onDragEnd?.({ x: info.point.x, y: info.point.y })}
            whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
        >
            {children}
        </motion.div>
    )
}

// Rotatable
interface RotatableProps {
    children: ReactNode
    onRotate?: (angle: number) => void
    className?: string
}

export function Rotatable({ children, onRotate, className = '' }: RotatableProps) {
    const [rotation, setRotation] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const startAngle = useRef(0)
    const startRotation = useRef(0)

    const getAngle = (x: number, y: number) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return 0

        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        return Math.atan2(y - centerY, x - centerX) * (180 / Math.PI)
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        startAngle.current = getAngle(e.clientX, e.clientY)
        startRotation.current = rotation

        const handleMouseMove = (e: MouseEvent) => {
            const currentAngle = getAngle(e.clientX, e.clientY)
            const newRotation = startRotation.current + (currentAngle - startAngle.current)
            setRotation(newRotation)
            onRotate?.(newRotation)
        }

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    return (
        <div
            ref={containerRef}
            className={`rotatable ${className}`}
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <div className="rotatable__content">{children}</div>
            <div className="rotatable__handle" onMouseDown={handleMouseDown}>
                <RotateCw size={14} />
            </div>
        </div>
    )
}

// Touch Ripple
interface TouchRippleProps {
    children: ReactNode
    color?: string
    duration?: number
    className?: string
}

export function TouchRipple({
    children,
    color = 'rgba(6, 182, 212, 0.3)',
    duration = 600,
    className = ''
}: TouchRippleProps) {
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
    const containerRef = useRef<HTMLDivElement>(null)

    const addRipple = (e: React.MouseEvent | React.TouchEvent) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = 'touches' in e
            ? e.touches[0].clientX - rect.left
            : e.clientX - rect.left
        const y = 'touches' in e
            ? e.touches[0].clientY - rect.top
            : e.clientY - rect.top

        const id = Date.now()
        setRipples(prev => [...prev, { id, x, y }])

        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id))
        }, duration)
    }

    return (
        <div
            ref={containerRef}
            className={`touch-ripple ${className}`}
            onMouseDown={addRipple}
            onTouchStart={addRipple}
        >
            {children}
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className="touch-ripple__effect"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        backgroundColor: color,
                        animationDuration: `${duration}ms`
                    }}
                />
            ))}
        </div>
    )
}

export default { Swipeable, PinchZoom, LongPress, DoubleTap, Draggable, Rotatable, TouchRipple }
