import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileCheck,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Send,
    Plus,
    ChevronRight,
    Search,
    Calendar,
    User,
    Building2,
    FileText,
    Timer,
    Zap,
    MessageSquare,
    Activity,
    Brain,
    BarChart3,
    Shield,
    TrendingUp,
    Target,
    Gauge,
    Eye
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard, PageSkeleton } from '../components/common'
import './PriorAuthorization.css'

// CMS-mandated PA decision timeframes
const CMS_URGENT_HOURS = 72 // CMS requires 72-hour decision for urgent requests
const CMS_STANDARD_DAYS = 7 // Standard request timeline

type PAStatus = 'draft' | 'submitted' | 'pending_info' | 'under_review' | 'approved' | 'denied' | 'expired'
type UrgencyLevel = 'standard' | 'urgent' | 'emergent'

interface PriorAuth {
    id: string
    memberId: string
    memberName: string
    providerId: string
    providerName: string
    procedureCode: string
    procedureDescription: string
    diagnosisCodes: string[]
    urgency: UrgencyLevel
    status: PAStatus
    submittedDate: string
    deadlineDate: string
    clinicalNotes: string
    documentsRequired: string[]
    documentsReceived: string[]
    hoursRemaining?: number
    reviewerNotes?: string
}

// Mock PA requests
const mockPARequests: PriorAuth[] = [
    {
        id: 'PA-2024-001287',
        memberId: 'APX-2024-78432',
        memberName: 'Sarah Johnson',
        providerId: 'NPI-1234567890',
        providerName: 'Premier Medical Associates',
        procedureCode: '72148',
        procedureDescription: 'MRI lumbar spine without contrast',
        diagnosisCodes: ['M54.5', 'M51.16'],
        urgency: 'standard',
        status: 'under_review',
        submittedDate: '2024-01-24T10:30:00Z',
        deadlineDate: '2024-01-31T10:30:00Z',
        clinicalNotes: 'Patient presents with persistent lower back pain unresponsive to conservative treatment for 6 weeks.',
        documentsRequired: ['Clinical notes', 'X-ray results', 'Physical therapy records'],
        documentsReceived: ['Clinical notes', 'X-ray results']
    },
    {
        id: 'PA-2024-001288',
        memberId: 'APX-2024-45123',
        memberName: 'Michael Chen',
        providerId: 'NPI-9876543210',
        providerName: 'City General Hospital',
        procedureCode: '27447',
        procedureDescription: 'Total knee arthroplasty',
        diagnosisCodes: ['M17.11'],
        urgency: 'standard',
        status: 'pending_info',
        submittedDate: '2024-01-22T14:15:00Z',
        deadlineDate: '2024-01-29T14:15:00Z',
        clinicalNotes: 'Severe osteoarthritis of right knee. Failed conservative treatment including PT, NSAIDs, and cortisone injections.',
        documentsRequired: ['Recent X-ray (within 60 days)', 'PT records (12 visits required)', 'BMI calculation', 'Preoperative clearance'],
        documentsReceived: ['Recent X-ray (within 60 days)', 'PT records (12 visits required)']
    },
    {
        id: 'PA-2024-001289',
        memberId: 'APX-2024-33456',
        memberName: 'Emily Rodriguez',
        providerId: 'NPI-5555555555',
        providerName: 'Urgent Care Plus',
        procedureCode: '70553',
        procedureDescription: 'MRI brain with and without contrast',
        diagnosisCodes: ['G43.909', 'R51'],
        urgency: 'urgent',
        status: 'submitted',
        submittedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        deadlineDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        hoursRemaining: 48,
        clinicalNotes: 'New onset severe headaches with neurological symptoms. Rule out intracranial pathology.',
        documentsRequired: ['Clinical notes', 'Neurological exam findings'],
        documentsReceived: ['Clinical notes', 'Neurological exam findings']
    },
    {
        id: 'PA-2024-001286',
        memberId: 'APX-2024-89012',
        memberName: 'David Kim',
        providerId: 'NPI-3333333333',
        providerName: 'Specialty Rx Pharmacy',
        procedureCode: 'J1745',
        procedureDescription: 'Infliximab injection',
        diagnosisCodes: ['K50.90'],
        urgency: 'standard',
        status: 'approved',
        submittedDate: '2024-01-18T09:00:00Z',
        deadlineDate: '2024-01-25T09:00:00Z',
        clinicalNotes: 'Crohns disease - step therapy completed. Prior biologics failed.',
        documentsRequired: ['Step therapy documentation', 'Prior biologic failure notes'],
        documentsReceived: ['Step therapy documentation', 'Prior biologic failure notes'],
        reviewerNotes: 'Approved for 12 infusions. Authorization valid through 12/31/2024.'
    }
]

