import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FileText,
    DollarSign,
    Calendar,
    Building2,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    Clock,
    Edit3,
    Download,
    Send,
    Plus,
    Search
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './ContractNegotiation.css'

interface Contract {
    id: string
    payerName: string
    contractType: 'ppo' | 'hmo' | 'value_based' | 'capitation'
    status: 'draft' | 'negotiating' | 'pending_signature' | 'executed' | 'expired'
    currentRate: number
    proposedRate: number
    effectiveDate: string
    expirationDate: string | null
    negotiator: string
}

const contracts: Contract[] = [
    { id: 'NEG-001', payerName: 'Aetna', contractType: 'ppo', status: 'negotiating', currentRate: 115, proposedRate: 125, effectiveDate: '2024-04-01', expirationDate: '2026-03-31', negotiator: 'John Smith' },
    { id: 'NEG-002', payerName: 'Blue Cross Blue Shield', contractType: 'ppo', status: 'pending_signature', currentRate: 110, proposedRate: 120, effectiveDate: '2024-03-01', expirationDate: '2025-02-28', negotiator: 'Jane Doe' },
    { id: 'NEG-003', payerName: 'UnitedHealthcare', contractType: 'value_based', status: 'executed', currentRate: 100, proposedRate: 100, effectiveDate: '2024-01-01', expirationDate: '2025-12-31', negotiator: 'John Smith' },
    { id: 'NEG-004', payerName: 'Cigna', contractType: 'hmo', status: 'draft', currentRate: 0, proposedRate: 118, effectiveDate: '2024-06-01', expirationDate: null, negotiator: 'Jane Doe' }
]

export function ContractNegotiation() {
    const [allContracts] = useState<Contract[]>(contracts)
    const [filterStatus, setFilterStatus] = useState('all')

    const getStatusBadge = (status: Contract['status']) => {
        switch (status) {
            case 'draft': return <Badge variant="default">Draft</Badge>
            case 'negotiating': return <Badge variant="warning" icon={<Clock size={10} />}>Negotiating</Badge>
            case 'pending_signature': return <Badge variant="info">Pending Signature</Badge>
            case 'executed': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Executed</Badge>
            case 'expired': return <Badge variant="critical">Expired</Badge>
        }
    }

    const getTypeBadge = (type: Contract['contractType']) => {
        const variants: Record<string, any> = {
            ppo: 'teal',
            hmo: 'purple',
            value_based: 'info',
            capitation: 'warning'
        }
        return <Badge variant={variants[type]} size="sm">{type.replace('_', ' ').toUpperCase()}</Badge>
    }

    const filteredContracts = filterStatus === 'all'
        ? allContracts
        : allContracts.filter(c => c.status === filterStatus)

    return (
        <div className="contract-negotiation-page">
            {/* Header */}
            <div className="negotiation__header">
                <div>
                    <h1 className="negotiation__title">Contract Negotiation</h1>
                    <p className="negotiation__subtitle">
                        Manage payer contract terms and rate negotiations
                    </p>
                </div>
                <Button variant="primary" icon={<Plus size={16} />}>
                    New Contract
                </Button>
            </div>

            {/* Stats */}
            <div className="negotiation__stats">
                <GlassCard className="stat-card">
                    <Clock size={24} />
                    <div>
                        <span className="stat-value">{allContracts.filter(c => c.status === 'negotiating').length}</span>
                        <span className="stat-label">In Negotiation</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <Edit3 size={24} />
                    <div>
                        <span className="stat-value">{allContracts.filter(c => c.status === 'pending_signature').length}</span>
                        <span className="stat-label">Pending Signature</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <TrendingUp size={24} />
                    <div>
                        <span className="stat-value">+8.2%</span>
                        <span className="stat-label">Avg Rate Increase</span>
                    </div>
                </GlassCard>
            </div>

            {/* Filters */}
            <div className="negotiation__filters">
                <div className="status-filters">
                    {['all', 'draft', 'negotiating', 'pending_signature', 'executed'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === 'all' ? 'All' : status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
                <div className="search-box">
                    <Search size={16} />
                    <input type="text" placeholder="Search contracts..." />
                </div>
            </div>

            {/* Contracts Table */}
            <GlassCard className="contracts-table-card">
                <table className="contracts-table">
                    <thead>
                        <tr>
                            <th>Payer</th>
                            <th>Type</th>
                            <th>Current Rate</th>
                            <th>Proposed Rate</th>
                            <th>Change</th>
                            <th>Effective</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContracts.map((contract, index) => {
                            const rateChange = contract.currentRate > 0
                                ? ((contract.proposedRate - contract.currentRate) / contract.currentRate * 100).toFixed(1)
                                : 'New'
                            return (
                                <motion.tr
                                    key={contract.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <td>
                                        <div className="payer-info">
                                            <Building2 size={16} />
                                            <span>{contract.payerName}</span>
                                        </div>
                                    </td>
                                    <td>{getTypeBadge(contract.contractType)}</td>
                                    <td className="rate-cell">{contract.currentRate > 0 ? `${contract.currentRate}%` : '-'}</td>
                                    <td className="rate-cell proposed">{contract.proposedRate}%</td>
                                    <td className={`rate-change ${typeof rateChange === 'string' ? '' : parseFloat(rateChange) > 0 ? 'positive' : 'negative'}`}>
                                        {typeof rateChange === 'string' ? rateChange : `+${rateChange}%`}
                                    </td>
                                    <td>{new Date(contract.effectiveDate).toLocaleDateString()}</td>
                                    <td>{getStatusBadge(contract.status)}</td>
                                    <td>
                                        <div className="table-actions">
                                            <Button variant="ghost" size="sm" icon={<Edit3 size={14} />} />
                                            {contract.status === 'pending_signature' && (
                                                <Button variant="primary" size="sm" icon={<Send size={14} />}>Sign</Button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            )
                        })}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    )
}

export default ContractNegotiation
