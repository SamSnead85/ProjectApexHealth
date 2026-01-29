import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    ComposedChart
} from 'recharts'
import {
    Brain,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Users,
    DollarSign,
    Activity,
    Target,
    Zap,
    Shield,
    Eye
} from 'lucide-react'
import './ClaimsPrediction.css'

interface RiskMember {
    id: string
    name: string
    initials: string
    riskScore: number
    predictedClaims: number
    primaryCondition: string
    intervention: string
}

interface MonthlyData {
    month: string
    actual: number | null
    predicted: number
    highRisk: number
}

const mockMonthlyData: MonthlyData[] = [
    { month: 'Aug', actual: 2450000, predicted: 2380000, highRisk: 450000 },
    { month: 'Sep', actual: 2680000, predicted: 2620000, highRisk: 520000 },
    { month: 'Oct', actual: 2890000, predicted: 2950000, highRisk: 610000 },
    { month: 'Nov', actual: 3120000, predicted: 3080000, highRisk: 680000 },
    { month: 'Dec', actual: 3340000, predicted: 3280000, highRisk: 720000 },
    { month: 'Jan', actual: 3180000, predicted: 3150000, highRisk: 690000 },
    { month: 'Feb', actual: null, predicted: 3420000, highRisk: 780000 },
    { month: 'Mar', actual: null, predicted: 3680000, highRisk: 850000 },
    { month: 'Apr', actual: null, predicted: 3520000, highRisk: 810000 },
]

const mockHighRiskMembers: RiskMember[] = [
    { id: '1', name: 'James Mitchell', initials: 'JM', riskScore: 94, predictedClaims: 285000, primaryCondition: 'End Stage Renal Disease', intervention: 'Care Management' },
    { id: '2', name: 'Patricia Garcia', initials: 'PG', riskScore: 89, predictedClaims: 215000, primaryCondition: 'Congestive Heart Failure', intervention: 'Disease Program' },
    { id: '3', name: 'Robert Chen', initials: 'RC', riskScore: 86, predictedClaims: 178000, primaryCondition: 'Diabetes w/ Complications', intervention: 'Medication Review' },
    { id: '4', name: 'Linda Thompson', initials: 'LT', riskScore: 82, predictedClaims: 156000, primaryCondition: 'Multiple Sclerosis', intervention: 'Specialty Rx Review' },
    { id: '5', name: 'Michael Davis', initials: 'MD', riskScore: 78, predictedClaims: 134000, primaryCondition: 'COPD Severe', intervention: 'Pulmonary Rehab' },
]

const riskDistribution = [
    { label: 'Low', percentage: 62, count: 2480 },
    { label: 'Medium', percentage: 24, count: 960 },
    { label: 'High', percentage: 11, count: 440 },
    { label: 'Critical', percentage: 3, count: 120 },
]

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
}

