import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Activity,
    FileText,
    Users,
    User,
    Settings,
    DollarSign,
    Filter,
    Clock
} from 'lucide-react'
import './ActivityFeed.css'

interface ActivityEvent {
    id: string
    type: 'claim' | 'member' | 'user' | 'system' | 'payment'
    user: { name: string; initials: string; isSystem?: boolean }
    action: string
    target: string
    time: string
    tags?: string[]
}

const activities: ActivityEvent[] = [
    { id: '1', type: 'claim', user: { name: 'Sarah Mitchell', initials: 'SM' }, action: 'approved claim', target: 'CLM-28472 for $12,450', time: '2 min ago', tags: ['Auto-adjudicated'] },
    { id: '2', type: 'member', user: { name: 'James Chen', initials: 'JC' }, action: 'enrolled new member', target: 'Robert Wilson (ID: M-84729)', time: '5 min ago', tags: ['Family plan'] },
    { id: '3', type: 'system', user: { name: 'System', initials: 'SYS', isSystem: true }, action: 'completed batch', target: '834 Eligibility Import - 2,847 records', time: '12 min ago' },
    { id: '4', type: 'payment', user: { name: 'Linda Thompson', initials: 'LT' }, action: 'initiated payment run', target: 'Provider payments - $847,234', time: '18 min ago', tags: ['EFT'] },
    { id: '5', type: 'user', user: { name: 'Admin', initials: 'AD' }, action: 'updated role for', target: 'Emily Davis → Analyst', time: '25 min ago' },
    { id: '6', type: 'claim', user: { name: 'System', initials: 'SYS', isSystem: true }, action: 'flagged claim for review', target: 'CLM-28485 - High cost outlier', time: '32 min ago', tags: ['Fraud check'] },
    { id: '7', type: 'member', user: { name: 'Robert Kim', initials: 'RK' }, action: 'processed termination', target: 'Group: Acme Corp - 3 members', time: '45 min ago' },
    { id: '8', type: 'system', user: { name: 'System', initials: 'SYS', isSystem: true }, action: 'generated report', target: 'Monthly SIR Analytics - Q4 2025', time: '1 hour ago' },
]

const filters = ['All', 'Claims', 'Members', 'Payments', 'System']

export default function ActivityFeed() {
    const [activeFilter, setActiveFilter] = useState('All')

    const filteredActivities = activeFilter === 'All'
        ? activities
        : activities.filter(a => {
            if (activeFilter === 'Claims') return a.type === 'claim'
            if (activeFilter === 'Members') return a.type === 'member'
            if (activeFilter === 'Payments') return a.type === 'payment'
            if (activeFilter === 'System') return a.type === 'system' || a.type === 'user'
            return true
        })

    return (
        <div className="activity-feed">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <Activity size={28} />
                    Activity Feed
                </h1>
                <p className="page-subtitle">
                    Real-time stream of system events and user actions
                </p>
            </motion.div>

            {/* Filters */}
            <div className="activity-filters">
                <div className="filter-group">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
                <div className="live-indicator">
                    <span className="live-dot" />
                    Live updates
                </div>
            </div>

            {/* Timeline */}
            <div className="activity-timeline">
                {filteredActivities.map((event, index) => (
                    <motion.div
                        key={event.id}
                        className="activity-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className={`activity-dot ${event.type}`} />
                        <div className="activity-card">
                            <div className="activity-header">
                                <div className="activity-user">
                                    <div className={`activity-avatar ${event.user.isSystem ? 'system' : ''}`}>
                                        {event.user.initials}
                                    </div>
                                    <div className="activity-meta">
                                        <h4>{event.user.name}</h4>
                                        <span>{event.type.charAt(0).toUpperCase() + event.type.slice(1)} activity</span>
                                    </div>
                                </div>
                                <span className="activity-time">{event.time}</span>
                            </div>
                            <div className="activity-content">
                                {event.action} <strong>{event.target}</strong>
                            </div>
                            {event.tags && (
                                <div className="activity-tags">
                                    {event.tags.map((tag, i) => (
                                        <span key={i} className="activity-tag">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
