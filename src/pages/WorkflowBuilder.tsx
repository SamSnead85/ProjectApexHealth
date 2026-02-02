import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
    Workflow, Plus, Play, Pause, Save, Upload, Download, Trash2, Copy,
    Settings, ChevronRight, ChevronDown, GripVertical, Zap, Clock,
    CheckCircle, XCircle, AlertTriangle, ArrowRight, FileText, Users,
    Mail, Bell, Brain, Database, Code, Filter, GitBranch, Repeat,
    Timer, Flag, Shield, Search, MoreVertical, Eye, Edit2, Lock
} from 'lucide-react'
import { GlassCard, Badge, Button, Input } from '../components/common'
import './WorkflowBuilder.css'

// ============================================================================
// WORKFLOW BUILDER - VISUAL PROCESS AUTOMATION
// Drag-and-drop workflow designer with node-based rules
// ============================================================================

// Node types for workflow builder
const nodeTypes = {
    triggers: [
        { type: 'claim_submitted', label: 'Claim Submitted', icon: FileText, color: 'cyan' },
        { type: 'prior_auth_request', label: 'Prior Auth Request', icon: Shield, color: 'cyan' },
        { type: 'member_enrolled', label: 'Member Enrolled', icon: Users, color: 'cyan' },
        { type: 'scheduled', label: 'Scheduled', icon: Timer, color: 'cyan' },
        { type: 'webhook', label: 'Webhook Trigger', icon: Zap, color: 'cyan' },
    ],
    conditions: [
        { type: 'if_condition', label: 'If/Then', icon: GitBranch, color: 'amber' },
        { type: 'filter', label: 'Filter', icon: Filter, color: 'amber' },
        { type: 'switch', label: 'Switch/Case', icon: Repeat, color: 'amber' },
        { type: 'threshold', label: 'Threshold Check', icon: AlertTriangle, color: 'amber' },
    ],
    actions: [
        { type: 'auto_approve', label: 'Auto Approve', icon: CheckCircle, color: 'emerald' },
        { type: 'auto_deny', label: 'Auto Deny', icon: XCircle, color: 'rose' },
        { type: 'assign_reviewer', label: 'Assign Reviewer', icon: Users, color: 'violet' },
        { type: 'send_notification', label: 'Send Notification', icon: Bell, color: 'violet' },
        { type: 'send_email', label: 'Send Email', icon: Mail, color: 'violet' },
        { type: 'update_record', label: 'Update Record', icon: Database, color: 'violet' },
        { type: 'call_api', label: 'Call API', icon: Code, color: 'violet' },
        { type: 'ai_review', label: 'AI Review', icon: Brain, color: 'violet' },
    ],
    utilities: [
        { type: 'delay', label: 'Delay', icon: Clock, color: 'slate' },
        { type: 'log', label: 'Log Event', icon: FileText, color: 'slate' },
        { type: 'flag', label: 'Set Flag', icon: Flag, color: 'slate' },
    ]
}

// Sample workflow templates
const workflowTemplates = [
    {
        id: 'prior-auth',
        name: 'Prior Authorization',
        description: 'Automate prior auth decisions with AI review',
        nodes: 4,
        status: 'active'
    },
    {
        id: 'claims-adj',
        name: 'Claims Adjudication',
        description: 'End-to-end claims processing workflow',
        nodes: 8,
        status: 'active'
    },
    {
        id: 'appeals',
        name: 'Appeals Processing',
        description: 'Dispute resolution and escalation',
        nodes: 6,
        status: 'draft'
    },
    {
        id: 'enrollment',
        name: 'Member Enrollment',
        description: 'New member onboarding automation',
        nodes: 5,
        status: 'active'
    },
]

interface WorkflowNode {
    id: string
    type: string
    label: string
    icon: any
    color: string
    config?: Record<string, any>
}

