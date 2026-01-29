import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Radio,
    FileText,
    CheckCircle2,
    Clock,
    AlertTriangle,
    XCircle,
    Send,
    Download,
    BarChart3,
    TrendingUp,
    Building,
    DollarSign,
    Timer,
    Award,
    RefreshCw
} from 'lucide-react'
import './CarrierVendorPortal.css'

interface Transaction {
    id: string
    type: '834' | '835' | '837'
    carrier: string
    timestamp: string
    records: number
    status: 'success' | 'pending' | 'error' | 'processing'
    errorMessage?: string
}

interface RateReconciliation {
    id: string
    carrier: string
    period: string
    invoicedAmount: number
    calculatedAmount: number
    variance: number
    status: 'matched' | 'discrepancy' | 'pending'
}

interface CarrierSLA {
    id: string
    carrier: string
    logoInitials: string
    type: string
    avgResponseTime: string
    slaTarget: string
    compliance: number
    status: 'meeting' | 'at-risk' | 'breach'
}

const mockTransactions: Transaction[] = [
    { id: '1', type: '834', carrier: 'Blue Cross Blue Shield', timestamp: '2026-01-29 10:42:15', records: 47, status: 'success' },
    { id: '2', type: '835', carrier: 'Aetna', timestamp: '2026-01-29 10:38:22', records: 892, status: 'success' },
    { id: '3', type: '834', carrier: 'UnitedHealthcare', timestamp: '2026-01-29 10:35:08', records: 23, status: 'processing' },
    { id: '4', type: '837', carrier: 'Cigna', timestamp: '2026-01-29 10:28:44', records: 156, status: 'error', errorMessage: 'Invalid member ID in segment 2' },
    { id: '5', type: '835', carrier: 'Humana', timestamp: '2026-01-29 10:15:33', records: 1247, status: 'success' },
    { id: '6', type: '834', carrier: 'Kaiser Permanente', timestamp: '2026-01-29 09:58:12', records: 8, status: 'pending' }
]

const mockReconciliations: RateReconciliation[] = [
    { id: '1', carrier: 'Blue Cross Blue Shield', period: 'January 2026', invoicedAmount: 487250, calculatedAmount: 487250, variance: 0, status: 'matched' },
    { id: '2', carrier: 'Aetna', period: 'January 2026', invoicedAmount: 312480, calculatedAmount: 308750, variance: 3730, status: 'discrepancy' },
    { id: '3', carrier: 'UnitedHealthcare', period: 'January 2026', invoicedAmount: 524180, calculatedAmount: 524180, variance: 0, status: 'matched' },
    { id: '4', carrier: 'Cigna', period: 'January 2026', invoicedAmount: 198500, calculatedAmount: 0, variance: 0, status: 'pending' }
]

const mockCarrierSLAs: CarrierSLA[] = [
    { id: '1', carrier: 'Blue Cross Blue Shield', logoInitials: 'BC', type: 'Claims Processing', avgResponseTime: '2.4 days', slaTarget: '5 days', compliance: 98.2, status: 'meeting' },
    { id: '2', carrier: 'Aetna', logoInitials: 'AE', type: 'Eligibility Updates', avgResponseTime: '18 hours', slaTarget: '24 hours', compliance: 94.5, status: 'meeting' },
    { id: '3', carrier: 'UnitedHealthcare', logoInitials: 'UH', type: 'Prior Auth', avgResponseTime: '4.8 days', slaTarget: '3 days', compliance: 78.3, status: 'at-risk' },
    { id: '4', carrier: 'Cigna', logoInitials: 'CI', type: 'Appeals Response', avgResponseTime: '32 days', slaTarget: '30 days', compliance: 65.2, status: 'breach' }
]

type FilterType = 'all' | '834' | '835' | '837'

