import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FileWarning,
    Clock,
    CheckCircle2,
    XCircle,
    Send,
    Upload,
    MessageSquare,
    Calendar,
    User,
    Filter,
    Search,
    ChevronRight,
    AlertTriangle,
    FileText,
    Scale
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './Appeals.css'

interface Appeal {
    id: string
    claimId: string
    type: 'internal' | 'external' | 'expedited'
    reason: string
    status: 'pending' | 'under_review' | 'approved' | 'denied' | 'escalated'
    submittedDate: string
    dueDate: string
    level: 1 | 2 | 3
    assignee?: string
    documents: number
    lastUpdate: string
}

const mockAppeals: Appeal[] = [
    {
        id: 'APL-2024-001',
        claimId: 'CLM-2024-45678',
        type: 'internal',
        reason: 'Prior Authorization denial - Medical necessity',
        status: 'under_review',
        submittedDate: '2024-01-20',
        dueDate: '2024-02-20',
        level: 1,
        assignee: 'Dr. Sarah Chen',
        documents: 5,
        lastUpdate: '2024-01-25'
    },
    {
        id: 'APL-2024-002',
        claimId: 'CLM-2024-45123',
        type: 'expedited',
        reason: 'Urgent care coverage denial',
        status: 'pending',
        submittedDate: '2024-01-26',
        dueDate: '2024-01-29',
        level: 1,
        documents: 3,
        lastUpdate: '2024-01-26'
    },
    {
        id: 'APL-2023-089',
        claimId: 'CLM-2023-89012',
        type: 'external',
        reason: 'Experimental treatment coverage',
        status: 'escalated',
        submittedDate: '2023-12-15',
        dueDate: '2024-02-15',
        level: 2,
        assignee: 'External Review Board',
        documents: 12,
        lastUpdate: '2024-01-22'
    },
    {
        id: 'APL-2023-076',
        claimId: 'CLM-2023-76543',
        type: 'internal',
        reason: 'Out-of-network billing dispute',
        status: 'approved',
        submittedDate: '2023-11-10',
        dueDate: '2023-12-10',
        level: 1,
        documents: 4,
        lastUpdate: '2023-12-05'
    }
]

