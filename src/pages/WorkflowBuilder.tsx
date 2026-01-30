import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
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
    Plus, Search, Sparkles, X, Trash2, Copy, Edit3,
    Save, Play, Download, Undo2, Redo2, Keyboard,
    Maximize2, Minimize2, LayoutDashboard, CheckCircle,
    AlertCircle, Clock, Filter, Loader2, Settings,
    Eye, EyeOff, Layers, HelpCircle, ChevronDown, ChevronRight,
    LayoutTemplate
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
    { type: 'scheduledTrigger', label: 'Scheduled', icon: <Clock size={16} />, color: '#06B6D4', category: 'trigger', description: 'Run on schedule' },
    { type: 'eventTrigger', label: 'Event Trigger', icon: <Zap size={16} />, color: '#06B6D4', category: 'trigger', description: 'React to events' },
    { type: 'apiTrigger', label: 'API Webhook', icon: <Zap size={16} />, color: '#06B6D4', category: 'trigger', description: 'API endpoint trigger' },
    // Processing
    { type: 'dataValidator', label: 'Validator', icon: <CheckCircle size={16} />, color: '#8B5CF6', category: 'processing', description: 'Validate claim data' },
    { type: 'eligibilityCheck', label: 'Eligibility', icon: <Filter size={16} />, color: '#8B5CF6', category: 'processing', description: 'Verify eligibility' },
    { type: 'claimProcessor', label: 'Processor', icon: <FileText size={16} />, color: '#8B5CF6', category: 'processing', description: 'Process claims' },
    { type: 'transformer', label: 'Transform', icon: <Layers size={16} />, color: '#8B5CF6', category: 'processing', description: 'Transform data' },
    // AI
    { type: 'aiAnalyzer', label: 'AI Analyzer', icon: <Brain size={16} />, color: '#10B981', category: 'ai', description: 'AI-powered analysis' },
    { type: 'fraudDetector', label: 'Fraud Detection', icon: <AlertCircle size={16} />, color: '#10B981', category: 'ai', description: 'Detect fraud patterns' },
    { type: 'riskScorer', label: 'Risk Scorer', icon: <Sparkles size={16} />, color: '#10B981', category: 'ai', description: 'Calculate risk scores' },
    { type: 'nlpExtractor', label: 'NLP Extract', icon: <Brain size={16} />, color: '#10B981', category: 'ai', description: 'Extract with NLP' },
    // Control
    { type: 'conditional', label: 'Condition', icon: <GitBranch size={16} />, color: '#F59E0B', category: 'control', description: 'Branch logic' },
    { type: 'loop', label: 'Loop', icon: <GitBranch size={16} />, color: '#F59E0B', category: 'control', description: 'Repeat actions' },
    { type: 'delay', label: 'Delay', icon: <Clock size={16} />, color: '#F59E0B', category: 'control', description: 'Wait period' },
    // HITL
    { type: 'humanReview', label: 'Human Review', icon: <Users size={16} />, color: '#EF4444', category: 'hitl', description: 'Manual review step' },
    { type: 'approvalGate', label: 'Approval', icon: <CheckCircle size={16} />, color: '#EF4444', category: 'hitl', description: 'Require approval' },
    // Output
    { type: 'notification', label: 'Notify', icon: <Send size={16} />, color: '#64748B', category: 'output', description: 'Send notifications' },
    { type: 'decision', label: 'Decision', icon: <CheckCircle size={16} />, color: '#64748B', category: 'output', description: 'Record decision' },
    { type: 'integrationOutput', label: 'Integration', icon: <Zap size={16} />, color: '#64748B', category: 'output', description: 'External system' },
]

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
    trigger: { label: 'Triggers', icon: <Zap size={14} /> },
    processing: { label: 'Processing', icon: <Layers size={14} /> },
    ai: { label: 'AI / ML', icon: <Brain size={14} /> },
    control: { label: 'Control Flow', icon: <GitBranch size={14} /> },
    hitl: { label: 'Human Review', icon: <Users size={14} /> },
    output: { label: 'Outputs', icon: <Send size={14} /> }
}

// ================================================
// WORKFLOW TEMPLATES
// ================================================

