import { useState } from 'react'
import { useNavigation } from '../context/NavigationContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Briefcase,
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    Eye,
    MoreHorizontal,
    Plus,
    FileText,
    Calculator,
    UserPlus,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Brain,
    Sparkles,
    Zap,
    Target,
    Shield,
    Activity,
    AlertTriangle,
    ChevronRight,
    BarChart3,
    PieChart
} from 'lucide-react'
import { GlassCard, Button, Badge, MetricCard } from '../components/common'
import './BrokerPortal.css'

// ============================================
// PREMIUM MOCK DATA - Broker Command Center
// ============================================

const bookOfBusiness = [
    { id: 1, company: 'Apex Solutions', employees: 165, lives: 412, premium: 720000, health: 98, renewalRisk: 'low', status: 'active', renewal: '2024-04-15', trend: 5.2 },
    { id: 2, company: 'Mountain View Corp', employees: 205, lives: 520, premium: 1180000, health: 92, renewalRisk: 'low', status: 'active', renewal: '2024-02-01', trend: -2.1 },
    { id: 3, company: 'Sunrise Industries', employees: 89, lives: 234, premium: 398000, health: 78, renewalRisk: 'medium', status: 'active', renewal: '2024-03-15', trend: 0 },
    { id: 4, company: 'TechFlow Systems', employees: 312, lives: 890, premium: 1620000, health: 95, renewalRisk: 'low', status: 'active', renewal: '2024-06-01', trend: 8.4 },
    { id: 5, company: 'Harbor Logistics', employees: 456, lives: 1230, premium: 2100000, health: 88, renewalRisk: 'low', status: 'active', renewal: '2024-05-15', trend: 3.2 },
    { id: 6, company: 'Granite Packaging', employees: 78, lives: 189, premium: 340000, health: 62, renewalRisk: 'high', status: 'at-risk', renewal: '2024-02-28', trend: -5.8 },
]

const clientHealthMonitor = [
    { company: 'Apex Solutions', health: 98, premium: '$720K', status: 'healthy', action: 'none' },
    { company: 'Mountain View Corp', health: 92, premium: '$1.18M', status: 'healthy', action: 'upsell' },
    { company: 'Granite Packaging', health: 62, premium: '$340K', status: 'at-risk', action: 'urgent' },
]

const salesPipeline = [
    { stage: 'Lead', count: 12, value: 1850000, color: '#6366f1' },
    { stage: 'Qualified', count: 8, value: 1420000, color: '#8b5cf6' },
    { stage: 'Proposal', count: 5, value: 980000, color: '#a78bfa' },
    { stage: 'Negotiation', count: 3, value: 620000, color: '#06b6d4' },
    { stage: 'Closed', count: 2, value: 340000, color: '#10b981' },
]

