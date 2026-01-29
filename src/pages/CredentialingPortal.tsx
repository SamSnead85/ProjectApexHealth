import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FileCheck,
    User,
    Building2,
    Calendar,
    Clock,
    CheckCircle2,
    AlertTriangle,
    FileText,
    Upload,
    Search,
    Filter,
    Plus,
    ChevronRight
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './CredentialingPortal.css'

interface CredentialingApplication {
    id: string
    providerName: string
    npi: string
    specialty: string
    status: 'pending_documents' | 'under_review' | 'approved' | 'rejected' | 'expired'
    submittedDate: string
    lastUpdated: string
    completionPercentage: number
}

const applications: CredentialingApplication[] = [
    { id: 'CRED-001', providerName: 'Dr. Sarah Mitchell', npi: '1234567890', specialty: 'Family Medicine', status: 'approved', submittedDate: '2024-01-10', lastUpdated: '2024-01-20', completionPercentage: 100 },
    { id: 'CRED-002', providerName: 'Dr. James Chen', npi: '2345678901', specialty: 'Cardiology', status: 'under_review', submittedDate: '2024-01-15', lastUpdated: '2024-01-25', completionPercentage: 85 },
    { id: 'CRED-003', providerName: 'Dr. Emily Roberts', npi: '3456789012', specialty: 'Pediatrics', status: 'pending_documents', submittedDate: '2024-01-20', lastUpdated: '2024-01-22', completionPercentage: 45 },
    { id: 'CRED-004', providerName: 'Dr. Michael Torres', npi: '4567890123', specialty: 'Radiology', status: 'expired', submittedDate: '2023-06-01', lastUpdated: '2024-01-01', completionPercentage: 100 }
]

export function CredentialingPortal() {
    const [allApplications] = useState<CredentialingApplication[]>(applications)
    const [filterStatus, setFilterStatus] = useState('all')

    const getStatusBadge = (status: CredentialingApplication['status']) => {
        switch (status) {
            case 'approved': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Approved</Badge>
            case 'under_review': return <Badge variant="warning" icon={<Clock size={10} />}>Under Review</Badge>
            case 'pending_documents': return <Badge variant="info">Pending Documents</Badge>
            case 'rejected': return <Badge variant="critical" icon={<AlertTriangle size={10} />}>Rejected</Badge>
            case 'expired': return <Badge variant="critical">Expired</Badge>
        }
    }

    const filteredApplications = filterStatus === 'all'
        ? allApplications
        : allApplications.filter(a => a.status === filterStatus)

    return (
        <div className="credentialing-portal-page">
            {/* Header */}
            <div className="credentialing__header">
                <div>
                    <h1 className="credentialing__title">Credentialing Portal</h1>
                    <p className="credentialing__subtitle">
                        Provider credentialing and verification management
                    </p>
                </div>
                <Button variant="primary" icon={<Plus size={16} />}>
                    New Application
                </Button>
            </div>

            {/* Stats */}
            <div className="credentialing__stats">
                <GlassCard className="stat-card">
                    <FileCheck size={24} />
                    <div>
                        <span className="stat-value">{allApplications.filter(a => a.status === 'approved').length}</span>
                        <span className="stat-label">Approved</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <Clock size={24} />
                    <div>
                        <span className="stat-value">{allApplications.filter(a => a.status === 'under_review').length}</span>
                        <span className="stat-label">Under Review</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <FileText size={24} />
                    <div>
                        <span className="stat-value">{allApplications.filter(a => a.status === 'pending_documents').length}</span>
                        <span className="stat-label">Pending Documents</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <AlertTriangle size={24} />
                    <div>
                        <span className="stat-value">{allApplications.filter(a => a.status === 'expired').length}</span>
                        <span className="stat-label">Expired</span>
                    </div>
                </GlassCard>
            </div>

            {/* Filters */}
            <div className="credentialing__filters">
                <div className="status-filters">
                    {['all', 'pending_documents', 'under_review', 'approved', 'expired'].map(status => (
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
                    <input type="text" placeholder="Search providers..." />
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
                        <div className="application-item__avatar">
                            <User size={20} />
                        </div>
                        <div className="application-item__info">
                            <div className="application-item__header">
                                <span className="provider-name">{app.providerName}</span>
                                {getStatusBadge(app.status)}
                            </div>
                            <div className="application-item__meta">
                                <span><Building2 size={12} /> {app.specialty}</span>
                                <span>NPI: {app.npi}</span>
                            </div>
                        </div>
                        <div className="application-item__progress">
                            <div className="progress-label">
                                <span>Completion</span>
                                <span>{app.completionPercentage}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${app.completionPercentage}%` }} />
                            </div>
                        </div>
                        <div className="application-item__dates">
                            <div className="date-row">
                                <Calendar size={12} />
                                <span>Submitted: {new Date(app.submittedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="date-row">
                                <Clock size={12} />
                                <span>Updated: {new Date(app.lastUpdated).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="application-item__actions">
                            <Button variant="secondary" size="sm">View Details</Button>
                            {app.status === 'pending_documents' && (
                                <Button variant="primary" size="sm" icon={<Upload size={12} />}>Upload</Button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </GlassCard>
        </div>
    )
}

export default CredentialingPortal