export default function ClaimsPrediction() {
    const [timeRange, setTimeRange] = useState<'3m' | '6m' | '12m'>('6m')

    return (
        <div className="claims-prediction">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    Claims Prediction Engine
                    <span className="ai-badge">
                        <Brain size={14} />
                        AI Powered
                    </span>
                </h1>
                <p className="page-subtitle">
                    Machine learning-driven claims forecasting and high-risk member identification
                </p>
            </motion.div>

            {/* Prediction Stats */}
            <div className="prediction-stats">
                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h4>Predicted Next Quarter</h4>
                    <div className="stat-value">
                        $10.6M
                        <span className="stat-change up">
                            <TrendingUp size={14} />
                            +8.2%
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h4>High-Risk Members</h4>
                    <div className="stat-value">
                        560
                        <span className="stat-change up">
                            <TrendingUp size={14} />
                            +12
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h4>Preventable Claims</h4>
                    <div className="stat-value">
                        $1.8M
                        <span className="stat-change down">
                            <TrendingDown size={14} />
                            -15%
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <h4>Model Accuracy</h4>
                    <div className="stat-value">
                        94.2%
                        <span className="stat-change down">
                            <TrendingUp size={14} style={{ color: '#22c55e' }} />
                            +1.3%
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Prediction Chart */}
            <motion.div
                className="prediction-chart"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2>
                    <Activity size={20} />
                    Claims Forecast
                </h2>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={mockMonthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="month" stroke="#6b7280" />
                            <YAxis tickFormatter={formatCurrency} stroke="#6b7280" />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(17, 24, 39, 0.95)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px'
                                }}
                                formatter={(value: number) => formatCurrency(value)}
                            />
                            <Area
                                type="monotone"
                                dataKey="highRisk"
                                fill="rgba(248, 113, 113, 0.2)"
                                stroke="#f87171"
                                strokeWidth={0}
                            />
                            <Line
                                type="monotone"
                                dataKey="actual"
                                stroke="#14b8a6"
                                strokeWidth={3}
                                dot={{ fill: '#14b8a6', strokeWidth: 0, r: 4 }}
                                connectNulls={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="predicted"
                                stroke="#818cf8"
                                strokeWidth={3}
                                strokeDasharray="5 5"
                                dot={{ fill: '#818cf8', strokeWidth: 0, r: 4 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-legend">
                    <div className="legend-item">
                        <span className="legend-dot actual"></span>
                        Actual Claims
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot predicted"></span>
                        Predicted Claims
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot high-risk"></span>
                        High-Risk Claims
                    </div>
                </div>
            </motion.div>

            {/* Risk Distribution */}
            <div className="risk-distribution">
                <motion.div
                    className="risk-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <h2>
                        <Target size={20} />
                        Risk Distribution
                    </h2>
                    <div className="risk-bars">
                        {riskDistribution.map((risk, index) => (
                            <div key={risk.label} className="risk-bar-row">
                                <span className="risk-label">{risk.label}</span>
                                <div className="risk-bar">
                                    <motion.div
                                        className={`risk-bar-fill ${risk.label.toLowerCase()}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${risk.percentage}%` }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                    />
                                </div>
                                <span className="risk-value">{risk.count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    className="risk-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2>
                        <DollarSign size={20} />
                        Cost Impact by Risk Tier
                    </h2>
                    <div className="risk-bars">
                        <div className="risk-bar-row">
                            <span className="risk-label">Low</span>
                            <div className="risk-bar">
                                <motion.div
                                    className="risk-bar-fill low"
                                    initial={{ width: 0 }}
                                    animate={{ width: '25%' }}
                                    transition={{ delay: 0.5 }}
                                />
                            </div>
                            <span className="risk-value">$2.8M</span>
                        </div>
                        <div className="risk-bar-row">
                            <span className="risk-label">Medium</span>
                            <div className="risk-bar">
                                <motion.div
                                    className="risk-bar-fill medium"
                                    initial={{ width: 0 }}
                                    animate={{ width: '35%' }}
                                    transition={{ delay: 0.55 }}
                                />
                            </div>
                            <span className="risk-value">$3.9M</span>
                        </div>
                        <div className="risk-bar-row">
                            <span className="risk-label">High</span>
                            <div className="risk-bar">
                                <motion.div
                                    className="risk-bar-fill high"
                                    initial={{ width: 0 }}
                                    animate={{ width: '60%' }}
                                    transition={{ delay: 0.6 }}
                                />
                            </div>
                            <span className="risk-value">$4.2M</span>
                        </div>
                        <div className="risk-bar-row">
                            <span className="risk-label">Critical</span>
                            <div className="risk-bar">
                                <motion.div
                                    className="risk-bar-fill critical"
                                    initial={{ width: 0 }}
                                    animate={{ width: '85%' }}
                                    transition={{ delay: 0.65 }}
                                />
                            </div>
                            <span className="risk-value">$5.1M</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* High Risk Members Table */}
            <motion.div
                className="high-risk-members"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
            >
                <h2>
                    <AlertTriangle size={20} />
                    High-Risk Members Requiring Intervention
                </h2>
                <table className="member-risk-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Risk Score</th>
                            <th>Predicted Claims (12mo)</th>
                            <th>Primary Condition</th>
                            <th>Recommended Intervention</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockHighRiskMembers.map((member) => (
                            <motion.tr
                                key={member.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <td>
                                    <div className="member-name">
                                        <div className="member-avatar">{member.initials}</div>
                                        {member.name}
                                    </div>
                                </td>
                                <td>
                                    <span className={`risk-score ${member.riskScore >= 85 ? 'high' : 'medium'}`}>
                                        <AlertTriangle size={12} />
                                        {member.riskScore}
                                    </span>
                                </td>
                                <td>{formatCurrency(member.predictedClaims)}</td>
                                <td>{member.primaryCondition}</td>
                                <td>{member.intervention}</td>
                                <td>
                                    <button className="intervention-btn">
                                        <Eye size={14} style={{ marginRight: '0.35rem' }} />
                                        Review
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Model Insights */}
            <div className="model-insights">
                <motion.div
                    className="insight-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                >
                    <h3>
                        <div className="insight-icon accuracy">
                            <Zap size={16} />
                        </div>
                        Model Accuracy
                    </h3>
                    <div className="insight-value">94.2%</div>
                    <div className="insight-label">Claims prediction accuracy within ±5%</div>
                </motion.div>

                <motion.div
                    className="insight-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3>
                        <div className="insight-icon features">
                            <Brain size={16} />
                        </div>
                        Input Features
                    </h3>
                    <div className="insight-value">127</div>
                    <div className="insight-label">Clinical, demographic, and claims features</div>
                </motion.div>

                <motion.div
                    className="insight-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                >
                    <h3>
                        <div className="insight-icon confidence">
                            <Shield size={16} />
                        </div>
                        Confidence Level
                    </h3>
                    <div className="insight-value">89%</div>
                    <div className="insight-label">Average prediction confidence score</div>
                </motion.div>
            </div>
        </div>
    )
}
