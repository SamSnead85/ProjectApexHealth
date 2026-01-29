import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    DollarSign,
    User,
    Building2,
    Calendar,
    ChevronRight,
    Filter,
    Search,
    Eye,
    ArrowUpRight,
    ArrowDownRight,
    Zap
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './ClaimsProcessing.css'

// Claims status types based on EDI 835 claim status codes
type ClaimStatus = 'pending' | 'in_review' | 'approved' | 'denied' | 'partial' | 'suspended'

interface ClaimLineItem {
    lineNumber: number
    procedureCode: string
    description: string
    serviceDate: string
    billedAmount: number
    allowedAmount: number
    paidAmount: number
    patientResponsibility: number
    adjustmentCodes: string[]
}

interface Claim {
    id: string
    transactionId: string // EDI 837 reference
    memberId: string
    memberName: string
    providerId: string
    providerName: string
    serviceDate: string
    receivedDate: string
    claimType: 'professional' | 'institutional' // EDI 837P vs 837I
    status: ClaimStatus
    billedAmount: number
    allowedAmount: number
    paidAmount: number
    patientResponsibility: number
    lineItems: ClaimLineItem[]
    autoAdjudicated: boolean
    flaggedReasons?: string[]
}

// Mock claims data
const mockClaims: Claim[] = [
    {
        id: 'CLM-2024-00145',
        transactionId: 'TRN-837P-2024012601',
        memberId: 'APX-2024-78432',
        memberName: 'Sarah Johnson',
        providerId: 'NPI-1234567890',
        providerName: 'Premier Medical Associates',
        serviceDate: '2024-01-15',
        receivedDate: '2024-01-20',
        claimType: 'professional',
        status: 'approved',
        billedAmount: 450.00,
        allowedAmount: 320.00,
        paidAmount: 256.00,
        patientResponsibility: 64.00,
        autoAdjudicated: true,
        lineItems: [
            {
                lineNumber: 1,
                procedureCode: '99213',
                description: 'Office visit, established patient',
                serviceDate: '2024-01-15',
                billedAmount: 150.00,
                allowedAmount: 120.00,
                paidAmount: 96.00,
                patientResponsibility: 24.00,
                adjustmentCodes: ['CO-45', 'PR-2']
            },
            {
                lineNumber: 2,
                procedureCode: '36415',
                description: 'Venipuncture for blood draw',
                serviceDate: '2024-01-15',
                billedAmount: 25.00,
                allowedAmount: 18.00,
                paidAmount: 18.00,
                patientResponsibility: 0.00,
                adjustmentCodes: ['CO-45']
            },
            {
                lineNumber: 3,
                procedureCode: '80053',
                description: 'Comprehensive metabolic panel',
                serviceDate: '2024-01-15',
                billedAmount: 275.00,
                allowedAmount: 182.00,
                paidAmount: 142.00,
                patientResponsibility: 40.00,
                adjustmentCodes: ['CO-45', 'PR-2']
            }
        ]
    },
    {
        id: 'CLM-2024-00146',
        transactionId: 'TRN-837I-2024012602',
        memberId: 'APX-2024-45123',
        memberName: 'Michael Chen',
        providerId: 'NPI-9876543210',
        providerName: 'City General Hospital',
        serviceDate: '2024-01-18',
        receivedDate: '2024-01-22',
        claimType: 'institutional',
        status: 'in_review',
        billedAmount: 12500.00,
        allowedAmount: 0,
        paidAmount: 0,
        patientResponsibility: 0,
        autoAdjudicated: false,
        flaggedReasons: ['Amount exceeds threshold $5,000', 'Facility type requires manual review'],
        lineItems: [
            {
                lineNumber: 1,
                procedureCode: '99223',
                description: 'Initial hospital care, high complexity',
                serviceDate: '2024-01-18',
                billedAmount: 850.00,
                allowedAmount: 0,
                paidAmount: 0,
                patientResponsibility: 0,
                adjustmentCodes: []
            },
            {
                lineNumber: 2,
                procedureCode: '36556',
                description: 'Central venous catheter placement',
                serviceDate: '2024-01-18',
                billedAmount: 2400.00,
                allowedAmount: 0,
                paidAmount: 0,
                patientResponsibility: 0,
                adjustmentCodes: []
            }
        ]
    },
    {
        id: 'CLM-2024-00147',
        transactionId: 'TRN-837P-2024012603',
        memberId: 'APX-2024-33456',
        memberName: 'Emily Rodriguez',
        providerId: 'NPI-5555555555',
        providerName: 'Sunshine Pediatrics',
        serviceDate: '2024-01-19',
        receivedDate: '2024-01-21',
        claimType: 'professional',
        status: 'denied',
        billedAmount: 275.00,
        allowedAmount: 0,
        paidAmount: 0,
        patientResponsibility: 0,
        autoAdjudicated: true,
        flaggedReasons: ['Service not covered under plan', 'CO-96: Non-covered charge'],
        lineItems: [
            {
                lineNumber: 1,
                procedureCode: '90460',
                description: 'Immunization administration',
                serviceDate: '2024-01-19',
                billedAmount: 75.00,
                allowedAmount: 0,
                paidAmount: 0,
                patientResponsibility: 0,
                adjustmentCodes: ['CO-96']
            }
        ]
    },
    {
        id: 'CLM-2024-00148',
        transactionId: 'TRN-837P-2024012604',
        memberId: 'APX-2024-78432',
        memberName: 'Sarah Johnson',
        providerId: 'NPI-7777777777',
        providerName: 'Valley Imaging Center',
        serviceDate: '2024-01-22',
        receivedDate: '2024-01-24',
        claimType: 'professional',
        status: 'pending',
        billedAmount: 1850.00,
        allowedAmount: 0,
        paidAmount: 0,
        patientResponsibility: 0,
        autoAdjudicated: false,
        flaggedReasons: ['Prior authorization required'],
        lineItems: [
            {
                lineNumber: 1,
                procedureCode: '72148',
                description: 'MRI lumbar spine without contrast',
                serviceDate: '2024-01-22',
                billedAmount: 1850.00,
                allowedAmount: 0,
                paidAmount: 0,
                patientResponsibility: 0,
                adjustmentCodes: []
            }
        ]
    }
]

