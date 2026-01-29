import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    RefreshCw,
    DollarSign,
    User,
    Building2,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Send,
    Search,
    Filter,
    Plus
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './RefundProcessing.css'

interface Refund {
    id: string
    patientName: string
    payerId: string
    payerName: string
    originalAmount: number
    refundAmount: number
    reason: string
    status: 'pending' | 'approved' | 'processed' | 'rejected'
    requestDate: string
    processedDate: string | null
}

const refunds: Refund[] = [
    { id: 'REF-001', patientName: 'John Smith', payerId: '60054', payerName: 'Aetna', originalAmount: 1500, refundAmount: 350, reason: 'Overpayment - duplicate payment received', status: 'pending', requestDate: '2024-01-25', processedDate: null },
    { id: 'REF-002', patientName: 'Maria Garcia', payerId: '00060', payerName: 'BCBS', originalAmount: 2200, refundAmount: 425, reason: 'Coordination of benefits adjustment', status: 'approved', requestDate: '2024-01-23', processedDate: null },
    { id: 'REF-003', patientName: 'Robert Johnson', payerId: '87726', payerName: 'UnitedHealthcare', originalAmount: 890, refundAmount: 890, reason: 'Service not rendered', status: 'processed', requestDate: '2024-01-20', processedDate: '2024-01-24' },
    { id: 'REF-004', patientName: 'Sarah Wilson', payerId: 'SELF', payerName: 'Self-Pay', originalAmount: 500, refundAmount: 150, reason: 'Insurance payment received after patient payment', status: 'pending', requestDate: '2024-01-26', processedDate: null }
]

export function RefundProcessing() {
    const [allRefunds] = useState<Refund[]>(refunds)
    const [filterStatus, setFilterStatus] = useState('all')

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

    const getStatusBadge = (status: Refund['status']) => {
        switch (status) {
            case 'pending': return <Badge variant="warning" icon={<Clock size={10} />}>Pending</Badge>
            case 'approved': return <Badge variant="info" icon={<CheckCircle2 size={10} />}>Approved</Badge>
            case 'processed': return <Badge variant="success" icon={<Send size={10} />}>Processed</Badge>
            case 'rejected': return <Badge variant="critical" icon={<AlertTriangle size={10} />}>Rejected</Badge>
        }
    }

    const totalPending = allRefunds.filter(r => r.status === 'pending').reduce((acc, r) => acc + r.refundAmount, 0)
    const totalProcessed = allRefunds.filter(r => r.status === 'processed').reduce((acc, r) => acc + r.refundAmount, 0)

    const filteredRefunds = filterStatus === 'all'
        ? allRefunds
        : allRefunds.filter(r => r.status === filterStatus)

    return (
        <div className="refund-processing-page">
            {/* Header */}
            <div className="refund__header">
                <div>
                    <h1 className="refund__title">Refund Processing</h1>
                    <p className="refund__subtitle">
                        Manage overpayment refunds and credit adjustments
                    </p>
                </div>
                <Button variant="primary" icon={<Plus size={16} />}>
                    New Refund Request
                </Button>
            </div>

            {/* Stats */}
            <div className="refund__stats">
                <GlassCard className="stat-card">
                    <Clock size={24} className="stat-icon pending" />
                    <div>
                        <span className="stat-value">{allRefunds.filter(r => r.status === 'pending').length}</span>
                        <span className="stat-label">Pending Review</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <DollarSign size={24} className="stat-icon warning" />
                    <div>
                        <span className="stat-value">{formatCurrency(totalPending)}</span>
                        <span className="stat-label">Pending Amount</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <CheckCircle2 size={24} className="stat-icon success" />
                    <div>
                        <span className="stat-value">{formatCurrency(totalProcessed)}</span>
                        <span className="stat-label">Processed MTD</span>
                    </div>
                </GlassCard>
            </div>

            {/* Filters */}
            <div className="refund__filters">
                <div className="status-filters">
                    {['all', 'pending', 'approved', 'processed'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === 'all' ? 'All Refunds' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="search-box">
                    <Search size={16} />
                    <input type="text" placeholder="Search refunds..." />
                </div>
            </div>

            {/* Refunds List */}
            <GlassCard className="refunds-list">
                <table className="refunds-table">
                    <thead>
                        <tr>
                            <th>Refund ID</th>
                            <th>Patient</th>
                            <th>Payer</th>
                            <th>Original</th>
                            <th>Refund Amount</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRefunds.map((refund, index) => (
                            <motion.tr
                                key={refund.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <td className="refund-id">{refund.id}</td>
                                <td>
                                    <div className="person-cell">
                                        <User size={14} />
                                        <span>{refund.patientName}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="payer-cell">
                                        <Building2 size={14} />
                                        <span>{refund.payerName}</span>
                                    </div>
                                </td>
                                <td className="amount">{formatCurrency(refund.originalAmount)}</td>
                                <td className="refund-amount">{formatCurrency(refund.refundAmount)}</td>
                                <td className="reason">{refund.reason}</td>
                                <td>{getStatusBadge(refund.status)}</td>
                                <td>
                                    <div className="table-actions">
                                        {refund.status === 'pending' && (
                                            <>
                                                <Button variant="primary" size="sm">Approve</Button>
                                                <Button variant="ghost" size="sm">Reject</Button>
                                            </>
                                        )}
                                        {refund.status === 'approved' && (
                                            <Button variant="secondary" size="sm" icon={<Send size={12} />}>Process</Button>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    )
}

export default RefundProcessing
