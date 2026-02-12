import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Shield,
    CheckCircle2,
    Award,
    Lock,
    FileCheck,
    AlertCircle,
    ExternalLink,
    Download,
    Calendar,
    Clock,
    Sparkles,
    TrendingUp
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './CertificationHub.css'

interface Certification {
    id: string
    name: string
    issuer: string
    status: 'active' | 'pending' | 'renewing'
    validUntil: string
    score?: number
    icon: React.ReactNode
    description: string
}

interface ComplianceArea {
    id: string
    name: string
    status: 'compliant' | 'at_risk' | 'non_compliant'
    score: number
    lastAudit: string
    requirements: number
    met: number
}

const certifications: Certification[] = [
    {
        id: 'hipaa',
        name: 'HIPAA',
        issuer: 'HHS Office for Civil Rights',
        status: 'active',
        validUntil: '2026-12-31',
        score: 98,
        icon: <Shield size={24} />,
        description: 'Health Insurance Portability and Accountability Act compliance'
    },
    {
        id: 'soc2',
        name: 'SOC 2 Type II',
        issuer: 'AICPA',
        status: 'active',
        validUntil: '2026-08-15',
        score: 100,
        icon: <Lock size={24} />,
        description: 'Service Organization Control 2 - Security, Availability, Confidentiality'
    },
    {
        id: 'hitrust',
        name: 'HITRUST CSF',
        issuer: 'HITRUST Alliance',
        status: 'active',
        validUntil: '2027-03-20',
        score: 96,
        icon: <Award size={24} />,
        description: 'Healthcare Information Trust Alliance Common Security Framework'
    },
    {
        id: 'cms',
        name: 'CMS Certified',
        issuer: 'Centers for Medicare & Medicaid',
        status: 'active',
        validUntil: '2026-06-30',
        icon: <FileCheck size={24} />,
        description: 'Approved for Enhanced Direct Enrollment pathway'
    }
]

const complianceAreas: ComplianceArea[] = [
    { id: 'data-protection', name: 'Data Protection', status: 'compliant', score: 98, lastAudit: '2025-12-15', requirements: 45, met: 45 },
    { id: 'access-control', name: 'Access Control', status: 'compliant', score: 100, lastAudit: '2025-12-10', requirements: 32, met: 32 },
    { id: 'encryption', name: 'Encryption Standards', status: 'compliant', score: 100, lastAudit: '2025-11-28', requirements: 18, met: 18 },
    { id: 'incident-response', name: 'Incident Response', status: 'compliant', score: 95, lastAudit: '2025-12-01', requirements: 24, met: 23 },
    { id: 'audit-logging', name: 'Audit Logging', status: 'compliant', score: 100, lastAudit: '2025-12-18', requirements: 28, met: 28 },
    { id: 'vendor-management', name: 'Vendor Management', status: 'compliant', score: 92, lastAudit: '2025-11-15', requirements: 15, met: 14 }
]

const auditTimeline = [
    { date: '2025-12-18', event: 'Quarterly Audit Logging Review', status: 'passed', auditor: 'Internal Security' },
    { date: '2025-12-15', event: 'HIPAA Annual Assessment', status: 'passed', auditor: 'Third-Party Auditor' },
    { date: '2025-12-01', event: 'Incident Response Drill', status: 'passed', auditor: 'Security Operations' },
    { date: '2025-11-28', event: 'Encryption Standards Review', status: 'passed', auditor: 'Cryptography Team' },
    { date: '2025-11-15', event: 'Vendor Security Assessment', status: 'passed', auditor: 'Procurement Security' }
]

