import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Activity,
    CheckCircle2,
    Server,
    Database,
    Globe,
    Cpu,
    HardDrive,
    Clock,
    AlertTriangle,
    Zap,
    RefreshCw
} from 'lucide-react'
import './SystemHealth.css'

interface Service {
    id: string
    name: string
    status: 'operational' | 'degraded' | 'down'
    latency: string
    uptime: string
    requests: string
    icon: React.ReactNode
}

interface Incident {
    id: string
    title: string
    description: string
    status: 'resolved' | 'investigating' | 'monitoring'
    time: string
    duration: string
}

const services: Service[] = [
    { id: '1', name: 'Claims Engine', status: 'operational', latency: '42ms', uptime: '99.99%', requests: '12.4K/min', icon: <Zap size={16} /> },
    { id: '2', name: 'Member Portal', status: 'operational', latency: '128ms', uptime: '99.97%', requests: '8.2K/min', icon: <Globe size={16} /> },
    { id: '3', name: 'Database Cluster', status: 'operational', latency: '8ms', uptime: '99.99%', requests: '45K/min', icon: <Database size={16} /> },
    { id: '4', name: 'EDI Gateway', status: 'degraded', latency: '340ms', uptime: '99.84%', requests: '2.1K/min', icon: <Server size={16} /> },
    { id: '5', name: 'API Gateway', status: 'operational', latency: '24ms', uptime: '99.98%', requests: '28K/min', icon: <Cpu size={16} /> },
    { id: '6', name: 'File Storage', status: 'operational', latency: '65ms', uptime: '99.95%', requests: '1.8K/min', icon: <HardDrive size={16} /> },
]

const incidents: Incident[] = [
    { id: '1', title: 'EDI Gateway Latency Increase', description: 'Investigating elevated response times for 834/835 transactions', status: 'investigating', time: '45 min ago', duration: '45 min' },
    { id: '2', title: 'Database Failover Test', description: 'Scheduled maintenance completed successfully with zero downtime', status: 'resolved', time: '2 hours ago', duration: '12 min' },
    { id: '3', title: 'Claims API Rate Limiting', description: 'Temporarily increased rate limits during peak enrollment period', status: 'resolved', time: '1 day ago', duration: '4 hours' },
]

export default function SystemHealth() {
    const [refreshing, setRefreshing] = useState(false)

    const handleRefresh = () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 1500)
    }

    const allOperational = services.every(s => s.status === 'operational')

    return (
        <div className="system-health">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <Activity size={28} />
                    System Health
                </h1>
                <p className="page-subtitle">
                    Real-time monitoring of platform services and infrastructure
                </p>
            </motion.div>

            {/* Overall Status */}
            <motion.div
                className="overall-status"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className={`status-indicator-large ${!allOperational ? 'degraded' : ''}`}>
                    {allOperational ? (
                        <CheckCircle2 size={36} style={{ color: '#22c55e' }} />
                    ) : (
                        <AlertTriangle size={36} style={{ color: '#f59e0b' }} />
                    )}
                </div>
                <div className="status-details">
                    <h2>{allOperational ? 'All Systems Operational' : 'Partial Degradation'}</h2>
                    <span>Last checked: Just now • <a href="#" onClick={handleRefresh} style={{ color: 'var(--accent-teal)' }}>
                        <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        Refresh
                    </a></span>
                </div>
                <div className="status-time">
                    <div className="uptime">99.97%</div>
                    <div className="label">30-Day Uptime</div>
                </div>
            </motion.div>

            {/* Services */}
            <motion.div
                className="services-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3>
                    <Server size={18} />
                    Service Status
                </h3>
                <div className="services-grid">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            className={`service-card ${service.status}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 + index * 0.05 }}
                        >
                            <div className="service-header">
                                <span className="service-name">
                                    {service.icon}
                                    {service.name}
                                </span>
                                <span className={`service-status ${service.status}`}>
                                    <span className="status-dot-sm" />
                                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                                </span>
                            </div>
                            <div className="service-metrics">
                                <div className="metric">
                                    <div className="metric-value">{service.latency}</div>
                                    <div className="metric-label">Latency</div>
                                </div>
                                <div className="metric">
                                    <div className="metric-value">{service.uptime}</div>
                                    <div className="metric-label">Uptime</div>
                                </div>
                                <div className="metric">
                                    <div className="metric-value">{service.requests}</div>
                                    <div className="metric-label">Requests</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Incidents */}
            <motion.div
                className="incidents-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h3>
                    <Clock size={18} />
                    Recent Incidents
                </h3>
                <div className="incident-list">
                    {incidents.map((incident) => (
                        <div key={incident.id} className="incident-item">
                            <div className={`incident-icon ${incident.status}`}>
                                {incident.status === 'resolved' ? (
                                    <CheckCircle2 size={18} />
                                ) : (
                                    <AlertTriangle size={18} />
                                )}
                            </div>
                            <div className="incident-content">
                                <h4>{incident.title}</h4>
                                <p>{incident.description}</p>
                                <div className="incident-meta">
                                    <span>{incident.time}</span>
                                    <span>Duration: {incident.duration}</span>
                                    <span style={{
                                        color: incident.status === 'resolved' ? '#22c55e' : '#f59e0b',
                                        fontWeight: 500
                                    }}>
                                        {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
