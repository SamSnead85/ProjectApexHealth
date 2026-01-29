import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Shield,
    FileText,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Calendar,
    User,
    Building2,
    Edit3,
    Download,
    Send,
    Plus
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './ConsentManagement.css'

interface ConsentForm {
    id: string
    type: 'hipaa' | 'treatment' | 'research' | 'marketing' | 'proxy'
    title: string
    status: 'active' | 'expired' | 'pending' | 'revoked'
    signedDate: string | null
    expirationDate: string | null
    signedBy: string
    description: string
}

const consentForms: ConsentForm[] = [
    { id: 'CON-001', type: 'hipaa', title: 'HIPAA Authorization', status: 'active', signedDate: '2024-01-15', expirationDate: '2025-01-15', signedBy: 'John Smith', description: 'Authorization for use and disclosure of protected health information' },
    { id: 'CON-002', type: 'treatment', title: 'Consent to Treat', status: 'active', signedDate: '2024-01-15', expirationDate: null, signedBy: 'John Smith', description: 'General consent for medical treatment and procedures' },
    { id: 'CON-003', type: 'research', title: 'Research Participation', status: 'pending', signedDate: null, expirationDate: null, signedBy: '', description: 'Consent to participate in clinical research study XYZ-2024' },
    { id: 'CON-004', type: 'proxy', title: 'Healthcare Proxy', status: 'active', signedDate: '2023-06-01', expirationDate: null, signedBy: 'John Smith', description: 'Designation of healthcare proxy decision maker' },
    { id: 'CON-005', type: 'marketing', title: 'Marketing Communications', status: 'revoked', signedDate: '2023-01-01', expirationDate: null, signedBy: 'John Smith', description: 'Consent to receive marketing and promotional materials' }
]

export function ConsentManagement() {
    const [consents] = useState<ConsentForm[]>(consentForms)
    const [selectedConsent, setSelectedConsent] = useState<ConsentForm | null>(null)

    const getStatusBadge = (status: ConsentForm['status']) => {
        switch (status) {
            case 'active': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Active</Badge>
            case 'expired': return <Badge variant="warning" icon={<AlertTriangle size={10} />}>Expired</Badge>
            case 'pending': return <Badge variant="info" icon={<Clock size={10} />}>Pending</Badge>
            case 'revoked': return <Badge variant="critical">Revoked</Badge>
        }
    }

    const getTypeIcon = (type: ConsentForm['type']) => {
        switch (type) {
            case 'hipaa': return <Shield size={20} />
            case 'treatment': return <FileText size={20} />
            case 'research': return <FileText size={20} />
            case 'marketing': return <Send size={20} />
            case 'proxy': return <User size={20} />
        }
    }

    return (
        <div className="consent-management-page">
            {/* Header */}
            <div className="consent__header">
                <div>
                    <h1 className="consent__title">Consent Management</h1>
                    <p className="consent__subtitle">
                        Manage HIPAA authorizations and medical consent forms
                    </p>
                </div>
                <div className="consent__actions">
                    <Button variant="primary" icon={<Plus size={16} />}>
                        New Authorization
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="consent__summary">
                <GlassCard className="summary-card">
                    <div className="summary-card__icon active">
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="summary-card__content">
                        <span className="summary-card__value">{consents.filter(c => c.status === 'active').length}</span>
                        <span className="summary-card__label">Active Consents</span>
                    </div>
                </GlassCard>
                <GlassCard className="summary-card">
                    <div className="summary-card__icon pending">
                        <Clock size={20} />
                    </div>
                    <div className="summary-card__content">
                        <span className="summary-card__value">{consents.filter(c => c.status === 'pending').length}</span>
                        <span className="summary-card__label">Pending Signature</span>
                    </div>
                </GlassCard>
                <GlassCard className="summary-card">
                    <div className="summary-card__icon warning">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="summary-card__content">
                        <span className="summary-card__value">{consents.filter(c => c.status === 'expired').length}</span>
                        <span className="summary-card__label">Expired</span>
                    </div>
                </GlassCard>
            </div>

            {/* Consent List */}
            <GlassCard className="consent-list">
                <div className="consent-list__header">
                    <h3>Authorization Forms</h3>
                </div>

                <div className="consent-grid">
                    {consents.map((consent, index) => (
                        <motion.div
                            key={consent.id}
                            className={`consent-card ${selectedConsent?.id === consent.id ? 'selected' : ''}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedConsent(consent)}
                        >
                            <div className="consent-card__icon">
                                {getTypeIcon(consent.type)}
                            </div>
                            <div className="consent-card__content">
                                <div className="consent-card__header">
                                    <h4>{consent.title}</h4>
                                    {getStatusBadge(consent.status)}
                                </div>
                                <p className="consent-card__desc">{consent.description}</p>
                                <div className="consent-card__meta">
                                    {consent.signedDate && (
                                        <span>
                                            <Calendar size={12} />
                                            Signed: {new Date(consent.signedDate).toLocaleDateString()}
                                        </span>
                                    )}
                                    {consent.expirationDate && (
                                        <span>
                                            <Clock size={12} />
                                            Expires: {new Date(consent.expirationDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="consent-card__actions">
                                {consent.status === 'pending' ? (
                                    <Button variant="primary" size="sm">Sign Now</Button>
                                ) : consent.status === 'active' ? (
                                    <>
                                        <Button variant="ghost" size="sm" icon={<Download size={14} />} />
                                        <Button variant="ghost" size="sm" icon={<Edit3 size={14} />} />
                                    </>
                                ) : null}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </GlassCard>
        </div>
    )
}

export default ConsentManagement
