import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Layers,
    Play,
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    Database,
    Upload,
    Timer,
    BarChart3,
    History
} from 'lucide-react'
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
}

const activeJobs: ActiveJob[] = [
    { id: '1', name: 'Claims Adjudication Batch', type: '837 Processing', progress: 67, records: { processed: 4847, total: 7234 }, startTime: '10:23 AM', eta: '~12 min', status: 'running' },
    { id: '2', name: 'Provider Payment Run', type: 'EFT Generation', progress: 34, records: { processed: 892, total: 2645 }, startTime: '10:45 AM', eta: '~28 min', status: 'running' },
]

const historyJobs: HistoryJob[] = [
    { id: '1', name: 'Eligibility 834 Import', status: 'completed', records: 12847, duration: '4m 23s', completedAt: '10:15 AM' },
    { id: '2', name: 'Claims Adjudication Batch', status: 'completed', records: 8234, duration: '18m 42s', completedAt: '9:45 AM' },
    { id: '3', name: 'Stop-Loss Report Generation', status: 'completed', records: 47, duration: '2m 15s', completedAt: '9:30 AM' },
    { id: '4', name: 'Member ID Card Batch', status: 'failed', records: 234, duration: '1m 08s', completedAt: '8:00 AM' },
    { id: '5', name: 'Daily Analytics Refresh', status: 'completed', records: 145000, duration: '8m 34s', completedAt: '6:00 AM' },
]

export default function BatchDashboard() {
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

            {/* Stats */}
            <div className="batch-stats">
                <motion.div
                    className="batch-stat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="batch-stat-icon running">
                        <Play size={22} />
                    </div>
                    <div className="batch-stat-info">
                        <h3>2</h3>
                        <span>Running Now</span>
                    </div>
                </motion.div>

                <motion.div
                    className="batch-stat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="batch-stat-icon completed">
                        <CheckCircle2 size={22} />
                    </div>
                    <div className="batch-stat-info">
                        <h3>47</h3>
                        <span>Completed Today</span>
                    </div>
                </motion.div>

                <motion.div
                    className="batch-stat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="batch-stat-icon failed">
                        <XCircle size={22} />
                    </div>
                    <div className="batch-stat-info">
                        <h3>1</h3>
                        <span>Failed</span>
                    </div>
                </motion.div>

                <motion.div
                    className="batch-stat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <div className="batch-stat-icon scheduled">
                        <Clock size={22} />
                    </div>
                    <div className="batch-stat-info">
                        <h3>8</h3>
                        <span>Scheduled</span>
                    </div>
                </motion.div>
            </div>

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
                                <div className="progress-fill" style={{ width: `${job.progress}%` }} />
                            </div>
                            <div className="progress-text">
                                <span>{job.records.processed.toLocaleString()} / {job.records.total.toLocaleString()} records</span>
                                <span>{job.progress}%</span>
                            </div>
                        </div>
                        <div className="job-meta">
                            <span><Clock size={12} /> Started: {job.startTime}</span>
                            <span><Timer size={12} /> ETA: {job.eta}</span>
                            <span><BarChart3 size={12} /> {Math.round(job.records.processed / 10)}/sec</span>
                        </div>
                    </div>
                ))}
            </motion.div>

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
