import { useState, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    Connection,
    ReactFlowProvider,
    useReactFlow,
    applyNodeChanges,
    applyEdgeChanges,
    OnNodesChange,
    OnEdgesChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Handle, Position } from '@xyflow/react'
import {
    Zap, FileText, Brain, GitBranch, Users, Send,
    Plus, Search, Sparkles, X,
    Save, Play, Download,
    Maximize2, Minimize2, LayoutDashboard, CheckCircle,
    AlertCircle, Clock, Filter, Loader2
} from 'lucide-react'
import './WorkflowBuilder.css'

// ================================================
// NODE DEFINITIONS
// ================================================

interface WorkflowNodeType {
    type: string
    label: string
    icon: React.ReactNode
    color: string
    category: 'trigger' | 'processing' | 'ai' | 'control' | 'hitl' | 'output'
    description: string
}

const NODE_TYPES: WorkflowNodeType[] = [
    // Triggers
    { type: 'claimIntake', label: 'Claim Intake', icon: <FileText size={16} />, color: '#06B6D4', category: 'trigger', description: 'Receive new claims' },
    { type: 'scheduledTrigger', label: 'Scheduled Trigger', icon: <Clock size={16} />, color: '#06B6D4', category: 'trigger', description: 'Run on schedule' },
    { type: 'eventTrigger', label: 'Event Trigger', icon: <Zap size={16} />, color: '#06B6D4', category: 'trigger', description: 'React to events' },
    // Processing
    { type: 'dataValidator', label: 'Data Validator', icon: <CheckCircle size={16} />, color: '#8B5CF6', category: 'processing', description: 'Validate claim data' },
    { type: 'eligibilityCheck', label: 'Eligibility Check', icon: <Filter size={16} />, color: '#8B5CF6', category: 'processing', description: 'Verify member eligibility' },
    { type: 'claimProcessor', label: 'Claim Processor', icon: <FileText size={16} />, color: '#8B5CF6', category: 'processing', description: 'Process claims' },
    // AI
    { type: 'aiAnalyzer', label: 'AI Analyzer', icon: <Brain size={16} />, color: '#10B981', category: 'ai', description: 'AI-powered analysis' },
    { type: 'fraudDetector', label: 'Fraud Detector', icon: <AlertCircle size={16} />, color: '#10B981', category: 'ai', description: 'Detect fraud patterns' },
    { type: 'riskScorer', label: 'Risk Scorer', icon: <Sparkles size={16} />, color: '#10B981', category: 'ai', description: 'Calculate risk scores' },
    // Control
    { type: 'conditional', label: 'Conditional', icon: <GitBranch size={16} />, color: '#F59E0B', category: 'control', description: 'Branch logic' },
    { type: 'loop', label: 'Loop', icon: <GitBranch size={16} />, color: '#F59E0B', category: 'control', description: 'Repeat actions' },
    // HITL
    { type: 'humanReview', label: 'Human Review', icon: <Users size={16} />, color: '#EF4444', category: 'hitl', description: 'Manual review step' },
    { type: 'approvalGate', label: 'Approval Gate', icon: <Users size={16} />, color: '#EF4444', category: 'hitl', description: 'Require approval' },
    // Output
    { type: 'notification', label: 'Notification', icon: <Send size={16} />, color: '#64748B', category: 'output', description: 'Send notifications' },
    { type: 'decision', label: 'Decision Output', icon: <CheckCircle size={16} />, color: '#64748B', category: 'output', description: 'Record decision' },
]

const CATEGORY_LABELS: Record<string, string> = {
    trigger: 'Triggers',
    processing: 'Processing',
    ai: 'AI / ML',
    control: 'Control Flow',
    hitl: 'Human-in-the-Loop',
    output: 'Outputs'
}

// ================================================
// CUSTOM NODE COMPONENT
// ================================================

function CustomNode({ data }: { data: { label: string; color: string; description: string } }) {
    return (
        <div className="workflow-node" style={{ borderColor: data.color }}>
            <Handle type="target" position={Position.Top} className="workflow-node__handle" />
            <div className="workflow-node__header" style={{ background: `${data.color}20` }}>
                <span className="workflow-node__label">{data.label}</span>
            </div>
            <div className="workflow-node__body">
                <p>{data.description}</p>
            </div>
            <Handle type="source" position={Position.Bottom} className="workflow-node__handle" />
        </div>
    )
}

const nodeTypes = {
    custom: CustomNode
}

// ================================================
// WORKFLOW CANVAS COMPONENT
// ================================================

interface CanvasProps {
    nodes: Node[]
    edges: Edge[]
    setNodes: (nodes: Node[]) => void
    setEdges: (edges: Edge[]) => void
}

