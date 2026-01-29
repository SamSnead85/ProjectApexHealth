import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FileText,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertCircle,
    CheckCircle2,
    Download,
    Share2,
    Calendar,
    User,
    ChevronDown,
    ChevronUp,
    Activity,
    Droplets,
    Heart,
    Pill
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './LabResultsViewer.css'

// Lab result types
interface LabResult {
    id: string
    testName: string
    category: 'blood' | 'metabolic' | 'lipid' | 'thyroid' | 'urinalysis'
    value: number | string
    unit: string
    referenceRange: { low: number; high: number } | string
    status: 'normal' | 'high' | 'low' | 'critical'
    previousValue?: number | string
    previousDate?: string
}

interface LabPanel {
    id: string
    name: string
    date: string
    orderedBy: string
    facility: string
    status: 'completed' | 'pending' | 'partial'
    results: LabResult[]
}

const labPanels: LabPanel[] = [
    {
        id: 'panel-1',
        name: 'Comprehensive Metabolic Panel (CMP)',
        date: '2024-01-25',
        orderedBy: 'Dr. Sarah Chen',
        facility: 'Quest Diagnostics',
        status: 'completed',
        results: [
            { id: 'r1', testName: 'Glucose, Fasting', category: 'metabolic', value: 98, unit: 'mg/dL', referenceRange: { low: 70, high: 100 }, status: 'normal', previousValue: 105, previousDate: '2023-10-15' },
            { id: 'r2', testName: 'BUN', category: 'metabolic', value: 15, unit: 'mg/dL', referenceRange: { low: 7, high: 20 }, status: 'normal' },
            { id: 'r3', testName: 'Creatinine', category: 'metabolic', value: 1.1, unit: 'mg/dL', referenceRange: { low: 0.7, high: 1.3 }, status: 'normal' },
            { id: 'r4', testName: 'Sodium', category: 'metabolic', value: 142, unit: 'mEq/L', referenceRange: { low: 136, high: 145 }, status: 'normal' },
            { id: 'r5', testName: 'Potassium', category: 'metabolic', value: 4.5, unit: 'mEq/L', referenceRange: { low: 3.5, high: 5.0 }, status: 'normal' },
        ]
    },
    {
        id: 'panel-2',
        name: 'Lipid Panel',
        date: '2024-01-25',
        orderedBy: 'Dr. Sarah Chen',
        facility: 'Quest Diagnostics',
        status: 'completed',
        results: [
            { id: 'r6', testName: 'Total Cholesterol', category: 'lipid', value: 215, unit: 'mg/dL', referenceRange: { low: 0, high: 200 }, status: 'high', previousValue: 198, previousDate: '2023-10-15' },
            { id: 'r7', testName: 'HDL Cholesterol', category: 'lipid', value: 58, unit: 'mg/dL', referenceRange: { low: 40, high: 999 }, status: 'normal' },
            { id: 'r8', testName: 'LDL Cholesterol', category: 'lipid', value: 138, unit: 'mg/dL', referenceRange: { low: 0, high: 100 }, status: 'high', previousValue: 125, previousDate: '2023-10-15' },
            { id: 'r9', testName: 'Triglycerides', category: 'lipid', value: 145, unit: 'mg/dL', referenceRange: { low: 0, high: 150 }, status: 'normal' },
        ]
    },
    {
        id: 'panel-3',
        name: 'Complete Blood Count (CBC)',
        date: '2024-01-25',
        orderedBy: 'Dr. Sarah Chen',
        facility: 'Quest Diagnostics',
        status: 'completed',
        results: [
            { id: 'r10', testName: 'WBC', category: 'blood', value: 7.2, unit: 'K/uL', referenceRange: { low: 4.5, high: 11.0 }, status: 'normal' },
            { id: 'r11', testName: 'RBC', category: 'blood', value: 5.1, unit: 'M/uL', referenceRange: { low: 4.5, high: 5.5 }, status: 'normal' },
            { id: 'r12', testName: 'Hemoglobin', category: 'blood', value: 15.2, unit: 'g/dL', referenceRange: { low: 13.5, high: 17.5 }, status: 'normal' },
            { id: 'r13', testName: 'Hematocrit', category: 'blood', value: 45, unit: '%', referenceRange: { low: 38, high: 50 }, status: 'normal' },
            { id: 'r14', testName: 'Platelets', category: 'blood', value: 250, unit: 'K/uL', referenceRange: { low: 150, high: 400 }, status: 'normal' },
        ]
    }
]

const categoryIcons: Record<string, React.ReactNode> = {
    blood: <Droplets size={16} />,
    metabolic: <Activity size={16} />,
    lipid: <Heart size={16} />,
    thyroid: <Pill size={16} />,
    urinalysis: <Droplets size={16} />
}

