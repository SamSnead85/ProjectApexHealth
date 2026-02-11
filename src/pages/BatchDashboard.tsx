import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Layers,
    Play,
    CheckCircle2,
    XCircle,
    Clock,
    Database,
    Timer,
    BarChart3,
    History,
    TrendingUp,
    Zap,
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    FileWarning,
    Percent
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts'
import './BatchDashboard.css'

interface ActiveJob {
    id: string
    name: string
    type: string
    progress: number
    records: { processed: number; total: number }
    startTime: string
    eta: string
    status: 'running' | 'completed'
}

interface HistoryJob {
    id: string
    name: string
    status: 'completed' | 'failed'
    records: number
    duration: string
    completedAt: string
    errorMessage?: string
    errorDetails?: string
}

const activeJobs: ActiveJob[] = [
    { id: '1', name: 'Claims Adjudication Batch', type: '837 Processing', progress: 67, records: { processed: 4847, total: 7234 }, startTime: '10:23 AM', eta: '~12 min', status: 'running' },
    { id: '2', name: 'Provider Payment Run', type: 'EFT Generation', progress: 34, records: { processed: 892, total: 2645 }, startTime: '10:45 AM', eta: '~28 min', status: 'running' },
    { id: '3', name: 'Eligibility 834 Import', type: 'Member Sync', progress: 89, records: { processed: 11433, total: 12847 }, startTime: '9:58 AM', eta: '~3 min', status: 'running' },
]

const historyJobs: HistoryJob[] = [
    { id: '1', name: 'Eligibility 834 Import', status: 'completed', records: 12847, duration: '4m 23s', completedAt: '10:15 AM' },
    { id: '2', name: 'Claims Adjudication Batch', status: 'completed', records: 8234, duration: '18m 42s', completedAt: '9:45 AM' },
    { id: '3', name: 'Stop-Loss Report Generation', status: 'completed', records: 47, duration: '2m 15s', completedAt: '9:30 AM' },
    { id: '4', name: 'Member ID Card Batch', status: 'failed', records: 234, duration: '1m 08s', completedAt: '8:00 AM', errorMessage: 'Template rendering failed', errorDetails: 'Error: Cannot read property \'memberAddress\' of undefined at CardRenderer.render (line 142). 234 records affected. The member address field was null for records imported from the legacy system migration batch. Retry after running the address validation cleanup job.' },
    { id: '5', name: 'Daily Analytics Refresh', status: 'completed', records: 145000, duration: '8m 34s', completedAt: '6:00 AM' },
    { id: '6', name: 'Nightly Claims Export', status: 'failed', records: 1892, duration: '3m 47s', completedAt: '2:00 AM', errorMessage: 'SFTP connection timeout', errorDetails: 'Error: Connection to sftp://claims-export.partner.com:22 timed out after 30000ms. 1,892 records queued for retry. The partner SFTP server was unreachable during the maintenance window. Records have been queued for the next retry cycle at 6:00 AM.' },
]

// Batch processing timeline - batches per hour
const timelineData = Array.from({ length: 24 }, (_, i) => {
    const hour = i
    let batches = 0
    if (hour >= 0 && hour < 4) batches = 1 + Math.floor(Math.random() * 2)
    else if (hour >= 4 && hour < 8) batches = 3 + Math.floor(Math.random() * 3)
    else if (hour >= 8 && hour < 12) batches = 5 + Math.floor(Math.random() * 4)
    else if (hour >= 12 && hour < 16) batches = 4 + Math.floor(Math.random() * 3)
    else if (hour >= 16 && hour < 20) batches = 3 + Math.floor(Math.random() * 2)
    else batches = 2 + Math.floor(Math.random() * 2)
    return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        batches,
        failed: Math.random() > 0.85 ? 1 : 0,
    }
})

const batchStats = [
    { label: 'Total Batches Today', value: '50', icon: <Layers size={22} />, color: '#818cf8', sub: '+8 vs yesterday' },
    { label: 'Success Rate', value: '96%', icon: <Percent size={22} />, color: '#22c55e', sub: '48 of 50 succeeded' },
    { label: 'Avg Duration', value: '7m 24s', icon: <Timer size={22} />, color: '#06b6d4', sub: '-12% from avg' },
    { label: 'Records Processed', value: '178.4K', icon: <TrendingUp size={22} />, color: '#f59e0b', sub: '178,362 total' },
]

