import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Bell,
    Smartphone,
    Settings,
    Send,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ToggleLeft,
    ToggleRight,
    Plus,
    BarChart3
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './PushNotifications.css'

interface PushPreference {
    id: string
    category: string
    description: string
    enabled: boolean
    sound: boolean
}

interface PushNotification {
    id: string
    title: string
    body: string
    sentAt: string
    status: 'delivered' | 'opened' | 'failed'
    platform: 'ios' | 'android' | 'web'
}

const preferences: PushPreference[] = [
    { id: 'appt', category: 'Appointments', description: 'Upcoming appointment reminders', enabled: true, sound: true },
    { id: 'claims', category: 'Claims', description: 'Claim status updates', enabled: true, sound: false },
    { id: 'rx', category: 'Prescriptions', description: 'Refill reminders and ready alerts', enabled: true, sound: true },
    { id: 'messages', category: 'Messages', description: 'New secure message notifications', enabled: true, sound: true },
    { id: 'wellness', category: 'Wellness', description: 'Health tips and reminders', enabled: false, sound: false }
]

const notifications: PushNotification[] = [
    { id: 'PUSH-001', title: 'Appointment Tomorrow', body: 'Reminder: Dr. Mitchell at 10:00 AM', sentAt: '2024-01-25T09:00:00', status: 'opened', platform: 'ios' },
    { id: 'PUSH-002', title: 'Claim Processed', body: 'Your claim for $450 has been approved', sentAt: '2024-01-24T14:30:00', status: 'delivered', platform: 'android' },
    { id: 'PUSH-003', title: 'New Message', body: 'Dr. Mitchell sent you a message', sentAt: '2024-01-23T11:15:00', status: 'opened', platform: 'ios' }
]

export function PushNotifications() {
    const [prefs, setPrefs] = useState<PushPreference[]>(preferences)
    const [recentNotifications] = useState<PushNotification[]>(notifications)

    const togglePreference = (id: string) => {
        setPrefs(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p))
    }

    const getStatusBadge = (status: PushNotification['status']) => {
        switch (status) {
            case 'opened': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Opened</Badge>
            case 'delivered': return <Badge variant="info">Delivered</Badge>
            case 'failed': return <Badge variant="critical" icon={<AlertTriangle size={10} />}>Failed</Badge>
        }
    }

    const deliveryRate = 98.5
    const openRate = 72.3

    return (
        <div className="push-notifications-page">
            {/* Header */}
            <div className="push__header">
                <div>
                    <h1 className="push__title">Push Notifications</h1>
                    <p className="push__subtitle">
                        Configure mobile and browser push notifications
                    </p>
                </div>
                <Button variant="primary" icon={<Send size={16} />}>
                    Send Campaign
                </Button>
            </div>

            {/* Stats */}
            <div className="push__stats">
                <GlassCard className="stat-card">
                    <Smartphone size={24} />
                    <div>
                        <span className="stat-value">2</span>
                        <span className="stat-label">Registered Devices</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <Send size={24} />
                    <div>
                        <span className="stat-value">{deliveryRate}%</span>
                        <span className="stat-label">Delivery Rate</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <BarChart3 size={24} />
                    <div>
                        <span className="stat-value">{openRate}%</span>
                        <span className="stat-label">Open Rate</span>
                    </div>
                </GlassCard>
            </div>

            <div className="push__content">
                {/* Preferences */}
                <GlassCard className="preferences-card">
                    <div className="preferences-header">
                        <h3>Notification Preferences</h3>
                    </div>
                    <div className="preferences-list">
                        {prefs.map((pref, index) => (
                            <motion.div
                                key={pref.id}
                                className="preference-item"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="preference-info">
                                    <span className="preference-category">{pref.category}</span>
                                    <span className="preference-desc">{pref.description}</span>
                                </div>
                                <button
                                    className={`toggle-btn ${pref.enabled ? 'enabled' : ''}`}
                                    onClick={() => togglePreference(pref.id)}
                                >
                                    {pref.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Recent */}
                <GlassCard className="recent-card">
                    <div className="recent-header">
                        <h3>Recent Notifications</h3>
                    </div>
                    <div className="recent-list">
                        {recentNotifications.map((notif, index) => (
                            <motion.div
                                key={notif.id}
                                className="recent-item"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="recent-icon">
                                    <Bell size={16} />
                                </div>
                                <div className="recent-content">
                                    <span className="recent-title">{notif.title}</span>
                                    <span className="recent-body">{notif.body}</span>
                                    <div className="recent-meta">
                                        <span>{new Date(notif.sentAt).toLocaleString()}</span>
                                        <Badge variant="default" size="sm">{notif.platform}</Badge>
                                    </div>
                                </div>
                                {getStatusBadge(notif.status)}
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default PushNotifications
