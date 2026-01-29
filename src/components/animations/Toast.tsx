import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'
import './Toast.css'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
    id: string
    type: ToastType
    title: string
    message?: string
    duration?: number
    onClose: (id: string) => void
}

const toastIcons = {
    success: <CheckCircle2 size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />
}

export function Toast({ id, type, title, message, onClose }: ToastProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className={`toast toast--${type}`}
        >
            <div className="toast__icon">
                {toastIcons[type]}
            </div>
            <div className="toast__content">
                <h4 className="toast__title">{title}</h4>
                {message && <p className="toast__message">{message}</p>}
            </div>
            <button className="toast__close" onClick={() => onClose(id)}>
                <X size={16} />
            </button>
            <motion.div
                className="toast__progress"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 4, ease: 'linear' }}
                onAnimationComplete={() => onClose(id)}
            />
        </motion.div>
    )
}

// Toast Container
interface ToastContainerProps {
    toasts: Array<{
        id: string
        type: ToastType
        title: string
        message?: string
    }>
    onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div className="toast-container">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={onClose}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}

export default Toast