interface WorkflowTemplate {
    id: string
    name: string
    description: string
    icon: React.ReactNode
    category: string
    nodes: Node[]
    edges: Edge[]
}

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
    {
        id: 'claims-processing',
        name: 'Claims Processing',
        description: 'Standard claims intake, validation, and adjudication workflow',
        icon: <FileText size={20} />,
        category: 'Claims',
        nodes: [
            { id: 'intake-1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Claim Intake', color: '#06B6D4', description: 'Receive claims' } },
            { id: 'validate-1', type: 'custom', position: { x: 250, y: 160 }, data: { label: 'Data Validation', color: '#8B5CF6', description: 'Validate data' } },
            { id: 'eligibility-1', type: 'custom', position: { x: 250, y: 270 }, data: { label: 'Eligibility Check', color: '#8B5CF6', description: 'Check eligibility' } },
            { id: 'process-1', type: 'custom', position: { x: 250, y: 380 }, data: { label: 'Process Claim', color: '#8B5CF6', description: 'Adjudicate' } },
            { id: 'output-1', type: 'custom', position: { x: 250, y: 490 }, data: { label: 'Decision', color: '#64748B', description: 'Record decision' } },
        ],
        edges: [
            { id: 'e1', source: 'intake-1', target: 'validate-1', type: 'smoothstep', animated: true },
            { id: 'e2', source: 'validate-1', target: 'eligibility-1', type: 'smoothstep', animated: true },
            { id: 'e3', source: 'eligibility-1', target: 'process-1', type: 'smoothstep', animated: true },
            { id: 'e4', source: 'process-1', target: 'output-1', type: 'smoothstep', animated: true },
        ]
    },
    {
        id: 'prior-auth',
        name: 'Prior Authorization',
        description: 'Clinical prior auth with AI analysis and approval routing',
        icon: <CheckCircle size={20} />,
        category: 'Authorization',
        nodes: [
            { id: 'request-1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Auth Request', color: '#06B6D4', description: 'Receive request' } },
            { id: 'clinical-1', type: 'custom', position: { x: 250, y: 160 }, data: { label: 'Clinical Review', color: '#10B981', description: 'AI analysis' } },
            { id: 'condition-1', type: 'custom', position: { x: 250, y: 270 }, data: { label: 'Auto-Approve?', color: '#F59E0B', description: 'Check criteria' } },
            { id: 'approve-1', type: 'custom', position: { x: 100, y: 380 }, data: { label: 'Auto Approve', color: '#64748B', description: 'Approve' } },
            { id: 'review-1', type: 'custom', position: { x: 400, y: 380 }, data: { label: 'MD Review', color: '#EF4444', description: 'Physician review' } },
            { id: 'notify-1', type: 'custom', position: { x: 250, y: 490 }, data: { label: 'Notify Member', color: '#64748B', description: 'Send decision' } },
        ],
        edges: [
            { id: 'e1', source: 'request-1', target: 'clinical-1', type: 'smoothstep', animated: true },
            { id: 'e2', source: 'clinical-1', target: 'condition-1', type: 'smoothstep', animated: true },
            { id: 'e3', source: 'condition-1', target: 'approve-1', type: 'smoothstep', animated: true },
            { id: 'e4', source: 'condition-1', target: 'review-1', type: 'smoothstep', animated: true },
            { id: 'e5', source: 'approve-1', target: 'notify-1', type: 'smoothstep', animated: true },
            { id: 'e6', source: 'review-1', target: 'notify-1', type: 'smoothstep', animated: true },
        ]
    },
    {
        id: 'fraud-detection',
        name: 'Fraud Detection',
        description: 'AI-powered fraud analysis with investigation routing',
        icon: <AlertCircle size={20} />,
        category: 'Compliance',
        nodes: [
            { id: 'trigger-1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Claim Event', color: '#06B6D4', description: 'New claim' } },
            { id: 'fraud-ai-1', type: 'custom', position: { x: 250, y: 160 }, data: { label: 'Fraud Analysis', color: '#10B981', description: 'AI detection' } },
            { id: 'risk-1', type: 'custom', position: { x: 250, y: 270 }, data: { label: 'Risk Score', color: '#10B981', description: 'Calculate risk' } },
            { id: 'condition-1', type: 'custom', position: { x: 250, y: 380 }, data: { label: 'High Risk?', color: '#F59E0B', description: 'Check threshold' } },
            { id: 'investigate-1', type: 'custom', position: { x: 100, y: 490 }, data: { label: 'Investigation', color: '#EF4444', description: 'SIU review' } },
            { id: 'clear-1', type: 'custom', position: { x: 400, y: 490 }, data: { label: 'Clear Claim', color: '#64748B', description: 'Proceed' } },
        ],
        edges: [
            { id: 'e1', source: 'trigger-1', target: 'fraud-ai-1', type: 'smoothstep', animated: true },
            { id: 'e2', source: 'fraud-ai-1', target: 'risk-1', type: 'smoothstep', animated: true },
            { id: 'e3', source: 'risk-1', target: 'condition-1', type: 'smoothstep', animated: true },
            { id: 'e4', source: 'condition-1', target: 'investigate-1', type: 'smoothstep', animated: true },
            { id: 'e5', source: 'condition-1', target: 'clear-1', type: 'smoothstep', animated: true },
        ]
    },
    {
        id: 'member-onboarding',
        name: 'Member Onboarding',
        description: 'New member enrollment and welcome workflow',
        icon: <Users size={20} />,
        category: 'Member Services',
        nodes: [
            { id: 'enroll-1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Enrollment', color: '#06B6D4', description: 'New member' } },
            { id: 'validate-1', type: 'custom', position: { x: 250, y: 160 }, data: { label: 'Validate Data', color: '#8B5CF6', description: 'Check info' } },
            { id: 'create-1', type: 'custom', position: { x: 250, y: 270 }, data: { label: 'Create Account', color: '#8B5CF6', description: 'Setup profile' } },
            { id: 'id-card-1', type: 'custom', position: { x: 100, y: 380 }, data: { label: 'Generate ID', color: '#64748B', description: 'Create ID card' } },
            { id: 'welcome-1', type: 'custom', position: { x: 400, y: 380 }, data: { label: 'Welcome Kit', color: '#64748B', description: 'Send materials' } },
        ],
        edges: [
            { id: 'e1', source: 'enroll-1', target: 'validate-1', type: 'smoothstep', animated: true },
            { id: 'e2', source: 'validate-1', target: 'create-1', type: 'smoothstep', animated: true },
            { id: 'e3', source: 'create-1', target: 'id-card-1', type: 'smoothstep', animated: true },
            { id: 'e4', source: 'create-1', target: 'welcome-1', type: 'smoothstep', animated: true },
        ]
    },
]

// ================================================
// CUSTOM NODE COMPONENT
// ================================================

interface CustomNodeData {
    label: string
    color: string
    description: string
    icon?: React.ReactNode
    isSelected?: boolean
}

