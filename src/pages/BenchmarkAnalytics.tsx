import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts'
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Calendar,
    Building2,
    Users,
    DollarSign,
    Sparkles,
    ArrowUpRight,
    Target
} from 'lucide-react'
import './BenchmarkAnalytics.css'

const trendData = [
    { month: 'Jul', you: 425, benchmark: 485, top25: 380 },
    { month: 'Aug', you: 438, benchmark: 490, top25: 375 },
    { month: 'Sep', you: 415, benchmark: 495, top25: 370 },
    { month: 'Oct', you: 398, benchmark: 488, top25: 368 },
    { month: 'Nov', you: 385, benchmark: 482, top25: 365 },
    { month: 'Dec', you: 372, benchmark: 478, top25: 362 },
    { month: 'Jan', you: 358, benchmark: 475, top25: 358 }
]

const metrics = [
    { name: 'PMPM Cost', you: '$425', benchmark: '$475', percentile: 78, rank: 'top', trend: 'positive' },
    { name: 'Claims per 1000', you: '312', benchmark: '348', percentile: 72, rank: 'top', trend: 'positive' },
    { name: 'Medical Loss Ratio', you: '82.3%', benchmark: '85.1%', percentile: 65, rank: 'mid', trend: 'neutral' },
    { name: 'Rx Utilization', you: '68%', benchmark: '71%', percentile: 58, rank: 'mid', trend: 'positive' },
    { name: 'ER Visit Rate', you: '145', benchmark: '168', percentile: 81, rank: 'top', trend: 'positive' },
    { name: 'Preventive Care', you: '78%', benchmark: '72%', percentile: 85, rank: 'top', trend: 'positive' }
]