export default function BatchDashboard() {
    const [expandedErrors, setExpandedErrors] = useState<string[]>([])

    const toggleErrorExpand = (id: string) => {
        setExpandedErrors(prev =>
            prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
        )
    }

    const failedJobs = historyJobs.filter(j => j.status === 'failed')

    return (
        <div className="batch-dashboard">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <Layers size={28} />
                    Batch Processing
                </h1>
                <p className="page-subtitle">
                    Monitor and manage automated batch jobs and scheduled processes
                </p>
            </motion.div>

            {/* Enhanced Stats */}
            <div className="batch-stats">
                {batchStats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        className="batch-stat"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                    >
                        <div className="batch-stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="batch-stat-info">
                            <h3>{stat.value}</h3>
                            <span>{stat.label}</span>
                            <div className="bd-stat-sub" style={{ color: stat.color }}>{stat.sub}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Batch Processing Timeline Chart */}
            <motion.div
                className="bd-timeline-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <h3>
                    <BarChart3 size={18} />
                    Batch Processing Timeline
                    <span className="bd-chart-subtitle">Batches per hour today</span>
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={timelineData} barGap={2}>
                        <defs>
                            <linearGradient id="batchBarGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.4} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="hour"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            tickLine={false}
                            interval={2}
                        />
                        <YAxis
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(15,15,20,0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                color: '#fff'
                            }}
                            formatter={(value: number, name: string) => [value, name === 'batches' ? 'Successful' : 'Failed']}
                        />
                        <Bar dataKey="batches" fill="url(#batchBarGradient)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
                    </BarChart>
                </ResponsiveContainer>
                <div className="bd-chart-legend">
                    <span><span className="bd-legend-dot" style={{ background: '#818cf8' }} />Successful</span>
                    <span><span className="bd-legend-dot" style={{ background: '#ef4444' }} />Failed</span>
                </div>
            </motion.div>

            {/* Active Jobs */}
            <motion.div
                className="active-jobs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3>
                    <Play size={18} />
                    Active Jobs
                    <span className="bd-active-count">{activeJobs.length} running</span>
                </h3>
                {activeJobs.map((job) => (
                    <div key={job.id} className="job-card">
                        <div className="job-header">
                            <div className="job-info">
                                <div className="job-type-icon">
                                    <Database size={18} />
                                </div>
                                <div className="job-details">
                                    <h4>{job.name}</h4>
                                    <span>{job.type}</span>
                                </div>
                            </div>
                            <span className={`job-status ${job.status}`}>
                                <Play size={10} />
                                Running
                            </span>
                        </div>
                        <div className="job-progress">
                            <div className="progress-bar">
                                <motion.div
                                    className="progress-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${job.progress}%` }}
                                    transition={{ duration: 1.2, ease: 'easeOut' }}
                                />
                                {job.progress > 80 && (
                                    <div className="bd-progress-pulse" style={{ left: `${job.progress}%` }} />
                                )}
                            </div>
                            <div className="progress-text">
                                <span>{job.records.processed.toLocaleString()} / {job.records.total.toLocaleString()} records</span>
                                <span className="bd-progress-pct">{job.progress}%</span>
                            </div>
                        </div>
                        <div className="job-meta">
                            <span><Clock size={12} /> Started: {job.startTime}</span>
                            <span><Timer size={12} /> ETA: {job.eta}</span>
                            <span><Zap size={12} /> {Math.round(job.records.processed / 10)}/sec</span>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Error Log */}
            {failedJobs.length > 0 && (
                <motion.div
                    className="bd-error-log"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <h3>
                        <FileWarning size={18} />
                        Error Log
                        <span className="bd-error-count">{failedJobs.length} errors</span>
                    </h3>
                    <div className="bd-error-list">
                        {failedJobs.map((job) => (
                            <div key={job.id} className="bd-error-item">
                                <div
                                    className="bd-error-header"
                                    onClick={() => toggleErrorExpand(job.id)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="bd-error-icon">
                                        <XCircle size={16} />
                                    </div>
                                    <div className="bd-error-summary">
                                        <div className="bd-error-name">{job.name}</div>
                                        <div className="bd-error-msg">{job.errorMessage}</div>
                                    </div>
                                    <div className="bd-error-meta">
                                        <span className="bd-error-time">{job.completedAt}</span>
                                        <span className="bd-error-records">{job.records.toLocaleString()} records</span>
                                    </div>
                                    <div className="bd-error-expand">
                                        {expandedErrors.includes(job.id) ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )}
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {expandedErrors.includes(job.id) && job.errorDetails && (
                                        <motion.div
                                            className="bd-error-details"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="bd-error-details-inner">
                                                <AlertTriangle size={14} />
                                                <pre>{job.errorDetails}</pre>
                                            </div>
                                            <div className="bd-error-actions">
                                                <button className="bd-error-retry-btn">
                                                    <Play size={12} /> Retry Job
                                                </button>
                                                <button className="bd-error-dismiss-btn">
                                                    Dismiss
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* History */}
            <motion.div
                className="job-history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="history-header">
                    <h3>
                        <History size={18} />
                        Recent History
                    </h3>
                </div>
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Job Name</th>
                            <th>Status</th>
                            <th>Records</th>
                            <th>Duration</th>
                            <th>Completed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyJobs.map((job) => (
                            <tr key={job.id}>
                                <td style={{ fontWeight: 500 }}>{job.name}</td>
                                <td>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        color: job.status === 'completed' ? '#22c55e' : '#ef4444'
                                    }}>
                                        {job.status === 'completed' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                    </span>
                                </td>
                                <td>{job.records.toLocaleString()}</td>
                                <td>{job.duration}</td>
                                <td style={{ color: 'var(--text-tertiary)' }}>{job.completedAt}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    )
}
