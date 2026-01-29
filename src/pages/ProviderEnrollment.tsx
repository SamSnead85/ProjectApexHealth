import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    UserPlus,
    Building2,
    FileCheck,
    Calendar,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Search,
    Filter,
    Plus,
    ChevronRight
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './ProviderEnrollment.css'

interface EnrollmentApplication {
    id: string
    providerName: string
    practiceName: string
    npi: string
    specialty: string
    enrollmentType: 'initial' | 'revalidation' | 'change'
    status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'pending_info'
    submittedDate: string
    targetDate: string
}

const applications: EnrollmentApplication[] = [
    { id: 'ENR-001', providerName: 'Dr. Sarah Mitchell', practiceName: 'Metro Family Care', npi: '1234567890', specialty: 'Family Medicine', enrollmentType: 'initial', status: 'under_review', submittedDate: '2024-01-20', targetDate: '2024-02-20' },
    { id: 'ENR-002', providerName: 'Dr. James Chen', practiceName: 'Heart Health Associates', npi: '2345678901', specialty: 'Cardiology', enrollmentType: 'revalidation', status: 'approved', submittedDate: '2024-01-15', targetDate: '2024-02-15' },
    { id: 'ENR-003', providerName: 'Dr. Emily Roberts', practiceName: 'Pediatric Partners', npi: '3456789012', specialty: 'Pediatrics', enrollmentType: 'initial', status: 'pending_info', submittedDate: '2024-01-22', targetDate: '2024-02-22' },
    { id: 'ENR-004', providerName: 'Dr. Michael Torres', practiceName: 'Imaging Excellence', npi: '4567890123', specialty: 'Radiology', enrollmentType: 'change', status: 'submitted', submittedDate: '2024-01-25', targetDate: '2024-02-25' }
]

export function ProviderEnrollment() {
    const [allApplications] = useState<EnrollmentApplication[]>(applications)
    const [filterStatus, setFilterStatus] = useState('all')

    const getStatusBadge = (status: EnrollmentApplication['status']) => {
        switch (status) {
            case 'submitted': return <Badge variant="info">Submitted</Badge>
            case 'under_review': return <Badge variant="warning" icon={<Clock size={10} />}>Under Review</Badge>
            case 'approved': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Approved</Badge>
            case 'rejected': return <Badge variant="critical" icon={<AlertTriangle size={10} />}>Rejected</Badge>
            case 'pending_info': return <Badge variant="warning">Pending Info</Badge>
        }
    }

    const getTypeBadge = (type: EnrollmentApplication['enrollmentType']) => {
        const variants: Record<string, any> = {
            initial: 'teal',
            revalidation: 'purple',
            change: 'info'
        }
        return <Badge variant={variants[type]} size="sm">{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>
    }

    const filteredApplications = filterStatus === 'all'
        ? allApplications
        : allApplications.filter(a => a.status === filterStatus)

    return (
        <div className="provider-enrollment-page">
            {/* Header */}
            <div className="enrollment__header">
                <div>
                    <h1 className="enrollment__title">Provider Enrollment</h1>
                    <p className="enrollment__subtitle">
                        Manage provider network enrollment applications
                    </p>
                </div>
                <Button variant="primary" icon={<Plus size={16} />}>
                    Start Enrollment
                </Button>
            </div>

            {/* Stats */}
            <div className="enrollment__stats">
                <GlassCard className="stat-card">
                    <UserPlus size={24} />
                    <div>
                        <span className="stat-value">{allApplications.length}</span>
                        <span className="stat-label">Total Applications</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <Clock size={24} />
                    <div>
                        <span className="stat-value">{allApplications.filter(a => a.status === 'under_review').length}</span>
                        <span className="stat-label">In Progress</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <CheckCircle2 size={24} />
                    <div>
                        <span className="stat-value">{allApplications.filter(a => a.status === 'approved').length}</span>
                        <span className="stat-label">Approved</span>
                    </div>
                </GlassCard>
            </div>

            {/* Filters */}
            <div className="enrollment__filters">
                <div className="status-filters">
                    {['all', 'submitted', 'under_review', 'pending_info', 'approved'].map(status => (
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
                    <input type="text" placeholder="Search applications..." />
                </div>
            </div>

            {/* Applications List */}
            <GlassCard className="applications-list">
                {filteredApplications.map((app, index) => (
                    <motion.div
                        key={app.id}
                        className="application-item"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="application-item__info">
                            <div className="application-item__header">
                                <span className="provider-name">{app.providerName}</span>
                                {getTypeBadge(app.enrollmentType)}
                                {getStatusBadge(app.status)}
                            </div>
                            <div className="application-item__meta">
                                <span><Building2 size={12} /> {app.practiceName}</span>
                                <span>{app.specialty}</span>
                                <span>NPI: {app.npi}</span>
                            </div>
                        </div>
                        <div className="application-item__dates">
                            <div className="date-item">
                                <span className="date-label">Submitted</span>
                                <span className="date-value">{new Date(app.submittedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="date-item">
                                <span className="date-label">Target</span>
                                <span className="date-value">{new Date(app.targetDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="application-item__actions">
                            <Button variant="secondary" size="sm">View Details</Button>
                            <Button variant="ghost" size="sm" icon={<ChevronRight size={14} />} />
                        </div>
                    </motion.div>
                ))}
            </GlassCard>
        </div>
    )
}

export default ProviderEnrollment
