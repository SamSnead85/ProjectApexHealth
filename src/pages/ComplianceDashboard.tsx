import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Shield,
    FileText,
    AlertTriangle,
    CheckCircle2,
    Clock,
    XCircle,
    Calendar,
    Download,
    Users,
    Lock,
    Eye,
    Activity,
    FileWarning,
    Scale,
    Briefcase
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './ComplianceDashboard.css'

interface ComplianceItem {
    id: string
    category: string
    requirement: string
    status: 'compliant' | 'at_risk' | 'non_compliant' | 'pending'
    dueDate: string
    owner: string
    lastReview: string
    evidence: number
}

interface AuditItem {
    id: string
    type: 'internal' | 'external' | 'regulatory'
    name: string
    status: 'scheduled' | 'in_progress' | 'completed' | 'findings'
    date: string
    findings?: number
}

const complianceItems: ComplianceItem[] = [
    { id: 'HIPAA-001', category: 'HIPAA', requirement: 'Privacy Rule Compliance', status: 'compliant', dueDate: '2024-12-31', owner: 'Privacy Officer', lastReview: '2024-01-15', evidence: 12 },
    { id: 'HIPAA-002', category: 'HIPAA', requirement: 'Security Rule Assessment', status: 'compliant', dueDate: '2024-06-30', owner: 'CISO', lastReview: '2024-01-10', evidence: 8 },
    { id: 'CMS-001', category: 'CMS', requirement: 'MLR Reporting', status: 'at_risk', dueDate: '2024-06-01', owner: 'Finance Director', lastReview: '2024-01-20', evidence: 5 },
    { id: 'SOC2-001', category: 'SOC 2', requirement: 'Type II Audit', status: 'pending', dueDate: '2024-09-30', owner: 'Compliance Team', lastReview: '2023-12-01', evidence: 15 },
    { id: 'ACA-001', category: 'ACA', requirement: 'Essential Health Benefits', status: 'compliant', dueDate: '2024-12-31', owner: 'Product Team', lastReview: '2024-01-05', evidence: 10 }
]

const auditItems: AuditItem[] = [
    { id: 'AUD-001', type: 'external', name: 'Annual Financial Audit', status: 'in_progress', date: '2024-02-15' },
    { id: 'AUD-002', type: 'regulatory', name: 'DOI Market Conduct Exam', status: 'scheduled', date: '2024-04-01' },
    { id: 'AUD-003', type: 'internal', name: 'Claims Processing Review', status: 'completed', date: '2024-01-10', findings: 3 },
    { id: 'AUD-004', type: 'external', name: 'SOC 2 Type II', status: 'scheduled', date: '2024-09-15' }
]

