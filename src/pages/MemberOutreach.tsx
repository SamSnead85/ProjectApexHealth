import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Phone,
    Mail,
    MessageSquare,
    Users,
    Calendar,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Send,
    Plus,
    Filter,
    Search,
    FileText,
    Target,
    TrendingUp,
    Megaphone
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './MemberOutreach.css'

interface Campaign {
    id: string
    name: string
    type: 'preventive' | 'gaps_in_care' | 'enrollment' | 'retention' | 'wellness'
    status: 'draft' | 'active' | 'paused' | 'completed'
    targetMembers: number
    contacted: number
    responded: number
    channel: 'phone' | 'email' | 'sms' | 'mail'
    startDate: string
    endDate?: string
}

interface OutreachTask {
    id: string
    memberId: string
    memberName: string
    reason: string
    priority: 'high' | 'medium' | 'low'
    channel: 'phone' | 'email' | 'sms'
    status: 'pending' | 'attempted' | 'completed' | 'no_response'
    attempts: number
    nextAttempt?: string
}

const campaigns: Campaign[] = [
    { id: 'CMP-001', name: 'Annual Wellness Visit Reminder', type: 'preventive', status: 'active', targetMembers: 5420, contacted: 3250, responded: 1890, channel: 'phone', startDate: '2024-01-01' },
    { id: 'CMP-002', name: 'Diabetes Care Gap Closure', type: 'gaps_in_care', status: 'active', targetMembers: 1250, contacted: 890, responded: 456, channel: 'email', startDate: '2024-01-15' },
    { id: 'CMP-003', name: 'Q1 Wellness Challenge', type: 'wellness', status: 'active', targetMembers: 8500, contacted: 8500, responded: 2100, channel: 'sms', startDate: '2024-01-01', endDate: '2024-03-31' }
]

const outreachTasks: OutreachTask[] = [
    { id: 'OUT-001', memberId: 'MEM-001', memberName: 'Robert Johnson', reason: 'HbA1c Test Overdue', priority: 'high', channel: 'phone', status: 'pending', attempts: 0 },
    { id: 'OUT-002', memberId: 'MEM-002', memberName: 'Maria Garcia', reason: 'Medication Refill Reminder', priority: 'medium', channel: 'sms', status: 'attempted', attempts: 2, nextAttempt: '2024-01-28' },
    { id: 'OUT-003', memberId: 'MEM-003', memberName: 'James Wilson', reason: 'Wellness Visit Scheduling', priority: 'high', channel: 'phone', status: 'pending', attempts: 1 },
    { id: 'OUT-004', memberId: 'MEM-004', memberName: 'Susan Clark', reason: 'Care Manager Introduction', priority: 'low', channel: 'email', status: 'completed', attempts: 1 }
]

