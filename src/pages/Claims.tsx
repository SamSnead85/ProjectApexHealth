import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Filter,
    Eye,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    DollarSign,
    User,
    Calendar,
    ChevronRight,
    MoreHorizontal,
    Download,
    RefreshCw
} from 'lucide-react'
import { GlassCard, Button, Badge } from '../components/common'
import './Claims.css'

interface Claim {
    id: string
    type: 'medical' | 'dental' | 'vision' | 'pharmacy'
    status: 'pending' | 'approved' | 'denied' | 'in_review'
    memberId: string
    memberName: string
    providerId: string
    providerName: string
    serviceDate: string
    submittedDate: string
    amount: number
    aiConfidence?: number
    aiRecommendation?: 'approve' | 'deny' | 'review'
}

// Mock claims data
const mockClaims: Claim[] = [
    {
        id: 'CLM-2847',
        type: 'medical',
        status: 'pending',
        memberId: 'MBR-10234',
        memberName: 'John Smith',
        providerId: 'PRV-5621',
        providerName: 'Metro Health Center',
        serviceDate: '2024-01-15',
        submittedDate: '2024-01-16',
        amount: 1250.00,
        aiConfidence: 0.92,
        aiRecommendation: 'approve',
    },
    {
        id: 'CLM-2846',
        type: 'dental',
        status: 'approved',
        memberId: 'MBR-10567',
        memberName: 'Sarah Johnson',
        providerId: 'PRV-4892',
        providerName: 'Smile Dental Group',
        serviceDate: '2024-01-14',
        submittedDate: '2024-01-15',
        amount: 450.00,
        aiConfidence: 0.98,
        aiRecommendation: 'approve',
    },
    {
        id: 'CLM-2845',
        type: 'medical',
        status: 'in_review',
        memberId: 'MBR-10098',
        memberName: 'Michael Brown',
        providerId: 'PRV-7234',
        providerName: 'City Hospital',
        serviceDate: '2024-01-12',
        submittedDate: '2024-01-13',
        amount: 8500.00,
        aiConfidence: 0.65,
        aiRecommendation: 'review',
    },
    {
        id: 'CLM-2844',
        type: 'pharmacy',
        status: 'approved',
        memberId: 'MBR-10789',
        memberName: 'Emily Davis',
        providerId: 'PRV-3456',
        providerName: 'CVS Pharmacy',
        serviceDate: '2024-01-11',
        submittedDate: '2024-01-11',
        amount: 125.00,
        aiConfidence: 0.99,
        aiRecommendation: 'approve',
    },
    {
        id: 'CLM-2843',
        type: 'vision',
        status: 'denied',
        memberId: 'MBR-10456',
        memberName: 'Robert Wilson',
        providerId: 'PRV-8901',
        providerName: 'Clear Vision Center',
        serviceDate: '2024-01-10',
        submittedDate: '2024-01-11',
        amount: 650.00,
        aiConfidence: 0.88,
        aiRecommendation: 'deny',
    },
]

