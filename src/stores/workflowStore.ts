// Workflow State Management with Zustand
import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import {
    WorkflowNode,
    WorkflowEdge,
    WorkflowDefinition,
    WorkflowExecution,
    ExecutionStatus,
    ExecutionLog,
    HITLCheckpoint,
    BaseNodeData,
    NodeType,
    NODE_REGISTRY
} from '../types/workflow'

interface WorkflowState {
    // Current workflow
    workflow: WorkflowDefinition | null
    nodes: WorkflowNode[]
    edges: WorkflowEdge[]

    // Selection state
    selectedNodeId: string | null
    selectedEdgeId: string | null

    // Execution state
    execution: WorkflowExecution | null
    executionStatus: ExecutionStatus
    currentNodeId: string | null
    executionLogs: ExecutionLog[]

    // HITL state
    pendingCheckpoints: HITLCheckpoint[]

    // UI state
    isPaletteOpen: boolean
    isConfigPanelOpen: boolean
    isAIAssistantOpen: boolean
    zoom: number

    // Actions - Workflow Management
    createWorkflow: (name: string, description: string) => void
    loadWorkflow: (workflow: WorkflowDefinition) => void
    saveWorkflow: () => WorkflowDefinition | null
    clearWorkflow: () => void

    // Actions - Node Management
    addNode: (type: NodeType, position: { x: number; y: number }) => void
    updateNode: (nodeId: string, data: Partial<BaseNodeData>) => void
    deleteNode: (nodeId: string) => void
    duplicateNode: (nodeId: string) => void
    selectNode: (nodeId: string | null) => void

    // Actions - Edge Management
    addEdge: (source: string, target: string, sourceHandle?: string, targetHandle?: string) => void
    deleteEdge: (edgeId: string) => void
    selectEdge: (edgeId: string | null) => void

    // Actions - Execution
    startExecution: () => void
    pauseExecution: () => void
    resumeExecution: () => void
    stopExecution: () => void
    updateNodeStatus: (nodeId: string, status: BaseNodeData['status']) => void
    addExecutionLog: (log: Omit<ExecutionLog, 'id'>) => void

    // Actions - HITL
    addCheckpoint: (checkpoint: Omit<HITLCheckpoint, 'id'>) => void
    resolveCheckpoint: (checkpointId: string, decision: 'approve' | 'reject', reason?: string) => void

    // Actions - UI
    setNodes: (nodes: WorkflowNode[]) => void
    setEdges: (edges: WorkflowEdge[]) => void
    togglePalette: () => void
    toggleConfigPanel: () => void
    toggleAIAssistant: () => void
    setZoom: (zoom: number) => void
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
    // Initial state
    workflow: null,
    nodes: [],
    edges: [],
    selectedNodeId: null,
    selectedEdgeId: null,
    execution: null,
    executionStatus: 'idle',
    currentNodeId: null,
    executionLogs: [],
    pendingCheckpoints: [],
    isPaletteOpen: true,
    isConfigPanelOpen: false,
    isAIAssistantOpen: false,
    zoom: 1,

    // Workflow Management Actions
    createWorkflow: (name, description) => {
        const workflow: WorkflowDefinition = {
            id: uuidv4(),
            name,
            description,
            version: 1,
            nodes: [],
            edges: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'current-user',
            status: 'draft',
        }
        set({ workflow, nodes: [], edges: [] })
    },

    loadWorkflow: (workflow) => {
        set({
            workflow,
            nodes: workflow.nodes,
            edges: workflow.edges,
            selectedNodeId: null,
            selectedEdgeId: null,
        })
    },

    saveWorkflow: () => {
        const { workflow, nodes, edges } = get()
        if (!workflow) return null

        const updated: WorkflowDefinition = {
            ...workflow,
            nodes,
            edges,
            updatedAt: new Date(),
            version: workflow.version + 1,
        }
        set({ workflow: updated })
        return updated
    },

    clearWorkflow: () => {
        set({
            workflow: null,
            nodes: [],
            edges: [],
            selectedNodeId: null,
            selectedEdgeId: null,
            execution: null,
            executionStatus: 'idle',
            executionLogs: [],
        })
    },

    // Node Management Actions
    addNode: (type, position) => {
        const metadata = NODE_REGISTRY[type]
        const newNode: WorkflowNode = {
            id: uuidv4(),
            type,
            position,
            data: {
                label: metadata.label,
                nodeType: type,
                config: {},
                status: 'idle',
            },
        }
        set((state) => ({ nodes: [...state.nodes, newNode] }))
    },

