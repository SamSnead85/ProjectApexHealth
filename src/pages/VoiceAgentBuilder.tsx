import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mic, Phone, Users, MessageSquare, Shield, Zap, Play, Save,
    Rocket, GripVertical, Plus, Trash2, Settings, Volume2,
    Globe, SmilePlus, ChevronRight, CheckCircle2, AlertTriangle,
    Clock, Activity, Star, Bot, PhoneCall, PhoneOff, ArrowRight,
    UserCheck, Brain, HeadphonesIcon, Send, RotateCcw
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './VoiceAgentBuilder.css'

// ============================================================================
// VOICE AGENT BUILDER - Visual Voice Agent Flow Designer
// Build, configure and deploy AI voice agents for healthcare operations
// ============================================================================

type AgentType = 'member_service' | 'provider_service' | 'outreach'
type NodeType = 'greeting' | 'verification' | 'intent' | 'action' | 'escalation' | 'closing'

interface FlowNode {
    id: string
    type: NodeType
    label: string
    config: Record<string, string>
    connected: boolean
}

interface SimMessage {
    role: 'agent' | 'caller'
    text: string
}

const agentTypes: { id: AgentType; label: string; description: string; icon: typeof Mic; color: string }[] = [
    { id: 'member_service', label: 'Member Service', description: 'Handle member inquiries, benefits, and claims', icon: Users, color: '#14b8a6' },
    { id: 'provider_service', label: 'Provider Service', description: 'Provider status checks, auth, and claims', icon: HeadphonesIcon, color: '#8b5cf6' },
    { id: 'outreach', label: 'Outreach', description: 'Proactive member outreach and campaigns', icon: PhoneCall, color: '#f59e0b' },
]

const nodeTemplates: { type: NodeType; label: string; icon: typeof Mic; color: string; description: string }[] = [
    { type: 'greeting', label: 'Greeting', icon: SmilePlus, color: '#22c55e', description: 'Welcome message and introduction' },
    { type: 'verification', label: 'Identity Verification', icon: UserCheck, color: '#3b82f6', description: 'Verify caller identity (DOB, Member ID)' },
    { type: 'intent', label: 'Intent Detection', icon: Brain, color: '#8b5cf6', description: 'AI-powered intent classification' },
    { type: 'action', label: 'Action', icon: Zap, color: '#f59e0b', description: 'Execute task (eligibility, claim status, etc.)' },
    { type: 'escalation', label: 'Escalation', icon: PhoneOff, color: '#ef4444', description: 'Transfer to human agent' },
    { type: 'closing', label: 'Closing', icon: CheckCircle2, color: '#14b8a6', description: 'Wrap up and satisfaction survey' },
]

const defaultFlow: FlowNode[] = [
    { id: 'n1', type: 'greeting', label: 'Welcome Greeting', config: { message: 'Welcome to Apex Health. How can I help you today?' }, connected: true },
    { id: 'n2', type: 'verification', label: 'Verify Identity', config: { method: 'DOB + Member ID' }, connected: true },
    { id: 'n3', type: 'intent', label: 'Detect Intent', config: { model: 'apex-intent-v3' }, connected: true },
    { id: 'n4', type: 'action', label: 'Check Eligibility', config: { api: '/api/eligibility/check' }, connected: true },
    { id: 'n5', type: 'escalation', label: 'Transfer to Agent', config: { queue: 'tier-2-support' }, connected: false },
    { id: 'n6', type: 'closing', label: 'Call Wrap-Up', config: { survey: 'enabled' }, connected: true },
]

const simulationScript: SimMessage[] = [
    { role: 'agent', text: 'Welcome to Apex Health! My name is Aria. How can I assist you today?' },
    { role: 'caller', text: 'Hi, I need to check if my upcoming surgery is covered under my plan.' },
    { role: 'agent', text: 'I\'d be happy to help you with that. For verification, could you please provide your date of birth and member ID?' },
    { role: 'caller', text: 'Sure, my DOB is March 15, 1985, and my member ID is AXP-847291.' },
    { role: 'agent', text: 'Thank you, Sarah. I\'ve verified your identity. Let me check your coverage for the upcoming procedure. Could you tell me the procedure name or CPT code?' },
    { role: 'caller', text: 'It\'s an arthroscopic knee surgery, I think the code is 29881.' },
    { role: 'agent', text: 'I\'ve found the details. CPT 29881 - Arthroscopic meniscectomy is covered under your Gold PPO plan with a $250 copay and 80/20 coinsurance after deductible. Your remaining deductible is $450. Would you like me to initiate a prior authorization?' },
    { role: 'caller', text: 'Yes, please start the prior auth.' },
    { role: 'agent', text: 'I\'ve submitted the prior authorization request #PA-2026-4821. You\'ll receive a determination within 5 business days. Is there anything else I can help with?' },
    { role: 'caller', text: 'No, that\'s all. Thank you!' },
    { role: 'agent', text: 'You\'re welcome, Sarah! I hope your procedure goes well. Have a great day! On a scale of 1-5, how would you rate this interaction?' },
]

