import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Phone, PhoneCall, PhoneOff, PhoneIncoming, Headphones,
    Clock, Users, TrendingUp, TrendingDown, AlertTriangle,
    CheckCircle2, XCircle, Activity, BarChart3, Timer,
    UserCheck, UserX, Coffee, Wifi, WifiOff, Shield,
    ArrowUpRight, ArrowDownRight, Target, Gauge, Star,
    MessageSquare, FileText, Download, RefreshCw, Eye
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { exportToCSV } from '../utils/exportData'
import './CallCenterDashboard.css'

// ============================================================================
// CALL CENTER DASHBOARD - Operations Overview
// KPIs, agent status, queue management, and call analytics
// ============================================================================

interface AgentStatus {
    id: string
    name: string
    role: string
    status: 'available' | 'on_call' | 'break' | 'offline'
    activeSince: string
    callsHandled: number
    avgHandleTime: string
    satisfaction: number
}

interface EscalationLog {
    id: string
    caller: string
    reason: string
    agent: string
    time: string
    priority: 'high' | 'medium' | 'low'
    status: 'pending' | 'assigned' | 'resolved'
}

const hourlyVolume = [
    { hour: '8 AM', calls: 45, ai: 38, human: 7 },
    { hour: '9 AM', calls: 120, ai: 102, human: 18 },
    { hour: '10 AM', calls: 185, ai: 157, human: 28 },
    { hour: '11 AM', calls: 210, ai: 178, human: 32 },
    { hour: '12 PM', calls: 165, ai: 140, human: 25 },
    { hour: '1 PM', calls: 190, ai: 162, human: 28 },
    { hour: '2 PM', calls: 220, ai: 187, human: 33 },
    { hour: '3 PM', calls: 195, ai: 166, human: 29 },
    { hour: '4 PM', calls: 175, ai: 149, human: 26 },
    { hour: '5 PM', calls: 130, ai: 110, human: 20 },
]

const callReasons = [
    { name: 'Benefits Inquiry', value: 28, color: '#14b8a6' },
    { name: 'Claim Status', value: 22, color: '#3b82f6' },
    { name: 'Prior Auth', value: 18, color: '#8b5cf6' },
    { name: 'Billing/Payment', value: 15, color: '#f59e0b' },
    { name: 'Provider Search', value: 10, color: '#06b6d4' },
    { name: 'Other', value: 7, color: '#64748b' },
]

const queueData = [
    { time: '10 min ago', depth: 12 },
    { time: '8 min ago', depth: 18 },
    { time: '6 min ago', depth: 15 },
    { time: '4 min ago', depth: 22 },
    { time: '2 min ago', depth: 8 },
    { time: 'Now', depth: 5 },
]

const agents: AgentStatus[] = [
    { id: 'A1', name: 'AI Agent - Aria', role: 'Member Service', status: 'on_call', activeSince: '8:00 AM', callsHandled: 156, avgHandleTime: '3:45', satisfaction: 4.8 },
    { id: 'A2', name: 'AI Agent - Marcus', role: 'Provider Service', status: 'on_call', activeSince: '8:00 AM', callsHandled: 98, avgHandleTime: '5:12', satisfaction: 4.6 },
    { id: 'A3', name: 'AI Agent - Sophia', role: 'Member Service', status: 'on_call', activeSince: '8:00 AM', callsHandled: 171, avgHandleTime: '3:22', satisfaction: 4.9 },
    { id: 'A4', name: 'Sarah Johnson', role: 'Tier 2 Support', status: 'on_call', activeSince: '9:00 AM', callsHandled: 23, avgHandleTime: '8:45', satisfaction: 4.5 },
    { id: 'A5', name: 'Mike Torres', role: 'Tier 2 Support', status: 'available', activeSince: '9:00 AM', callsHandled: 19, avgHandleTime: '9:10', satisfaction: 4.3 },
    { id: 'A6', name: 'Jennifer Lee', role: 'Supervisor', status: 'available', activeSince: '8:30 AM', callsHandled: 8, avgHandleTime: '12:30', satisfaction: 4.7 },
    { id: 'A7', name: 'David Kim', role: 'Tier 2 Support', status: 'break', activeSince: '9:00 AM', callsHandled: 15, avgHandleTime: '7:55', satisfaction: 4.4 },
    { id: 'A8', name: 'Lisa Wang', role: 'Tier 1 Support', status: 'offline', activeSince: '—', callsHandled: 0, avgHandleTime: '—', satisfaction: 0 },
]