// Claims metrics
const claimsMetrics = {
    totalReceived: 2847,
    autoAdjudicated: { count: 2156, rate: 75.7 },
    pendingReview: 428,
    avgProcessingDays: 2.3,
    denialRate: 5.4
}

export function ClaimsProcessing() {
    const [claims] = useState<Claim[]>(mockClaims)
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
    const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredClaims = claims.filter(claim => {
        const matchesStatus = statusFilter === 'all' || claim.status === statusFilter
        const matchesSearch = !searchQuery ||
            claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            claim.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            claim.providerName.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const getStatusBadge = (status: ClaimStatus) => {
        const configs: Record<ClaimStatus, { variant: 'success' | 'warning' | 'critical' | 'info' | 'teal'; label: string }> = {
            pending: { variant: 'warning', label: 'Pending' },
            in_review: { variant: 'info', label: 'In Review' },
            approved: { variant: 'success', label: 'Approved' },
            denied: { variant: 'critical', label: 'Denied' },
            partial: { variant: 'teal', label: 'Partial' },
            suspended: { variant: 'warning', label: 'Suspended' }
        }
        const config = configs[status]
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

    return (
        <div className="claims-processing">
            {/* Header */}
            <div className="claims-processing__header">
                <div>
                    <h1 className="claims-processing__title">Claims Processing</h1>
                    <p className="claims-processing__subtitle">
                        EDI 837/835 claims lifecycle management with auto-adjudication
                    </p>
                </div>
                <div className="claims-processing__header-badges">
                    <Badge variant="info" size="sm" icon={<FileText size={12} />}>
                        EDI 837P/I
                    </Badge>
                    <Badge variant="teal" size="sm" icon={<Zap size={12} />}>
                        Auto-Adjudication Active
                    </Badge>
                </div>
            </div>

            {/* Metrics */}
            <div className="claims-processing__metrics">
                <MetricCard
                    title="Total Claims"
                    value={claimsMetrics.totalReceived.toLocaleString()}
                    icon={<FileText size={20} />}
                    trend={{ value: 12.5, direction: 'up' }}
                    subtitle="This month"
                />
                <MetricCard
                    title="Auto-Adjudicated"
                    value={`${claimsMetrics.autoAdjudicated.rate}%`}
                    icon={<Zap size={20} />}
                    trend={{ value: 8.2, direction: 'up' }}
                    subtitle={`${claimsMetrics.autoAdjudicated.count} claims`}
                    variant="success"
                />
                <MetricCard
                    title="Pending Review"
                    value={claimsMetrics.pendingReview.toString()}
                    icon={<Clock size={20} />}
                    trend={{ value: 3.1, direction: 'down' }}
                    subtitle="In queue"
                    variant="warning"
                />
                <MetricCard
                    title="Avg Processing"
                    value={`${claimsMetrics.avgProcessingDays} days`}
                    icon={<ArrowUpRight size={20} />}
                    trend={{ value: 0.4, direction: 'down' }}
                    subtitle="Time to decision"
                    variant="teal"
                />
            </div>

            {/* Main Grid */}
            <div className="claims-processing__grid">
                {/* Claims List */}
                <section className="claims-processing__list-section">
                    {/* Filters */}
                    <div className="claims-processing__filters">
                        <div className="claims-processing__search-wrapper">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search by claim ID, member, or provider..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="claims-processing__status-filters">
                            {(['all', 'pending', 'in_review', 'approved', 'denied'] as const).map((status) => (
                                <button
                                    key={status}
                                    className={`claims-processing__filter-btn ${statusFilter === status ? 'active' : ''}`}
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {status === 'all' ? 'All' : status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Claims Table */}
                    <GlassCard className="claims-processing__table-card">
                        <table className="claims-processing__table">
                            <thead>
                                <tr>
                                    <th>Claim ID</th>
                                    <th>Member</th>
                                    <th>Provider</th>
                                    <th>Service Date</th>
                                    <th>Billed</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClaims.map((claim, index) => (
                                    <motion.tr
                                        key={claim.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={selectedClaim?.id === claim.id ? 'selected' : ''}
                                        onClick={() => setSelectedClaim(claim)}
                                    >
                                        <td>
                                            <div className="claims-processing__claim-id">
                                                <span>{claim.id}</span>
                                                <span className="claims-processing__claim-type">
                                                    {claim.claimType === 'professional' ? '837P' : '837I'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{claim.memberName}</td>
                                        <td>{claim.providerName}</td>
                                        <td>{new Date(claim.serviceDate).toLocaleDateString()}</td>
                                        <td className="claims-processing__amount">{formatCurrency(claim.billedAmount)}</td>
                                        <td>
                                            <div className="claims-processing__status-cell">
                                                {getStatusBadge(claim.status)}
                                                {claim.autoAdjudicated && (
                                                    <Zap size={12} className="claims-processing__auto-icon" />
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <ChevronRight size={16} className="claims-processing__chevron" />
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </GlassCard>
                </section>

                {/* Claim Detail */}
                <AnimatePresence mode="wait">
                    {selectedClaim ? (
                        <motion.section
                            key={selectedClaim.id}
                            className="claims-processing__detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <GlassCard className="claims-processing__detail-card">
                                <div className="claims-processing__detail-header">
                                    <div>
                                        <h2>{selectedClaim.id}</h2>
                                        <span className="claims-processing__transaction-id">
                                            Transaction: {selectedClaim.transactionId}
                                        </span>
                                    </div>
                                    {getStatusBadge(selectedClaim.status)}
                                </div>

                                {/* Flagged Reasons */}
                                {selectedClaim.flaggedReasons && selectedClaim.flaggedReasons.length > 0 && (
                                    <div className="claims-processing__flags">
                                        <AlertTriangle size={16} />
                                        <ul>
                                            {selectedClaim.flaggedReasons.map((reason, i) => (
                                                <li key={i}>{reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Summary */}
                                <div className="claims-processing__detail-grid">
                                    <div className="claims-processing__detail-item">
                                        <User size={16} />
                                        <div>
                                            <span className="claims-processing__detail-label">Member</span>
                                            <span className="claims-processing__detail-value">{selectedClaim.memberName}</span>
                                            <span className="claims-processing__detail-sub">{selectedClaim.memberId}</span>
                                        </div>
                                    </div>
                                    <div className="claims-processing__detail-item">
                                        <Building2 size={16} />
                                        <div>
                                            <span className="claims-processing__detail-label">Provider</span>
                                            <span className="claims-processing__detail-value">{selectedClaim.providerName}</span>
                                            <span className="claims-processing__detail-sub">{selectedClaim.providerId}</span>
                                        </div>
                                    </div>
                                    <div className="claims-processing__detail-item">
                                        <Calendar size={16} />
                                        <div>
                                            <span className="claims-processing__detail-label">Service Date</span>
                                            <span className="claims-processing__detail-value">
                                                {new Date(selectedClaim.serviceDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="claims-processing__detail-item">
                                        <Clock size={16} />
                                        <div>
                                            <span className="claims-processing__detail-label">Received</span>
                                            <span className="claims-processing__detail-value">
                                                {new Date(selectedClaim.receivedDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amounts */}
                                <div className="claims-processing__amounts">
                                    <div className="claims-processing__amount-item">
                                        <span className="claims-processing__amount-label">Billed</span>
                                        <span className="claims-processing__amount-value">{formatCurrency(selectedClaim.billedAmount)}</span>
                                    </div>
                                    <div className="claims-processing__amount-item">
                                        <span className="claims-processing__amount-label">Allowed</span>
                                        <span className="claims-processing__amount-value claims-processing__amount-value--allowed">
                                            {formatCurrency(selectedClaim.allowedAmount)}
                                        </span>
                                    </div>
                                    <div className="claims-processing__amount-item">
                                        <span className="claims-processing__amount-label">Paid</span>
                                        <span className="claims-processing__amount-value claims-processing__amount-value--paid">
                                            {formatCurrency(selectedClaim.paidAmount)}
                                        </span>
                                    </div>
                                    <div className="claims-processing__amount-item">
                                        <span className="claims-processing__amount-label">Patient Resp.</span>
                                        <span className="claims-processing__amount-value claims-processing__amount-value--patient">
                                            {formatCurrency(selectedClaim.patientResponsibility)}
                                        </span>
                                    </div>
                                </div>

                                {/* Line Items */}
                                <div className="claims-processing__line-items">
                                    <h3>Line Items (EDI 835)</h3>
                                    <table className="claims-processing__line-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Code</th>
                                                <th>Description</th>
                                                <th>Billed</th>
                                                <th>Allowed</th>
                                                <th>Paid</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedClaim.lineItems.map((line) => (
                                                <tr key={line.lineNumber}>
                                                    <td>{line.lineNumber}</td>
                                                    <td className="claims-processing__code">{line.procedureCode}</td>
                                                    <td>{line.description}</td>
                                                    <td>{formatCurrency(line.billedAmount)}</td>
                                                    <td>{formatCurrency(line.allowedAmount)}</td>
                                                    <td>{formatCurrency(line.paidAmount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Actions */}
                                {(selectedClaim.status === 'pending' || selectedClaim.status === 'in_review') && (
                                    <div className="claims-processing__actions">
                                        <Button variant="primary" icon={<CheckCircle2 size={16} />}>
                                            Approve Claim
                                        </Button>
                                        <Button variant="secondary" icon={<XCircle size={16} />}>
                                            Deny Claim
                                        </Button>
                                        <Button variant="ghost" icon={<Eye size={16} />}>
                                            Request Info
                                        </Button>
                                    </div>
                                )}
                            </GlassCard>
                        </motion.section>
                    ) : (
                        <motion.div
                            className="claims-processing__no-selection"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <FileText size={48} />
                            <p>Select a claim to view details</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default ClaimsProcessing
