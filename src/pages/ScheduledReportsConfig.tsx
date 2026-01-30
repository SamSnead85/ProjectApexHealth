import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar,
    Clock,
    Plus,
    FileText,
    Users,
    Play,
    Pause,
    Edit,
    Trash2,
    Mail,
    BarChart3
} from 'lucide-react'
import './ScheduledReportsConfig.css'

interface ScheduledReport {
    id: string
    name: string
    type: string
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    recipients: { initials: string }[]
    nextRun: string
    active: boolean
}

const schedules: ScheduledReport[] = [
    { id: '1', name: 'Weekly Claims Summary', type: 'Claims Analytics', frequency: 'weekly', recipients: [{ initials: 'SM' }, { initials: 'JC' }, { initials: 'LT' }], nextRun: 'Mon, 8:00 AM', active: true },
    { id: '2', name: 'Monthly SIR Report', type: 'Self-Insured Analytics', frequency: 'monthly', recipients: [{ initials: 'CEO' }, { initials: 'CFO' }], nextRun: 'Feb 1, 6:00 AM', active: true },
    { id: '3', name: 'Daily Eligibility Changes', type: 'Eligibility', frequency: 'daily', recipients: [{ initials: 'HR' }, { initials: 'AD' }], nextRun: 'Tomorrow, 7:00 AM', active: true },
    { id: '4', name: 'Quarterly Board Deck', type: 'Executive Summary', frequency: 'quarterly', recipients: [{ initials: 'BD' }], nextRun: 'Apr 1, 9:00 AM', active: true },
    { id: '5', name: 'Provider Payment Summary', type: 'Finance', frequency: 'weekly', recipients: [{ initials: 'FN' }, { initials: 'AP' }], nextRun: 'Fri, 5:00 PM', active: false },
]

const frequencyLabels = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly'
}

export default function ScheduledReportsConfig() {
    const [activeSchedules, setActiveSchedules] = useState(
        schedules.reduce((acc, s) => ({ ...acc, [s.id]: s.active }), {} as Record<string, boolean>)
    )

    const toggleSchedule = (id: string) => {
        setActiveSchedules(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const activeCount = Object.values(activeSchedules).filter(Boolean).length
    const totalRecipients = schedules.reduce((acc, s) => acc + s.recipients.length, 0)

    return (
        <div className="scheduled-reports-config">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <Calendar size={28} />
                    Scheduled Reports
                </h1>
                <p className="page-subtitle">
                    Configure automated report delivery to stakeholders
                </p>
            </motion.div>

            {/* Stats */}
            <div className="schedule-stats">
                <motion.div className="schedule-stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="stat-icon active"><Play size={20} /></div>
                    <div className="stat-content">
                        <h3>{activeCount}</h3>
                        <span>Active Schedules</span>
                    </div>
                </motion.div>
                <motion.div className="schedule-stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="stat-icon today"><Clock size={20} /></div>
                    <div className="stat-content">
                        <h3>3</h3>
                        <span>Running Today</span>
                    </div>
                </motion.div>
                <motion.div className="schedule-stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="stat-icon recipients"><Users size={20} /></div>
                    <div className="stat-content">
                        <h3>{totalRecipients}</h3>
                        <span>Recipients</span>
                    </div>
                </motion.div>
                <motion.div className="schedule-stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <div className="stat-icon paused"><Pause size={20} /></div>
                    <div className="stat-content">
                        <h3>{schedules.length - activeCount}</h3>
                        <span>Paused</span>
                    </div>
                </motion.div>
            </div>

            {/* Schedules */}
            <motion.div className="schedules-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="schedules-header">
                    <h3><BarChart3 size={18} /> Report Schedules</h3>
                    <button className="add-schedule-btn"><Plus size={16} /> New Schedule</button>
                </div>

                {schedules.map((schedule) => (
                    <div key={schedule.id} className="schedule-item">
                        <div className="schedule-info">
                            <div className="schedule-icon"><FileText size={18} /></div>
                            <div className="schedule-details">
                                <h4>{schedule.name}</h4>
                                <span>{schedule.type}</span>
                            </div>
                        </div>
                        <div className="schedule-frequency">
                            <Clock size={14} />
                            <span className="frequency-badge">{frequencyLabels[schedule.frequency]}</span>
                        </div>
                        <div className="schedule-recipients">
                            <div className="recipient-avatars">
                                {schedule.recipients.slice(0, 3).map((r, i) => (
                                    <div key={i} className="recipient-avatar">{r.initials}</div>
                                ))}
                            </div>
                            {schedule.recipients.length > 3 && (
                                <span className="recipient-count">+{schedule.recipients.length - 3}</span>
                            )}
                        </div>
                        <div className="schedule-next">{schedule.nextRun}</div>
                        <div className="schedule-actions">
                            <div
                                className={`toggle-switch ${activeSchedules[schedule.id] ? 'active' : ''}`}
                                onClick={() => toggleSchedule(schedule.id)}
                            />
                            <button className="action-btn"><Edit size={14} /></button>
                            <button className="action-btn delete"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
