// Workflow Types for Apex Orchestrator
import { Node, Edge } from '@xyflow/react'

// ============================================================
// NODE TYPES
// ============================================================

export type NodeCategory =
    | 'trigger'
    | 'processing'
    | 'ai'
    | 'control'
    | 'hitl'
    | 'output'

export type NodeType =
    // Trigger Nodes
    | 'claimIntake'
    | 'priorAuthRequest'
    | 'scheduledBatch'
    | 'webhook'
    // Processing Nodes
    | 'documentAnalyzer'
    | 'eligibilityCheck'
    | 'medicalCoding'
    | 'policyEngine'
    // AI Nodes
    | 'geminiAnalyzer'
    | 'fraudDetector'
    | 'clinicalReasoner'
    // Control Nodes
    | 'decisionBranch'
    | 'parallelSplit'
    | 'loopIterator'
    // HITL Nodes
    | 'hitlCheckpoint'
    | 'qualityReview'
    | 'exceptionHandler'
    // Output Nodes
    | 'decisionOutput'
    | 'notification'
    | 'apiResponse'
    | 'auditLog'

export interface NodeMetadata {
    type: NodeType
    category: NodeCategory
    label: string
    description: string
    icon: string
    color: string
    inputs: number
    outputs: number
}

export const NODE_REGISTRY: Record<NodeType, NodeMetadata> = {
    // Trigger Nodes
    claimIntake: {
        type: 'claimIntake',
        category: 'trigger',
        label: 'Claim Intake',
        description: 'Workflow entry for new claims',
        icon: '📥',
        color: '#06B6D4',
        inputs: 0,
        outputs: 1,
    },
    priorAuthRequest: {
        type: 'priorAuthRequest',
        category: 'trigger',
        label: 'Prior Auth Request',
        description: 'Prior authorization trigger',
        icon: '🔐',
        color: '#06B6D4',
        inputs: 0,
        outputs: 1,
    },
    scheduledBatch: {
        type: 'scheduledBatch',
        category: 'trigger',
        label: 'Scheduled Batch',
        description: 'Time-based batch processing',
        icon: '⏰',
        color: '#06B6D4',
        inputs: 0,
        outputs: 1,
    },
    webhook: {
        type: 'webhook',
        category: 'trigger',
        label: 'Webhook',
        description: 'External system integration',
        icon: '🔗',
        color: '#06B6D4',
        inputs: 0,
        outputs: 1,
    },
    // Processing Nodes
    documentAnalyzer: {
        type: 'documentAnalyzer',
        category: 'processing',
        label: 'Document Analyzer',
        description: 'Extract data from medical documents',
        icon: '📄',
        color: '#8B5CF6',
        inputs: 1,
        outputs: 1,
    },
    eligibilityCheck: {
        type: 'eligibilityCheck',
        category: 'processing',
        label: 'Eligibility Check',
        description: 'Verify member eligibility',
        icon: '✓',
        color: '#8B5CF6',
        inputs: 1,
        outputs: 2,
    },
    medicalCoding: {
        type: 'medicalCoding',
        category: 'processing',
        label: 'Medical Coding',
        description: 'ICD-10/CPT code validation',
        icon: '🏥',
        color: '#8B5CF6',
        inputs: 1,
        outputs: 1,
    },
    policyEngine: {
        type: 'policyEngine',
        category: 'processing',
        label: 'Policy Engine',
        description: 'Business rules evaluation',
        icon: '📋',
        color: '#8B5CF6',
        inputs: 1,
        outputs: 2,
    },
    // AI Nodes
    geminiAnalyzer: {
        type: 'geminiAnalyzer',
        category: 'ai',
        label: 'Gemini Analyzer',
        description: 'LLM-powered analysis',
        icon: '✨',
        color: '#10B981',
        inputs: 1,
        outputs: 1,
    },
    fraudDetector: {
        type: 'fraudDetector',
        category: 'ai',
        label: 'Fraud Detector',
        description: 'Anomaly/fraud detection',
        icon: '🛡️',
        color: '#10B981',
        inputs: 1,
        outputs: 2,
    },
    clinicalReasoner: {
        type: 'clinicalReasoner',
        category: 'ai',
        label: 'Clinical Reasoner',
        description: 'Medical necessity evaluation',
        icon: '🧠',
        color: '#10B981',
        inputs: 1,
        outputs: 2,
    },
    // Control Nodes
    decisionBranch: {
        type: 'decisionBranch',
        category: 'control',
        label: 'Decision Branch',
        description: 'Conditional routing',
        icon: '◇',
        color: '#F59E0B',
        inputs: 1,
        outputs: 2,
    },
    parallelSplit: {
        type: 'parallelSplit',
        category: 'control',
        label: 'Parallel Split',
        description: 'Concurrent execution',
        icon: '⫸',
        color: '#F59E0B',
        inputs: 1,
        outputs: 3,
    },
    loopIterator: {
        type: 'loopIterator',
        category: 'control',
        label: 'Loop Iterator',
        description: 'Iterate over collections',
        icon: '🔄',
        color: '#F59E0B',
        inputs: 1,
        outputs: 2,
    },
    // HITL Nodes
    hitlCheckpoint: {
        type: 'hitlCheckpoint',
        category: 'hitl',
        label: 'HITL Checkpoint',
        description: 'Human review/approval',
        icon: '👤',
        color: '#EF4444',
        inputs: 1,
        outputs: 2,
    },
    qualityReview: {
        type: 'qualityReview',
        category: 'hitl',
        label: 'Quality Review',
        description: 'QA sampling and audit',
        icon: '✅',
        color: '#EF4444',
        inputs: 1,
        outputs: 2,
    },
    exceptionHandler: {
        type: 'exceptionHandler',
        category: 'hitl',
        label: 'Exception Handler',
        description: 'Manual exception routing',
        icon: '⚠️',
        color: '#EF4444',
        inputs: 1,
        outputs: 2,
    },
    // Output Nodes
    decisionOutput: {
        type: 'decisionOutput',
        category: 'output',
        label: 'Decision Output',
        description: 'Claim approval/denial',
        icon: '📤',
        color: '#64748B',
        inputs: 1,
        outputs: 0,
    },
    notification: {
        type: 'notification',
        category: 'output',
        label: 'Notification',
        description: 'Send alerts/notifications',
        icon: '📧',
        color: '#64748B',
        inputs: 1,
        outputs: 0,
    },
    apiResponse: {
        type: 'apiResponse',
        category: 'output',
        label: 'API Response',
        description: 'External system callback',
        icon: '🔌',
        color: '#64748B',
        inputs: 1,
        outputs: 0,
    },
    auditLog: {
        type: 'auditLog',
        category: 'output',
        label: 'Audit Log',
        description: 'Explicit audit entry',
        icon: '📝',
        color: '#64748B',
        inputs: 1,
        outputs: 0,
    },
}

