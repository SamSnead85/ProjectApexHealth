import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText,
    Upload,
    Search,
    Eye,
    Download,
    GitCompare,
    Sparkles,
    Clock,
    CheckCircle2,
    AlertCircle,
    FileCheck,
    Users,
    Calendar,
    DollarSign,
    Ban,
    ChevronRight,
    Filter,
    MoreVertical
} from 'lucide-react'
import './DocumentIntelligence.css'

interface Document {
    id: string
    name: string
    type: 'SPD' | '5500' | 'Contract' | 'Amendment' | 'Certificate'
    uploadDate: string
    status: 'parsed' | 'processing' | 'pending'
    pages: number
    size: string
    version: number
    aiSummary?: string
}

interface Clause {
    id: string
    type: 'eligibility' | 'waiting' | 'contribution' | 'termination'
    title: string
    content: string
    source: string
    page: number
}

const mockDocuments: Document[] = [
    {
        id: '1',
        name: 'Master SPD 2026',
        type: 'SPD',
        uploadDate: '2026-01-15',
        status: 'parsed',
        pages: 248,
        size: '4.2 MB',
        version: 3,
        aiSummary: 'Comprehensive summary plan description covering medical, dental, and vision benefits with updated compliance language.'
    },
    {
        id: '2',
        name: 'Form 5500 - Annual Report',
        type: '5500',
        uploadDate: '2026-01-10',
        status: 'parsed',
        pages: 42,
        size: '1.8 MB',
        version: 1,
        aiSummary: 'Annual filing showing 2,450 participants with total plan assets of $12.4M.'
    },
    {
        id: '3',
        name: 'Stop-Loss Contract 2026',
        type: 'Contract',
        uploadDate: '2026-01-08',
        status: 'processing',
        pages: 86,
        size: '2.1 MB',
        version: 2
    },
    {
        id: '4',
        name: 'Plan Amendment #7',
        type: 'Amendment',
        uploadDate: '2026-01-05',
        status: 'pending',
        pages: 12,
        size: '450 KB',
        version: 1
    },
    {
        id: '5',
        name: 'Certificate of Coverage',
        type: 'Certificate',
        uploadDate: '2025-12-20',
        status: 'parsed',
        pages: 28,
        size: '780 KB',
        version: 1,
        aiSummary: 'Evidence of coverage documentation for group health plan.'
    }
]

const mockClauses: Clause[] = [
    {
        id: '1',
        type: 'eligibility',
        title: 'Eligibility Requirements',
        content: 'All full-time employees working 30+ hours per week are eligible for coverage on the first of the month following 60 days of employment.',
        source: 'Master SPD 2026',
        page: 14
    },
    {
        id: '2',
        type: 'waiting',
        title: 'Waiting Period',
        content: 'New employees must complete a 60-day waiting period before benefits become effective. Pre-existing condition limitations apply for 12 months.',
        source: 'Master SPD 2026',
        page: 18
    },
    {
        id: '3',
        type: 'contribution',
        title: 'Contribution Strategy',
        content: 'Employer contributes 75% of employee-only premium and 50% of dependent premium. Employee contributions are made on a pre-tax basis.',
        source: 'Master SPD 2026',
        page: 42
    },
    {
        id: '4',
        type: 'termination',
        title: 'Termination of Coverage',
        content: 'Coverage terminates on the last day of the month in which employment ends. COBRA continuation is offered for up to 18 months.',
        source: 'Master SPD 2026',
        page: 78
    }
]

const versionDiffs = {
    v2: [
        { type: 'removed', text: 'Waiting period: 90 days' },
        { type: 'added', text: 'Waiting period: 60 days' },
        { type: 'unchanged', text: 'Employer contribution: 75% employee-only' },
        { type: 'removed', text: 'Dependent contribution: 40%' },
        { type: 'added', text: 'Dependent contribution: 50%' }
    ],
    v3: [
        { type: 'unchanged', text: 'Waiting period: 60 days' },
        { type: 'unchanged', text: 'Employer contribution: 75% employee-only' },
        { type: 'unchanged', text: 'Dependent contribution: 50%' },
        { type: 'added', text: 'Mental health parity language updated' },
        { type: 'added', text: 'Transparency in Coverage requirements added' }
    ]
}

