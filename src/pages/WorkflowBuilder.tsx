import { useState, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
    Workflow, Plus, Play, Pause, Save, Upload, Download, Trash2, Copy,
    Settings, ChevronRight, ChevronDown, GripVertical, Zap, Clock,
    CheckCircle, XCircle, AlertTriangle, ArrowRight, FileText, Users,
    Mail, Bell, Brain, Database, Code, Filter, GitBranch, Repeat,
    Timer, Flag, Shield, Search, MoreVertical, Eye, Edit2, Lock
} from 'lucide-react'
import { GlassCard, Badge, Button, Input } from '../components/common'
import { useToast } from '../components/common/Toast'
import { exportToCSV } from '../utils/exportData'
import './WorkflowBuilder.css'

// ============================================================================
// WORKFLOW BUILDER - VISUAL PROCESS AUTOMATION
// Drag-and-drop workflow designer with node-based rules
// ============================================================================

// Node types for workflow builder
const nodeTypes = {
    triggers: [
        { type: 'claim_submitted', label: 'Claim Submitted', icon: FileText, color: 'cyan', description: 'When a new claim is submitted' },
        { type: 'prior_auth_request', label: 'Prior Auth Request', icon: Shield, color: 'cyan', description: 'When prior auth is requested' },
        { type: 'member_enrolled', label: 'Member Enrolled', icon: Users, color: 'cyan', description: 'When a member enrolls' },
        { type: 'scheduled', label: 'Scheduled', icon: Timer, color: 'cyan', description: 'Run on a schedule' },
        { type: 'webhook', label: 'Webhook Trigger', icon: Zap, color: 'cyan', description: 'Triggered via webhook' },
    ],
    conditions: [
        { type: 'if_condition', label: 'If/Then', icon: GitBranch, color: 'amber', description: 'Branch based on condition' },
        { type: 'filter', label: 'Filter', icon: Filter, color: 'amber', description: 'Filter records by criteria' },
        { type: 'switch', label: 'Switch/Case', icon: Repeat, color: 'amber', description: 'Multi-path branching' },
        { type: 'threshold', label: 'Threshold Check', icon: AlertTriangle, color: 'amber', description: 'Check numeric threshold' },
    ],
    actions: [
        { type: 'auto_approve', label: 'Auto Approve', icon: CheckCircle, color: 'emerald', description: 'Automatically approve the request' },
        { type: 'auto_deny', label: 'Auto Deny', icon: XCircle, color: 'rose', description: 'Automatically deny the request' },
        { type: 'assign_reviewer', label: 'Assign Reviewer', icon: Users, color: 'violet', description: 'Route to human reviewer' },
        { type: 'send_notification', label: 'Send Notification', icon: Bell, color: 'violet', description: 'Push notification to user' },
        { type: 'send_email', label: 'Send Email', icon: Mail, color: 'amber', description: 'Send email to stakeholder' },
        { type: 'update_record', label: 'Update Record', icon: Database, color: 'violet', description: 'Update a database record' },
        { type: 'call_api', label: 'Call API', icon: Code, color: 'cyan', description: 'Call external API endpoint' },
        { type: 'ai_decision', label: 'AI Decision', icon: Brain, color: 'purple', description: 'Use AI to make routing decisions' },
    ],
    utilities: [
        { type: 'delay', label: 'Delay', icon: Clock, color: 'gray', description: 'Wait for specified time period' },
        { type: 'log', label: 'Log Event', icon: FileText, color: 'slate', description: 'Log an event for auditing' },
        { type: 'flag', label: 'Set Flag', icon: Flag, color: 'slate', description: 'Set a workflow flag' },
        { type: 'api_call', label: 'API Call', icon: Zap, color: 'cyan', description: 'Call external API endpoint' },
        { type: 'email_notification', label: 'Email Notification', icon: Mail, color: 'amber', description: 'Send email to stakeholder' },
    ]
}

// All trigger types for category lookup
const triggerTypes = new Set(nodeTypes.triggers.map(n => n.type))
const actionTypes = new Set([
    ...nodeTypes.actions.map(n => n.type),
    ...nodeTypes.utilities.map(n => n.type),
])

