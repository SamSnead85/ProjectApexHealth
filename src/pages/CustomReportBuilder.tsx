import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    AreaChart, Area, BarChart, Bar, LineChart as RechartsLine, Line,
    PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
    BarChart3, PieChart, LineChart, TrendingUp, Plus, Save, Download,
    Calendar, Clock, Play, FileText, Layers, CheckSquare, Square,
    LayoutGrid, Activity, DollarSign, Users, Shield, Heart,
    ChevronDown, Trash2
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './CustomReportBuilder.css'

// ── Types ──
type DataSource = 'claims' | 'members' | 'providers' | 'financials' | 'quality'
type DateRange = '30d' | 'quarter' | 'year' | 'custom'
type GroupBy = 'month' | 'week' | 'day' | 'region' | 'provider' | 'payer'
type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'stacked'

interface MetricOption { id: string; label: string }
interface SavedReport {
    id: string; name: string; source: DataSource; chartType: ChartType
    lastRun: string; schedule: string | null; metrics: string[]
}

// ── Metrics per data source ──
const m = (id: string, label: string): MetricOption => ({ id, label })
const metricsMap: Record<DataSource, MetricOption[]> = {
    claims: [m('total_claims','Total Claims'), m('avg_claim_cost','Avg Claim Cost'), m('denial_rate','Denial Rate'), m('clean_claim_rate','Clean Claim Rate'), m('turnaround_time','Turnaround Time'), m('paid_amount','Paid Amount'), m('pending_claims','Pending Claims'), m('auto_adj_rate','Auto-Adjudication Rate')],
    members: [m('total_members','Total Members'), m('new_enrollments','New Enrollments'), m('disenrollments','Disenrollments'), m('avg_age','Average Age'), m('chronic_pct','Chronic Condition %'), m('satisfaction','Satisfaction Score'), m('utilization','Utilization Rate')],
    providers: [m('total_providers','Total Providers'), m('avg_cost_per_visit','Avg Cost / Visit'), m('referral_rate','Referral Rate'), m('quality_score','Quality Score'), m('panel_size','Panel Size'), m('readmission_rate','Readmission Rate')],
    financials: [m('revenue','Total Revenue'), m('medical_loss','Medical Loss Ratio'), m('admin_cost','Admin Cost Ratio'), m('pmpm','PMPM Cost'), m('operating_margin','Operating Margin'), m('reserve_ratio','Reserve Ratio'), m('premium_income','Premium Income')],
    quality: [m('hedis_score','HEDIS Composite'), m('star_rating','Star Rating'), m('readmit_30d','30-Day Readmissions'), m('preventive_care','Preventive Care %'), m('med_adherence','Medication Adherence'), m('er_utilization','ER Utilization Rate'), m('patient_safety','Patient Safety Index')],
}

// ── Helper to build 6-month sample rows ──
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] as const
const buildRows = (cols: Record<string, number[]>): Record<string, unknown>[] =>
    months.map((m, i) => {
        const row: Record<string, unknown> = { name: m }
        for (const [k, vals] of Object.entries(cols)) row[k] = vals[i]
        return row
    })

