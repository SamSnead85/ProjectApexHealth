import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { motion } from 'framer-motion'
import { ChevronRight, Settings2 } from 'lucide-react'
import { NODE_REGISTRY, NodeType, DecisionBranchConfig, BaseNodeData } from '../../../types/workflow'
import { useWorkflowStore } from '../../../stores/workflowStore'
import './DecisionNode.css'

// DecisionNode props - using any for React Flow compatibility
interface DecisionNodeProps {
    id: string
    data: BaseNodeData & { config?: DecisionBranchConfig }
    selected?: boolean
}

export const DecisionNode = memo(({ data, selected, id }: DecisionNodeProps) => {
    const { nodeType, label, status, confidenceScore, config } = data
    const metadata = NODE_REGISTRY[nodeType as NodeType]
    const { selectNode } = useWorkflowStore()

    if (!metadata) return null

    // Cast config to DecisionBranchConfig
    const decisionConfig = config as DecisionBranchConfig | undefined

    // Get condition preview text
    const getConditionPreview = () => {
        if (!decisionConfig?.conditions || decisionConfig.conditions.length === 0) {
            return 'Click to set condition'
        }
        const firstCondition = decisionConfig.conditions[0]
        const operatorMap: Record<string, string> = {
            'equals': '=',
            'notEquals': '≠',
            'greaterThan': '>',
            'lessThan': '<',
            'contains': '∈',
            'matches': '≈'
        }
        const operator = operatorMap[firstCondition.operator] || firstCondition.operator

        const value = firstCondition.value.startsWith('$')
            ? firstCondition.value
            : `"${firstCondition.value}"`

        let preview = `${firstCondition.field} ${operator} ${value}`

        if (decisionConfig.conditions.length > 1) {
            preview += ` ${decisionConfig.logic.toUpperCase()} +${decisionConfig.conditions.length - 1}`
        }

        return preview
    }

    const getStatusClass = () => {
        switch (status) {
            case 'running': return 'decision-node--running'
            case 'completed': return 'decision-node--completed'
            case 'error': return 'decision-node--error'
            case 'paused': return 'decision-node--paused'
            default: return ''
        }
    }

    return (
        <motion.div
            className={`decision-node ${getStatusClass()} ${selected ? 'decision-node--selected' : ''}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            layoutId={id}
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="decision-node__handle decision-node__handle--target"
            />

            {/* Diamond Container */}
            <div className="decision-node__diamond">
                <div className="decision-node__diamond-inner">
                    {/* Icon */}
                    <span className="decision-node__icon">◇</span>

                    {/* Condition Preview */}
                    <div className="decision-node__condition">
                        <span className="decision-node__condition-text">
                            {getConditionPreview()}
                        </span>
                    </div>
                </div>

                {/* Status Indicator */}
                {status && status !== 'idle' && (
                    <div className={`decision-node__status decision-node__status--${status}`}>
                        {status === 'running' && <span className="decision-node__spinner" />}
                        {status === 'completed' && '✓'}
                        {status === 'error' && '✕'}
                        {status === 'paused' && '⏸'}
                    </div>
                )}

                {/* AI Confidence */}
                {confidenceScore !== undefined && (
                    <div className="decision-node__confidence">
                        <span className="decision-node__confidence-value">
                            {Math.round(confidenceScore * 100)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Label */}
            <div className="decision-node__label">
                {label || 'Decision'}
            </div>

            {/* Path Labels */}
            <div className="decision-node__paths">
                <div className="decision-node__path decision-node__path--true">
                    <span className="decision-node__path-label">Yes</span>
                    <ChevronRight size={12} />
                </div>
                <div className="decision-node__path decision-node__path--false">
                    <span className="decision-node__path-label">No</span>
                    <ChevronRight size={12} />
                </div>
            </div>

            {/* Output Handles - True/False */}
            <Handle
                type="source"
                position={Position.Right}
                id="true"
                className="decision-node__handle decision-node__handle--source decision-node__handle--true"
                style={{ top: '35%' }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="false"
                className="decision-node__handle decision-node__handle--source decision-node__handle--false"
                style={{ top: '65%' }}
            />

            {/* Configure Button */}
            <button
                className="decision-node__config-btn"
                onClick={(e) => {
                    e.stopPropagation()
                    selectNode(id)
                }}
                title="Configure condition"
            >
                <Settings2 size={12} />
            </button>
        </motion.div>
    )
})

DecisionNode.displayName = 'DecisionNode'

export default DecisionNode
