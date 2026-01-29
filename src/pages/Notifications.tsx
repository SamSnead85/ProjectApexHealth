import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    FileText,
    Shield,
    CreditCard,
    Calendar,
    Heart,
    AlertCircle,
    AlertTriangle,
    Info,
    Settings,
    Trash2,
    Archive,
    Filter,
    Clock
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './Notifications.css'

interface Notification {
    id: string
    type: 'claim' | 'auth' | 'appointment' | 'billing' | 'health' | 'system'
    priority: 'low' | 'medium' | 'high' | 'critical'
    title: string
    message: string
    timestamp: string
    read: boolean
    actionUrl?: string
    actionLabel?: string
}

interface NotificationPreference {
    id: string
    category: string
    email: boolean
    push: boolean
    sms: boolean
}

const mockNotifications: Notification[] = [
    {
        id: 'notif-1',
        type: 'claim',
        priority: 'high',
        title: 'Claim Approved',
        message: 'Your claim CLM-2024-45892 has been approved. Payment of $247.50 will be processed within 3-5 business days.',
        timestamp: '2024-01-26T15:30:00Z',
        read: false,
        actionUrl: '/member/claims',
        actionLabel: 'View Claim'
    },
    {
        id: 'notif-2',
        type: 'auth',
        priority: 'critical',
        title: 'Prior Authorization Required',
        message: 'Your provider has requested prior authorization for MRI Lumbar Spine. Please review and approve.',
        timestamp: '2024-01-26T10:00:00Z',
        read: false,
        actionUrl: '/member/prior-auth',
        actionLabel: 'Review Request'
    },
    {
        id: 'notif-3',
        type: 'appointment',
        priority: 'medium',
        title: 'Appointment Reminder',
        message: 'You have an appointment with Dr. Sarah Chen tomorrow at 10:00 AM.',
        timestamp: '2024-01-25T18:00:00Z',
        read: true
    },
    {
        id: 'notif-4',
        type: 'billing',
        priority: 'medium',
        title: 'New EOB Available',
        message: 'Your Explanation of Benefits for the January 15th office visit is now available.',
        timestamp: '2024-01-24T09:00:00Z',
        read: true,
        actionUrl: '/member/eob',
        actionLabel: 'View EOB'
    },
    {
        id: 'notif-5',
        type: 'health',
        priority: 'low',
        title: 'Preventive Care Reminder',
        message: 'Your annual physical is due. Schedule your appointment to stay on top of your health.',
        timestamp: '2024-01-20T12:00:00Z',
        read: true,
        actionUrl: '/member/providers',
        actionLabel: 'Find Provider'
    },
    {
        id: 'notif-6',
        type: 'system',
        priority: 'low',
        title: 'Password Update Recommended',
        message: 'For your security, we recommend updating your password every 90 days.',
        timestamp: '2024-01-15T08:00:00Z',
        read: true
    }
]

const mockPreferences: NotificationPreference[] = [
    { id: 'pref-1', category: 'Claims Updates', email: true, push: true, sms: false },
    { id: 'pref-2', category: 'Prior Authorization', email: true, push: true, sms: true },
    { id: 'pref-3', category: 'Appointment Reminders', email: true, push: true, sms: true },
    { id: 'pref-4', category: 'Billing & EOBs', email: true, push: false, sms: false },
    { id: 'pref-5', category: 'Health Reminders', email: true, push: true, sms: false },
    { id: 'pref-6', category: 'Marketing', email: false, push: false, sms: false }
]