// Metrics
const paMetrics = {
    pendingRequests: 156,
    urgentWithin72: 12,
    avgTurnaround: 2.8,
    approvalRate: 78.4,
    autoApproved: 34.2
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function PriorAuthorization() {
    const [loading, setLoading] = useState(true)
    useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t) }, [])
    const [requests, setRequests] = useState<PriorAuth[]>(mockPARequests)
    const [selectedRequest, setSelectedRequest] = useState<PriorAuth | null>(null)
    const [statusFilter, setStatusFilter] = useState<PAStatus | 'all'>('all')

    // Fetch prior auths from API with mock fallback
    useEffect(() => {
        if (!API_BASE) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/v1/prior-auth?limit=50`);
                if (!res.ok) return;
                const data = await res.json();
                if (data.data?.length) setRequests(data.data);
            } catch { /* use mock data */ }
        })();
    }, []);

    const filteredRequests = requests.filter(req =>
        statusFilter === 'all' || req.status === statusFilter
    )

    const getStatusBadge = (status: PAStatus) => {
        const configs: Record<PAStatus, { variant: 'success' | 'warning' | 'critical' | 'info' | 'teal'; label: string }> = {
            draft: { variant: 'info', label: 'Draft' },
            submitted: { variant: 'teal', label: 'Submitted' },
            pending_info: { variant: 'warning', label: 'Pending Info' },
            under_review: { variant: 'info', label: 'Under Review' },
            approved: { variant: 'success', label: 'Approved' },
            denied: { variant: 'critical', label: 'Denied' },
            expired: { variant: 'warning', label: 'Expired' }
        }
        const config = configs[status]
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    const getUrgencyBadge = (urgency: UrgencyLevel) => {
        if (urgency === 'urgent') {
            return <Badge variant="warning" size="sm" icon={<Timer size={10} />}>Urgent</Badge>
        } else if (urgency === 'emergent') {
            return <Badge variant="critical" size="sm" icon={<Zap size={10} />}>Emergent</Badge>
        }
        return null
    }

    const calculateTimeRemaining = (deadline: string) => {
        const now = new Date()
        const deadlineDate = new Date(deadline)
        const diff = deadlineDate.getTime() - now.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)

        if (diff < 0) return { text: 'Overdue', critical: true }
        if (hours < 24) return { text: `${hours}h remaining`, critical: hours < 12 }
        return { text: `${days}d ${hours % 24}h remaining`, critical: false }
    }

    if (loading) return <PageSkeleton />

    return (
        <div className="prior-auth">
            {/* Header */}
            <div className="prior-auth__header">
                <div>
                    <h1 className="prior-auth__title">Prior Authorization</h1>
                    <p className="prior-auth__subtitle">
                        CMS-compliant authorization workflow with 72-hour urgent SLA
                    </p>
                </div>
                <div className="prior-auth__header-actions">
                    <Badge variant="warning" icon={<Timer size={12} />}>
                        {paMetrics.urgentWithin72} Urgent Reviews
                    </Badge>
                    <Button variant="primary" icon={<Plus size={16} />}>
                        New Request
                    </Button>
                </div>
            </div>

            {/* Metrics */}
            <div className="prior-auth__metrics">
                <MetricCard
                    title="Pending Requests"
                    value={paMetrics.pendingRequests.toString()}
                    icon={<FileCheck size={20} />}
                    trend={{ value: 8, direction: 'up' }}
                    subtitle="Active authorizations"
                />
                <MetricCard
                    title="Urgent (72hr SLA)"
                    value={paMetrics.urgentWithin72.toString()}
                    icon={<Timer size={20} />}
                    subtitle="CMS-mandated timeline"
                    variant="warning"
                />
                <MetricCard
                    title="Avg Turnaround"
                    value={`${paMetrics.avgTurnaround} days`}
                    icon={<Clock size={20} />}
                    trend={{ value: 0.3, direction: 'down' }}
                    subtitle="Decision time"
                    variant="success"
                />
                <MetricCard
                    title="Approval Rate"
                    value={`${paMetrics.approvalRate}%`}
                    icon={<CheckCircle2 size={20} />}
                    trend={{ value: 2.1, direction: 'up' }}
                    subtitle="YTD approvals"
                    variant="teal"
                />
            </div>

            {/* ========== PHASE 5 COMPLIANCE & ANALYTICS CARDS ========== */}
            <div className="prior-auth__phase5-row">
                {/* Turnaround Time Compliance */}
                <motion.div
                    className="pa-phase5-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="pa-phase5-card-header">
                        <div className="pa-phase5-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                            <Timer size={18} />
                        </div>
                        <h3>Turnaround Compliance</h3>
                    </div>
                    <div className="pa-turnaround-items">
                        <div className="pa-turnaround-item">
                            <div className="pa-turnaround-label-row">
                                <span className="pa-turnaround-label">72hr Expedited</span>
                                <Badge variant="success" size="sm">98.2%</Badge>
                            </div>
                            <div className="pa-turnaround-bar-track">
                                <motion.div
                                    className="pa-turnaround-bar-fill"
                                    style={{ background: 'linear-gradient(90deg, #22c55e, #14b8a6)' }}
                                    initial={{ width: 0 }}
                                    animate={{ width: '98.2%' }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                />
                            </div>
                            <span className="pa-turnaround-sub">CMS Compliant</span>
                        </div>
                        <div className="pa-turnaround-item">
                            <div className="pa-turnaround-label-row">
                                <span className="pa-turnaround-label">7-Day Standard</span>
                                <Badge variant="success" size="sm">99.1%</Badge>
                            </div>
                            <div className="pa-turnaround-bar-track">
                                <motion.div
                                    className="pa-turnaround-bar-fill"
                                    style={{ background: 'linear-gradient(90deg, #14b8a6, #06b6d4)' }}
                                    initial={{ width: 0 }}
                                    animate={{ width: '99.1%' }}
                                    transition={{ duration: 1, delay: 0.4 }}
                                />
                            </div>
                            <span className="pa-turnaround-sub">CMS Compliant</span>
                        </div>
                    </div>
                </motion.div>

                {/* Auto-Decision Rate */}
                <motion.div
                    className="pa-phase5-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <div className="pa-phase5-card-header">
                        <div className="pa-phase5-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
                            <Zap size={18} />
                        </div>
                        <h3>Auto-Decision Rate</h3>
                    </div>
                    <div className="pa-auto-decision">
                        <div className="pa-auto-decision-ring">
                            <svg viewBox="0 0 100 100" className="pa-ring-svg">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="8" />
                                <motion.circle
                                    cx="50" cy="50" r="42"
                                    fill="none"
                                    stroke="url(#autoGrad)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 42}
                                    strokeDashoffset={2 * Math.PI * 42}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - 0.68) }}
                                    transition={{ duration: 1.2, delay: 0.3 }}
                                    transform="rotate(-90 50 50)"
                                />
                                <defs>
                                    <linearGradient id="autoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="pa-ring-center">
                                <span className="pa-ring-value">68%</span>
                                <span className="pa-ring-label">Auto</span>
                            </div>
                        </div>
                        <div className="pa-auto-legend">
                            <div className="pa-auto-legend-item">
                                <span className="pa-auto-dot" style={{ background: '#8b5cf6' }} />
                                <span>Auto-Decided</span>
                                <strong>68%</strong>
                            </div>
                            <div className="pa-auto-legend-item">
                                <span className="pa-auto-dot" style={{ background: 'rgba(0,0,0,0.1)' }} />
                                <span>Manual Review</span>
                                <strong>32%</strong>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Public Reporting Metrics (CMS 2026) */}
                <motion.div
                    className="pa-phase5-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="pa-phase5-card-header">
                        <div className="pa-phase5-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                            <BarChart3 size={18} />
                        </div>
                        <h3>Public Reporting <Badge variant="info" size="sm">CMS 2026</Badge></h3>
                    </div>
                    <div className="pa-public-metrics">
                        <div className="pa-public-metric">
                            <div className="pa-public-metric-icon" style={{ color: '#22c55e' }}>
                                <CheckCircle2 size={16} />
                            </div>
                            <div className="pa-public-metric-info">
                                <span className="pa-public-metric-value">78%</span>
                                <span className="pa-public-metric-label">Approval Rate</span>
                            </div>
                        </div>
                        <div className="pa-public-metric">
                            <div className="pa-public-metric-icon" style={{ color: '#ef4444' }}>
                                <XCircle size={16} />
                            </div>
                            <div className="pa-public-metric-info">
                                <span className="pa-public-metric-value">22%</span>
                                <span className="pa-public-metric-label">Denial Rate</span>
                            </div>
                        </div>
                        <div className="pa-public-metric">
                            <div className="pa-public-metric-icon" style={{ color: '#f59e0b' }}>
                                <Clock size={16} />
                            </div>
                            <div className="pa-public-metric-info">
                                <span className="pa-public-metric-value">18 hrs</span>
                                <span className="pa-public-metric-label">Avg Processing</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* AI Clinical Review */}
                <motion.div
                    className="pa-phase5-card pa-ai-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <div className="pa-phase5-card-header">
                        <div className="pa-phase5-icon" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.15))', color: '#a78bfa' }}>
                            <Brain size={18} />
                        </div>
                        <h3>AI Clinical Review</h3>
                    </div>
                    <div className="pa-ai-content">
                        <div className="pa-ai-confidence">
                            <span className="pa-ai-confidence-label">Medical Necessity Match</span>
                            <div className="pa-ai-confidence-row">
                                <span className="pa-ai-confidence-value">89%</span>
                                <span className="pa-ai-confidence-tag">confidence</span>
                            </div>
                            <div className="pa-ai-bar-track">
                                <motion.div
                                    className="pa-ai-bar-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: '89%' }}
                                    transition={{ duration: 1, delay: 0.4 }}
                                />
                            </div>
                        </div>
                        <div className="pa-ai-criteria">
                            <span className="pa-ai-criteria-title">Clinical Criteria Highlights</span>
                            <div className="pa-ai-criteria-list">
                                <div className="pa-ai-criteria-item matched">
                                    <CheckCircle2 size={12} />
                                    <span>Diagnosis matches coverage policy</span>
                                </div>
                                <div className="pa-ai-criteria-item matched">
                                    <CheckCircle2 size={12} />
                                    <span>Step therapy requirements met</span>
                                </div>
                                <div className="pa-ai-criteria-item matched">
                                    <CheckCircle2 size={12} />
                                    <span>Clinical documentation sufficient</span>
                                </div>
                                <div className="pa-ai-criteria-item pending">
                                    <AlertTriangle size={12} />
                                    <span>Peer-reviewed evidence pending</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Grid */}
            <div className="prior-auth__grid">
                {/* Request List */}
                <section className="prior-auth__list-section">
                    <div className="prior-auth__filters">
                        <div className="prior-auth__search-wrapper">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search by PA ID, member, or procedure..."
                            />
                        </div>
                        <div className="prior-auth__status-filters">
                            {(['all', 'submitted', 'under_review', 'pending_info', 'approved'] as const).map((status) => (
                                <button
                                    key={status}
                                    className={`prior-auth__filter-btn ${statusFilter === status ? 'active' : ''}`}
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {status === 'all' ? 'All' : status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Request Cards */}
                    <div className="prior-auth__request-list">
                        {filteredRequests.map((request, index) => {
                            const timeRemaining = calculateTimeRemaining(request.deadlineDate)
                            return (
                                <motion.div
                                    key={request.id}
                                    className={`prior-auth__request-card netflix-card ${selectedRequest?.id === request.id ? 'selected' : ''}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedRequest(request)}
                                >
                                    <div className="prior-auth__request-header">
                                        <div className="prior-auth__request-id">
                                            <span>{request.id}</span>
                                            {getUrgencyBadge(request.urgency)}
                                        </div>
                                        {getStatusBadge(request.status)}
                                    </div>

                                    <div className="prior-auth__request-procedure">
                                        <span className="prior-auth__procedure-code">{request.procedureCode}</span>
                                        <span className="prior-auth__procedure-desc">{request.procedureDescription}</span>
                                    </div>

                                    <div className="prior-auth__request-meta">
                                        <span><User size={12} /> {request.memberName}</span>
                                        <span><Building2 size={12} /> {request.providerName}</span>
                                    </div>

                                    <div className={`prior-auth__deadline ${timeRemaining.critical ? 'critical' : ''}`}>
                                        <Clock size={12} />
                                        <span>{timeRemaining.text}</span>
                                    </div>

                                    <ChevronRight size={16} className="prior-auth__chevron" />
                                </motion.div>
                            )
                        })}
                    </div>
                </section>

                {/* Request Detail */}
                <AnimatePresence mode="wait">
                    {selectedRequest ? (
                        <motion.section
                            key={selectedRequest.id}
                            className="prior-auth__detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <GlassCard className="prior-auth__detail-card">
                                <div className="prior-auth__detail-header">
                                    <div>
                                        <h2>{selectedRequest.id}</h2>
                                        <span className="prior-auth__submitted-date">
                                            Submitted: {new Date(selectedRequest.submittedDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="prior-auth__detail-badges">
                                        {getUrgencyBadge(selectedRequest.urgency)}
                                        {getStatusBadge(selectedRequest.status)}
                                    </div>
                                </div>

                                {/* SLA Timer for Urgent */}
                                {selectedRequest.urgency === 'urgent' && selectedRequest.status !== 'approved' && selectedRequest.status !== 'denied' && (
                                    <div className="prior-auth__sla-timer">
                                        <Timer size={20} />
                                        <div className="prior-auth__sla-info">
                                            <span className="prior-auth__sla-label">CMS 72-Hour SLA</span>
                                            <span className="prior-auth__sla-time">
                                                {calculateTimeRemaining(selectedRequest.deadlineDate).text}
                                            </span>
                                        </div>
                                        <div className="prior-auth__sla-progress">
                                            <motion.div
                                                className="prior-auth__sla-bar"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(0, (selectedRequest.hoursRemaining || 0) / 72 * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Procedure Info */}
                                <div className="prior-auth__section">
                                    <h3>Procedure</h3>
                                    <div className="prior-auth__procedure-detail">
                                        <div className="prior-auth__procedure-code-large">{selectedRequest.procedureCode}</div>
                                        <div>
                                            <span className="prior-auth__procedure-name">{selectedRequest.procedureDescription}</span>
                                            <span className="prior-auth__diagnosis">
                                                ICD-10: {selectedRequest.diagnosisCodes.join(', ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Member & Provider */}
                                <div className="prior-auth__detail-grid">
                                    <div className="prior-auth__detail-item">
                                        <User size={16} />
                                        <div>
                                            <span className="prior-auth__detail-label">Member</span>
                                            <span className="prior-auth__detail-value">{selectedRequest.memberName}</span>
                                            <span className="prior-auth__detail-sub">{selectedRequest.memberId}</span>
                                        </div>
                                    </div>
                                    <div className="prior-auth__detail-item">
                                        <Building2 size={16} />
                                        <div>
                                            <span className="prior-auth__detail-label">Provider</span>
                                            <span className="prior-auth__detail-value">{selectedRequest.providerName}</span>
                                            <span className="prior-auth__detail-sub">{selectedRequest.providerId}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Clinical Notes */}
                                <div className="prior-auth__section">
                                    <h3>Clinical Notes</h3>
                                    <p className="prior-auth__clinical-notes">{selectedRequest.clinicalNotes}</p>
                                </div>

                                {/* Documents */}
                                <div className="prior-auth__section">
                                    <h3>Required Documentation</h3>
                                    <div className="prior-auth__documents">
                                        {selectedRequest.documentsRequired.map((doc, i) => {
                                            const received = selectedRequest.documentsReceived.includes(doc)
                                            return (
                                                <div key={i} className={`prior-auth__doc ${received ? 'received' : 'missing'}`}>
                                                    {received ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                                                    <span>{doc}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Reviewer Notes */}
                                {selectedRequest.reviewerNotes && (
                                    <div className="prior-auth__section">
                                        <h3>Reviewer Notes</h3>
                                        <div className="prior-auth__reviewer-notes">
                                            <MessageSquare size={14} />
                                            <p>{selectedRequest.reviewerNotes}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                {selectedRequest.status !== 'approved' && selectedRequest.status !== 'denied' && (
                                    <div className="prior-auth__actions">
                                        <Button variant="primary" icon={<CheckCircle2 size={16} />}>
                                            Approve
                                        </Button>
                                        <Button variant="secondary" icon={<XCircle size={16} />}>
                                            Deny
                                        </Button>
                                        <Button variant="ghost" icon={<Send size={16} />}>
                                            Request Info
                                        </Button>
                                    </div>
                                )}
                            </GlassCard>
                        </motion.section>
                    ) : (
                        <motion.div
                            className="prior-auth__no-selection"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <FileCheck size={48} />
                            <p>Select a request to view details</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default PriorAuthorization
