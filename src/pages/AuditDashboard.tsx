import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Shield,
    Activity,
    LogIn,
    FileEdit,
    Eye,
    AlertTriangle,
    Lock,
    User,
    Clock,
    MapPin,
    CheckCircle2,
    XCircle,
    Monitor
} from 'lucide-react'
import './AuditDashboard.css'

interface AuditEntry {
    id: string
    type: 'login' | 'change' | 'access' | 'security' | 'critical'
    title: string
    description: string
    user: string
    ip: string
    timestamp: string
    severity: 'info' | 'warning' | 'critical'
}

interface ComplianceItem {
    id: string
    name: string
    status: 'passed' | 'warning' | 'failed'
    lastCheck: string
}

interface ActiveSession {
    id: string
    user: string
    initials: string
    device: string
    location: string
    lastActive: string
}

const auditEntries: AuditEntry[] = [
    { id: '1', type: 'login', title: 'Successful Login', description: 'User authenticated via SSO (Azure AD)', user: 'admin@healthplan.com', ip: '192.168.1.45', timestamp: '2 min ago', severity: 'info' },
    { id: '2', type: 'change', title: 'Member Record Updated', description: 'Updated eligibility status for member ID: M-28471', user: 'sarah.mitchell@healthplan.com', ip: '192.168.1.52', timestamp: '15 min ago', severity: 'info' },
    { id: '3', type: 'security', title: 'Failed Login Attempt', description: '3 consecutive failed login attempts detected', user: 'unknown@external.com', ip: '45.23.118.92', timestamp: '32 min ago', severity: 'warning' },
    { id: '4', type: 'access', title: 'PHI Data Accessed', description: 'Accessed member medical records for claims review', user: 'claims.reviewer@healthplan.com', ip: '192.168.1.71', timestamp: '1 hour ago', severity: 'info' },
    { id: '5', type: 'critical', title: 'Bulk Export Detected', description: 'Large data export initiated: 5,000+ member records', user: 'data.analyst@healthplan.com', ip: '192.168.1.89', timestamp: '2 hours ago', severity: 'critical' },
]

const complianceItems: ComplianceItem[] = [
    { id: '1', name: 'HIPAA Security Rule', status: 'passed', lastCheck: '1 hour ago' },
    { id: '2', name: 'SOC 2 Type II', status: 'passed', lastCheck: '1 hour ago' },
    { id: '3', name: 'Data Encryption (AES-256)', status: 'passed', lastCheck: '30 min ago' },
    { id: '4', name: 'Access Control Review', status: 'warning', lastCheck: '3 days ago' },
    { id: '5', name: 'Backup Verification', status: 'passed', lastCheck: '12 hours ago' },
]

const activeSessions: ActiveSession[] = [
    { id: '1', user: 'Admin User', initials: 'AU', device: 'Chrome on MacOS', location: 'New York, NY', lastActive: 'Now' },
    { id: '2', user: 'Sarah Mitchell', initials: 'SM', device: 'Safari on iOS', location: 'Boston, MA', lastActive: '5 min ago' },
    { id: '3', user: 'James Chen', initials: 'JC', device: 'Edge on Windows', location: 'Chicago, IL', lastActive: '12 min ago' },
]

export default function AuditDashboard() {
    const [activeFilter, setActiveFilter] = useState('all')

    const getIcon = (type: string) => {
        switch (type) {
            case 'login': return <LogIn size={16} />
            case 'change': return <FileEdit size={16} />
            case 'access': return <Eye size={16} />
            case 'security': return <AlertTriangle size={16} />
            case 'critical': return <Shield size={16} />
            default: return <Activity size={16} />
        }
    }

    return (
        <div className="audit-dashboard">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <Shield size={28} />
                    Audit & Security
                </h1>
                <p className="page-subtitle">
                    Monitor user activity, security events, and compliance status
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="audit-stats">
                <motion.div
                    className="audit-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h4>Events (24h)</h4>
                    <div className="value">12,847</div>
                    <div className="subtitle">Normal activity level</div>
                </motion.div>

                <motion.div
                    className="audit-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h4>Security Alerts</h4>
                    <div className="value">3</div>
                    <div className="subtitle">2 resolved, 1 pending</div>
                </motion.div>

                <motion.div
                    className="audit-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h4>Active Sessions</h4>
                    <div className="value">47</div>
                    <div className="subtitle">Across 24 users</div>
                </motion.div>

                <motion.div
                    className="audit-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <h4>Compliance Score</h4>
                    <div className="value">98%</div>
                    <div className="subtitle">All checks passed</div>
                </motion.div>
            </div>

            {/* Activity Feed */}
            <motion.div
                className="activity-feed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="feed-header">
                    <h2>
                        <Activity size={20} />
                        Audit Trail
                    </h2>
                    <div className="feed-filters">
                        {['all', 'logins', 'changes', 'security'].map((filter) => (
                            <button
                                key={filter}
                                className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                {auditEntries.map((entry, index) => (
                    <motion.div
                        key={entry.id}
                        className="audit-entry"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 + index * 0.05 }}
                    >
                        <div className={`entry-icon ${entry.type}`}>
                            {getIcon(entry.type)}
                        </div>
                        <div className="entry-content">
                            <h4>{entry.title}</h4>
                            <p>{entry.description}</p>
                            <div className="entry-meta">
                                <span><User size={12} /> {entry.user}</span>
                                <span><MapPin size={12} /> {entry.ip}</span>
                                <span><Clock size={12} /> {entry.timestamp}</span>
                            </div>
                        </div>
                        <span className={`severity-badge ${entry.severity}`}>
                            {entry.severity}
                        </span>
                    </motion.div>
                ))}
            </motion.div>

            {/* Security Cards */}
            <div className="security-section">
                <motion.div
                    className="security-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2>
                        <Lock size={20} />
                        Compliance Status
                    </h2>
                    {complianceItems.map((item) => (
                        <div key={item.id} className="compliance-row">
                            <span className="compliance-label">
                                {item.name}
                            </span>
                            <span className={`compliance-status ${item.status}`}>
                                {item.status === 'passed' && <CheckCircle2 size={14} />}
                                {item.status === 'warning' && <AlertTriangle size={14} />}
                                {item.status === 'failed' && <XCircle size={14} />}
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                        </div>
                    ))}
                </motion.div>

                <motion.div
                    className="security-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                >
                    <h2>
                        <Monitor size={20} />
                        Active Sessions
                    </h2>
                    {activeSessions.map((session) => (
                        <div key={session.id} className="session-row">
                            <div className="session-avatar">{session.initials}</div>
                            <div className="session-info">
                                <h4>{session.user}</h4>
                                <span>{session.device} • {session.location}</span>
                            </div>
                            <span className="session-status">
                                <CheckCircle2 size={12} />
                                {session.lastActive}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