    updateNode: (nodeId, data) => {
        set((state) => ({
            nodes: state.nodes.map((node) =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, ...data } }
                    : node
            ),
        }))
    },

    deleteNode: (nodeId) => {
        set((state) => ({
            nodes: state.nodes.filter((node) => node.id !== nodeId),
            edges: state.edges.filter(
                (edge) => edge.source !== nodeId && edge.target !== nodeId
            ),
            selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        }))
    },

    selectNode: (nodeId) => {
        set({
            selectedNodeId: nodeId,
            selectedEdgeId: null,
            isConfigPanelOpen: nodeId !== null,
        })
    },

    duplicateNode: (nodeId) => {
        const { nodes } = get()
        const nodeToDuplicate = nodes.find(n => n.id === nodeId)
        if (!nodeToDuplicate) return

        const newNode: WorkflowNode = {
            id: uuidv4(),
            type: nodeToDuplicate.type,
            position: {
                x: nodeToDuplicate.position.x + 50,
                y: nodeToDuplicate.position.y + 50,
            },
            data: {
                ...nodeToDuplicate.data,
                label: `${nodeToDuplicate.data.label} (Copy)`,
                status: 'idle',
            },
        }
        set((state) => ({ nodes: [...state.nodes, newNode], selectedNodeId: newNode.id }))
    },

    // Edge Management Actions
    addEdge: (source, target, sourceHandle, targetHandle) => {
        const newEdge: WorkflowEdge = {
            id: uuidv4(),
            source,
            target,
            sourceHandle,
            targetHandle,
            animated: false,
        }
        set((state) => ({ edges: [...state.edges, newEdge] }))
    },

    deleteEdge: (edgeId) => {
        set((state) => ({
            edges: state.edges.filter((edge) => edge.id !== edgeId),
            selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
        }))
    },

    selectEdge: (edgeId) => {
        set({ selectedEdgeId: edgeId, selectedNodeId: null })
    },

    // Execution Actions
    startExecution: () => {
        const { workflow, nodes, edges } = get()
        if (!workflow) return

        const execution: WorkflowExecution = {
            id: uuidv4(),
            workflowId: workflow.id,
            status: 'running',
            startedAt: new Date(),
            logs: [],
            context: {},
        }

        // Reset all node statuses
        const resetNodes = nodes.map((node) => ({
            ...node,
            data: { ...node.data, status: 'idle' as const },
        }))

        // Animate edges
        const animatedEdges = edges.map((edge) => ({
            ...edge,
            animated: true,
        }))

        set({
            execution,
            executionStatus: 'running',
            nodes: resetNodes,
            edges: animatedEdges,
            executionLogs: [],
        })
    },

    pauseExecution: () => {
        set((state) => ({
            executionStatus: 'paused',
            execution: state.execution
                ? { ...state.execution, status: 'paused' }
                : null,
        }))
    },

    resumeExecution: () => {
        set((state) => ({
            executionStatus: 'running',
            execution: state.execution
                ? { ...state.execution, status: 'running' }
                : null,
        }))
    },

    stopExecution: () => {
        const { edges } = get()
        const staticEdges = edges.map((edge) => ({
            ...edge,
            animated: false,
        }))

        set((state) => ({
            executionStatus: 'idle',
            currentNodeId: null,
            edges: staticEdges,
            execution: state.execution
                ? { ...state.execution, status: 'completed', completedAt: new Date() }
                : null,
        }))
    },

    updateNodeStatus: (nodeId, status) => {
        set((state) => ({
            nodes: state.nodes.map((node) =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, status } }
                    : node
            ),
            currentNodeId: status === 'running' ? nodeId : state.currentNodeId,
        }))
    },

    addExecutionLog: (log) => {
        const newLog: ExecutionLog = {
            ...log,
            id: uuidv4(),
        }
        set((state) => ({
            executionLogs: [...state.executionLogs, newLog],
            execution: state.execution
                ? { ...state.execution, logs: [...state.execution.logs, newLog] }
                : null,
        }))
    },

    // HITL Actions
    addCheckpoint: (checkpoint) => {
        const newCheckpoint: HITLCheckpoint = {
            ...checkpoint,
            id: uuidv4(),
        }
        set((state) => ({
            pendingCheckpoints: [...state.pendingCheckpoints, newCheckpoint],
            executionStatus: 'waiting_hitl',
        }))
    },

    resolveCheckpoint: (checkpointId, decision, reason) => {
        set((state) => {
            const resolved = state.pendingCheckpoints.find((c) => c.id === checkpointId)
            if (!resolved) return state

            const updatedCheckpoints = state.pendingCheckpoints.filter(
                (c) => c.id !== checkpointId
            )

            return {
                pendingCheckpoints: updatedCheckpoints,
                executionStatus: updatedCheckpoints.length === 0 ? 'running' : 'waiting_hitl',
            }
        })
    },

    // UI Actions
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    togglePalette: () => set((state) => ({ isPaletteOpen: !state.isPaletteOpen })),
    toggleConfigPanel: () => set((state) => ({ isConfigPanelOpen: !state.isConfigPanelOpen })),
    toggleAIAssistant: () => set((state) => ({ isAIAssistantOpen: !state.isAIAssistantOpen })),
    setZoom: (zoom) => set({ zoom }),
}))

export default useWorkflowStore