export function Claims() {
    const [claims, setClaims] = useState<Claim[]>(mockClaims)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)

    const filteredClaims = claims.filter(claim => {
        if (statusFilter !== 'all' && claim.status !== statusFilter) return false
        if (typeFilter !== 'all' && claim.type !== typeFilter) return false
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
                claim.id.toLowerCase().includes(query) ||
                claim.memberName.toLowerCase().includes(query) ||
                claim.providerName.toLowerCase().includes(query)
            )
        }
        return true
    })

    const getStatusBadge = (status: Claim['status']) => {
        switch (status) {
            case 'approved':
                return <Badge variant="success" icon={<CheckCircle2 size={12} />}>Approved</Badge>
            case 'denied':
                return <Badge variant="critical" icon={<XCircle size={12} />}>Denied</Badge>
            case 'pending':
                return <Badge variant="warning" icon={<Clock size={12} />}>Pending</Badge>
            case 'in_review':
                return <Badge variant="info" icon={<Eye size={12} />}>In Review</Badge>
        }
    }

    const getTypeBadge = (type: Claim['type']) => {
        const colors: Record<string, string> = {
            medical: 'teal',
            dental: 'success',
            vision: 'info',
            pharmacy: 'warning',
        }
        return <Badge variant={colors[type] as any} size="sm">{type}</Badge>
    }

    const stats = {
        total: claims.length,
        pending: claims.filter(c => c.status === 'pending').length,
        approved: claims.filter(c => c.status === 'approved').length,
        denied: claims.filter(c => c.status === 'denied').length,
        totalAmount: claims.reduce((acc, c) => acc + c.amount, 0),
    }

    return (
        <div className="claims">
            {/* Header */}
            <div className="claims__header">
                <div>
                    <h1 className="claims__title">Claims Management</h1>
                    <p className="claims__subtitle">View, process, and manage all claims</p>
                </div>
                <div className="claims__header-actions">
                    <Button variant="ghost" icon={<RefreshCw size={16} />}>Refresh</Button>
                    <Button variant="ghost" icon={<Download size={16} />}>Export</Button>
                    <Button variant="primary" icon={<FileText size={16} />}>New Claim</Button>
                </div>
            </div>

            {/* Stats */}
            <div className="claims__stats">
                <GlassCard className="claims__stat">
                    <div className="claims__stat-icon claims__stat-icon--total">
                        <FileText size={20} />
                    </div>
                    <div className="claims__stat-info">
                        <span className="claims__stat-value">{stats.total}</span>
                        <span className="claims__stat-label">Total Claims</span>
                    </div>
                </GlassCard>
                <GlassCard className="claims__stat">
                    <div className="claims__stat-icon claims__stat-icon--pending">
                        <Clock size={20} />
                    </div>
                    <div className="claims__stat-info">
                        <span className="claims__stat-value">{stats.pending}</span>
                        <span className="claims__stat-label">Pending</span>
                    </div>
                </GlassCard>
                <GlassCard className="claims__stat">
                    <div className="claims__stat-icon claims__stat-icon--approved">
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="claims__stat-info">
                        <span className="claims__stat-value">{stats.approved}</span>
                        <span className="claims__stat-label">Approved</span>
                    </div>
                </GlassCard>
                <GlassCard className="claims__stat">
                    <div className="claims__stat-icon claims__stat-icon--amount">
                        <DollarSign size={20} />
                    </div>
                    <div className="claims__stat-info">
                        <span className="claims__stat-value">${stats.totalAmount.toLocaleString()}</span>
                        <span className="claims__stat-label">Total Value</span>
                    </div>
                </GlassCard>
            </div>

            {/* Filters */}
            <div className="claims__filters">
                <div className="claims__search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search by claim ID, member, or provider..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="claims__filter-select"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                    <option value="in_review">In Review</option>
                </select>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="claims__filter-select"
                >
                    <option value="all">All Types</option>
                    <option value="medical">Medical</option>
                    <option value="dental">Dental</option>
                    <option value="vision">Vision</option>
                    <option value="pharmacy">Pharmacy</option>
                </select>
            </div>

            {/* Claims Table */}
            <GlassCard className="claims__table-container">
                <table className="claims__table">
                    <thead>
                        <tr>
                            <th>Claim ID</th>
                            <th>Type</th>
                            <th>Member</th>
                            <th>Provider</th>
                            <th>Amount</th>
                            <th>AI Score</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filteredClaims.map((claim, index) => (
                                <motion.tr
                                    key={claim.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => setSelectedClaim(claim)}
                                    className="claims__row"
                                >
                                    <td>
                                        <span className="claims__id">{claim.id}</span>
                                        <span className="claims__date">{claim.submittedDate}</span>
                                    </td>
                                    <td>{getTypeBadge(claim.type)}</td>
                                    <td>
                                        <div className="claims__person">
                                            <User size={14} />
                                            <div>
                                                <span className="claims__person-name">{claim.memberName}</span>
                                                <span className="claims__person-id">{claim.memberId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="claims__provider">{claim.providerName}</span>
                                    </td>
                                    <td>
                                        <span className="claims__amount">${claim.amount.toLocaleString()}</span>
                                    </td>
                                    <td>
                                        {claim.aiConfidence && (
                                            <div className="claims__ai-score">
                                                <div
                                                    className={`claims__ai-bar ${claim.aiConfidence > 0.8 ? 'claims__ai-bar--high' :
                                                            claim.aiConfidence > 0.6 ? 'claims__ai-bar--medium' : 'claims__ai-bar--low'
                                                        }`}
                                                    style={{ width: `${claim.aiConfidence * 100}%` }}
                                                />
                                                <span>{Math.round(claim.aiConfidence * 100)}%</span>
                                            </div>
                                        )}
                                    </td>
                                    <td>{getStatusBadge(claim.status)}</td>
                                    <td>
                                        <button className="claims__action-btn">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </GlassCard>

            {/* Detail Panel */}
            <AnimatePresence>
                {selectedClaim && (
                    <motion.div
                        className="claims__detail-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedClaim(null)}
                    >
                        <motion.div
                            className="claims__detail-panel"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="claims__detail-header">
                                <div>
                                    <h2>{selectedClaim.id}</h2>
                                    {getStatusBadge(selectedClaim.status)}
                                </div>
                                <button onClick={() => setSelectedClaim(null)}>×</button>
                            </div>

                            <div className="claims__detail-content">
                                <div className="claims__detail-section">
                                    <h4>Claim Information</h4>
                                    <div className="claims__detail-grid">
                                        <div className="claims__detail-field">
                                            <span className="claims__detail-label">Type</span>
                                            <span className="claims__detail-value">{selectedClaim.type}</span>
                                        </div>
                                        <div className="claims__detail-field">
                                            <span className="claims__detail-label">Amount</span>
                                            <span className="claims__detail-value">${selectedClaim.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="claims__detail-field">
                                            <span className="claims__detail-label">Service Date</span>
                                            <span className="claims__detail-value">{selectedClaim.serviceDate}</span>
                                        </div>
                                        <div className="claims__detail-field">
                                            <span className="claims__detail-label">Submitted</span>
                                            <span className="claims__detail-value">{selectedClaim.submittedDate}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="claims__detail-section">
                                    <h4>Member</h4>
                                    <div className="claims__detail-person-card">
                                        <User size={24} />
                                        <div>
                                            <span className="claims__detail-person-name">{selectedClaim.memberName}</span>
                                            <span className="claims__detail-person-id">{selectedClaim.memberId}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="claims__detail-section">
                                    <h4>AI Analysis</h4>
                                    <div className="claims__detail-ai">
                                        <div className="claims__detail-ai-header">
                                            <span>Recommendation</span>
                                            <Badge variant={
                                                selectedClaim.aiRecommendation === 'approve' ? 'success' :
                                                    selectedClaim.aiRecommendation === 'deny' ? 'critical' : 'warning'
                                            }>
                                                {selectedClaim.aiRecommendation?.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="claims__detail-ai-confidence">
                                            <div
                                                className="claims__detail-ai-bar"
                                                style={{ width: `${(selectedClaim.aiConfidence || 0) * 100}%` }}
                                            />
                                        </div>
                                        <span className="claims__detail-ai-score">
                                            {Math.round((selectedClaim.aiConfidence || 0) * 100)}% confidence
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="claims__detail-actions">
                                <Button variant="primary" icon={<CheckCircle2 size={16} />}>Approve</Button>
                                <Button variant="secondary" icon={<XCircle size={16} />}>Deny</Button>
                                <Button variant="ghost" icon={<Eye size={16} />}>Request Review</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Claims