export default function CarrierVendorPortal() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all')

    const filteredTransactions = activeFilter === 'all'
        ? mockTransactions
        : mockTransactions.filter(tx => tx.type === activeFilter)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const getStatusIcon = (status: Transaction['status']) => {
        switch (status) {
            case 'success': return <CheckCircle2 size={14} />
            case 'pending': return <Clock size={14} />
            case 'error': return <XCircle size={14} />
            case 'processing': return <RefreshCw size={14} className="spin" />
        }
    }

    const getSLAIcon = (status: CarrierSLA['status']) => {
        switch (status) {
            case 'meeting': return <CheckCircle2 size={14} />
            case 'at-risk': return <AlertTriangle size={14} />
            case 'breach': return <XCircle size={14} />
        }
    }

    return (
        <div className="carrier-vendor-portal">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>Carrier & Vendor Portal</h1>
                <p className="page-subtitle">
                    EDI transaction monitoring, rate reconciliation, and SLA tracking
                </p>
            </motion.div>

            {/* Stats Row */}
            <motion.div
                className="edi-stats-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="edi-stat-card">
                    <div className="edi-stat-header">
                        <span>Transactions Today</span>
                        <div className="edi-stat-icon teal">
                            <Radio size={16} />
                        </div>
                    </div>
                    <div className="edi-stat-value">2,847</div>
                    <div className="edi-stat-change">+12% vs yesterday</div>
                </div>
                <div className="edi-stat-card">
                    <div className="edi-stat-header">
                        <span>Success Rate</span>
                        <div className="edi-stat-icon green">
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <div className="edi-stat-value">98.4%</div>
                    <div className="edi-stat-change">Above 95% target</div>
                </div>
                <div className="edi-stat-card">
                    <div className="edi-stat-header">
                        <span>Pending Review</span>
                        <div className="edi-stat-icon amber">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="edi-stat-value">23</div>
                    <div className="edi-stat-change">4 high priority</div>
                </div>
                <div className="edi-stat-card">
                    <div className="edi-stat-header">
                        <span>Error Rate</span>
                        <div className="edi-stat-icon red">
                            <AlertTriangle size={16} />
                        </div>
                    </div>
                    <div className="edi-stat-value">1.6%</div>
                    <div className="edi-stat-change">Below 3% threshold</div>
                </div>
            </motion.div>

            {/* Transaction Monitor */}
            <motion.div
                className="transaction-monitor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2>
                    <Radio size={20} />
                    EDI Transaction Monitor
                </h2>
                <div className="transaction-filters">
                    {(['all', '834', '835', '837'] as FilterType[]).map(filter => (
                        <button
                            key={filter}
                            className={`tx-filter-btn ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter === 'all' ? 'All Transactions' : `${filter} - ${filter === '834' ? 'Enrollment' : filter === '835' ? 'Remittance' : 'Claims'}`}
                        </button>
                    ))}
                </div>
                <table className="transaction-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Carrier</th>
                            <th>Timestamp</th>
                            <th>Records</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((tx) => (
                            <tr key={tx.id}>
                                <td>
                                    <span className={`tx-type-badge tx-${tx.type}`}>
                                        {tx.type}
                                    </span>
                                </td>
                                <td>{tx.carrier}</td>
                                <td>{tx.timestamp}</td>
                                <td>{tx.records.toLocaleString()}</td>
                                <td>
                                    <span className={`tx-status-badge ${tx.status}`}>
                                        {getStatusIcon(tx.status)}
                                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                    </span>
                                    {tx.errorMessage && (
                                        <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px' }}>
                                            {tx.errorMessage}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Rate Reconciliation */}
            <motion.div
                className="rate-reconciliation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2>
                    <DollarSign size={20} />
                    Rate Reconciliation
                </h2>
                <div className="reconciliation-grid">
                    {mockReconciliations.map((rec, index) => (
                        <motion.div
                            key={rec.id}
                            className="reconciliation-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <div className="reconciliation-header">
                                <h4>{rec.carrier}</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {rec.period}
                                </span>
                            </div>
                            <div className="reconciliation-amounts">
                                <div className="reconciliation-amount">
                                    <div className="reconciliation-amount-label">Invoiced</div>
                                    <div className="reconciliation-amount-value">
                                        {formatCurrency(rec.invoicedAmount)}
                                    </div>
                                </div>
                                <div className="reconciliation-amount">
                                    <div className="reconciliation-amount-label">Calculated</div>
                                    <div className="reconciliation-amount-value">
                                        {rec.calculatedAmount > 0 ? formatCurrency(rec.calculatedAmount) : 'Pending'}
                                    </div>
                                </div>
                            </div>
                            <div className="reconciliation-variance">
                                <span className="variance-label">Variance</span>
                                <span className={`variance-value ${rec.variance === 0 ? 'neutral' : rec.variance > 0 ? 'negative' : 'positive'}`}>
                                    {rec.variance === 0 ? 'Matched' : `${rec.variance > 0 ? '+' : ''}${formatCurrency(rec.variance)}`}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* SLA Tracker */}
            <motion.div
                className="sla-tracker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h2>
                    <Timer size={20} />
                    SLA Performance Tracker
                </h2>
                <div className="sla-cards">
                    {mockCarrierSLAs.map((sla, index) => (
                        <motion.div
                            key={sla.id}
                            className="sla-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <div className="sla-carrier-logo">{sla.logoInitials}</div>
                            <div className="sla-info">
                                <h4>{sla.carrier}</h4>
                                <p>{sla.type}</p>
                            </div>
                            <div className="sla-metrics">
                                <div className="sla-metric">
                                    <div className="sla-metric-value">{sla.avgResponseTime}</div>
                                    <div className="sla-metric-label">Avg Response</div>
                                </div>
                                <div className="sla-metric">
                                    <div className="sla-metric-value">{sla.slaTarget}</div>
                                    <div className="sla-metric-label">SLA Target</div>
                                </div>
                                <div className="sla-metric">
                                    <div className="sla-metric-value">{sla.compliance}%</div>
                                    <div className="sla-metric-label">Compliance</div>
                                </div>
                            </div>
                            <span className={`sla-status ${sla.status}`}>
                                {getSLAIcon(sla.status)}
                                {sla.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Vendor Scorecard */}
            <motion.div
                className="vendor-scorecard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2>
                    <Award size={20} />
                    Vendor Performance Scorecard
                </h2>
                <div className="scorecard-grid">
                    <div className="scorecard-card">
                        <h4>Blue Cross Blue Shield</h4>
                        <div className="scorecard-score excellent">A+</div>
                        <div className="scorecard-label">Excellent Performance</div>
                    </div>
                    <div className="scorecard-card">
                        <h4>Aetna</h4>
                        <div className="scorecard-score good">A</div>
                        <div className="scorecard-label">Good Performance</div>
                    </div>
                    <div className="scorecard-card">
                        <h4>UnitedHealthcare</h4>
                        <div className="scorecard-score average">B-</div>
                        <div className="scorecard-label">Needs Improvement</div>
                    </div>
                    <div className="scorecard-card">
                        <h4>Cigna</h4>
                        <div className="scorecard-score poor">C</div>
                        <div className="scorecard-label">Below Standard</div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
