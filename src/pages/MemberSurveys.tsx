import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ClipboardList,
    Star,
    ThumbsUp,
    ThumbsDown,
    BarChart3,
    Clock,
    CheckCircle2,
    Send,
    Plus
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './MemberSurveys.css'

interface Survey {
    id: string
    name: string
    type: 'cahps' | 'nps' | 'satisfaction' | 'custom'
    status: 'active' | 'completed' | 'scheduled'
    responses: number
    targetResponses: number
    startDate: string
    endDate: string | null
}

interface SurveyMetric {
    label: string
    value: string
    change: number
    icon: React.ReactNode
}

const surveys: Survey[] = [
    { id: 'SRV-001', name: 'Annual CAHPS Survey', type: 'cahps', status: 'active', responses: 1250, targetResponses: 2000, startDate: '2024-01-01', endDate: '2024-03-31' },
    { id: 'SRV-002', name: 'Member NPS Q1 2024', type: 'nps', status: 'active', responses: 856, targetResponses: 1000, startDate: '2024-01-15', endDate: '2024-01-31' },
    { id: 'SRV-003', name: 'Claims Experience Survey', type: 'satisfaction', status: 'completed', responses: 2340, targetResponses: 2000, startDate: '2023-10-01', endDate: '2023-12-31' },
    { id: 'SRV-004', name: 'New Member Onboarding', type: 'custom', status: 'scheduled', responses: 0, targetResponses: 500, startDate: '2024-02-01', endDate: null }
]

const metrics: SurveyMetric[] = [
    { label: 'Overall Satisfaction', value: '4.2/5', change: 0.3, icon: <Star size={20} /> },
    { label: 'Net Promoter Score', value: '+42', change: 5, icon: <BarChart3 size={20} /> },
    { label: 'Response Rate', value: '68%', change: 8, icon: <ClipboardList size={20} /> }
]

export function MemberSurveys() {
    const [allSurveys] = useState<Survey[]>(surveys)

    const getTypeBadge = (type: Survey['type']) => {
        const variants: Record<string, any> = {
            cahps: 'teal',
            nps: 'purple',
            satisfaction: 'info',
            custom: 'default'
        }
        return <Badge variant={variants[type]} size="sm">{type.toUpperCase()}</Badge>
    }

    const getStatusBadge = (status: Survey['status']) => {
        switch (status) {
            case 'active': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Active</Badge>
            case 'completed': return <Badge variant="default">Completed</Badge>
            case 'scheduled': return <Badge variant="info" icon={<Clock size={10} />}>Scheduled</Badge>
        }
    }

    return (
        <div className="member-surveys-page">
            {/* Header */}
            <div className="surveys__header">
                <div>
                    <h1 className="surveys__title">Member Surveys</h1>
                    <p className="surveys__subtitle">
                        CAHPS, NPS, and satisfaction surveys
                    </p>
                </div>
                <Button variant="primary" icon={<Plus size={16} />}>
                    Create Survey
                </Button>
            </div>

            {/* Metrics */}
            <div className="surveys__metrics">
                {metrics.map((metric, index) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <GlassCard className="metric-card">
                            <div className="metric-icon">{metric.icon}</div>
                            <div className="metric-content">
                                <span className="metric-value">{metric.value}</span>
                                <span className="metric-label">{metric.label}</span>
                            </div>
                            <span className="metric-change positive">+{metric.change}</span>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Surveys List */}
            <GlassCard className="surveys-list">
                <div className="surveys-list__header">
                    <h3>All Surveys</h3>
                </div>
                <table className="surveys-table">
                    <thead>
                        <tr>
                            <th>Survey Name</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Progress</th>
                            <th>Date Range</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allSurveys.map((survey, index) => (
                            <motion.tr
                                key={survey.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <td className="survey-name">{survey.name}</td>
                                <td>{getTypeBadge(survey.type)}</td>
                                <td>{getStatusBadge(survey.status)}</td>
                                <td>
                                    <div className="progress-cell">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${Math.min((survey.responses / survey.targetResponses) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <span>{survey.responses}/{survey.targetResponses}</span>
                                    </div>
                                </td>
                                <td className="date-range">
                                    {new Date(survey.startDate).toLocaleDateString()} -
                                    {survey.endDate ? new Date(survey.endDate).toLocaleDateString() : 'Ongoing'}
                                </td>
                                <td>
                                    <div className="table-actions">
                                        <Button variant="ghost" size="sm">View Results</Button>
                                        {survey.status === 'active' && (
                                            <Button variant="secondary" size="sm" icon={<Send size={12} />}>Send Reminder</Button>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    )
}

export default MemberSurveys