// Node Palette Item
function PaletteItem({ node, onDragStart }: { node: typeof nodeTypes.triggers[0], onDragStart: (node: any) => void }) {
    return (
        <motion.div
            className={`wf-palette-item wf-palette-item--${node.color}`}
            draggable
            onDragStart={() => onDragStart(node)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <node.icon size={16} />
            <span>{node.label}</span>
        </motion.div>
    )
}

// Workflow Node Component
function WorkflowNode({ node, isSelected, onSelect, onDelete }: {
    node: WorkflowNode,
    isSelected: boolean,
    onSelect: () => void,
    onDelete: () => void
}) {
    return (
        <motion.div
            className={`wf-node wf-node--${node.color} ${isSelected ? 'wf-node--selected' : ''}`}
            onClick={onSelect}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ y: -2 }}
            layout
        >
            <div className="wf-node__drag">
                <GripVertical size={14} />
            </div>
            <div className="wf-node__icon">
                <node.icon size={18} />
            </div>
            <div className="wf-node__content">
                <span className="wf-node__label">{node.label}</span>
                <span className="wf-node__type">{node.type.replace(/_/g, ' ')}</span>
            </div>
            <div className="wf-node__actions">
                <button className="wf-node__action" onClick={(e) => { e.stopPropagation(); }}>
                    <Settings size={14} />
                </button>
                <button className="wf-node__action wf-node__action--danger" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                    <Trash2 size={14} />
                </button>
            </div>
            <div className="wf-node__connector wf-node__connector--out">
                <ArrowRight size={12} />
            </div>
        </motion.div>
    )
}

// Workflow Template Card
function TemplateCard({ template, onSelect }: { template: typeof workflowTemplates[0], onSelect: () => void }) {
    return (
        <motion.button
            className="wf-template-card"
            onClick={onSelect}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            <div className="wf-template-card__header">
                <Workflow size={20} />
                <Badge variant={template.status === 'active' ? 'success' : 'secondary'}>
                    {template.status}
                </Badge>
            </div>
            <h4 className="wf-template-card__name">{template.name}</h4>
            <p className="wf-template-card__desc">{template.description}</p>
            <div className="wf-template-card__meta">
                <span>{template.nodes} nodes</span>
                <ChevronRight size={14} />
            </div>
        </motion.button>
    )
}