export function Appeals() {
    const [appeals] = useState<Appeal[]>(mockAppeals)
    const [activeFilter, setActiveFilter] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const getDaysRemaining = (dueDate: string) => {
        const today = new Date()
        const due = new Date(dueDate)
        const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return diff
    }

    const getStatusBadge = (status: Appeal['status']) => {
        switch (status) {
            case 'pending': return <Badge variant="warning" icon={<Clock size={10} />}>Pending</Badge>
            case 'under_review': return <Badge variant="info" icon={<FileText size={10} />}>Under Review</Badge>
            case 'approved': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Approved</Badge>
            case 'denied': return <Badge variant="critical" icon={<XCircle size={10} />}>Denied</Badge>
            case 'escalated': return <Badge variant="purple" icon={<Scale size={10} />}>Escalated</Badge>
        }
    }

    const getTypeBadge = (type: Appeal['type']) => {
        switch (type) {
            case 'internal': return <Badge variant="info" size="sm">Internal</Badge>
            case 'external': return <Badge variant="warning" size="sm">External IRO</Badge>
            case 'expedited': return <Badge variant="critical" size="sm">Expedited</Badge>
        }
    }

    const stats = {
        total: appeals.length,
        pending: appeals.filter(a => a.status === 'pending' || a.status === 'under_review').length,
        resolved: appeals.filter(a => a.status === 'approved' || a.status === 'denied').length,
        escalated: appeals.filter(a => a.status === 'escalated').length
    }

    return (
        <div className="appeals-page">
            {/* Header */}
            <div className="appeals__header">
                <div>
                    <h1 className="appeals__title">Appeals & Grievances</h1>
                    <p className="appeals__subtitle">
                        Manage member appeals and regulatory compliance tracking
                    </p>
                </div>
                <div className="appeals__actions">
                    <Button variant="secondary" icon={<Filter size={16} />}>
                        Export Report
                    </Button>
                    <Button variant="primary" icon={<FileWarning size={16} />}>
                        New Appeal
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="appeals__stats">
                <GlassCard className="appeals-stat">
                    <div className="appeals-stat__icon">
                        <FileWarning size={24} />
                    </div>
                    <div className="appeals-stat__info">
                        <span className="appeals-stat__value">{stats.total}</span>
                        <span className="appeals-stat__label">Total Appeals</span>
                    </div>
                </GlassCard>
                <GlassCard className="appeals-stat appeals-stat--warning">
                    <div className="appeals-stat__icon">
                        <Clock size={24} />
                    </div>
                    <div className="appeals-stat__info">
                        <span className="appeals-stat__value">{stats.pending}</span>
                        <span className="appeals-stat__label">Pending Review</span>
                    </div>
                </GlassCard>
                <GlassCard className="appeals-stat appeals-stat--success">
                    <div className="appeals-stat__icon">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="appeals-stat__info">
                        <span className="appeals-stat__value">{stats.resolved}</span>
                        <span className="appeals-stat__label">Resolved</span>
                    </div>
                </GlassCard>
                <GlassCard className="appeals-stat appeals-stat--purple">
                    <div className="appeals-stat__icon">
                        <Scale size={24} />
                    </div>
                    <div className="appeals-stat__info">
                        <span className="appeals-stat__value">{stats.escalated}</span>
                        <span className="appeals-stat__label">Escalated to IRO</span>
                    </div>
                </GlassCard>
            </div>

            {/* Filters */}
            <div className="appeals__filters">
                <div className="appeals__search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search appeals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="appeals__filter-tabs">
                    {['all', 'pending', 'under_review', 'escalated', 'resolved'].map((filter) => (
                        <button
                            key={filter}
                            className={`appeals__filter-tab ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter.replace('_', ' ').charAt(0).toUpperCase() + filter.replace('_', ' ').slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Appeals List */}
            <div className="appeals__list">
                {appeals.map((appeal, index) => {
                    const daysRemaining = getDaysRemaining(appeal.dueDate)
                    return (
                        <motion.div
                            key={appeal.id}
                            className={`appeal-card ${daysRemaining <= 3 && appeal.status !== 'approved' && appeal.status !== 'denied' ? 'urgent' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="appeal-card__header">
                                <div className="appeal-card__id">
                                    <span className="appeal-card__number">{appeal.id}</span>
                                    {getTypeBadge(appeal.type)}
                                    <span className="appeal-card__level">Level {appeal.level}</span>
                                </div>
                                {getStatusBadge(appeal.status)}
                            </div>

                            <div className="appeal-card__body">
                                <div className="appeal-card__reason">{appeal.reason}</div>
                                <div className="appeal-card__claim">
                                    Claim: <span>{appeal.claimId}</span>
                                </div>
                            </div>

                            <div className="appeal-card__meta">
                                <div className="appeal-card__dates">
                                    <span><Calendar size={12} /> Submitted: {formatDate(appeal.submittedDate)}</span>
                                    <span className={daysRemaining <= 3 && appeal.status !== 'approved' && appeal.status !== 'denied' ? 'urgent' : ''}>
                                        <Clock size={12} /> Due: {formatDate(appeal.dueDate)}
                                        {daysRemaining > 0 && appeal.status !== 'approved' && appeal.status !== 'denied' && (
                                            <span className="appeal-card__days">({daysRemaining} days)</span>
                                        )}
                                    </span>
                                </div>
                                {appeal.assignee && (
                                    <div className="appeal-card__assignee">
                                        <User size={12} /> {appeal.assignee}
                                    </div>
                                )}
                            </div>

                            <div className="appeal-card__footer">
                                <div className="appeal-card__docs">
                                    <FileText size={14} /> {appeal.documents} documents
                                </div>
                                <div className="appeal-card__actions">
                                    <Button variant="ghost" size="sm" icon={<MessageSquare size={14} />}>
                                        Comment
                                    </Button>
                                    <Button variant="secondary" size="sm" icon={<Upload size={14} />}>
                                        Add Docs
                                    </Button>
                                    <Button variant="primary" size="sm" icon={<ChevronRight size={14} />}>
                                        Review
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Compliance Notice */}
            <GlassCard className="compliance-notice">
                <AlertTriangle size={20} />
                <div className="compliance-notice__content">
                    <h4>Regulatory Compliance</h4>
                    <p>All appeals must be processed within CMS-mandated timeframes: Standard 30 days, Expedited 72 hours, External IRO 45 days.</p>
                </div>
            </GlassCard>
        </div>
    )
}

export default Appeals
