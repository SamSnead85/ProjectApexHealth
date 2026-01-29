import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign,
    FileText,
    Calendar,
    Building2,
    Plus,
    Edit3,
    Download,
    Search,
    Filter,
    History,
    CheckCircle2
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './FeeScheduleManagement.css'

interface FeeSchedule {
    id: string
    name: string
    payerId: string
    payerName: string
    type: 'medicare_based' | 'custom' | 'rbrvs'
    effectiveDate: string
    status: 'active' | 'draft' | 'pending_approval'
    procedureCount: number
    lastModified: string
}

const feeSchedules: FeeSchedule[] = [
    { id: 'FS-001', name: 'Medicare 2024 Fee Schedule', payerId: '00301', payerName: 'Medicare', type: 'medicare_based', effectiveDate: '2024-01-01', status: 'active', procedureCount: 8450, lastModified: '2024-01-15' },
    { id: 'FS-002', name: 'Aetna PPO Fee Schedule', payerId: '60054', payerName: 'Aetna', type: 'custom', effectiveDate: '2024-01-01', status: 'active', procedureCount: 4200, lastModified: '2024-01-10' },
    { id: 'FS-003', name: 'BCBS Premier Network', payerId: '00060', payerName: 'BCBS', type: 'rbrvs', effectiveDate: '2024-04-01', status: 'pending_approval', procedureCount: 3800, lastModified: '2024-01-20' },
    { id: 'FS-004', name: 'UHC Value Schedule', payerId: '87726', payerName: 'UnitedHealthcare', type: 'custom', effectiveDate: '2024-02-01', status: 'draft', procedureCount: 2100, lastModified: '2024-01-25' }
]

export function FeeScheduleManagement() {
    const [allSchedules] = useState<FeeSchedule[]>(feeSchedules)
    const [filterStatus, setFilterStatus] = useState('all')

    const getStatusBadge = (status: FeeSchedule['status']) => {
        switch (status) {
            case 'active': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Active</Badge>
            case 'draft': return <Badge variant="default">Draft</Badge>
            case 'pending_approval': return <Badge variant="warning">Pending Approval</Badge>
        }
    }

    const getTypeBadge = (type: FeeSchedule['type']) => {
        const variants: Record<string, any> = {
            medicare_based: 'teal',
            custom: 'purple',
            rbrvs: 'info'
        }
        return <Badge variant={variants[type]} size="sm">{type.replace('_', ' ').toUpperCase()}</Badge>
    }

    const filteredSchedules = filterStatus === 'all'
        ? allSchedules
        : allSchedules.filter(s => s.status === filterStatus)

    return (
        <div className="fee-schedule-page">
            {/* Header */}
            <div className="fee__header">
                <div>
                    <h1 className="fee__title">Fee Schedule Management</h1>
                    <p className="fee__subtitle">
                        Manage procedure rates and payer fee schedules
                    </p>
                </div>
                <Button variant="primary" icon={<Plus size={16} />}>
                    New Fee Schedule
                </Button>
            </div>

            {/* Stats */}
            <div className="fee__stats">
                <GlassCard className="stat-card">
                    <FileText size={24} />
                    <div>
                        <span className="stat-value">{allSchedules.length}</span>
                        <span className="stat-label">Total Schedules</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <CheckCircle2 size={24} />
                    <div>
                        <span className="stat-value">{allSchedules.filter(s => s.status === 'active').length}</span>
                        <span className="stat-label">Active</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <DollarSign size={24} />
                    <div>
                        <span className="stat-value">{allSchedules.reduce((acc, s) => acc + s.procedureCount, 0).toLocaleString()}</span>
                        <span className="stat-label">Total Procedures</span>
                    </div>
                </GlassCard>
            </div>

            {/* Filters */}
            <div className="fee__filters">
                <div className="status-filters">
                    {['all', 'active', 'draft', 'pending_approval'].map(status => (
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
                    <input type="text" placeholder="Search schedules..." />
                </div>
            </div>

            {/* Schedules List */}
            <div className="schedules-grid">
                {filteredSchedules.map((schedule, index) => (
                    <motion.div
                        key={schedule.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <GlassCard className="schedule-card">
                            <div className="schedule-card__header">
                                {getTypeBadge(schedule.type)}
                                {getStatusBadge(schedule.status)}
                            </div>
                            <h4 className="schedule-card__name">{schedule.name}</h4>
                            <div className="schedule-card__payer">
                                <Building2 size={14} />
                                <span>{schedule.payerName}</span>
                            </div>
                            <div className="schedule-card__details">
                                <div className="detail-item">
                                    <Calendar size={12} />
                                    <span>Effective: {new Date(schedule.effectiveDate).toLocaleDateString()}</span>
                                </div>
                                <div className="detail-item">
                                    <FileText size={12} />
                                    <span>{schedule.procedureCount.toLocaleString()} procedures</span>
                                </div>
                                <div className="detail-item">
                                    <History size={12} />
                                    <span>Modified: {new Date(schedule.lastModified).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="schedule-card__actions">
                                <Button variant="secondary" size="sm" icon={<Edit3 size={14} />}>Edit</Button>
                                <Button variant="ghost" size="sm" icon={<Download size={14} />}>Export</Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default FeeScheduleManagement
