import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react'
import './NotificationBell.css'

interface Notification {
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    time: string
    read: boolean
}

interface NotificationBellProps {
    notifications?: Notification[]
    onMarkAsRead?: (id: string) => void
    onMarkAllRead?: () => void
    onClear?: (id: string) => void
    className?: string
}

const mockNotifications: Notification[] = [
    { id: '1', type: 'success', title: 'Enrollment Complete', message: 'John Doe has completed enrollment', time: '5 min ago', read: false },
    { id: '2', type: 'warning', title: 'Renewal Due', message: 'Acme Corp renewal due in 30 days', time: '1 hour ago', read: false },
    { id: '3', type: 'info', title: 'New Feature', message: 'Check out the new analytics dashboard', time: '2 hours ago', read: true },
]

export function NotificationBell({
    notifications = mockNotifications,
    onMarkAsRead,
    onMarkAllRead,
    onClear,
    className = ''
}: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const unreadCount = notifications.filter(n => !n.read).length

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} />
            case 'warning': return <AlertCircle size={16} />
            case 'error': return <AlertCircle size={16} />
            default: return <Info size={16} />
        }
    }

    return (
        <div className={`notification-bell ${className}`} ref={dropdownRef}>
            <motion.button
                className="notification-bell__trigger"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Bell size={18} />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            className="notification-bell__badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="notification-bell__dropdown"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                        <div className="notification-bell__header">
                            <h4 className="notification-bell__title">Notifications</h4>
                            {unreadCount > 0 && (
                                <button
                                    className="notification-bell__mark-all"
                                    onClick={() => { onMarkAllRead?.(); }}
                                >
                                    <Check size={14} />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="notification-bell__list">
                            {notifications.length === 0 ? (
                                <div className="notification-bell__empty">
                                    <Bell size={32} />
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <motion.div
                                        key={notification.id}
                                        className={`notification-bell__item notification-bell__item--${notification.type} ${notification.read ? 'notification-bell__item--read' : ''}`}
                                        onClick={() => onMarkAsRead?.(notification.id)}
                                        layout
                                    >
                                        <div className="notification-bell__item-icon">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="notification-bell__item-content">
                                            <div className="notification-bell__item-title">{notification.title}</div>
                                            <div className="notification-bell__item-message">{notification.message}</div>
                                            <div className="notification-bell__item-time">{notification.time}</div>
                                        </div>
                                        <button
                                            className="notification-bell__item-close"
                                            onClick={(e) => { e.stopPropagation(); onClear?.(notification.id); }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <div className="notification-bell__footer">
                            <button className="notification-bell__view-all">
                                View all notifications
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default NotificationBell
