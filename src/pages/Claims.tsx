import { useState, useEffect, useCallback } from 'react'
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
    RefreshCw,
    Loader2
} from 'lucide-react'
import { GlassCard, Button, Badge } from '../components/common'
import './Claims.css'

interface Claim {
    id: string
    claimNumber?: string
    type: 'medical' | 'dental' | 'vision' | 'pharmacy' | 'professional' | 'institutional'
    status: 'pending' | 'approved' | 'denied' | 'in_review' | 'received' | 'validated' | 'adjudicated' | 'paid' | 'voided'
    memberId: string
    memberName: string
    providerId: string
    providerName: string
    serviceDate: string
    submittedDate: string
    receivedDate?: string
    amount: number
    totalChargedAmount?: number
    totalAllowedAmount?: number
    totalPaidAmount?: number
    totalMemberResponsibility?: number
    primaryDiagnosisCode?: string
    primaryDiagnosisDescription?: string
    aiConfidence?: number
    aiRecommendation?: 'approve' | 'deny' | 'review'
}

// API configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Mock claims data (used in demo mode when no backend is connected)
const mockClaims: Claim[] = [
    {
        id: 'CLM-2024-000001',
        claimNumber: 'CLM-2024-000001',
        type: 'medical',
        status: 'pending',
        memberId: 'AHP100001',
        memberName: 'James Wilson',
        providerId: 'PRV-5621',
        providerName: 'Dr. Sarah Johnson, MD',
        serviceDate: '2024-01-15',
        submittedDate: '2024-01-16',
        amount: 1250.00,
        totalChargedAmount: 1250.00,
        totalAllowedAmount: 937.50,
        totalPaidAmount: 750.00,
        totalMemberResponsibility: 187.50,
        primaryDiagnosisCode: 'M54.5',
        primaryDiagnosisDescription: 'Low back pain',
        aiConfidence: 0.92,
        aiRecommendation: 'approve',
    },
    {
        id: 'CLM-2024-000002',
        claimNumber: 'CLM-2024-000002',
        type: 'dental',
        status: 'approved',
        memberId: 'AHP100002',
        memberName: 'Maria Santos',
        providerId: 'PRV-4892',
        providerName: 'Smile Dental Group',
        serviceDate: '2024-01-14',
        submittedDate: '2024-01-15',
        amount: 450.00,
        totalChargedAmount: 450.00,
        totalAllowedAmount: 375.00,
        totalPaidAmount: 300.00,
        totalMemberResponsibility: 75.00,
        primaryDiagnosisCode: 'K02.9',
        primaryDiagnosisDescription: 'Dental caries, unspecified',
        aiConfidence: 0.98,
        aiRecommendation: 'approve',
    },
    {
        id: 'CLM-2024-000003',
        claimNumber: 'CLM-2024-000003',
        type: 'medical',
        status: 'in_review',
        memberId: 'AHP100003',
        memberName: 'Robert Anderson',
        providerId: 'PRV-7234',
        providerName: 'Dr. Robert Martinez, MD',
        serviceDate: '2024-01-12',
        submittedDate: '2024-01-13',
        amount: 8500.00,
        totalChargedAmount: 8500.00,
        totalAllowedAmount: 6375.00,
        totalPaidAmount: 0,
        totalMemberResponsibility: 0,
        primaryDiagnosisCode: 'M17.11',
        primaryDiagnosisDescription: 'Primary osteoarthritis, right knee',
        aiConfidence: 0.65,
        aiRecommendation: 'review',
    },
    {
        id: 'CLM-2024-000004',
        claimNumber: 'CLM-2024-000004',
        type: 'pharmacy',
        status: 'approved',
        memberId: 'AHP100004',
        memberName: 'Jennifer Liu',
        providerId: 'PRV-3456',
        providerName: 'CVS Pharmacy #4521',
        serviceDate: '2024-01-11',
        submittedDate: '2024-01-11',
        amount: 125.00,
        totalChargedAmount: 125.00,
        totalAllowedAmount: 95.00,
        totalPaidAmount: 80.00,
        totalMemberResponsibility: 15.00,
        primaryDiagnosisCode: 'E11.65',
        primaryDiagnosisDescription: 'Type 2 diabetes with hyperglycemia',
        aiConfidence: 0.99,
        aiRecommendation: 'approve',
    },
    {
        id: 'CLM-2024-000005',
        claimNumber: 'CLM-2024-000005',
        type: 'vision',
        status: 'denied',
        memberId: 'AHP100005',
        memberName: 'William Chen',
        providerId: 'PRV-8901',
        providerName: 'Clear Vision Center',
        serviceDate: '2024-01-10',
        submittedDate: '2024-01-11',
        amount: 650.00,
        totalChargedAmount: 650.00,
        totalAllowedAmount: 0,
        totalPaidAmount: 0,
        totalMemberResponsibility: 650.00,
        primaryDiagnosisCode: 'H52.1',
        primaryDiagnosisDescription: 'Myopia',
        aiConfidence: 0.88,
        aiRecommendation: 'deny',
    },
    {
        id: 'CLM-2024-000006',
        claimNumber: 'CLM-2024-000006',
        type: 'medical',
        status: 'paid',
        memberId: 'AHP100006',
        memberName: 'Sarah Thompson',
        providerId: 'PRV-1234',
        providerName: 'Dr. Emily Park, MD',
        serviceDate: '2024-01-08',
        submittedDate: '2024-01-09',
        amount: 275.00,
        totalChargedAmount: 275.00,
        totalAllowedAmount: 225.00,
        totalPaidAmount: 200.00,
        totalMemberResponsibility: 25.00,
        primaryDiagnosisCode: 'J06.9',
        primaryDiagnosisDescription: 'Acute upper respiratory infection',
        aiConfidence: 0.97,
        aiRecommendation: 'approve',
    },
]

