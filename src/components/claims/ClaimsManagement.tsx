import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText,
    DollarSign,
    Calendar,
    User,
    Building2,
    ChevronRight,
    ChevronDown,
    Download,
    Filter,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MoreHorizontal
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './ClaimsManagement.css'

// Claim types
interface Claim {
    id: string
    claimNumber: string
    serviceDate: Date
    provider: string
    providerType: string
    facility?: string
    serviceType: string
    billedAmount: number
    planPaid: number
    memberOwes: number
    status: 'submitted' | 'processing' | 'approved' | 'denied' | 'appeal'
    submittedDate: Date
    processedDate?: Date
    eobAvailable: boolean
}

const mockClaims: Claim[] = [
    {
        id: 'clm-1',
        claimNumber: 'CLM-2024-0156',
        serviceDate: new Date('2024-01-15'),
        provider: 'Dr. Sarah Chen',
        providerType: 'Primary Care Physician',
        facility: 'Apex Medical Group',
        serviceType: 'Office Visit - Preventive',
        billedAmount: 250,
        planPaid: 200,
        memberOwes: 50,
        status: 'approved',
        submittedDate: new Date('2024-01-16'),
        processedDate: new Date('2024-01-22'),
        eobAvailable: true
    },
    {
        id: 'clm-2',
        claimNumber: 'CLM-2024-0147',
        serviceDate: new Date('2024-01-10'),
        provider: 'Dr. Michael Rivera',
        providerType: 'Cardiologist',
        facility: 'Heart & Vascular Institute',
        serviceType: 'Specialist Consultation',
        billedAmount: 450,
        planPaid: 360,
        memberOwes: 90,
        status: 'approved',
        submittedDate: new Date('2024-01-11'),
        processedDate: new Date('2024-01-18'),
        eobAvailable: true
    },
    {
        id: 'clm-3',
        claimNumber: 'CLM-2024-0139',
        serviceDate: new Date('2024-01-05'),
        provider: 'Quest Diagnostics',
        providerType: 'Laboratory',
        serviceType: 'Lab Work - Comprehensive Panel',
        billedAmount: 320,
        planPaid: 256,
        memberOwes: 64,
        status: 'processing',
        submittedDate: new Date('2024-01-06'),
        eobAvailable: false
    },
    {
        id: 'clm-4',
        claimNumber: 'CLM-2024-0128',
        serviceDate: new Date('2023-12-28'),
        provider: 'CVS Pharmacy',
        providerType: 'Pharmacy',
        serviceType: 'Prescription - Lisinopril 10mg',
        billedAmount: 45,
        planPaid: 33,
        memberOwes: 12,
        status: 'approved',
        submittedDate: new Date('2023-12-28'),
        processedDate: new Date('2023-12-29'),
        eobAvailable: true
    }
]

// Claims Summary Stats
interface ClaimsSummaryProps {
    claims?: Claim[]
}

export function ClaimsSummary({ claims = mockClaims }: ClaimsSummaryProps) {
    const totalBilled = claims.reduce((sum, c) => sum + c.billedAmount, 0)
    const totalPaid = claims.reduce((sum, c) => sum + c.planPaid, 0)
    const totalOwed = claims.reduce((sum, c) => sum + c.memberOwes, 0)
    const pendingCount = claims.filter(c => c.status === 'processing' || c.status === 'submitted').length

    return (
        <div className="claims-summary">
            <GlassCard className="claims-stat">
                <div className="claims-stat__icon claims-stat__icon--total">
                    <FileText size={20} />
                </div>
                <div className="claims-stat__content">
                    <span className="claims-stat__value">{claims.length}</span>
                    <span className="claims-stat__label">Total Claims</span>
                </div>
            </GlassCard>
            <GlassCard className="claims-stat">
                <div className="claims-stat__icon claims-stat__icon--paid">
                    <DollarSign size={20} />
                </div>
                <div className="claims-stat__content">
                    <span className="claims-stat__value">${totalPaid.toLocaleString()}</span>
                    <span className="claims-stat__label">Plan Paid</span>
                </div>
            </GlassCard>
            <GlassCard className="claims-stat">
                <div className="claims-stat__icon claims-stat__icon--owed">
                    <DollarSign size={20} />
                </div>
                <div className="claims-stat__content">
                    <span className="claims-stat__value">${totalOwed.toLocaleString()}</span>
                    <span className="claims-stat__label">You Owe</span>
                </div>
            </GlassCard>
            {pendingCount > 0 && (
                <GlassCard className="claims-stat claims-stat--pending">
                    <div className="claims-stat__icon claims-stat__icon--pending">
                        <Clock size={20} />
                    </div>
                    <div className="claims-stat__content">
                        <span className="claims-stat__value">{pendingCount}</span>
                        <span className="claims-stat__label">Pending</span>
                    </div>
                </GlassCard>
            )}
        </div>
    )
}

// Claims History Component
interface ClaimsHistoryProps {
    claims?: Claim[]
    onClaimSelect?: (claim: Claim) => void
}