function WorkflowCanvasInner({ nodes, edges, setNodes, setEdges }: CanvasProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null)
    const { screenToFlowPosition } = useReactFlow()

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes(applyNodeChanges(changes, nodes) as Node[]),
        [nodes, setNodes]
    )

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges(applyEdgeChanges(changes, edges) as Edge[]),
        [edges, setEdges]
    )

    const onConnect = useCallback(
        (connection: Connection) => {
            if (connection.source && connection.target) {
                const newEdge: Edge = {
                    id: `e-${connection.source}-${connection.target}-${Date.now()}`,
                    source: connection.source,
                    target: connection.target,
                    sourceHandle: connection.sourceHandle,
                    targetHandle: connection.targetHandle,
                    type: 'smoothstep',
                    animated: true,
                }
                setEdges([...edges, newEdge])
            }
        },
        [edges, setEdges]
    )

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault()

            const nodeTypeData = event.dataTransfer.getData('application/reactflow')
            if (!nodeTypeData || !reactFlowWrapper.current) return

            try {
                const nodeType = JSON.parse(nodeTypeData) as WorkflowNodeType
                const position = screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY
                })

                const newNode: Node = {
                    id: `${nodeType.type}-${Date.now()}`,
                    type: 'custom',
                    position,
                    data: {
                        label: nodeType.label,
                        color: nodeType.color,
                        description: nodeType.description
                    }
                }

                setNodes([...nodes, newNode])
            } catch (e) {
                console.error('Failed to parse dropped node data', e)
            }
        },
        [screenToFlowPosition, nodes, setNodes]
    )

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    return (
        <div ref={reactFlowWrapper} className="workflow-canvas-inner">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
                snapToGrid
                snapGrid={[16, 16]}
            >
                <Background color="rgba(255,255,255,0.03)" gap={24} />
                <Controls />
                <MiniMap
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                />
            </ReactFlow>

            {nodes.length === 0 && (
                <div className="workflow-empty-state">
                    <div className="workflow-empty-state__icon">
                        <Sparkles size={48} />
                    </div>
                    <h3>Start Building Your Workflow</h3>
                    <p>Drag nodes from the left panel or click them to add</p>
                    <div className="workflow-empty-state__tips">
                        <span><Zap size={14} /> Start with a Trigger</span>
                        <span><Brain size={14} /> Add AI Analysis</span>
                        <span><Users size={14} /> Include Human Review</span>
                    </div>
                </div>
            )}
        </div>
    )
}

// ================================================
// MAIN WORKFLOW BUILDER
// ================================================

