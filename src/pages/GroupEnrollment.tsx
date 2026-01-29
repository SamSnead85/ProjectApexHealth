import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Building2,
    Users,
    UserPlus,
    UserMinus,
    Calendar,
    FileText,
    Upload,
    Download,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertTriangle,
    TrendingUp,
    Briefcase
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './GroupEnrollment.css'

interface EmployerGroup {
    id: string
    name: string
    groupNumber: string
    effectiveDate: string
    renewalDate: string
    totalMembers: number
    activeMembers: number
    status: 'active' | 'pending' | 'renewing' | 'terminated'
    industry: string
    planType: string
}

interface EnrollmentEvent {
    id: string
    type: 'new_hire' | 'termination' | 'qualifying_event' | 'open_enrollment'
    memberName: string
    groupName: string
    effectiveDate: string
    status: 'pending' | 'processed' | 'rejected'
    submittedDate: string
}

const employerGroups: EmployerGroup[] = [
    { id: 'GRP-001', name: 'Acme Corporation', groupNumber: 'ACM-2024-001', effectiveDate: '2024-01-01', renewalDate: '2025-01-01', totalMembers: 245, activeMembers: 238, status: 'active', industry: 'Technology', planType: 'PPO Platinum' },
    { id: 'GRP-002', name: 'TechStart Inc', groupNumber: 'TSI-2024-002', effectiveDate: '2024-01-01', renewalDate: '2025-01-01', totalMembers: 134, activeMembers: 134, status: 'active', industry: 'Software', planType: 'PPO Gold' },
    { id: 'GRP-003', name: 'Global Services LLC', groupNumber: 'GSL-2024-003', effectiveDate: '2023-06-01', renewalDate: '2024-06-01', totalMembers: 420, activeMembers: 412, status: 'renewing', industry: 'Consulting', planType: 'HMO Standard' },
    { id: 'GRP-004', name: 'Sunrise Healthcare', groupNumber: 'SHC-2023-004', effectiveDate: '2023-09-01', renewalDate: '2024-09-01', totalMembers: 88, activeMembers: 85, status: 'active', industry: 'Healthcare', planType: 'PPO Silver' }
]

const enrollmentEvents: EnrollmentEvent[] = [
    { id: 'EVT-001', type: 'new_hire', memberName: 'John Smith', groupName: 'Acme Corporation', effectiveDate: '2024-02-01', status: 'pending', submittedDate: '2024-01-25' },
    { id: 'EVT-002', type: 'termination', memberName: 'Jane Doe', groupName: 'TechStart Inc', effectiveDate: '2024-01-31', status: 'processed', submittedDate: '2024-01-20' },
    { id: 'EVT-003', type: 'qualifying_event', memberName: 'Mike Johnson', groupName: 'Global Services LLC', effectiveDate: '2024-02-15', status: 'pending', submittedDate: '2024-01-26' },
    { id: 'EVT-004', type: 'new_hire', memberName: 'Sarah Wilson', groupName: 'Sunrise Healthcare', effectiveDate: '2024-02-01', status: 'processed', submittedDate: '2024-01-22' }
]

