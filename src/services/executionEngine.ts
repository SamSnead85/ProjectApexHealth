// Workflow Execution Engine
// Handles the step-by-step execution of workflows with real-time status updates

import { v4 as uuidv4 } from 'uuid'
import {
    WorkflowNode,
    WorkflowEdge,
    ExecutionLog,
    ExecutionStatus,
    BaseNodeData,
    NodeType
} from '../types/workflow'
import { geminiService } from './gemini'

interface ExecutionContext {
    claimId?: string
    memberId?: string
    claimData?: Record<string, unknown>
    variables: Record<string, unknown>
    logs: ExecutionLog[]
}

interface ExecutionResult {
    success: boolean
    output: Record<string, unknown>
    confidenceScore?: number
    nextPath?: 'true' | 'false' | 'a' | 'b' | 'c'
    hitlRequired?: boolean
    error?: string
}

type StatusCallback = (nodeId: string, status: BaseNodeData['status'], data?: Partial<BaseNodeData>) => void
type LogCallback = (log: Omit<ExecutionLog, 'id'>) => void

export class WorkflowExecutionEngine {
    private nodes: WorkflowNode[]
    private edges: WorkflowEdge[]
    private context: ExecutionContext
    private onStatusChange: StatusCallback
    private onLog: LogCallback
    private isPaused: boolean = false
    private isStopped: boolean = false

    constructor(
        nodes: WorkflowNode[],
        edges: WorkflowEdge[],
        onStatusChange: StatusCallback,
        onLog: LogCallback,
        initialContext?: Partial<ExecutionContext>
    ) {
        this.nodes = nodes
        this.edges = edges
        this.onStatusChange = onStatusChange
        this.onLog = onLog
        this.context = {
            variables: {},
            logs: [],
            ...initialContext,
        }
    }

    async execute(): Promise<{ success: boolean; context: ExecutionContext }> {
        // Find trigger node(s) - nodes with no incoming edges
        const triggerNodes = this.nodes.filter(node => {
            const hasIncoming = this.edges.some(edge => edge.target === node.id)
            return !hasIncoming
        })

        if (triggerNodes.length === 0) {
            throw new Error('No trigger node found in workflow')
        }

        // Execute from each trigger node
        for (const triggerNode of triggerNodes) {
            if (this.isStopped) break
            await this.executeNode(triggerNode)
        }

        return {
            success: !this.isStopped,
            context: this.context,
        }
    }

    private async executeNode(node: WorkflowNode): Promise<void> {
        if (this.isStopped) return

        // Wait if paused
        while (this.isPaused && !this.isStopped) {
            await this.delay(100)
        }

        const nodeData = node.data as BaseNodeData
        const startTime = Date.now()

        // Update status to running
        this.onStatusChange(node.id, 'running')

        try {
            // Execute based on node type
            const result = await this.executeNodeLogic(node)

            const duration = Date.now() - startTime

            // Log execution
            this.onLog({
                nodeId: node.id,
                nodeName: nodeData.label,
                timestamp: new Date(),
                status: result.success ? 'completed' : 'error',
                input: this.context.variables,
                output: result.output,
                duration,
                confidenceScore: result.confidenceScore,
                error: result.error,
            })

            // Update node status
            this.onStatusChange(node.id, result.success ? 'completed' : 'error', {
                confidenceScore: result.confidenceScore,
                executionTime: duration,
                error: result.error,
            })

            // Store output in context
            this.context.variables = {
                ...this.context.variables,
                [`${node.id}_output`]: result.output,
                lastOutput: result.output,
            }

            // If HITL is required, pause execution
            if (result.hitlRequired) {
                this.onStatusChange(node.id, 'paused')
                return // Will be resumed after HITL approval
            }

            // Find and execute next nodes
            if (result.success) {
                const nextNodes = this.getNextNodes(node.id, result.nextPath)

                // Add visual delay for better UX
                await this.delay(300)

                for (const nextNode of nextNodes) {
                    await this.executeNode(nextNode)
                }
            }
        } catch (error) {
            this.onStatusChange(node.id, 'error', {
                error: error instanceof Error ? error.message : 'Unknown error',
            })

            this.onLog({
                nodeId: node.id,
                nodeName: nodeData.label,
                timestamp: new Date(),
                status: 'error',
                input: this.context.variables,
                output: {},
                duration: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Unknown error',
            })
        }
    }

