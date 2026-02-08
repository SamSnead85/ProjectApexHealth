import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp, TrendingDown, Activity, DollarSign, Users, Clock,
    Brain, Sparkles, BarChart3, PieChart, Calendar, Filter,
    Download, RefreshCw, Settings, ChevronRight, ArrowUpRight
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import { ExecStat, KpiCard, ProgressRing, AiInsight } from '../components/executive'
import { CollapsibleWidget, StatusCard, Timeline } from '../components/widgets'
import { DonutChart, ComparisonBar, StatGrid, InsightSpotlight } from '../components/dataviz'
import { SectionTabs } from '../components/navigation'
import './AdvancedAnalytics.css'

// ============================================================================
// EXECUTIVE ANALYTICS DASHBOARD
// Premium analytics with AI-powered insights
// ============================================================================

const analyticsTabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'claims', label: 'Claims', icon: <Activity size={16} />, badge: 'Live' },
    { id: 'costs', label: 'Cost Analysis', icon: <DollarSign size={16} /> },
    { id: 'network', label: 'Network', icon: <Users size={16} /> },
    { id: 'compliance', label: 'Compliance', icon: <Calendar size={16} /> }
]

const kpiData = [
    {
        title: 'Total Claims Processed',
        value: '24,847',
        trend: { value: 12.5, direction: 'up' as const },
        icon: <Activity size={20} />,
        sparkline: [45, 52, 48, 61, 58, 67, 64, 72, 68, 75, 79, 85]
    },
    {
        title: 'Cost Savings YTD',
        value: '$3.2M',
        trend: { value: 23.4, direction: 'up' as const },
        icon: <DollarSign size={20} />,
        sparkline: [120, 145, 160, 180, 195, 210, 235, 250, 265, 280, 295, 320]
    },
    {
        title: 'Member Satisfaction',
        value: '94.2%',
        trend: { value: 2.8, direction: 'up' as const },
        icon: <Users size={20} />,
        sparkline: [91, 92, 91.5, 92.5, 93, 93.2, 93.8, 94, 93.5, 94, 94.1, 94.2]
    },
    {
        title: 'Avg Processing Time',
        value: '2.1 days',
        trend: { value: 15, direction: 'down' as const },
        icon: <Clock size={20} />,
        sparkline: [3.5, 3.2, 3.0, 2.8, 2.6, 2.5, 2.4, 2.3, 2.2, 2.15, 2.12, 2.1]
    }
]

const processingBreakdown = [
    { label: 'Auto-Approved', value: 68, color: '#10B981' },
    { label: 'Human Review', value: 24, color: '#F59E0B' },
    { label: 'Denied', value: 8, color: '#EF4444' }
]

const recentActivity = [
    { id: '1', title: 'Quarterly compliance report generated', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), status: 'completed' as const },
    { id: '2', title: 'ML model v3.2 deployed to production', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), status: 'completed' as const },
    { id: '3', title: 'Provider network audit in progress', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'current' as const },
    { id: '4', title: 'Annual claims review scheduled', timestamp: new Date('2026-02-15'), status: 'pending' as const }
]

