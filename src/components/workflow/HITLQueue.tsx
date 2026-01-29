import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    User,
    Users,
    ChevronRight,
    MessageSquare,
    Timer,
    ArrowUpRight
} from 'lucide-react'
import { useWorkflowStore } from '../../stores/workflowStore'
import { HITLCheckpoint } from '../../types/workflow'
import { Button, Badge, GlassCard } from '../common'
import './HITLQueue.css'

// Mock HITL items for demonstration
const mockHITLItems: HITLCheckpoint[] = [
    {
        id: '1',
        executionId: 'exec-001',
        nodeId: 'node-1',
        nodeName: 'Medical Necessity Review',
        status: 'pending',
        assignee: { type: 'user', id: 'user-1', name: 'Dr. Sarah Chen' },
        createdAt: new Date(Date.now() - 3600000),
        dueAt: new Date(Date.now() + 86400000),
        escalateAt: new Date(Date.now() + 172800000),
        context: {
            claimId: 'CLM-2847',
            memberId: 'MBR-10234',
            aiRecommendation: 'approve',
            confidenceScore: 0.78,
        },
    },
    {
        id: '2',
        executionId: 'exec-002',
        nodeId: 'node-2',
        nodeName: 'Fraud Investigation',
        status: 'pending',
        assignee: { type: 'team', id: 'team-1', name: 'SIU Team' },
        createdAt: new Date(Date.now() - 7200000),
        dueAt: new Date(Date.now() + 43200000),
        escalateAt: new Date(Date.now() + 86400000),
        context: {
            claimId: 'CLM-2845',
            memberId: 'MBR-10567',
            aiRecommendation: 'review',
            confidenceScore: 0.45,
        },
    },
    {
        id: '3',
        executionId: 'exec-003',
        nodeId: 'node-3',
        nodeName: 'Prior Authorization',
        status: 'escalated',
        assignee: { type: 'role', id: 'role-1', name: 'Medical Director' },
        createdAt: new Date(Date.now() - 172800000),
        dueAt: new Date(Date.now() - 86400000),
        escalateAt: new Date(Date.now() - 43200000),
        context: {
            claimId: 'CLM-2801',
            memberId: 'MBR-10098',
            aiRecommendation: 'deny',
            confidenceScore: 0.92,
        },
    },
]

