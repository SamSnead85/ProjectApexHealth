import { ReactNode, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, CheckCircle2, Info, AlertCircle, Sparkles } from 'lucide-react'
import './PremiumModals.css'

// ============================================
// PREMIUM MODAL
// ============================================
interface PremiumModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    subtitle?: string
    children: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    showClose?: boolean
    closeOnOverlay?: boolean
    closeOnEsc?: boolean
    footer?: ReactNode
    icon?: ReactNode
}

export function PremiumModal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    size = 'md',
    showClose = true,
    closeOnOverlay = true,
    closeOnEsc = true,
    footer,
    icon
}: PremiumModalProps) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEsc) {
            onClose()
        }
    }, [closeOnEsc, onClose])

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isOpen, handleKeyDown])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="premium-modal">
                    <motion.div
                        className="premium-modal__overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeOnOverlay ? onClose : undefined}
                    />
                    <motion.div
                        className={`premium-modal__container premium-modal__container--${size}`}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {(title || showClose) && (
                            <div className="premium-modal__header">
                                {icon && <div className="premium-modal__icon">{icon}</div>}
                                <div className="premium-modal__header-text">
                                    {title && <h2 className="premium-modal__title">{title}</h2>}
                                    {subtitle && <p className="premium-modal__subtitle">{subtitle}</p>}
                                </div>
                                {showClose && (
                                    <button className="premium-modal__close" onClick={onClose}>
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="premium-modal__body">
                            {children}
                        </div>
                        {footer && (
                            <div className="premium-modal__footer">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

// ============================================
// CONFIRMATION DIALOG
// ============================================
interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    variant?: 'danger' | 'warning' | 'info' | 'success'
    confirmLabel?: string
    cancelLabel?: string
    isLoading?: boolean
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    variant = 'warning',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isLoading
}: ConfirmDialogProps) {
    const icons = {
        danger: <AlertCircle size={24} />,
        warning: <AlertTriangle size={24} />,
        info: <Info size={24} />,
        success: <CheckCircle2 size={24} />
    }

    return (
        <PremiumModal
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
            showClose={false}
        >
            <div className={`confirm-dialog confirm-dialog--${variant}`}>
                <div className={`confirm-dialog__icon confirm-dialog__icon--${variant}`}>
                    {icons[variant]}
                </div>
                <h3 className="confirm-dialog__title">{title}</h3>
                <p className="confirm-dialog__message">{message}</p>
                <div className="confirm-dialog__actions">
                    <button
                        className="confirm-dialog__btn confirm-dialog__btn--cancel"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className={`confirm-dialog__btn confirm-dialog__btn--${variant}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : confirmLabel}
                    </button>
                </div>
            </div>
        </PremiumModal>
    )
}

// ============================================
// SLIDE OVER PANEL
// ============================================
interface SlideOverProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    subtitle?: string
    children: ReactNode
    position?: 'left' | 'right'
    size?: 'sm' | 'md' | 'lg' | 'xl'
    footer?: ReactNode
}

export function SlideOver({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    position = 'right',
    size = 'md',
    footer
}: SlideOverProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const slideVariants = {
        left: { x: '-100%' },
        right: { x: '100%' }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="slide-over">
                    <motion.div
                        className="slide-over__overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={`slide-over__panel slide-over__panel--${position} slide-over__panel--${size}`}
                        initial={slideVariants[position]}
                        animate={{ x: 0 }}
                        exit={slideVariants[position]}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className="slide-over__header">
                            <div className="slide-over__header-text">
                                {title && <h2 className="slide-over__title">{title}</h2>}
                                {subtitle && <p className="slide-over__subtitle">{subtitle}</p>}
                            </div>
                            <button className="slide-over__close" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="slide-over__body">
                            {children}
                        </div>
                        {footer && (
                            <div className="slide-over__footer">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

// ============================================
// SUCCESS CELEBRATION
// ============================================
interface SuccessCelebrationProps {
    isOpen: boolean
    onClose: () => void
    title: string
    message?: string
    action?: {
        label: string
        onClick: () => void
    }
}

export function SuccessCelebration({
    isOpen,
    onClose,
    title,
    message,
    action
}: SuccessCelebrationProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="success-celebration"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="success-celebration__content"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: 'spring', damping: 15 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <motion.div
                            className="success-celebration__icon"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                            transition={{ delay: 0.2, type: 'spring' }}
                        >
                            <CheckCircle2 size={64} />
                        </motion.div>
                        <motion.div
                            className="success-celebration__sparkles"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Sparkles className="sparkle sparkle--1" size={20} />
                            <Sparkles className="sparkle sparkle--2" size={16} />
                            <Sparkles className="sparkle sparkle--3" size={24} />
                            <Sparkles className="sparkle sparkle--4" size={18} />
                        </motion.div>
                        <motion.h2
                            className="success-celebration__title"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {title}
                        </motion.h2>
                        {message && (
                            <motion.p
                                className="success-celebration__message"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {message}
                            </motion.p>
                        )}
                        {action && (
                            <motion.button
                                className="success-celebration__action"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                onClick={action.onClick}
                            >
                                {action.label}
                            </motion.button>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// ============================================
// COMMAND DIALOG
// ============================================
interface CommandDialogProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description?: string
    children: ReactNode
}

export function CommandDialog({
    isOpen,
    onClose,
    title,
    description,
    children
}: CommandDialogProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="command-dialog">
                    <motion.div
                        className="command-dialog__overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="command-dialog__container"
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="command-dialog__header">
                            <h3 className="command-dialog__title">{title}</h3>
                            {description && (
                                <p className="command-dialog__description">{description}</p>
                            )}
                        </div>
                        <div className="command-dialog__content">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default {
    PremiumModal,
    ConfirmDialog,
    SlideOver,
    SuccessCelebration,
    CommandDialog
}