// Helper to find a node definition by type across all categories
function findNodeDef(type: string) {
    for (const category of Object.values(nodeTypes)) {
        const found = category.find(n => n.type === type)
        if (found) return found
    }
    return null
}

// Sample workflow templates
const workflowTemplates = [
    {
        id: 'claims-auto-adj',
        name: 'Claims Auto-Adjudication',
        description: 'Automatically adjudicate claims using AI-powered rules and threshold checks',
        icon: FileText,
        nodes: 7,
        status: 'active' as const,
        previewNodes: ['claim_submitted', 'threshold', 'ai_decision', 'auto_approve', 'auto_deny', 'send_email', 'log']
    },
    {
        id: 'prior-auth-review',
        name: 'Prior Auth Review',
        description: 'Route prior authorization requests through AI review and human oversight',
        icon: Shield,
        nodes: 5,
        status: 'active' as const,
        previewNodes: ['prior_auth_request', 'ai_decision', 'if_condition', 'auto_approve', 'assign_reviewer']
    },
    {
        id: 'fraud-alert',
        name: 'Fraud Alert',
        description: 'Detect anomalous claims patterns and escalate suspicious activity',
        icon: AlertTriangle,
        nodes: 6,
        status: 'active' as const,
        previewNodes: ['claim_submitted', 'ai_decision', 'threshold', 'flag', 'send_notification', 'assign_reviewer']
    },
    {
        id: 'member-welcome',
        name: 'Member Welcome',
        description: 'Automated onboarding flow for newly enrolled members',
        icon: Users,
        nodes: 5,
        status: 'active' as const,
        previewNodes: ['member_enrolled', 'delay', 'send_email', 'send_notification', 'log']
    },
    {
        id: 'provider-credentialing',
        name: 'Provider Credentialing',
        description: 'Verify and credential new healthcare providers in the network',
        icon: Lock,
        nodes: 6,
        status: 'draft' as const,
        previewNodes: ['webhook', 'call_api', 'if_condition', 'assign_reviewer', 'auto_approve', 'send_email']
    },
    {
        id: 'denial-appeal',
        name: 'Denial Appeal',
        description: 'Process and route denial appeals through review stages',
        icon: Flag,
        nodes: 6,
        status: 'draft' as const,
        previewNodes: ['webhook', 'filter', 'ai_decision', 'assign_reviewer', 'send_email', 'update_record']
    },
]

interface WorkflowNode {
    id: string
    type: string
    label: string
    description?: string
    icon: any
    color: string
    config?: Record<string, any>
}

// Node Palette Item
function PaletteItem({ node, onDragStart, onClick }: {
    node: typeof nodeTypes.triggers[0],
    onDragStart: (e: React.DragEvent, node: any) => void,
    onClick: () => void
}) {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, node)}
        >
            <motion.div
                className={`wf-palette-item wf-palette-item--${node.color}`}
                onClick={onClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <node.icon size={16} />
                <span>{node.label}</span>
            </motion.div>
        </div>
    )
}