export default function DocumentIntelligence() {
    const [isDragging, setIsDragging] = useState(false)
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(mockDocuments[0])
    const [compareVersion, setCompareVersion] = useState('v2')

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        // Handle file upload
    }

    const getStatusIcon = (status: Document['status']) => {
        switch (status) {
            case 'parsed': return <CheckCircle2 size={14} />
            case 'processing': return <Clock size={14} />
            case 'pending': return <AlertCircle size={14} />
        }
    }

    const getClauseIcon = (type: Clause['type']) => {
        switch (type) {
            case 'eligibility': return <Users size={18} />
            case 'waiting': return <Calendar size={18} />
            case 'contribution': return <DollarSign size={18} />
            case 'termination': return <Ban size={18} />
        }
    }

    return (
        <div className="document-intelligence">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>AI Document Intelligence</h1>
                <p className="page-subtitle">
                    Upload, parse, and analyze plan documents with AI-powered intelligence
                </p>
            </motion.div>

            {/* Stats Row */}
            <motion.div
                className="stats-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>Total Documents</span>
                        <div className="stat-card-icon teal">
                            <FileText size={16} />
                        </div>
                    </div>
                    <div className="stat-value">127</div>
                    <div className="stat-change">+12 this month</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>AI Parsed</span>
                        <div className="stat-card-icon blue">
                            <Sparkles size={16} />
                        </div>
                    </div>
                    <div className="stat-value">98%</div>
                    <div className="stat-change">124 of 127</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>Clauses Extracted</span>
                        <div className="stat-card-icon purple">
                            <FileCheck size={16} />
                        </div>
                    </div>
                    <div className="stat-value">842</div>
                    <div className="stat-change">Across all docs</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>Version Changes</span>
                        <div className="stat-card-icon amber">
                            <GitCompare size={16} />
                        </div>
                    </div>
                    <div className="stat-value">56</div>
                    <div className="stat-change">Last 90 days</div>
                </div>
            </motion.div>

            {/* Upload Zone */}
            <motion.div
                className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Upload className="upload-zone-icon" />
                <h3>Drop documents here or click to upload</h3>
                <p>AI will automatically parse and extract key information</p>
                <div className="supported-formats">
                    <span className="format-badge">PDF</span>
                    <span className="format-badge">DOCX</span>
                    <span className="format-badge">XLS</span>
                    <span className="format-badge">TXT</span>
                </div>
            </motion.div>

            {/* Document Grid */}
            <motion.div
                className="documents-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <AnimatePresence>
                    {mockDocuments.map((doc, index) => (
                        <motion.div
                            key={doc.id}
                            className="document-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            onClick={() => setSelectedDoc(doc)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="document-card-header">
                                <div className="document-icon">
                                    <FileText size={24} />
                                </div>
                                <div className="document-info">
                                    <h3>{doc.name}</h3>
                                    <span className="doc-type">{doc.type}</span>
                                </div>
                            </div>
                            <div className="document-meta">
                                <span><Clock size={14} /> {doc.uploadDate}</span>
                                <span><FileText size={14} /> {doc.pages} pages</span>
                                <span>{doc.size}</span>
                            </div>
                            <span className={`document-status ${doc.status}`}>
                                {getStatusIcon(doc.status)}
                                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                            </span>
                            <div className="document-actions">
                                <button className="doc-action-btn">
                                    <Eye size={14} /> View
                                </button>
                                <button className="doc-action-btn">
                                    <Download size={14} /> Download
                                </button>
                                <button className="doc-action-btn">
                                    <GitCompare size={14} /> Compare
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* AI Summary Panel */}
            {selectedDoc && selectedDoc.aiSummary && (
                <motion.div
                    className="ai-summary-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="ai-summary-header">
                        <span className="ai-badge">
                            <Sparkles size={12} style={{ marginRight: '4px' }} />
                            AI Generated
                        </span>
                        <h2>Executive Summary</h2>
                    </div>
                    <div className="summary-content">
                        <div className="summary-item">
                            <h4>Document Overview</h4>
                            <p>{selectedDoc.aiSummary}</p>
                        </div>
                        <div className="summary-item">
                            <h4>Plan Type</h4>
                            <p>Self-Insured Medical with Stop-Loss Coverage</p>
                        </div>
                        <div className="summary-item">
                            <h4>Effective Date</h4>
                            <p>January 1, 2026 - December 31, 2026</p>
                        </div>
                        <div className="summary-item">
                            <h4>Key Changes</h4>
                            <p>Reduced waiting period, increased dependent contribution</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Clause Extraction */}
            <motion.div
                className="clause-extraction"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2>
                    <FileCheck size={20} />
                    Extracted Clauses
                </h2>
                <div className="clauses-grid">
                    {mockClauses.map((clause, index) => (
                        <motion.div
                            key={clause.id}
                            className="clause-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <div className={`clause-icon ${clause.type}`}>
                                {getClauseIcon(clause.type)}
                            </div>
                            <div className="clause-content">
                                <h4>{clause.title}</h4>
                                <p>{clause.content}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Version Diff Panel */}
            <motion.div
                className="version-diff-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <div className="version-diff-header">
                    <h2>
                        <GitCompare size={20} />
                        Version Comparison
                    </h2>
                    <div className="version-selector">
                        <select
                            value={compareVersion}
                            onChange={(e) => setCompareVersion(e.target.value)}
                        >
                            <option value="v2">v2 → v3</option>
                            <option value="v1">v1 → v2</option>
                        </select>
                    </div>
                </div>
                <div className="diff-container">
                    <div className="diff-pane">
                        <div className="diff-pane-header">
                            <span>Previous Version</span>
                            <span>v{compareVersion === 'v2' ? '2' : '1'}</span>
                        </div>
                        {versionDiffs[compareVersion as keyof typeof versionDiffs].map((line, i) => (
                            <div
                                key={i}
                                className={`diff-line ${line.type === 'removed' ? 'removed' : line.type === 'unchanged' ? 'unchanged' : ''}`}
                            >
                                {line.type === 'removed' && '- '}{line.type === 'unchanged' && '  '}{line.text}
                            </div>
                        ))}
                    </div>
                    <div className="diff-pane">
                        <div className="diff-pane-header">
                            <span>Current Version</span>
                            <span>v{compareVersion === 'v2' ? '3' : '2'}</span>
                        </div>
                        {versionDiffs[compareVersion as keyof typeof versionDiffs].map((line, i) => (
                            <div
                                key={i}
                                className={`diff-line ${line.type === 'added' ? 'added' : line.type === 'unchanged' ? 'unchanged' : ''}`}
                            >
                                {line.type === 'added' && '+ '}{line.type === 'unchanged' && '  '}{line.text}
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
