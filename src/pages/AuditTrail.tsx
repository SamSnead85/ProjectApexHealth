import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    Clock,
    AlertTriangle,
    XCircle,
    Brain,
    User,
    Zap,
    FileText,
    Shield,
    Download,
    Printer,
    Share2
} from 'lucide-react'
import { GlassCard, Button, Badge } from '../components/common'
import './AuditTrail.css'

// Claim being audited
const claim = {
    id: 'CLM-2847',
    type: 'Medical',
    member: 'John Smith',
    memberId: 'MBR-10234',
    provider: 'Metro Health Center',
    amount: '$3,450.00',
    status: 'Approved'
}

// Timeline data
const timelineSteps = [
    {
        id: 1,
        name: 'Claim Intake',
        type: 'system',
        status: 'completed',
        timestamp: '2024-01-15 09:23:45',
        duration: '0.8s',
        details: {
            source: 'EDI 837',
            format: 'Professional',
            validationPassed: true
        }
    },
    {
        id: 2,
        name: 'Data Verification',
        type: 'ai',
        status: 'completed',
        timestamp: '2024-01-15 09:23:46',
        duration: '1.2s',
        confidence: 0.94,
        details: {
            memberVerified: true,
            providerVerified: true,
            eligibilityConfirmed: true,
            factors: ['Member ID Match', 'Active Coverage', 'In-Network Provider']
        }
    },
    {
        id: 3,
        name: 'Document Analysis',
        type: 'ai',
        status: 'completed',
        timestamp: '2024-01-15 09:23:48',
        duration: '2.4s',
        confidence: 0.89,
        details: {
            documentsAnalyzed: 3,
            cptCodesExtracted: ['99213', '87880'],
            diagnosisCode: 'J06.9',
            factors: ['CPT Code Valid', 'Diagnosis Supported', 'Medical Necessity Confirmed']
        }
    },
    {
        id: 4,
        name: 'Rules Engine',
        type: 'ai',
        status: 'completed',
        timestamp: '2024-01-15 09:23:51',
        duration: '0.6s',
        confidence: 0.97,
        details: {
            rulesEvaluated: 24,
            rulesPassed: 24,
            pricingApplied: 'In-Network PPO',
            allowedAmount: '$2,890.00',
            factors: ['Deductible Met', 'Within Coverage Limits', 'No Prior Auth Required']
        }
    },
    {
        id: 5,
        name: 'Fraud Detection',
        type: 'ai',
        status: 'completed',
        timestamp: '2024-01-15 09:23:52',
        duration: '1.8s',
        confidence: 0.92,
        details: {
            riskScore: 0.12,
            flagsRaised: 0,
            patternsChecked: 47,
            factors: ['Low Risk Score', 'No Duplicate Claims', 'Normal Billing Pattern']
        }
    },
    {
        id: 6,
        name: 'HITL Review',
        type: 'human',
        status: 'completed',
        timestamp: '2024-01-15 09:45:23',
        duration: '21m 31s',
        details: {
            reviewer: 'Sarah Johnson',
            reviewerRole: 'Senior Claims Analyst',
            decision: 'Approved',
            notes: 'All documentation verified. Claim meets policy requirements.'
        }
    },
    {
        id: 7,
        name: 'Final Adjudication',
        type: 'system',
        status: 'completed',
        timestamp: '2024-01-15 09:45:25',
        duration: '0.3s',
        details: {
            finalStatus: 'Approved',
            paymentAmount: '$2,890.00',
            memberResponsibility: '$560.00',
            paymentMethod: 'EFT'
        }
    }
]

