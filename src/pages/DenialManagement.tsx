import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    AlertTriangle,
    RefreshCw,
    FileText,
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Filter,
    Search,
    Send
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './DenialManagement.css'

interface Denial {
    id: string
    claimId: string
    patientName: string
    denialCode: string
    denialReason: string
    amount: number
    deniedDate: string
    status: 'new' | 'in_review' | 'appealed' | 'overturned' | 'upheld'
    priority: 'high' | 'medium' | 'low'
    payer: string
}

const denials: Denial[] = [
    { id: 'DEN-001', claimId: 'CLM-2024-1234', patientName: 'John Smith', denialCode: 'CO-4', denialReason: 'Procedure code inconsistent with modifier', amount: 1250.00, deniedDate: '2024-01-20', status: 'new', priority: 'high', payer: 'Aetna' },
    { id: 'DEN-002', claimId: 'CLM-2024-1235', patientName: 'Maria Garcia', denialCode: 'CO-16', denialReason: 'Missing information or submission error', amount: 850.00, deniedDate: '2024-01-19', status: 'in_review', priority: 'medium', payer: 'BCBS' },
    { id: 'DEN-003', claimId: 'CLM-2024-1236', patientName: 'Robert Johnson', denialCode: 'CO-97', denialReason: 'Authorization requirement not met', amount: 3200.00, deniedDate: '2024-01-18', status: 'appealed', priority: 'high', payer: 'UnitedHealthcare' },
    { id: 'DEN-004', claimId: 'CLM-2024-1237', patientName: 'Sarah Wilson', denialCode: 'PR-1', denialReason: 'Deductible amount', amount: 500.00, deniedDate: '2024-01-17', status: 'upheld', priority: 'low', payer: 'Cigna' }
]

export function DenialManagement() {
    const [allDenials] = useState<Denial[]>(denials)
    const [selectedStatus, setSelectedStatus] = useState('all')

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

    const getStatusBadge = (status: Denial['status']) => {
        switch (status) {
            case 'new': return <Badge variant="critical" icon={<AlertTriangle size={10} />}>New</Badge>
            case 'in_review': return <Badge variant="warning" icon={<Clock size={10} />}>In Review</Badge>
            case 'appealed': return <Badge variant="info" icon={<Send size={10} />}>Appealed</Badge>
            case 'overturned': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Overturned</Badge>
            case 'upheld': return <Badge variant="critical" icon={<XCircle size={10} />}>Upheld</Badge>
        }
    }

    const getPriorityBadge = (priority: Denial['priority']) => {
        switch (priority) {
            case 'high': return <Badge variant="critical" size="sm">High</Badge>
            case 'medium': return <Badge variant="warning" size="sm">Medium</Badge>
            case 'low': return <Badge variant="default" size="sm">Low</Badge>
        }
    }

    const totalDenied = allDenials.reduce((acc, d) => acc + d.amount, 0)
    const filteredDenials = selectedStatus === 'all'
        ? allDenials
        : allDenials.filter(d => d.status === selectedStatus)

    return (
        <div className="denial-management-page">
            {/* Header */}
            <div className="denial__header">
                <div>
                    <h1 className="denial__title">Denial Management</h1>
                    <p className="denial__subtitle">
                        Track and manage claim denials and appeals
                    </p>
                </div>
                <Button variant="primary" icon={<RefreshCw size={16} />}>
                    Sync Denials
                </Button>
            </div>

            {/* Stats */}
            <div className="denial__stats">
                <GlassCard className="stat-card">
                    <AlertTriangle size={24} className="stat-icon critical" />
                    <div>
                        <span className="stat-value">{allDenials.filter(d => d.status === 'new').length}</span>
                        <span className="stat-label">New Denials</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <DollarSign size={24} className="stat-icon" />
                    <div>
                        <span className="stat-value">{formatCurrency(totalDenied)}</span>
                        <span className="stat-label">Total Denied</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <Send size={24} className="stat-icon info" />
                    <div>
                        <span className="stat-value">{allDenials.filter(d => d.status === 'appealed').length}</span>
                        <span className="stat-label">Appeals Pending</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <CheckCircle2 size={24} className="stat-icon success" />
                    <div>
                        <span className="stat-value">68%</span>
                        <span className="stat-label">Overturn Rate</span>
                    </div>
                </GlassCard>
            </div>

            {/* Filters */}
            <div className="denial__filters">
                <div className="status-filters">
                    {['all', 'new', 'in_review', 'appealed'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${selectedStatus === status ? 'active' : ''}`}
                            onClick={() => setSelectedStatus(status)}
                        >
                            {status === 'all' ? 'All' : status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
                <div className="search-box">
                    <Search size={16} />
                    <input type="text" placeholder="Search denials..." />
                </div>
            </div>

            {/* Denials List */}
            <GlassCard className="denials-list">
                {filteredDenials.map((denial, index) => (
                    <motion.div
                        key={denial.id}
                        className="denial-item"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                    >
                        <div className="denial-item__priority">
                            {getPriorityBadge(denial.priority)}
                        </div>
                        <div className="denial-item__content">
                            <div className="denial-item__header">
                                <span className="claim-id">{denial.claimId}</span>
                                <span className="denial-code">{denial.denialCode}</span>
                                {getStatusBadge(denial.status)}
                            </div>
                            <div className="denial-item__details">
                                <span className="patient-name">{denial.patientName}</span>
                                <span className="payer">{denial.payer}</span>
                            </div>
                            <p className="denial-reason">{denial.denialReason}</p>
                        </div>
                        <div className="denial-item__amount">
                            <span className="amount">{formatCurrency(denial.amount)}</span>
                            <span className="date">{new Date(denial.deniedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="denial-item__actions">
                            <Button variant="secondary" size="sm">Work Denial</Button>
                            <Button variant="ghost" size="sm" icon={<ChevronRight size={14} />} />
                        </div>
                    </motion.div>
                ))}
            </GlassCard>
        </div>
    )
}

export default DenialManagement
