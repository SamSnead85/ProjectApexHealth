import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'
import {
    BarChart3,
    LineChartIcon,
    PieChartIcon,
    TrendingUp,
    Table2,
    Layers,
    Database,
    Plus,
    Minus,
    ZoomIn,
    Undo,
    Redo,
    Download,
    Save,
    Settings,
    Sparkles,
    Palette,
    Type,
    Grid3X3,
    Eye,
    Share2
} from 'lucide-react'
import './DataVisualizationStudio.css'

const sampleData = [
    { month: 'Jan', claims: 1200, members: 4500, cost: 85000 },
    { month: 'Feb', claims: 1350, members: 4650, cost: 92000 },
    { month: 'Mar', claims: 1100, members: 4800, cost: 78000 },
    { month: 'Apr', claims: 1450, members: 5100, cost: 98000 },
    { month: 'May', claims: 1280, members: 5300, cost: 88000 },
    { month: 'Jun', claims: 1550, members: 5500, cost: 105000 }
]

const pieData = [
    { name: 'Medical', value: 45, color: '#3B82F6' },
    { name: 'Pharmacy', value: 30, color: '#8B5CF6' },
    { name: 'Dental', value: 15, color: '#10B981' },
    { name: 'Vision', value: 10, color: '#F59E0B' }
]

