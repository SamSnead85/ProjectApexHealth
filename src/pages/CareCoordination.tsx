import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    HeartPulse,
    Users,
    Phone,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    MessageSquare,
    FileText,
    Pill,
    Activity,
    Clock,
    ChevronRight,
    Plus,
    Filter,
    Search
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './CareCoordination.css'

interface CareGap {
    id: string
    memberId: string
    memberName: string
    gapType: string
    priority: 'high' | 'medium' | 'low'
    dueDate: string
    assignee: string
    status: 'open' | 'in_progress' | 'scheduled' | 'completed'
}

interface CareProgram {
    id: string
    name: string
    description: string
    enrolledMembers: number
    activeInterventions: number
    successRate: number
    icon: typeof HeartPulse
}

const careGaps: CareGap[] = [
    { id: 'CG-001', memberId: 'MEM-001', memberName: 'Robert Johnson', gapType: 'Annual Wellness Visit', priority: 'high', dueDate: '2024-02-15', assignee: 'Care Team A', status: 'scheduled' },
    { id: 'CG-002', memberId: 'MEM-002', memberName: 'Maria Garcia', gapType: 'Diabetes HbA1c Test', priority: 'high', dueDate: '2024-01-30', assignee: 'Care Team B', status: 'open' },
    { id: 'CG-003', memberId: 'MEM-003', memberName: 'James Wilson', gapType: 'Mammogram Screening', priority: 'medium', dueDate: '2024-03-01', assignee: 'Care Team A', status: 'in_progress' },
    { id: 'CG-004', memberId: 'MEM-004', memberName: 'Susan Clark', gapType: 'Medication Adherence', priority: 'high', dueDate: '2024-02-01', assignee: 'Care Team C', status: 'open' }
]

const carePrograms: CareProgram[] = [
    { id: 'prog-1', name: 'Chronic Disease Management', description: 'Comprehensive care for diabetes, heart disease, and COPD', enrolledMembers: 1245, activeInterventions: 856, successRate: 78, icon: HeartPulse },
    { id: 'prog-2', name: 'Medication Therapy Management', description: 'Optimize medication regimens and improve adherence', enrolledMembers: 890, activeInterventions: 423, successRate: 82, icon: Pill },
    { id: 'prog-3', name: 'Transitions of Care', description: 'Support members during hospital discharge and recovery', enrolledMembers: 234, activeInterventions: 189, successRate: 91, icon: Activity }
]