export function MemberOutreach() {
    const [campaignList] = useState<Campaign[]>(campaigns)
    const [tasks] = useState<OutreachTask[]>(outreachTasks)
    const [activeTab, setActiveTab] = useState<'queue' | 'campaigns'>('queue')

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case 'phone': return <Phone size={14} />
            case 'email': return <Mail size={14} />
            case 'sms': return <MessageSquare size={14} />
            case 'mail': return <FileText size={14} />
            default: return <Phone size={14} />
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high': return <Badge variant="critical" size="sm">High</Badge>
            case 'medium': return <Badge variant="warning" size="sm">Medium</Badge>
            case 'low': return <Badge variant="info" size="sm">Low</Badge>
            default: return <Badge variant="info" size="sm">{priority}</Badge>
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="warning" icon={<Clock size={10} />}>Pending</Badge>
            case 'attempted': return <Badge variant="info" icon={<Phone size={10} />}>Attempted</Badge>
            case 'completed': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Completed</Badge>
            case 'no_response': return <Badge variant="critical" icon={<AlertTriangle size={10} />}>No Response</Badge>
            case 'active': return <Badge variant="success">Active</Badge>
            case 'paused': return <Badge variant="warning">Paused</Badge>
            case 'draft': return <Badge variant="info">Draft</Badge>
            default: return <Badge variant="info">{status}</Badge>
        }
    }

    return (
        <div className="member-outreach-page">
            {/* Header */}
            <div className="outreach__header">
                <div>
                    <h1 className="outreach__title">Member Outreach</h1>
                    <p className="outreach__subtitle">
                        Campaign management and member communication center
                    </p>
                </div>
                <div className="outreach__actions">
                    <Button variant="secondary" icon={<Calendar size={16} />}>
                        Schedule
                    </Button>
                    <Button variant="primary" icon={<Megaphone size={16} />}>
                        New Campaign
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="outreach__stats">
                <MetricCard
                    title="Outreach Queue"
                    value="1,245"
                    icon={<Users size={20} />}
                />
                <MetricCard
                    title="Contacted Today"
                    value="342"
                    change={{ value: 15.2, type: 'increase' }}
                    icon={<Phone size={20} />}
                />
                <MetricCard
                    title="Response Rate"
                    value="58%"
                    change={{ value: 8.5, type: 'increase' }}
                    icon={<TrendingUp size={20} />}
                />
                <MetricCard
                    title="Active Campaigns"
                    value="6"
                    icon={<Target size={20} />}
                />
            </div>

            {/* Tabs */}
            <div className="outreach__tabs">
                <button
                    className={`outreach__tab ${activeTab === 'queue' ? 'active' : ''}`}
                    onClick={() => setActiveTab('queue')}
                >
                    <Phone size={16} /> Outreach Queue
                </button>
                <button
                    className={`outreach__tab ${activeTab === 'campaigns' ? 'active' : ''}`}
                    onClick={() => setActiveTab('campaigns')}
                >
                    <Megaphone size={16} /> Campaigns
                </button>
            </div>

            {/* Outreach Queue */}
            {activeTab === 'queue' && (
                <GlassCard className="outreach-queue">
                    <div className="outreach-queue__header">
                        <h3>Today's Outreach Queue</h3>
                        <div className="outreach-queue__filters">
                            <div className="outreach-queue__search">
                                <Search size={16} />
                                <input type="text" placeholder="Search members..." />
                            </div>
                            <Button variant="ghost" size="sm" icon={<Filter size={14} />}>Filter</Button>
                        </div>
                    </div>

                    <div className="outreach-queue__list">
                        {tasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                className="outreach-task"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="outreach-task__member">
                                    <div className="member-avatar">
                                        <Users size={16} />
                                    </div>
                                    <div className="member-info">
                                        <span className="member-name">{task.memberName}</span>
                                        <span className="member-id">{task.memberId}</span>
                                    </div>
                                </div>
                                <div className="outreach-task__reason">{task.reason}</div>
                                <div className="outreach-task__channel">
                                    {getChannelIcon(task.channel)}
                                    <span>{task.channel.toUpperCase()}</span>
                                </div>
                                {getPriorityBadge(task.priority)}
                                <div className="outreach-task__attempts">
                                    {task.attempts} attempts
                                </div>
                                {getStatusBadge(task.status)}
                                <div className="outreach-task__actions">
                                    <Button variant="primary" size="sm" icon={getChannelIcon(task.channel)}>
                                        Contact
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* Campaigns */}
            {activeTab === 'campaigns' && (
                <div className="campaigns-grid">
                    {campaignList.map((campaign, index) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className="campaign-card">
                                <div className="campaign-card__header">
                                    <div className="campaign-card__info">
                                        <h3>{campaign.name}</h3>
                                        <span className="campaign-type">{campaign.type.replace('_', ' ')}</span>
                                    </div>
                                    {getStatusBadge(campaign.status)}
                                </div>

                                <div className="campaign-card__stats">
                                    <div className="campaign-stat">
                                        <span className="stat-label">Target</span>
                                        <span className="stat-value">{campaign.targetMembers.toLocaleString()}</span>
                                    </div>
                                    <div className="campaign-stat">
                                        <span className="stat-label">Contacted</span>
                                        <span className="stat-value">{campaign.contacted.toLocaleString()}</span>
                                    </div>
                                    <div className="campaign-stat">
                                        <span className="stat-label">Responded</span>
                                        <span className="stat-value">{campaign.responded.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="campaign-card__progress">
                                    <div className="progress-header">
                                        <span>Response Rate</span>
                                        <span>{((campaign.responded / campaign.contacted) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-bar__fill"
                                            style={{ width: `${(campaign.responded / campaign.contacted) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="campaign-card__footer">
                                    <div className="campaign-channel">
                                        {getChannelIcon(campaign.channel)}
                                        <span>{campaign.channel.charAt(0).toUpperCase() + campaign.channel.slice(1)}</span>
                                    </div>
                                    <Button variant="secondary" size="sm">View Details</Button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MemberOutreach
