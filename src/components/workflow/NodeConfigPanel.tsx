import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Settings,
    Play,
    Save,
    Trash2,
    Copy,
    AlertCircle,
    CheckCircle2,
    Clock,
    Users,
    Zap,
    FileText,
    Shield,
    Brain
} from 'lucide-react'
import { useWorkflowStore } from '../../stores/workflowStore'
import { NODE_REGISTRY, NodeType, BaseNodeData } from '../../types/workflow'
import { Button, Badge } from '../common'
import './NodeConfigPanel.css'

export function NodeConfigPanel() {
    const {
        nodes,
        selectedNodeId,
        selectNode,
        updateNode,
        deleteNode,
        toggleConfigPanel
    } = useWorkflowStore()

    const selectedNode = nodes.find(n => n.id === selectedNodeId)
    const nodeData = selectedNode?.data as BaseNodeData | undefined
    const metadata = nodeData ? NODE_REGISTRY[nodeData.nodeType as NodeType] : null

    const [localConfig, setLocalConfig] = useState<Record<string, unknown>>({})

    useEffect(() => {
        if (nodeData?.config) {
            setLocalConfig(nodeData.config)
        }
    }, [selectedNodeId, nodeData?.config])

    if (!selectedNode || !nodeData || !metadata) {
        return (
            <div className="node-config-panel node-config-panel--empty">
                <div className="node-config-panel__empty-state">
                    <Settings size={48} className="node-config-panel__empty-icon" />
                    <h3>No Node Selected</h3>
                    <p>Click on a node to view and edit its configuration.</p>
                </div>
            </div>
        )
    }

    const handleSave = () => {
        updateNode(selectedNodeId!, { config: localConfig })
    }

    const handleDelete = () => {
        deleteNode(selectedNodeId!)
        selectNode(null)
    }

    const handleDuplicate = () => {
        // TODO: Add duplicate logic here
    }

    const renderConfigFields = () => {
        switch (nodeData.nodeType) {
            case 'claimIntake':
                return (
                    <>
                        <ConfigField label="Data Source">
                            <select
                                value={localConfig.source as string || 'edi'}
                                onChange={(e) => setLocalConfig({ ...localConfig, source: e.target.value })}
                                className="node-config-panel__select"
                            >
                                <option value="edi">EDI (837/835)</option>
                                <option value="api">REST API</option>
                                <option value="upload">File Upload</option>
                                <option value="manual">Manual Entry</option>
                            </select>
                        </ConfigField>
                        <ConfigField label="Claim Format">
                            <select
                                value={localConfig.format as string || '837'}
                                onChange={(e) => setLocalConfig({ ...localConfig, format: e.target.value })}
                                className="node-config-panel__select"
                            >
                                <option value="837">ANSI 837</option>
                                <option value="cms1500">CMS-1500</option>
                                <option value="ub04">UB-04</option>
                                <option value="custom">Custom Format</option>
                            </select>
                        </ConfigField>
                        <ConfigField label="Auto-Validate">
                            <label className="node-config-panel__toggle">
                                <input
                                    type="checkbox"
                                    checked={localConfig.validation as boolean || false}
                                    onChange={(e) => setLocalConfig({ ...localConfig, validation: e.target.checked })}
                                />
                                <span className="node-config-panel__toggle-slider" />
                                Enable pre-validation
                            </label>
                        </ConfigField>
                    </>
                )

            case 'geminiAnalyzer':
                return (
                    <>
                        <ConfigField label="AI Model">
                            <select
                                value={localConfig.model as string || 'gemini-2.0-flash'}
                                onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                                className="node-config-panel__select"
                            >
                                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast)</option>
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Powerful)</option>
                                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Balanced)</option>
                            </select>
                        </ConfigField>
                        <ConfigField label="Temperature">
                            <div className="node-config-panel__slider-container">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={(localConfig.temperature as number || 0.3) * 100}
                                    onChange={(e) => setLocalConfig({ ...localConfig, temperature: parseInt(e.target.value) / 100 })}
                                    className="node-config-panel__slider"
                                />
                                <span className="node-config-panel__slider-value">
                                    {((localConfig.temperature as number) || 0.3).toFixed(2)}
                                </span>
                            </div>
                        </ConfigField>
                        <ConfigField label="System Prompt">
                            <textarea
                                value={localConfig.systemPrompt as string || 'You are a healthcare claims analyst...'}
                                onChange={(e) => setLocalConfig({ ...localConfig, systemPrompt: e.target.value })}
                                className="node-config-panel__textarea"
                                rows={4}
                                placeholder="Enter system prompt for the AI..."
                            />
                        </ConfigField>
                        <ConfigField label="Analysis Type">
                            <select
                                value={localConfig.analysisType as string || 'general'}
                                onChange={(e) => setLocalConfig({ ...localConfig, analysisType: e.target.value })}
                                className="node-config-panel__select"
                            >
                                <option value="general">General Analysis</option>
                                <option value="medical_necessity">Medical Necessity</option>
                                <option value="coding_review">Coding Review</option>
                                <option value="fraud_detection">Fraud Detection</option>
                                <option value="prior_auth">Prior Authorization</option>
                            </select>
                        </ConfigField>
                    </>
                )

            case 'hitlCheckpoint':
                return (
                    <>
                        <ConfigField label="Assign To">
                            <select
                                value={localConfig.assigneeType as string || 'team'}
                                onChange={(e) => setLocalConfig({ ...localConfig, assigneeType: e.target.value })}
                                className="node-config-panel__select"
                            >
                                <option value="user">Specific User</option>
                                <option value="team">Team</option>
                                <option value="role">Role-based</option>
                                <option value="auto">Auto-assign (Round Robin)</option>
                            </select>
                        </ConfigField>
                        <ConfigField label="SLA (Hours)">
                            <input
                                type="number"
                                value={localConfig.slaHours as number || 24}
                                onChange={(e) => setLocalConfig({ ...localConfig, slaHours: parseInt(e.target.value) })}
                                className="node-config-panel__input"
                                min={1}
                                max={168}
                            />
                        </ConfigField>
                        <ConfigField label="Escalation Threshold (Hours)">
                            <input
                                type="number"
                                value={localConfig.escalationHours as number || 48}
                                onChange={(e) => setLocalConfig({ ...localConfig, escalationHours: parseInt(e.target.value) })}
                                className="node-config-panel__input"
                                min={1}
                                max={336}
                            />
                        </ConfigField>
                        <ConfigField label="Require Reason on Reject">
                            <label className="node-config-panel__toggle">
                                <input
                                    type="checkbox"
                                    checked={localConfig.requireReason as boolean ?? true}
                                    onChange={(e) => setLocalConfig({ ...localConfig, requireReason: e.target.checked })}
                                />
                                <span className="node-config-panel__toggle-slider" />
                                Mandatory rejection reason
                            </label>
                        </ConfigField>
                    </>
                )

            case 'decisionBranch':
                return (
                    <>
                        <ConfigField label="Condition Field">
                            <input
                                type="text"
                                value={localConfig.conditionField as string || ''}
                                onChange={(e) => setLocalConfig({ ...localConfig, conditionField: e.target.value })}
                                className="node-config-panel__input"
                                placeholder="e.g., claim.amount, member.eligible"
                            />
                        </ConfigField>
                        <ConfigField label="Operator">
                            <select
                                value={localConfig.operator as string || 'equals'}
                                onChange={(e) => setLocalConfig({ ...localConfig, operator: e.target.value })}
                                className="node-config-panel__select"
                            >
                                <option value="equals">Equals (==)</option>
                                <option value="notEquals">Not Equals (!=)</option>
                                <option value="greaterThan">Greater Than (&gt;)</option>
                                <option value="lessThan">Less Than (&lt;)</option>
                                <option value="contains">Contains</option>
                                <option value="matches">Regex Match</option>
                            </select>
                        </ConfigField>
                        <ConfigField label="Compare Value">
                            <input
                                type="text"
                                value={localConfig.compareValue as string || ''}
                                onChange={(e) => setLocalConfig({ ...localConfig, compareValue: e.target.value })}
                                className="node-config-panel__input"
                                placeholder="Value to compare against"
                            />
                        </ConfigField>
                    </>
                )

            case 'decisionOutput':
                return (
                    <>
                        <ConfigField label="Decision Type">
                            <select
                                value={localConfig.decisionType as string || 'approve'}
                                onChange={(e) => setLocalConfig({ ...localConfig, decisionType: e.target.value })}
                                className="node-config-panel__select"
                            >
                                <option value="approve">Approve</option>
                                <option value="deny">Deny</option>
                                <option value="pend">Pend for Review</option>
                                <option value="partial">Partial Approval</option>
                            </select>
                        </ConfigField>
                        <ConfigField label="Reason Code">
                            <input
                                type="text"
                                value={localConfig.reasonCode as string || ''}
                                onChange={(e) => setLocalConfig({ ...localConfig, reasonCode: e.target.value })}
                                className="node-config-panel__input"
                                placeholder="e.g., A1, D3, P2"
                            />
                        </ConfigField>
                        <ConfigField label="Notifications">
                            <label className="node-config-panel__toggle">
                                <input
                                    type="checkbox"
                                    checked={localConfig.notifyMember as boolean ?? true}
                                    onChange={(e) => setLocalConfig({ ...localConfig, notifyMember: e.target.checked })}
                                />
                                <span className="node-config-panel__toggle-slider" />
                                Notify Member
                            </label>
                            <label className="node-config-panel__toggle">
                                <input
                                    type="checkbox"
                                    checked={localConfig.notifyProvider as boolean ?? true}
                                    onChange={(e) => setLocalConfig({ ...localConfig, notifyProvider: e.target.checked })}
                                />
                                <span className="node-config-panel__toggle-slider" />
                                Notify Provider
                            </label>
                        </ConfigField>
                    </>
                )

            default:
                return (
                    <div className="node-config-panel__default">
                        <p className="text-steel">No additional configuration options for this node type.</p>
                        <p className="text-caption mt-sm">This node will use default settings.</p>
                    </div>
                )
        }
    }

    const getCategoryIcon = () => {
        switch (metadata.category) {
            case 'trigger': return <Zap size={16} />
            case 'processing': return <FileText size={16} />
            case 'ai': return <Brain size={16} />
            case 'control': return <Settings size={16} />
            case 'hitl': return <Users size={16} />
            case 'output': return <CheckCircle2 size={16} />
            default: return <Settings size={16} />
        }
    }

    return (
        <motion.div
            className="node-config-panel"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
            {/* Header */}
            <div className="node-config-panel__header">
                <div className="node-config-panel__header-info">
                    <span className="node-config-panel__icon" style={{ color: metadata.color }}>
                        {metadata.icon}
                    </span>
                    <div>
                        <h3 className="node-config-panel__title">{nodeData.label}</h3>
                        <div className="node-config-panel__meta">
                            {getCategoryIcon()}
                            <span>{metadata.category}</span>
                        </div>
                    </div>
                </div>
                <button className="node-config-panel__close" onClick={toggleConfigPanel}>
                    <X size={16} />
                </button>
            </div>

            {/* Status */}
            {nodeData.status && nodeData.status !== 'idle' && (
                <div className={`node-config-panel__status node-config-panel__status--${nodeData.status}`}>
                    {nodeData.status === 'running' && <><Clock size={14} /> Running...</>}
                    {nodeData.status === 'completed' && <><CheckCircle2 size={14} /> Completed</>}
                    {nodeData.status === 'error' && <><AlertCircle size={14} /> Error</>}
                    {nodeData.status === 'paused' && <><Clock size={14} /> Paused</>}
                </div>
            )}

            {/* Confidence Score */}
            {nodeData.confidenceScore !== undefined && (
                <div className="node-config-panel__confidence">
                    <div className="node-config-panel__confidence-header">
                        <span>AI Confidence</span>
                        <Badge variant={nodeData.confidenceScore > 0.8 ? 'success' : nodeData.confidenceScore > 0.5 ? 'warning' : 'critical'}>
                            {Math.round(nodeData.confidenceScore * 100)}%
                        </Badge>
                    </div>
                    <div className="node-config-panel__confidence-bar">
                        <div
                            className="node-config-panel__confidence-fill"
                            style={{ width: `${nodeData.confidenceScore * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Configuration Fields */}
            <div className="node-config-panel__content">
                <div className="node-config-panel__section">
                    <h4 className="node-config-panel__section-title">Configuration</h4>
                    {renderConfigFields()}
                </div>
            </div>

            {/* Actions */}
            <div className="node-config-panel__actions">
                <Button variant="primary" icon={<Save size={14} />} onClick={handleSave}>
                    Save Changes
                </Button>
                <div className="node-config-panel__actions-secondary">
                    <Button variant="ghost" size="sm" icon={<Copy size={14} />} onClick={handleDuplicate}>
                        Duplicate
                    </Button>
                    <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={handleDelete}>
                        Delete
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}

interface ConfigFieldProps {
    label: string
    children: React.ReactNode
}

function ConfigField({ label, children }: ConfigFieldProps) {
    return (
        <div className="node-config-panel__field">
            <label className="node-config-panel__label">{label}</label>
            {children}
        </div>
    )
}

export default NodeConfigPanel
