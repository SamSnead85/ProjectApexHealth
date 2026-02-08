import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Shield, AlertTriangle, FileText, Users, Clock, CheckCircle2,
    XCircle, Eye, Download, Search, Calendar, Lock, Bell,
    AlertOctagon, Activity, Zap, ChevronRight, ChevronDown,
    Building2, UserCheck, Scale, Siren, Timer, Flag,
    FileWarning, Send, Plus, RefreshCw
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './BreachResponse.css'

// ============================================================================
// BREACH RESPONSE - HIPAA Security Incident Response Workflow
// Incident reporting, investigation, notification, and remediation
// ============================================================================

type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
type IncidentStatus = 'reported' | 'investigating' | 'contained' | 'notifying' | 'remediating' | 'closed'

interface Incident {
    id: string
    title: string
    reportedBy: string
    reportedDate: string
    severity: IncidentSeverity
    status: IncidentStatus
    affectedIndividuals: number
    phiInvolved: boolean
    description: string
    daysRemaining?: number
}

interface WorkflowStep {
    id: number
    name: string
    description: string
    status: 'completed' | 'in_progress' | 'pending'
    icon: typeof Shield
    completedDate?: string
}

const activeIncidents: Incident[] = [
    {
        id: 'INC-2026-001', title: 'Unauthorized PHI access via compromised credentials',
        reportedBy: 'IT Security Team', reportedDate: '2026-02-01',
        severity: 'critical', status: 'notifying', affectedIndividuals: 847,
        phiInvolved: true, description: 'Phishing attack led to credential compromise. Attacker accessed member records for 2 hours before detection.',
        daysRemaining: 42
    },
    {
        id: 'INC-2026-002', title: 'Misdirected fax containing member lab results',
        reportedBy: 'Claims Processing', reportedDate: '2026-02-05',
        severity: 'medium', status: 'investigating', affectedIndividuals: 3,
        phiInvolved: true, description: 'Lab results for 3 members sent to incorrect fax number. Recipient contacted and confirmed destruction.'
    },
    {
        id: 'INC-2026-003', title: 'Laptop theft from regional office',
        reportedBy: 'Facilities Manager', reportedDate: '2026-02-06',
        severity: 'high', status: 'contained', affectedIndividuals: 0,
        phiInvolved: false, description: 'Company laptop stolen from locked car. Device was encrypted with full-disk encryption. Remote wipe initiated.'
    },
]

const closedIncidents: Incident[] = [
    {
        id: 'INC-2025-028', title: 'Email attachment with unencrypted member data',
        reportedBy: 'Compliance Officer', reportedDate: '2025-12-15',
        severity: 'low', status: 'closed', affectedIndividuals: 1,
        phiInvolved: true, description: 'Internal email with unencrypted attachment. Recalled within 5 minutes.'
    },
    {
        id: 'INC-2025-027', title: 'Third-party vendor data exposure',
        reportedBy: 'Vendor Management', reportedDate: '2025-11-28',
        severity: 'high', status: 'closed', affectedIndividuals: 2340,
        phiInvolved: true, description: 'Vendor misconfiguration exposed API endpoint. Vendor contained within 4 hours.'
    },
]

const workflowSteps: WorkflowStep[] = [
    { id: 1, name: 'Detection & Reporting', description: 'Incident detected and formally reported through HIPAA incident channel', icon: Siren, status: 'completed', completedDate: '2026-02-01' },
    { id: 2, name: 'Investigation', description: 'Scope assessment, evidence collection, and root cause analysis', icon: Search, status: 'completed', completedDate: '2026-02-03' },
    { id: 3, name: 'Containment', description: 'Immediate actions to prevent further unauthorized access', icon: Shield, status: 'completed', completedDate: '2026-02-03' },
    { id: 4, name: 'Risk Assessment', description: 'HIPAA breach risk assessment using 4-factor analysis', icon: Scale, status: 'completed', completedDate: '2026-02-04' },
    { id: 5, name: 'Notification', description: 'Notify HHS (60 days), affected individuals, and media if >500', icon: Bell, status: 'in_progress' },
    { id: 6, name: 'Remediation', description: 'Implement corrective actions and security improvements', icon: Activity, status: 'pending' },
    { id: 7, name: 'Post-Incident Review', description: 'Lessons learned, policy updates, and staff training', icon: FileText, status: 'pending' },
]