export function WorkflowBuilder() {
    const [workflowName, setWorkflowName] = useState('Untitled Workflow')
    const [searchQuery, setSearchQuery] = useState('')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showAIPrompt, setShowAIPrompt] = useState(false)
    const [aiPrompt, setAIPrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    // Local state for nodes and edges
    const [nodes, setNodes] = useState<Node[]>([])
    const [edges, setEdges] = useState<Edge[]>([])

    // Filter nodes by search
    const filteredNodes = useMemo(() => {
        if (!searchQuery) return NODE_TYPES
        return NODE_TYPES.filter(n =>
            n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery])

    // Group nodes by category
    const nodesByCategory = useMemo(() => {
        const groups: Record<string, WorkflowNodeType[]> = {}
        filteredNodes.forEach(node => {
            if (!groups[node.category]) groups[node.category] = []
            groups[node.category].push(node)
        })
        return groups
    }, [filteredNodes])

    // Handle drag start
    const handleDragStart = useCallback((event: React.DragEvent, node: WorkflowNodeType) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(node))
        event.dataTransfer.effectAllowed = 'move'
    }, [])

    // Handle click to add
    const handleClickToAdd = useCallback((node: WorkflowNodeType) => {
        const newNode: Node = {
            id: `${node.type}-${Date.now()}`,
            type: 'custom',
            position: { x: 200 + nodes.length * 50, y: 150 + Math.floor(nodes.length / 3) * 120 },
            data: {
                label: node.label,
                color: node.color,
                description: node.description
            }
        }
        setNodes(prev => [...prev, newNode])
    }, [nodes.length])

    // AI Generation stub
    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return
        setIsGenerating(true)
        // Simulate AI generation - add sample nodes
        setTimeout(() => {
            const sampleNodes: Node[] = [
                { id: 'claim-1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Claim Intake', color: '#06B6D4', description: 'Receive claims' } },
                { id: 'validator-1', type: 'custom', position: { x: 250, y: 180 }, data: { label: 'Data Validator', color: '#8B5CF6', description: 'Validate data' } },
                { id: 'ai-1', type: 'custom', position: { x: 250, y: 310 }, data: { label: 'AI Analyzer', color: '#10B981', description: 'Analyze with AI' } },
                { id: 'decision-1', type: 'custom', position: { x: 250, y: 440 }, data: { label: 'Decision Output', color: '#64748B', description: 'Record decision' } },
            ]
            const sampleEdges: Edge[] = [
                { id: 'e1', source: 'claim-1', target: 'validator-1', type: 'smoothstep', animated: true },
                { id: 'e2', source: 'validator-1', target: 'ai-1', type: 'smoothstep', animated: true },
                { id: 'e3', source: 'ai-1', target: 'decision-1', type: 'smoothstep', animated: true },
            ]
            setNodes(sampleNodes)
            setEdges(sampleEdges)
            setIsGenerating(false)
            setShowAIPrompt(false)
            setAIPrompt('')
        }, 2000)
    }

    return (
        <div className={`workflow-builder-v2 ${isFullscreen ? 'workflow-builder-v2--fullscreen' : ''}`}>
            {/* Header */}
            <header className="workflow-builder-v2__header">
                <div className="workflow-builder-v2__header-left">
                    <LayoutDashboard size={20} className="workflow-builder-v2__header-icon" />
                    <input
                        type="text"
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        className="workflow-builder-v2__title-input"
                    />
                    <span className="workflow-builder-v2__status">Draft</span>
                </div>

                <div className="workflow-builder-v2__header-center">
                    <button
                        className="workflow-builder-v2__ai-btn"
                        onClick={() => setShowAIPrompt(true)}
                    >
                        <Sparkles size={16} />
                        Generate with AI
                    </button>
                </div>

                <div className="workflow-builder-v2__header-right">
                    <button className="workflow-builder-v2__action-btn">
                        <Save size={16} />
                    </button>
                    <button className="workflow-builder-v2__action-btn">
                        <Play size={16} />
                    </button>
                    <button className="workflow-builder-v2__action-btn">
                        <Download size={16} />
                    </button>
                    <button
                        className="workflow-builder-v2__action-btn"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="workflow-builder-v2__content">
                {/* Left Palette - ALWAYS VISIBLE */}
                <aside className="workflow-builder-v2__palette">
                    <div className="workflow-builder-v2__palette-header">
                        <h2>Node Palette</h2>
                    </div>

                    <div className="workflow-builder-v2__search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search nodes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="workflow-builder-v2__categories">
                        {Object.entries(nodesByCategory).map(([category, categoryNodes]) => (
                            <div key={category} className="workflow-builder-v2__category">
                                <div className="workflow-builder-v2__category-header">
                                    <span>{CATEGORY_LABELS[category] || category}</span>
                                    <span className="workflow-builder-v2__category-count">{categoryNodes.length}</span>
                                </div>
                                <div className="workflow-builder-v2__nodes">
                                    {categoryNodes.map(node => (
                                        <div
                                            key={node.type}
                                            className="workflow-builder-v2__node-item"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, node)}
                                            onClick={() => handleClickToAdd(node)}
                                            style={{ borderLeftColor: node.color }}
                                        >
                                            <span className="workflow-builder-v2__node-icon" style={{ color: node.color }}>
                                                {node.icon}
                                            </span>
                                            <div className="workflow-builder-v2__node-info">
                                                <span className="workflow-builder-v2__node-label">{node.label}</span>
                                                <span className="workflow-builder-v2__node-desc">{node.description}</span>
                                            </div>
                                            <Plus size={14} className="workflow-builder-v2__node-add" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Canvas */}
                <main className="workflow-builder-v2__canvas">
                    <ReactFlowProvider>
                        <WorkflowCanvasInner
                            nodes={nodes}
                            edges={edges}
                            setNodes={setNodes}
                            setEdges={setEdges}
                        />
                    </ReactFlowProvider>
                </main>
            </div>

            {/* AI Prompt Modal */}
            <AnimatePresence>
                {showAIPrompt && (
                    <motion.div
                        className="workflow-builder-v2__modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAIPrompt(false)}
                    >
                        <motion.div
                            className="workflow-builder-v2__modal"
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="workflow-builder-v2__modal-header">
                                <Sparkles size={20} />
                                <h3>Generate Workflow with AI</h3>
                                <button onClick={() => setShowAIPrompt(false)}><X size={18} /></button>
                            </div>
                            <div className="workflow-builder-v2__modal-body">
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAIPrompt(e.target.value)}
                                    placeholder="Describe your workflow in plain English...&#10;&#10;Example: 'Create a claims processing workflow that validates data, runs fraud detection, and routes high-value claims to human reviewers.'"
                                    rows={5}
                                />
                                <div className="workflow-builder-v2__modal-hints">
                                    <span>Try:</span>
                                    <button onClick={() => setAIPrompt('Auto-approve claims under $500, flag others for review')}>
                                        Auto-approval workflow
                                    </button>
                                    <button onClick={() => setAIPrompt('Process referrals with eligibility check and provider assignment')}>
                                        Referral processing
                                    </button>
                                </div>
                            </div>
                            <div className="workflow-builder-v2__modal-footer">
                                <button
                                    className="workflow-builder-v2__generate-btn"
                                    onClick={handleAIGenerate}
                                    disabled={isGenerating || !aiPrompt.trim()}
                                >
                                    {isGenerating ? (
                                        <><Loader2 size={16} className="animate-spin" /> Generating...</>
                                    ) : (
                                        <><Sparkles size={16} /> Generate Workflow</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default WorkflowBuilder