export function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
    const [preferences, setPreferences] = useState<NotificationPreference[]>(mockPreferences)
    const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'preferences'>('all')
    const [filter, setFilter] = useState<Notification['type'] | 'all'>('all')

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays === 1) return 'Yesterday'
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const getTypeIcon = (type: Notification['type']) => {
        switch (type) {
            case 'claim': return <FileText size={18} />
            case 'auth': return <Shield size={18} />
            case 'appointment': return <Calendar size={18} />
            case 'billing': return <CreditCard size={18} />
            case 'health': return <Heart size={18} />
            case 'system': return <Settings size={18} />
        }
    }

    const getPriorityColor = (priority: Notification['priority']) => {
        switch (priority) {
            case 'low': return 'info'
            case 'medium': return 'warning'
            case 'high': return 'success'
            case 'critical': return 'critical'
        }
    }

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ))
    }

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
    }

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id))
    }

    const togglePreference = (id: string, channel: 'email' | 'push' | 'sms') => {
        setPreferences(preferences.map(p =>
            p.id === id ? { ...p, [channel]: !p[channel] } : p
        ))
    }

    const filteredNotifications = notifications
        .filter(n => {
            if (activeTab === 'unread') return !n.read
            return true
        })
        .filter(n => {
            if (filter === 'all') return true
            return n.type === filter
        })

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="notifications-page">
            {/* Header */}
            <div className="notifications__header">
                <div>
                    <h1 className="notifications__title">Notifications</h1>
                    <p className="notifications__subtitle">
                        Stay updated on your health journey
                    </p>
                </div>
                <div className="notifications__actions">
                    <Button variant="secondary" onClick={markAllAsRead}>
                        Mark All Read
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="notifications__tabs">
                <button
                    className={`notifications__tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All
                </button>
                <button
                    className={`notifications__tab ${activeTab === 'unread' ? 'active' : ''}`}
                    onClick={() => setActiveTab('unread')}
                >
                    Unread
                    {unreadCount > 0 && (
                        <span className="notifications__tab-badge">{unreadCount}</span>
                    )}
                </button>
                <button
                    className={`notifications__tab ${activeTab === 'preferences' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preferences')}
                >
                    Preferences
                </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab !== 'preferences' ? (
                    <motion.div
                        key="notifications"
                        className="notifications__content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {/* Filters */}
                        <div className="notifications__filters">
                            <Filter size={16} />
                            <button
                                className={`notifications__filter ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All
                            </button>
                            <button
                                className={`notifications__filter ${filter === 'claim' ? 'active' : ''}`}
                                onClick={() => setFilter('claim')}
                            >
                                Claims
                            </button>
                            <button
                                className={`notifications__filter ${filter === 'auth' ? 'active' : ''}`}
                                onClick={() => setFilter('auth')}
                            >
                                Auth
                            </button>
                            <button
                                className={`notifications__filter ${filter === 'appointment' ? 'active' : ''}`}
                                onClick={() => setFilter('appointment')}
                            >
                                Appointments
                            </button>
                            <button
                                className={`notifications__filter ${filter === 'health' ? 'active' : ''}`}
                                onClick={() => setFilter('health')}
                            >
                                Health
                            </button>
                        </div>

                        {/* Notification List */}
                        <div className="notifications__list">
                            {filteredNotifications.map((notif, index) => (
                                <motion.div
                                    key={notif.id}
                                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    <div className={`notification-item__icon notification-item__icon--${notif.type}`}>
                                        {getTypeIcon(notif.type)}
                                    </div>
                                    <div className="notification-item__content">
                                        <div className="notification-item__header">
                                            <span className="notification-item__title">{notif.title}</span>
                                            <Badge variant={getPriorityColor(notif.priority)} size="sm">
                                                {notif.priority}
                                            </Badge>
                                        </div>
                                        <p className="notification-item__message">{notif.message}</p>
                                        <div className="notification-item__footer">
                                            <span className="notification-item__time">
                                                <Clock size={12} /> {formatTime(notif.timestamp)}
                                            </span>
                                            {notif.actionLabel && (
                                                <button className="notification-item__action">
                                                    {notif.actionLabel}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="notification-item__actions">
                                        {!notif.read && (
                                            <button
                                                className="notification-item__btn"
                                                onClick={(e) => { e.stopPropagation(); markAsRead(notif.id) }}
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                        <button
                                            className="notification-item__btn notification-item__btn--delete"
                                            onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id) }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}

                            {filteredNotifications.length === 0 && (
                                <div className="notifications__empty">
                                    <Bell size={48} />
                                    <p>No notifications to display</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preferences"
                        className="notifications__content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <GlassCard className="preferences-card">
                            <h3>Notification Preferences</h3>
                            <p className="preferences-card__subtitle">
                                Choose how you want to be notified for each category
                            </p>

                            <div className="preferences-table">
                                <div className="preferences-table__header">
                                    <span>Category</span>
                                    <span>Email</span>
                                    <span>Push</span>
                                    <span>SMS</span>
                                </div>
                                {preferences.map((pref, index) => (
                                    <motion.div
                                        key={pref.id}
                                        className="preferences-table__row"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <span className="preferences-table__category">{pref.category}</span>
                                        <button
                                            className={`preferences-toggle ${pref.email ? 'active' : ''}`}
                                            onClick={() => togglePreference(pref.id, 'email')}
                                        >
                                            {pref.email ? <Bell size={14} /> : <BellOff size={14} />}
                                        </button>
                                        <button
                                            className={`preferences-toggle ${pref.push ? 'active' : ''}`}
                                            onClick={() => togglePreference(pref.id, 'push')}
                                        >
                                            {pref.push ? <Bell size={14} /> : <BellOff size={14} />}
                                        </button>
                                        <button
                                            className={`preferences-toggle ${pref.sms ? 'active' : ''}`}
                                            onClick={() => togglePreference(pref.id, 'sms')}
                                        >
                                            {pref.sms ? <Bell size={14} /> : <BellOff size={14} />}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>

                            <Button variant="primary" className="preferences-save-btn">
                                Save Preferences
                            </Button>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Notifications
