import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Bell,
    FileText,
    AlertTriangle,
    CheckCircle2,
    Info,
    Clock,
    User,
    Settings,
    Check,
    Archive,
    Trash2,
    Filter
} from 'lucide-react'
import './NotificationCenter.css'

interface Notification {
    id: string
    type: 'claim' | 'alert' | 'success' | 'info' | 'warning'
    title: string
    body: string
    time: string
    read: boolean
    source: string
    actionRequired?: boolean
}

const notifications: Notification[] = [
    { id: '1', type: 'alert', title: 'High-cost claim flagged', body: 'Claim #CLM-28472 for $47,500 requires manual review. Flagged for potential pricing discrepancy.', time: '5 min ago', read: false, source: 'Claims Engine', actionRequired: true },
    { id: '2', type: 'success', title: 'Prior authorization approved', body: 'PA request #PA-9234 for member John Smith has been auto-approved based on clinical criteria.', time: '15 min ago', read: false, source: 'Prior Auth' },
    { id: '3', type: 'warning', title: 'Stop-loss threshold approaching', body: 'Member ID M-84721 is at 92% of specific stop-loss attachment. Current claims: $478,000.', time: '1 hour ago', read: false, source: 'Stop-Loss Monitor', actionRequired: true },
    { id: '4', type: 'info', title: 'Eligibility file processed', body: '834 enrollment file from Acme Corp processed successfully. 12 additions, 3 terminations.', time: '2 hours ago', read: true, source: 'EDI Engine' },
    { id: '5', type: 'claim', title: 'Claim batch completed', body: 'Weekly claims batch #B-1247 completed. 847 claims processed, 23 pended for review.', time: '3 hours ago', read: true, source: 'Claims Engine' },
    { id: '6', type: 'alert', title: 'Provider credential expiring', body: 'Dr. Sarah Mitchell license expires in 30 days. Please initiate recredentialing process.', time: '4 hours ago', read: true, source: 'Credentialing', actionRequired: true },
]

export default function NotificationCenter() {
    const [activeFilter, setActiveFilter] = useState('all')
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const unreadCount = notifications.filter(n => !n.read).length
    const actionCount = notifications.filter(n => n.actionRequired).length

    const filteredNotifications = activeFilter === 'all'
        ? notifications
        : activeFilter === 'unread'
            ? notifications.filter(n => !n.read)
            : notifications.filter(n => n.actionRequired)

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'claim': return <FileText size={18} />
            case 'alert': return <AlertTriangle size={18} />
            case 'success': return <CheckCircle2 size={18} />
            case 'info': return <Info size={18} />
            case 'warning': return <AlertTriangle size={18} />
            default: return <Bell size={18} />
        }
    }

    return (
        <div className="notification-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <Bell size={28} />
                    Notification Center
                </h1>
                <p className="page-subtitle">
                    Stay updated on claims, eligibility changes, and system alerts
                </p>
            </motion.div>

            {/* Action Bar */}
            <div className="notification-actions">
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        All
                        <span className="count">{notifications.length}</span>
                    </button>
                    <button
                        className={`filter-tab ${activeFilter === 'unread' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('unread')}
                    >
                        Unread
                        <span className="count">{unreadCount}</span>
                    </button>
                    <button
                        className={`filter-tab ${activeFilter === 'action' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('action')}
                    >
                        Action Required
                        <span className="count">{actionCount}</span>
                    </button>
                </div>
                <div className="bulk-actions">
                    <button className="bulk-btn">
                        <Check size={14} />
                        Mark All Read
                    </button>
                    <button className="bulk-btn">
                        <Archive size={14} />
                        Archive
                    </button>
                </div>
            </div>

            {/* Notification List */}
            <div className="notification-list">
                {filteredNotifications.map((notification, index) => (
                    <motion.div
                        key={notification.id}
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="notification-checkbox">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(notification.id)}
                                onChange={() => toggleSelect(notification.id)}
                            />
                        </div>
                        <div className={`notification-icon ${notification.type}`}>
                            {getIcon(notification.type)}
                        </div>
                        <div className="notification-content">
                            <div className="notification-header">
                                <span className="notification-title">{notification.title}</span>
                                <span className="notification-time">{notification.time}</span>
                            </div>
                            <p className="notification-body">{notification.body}</p>
                            <div className="notification-meta">
                                <span><Clock size={12} /> {notification.time}</span>
                                <span><User size={12} /> {notification.source}</span>
                            </div>
                        </div>
                        {notification.actionRequired && (
                            <div className="notification-actions-inline">
                                <button className="action-btn primary">Take Action</button>
                                <button className="action-btn secondary">Dismiss</button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Preferences */}
            <motion.div
                className="preferences-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3>
                    <Settings size={18} />
                    Notification Preferences
                </h3>
                <div className="preference-row">
                    <div>
                        <div className="preference-label">Email Notifications</div>
                        <div className="preference-desc">Receive daily digest of important notifications</div>
                    </div>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-teal)' }} />
                </div>
                <div className="preference-row">
                    <div>
                        <div className="preference-label">High-Priority Alerts</div>
                        <div className="preference-desc">Immediate alerts for stop-loss and fraud flags</div>
                    </div>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-teal)' }} />
                </div>
                <div className="preference-row">
                    <div>
                        <div className="preference-label">Claim Processing Updates</div>
                        <div className="preference-desc">Notifications for batch completions and exceptions</div>
                    </div>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-teal)' }} />
                </div>
            </motion.div>
        </div>
    )
}
