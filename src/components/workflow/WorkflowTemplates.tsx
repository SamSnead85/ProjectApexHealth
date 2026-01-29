import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileCheck,
    Shield,
    Users,
    Heart,
    Zap,
    Clock,
    Search,
    Star,
    X
} from 'lucide-react'

import { useWorkflowStore } from '../../stores/workflowStore'
import { Button, Badge } from '../common'
import './WorkflowTemplates.css'

interface WorkflowTemplate {
    id: string
    name: string
    description: string
    category: 'claims' | 'auth' | 'enrollment' | 'care' | 'compliance'
    complexity: 'simple' | 'medium' | 'complex'
    nodeCount: number
    estimatedTime: string
    icon: React.ReactNode
    popular?: boolean
    nodes: any[]
    edges: any[]
}

const TEMPLATES: WorkflowTemplate[] = [
    {
        id: 'claims-auto-adjudication',
        name: 'Auto-Adjudication Pipeline',
        description: 'Fully automated claims processing with AI-powered medical necessity review and fraud detection',
        category: 'claims',
        complexity: 'complex',
        nodeCount: 12,
        estimatedTime: '< 2 min',
        icon: <FileCheck size={24} />,
        popular: true,
        nodes: [
            { id: '1', type: 'claimIntake', position: { x: 100, y: 200 }, data: { label: 'Claim Intake', nodeType: 'claimIntake', config: {} } },
            { id: '2', type: 'documentAnalyzer', position: { x: 300, y: 200 }, data: { label: 'Document Analyzer', nodeType: 'documentAnalyzer', config: {} } },
            { id: '3', type: 'eligibilityCheck', position: { x: 500, y: 200 }, data: { label: 'Eligibility Check', nodeType: 'eligibilityCheck', config: {} } },
            { id: '4', type: 'geminiAnalyzer', position: { x: 700, y: 150 }, data: { label: 'AI Medical Review', nodeType: 'geminiAnalyzer', config: {} } },
            { id: '5', type: 'fraudDetector', position: { x: 700, y: 280 }, data: { label: 'Fraud Detection', nodeType: 'fraudDetector', config: {} } },
            { id: '6', type: 'decisionBranch', position: { x: 900, y: 200 }, data: { label: 'Decision Gate', nodeType: 'decisionBranch', config: {} } },
            { id: '7', type: 'decisionOutput', position: { x: 1100, y: 120 }, data: { label: 'Auto-Approve', nodeType: 'decisionOutput', config: { decisionType: 'approve' } } },
            { id: '8', type: 'hitlCheckpoint', position: { x: 1100, y: 280 }, data: { label: 'Manual Review', nodeType: 'hitlCheckpoint', config: {} } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' },
            { id: 'e3-5', source: '3', target: '5' },
            { id: 'e4-6', source: '4', target: '6' },
            { id: 'e5-6', source: '5', target: '6' },
            { id: 'e6-7', source: '6', target: '7' },
            { id: 'e6-8', source: '6', target: '8' },
        ]
    },
    {
        id: 'prior-auth-workflow',
        name: 'Prior Authorization',
        description: 'Streamlined prior auth with clinical guidelines validation and provider communication',
        category: 'auth',
        complexity: 'medium',
        nodeCount: 8,
        estimatedTime: '< 5 min',
        icon: <Shield size={24} />,
        popular: true,
        nodes: [
            { id: '1', type: 'priorAuthRequest', position: { x: 100, y: 200 }, data: { label: 'Auth Request', nodeType: 'priorAuthRequest', config: {} } },
            { id: '2', type: 'eligibilityCheck', position: { x: 300, y: 200 }, data: { label: 'Eligibility', nodeType: 'eligibilityCheck', config: {} } },
            { id: '3', type: 'clinicalReasoner', position: { x: 500, y: 200 }, data: { label: 'Clinical Review', nodeType: 'clinicalReasoner', config: {} } },
            { id: '4', type: 'decisionBranch', position: { x: 700, y: 200 }, data: { label: 'Decision', nodeType: 'decisionBranch', config: {} } },
            { id: '5', type: 'decisionOutput', position: { x: 900, y: 120 }, data: { label: 'Approve', nodeType: 'decisionOutput', config: {} } },
            { id: '6', type: 'hitlCheckpoint', position: { x: 900, y: 280 }, data: { label: 'MD Review', nodeType: 'hitlCheckpoint', config: {} } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' },
            { id: 'e4-5', source: '4', target: '5' },
            { id: 'e4-6', source: '4', target: '6' },
        ]
    },
    {
        id: 'member-onboarding',
        name: 'Member Onboarding',
        description: 'New member enrollment with ID card generation and welcome communication',
        category: 'enrollment',
        complexity: 'simple',
        nodeCount: 5,
        estimatedTime: '< 1 min',
        icon: <Users size={24} />,
        nodes: [
            { id: '1', type: 'webhook', position: { x: 100, y: 200 }, data: { label: 'Enrollment API', nodeType: 'webhook', config: {} } },
            { id: '2', type: 'eligibilityCheck', position: { x: 300, y: 200 }, data: { label: 'Validate', nodeType: 'eligibilityCheck', config: {} } },
            { id: '3', type: 'policyEngine', position: { x: 500, y: 200 }, data: { label: 'Assign Plan', nodeType: 'policyEngine', config: {} } },
            { id: '4', type: 'notification', position: { x: 700, y: 200 }, data: { label: 'Welcome Email', nodeType: 'notification', config: {} } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' },
        ]
    },
    {
        id: 'care-gap-outreach',
        name: 'Care Gap Outreach',
        description: 'Automated member outreach for preventive care and HEDIS quality measures',
        category: 'care',
        complexity: 'medium',
        nodeCount: 7,
        estimatedTime: '< 3 min',
        icon: <Heart size={24} />,
        nodes: [
            { id: '1', type: 'scheduledBatch', position: { x: 100, y: 200 }, data: { label: 'Daily Batch', nodeType: 'scheduledBatch', config: {} } },
            { id: '2', type: 'geminiAnalyzer', position: { x: 300, y: 200 }, data: { label: 'Gap Analysis', nodeType: 'geminiAnalyzer', config: {} } },
            { id: '3', type: 'decisionBranch', position: { x: 500, y: 200 }, data: { label: 'Priority', nodeType: 'decisionBranch', config: {} } },
            { id: '4', type: 'notification', position: { x: 700, y: 120 }, data: { label: 'SMS Alert', nodeType: 'notification', config: {} } },
            { id: '5', type: 'notification', position: { x: 700, y: 280 }, data: { label: 'Email', nodeType: 'notification', config: {} } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' },
            { id: 'e3-5', source: '3', target: '5' },
        ]
    },
    {
        id: 'compliance-audit',
        name: 'Compliance Audit Trail',
        description: 'Automated compliance monitoring with audit logging and exception handling',
        category: 'compliance',
        complexity: 'complex',
        nodeCount: 9,
        estimatedTime: '< 4 min',
        icon: <Zap size={24} />,
        nodes: [
            { id: '1', type: 'scheduledBatch', position: { x: 100, y: 200 }, data: { label: 'Audit Trigger', nodeType: 'scheduledBatch', config: {} } },
            { id: '2', type: 'documentAnalyzer', position: { x: 300, y: 200 }, data: { label: 'Review Docs', nodeType: 'documentAnalyzer', config: {} } },
            { id: '3', type: 'policyEngine', position: { x: 500, y: 200 }, data: { label: 'Check Rules', nodeType: 'policyEngine', config: {} } },
            { id: '4', type: 'auditLog', position: { x: 700, y: 200 }, data: { label: 'Log Results', nodeType: 'auditLog', config: {} } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' },
        ]
    },
]

const CATEGORY_COLORS = {
    claims: '#06B6D4',
    auth: '#8B5CF6',
    enrollment: '#10B981',
    care: '#EC4899',
    compliance: '#F59E0B',
}

const COMPLEXITY_LABELS = {
    simple: { label: 'Simple', color: '#10B981' },
    medium: { label: 'Medium', color: '#F59E0B' },
    complex: { label: 'Complex', color: '#EF4444' },
}

interface WorkflowTemplatesProps {
    isOpen: boolean
    onClose: () => void
}

export function WorkflowTemplates({ isOpen, onClose }: WorkflowTemplatesProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const { setNodes, setEdges } = useWorkflowStore()

    const filteredTemplates = TEMPLATES.filter(template => {
        if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false
        }
        if (selectedCategory && template.category !== selectedCategory) {
            return false
        }
        return true
    })

    const handleUseTemplate = (template: WorkflowTemplate) => {
        setNodes(template.nodes as any)
        setEdges(template.edges as any)
        onClose()
    }

    const categories = [
        { id: 'claims', label: 'Claims', icon: <FileCheck size={16} /> },
        { id: 'auth', label: 'Prior Auth', icon: <Shield size={16} /> },
        { id: 'enrollment', label: 'Enrollment', icon: <Users size={16} /> },
        { id: 'care', label: 'Care Mgmt', icon: <Heart size={16} /> },
        { id: 'compliance', label: 'Compliance', icon: <Zap size={16} /> },
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="workflow-templates__overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="workflow-templates"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="workflow-templates__header">
                            <div className="workflow-templates__header-left">
                                <h2>Workflow Templates</h2>
                                <p>Start with a pre-built workflow or customize to fit your needs</p>
                            </div>
                            <button className="workflow-templates__close" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search & Filters */}
                        <div className="workflow-templates__filters">
                            <div className="workflow-templates__search">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Search templates..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="workflow-templates__categories">
                                <button
                                    className={`workflow-templates__category ${!selectedCategory ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    All
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`workflow-templates__category ${selectedCategory === cat.id ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        style={{ '--cat-color': CATEGORY_COLORS[cat.id as keyof typeof CATEGORY_COLORS] } as any}
                                    >
                                        {cat.icon}
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Templates Grid */}
                        <div className="workflow-templates__grid">
                            {filteredTemplates.map((template, index) => (
                                <motion.div
                                    key={template.id}
                                    className="workflow-templates__card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{ '--card-color': CATEGORY_COLORS[template.category] } as any}
                                >
                                    <div className="workflow-templates__card-header">
                                        <div className="workflow-templates__card-icon" style={{ color: CATEGORY_COLORS[template.category] }}>
                                            {template.icon}
                                        </div>
                                        {template.popular && (
                                            <Badge variant="warning" size="sm">
                                                <Star size={10} /> Popular
                                            </Badge>
                                        )}
                                    </div>

                                    <h3 className="workflow-templates__card-title">{template.name}</h3>
                                    <p className="workflow-templates__card-desc">{template.description}</p>

                                    <div className="workflow-templates__card-meta">
                                        <span className="workflow-templates__card-nodes">
                                            {template.nodeCount} nodes
                                        </span>
                                        <span className="workflow-templates__card-time">
                                            <Clock size={12} />
                                            {template.estimatedTime}
                                        </span>
                                        <span
                                            className="workflow-templates__card-complexity"
                                            style={{ color: COMPLEXITY_LABELS[template.complexity].color }}
                                        >
                                            {COMPLEXITY_LABELS[template.complexity].label}
                                        </span>
                                    </div>

                                    <div className="workflow-templates__card-actions">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleUseTemplate(template)
                                            }}
                                        >
                                            Use Template
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredTemplates.length === 0 && (
                            <div className="workflow-templates__empty">
                                <p>No templates found matching your criteria</p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default WorkflowTemplates