export function CertificationHub() {
    const [selectedCert, setSelectedCert] = useState<string | null>(null)

    const overallScore = Math.round(
        complianceAreas.reduce((acc, area) => acc + area.score, 0) / complianceAreas.length
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'compliant':
            case 'passed':
                return 'success'
            case 'pending':
            case 'at_risk':
                return 'warning'
            case 'renewing':
                return 'info'
            default:
                return 'critical'
        }
    }

    return (
        <div className="certification-hub">
            {/* Header */}
            <div className="certification-hub__header">
                <div className="certification-hub__header-content">
                    <Badge variant="teal" dot pulse>
                        <Shield size={12} />
                        Trust Center
                    </Badge>
                    <h1>Certification & Compliance Hub</h1>
                    <p>Enterprise-grade security and regulatory compliance</p>
                </div>
                <div className="certification-hub__overall-score">
                    <div className="score-ring">
                        <svg viewBox="0 0 100 100">
                            <circle
                                cx="50" cy="50" r="45"
                                fill="none"
                                stroke="rgba(0,0,0,0.08)"
                                strokeWidth="6"
                            />
                            <motion.circle
                                cx="50" cy="50" r="45"
                                fill="none"
                                stroke="#22C55E"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${overallScore * 2.83} 283`}
                                transform="rotate(-90 50 50)"
                                initial={{ strokeDasharray: '0 283' }}
                                animate={{ strokeDasharray: `${overallScore * 2.83} 283` }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                            />
                        </svg>
                        <div className="score-ring__value">
                            <span className="score-ring__number">{overallScore}%</span>
                            <span className="score-ring__label">Compliant</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Certifications Grid */}
            <section className="certification-hub__section">
                <h2 className="section-title">
                    <Award size={20} />
                    Active Certifications
                </h2>
                <div className="certifications__grid">
                    {certifications.map((cert, index) => (
                        <motion.div
                            key={cert.id}
                            className={`certification-card ${selectedCert === cert.id ? 'certification-card--selected' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedCert(selectedCert === cert.id ? null : cert.id)}
                        >
                            <div className="certification-card__icon">{cert.icon}</div>
                            <div className="certification-card__content">
                                <div className="certification-card__header">
                                    <span className="certification-card__name">{cert.name}</span>
                                    <Badge variant={getStatusColor(cert.status)}>
                                        {cert.status === 'active' && <CheckCircle2 size={10} />}
                                        {cert.status}
                                    </Badge>
                                </div>
                                <span className="certification-card__issuer">{cert.issuer}</span>
                                <p className="certification-card__description">{cert.description}</p>
                                <div className="certification-card__footer">
                                    <span className="certification-card__valid">
                                        <Calendar size={12} />
                                        Valid until {new Date(cert.validUntil).toLocaleDateString()}
                                    </span>
                                    {cert.score && (
                                        <span className="certification-card__score">
                                            <TrendingUp size={12} />
                                            {cert.score}% score
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Compliance Areas */}
            <section className="certification-hub__section">
                <h2 className="section-title">
                    <FileCheck size={20} />
                    Compliance Areas
                </h2>
                <GlassCard className="compliance-areas__card">
                    <div className="compliance-areas__grid">
                        {complianceAreas.map((area, index) => (
                            <motion.div
                                key={area.id}
                                className="compliance-area"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="compliance-area__info">
                                    <span className="compliance-area__name">{area.name}</span>
                                    <div className="compliance-area__meta">
                                        <Badge variant={getStatusColor(area.status)} size="sm">
                                            {area.status === 'compliant' && <CheckCircle2 size={8} />}
                                            {area.met}/{area.requirements} met
                                        </Badge>
                                        <span className="compliance-area__audit">
                                            Last audit: {new Date(area.lastAudit).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="compliance-area__score">
                                    <div className="compliance-area__bar">
                                        <motion.div
                                            className="compliance-area__bar-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${area.score}%` }}
                                            transition={{ duration: 0.8, delay: index * 0.1 }}
                                        />
                                    </div>
                                    <span className="compliance-area__percentage">{area.score}%</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </section>

            {/* Audit Timeline */}
            <section className="certification-hub__section">
                <h2 className="section-title">
                    <Clock size={20} />
                    Recent Audit History
                </h2>
                <GlassCard className="audit-timeline__card">
                    <div className="audit-timeline">
                        {auditTimeline.map((event, index) => (
                            <motion.div
                                key={index}
                                className="audit-event"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="audit-event__dot">
                                    <CheckCircle2 size={12} />
                                </div>
                                <div className="audit-event__content">
                                    <span className="audit-event__title">{event.event}</span>
                                    <span className="audit-event__meta">
                                        {event.auditor} • {new Date(event.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <Badge variant="success">Passed</Badge>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </section>

            {/* Actions */}
            <GlassCard className="certification-hub__actions">
                <div className="actions__content">
                    <Sparkles size={20} className="text-teal" />
                    <div>
                        <h3>Security Documentation</h3>
                        <p>Access detailed compliance reports and security whitepapers</p>
                    </div>
                </div>
                <div className="actions__buttons">
                    <Button variant="secondary" icon={<Download size={16} />}>
                        Download SOC 2 Report
                    </Button>
                    <Button variant="secondary" icon={<ExternalLink size={16} />}>
                        View Security Portal
                    </Button>
                </div>
            </GlassCard>
        </div>
    )
}

export default CertificationHub
