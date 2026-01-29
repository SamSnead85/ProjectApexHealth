import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Copy,
    Trash2,
    Plus,
    Edit3,
    Layers,
    GitBranch,
    Zap,
    FileJson,
    Target,
    Maximize2,
    Group,
    Scissors,
    Clipboard,
    ArrowRight
} from 'lucide-react'
import { useWorkflowStore } from '../../stores/workflowStore'
import { NodeType, NODE_REGISTRY } from '../../types/workflow'
import './CanvasContextMenu.css'

interface Position {
    x: number
    y: number
}

interface ContextMenuProps {
    position: Position | null
    onClose: () => void
    targetNodeId?: string | null
    canvasPosition?: Position | null
}

interface MenuGroup {
    label?: string
    items: MenuItem[]
}

interface MenuItem {
    id: string
    label: string
    icon: React.ReactNode
    shortcut?: string
    danger?: boolean
    disabled?: boolean
    onClick: () => void
}

// Quick add node types
const QUICK_ADD_NODES: { type: NodeType; label: string }[] = [
    { type: 'decisionBranch', label: 'Decision Branch' },
    { type: 'geminiAnalyzer', label: 'AI Analyzer' },
    { type: 'apiResponse', label: 'API Response' },
    { type: 'notification', label: 'Notification' },
]

