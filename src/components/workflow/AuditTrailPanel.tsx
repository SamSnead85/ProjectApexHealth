import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Shield,
    FileText,
    Clock,
    User,
    AlertTriangle,
    CheckCircle2,
    Download,
    ExternalLink,
    ChevronRight,
    Filter,
    Search
} from 'lucide-react'
import { useWorkflowStore } from '../../stores/workflowStore'
import './AuditTrailPanel.css'

interface AuditEntry {
    id: string
    timestamp: Date
    action: string
    nodeId: string
    nodeName: string
    decision?: {
        result: 'approved' | 'denied' | 'pending' | 'escalated'
        rationale: string
        confidence?: number
    }
    policyReference?: {
        id: string
        name: string
        section: string
    }
    regulatoryBasis?: {
        code: string
        description: string
    }
    humanReviewer?: {
        id: string
        name: string
        role: string
    }
    aiModel?: string
    inputData?: Record<string, unknown>
    outputData?: Record<string, unknown>
}

// Mock audit data for demonstration
const mockAuditEntries: AuditEntry[] = [
    {
        id: 'audit-001',
        timestamp: new Date('2026-01-27T08:30:00'),
        action: 'Claim Validated',
        nodeId: 'node-1',
        nodeName: 'Claim Intake',
        decision: {
            result: 'approved',
            rationale: 'All required fields present, member ID verified',
            confidence: 0.98
        },
        policyReference: {
            id: 'POL-2026-001',
            name: 'Claims Processing Guidelines',
            section: '3.1.2 - Initial Validation'
        }
    },
    {
        id: 'audit-002',
        timestamp: new Date('2026-01-27T08:30:15'),
        action: 'Fraud Detection Scan',
        nodeId: 'node-2',
        nodeName: 'Fraud Detector',
        decision: {
            result: 'approved',
            rationale: 'No fraud indicators detected. Provider history clean.',
            confidence: 0.95
        },
        policyReference: {
            id: 'POL-2026-003',
            name: 'Fraud Prevention Policy',
            section: '2.4.1 - AI Screening'
        },
        regulatoryBasis: {
            code: 'CMS-6016-F',
            description: 'Medicare Fraud Prevention Requirements'
        },
        aiModel: 'Gemini 2.0 Pro'
    },
    {
        id: 'audit-003',
        timestamp: new Date('2026-01-27T08:30:45'),
        action: 'High-Value Review Required',
        nodeId: 'node-3',
        nodeName: 'Decision Branch',
        decision: {
            result: 'escalated',
            rationale: 'Claim amount exceeds $50,000 threshold',
            confidence: 1.0
        },
        policyReference: {
            id: 'POL-2026-002',
            name: 'High-Value Claims Protocol',
            section: '1.2 - Escalation Criteria'
        },
        regulatoryBasis: {
            code: 'HIPAA-164.530',
            description: 'Administrative Safeguards'
        }
    },
    {
        id: 'audit-004',
        timestamp: new Date('2026-01-27T08:45:00'),
        action: 'Human Review Completed',
        nodeId: 'node-4',
        nodeName: 'Quality Review',
        decision: {
            result: 'approved',
            rationale: 'Reviewed supporting documentation. Procedure medically necessary.',
        },
        humanReviewer: {
            id: 'USR-001',
            name: 'Dr. Sarah Chen',
            role: 'Senior Claims Adjudicator'
        },
        policyReference: {
            id: 'POL-2026-002',
            name: 'High-Value Claims Protocol',
            section: '2.1 - Human Review Requirements'
        }
    }
]

