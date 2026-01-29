import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FileText,
    Crown,
    DollarSign,
    Stethoscope,
    Shield,
    Settings,
    Eye,
    Download,
    FileSpreadsheet,
    Presentation,
    Clock,
    Calendar,
    Layers,
    Sparkles
} from 'lucide-react'
import './BoardReportGenerator.css'

interface ReportTemplate {
    id: string
    name: string
    description: string
    iconType: 'executive' | 'financial' | 'clinical' | 'compliance'
    pages: number
    lastUsed: string
}

interface ReportSection {
    id: string
    name: string
    enabled: boolean
}

const templates: ReportTemplate[] = [
    { id: '1', name: 'Executive Summary', description: 'High-level KPIs, strategic insights, and AI recommendations for board meetings', iconType: 'executive', pages: 12, lastUsed: 'Jan 28, 2026' },
    { id: '2', name: 'Financial Performance', description: 'Detailed claims analysis, revenue trends, and budget variance reports', iconType: 'financial', pages: 18, lastUsed: 'Jan 25, 2026' },
    { id: '3', name: 'Clinical Quality', description: 'Quality measures, care gap analysis, and outcome metrics', iconType: 'clinical', pages: 15, lastUsed: 'Jan 22, 2026' },
    { id: '4', name: 'Compliance & Audit', description: 'Regulatory compliance status, audit findings, and risk assessment', iconType: 'compliance', pages: 10, lastUsed: 'Jan 20, 2026' },
]

const defaultSections: ReportSection[] = [
    { id: '1', name: 'Executive Summary', enabled: true },
    { id: '2', name: 'Key Performance Indicators', enabled: true },
    { id: '3', name: 'Financial Overview', enabled: true },
    { id: '4', name: 'Claims Analysis', enabled: true },
    { id: '5', name: 'Member Demographics', enabled: false },
    { id: '6', name: 'AI Recommendations', enabled: true },
    { id: '7', name: 'Appendix & Data Tables', enabled: false },
]

interface RecentReport {
    id: string
    name: string
    type: 'pdf' | 'pptx'
    date: string
}

const recentReports: RecentReport[] = [
    { id: '1', name: 'Q4 2025 Board Report.pdf', type: 'pdf', date: 'Jan 28' },
    { id: '2', name: 'Executive Summary.pptx', type: 'pptx', date: 'Jan 25' },
    { id: '3', name: 'Financial Report.pdf', type: 'pdf', date: 'Jan 22' },
    { id: '4', name: 'Investor Deck.pptx', type: 'pptx', date: 'Jan 20' },
]

const getIcon = (type: string) => {
    switch (type) {
        case 'executive': return <Crown size={24} />
        case 'financial': return <DollarSign size={24} />
        case 'clinical': return <Stethoscope size={24} />
        case 'compliance': return <Shield size={24} />
        default: return <FileText size={24} />
    }
}

export default function BoardReportGenerator() {
    const [selectedTemplate, setSelectedTemplate] = useState<string>('1')
    const [sections, setSections] = useState(defaultSections)
    const [reportPeriod, setReportPeriod] = useState('q4-2025')
    const [generating, setGenerating] = useState(false)

    const toggleSection = (id: string) => {
        setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
    }

    const handleGenerate = () => {
        setGenerating(true)
        setTimeout(() => setGenerating(false), 2000)
    }

    return (
        <div className="board-report-generator">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <FileText size={28} />
                    Board Report Generator
                </h1>
                <p className="page-subtitle">
                    Create professional, branded reports for board meetings and stakeholder presentations
                </p>
            </motion.div>

            {/* Template Selection */}
            <motion.div
                className="template-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2>
                    <Layers size={20} />
                    Select Template
                </h2>
                <div className="template-grid">
                    {templates.map((template, index) => (
                        <motion.div
                            key={template.id}
                            className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                            onClick={() => setSelectedTemplate(template.id)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + index * 0.05 }}
                        >
                            <div className={`template-icon ${template.iconType}`}>
                                {getIcon(template.iconType)}
                            </div>
                            <h3>{template.name}</h3>
                            <p>{template.description}</p>
                            <div className="template-meta">
                                <span><FileText size={12} /> {template.pages} pages</span>
                                <span><Clock size={12} /> {template.lastUsed}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Configuration */}
            <div className="config-section">
                <motion.div
                    className="config-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3>
                        <Settings size={18} />
                        Report Configuration
                    </h3>

                    <div className="config-group">
                        <label>Reporting Period</label>
                        <select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)}>
                            <option value="q4-2025">Q4 2025 (Oct - Dec)</option>
                            <option value="q3-2025">Q3 2025 (Jul - Sep)</option>
                            <option value="q2-2025">Q2 2025 (Apr - Jun)</option>
                            <option value="q1-2025">Q1 2025 (Jan - Mar)</option>
                            <option value="fy-2025">Full Year 2025</option>
                        </select>
                    </div>

                    <div className="config-group">
                        <label>Include Sections</label>
                        <div className="section-toggles">
                            {sections.map((section) => (
                                <div key={section.id} className="section-toggle">
                                    <span className="toggle-label">{section.name}</span>
                                    <div
                                        className={`toggle-switch ${section.enabled ? 'active' : ''}`}
                                        onClick={() => toggleSection(section.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="preview-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <h3>
                        <Eye size={18} />
                        Preview
                    </h3>
                    <div className="preview-mockup">
                        <div className="mockup-header">
                            <div className="mockup-logo" />
                            <div className="mockup-title">Executive Summary Report</div>
                            <div className="mockup-date">Q4 2025 | Jan 29, 2026</div>
                        </div>
                        <div className="mockup-content">
                            <div className="mockup-chart" />
                            <div className="mockup-chart" />
                            <div className="mockup-table" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Generate Buttons */}
            <motion.div
                className="generate-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <button className="generate-btn secondary">
                    <Eye size={18} />
                    Preview Report
                </button>
                <button
                    className="generate-btn primary"
                    onClick={handleGenerate}
                    disabled={generating}
                >
                    {generating ? (
                        <>
                            <Sparkles size={18} className="animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Download size={18} />
                            Generate Report
                        </>
                    )}
                </button>
            </motion.div>

            {/* Recent Reports */}
            <motion.div
                className="recent-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
            >
                <h3>
                    <Clock size={18} />
                    Recent Reports
                </h3>
                <div className="recent-grid">
                    {recentReports.map((report) => (
                        <div key={report.id} className="recent-card">
                            <div className={`recent-icon ${report.type}`}>
                                {report.type === 'pdf' ? <FileText size={18} /> : <Presentation size={18} />}
                            </div>
                            <div className="recent-info">
                                <h4>{report.name}</h4>
                                <span>{report.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