const sampleData: Record<DataSource, Record<string, unknown>[]> = {
    claims: buildRows({
        total_claims: [4200, 3800, 4500, 4100, 4700, 4400], avg_claim_cost: [340, 355, 328, 345, 332, 350],
        denial_rate: [8.2, 7.8, 7.1, 6.9, 6.5, 6.2], clean_claim_rate: [91, 92, 93, 93.5, 94, 94.5],
        turnaround_time: [12, 11, 10, 9, 9, 8], paid_amount: [1428000, 1349000, 1476000, 1414500, 1560400, 1540000],
        pending_claims: [310, 280, 260, 240, 220, 200], auto_adj_rate: [72, 74, 76, 78, 80, 82],
    }),
    members: buildRows({
        total_members: [45200, 46060, 46820, 47580, 48340, 49100], new_enrollments: [1200, 1300, 1100, 1400, 1500, 1600],
        disenrollments: [340, 440, 340, 640, 740, 840], avg_age: [42, 42, 41, 41, 41, 40],
        chronic_pct: [28, 27.5, 27, 26.5, 26, 25.5], satisfaction: [4.1, 4.2, 4.3, 4.2, 4.4, 4.5],
        utilization: [68, 70, 72, 71, 73, 75],
    }),
    providers: buildRows({
        total_providers: [1820, 1845, 1870, 1890, 1920, 1950], avg_cost_per_visit: [185, 182, 178, 176, 174, 170],
        referral_rate: [14.2, 13.8, 13.5, 13.1, 12.8, 12.5], quality_score: [87, 88, 89, 90, 91, 92],
        panel_size: [1450, 1470, 1490, 1510, 1530, 1550], readmission_rate: [11.2, 10.8, 10.5, 10.1, 9.8, 9.5],
    }),
    financials: buildRows({
        revenue: [8.2e6, 8.4e6, 8.6e6, 8.5e6, 8.9e6, 9.1e6], medical_loss: [84.2, 83.8, 83.1, 82.8, 82.4, 82.0],
        admin_cost: [12.1, 11.9, 11.7, 11.5, 11.3, 11.0], pmpm: [420, 415, 410, 405, 400, 395],
        operating_margin: [3.7, 4.3, 5.2, 5.7, 6.3, 7.0], reserve_ratio: [15.2, 15.5, 15.8, 16.0, 16.3, 16.5],
        premium_income: [7.8e6, 8.0e6, 8.2e6, 8.1e6, 8.5e6, 8.7e6],
    }),
    quality: buildRows({
        hedis_score: [78, 79, 80, 81, 82, 83], star_rating: [3.8, 3.9, 4.0, 4.0, 4.1, 4.2],
        readmit_30d: [12.5, 12.1, 11.8, 11.4, 11.0, 10.5], preventive_care: [68, 69, 71, 73, 75, 77],
        med_adherence: [72, 73, 75, 76, 78, 80], er_utilization: [320, 310, 300, 290, 280, 270],
        patient_safety: [91, 92, 92.5, 93, 93.5, 94],
    }),
}

const PIE_COLORS = ['#0D9488', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6']

const srcLabel: Record<DataSource, string> = { claims: 'Claims', members: 'Members', providers: 'Providers', financials: 'Financials', quality: 'Quality Metrics' }
const srcIcon: Record<DataSource, React.ReactNode> = { claims: <FileText size={14} />, members: <Users size={14} />, providers: <Heart size={14} />, financials: <DollarSign size={14} />, quality: <Shield size={14} /> }
const drLabel: Record<DateRange, string> = { '30d': 'Last 30 Days', quarter: 'This Quarter', year: 'This Year', custom: 'Custom Range' }
const gbLabel: Record<GroupBy, string> = { month: 'Month', week: 'Week', day: 'Day', region: 'Region', provider: 'Provider', payer: 'Payer' }
const chartCfg: { type: ChartType; icon: React.ReactNode; label: string }[] = [
    { type: 'bar', icon: <BarChart3 size={16} />, label: 'Bar' }, { type: 'line', icon: <LineChart size={16} />, label: 'Line' },
    { type: 'area', icon: <TrendingUp size={16} />, label: 'Area' }, { type: 'pie', icon: <PieChart size={16} />, label: 'Pie' },
    { type: 'stacked', icon: <Layers size={16} />, label: 'Stacked' },
]
const initSaved: SavedReport[] = [
    { id: 'sr1', name: 'Monthly Claims Overview', source: 'claims', chartType: 'area', lastRun: '2026-02-10', schedule: 'Weekly', metrics: ['total_claims', 'paid_amount', 'denial_rate'] },
    { id: 'sr2', name: 'Q1 Member Growth', source: 'members', chartType: 'bar', lastRun: '2026-02-08', schedule: 'Monthly', metrics: ['total_members', 'new_enrollments'] },
    { id: 'sr3', name: 'Provider Quality Scorecard', source: 'providers', chartType: 'line', lastRun: '2026-02-05', schedule: null, metrics: ['quality_score', 'readmission_rate'] },
    { id: 'sr4', name: 'Financial Performance', source: 'financials', chartType: 'area', lastRun: '2026-02-09', schedule: 'Daily', metrics: ['revenue', 'medical_loss', 'operating_margin'] },
]

// ── Custom tooltip ──
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
    if (!active || !payload?.length) return null
    return (
        <div className="rb-tooltip">
            <p className="rb-tooltip__label">{label}</p>
            {payload.map((entry, i) => (
                <div key={i} className="rb-tooltip__row">
                    <span className="rb-tooltip__dot" style={{ background: entry.color }} />
                    <span className="rb-tooltip__name">{entry.name}</span>
                    <span className="rb-tooltip__value">{typeof entry.value === 'number' && entry.value > 9999 ? `${(entry.value / 1000000).toFixed(2)}M` : entry.value?.toLocaleString()}</span>
                </div>
            ))}
        </div>
    )
}