const systemStatus = [
    { name: 'Claims Engine', status: 'healthy' as const, message: 'Processing at 2,400 claims/hour', metric: '99.9% uptime' },
    { name: 'ML Pipeline', status: 'healthy' as const, message: 'Model accuracy at 98.7%', metric: '< 50ms latency' },
    { name: 'Provider API', status: 'warning' as const, message: 'Elevated response times detected', metric: '320ms avg' }
]

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function AdvancedAnalytics() {
    const [activeTab, setActiveTab] = useState('overview')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [apiAnalytics, setApiAnalytics] = useState<any>(null)

    // Fetch analytics from API with mock fallback
    useEffect(() => {
        if (!API_BASE) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/v1/analytics/advanced`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.data) setApiAnalytics(data.data);
                }
            } catch { /* use mock data */ }
        })();
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await new Promise(r => setTimeout(r, 1500))
        setIsRefreshing(false)
    }

    return (
        <div className="advanced-analytics">
            {/* Premium Header */}
            <motion.header
                className="analytics-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="analytics-header__left">
                    <div className="analytics-header__title-row">
                        <h1 className="analytics-header__title">Executive Analytics</h1>
                        <Badge variant="teal" dot pulse>
                            <Brain size={12} /> AI-Powered
                        </Badge>
                    </div>
                    <p className="analytics-header__subtitle">
                        Real-time platform intelligence • Last updated just now
                    </p>
                </div>
                <div className="analytics-header__actions">
                    <Button
                        variant="secondary"
                        icon={<Filter size={16} />}
                    >
                        Filters
                    </Button>
                    <Button
                        variant="secondary"
                        icon={<Download size={16} />}
                    >
                        Export
                    </Button>
                    <Button
                        variant="secondary"
                        icon={<RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />}
                        onClick={handleRefresh}
                    >
                        Refresh
                    </Button>
                </div>
            </motion.header>

            {/* Tab Navigation */}
            <SectionTabs
                tabs={analyticsTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* KPI Cards */}
            <motion.section
                className="analytics-kpis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {kpiData.map((kpi, idx) => (
                    <KpiCard
                        key={kpi.title}
                        title={kpi.title}
                        value={kpi.value}
                        trend={kpi.trend}
                        icon={kpi.icon}
                        sparkline={kpi.sparkline}
                    />
                ))}

            </motion.section>

            {/* AI Insights Bar */}
            <motion.section
                className="analytics-insights-bar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <AiInsight
                    title="Projected Q1 Savings Opportunity"
                    insight="Based on current trends, implementing the recommended automation rules could yield an additional $847K in cost savings by end of Q1."
                    confidence={92}
                    actions={[{ label: 'View Recommendations', onClick: () => { } }]}
                />
            </motion.section>

            {/* Main Analytics Grid */}
            <div className="analytics-grid">
                {/* Left Column */}
                <div className="analytics-grid__main">
                    {/* Processing Overview */}
                    <GlassCard className="analytics-card">
                        <div className="analytics-card__header">
                            <h3 className="analytics-card__title">
                                <PieChart size={18} className="text-teal" />
                                Claims Processing Breakdown
                            </h3>
                            <Badge variant="success">Live</Badge>
                        </div>
                        <div className="analytics-card__content analytics-card__content--row">
                            <DonutChart
                                segments={processingBreakdown}
                                size={180}
                                strokeWidth={24}
                                centerLabel="Total"
                                centerValue="24.8K"
                            />
                            <div className="analytics-legend">
                                {processingBreakdown.map(item => (
                                    <div key={item.label} className="analytics-legend__item">
                                        <span
                                            className="analytics-legend__dot"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="analytics-legend__label">{item.label}</span>
                                        <span className="analytics-legend__value">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Performance Metrics */}
                    <GlassCard className="analytics-card">
                        <div className="analytics-card__header">
                            <h3 className="analytics-card__title">
                                <BarChart3 size={18} className="text-teal" />
                                Performance Metrics
                            </h3>
                        </div>
                        <div className="analytics-card__content">
                            <ComparisonBar
                                label="STP Rate (Straight-Through Processing)"
                                value={94}
                                maxValue={100}
                                comparisonValue={89}
                                format={(v) => `${v}%`}
                                color="#10B981"
                            />
                            <ComparisonBar
                                label="First-Pass Resolution"
                                value={87}
                                maxValue={100}
                                comparisonValue={82}
                                format={(v) => `${v}%`}
                                color="#0D9488"
                            />
                            <ComparisonBar
                                label="Provider Network Utilization"
                                value={76}
                                maxValue={100}
                                comparisonValue={71}
                                format={(v) => `${v}%`}
                                color="#06B6D4"
                            />
                        </div>
                    </GlassCard>

                    {/* Cost Insights */}
                    <div className="analytics-insights-row">
                        <InsightSpotlight
                            variant="positive"
                            title="Preventive Care ROI"
                            description="Wellness program participants show 23% lower claims costs compared to non-participants"
                            metric={{ value: '$420K', label: 'Estimated savings' }}
                            action={{ label: 'View Program Data', onClick: () => { } }}
                        />
                        <InsightSpotlight
                            variant="ai"
                            title="ML Anomaly Detection"
                            description="AI identified 12 claims with unusual patterns requiring human review"
                            metric={{ value: '12', label: 'Flagged claims' }}
                            action={{ label: 'Review Claims', onClick: () => { } }}
                        />
                    </div>
                </div>

                {/* Right Column - Widgets */}
                <div className="analytics-grid__sidebar">
                    {/* System Status */}
                    <CollapsibleWidget
                        title="System Health"
                        icon={<Activity size={18} />}
                        defaultCollapsed={false}
                    >
                        <div className="analytics-status-grid">
                            {systemStatus.map(system => (
                                <StatusCard
                                    key={system.name}
                                    title={system.name}
                                    status={system.status}
                                    message={system.message}
                                    metrics={[{ label: '', value: system.metric }]}
                                />
                            ))}
                        </div>
                    </CollapsibleWidget>

                    {/* Recent Activity */}
                    <CollapsibleWidget
                        title="Recent Activity"
                        icon={<Clock size={18} />}
                        defaultCollapsed={false}
                    >
                        <Timeline items={recentActivity} />
                    </CollapsibleWidget>

                    {/* Quick Stats */}
                    <GlassCard className="analytics-card analytics-card--compact">
                        <div className="analytics-card__header">
                            <h3 className="analytics-card__title">
                                <Sparkles size={18} className="text-teal" />
                                AI Performance
                            </h3>
                        </div>
                        <div className="analytics-progress-grid">
                            <ProgressRing
                                progress={98.7}
                                size={80}
                                strokeWidth={8}
                                label="Model Accuracy"
                            />
                            <ProgressRing
                                progress={94}
                                size={80}
                                strokeWidth={8}
                                label="Auto-Approval Rate"
                            />
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}

export default AdvancedAnalytics
