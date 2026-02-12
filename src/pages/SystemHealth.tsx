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
    RefreshCw,
    Wifi,
    MemoryStick,
    Search,
    Shield,
    Box,
    Brain,
    AlertCircle,
    XCircle
} from 'lucide-react'
import {
    AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts'
import './SystemHealth.css'

interface Service {
    id: string
    name: string
    status: 'operational' | 'degraded' | 'down'
    latency: string
    uptime: string
    icon: React.ReactNode
}

interface Incident {
    id: string
    title: string
    description: string
    status: 'resolved' | 'investigating' | 'monitoring'
    severity: 'critical' | 'warning' | 'info'
    time: string
    duration: string
}

const services: Service[] = [
    { id: '1', name: 'API Gateway', status: 'operational', latency: '24ms', uptime: '99.98%', icon: <Zap size={16} /> },
    { id: '2', name: 'Database', status: 'operational', latency: '8ms', uptime: '99.99%', icon: <Database size={16} /> },
    { id: '3', name: 'Cache', status: 'operational', latency: '2ms', uptime: '99.99%', icon: <Box size={16} /> },
    { id: '4', name: 'Queue', status: 'operational', latency: '12ms', uptime: '99.97%', icon: <Server size={16} /> },
    { id: '5', name: 'Search', status: 'operational', latency: '35ms', uptime: '99.95%', icon: <Search size={16} /> },
    { id: '6', name: 'Auth', status: 'operational', latency: '18ms', uptime: '99.99%', icon: <Shield size={16} /> },
    { id: '7', name: 'Storage', status: 'degraded', latency: '340ms', uptime: '99.84%', icon: <HardDrive size={16} /> },
    { id: '8', name: 'AI Engine', status: 'operational', latency: '142ms', uptime: '99.91%', icon: <Brain size={16} /> },
]

const incidents: Incident[] = [
    { id: '1', title: 'Storage Latency Increase', description: 'Investigating elevated response times for file operations in the primary storage cluster', status: 'investigating', severity: 'warning', time: '45 min ago', duration: '45 min' },
    { id: '2', title: 'Database Failover Test', description: 'Scheduled maintenance completed successfully with zero downtime', status: 'resolved', severity: 'info', time: '2 hours ago', duration: '12 min' },
    { id: '3', title: 'Claims API Rate Limiting', description: 'Temporarily increased rate limits during peak enrollment period', status: 'resolved', severity: 'info', time: '1 day ago', duration: '4 hours' },
    { id: '4', title: 'Auth Service Spike', description: 'Brief spike in authentication failures due to expired certificate rotation', status: 'resolved', severity: 'critical', time: '2 days ago', duration: '8 min' },
]

const systemMetrics = [
    { label: 'CPU Usage', value: 42, icon: <Cpu size={18} />, color: '#818cf8', unit: '%' },
    { label: 'Memory', value: 68, icon: <MemoryStick size={18} />, color: '#06b6d4', unit: '%' },
    { label: 'Disk', value: 54, icon: <HardDrive size={18} />, color: '#22c55e', unit: '%' },
    { label: 'Network', value: 23, icon: <Wifi size={18} />, color: '#f59e0b', unit: 'Mbps' },
]

// Generate 24-hour uptime data
const uptimeData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    uptime: 99.5 + Math.random() * 0.5,
}))

// Generate response time trend data
const responseTimeData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    api: 20 + Math.random() * 30,
    database: 5 + Math.random() * 15,
    cache: 1 + Math.random() * 5,
}))

