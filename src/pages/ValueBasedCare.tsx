import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts'
import {
    Target,
    TrendingUp,
    TrendingDown,
    Award,
    DollarSign,
    HeartPulse,
    BarChart3,
    CheckCircle2,
    AlertTriangle,
    Building2
} from 'lucide-react'
import './ValueBasedCare.css'

interface QualityMeasure {
    id: string
    name: string
    score: number
    target: number
    category: 'excellent' | 'good' | 'warning' | 'poor'
}

interface Contract {
    id: string
    payer: string
    initials: string
    type: string
    performance: 'exceeding' | 'meeting' | 'at-risk' | 'below'
    revenue: number
    sharedSavings: number
}

const qualityMeasures: QualityMeasure[] = [
    { id: '1', name: 'HbA1c Control (<8%)', score: 88, target: 80, category: 'excellent' },
    { id: '2', name: 'Breast Cancer Screening', score: 76, target: 75, category: 'good' },
    { id: '3', name: 'Colorectal Cancer Screening', score: 71, target: 70, category: 'good' },
    { id: '4', name: 'Blood Pressure Control', score: 82, target: 85, category: 'warning' },
    { id: '5', name: 'Patient Experience (CAHPS)', score: 91, target: 85, category: 'excellent' },
    { id: '6', name: 'Fall Risk Assessment (65+)', score: 68, target: 80, category: 'poor' },
]

const contracts: Contract[] = [
    { id: '1', payer: 'Blue Cross Blue Shield', initials: 'BC', type: 'ACO', performance: 'exceeding', revenue: 4200000, sharedSavings: 890000 },
    { id: '2', payer: 'Aetna Value Network', initials: 'AE', type: 'P4P', performance: 'meeting', revenue: 2800000, sharedSavings: 420000 },
    { id: '3', payer: 'United Healthcare', initials: 'UH', type: 'MSSP', performance: 'at-risk', revenue: 3100000, sharedSavings: 180000 },
    { id: '4', payer: 'Cigna HealthCare', initials: 'CI', type: 'Bundled', performance: 'meeting', revenue: 1900000, sharedSavings: 310000 },
]

const pieData = [
    { name: 'Shared Savings', value: 1800000, color: '#22c55e' },
    { name: 'Quality Bonus', value: 620000, color: '#14b8a6' },
    { name: 'Base Contract', value: 8400000, color: '#818cf8' },
    { name: 'Risk Pool', value: 340000, color: '#f59e0b' },
]

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
}

export default function ValueBasedCare() {
    return (
        <div className="value-based-care">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <Target size={28} />
                    Value-Based Care
                </h1>
                <p className="page-subtitle">
                    Track quality measures, contract performance, and shared savings across VBC programs
                </p>
            </motion.div>

            {/* Summary Cards */}
            <div className="vbc-summary">
                <motion.div
                    className="vbc-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h4>Total Shared Savings</h4>
                    <div className="value">$1.8M</div>
                    <div className="trend positive">
                        <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        +23% vs prior year
                    </div>
                </motion.div>

                <motion.div
                    className="vbc-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h4>Quality Score</h4>
                    <div className="value">86.4</div>
                    <div className="trend positive">
                        <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        +4.2 points
                    </div>
                </motion.div>

                <motion.div
                    className="vbc-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h4>Active Contracts</h4>
                    <div className="value">12</div>
                    <div className="trend positive">
                        <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        +3 new this year
                    </div>
                </motion.div>

                <motion.div
                    className="vbc-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <h4>Attributed Lives</h4>
                    <div className="value">24,580</div>
                    <div className="trend positive">
                        <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        +8.4% growth
                    </div>
                </motion.div>
            </div>

            {/* Quality Measures */}
            <motion.div
                className="quality-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2>
                    <Award size={20} />
                    Quality Performance Measures
                </h2>
                <div className="quality-grid">
                    {qualityMeasures.map((measure, index) => (
                        <motion.div
                            key={measure.id}
                            className="quality-measure"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 + index * 0.05 }}
                        >
                            <div className="measure-header">
                                <span className="measure-name">{measure.name}</span>
                                <span className="measure-score">{measure.score}%</span>
                            </div>
                            <div className="measure-bar">
                                <motion.div
                                    className={`measure-fill ${measure.category}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${measure.score}%` }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                />
                            </div>
                            <div className="measure-target">Target: {measure.target}%</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Contracts and Breakdown */}
            <div className="contracts-section">
                <motion.div
                    className="contracts-table"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2>
                        <Building2 size={20} />
                        VBC Contract Performance
                    </h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Payer</th>
                                <th>Contract Type</th>
                                <th>Performance</th>
                                <th>Annual Revenue</th>
                                <th>Shared Savings</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map((contract) => (
                                <tr key={contract.id}>
                                    <td>
                                        <div className="payer-name">
                                            <div className="payer-logo">{contract.initials}</div>
                                            {contract.payer}
                                        </div>
                                    </td>
                                    <td>{contract.type}</td>
                                    <td>
                                        <span className={`performance-badge ${contract.performance}`}>
                                            {contract.performance === 'exceeding' && <CheckCircle2 size={12} />}
                                            {contract.performance === 'at-risk' && <AlertTriangle size={12} />}
                                            {contract.performance.charAt(0).toUpperCase() + contract.performance.slice(1).replace('-', ' ')}
                                        </span>
                                    </td>
                                    <td>{formatCurrency(contract.revenue)}</td>
                                    <td style={{ color: '#22c55e' }}>{formatCurrency(contract.sharedSavings)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>

                <motion.div
                    className="vbc-breakdown"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                >
                    <h2>
                        <DollarSign size={20} />
                        Revenue Breakdown
                    </h2>
                    <div className="breakdown-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{
                                        background: '#FFFFFF',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        color: '#111827'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="breakdown-legend">
                        {pieData.map((item) => (
                            <div key={item.name} className="legend-row">
                                <div className="legend-label">
                                    <span className="legend-dot" style={{ background: item.color }}></span>
                                    {item.name}
                                </div>
                                <span className="legend-value">{formatCurrency(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