export function HITLQueue() {
    const [items, setItems] = useState<HITLCheckpoint[]>(mockHITLItems)
    const [selectedItem, setSelectedItem] = useState<HITLCheckpoint | null>(null)
    const [filter, setFilter] = useState<'all' | 'pending' | 'escalated'>('all')
    const { resolveCheckpoint } = useWorkflowStore()

    const filteredItems = items.filter(item => {
        if (filter === 'all') return true
        return item.status === filter
    })

    const getTimeRemaining = (dueAt: Date) => {
        const diff = dueAt.getTime() - Date.now()
        if (diff < 0) return 'Overdue'
        const hours = Math.floor(diff / 3600000)
        const minutes = Math.floor((diff % 3600000) / 60000)
        if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`
        if (hours > 0) return `${hours}h ${minutes}m`
        return `${minutes}m`
    }

    const getUrgencyLevel = (dueAt: Date): 'low' | 'medium' | 'high' | 'critical' => {
        const diff = dueAt.getTime() - Date.now()
        if (diff < 0) return 'critical'
        if (diff < 3600000) return 'high'
        if (diff < 14400000) return 'medium'
        return 'low'
    }

    const handleApprove = (item: HITLCheckpoint) => {
        setItems(items.map(i =>
            i.id === item.id
                ? { ...i, status: 'approved' as const, completedAt: new Date() }
                : i
        ))
        setSelectedItem(null)
    }

    const handleReject = (item: HITLCheckpoint) => {
        setItems(items.map(i =>
            i.id === item.id
                ? { ...i, status: 'rejected' as const, completedAt: new Date() }
                : i
        ))
        setSelectedItem(null)
    }

    const pendingCount = items.filter(i => i.status === 'pending').length
    const escalatedCount = items.filter(i => i.status === 'escalated').length

    return (
        <div className="hitl-queue">
            {/* Header */}
            <div className="hitl-queue__header">
                <div>
                    <h2 className="hitl-queue__title">Human Review Queue</h2>
                    <p className="hitl-queue__subtitle">
                        {pendingCount} pending • {escalatedCount} escalated
                    </p>
                </div>
                <div className="hitl-queue__filters">
                    <button
                        className={`hitl-queue__filter ${filter === 'all' ? 'hitl-queue__filter--active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({items.length})
                    </button>
                    <button
                        className={`hitl-queue__filter ${filter === 'pending' ? 'hitl-queue__filter--active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({pendingCount})
                    </button>
                    <button
                        className={`hitl-queue__filter ${filter === 'escalated' ? 'hitl-queue__filter--active' : ''}`}
                        onClick={() => setFilter('escalated')}
                    >
                        Escalated ({escalatedCount})
                    </button>
                </div>
            </div>

            {/* Queue List */}
            <div className="hitl-queue__list">
                <AnimatePresence>
                    {filteredItems.map((item, index) => {
                        const urgency = getUrgencyLevel(item.dueAt)
                        return (
                            <motion.div
                                key={item.id}
                                className={`hitl-queue__item hitl-queue__item--${urgency}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedItem(item)}
                            >
                                <div className="hitl-queue__item-status">
                                    {item.status === 'escalated' ? (
                                        <AlertTriangle size={18} className="text-warning" />
                                    ) : (
                                        <Clock size={18} className="text-info" />
                                    )}
                                </div>

                                <div className="hitl-queue__item-content">
                                    <div className="hitl-queue__item-header">
                                        <span className="hitl-queue__item-title">{item.nodeName}</span>
                                        <Badge
                                            variant={urgency === 'critical' ? 'critical' : urgency === 'high' ? 'warning' : 'secondary'}
                                            size="sm"
                                        >
                                            {getTimeRemaining(item.dueAt)}
                                        </Badge>
                                    </div>

                                    <div className="hitl-queue__item-meta">
                                        <span className="hitl-queue__item-claim">
                                            {item.context.claimId}
                                        </span>
                                        <span className="hitl-queue__item-separator">•</span>
                                        <span className="hitl-queue__item-assignee">
                                            {item.assignee.type === 'user' ? <User size={12} /> : <Users size={12} />}
                                            {item.assignee.name}
                                        </span>
                                    </div>

                                    {/* AI Recommendation */}
                                    <div className="hitl-queue__item-ai">
                                        <span className={`hitl-queue__ai-rec hitl-queue__ai-rec--${item.context.aiRecommendation}`}>
                                            AI: {item.context.aiRecommendation}
                                        </span>
                                        <span className="hitl-queue__ai-confidence">
                                            {Math.round((item.context.confidenceScore || 0) * 100)}% confidence
                                        </span>
                                    </div>
                                </div>

                                <ChevronRight size={18} className="hitl-queue__item-arrow" />
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Detail Panel */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        className="hitl-queue__detail"
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                    >
                        <div className="hitl-queue__detail-header">
                            <h3>{selectedItem.nodeName}</h3>
                            <button
                                className="hitl-queue__detail-close"
                                onClick={() => setSelectedItem(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="hitl-queue__detail-content">
                            <div className="hitl-queue__detail-section">
                                <h4>Claim Information</h4>
                                <div className="hitl-queue__detail-grid">
                                    <div className="hitl-queue__detail-field">
                                        <span className="hitl-queue__detail-label">Claim ID</span>
                                        <span className="hitl-queue__detail-value">{selectedItem.context.claimId}</span>
                                    </div>
                                    <div className="hitl-queue__detail-field">
                                        <span className="hitl-queue__detail-label">Member ID</span>
                                        <span className="hitl-queue__detail-value">{selectedItem.context.memberId}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hitl-queue__detail-section">
                                <h4>AI Analysis</h4>
                                <div className={`hitl-queue__ai-panel hitl-queue__ai-panel--${selectedItem.context.aiRecommendation}`}>
                                    <div className="hitl-queue__ai-header">
                                        <span className="hitl-queue__ai-label">Recommendation</span>
                                        <Badge variant={
                                            selectedItem.context.aiRecommendation === 'approve' ? 'success' :
                                                selectedItem.context.aiRecommendation === 'deny' ? 'critical' : 'warning'
                                        }>
                                            {selectedItem.context.aiRecommendation?.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="hitl-queue__ai-confidence-bar">
                                        <div
                                            className="hitl-queue__ai-confidence-fill"
                                            style={{ width: `${(selectedItem.context.confidenceScore || 0) * 100}%` }}
                                        />
                                    </div>
                                    <span className="hitl-queue__ai-confidence-text">
                                        {Math.round((selectedItem.context.confidenceScore || 0) * 100)}% confidence
                                    </span>
                                </div>
                            </div>

                            <div className="hitl-queue__detail-section">
                                <h4>Timeline</h4>
                                <div className="hitl-queue__timeline">
                                    <div className="hitl-queue__timeline-item">
                                        <Timer size={14} />
                                        <span>Created: {selectedItem.createdAt.toLocaleString()}</span>
                                    </div>
                                    <div className="hitl-queue__timeline-item">
                                        <Clock size={14} />
                                        <span>Due: {selectedItem.dueAt.toLocaleString()}</span>
                                    </div>
                                    <div className="hitl-queue__timeline-item">
                                        <AlertTriangle size={14} />
                                        <span>Escalates: {selectedItem.escalateAt.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="hitl-queue__detail-actions">
                            <Button
                                variant="primary"
                                icon={<CheckCircle2 size={16} />}
                                onClick={() => handleApprove(selectedItem)}
                            >
                                Approve
                            </Button>
                            <Button
                                variant="secondary"
                                icon={<XCircle size={16} />}
                                onClick={() => handleReject(selectedItem)}
                            >
                                Reject
                            </Button>
                            <Button
                                variant="ghost"
                                icon={<MessageSquare size={16} />}
                            >
                                Add Note
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default HITLQueue