/**
 * Fetch claims from the API, falling back to mock data if the backend is not available.
 */
async function fetchClaims(params?: { status?: string; type?: string; query?: string }): Promise<Claim[]> {
    if (!API_BASE) return mockClaims;

    try {
        const searchParams = new URLSearchParams();
        if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
        if (params?.type && params.type !== 'all') searchParams.set('type', params.type);
        if (params?.query) searchParams.set('query', params.query);
        searchParams.set('limit', '50');

        const response = await fetch(`${API_BASE}/api/v1/claims?${searchParams}`, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('API unavailable');
        const data = await response.json();

        return (data.data || []).map((c: any) => ({
            id: c.claimNumber || c.id,
            claimNumber: c.claimNumber,
            type: c.type === 'professional' ? 'medical' : c.type,
            status: c.status,
            memberId: c.memberId,
            memberName: `${c.patientFirstName} ${c.patientLastName}`,
            providerId: c.renderingProviderId,
            providerName: c.renderingProviderName,
            serviceDate: c.serviceFromDate,
            submittedDate: c.receivedDate,
            amount: c.totalChargedAmount,
            totalChargedAmount: c.totalChargedAmount,
            totalAllowedAmount: c.totalAllowedAmount,
            totalPaidAmount: c.totalPaidAmount,
            totalMemberResponsibility: c.totalMemberResponsibility,
            primaryDiagnosisCode: c.primaryDiagnosisCode,
            primaryDiagnosisDescription: c.primaryDiagnosisDescription,
            aiConfidence: c.aiConfidenceScore,
            aiRecommendation: c.aiRecommendation,
        }));
    } catch {
        // Fallback to mock data when backend is unavailable
        return mockClaims;
    }
}

export function Claims() {
    const [claims, setClaims] = useState<Claim[]>(mockClaims)
    const [isLoading, setIsLoading] = useState(false)
    const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock')
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)

    // Load claims from API on mount and when filters change
    const loadClaims = useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await fetchClaims({
                status: statusFilter,
                type: typeFilter,
                query: searchQuery,
            })
            setClaims(data)
            setDataSource(API_BASE ? 'api' : 'mock')
        } catch {
            setClaims(mockClaims)
            setDataSource('mock')
        } finally {
            setIsLoading(false)
        }
    }, [statusFilter, typeFilter, searchQuery])

    useEffect(() => {
        loadClaims()
    }, [loadClaims])

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
            case 'adjudicated':
                return <Badge variant="success" icon={<CheckCircle2 size={12} />}>Approved</Badge>
            case 'paid':
                return <Badge variant="success" icon={<DollarSign size={12} />}>Paid</Badge>
            case 'denied':
                return <Badge variant="critical" icon={<XCircle size={12} />}>Denied</Badge>
            case 'pending':
            case 'received':
            case 'validated':
                return <Badge variant="warning" icon={<Clock size={12} />}>Pending</Badge>
            case 'in_review':
                return <Badge variant="info" icon={<Eye size={12} />}>In Review</Badge>
            case 'voided':
                return <Badge variant="critical" icon={<XCircle size={12} />}>Voided</Badge>
            default:
                return <Badge variant="info" icon={<Clock size={12} />}>{status}</Badge>
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