function CustomNode({ data, selected }: { data: CustomNodeData; selected?: boolean }) {
    return (
        <motion.div
            className={`workflow-node ${selected ? 'workflow-node--selected' : ''}`}
            style={{ borderColor: data.color }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
        >
            <Handle type="target" position={Position.Top} className="workflow-node__handle workflow-node__handle--target" />
            <div className="workflow-node__header" style={{ background: `${data.color}15`, borderBottom: `1px solid ${data.color}30` }}>
                <div className="workflow-node__icon" style={{ background: `${data.color}20`, color: data.color }}>
                    {data.icon || <Zap size={14} />}
                </div>
                <span className="workflow-node__label">{data.label}</span>
            </div>
            <div className="workflow-node__body">
                <p>{data.description}</p>
            </div>
            {selected && (
                <div className="workflow-node__actions">
                    <button className="workflow-node__action" title="Configure">
                        <Settings size={12} />
                    </button>
                    <button className="workflow-node__action" title="Duplicate">
                        <Copy size={12} />
                    </button>
                    <button className="workflow-node__action workflow-node__action--danger" title="Delete">
                        <Trash2 size={12} />
                    </button>
                </div>
            )}
            <Handle type="source" position={Position.Bottom} className="workflow-node__handle workflow-node__handle--source" />
        </motion.div>
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
    onNodeSelect: (node: Node | null) => void
}

function WorkflowCanvasInner({ nodes, edges, setNodes, setEdges, onNodeSelect }: CanvasProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null)
    const { screenToFlowPosition, fitView } = useReactFlow()

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
                    style: { stroke: '#6366f1', strokeWidth: 2 }
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

                const newNodeId = `${nodeType.type}-${Date.now()}`
                const newNode: Node = {
                    id: newNodeId,
                    type: 'custom',
                    position,
                    data: {
                        label: nodeType.label,
                        color: nodeType.color,
                        description: nodeType.description,
                        icon: nodeType.icon
                    }
                }

                // PROXIMITY-BASED AUTO-CONNECTION
                const PROXIMITY_THRESHOLD = 150 // pixels
                const autoEdges: Edge[] = []

                // Find nodes that are close to the drop position
                nodes.forEach(existingNode => {
                    const dx = Math.abs(existingNode.position.x - position.x)
                    const dy = existingNode.position.y - position.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    // If existing node is above and within proximity, connect from it
                    if (dy < 0 && Math.abs(dy) < PROXIMITY_THRESHOLD && dx < PROXIMITY_THRESHOLD / 2) {
                        // Check if this node doesn't already have too many outgoing edges
                        const existingOutgoingEdges = edges.filter(e => e.source === existingNode.id)
                        if (existingOutgoingEdges.length < 3) {
                            autoEdges.push({
                                id: `e-${existingNode.id}-${newNodeId}-${Date.now()}`,
                                source: existingNode.id,
                                target: newNodeId,
                                type: 'smoothstep',
                                animated: true,
                                style: { stroke: '#6366f1', strokeWidth: 2 }
                            })
                        }
                    }

                    // If existing node is below and within proximity, connect to it
                    if (dy > 0 && Math.abs(dy) < PROXIMITY_THRESHOLD && dx < PROXIMITY_THRESHOLD / 2) {
                        // Check if this node doesn't already have too many incoming edges
                        const existingIncomingEdges = edges.filter(e => e.target === existingNode.id)
                        if (existingIncomingEdges.length < 3) {
                            autoEdges.push({
                                id: `e-${newNodeId}-${existingNode.id}-${Date.now() + 1}`,
                                source: newNodeId,
                                target: existingNode.id,
                                type: 'smoothstep',
                                animated: true,
                                style: { stroke: '#6366f1', strokeWidth: 2 }
                            })
                        }
                    }
                })

                setNodes([...nodes, newNode])
                if (autoEdges.length > 0) {
                    setEdges([...edges, ...autoEdges])
                }
            } catch (e) {
                console.error('Failed to parse dropped node data', e)
            }
        },
        [screenToFlowPosition, nodes, edges, setNodes, setEdges]
    )

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        onNodeSelect(node)
    }, [onNodeSelect])

    const onPaneClick = useCallback(() => {
        onNodeSelect(null)
    }, [onNodeSelect])

    // Auto-fit on first load with nodes
    useEffect(() => {
        if (nodes.length > 0) {
            setTimeout(() => fitView({ padding: 0.2 }), 100)
        }
    }, [nodes.length > 0])

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
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
                snapToGrid
                snapGrid={[16, 16]}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: '#6366f1', strokeWidth: 2 }
                }}
            >
                <Background color="rgba(255,255,255,0.03)" gap={24} />
                <Controls className="workflow-controls" />
                <MiniMap
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                    className="workflow-minimap"
                />
            </ReactFlow>

            {nodes.length === 0 && (
                <div className="workflow-empty-state">
                    <div className="workflow-empty-state__icon">
                        <Sparkles size={48} />
                    </div>
                    <h3>Build Your Healthcare Workflow</h3>
                    <p>Drag nodes from the left panel or click to add them to the canvas</p>
                    <div className="workflow-empty-state__tips">
                        <div className="workflow-empty-state__tip">
                            <Zap size={16} />
                            <span>Start with a <strong>Trigger</strong></span>
                        </div>
                        <div className="workflow-empty-state__tip">
                            <Brain size={16} />
                            <span>Add <strong>AI Analysis</strong></span>
                        </div>
                        <div className="workflow-empty-state__tip">
                            <Users size={16} />
                            <span>Include <strong>Human Review</strong></span>
                        </div>
                    </div>
                    <div className="workflow-empty-state__shortcuts">
                        <span><kbd>⌘</kbd> + <kbd>Z</kbd> Undo</span>
                        <span><kbd>⌘</kbd> + <kbd>S</kbd> Save</span>
                        <span><kbd>Del</kbd> Delete Node</span>
                    </div>
                </div>
            )}
        </div>
    )
}

// ================================================
// NODE CONFIGURATION PANEL
// ================================================

interface ConfigPanelProps {
    node: Node | null
    onClose: () => void
    onUpdate: (nodeId: string, data: Partial<CustomNodeData>) => void
    onDelete: (nodeId: string) => void
}

function NodeConfigPanel({ node, onClose, onUpdate, onDelete }: ConfigPanelProps) {
    if (!node) return null

    const data = node.data as unknown as CustomNodeData

    return (
        <motion.aside
            className="workflow-builder-v2__config-panel"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
        >
            <div className="config-panel__header">
                <div className="config-panel__title">
                    <Settings size={16} />
                    <span>Configure Node</span>
                </div>
                <button onClick={onClose} className="config-panel__close">
                    <X size={16} />
                </button>
            </div>

            <div className="config-panel__content">
                <div className="config-panel__node-preview" style={{ borderColor: data.color }}>
                    <div className="config-panel__node-icon" style={{ background: `${data.color}20`, color: data.color }}>
                        {data.icon || <Zap size={20} />}
                    </div>
                    <div className="config-panel__node-info">
                        <span className="config-panel__node-label">{data.label}</span>
                        <span className="config-panel__node-id">{node.id}</span>
                    </div>
                </div>

                <div className="config-panel__section">
                    <label className="config-panel__label">Display Name</label>
                    <input
                        type="text"
                        className="config-panel__input"
                        value={data.label}
                        onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                    />
                </div>

                <div className="config-panel__section">
                    <label className="config-panel__label">Description</label>
                    <textarea
                        className="config-panel__textarea"
                        value={data.description}
                        onChange={(e) => onUpdate(node.id, { description: e.target.value })}
                        rows={3}
                    />
                </div>

                <div className="config-panel__section">
                    <label className="config-panel__label">Node Settings</label>
                    <div className="config-panel__settings">
                        <div className="config-panel__setting">
                            <span>Retry on Failure</span>
                            <input type="checkbox" defaultChecked />
                        </div>
                        <div className="config-panel__setting">
                            <span>Log Execution</span>
                            <input type="checkbox" defaultChecked />
                        </div>
                        <div className="config-panel__setting">
                            <span>Timeout (seconds)</span>
                            <input type="number" defaultValue={30} className="config-panel__number" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="config-panel__footer">
                <button
                    className="config-panel__delete-btn"
                    onClick={() => onDelete(node.id)}
                >
                    <Trash2 size={14} />
                    Delete Node
                </button>
            </div>
        </motion.aside>
    )
}

// ================================================
// MAIN WORKFLOW BUILDER
// ================================================

