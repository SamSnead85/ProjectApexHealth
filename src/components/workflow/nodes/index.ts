// Workflow Node Registry
import { NodeTypes } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import { DecisionNode } from './DecisionNode'

// Node components mapped by type
// Use type assertion to bypass React Flow's strict typing requirements
// Our node components accept a subset of props that React Flow provides
export const nodeTypes: NodeTypes = {
    // Trigger Nodes
    claimIntake: BaseNode as unknown as NodeTypes[string],
    priorAuthRequest: BaseNode as unknown as NodeTypes[string],
    scheduledBatch: BaseNode as unknown as NodeTypes[string],
    webhook: BaseNode as unknown as NodeTypes[string],
    // Processing Nodes
    documentAnalyzer: BaseNode as unknown as NodeTypes[string],
    eligibilityCheck: BaseNode as unknown as NodeTypes[string],
    medicalCoding: BaseNode as unknown as NodeTypes[string],
    policyEngine: BaseNode as unknown as NodeTypes[string],
    // AI Nodes
    geminiAnalyzer: BaseNode as unknown as NodeTypes[string],
    fraudDetector: BaseNode as unknown as NodeTypes[string],
    clinicalReasoner: BaseNode as unknown as NodeTypes[string],
    // Control Nodes - Decision uses special diamond node
    decisionBranch: DecisionNode as unknown as NodeTypes[string],
    parallelSplit: BaseNode as unknown as NodeTypes[string],
    loopIterator: BaseNode as unknown as NodeTypes[string],
    // HITL Nodes
    hitlCheckpoint: BaseNode as unknown as NodeTypes[string],
    qualityReview: BaseNode as unknown as NodeTypes[string],
    exceptionHandler: BaseNode as unknown as NodeTypes[string],
    // Output Nodes
    decisionOutput: BaseNode as unknown as NodeTypes[string],
    notification: BaseNode as unknown as NodeTypes[string],
    apiResponse: BaseNode as unknown as NodeTypes[string],
    auditLog: BaseNode as unknown as NodeTypes[string],
}

export { BaseNode }
export { DecisionNode }