const documentationChecklist = [
    { id: 'd1', item: 'Incident detection date and time', completed: true },
    { id: 'd2', item: 'Nature of PHI involved', completed: true },
    { id: 'd3', item: 'Description of unauthorized access/disclosure', completed: true },
    { id: 'd4', item: 'Individuals involved in the incident', completed: true },
    { id: 'd5', item: 'Risk assessment documentation (4-factor analysis)', completed: true },
    { id: 'd6', item: 'Corrective actions taken', completed: false },
    { id: 'd7', item: 'HHS notification submission', completed: false },
    { id: 'd8', item: 'Individual notification letters', completed: false },
    { id: 'd9', item: 'Media notification (if >500 affected)', completed: false },
    { id: 'd10', item: 'Breach log entry', completed: true },
    { id: 'd11', item: 'Policy/procedure updates', completed: false },
    { id: 'd12', item: 'Staff retraining documentation', completed: false },
]

export default function BreachResponse() {
    const [selectedIncident, setSelectedIncident] = useState<string>('INC-2026-001')
    const [showNewIncident, setShowNewIncident] = useState(false)
    const [checklist, setChecklist] = useState(documentationChecklist)
    const [hhsCountdown, setHhsCountdown] = useState(42)
    const [expandedLog, setExpandedLog] = useState(false)

    // New incident form state
    const [formData, setFormData] = useState({
        title: '',
        who: '',
        what: '',
        when: '',
        scope: '',
        phiInvolved: 'yes',
    })

    // Severity calculator
    const [severityFactors, setSeverityFactors] = useState({
        natureOfPHI: 2,
        unauthorizedPerson: 2,
        acquired: 1,
        mitigationSteps: 3
    })

    const calculateSeverity = (): IncidentSeverity => {
        const score = Object.values(severityFactors).reduce((a, b) => a + b, 0)
        if (score <= 5) return 'low'
        if (score <= 8) return 'medium'
        if (score <= 11) return 'high'
        return 'critical'
    }

    const toggleChecklistItem = useCallback((id: string) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ))
    }, [])

    const getSeverityBadge = (severity: IncidentSeverity) => {
        switch (severity) {
            case 'low': return <Badge variant="info" size="sm">Low</Badge>
            case 'medium': return <Badge variant="warning" size="sm">Medium</Badge>
            case 'high': return <Badge variant="critical" size="sm">High</Badge>
            case 'critical': return <Badge variant="critical" size="sm" pulse icon={<AlertOctagon size={10} />}>Critical</Badge>
        }
    }

    const getStatusBadge = (status: IncidentStatus) => {
        switch (status) {
            case 'reported': return <Badge variant="info" size="sm" icon={<Flag size={10} />}>Reported</Badge>
            case 'investigating': return <Badge variant="warning" size="sm" icon={<Search size={10} />}>Investigating</Badge>
            case 'contained': return <Badge variant="teal" size="sm" icon={<Shield size={10} />}>Contained</Badge>
            case 'notifying': return <Badge variant="purple" size="sm" icon={<Bell size={10} />}>Notifying</Badge>
            case 'remediating': return <Badge variant="info" size="sm" icon={<Activity size={10} />}>Remediating</Badge>
            case 'closed': return <Badge variant="success" size="sm" icon={<CheckCircle2 size={10} />}>Closed</Badge>
        }
    }

    const completedDocs = checklist.filter(d => d.completed).length

    return (
        <div className="breach-response">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="br-header">
                    <div>
                        <h1 className="br-title">
                            <Siren size={28} />
                            Breach Response
                            <Badge variant="critical" icon={<AlertTriangle size={10} />}>
                                {activeIncidents.length} Active
                            </Badge>
                        </h1>
                        <p className="br-subtitle">HIPAA security incident response workflow and breach management</p>
                    </div>
                    <div className="br-header-actions">
                        <Button variant="secondary" icon={<Download size={16} />}>Export Report</Button>
                        <Button variant="danger" icon={<Plus size={16} />} onClick={() => setShowNewIncident(!showNewIncident)}>
                            Report Incident
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="br-kpis">
                    <MetricCard
                        label="Active Incidents"
                        value={activeIncidents.length.toString()}
                        icon={<AlertTriangle size={20} />}
                        subtitle="Requiring attention"
                        variant="warning"
                    />
                    <MetricCard
                        label="HHS Notification Deadline"
                        value={`${hhsCountdown} days`}
                        icon={<Timer size={20} />}
                        subtitle="For INC-2026-001"
                        variant="danger"
                    />
                    <MetricCard
                        label="Affected Individuals"
                        value="850"
                        icon={<Users size={20} />}
                        subtitle="Across active incidents"
                    />
                    <MetricCard
                        label="Documentation"
                        value={`${completedDocs}/${checklist.length}`}
                        icon={<FileText size={20} />}
                        subtitle="Checklist items complete"
                    />
                </div>

                {/* New Incident Form (collapsible) */}
                <AnimatePresence>
                    {showNewIncident && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <GlassCard className="br-new-incident">
                                <h3 className="br-section-title">
                                    <FileWarning size={18} />
                                    Report New Security Incident
                                </h3>
                                <div className="br-form-grid">
                                    <div className="br-field full-width">
                                        <label>Incident Title</label>
                                        <input
                                            type="text"
                                            placeholder="Brief description of the incident..."
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        />
                                    </div>
                                    <div className="br-field">
                                        <label>Who discovered it?</label>
                                        <input
                                            type="text"
                                            placeholder="Name or department..."
                                            value={formData.who}
                                            onChange={(e) => setFormData(prev => ({ ...prev, who: e.target.value }))}
                                        />
                                    </div>
                                    <div className="br-field">
                                        <label>When did it occur?</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.when}
                                            onChange={(e) => setFormData(prev => ({ ...prev, when: e.target.value }))}
                                        />
                                    </div>
                                    <div className="br-field full-width">
                                        <label>What happened?</label>
                                        <textarea
                                            placeholder="Detailed description of the security incident..."
                                            rows={3}
                                            value={formData.what}
                                            onChange={(e) => setFormData(prev => ({ ...prev, what: e.target.value }))}
                                        />
                                    </div>
                                    <div className="br-field">
                                        <label>Scope / Affected systems</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Member database, email..."
                                            value={formData.scope}
                                            onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
                                        />
                                    </div>
                                    <div className="br-field">
                                        <label>PHI Involved?</label>
                                        <select
                                            value={formData.phiInvolved}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phiInvolved: e.target.value }))}
                                        >
                                            <option value="yes">Yes - PHI was involved</option>
                                            <option value="no">No - No PHI involved</option>
                                            <option value="unknown">Unknown - Under investigation</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Severity Calculator */}
                                <div className="br-severity-calc">
                                    <h4>
                                        <Scale size={16} />
                                        HIPAA Breach Risk Assessment (4-Factor Test)
                                    </h4>
                                    <div className="br-factors">
                                        <div className="br-factor">
                                            <label>Nature & extent of PHI</label>
                                            <select
                                                value={severityFactors.natureOfPHI}
                                                onChange={(e) => setSeverityFactors(prev => ({ ...prev, natureOfPHI: parseInt(e.target.value) }))}
                                            >
                                                <option value={1}>Limited (name only)</option>
                                                <option value={2}>Moderate (clinical data)</option>
                                                <option value={3}>Extensive (SSN, financial)</option>
                                            </select>
                                        </div>
                                        <div className="br-factor">
                                            <label>Unauthorized person involved</label>
                                            <select
                                                value={severityFactors.unauthorizedPerson}
                                                onChange={(e) => setSeverityFactors(prev => ({ ...prev, unauthorizedPerson: parseInt(e.target.value) }))}
                                            >
                                                <option value={1}>Known healthcare entity</option>
                                                <option value={2}>Unknown internal</option>
                                                <option value={3}>External/malicious actor</option>
                                            </select>
                                        </div>
                                        <div className="br-factor">
                                            <label>PHI actually acquired?</label>
                                            <select
                                                value={severityFactors.acquired}
                                                onChange={(e) => setSeverityFactors(prev => ({ ...prev, acquired: parseInt(e.target.value) }))}
                                            >
                                                <option value={1}>No evidence of acquisition</option>
                                                <option value={2}>Possibly acquired</option>
                                                <option value={3}>Confirmed acquired/viewed</option>
                                            </select>
                                        </div>
                                        <div className="br-factor">
                                            <label>Risk mitigation steps</label>
                                            <select
                                                value={severityFactors.mitigationSteps}
                                                onChange={(e) => setSeverityFactors(prev => ({ ...prev, mitigationSteps: parseInt(e.target.value) }))}
                                            >
                                                <option value={1}>Fully mitigated</option>
                                                <option value={2}>Partially mitigated</option>
                                                <option value={3}>Not mitigable</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="br-severity-result">
                                        <span>Calculated Severity:</span>
                                        {getSeverityBadge(calculateSeverity())}
                                    </div>
                                </div>

                                <div className="br-form-actions">
                                    <Button variant="ghost" onClick={() => setShowNewIncident(false)}>Cancel</Button>
                                    <Button variant="danger" icon={<Send size={16} />}>Submit Incident Report</Button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Layout */}
                <div className="br-layout">
                    {/* Active Incidents */}
                    <div className="br-incidents-panel">
                        <GlassCard className="br-incidents">
                            <h3 className="br-section-title">
                                <AlertTriangle size={18} />
                                Active Incidents
                            </h3>
                            <div className="br-incidents-list">
                                {activeIncidents.map((incident, index) => (
                                    <motion.div
                                        key={incident.id}
                                        className={`br-incident-card ${selectedIncident === incident.id ? 'selected' : ''}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => setSelectedIncident(incident.id)}
                                    >
                                        <div className="br-inc-header">
                                            <span className="br-inc-id">{incident.id}</span>
                                            <div className="br-inc-badges">
                                                {getSeverityBadge(incident.severity)}
                                                {getStatusBadge(incident.status)}
                                            </div>
                                        </div>
                                        <h4 className="br-inc-title">{incident.title}</h4>
                                        <div className="br-inc-meta">
                                            <span><UserCheck size={12} /> {incident.reportedBy}</span>
                                            <span><Calendar size={12} /> {incident.reportedDate}</span>
                                            <span><Users size={12} /> {incident.affectedIndividuals} affected</span>
                                        </div>
                                        {incident.phiInvolved && (
                                            <Badge variant="critical" size="sm" icon={<Lock size={10} />}>PHI Involved</Badge>
                                        )}
                                        {incident.daysRemaining !== undefined && (
                                            <div className="br-inc-countdown">
                                                <Timer size={12} />
                                                <span>{incident.daysRemaining} days until HHS notification deadline</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Notification Timers */}
                        <GlassCard className="br-timers">
                            <h3 className="br-section-title">
                                <Timer size={18} />
                                Notification Countdowns
                            </h3>
                            <div className="br-timer-list">
                                <div className="br-timer-item critical">
                                    <div className="br-timer-info">
                                        <span className="br-timer-target">HHS OCR Notification</span>
                                        <span className="br-timer-rule">60 calendar days from discovery</span>
                                    </div>
                                    <div className="br-timer-value">
                                        <span className="br-timer-days">42</span>
                                        <span className="br-timer-label">days left</span>
                                    </div>
                                    <div className="br-timer-bar">
                                        <div className="br-timer-fill" style={{ width: '30%' }} />
                                    </div>
                                </div>
                                <div className="br-timer-item warning">
                                    <div className="br-timer-info">
                                        <span className="br-timer-target">Individual Notification</span>
                                        <span className="br-timer-rule">Without unreasonable delay, max 60 days</span>
                                    </div>
                                    <div className="br-timer-value">
                                        <span className="br-timer-days">42</span>
                                        <span className="br-timer-label">days left</span>
                                    </div>
                                    <div className="br-timer-bar">
                                        <div className="br-timer-fill" style={{ width: '30%' }} />
                                    </div>
                                </div>
                                <div className="br-timer-item info">
                                    <div className="br-timer-info">
                                        <span className="br-timer-target">Media Notification</span>
                                        <span className="br-timer-rule">Required if &gt;500 individuals affected</span>
                                    </div>
                                    <div className="br-timer-value">
                                        <Badge variant="critical" size="sm">Required</Badge>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Workflow + Documentation */}
                    <div className="br-detail-panel">
                        {/* Response Workflow */}
                        <GlassCard className="br-workflow">
                            <h3 className="br-section-title">
                                <Activity size={18} />
                                Response Workflow (INC-2026-001)
                            </h3>
                            <div className="br-timeline">
                                {workflowSteps.map((step, index) => {
                                    const StepIcon = step.icon
                                    return (
                                        <motion.div
                                            key={step.id}
                                            className={`br-step ${step.status}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.08 }}
                                        >
                                            <div className="br-step-indicator">
                                                <div className="br-step-dot">
                                                    {step.status === 'completed' && <CheckCircle2 size={14} />}
                                                    {step.status === 'in_progress' && <Activity size={14} />}
                                                    {step.status === 'pending' && <span>{step.id}</span>}
                                                </div>
                                                {index < workflowSteps.length - 1 && <div className="br-step-line" />}
                                            </div>
                                            <div className="br-step-content">
                                                <div className="br-step-header">
                                                    <StepIcon size={14} />
                                                    <span className="br-step-name">{step.name}</span>
                                                    <Badge
                                                        variant={step.status === 'completed' ? 'success' : step.status === 'in_progress' ? 'warning' : 'default'}
                                                        size="sm"
                                                    >
                                                        {step.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <p className="br-step-desc">{step.description}</p>
                                                {step.completedDate && (
                                                    <span className="br-step-date">{step.completedDate}</span>
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </GlassCard>

                        {/* Documentation Checklist */}
                        <GlassCard className="br-documentation">
                            <div className="br-doc-header">
                                <h3 className="br-section-title">
                                    <FileText size={18} />
                                    Documentation Checklist
                                </h3>
                                <Badge variant={completedDocs === checklist.length ? 'success' : 'warning'} size="sm">
                                    {completedDocs}/{checklist.length} Complete
                                </Badge>
                            </div>
                            <div className="br-checklist">
                                {checklist.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`br-check-item ${item.completed ? 'completed' : ''}`}
                                        onClick={() => toggleChecklistItem(item.id)}
                                    >
                                        <div className={`br-checkbox ${item.completed ? 'checked' : ''}`}>
                                            {item.completed && <CheckCircle2 size={14} />}
                                        </div>
                                        <span>{item.item}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* Breach Log History */}
                <GlassCard className="br-history">
                    <div className="br-history-header">
                        <h3 className="br-section-title">
                            <Clock size={18} />
                            Breach Log History
                        </h3>
                        <Button variant="ghost" size="sm" icon={<Eye size={14} />} onClick={() => setExpandedLog(!expandedLog)}>
                            {expandedLog ? 'Collapse' : 'View All'}
                        </Button>
                    </div>
                    <div className="br-history-table">
                        <div className="br-hist-header">
                            <span>ID</span>
                            <span>Incident</span>
                            <span>Date</span>
                            <span>Severity</span>
                            <span>Affected</span>
                            <span>Status</span>
                        </div>
                        {[...activeIncidents, ...(expandedLog ? closedIncidents : [])].map((inc, index) => (
                            <motion.div
                                key={inc.id}
                                className="br-hist-row"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <span className="br-hist-id">{inc.id}</span>
                                <span className="br-hist-title">{inc.title}</span>
                                <span>{inc.reportedDate}</span>
                                <span>{getSeverityBadge(inc.severity)}</span>
                                <span>{inc.affectedIndividuals.toLocaleString()}</span>
                                <span>{getStatusBadge(inc.status)}</span>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    )
}