const DataVisualizationStudio = () => {
    const [selectedChartType, setSelectedChartType] = useState('area')
    const [activeTab, setActiveTab] = useState('style')
    const [chartTitle, setChartTitle] = useState('Monthly Claims Overview')
    const [zoom, setZoom] = useState(100)
    const [showLegend, setShowLegend] = useState(true)
    const [showGrid, setShowGrid] = useState(true)
    const [selectedColor, setSelectedColor] = useState(0)

    const chartTypes = [
        { id: 'area', icon: TrendingUp, label: 'Area' },
        { id: 'bar', icon: BarChart3, label: 'Bar' },
        { id: 'line', icon: LineChartIcon, label: 'Line' },
        { id: 'pie', icon: PieChartIcon, label: 'Pie' },
        { id: 'stacked', icon: Layers, label: 'Stacked' },
        { id: 'table', icon: Table2, label: 'Table' }
    ]

    const dataSources = [
        { id: 'claims', name: 'Claims Data', type: 'Real-time', icon: Database },
        { id: 'members', name: 'Member Enrollment', type: 'Daily', icon: Database },
        { id: 'financials', name: 'Financial Summary', type: 'Weekly', icon: Database },
        { id: 'providers', name: 'Provider Network', type: 'Real-time', icon: Database }
    ]

    const colorPalettes = [
        ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'],
        ['#EF4444', '#F97316', '#FBBF24', '#84CC16'],
        ['#06B6D4', '#0EA5E9', '#6366F1', '#A855F7'],
        ['#EC4899', '#F43F5E', '#FB7185', '#FDA4AF']
    ]

    const renderChart = () => {
        switch (selectedChartType) {
            case 'area':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sampleData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />}
                            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)' }}
                            />
                            {showLegend && <Legend />}
                            <Area
                                type="monotone"
                                dataKey="claims"
                                stroke={colorPalettes[selectedColor][0]}
                                fill={colorPalettes[selectedColor][0]}
                                fillOpacity={0.3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sampleData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />}
                            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)' }}
                            />
                            {showLegend && <Legend />}
                            <Bar dataKey="claims" fill={colorPalettes[selectedColor][0]} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sampleData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />}
                            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)' }}
                            />
                            {showLegend && <Legend />}
                            <Line
                                type="monotone"
                                dataKey="claims"
                                stroke={colorPalettes[selectedColor][0]}
                                strokeWidth={2}
                                dot={{ fill: colorPalettes[selectedColor][0] }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colorPalettes[selectedColor][index % 4]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)' }}
                            />
                            {showLegend && <Legend />}
                        </PieChart>
                    </ResponsiveContainer>
                )
            default:
                return null
        }
    }

    return (
        <motion.div
            className="viz-studio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <h1>Data Visualization Studio</h1>
            <p>Create custom charts and dashboards with drag-and-drop simplicity</p>

            <div className="studio-layout">
                {/* Left Sidebar - Chart Types & Data Sources */}
                <div className="studio-sidebar">
                    <div className="sidebar-header">
                        <h3>Chart Types</h3>
                        <p>Select a visualization</p>
                    </div>
                    <div className="sidebar-content">
                        <div className="chart-types-grid">
                            {chartTypes.map(type => (
                                <motion.div
                                    key={type.id}
                                    className={`chart-type-item ${selectedChartType === type.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedChartType(type.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <type.icon size={24} />
                                    <span>{type.label}</span>
                                </motion.div>
                            ))}
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <div className="property-group-title" style={{ marginBottom: '0.75rem' }}>Data Sources</div>
                            <div className="data-source-list">
                                {dataSources.map(source => (
                                    <div key={source.id} className="data-source-item">
                                        <div className="data-source-icon">
                                            <source.icon size={16} />
                                        </div>
                                        <div className="data-source-info">
                                            <div className="data-source-name">{source.name}</div>
                                            <div className="data-source-type">{source.type}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="studio-canvas">
                    <div className="canvas-toolbar">
                        <div className="toolbar-left">
                            <button className="toolbar-btn">
                                <Undo size={18} />
                            </button>
                            <button className="toolbar-btn">
                                <Redo size={18} />
                            </button>
                            <div className="toolbar-divider" />
                            <div className="zoom-controls">
                                <button className="zoom-btn" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                                    <Minus size={14} />
                                </button>
                                <span>{zoom}%</span>
                                <button className="zoom-btn" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="toolbar-right">
                            <button className="toolbar-btn">
                                <Eye size={18} />
                            </button>
                            <button className="toolbar-btn">
                                <Share2 size={18} />
                            </button>
                            <button className="toolbar-btn">
                                <Save size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="canvas-area" style={{ transform: `scale(${zoom / 100})` }}>
                        <motion.div
                            className="chart-container"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={selectedChartType}
                        >
                            <div className="chart-header">
                                <div className="chart-title-area">
                                    <input
                                        type="text"
                                        value={chartTitle}
                                        onChange={(e) => setChartTitle(e.target.value)}
                                        placeholder="Chart Title"
                                    />
                                    <div className="chart-subtitle">Last updated: Jan 29, 2026</div>
                                </div>
                            </div>
                            <div className="chart-body">
                                {renderChart()}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right Sidebar - Properties */}
                <div className="properties-panel">
                    <div className="properties-tabs">
                        {['style', 'data', 'format'].map(tab => (
                            <button
                                key={tab}
                                className={`property-tab ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="properties-content">
                        {activeTab === 'style' && (
                            <>
                                <div className="property-group">
                                    <div className="property-group-header">
                                        <span className="property-group-title">Colors</span>
                                    </div>
                                    <div className="color-picker-row">
                                        {colorPalettes.map((palette, index) => (
                                            <div
                                                key={index}
                                                className={`color-swatch ${selectedColor === index ? 'selected' : ''}`}
                                                style={{ background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})` }}
                                                onClick={() => setSelectedColor(index)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="property-group">
                                    <div className="property-group-header">
                                        <span className="property-group-title">Display Options</span>
                                    </div>
                                    <div className="toggle-row">
                                        <span className="property-label">Show Legend</span>
                                        <div
                                            className={`toggle-switch ${showLegend ? 'active' : ''}`}
                                            onClick={() => setShowLegend(!showLegend)}
                                        />
                                    </div>
                                    <div className="toggle-row">
                                        <span className="property-label">Show Grid</span>
                                        <div
                                            className={`toggle-switch ${showGrid ? 'active' : ''}`}
                                            onClick={() => setShowGrid(!showGrid)}
                                        />
                                    </div>
                                </div>

                                <div className="ai-suggestions">
                                    <div className="ai-suggestions-header">
                                        <Sparkles size={14} />
                                        <span>AI Suggestions</span>
                                    </div>
                                    <div className="ai-suggestion-item">
                                        <Sparkles size={12} />
                                        <span>Try stacked bars for comparison</span>
                                    </div>
                                    <div className="ai-suggestion-item">
                                        <Sparkles size={12} />
                                        <span>Add trend line for forecasting</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'data' && (
                            <div className="property-group">
                                <div className="property-row">
                                    <label className="property-label">X-Axis Field</label>
                                    <select className="property-select">
                                        <option>Month</option>
                                        <option>Quarter</option>
                                        <option>Year</option>
                                    </select>
                                </div>
                                <div className="property-row">
                                    <label className="property-label">Y-Axis Field</label>
                                    <select className="property-select">
                                        <option>Claims Count</option>
                                        <option>Total Cost</option>
                                        <option>Member Count</option>
                                    </select>
                                </div>
                                <div className="property-row">
                                    <label className="property-label">Aggregation</label>
                                    <select className="property-select">
                                        <option>Sum</option>
                                        <option>Average</option>
                                        <option>Count</option>
                                        <option>Max</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 'format' && (
                            <div className="property-group">
                                <div className="property-row">
                                    <label className="property-label">Chart Title</label>
                                    <input
                                        type="text"
                                        className="property-input"
                                        value={chartTitle}
                                        onChange={(e) => setChartTitle(e.target.value)}
                                    />
                                </div>
                                <div className="property-row">
                                    <label className="property-label">Number Format</label>
                                    <select className="property-select">
                                        <option>1,234</option>
                                        <option>1.234</option>
                                        <option>$1,234</option>
                                        <option>1,234%</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="export-section">
                        <button className="export-btn">
                            <Download size={18} />
                            Export Chart
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default DataVisualizationStudio