export function AuditTrailPanel() {
    const { workflow, executionLogs } = useWorkflowStore()
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<string>('all')
    const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

    // Use mock data for demo, would use executionLogs in production
    const auditEntries = mockAuditEntries

    const getDecisionBadge = (result: string) => {
        const badges = {
            approved: { icon: <CheckCircle2 size={12} />, class: 'audit-badge--success' },
            denied: { icon: <AlertTriangle size={12} />, class: 'audit-badge--danger' },
            pending: { icon: <Clock size={12} />, class: 'audit-badge--warning' },
            escalated: { icon: <User size={12} />, class: 'audit-badge--info' }
        }
        return badges[result as keyof typeof badges] || badges.pending
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    const handleExportPDF = () => {
        // TODO: Implement PDF export functionality
        console.log('Exporting audit trail to PDF...')
    }

    return (
        <div className="audit-trail-panel">
            <div className="audit-trail-panel__header">
                <div className="audit-trail-panel__title">
                    <Shield size={20} />
                    <h2>Compliance Audit Trail</h2>
                </div>
                <button
                    className="audit-trail-panel__export"
                    onClick={handleExportPDF}
                    title="Export to PDF"
                >
                    <Download size={16} />
                    Export
                </button>
            </div>

            {/* Workflow Info */}
            <div className="audit-trail-panel__workflow-info">
                <div className="audit-trail-panel__workflow-name">
                    <FileText size={14} />
                    <span>{workflow?.name || 'Claims Processing Workflow'}</span>
                </div>
                <div className="audit-trail-panel__execution-id">
                    Execution ID: EXE-2026-0127-001
                </div>
            </div>

            {/* Search and Filter */}
            <div className="audit-trail-panel__controls">
                <div className="audit-trail-panel__search">
                    <Search size={14} />
                    <input
                        type="text"
                        placeholder="Search audit entries..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="audit-trail-panel__filter"
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                >
                    <option value="all">All Decisions</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                    <option value="escalated">Escalated</option>
                </select>
            </div>

            {/* Audit Timeline */}
            <div className="audit-trail-panel__timeline">
                {auditEntries.map((entry, index) => {
                    const badge = getDecisionBadge(entry.decision?.result || 'pending')
                    const isExpanded = expandedEntry === entry.id

                    return (
                        <motion.div
                            key={entry.id}
                            className={`audit-entry ${isExpanded ? 'audit-entry--expanded' : ''}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            {/* Timeline Connector */}
                            <div className="audit-entry__timeline">
                                <div className={`audit-entry__dot ${badge.class}`} />
                                {index < auditEntries.length - 1 && (
                                    <div className="audit-entry__line" />
                                )}
                            </div>

                            {/* Entry Content */}
                            <div
                                className="audit-entry__content"
                                onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                            >
                                <div className="audit-entry__header">
                                    <div className="audit-entry__main">
                                        <span className="audit-entry__time">
                                            {formatTime(entry.timestamp)}
                                        </span>
                                        <span className="audit-entry__action">
                                            {entry.action}
                                        </span>
                                    </div>
                                    <div className={`audit-badge ${badge.class}`}>
                                        {badge.icon}
                                        <span>{entry.decision?.result}</span>
                                    </div>
                                </div>

                                <div className="audit-entry__node">
                                    <ChevronRight
                                        size={12}
                                        className={`audit-entry__chevron ${isExpanded ? 'audit-entry__chevron--open' : ''}`}
                                    />
                                    {entry.nodeName}
                                </div>

                                {/* Rationale Preview */}
                                {entry.decision?.rationale && (
                                    <p className="audit-entry__rationale">
                                        {entry.decision.rationale}
                                    </p>
                                )}

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            className="audit-entry__details"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                        >
                                            {/* Policy Reference */}
                                            {entry.policyReference && (
                                                <div className="audit-detail">
                                                    <div className="audit-detail__label">
                                                        <FileText size={12} />
                                                        Policy Reference
                                                    </div>
                                                    <div className="audit-detail__value">
                                                        <strong>{entry.policyReference.id}</strong>
                                                        <span>{entry.policyReference.name}</span>
                                                        <span className="audit-detail__section">
                                                            {entry.policyReference.section}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Regulatory Basis */}
                                            {entry.regulatoryBasis && (
                                                <div className="audit-detail">
                                                    <div className="audit-detail__label">
                                                        <Shield size={12} />
                                                        Regulatory Basis
                                                    </div>
                                                    <div className="audit-detail__value">
                                                        <strong>{entry.regulatoryBasis.code}</strong>
                                                        <span>{entry.regulatoryBasis.description}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Human Reviewer */}
                                            {entry.humanReviewer && (
                                                <div className="audit-detail">
                                                    <div className="audit-detail__label">
                                                        <User size={12} />
                                                        Human Reviewer
                                                    </div>
                                                    <div className="audit-detail__value">
                                                        <strong>{entry.humanReviewer.name}</strong>
                                                        <span>{entry.humanReviewer.role}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* AI Model */}
                                            {entry.aiModel && (
                                                <div className="audit-detail">
                                                    <div className="audit-detail__label">
                                                        AI Model
                                                    </div>
                                                    <div className="audit-detail__value">
                                                        <span>{entry.aiModel}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Confidence Score */}
                                            {entry.decision?.confidence !== undefined && (
                                                <div className="audit-detail">
                                                    <div className="audit-detail__label">
                                                        Confidence
                                                    </div>
                                                    <div className="audit-detail__confidence">
                                                        <div
                                                            className="audit-detail__confidence-bar"
                                                            style={{ width: `${entry.decision.confidence * 100}%` }}
                                                        />
                                                        <span>{Math.round(entry.decision.confidence * 100)}%</span>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Summary Stats */}
            <div className="audit-trail-panel__summary">
                <div className="audit-stat">
                    <span className="audit-stat__value">4</span>
                    <span className="audit-stat__label">Total Steps</span>
                </div>
                <div className="audit-stat">
                    <span className="audit-stat__value audit-stat__value--success">3</span>
                    <span className="audit-stat__label">Approved</span>
                </div>
                <div className="audit-stat">
                    <span className="audit-stat__value audit-stat__value--info">1</span>
                    <span className="audit-stat__label">Escalated</span>
                </div>
                <div className="audit-stat">
                    <span className="audit-stat__value">15m</span>
                    <span className="audit-stat__label">Duration</span>
                </div>
            </div>
        </div>
    )
}

export default AuditTrailPanel
