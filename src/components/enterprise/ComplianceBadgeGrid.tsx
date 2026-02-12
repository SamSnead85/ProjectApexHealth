import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Shield,
    Lock,
    CheckCircle2,
    Award,
    FileCheck,
    Server,
    Eye,
    AlertTriangle,
    Clock,
    TrendingUp,
    Calendar,
    ExternalLink
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './ComplianceBadgeGrid.css'

// Compliance certification data
interface Certification {
    id: string
    name: string
    fullName: string
    icon: React.ReactNode
    status: 'active' | 'pending' | 'expired'
    issuedDate: string
    expiryDate: string
    issuer: string
    description: string
    category: 'security' | 'privacy' | 'healthcare' | 'industry'
}

const certifications: Certification[] = [
    {
        id: 'soc2',
        name: 'SOC 2 Type II',
        fullName: 'Service Organization Control 2 Type II',
        icon: <Shield size={28} />,
        status: 'active',
        issuedDate: '2024-01-15',
        expiryDate: '2025-01-15',
        issuer: 'Deloitte',
        description: 'Comprehensive audit of security, availability, processing integrity, confidentiality, and privacy controls.',
        category: 'security'
    },
    {
        id: 'hipaa',
        name: 'HIPAA',
        fullName: 'Health Insurance Portability and Accountability Act',
        icon: <Lock size={28} />,
        status: 'active',
        issuedDate: '2024-02-01',
        expiryDate: '2025-02-01',
        issuer: 'HITRUST Alliance',
        description: 'Full compliance with healthcare data privacy and security requirements.',
        category: 'healthcare'
    },
    {
        id: 'hitrust',
        name: 'HITRUST CSF',
        fullName: 'HITRUST Common Security Framework',
        icon: <Award size={28} />,
        status: 'active',
        issuedDate: '2024-03-01',
        expiryDate: '2026-03-01',
        issuer: 'HITRUST',
        description: 'Industry-leading healthcare security certification combining ISO, NIST, HIPAA, and more.',
        category: 'healthcare'
    },
    {
        id: 'iso27001',
        name: 'ISO 27001',
        fullName: 'ISO/IEC 27001:2022',
        icon: <FileCheck size={28} />,
        status: 'active',
        issuedDate: '2023-11-01',
        expiryDate: '2026-11-01',
        issuer: 'BSI Group',
        description: 'International standard for information security management systems.',
        category: 'security'
    },
    {
        id: 'gdpr',
        name: 'GDPR',
        fullName: 'General Data Protection Regulation',
        icon: <Eye size={28} />,
        status: 'active',
        issuedDate: '2024-01-01',
        expiryDate: '2025-01-01',
        issuer: 'EU Authorities',
        description: 'European Union data protection and privacy regulation compliance.',
        category: 'privacy'
    },
    {
        id: 'pci',
        name: 'PCI DSS',
        fullName: 'Payment Card Industry Data Security Standard',
        icon: <Server size={28} />,
        status: 'active',
        issuedDate: '2024-04-01',
        expiryDate: '2025-04-01',
        issuer: 'PCI SSC',
        description: 'Level 1 merchant certification for payment card data security.',
        category: 'security'
    }
]

// Audit history data
interface AuditEvent {
    id: string
    date: string
    type: 'audit' | 'assessment' | 'renewal' | 'update'
    title: string
    result: 'passed' | 'in-progress' | 'scheduled'
    auditor: string
}

const auditHistory: AuditEvent[] = [
    {
        id: 'audit-1',
        date: '2024-01-15',
        type: 'audit',
        title: 'SOC 2 Type II Annual Audit',
        result: 'passed',
        auditor: 'Deloitte'
    },
    {
        id: 'audit-2',
        date: '2024-02-01',
        type: 'assessment',
        title: 'HIPAA Security Risk Assessment',
        result: 'passed',
        auditor: 'HITRUST Alliance'
    },
    {
        id: 'audit-3',
        date: '2024-03-15',
        type: 'renewal',
        title: 'HITRUST CSF Certification Renewal',
        result: 'passed',
        auditor: 'HITRUST'
    },
    {
        id: 'audit-4',
        date: '2024-06-01',
        type: 'audit',
        title: 'Q2 Internal Security Audit',
        result: 'in-progress',
        auditor: 'Internal Security Team'
    },
    {
        id: 'audit-5',
        date: '2024-09-15',
        type: 'audit',
        title: 'SOC 2 Readiness Assessment',
        result: 'scheduled',
        auditor: 'Deloitte'
    }
]