// ============================================================
// NODE DATA INTERFACES
// ============================================================

export interface BaseNodeData extends Record<string, unknown> {
    label: string
    nodeType: NodeType
    config: Record<string, unknown>
    status?: 'idle' | 'running' | 'completed' | 'error' | 'paused'
    confidenceScore?: number
    executionTime?: number
    error?: string
}

export interface ClaimIntakeConfig {
    source: 'edi' | 'api' | 'upload' | 'manual'
    format: '837' | 'cms1500' | 'ub04' | 'custom'
    validation: boolean
}

export interface GeminiAnalyzerConfig {
    model: 'gemini-2.0-flash' | 'gemini-1.5-pro' | 'gemini-1.5-flash'
    promptTemplate: string
    temperature: number
    maxTokens: number
    systemPrompt: string
}

export interface HITLCheckpointConfig {
    assigneeType: 'user' | 'team' | 'role'
    assigneeId: string
    slaHours: number
    escalationHours: number
    escalateTo: string
    requireReason: boolean
}

export interface DecisionBranchConfig {
    conditions: Array<{
        field: string
        operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'matches'
        value: string
    }>
    logic: 'and' | 'or'
}

export interface DecisionOutputConfig {
    decisionType: 'approve' | 'deny' | 'pend' | 'review'
    reasonCode: string
    letterTemplate: string
    notifyMember: boolean
    notifyProvider: boolean
}

// ============================================================
// WORKFLOW TYPES
// ============================================================

export interface WorkflowNode extends Node<BaseNodeData> {
    type: NodeType
}

export interface WorkflowEdge extends Edge {
    label?: string
    animated?: boolean
}

export interface WorkflowDefinition {
    id: string
    name: string
    description: string
    version: number
    nodes: WorkflowNode[]
    edges: WorkflowEdge[]
    createdAt: Date
    updatedAt: Date
    createdBy: string
    status: 'draft' | 'published' | 'archived'
}

// ============================================================
// EXECUTION TYPES
// ============================================================

export type ExecutionStatus =
    | 'idle'
    | 'running'
    | 'paused'
    | 'completed'
    | 'error'
    | 'waiting_hitl'

export interface ExecutionLog {
    id: string
    nodeId: string
    nodeName: string
    timestamp: Date
    status: 'started' | 'completed' | 'error' | 'skipped' | 'running' | 'paused'
    input: Record<string, unknown>
    output: Record<string, unknown>
    duration: number
    confidenceScore?: number
    error?: string
}

export interface WorkflowExecution {
    id: string
    workflowId: string
    status: ExecutionStatus
    startedAt: Date
    completedAt?: Date
    currentNodeId?: string
    logs: ExecutionLog[]
    context: Record<string, unknown>
    hitlPending?: HITLCheckpoint[]
}

// ============================================================
// HITL TYPES
// ============================================================

export interface HITLCheckpoint {
    id: string
    executionId: string
    nodeId: string
    nodeName: string
    status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'timeout'
    assignee: {
        type: 'user' | 'team' | 'role'
        id: string
        name: string
    }
    createdAt: Date
    dueAt: Date
    escalateAt: Date
    completedAt?: Date
    completedBy?: string
    decision?: 'approve' | 'reject' | 'modify'
    reason?: string
    context: {
        claimId?: string
        memberId?: string
        aiRecommendation?: string
        confidenceScore?: number
        previousDecisions?: Array<{
            nodeId: string
            decision: string
            timestamp: Date
        }>
    }
}

// ============================================================
// AI TYPES
// ============================================================

export interface AIRecommendation {
    decision: 'approve' | 'deny' | 'review'
    confidence: number
    reasoning: string
    factors: Array<{
        factor: string
        impact: 'positive' | 'negative' | 'neutral'
        weight: number
    }>
    suggestedActions?: string[]
}

export interface AnomalyDetection {
    isAnomaly: boolean
    score: number
    patterns: Array<{
        type: string
        description: string
        severity: 'low' | 'medium' | 'high' | 'critical'
    }>
    recommendation: string
}
