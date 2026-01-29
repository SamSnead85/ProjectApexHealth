import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Stethoscope,
    FileText,
    DollarSign,
    Users,
    Calendar,
    Search,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Upload,
    Download,
    MessageSquare,
    Activity,
    CreditCard,
    ClipboardList
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './ProviderPortal.css'

interface ClaimSubmission {
    id: string
    patientName: string
    memberId: string
    serviceDate: string
    procedureCode: string
    amount: number
    status: 'submitted' | 'processing' | 'approved' | 'denied' | 'pending_info'
    submittedDate: string
}

interface PatientEligibility {
    memberId: string
    memberName: string
    planName: string
    effectiveDate: string
    status: 'active' | 'inactive' | 'pending'
    copay: number
    deductibleMet: number
    deductibleTotal: number
}

const recentClaims: ClaimSubmission[] = [
    { id: 'CLM-2024-001', patientName: 'John Smith', memberId: 'MEM-001', serviceDate: '2024-01-20', procedureCode: '99213', amount: 125.00, status: 'approved', submittedDate: '2024-01-21' },
    { id: 'CLM-2024-002', patientName: 'Maria Garcia', memberId: 'MEM-002', serviceDate: '2024-01-22', procedureCode: '99214', amount: 175.00, status: 'processing', submittedDate: '2024-01-23' },
    { id: 'CLM-2024-003', patientName: 'James Wilson', memberId: 'MEM-003', serviceDate: '2024-01-18', procedureCode: '90837', amount: 225.00, status: 'pending_info', submittedDate: '2024-01-19' },
    { id: 'CLM-2024-004', patientName: 'Susan Clark', memberId: 'MEM-004', serviceDate: '2024-01-25', procedureCode: '99215', amount: 250.00, status: 'submitted', submittedDate: '2024-01-26' }
]