    private async executeNodeLogic(node: WorkflowNode): Promise<ExecutionResult> {
        const nodeData = node.data as BaseNodeData
        const nodeType = nodeData.nodeType as NodeType
        const config = nodeData.config || {}

        switch (nodeType) {
            // Trigger nodes - just pass through
            case 'claimIntake':
            case 'priorAuthRequest':
            case 'scheduledBatch':
            case 'webhook':
                return {
                    success: true,
                    output: {
                        triggered: true,
                        timestamp: new Date().toISOString(),
                        source: config.source || 'manual',
                    },
                }

            // Processing nodes
            case 'eligibilityCheck':
                // Simulate eligibility check
                await this.delay(500)
                const isEligible = Math.random() > 0.1 // 90% eligible
                return {
                    success: true,
                    output: { eligible: isEligible, reason: isEligible ? 'Active coverage' : 'Coverage terminated' },
                    confidenceScore: 0.99,
                    nextPath: isEligible ? 'true' : 'false',
                }

            case 'documentAnalyzer':
                // Use Gemini to analyze documents
                await this.delay(800)
                const docAnalysis = {
                    documentType: 'Medical Claim',
                    extractedFields: {
                        serviceDate: '2024-01-15',
                        procedureCode: '99213',
                        diagnosisCode: 'J06.9',
                        chargedAmount: 150.00,
                    },
                    confidence: 0.94,
                }
                return {
                    success: true,
                    output: docAnalysis,
                    confidenceScore: docAnalysis.confidence,
                }

            case 'medicalCoding':
                await this.delay(600)
                return {
                    success: true,
                    output: {
                        validCodes: true,
                        cptCode: '99213',
                        icd10Code: 'J06.9',
                        modifiers: [],
                    },
                    confidenceScore: 0.97,
                }

            case 'policyEngine':
                await this.delay(400)
                const policyPass = Math.random() > 0.15
                return {
                    success: true,
                    output: { passed: policyPass, appliedRules: ['Rule-101', 'Rule-203'] },
                    confidenceScore: 0.95,
                    nextPath: policyPass ? 'true' : 'false',
                }

            // AI nodes
            case 'geminiAnalyzer':
                try {
                    await this.delay(1000)
                    // Would call actual Gemini API here
                    const aiAnalysis = {
                        recommendation: 'approve',
                        reasoning: 'Claim meets all coverage criteria',
                        factors: [
                            { factor: 'Valid procedure code', impact: 'positive' },
                            { factor: 'Within policy limits', impact: 'positive' },
                        ],
                    }
                    return {
                        success: true,
                        output: aiAnalysis,
                        confidenceScore: 0.89,
                    }
                } catch {
                    return {
                        success: false,
                        output: {},
                        error: 'AI analysis failed',
                    }
                }

            case 'fraudDetector':
                await this.delay(700)
                const fraudScore = Math.random()
                const isAnomaly = fraudScore > 0.8
                return {
                    success: true,
                    output: {
                        anomalyScore: fraudScore,
                        isAnomaly,
                        patterns: isAnomaly ? ['Unusual billing frequency'] : [],
                    },
                    confidenceScore: 0.92,
                    nextPath: isAnomaly ? 'true' : 'false',
                }

            case 'clinicalReasoner':
                await this.delay(900)
                const isMedicallyNecessary = Math.random() > 0.2
                return {
                    success: true,
                    output: {
                        medicallyNecessary: isMedicallyNecessary,
                        reasoning: isMedicallyNecessary
                            ? 'Procedure aligns with diagnosis and treatment guidelines'
                            : 'Alternative treatments not exhausted',
                    },
                    confidenceScore: 0.85,
                    nextPath: isMedicallyNecessary ? 'true' : 'false',
                }

            // Control nodes
            case 'decisionBranch':
                await this.delay(100)
                const conditionMet = this.evaluateCondition(config)
                return {
                    success: true,
                    output: { conditionMet },
                    nextPath: conditionMet ? 'true' : 'false',
                }

            case 'parallelSplit':
                // All paths execute
                return {
                    success: true,
                    output: { splitPaths: ['a', 'b', 'c'] },
                }

            case 'loopIterator':
                return {
                    success: true,
                    output: { iteration: 1, total: 5 },
                    nextPath: 'true',
                }

            // HITL nodes
            case 'hitlCheckpoint':
            case 'qualityReview':
            case 'exceptionHandler':
                return {
                    success: true,
                    output: {
                        requiresHumanReview: true,
                        assignee: config.assigneeType || 'team',
                        sla: config.slaHours || 24,
                    },
                    hitlRequired: true,
                }

            // Output nodes
            case 'decisionOutput':
                return {
                    success: true,
                    output: {
                        decision: config.decisionType || 'approve',
                        reasonCode: config.reasonCode || 'A1',
                        timestamp: new Date().toISOString(),
                    },
                }

            case 'notification':
                await this.delay(200)
                return {
                    success: true,
                    output: {
                        notificationSent: true,
                        channels: ['email', 'portal'],
                    },
                }

            case 'apiResponse':
                return {
                    success: true,
                    output: {
                        responseCode: 200,
                        payload: this.context.variables.lastOutput,
                    },
                }

            case 'auditLog':
                return {
                    success: true,
                    output: {
                        logged: true,
                        entries: this.context.logs.length + 1,
                    },
                }

            default:
                return {
                    success: true,
                    output: { executed: true },
                }
        }
    }

    private getNextNodes(nodeId: string, path?: string): WorkflowNode[] {
        const outgoingEdges = this.edges.filter(edge => {
            if (edge.source !== nodeId) return false
            if (path && edge.sourceHandle) {
                return edge.sourceHandle === path
            }
            return true
        })

        return outgoingEdges
            .map(edge => this.nodes.find(n => n.id === edge.target))
            .filter((n): n is WorkflowNode => n !== undefined)
    }

    private evaluateCondition(config: Record<string, unknown>): boolean {
        const field = config.conditionField as string
        const operator = config.operator as string
        const compareValue = config.compareValue as string

        const actualValue = this.context.variables[field]

        switch (operator) {
            case 'equals':
                return actualValue === compareValue
            case 'notEquals':
                return actualValue !== compareValue
            case 'greaterThan':
                return Number(actualValue) > Number(compareValue)
            case 'lessThan':
                return Number(actualValue) < Number(compareValue)
            case 'contains':
                return String(actualValue).includes(compareValue)
            default:
                return true
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    pause(): void {
        this.isPaused = true
    }

    resume(): void {
        this.isPaused = false
    }

    stop(): void {
        this.isStopped = true
        this.isPaused = false
    }
}

export default WorkflowExecutionEngine