export function CareCoordination() {
    const [gaps] = useState<CareGap[]>(careGaps)
    const [programs] = useState<CareProgram[]>(carePrograms)
    const [activeTab, setActiveTab] = useState<'gaps' | 'programs'>('gaps')

    const getPriorityBadge = (priority: CareGap['priority']) => {
        switch (priority) {
            case 'high': return <Badge variant="critical" size="sm">High</Badge>
            case 'medium': return <Badge variant="warning" size="sm">Medium</Badge>
            case 'low': return <Badge variant="info" size="sm">Low</Badge>
        }
    }

    const getStatusBadge = (status: CareGap['status']) => {
        switch (status) {
            case 'open': return <Badge variant="warning" icon={<Clock size={10} />}>Open</Badge>
            case 'in_progress': return <Badge variant="info" icon={<Activity size={10} />}>In Progress</Badge>
            case 'scheduled': return <Badge variant="success" icon={<Calendar size={10} />}>Scheduled</Badge>
            case 'completed': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Completed</Badge>
        }
    }

    return (
        <div className="care-coordination-page">
            {/* Header */}
            <div className="care-coordination__header">
                <div>
                    <h1 className="care-coordination__title">Care Coordination</h1>
                    <p className="care-coordination__subtitle">
                        Manage care gaps, programs, and member outreach
                    </p>
                </div>
                <div className="care-coordination__actions">
                    <Button variant="secondary" icon={<Phone size={16} />}>
                        Start Outreach
                    </Button>
                    <Button variant="primary" icon={<Plus size={16} />}>
                        Add Care Gap
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="care-coordination__stats">
                <MetricCard
                    label="Open Care Gaps"
                    value="852"
                    change={-12.5}
                    trend="down"
                    icon={<AlertTriangle size={20} />}
                />
                <MetricCard
                    label="Scheduled Interventions"
                    value="234"
                    change={8.2}
                    trend="up"
                    icon={<Calendar size={20} />}
                />
                <MetricCard
                    label="Members in Programs"
                    value="2,369"
                    change={15.3}
                    trend="up"
                    icon={<Users size={20} />}
                />
                <MetricCard
                    label="Closure Rate"
                    value="84%"
                    change={5.2}
                    trend="up"
                    icon={<CheckCircle2 size={20} />}
                />
            </div>

            {/* Tabs */}
            <div className="care-coordination__tabs">
                <button
                    className={`care-coordination__tab ${activeTab === 'gaps' ? 'active' : ''}`}
                    onClick={() => setActiveTab('gaps')}
                >
                    <AlertTriangle size={16} /> Care Gaps
                </button>
                <button
                    className={`care-coordination__tab ${activeTab === 'programs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('programs')}
                >
                    <HeartPulse size={16} /> Care Programs
                </button>
            </div>

            {/* Care Gaps */}
            {activeTab === 'gaps' && (
                <GlassCard className="care-gaps-panel">
                    <div className="care-gaps__header">
                        <h3>Active Care Gaps</h3>
                        <div className="care-gaps__filters">
                            <div className="care-gaps__search">
                                <Search size={16} />
                                <input type="text" placeholder="Search members..." />
                            </div>
                            <Button variant="ghost" size="sm" icon={<Filter size={14} />}>Filter</Button>
                        </div>
                    </div>

                    <div className="care-gaps__list">
                        {gaps.map((gap, index) => (
                            <motion.div
                                key={gap.id}
                                className="care-gap-item"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="care-gap-item__main">
                                    <div className="care-gap-item__member">
                                        <div className="member-avatar">
                                            <Users size={16} />
                                        </div>
                                        <div className="member-info">
                                            <span className="member-name">{gap.memberName}</span>
                                            <span className="member-id">{gap.memberId}</span>
                                        </div>
                                    </div>
                                    <div className="care-gap-item__details">
                                        <span className="gap-type">{gap.gapType}</span>
                                        <span className="gap-due">Due: {new Date(gap.dueDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="care-gap-item__priority">
                                    {getPriorityBadge(gap.priority)}
                                </div>
                                <div className="care-gap-item__status">
                                    {getStatusBadge(gap.status)}
                                </div>
                                <div className="care-gap-item__actions">
                                    <Button variant="ghost" size="sm" icon={<Phone size={14} />} />
                                    <Button variant="ghost" size="sm" icon={<MessageSquare size={14} />} />
                                    <Button variant="secondary" size="sm" icon={<ChevronRight size={14} />}>
                                        View
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* Care Programs */}
            {activeTab === 'programs' && (
                <div className="care-programs">
                    {programs.map((program, index) => {
                        const Icon = program.icon
                        return (
                            <motion.div
                                key={program.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <GlassCard className="care-program-card">
                                    <div className="care-program-card__header">
                                        <div className="care-program-card__icon">
                                            <Icon size={24} />
                                        </div>
                                        <div className="care-program-card__info">
                                            <h3>{program.name}</h3>
                                            <p>{program.description}</p>
                                        </div>
                                    </div>

                                    <div className="care-program-card__stats">
                                        <div className="program-stat">
                                            <Users size={14} />
                                            <span className="stat-value">{program.enrolledMembers.toLocaleString()}</span>
                                            <span className="stat-label">Enrolled</span>
                                        </div>
                                        <div className="program-stat">
                                            <Activity size={14} />
                                            <span className="stat-value">{program.activeInterventions}</span>
                                            <span className="stat-label">Active</span>
                                        </div>
                                        <div className="program-stat success">
                                            <CheckCircle2 size={14} />
                                            <span className="stat-value">{program.successRate}%</span>
                                            <span className="stat-label">Success</span>
                                        </div>
                                    </div>

                                    <div className="care-program-card__footer">
                                        <Button variant="secondary" size="sm" icon={<FileText size={14} />}>
                                            View Report
                                        </Button>
                                        <Button variant="primary" size="sm" icon={<Plus size={14} />}>
                                            Enroll Member
                                        </Button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default CareCoordination
