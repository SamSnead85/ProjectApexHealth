import { useCallback, useRef, useState } from 'react'
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Panel,
    useReactFlow,
    ReactFlowProvider,
    Connection,
    OnNodesChange,
    OnEdgesChange,
    applyNodeChanges,
    applyEdgeChanges,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion } from 'framer-motion'
import {
    Play,
    Pause,
    Square,
    Sparkles,
    LayoutGrid,
    Save,
    Upload
} from 'lucide-react'
import { nodeTypes } from './nodes'
import { useWorkflowStore } from '../../stores/workflowStore'
import { NodeType, NODE_REGISTRY } from '../../types/workflow'
import { Button } from '../common'
import { CanvasContextMenu } from './CanvasContextMenu'
import { ValidationPanel } from './ValidationPanel'
import { useWorkflowKeyboardShortcuts } from '../../hooks/useWorkflowValidation'
import './WorkflowCanvas.css'

function WorkflowCanvasInner() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null)
    const { screenToFlowPosition } = useReactFlow()

    // Enable keyboard shortcuts
    useWorkflowKeyboardShortcuts()

    // Context menu state
    const [contextMenu, setContextMenu] = useState<{
        position: { x: number; y: number } | null
        targetNodeId: string | null
        canvasPosition: { x: number; y: number } | null
    }>({
        position: null,
        targetNodeId: null,
        canvasPosition: null,
    })

    const {
        nodes,
        edges,
        executionStatus,
        selectedNodeId,
        setNodes,
        setEdges,
        addNode,
        addEdge,
        selectNode,
        startExecution,
        pauseExecution,
        stopExecution,
        toggleAIAssistant,
        saveWorkflow,
    } = useWorkflowStore()

    // Use selectedNodeId for CSS class on wrapper (for visual feedback)
    const wrapperClassName = `workflow-canvas ${selectedNodeId ? 'has-selection' : ''}`

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes(applyNodeChanges(changes, nodes) as any),
        [nodes, setNodes]
    )

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges(applyEdgeChanges(changes, edges) as any),
        [edges, setEdges]
    )

    const onConnect = useCallback(
        (connection: Connection) => {
            if (connection.source && connection.target) {
                addEdge(
                    connection.source,
                    connection.target,
                    connection.sourceHandle || undefined,
                    connection.targetHandle || undefined
                )
            }
        },
        [addEdge]
    )

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault()

            const type = event.dataTransfer.getData('application/reactflow') as NodeType
            if (!type || !NODE_REGISTRY[type]) return

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            })

            addNode(type, position)
        },
        [screenToFlowPosition, addNode]
    )

    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: any) => {
            selectNode(node.id)
        },
        [selectNode]
    )

    // Double-click node to open config panel
    const onNodeDoubleClick = useCallback(
        (_: React.MouseEvent, node: any) => {
            selectNode(node.id)
            // The config panel opens automatically when a node is selected
        },
        [selectNode]
    )

    // Double-click canvas to add a node at that position
    const onDoubleClick = useCallback(
        (event: React.MouseEvent) => {
            // Only trigger if clicking on the canvas background (not a node)
            const target = event.target as HTMLElement
            if (target.closest('.react-flow__node')) return

            const canvasPos = screenToFlowPosition({ x: event.clientX, y: event.clientY })
            // Show context menu for quick add
            setContextMenu({
                position: { x: event.clientX, y: event.clientY },
                targetNodeId: null,
                canvasPosition: canvasPos,
            })
        },
        [screenToFlowPosition]
    )

    const onPaneClick = useCallback(() => {
        selectNode(null)
        setContextMenu({ position: null, targetNodeId: null, canvasPosition: null })
    }, [selectNode])

    // Context menu handlers
    const onNodeContextMenu = useCallback(
        (event: React.MouseEvent, node: any) => {
            event.preventDefault()
            const canvasPos = screenToFlowPosition({ x: event.clientX, y: event.clientY })
            setContextMenu({
                position: { x: event.clientX, y: event.clientY },
                targetNodeId: node.id,
                canvasPosition: canvasPos,
            })
        },
        [screenToFlowPosition]
    )

    const onPaneContextMenu = useCallback(
        (event: MouseEvent | React.MouseEvent) => {
            event.preventDefault()
            const canvasPos = screenToFlowPosition({ x: event.clientX, y: event.clientY })
            setContextMenu({
                position: { x: event.clientX, y: event.clientY },
                targetNodeId: null,
                canvasPosition: canvasPos,
            })
        },
        [screenToFlowPosition]
    )

    const closeContextMenu = useCallback(() => {
        setContextMenu({ position: null, targetNodeId: null, canvasPosition: null })
    }, [])

    return (
        <div ref={reactFlowWrapper} className={wrapperClassName}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onNodeClick={onNodeClick}
                onNodeDoubleClick={onNodeDoubleClick}
                onDoubleClick={onDoubleClick}
                onPaneClick={onPaneClick}
                onNodeContextMenu={onNodeContextMenu}
                onPaneContextMenu={onPaneContextMenu}
                nodeTypes={nodeTypes}
                fitView
                snapToGrid
                snapGrid={[20, 20]}
                defaultEdgeOptions={{
                    animated: false,
                    style: { stroke: 'var(--glass-border)', strokeWidth: 2 },
                }}
                proOptions={{ hideAttribution: true }}
            >
                <Background
                    gap={20}
                    size={1}
                    color="rgba(6, 182, 212, 0.05)"
                />
                <Controls
                    className="workflow-canvas__controls"
                    showInteractive={false}
                />
                <MiniMap
                    className="workflow-canvas__minimap"
                    nodeColor={(node) => {
                        const nodeType = node.type as NodeType
                        return NODE_REGISTRY[nodeType]?.color || '#6B7280'
                    }}
                    maskColor="rgba(5, 5, 8, 0.8)"
                />

                {/* Top Toolbar */}
                <Panel position="top-center" className="workflow-canvas__toolbar">
                    <motion.div
                        className="workflow-canvas__toolbar-inner"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        <div className="workflow-canvas__toolbar-group">
                            <Button
                                variant="secondary"
                                size="sm"
                                icon={<Save size={14} />}
                                onClick={() => saveWorkflow()}
                            >
                                Save
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                icon={<Upload size={14} />}
                            >
                                Load
                            </Button>
                        </div>

                        <div className="workflow-canvas__toolbar-divider" />

                        <div className="workflow-canvas__toolbar-group">
                            {executionStatus === 'idle' || executionStatus === 'completed' ? (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={<Play size={14} />}
                                    onClick={startExecution}
                                >
                                    Run Workflow
                                </Button>
                            ) : executionStatus === 'running' ? (
                                <>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        icon={<Pause size={14} />}
                                        onClick={pauseExecution}
                                    >
                                        Pause
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={<Square size={14} />}
                                        onClick={stopExecution}
                                    >
                                        Stop
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={<Play size={14} />}
                                    onClick={startExecution}
                                >
                                    Resume
                                </Button>
                            )}
                        </div>

                        <div className="workflow-canvas__toolbar-divider" />

                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<Sparkles size={14} />}
                            onClick={toggleAIAssistant}
                        >
                            AI Copilot
                        </Button>
                    </motion.div>
                </Panel>

                {/* Status Badge */}
                {executionStatus !== 'idle' && (
                    <Panel position="top-right" className="workflow-canvas__status">
                        <div className={`workflow-canvas__status-badge workflow-canvas__status-badge--${executionStatus}`}>
                            {executionStatus === 'running' && (
                                <>
                                    <span className="workflow-canvas__status-dot" />
                                    Running...
                                </>
                            )}
                            {executionStatus === 'paused' && 'Paused'}
                            {executionStatus === 'completed' && '✓ Completed'}
                            {executionStatus === 'error' && '✕ Error'}
                            {executionStatus === 'waiting_hitl' && '👤 Awaiting Review'}
                        </div>
                    </Panel>
                )}

                {/* Empty State */}
                {nodes.length === 0 && (
                    <Panel position="top-left" className="workflow-canvas__empty">
                        <div className="workflow-canvas__empty-content">
                            <LayoutGrid size={48} className="workflow-canvas__empty-icon" />
                            <h3>Start Building Your Workflow</h3>
                            <p>Drag nodes from the palette on the left, or use AI Copilot to generate a workflow automatically.</p>
                            <Button
                                variant="primary"
                                icon={<Sparkles size={16} />}
                                onClick={toggleAIAssistant}
                            >
                                Use AI Copilot
                            </Button>
                        </div>
                    </Panel>
                )}
            </ReactFlow>

            {/* Context Menu */}
            <CanvasContextMenu
                position={contextMenu.position}
                onClose={closeContextMenu}
                targetNodeId={contextMenu.targetNodeId}
                canvasPosition={contextMenu.canvasPosition}
            />

            {/* Validation Panel */}
            <ValidationPanel />
        </div>
    )
}

export function WorkflowCanvas() {
    return (
        <ReactFlowProvider>
            <WorkflowCanvasInner />
        </ReactFlowProvider>
    )
}

export default WorkflowCanvas