const escalations: EscalationLog[] = [
    { id: 'ESC-401', caller: 'James Wilson', reason: 'Claim denial - requesting supervisor review', agent: 'Sarah Johnson', time: '2 min ago', priority: 'high', status: 'assigned' },
    { id: 'ESC-400', caller: 'Amanda Foster', reason: 'Complex billing dispute over $4,200', agent: 'Unassigned', time: '5 min ago', priority: 'high', status: 'pending' },
    { id: 'ESC-399', caller: 'Dr. Patel', reason: 'Urgent emergency pre-certification', agent: 'Jennifer Lee', time: '12 min ago', priority: 'high', status: 'assigned' },
    { id: 'ESC-398', caller: 'Robert Chen', reason: 'Network adequacy complaint', agent: 'Mike Torres', time: '18 min ago', priority: 'medium', status: 'assigned' },
    { id: 'ESC-397', caller: 'Karen Davis', reason: 'Prescription coverage appeal', agent: 'David Kim', time: '25 min ago', priority: 'medium', status: 'resolved' },
    { id: 'ESC-396', caller: 'Maria Gonzalez', reason: 'Translation service unavailable during call', agent: 'AI Agent - Sophia', time: '32 min ago', priority: 'low', status: 'resolved' },
    { id: 'ESC-395', caller: 'Thomas Wright', reason: 'Emergency room pre-auth timeout', agent: 'Sarah Johnson', time: '45 min ago', priority: 'high', status: 'resolved' },
    { id: 'ESC-394', caller: 'Lisa Park', reason: 'Duplicate billing charges on EOB', agent: 'Mike Torres', time: '1 hr ago', priority: 'medium', status: 'resolved' },
    { id: 'ESC-393', caller: 'Dr. Williams', reason: 'Formulary exception request', agent: 'Jennifer Lee', time: '1.5 hr ago', priority: 'medium', status: 'resolved' },
    { id: 'ESC-392', caller: 'Susan Miller', reason: 'Provider directory inaccuracy', agent: 'David Kim', time: '2 hr ago', priority: 'low', status: 'resolved' },
]

