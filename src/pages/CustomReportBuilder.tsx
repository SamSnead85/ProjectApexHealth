import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3,
    PieChart,
    LineChart,
    Table,
    Plus,
    Save,
    Play,
    Download,
    Filter,
    Database,
    Settings
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './CustomReportBuilder.css'

interface DataField {
    id: string
    name: string
    type: 'dimension' | 'measure'
    dataType: 'string' | 'number' | 'date'
}

const dataFields: DataField[] = [
    { id: 'member_id', name: 'Member ID', type: 'dimension', dataType: 'string' },
    { id: 'claim_date', name: 'Claim Date', type: 'dimension', dataType: 'date' },
    { id: 'provider_name', name: 'Provider Name', type: 'dimension', dataType: 'string' },
    { id: 'service_type', name: 'Service Type', type: 'dimension', dataType: 'string' },
    { id: 'claim_amount', name: 'Claim Amount', type: 'measure', dataType: 'number' },
    { id: 'paid_amount', name: 'Paid Amount', type: 'measure', dataType: 'number' },
    { id: 'member_count', name: 'Member Count', type: 'measure', dataType: 'number' }
]

export function CustomReportBuilder() {
    const [selectedFields, setSelectedFields] = useState<string[]>(['service_type', 'claim_amount', 'paid_amount'])
    const [chartType, setChartType] = useState<'table' | 'bar' | 'line' | 'pie'>('bar')

    const toggleField = (fieldId: string) => {
        setSelectedFields(prev =>
            prev.includes(fieldId)
                ? prev.filter(f => f !== fieldId)
                : [...prev, fieldId]
        )
    }

    const chartTypes = [
        { type: 'table', icon: <Table size={18} />, label: 'Table' },
        { type: 'bar', icon: <BarChart3 size={18} />, label: 'Bar Chart' },
        { type: 'line', icon: <LineChart size={18} />, label: 'Line Chart' },
        { type: 'pie', icon: <PieChart size={18} />, label: 'Pie Chart' }
    ] as const

    return (
        <div className="report-builder-page">
            {/* Header */}
            <div className="builder__header">
                <div>
                    <h1 className="builder__title">Custom Report Builder</h1>
                    <p className="builder__subtitle">
                        Design and create custom analytics reports
                    </p>
                </div>
                <div className="builder__actions">
                    <Button variant="secondary" icon={<Save size={16} />}>Save Report</Button>
                    <Button variant="primary" icon={<Play size={16} />}>Run Report</Button>
                </div>
            </div>

            <div className="builder__content">
                {/* Left Panel - Data Fields */}
                <GlassCard className="data-panel">
                    <div className="panel-header">
                        <Database size={18} />
                        <h3>Data Fields</h3>
                    </div>
                    <div className="fields-list">
                        <div className="fields-section">
                            <h4>Dimensions</h4>
                            {dataFields.filter(f => f.type === 'dimension').map(field => (
                                <button
                                    key={field.id}
                                    className={`field-item ${selectedFields.includes(field.id) ? 'selected' : ''}`}
                                    onClick={() => toggleField(field.id)}
                                >
                                    <span className="field-name">{field.name}</span>
                                    <Badge variant="default" size="sm">{field.dataType}</Badge>
                                </button>
                            ))}
                        </div>
                        <div className="fields-section">
                            <h4>Measures</h4>
                            {dataFields.filter(f => f.type === 'measure').map(field => (
                                <button
                                    key={field.id}
                                    className={`field-item ${selectedFields.includes(field.id) ? 'selected' : ''}`}
                                    onClick={() => toggleField(field.id)}
                                >
                                    <span className="field-name">{field.name}</span>
                                    <Badge variant="teal" size="sm">{field.dataType}</Badge>
                                </button>
                            ))}
                        </div>
                    </div>
                </GlassCard>

                {/* Center - Preview */}
                <GlassCard className="preview-panel">
                    <div className="panel-header">
                        <BarChart3 size={18} />
                        <h3>Preview</h3>
                        <div className="chart-type-selector">
                            {chartTypes.map(chart => (
                                <button
                                    key={chart.type}
                                    className={`chart-type-btn ${chartType === chart.type ? 'active' : ''}`}
                                    onClick={() => setChartType(chart.type)}
                                    title={chart.label}
                                >
                                    {chart.icon}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="preview-area">
                        <div className="preview-placeholder">
                            {chartType === 'bar' && <BarChart3 size={64} />}
                            {chartType === 'line' && <LineChart size={64} />}
                            {chartType === 'pie' && <PieChart size={64} />}
                            {chartType === 'table' && <Table size={64} />}
                            <p>Select fields and run report to see preview</p>
                            <span className="selected-count">{selectedFields.length} fields selected</span>
                        </div>
                    </div>
                </GlassCard>

                {/* Right Panel - Options */}
                <GlassCard className="options-panel">
                    <div className="panel-header">
                        <Settings size={18} />
                        <h3>Options</h3>
                    </div>
                    <div className="options-content">
                        <div className="option-group">
                            <label>Report Name</label>
                            <input type="text" placeholder="Untitled Report" />
                        </div>
                        <div className="option-group">
                            <label>Date Range</label>
                            <select>
                                <option>Last 30 Days</option>
                                <option>Last 90 Days</option>
                                <option>Last 12 Months</option>
                                <option>Custom</option>
                            </select>
                        </div>
                        <div className="option-group">
                            <label>Group By</label>
                            <select>
                                <option>Day</option>
                                <option>Week</option>
                                <option>Month</option>
                                <option>Quarter</option>
                            </select>
                        </div>
                        <Button variant="secondary" icon={<Filter size={14} />} className="filter-btn">
                            Add Filters
                        </Button>
                        <Button variant="ghost" icon={<Download size={14} />} className="export-btn">
                            Export Options
                        </Button>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default CustomReportBuilder