export function LabResultsViewer() {
    const [expandedPanel, setExpandedPanel] = useState<string | null>('panel-1')
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'abnormal'>('all')

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'high': return <TrendingUp size={14} />
            case 'low': return <TrendingDown size={14} />
            case 'critical': return <AlertCircle size={14} />
            default: return <CheckCircle2 size={14} />
        }
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'high': return 'status-high'
            case 'low': return 'status-low'
            case 'critical': return 'status-critical'
            default: return 'status-normal'
        }
    }

    const getTrendIcon = (current: number | string, previous: number | string | undefined) => {
        if (typeof current !== 'number' || typeof previous !== 'number') return null
        if (current > previous) return <TrendingUp size={12} className="trend-up" />
        if (current < previous) return <TrendingDown size={12} className="trend-down" />
        return <Minus size={12} className="trend-stable" />
    }

    const abnormalCount = labPanels.flatMap(p => p.results).filter(r => r.status !== 'normal').length

    const filteredResults = (results: LabResult[]) => {
        if (selectedFilter === 'abnormal') {
            return results.filter(r => r.status !== 'normal')
        }
        return results
    }

    return (
        <div className="lab-results-viewer">
            {/* Header */}
            <div className="lab-results-header">
                <div className="lab-results-header__title">
                    <FileText size={22} className="lab-results-header__icon" />
                    <div>
                        <h2>Lab Results</h2>
                        <p>Last updated: {formatDate(labPanels[0].date)}</p>
                    </div>
                </div>
                <div className="lab-results-header__actions">
                    <Button variant="ghost" size="sm" icon={<Download size={16} />}>
                        Download PDF
                    </Button>
                    <Button variant="ghost" size="sm" icon={<Share2 size={16} />}>
                        Share
                    </Button>
                </div>
            </div>

            {/* Summary */}
            <div className="lab-results-summary">
                <GlassCard className="summary-stat">
                    <div className="summary-stat__icon summary-stat__icon--success">
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="summary-stat__content">
                        <span className="summary-stat__value">{labPanels.flatMap(p => p.results).filter(r => r.status === 'normal').length}</span>
                        <span className="summary-stat__label">Normal Results</span>
                    </div>
                </GlassCard>
                {abnormalCount > 0 && (
                    <GlassCard className="summary-stat summary-stat--alert">
                        <div className="summary-stat__icon summary-stat__icon--warning">
                            <AlertCircle size={20} />
                        </div>
                        <div className="summary-stat__content">
                            <span className="summary-stat__value">{abnormalCount}</span>
                            <span className="summary-stat__label">Abnormal</span>
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* Filter */}
            <div className="lab-results-filter">
                <button
                    className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedFilter('all')}
                >
                    All Results
                </button>
                <button
                    className={`filter-btn ${selectedFilter === 'abnormal' ? 'active' : ''}`}
                    onClick={() => setSelectedFilter('abnormal')}
                >
                    Abnormal Only ({abnormalCount})
                </button>
            </div>

            {/* Lab Panels */}
            <div className="lab-panels">
                {labPanels.map((panel, index) => {
                    const panelResults = filteredResults(panel.results)
                    if (selectedFilter === 'abnormal' && panelResults.length === 0) return null

                    return (
                        <motion.div
                            key={panel.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <GlassCard className="lab-panel">
                                <div
                                    className="lab-panel__header"
                                    onClick={() => setExpandedPanel(expandedPanel === panel.id ? null : panel.id)}
                                >
                                    <div className="lab-panel__info">
                                        <h3>{panel.name}</h3>
                                        <div className="lab-panel__meta">
                                            <span><Calendar size={12} /> {formatDate(panel.date)}</span>
                                            <span><User size={12} /> {panel.orderedBy}</span>
                                        </div>
                                    </div>
                                    <div className="lab-panel__expand">
                                        {panel.results.some(r => r.status !== 'normal') && (
                                            <Badge variant="warning" size="sm">
                                                {panel.results.filter(r => r.status !== 'normal').length} Abnormal
                                            </Badge>
                                        )}
                                        {expandedPanel === panel.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>

                                {expandedPanel === panel.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="lab-panel__results"
                                    >
                                        <div className="results-table">
                                            <div className="results-table__header">
                                                <span>Test</span>
                                                <span>Result</span>
                                                <span>Reference Range</span>
                                                <span>Status</span>
                                            </div>
                                            {panelResults.map(result => (
                                                <div key={result.id} className={`results-table__row ${getStatusClass(result.status)}`}>
                                                    <span className="result-name">
                                                        {categoryIcons[result.category]}
                                                        {result.testName}
                                                    </span>
                                                    <span className="result-value">
                                                        <strong>{result.value}</strong> {result.unit}
                                                        {result.previousValue && (
                                                            <span className="result-trend">
                                                                {getTrendIcon(result.value, result.previousValue)}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="result-range">
                                                        {typeof result.referenceRange === 'string'
                                                            ? result.referenceRange
                                                            : `${result.referenceRange.low} - ${result.referenceRange.high}`}
                                                    </span>
                                                    <span className={`result-status ${getStatusClass(result.status)}`}>
                                                        {getStatusIcon(result.status)}
                                                        {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

export default LabResultsViewer