function getGaugeColor(value: number): string {
    if (value < 50) return '#22c55e'
    if (value < 75) return '#f59e0b'
    return '#ef4444'
}

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

            {/* System Metrics Gauges */}
            <div className="sh-metrics-row">
                {systemMetrics.map((metric, index) => (
                    <motion.div
                        key={metric.label}
                        className="sh-metric-card"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + index * 0.05 }}
                    >
                        <div className="sh-metric-header">
                            <div className="sh-metric-icon" style={{ background: `${metric.color}20`, color: metric.color }}>
                                {metric.icon}
                            </div>
                            <span className="sh-metric-label">{metric.label}</span>
                        </div>
                        <div className="sh-gauge-container">
                            <div className="sh-gauge-track">
                                <motion.div
                                    className="sh-gauge-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${metric.unit === '%' ? metric.value : Math.min(metric.value * 2, 100)}%` }}
                                    transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                                    style={{ background: `linear-gradient(90deg, ${metric.color}88, ${metric.color})` }}
                                />
                            </div>
                            <div className="sh-gauge-value" style={{ color: metric.unit === '%' ? getGaugeColor(metric.value) : metric.color }}>
                                {metric.value}{metric.unit}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="sh-charts-row">
                {/* Uptime Chart */}
                <motion.div
                    className="sh-chart-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3>
                        <CheckCircle2 size={16} />
                        24-Hour Uptime
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={uptimeData}>
                            <defs>
                                <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                            <XAxis
                                dataKey="hour"
                                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                                axisLine={{ stroke: 'var(--border-default)' }}
                                tickLine={false}
                                interval={5}
                            />
                            <YAxis
                                domain={[99, 100]}
                                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                                axisLine={{ stroke: 'var(--border-default)' }}
                                tickLine={false}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-default)',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-primary)'
                                }}
                                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Uptime']}
                            />
                            <Area
                                type="monotone"
                                dataKey="uptime"
                                stroke="#22c55e"
                                strokeWidth={2}
                                fill="url(#uptimeGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Response Time Chart */}
                <motion.div
                    className="sh-chart-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <h3>
                        <Activity size={16} />
                        Response Time Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={responseTimeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                            <XAxis
                                dataKey="hour"
                                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                                axisLine={{ stroke: 'var(--border-default)' }}
                                tickLine={false}
                                interval={5}
                            />
                            <YAxis
                                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                                axisLine={{ stroke: 'var(--border-default)' }}
                                tickLine={false}
                                tickFormatter={(v) => `${v}ms`}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-default)',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-primary)'
                                }}
                                formatter={(value: number) => [`${value.toFixed(1)}ms`]}
                            />
                            <Line type="monotone" dataKey="api" stroke="#818cf8" strokeWidth={2} dot={false} name="API" />
                            <Line type="monotone" dataKey="database" stroke="#06b6d4" strokeWidth={2} dot={false} name="Database" />
                            <Line type="monotone" dataKey="cache" stroke="#22c55e" strokeWidth={2} dot={false} name="Cache" />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="sh-chart-legend">
                        <span><span className="sh-legend-dot" style={{ background: '#818cf8' }} />API</span>
                        <span><span className="sh-legend-dot" style={{ background: '#06b6d4' }} />Database</span>
                        <span><span className="sh-legend-dot" style={{ background: '#22c55e' }} />Cache</span>
                    </div>
                </motion.div>
            </div>

            {/* Service Status Grid */}
            <motion.div
                className="services-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
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
                            transition={{ delay: 0.45 + index * 0.04 }}
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
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Alerts & Incidents */}
            <motion.div
                className="incidents-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
            >
                <h3>
                    <Clock size={18} />
                    Alerts &amp; Incidents
                </h3>
                <div className="incident-list">
                    {incidents.map((incident) => (
                        <div key={incident.id} className="incident-item">
                            <div className={`incident-icon ${incident.status}`}>
                                {incident.status === 'resolved' ? (
                                    <CheckCircle2 size={18} />
                                ) : incident.severity === 'critical' ? (
                                    <XCircle size={18} />
                                ) : (
                                    <AlertTriangle size={18} />
                                )}
                            </div>
                            <div className="incident-content">
                                <div className="sh-incident-title-row">
                                    <h4>{incident.title}</h4>
                                    <span className={`sh-severity-badge ${incident.severity}`}>
                                        {incident.severity === 'critical' && <AlertCircle size={10} />}
                                        {incident.severity === 'warning' && <AlertTriangle size={10} />}
                                        {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                                    </span>
                                </div>
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