export function CanvasContextMenu({ position, onClose, targetNodeId, canvasPosition }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)
    const [showQuickAdd, setShowQuickAdd] = useState(false)

    const {
        nodes,
        addNode,
        deleteNode,
        duplicateNode,
        selectNode,
    } = useWorkflowStore()

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [onClose])

    const handleDuplicateNode = useCallback(() => {
        if (targetNodeId) {
            duplicateNode(targetNodeId)
        }
        onClose()
    }, [targetNodeId, duplicateNode, onClose])

    const handleDeleteNode = useCallback(() => {
        if (targetNodeId) {
            deleteNode(targetNodeId)
        }
        onClose()
    }, [targetNodeId, deleteNode, onClose])

    const handleAddNode = useCallback((type: NodeType) => {
        if (canvasPosition) {
            addNode(type, canvasPosition)
        }
        onClose()
    }, [canvasPosition, addNode, onClose])

    const handleEditNode = useCallback(() => {
        if (targetNodeId) {
            selectNode(targetNodeId)
        }
        onClose()
    }, [targetNodeId, selectNode, onClose])

    if (!position) return null

    // Get target node info
    const targetNode = targetNodeId ? nodes.find(n => n.id === targetNodeId) : null
    const nodeInfo = targetNode ? NODE_REGISTRY[targetNode.type as NodeType] : null

    // Build menu groups based on context (node vs canvas)
    const menuGroups: MenuGroup[] = targetNodeId ? [
        // Node context menu
        {
            items: [
                {
                    id: 'edit',
                    label: 'Edit Node',
                    icon: <Edit3 size={14} />,
                    shortcut: 'Enter',
                    onClick: handleEditNode
                },
                {
                    id: 'duplicate',
                    label: 'Duplicate',
                    icon: <Copy size={14} />,
                    shortcut: '⌘D',
                    onClick: handleDuplicateNode
                },
            ]
        },
        {
            label: 'Connections',
            items: [
                {
                    id: 'add-after',
                    label: 'Add Node After',
                    icon: <ArrowRight size={14} />,
                    onClick: () => setShowQuickAdd(true)
                },
                {
                    id: 'disconnect',
                    label: 'Disconnect All',
                    icon: <Scissors size={14} />,
                    onClick: () => { /* TODO */ onClose() }
                },
            ]
        },
        {
            items: [
                {
                    id: 'copy',
                    label: 'Copy',
                    icon: <Clipboard size={14} />,
                    shortcut: '⌘C',
                    onClick: () => { /* TODO */ onClose() }
                },
            ]
        },
        {
            items: [
                {
                    id: 'delete',
                    label: 'Delete',
                    icon: <Trash2 size={14} />,
                    shortcut: 'Del',
                    danger: true,
                    onClick: handleDeleteNode
                },
            ]
        },
    ] : [
        // Canvas context menu
        {
            label: 'Add Node',
            items: [
                {
                    id: 'add-trigger',
                    label: 'Claim Intake',
                    icon: <Zap size={14} />,
                    onClick: () => handleAddNode('claimIntake')
                },
                {
                    id: 'add-condition',
                    label: 'Decision Branch',
                    icon: <GitBranch size={14} />,
                    onClick: () => handleAddNode('decisionBranch')
                },
                {
                    id: 'add-ai',
                    label: 'AI Analyzer',
                    icon: <Target size={14} />,
                    onClick: () => handleAddNode('geminiAnalyzer')
                },
                {
                    id: 'add-api',
                    label: 'API Response',
                    icon: <FileJson size={14} />,
                    onClick: () => handleAddNode('apiResponse')
                },
            ]
        },
        {
            items: [
                {
                    id: 'paste',
                    label: 'Paste',
                    icon: <Clipboard size={14} />,
                    shortcut: '⌘V',
                    disabled: true,
                    onClick: () => { /* TODO */ onClose() }
                },
            ]
        },
        {
            label: 'Canvas',
            items: [
                {
                    id: 'fit-view',
                    label: 'Fit to View',
                    icon: <Maximize2 size={14} />,
                    onClick: () => { /* TODO */ onClose() }
                },
                {
                    id: 'auto-layout',
                    label: 'Auto Layout',
                    icon: <Layers size={14} />,
                    onClick: () => { /* TODO */ onClose() }
                },
                {
                    id: 'group-nodes',
                    label: 'Group Selection',
                    icon: <Group size={14} />,
                    disabled: true,
                    onClick: () => { /* TODO */ onClose() }
                },
            ]
        }
    ]

    return (
        <AnimatePresence>
            <motion.div
                ref={menuRef}
                className="canvas-context-menu"
                style={{
                    left: position.x,
                    top: position.y,
                }}
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
            >
                {/* Node header if targeting a node */}
                {targetNode && nodeInfo && (
                    <div className="canvas-context-menu__header">
                        <div
                            className="canvas-context-menu__node-icon"
                            style={{ backgroundColor: `${nodeInfo.color}20`, color: nodeInfo.color }}
                        >
                            {nodeInfo.icon && <span dangerouslySetInnerHTML={{ __html: nodeInfo.icon }} />}
                        </div>
                        <div className="canvas-context-menu__node-info">
                            <span className="canvas-context-menu__node-label">
                                {targetNode.data?.label || nodeInfo.label}
                            </span>
                            <span className="canvas-context-menu__node-type">{nodeInfo.category}</span>
                        </div>
                    </div>
                )}

                {/* Quick add submenu */}
                {showQuickAdd && (
                    <div className="canvas-context-menu__submenu">
                        <div className="canvas-context-menu__submenu-header">
                            <button onClick={() => setShowQuickAdd(false)}>← Back</button>
                            <span>Add Node After</span>
                        </div>
                        {QUICK_ADD_NODES.map(({ type, label }) => (
                            <button
                                key={type}
                                className="canvas-context-menu__item"
                                onClick={() => {
                                    // TODO: Add node connected after target
                                    onClose()
                                }}
                            >
                                <span className="canvas-context-menu__item-icon">
                                    <Plus size={14} />
                                </span>
                                <span className="canvas-context-menu__item-label">{label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Menu groups */}
                {!showQuickAdd && menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="canvas-context-menu__group">
                        {group.label && (
                            <div className="canvas-context-menu__group-label">{group.label}</div>
                        )}
                        {group.items.map((item) => (
                            <button
                                key={item.id}
                                className={`canvas-context-menu__item ${item.danger ? 'canvas-context-menu__item--danger' : ''} ${item.disabled ? 'canvas-context-menu__item--disabled' : ''}`}
                                onClick={item.onClick}
                                disabled={item.disabled}
                            >
                                <span className="canvas-context-menu__item-icon">{item.icon}</span>
                                <span className="canvas-context-menu__item-label">{item.label}</span>
                                {item.shortcut && (
                                    <span className="canvas-context-menu__item-shortcut">{item.shortcut}</span>
                                )}
                            </button>
                        ))}
                    </div>
                ))}
            </motion.div>
        </AnimatePresence>
    )
}

export default CanvasContextMenu