export default function CallCenterDashboard() {
    const initialMetrics = {
        totalCallsToday: 1847,
        activeCalls: 24,
        waitingQueue: 8,
        avgWaitTime: '0:12',
        avgHandleTime: '4:32',
        abandonRate: 2.3,
        csatScore: 4.7,
        resolution: 87.5
    }

    const [metrics, setMetrics] = useState(initialMetrics)
    const [refreshing, setRefreshing] = useState(false)
    const [agentList, setAgentList] = useState<AgentStatus[]>(agents)
    const [selectedAgent, setSelectedAgent] = useState<AgentStatus | null>(null)
    const [showAllEscalations, setShowAllEscalations] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                totalCallsToday: prev.totalCallsToday + Math.floor(Math.random() * 3),
                activeCalls: Math.max(10, prev.activeCalls + Math.floor(Math.random() * 3) - 1),
                waitingQueue: Math.max(0, prev.waitingQueue + Math.floor(Math.random() * 3) - 1),
                abandonRate: +(Math.max(0.5, prev.abandonRate + (Math.random() - 0.5) * 0.3)).toFixed(1),
                csatScore: +(Math.min(5, Math.max(4.0, prev.csatScore + (Math.random() - 0.5) * 0.1))).toFixed(1),
                resolution: +(Math.min(100, Math.max(80, prev.resolution + (Math.random() - 0.5) * 0.5))).toFixed(1)
            }))
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const handleRefresh = () => {
        setRefreshing(true)
        setMetrics(initialMetrics)
        setAgentList(agents)
        setSelectedAgent(null)
        setTimeout(() => setRefreshing(false), 1500)
    }

    const handleExportReport = () => {
        const reportData = agentList.map(a => ({
            ID: a.id,
            Name: a.name,
            Role: a.role,
            Status: a.status,
            'Calls Handled': a.callsHandled,
            'Avg Handle Time': a.avgHandleTime,
            CSAT: a.satisfaction
        }))
        exportToCSV(reportData, 'call-center-report')
    }

    const handleSetAgentStatus = (agentId: string, newStatus: AgentStatus['status']) => {
        setAgentList(prev => prev.map(a =>
            a.id === agentId ? { ...a, status: newStatus } : a
        ))
        setSelectedAgent(prev => prev?.id === agentId ? { ...prev, status: newStatus } : prev)
    }

    const getStatusIcon = (status: AgentStatus['status']) => {
        switch (status) {
            case 'available': return <UserCheck size={14} />
            case 'on_call': return <PhoneCall size={14} />
            case 'break': return <Coffee size={14} />
            case 'offline': return <WifiOff size={14} />
        }
    }

    const getStatusBadge = (status: AgentStatus['status']) => {
        switch (status) {
            case 'available': return <Badge variant="success" size="sm" dot>Available</Badge>
            case 'on_call': return <Badge variant="info" size="sm" pulse dot>On Call</Badge>
            case 'break': return <Badge variant="warning" size="sm" dot>Break</Badge>
            case 'offline': return <Badge variant="default" size="sm" dot>Offline</Badge>
        }
    }

    const getPriorityBadge = (priority: EscalationLog['priority']) => {
        switch (priority) {
            case 'high': return <Badge variant="critical" size="sm">High</Badge>
            case 'medium': return <Badge variant="warning" size="sm">Medium</Badge>
            case 'low': return <Badge variant="info" size="sm">Low</Badge>
        }
    }

    const getEscStatusBadge = (status: EscalationLog['status']) => {
        switch (status) {
            case 'pending': return <Badge variant="warning" size="sm" icon={<Clock size={10} />}>Pending</Badge>
            case 'assigned': return <Badge variant="info" size="sm" icon={<UserCheck size={10} />}>Assigned</Badge>
            case 'resolved': return <Badge variant="success" size="sm" icon={<CheckCircle2 size={10} />}>Resolved</Badge>
        }
    }

    const agentStatusCounts = {
        available: agentList.filter(a => a.status === 'available').length,
        onCall: agentList.filter(a => a.status === 'on_call').length,
        onBreak: agentList.filter(a => a.status === 'break').length,
        offline: agentList.filter(a => a.status === 'offline').length,
    }

    const displayedEscalations = showAllEscalations ? escalations : escalations.slice(0, 5)

    // SLA compliance calculation
    const slaCompliance = 94.7

    return (
        <div className="call-center-dashboard">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="ccd-header">
                    <div>
                        <h1 className="ccd-title">
                            <Headphones size={28} />
                            Call Center Dashboard
                            <Badge variant="success" pulse icon={<Activity size={10} />}>Operational</Badge>
                        </h1>
                        <p className="ccd-subtitle">Operations overview and real-time call center metrics</p>
                    </div>
                    <div className="ccd-header-actions">
                        <Button
                            variant="secondary"
                            icon={<RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />}
                            onClick={handleRefresh}
                        >
                            Refresh
                        </Button>
                        <Button variant="primary" icon={<Download size={16} />} onClick={handleExportReport}>Export Report</Button>
                    </div>
                </div>

                {/* Refresh Loading Indicator */}
                {refreshing && (
                    <div className="ccd-refresh-indicator">
                        <div className="ccd-refresh-bar" />
                    </div>
                )}

                {/* KPI Cards */}
                <div className={`ccd-kpis ${refreshing ? 'ccd-fading' : ''}`}>
                    <MetricCard
                        label="Total Calls Today"
                        value={metrics.totalCallsToday.toLocaleString()}
                        icon={<Phone size={20} />}
                        change={12.3}
                        subtitle="vs 1,645 yesterday"
                    />
                    <MetricCard
                        label="Avg Wait Time"
                        value={metrics.avgWaitTime}
                        icon={<Timer size={20} />}
                        change={-22}
                        subtitle="Target: 0:15"
                        variant="success"
                    />
                    <MetricCard
                        label="Avg Handle Time"
                        value={metrics.avgHandleTime}
                        icon={<Clock size={20} />}
                        change={-8}
                        subtitle="5:01 last week"
                    />
                    <MetricCard
                        label="Abandonment Rate"
                        value={`${metrics.abandonRate}%`}
                        icon={<PhoneOff size={20} />}
                        change={-0.8}
                        subtitle="Target: < 5%"
                        variant={metrics.abandonRate < 5 ? 'success' : undefined}
                    />
                    <MetricCard
                        label="CSAT Score"
                        value={`${metrics.csatScore}/5`}
                        icon={<Star size={20} />}
                        change={3.2}
                        subtitle={`${Math.round(metrics.csatScore / 5 * 100)}% satisfaction`}
                        variant={metrics.csatScore >= 4.5 ? 'success' : undefined}
                    />
                </div>

                {/* Agent Status Board */}
                <GlassCard className="ccd-agent-board">
                    <div className="ccd-section-header">
                        <h3>
                            <Users size={18} />
                            Agent Status Board
                        </h3>
                        <div className="ccd-agent-summary">
                            <span className="ccd-agent-count available">{agentStatusCounts.available} Available</span>
                            <span className="ccd-agent-count on-call">{agentStatusCounts.onCall} On Call</span>
                            <span className="ccd-agent-count break">{agentStatusCounts.onBreak} Break</span>
                            <span className="ccd-agent-count offline">{agentStatusCounts.offline} Offline</span>
                        </div>
                    </div>
                    <div className="ccd-agent-grid">
                        {agentList.map((agent, index) => (
                            <motion.div
                                key={agent.id}
                                className={`ccd-agent-card ${agent.status} ${selectedAgent?.id === agent.id ? 'selected' : ''}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="ccd-agent-top">
                                    <div className="ccd-agent-avatar">
                                        {agent.name.startsWith('AI') ? <Activity size={16} /> : <Users size={16} />}
                                    </div>
                                    <div className="ccd-agent-info">
                                        <span className="ccd-agent-name">{agent.name}</span>
                                        <span className="ccd-agent-role">{agent.role}</span>
                                    </div>
                                    {getStatusBadge(agent.status)}
                                </div>
                                <div className="ccd-agent-stats">
                                    <div className="ccd-agent-stat">
                                        <span className="stat-value">{agent.callsHandled}</span>
                                        <span className="stat-label">Calls</span>
                                    </div>
                                    <div className="ccd-agent-stat">
                                        <span className="stat-value">{agent.avgHandleTime}</span>
                                        <span className="stat-label">AHT</span>
                                    </div>
                                    <div className="ccd-agent-stat">
                                        <span className="stat-value">{agent.satisfaction > 0 ? `${agent.satisfaction}` : '—'}</span>
                                        <span className="stat-label">CSAT</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Agent Detail Panel */}
                {selectedAgent && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <GlassCard className="ccd-agent-detail">
                            <div className="ccd-detail-header">
                                <div className="ccd-detail-identity">
                                    <div className="ccd-detail-avatar">
                                        {selectedAgent.name.startsWith('AI') ? <Activity size={24} /> : <Users size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="ccd-detail-name">{selectedAgent.name}</h3>
                                        <span className="ccd-detail-role">{selectedAgent.role}</span>
                                    </div>
                                    {getStatusBadge(selectedAgent.status)}
                                </div>
                                <div className="ccd-detail-actions">
                                    <span className="ccd-detail-label">Change Status:</span>
                                    {(['available', 'on_call', 'break', 'offline'] as AgentStatus['status'][]).map(s => (
                                        <button
                                            key={s}
                                            className={`ccd-status-btn ${s} ${selectedAgent.status === s ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleSetAgentStatus(selectedAgent.id, s) }}
                                        >
                                            {getStatusIcon(s)}
                                            {s === 'on_call' ? 'On Call' : s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    ))}
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedAgent(null)}>
                                        <XCircle size={16} />
                                    </Button>
                                </div>
                            </div>
                            <div className="ccd-detail-metrics">
                                <div className="ccd-detail-metric">
                                    <Phone size={16} />
                                    <div>
                                        <span className="ccd-dm-value">{selectedAgent.callsHandled}</span>
                                        <span className="ccd-dm-label">Calls Handled</span>
                                    </div>
                                </div>
                                <div className="ccd-detail-metric">
                                    <Clock size={16} />
                                    <div>
                                        <span className="ccd-dm-value">{selectedAgent.avgHandleTime}</span>
                                        <span className="ccd-dm-label">Avg Handle Time</span>
                                    </div>
                                </div>
                                <div className="ccd-detail-metric">
                                    <Star size={16} />
                                    <div>
                                        <span className="ccd-dm-value">{selectedAgent.satisfaction > 0 ? selectedAgent.satisfaction : '—'}</span>
                                        <span className="ccd-dm-label">CSAT Score</span>
                                    </div>
                                </div>
                                <div className="ccd-detail-metric">
                                    <Timer size={16} />
                                    <div>
                                        <span className="ccd-dm-value">{selectedAgent.activeSince}</span>
                                        <span className="ccd-dm-label">Active Since</span>
                                    </div>
                                </div>
                            </div>
                            <div className="ccd-detail-history">
                                <h4>Recent Call History</h4>
                                <div className="ccd-history-list">
                                    {selectedAgent.callsHandled > 0 ? [
                                        { time: '2 min ago', caller: 'John Martinez', duration: '4:23', outcome: 'Resolved' },
                                        { time: '12 min ago', caller: 'Patricia Lee', duration: '6:45', outcome: 'Escalated' },
                                        { time: '22 min ago', caller: 'Richard Brown', duration: '3:11', outcome: 'Resolved' },
                                        { time: '35 min ago', caller: 'Emily Davis', duration: '5:02', outcome: 'Resolved' },
                                    ].map((call, i) => (
                                        <div key={i} className="ccd-history-item">
                                            <span className="ccd-hi-time">{call.time}</span>
                                            <span className="ccd-hi-caller">{call.caller}</span>
                                            <span className="ccd-hi-duration">{call.duration}</span>
                                            <Badge variant={call.outcome === 'Resolved' ? 'success' : 'warning'} size="sm">{call.outcome}</Badge>
                                        </div>
                                    )) : (
                                        <p className="ccd-no-history">No calls handled yet today</p>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* Charts Row */}
                <div className="ccd-charts-row">
                    {/* Call Volume Chart */}
                    <GlassCard className="ccd-volume-chart">
                        <h3 className="ccd-section-title">
                            <BarChart3 size={18} />
                            Call Volume by Hour
                        </h3>
                        <div className="ccd-chart-container">
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={hourlyVolume} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'linear-gradient(180deg, rgba(25,25,40,0.98), rgba(15,15,25,0.98))',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                        }}
                                    />
                                    <Bar dataKey="ai" name="AI Handled" fill="#14b8a6" radius={[4, 4, 0, 0]} stackId="a" />
                                    <Bar dataKey="human" name="Human Handled" fill="#8b5cf6" radius={[4, 4, 0, 0]} stackId="a" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    {/* Call Reason Distribution */}
                    <GlassCard className="ccd-reason-chart">
                        <h3 className="ccd-section-title">
                            <MessageSquare size={18} />
                            Call Reason Distribution
                        </h3>
                        <div className="ccd-chart-container ccd-pie-container">
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={callReasons}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={95}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="rgba(0,0,0,0.3)"
                                        strokeWidth={2}
                                    >
                                        {callReasons.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: 'linear-gradient(180deg, rgba(25,25,40,0.98), rgba(15,15,25,0.98))',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                        }}
                                        formatter={(value: number) => [`${value}%`, '']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="ccd-pie-legend">
                                {callReasons.map((reason, i) => (
                                    <div key={i} className="ccd-legend-item">
                                        <span className="ccd-legend-dot" style={{ background: reason.color }} />
                                        <span className="ccd-legend-label">{reason.name}</span>
                                        <span className="ccd-legend-value">{reason.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Queue Depth + SLA */}
                <div className="ccd-bottom-row">
                    {/* Queue Depth */}
                    <GlassCard className="ccd-queue">
                        <h3 className="ccd-section-title">
                            <PhoneIncoming size={18} />
                            Queue Depth
                        </h3>
                        <div className="ccd-chart-container">
                            <ResponsiveContainer width="100%" height={180}>
                                <AreaChart data={queueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="queueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'linear-gradient(180deg, rgba(25,25,40,0.98), rgba(15,15,25,0.98))',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="depth"
                                        stroke="#06b6d4"
                                        fill="url(#queueGradient)"
                                        strokeWidth={2}
                                        dot={{ fill: '#06b6d4', strokeWidth: 2, stroke: '#0a0a12', r: 3 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="ccd-queue-status">
                            <span>Current queue: <strong>5 callers</strong></span>
                            <Badge variant="success" size="sm">Healthy</Badge>
                        </div>
                    </GlassCard>

                    {/* SLA Compliance Gauge */}
                    <GlassCard className="ccd-sla">
                        <h3 className="ccd-section-title">
                            <Target size={18} />
                            SLA Compliance
                        </h3>
                        <div className="ccd-sla-gauge">
                            <div className="ccd-sla-ring">
                                <svg viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                                    <motion.circle
                                        cx="60" cy="60" r="50"
                                        fill="none"
                                        stroke={slaCompliance >= 90 ? '#22c55e' : slaCompliance >= 80 ? '#f59e0b' : '#ef4444'}
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 50}`}
                                        initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - slaCompliance / 100) }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                        transform="rotate(-90 60 60)"
                                    />
                                </svg>
                                <div className="ccd-sla-value">
                                    <span className="ccd-sla-pct">{slaCompliance}%</span>
                                    <span className="ccd-sla-label">SLA Met</span>
                                </div>
                            </div>
                            <div className="ccd-sla-targets">
                                <div className="ccd-sla-target">
                                    <span>Calls answered &lt; 15s</span>
                                    <Badge variant="success" size="sm">96.2%</Badge>
                                </div>
                                <div className="ccd-sla-target">
                                    <span>Abandon rate &lt; 5%</span>
                                    <Badge variant="success" size="sm">2.3%</Badge>
                                </div>
                                <div className="ccd-sla-target">
                                    <span>First call resolution</span>
                                    <Badge variant="success" size="sm">89.2%</Badge>
                                </div>
                                <div className="ccd-sla-target">
                                    <span>CSAT &gt; 4.0</span>
                                    <Badge variant="success" size="sm">4.7</Badge>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Escalation Log */}
                <GlassCard className="ccd-escalations">
                    <div className="ccd-section-header">
                        <h3>
                            <AlertTriangle size={18} />
                            Escalation Log
                        </h3>
                        <Button variant="ghost" size="sm" icon={<Eye size={14} />} onClick={() => setShowAllEscalations(!showAllEscalations)}>
                            {showAllEscalations ? 'Show Less' : `View All (${escalations.length})`}
                        </Button>
                    </div>
                    <div className="ccd-escalation-table">
                        <div className="ccd-esc-header">
                            <span>ID</span>
                            <span>Caller</span>
                            <span>Reason</span>
                            <span>Assigned To</span>
                            <span>Priority</span>
                            <span>Status</span>
                            <span>Time</span>
                        </div>
                        {displayedEscalations.map((esc, index) => (
                            <motion.div
                                key={esc.id}
                                className="ccd-esc-row"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <span className="ccd-esc-id">{esc.id}</span>
                                <span>{esc.caller}</span>
                                <span className="ccd-esc-reason">{esc.reason}</span>
                                <span>{esc.agent}</span>
                                <span>{getPriorityBadge(esc.priority)}</span>
                                <span>{getEscStatusBadge(esc.status)}</span>
                                <span className="ccd-esc-time">{esc.time}</span>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    )
}