const aiRecommendations = [
    { type: 'upsell', client: 'TechFlow Systems', action: 'Add Dental Vision Bundle', impact: '+$145K/yr', confidence: 91 },
    { type: 'retention', client: 'Granite Packaging', action: 'Schedule retention call', impact: 'Prevent $340K churn', confidence: 87 },
    { type: 'opportunity', client: 'Mountain View Corp', action: 'Propose HSA upgrade', impact: '+$42K/yr', confidence: 84 },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount}`
}

const getHealthColor = (health: number) => {
    if (health >= 90) return '#10b981'
    if (health >= 70) return '#f59e0b'
    return '#ef4444'
}

const getRiskBadge = (risk: string) => {
    switch (risk) {
        case 'low': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', text: 'Low Risk' }
        case 'medium': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', text: 'Medium' }
        case 'high': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', text: 'High Risk' }
        default: return { bg: 'rgba(255,255,255,0.05)', color: '#94a3b8', text: 'Unknown' }
    }
}

// ============================================
// COMPONENT
// ============================================

export function BrokerPortal() {
    const { navigate } = useNavigation()
    const [commissionPeriod, setCommissionPeriod] = useState<'mtd' | 'ytd'>('ytd')
    const [showMenu, setShowMenu] = useState<number | null>(null)

    const totalPipelineValue = salesPipeline.reduce((sum, s) => sum + s.value, 0)

    return (
        <div className="broker-command-center">
            {/* Premium Header */}
            <motion.header
                className="bcc__header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="bcc__header-left">
                    <div className="bcc__icon-container">
                        <Briefcase size={28} />
                        <div className="bcc__icon-pulse" />
                    </div>
                    <div>
                        <h1 className="bcc__title">Broker Command Center</h1>
                        <div className="bcc__subtitle">
                            <span>Pipeline Management • Commission Tracking • Client Health</span>
                        </div>
                    </div>
                </div>
                <div className="bcc__header-badges">
                    <div className="bcc__badge bcc__badge--live">
                        Live Pipeline
                    </div>
                    <div className="bcc__badge">
                        <Target size={14} />
                        94.2% Retention
                    </div>
                </div>
                <div className="bcc__header-actions">
                    <Button variant="ghost" size="sm">
                        <FileText size={16} />
                        Reports
                    </Button>
                    <Button variant="primary" size="sm">
                        <Plus size={16} />
                        New Opportunity
                    </Button>
                </div>
            </motion.header>

            {/* Premium Metrics Grid */}
            <div className="bcc__metrics">
                {[
                    { label: 'Active Premium', value: '$2.5M', change: '+12.4%', isUp: true, icon: DollarSign, color: '#10b981' },
                    { label: 'YTD Commission', value: '$185K', change: '+8.2%', isUp: true, icon: TrendingUp, color: '#06b6d4' },
                    { label: 'Book of Business', value: '48', change: '+3', isUp: true, icon: Briefcase, color: '#8b5cf6' },
                    { label: 'Retention Rate', value: '94.2%', change: '+1.8%', isUp: true, icon: Shield, color: '#f59e0b' },
                    { label: 'Pipeline Value', value: formatCurrency(totalPipelineValue), change: '+$420K', isUp: true, icon: Target, color: '#6366f1' },
                    { label: 'At-Risk Clients', value: '3', change: '-2', isUp: true, icon: AlertTriangle, color: '#ef4444' },
                ].map((metric, i) => (
                    <motion.div
                        key={metric.label}
                        className="bcc__metric-card"
                        style={{ '--glow-color': metric.color } as any}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                    >
                        <div className="bcc__metric-glow" />
                        <div className="bcc__metric-header">
                            <div className="bcc__metric-icon" style={{ background: `${metric.color}15`, color: metric.color }}>
                                <metric.icon size={20} />
                            </div>
                            <span className={`bcc__metric-trend bcc__metric-trend--up`}>
                                {metric.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {metric.change}
                            </span>
                        </div>
                        <div className="bcc__metric-value">{metric.value}</div>
                        <div className="bcc__metric-label">{metric.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="bcc__grid">
                {/* Left Column */}
                <div className="bcc__main">
                    {/* Sales Pipeline Visualization */}
                    <motion.div
                        className="bcc__pipeline"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="bcc__pipeline-header">
                            <div className="bcc__pipeline-title">
                                <BarChart3 size={20} />
                                <h2>Sales Pipeline</h2>
                                <span className="bcc__ai-tag">
                                    <Sparkles size={10} />
                                    AI Scored
                                </span>
                            </div>
                            <div className="bcc__pipeline-total">
                                <span>Total Value</span>
                                <strong>{formatCurrency(totalPipelineValue)}</strong>
                            </div>
                        </div>
                        <div className="bcc__pipeline-funnel">
                            {salesPipeline.map((stage, i) => {
                                const width = 100 - (i * 15)
                                return (
                                    <motion.div
                                        key={stage.stage}
                                        className="bcc__pipeline-stage"
                                        initial={{ opacity: 0, scaleX: 0 }}
                                        animate={{ opacity: 1, scaleX: 1 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                    >
                                        <div
                                            className="bcc__pipeline-bar"
                                            style={{
                                                width: `${width}%`,
                                                background: `linear-gradient(90deg, ${stage.color}40 0%, ${stage.color}10 100%)`,
                                                borderColor: stage.color
                                            }}
                                        >
                                            <span className="bcc__pipeline-stage-name">{stage.stage}</span>
                                            <div className="bcc__pipeline-stage-stats">
                                                <span className="bcc__pipeline-count">{stage.count} deals</span>
                                                <span className="bcc__pipeline-value" style={{ color: stage.color }}>{formatCurrency(stage.value)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>

                    {/* Book of Business Table */}
                    <motion.div
                        className="bcc__book"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="bcc__book-header">
                            <div className="bcc__book-title">
                                <Users size={20} />
                                <h2>Book of Business</h2>
                                <Badge variant="default">{bookOfBusiness.length} clients</Badge>
                            </div>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>
                        <table className="bcc__book-table">
                            <thead>
                                <tr>
                                    <th>Client</th>
                                    <th>Employees</th>
                                    <th>Premium</th>
                                    <th>Health</th>
                                    <th>Risk</th>
                                    <th>Renewal</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookOfBusiness.map((client, i) => {
                                    const riskBadge = getRiskBadge(client.renewalRisk)
                                    return (
                                        <motion.tr
                                            key={client.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 + i * 0.03 }}
                                            className={client.status === 'at-risk' ? 'bcc__book-row--at-risk' : ''}
                                        >
                                            <td>
                                                <div className="bcc__book-client">
                                                    <div className="bcc__book-client-icon" style={{ background: i % 2 === 0 ? 'rgba(6,182,212,0.15)' : 'rgba(139,92,246,0.15)' }}>
                                                        <Briefcase size={16} style={{ color: i % 2 === 0 ? '#06b6d4' : '#8b5cf6' }} />
                                                    </div>
                                                    <div className="bcc__book-client-info">
                                                        <span className="bcc__book-client-name">{client.company}</span>
                                                        <span className="bcc__book-client-lives">{client.lives} lives</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="bcc__book-number">{client.employees.toLocaleString()}</td>
                                            <td>
                                                <div className="bcc__book-premium">
                                                    <span>{formatCurrency(client.premium)}</span>
                                                    {client.trend !== 0 && (
                                                        <span className={`bcc__book-trend ${client.trend > 0 ? 'positive' : 'negative'}`}>
                                                            {client.trend > 0 ? '+' : ''}{client.trend}%
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="bcc__book-health">
                                                    <div
                                                        className="bcc__book-health-ring"
                                                        style={{
                                                            background: `conic-gradient(${getHealthColor(client.health)} ${client.health * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
                                                        }}
                                                    >
                                                        <span>{client.health}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className="bcc__book-risk"
                                                    style={{ background: riskBadge.bg, color: riskBadge.color }}
                                                >
                                                    {riskBadge.text}
                                                </span>
                                            </td>
                                            <td className="bcc__book-date">{client.renewal}</td>
                                            <td>
                                                <div className="bcc__book-actions">
                                                    <button
                                                        className="bcc__book-action"
                                                        onClick={() => navigate(`/broker/clients/${client.id}`)}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="bcc__book-action"
                                                        onClick={() => setShowMenu(showMenu === client.id ? null : client.id)}
                                                    >
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </motion.div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="bcc__sidebar">
                    {/* AI Recommendations Panel */}
                    <motion.div
                        className="bcc__ai-panel"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="bcc__ai-header">
                            <div className="bcc__ai-icon">
                                <Brain size={22} />
                            </div>
                            <div>
                                <h3>AI Recommendations</h3>
                                <p>Powered by Intellisure™</p>
                            </div>
                        </div>
                        {aiRecommendations.map((rec, i) => (
                            <motion.div
                                key={i}
                                className={`bcc__ai-rec bcc__ai-rec--${rec.type}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                            >
                                <div className="bcc__ai-rec-header">
                                    <span className="bcc__ai-rec-type">{rec.type}</span>
                                    <span className="bcc__ai-rec-confidence">{rec.confidence}%</span>
                                </div>
                                <div className="bcc__ai-rec-client">{rec.client}</div>
                                <div className="bcc__ai-rec-action">{rec.action}</div>
                                <div className="bcc__ai-rec-impact">
                                    <Zap size={12} />
                                    {rec.impact}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Commission Widget */}
                    <motion.div
                        className="bcc__commission"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="bcc__commission-header">
                            <h3>
                                <DollarSign size={18} />
                                Commission Tracking
                            </h3>
                            <div className="bcc__commission-toggle">
                                <button
                                    className={commissionPeriod === 'mtd' ? 'active' : ''}
                                    onClick={() => setCommissionPeriod('mtd')}
                                >
                                    MTD
                                </button>
                                <button
                                    className={commissionPeriod === 'ytd' ? 'active' : ''}
                                    onClick={() => setCommissionPeriod('ytd')}
                                >
                                    YTD
                                </button>
                            </div>
                        </div>
                        <motion.div
                            className="bcc__commission-amount"
                            key={commissionPeriod}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            {commissionPeriod === 'ytd' ? '$185,420' : '$24,680'}
                        </motion.div>
                        <div className="bcc__commission-change">
                            <TrendingUp size={16} />
                            <span>+{commissionPeriod === 'ytd' ? '12.4' : '8.2'}% vs last {commissionPeriod === 'ytd' ? 'year' : 'month'}</span>
                        </div>
                        <div className="bcc__commission-breakdown">
                            <div className="bcc__commission-item">
                                <span>Medical</span>
                                <span>{commissionPeriod === 'ytd' ? '$124,200' : '$16,500'}</span>
                            </div>
                            <div className="bcc__commission-item">
                                <span>Dental</span>
                                <span>{commissionPeriod === 'ytd' ? '$38,600' : '$5,120'}</span>
                            </div>
                            <div className="bcc__commission-item">
                                <span>Vision</span>
                                <span>{commissionPeriod === 'ytd' ? '$22,620' : '$3,060'}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        className="bcc__quick-actions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <h3>Quick Actions</h3>
                        <div className="bcc__quick-grid">
                            {[
                                { icon: Calculator, label: 'New Quote' },
                                { icon: UserPlus, label: 'Add Client' },
                                { icon: FileText, label: 'Commissions' },
                                { icon: ArrowUpRight, label: 'Reports' },
                            ].map((action, i) => (
                                <button key={i} className="bcc__quick-btn">
                                    <div className="bcc__quick-icon">
                                        <action.icon size={20} />
                                    </div>
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default BrokerPortal