// ── Main Component ──
export default function CustomReportBuilder() {
    const [reportName, setReportName] = useState('Untitled Report')
    const [dataSource, setDataSource] = useState<DataSource>('claims')
    const [dateRange, setDateRange] = useState<DateRange>('quarter')
    const [groupBy, setGroupBy] = useState<GroupBy>('month')
    const [chartType, setChartType] = useState<ChartType>('area')
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['total_claims', 'paid_amount', 'denial_rate'])
    const [savedReports, setSavedReports] = useState<SavedReport[]>(initSaved)

    const availableMetrics = metricsMap[dataSource]
    const chartData = sampleData[dataSource]

    // Pie data derived from first selected metric
    const pieData = useMemo(() => {
        const key = selectedMetrics[0]
        if (!key) return []
        return chartData.map(row => ({ name: row.name as string, value: row[key] as number }))
    }, [chartData, selectedMetrics])

    const toggleMetric = (id: string) => {
        setSelectedMetrics(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        )
    }

    const handleSourceChange = (src: DataSource) => {
        setDataSource(src)
        const defaults = metricsMap[src].slice(0, 3).map(m => m.id)
        setSelectedMetrics(defaults)
    }

    const handleNewReport = () => {
        setReportName('Untitled Report')
        setDataSource('claims')
        setDateRange('quarter')
        setGroupBy('month')
        setChartType('area')
        setSelectedMetrics(['total_claims', 'paid_amount', 'denial_rate'])
    }

    const handleSaveReport = () => {
        const newReport: SavedReport = {
            id: `sr${Date.now()}`, name: reportName, source: dataSource,
            chartType, lastRun: new Date().toISOString().slice(0, 10),
            schedule: null, metrics: [...selectedMetrics],
        }
        setSavedReports(prev => [newReport, ...prev])
    }

    const handleLoadReport = (report: SavedReport) => {
        setReportName(report.name)
        setDataSource(report.source)
        setChartType(report.chartType)
        setSelectedMetrics(report.metrics)
    }

    const handleDeleteReport = (id: string) => {
        setSavedReports(prev => prev.filter(r => r.id !== id))
    }

    // ── Chart rendering ──
    const renderChart = () => {
        if (selectedMetrics.length === 0) {
            return (
                <div className="rb-preview__empty">
                    <Activity size={48} />
                    <p>Select at least one metric to preview</p>
                </div>
            )
        }

        const gradientId = (i: number) => `rbGrad${i}`

        if (chartType === 'pie') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={120}
                            paddingAngle={3} dataKey="value" stroke="none">
                            {pieData.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{ color: 'var(--apex-silver)', fontSize: 12 }} />
                    </RechartsPie>
                </ResponsiveContainer>
            )
        }

        if (chartType === 'bar' || chartType === 'stacked') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{ color: 'var(--apex-silver)', fontSize: 12 }} />
                        {selectedMetrics.map((metric, i) => (
                            <Bar key={metric} dataKey={metric} stackId={chartType === 'stacked' ? 'stack' : undefined}
                                fill={PIE_COLORS[i % PIE_COLORS.length]} radius={chartType === 'stacked' ? 0 : [4, 4, 0, 0]}
                                name={availableMetrics.find(m => m.id === metric)?.label ?? metric} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            )
        }

        if (chartType === 'line') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLine data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{ color: 'var(--apex-silver)', fontSize: 12 }} />
                        {selectedMetrics.map((metric, i) => (
                            <Line key={metric} type="monotone" dataKey={metric} stroke={PIE_COLORS[i % PIE_COLORS.length]}
                                strokeWidth={2} dot={{ r: 4, fill: PIE_COLORS[i % PIE_COLORS.length] }}
                                name={availableMetrics.find(m => m.id === metric)?.label ?? metric} />
                        ))}
                    </RechartsLine>
                </ResponsiveContainer>
            )
        }

        // area (default)
        return (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                        {selectedMetrics.map((_, i) => (
                            <linearGradient key={i} id={gradientId(i)} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={PIE_COLORS[i % PIE_COLORS.length]} stopOpacity={0.35} />
                                <stop offset="100%" stopColor={PIE_COLORS[i % PIE_COLORS.length]} stopOpacity={0.02} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ color: 'var(--apex-silver)', fontSize: 12 }} />
                    {selectedMetrics.map((metric, i) => (
                        <Area key={metric} type="monotone" dataKey={metric}
                            stroke={PIE_COLORS[i % PIE_COLORS.length]} fill={`url(#${gradientId(i)})`}
                            strokeWidth={2} name={availableMetrics.find(m => m.id === metric)?.label ?? metric} />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        )
    }

    return (
        <div className="report-builder-page">
            {/* ── Action Bar ── */}
            <motion.div className="rb-action-bar" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <div className="rb-action-bar__left">
                    <h1 className="rb-action-bar__title">Report Builder</h1>
                    <Badge variant="teal" size="sm">Beta</Badge>
                </div>
                <div className="rb-action-bar__right">
                    <Button variant="ghost" icon={<Plus size={15} />} onClick={handleNewReport}>New Report</Button>
                    <Button variant="secondary" icon={<Save size={15} />} onClick={handleSaveReport}>Save Report</Button>
                    <Button variant="ghost" icon={<Download size={15} />}>Export PDF</Button>
                    <Button variant="ghost" icon={<Clock size={15} />}>Schedule</Button>
                </div>
            </motion.div>

            {/* ── Main content ── */}
            <div className="rb-main">
                {/* ── Config Panel (left) ── */}
                <motion.div className="rb-config" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                    <GlassCard className="rb-config__card">
                        {/* Report Name */}
                        <div className="rb-section">
                            <label className="rb-label">Report Name</label>
                            <input className="rb-input" type="text" value={reportName}
                                onChange={e => setReportName(e.target.value)} placeholder="Enter report name..." />
                        </div>

                        {/* Data Source */}
                        <div className="rb-section">
                            <label className="rb-label">Data Source</label>
                            <div className="rb-source-grid">
                                {(Object.keys(srcLabel) as DataSource[]).map(src => (
                                    <button key={src}
                                        className={`rb-source-btn ${dataSource === src ? 'active' : ''}`}
                                        onClick={() => handleSourceChange(src)}>
                                        {srcIcon[src]}
                                        <span>{srcLabel[src]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="rb-section">
                            <label className="rb-label">Date Range</label>
                            <div className="rb-select-wrapper">
                                <select className="rb-select" value={dateRange} onChange={e => setDateRange(e.target.value as DateRange)}>
                                    {(Object.keys(drLabel) as DateRange[]).map(dr => (
                                        <option key={dr} value={dr}>{drLabel[dr]}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="rb-select-icon" />
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="rb-section">
                            <label className="rb-label">Metrics <span className="rb-label__count">{selectedMetrics.length} selected</span></label>
                            <div className="rb-metrics-list">
                                <AnimatePresence mode="popLayout">
                                    {availableMetrics.map(metric => (
                                        <motion.button key={metric.id} className={`rb-metric-item ${selectedMetrics.includes(metric.id) ? 'active' : ''}`}
                                            onClick={() => toggleMetric(metric.id)}
                                            layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}>
                                            {selectedMetrics.includes(metric.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                                            <span>{metric.label}</span>
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Group By */}
                        <div className="rb-section">
                            <label className="rb-label">Group By</label>
                            <div className="rb-select-wrapper">
                                <select className="rb-select" value={groupBy} onChange={e => setGroupBy(e.target.value as GroupBy)}>
                                    {(Object.keys(gbLabel) as GroupBy[]).map(g => (
                                        <option key={g} value={g}>{gbLabel[g]}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="rb-select-icon" />
                            </div>
                        </div>

                        {/* Chart Type */}
                        <div className="rb-section">
                            <label className="rb-label">Chart Type</label>
                            <div className="rb-chart-types">
                                {chartCfg.map(ct => (
                                    <button key={ct.type}
                                        className={`rb-chart-type-btn ${chartType === ct.type ? 'active' : ''}`}
                                        onClick={() => setChartType(ct.type)} title={ct.label}>
                                        {ct.icon}
                                        <span>{ct.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* ── Preview Panel (right) ── */}
                <motion.div className="rb-preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
                    <GlassCard className="rb-preview__card">
                        <div className="rb-preview__header">
                            <div>
                                <h2 className="rb-preview__title">{reportName || 'Untitled Report'}</h2>
                                <p className="rb-preview__meta">
                                    <Calendar size={13} />
                                    {drLabel[dateRange]}
                                    <span className="rb-preview__sep">·</span>
                                    <LayoutGrid size={13} />
                                    Grouped by {gbLabel[groupBy]}
                                    <span className="rb-preview__sep">·</span>
                                    {srcIcon[dataSource]}
                                    {srcLabel[dataSource]}
                                </p>
                            </div>
                            <div className="rb-preview__chart-switcher">
                                {chartCfg.map(ct => (
                                    <button key={ct.type}
                                        className={`chart-type-btn ${chartType === ct.type ? 'active' : ''}`}
                                        onClick={() => setChartType(ct.type)} title={ct.label}>
                                        {ct.icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="rb-preview__chart">
                            <AnimatePresence mode="wait">
                                <motion.div key={`${chartType}-${dataSource}-${selectedMetrics.join(',')}`}
                                    className="rb-preview__chart-inner"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}>
                                    {renderChart()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* ── Saved Reports ── */}
            <motion.div className="rb-saved" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
                <div className="rb-saved__header">
                    <h3 className="rb-saved__heading">Saved Reports</h3>
                    <Badge variant="default" size="sm">{savedReports.length}</Badge>
                </div>
                <div className="rb-saved__grid">
                    {savedReports.map(report => (
                        <GlassCard key={report.id} className="rb-saved-card" onClick={() => handleLoadReport(report)}>
                            <div className="rb-saved-card__top">
                                <span className="rb-saved-card__icon">
                                    {report.chartType === 'area' || report.chartType === 'line' ? <TrendingUp size={16} /> :
                                     report.chartType === 'pie' ? <PieChart size={16} /> : <BarChart3 size={16} />}
                                </span>
                                <button className="rb-saved-card__delete" onClick={e => { e.stopPropagation(); handleDeleteReport(report.id) }}
                                    title="Delete report"><Trash2 size={13} /></button>
                            </div>
                            <h4 className="rb-saved-card__name">{report.name}</h4>
                            <p className="rb-saved-card__meta">
                                <Calendar size={12} /> Last run {report.lastRun}
                            </p>
                            {report.schedule && (
                                <Badge variant="teal" size="sm" className="rb-saved-card__schedule">
                                    <Clock size={10} /> {report.schedule}
                                </Badge>
                            )}
                            <button className="rb-saved-card__run" onClick={e => { e.stopPropagation(); handleLoadReport(report) }}>
                                <Play size={13} /> Quick Run
                            </button>
                        </GlassCard>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