export function AuditTrail() {
    const [expandedSteps, setExpandedSteps] = useState<number[]>([2, 6])

    const toggleStep = (stepId: number) => {
        setExpandedSteps(prev =>
            prev.includes(stepId)
                ? prev.filter(id => id !== stepId)
                : [...prev, stepId]
        )
    }

    const getStepIcon = (type: string) => {
        switch (type) {
            case 'ai': return <Brain size={18} />
            case 'human': return <User size={18} />
            default: return <Zap size={18} />
        }
    }

    const getStatusMarker = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 size={16} />
            case 'active': return <Clock size={16} />
            case 'pending': return <Clock size={16} />
            case 'error': return <XCircle size={16} />
            default: return <Clock size={16} />
        }
    }

    const getConfidenceLevel = (score: number) => {
        if (score >= 0.9) return 'high'
        if (score >= 0.7) return 'medium'
        return 'low'
    }

    return (
        <div className="audit-trail">
            {/* Header */}
            <div className="audit-trail__header">
                <div className="audit-trail__title-section">
                    <div className="audit-trail__breadcrumb">
                        <a href="#">Claims</a>
                        <ChevronRight size={14} />
                        <span>{claim.id}</span>
                        <ChevronRight size={14} />
                        <span>Audit Trail</span>
                    </div>
                    <h1 className="audit-trail__title">Claim Audit Trail</h1>
                    <p className="audit-trail__subtitle">
                        Complete execution history and decision log for {claim.id}
                    </p>
                </div>
                <div className="audit-trail__actions">
                    <Button variant="ghost" size="sm">
                        <Printer size={16} />
                        Print
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Download size={16} />
                        Export
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Share2 size={16} />
                        Share
                    </Button>
                </div>
            </div>

            {/* Claim Summary */}
            <div className="claim-summary">
                <div className="claim-summary__item">
                    <span className="claim-summary__label">Claim ID</span>
                    <span className="claim-summary__value claim-summary__value--mono">{claim.id}</span>
                </div>
                <div className="claim-summary__item">
                    <span className="claim-summary__label">Member</span>
                    <span className="claim-summary__value">{claim.member}</span>
                </div>
                <div className="claim-summary__item">
                    <span className="claim-summary__label">Provider</span>
                    <span className="claim-summary__value">{claim.provider}</span>
                </div>
                <div className="claim-summary__item">
                    <span className="claim-summary__label">Amount</span>
                    <span className="claim-summary__value claim-summary__value--mono">{claim.amount}</span>
                </div>
                <div className="claim-summary__item">
                    <span className="claim-summary__label">Status</span>
                    <Badge variant="success">{claim.status}</Badge>
                </div>
            </div>

            {/* Timeline */}
            <div className="audit-timeline">
                {timelineSteps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        className="timeline-step"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className={`timeline-step__marker timeline-step__marker--${step.status}`}>
                            {getStatusMarker(step.status)}
                        </div>
                        <div className={`timeline-card ${expandedSteps.includes(step.id) ? 'timeline-card--expanded' : ''}`}>
                            <div
                                className="timeline-card__header"
                                onClick={() => toggleStep(step.id)}
                            >
                                <div className="timeline-card__header-left">
                                    <div className={`timeline-card__icon timeline-card__icon--${step.type}`}>
                                        {getStepIcon(step.type)}
                                    </div>
                                    <div className="timeline-card__title-group">
                                        <span className="timeline-card__title">{step.name}</span>
                                        <span className="timeline-card__timestamp">{step.timestamp}</span>
                                    </div>
                                </div>
                                <div className="timeline-card__header-right">
                                    {step.type === 'human' && (
                                        <span className="hitl-badge">
                                            <User size={12} />
                                            HITL
                                        </span>
                                    )}
                                    <span className="timeline-card__duration">{step.duration}</span>
                                    <Badge variant={step.status === 'completed' ? 'success' : 'warning'}>
                                        {step.status}
                                    </Badge>
                                    <button className="timeline-card__expand-btn">
                                        {expandedSteps.includes(step.id) ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <AnimatePresence>
                                {expandedSteps.includes(step.id) && (
                                    <motion.div
                                        className="timeline-card__details"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="timeline-card__details-grid">
                                            {step.confidence !== undefined && (
                                                <div className="timeline-detail">
                                                    <span className="timeline-detail__label">AI Confidence</span>
                                                    <div className="confidence-score">
                                                        <div className="confidence-score__bar">
                                                            <div
                                                                className={`confidence-score__fill confidence-score__fill--${getConfidenceLevel(step.confidence)}`}
                                                                style={{ width: `${step.confidence * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="confidence-score__value">
                                                            {(step.confidence * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {step.details.factors && (
                                                <div className="timeline-detail">
                                                    <span className="timeline-detail__label">Decision Factors</span>
                                                    <div className="ai-factors">
                                                        {step.details.factors.map((factor: string, i: number) => (
                                                            <span key={i} className="ai-factor">
                                                                <CheckCircle2 className="ai-factor__icon" />
                                                                {factor}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {step.details.reviewer && (
                                                <>
                                                    <div className="timeline-detail">
                                                        <span className="timeline-detail__label">Reviewer</span>
                                                        <span className="timeline-detail__value">
                                                            {step.details.reviewer} ({step.details.reviewerRole})
                                                        </span>
                                                    </div>
                                                    <div className="timeline-detail">
                                                        <span className="timeline-detail__label">Decision</span>
                                                        <Badge variant="success">{step.details.decision}</Badge>
                                                    </div>
                                                    <div className="timeline-detail" style={{ gridColumn: '1 / -1' }}>
                                                        <span className="timeline-detail__label">Notes</span>
                                                        <span className="timeline-detail__value">{step.details.notes}</span>
                                                    </div>
                                                </>
                                            )}
                                            {step.details.finalStatus && (
                                                <>
                                                    <div className="timeline-detail">
                                                        <span className="timeline-detail__label">Payment Amount</span>
                                                        <span className="timeline-detail__value timeline-detail__value--mono">
                                                            {step.details.paymentAmount}
                                                        </span>
                                                    </div>
                                                    <div className="timeline-detail">
                                                        <span className="timeline-detail__label">Member Responsibility</span>
                                                        <span className="timeline-detail__value timeline-detail__value--mono">
                                                            {step.details.memberResponsibility}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default AuditTrail
