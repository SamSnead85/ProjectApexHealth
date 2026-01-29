import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    UserCheck,
    FileCheck,
    Calendar,
    AlertTriangle,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    Download,
    Plus,
    Eye,
    Edit3,
    RefreshCw,
    GraduationCap,
    Award,
    Briefcase,
    Stethoscope
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './ProviderCredentialing.css'

interface CredentialApplication {
    id: string
    provider: {
        name: string
        npi: string
        specialty: string
        type: 'MD' | 'DO' | 'NP' | 'PA' | 'DDS' | 'DMD'
    }
    status: 'pending' | 'in_verification' | 'approved' | 'denied' | 'expired'
    submittedDate: string
    expirationDate?: string
    completionPercentage: number
    pendingItems: string[]
    assignee?: string
}

const mockApplications: CredentialApplication[] = [
    {
        id: 'CRED-2024-001',
        provider: { name: 'Dr. Robert Williams', npi: '1234567890', specialty: 'Internal Medicine', type: 'MD' },
        status: 'in_verification',
        submittedDate: '2024-01-15',
        completionPercentage: 75,
        pendingItems: ['Medical License Verification', 'Hospital Privileges'],
        assignee: 'Sarah Johnson'
    },
    {
        id: 'CRED-2024-002',
        provider: { name: 'Dr. Emily Davis', npi: '0987654321', specialty: 'Cardiology', type: 'MD' },
        status: 'pending',
        submittedDate: '2024-01-22',
        completionPercentage: 40,
        pendingItems: ['DEA Certificate', 'Board Certification', 'Malpractice Insurance']
    },
    {
        id: 'CRED-2023-089',
        provider: { name: 'James Martin, NP', npi: '1122334455', specialty: 'Family Medicine', type: 'NP' },
        status: 'approved',
        submittedDate: '2023-11-10',
        expirationDate: '2026-11-10',
        completionPercentage: 100,
        pendingItems: []
    },
    {
        id: 'CRED-2023-075',
        provider: { name: 'Dr. Susan Clark', npi: '5544332211', specialty: 'Psychiatry', type: 'DO' },
        status: 'expired',
        submittedDate: '2021-01-15',
        expirationDate: '2024-01-15',
        completionPercentage: 100,
        pendingItems: ['Recredentialing Required']
    }
]

const verificationChecklist = [
    { id: 'license', name: 'Medical License', required: true },
    { id: 'dea', name: 'DEA Certificate', required: true },
    { id: 'board', name: 'Board Certification', required: true },
    { id: 'education', name: 'Medical Education', required: true },
    { id: 'malpractice', name: 'Malpractice Insurance', required: true },
    { id: 'privileges', name: 'Hospital Privileges', required: false },
    { id: 'sanctions', name: 'NPDB/Sanctions Check', required: true },
    { id: 'work', name: 'Work History', required: true }
]