export function ProviderPortal() {
    const [claims] = useState<ClaimSubmission[]>(recentClaims)
    const [eligibilityResult, setEligibilityResult] = useState<PatientEligibility | null>(null)
    const [searchMemberId, setSearchMemberId] = useState('')

    const handleEligibilityCheck = () => {
        // Simulate eligibility check
        setEligibilityResult({
            memberId: searchMemberId || 'MEM-001',
            memberName: 'John Smith',
            planName: 'Apex Platinum PPO',
            effectiveDate: '2024-01-01',
            status: 'active',
            copay: 20,
            deductibleMet: 350,
            deductibleTotal: 500
        })
    }

    const getStatusBadge = (status: ClaimSubmission['status']) => {
        switch (status) {
            case 'submitted': return <Badge variant="info" icon={<Clock size={10} />}>Submitted</Badge>
            case 'processing': return <Badge variant="warning" icon={<Activity size={10} />}>Processing</Badge>
            case 'approved': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Approved</Badge>
            case 'denied': return <Badge variant="critical" icon={<AlertTriangle size={10} />}>Denied</Badge>
            case 'pending_info': return <Badge variant="warning" icon={<MessageSquare size={10} />}>Pending Info</Badge>
        }
    }

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

    return (
        <div className="provider-portal-page">
            {/* Header */}
            <div className="provider-portal__header">
                <div>
                    <h1 className="provider-portal__title">Provider Portal</h1>
                    <p className="provider-portal__subtitle">
                        Submit claims, verify eligibility, and manage authorizations
                    </p>
                </div>
                <div className="provider-portal__actions">
                    <Button variant="secondary" icon={<Download size={16} />}>
                        Fee Schedule
                    </Button>
                    <Button variant="primary" icon={<Upload size={16} />}>
                        Submit Claim
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="provider-portal__stats">
                <MetricCard
                    title="Claims This Month"
                    value="127"
                    change={{ value: 12.5, type: 'increase' }}
                    icon={<FileText size={20} />}
                />
                <MetricCard
                    title="Pending Review"
                    value="23"
                    icon={<Clock size={20} />}
                />
                <MetricCard
                    title="Approved Amount"
                    value="$45.2K"
                    change={{ value: 8.2, type: 'increase' }}
                    icon={<DollarSign size={20} />}
                />
                <MetricCard
                    title="Approval Rate"
                    value="94%"
                    icon={<CheckCircle2 size={20} />}
                />
            </div>

            {/* Two Column Layout */}
            <div className="provider-portal__grid">
                {/* Eligibility Check */}
                <GlassCard className="eligibility-check">
                    <div className="eligibility-check__header">
                        <Users size={20} />
                        <h3>Patient Eligibility Check</h3>
                    </div>

                    <div className="eligibility-check__form">
                        <div className="form-group">
                            <label>Member ID</label>
                            <input
                                type="text"
                                placeholder="Enter Member ID"
                                value={searchMemberId}
                                onChange={(e) => setSearchMemberId(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="primary"
                            icon={<Search size={16} />}
                            onClick={handleEligibilityCheck}
                        >
                            Check Eligibility
                        </Button>
                    </div>

                    {eligibilityResult && (
                        <motion.div
                            className="eligibility-result"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="eligibility-result__header">
                                <div className="member-info">
                                    <h4>{eligibilityResult.memberName}</h4>
                                    <span>{eligibilityResult.memberId}</span>
                                </div>
                                <Badge variant="success">Active</Badge>
                            </div>
                            <div className="eligibility-result__details">
                                <div className="detail-row">
                                    <span>Plan</span>
                                    <span>{eligibilityResult.planName}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Effective Date</span>
                                    <span>{new Date(eligibilityResult.effectiveDate).toLocaleDateString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Copay</span>
                                    <span>{formatCurrency(eligibilityResult.copay)}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Deductible</span>
                                    <span>{formatCurrency(eligibilityResult.deductibleMet)} / {formatCurrency(eligibilityResult.deductibleTotal)}</span>
                                </div>
                            </div>
                            <div className="deductible-progress">
                                <div
                                    className="deductible-progress__fill"
                                    style={{ width: `${(eligibilityResult.deductibleMet / eligibilityResult.deductibleTotal) * 100}%` }}
                                />
                            </div>
                        </motion.div>
                    )}
                </GlassCard>

                {/* Quick Actions */}
                <GlassCard className="quick-actions">
                    <h3>Quick Actions</h3>
                    <div className="quick-actions__grid">
                        <button className="quick-action">
                            <FileText size={24} />
                            <span>Submit Claim</span>
                        </button>
                        <button className="quick-action">
                            <ClipboardList size={24} />
                            <span>Prior Auth</span>
                        </button>
                        <button className="quick-action">
                            <CreditCard size={24} />
                            <span>Payment Status</span>
                        </button>
                        <button className="quick-action">
                            <MessageSquare size={24} />
                            <span>Contact Us</span>
                        </button>
                    </div>
                </GlassCard>
            </div>

            {/* Recent Claims */}
            <GlassCard className="recent-claims">
                <div className="recent-claims__header">
                    <h3>Recent Claims</h3>
                    <Button variant="ghost" size="sm">View All Claims</Button>
                </div>

                <table className="claims-table">
                    <thead>
                        <tr>
                            <th>Claim ID</th>
                            <th>Patient</th>
                            <th>Service Date</th>
                            <th>Procedure</th>
                            <th>Amount</th>
                            <th>Submitted</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {claims.map((claim, index) => (
                            <motion.tr
                                key={claim.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <td className="claim-id">{claim.id}</td>
                                <td>
                                    <div className="patient-info">
                                        <span className="patient-name">{claim.patientName}</span>
                                        <span className="member-id">{claim.memberId}</span>
                                    </div>
                                </td>
                                <td>{new Date(claim.serviceDate).toLocaleDateString()}</td>
                                <td><code>{claim.procedureCode}</code></td>
                                <td className="amount">{formatCurrency(claim.amount)}</td>
                                <td>{new Date(claim.submittedDate).toLocaleDateString()}</td>
                                <td>{getStatusBadge(claim.status)}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    )
}

export default ProviderPortal