export function ComplianceDashboard() {
    const [compliance] = useState<ComplianceItem[]>(complianceItems)
    const [audits] = useState<AuditItem[]>(auditItems)

    const getStatusBadge = (status: ComplianceItem['status']) => {
        switch (status) {
            case 'compliant': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Compliant</Badge>
            case 'at_risk': return <Badge variant="warning" icon={<AlertTriangle size={10} />}>At Risk</Badge>
            case 'non_compliant': return <Badge variant="critical" icon={<XCircle size={10} />}>Non Compliant</Badge>
            case 'pending': return <Badge variant="info" icon={<Clock size={10} />}>Pending Review</Badge>
        }
    }

    const getAuditStatusBadge = (status: AuditItem['status']) => {
        switch (status) {
            case 'scheduled': return <Badge variant="info">Scheduled</Badge>
            case 'in_progress': return <Badge variant="warning">In Progress</Badge>
            case 'completed': return <Badge variant="success">Completed</Badge>
            case 'findings': return <Badge variant="critical">Findings</Badge>
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'HIPAA': return <Lock size={14} />
            case 'CMS': return <Scale size={14} />
            case 'SOC 2': return <Shield size={14} />
            case 'ACA': return <Briefcase size={14} />
            default: return <FileText size={14} />
        }
    }

    const stats = {
        compliant: compliance.filter(c => c.status === 'compliant').length,
        atRisk: compliance.filter(c => c.status === 'at_risk').length,
        pending: compliance.filter(c => c.status === 'pending').length,
        total: compliance.length
    }

    return (
        <div className="compliance-dashboard-page">
            {/* Header */}
            <div className="compliance__header">
                <div>
                    <h1 className="compliance__title">Compliance Dashboard</h1>
                    <p className="compliance__subtitle">
                        HIPAA, CMS, SOC 2, and regulatory compliance monitoring
                    </p>
                </div>
                <div className="compliance__actions">
                    <Button variant="secondary" icon={<Download size={16} />}>
                        Export Report
                    </Button>
                    <Button variant="primary" icon={<FileText size={16} />}>
                        New Assessment
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="compliance__stats">
                <MetricCard
                    title="Compliance Score"
                    value="94%"
                    change={{ value: 2.5, type: 'increase' }}
                    icon={<Shield size={20} />}
                />
                <MetricCard
                    title="Compliant Items"
                    value={`${stats.compliant}/${stats.total}`}
                    icon={<CheckCircle2 size={20} />}
                />
                <MetricCard
                    title="At Risk"
                    value={stats.atRisk.toString()}
                    icon={<AlertTriangle size={20} />}
                />
                <MetricCard
                    title="Pending Reviews"
                    value={stats.pending.toString()}
                    icon={<Clock size={20} />}
                />
            </div>

            {/* Two Column Layout */}
            <div className="compliance__grid">
                {/* Compliance Items */}
                <GlassCard className="compliance-items">
                    <div className="compliance-items__header">
                        <h3>Compliance Requirements</h3>
                        <Button variant="ghost" size="sm" icon={<Eye size={14} />}>View All</Button>
                    </div>

                    <div className="compliance-items__list">
                        {compliance.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className="compliance-item"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="compliance-item__main">
                                    <div className="compliance-item__category">
                                        {getCategoryIcon(item.category)}
                                        <span>{item.category}</span>
                                    </div>
                                    <div className="compliance-item__requirement">
                                        <span className="requirement-id">{item.id}</span>
                                        <span className="requirement-name">{item.requirement}</span>
                                    </div>
                                </div>
                                <div className="compliance-item__meta">
                                    <span><Calendar size={12} /> Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                                    <span><Users size={12} /> {item.owner}</span>
                                    <span><FileText size={12} /> {item.evidence} docs</span>
                                </div>
                                <div className="compliance-item__status">
                                    {getStatusBadge(item.status)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Audits */}
                <GlassCard className="audit-schedule">
                    <div className="audit-schedule__header">
                        <h3>Audit Schedule</h3>
                        <Button variant="ghost" size="sm" icon={<Calendar size={14} />}>Calendar</Button>
                    </div>

                    <div className="audit-schedule__list">
                        {audits.map((audit, index) => (
                            <motion.div
                                key={audit.id}
                                className="audit-item"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="audit-item__type">
                                    {audit.type === 'internal' && <Activity size={16} />}
                                    {audit.type === 'external' && <Eye size={16} />}
                                    {audit.type === 'regulatory' && <Scale size={16} />}
                                </div>
                                <div className="audit-item__info">
                                    <span className="audit-name">{audit.name}</span>
                                    <span className="audit-type">{audit.type.charAt(0).toUpperCase() + audit.type.slice(1)}</span>
                                </div>
                                <div className="audit-item__date">
                                    {new Date(audit.date).toLocaleDateString()}
                                </div>
                                {getAuditStatusBadge(audit.status)}
                                {audit.findings && (
                                    <Badge variant="warning" size="sm">{audit.findings} findings</Badge>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Regulatory Notices */}
            <GlassCard className="regulatory-notices">
                <div className="regulatory-notices__header">
                    <FileWarning size={20} />
                    <h3>Regulatory Updates</h3>
                </div>
                <div className="regulatory-notices__list">
                    <div className="regulatory-notice">
                        <Badge variant="info" size="sm">CMS</Badge>
                        <span>2024 Medicare Advantage Rate Announcement - Final rates published 4/1/2024</span>
                    </div>
                    <div className="regulatory-notice">
                        <Badge variant="warning" size="sm">HIPAA</Badge>
                        <span>Updated Security Rule modifications effective 180 days from publication</span>
                    </div>
                    <div className="regulatory-notice">
                        <Badge variant="info" size="sm">State</Badge>
                        <span>Texas SB 1234 - New prior authorization requirements effective 6/1/2024</span>
                    </div>
                </div>
            </GlassCard>
        </div>
    )
}

export default ComplianceDashboard
