import { useEffect, useRef, useCallback } from 'react'
import { useWorkflowStore } from '../stores/workflowStore'

interface AutoSaveOptions {
    debounceMs?: number
    enabled?: boolean
    onSave?: () => void
}

/**
 * Auto-save hook for workflow builder
 * Automatically saves workflow changes after a debounce period
 */
export function useWorkflowAutoSave(options: AutoSaveOptions = {}) {
    const {
        debounceMs = 5000, // 5 seconds default
        enabled = true,
        onSave
    } = options

    const { nodes, edges, workflow, saveWorkflow } = useWorkflowStore()
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const lastSaveRef = useRef<string>('')

    // Create a hash of current state to detect changes
    const createStateHash = useCallback(() => {
        return JSON.stringify({
            nodeCount: nodes.length,
            edgeCount: edges.length,
            nodeIds: nodes.map(n => n.id).sort(),
            edgeIds: edges.map(e => e.id).sort()
        })
    }, [nodes, edges])

    // Save function
    const save = useCallback(() => {
        if (!workflow || !enabled) return

        const currentHash = createStateHash()
        if (currentHash === lastSaveRef.current) return // No changes

        saveWorkflow()
        lastSaveRef.current = currentHash
        onSave?.()
    }, [workflow, enabled, createStateHash, saveWorkflow, onSave])

    // Debounced auto-save effect
    useEffect(() => {
        if (!enabled || !workflow) return

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // Set new timeout for auto-save
        timeoutRef.current = setTimeout(() => {
            save()
        }, debounceMs)

        // Cleanup on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [nodes, edges, enabled, debounceMs, save, workflow])

    // Save before page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (workflow && enabled) {
                save()
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [workflow, enabled, save])

    return { save }
}

export default useWorkflowAutoSave
