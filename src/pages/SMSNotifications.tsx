import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Smartphone,
    Bell,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Send,
    Settings,
    Plus,
    Search,
    Filter,
    ToggleLeft,
    ToggleRight
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './SMSNotifications.css'

interface SMSPreference {
    id: string
    category: string
    description: string
    enabled: boolean
}

interface SMSHistory {
    id: string
    type: string
    message: string
    sentAt: string
    status: 'delivered' | 'pending' | 'failed'
    phone: string
}

const preferences: SMSPreference[] = [
    { id: 'appt', category: 'Appointment Reminders', description: 'Receive reminders 24hrs before appointments', enabled: true },
    { id: 'claims', category: 'Claims Updates', description: 'Get notified when claim status changes', enabled: true },
    { id: 'rx', category: 'Prescription Ready', description: 'Alert when prescriptions are ready for pickup', enabled: true },
    { id: 'auth', category: 'Prior Authorization', description: 'Updates on authorization requests', enabled: false },
    { id: 'billing', category: 'Billing Alerts', description: 'Payment due and statement notifications', enabled: true }
]

const history: SMSHistory[] = [
    { id: 'SMS-001', type: 'Appointment', message: 'Reminder: You have an appointment tomorrow at 10:00 AM with Dr. Mitchell', sentAt: '2024-01-25T09:00:00', status: 'delivered', phone: '***-***-5678' },
    { id: 'SMS-002', type: 'Prescription', message: 'Your prescription is ready for pickup at Apex Pharmacy', sentAt: '2024-01-24T14:30:00', status: 'delivered', phone: '***-***-5678' },
    { id: 'SMS-003', type: 'Claims', message: 'Your claim CLM-2024-1234 has been processed', sentAt: '2024-01-23T11:15:00', status: 'delivered', phone: '***-***-5678' }
]

export function SMSNotifications() {
    const [prefs, setPrefs] = useState<SMSPreference[]>(preferences)
    const [smsHistory] = useState<SMSHistory[]>(history)

    const togglePreference = (id: string) => {
        setPrefs(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p))
    }

    const getStatusBadge = (status: SMSHistory['status']) => {
        switch (status) {
            case 'delivered': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Delivered</Badge>
            case 'pending': return <Badge variant="warning" icon={<Clock size={10} />}>Pending</Badge>
            case 'failed': return <Badge variant="critical" icon={<AlertTriangle size={10} />}>Failed</Badge>
        }
    }

    return (
        <div className="sms-notifications-page">
            {/* Header */}
            <div className="sms__header">
                <div>
                    <h1 className="sms__title">SMS Notifications</h1>
                    <p className="sms__subtitle">
                        Manage text message preferences and view history
                    </p>
                </div>
                <Button variant="secondary" icon={<Settings size={16} />}>
                    Settings
                </Button>
            </div>

            {/* Phone Number */}
            <GlassCard className="phone-card">
                <div className="phone-card__info">
                    <Smartphone size={24} />
                    <div>
                        <span className="phone-number">***-***-5678</span>
                        <span className="phone-status">Verified</span>
                    </div>
                </div>
                <Button variant="ghost" size="sm">Change Number</Button>
            </GlassCard>

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

            {/* History */}
            <GlassCard className="history-card">
                <div className="history-header">
                    <h3>Recent Messages</h3>
                    <Button variant="ghost" size="sm" icon={<Filter size={14} />}>Filter</Button>
                </div>
                <div className="history-list">
                    {smsHistory.map((sms, index) => (
                        <motion.div
                            key={sms.id}
                            className="history-item"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="history-icon">
                                <Send size={16} />
                            </div>
                            <div className="history-content">
                                <div className="history-meta">
                                    <span className="history-type">{sms.type}</span>
                                    <span className="history-phone">{sms.phone}</span>
                                </div>
                                <p className="history-message">{sms.message}</p>
                                <span className="history-date">{new Date(sms.sentAt).toLocaleString()}</span>
                            </div>
                            {getStatusBadge(sms.status)}
                        </motion.div>
                    ))}
                </div>
            </GlassCard>
        </div>
    )
}

export default SMSNotifications