export function WorkflowBuilder() {
    const [workflowName, setWorkflowName] = useState('Untitled Workflow')
    const [workflowDescription, setWorkflowDescription] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showAIPrompt, setShowAIPrompt] = useState(false)
    const [aiPrompt, setAIPrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [selectedNode, setSelectedNode] = useState<Node | null>(null)
    const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
    const [showTemplates, setShowTemplates] = useState(false)
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['trigger', 'processing', 'ai', 'control', 'hitl', 'output']))

    // Workflow Action Modals
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [showRunModal, setShowRunModal] = useState(false)
    const [showScheduleModal, setShowScheduleModal] = useState(false)
    const [isRunning, setIsRunning] = useState(false)
    const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
    const [currentExecutionStep, setCurrentExecutionStep] = useState(-1)
    const [executionResults, setExecutionResults] = useState<{ nodeId: string; status: 'pending' | 'running' | 'completed'; details: string; duration?: number }[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
    const [scheduleConfig, setScheduleConfig] = useState({ frequency: 'daily', time: '09:00', enabled: false })

    // Local state for nodes and edges
    const [nodes, setNodes] = useState<Node[]>([])
    const [edges, setEdges] = useState<Edge[]>([])

    // Undo/Redo history
    const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)

    // Save to history
    const saveToHistory = useCallback(() => {
        setHistory(prev => [...prev.slice(0, historyIndex + 1), { nodes, edges }])
        setHistoryIndex(prev => prev + 1)
    }, [nodes, edges, historyIndex])

    // Undo
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const prev = history[historyIndex - 1]
            setNodes(prev.nodes)
            setEdges(prev.edges)
            setHistoryIndex(historyIndex - 1)
        }
    }, [history, historyIndex])

    // Redo
    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const next = history[historyIndex + 1]
            setNodes(next.nodes)
            setEdges(next.edges)
            setHistoryIndex(historyIndex + 1)
        }
    }, [history, historyIndex])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault()
                    undo()
                } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
                    e.preventDefault()
                    redo()
                } else if (e.key === 's') {
                    e.preventDefault()
                    // Save workflow
                }
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedNode) {
                    deleteNode(selectedNode.id)
                }
            }
            if (e.key === '?') {
                setShowKeyboardShortcuts(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [undo, redo, selectedNode])

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

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev)
            if (next.has(category)) next.delete(category)
            else next.add(category)
            return next
        })
    }

    // Handle drag start
    const handleDragStart = useCallback((event: React.DragEvent, node: WorkflowNodeType) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(node))
        event.dataTransfer.effectAllowed = 'move'
    }, [])

    // Handle click to add - SMART PLACEMENT with auto-connection
    const handleClickToAdd = useCallback((nodeType: WorkflowNodeType) => {
        const NODE_WIDTH = 180
        const NODE_HEIGHT = 80
        const VERTICAL_SPACING = 120
        const HORIZONTAL_SPACING = 200
        const CANVAS_CENTER_X = 300

        // Find workflow structure
        const findEndNodes = (): Node[] => {
            // End nodes are nodes that have no outgoing edges
            const sourceNodeIds = new Set(edges.map(e => e.source))
            const targetNodeIds = new Set(edges.map(e => e.target))

            // Nodes that are sources but not targets (could also be end nodes if disconnected)
            // End nodes = nodes that don't have outgoing edges
            const nodesWithNoOutgoing = nodes.filter(n => !sourceNodeIds.has(n.id))

            if (nodesWithNoOutgoing.length === 0 && nodes.length > 0) {
                // All nodes have outgoing edges, return the last one by Y position
                return [nodes.reduce((max, n) => n.position.y > max.position.y ? n : max, nodes[0])]
            }

            return nodesWithNoOutgoing.length > 0 ? nodesWithNoOutgoing : []
        }

        const findStartNodes = (): Node[] => {
            // Start nodes are nodes that have no incoming edges
            const targetNodeIds = new Set(edges.map(e => e.target))
            return nodes.filter(n => !targetNodeIds.has(n.id))
        }

        const getLowestY = (): number => {
            if (nodes.length === 0) return 50
            return Math.max(...nodes.map(n => n.position.y)) + VERTICAL_SPACING
        }

        const getHighestY = (): number => {
            if (nodes.length === 0) return 50
            return Math.min(...nodes.map(n => n.position.y))
        }

        let newPosition: { x: number; y: number }
        let connectFromNode: Node | null = null
        let connectToNode: Node | null = null

        // SMART PLACEMENT LOGIC
        if (nodes.length === 0) {
            // First node - center it at the top
            newPosition = { x: CANVAS_CENTER_X, y: 50 }
        } else if (nodeType.category === 'trigger') {
            // Triggers go at the top, above existing start nodes
            const startNodes = findStartNodes()
            const topY = getHighestY()

            if (startNodes.length > 0) {
                // Position above and offset horizontally if there's already a trigger
                newPosition = {
                    x: CANVAS_CENTER_X + (startNodes.length * HORIZONTAL_SPACING),
                    y: Math.max(50, topY - VERTICAL_SPACING)
                }
            } else {
                newPosition = { x: CANVAS_CENTER_X, y: 50 }
            }

            // Find the first processing node to connect to
            const firstProcessingNode = nodes.find(n => {
                const data = n.data as unknown as CustomNodeData
                return data.color === '#8B5CF6' // Processing color
            })
            if (firstProcessingNode) {
                connectToNode = firstProcessingNode
            }
        } else if (nodeType.category === 'output') {
            // Outputs go at the end, below existing end nodes
            const endNodes = findEndNodes()
            const bottomY = getLowestY()

            newPosition = {
                x: CANVAS_CENTER_X + ((endNodes.length > 1 ? endNodes.length - 1 : 0) * (HORIZONTAL_SPACING / 2)),
                y: bottomY
            }

            // Connect from the last end node
            if (endNodes.length > 0) {
                connectFromNode = endNodes[endNodes.length - 1]
            }
        } else {
            // Processing, AI, Control, HITL nodes - add to the end of the workflow
            const endNodes = findEndNodes()
            const bottomY = getLowestY()

            newPosition = { x: CANVAS_CENTER_X, y: bottomY }

            // Connect from the most recent end node (lowest Y that's an end node)
            if (endNodes.length > 0) {
                connectFromNode = endNodes.reduce((lowest, n) =>
                    n.position.y > lowest.position.y ? n : lowest, endNodes[0]
                )
            }
        }

        const newNodeId = `${nodeType.type}-${Date.now()}`
        const newNode: Node = {
            id: newNodeId,
            type: 'custom',
            position: newPosition,
            data: {
                label: nodeType.label,
                color: nodeType.color,
                description: nodeType.description,
                icon: nodeType.icon
            }
        }

        // Create automatic edge connection
        const newEdges: Edge[] = []

        if (connectFromNode) {
            newEdges.push({
                id: `e-${connectFromNode.id}-${newNodeId}-${Date.now()}`,
                source: connectFromNode.id,
                target: newNodeId,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#6366f1', strokeWidth: 2 }
            })
        }

        if (connectToNode) {
            newEdges.push({
                id: `e-${newNodeId}-${connectToNode.id}-${Date.now()}`,
                source: newNodeId,
                target: connectToNode.id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#6366f1', strokeWidth: 2 }
            })
        }

        // Update both nodes and edges
        setNodes(prev => [...prev, newNode])
        if (newEdges.length > 0) {
            setEdges(prev => [...prev, ...newEdges])
        }
        saveToHistory()
    }, [nodes, edges, saveToHistory])

    // Update node
    const updateNode = useCallback((nodeId: string, data: Partial<CustomNodeData>) => {
        setNodes(prev => prev.map(n =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
        ))
    }, [])

    // Delete node
    const deleteNode = useCallback((nodeId: string) => {
        setNodes(prev => prev.filter(n => n.id !== nodeId))
        setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId))
        setSelectedNode(null)
        saveToHistory()
    }, [saveToHistory])

    // AI Generation
    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return
        setIsGenerating(true)
        setTimeout(() => {
            const sampleNodes: Node[] = [
                { id: 'trigger-1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Claim Intake', color: '#06B6D4', description: 'Receive new claims', icon: <FileText size={14} /> } },
                { id: 'validator-1', type: 'custom', position: { x: 250, y: 180 }, data: { label: 'Data Validator', color: '#8B5CF6', description: 'Validate claim data', icon: <CheckCircle size={14} /> } },
                { id: 'ai-1', type: 'custom', position: { x: 100, y: 310 }, data: { label: 'Fraud Detection', color: '#10B981', description: 'AI fraud analysis', icon: <Brain size={14} /> } },
                { id: 'ai-2', type: 'custom', position: { x: 400, y: 310 }, data: { label: 'Risk Scorer', color: '#10B981', description: 'Calculate risk', icon: <Sparkles size={14} /> } },
                { id: 'condition-1', type: 'custom', position: { x: 250, y: 440 }, data: { label: 'High Value?', color: '#F59E0B', description: 'Check if > $10K', icon: <GitBranch size={14} /> } },
                { id: 'review-1', type: 'custom', position: { x: 100, y: 570 }, data: { label: 'Human Review', color: '#EF4444', description: 'Manual review', icon: <Users size={14} /> } },
                { id: 'decision-1', type: 'custom', position: { x: 400, y: 570 }, data: { label: 'Auto Approve', color: '#64748B', description: 'Approve claim', icon: <CheckCircle size={14} /> } },
            ]
            const sampleEdges: Edge[] = [
                { id: 'e1', source: 'trigger-1', target: 'validator-1', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
                { id: 'e2', source: 'validator-1', target: 'ai-1', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
                { id: 'e3', source: 'validator-1', target: 'ai-2', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
                { id: 'e4', source: 'ai-1', target: 'condition-1', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
                { id: 'e5', source: 'ai-2', target: 'condition-1', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
                { id: 'e6', source: 'condition-1', target: 'review-1', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
                { id: 'e7', source: 'condition-1', target: 'decision-1', type: 'smoothstep', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
            ]
            setNodes(sampleNodes)
            setEdges(sampleEdges)
            setIsGenerating(false)
            setShowAIPrompt(false)
            setAIPrompt('')
            saveToHistory()
        }, 2000)
    }

    // Load template
    const loadTemplate = useCallback((template: WorkflowTemplate) => {
        setNodes(template.nodes)
        setEdges(template.edges)
        setWorkflowName(template.name)
        setShowTemplates(false)
        saveToHistory()
    }, [saveToHistory])

    // WORKFLOW ACTIONS

    // Save workflow
    const handleSaveWorkflow = useCallback(() => {
        if (nodes.length === 0) {
            alert('Please add at least one node before saving.')
            return
        }
        setIsSaving(true)
        setSaveStatus('idle')

        // Simulate saving to backend
        setTimeout(() => {
            const workflowData = {
                id: `workflow-${Date.now()}`,
                name: workflowName,
                description: workflowDescription,
                nodes: nodes.map(n => ({ ...n, data: { ...(n.data as object), icon: undefined } })),
                edges,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            // Save to localStorage for persistence
            const savedWorkflows = JSON.parse(localStorage.getItem('apex_workflows') || '[]')
            savedWorkflows.push(workflowData)
            localStorage.setItem('apex_workflows', JSON.stringify(savedWorkflows))

            setIsSaving(false)
            setSaveStatus('saved')
            setTimeout(() => {
                setShowSaveModal(false)
                setSaveStatus('idle')
            }, 1500)
        }, 1000)
    }, [nodes, edges, workflowName, workflowDescription])

    // Generate execution details based on node type
    const getExecutionDetails = (nodeLabel: string): string => {
        const labelLower = nodeLabel.toLowerCase()

        if (labelLower.includes('intake') || labelLower.includes('receive')) {
            return 'Receiving incoming claim data from EDI 837 feed... Parsing member details, provider info, and service codes'
        }
        if (labelLower.includes('valid') || labelLower.includes('data')) {
            return 'Validating data integrity... Checking required fields, format compliance, and NPI verification'
        }
        if (labelLower.includes('eligi')) {
            return 'Verifying member eligibility... Checking coverage dates, plan benefits, and enrollment status'
        }
        if (labelLower.includes('fraud') || labelLower.includes('detect')) {
            return 'Running AI fraud detection algorithms... Analyzing billing patterns and flagging anomalies'
        }
        if (labelLower.includes('risk') || labelLower.includes('score')) {
            return 'Calculating risk scores... Evaluating claim complexity, historical patterns, and provider metrics'
        }
        if (labelLower.includes('ai') || labelLower.includes('analyz')) {
            return 'AI processing claim data... Applying ML models for classification and recommendation'
        }
        if (labelLower.includes('review') || labelLower.includes('human')) {
            return 'Routing to human reviewer queue... Claim flagged for manual adjudication review'
        }
        if (labelLower.includes('approv')) {
            return 'Processing approval... Generating EOB, updating claim status, and triggering payment'
        }
        if (labelLower.includes('deny') || labelLower.includes('reject')) {
            return 'Processing denial... Generating denial letter with appeal rights and reason codes'
        }
        if (labelLower.includes('notif') || labelLower.includes('alert')) {
            return 'Sending notifications... Alerting stakeholders via email, SMS, and portal updates'
        }
        if (labelLower.includes('condition') || labelLower.includes('branch') || labelLower.includes('high')) {
            return 'Evaluating decision criteria... Checking thresholds and routing to appropriate path'
        }
        if (labelLower.includes('queue') || labelLower.includes('assign')) {
            return 'Assigning to work queue... Balancing workload and prioritizing by urgency'
        }
        if (labelLower.includes('process')) {
            return 'Processing step... Applying business rules and updating claim record'
        }
        return 'Executing workflow step... Processing data and applying transformations'
    }

    // Run workflow with visual step tracking
    const handleRunWorkflow = useCallback(() => {
        if (nodes.length === 0) {
            alert('Please build a workflow before running.')
            return
        }

        // Sort nodes by Y position to get execution order
        const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y)

        // Initialize execution results
        const initialResults = sortedNodes.map(node => ({
            nodeId: node.id,
            status: 'pending' as const,
            details: '',
            duration: undefined
        }))

        setExecutionResults(initialResults)
        setCurrentExecutionStep(-1)
        setIsRunning(true)
        setRunStatus('running')

        let stepIndex = 0
        const stepDurations = sortedNodes.map(() => 800 + Math.random() * 600) // Random 0.8-1.4s per step

        const runStep = () => {
            if (stepIndex < sortedNodes.length) {
                const currentNode = sortedNodes[stepIndex]
                const nodeData = currentNode.data as unknown as CustomNodeData
                const stepStartTime = Date.now()

                // Mark current step as running
                setCurrentExecutionStep(stepIndex)
                setExecutionResults(prev => prev.map((r, i) =>
                    i === stepIndex
                        ? { ...r, status: 'running', details: getExecutionDetails(nodeData.label) }
                        : r
                ))

                // Complete the step after duration
                setTimeout(() => {
                    const duration = Date.now() - stepStartTime
                    setExecutionResults(prev => prev.map((r, i) =>
                        i === stepIndex
                            ? { ...r, status: 'completed', duration }
                            : r
                    ))

                    stepIndex++
                    if (stepIndex < sortedNodes.length) {
                        setTimeout(runStep, 200) // Small gap between steps
                    } else {
                        // All steps complete
                        setTimeout(() => {
                            setRunStatus('success')
                            setIsRunning(false)
                        }, 300)
                    }
                }, stepDurations[stepIndex])
            }
        }

        // Start execution after brief delay
        setTimeout(runStep, 500)
    }, [nodes])

    // Export workflow
    const handleExportWorkflow = useCallback(() => {
        if (nodes.length === 0) {
            alert('Please build a workflow before exporting.')
            return
        }

        const workflowData = {
            name: workflowName,
            description: workflowDescription,
            version: '1.0',
            exportedAt: new Date().toISOString(),
            nodes: nodes.map(n => ({
                id: n.id,
                type: n.type,
                position: n.position,
                data: { ...(n.data as object), icon: undefined }
            })),
            edges: edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                type: e.type
            }))
        }

        const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${workflowName.toLowerCase().replace(/\s+/g, '-')}-workflow.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, [nodes, edges, workflowName, workflowDescription])

    // Schedule workflow
    const handleScheduleWorkflow = useCallback(() => {
        if (nodes.length === 0) {
            alert('Please build a workflow before scheduling.')
            return
        }
        setShowScheduleModal(true)
    }, [nodes])

    const saveSchedule = useCallback(() => {
        // Save schedule configuration
        const scheduleData = {
            workflowName,
            ...scheduleConfig,
            scheduledAt: new Date().toISOString()
        }

        const savedSchedules = JSON.parse(localStorage.getItem('apex_workflow_schedules') || '[]')
        savedSchedules.push(scheduleData)
        localStorage.setItem('apex_workflow_schedules', JSON.stringify(savedSchedules))

        setShowScheduleModal(false)
        alert(`Workflow scheduled to run ${scheduleConfig.frequency} at ${scheduleConfig.time}`)
    }, [workflowName, scheduleConfig])
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
                    <span className="workflow-builder-v2__status">
                        {nodes.length > 0 ? `${nodes.length} nodes` : 'Draft'}
                    </span>
                </div>

                <div className="workflow-builder-v2__header-center">
                    <div className="workflow-builder-v2__history-btns">
                        <button
                            className="workflow-builder-v2__history-btn"
                            onClick={undo}
                            disabled={historyIndex <= 0}
                            title="Undo (⌘Z)"
                        >
                            <Undo2 size={16} />
                        </button>
                        <button
                            className="workflow-builder-v2__history-btn"
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1}
                            title="Redo (⌘⇧Z)"
                        >
                            <Redo2 size={16} />
                        </button>
                    </div>
                    <button
                        className="workflow-builder-v2__template-btn"
                        onClick={() => setShowTemplates(true)}
                    >
                        <LayoutTemplate size={16} />
                        Templates
                    </button>
                    <button
                        className="workflow-builder-v2__ai-btn"
                        onClick={() => setShowAIPrompt(true)}
                    >
                        <Sparkles size={16} />
                        Generate with AI
                    </button>
                </div>

                <div className="workflow-builder-v2__header-right">
                    <button
                        className="workflow-builder-v2__action-btn"
                        onClick={() => setShowKeyboardShortcuts(true)}
                        title="Keyboard Shortcuts"
                    >
                        <Keyboard size={16} />
                    </button>
                    <button
                        className="workflow-builder-v2__action-btn"
                        onClick={() => setShowSaveModal(true)}
                        title="Save Workflow"
                    >
                        <Save size={16} />
                    </button>
                    <button
                        className="workflow-builder-v2__action-btn"
                        onClick={handleScheduleWorkflow}
                        title="Schedule Workflow"
                    >
                        <Clock size={16} />
                    </button>
                    <button
                        className="workflow-builder-v2__action-btn workflow-builder-v2__action-btn--primary"
                        onClick={() => setShowRunModal(true)}
                        title="Run Workflow"
                    >
                        <Play size={16} />
                    </button>
                    <button
                        className="workflow-builder-v2__action-btn"
                        onClick={handleExportWorkflow}
                        title="Export Workflow"
                    >
                        <Download size={16} />
                    </button>
                    <button
                        className="workflow-builder-v2__action-btn"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
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
                        <h2>Components</h2>
                        <span className="workflow-builder-v2__palette-count">{NODE_TYPES.length}</span>
                    </div>

                    <div className="workflow-builder-v2__search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search nodes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="workflow-builder-v2__search-clear">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="workflow-builder-v2__categories">
                        {Object.entries(nodesByCategory).map(([category, categoryNodes]) => (
                            <div key={category} className="workflow-builder-v2__category">
                                <button
                                    className="workflow-builder-v2__category-header"
                                    onClick={() => toggleCategory(category)}
                                >
                                    <div className="workflow-builder-v2__category-info">
                                        {CATEGORY_LABELS[category]?.icon}
                                        <span>{CATEGORY_LABELS[category]?.label || category}</span>
                                    </div>
                                    <div className="workflow-builder-v2__category-meta">
                                        <span className="workflow-builder-v2__category-count">{categoryNodes.length}</span>
                                        {expandedCategories.has(category) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {expandedCategories.has(category) && (
                                        <motion.div
                                            className="workflow-builder-v2__nodes"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                        >
                                            {categoryNodes.map(node => (
                                                <motion.div
                                                    key={node.type}
                                                    className="workflow-builder-v2__node-item"
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, node)}
                                                    onClick={() => handleClickToAdd(node)}
                                                    style={{ borderLeftColor: node.color }}
                                                    whileHover={{ x: 4 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <span className="workflow-builder-v2__node-icon" style={{ background: `${node.color}15`, color: node.color }}>
                                                        {node.icon}
                                                    </span>
                                                    <div className="workflow-builder-v2__node-info">
                                                        <span className="workflow-builder-v2__node-label">{node.label}</span>
                                                        <span className="workflow-builder-v2__node-desc">{node.description}</span>
                                                    </div>
                                                    <Plus size={14} className="workflow-builder-v2__node-add" />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                            onNodeSelect={setSelectedNode}
                        />
                    </ReactFlowProvider>
                </main>

                {/* Config Panel */}
                <AnimatePresence>
                    {selectedNode && (
                        <NodeConfigPanel
                            node={selectedNode}
                            onClose={() => setSelectedNode(null)}
                            onUpdate={updateNode}
                            onDelete={deleteNode}
                        />
                    )}
                </AnimatePresence>
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
                                <Sparkles size={20} className="workflow-builder-v2__modal-icon" />
                                <h3>Generate Workflow with AI</h3>
                                <button onClick={() => setShowAIPrompt(false)}><X size={18} /></button>
                            </div>
                            <div className="workflow-builder-v2__modal-body">
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAIPrompt(e.target.value)}
                                    placeholder="Describe your workflow in plain English...&#10;&#10;Example: 'Create a claims processing workflow that validates data, runs fraud detection, and routes high-value claims to human reviewers.'"
                                    rows={5}
                                    autoFocus
                                />
                                <div className="workflow-builder-v2__modal-hints">
                                    <span>Quick prompts:</span>
                                    <button onClick={() => setAIPrompt('Auto-approve claims under $500, flag others for human review')}>
                                        Auto-approval
                                    </button>
                                    <button onClick={() => setAIPrompt('Process referrals with eligibility check and provider matching')}>
                                        Referrals
                                    </button>
                                    <button onClick={() => setAIPrompt('Prior authorization with clinical review and member notification')}>
                                        Prior Auth
                                    </button>
                                </div>
                            </div>
                            <div className="workflow-builder-v2__modal-footer">
                                <button className="workflow-builder-v2__cancel-btn" onClick={() => setShowAIPrompt(false)}>
                                    Cancel
                                </button>
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

            {/* Keyboard Shortcuts Modal */}
            <AnimatePresence>
                {showKeyboardShortcuts && (
                    <motion.div
                        className="workflow-builder-v2__modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowKeyboardShortcuts(false)}
                    >
                        <motion.div
                            className="workflow-builder-v2__shortcuts-modal"
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="shortcuts-modal__header">
                                <Keyboard size={20} />
                                <h3>Keyboard Shortcuts</h3>
                                <button onClick={() => setShowKeyboardShortcuts(false)}><X size={18} /></button>
                            </div>
                            <div className="shortcuts-modal__content">
                                <div className="shortcuts-modal__group">
                                    <h4>General</h4>
                                    <div className="shortcuts-modal__item">
                                        <span>Undo</span>
                                        <div className="shortcuts-modal__keys"><kbd>⌘</kbd><kbd>Z</kbd></div>
                                    </div>
                                    <div className="shortcuts-modal__item">
                                        <span>Redo</span>
                                        <div className="shortcuts-modal__keys"><kbd>⌘</kbd><kbd>⇧</kbd><kbd>Z</kbd></div>
                                    </div>
                                    <div className="shortcuts-modal__item">
                                        <span>Save</span>
                                        <div className="shortcuts-modal__keys"><kbd>⌘</kbd><kbd>S</kbd></div>
                                    </div>
                                </div>
                                <div className="shortcuts-modal__group">
                                    <h4>Canvas</h4>
                                    <div className="shortcuts-modal__item">
                                        <span>Delete Node</span>
                                        <div className="shortcuts-modal__keys"><kbd>Del</kbd></div>
                                    </div>
                                    <div className="shortcuts-modal__item">
                                        <span>Zoom In</span>
                                        <div className="shortcuts-modal__keys"><kbd>⌘</kbd><kbd>+</kbd></div>
                                    </div>
                                    <div className="shortcuts-modal__item">
                                        <span>Zoom Out</span>
                                        <div className="shortcuts-modal__keys"><kbd>⌘</kbd><kbd>-</kbd></div>
                                    </div>
                                    <div className="shortcuts-modal__item">
                                        <span>Fit View</span>
                                        <div className="shortcuts-modal__keys"><kbd>⌘</kbd><kbd>0</kbd></div>
                                    </div>
                                </div>
                                <div className="shortcuts-modal__group">
                                    <h4>Panels</h4>
                                    <div className="shortcuts-modal__item">
                                        <span>Show Shortcuts</span>
                                        <div className="shortcuts-modal__keys"><kbd>?</kbd></div>
                                    </div>
                                    <div className="shortcuts-modal__item">
                                        <span>Fullscreen</span>
                                        <div className="shortcuts-modal__keys"><kbd>F</kbd></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Templates Modal */}
            <AnimatePresence>
                {showTemplates && (
                    <motion.div
                        className="workflow-builder-v2__modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowTemplates(false)}
                    >
                        <motion.div
                            className="workflow-builder-v2__templates-modal"
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="templates-modal__header">
                                <LayoutTemplate size={20} />
                                <h3>Workflow Templates</h3>
                                <button onClick={() => setShowTemplates(false)}><X size={18} /></button>
                            </div>
                            <div className="templates-modal__content">
                                <p className="templates-modal__description">
                                    Start with a pre-built healthcare workflow template and customize it to fit your needs.
                                </p>
                                <div className="templates-modal__grid">
                                    {WORKFLOW_TEMPLATES.map(template => (
                                        <motion.div
                                            key={template.id}
                                            className="templates-modal__card"
                                            onClick={() => loadTemplate(template)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="templates-modal__card-icon">
                                                {template.icon}
                                            </div>
                                            <div className="templates-modal__card-content">
                                                <h4>{template.name}</h4>
                                                <p>{template.description}</p>
                                                <div className="templates-modal__card-meta">
                                                    <span className="templates-modal__card-category">{template.category}</span>
                                                    <span className="templates-modal__card-nodes">{template.nodes.length} nodes</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Save Workflow Modal */}
            <AnimatePresence>
                {showSaveModal && (
                    <motion.div
                        className="workflow-builder-v2__modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowSaveModal(false)}
                    >
                        <motion.div
                            className="workflow-builder-v2__action-modal"
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="action-modal__header">
                                <Save size={20} />
                                <h3>Save Workflow</h3>
                                <button onClick={() => setShowSaveModal(false)}><X size={18} /></button>
                            </div>
                            <div className="action-modal__content">
                                <div className="action-modal__field">
                                    <label>Workflow Name</label>
                                    <input
                                        type="text"
                                        value={workflowName}
                                        onChange={(e) => setWorkflowName(e.target.value)}
                                        placeholder="Enter workflow name..."
                                    />
                                </div>
                                <div className="action-modal__field">
                                    <label>Description</label>
                                    <textarea
                                        value={workflowDescription}
                                        onChange={(e) => setWorkflowDescription(e.target.value)}
                                        placeholder="Describe what this workflow does..."
                                        rows={3}
                                    />
                                </div>
                                <div className="action-modal__stats">
                                    <div className="action-modal__stat">
                                        <span className="action-modal__stat-value">{nodes.length}</span>
                                        <span className="action-modal__stat-label">Nodes</span>
                                    </div>
                                    <div className="action-modal__stat">
                                        <span className="action-modal__stat-value">{edges.length}</span>
                                        <span className="action-modal__stat-label">Connections</span>
                                    </div>
                                </div>
                            </div>
                            <div className="action-modal__footer">
                                <button className="action-modal__btn action-modal__btn--secondary" onClick={() => setShowSaveModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="action-modal__btn action-modal__btn--primary"
                                    onClick={handleSaveWorkflow}
                                    disabled={isSaving || nodes.length === 0}
                                >
                                    {isSaving ? (
                                        <><Loader2 size={16} className="spin" /> Saving...</>
                                    ) : saveStatus === 'saved' ? (
                                        <><CheckCircle size={16} /> Saved!</>
                                    ) : (
                                        <><Save size={16} /> Save Workflow</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Run Workflow Modal - Enhanced Visual Execution */}
            <AnimatePresence>
                {showRunModal && (
                    <motion.div
                        className="workflow-builder-v2__modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isRunning && setShowRunModal(false)}
                    >
                        <motion.div
                            className="workflow-builder-v2__action-modal workflow-builder-v2__action-modal--execution"
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="action-modal__header">
                                <Play size={20} />
                                <h3>{runStatus === 'running' ? 'Executing Workflow' : runStatus === 'success' ? 'Execution Complete' : 'Run Workflow'}</h3>
                                {!isRunning && <button onClick={() => { setShowRunModal(false); setRunStatus('idle'); setExecutionResults([]); }}><X size={18} /></button>}
                            </div>

                            <div className="action-modal__content">
                                {runStatus === 'idle' && (
                                    <div className="execution-preview">
                                        <div className="execution-preview__icon">
                                            <Zap size={48} />
                                        </div>
                                        <h4>{workflowName}</h4>
                                        <p>Ready to execute {nodes.length} workflow steps</p>
                                        <div className="execution-preview__nodes">
                                            {[...nodes].sort((a, b) => a.position.y - b.position.y).map((node, i) => {
                                                const nodeData = node.data as unknown as CustomNodeData
                                                return (
                                                    <div key={node.id} className="execution-preview__node">
                                                        <span className="execution-preview__node-num">{i + 1}</span>
                                                        <span className="execution-preview__node-label">{nodeData.label}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {(runStatus === 'running' || runStatus === 'success') && (
                                    <div className="execution-timeline">
                                        <div className="execution-timeline__header">
                                            <div className="execution-timeline__progress-info">
                                                <span className="execution-timeline__completed">
                                                    {executionResults.filter(r => r.status === 'completed').length} of {executionResults.length}
                                                </span>
                                                <span className="execution-timeline__status">
                                                    {runStatus === 'running' ? 'Processing...' : 'Completed'}
                                                </span>
                                            </div>
                                            <div className="execution-timeline__progress-bar">
                                                <motion.div
                                                    className="execution-timeline__progress-fill"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(executionResults.filter(r => r.status === 'completed').length / executionResults.length) * 100}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                        </div>

                                        <div className="execution-timeline__steps">
                                            {executionResults.map((result, index) => {
                                                const node = [...nodes].sort((a, b) => a.position.y - b.position.y)[index]
                                                const nodeData = node?.data as unknown as CustomNodeData

                                                return (
                                                    <motion.div
                                                        key={result.nodeId}
                                                        className={`execution-step execution-step--${result.status}`}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <div className="execution-step__indicator">
                                                            {result.status === 'pending' && (
                                                                <div className="execution-step__dot execution-step__dot--pending" />
                                                            )}
                                                            {result.status === 'running' && (
                                                                <Loader2 size={16} className="spin execution-step__spinner" />
                                                            )}
                                                            {result.status === 'completed' && (
                                                                <CheckCircle size={16} className="execution-step__check" />
                                                            )}
                                                        </div>

                                                        <div className="execution-step__content">
                                                            <div className="execution-step__header">
                                                                <div className="execution-step__icon" style={{ background: `${nodeData?.color}20`, color: nodeData?.color }}>
                                                                    {nodeData?.icon || <Zap size={14} />}
                                                                </div>
                                                                <div className="execution-step__info">
                                                                    <span className="execution-step__label">{nodeData?.label || 'Step'}</span>
                                                                    <span className="execution-step__status-text">
                                                                        {result.status === 'pending' && 'Waiting...'}
                                                                        {result.status === 'running' && 'Executing...'}
                                                                        {result.status === 'completed' && `Completed in ${result.duration}ms`}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {(result.status === 'running' || result.status === 'completed') && result.details && (
                                                                <motion.div
                                                                    className="execution-step__details"
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <p>{result.details}</p>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )
                                            })}
                                        </div>

                                        {runStatus === 'success' && (
                                            <motion.div
                                                className="execution-summary"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <CheckCircle size={24} />
                                                <div className="execution-summary__info">
                                                    <h4>Workflow Executed Successfully</h4>
                                                    <p>All {executionResults.length} steps completed • Total time: {(executionResults.reduce((sum, r) => sum + (r.duration || 0), 0) / 1000).toFixed(1)}s</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="action-modal__footer">
                                {runStatus === 'idle' && (
                                    <>
                                        <button className="action-modal__btn action-modal__btn--secondary" onClick={() => setShowRunModal(false)}>
                                            Cancel
                                        </button>
                                        <button
                                            className="action-modal__btn action-modal__btn--primary action-modal__btn--run"
                                            onClick={handleRunWorkflow}
                                            disabled={nodes.length === 0}
                                        >
                                            <Play size={16} /> Execute Now
                                        </button>
                                    </>
                                )}
                                {runStatus === 'success' && (
                                    <button
                                        className="action-modal__btn action-modal__btn--primary"
                                        onClick={() => { setShowRunModal(false); setRunStatus('idle'); setExecutionResults([]); }}
                                    >
                                        <CheckCircle size={16} /> Done
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Schedule Workflow Modal */}
            <AnimatePresence>
                {showScheduleModal && (
                    <motion.div
                        className="workflow-builder-v2__modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowScheduleModal(false)}
                    >
                        <motion.div
                            className="workflow-builder-v2__action-modal"
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="action-modal__header">
                                <Clock size={20} />
                                <h3>Schedule Workflow</h3>
                                <button onClick={() => setShowScheduleModal(false)}><X size={18} /></button>
                            </div>
                            <div className="action-modal__content">
                                <div className="action-modal__schedule-info">
                                    <h4>{workflowName}</h4>
                                    <p>Configure when this workflow should run automatically</p>
                                </div>
                                <div className="action-modal__field">
                                    <label>Frequency</label>
                                    <select
                                        value={scheduleConfig.frequency}
                                        onChange={(e) => setScheduleConfig(prev => ({ ...prev, frequency: e.target.value }))}
                                    >
                                        <option value="hourly">Hourly</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                                <div className="action-modal__field">
                                    <label>Time</label>
                                    <input
                                        type="time"
                                        value={scheduleConfig.time}
                                        onChange={(e) => setScheduleConfig(prev => ({ ...prev, time: e.target.value }))}
                                    />
                                </div>
                                <div className="action-modal__toggle">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={scheduleConfig.enabled}
                                            onChange={(e) => setScheduleConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                                        />
                                        <span>Enable Schedule</span>
                                    </label>
                                </div>
                            </div>
                            <div className="action-modal__footer">
                                <button className="action-modal__btn action-modal__btn--secondary" onClick={() => setShowScheduleModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="action-modal__btn action-modal__btn--primary"
                                    onClick={saveSchedule}
                                    disabled={!scheduleConfig.enabled}
                                >
                                    <Clock size={16} /> Save Schedule
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