export function ComplianceBadgeGrid() {
    const [selectedCert, setSelectedCert] = useState<Certification | null>(null)
    const [activeCategory, setActiveCategory] = useState<string>('all')

    const categories = [
        { id: 'all', label: 'All Certifications' },
        { id: 'security', label: 'Security' },
        { id: 'healthcare', label: 'Healthcare' },
        { id: 'privacy', label: 'Privacy' }
    ]

    const filteredCerts = activeCategory === 'all'
        ? certifications
        : certifications.filter(c => c.category === activeCategory)

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success'
            case 'pending': return 'warning'
            case 'expired': return 'critical'
            default: return 'info'
        }
    }

    const getResultBadge = (result: string) => {
        switch (result) {
            case 'passed':
                return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Passed</Badge>
            case 'in-progress':
                return <Badge variant="warning" icon={<Clock size={10} />}>In Progress</Badge>
            case 'scheduled':
                return <Badge variant="info" icon={<Calendar size={10} />}>Scheduled</Badge>
            default:
                return null
        }
    }

    // Calculate compliance score
    const complianceScore = Math.round(
        (certifications.filter(c => c.status === 'active').length / certifications.length) * 100
    )

    return (
        <div className="compliance-badge-grid">
            {/* Section Header */}
            <div className="compliance-header">
                <div className="compliance-header__content">
                    <Badge variant="success" icon={<Shield size={12} />}>Security First</Badge>
                    <h2 className="compliance-header__title">Trust & Compliance</h2>
                    <p className="compliance-header__subtitle">
                        Industry-leading security certifications and compliance standards
                    </p>
                </div>

                {/* Compliance Score Widget */}
                <div className="compliance-score-widget">
                    <div className="compliance-score__ring">
                        <svg viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="rgba(0,0,0,0.08)"
                                strokeWidth="8"
                            />
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="url(#scoreGradient)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${complianceScore * 2.83} 283`}
                                initial={{ strokeDasharray: '0 283' }}
                                animate={{ strokeDasharray: `${complianceScore * 2.83} 283` }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                transform="rotate(-90 50 50)"
                            />
                            <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#14b8a6" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="compliance-score__value">
                            <span className="compliance-score__number">{complianceScore}</span>
                            <span className="compliance-score__percent">%</span>
                        </div>
                    </div>
                    <div className="compliance-score__label">
                        <span>Compliance Score</span>
                        <TrendingUp size={14} />
                    </div>
                </div>
            </div>

            {/* Category Filters */}
            <div className="compliance-filters">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`compliance-filter ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Certification Grid */}
            <div className="certification-grid">
                {filteredCerts.map((cert, index) => (
                    <motion.div
                        key={cert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedCert(cert)}
                    >
                        <GlassCard className={`certification-card ${selectedCert?.id === cert.id ? 'selected' : ''}`}>
                            <div className="certification-card__icon">
                                {cert.icon}
                            </div>
                            <div className="certification-card__content">
                                <h3 className="certification-card__name">{cert.name}</h3>
                                <p className="certification-card__issuer">{cert.issuer}</p>
                            </div>
                            <Badge variant={getStatusColor(cert.status) as any} size="sm">
                                {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                            </Badge>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Selected Certification Detail */}
            {selectedCert && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="certification-detail"
                >
                    <GlassCard className="certification-detail__card">
                        <div className="certification-detail__header">
                            <div className="certification-detail__icon">
                                {selectedCert.icon}
                            </div>
                            <div>
                                <h3>{selectedCert.fullName}</h3>
                                <p className="certification-detail__issuer">Issued by {selectedCert.issuer}</p>
                            </div>
                            <Badge variant={getStatusColor(selectedCert.status) as any} size="sm">
                                {selectedCert.status.charAt(0).toUpperCase() + selectedCert.status.slice(1)}
                            </Badge>
                        </div>

                        <p className="certification-detail__description">{selectedCert.description}</p>

                        <div className="certification-detail__dates">
                            <div className="certification-date">
                                <span className="certification-date__label">Issued</span>
                                <span className="certification-date__value">{formatDate(selectedCert.issuedDate)}</span>
                            </div>
                            <div className="certification-date">
                                <span className="certification-date__label">Expires</span>
                                <span className="certification-date__value">{formatDate(selectedCert.expiryDate)}</span>
                            </div>
                        </div>

                        <Button variant="ghost" size="sm" icon={<ExternalLink size={14} />}>
                            View Certificate
                        </Button>
                    </GlassCard>
                </motion.div>
            )}

            {/* Audit History Timeline */}
            <div className="audit-history">
                <h3 className="audit-history__title">
                    <Clock size={18} />
                    Audit History
                </h3>
                <div className="audit-timeline">
                    {auditHistory.map((event, index) => (
                        <motion.div
                            key={event.id}
                            className="audit-event"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="audit-event__marker" />
                            <div className="audit-event__content">
                                <div className="audit-event__header">
                                    <span className="audit-event__date">{formatDate(event.date)}</span>
                                    {getResultBadge(event.result)}
                                </div>
                                <h4 className="audit-event__title">{event.title}</h4>
                                <span className="audit-event__auditor">{event.auditor}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ComplianceBadgeGrid
