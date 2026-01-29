import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useWorkflowValidation } from '../../hooks/useWorkflowValidation'
import { useWorkflowStore } from '../../stores/workflowStore'
import './ValidationPanel.css'

export function ValidationPanel() {
    const [isExpanded, setIsExpanded] = useState(false)
    const { errors, warnings } = useWorkflowValidation()
    const { selectNode } = useWorkflowStore()

    const totalIssues = errors.length + warnings.length

    const handleIssueClick = (nodeId?: string) => {
        if (nodeId) {
            selectNode(nodeId)
        }
    }

    // Only show when there are issues - reduces clutter
    if (totalIssues === 0) {
        return null
    }

    return (
        <motion.div
            className={`validation-panel ${isExpanded ? 'validation-panel--expanded' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <button
                className="validation-panel__header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="validation-panel__summary">
                    {errors.length > 0 && (
                        <span className="validation-panel__count validation-panel__count--error">
                            <AlertCircle size={14} />
                            {errors.length} {errors.length === 1 ? 'error' : 'errors'}
                        </span>
                    )}
                    {warnings.length > 0 && (
                        <span className="validation-panel__count validation-panel__count--warning">
                            <AlertTriangle size={14} />
                            {warnings.length} {warnings.length === 1 ? 'warning' : 'warnings'}
                        </span>
                    )}
                </div>
                {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="validation-panel__list"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        {errors.map(error => (
                            <button
                                key={error.id}
                                className="validation-panel__issue validation-panel__issue--error"
                                onClick={() => handleIssueClick(error.nodeId)}
                            >
                                <AlertCircle size={14} />
                                <span>{error.message}</span>
                                {error.nodeId && (
                                    <span className="validation-panel__node-link">Go to node →</span>
                                )}
                            </button>
                        ))}
                        {warnings.map(warning => (
                            <button
                                key={warning.id}
                                className="validation-panel__issue validation-panel__issue--warning"
                                onClick={() => handleIssueClick(warning.nodeId)}
                            >
                                <AlertTriangle size={14} />
                                <span>{warning.message}</span>
                                {warning.nodeId && (
                                    <span className="validation-panel__node-link">Go to node →</span>
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default ValidationPanel
