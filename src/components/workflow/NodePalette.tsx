import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronDown,
    ChevronRight,
    Search,
    Star,
    Zap,
    FileText,
    Brain,
    GitBranch,
    Users,
    Send,
    Plus,
    MousePointerClick
} from 'lucide-react'
import { NODE_REGISTRY, NodeCategory, NodeType } from '../../types/workflow'
import { useWorkflowStore } from '../../stores/workflowStore'
import './NodePalette.css'

interface NodePaletteProps {
    onClose?: () => void
}

const categoryConfig: Record<NodeCategory, { label: string; icon: React.ReactNode; color: string }> = {
    trigger: { label: 'Triggers', icon: <Zap size={16} />, color: '#06B6D4' },
    processing: { label: 'Processing', icon: <FileText size={16} />, color: '#8B5CF6' },
    ai: { label: 'AI / ML', icon: <Brain size={16} />, color: '#10B981' },
    control: { label: 'Control Flow', icon: <GitBranch size={16} />, color: '#F59E0B' },
    hitl: { label: 'Human-in-the-Loop', icon: <Users size={16} />, color: '#EF4444' },
    output: { label: 'Outputs', icon: <Send size={16} />, color: '#64748B' },
}

export function NodePalette({ onClose }: NodePaletteProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedCategories, setExpandedCategories] = useState<Set<NodeCategory>>(
        new Set(['trigger', 'processing', 'ai', 'control', 'hitl', 'output'])
    )
    const [favorites, setFavorites] = useState<Set<NodeType>>(
        new Set(['claimIntake', 'geminiAnalyzer', 'hitlCheckpoint', 'decisionOutput'])
    )

    const { addNode, nodes } = useWorkflowStore()

    const toggleCategory = (category: NodeCategory) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev)
            if (next.has(category)) {
                next.delete(category)
            } else {
                next.add(category)
            }
            return next
        })
    }

    const toggleFavorite = (nodeType: NodeType, e: React.MouseEvent) => {
        e.stopPropagation()
        setFavorites((prev) => {
            const next = new Set(prev)
            if (next.has(nodeType)) {
                next.delete(nodeType)
            } else {
                next.add(nodeType)
            }
            return next
        })
    }

    const handleDragStart = useCallback(
        (event: React.DragEvent, nodeType: NodeType) => {
            event.dataTransfer.setData('application/reactflow', nodeType)
            event.dataTransfer.effectAllowed = 'move'
        },
        []
    )

    // Click-to-add: Add node at center of visible canvas
    const handleClickToAdd = useCallback(
        (nodeType: NodeType) => {
            // Calculate position based on existing nodes
            const existingNodes = nodes.length
            const baseX = 100 + (existingNodes % 4) * 280
            const baseY = 100 + Math.floor(existingNodes / 4) * 150
            addNode(nodeType, { x: baseX, y: baseY })
        },
        [addNode, nodes.length]
    )

    const nodesByCategory = Object.entries(NODE_REGISTRY).reduce(
        (acc, [nodeType, metadata]) => {
            if (!acc[metadata.category]) {
                acc[metadata.category] = []
            }
            acc[metadata.category].push({ ...metadata, type: nodeType as NodeType })
            return acc
        },
        {} as Record<NodeCategory, Array<{ type: NodeType } & typeof NODE_REGISTRY[NodeType]>>
    )

    const filteredNodes = searchQuery
        ? Object.entries(NODE_REGISTRY).filter(
            ([_, meta]) =>
                meta.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                meta.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : null

    const favoriteNodes = Array.from(favorites)
        .map((nodeType) => ({ ...NODE_REGISTRY[nodeType], type: nodeType }))
        .filter((node) => node.label)

    return (
        <div className="node-palette">
            {/* Enhanced Header */}
            <div className="node-palette__header">
                <h3 className="node-palette__title">Workflow Components</h3>
                <p className="node-palette__subtitle">
                    <MousePointerClick size={12} /> Click to add • Drag to canvas
                </p>
            </div>

            {/* Search */}
            <div className="node-palette__search">
                <Search size={16} className="node-palette__search-icon" />
                <input
                    type="text"
                    placeholder="Search components..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="node-palette__search-input"
                />
            </div>

            {/* Quick Start Section */}
            {nodes.length === 0 && !searchQuery && (
                <div className="node-palette__quickstart">
                    <p className="node-palette__quickstart-title">Quick Start</p>
                    <div className="node-palette__quickstart-btns">
                        <button
                            className="node-palette__quickstart-btn"
                            onClick={() => handleClickToAdd('claimIntake')}
                        >
                            <Plus size={14} />
                            <span>Claim Intake</span>
                        </button>
                        <button
                            className="node-palette__quickstart-btn"
                            onClick={() => handleClickToAdd('webhook')}
                        >
                            <Plus size={14} />
                            <span>Webhook</span>
                        </button>
                        <button
                            className="node-palette__quickstart-btn"
                            onClick={() => handleClickToAdd('priorAuthRequest')}
                        >
                            <Plus size={14} />
                            <span>Prior Auth</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Node List */}
            <div className="node-palette__content">
                {/* Search Results */}
                {filteredNodes && (
                    <div className="node-palette__section">
                        <div className="node-palette__section-header">
                            <span>Search Results ({filteredNodes.length})</span>
                        </div>
                        <div className="node-palette__nodes">
                            {filteredNodes.map(([type, meta]) => (
                                <NodeItem
                                    key={type}
                                    type={type as NodeType}
                                    metadata={meta}
                                    isFavorite={favorites.has(type as NodeType)}
                                    onToggleFavorite={(e) => toggleFavorite(type as NodeType, e)}
                                    onDragStart={(e) => handleDragStart(e, type as NodeType)}
                                    onClick={() => handleClickToAdd(type as NodeType)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Favorites */}
                {!searchQuery && favoriteNodes.length > 0 && (
                    <div className="node-palette__section node-palette__section--favorites">
                        <div className="node-palette__section-header">
                            <Star size={14} className="text-warning" />
                            <span>Favorites</span>
                        </div>
                        <div className="node-palette__nodes">
                            {favoriteNodes.map((node) => (
                                <NodeItem
                                    key={node.type}
                                    type={node.type}
                                    metadata={node}
                                    isFavorite={true}
                                    onToggleFavorite={(e) => toggleFavorite(node.type, e)}
                                    onDragStart={(e) => handleDragStart(e, node.type)}
                                    onClick={() => handleClickToAdd(node.type)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Categories */}
                {!searchQuery && (Object.keys(categoryConfig) as NodeCategory[]).map((category) => {
                    const config = categoryConfig[category]
                    const categoryNodes = nodesByCategory[category] || []
                    const isExpanded = expandedCategories.has(category)

                    return (
                        <div key={category} className="node-palette__section">
                            <button
                                className="node-palette__section-header"
                                onClick={() => toggleCategory(category)}
                            >
                                <span
                                    className="node-palette__section-indicator"
                                    style={{ color: config.color }}
                                >
                                    {config.icon}
                                </span>
                                <span className="node-palette__section-label">{config.label}</span>
                                <span className="node-palette__section-count">{categoryNodes.length}</span>
                                {isExpanded ? (
                                    <ChevronDown size={14} className="node-palette__section-chevron" />
                                ) : (
                                    <ChevronRight size={14} className="node-palette__section-chevron" />
                                )}
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        className="node-palette__nodes"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {categoryNodes.map((node) => (
                                            <NodeItem
                                                key={node.type}
                                                type={node.type}
                                                metadata={node}
                                                isFavorite={favorites.has(node.type)}
                                                onToggleFavorite={(e) => toggleFavorite(node.type, e)}
                                                onDragStart={(e) => handleDragStart(e, node.type)}
                                                onClick={() => handleClickToAdd(node.type)}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

interface NodeItemProps {
    type: NodeType
    metadata: typeof NODE_REGISTRY[NodeType]
    isFavorite: boolean
    onToggleFavorite: (e: React.MouseEvent) => void
    onDragStart: (e: React.DragEvent) => void
    onClick: () => void
}

function NodeItem({ type, metadata, isFavorite, onToggleFavorite, onDragStart, onClick }: NodeItemProps) {
    return (
        <div
            className="node-palette__item"
            draggable
            onDragStart={onDragStart}
            onClick={onClick}
            style={{ '--item-color': metadata.color } as React.CSSProperties}
        >
            <span className="node-palette__item-icon">{metadata.icon}</span>
            <div className="node-palette__item-info">
                <span className="node-palette__item-label">{metadata.label}</span>
                <span className="node-palette__item-desc">{metadata.description}</span>
            </div>
            <button
                className="node-palette__item-add"
                onClick={(e) => {
                    e.stopPropagation()
                    onClick()
                }}
                title="Click to add"
            >
                <Plus size={14} />
            </button>
            <button
                className={`node-palette__item-star ${isFavorite ? 'node-palette__item-star--active' : ''}`}
                onClick={onToggleFavorite}
            >
                <Star size={12} />
            </button>
        </div>
    )
}

export default NodePalette
