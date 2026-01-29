import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Zap, GitBranch, Target, FileJson, Bell, X } from 'lucide-react'
import { useWorkflowStore } from '../../stores/workflowStore'
import { NodeType } from '../../types/workflow'
import './QuickAddButton.css'

const QUICK_ADD_OPTIONS: { type: NodeType; label: string; icon: React.ReactNode; color: string }[] = [
    { type: 'claimIntake', label: 'Claim Intake', icon: <Zap size={16} />, color: '#06B6D4' },
    { type: 'decisionBranch', label: 'Decision Branch', icon: <GitBranch size={16} />, color: '#8B5CF6' },
    { type: 'geminiAnalyzer', label: 'AI Analyzer', icon: <Target size={16} />, color: '#10B981' },
    { type: 'apiResponse', label: 'API Response', icon: <FileJson size={16} />, color: '#F59E0B' },
    { type: 'notification', label: 'Notification', icon: <Bell size={16} />, color: '#EC4899' },
]

export function QuickAddButton() {
    const [isOpen, setIsOpen] = useState(false)
    const { addNode, nodes } = useWorkflowStore()

    const handleAddNode = (type: NodeType) => {
        // Calculate position based on existing nodes or use center
        const lastNode = nodes[nodes.length - 1]
        const position = lastNode
            ? { x: lastNode.position.x + 200, y: lastNode.position.y }
            : { x: 400, y: 200 }

        addNode(type, position)
        setIsOpen(false)
    }

    return (
        <div className="quick-add-button">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="quick-add-button__menu"
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ duration: 0.15 }}
                    >
                        {QUICK_ADD_OPTIONS.map((option) => (
                            <button
                                key={option.type}
                                className="quick-add-button__option"
                                onClick={() => handleAddNode(option.type)}
                            >
                                <span
                                    className="quick-add-button__option-icon"
                                    style={{ backgroundColor: `${option.color}20`, color: option.color }}
                                >
                                    {option.icon}
                                </span>
                                <span className="quick-add-button__option-label">{option.label}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                className={`quick-add-button__trigger ${isOpen ? 'quick-add-button__trigger--open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? <X size={20} /> : <Plus size={20} />}
            </motion.button>
        </div>
    )
}

export default QuickAddButton
