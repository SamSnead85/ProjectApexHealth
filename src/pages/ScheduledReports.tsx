import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Clock,
    Calendar,
    Mail,
    FileText,
    Play,
    Pause,
    Edit3,
    Trash2,
    Plus,
    CheckCircle2,
    AlertTriangle,
    BarChart3
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './ScheduledReports.css'

interface ScheduledReport {
    id: string
    name: string
    description: string
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    nextRun: string
    lastRun: string | null
    status: 'active' | 'paused' | 'error'
    recipients: string[]
    format: 'pdf' | 'excel' | 'csv'
}

const reports: ScheduledReport[] = [
    { id: 'SCH-001', name: 'Weekly Claims Summary', description: 'Summary of all processed claims', frequency: 'weekly', nextRun: '2024-01-29T08:00:00', lastRun: '2024-01-22T08:00:00', status: 'active', recipients: ['admin@apex.com', 'reports@apex.com'], format: 'pdf' },
    { id: 'SCH-002', name: 'Monthly Financial Report', description: 'Revenue and expense breakdown', frequency: 'monthly', nextRun: '2024-02-01T06:00:00', lastRun: '2024-01-01T06:00:00', status: 'active', recipients: ['finance@apex.com'], format: 'excel' },
    { id: 'SCH-003', name: 'Daily Enrollment Stats', description: 'New enrollments and terminations', frequency: 'daily', nextRun: '2024-01-27T07:00:00', lastRun: '2024-01-26T07:00:00', status: 'paused', recipients: ['operations@apex.com'], format: 'csv' },
    { id: 'SCH-004', name: 'Quarterly Quality Metrics', description: 'HEDIS and quality measure results', frequency: 'quarterly', nextRun: '2024-04-01T08:00:00', lastRun: '2024-01-01T08:00:00', status: 'error', recipients: ['quality@apex.com', 'compliance@apex.com'], format: 'pdf' }
]

export function ScheduledReports() {
    const [allReports] = useState<ScheduledReport[]>(reports)

    const getStatusBadge = (status: ScheduledReport['status']) => {
        switch (status) {
            case 'active': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Active</Badge>
            case 'paused': return <Badge variant="warning" icon={<Pause size={10} />}>Paused</Badge>
            case 'error': return <Badge variant="critical" icon={<AlertTriangle size={10} />}>Error</Badge>
        }
    }

    const getFrequencyBadge = (freq: ScheduledReport['frequency']) => {
        return <Badge variant="default" size="sm">{freq.charAt(0).toUpperCase() + freq.slice(1)}</Badge>
    }

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        })
    }

    return (
        <div className="scheduled-reports-page">
            {/* Header */}
            <div className="scheduled__header">
                <div>
                    <h1 className="scheduled__title">Scheduled Reports</h1>
                    <p className="scheduled__subtitle">
                        Automate and schedule recurring reports
                    </p>
                </div>
                <Button variant="primary" icon={<Plus size={16} />}>
                    Schedule Report
                </Button>
            </div>

            {/* Stats */}
            <div className="scheduled__stats">
                <GlassCard className="stat-card">
                    <BarChart3 size={24} />
                    <div>
                        <span className="stat-value">{allReports.length}</span>
                        <span className="stat-label">Total Scheduled</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <CheckCircle2 size={24} />
                    <div>
                        <span className="stat-value">{allReports.filter(r => r.status === 'active').length}</span>
                        <span className="stat-label">Active</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <Clock size={24} />
                    <div>
                        <span className="stat-value">Today</span>
                        <span className="stat-label">Next Report Run</span>
                    </div>
                </GlassCard>
            </div>

            {/* Reports List */}
            <div className="reports-list">
                {allReports.map((report, index) => (
                    <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <GlassCard className="report-card">
                            <div className="report-card__header">
                                <FileText size={20} />
                                <div className="report-card__title">
                                    <h4>{report.name}</h4>
                                    <p>{report.description}</p>
                                </div>
                                {getStatusBadge(report.status)}
                            </div>
                            <div className="report-card__details">
                                <div className="detail-item">
                                    <Calendar size={14} />
                                    <span>Frequency: {getFrequencyBadge(report.frequency)}</span>
                                </div>
                                <div className="detail-item">
                                    <Clock size={14} />
                                    <span>Next Run: {formatDateTime(report.nextRun)}</span>
                                </div>
                                <div className="detail-item">
                                    <Mail size={14} />
                                    <span>{report.recipients.length} recipient(s)</span>
                                </div>
                                <div className="detail-item format">
                                    <Badge variant="info" size="sm">{report.format.toUpperCase()}</Badge>
                                </div>
                            </div>
                            <div className="report-card__actions">
                                {report.status === 'active' ? (
                                    <Button variant="ghost" size="sm" icon={<Pause size={14} />}>Pause</Button>
                                ) : (
                                    <Button variant="ghost" size="sm" icon={<Play size={14} />}>Resume</Button>
                                )}
                                <Button variant="ghost" size="sm" icon={<Edit3 size={14} />}>Edit</Button>
                                <Button variant="primary" size="sm" icon={<Play size={14} />}>Run Now</Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default ScheduledReports
