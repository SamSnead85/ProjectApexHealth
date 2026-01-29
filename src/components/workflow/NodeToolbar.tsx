import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Trash2, Settings, Zap, CheckCircle, AlertCircle, Clock, Loader } from 'lucide-react'
import { useWorkflowStore } from '../../stores/workflowStore'
import './NodeToolbar.css'

interface NodeToolbarProps {
    nodeId: string
    position: { x: number; y: number }
    status?: 'idle' | 'running' | 'completed' | 'error' | 'pending'
    isVisible: boolean
}

export function NodeToolbar({ nodeId, position, status = 'idle', isVisible }: NodeToolbarProps) {
    const { duplicateNode, deleteNode, selectNode } = useWorkflowStore()
    const [showConfirmDelete, setShowConfirmDelete] = useState(false)

    const handleEdit = () => {
        selectNode(nodeId)
    }

    const handleDuplicate = () => {
        duplicateNode(nodeId)
    }

    const handleDelete = () => {
        if (showConfirmDelete) {
            deleteNode(nodeId)
            setShowConfirmDelete(false)
        } else {
            setShowConfirmDelete(true)
            // Reset after 2 seconds
            setTimeout(() => setShowConfirmDelete(false), 2000)
        }
    }

    const getStatusIcon = () => {
        switch (status) {
            case 'running':
                return <Loader size={12} className="node-toolbar__status-icon--running" />
            case 'completed':
                return <CheckCircle size={12} className="node-toolbar__status-icon--success" />
            case 'error':
                return <AlertCircle size={12} className="node-toolbar__status-icon--error" />
            case 'pending':
                return <Clock size={12} className="node-toolbar__status-icon--pending" />
            default:
                return null
        }
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="node-toolbar"
                    style={{
                        left: position.x,
                        top: position.y - 40,
                    }}
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                >
                    {/* Status indicator */}
                    {status !== 'idle' && (
                        <div className={`node-toolbar__status node-toolbar__status--${status}`}>
                            {getStatusIcon()}
                        </div>
                    )}

                    {/* Quick actions */}
                    <button
                        className="node-toolbar__btn"
                        onClick={handleEdit}
                        title="Edit node (Enter)"
                    >
                        <Settings size={14} />
                    </button>

                    <button
                        className="node-toolbar__btn"
                        onClick={handleDuplicate}
                        title="Duplicate (⌘D)"
                    >
                        <Copy size={14} />
                    </button>

                    <button
                        className="node-toolbar__btn node-toolbar__btn--run"
                        title="Run from here"
                    >
                        <Zap size={14} />
                    </button>

                    <div className="node-toolbar__divider" />

                    <button
                        className={`node-toolbar__btn node-toolbar__btn--delete ${showConfirmDelete ? 'node-toolbar__btn--confirm' : ''}`}
                        onClick={handleDelete}
                        title={showConfirmDelete ? 'Click again to confirm' : 'Delete (Del)'}
                    >
                        <Trash2 size={14} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default NodeToolbar
