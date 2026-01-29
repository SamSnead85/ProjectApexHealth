import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Briefcase,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Building2,
    Calendar,
    ChevronRight,
    Download,
    RefreshCw,
    Filter,
    Search,
    BarChart3,
    PieChart,
    Target,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Phone,
    Mail,
    MapPin,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Percent,
    Award,
    Star,
    FileText
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './BrokerDashboard.css'

// Types
interface Opportunity {
    id: string
    company: string
    contact: string
    employees: number
    industry: string
    stage: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
    probability: number
    estimatedPremium: number
    estimatedCommission: number
    nextAction: string
    nextActionDate: string
    lastContact: string
}

interface CommissionSummary {
    month: string
    newBusiness: number
    renewal: number
    bonus: number
    total: number
}

interface ClientHealth {
    id: string
    name: string
    employees: number
    annualPremium: number
    renewalDate: string
    healthScore: number
    riskLevel: 'low' | 'medium' | 'high'
    lastEngagement: string
}

interface BrokerMetric {
    label: string
    value: string | number
    change: number
    trend: 'up' | 'down' | 'neutral'
    icon: React.ElementType
    color: string
}

// Mock Data
const brokerMetrics: BrokerMetric[] = [
    { label: 'Active Pipeline', value: 2450000, change: 12.5, trend: 'up', icon: Target, color: '#3B82F6' },
    { label: 'YTD Commission', value: 185400, change: 8.2, trend: 'up', icon: DollarSign, color: '#10B981' },
    { label: 'Book of Business', value: 48, change: 4, trend: 'up', icon: Building2, color: '#8B5CF6' },
    { label: 'Retention Rate', value: '94.2%', change: 1.8, trend: 'up', icon: Award, color: '#F59E0B' },
]

const opportunities: Opportunity[] = [
    { id: 'OPP-001', company: 'TechStart Inc', contact: 'Sarah Chen', employees: 85, industry: 'Technology', stage: 'proposal', probability: 65, estimatedPremium: 425000, estimatedCommission: 21250, nextAction: 'Send revised proposal', nextActionDate: '2024-02-05', lastContact: '2024-01-28' },
    { id: 'OPP-002', company: 'Green Valley Manufacturing', contact: 'Michael Torres', employees: 245, industry: 'Manufacturing', stage: 'negotiation', probability: 80, estimatedPremium: 892000, estimatedCommission: 44600, nextAction: 'Final pricing call', nextActionDate: '2024-02-02', lastContact: '2024-01-30' },
    { id: 'OPP-003', company: 'Urban Retail Group', contact: 'Emily Watson', employees: 420, industry: 'Retail', stage: 'qualified', probability: 40, estimatedPremium: 1250000, estimatedCommission: 62500, nextAction: 'Discovery meeting', nextActionDate: '2024-02-08', lastContact: '2024-01-25' },
    { id: 'OPP-004', company: 'Pacific Financial', contact: 'David Kim', employees: 156, industry: 'Finance', stage: 'prospect', probability: 25, estimatedPremium: 580000, estimatedCommission: 29000, nextAction: 'Initial outreach', nextActionDate: '2024-02-10', lastContact: '' },
    { id: 'OPP-005', company: 'Coastal Healthcare', contact: 'Jennifer Adams', employees: 312, industry: 'Healthcare', stage: 'closed-won', probability: 100, estimatedPremium: 985000, estimatedCommission: 49250, nextAction: 'Implementation kickoff', nextActionDate: '2024-02-15', lastContact: '2024-01-29' },
]

const commissions: CommissionSummary[] = [
    { month: 'Jan', newBusiness: 24500, renewal: 12800, bonus: 5000, total: 42300 },
    { month: 'Feb', newBusiness: 18200, renewal: 15400, bonus: 0, total: 33600 },
    { month: 'Mar', newBusiness: 32100, renewal: 14200, bonus: 8000, total: 54300 },
    { month: 'Apr', newBusiness: 15800, renewal: 16800, bonus: 0, total: 32600 },
    { month: 'May', newBusiness: 28400, renewal: 13500, bonus: 3000, total: 44900 },
    { month: 'Jun', newBusiness: 21600, renewal: 18200, bonus: 0, total: 39800 },
]

const clientHealth: ClientHealth[] = [
    { id: 'CLT-001', name: 'Apex Solutions', employees: 185, annualPremium: 725000, renewalDate: '2024-04-15', healthScore: 92, riskLevel: 'low', lastEngagement: '2024-01-28' },
    { id: 'CLT-002', name: 'Mountain View Corp', employees: 320, annualPremium: 1150000, renewalDate: '2024-03-01', healthScore: 78, riskLevel: 'medium', lastEngagement: '2024-01-15' },
    { id: 'CLT-003', name: 'Sunrise Industries', employees: 95, annualPremium: 385000, renewalDate: '2024-05-30', healthScore: 88, riskLevel: 'low', lastEngagement: '2024-01-25' },
    { id: 'CLT-004', name: 'Digital Dynamics', employees: 210, annualPremium: 820000, renewalDate: '2024-02-28', healthScore: 58, riskLevel: 'high', lastEngagement: '2023-12-10' },
    { id: 'CLT-005', name: 'Harbor Logistics', employees: 450, annualPremium: 1650000, renewalDate: '2024-06-15', healthScore: 85, riskLevel: 'low', lastEngagement: '2024-01-22' },
]

