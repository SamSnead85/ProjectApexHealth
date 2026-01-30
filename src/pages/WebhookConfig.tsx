import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Webhook,
    Plus,
    Copy,
    Play,
    Settings,
    CheckCircle2,
    XCircle,
    Clock,
    Send
} from 'lucide-react'
import './WebhookConfig.css'

interface WebhookEndpoint {
    id: string
    name: string
    url: string
    events: string[]
    active: boolean
    stats: { delivered: number; failed: number; pending: number }
    lastTriggered: string
}

const webhooks: WebhookEndpoint[] = [
    {
        id: '1',
        name: 'Claims Processing Webhook',
        url: 'https://api.partner.com/webhooks/claims',
        events: ['claim.created', 'claim.adjudicated', 'claim.paid'],
        active: true,
        stats: { delivered: 12847, failed: 23, pending: 5 },
        lastTriggered: '2 min ago'
    },
    {
        id: '2',
        name: 'Eligibility Updates',
        url: 'https://erp.client.com/api/v2/eligibility',
        events: ['member.enrolled', 'member.terminated', 'dependent.added'],
        active: true,
        stats: { delivered: 4523, failed: 8, pending: 0 },
        lastTriggered: '15 min ago'
    },
    {
        id: '3',
        name: 'Payment Notifications',
        url: 'https://finance.internal.com/webhooks/payments',
        events: ['payment.initiated', 'payment.completed'],
        active: false,
        stats: { delivered: 892, failed: 0, pending: 0 },
        lastTriggered: '2 days ago'
    },
]

export default function WebhookConfig() {
    const [activeWebhooks, setActiveWebhooks] = useState(
        webhooks.reduce((acc, wh) => ({ ...acc, [wh.id]: wh.active }), {} as Record<string, boolean>)
    )

    const toggleWebhook = (id: string) => {
        setActiveWebhooks(prev => ({ ...prev, [id]: !prev[id] }))
    }

    return (
        <div className="webhook-config">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <Webhook size={28} />
                    Webhook Configuration
                </h1>
                <p className="page-subtitle">
                    Configure real-time event notifications to external systems
                </p>
            </motion.div>

            <div className="webhook-actions">
                <button className="add-webhook-btn">
                    <Plus size={18} />
                    Create Webhook
                </button>
            </div>

            <div className="webhooks-grid">
                {webhooks.map((webhook, index) => (
                    <motion.div
                        key={webhook.id}
                        className="webhook-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                    >
                        <div className="webhook-header">
                            <div className="webhook-title">
                                <div className={`webhook-icon ${activeWebhooks[webhook.id] ? 'active' : 'inactive'}`}>
                                    <Webhook size={18} />
                                </div>
                                <div className="webhook-name">
                                    <h4>{webhook.name}</h4>
                                    <span>{activeWebhooks[webhook.id] ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                            <div
                                className={`webhook-toggle ${activeWebhooks[webhook.id] ? 'active' : ''}`}
                                onClick={() => toggleWebhook(webhook.id)}
                            />
                        </div>

                        <div className="webhook-body">
                            <div className="webhook-url">
                                <code>{webhook.url}</code>
                                <button className="copy-btn">
                                    <Copy size={12} /> Copy
                                </button>
                            </div>

                            <div className="webhook-events">
                                <div className="events-label">Subscribed Events</div>
                                <div className="events-list">
                                    {webhook.events.map((event, i) => (
                                        <span key={i} className="event-tag">{event}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="webhook-stats">
                                <div className="stat-item">
                                    <div className="stat-value" style={{ color: '#22c55e' }}>
                                        {webhook.stats.delivered.toLocaleString()}
                                    </div>
                                    <div className="stat-label">Delivered</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value" style={{ color: '#ef4444' }}>
                                        {webhook.stats.failed}
                                    </div>
                                    <div className="stat-label">Failed</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value" style={{ color: '#f59e0b' }}>
                                        {webhook.stats.pending}
                                    </div>
                                    <div className="stat-label">Pending</div>
                                </div>
                            </div>
                        </div>

                        <div className="webhook-footer">
                            <span className="last-triggered">
                                Last triggered: {webhook.lastTriggered}
                            </span>
                            <div className="webhook-btn-group">
                                <button className="wh-btn test">
                                    <Send size={12} /> Test
                                </button>
                                <button className="wh-btn edit">
                                    <Settings size={12} /> Edit
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