export function ProviderCredentialing() {
    const [applications] = useState<CredentialApplication[]>(mockApplications)
    const [activeView, setActiveView] = useState<'applications' | 'checklist'>('applications')

    const getStatusBadge = (status: CredentialApplication['status']) => {
        switch (status) {
            case 'pending': return <Badge variant="warning" icon={<Clock size={10} />}>Pending</Badge>
            case 'in_verification': return <Badge variant="info" icon={<RefreshCw size={10} />}>In Verification</Badge>
            case 'approved': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Approved</Badge>
            case 'denied': return <Badge variant="critical" icon={<XCircle size={10} />}>Denied</Badge>
            case 'expired': return <Badge variant="critical" icon={<AlertTriangle size={10} />}>Expired</Badge>
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'MD':
            case 'DO': return <Stethoscope size={16} />
            case 'NP':
            case 'PA': return <UserCheck size={16} />
            default: return <Award size={16} />
        }
    }

    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending' || a.status === 'in_verification').length,
        approved: applications.filter(a => a.status === 'approved').length,
        expiring: applications.filter(a => a.status === 'expired').length
    }

    return (
        <div className="provider-credentialing-page">
            {/* Header */}
            <div className="credentialing__header">
                <div>
                    <h1 className="credentialing__title">Provider Credentialing</h1>
                    <p className="credentialing__subtitle">
                        Manage provider applications and credential verification
                    </p>
                </div>
                <div className="credentialing__actions">
                    <Button variant="secondary" icon={<Download size={16} />}>
                        Export Report
                    </Button>
                    <Button variant="primary" icon={<Plus size={16} />}>
                        New Application
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="credentialing__stats">
                <MetricCard
                    title="Total Applications"
                    value={stats.total.toString()}
                    icon={<FileCheck size={20} />}
                />
                <MetricCard
                    title="Pending Review"
                    value={stats.pending.toString()}
                    icon={<Clock size={20} />}
                />
                <MetricCard
                    title="Active Credentials"
                    value={stats.approved.toString()}
                    change={{ value: 12, type: 'increase' }}
                    icon={<CheckCircle2 size={20} />}
                />
                <MetricCard
                    title="Expiring/Expired"
                    value={stats.expiring.toString()}
                    icon={<AlertTriangle size={20} />}
                />
            </div>

            {/* Tabs */}
            <div className="credentialing__tabs">
                <button
                    className={`credentialing__tab ${activeView === 'applications' ? 'active' : ''}`}
                    onClick={() => setActiveView('applications')}
                >
                    <FileCheck size={16} /> Applications
                </button>
                <button
                    className={`credentialing__tab ${activeView === 'checklist' ? 'active' : ''}`}
                    onClick={() => setActiveView('checklist')}
                >
                    <UserCheck size={16} /> Verification Checklist
                </button>
            </div>

            {/* Applications List */}
            {activeView === 'applications' && (
                <div className="credentialing__applications">
                    {applications.map((app, index) => (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className={`credential-card ${app.status === 'expired' ? 'expired' : ''}`}>
                                <div className="credential-card__header">
                                    <div className="credential-card__provider">
                                        <div className="credential-card__avatar">
                                            {getTypeIcon(app.provider.type)}
                                        </div>
                                        <div className="credential-card__info">
                                            <h3>{app.provider.name}</h3>
                                            <div className="credential-card__meta">
                                                <span>{app.provider.specialty}</span>
                                                <span className="npi">NPI: {app.provider.npi}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {getStatusBadge(app.status)}
                                </div>

                                <div className="credential-card__progress">
                                    <div className="progress-header">
                                        <span>Completion</span>
                                        <span>{app.completionPercentage}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-bar__fill"
                                            style={{ width: `${app.completionPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {app.pendingItems.length > 0 && (
                                    <div className="credential-card__pending">
                                        <span className="pending-label">Pending Items:</span>
                                        <div className="pending-items">
                                            {app.pendingItems.map((item, i) => (
                                                <Badge key={i} variant="warning" size="sm">{item}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="credential-card__footer">
                                    <div className="credential-card__dates">
                                        <span><Calendar size={12} /> Submitted: {new Date(app.submittedDate).toLocaleDateString()}</span>
                                        {app.expirationDate && (
                                            <span className={app.status === 'expired' ? 'expired' : ''}>
                                                <Clock size={12} /> Expires: {new Date(app.expirationDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="credential-card__actions">
                                        <Button variant="ghost" size="sm" icon={<Eye size={14} />}>View</Button>
                                        <Button variant="secondary" size="sm" icon={<Edit3 size={14} />}>Review</Button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Verification Checklist */}
            {activeView === 'checklist' && (
                <GlassCard className="verification-checklist">
                    <div className="verification-checklist__header">
                        <h3>Standard Verification Requirements</h3>
                        <p>NCQA and CMS compliant credentialing checklist</p>
                    </div>

                    <div className="verification-checklist__items">
                        {verificationChecklist.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className="checklist-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="checklist-item__icon">
                                    {item.id === 'education' && <GraduationCap size={18} />}
                                    {item.id === 'license' && <Award size={18} />}
                                    {item.id === 'work' && <Briefcase size={18} />}
                                    {!['education', 'license', 'work'].includes(item.id) && <FileCheck size={18} />}
                                </div>
                                <div className="checklist-item__info">
                                    <span className="checklist-item__name">{item.name}</span>
                                    <span className="checklist-item__status">
                                        {item.required ? 'Required' : 'Optional'}
                                    </span>
                                </div>
                                <Badge variant={item.required ? 'critical' : 'info'} size="sm">
                                    {item.required ? 'Required' : 'Optional'}
                                </Badge>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            )}
        </div>
    )
}

export default ProviderCredentialing
