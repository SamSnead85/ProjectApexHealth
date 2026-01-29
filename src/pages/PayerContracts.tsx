import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FileText,
    DollarSign,
    Calendar,
    Building2,
    TrendingUp,
    Edit3,
    Download,
    Plus,
    Search,
    Filter,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './PayerContracts.css'

interface Contract {
    id: string
    payerName: string
    payerId: string
    type: 'ppo' | 'hmo' | 'medicare' | 'medicaid' | 'commercial'
    status: 'active' | 'pending' | 'expired' | 'terminated'
    effectiveDate: string
    terminationDate: string | null
    feeSchedule: string
    rateIncrease: number
}

const contracts: Contract[] = [
    { id: 'CON-001', payerName: 'Aetna', payerId: '60054', type: 'ppo', status: 'active', effectiveDate: '2024-01-01', terminationDate: '2025-12-31', feeSchedule: '120% Medicare', rateIncrease: 3.5 },
    { id: 'CON-002', payerName: 'Blue Cross Blue Shield', payerId: '00060', type: 'ppo', status: 'active', effectiveDate: '2024-01-01', terminationDate: '2024-12-31', feeSchedule: '115% Medicare', rateIncrease: 2.8 },
    { id: 'CON-003', payerName: 'United Healthcare', payerId: '87726', type: 'hmo', status: 'active', effectiveDate: '2023-07-01', terminationDate: '2025-06-30', feeSchedule: 'Custom Fee Schedule', rateIncrease: 4.2 },
    { id: 'CON-004', payerName: 'Medicare', payerId: '00301', type: 'medicare', status: 'active', effectiveDate: '2024-01-01', terminationDate: null, feeSchedule: 'CMS Fee Schedule', rateIncrease: 1.5 },
    { id: 'CON-005', payerName: 'Cigna', payerId: '62308', type: 'commercial', status: 'pending', effectiveDate: '2024-04-01', terminationDate: '2026-03-31', feeSchedule: '125% Medicare', rateIncrease: 5.0 }
]

export function PayerContracts() {
    const [allContracts] = useState<Contract[]>(contracts)

    const getStatusBadge = (status: Contract['status']) => {
        switch (status) {
            case 'active': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Active</Badge>
            case 'pending': return <Badge variant="warning">Pending</Badge>
            case 'expired': return <Badge variant="critical" icon={<AlertTriangle size={10} />}>Expired</Badge>
            case 'terminated': return <Badge variant="critical">Terminated</Badge>
        }
    }

    const getTypeBadge = (type: Contract['type']) => {
        const variants: Record<string, any> = {
            ppo: 'teal',
            hmo: 'purple',
            medicare: 'info',
            medicaid: 'info',
            commercial: 'default'
        }
        return <Badge variant={variants[type]} size="sm">{type.toUpperCase()}</Badge>
    }

    return (
        <div className="payer-contracts-page">
            {/* Header */}
            <div className="contracts__header">
                <div>
                    <h1 className="contracts__title">Payer Contracts</h1>
                    <p className="contracts__subtitle">
                        Manage payer agreements and fee schedules
                    </p>
                </div>
                <Button variant="primary" icon={<Plus size={16} />}>
                    New Contract
                </Button>
            </div>

            {/* Stats */}
            <div className="contracts__stats">
                <GlassCard className="stat-card">
                    <div className="stat-icon active">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <span className="stat-value">{allContracts.filter(c => c.status === 'active').length}</span>
                        <span className="stat-label">Active Contracts</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <div className="stat-icon pending">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <span className="stat-value">{allContracts.filter(c => c.status === 'pending').length}</span>
                        <span className="stat-label">Pending Activation</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <div className="stat-icon trending">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <span className="stat-value">{(allContracts.reduce((acc, c) => acc + c.rateIncrease, 0) / allContracts.length).toFixed(1)}%</span>
                        <span className="stat-label">Avg Rate Increase</span>
                    </div>
                </GlassCard>
            </div>

            {/* Contracts Table */}
            <GlassCard className="contracts-table-card">
                <div className="contracts-table__header">
                    <h3>All Contracts</h3>
                    <div className="table-actions">
                        <div className="search-box">
                            <Search size={16} />
                            <input type="text" placeholder="Search contracts..." />
                        </div>
                        <Button variant="ghost" size="sm" icon={<Filter size={14} />}>Filter</Button>
                    </div>
                </div>

                <table className="contracts-table">
                    <thead>
                        <tr>
                            <th>Payer</th>
                            <th>Type</th>
                            <th>Fee Schedule</th>
                            <th>Effective</th>
                            <th>Expires</th>
                            <th>Rate Increase</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allContracts.map((contract, index) => (
                            <motion.tr
                                key={contract.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <td>
                                    <div className="payer-info">
                                        <Building2 size={16} />
                                        <div>
                                            <span className="payer-name">{contract.payerName}</span>
                                            <span className="payer-id">ID: {contract.payerId}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{getTypeBadge(contract.type)}</td>
                                <td className="fee-schedule">{contract.feeSchedule}</td>
                                <td>{new Date(contract.effectiveDate).toLocaleDateString()}</td>
                                <td>{contract.terminationDate ? new Date(contract.terminationDate).toLocaleDateString() : 'Ongoing'}</td>
                                <td className="rate-increase">+{contract.rateIncrease}%</td>
                                <td>{getStatusBadge(contract.status)}</td>
                                <td>
                                    <div className="table-row-actions">
                                        <Button variant="ghost" size="sm" icon={<Edit3 size={14} />} />
                                        <Button variant="ghost" size="sm" icon={<Download size={14} />} />
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

export default PayerContracts
