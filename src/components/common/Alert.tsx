import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import './Alert.css'

type AlertType = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
    type?: AlertType
    title?: string
    children: ReactNode
    icon?: ReactNode
    dismissible?: boolean
    onDismiss?: () => void
    action?: ReactNode
    className?: string
}

export function Alert({
    type = 'info',
    title,
    children,
    icon,
    dismissible = false,
    onDismiss,
    action,
    className = ''
}: AlertProps) {
    const getDefaultIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={18} />
            case 'warning': return <AlertTriangle size={18} />
            case 'error': return <AlertCircle size={18} />
            default: return <Info size={18} />
        }
    }

    return (
        <motion.div
            className={`alert alert--${type} ${className}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            role="alert"
        >
            <div className="alert__icon">
                {icon || getDefaultIcon()}
            </div>
            <div className="alert__content">
                {title && <div className="alert__title">{title}</div>}
                <div className="alert__message">{children}</div>
            </div>
            {action && <div className="alert__action">{action}</div>}
            {dismissible && (
                <button className="alert__dismiss" onClick={onDismiss} aria-label="Dismiss">
                    <X size={16} />
                </button>
            )}
        </motion.div>
    )
}

// Full-width alert banner
interface AlertBannerProps {
    type?: AlertType
    children: ReactNode
    dismissible?: boolean
    onDismiss?: () => void
    className?: string
}

export function AlertBanner({
    type = 'info',
    children,
    dismissible = false,
    onDismiss,
    className = ''
}: AlertBannerProps) {
    return (
        <AnimatePresence>
            <motion.div
                className={`alert-banner alert-banner--${type} ${className}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
            >
                <div className="alert-banner__content">
                    {children}
                </div>
                {dismissible && (
                    <button className="alert-banner__dismiss" onClick={onDismiss}>
                        <X size={16} />
                    </button>
                )}
            </motion.div>
        </AnimatePresence>
    )
}

export default Alert
