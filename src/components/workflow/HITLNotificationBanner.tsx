import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    UserCheck,
    Clock,
    AlertCircle,
    ChevronRight,
    X,
    ExternalLink,
    Zap
} from 'lucide-react'
import { useWorkflowStore } from '../../stores/workflowStore'
import './HITLNotificationBanner.css'

interface HITLCheckpoint {
    id: string
    workflowId: string
    workflowName: string
    nodeName: string
    priority: 'high' | 'medium' | 'low'
    requiredBy: Date
    claimId: string
    claimAmount: number
    aiRecommendation: 'approve' | 'deny' | 'review'
    confidence: number
    reason: string
    assignedTo?: string
}

// Mock HITL checkpoints for demo
const mockCheckpoints: HITLCheckpoint[] = [
    {
        id: 'hitl-001',
        workflowId: 'wf-001',
        workflowName: 'High-Value Claims',
        nodeName: 'Senior Review Required',
        priority: 'high',
        requiredBy: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
        claimId: 'CLM-2026-45821',
        claimAmount: 125000,
        aiRecommendation: 'approve',
        confidence: 0.87,
        reason: 'Claim amount exceeds $100,000 threshold'
    },
    {
        id: 'hitl-002',
        workflowId: 'wf-002',
        workflowName: 'Prior Authorization',
        nodeName: 'Clinical Review',
        priority: 'medium',
        requiredBy: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        claimId: 'PA-2026-78432',
        claimAmount: 45000,
        aiRecommendation: 'review',
        confidence: 0.62,
        reason: 'Procedure requires additional clinical documentation'
    }
]

export function HITLNotificationBanner() {
    // Note: Using mock data for demo, real implementation would use store
    const [isExpanded, setIsExpanded] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    // Use mock data for demo
    const pendingCheckpoints = mockCheckpoints

    // Calculate time remaining
    const getTimeRemaining = (deadline: Date) => {
        const now = new Date()
        const diff = deadline.getTime() - now.getTime()

        if (diff <= 0) return 'Overdue'

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        if (hours > 0) return `${hours}h ${minutes}m`
        return `${minutes}m`
    }

    const getPriorityClass = (priority: string) => {
        return `hitl-priority--${priority}`
    }

    const getRecommendationBadge = (rec: string, confidence: number) => {
        const badges = {
            approve: { label: 'Approve', class: 'hitl-rec--approve' },
            deny: { label: 'Deny', class: 'hitl-rec--deny' },
            review: { label: 'Needs Review', class: 'hitl-rec--review' }
        }
        return badges[rec as keyof typeof badges] || badges.review
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount)
    }

    if (isDismissed || pendingCheckpoints.length === 0) return null

    const highPriorityCount = pendingCheckpoints.filter(c => c.priority === 'high').length

    return (
        <motion.div
            className={`hitl-banner ${isExpanded ? 'hitl-banner--expanded' : ''}`}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
        >
            {/* Collapsed View */}
            <div
                className="hitl-banner__header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="hitl-banner__icon">
                    <UserCheck size={18} />
                    {highPriorityCount > 0 && (
                        <span className="hitl-banner__badge">{highPriorityCount}</span>
                    )}
                </div>

                <div className="hitl-banner__info">
                    <span className="hitl-banner__title">
                        {pendingCheckpoints.length} Pending Human Review{pendingCheckpoints.length > 1 ? 's' : ''}
                    </span>
                    <span className="hitl-banner__subtitle">
                        {highPriorityCount > 0 && `${highPriorityCount} high priority • `}
                        Click to expand
                    </span>
                </div>

                <div className="hitl-banner__actions">
                    <button
                        className="hitl-banner__expand"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                        <ChevronRight
                            size={16}
                            className={isExpanded ? 'hitl-banner__chevron--open' : ''}
                        />
                    </button>
                    <button
                        className="hitl-banner__dismiss"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsDismissed(true)
                        }}
                        title="Dismiss"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Expanded View */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="hitl-banner__content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        {pendingCheckpoints.map((checkpoint) => {
                            const recBadge = getRecommendationBadge(
                                checkpoint.aiRecommendation,
                                checkpoint.confidence
                            )

                            return (
                                <div
                                    key={checkpoint.id}
                                    className={`hitl-item ${getPriorityClass(checkpoint.priority)}`}
                                >
                                    <div className="hitl-item__header">
                                        <div className="hitl-item__workflow">
                                            <span className="hitl-item__workflow-name">
                                                {checkpoint.workflowName}
                                            </span>
                                            <span className="hitl-item__node">
                                                {checkpoint.nodeName}
                                            </span>
                                        </div>

                                        <div className={`hitl-item__priority ${getPriorityClass(checkpoint.priority)}`}>
                                            {checkpoint.priority === 'high' && <AlertCircle size={12} />}
                                            {checkpoint.priority}
                                        </div>
                                    </div>

                                    <div className="hitl-item__details">
                                        <div className="hitl-item__claim">
                                            <span className="hitl-item__claim-id">
                                                {checkpoint.claimId}
                                            </span>
                                            <span className="hitl-item__claim-amount">
                                                {formatCurrency(checkpoint.claimAmount)}
                                            </span>
                                        </div>

                                        <div className="hitl-item__ai">
                                            <span className={`hitl-rec ${recBadge.class}`}>
                                                <Zap size={10} />
                                                AI: {recBadge.label}
                                            </span>
                                            <span className="hitl-item__confidence">
                                                {Math.round(checkpoint.confidence * 100)}% conf
                                            </span>
                                        </div>
                                    </div>

                                    <p className="hitl-item__reason">
                                        {checkpoint.reason}
                                    </p>

                                    <div className="hitl-item__footer">
                                        <div className="hitl-item__deadline">
                                            <Clock size={12} />
                                            <span>Due in {getTimeRemaining(checkpoint.requiredBy)}</span>
                                        </div>

                                        <button className="hitl-item__review-btn">
                                            Review Now
                                            <ExternalLink size={12} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default HITLNotificationBanner