// Workflow Node Component
function WorkflowNodeComponent({ node, isSelected, isInvalid, isExecuting, onSelect, onDelete, onSettingsClick }: {
    node: WorkflowNode,
    isSelected: boolean,
    isInvalid?: boolean,
    isExecuting?: boolean,
    onSelect: () => void,
    onDelete: () => void,
    onSettingsClick?: () => void
}) {
    return (
        <motion.div
            className={`wf-node wf-node--${node.color} ${isSelected ? 'wf-node--selected' : ''} ${isInvalid ? 'wf-node--invalid' : ''} ${isExecuting ? 'wf-node--executing' : ''}`}
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
                <button className="wf-node__action" onClick={(e) => { e.stopPropagation(); onSettingsClick?.(); }}>
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
function TemplateCard({ template, onSelect, onApply }: {
    template: typeof workflowTemplates[0],
    onSelect: () => void,
    onApply: () => void
}) {
    const IconComponent = template.icon
    return (
        <motion.div
            className="wf-template-card"
            onClick={onSelect}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            <div className="wf-template-card__header">
                <div className="wf-template-card__icon-wrap">
                    <IconComponent size={20} />
                </div>
                <Badge variant={template.status === 'active' ? 'success' : 'secondary'}>
                    {template.status}
                </Badge>
            </div>
            <h4 className="wf-template-card__name">{template.name}</h4>
            <p className="wf-template-card__desc">{template.description}</p>
            <div className="wf-template-card__preview">
                {template.previewNodes.slice(0, 4).map((nodeType, idx) => {
                    const def = findNodeDef(nodeType)
                    if (!def) return null
                    const NodeIcon = def.icon
                    return (
                        <span key={idx} className={`wf-template-card__preview-icon wf-template-card__preview-icon--${def.color}`} title={def.label}>
                            <NodeIcon size={12} />
                        </span>
                    )
                })}
                {template.previewNodes.length > 4 && (
                    <span className="wf-template-card__preview-more">
                        +{template.previewNodes.length - 4}
                    </span>
                )}
            </div>
            <div className="wf-template-card__meta">
                <span>{template.nodes} nodes</span>
                <button
                    className="wf-template-card__apply"
                    onClick={(e) => { e.stopPropagation(); onApply(); }}
                >
                    Apply Template
                    <ChevronRight size={14} />
                </button>
            </div>
        </motion.div>
    )
}

// Validation error interface
interface ValidationError {
    message: string
    nodeIds?: string[]
}

export function WorkflowBuilder() {
    const { addToast } = useToast()
    const [workflows] = useState(workflowTemplates)
    const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
    const [nodes, setNodes] = useState<WorkflowNode[]>([])
    const [selectedNode, setSelectedNode] = useState<string | null>(null)
    const [isRunning, setIsRunning] = useState(false)
    const [paletteSection, setPaletteSection] = useState<string>('triggers')
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
    const [invalidNodeIds, setInvalidNodeIds] = useState<Set<string>>(new Set())
    const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null)
    const [executingNodeId, setExecutingNodeId] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [isSavingDraft, setIsSavingDraft] = useState(false)
    const canvasRef = useRef<HTMLDivElement>(null)

    // Handle drag and drop
    const handleDragStart = (e: React.DragEvent, node: any) => {
        setDraggedNodeType(node.type)
        e.dataTransfer.setData('text/plain', node.type)
        e.dataTransfer.effectAllowed = 'copy'
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const nodeType = e.dataTransfer.getData('text/plain') || draggedNodeType
        if (nodeType) {
            const def = findNodeDef(nodeType)
            if (def) {
                addNode(def)
            }
            setDraggedNodeType(null)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
        if (!isDragOver) setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragOver(false)
        }
    }

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
        // Clear validation when nodes change
        setValidationErrors([])
        setInvalidNodeIds(new Set())
    }

    const deleteNode = (nodeId: string) => {
        setNodes(prev => prev.filter(n => n.id !== nodeId))
        if (selectedNode === nodeId) setSelectedNode(null)
        setValidationErrors([])
        setInvalidNodeIds(new Set())
    }

    const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, ...updates } : n))
    }

    const handleDuplicateNode = () => {
        if (!selectedNode) return
        const node = nodes.find(n => n.id === selectedNode)
        if (!node) return
        const newNode: WorkflowNode = {
            ...node,
            id: `node-${Date.now()}`,
            label: `${node.label} (Copy)`,
        }
        setNodes(prev => [...prev, newNode])
    }

    const handleClearCanvas = () => {
        if (nodes.length === 0) return
        if (window.confirm('Are you sure you want to clear all nodes? This cannot be undone.')) {
            setNodes([])
            setSelectedNode(null)
            setValidationErrors([])
            setInvalidNodeIds(new Set())
        }
    }

    const handleRunWorkflow = async () => {
        if (nodes.length === 0) return
        if (!validateWorkflow()) return
        setIsRunning(true)
        for (let i = 0; i < nodes.length; i++) {
            setExecutingNodeId(nodes[i].id)
            await new Promise(r => setTimeout(r, 1000 + Math.random() * 500))
        }
        setExecutingNodeId(null)
        setIsRunning(false)
    }

    // Validation system
    const validateWorkflow = () => {
        const errors: ValidationError[] = []
        const badNodeIds = new Set<string>()

        const hasTrigger = nodes.some(n => triggerTypes.has(n.type))
        const hasAction = nodes.some(n => actionTypes.has(n.type))

        if (nodes.length === 0) {
            errors.push({ message: 'Workflow is empty. Add at least a trigger and an action node.' })
        } else {
            if (!hasTrigger) {
                errors.push({ message: 'Workflow must have at least one trigger node.' })
                // Highlight first node as it should be a trigger
                if (nodes.length > 0) badNodeIds.add(nodes[0].id)
            }
            if (!hasAction) {
                errors.push({ message: 'Workflow must have at least one action node.' })
            }
        }

        setValidationErrors(errors)
        setInvalidNodeIds(badNodeIds)

        return errors.length === 0
    }

    // Apply a template to the canvas
    const applyTemplate = (template: typeof workflowTemplates[0]) => {
        const newNodes: WorkflowNode[] = template.previewNodes.map((type, idx) => {
            const def = findNodeDef(type)
            return {
                id: `node-${Date.now()}-${idx}`,
                type: def?.type || type,
                label: def?.label || type,
                icon: def?.icon || Workflow,
                color: def?.color || 'slate',
                config: {}
            }
        })
        setNodes(newNodes)
        setSelectedWorkflow(template.id)
        setValidationErrors([])
        setInvalidNodeIds(new Set())
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
                    <Button variant="secondary" icon={<Download size={16} />} onClick={() => {
                        exportToCSV(workflows.map(w => ({
                            'ID': w.id,
                            'Name': w.name,
                            'Description': w.description,
                            'Nodes': w.nodes,
                            'Status': w.status,
                        })), 'workflows_export')
                        addToast({ type: 'success', title: 'Export Complete', message: 'Workflow data exported to CSV', duration: 3000 })
                    }}>
                        Export
                    </Button>
                    <Button 
                        variant="secondary" 
                        icon={<Save size={16} />}
                        onClick={async () => {
                            setIsSavingDraft(true)
                            // Simulate save operation
                            await new Promise(resolve => setTimeout(resolve, 1000))
                            setIsSavingDraft(false)
                            addToast({ 
                                type: 'success', 
                                title: 'Draft Saved', 
                                message: 'Workflow saved as draft', 
                                duration: 3000 
                            })
                        }}
                        loading={isSavingDraft}
                    >
                        Save Draft
                    </Button>
                    <Button
                        variant="secondary"
                        icon={<CheckCircle size={16} />}
                        onClick={validateWorkflow}
                    >
                        Validate
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
                                    onApply={() => applyTemplate(wf)}
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
                                    onClick={() => addNode(node)}
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
                            <button className="wf-canvas-action" onClick={() => setShowPreview(true)} disabled={nodes.length === 0}>
                                <Eye size={16} />
                                Preview
                            </button>
                            <button className="wf-canvas-action" onClick={handleDuplicateNode} disabled={!selectedNode}>
                                <Copy size={16} />
                                Duplicate
                            </button>
                            <button className="wf-canvas-action wf-canvas-action--danger" onClick={handleClearCanvas} disabled={nodes.length === 0}>
                                <Trash2 size={16} />
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Validation Error Banner */}
                    <AnimatePresence>
                        {validationErrors.length > 0 && (
                            <motion.div
                                className="wf-validation-banner"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <div className="wf-validation-banner__icon">
                                    <AlertTriangle size={18} />
                                </div>
                                <div className="wf-validation-banner__content">
                                    <strong>Workflow Validation Failed</strong>
                                    <ul>
                                        {validationErrors.map((err, idx) => (
                                            <li key={idx}>{err.message}</li>
                                        ))}
                                    </ul>
                                </div>
                                <button className="wf-validation-banner__close" onClick={() => { setValidationErrors([]); setInvalidNodeIds(new Set()); }}>
                                    <XCircle size={16} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div
                        ref={canvasRef}
                        className={`wf-canvas ${isDragOver ? 'wf-canvas--drag-over' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
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
                                    {nodes.map((node, idx) => (
                                        <Reorder.Item key={node.id} value={node}>
                                            <WorkflowNodeComponent
                                                node={node}
                                                isSelected={selectedNode === node.id}
                                                isInvalid={invalidNodeIds.has(node.id)}
                                                isExecuting={executingNodeId === node.id}
                                                onSelect={() => setSelectedNode(node.id)}
                                                onDelete={() => deleteNode(node.id)}
                                                onSettingsClick={() => {
                                                    addToast({ 
                                                        type: 'info', 
                                                        title: 'Settings Panel', 
                                                        message: 'Settings panel coming soon', 
                                                        duration: 3000 
                                                    })
                                                }}
                                            />
                                            {/* Connection line between nodes */}
                                            {idx < nodes.length - 1 && (
                                                <div className="wf-connection">
                                                    <div className="wf-connection__line" />
                                                    <ChevronDown size={14} className="wf-connection__chevron" />
                                                </div>
                                            )}
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
                            {(() => {
                                const node = nodes.find(n => n.id === selectedNode)
                                if (!node) return null
                                return (
                                    <>
                                        <div className="wf-prop-group">
                                            <label>Node Name</label>
                                            <Input
                                                value={node.label}
                                                onChange={(e) => updateNode(node.id, { label: (e.target as HTMLInputElement).value })}
                                                fullWidth
                                            />
                                        </div>
                                        <div className="wf-prop-group">
                                            <label>Type</label>
                                            <div className="wf-prop-type-badge">
                                                <node.icon size={14} />
                                                <span>{node.type.replace(/_/g, ' ')}</span>
                                            </div>
                                        </div>
                                        <div className="wf-prop-group">
                                            <label>Description</label>
                                            <textarea
                                                placeholder="Add a description..."
                                                value={node.description || ''}
                                                onChange={(e) => updateNode(node.id, { description: e.target.value })}
                                            />
                                        </div>
                                        <div className="wf-prop-group">
                                            <label>Conditions</label>
                                            <Button variant="secondary" size="sm" icon={<Plus size={14} />} fullWidth>
                                                Add Condition
                                            </Button>
                                        </div>
                                        <div className="wf-prop-group wf-prop-group--actions">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                icon={<Copy size={14} />}
                                                fullWidth
                                                onClick={handleDuplicateNode}
                                            >
                                                Duplicate Node
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                icon={<Trash2 size={14} />}
                                                fullWidth
                                                onClick={() => deleteNode(node.id)}
                                            >
                                                Delete Node
                                            </Button>
                                        </div>
                                    </>
                                )
                            })()}
                        </div>
                    </aside>
                )}
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        className="wf-preview-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPreview(false)}
                    >
                        <motion.div
                            className="wf-preview-modal"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="wf-preview-modal__header">
                                <h3><Eye size={18} /> Workflow Preview</h3>
                                <button onClick={() => setShowPreview(false)}>
                                    <XCircle size={18} />
                                </button>
                            </div>
                            <div className="wf-preview-modal__content">
                                {nodes.length === 0 ? (
                                    <p className="wf-preview-modal__empty">No nodes in the workflow yet.</p>
                                ) : (
                                    <div className="wf-preview-modal__flow">
                                        {nodes.map((node, idx) => {
                                            const category = triggerTypes.has(node.type)
                                                ? 'Trigger'
                                                : actionTypes.has(node.type)
                                                    ? 'Action'
                                                    : 'Condition'
                                            return (
                                                <div key={node.id} className="wf-preview-modal__node">
                                                    <div className={`wf-preview-modal__node-icon wf-preview-modal__node-icon--${node.color}`}>
                                                        <node.icon size={16} />
                                                    </div>
                                                    <div className="wf-preview-modal__node-info">
                                                        <span className="wf-preview-modal__node-label">{node.label}</span>
                                                        <span className="wf-preview-modal__node-category">{category} &middot; Step {idx + 1}</span>
                                                    </div>
                                                    {idx < nodes.length - 1 && (
                                                        <div className="wf-preview-modal__arrow">
                                                            <ChevronDown size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="wf-preview-modal__footer">
                                <span>{nodes.length} node{nodes.length !== 1 ? 's' : ''} in workflow</span>
                                <Button variant="secondary" size="sm" onClick={() => setShowPreview(false)}>
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Run Success Toast */}
            <AnimatePresence>
                {isRunning && executingNodeId && (
                    <motion.div
                        className="wf-run-toast"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                    >
                        <div className="wf-run-toast__pulse" />
                        <span>Executing: {nodes.find(n => n.id === executingNodeId)?.label || '...'}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default WorkflowBuilder