export function WorkflowBuilder() {
    const [workflows, setWorkflows] = useState(workflowTemplates)
    const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
    const [nodes, setNodes] = useState<WorkflowNode[]>([])
    const [selectedNode, setSelectedNode] = useState<string | null>(null)
    const [isRunning, setIsRunning] = useState(false)
    const [paletteSection, setPaletteSection] = useState<string>('triggers')
    const canvasRef = useRef<HTMLDivElement>(null)

    // Handle drag and drop
    const handleDragStart = useCallback((node: any) => {
        // Store node data for drop
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        // Add node to canvas
    }, [])

    const addNode = (nodeType: typeof nodeTypes.triggers[0]) => {
        const newNode: WorkflowNode = {
            id: `node-${Date.now()}`,
            type: nodeType.type,
            label: nodeType.label,
            icon: nodeType.icon,
            color: nodeType.color,
            config: {}
        }
        setNodes(prev => [...prev, newNode])
    }

    const deleteNode = (nodeId: string) => {
        setNodes(prev => prev.filter(n => n.id !== nodeId))
        if (selectedNode === nodeId) setSelectedNode(null)
    }

    const handleRunWorkflow = () => {
        setIsRunning(true)
        setTimeout(() => setIsRunning(false), 3000)
    }

    return (
        <div className="workflow-builder">
            {/* Header */}
            <header className="wf-header">
                <div className="wf-header__left">
                    <div className="wf-header__title">
                        <Workflow size={24} />
                        <div>
                            <h1>Workflow Builder</h1>
                            <span className="wf-header__subtitle">Visual Process Automation</span>
                        </div>
                    </div>
                </div>
                <div className="wf-header__actions">
                    <Button variant="secondary" icon={<Upload size={16} />}>
                        Import
                    </Button>
                    <Button variant="secondary" icon={<Download size={16} />}>
                        Export
                    </Button>
                    <Button variant="secondary" icon={<Save size={16} />}>
                        Save Draft
                    </Button>
                    <Button
                        variant="primary"
                        icon={isRunning ? <Pause size={16} /> : <Play size={16} />}
                        onClick={handleRunWorkflow}
                        loading={isRunning}
                    >
                        {isRunning ? 'Running...' : 'Test Run'}
                    </Button>
                </div>
            </header>

            <div className="wf-main">
                {/* Sidebar - Templates & Palette */}
                <aside className="wf-sidebar">
                    {/* Templates Section */}
                    <div className="wf-sidebar__section">
                        <h3 className="wf-sidebar__title">
                            <FileText size={16} />
                            Templates
                        </h3>
                        <div className="wf-templates-grid">
                            {workflows.map(wf => (
                                <TemplateCard
                                    key={wf.id}
                                    template={wf}
                                    onSelect={() => setSelectedWorkflow(wf.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Node Palette */}
                    <div className="wf-sidebar__section wf-palette">
                        <h3 className="wf-sidebar__title">
                            <Plus size={16} />
                            Add Nodes
                        </h3>

                        <div className="wf-palette__tabs">
                            {Object.keys(nodeTypes).map(key => (
                                <button
                                    key={key}
                                    className={`wf-palette__tab ${paletteSection === key ? 'wf-palette__tab--active' : ''}`}
                                    onClick={() => setPaletteSection(key)}
                                >
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="wf-palette__items">
                            {(nodeTypes[paletteSection as keyof typeof nodeTypes] || []).map((node, idx) => (
                                <PaletteItem
                                    key={node.type}
                                    node={node}
                                    onDragStart={handleDragStart}
                                />
                            ))}
                        </div>

                        <div className="wf-palette__add-hint">
                            <span>Click to add or drag to canvas</span>
                        </div>
                    </div>
                </aside>

                {/* Canvas */}
                <div className="wf-canvas-container">
                    <div className="wf-canvas-header">
                        <div className="wf-canvas-header__info">
                            <Badge variant="teal" dot pulse>
                                <Brain size={12} /> AI-Assisted
                            </Badge>
                            <span>{nodes.length} nodes</span>
                        </div>
                        <div className="wf-canvas-header__actions">
                            <button className="wf-canvas-action">
                                <Eye size={16} />
                                Preview
                            </button>
                            <button className="wf-canvas-action">
                                <Copy size={16} />
                                Duplicate
                            </button>
                            <button className="wf-canvas-action wf-canvas-action--danger">
                                <Trash2 size={16} />
                                Clear
                            </button>
                        </div>
                    </div>

                    <div
                        ref={canvasRef}
                        className="wf-canvas"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        {nodes.length === 0 ? (
                            <div className="wf-canvas__empty">
                                <Workflow size={48} />
                                <h3>Start Building Your Workflow</h3>
                                <p>Drag nodes from the palette or click to add them</p>
                                <div className="wf-canvas__quick-add">
                                    <span>Quick start:</span>
                                    {nodeTypes.triggers.slice(0, 3).map(node => (
                                        <button
                                            key={node.type}
                                            className="wf-quick-add-btn"
                                            onClick={() => addNode(node)}
                                        >
                                            <node.icon size={14} />
                                            {node.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="wf-canvas__nodes">
                                <Reorder.Group
                                    axis="y"
                                    values={nodes}
                                    onReorder={setNodes}
                                    className="wf-node-list"
                                >
                                    {nodes.map((node) => (
                                        <Reorder.Item key={node.id} value={node}>
                                            <WorkflowNode
                                                node={node}
                                                isSelected={selectedNode === node.id}
                                                onSelect={() => setSelectedNode(node.id)}
                                                onDelete={() => deleteNode(node.id)}
                                            />
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </div>
                        )}
                    </div>
                </div>

                {/* Properties Panel */}
                {selectedNode && (
                    <aside className="wf-properties">
                        <div className="wf-properties__header">
                            <h3>Node Properties</h3>
                            <button onClick={() => setSelectedNode(null)}>
                                <XCircle size={18} />
                            </button>
                        </div>
                        <div className="wf-properties__content">
                            {nodes.find(n => n.id === selectedNode) && (
                                <>
                                    <div className="wf-prop-group">
                                        <label>Node Name</label>
                                        <Input
                                            value={nodes.find(n => n.id === selectedNode)?.label || ''}
                                            onChange={() => { }}
                                            fullWidth
                                        />
                                    </div>
                                    <div className="wf-prop-group">
                                        <label>Description</label>
                                        <textarea placeholder="Add a description..."></textarea>
                                    </div>
                                    <div className="wf-prop-group">
                                        <label>Conditions</label>
                                        <Button variant="secondary" size="sm" icon={<Plus size={14} />} fullWidth>
                                            Add Condition
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    )
}

export default WorkflowBuilder