const BenchmarkAnalytics = () => {
    const [timeframe, setTimeframe] = useState('12m')
    const [industry, setIndustry] = useState('all')

    return (
        <motion.div
            className="benchmark-analytics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <h1>Benchmark Analytics</h1>
            <p>Compare your performance against industry standards and top performers</p>

            {/* Controls */}
            <div className="benchmark-header">
                <div className="benchmark-controls">
                    <div className="benchmark-select">
                        <Calendar size={16} />
                        <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                            <option value="3m">Last 3 Months</option>
                            <option value="6m">Last 6 Months</option>
                            <option value="12m">Last 12 Months</option>
                            <option value="ytd">Year to Date</option>
                        </select>
                    </div>
                    <div className="benchmark-select">
                        <Building2 size={16} />
                        <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                            <option value="all">All Industries</option>
                            <option value="tech">Technology</option>
                            <option value="finance">Finance</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="retail">Retail</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Scorecards */}
            <div className="benchmark-scorecard">
                <motion.div
                    className="scorecard-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="scorecard-header">
                        <div>
                            <div className="scorecard-label">Overall Percentile</div>
                            <div className="scorecard-value">78th</div>
                        </div>
                        <span className="scorecard-indicator positive">
                            <TrendingUp size={14} />
                            +5
                        </span>
                    </div>
                    <div className="scorecard-comparison">
                        <div className="comparison-item">
                            <div className="comparison-label">Industry Avg</div>
                            <div className="comparison-value">50th</div>
                        </div>
                        <div className="comparison-item">
                            <div className="comparison-label">Top 25%</div>
                            <div className="comparison-value highlight">75th</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="scorecard-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="scorecard-header">
                        <div>
                            <div className="scorecard-label">PMPM Cost</div>
                            <div className="scorecard-value">$358</div>
                        </div>
                        <span className="scorecard-indicator positive">
                            <TrendingDown size={14} />
                            -$67
                        </span>
                    </div>
                    <div className="scorecard-comparison">
                        <div className="comparison-item">
                            <div className="comparison-label">Benchmark</div>
                            <div className="comparison-value">$475</div>
                        </div>
                        <div className="comparison-item">
                            <div className="comparison-label">Savings</div>
                            <div className="comparison-value highlight">24.6%</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="scorecard-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="scorecard-header">
                        <div>
                            <div className="scorecard-label">Quality Score</div>
                            <div className="scorecard-value">4.2★</div>
                        </div>
                        <span className="scorecard-indicator positive">
                            <TrendingUp size={14} />
                            +0.3
                        </span>
                    </div>
                    <div className="scorecard-comparison">
                        <div className="comparison-item">
                            <div className="comparison-label">Benchmark</div>
                            <div className="comparison-value">3.8★</div>
                        </div>
                        <div className="comparison-item">
                            <div className="comparison-label">Top 10%</div>
                            <div className="comparison-value highlight">4.5★</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="scorecard-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <div className="scorecard-header">
                        <div>
                            <div className="scorecard-label">Member Satisfaction</div>
                            <div className="scorecard-value">91%</div>
                        </div>
                        <span className="scorecard-indicator positive">
                            <TrendingUp size={14} />
                            +4%
                        </span>
                    </div>
                    <div className="scorecard-comparison">
                        <div className="comparison-item">
                            <div className="comparison-label">Benchmark</div>
                            <div className="comparison-value">84%</div>
                        </div>
                        <div className="comparison-item">
                            <div className="comparison-label">Ranking</div>
                            <div className="comparison-value highlight">#12</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="benchmark-charts">
                <motion.div
                    className="chart-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="chart-panel-header">
                        <div>
                            <div className="chart-panel-title">PMPM Cost Trend vs Benchmark</div>
                            <div className="chart-panel-subtitle">Your performance compared to industry average</div>
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <div className="legend-dot" style={{ background: '#3B82F6' }} />
                                Your Cost
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot" style={{ background: '#6B7280' }} />
                                Benchmark
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot" style={{ background: '#10B981' }} />
                                Top 25%
                            </div>
                        </div>
                    </div>
                    <div className="chart-area">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} domain={[300, 550]} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(20,22,26,0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="benchmark"
                                    stroke="#6B7280"
                                    fill="#6B7280"
                                    fillOpacity={0.1}
                                    strokeDasharray="5 5"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="top25"
                                    stroke="#10B981"
                                    fill="#10B981"
                                    fillOpacity={0.1}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="you"
                                    stroke="#3B82F6"
                                    fill="#3B82F6"
                                    fillOpacity={0.3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    className="chart-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <div className="chart-panel-header">
                        <div>
                            <div className="chart-panel-title">Your Percentile</div>
                            <div className="chart-panel-subtitle">Overall industry ranking</div>
                        </div>
                    </div>
                    <div className="percentile-gauge">
                        <div className="gauge-circle">
                            <div className="gauge-fill" style={{ '--fill-angle': '280deg' } as React.CSSProperties} />
                            <div className="gauge-center">
                                <span className="gauge-value">78th</span>
                                <span className="gauge-label">percentile</span>
                            </div>
                        </div>
                        <div className="gauge-markers">
                            <span>0th</span>
                            <span>50th</span>
                            <span>100th</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Benchmark Table */}
            <motion.div
                className="benchmark-table-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="table-header">
                    <span className="table-title">Detailed Metric Comparison</span>
                </div>
                <table className="benchmark-table">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Your Value</th>
                            <th>Benchmark</th>
                            <th>Performance</th>
                            <th>Percentile</th>
                            <th>Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {metrics.map((metric, index) => (
                            <tr key={metric.name}>
                                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{metric.name}</td>
                                <td style={{ fontWeight: 600, color: '#3B82F6' }}>{metric.you}</td>
                                <td>{metric.benchmark}</td>
                                <td>
                                    <div className="metric-bar">
                                        <div className="bar-track">
                                            <div
                                                className={`bar-fill ${metric.trend}`}
                                                style={{ width: `${metric.percentile}%` }}
                                            />
                                            <div className="bar-marker" style={{ left: '50%' }} />
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`rank-badge ${metric.rank}`}>
                                        {metric.percentile}
                                    </span>
                                </td>
                                <td>
                                    {metric.trend === 'positive' && <TrendingUp size={16} color="#10B981" />}
                                    {metric.trend === 'negative' && <TrendingDown size={16} color="#EF4444" />}
                                    {metric.trend === 'neutral' && <Minus size={16} color="#6B7280" />}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* AI Insights */}
            <motion.div
                className="insights-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="insights-header">
                    <Sparkles size={20} />
                    <h3>AI-Generated Insights</h3>
                </div>
                <div className="insights-grid">
                    <div className="insight-card">
                        <h4>🎯 Top Opportunity</h4>
                        <p>Improving pharmacy generic substitution could save $12 PMPM based on top-quartile performance.</p>
                    </div>
                    <div className="insight-card">
                        <h4>📈 Positive Trend</h4>
                        <p>Your ER utilization has decreased 18% YoY, outpacing the industry improvement of 8%.</p>
                    </div>
                    <div className="insight-card">
                        <h4>⚡ Quick Win</h4>
                        <p>Implementing telehealth for minor care could improve member satisfaction by 5+ points.</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default BenchmarkAnalytics
