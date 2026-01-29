import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    HeartPulse,
    Users,
    Activity,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    MessageSquare,
    Phone,
    Brain,
    Baby
} from 'lucide-react'
import './CareManagement.css'

interface CareProgram {
    id: string
    name: string
    description: string
    iconType: 'diabetes' | 'cardiac' | 'maternal' | 'behavioral'
    enrolled: number
    engagementRate: number
    outcomes: number
}

interface Patient {
    id: string
    name: string
    initials: string
    age: number
    program: string
    riskLevel: 'high' | 'medium' | 'low'
    lastContact: string
    engagementScore: number
    nextAction: string
}

interface TimelineEvent {
    id: string
    title: string
    description: string
    time: string
}

const carePrograms: CareProgram[] = [
    { id: '1', name: 'Diabetes Management', description: 'Comprehensive diabetes care with A1c monitoring', iconType: 'diabetes', enrolled: 847, engagementRate: 78, outcomes: 23 },
    { id: '2', name: 'Cardiac Rehab', description: 'Post-cardiac event recovery and monitoring', iconType: 'cardiac', enrolled: 234, engagementRate: 82, outcomes: 31 },
    { id: '3', name: 'Maternal Health', description: 'Prenatal and postpartum care coordination', iconType: 'maternal', enrolled: 156, engagementRate: 91, outcomes: 45 },
    { id: '4', name: 'Behavioral Health', description: 'Mental health support and counseling', iconType: 'behavioral', enrolled: 512, engagementRate: 65, outcomes: 18 },
]

const patients: Patient[] = [
    { id: '1', name: 'James Wilson', initials: 'JW', age: 62, program: 'Diabetes', riskLevel: 'high', lastContact: '2 days ago', engagementScore: 45, nextAction: 'A1c follow-up' },
    { id: '2', name: 'Maria Santos', initials: 'MS', age: 34, program: 'Maternal', riskLevel: 'medium', lastContact: 'Yesterday', engagementScore: 78, nextAction: 'Prenatal visit' },
    { id: '3', name: 'Robert Chen', initials: 'RC', age: 58, program: 'Cardiac', riskLevel: 'high', lastContact: '1 week ago', engagementScore: 32, nextAction: 'Urgent: Med review' },
    { id: '4', name: 'Linda Thompson', initials: 'LT', age: 45, program: 'Behavioral', riskLevel: 'low', lastContact: '3 days ago', engagementScore: 89, nextAction: 'Monthly check-in' },
]

const timelineEvents: TimelineEvent[] = [
    { id: '1', title: 'Care Plan Updated', description: 'Updated medication regimen for patient JW', time: '10 min ago' },
    { id: '2', title: 'Outreach Call Completed', description: 'Successful contact with MS regarding prenatal care', time: '1 hour ago' },
    { id: '3', title: 'Risk Assessment', description: 'Elevated risk flag for patient RC - cardiac event risk', time: '2 hours ago' },
    { id: '4', title: 'Program Enrollment', description: 'New patient enrolled in Diabetes Management program', time: '3 hours ago' },
]

const getProgramIcon = (type: string) => {
    switch (type) {
        case 'diabetes': return <Activity size={24} />
        case 'cardiac': return <HeartPulse size={24} />
        case 'maternal': return <Baby size={24} />
        case 'behavioral': return <Brain size={24} />
        default: return <Activity size={24} />
    }
}

export default function CareManagement() {
    return (
        <div className="care-management">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <HeartPulse size={28} />
                    Care Management
                </h1>
                <p className="page-subtitle">
                    Coordinate patient care programs, track engagement, and monitor outcomes
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="cm-stats">
                <motion.div
                    className="cm-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h4>Active Patients</h4>
                    <div className="value">
                        1,749
                        <span className="trend positive">+12%</span>
                    </div>
                </motion.div>

                <motion.div
                    className="cm-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h4>Avg Engagement</h4>
                    <div className="value">
                        76%
                        <span className="trend positive">+4%</span>
                    </div>
                </motion.div>

                <motion.div
                    className="cm-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h4>High-Risk Patients</h4>
                    <div className="value">
                        234
                        <span className="trend negative">+18</span>
                    </div>
                </motion.div>

                <motion.div
                    className="cm-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <h4>Outcomes Improved</h4>
                    <div className="value">
                        28%
                        <span className="trend positive">+5%</span>
                    </div>
                </motion.div>
            </div>

            {/* Care Programs */}
            <motion.div
                className="programs-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2>
                    <Activity size={20} />
                    Care Programs
                </h2>
                <div className="program-grid">
                    {carePrograms.map((program, index) => (
                        <motion.div
                            key={program.id}
                            className="program-card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 + index * 0.05 }}
                        >
                            <div className="program-header">
                                <div className={`program-icon ${program.iconType}`}>
                                    {getProgramIcon(program.iconType)}
                                </div>
                                <div className="program-info">
                                    <h3>{program.name}</h3>
                                    <span>{program.description}</span>
                                </div>
                            </div>
                            <div className="program-metrics">
                                <div className="program-metric">
                                    <div className="metric-value">{program.enrolled}</div>
                                    <div className="metric-label">Enrolled</div>
                                </div>
                                <div className="program-metric">
                                    <div className="metric-value">{program.engagementRate}%</div>
                                    <div className="metric-label">Engagement</div>
                                </div>
                                <div className="program-metric">
                                    <div className="metric-value">+{program.outcomes}%</div>
                                    <div className="metric-label">Outcomes</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Patient List */}
            <motion.div
                className="patient-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2>
                    <Users size={20} />
                    Priority Patients
                </h2>
                <table className="patient-table">
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Program</th>
                            <th>Risk Level</th>
                            <th>Last Contact</th>
                            <th>Engagement</th>
                            <th>Next Action</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((patient) => (
                            <tr key={patient.id}>
                                <td>
                                    <div className="patient-info">
                                        <div className="patient-avatar">{patient.initials}</div>
                                        <div className="patient-details">
                                            <h4>{patient.name}</h4>
                                            <span>Age {patient.age}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{patient.program}</td>
                                <td>
                                    <span className={`risk-indicator ${patient.riskLevel}`}>
                                        {patient.riskLevel === 'high' && <AlertTriangle size={12} />}
                                        {patient.riskLevel.charAt(0).toUpperCase() + patient.riskLevel.slice(1)}
                                    </span>
                                </td>
                                <td>{patient.lastContact}</td>
                                <td>
                                    <div className="engagement-bar">
                                        <div className="engagement-fill" style={{ width: `${patient.engagementScore}%` }} />
                                    </div>
                                </td>
                                <td>{patient.nextAction}</td>
                                <td>
                                    <button className="action-btn">
                                        <Phone size={14} style={{ marginRight: '0.35rem' }} />
                                        Contact
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Activity Timeline */}
            <motion.div
                className="timeline-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <h2>
                    <Clock size={20} />
                    Recent Activity
                </h2>
                {timelineEvents.map((event) => (
                    <div key={event.id} className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                            <h4>{event.title}</h4>
                            <p>{event.description}</p>
                            <span>{event.time}</span>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