export function ClaimsHistory({ claims = mockClaims, onClaimSelect }: ClaimsHistoryProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [expandedClaim, setExpandedClaim] = useState<string | null>(null)

    const statusFilters = [
        { value: 'all', label: 'All Claims' },
        { value: 'approved', label: 'Approved' },
        { value: 'processing', label: 'Processing' },
        { value: 'denied', label: 'Denied' }
    ]

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge variant="success" size="sm">Approved</Badge>
            case 'processing': return <Badge variant="warning" size="sm">Processing</Badge>
            case 'submitted': return <Badge variant="info" size="sm">Submitted</Badge>
            case 'denied': return <Badge variant="critical" size="sm">Denied</Badge>
            case 'appeal': return <Badge variant="purple" size="sm">Appeal</Badge>
            default: return <Badge variant="info" size="sm">{status}</Badge>
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 size={16} className="status-icon status-icon--approved" />
            case 'denied': return <XCircle size={16} className="status-icon status-icon--denied" />
            case 'processing': return <Clock size={16} className="status-icon status-icon--processing" />
            default: return <AlertCircle size={16} className="status-icon status-icon--pending" />
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const filteredClaims = claims.filter(claim => {
        const matchesSearch = searchQuery === '' ||
            claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            claim.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
            claim.serviceType.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || claim.status === statusFilter

        return matchesSearch && matchesStatus
    })

    return (
        <div className="claims-history">
            {/* Header */}
            <div className="claims-history__header">
                <h2>Claims History</h2>
                <Button variant="primary" size="sm" icon={<FileText size={16} />}>
                    Submit New Claim
                </Button>
            </div>

            {/* Filters */}
            <div className="claims-history__filters">
                <div className="search-input">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search claims..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="status-filters">
                    {statusFilters.map(filter => (
                        <button
                            key={filter.value}
                            className={`filter-btn ${statusFilter === filter.value ? 'active' : ''}`}
                            onClick={() => setStatusFilter(filter.value)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Claims List */}
            <div className="claims-list">
                {filteredClaims.map((claim, index) => (
                    <motion.div
                        key={claim.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                    >
                        <GlassCard className={`claim-card ${expandedClaim === claim.id ? 'expanded' : ''}`}>
                            <div
                                className="claim-card__main"
                                onClick={() => setExpandedClaim(expandedClaim === claim.id ? null : claim.id)}
                            >
                                <div className="claim-card__status">
                                    {getStatusIcon(claim.status)}
                                </div>
                                <div className="claim-card__info">
                                    <div className="claim-card__header">
                                        <span className="claim-card__number">{claim.claimNumber}</span>
                                        {getStatusBadge(claim.status)}
                                    </div>
                                    <h4 className="claim-card__service">{claim.serviceType}</h4>
                                    <div className="claim-card__meta">
                                        <span><User size={12} /> {claim.provider}</span>
                                        <span><Calendar size={12} /> {formatDate(claim.serviceDate)}</span>
                                    </div>
                                </div>
                                <div className="claim-card__amounts">
                                    <div className="claim-amount">
                                        <span className="claim-amount__label">Billed</span>
                                        <span className="claim-amount__value">${claim.billedAmount}</span>
                                    </div>
                                    <div className="claim-amount claim-amount--paid">
                                        <span className="claim-amount__label">Plan Paid</span>
                                        <span className="claim-amount__value">${claim.planPaid}</span>
                                    </div>
                                    <div className="claim-amount claim-amount--owed">
                                        <span className="claim-amount__label">You Owe</span>
                                        <span className="claim-amount__value">${claim.memberOwes}</span>
                                    </div>
                                </div>
                                <ChevronDown
                                    size={20}
                                    className={`claim-card__expand ${expandedClaim === claim.id ? 'rotated' : ''}`}
                                />
                            </div>

                            <AnimatePresence>
                                {expandedClaim === claim.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="claim-card__details"
                                    >
                                        <div className="claim-details-grid">
                                            <div className="claim-detail">
                                                <span className="claim-detail__label">Facility</span>
                                                <span className="claim-detail__value">{claim.facility || 'N/A'}</span>
                                            </div>
                                            <div className="claim-detail">
                                                <span className="claim-detail__label">Provider Type</span>
                                                <span className="claim-detail__value">{claim.providerType}</span>
                                            </div>
                                            <div className="claim-detail">
                                                <span className="claim-detail__label">Submitted</span>
                                                <span className="claim-detail__value">{formatDate(claim.submittedDate)}</span>
                                            </div>
                                            {claim.processedDate && (
                                                <div className="claim-detail">
                                                    <span className="claim-detail__label">Processed</span>
                                                    <span className="claim-detail__value">{formatDate(claim.processedDate)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="claim-card__actions">
                                            {claim.eobAvailable && (
                                                <Button variant="secondary" size="sm" icon={<Download size={14} />}>
                                                    View EOB
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm">
                                                View Details
                                            </Button>
                                            {claim.status === 'denied' && (
                                                <Button variant="primary" size="sm">
                                                    File Appeal
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default { ClaimsSummary, ClaimsHistory }