export function GroupEnrollment() {
    const [groups] = useState<EmployerGroup[]>(employerGroups)
    const [events] = useState<EnrollmentEvent[]>(enrollmentEvents)
    const [activeTab, setActiveTab] = useState<'groups' | 'events'>('groups')

    const getStatusBadge = (status: EmployerGroup['status']) => {
        switch (status) {
            case 'active': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Active</Badge>
            case 'pending': return <Badge variant="warning" icon={<Clock size={10} />}>Pending</Badge>
            case 'renewing': return <Badge variant="info" icon={<TrendingUp size={10} />}>Renewing</Badge>
            case 'terminated': return <Badge variant="critical">Terminated</Badge>
        }
    }

    const getEventBadge = (type: EnrollmentEvent['type']) => {
        switch (type) {
            case 'new_hire': return <Badge variant="success" size="sm" icon={<UserPlus size={10} />}>New Hire</Badge>
            case 'termination': return <Badge variant="critical" size="sm" icon={<UserMinus size={10} />}>Termination</Badge>
            case 'qualifying_event': return <Badge variant="info" size="sm">Qualifying Event</Badge>
            case 'open_enrollment': return <Badge variant="purple" size="sm">Open Enrollment</Badge>
        }
    }

    const getEventStatusBadge = (status: EnrollmentEvent['status']) => {
        switch (status) {
            case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>
            case 'processed': return <Badge variant="success" size="sm">Processed</Badge>
            case 'rejected': return <Badge variant="critical" size="sm">Rejected</Badge>
        }
    }

    const totalMembers = groups.reduce((sum, g) => sum + g.activeMembers, 0)

    return (
        <div className="group-enrollment-page">
            {/* Header */}
            <div className="enrollment__header">
                <div>
                    <h1 className="enrollment__title">Group Enrollment</h1>
                    <p className="enrollment__subtitle">
                        Manage employer groups and enrollment transactions
                    </p>
                </div>
                <div className="enrollment__actions">
                    <Button variant="secondary" icon={<Upload size={16} />}>
                        Import File
                    </Button>
                    <Button variant="primary" icon={<Building2 size={16} />}>
                        Add Group
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="enrollment__stats">
                <MetricCard
                    title="Active Groups"
                    value={groups.filter(g => g.status === 'active').length.toString()}
                    icon={<Building2 size={20} />}
                />
                <MetricCard
                    title="Total Members"
                    value={totalMembers.toLocaleString()}
                    change={{ value: 5.2, type: 'increase' }}
                    icon={<Users size={20} />}
                />
                <MetricCard
                    title="Pending Events"
                    value={events.filter(e => e.status === 'pending').length.toString()}
                    icon={<Clock size={20} />}
                />
                <MetricCard
                    title="Renewals (90 Days)"
                    value="2"
                    icon={<Calendar size={20} />}
                />
            </div>

            {/* Tabs */}
            <div className="enrollment__tabs">
                <button
                    className={`enrollment__tab ${activeTab === 'groups' ? 'active' : ''}`}
                    onClick={() => setActiveTab('groups')}
                >
                    <Building2 size={16} /> Employer Groups
                </button>
                <button
                    className={`enrollment__tab ${activeTab === 'events' ? 'active' : ''}`}
                    onClick={() => setActiveTab('events')}
                >
                    <FileText size={16} /> Enrollment Events
                </button>
            </div>

            {/* Groups */}
            {activeTab === 'groups' && (
                <GlassCard className="groups-panel">
                    <div className="groups-panel__header">
                        <h3>Employer Groups</h3>
                        <div className="groups-panel__filters">
                            <div className="groups-panel__search">
                                <Search size={16} />
                                <input type="text" placeholder="Search groups..." />
                            </div>
                            <Button variant="ghost" size="sm" icon={<Filter size={14} />}>Filter</Button>
                        </div>
                    </div>

                    <div className="groups-list">
                        {groups.map((group, index) => (
                            <motion.div
                                key={group.id}
                                className="group-card"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="group-card__header">
                                    <div className="group-card__icon">
                                        <Building2 size={20} />
                                    </div>
                                    <div className="group-card__info">
                                        <h4>{group.name}</h4>
                                        <span className="group-number">{group.groupNumber}</span>
                                    </div>
                                    {getStatusBadge(group.status)}
                                </div>

                                <div className="group-card__meta">
                                    <div className="meta-item">
                                        <Briefcase size={12} />
                                        <span>{group.industry}</span>
                                    </div>
                                    <div className="meta-item">
                                        <FileText size={12} />
                                        <span>{group.planType}</span>
                                    </div>
                                </div>

                                <div className="group-card__stats">
                                    <div className="stat">
                                        <span className="stat-value">{group.activeMembers}</span>
                                        <span className="stat-label">Active</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-value">{group.totalMembers}</span>
                                        <span className="stat-label">Total</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-value">{new Date(group.renewalDate).toLocaleDateString()}</span>
                                        <span className="stat-label">Renewal</span>
                                    </div>
                                </div>

                                <div className="group-card__footer">
                                    <Button variant="secondary" size="sm">View Details</Button>
                                    <Button variant="ghost" size="sm" icon={<Download size={14} />}>Roster</Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* Events */}
            {activeTab === 'events' && (
                <GlassCard className="events-panel">
                    <div className="events-panel__header">
                        <h3>Recent Enrollment Events</h3>
                        <Button variant="primary" size="sm" icon={<UserPlus size={14} />}>Add Event</Button>
                    </div>

                    <div className="events-list">
                        {events.map((event, index) => (
                            <motion.div
                                key={event.id}
                                className="event-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="event-item__type">
                                    {getEventBadge(event.type)}
                                </div>
                                <div className="event-item__info">
                                    <span className="event-member">{event.memberName}</span>
                                    <span className="event-group">{event.groupName}</span>
                                </div>
                                <div className="event-item__date">
                                    <span>Effective: {new Date(event.effectiveDate).toLocaleDateString()}</span>
                                </div>
                                {getEventStatusBadge(event.status)}
                                <Button variant="ghost" size="sm">Process</Button>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            )}
        </div>
    )
}

export default GroupEnrollment
