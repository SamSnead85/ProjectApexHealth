import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Bell,
    X,
    Check,
    AlertCircle,
    Info,
    Calendar,
    FileText,
    MessageSquare,
    Pill,
    CreditCard,
    ChevronRight,
    Settings,
    Trash2,
    CheckCheck
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './NotificationCenter.css'

// Notification types
interface Notification {
    id: string
    type: 'appointment' | 'message' | 'document' | 'medication' | 'claim' | 'system' | 'alert'
    title: string
    message: string
    timestamp: Date
    read: boolean
    priority: 'high' | 'normal' | 'low'
    action?: {
        label: string
        onClick?: () => void
    }
}

const mockNotifications: Notification[] = [
    {
        id: 'n1',
        type: 'appointment',
        title: 'Upcoming Appointment',
        message: 'Annual Physical with Dr. Sarah Chen tomorrow at 10:30 AM',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        priority: 'high',
        action: { label: 'View Details' }
    },
    {
        id: 'n2',
        type: 'medication',
        title: 'Refill Reminder',
        message: 'Lisinopril 10mg refill needed in 5 days',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        priority: 'high',
        action: { label: 'Request Refill' }
    },
    {
        id: 'n3',
        type: 'document',
        title: 'New Lab Results',
        message: 'Your Comprehensive Metabolic Panel results are ready',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: true,
        priority: 'normal',
        action: { label: 'View Results' }
    },
    {
        id: 'n4',
        type: 'claim',
        title: 'Claim Processed',
        message: 'Your claim #CLM-2024-0156 has been processed. Amount: $125.00',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: true,
        priority: 'normal',
        action: { label: 'View EOB' }
    },
    {
        id: 'n5',
        type: 'message',
        title: 'New Message',
        message: 'Dr. Rivera sent you a message about your recent blood work',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        read: true,
        priority: 'normal',
        action: { label: 'Reply' }
    }
]

const typeIcons: Record<string, React.ReactNode> = {
    appointment: <Calendar size={18} />,
    message: <MessageSquare size={18} />,
    document: <FileText size={18} />,
    medication: <Pill size={18} />,
    claim: <CreditCard size={18} />,
    system: <Info size={18} />,
    alert: <AlertCircle size={18} />
}

const typeColors: Record<string, string> = {
    appointment: 'var(--apex-teal)',
    message: 'var(--apex-purple)',
    document: 'var(--apex-info)',
    medication: 'var(--apex-warning)',
    claim: 'var(--apex-success)',
    system: 'var(--apex-steel)',
    alert: 'var(--apex-danger)'
}

interface NotificationCenterProps {
    isOpen: boolean
    onClose: () => void
    notifications?: Notification[]
}

export function NotificationCenter({
    isOpen,
    onClose,
    notifications = mockNotifications
}: NotificationCenterProps) {
    const [items, setItems] = useState(notifications)
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    const unreadCount = items.filter(n => !n.read).length
    const filteredItems = filter === 'unread' ? items.filter(n => !n.read) : items

    const markAsRead = (id: string) => {
        setItems(items.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const markAllAsRead = () => {
        setItems(items.map(n => ({ ...n, read: true })))
    }

    const deleteNotification = (id: string) => {
        setItems(items.filter(n => n.id !== id))
    }

    const formatTime = (date: Date) => {
        const diff = Date.now() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        return `${days}d ago`
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="notification-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        className="notification-center"
                        initial={{ opacity: 0, x: 320 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 320 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div className="notification-center__header">
                            <div className="notification-center__title">
                                <Bell size={20} />
                                <h2>Notifications</h2>
                                {unreadCount > 0 && (
                                    <Badge variant="teal" size="sm">{unreadCount}</Badge>
                                )}
                            </div>
                            <div className="notification-center__actions">
                                <button className="icon-btn" onClick={markAllAsRead} title="Mark all as read">
                                    <CheckCheck size={18} />
                                </button>
                                <button className="icon-btn" title="Settings">
                                    <Settings size={18} />
                                </button>
                                <button className="icon-btn" onClick={onClose}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="notification-center__filters">
                            <button
                                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All
                            </button>
                            <button
                                className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                                onClick={() => setFilter('unread')}
                            >
                                Unread ({unreadCount})
                            </button>
                        </div>

                        {/* Notifications List */}
                        <div className="notification-center__list">
                            <AnimatePresence>
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((notification, index) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            transition={{ delay: index * 0.03 }}
                                            className={`notification-item ${notification.read ? '' : 'unread'} priority-${notification.priority}`}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div
                                                className="notification-item__icon"
                                                style={{ color: typeColors[notification.type] }}
                                            >
                                                {typeIcons[notification.type]}
                                            </div>
                                            <div className="notification-item__content">
                                                <div className="notification-item__header">
                                                    <h4>{notification.title}</h4>
                                                    <span className="notification-item__time">
                                                        {formatTime(notification.timestamp)}
                                                    </span>
                                                </div>
                                                <p>{notification.message}</p>
                                                {notification.action && (
                                                    <button className="notification-item__action">
                                                        {notification.action.label}
                                                        <ChevronRight size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                className="notification-item__delete"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    deleteNotification(notification.id)
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="notification-center__empty">
                                        <Bell size={32} />
                                        <p>No {filter === 'unread' ? 'unread ' : ''}notifications</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default NotificationCenter
