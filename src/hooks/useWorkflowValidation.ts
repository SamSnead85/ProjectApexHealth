import { useEffect, useCallback, useMemo } from 'react'
import { useWorkflowStore } from '../stores/workflowStore'
import { NODE_REGISTRY, NodeType } from '../types/workflow'

interface ValidationRule {
    id: string
    type: 'error' | 'warning' | 'info'
    message: string
    nodeId?: string
    edgeId?: string
}

interface UseWorkflowValidationResult {
    errors: ValidationRule[]
    warnings: ValidationRule[]
    isValid: boolean
    validateWorkflow: () => ValidationRule[]
    getNodeErrors: (nodeId: string) => ValidationRule[]
}

export function useWorkflowValidation(): UseWorkflowValidationResult {
    const { nodes, edges } = useWorkflowStore()

    const validateWorkflow = useCallback((): ValidationRule[] => {
        const rules: ValidationRule[] = []

        // Rule 1: Must have at least one trigger node
        const triggerNodes = nodes.filter(n => {
            const meta = NODE_REGISTRY[n.type as NodeType]
            return meta?.category === 'trigger'
        })

        if (triggerNodes.length === 0 && nodes.length > 0) {
            rules.push({
                id: 'no-trigger',
                type: 'error',
                message: 'Workflow must have at least one trigger node to start execution'
            })
        }

        // Rule 2: Check for orphan nodes (no connections)
        nodes.forEach(node => {
            const hasIncoming = edges.some(e => e.target === node.id)
            const hasOutgoing = edges.some(e => e.source === node.id)
            const meta = NODE_REGISTRY[node.type as NodeType]

            // Trigger nodes don't need incoming
            if (meta?.category === 'trigger' && !hasOutgoing && nodes.length > 1) {
                rules.push({
                    id: `orphan-${node.id}`,
                    type: 'warning',
                    message: `${node.data?.label || 'Node'} has no outgoing connections`,
                    nodeId: node.id
                })
            }

            // Output nodes don't need outgoing
            if (meta?.category === 'output' && !hasIncoming) {
                rules.push({
                    id: `no-input-${node.id}`,
                    type: 'warning',
                    message: `${node.data?.label || 'Node'} has no incoming connections`,
                    nodeId: node.id
                })
            }

            // Other nodes should have both
            if (meta?.category !== 'trigger' && meta?.category !== 'output') {
                if (!hasIncoming && !hasOutgoing && nodes.length > 1) {
                    rules.push({
                        id: `isolated-${node.id}`,
                        type: 'error',
                        message: `${node.data?.label || 'Node'} is isolated (no connections)`,
                        nodeId: node.id
                    })
                }
            }
        })

        // Rule 3: Check for required node configurations
        nodes.forEach(node => {
            const meta = NODE_REGISTRY[node.type as NodeType]

            // HITL nodes should have reviewer assigned
            if (meta?.category === 'hitl' && !node.data?.config?.reviewer) {
                rules.push({
                    id: `config-${node.id}`,
                    type: 'warning',
                    message: `${node.data?.label || 'HITL Node'} should have a reviewer assigned`,
                    nodeId: node.id
                })
            }
        })

        // Rule 4: Check for circular dependencies (basic)
        // This is a simplified check - a full implementation would use DFS
        const visited = new Set<string>()
        const checkCycle = (nodeId: string, path: string[]): boolean => {
            if (path.includes(nodeId)) return true
            if (visited.has(nodeId)) return false

            visited.add(nodeId)
            const outEdges = edges.filter(e => e.source === nodeId)

            for (const edge of outEdges) {
                if (checkCycle(edge.target, [...path, nodeId])) {
                    return true
                }
            }
            return false
        }

        triggerNodes.forEach(trigger => {
            if (checkCycle(trigger.id, [])) {
                rules.push({
                    id: 'circular-dependency',
                    type: 'error',
                    message: 'Workflow contains circular dependencies'
                })
            }
        })

        return rules
    }, [nodes, edges])

    const validationResults = useMemo(() => validateWorkflow(), [validateWorkflow])

    const errors = useMemo(
        () => validationResults.filter(r => r.type === 'error'),
        [validationResults]
    )

    const warnings = useMemo(
        () => validationResults.filter(r => r.type === 'warning'),
        [validationResults]
    )

    const getNodeErrors = useCallback(
        (nodeId: string) => validationResults.filter(r => r.nodeId === nodeId),
        [validationResults]
    )

    return {
        errors,
        warnings,
        isValid: errors.length === 0,
        validateWorkflow,
        getNodeErrors
    }
}

// Keyboard shortcuts hook
export function useWorkflowKeyboardShortcuts() {
    const {
        selectedNodeId,
        deleteNode,
        duplicateNode,
        selectNode,
        saveWorkflow,
        toggleAIAssistant
    } = useWorkflowStore()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) {
                return
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
            const cmdKey = isMac ? e.metaKey : e.ctrlKey

            // Delete selected node
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
                e.preventDefault()
                deleteNode(selectedNodeId)
            }

            // Duplicate selected node
            if (cmdKey && e.key === 'd' && selectedNodeId) {
                e.preventDefault()
                duplicateNode(selectedNodeId)
            }

            // Save workflow
            if (cmdKey && e.key === 's') {
                e.preventDefault()
                saveWorkflow()
            }

            // Deselect all
            if (e.key === 'Escape') {
                selectNode(null)
            }

            // Toggle AI assistant
            if (e.key === ']') {
                toggleAIAssistant()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedNodeId, deleteNode, duplicateNode, selectNode, saveWorkflow, toggleAIAssistant])
}

export default useWorkflowValidation