export default function VoiceAgentBuilder() {
    const [selectedAgent, setSelectedAgent] = useState<AgentType>('member_service')
    const [flowNodes, setFlowNodes] = useState<FlowNode[]>(defaultFlow)
    const [selectedNode, setSelectedNode] = useState<string | null>(null)
    const [isSimulating, setIsSimulating] = useState(false)
    const [simMessages, setSimMessages] = useState<SimMessage[]>([])
    const [simIndex, setSimIndex] = useState(0)
    const [deploying, setDeploying] = useState(false)
    const [deployed, setDeployed] = useState(false)

    // Personality config
    const [greeting, setGreeting] = useState('Welcome to Apex Health! My name is Aria. How can I assist you today?')
    const [voice, setVoice] = useState('aria-warm')
    const [language, setLanguage] = useState('en-US')

    const addNode = useCallback((type: NodeType) => {
        const template = nodeTemplates.find(t => t.type === type)
        if (!template) return
        const newNode: FlowNode = {
            id: `n${Date.now()}`,
            type,
            label: template.label,
            config: {},
            connected: true
        }
        setFlowNodes(prev => [...prev, newNode])
    }, [])

    const removeNode = useCallback((id: string) => {
        setFlowNodes(prev => prev.filter(n => n.id !== id))
        if (selectedNode === id) setSelectedNode(null)
    }, [selectedNode])

    const startSimulation = useCallback(() => {
        setIsSimulating(true)
        setSimMessages([])
        setSimIndex(0)
    }, [])

    const advanceSimulation = useCallback(() => {
        if (simIndex < simulationScript.length) {
            setSimMessages(prev => [...prev, simulationScript[simIndex]])
            setSimIndex(prev => prev + 1)
        }
    }, [simIndex])

    const resetSimulation = useCallback(() => {
        setIsSimulating(false)
        setSimMessages([])
        setSimIndex(0)
    }, [])

    const handleDeploy = useCallback(() => {
        setDeploying(true)
        setTimeout(() => {
            setDeploying(false)
            setDeployed(true)
        }, 2000)
    }, [])

    const getNodeIcon = (type: NodeType) => {
        const template = nodeTemplates.find(t => t.type === type)
        return template ? template.icon : Zap
    }

    const getNodeColor = (type: NodeType) => {
        const template = nodeTemplates.find(t => t.type === type)
        return template ? template.color : '#64748b'
    }

    return (
        <div className="voice-agent-builder">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="vab-header">
                    <div>
                        <h1 className="vab-title">
                            <Bot size={28} />
                            Voice Agent Builder
                            <Badge variant="purple" icon={<Mic size={10} />}>AI Voice</Badge>
                        </h1>
                        <p className="vab-subtitle">Design, configure, and deploy intelligent voice agents</p>
                    </div>
                    <div className="vab-header-actions">
                        <Button variant="secondary" icon={<Save size={16} />}>Save Draft</Button>
                        <Button
                            variant="primary"
                            icon={deployed ? <CheckCircle2 size={16} /> : <Rocket size={16} />}
                            loading={deploying}
                            onClick={handleDeploy}
                        >
                            {deployed ? 'Deployed' : 'Deploy Agent'}
                        </Button>
                    </div>
                </div>

                {/* Metrics Sidebar + Main Content */}
                <div className="vab-layout">
                    {/* Main Builder Area */}
                    <div className="vab-main">
                        {/* Agent Type Selection */}
                        <GlassCard className="vab-agent-selector">
                            <h3 className="vab-section-title">
                                <Phone size={18} />
                                Select Agent Type
                            </h3>
                            <div className="vab-agent-types">
                                {agentTypes.map((agent) => {
                                    const Icon = agent.icon
                                    return (
                                        <motion.div
                                            key={agent.id}
                                            className={`vab-agent-card ${selectedAgent === agent.id ? 'active' : ''}`}
                                            onClick={() => setSelectedAgent(agent.id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{ '--agent-color': agent.color } as React.CSSProperties}
                                        >
                                            <div className="vab-agent-icon" style={{ background: `${agent.color}20`, color: agent.color }}>
                                                <Icon size={22} />
                                            </div>
                                            <div className="vab-agent-info">
                                                <span className="vab-agent-name">{agent.label}</span>
                                                <span className="vab-agent-desc">{agent.description}</span>
                                            </div>
                                            {selectedAgent === agent.id && (
                                                <CheckCircle2 size={18} style={{ color: agent.color }} />
                                            )}
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </GlassCard>

                        {/* Personality Configuration */}
                        <GlassCard className="vab-personality">
                            <h3 className="vab-section-title">
                                <Settings size={18} />
                                Agent Personality
                            </h3>
                            <div className="vab-personality-grid">
                                <div className="vab-field">
                                    <label>Greeting Message</label>
                                    <textarea
                                        value={greeting}
                                        onChange={(e) => setGreeting(e.target.value)}
                                        rows={2}
                                    />
                                </div>
                                <div className="vab-field-row">
                                    <div className="vab-field">
                                        <label>
                                            <Volume2 size={14} /> Voice
                                        </label>
                                        <select value={voice} onChange={(e) => setVoice(e.target.value)}>
                                            <option value="aria-warm">Aria (Warm, Female)</option>
                                            <option value="marcus-pro">Marcus (Professional, Male)</option>
                                            <option value="sophia-friendly">Sophia (Friendly, Female)</option>
                                            <option value="james-calm">James (Calm, Male)</option>
                                        </select>
                                    </div>
                                    <div className="vab-field">
                                        <label>
                                            <Globe size={14} /> Language
                                        </label>
                                        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                            <option value="en-US">English (US)</option>
                                            <option value="es-US">Spanish (US)</option>
                                            <option value="fr-CA">French (CA)</option>
                                            <option value="zh-CN">Mandarin</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Flow Builder */}
                        <GlassCard className="vab-flow-builder">
                            <div className="vab-flow-header">
                                <h3 className="vab-section-title">
                                    <Activity size={18} />
                                    Conversation Flow
                                </h3>
                                <div className="vab-node-palette">
                                    {nodeTemplates.map((tmpl) => (
                                        <motion.button
                                            key={tmpl.type}
                                            className="vab-add-node-btn"
                                            onClick={() => addNode(tmpl.type)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            title={`Add ${tmpl.label}`}
                                            style={{ '--node-color': tmpl.color } as React.CSSProperties}
                                        >
                                            <tmpl.icon size={14} />
                                            <Plus size={10} />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <div className="vab-flow-canvas">
                                {flowNodes.map((node, index) => {
                                    const NodeIcon = getNodeIcon(node.type)
                                    const color = getNodeColor(node.type)
                                    return (
                                        <motion.div
                                            key={node.id}
                                            className={`vab-flow-node ${selectedNode === node.id ? 'selected' : ''}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => setSelectedNode(node.id)}
                                            style={{ '--node-color': color } as React.CSSProperties}
                                        >
                                            <div className="vab-node-grip">
                                                <GripVertical size={14} />
                                            </div>
                                            <div className="vab-node-icon" style={{ background: `${color}20`, color }}>
                                                <NodeIcon size={16} />
                                            </div>
                                            <div className="vab-node-content">
                                                <span className="vab-node-label">{node.label}</span>
                                                <span className="vab-node-type">{node.type.replace('_', ' ')}</span>
                                            </div>
                                            <div className="vab-node-actions">
                                                <Badge
                                                    variant={node.connected ? 'success' : 'warning'}
                                                    size="sm"
                                                >
                                                    {node.connected ? 'Connected' : 'Disconnected'}
                                                </Badge>
                                                <button
                                                    className="vab-node-delete"
                                                    onClick={(e) => { e.stopPropagation(); removeNode(node.id) }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            {index < flowNodes.length - 1 && (
                                                <div className="vab-node-connector">
                                                    <ArrowRight size={14} />
                                                </div>
                                            )}
                                        </motion.div>
                                    )
                                })}
                                {flowNodes.length === 0 && (
                                    <div className="vab-flow-empty">
                                        <Plus size={32} />
                                        <p>Add nodes from the palette above to build your conversation flow</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        {/* Simulation Panel */}
                        <GlassCard className="vab-simulation">
                            <div className="vab-sim-header">
                                <h3 className="vab-section-title">
                                    <MessageSquare size={18} />
                                    Test Simulation
                                </h3>
                                <div className="vab-sim-controls">
                                    {!isSimulating ? (
                                        <Button variant="primary" size="sm" icon={<Play size={14} />} onClick={startSimulation}>
                                            Start Test
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                icon={<Send size={14} />}
                                                onClick={advanceSimulation}
                                                disabled={simIndex >= simulationScript.length}
                                            >
                                                Next
                                            </Button>
                                            <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={resetSimulation}>
                                                Reset
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="vab-sim-chat">
                                {!isSimulating && simMessages.length === 0 && (
                                    <div className="vab-sim-empty">
                                        <Bot size={32} />
                                        <p>Click "Start Test" to simulate a conversation with your voice agent</p>
                                    </div>
                                )}
                                <AnimatePresence>
                                    {simMessages.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            className={`vab-sim-message ${msg.role}`}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="vab-sim-avatar">
                                                {msg.role === 'agent' ? <Bot size={14} /> : <Users size={14} />}
                                            </div>
                                            <div className="vab-sim-bubble">
                                                <span className="vab-sim-role">{msg.role === 'agent' ? 'Aria (AI Agent)' : 'Caller'}</span>
                                                <p>{msg.text}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {isSimulating && simIndex >= simulationScript.length && (
                                    <motion.div
                                        className="vab-sim-complete"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <CheckCircle2 size={20} />
                                        <span>Simulation complete - All conversation nodes executed successfully</span>
                                    </motion.div>
                                )}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Metrics Sidebar */}
                    <div className="vab-sidebar">
                        <GlassCard className="vab-metrics">
                            <h3 className="vab-section-title">
                                <Activity size={18} />
                                Agent Metrics
                            </h3>
                            <div className="vab-metric-items">
                                <div className="vab-metric-item">
                                    <div className="vab-metric-icon" style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#14b8a6' }}>
                                        <PhoneCall size={18} />
                                    </div>
                                    <div className="vab-metric-info">
                                        <span className="vab-metric-value">1,247</span>
                                        <span className="vab-metric-label">Active Calls</span>
                                    </div>
                                    <Badge variant="success" size="sm" pulse>Live</Badge>
                                </div>
                                <div className="vab-metric-item">
                                    <div className="vab-metric-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                                        <Clock size={18} />
                                    </div>
                                    <div className="vab-metric-info">
                                        <span className="vab-metric-value">4:32</span>
                                        <span className="vab-metric-label">Avg Duration</span>
                                    </div>
                                    <Badge variant="info" size="sm">-12%</Badge>
                                </div>
                                <div className="vab-metric-item">
                                    <div className="vab-metric-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                                        <Star size={18} />
                                    </div>
                                    <div className="vab-metric-info">
                                        <span className="vab-metric-value">4.7/5</span>
                                        <span className="vab-metric-label">Satisfaction</span>
                                    </div>
                                    <Badge variant="success" size="sm">+0.3</Badge>
                                </div>
                                <div className="vab-metric-item">
                                    <div className="vab-metric-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <div className="vab-metric-info">
                                        <span className="vab-metric-value">89%</span>
                                        <span className="vab-metric-label">Resolution Rate</span>
                                    </div>
                                    <Badge variant="success" size="sm">+5%</Badge>
                                </div>
                                <div className="vab-metric-item">
                                    <div className="vab-metric-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                                        <AlertTriangle size={18} />
                                    </div>
                                    <div className="vab-metric-info">
                                        <span className="vab-metric-value">7.2%</span>
                                        <span className="vab-metric-label">Escalation Rate</span>
                                    </div>
                                    <Badge variant="warning" size="sm">-2%</Badge>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="vab-deployment-status">
                            <h3 className="vab-section-title">
                                <Shield size={18} />
                                Deployment Status
                            </h3>
                            <div className="vab-deploy-items">
                                <div className="vab-deploy-item">
                                    <span>Member Service</span>
                                    <Badge variant="success" dot pulse>Active</Badge>
                                </div>
                                <div className="vab-deploy-item">
                                    <span>Provider Service</span>
                                    <Badge variant="success" dot pulse>Active</Badge>
                                </div>
                                <div className="vab-deploy-item">
                                    <span>Outreach</span>
                                    <Badge variant="warning" dot>Paused</Badge>
                                </div>
                                <div className="vab-deploy-item">
                                    <span>After Hours</span>
                                    <Badge variant="info" dot>Scheduled</Badge>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
