import { ReactNode, useState, useEffect, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, XCircle, X, ChevronRight } from 'lucide-react'
import './InlineNotification.css'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface InlineNotificationProps {
    type?: NotificationType
    title: string
    message?: string
    action?: { label: string; onClick: () => void }
    dismissible?: boolean
    onDismiss?: () => void
    icon?: ReactNode
    className?: string
}

export function InlineNotification({
    type = 'info',
    title,
    message,
    action,
    dismissible = true,
    onDismiss,
    icon,
    className = ''
}: InlineNotificationProps) {
    const [isVisible, setIsVisible] = useState(true)

    const getIcon = () => {
        if (icon) return icon
        switch (type) {
            case 'success': return <CheckCircle2 size={18} />
            case 'error': return <XCircle size={18} />
            case 'warning': return <AlertCircle size={18} />
            default: return <Info size={18} />
        }
    }

    const handleDismiss = () => {
        setIsVisible(false)
        onDismiss?.()
    }

    if (!isVisible) return null

    return (
        <motion.div
            className={`inline-notification inline-notification--${type} ${className}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <span className="inline-notification__icon">{getIcon()}</span>
            <div className="inline-notification__content">
                <span className="inline-notification__title">{title}</span>
                {message && <span className="inline-notification__message">{message}</span>}
            </div>
            {action && (
                <button className="inline-notification__action" onClick={action.onClick}>
                    {action.label}
                    <ChevronRight size={14} />
                </button>
            )}
            {dismissible && (
                <button className="inline-notification__dismiss" onClick={handleDismiss}>
                    <X size={16} />
                </button>
            )}
        </motion.div>
    )
}

// Floating notification stack
interface FloatingNotification {
    id: string
    type: NotificationType
    title: string
    message?: string
    duration?: number
    action?: { label: string; onClick: () => void }
}

interface NotificationContextType {
    notifications: FloatingNotification[]
    addNotification: (notification: Omit<FloatingNotification, 'id'>) => void
    removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider')
    }
    return context
}

interface NotificationProviderProps {
    children: ReactNode
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
    maxNotifications?: number
}

export function NotificationProvider({
    children,
    position = 'top-right',
    maxNotifications = 5
}: NotificationProviderProps) {
    const [notifications, setNotifications] = useState<FloatingNotification[]>([])

    const addNotification = useCallback((notification: Omit<FloatingNotification, 'id'>) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newNotification = { ...notification, id }

        setNotifications(prev => {
            const updated = [...prev, newNotification]
            if (updated.length > maxNotifications) {
                return updated.slice(-maxNotifications)
            }
            return updated
        })

        if (notification.duration !== 0) {
            setTimeout(() => {
                removeNotification(id)
            }, notification.duration || 5000)
        }
    }, [maxNotifications])

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }, [])

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}
            <div className={`notification-stack notification-stack--${position}`}>
                <AnimatePresence mode="popLayout">
                    {notifications.map(notification => (
                        <motion.div
                            key={notification.id}
                            layout
                            initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <InlineNotification
                                type={notification.type}
                                title={notification.title}
                                message={notification.message}
                                action={notification.action}
                                onDismiss={() => removeNotification(notification.id)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    )
}

// Progress notification
interface ProgressNotificationProps {
    title: string
    progress: number
    status?: 'pending' | 'processing' | 'complete' | 'error'
    onCancel?: () => void
    className?: string
}

export function ProgressNotification({
    title,
    progress,
    status = 'processing',
    onCancel,
    className = ''
}: ProgressNotificationProps) {
    return (
        <div className={`progress-notification progress-notification--${status} ${className}`}>
            <div className="progress-notification__header">
                <span className="progress-notification__title">{title}</span>
                <span className="progress-notification__percent">{Math.round(progress)}%</span>
            </div>
            <div className="progress-notification__bar">
                <motion.div
                    className="progress-notification__fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>
            {status === 'processing' && onCancel && (
                <button className="progress-notification__cancel" onClick={onCancel}>
                    Cancel
                </button>
            )}
        </div>
    )
}

export default InlineNotification