const stageColors: Record<string, string> = {
    'prospect': '#6B7280',
    'qualified': '#3B82F6',
    'proposal': '#F59E0B',
    'negotiation': '#8B5CF6',
    'closed-won': '#10B981',
    'closed-lost': '#EF4444',
}

// Utility functions
const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
}

// Components
const MetricCard = ({ metric, index }: { metric: BrokerMetric; index: number }) => {
    const Icon = metric.icon
    const formattedValue = typeof metric.value === 'number' ? formatCurrency(metric.value) : metric.value

    return (
        <motion.div
            className="broker-metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <div className="broker-metric-card__header">
                <div className="broker-metric-card__icon" style={{ background: `${metric.color}15`, color: metric.color }}>
                    <Icon size={20} />
                </div>
                <div className={`broker-metric-card__trend broker-metric-card__trend--${metric.trend}`}>
                    {metric.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
                </div>
            </div>
            <div className="broker-metric-card__value">{formattedValue}</div>
            <div className="broker-metric-card__label">{metric.label}</div>
        </motion.div>
    )
}

const PipelineCard = ({ opp, index }: { opp: Opportunity; index: number }) => (
    <motion.div
        className="pipeline-card"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
    >
        <div className="pipeline-card__header">
            <div className="pipeline-card__company">
                <Building2 size={16} />
                <span>{opp.company}</span>
            </div>
            <Badge
                variant={opp.stage === 'closed-won' ? 'success' : opp.stage === 'closed-lost' ? 'critical' : 'default'}
                size="sm"
                style={{ background: `${stageColors[opp.stage]}20`, color: stageColors[opp.stage] }}
            >
                {opp.stage.replace('-', ' ')}
            </Badge>
        </div>
        <div className="pipeline-card__details">
            <span><Users size={12} /> {opp.employees} employees</span>
            <span><Briefcase size={12} /> {opp.industry}</span>
            <span><DollarSign size={12} /> {formatCurrency(opp.estimatedPremium)}</span>
        </div>
        <div className="pipeline-card__probability">
            <div className="pipeline-card__probability-bar">
                <motion.div
                    className="pipeline-card__probability-fill"
                    style={{ background: opp.probability >= 70 ? '#10B981' : opp.probability >= 40 ? '#F59E0B' : '#EF4444' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${opp.probability}%` }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                />
            </div>
            <span>{opp.probability}% probability</span>
        </div>
        <div className="pipeline-card__footer">
            <div className="pipeline-card__action">
                <Clock size={12} />
                <span>{opp.nextAction}</span>
            </div>
            <span className="pipeline-card__date">{opp.nextActionDate}</span>
        </div>
    </motion.div>
)

const CommissionChart = ({ data }: { data: CommissionSummary[] }) => {
    const maxTotal = Math.max(...data.map(d => d.total))

    return (
        <div className="commission-chart">
            <div className="commission-chart__bars">
                {data.map((month, index) => (
                    <div key={month.month} className="commission-chart__bar-group">
                        <motion.div
                            className="commission-chart__bar commission-chart__bar--new"
                            style={{ height: `${(month.newBusiness / maxTotal) * 100}%` }}
                            initial={{ height: 0 }}
                            animate={{ height: `${(month.newBusiness / maxTotal) * 100}%` }}
                            transition={{ delay: index * 0.05 }}
                        />
                        <motion.div
                            className="commission-chart__bar commission-chart__bar--renewal"
                            style={{ height: `${(month.renewal / maxTotal) * 100}%` }}
                            initial={{ height: 0 }}
                            animate={{ height: `${(month.renewal / maxTotal) * 100}%` }}
                            transition={{ delay: index * 0.05 + 0.1 }}
                        />
                        {month.bonus > 0 && (
                            <motion.div
                                className="commission-chart__bar commission-chart__bar--bonus"
                                style={{ height: `${(month.bonus / maxTotal) * 100}%` }}
                                initial={{ height: 0 }}
                                animate={{ height: `${(month.bonus / maxTotal) * 100}%` }}
                                transition={{ delay: index * 0.05 + 0.2 }}
                            />
                        )}
                    </div>
                ))}
            </div>
            <div className="commission-chart__labels">
                {data.map(month => (
                    <span key={month.month}>{month.month}</span>
                ))}
            </div>
            <div className="commission-chart__legend">
                <span><span className="dot new" /> New Business</span>
                <span><span className="dot renewal" /> Renewal</span>
                <span><span className="dot bonus" /> Bonus</span>
            </div>
        </div>
    )
}

const ClientHealthRow = ({ client, index }: { client: ClientHealth; index: number }) => (
    <motion.div
        className="client-health-row"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
    >
        <div className="client-health-row__company">
            <span className="client-health-row__name">{client.name}</span>
            <span className="client-health-row__id">{client.id}</span>
        </div>
        <span className="client-health-row__employees">{client.employees}</span>
        <span className="client-health-row__premium">{formatCurrency(client.annualPremium)}</span>
        <span className="client-health-row__renewal">{client.renewalDate}</span>
        <div className="client-health-row__score">
            <div className="client-health-row__score-bar">
                <div
                    className="client-health-row__score-fill"
                    style={{
                        width: `${client.healthScore}%`,
                        background: client.healthScore >= 80 ? '#10B981' : client.healthScore >= 60 ? '#F59E0B' : '#EF4444'
                    }}
                />
            </div>
            <span>{client.healthScore}</span>
        </div>
        <Badge
            variant={client.riskLevel === 'low' ? 'success' : client.riskLevel === 'medium' ? 'warning' : 'critical'}
            size="sm"
        >
            {client.riskLevel}
        </Badge>
        <Button variant="ghost" size="sm">View</Button>
    </motion.div>
)

export function BrokerDashboard() {
    const [selectedStage, setSelectedStage] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')

    const filteredOpportunities = useMemo(() => {
        let opps = opportunities
        if (selectedStage !== 'all') {
            opps = opps.filter(o => o.stage === selectedStage)
        }
        if (searchTerm) {
            opps = opps.filter(o =>
                o.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.contact.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        return opps
    }, [selectedStage, searchTerm])

    const pipelineValue = useMemo(() => {
        return opportunities
            .filter(o => !o.stage.includes('closed'))
            .reduce((sum, o) => sum + (o.estimatedPremium * o.probability / 100), 0)
    }, [])

    return (
        <div className="broker-dashboard">
            {/* Header */}
            <div className="broker-dashboard__header">
                <div className="broker-dashboard__header-content">
                    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        Broker Command Center
                    </motion.h1>
                    <p>Pipeline Management • Commission Tracking • Client Health</p>
                </div>
                <div className="broker-dashboard__header-actions">
                    <Button variant="secondary" icon={<FileText size={16} />}>Reports</Button>
                    <Button variant="primary" icon={<Plus size={16} />}>New Opportunity</Button>
                </div>
            </div>

            {/* Metrics */}
            <section className="broker-dashboard__metrics">
                {brokerMetrics.map((metric, index) => (
                    <MetricCard key={metric.label} metric={metric} index={index} />
                ))}
            </section>

            {/* Main Grid */}
            <div className="broker-dashboard__grid">
                {/* Pipeline */}
                <GlassCard className="broker-dashboard__card broker-dashboard__card--pipeline">
                    <div className="broker-dashboard__card-header">
                        <h3><Target size={18} /> Sales Pipeline</h3>
                        <div className="broker-dashboard__card-stats">
                            <span>Weighted Value: <strong>{formatCurrency(pipelineValue)}</strong></span>
                        </div>
                    </div>
                    <div className="broker-dashboard__filters">
                        <select value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)}>
                            <option value="all">All Stages</option>
                            <option value="prospect">Prospect</option>
                            <option value="qualified">Qualified</option>
                            <option value="proposal">Proposal</option>
                            <option value="negotiation">Negotiation</option>
                            <option value="closed-won">Closed Won</option>
                        </select>
                        <div className="broker-dashboard__search">
                            <Search size={14} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="broker-dashboard__pipeline-list">
                        {filteredOpportunities.map((opp, index) => (
                            <PipelineCard key={opp.id} opp={opp} index={index} />
                        ))}
                    </div>
                </GlassCard>

                {/* Commission Tracking */}
                <GlassCard className="broker-dashboard__card broker-dashboard__card--commissions">
                    <div className="broker-dashboard__card-header">
                        <h3><DollarSign size={18} /> Commission Tracking</h3>
                        <span className="broker-dashboard__ytd">
                            YTD: <strong>{formatCurrency(commissions.reduce((s, c) => s + c.total, 0))}</strong>
                        </span>
                    </div>
                    <CommissionChart data={commissions} />
                </GlassCard>

                {/* Client Health */}
                <GlassCard className="broker-dashboard__card broker-dashboard__card--clients">
                    <div className="broker-dashboard__card-header">
                        <h3><Building2 size={18} /> Client Health Monitor</h3>
                        <Badge variant="warning" size="sm">
                            {clientHealth.filter(c => c.riskLevel === 'high').length} At Risk
                        </Badge>
                    </div>
                    <div className="broker-dashboard__clients-header">
                        <span>Company</span>
                        <span>Employees</span>
                        <span>Premium</span>
                        <span>Renewal</span>
                        <span>Health Score</span>
                        <span>Risk</span>
                        <span></span>
                    </div>
                    <div className="broker-dashboard__clients-list">
                        {clientHealth.map((client, index) => (
                            <ClientHealthRow key={client.id} client={client} index={index} />
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default BrokerDashboard
