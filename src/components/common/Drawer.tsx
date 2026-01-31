import { ReactNode, useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import './Drawer.css'

interface DrawerProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    subtitle?: string
    children: ReactNode
    position?: 'left' | 'right' | 'bottom'
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    showOverlay?: boolean
    closeOnOverlayClick?: boolean
    closeOnEscape?: boolean
    showCloseButton?: boolean
    footer?: ReactNode
    className?: string
}

const sizeMap = {
    sm: 320,
    md: 400,
    lg: 540,
    xl: 720,
    full: '100%'
}

export function Drawer({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    position = 'right',
    size = 'md',
    showOverlay = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    footer,
    className = ''
}: DrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!closeOnEscape) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose, closeOnEscape])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const getVariants = () => {
        const sizeValue = typeof sizeMap[size] === 'number' ? `${sizeMap[size]}px` : sizeMap[size]

        switch (position) {
            case 'left':
                return {
                    hidden: { x: '-100%' },
                    visible: { x: 0 },
                    exit: { x: '-100%' }
                }
            case 'bottom':
                return {
                    hidden: { y: '100%' },
                    visible: { y: 0 },
                    exit: { y: '100%' }
                }
            default: // right
                return {
                    hidden: { x: '100%' },
                    visible: { x: 0 },
                    exit: { x: '100%' }
                }
        }
    }

    const getStyle = (): React.CSSProperties => {
        const sizeValue = typeof sizeMap[size] === 'number' ? `${sizeMap[size]}px` : sizeMap[size]

        if (position === 'bottom') {
            return { height: sizeValue, width: '100%' }
        }
        return { width: sizeValue }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {showOverlay && (
                        <motion.div
                            className="drawer__overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeOnOverlayClick ? onClose : undefined}
                        />
                    )}

                    <motion.div
                        ref={drawerRef}
                        className={`drawer drawer--${position} ${className}`}
                        style={getStyle()}
                        variants={getVariants()}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {(title || showCloseButton) && (
                            <div className="drawer__header">
                                <div className="drawer__header-content">
                                    {title && <h2 className="drawer__title">{title}</h2>}
                                    {subtitle && <p className="drawer__subtitle">{subtitle}</p>}
                                </div>
                                {showCloseButton && (
                                    <button className="drawer__close" onClick={onClose}>
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="drawer__body">
                            {children}
                        </div>

                        {footer && (
                            <div className="drawer__footer">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default Drawer
