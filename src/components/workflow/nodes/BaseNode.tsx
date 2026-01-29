import { memo, ReactNode } from 'react'
import { Handle, Position } from '@xyflow/react'
import { motion } from 'framer-motion'
import { BaseNodeData, NODE_REGISTRY, NodeType } from '../../../types/workflow'
import './BaseNode.css'

// Simple props interface for React Flow compatibility
interface BaseNodeProps {
    id: string
    data: BaseNodeData
    selected?: boolean
    children?: ReactNode
}

export const BaseNode = memo(({ data, selected, id }: BaseNodeProps) => {
    const { nodeType, label, status, confidenceScore } = data
    const metadata = NODE_REGISTRY[nodeType as NodeType]

    if (!metadata) return null

    const getStatusClass = () => {
        switch (status) {
            case 'running': return 'workflow-node--running'
            case 'completed': return 'workflow-node--completed'
            case 'error': return 'workflow-node--error'
            case 'paused': return 'workflow-node--paused'
            default: return ''
        }
    }

    return (
        <motion.div
            className={`workflow-node ${getStatusClass()} ${selected ? 'workflow-node--selected' : ''}`}
            style={{ '--node-color': metadata.color } as React.CSSProperties}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            layoutId={id}
        >
            {/* Input Handles */}
            {metadata.inputs > 0 && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className="workflow-node__handle workflow-node__handle--target"
                />
            )}

            {/* Node Content */}
            <div className="workflow-node__header">
                <span className="workflow-node__icon">{metadata.icon}</span>
                <div className="workflow-node__info">
                    <span className="workflow-node__label">{label}</span>
                    <span className="workflow-node__type">{metadata.category}</span>
                </div>
            </div>

            {/* Status Indicator */}
            {status && status !== 'idle' && (
                <div className={`workflow-node__status workflow-node__status--${status}`}>
                    {status === 'running' && <span className="workflow-node__spinner" />}
                    {status === 'completed' && '✓'}
                    {status === 'error' && '✕'}
                    {status === 'paused' && '⏸'}
                </div>
            )}

            {/* Confidence Score */}
            {confidenceScore !== undefined && (
                <div className="workflow-node__confidence">
                    <div
                        className="workflow-node__confidence-bar"
                        style={{ width: `${confidenceScore * 100}%` }}
                    />
                    <span className="workflow-node__confidence-label">
                        {Math.round(confidenceScore * 100)}%
                    </span>
                </div>
            )}

            {/* Output Handles */}
            {metadata.outputs === 1 && (
                <Handle
                    type="source"
                    position={Position.Right}
                    className="workflow-node__handle workflow-node__handle--source"
                />
            )}
            {metadata.outputs === 2 && (
                <>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="true"
                        className="workflow-node__handle workflow-node__handle--source workflow-node__handle--true"
                        style={{ top: '35%' }}
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="false"
                        className="workflow-node__handle workflow-node__handle--source workflow-node__handle--false"
                        style={{ top: '65%' }}
                    />
                </>
            )}
            {metadata.outputs === 3 && (
                <>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="a"
                        className="workflow-node__handle workflow-node__handle--source"
                        style={{ top: '25%' }}
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="b"
                        className="workflow-node__handle workflow-node__handle--source"
                        style={{ top: '50%' }}
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="c"
                        className="workflow-node__handle workflow-node__handle--source"
                        style={{ top: '75%' }}
                    />
                </>
            )}
        </motion.div>
    )
})

BaseNode.displayName = 'BaseNode'

export default BaseNode
