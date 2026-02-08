import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Phone, PhoneCall, PhoneOff, PhoneIncoming, Headphones, Mic,
    Activity, Clock, Users, TrendingUp, TrendingDown, AlertTriangle,
    CheckCircle2, XCircle, MessageSquare, BarChart3, Gauge, Smile,
    Frown, Meh, Volume2, Shield, Zap, Eye, RefreshCw, ArrowUpRight,
    Timer, Star, Bot, UserCheck, Search
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './VoiceAgentMonitor.css'

// ============================================================================
// VOICE AGENT MONITOR - Real-Time Call Monitoring Dashboard
// Live visibility into AI voice agent operations
// ============================================================================

interface ActiveCall {
    id: string
    caller: string
    memberId: string
    agentType: 'member_service' | 'provider_service' | 'outreach'
    agentName: string
    duration: number
    sentiment: 'positive' | 'neutral' | 'negative'
    topic: string
    status: 'active' | 'wrapping' | 'escalating'
}

interface CompletedCall {
    id: string
    caller: string
    agentType: string
    duration: string
    outcome: 'resolved' | 'escalated' | 'callback' | 'dropped'
    satisfaction: number
    timestamp: string
    topic: string
}

interface TranscriptLine {
    speaker: 'agent' | 'caller'
    text: string
    timestamp: string
    sentiment?: 'positive' | 'neutral' | 'negative'
}

const activeCalls: ActiveCall[] = [
    { id: 'C-4821', caller: 'Sarah Mitchell', memberId: 'AXP-847291', agentType: 'member_service', agentName: 'Aria', duration: 187, sentiment: 'positive', topic: 'Prior Auth Status', status: 'active' },
    { id: 'C-4822', caller: 'Dr. Robert Chen', memberId: 'PRV-112034', agentType: 'provider_service', agentName: 'Marcus', duration: 342, sentiment: 'neutral', topic: 'Claim Submission', status: 'active' },
    { id: 'C-4823', caller: 'James Wilson', memberId: 'AXP-293847', agentType: 'member_service', agentName: 'Aria', duration: 67, sentiment: 'negative', topic: 'Claim Denied', status: 'escalating' },
    { id: 'C-4824', caller: 'Maria Rodriguez', memberId: 'AXP-558102', agentType: 'member_service', agentName: 'Sophia', duration: 128, sentiment: 'positive', topic: 'Benefits Inquiry', status: 'active' },
    { id: 'C-4825', caller: 'Dr. Emily Park', memberId: 'PRV-334521', agentType: 'provider_service', agentName: 'Marcus', duration: 412, sentiment: 'neutral', topic: 'Eligibility Check', status: 'wrapping' },
    { id: 'C-4826', caller: 'Thomas Brown', memberId: 'AXP-721938', agentType: 'outreach', agentName: 'Aria', duration: 45, sentiment: 'positive', topic: 'Wellness Check-in', status: 'active' },
]

const completedCalls: CompletedCall[] = [
    { id: 'C-4815', caller: 'Linda Adams', agentType: 'Member Service', duration: '5:23', outcome: 'resolved', satisfaction: 5, timestamp: '2 min ago', topic: 'Rx Refill Auth' },
    { id: 'C-4814', caller: 'Dr. Mike Torres', agentType: 'Provider Service', duration: '8:12', outcome: 'resolved', satisfaction: 4, timestamp: '5 min ago', topic: 'Claim Inquiry' },
    { id: 'C-4813', caller: 'Karen White', agentType: 'Member Service', duration: '3:45', outcome: 'escalated', satisfaction: 2, timestamp: '8 min ago', topic: 'Appeal Request' },
    { id: 'C-4812', caller: 'Paul Garcia', agentType: 'Outreach', duration: '2:10', outcome: 'callback', satisfaction: 4, timestamp: '12 min ago', topic: 'Annual Wellness' },
    { id: 'C-4811', caller: 'Nancy Lee', agentType: 'Member Service', duration: '4:55', outcome: 'resolved', satisfaction: 5, timestamp: '15 min ago', topic: 'ID Card Request' },
    { id: 'C-4810', caller: 'John Davis', agentType: 'Member Service', duration: '1:30', outcome: 'dropped', satisfaction: 0, timestamp: '18 min ago', topic: 'Unknown' },
]

const sampleTranscript: TranscriptLine[] = [
    { speaker: 'agent', text: 'Welcome to Apex Health! My name is Aria. How can I assist you today?', timestamp: '0:00', sentiment: 'positive' },
    { speaker: 'caller', text: 'Hi, I submitted a prior authorization request last week and want to check the status.', timestamp: '0:05', sentiment: 'neutral' },
    { speaker: 'agent', text: 'I\'d be happy to check that for you. For security, can you verify your date of birth and member ID?', timestamp: '0:08', sentiment: 'positive' },
    { speaker: 'caller', text: 'Sure, March 15, 1985 and my ID is AXP-847291.', timestamp: '0:14', sentiment: 'neutral' },
    { speaker: 'agent', text: 'Perfect, Sarah. I can see your prior authorization PA-2026-4821 for arthroscopic knee surgery was approved yesterday. The authorization is valid for 90 days.', timestamp: '0:18', sentiment: 'positive' },
    { speaker: 'caller', text: 'Oh wonderful, that\'s great news! Thank you so much!', timestamp: '0:28', sentiment: 'positive' },
]

const sentimentData = [
    { time: '9 AM', positive: 72, neutral: 20, negative: 8 },
    { time: '10 AM', positive: 68, neutral: 22, negative: 10 },
    { time: '11 AM', positive: 75, neutral: 18, negative: 7 },
    { time: '12 PM', positive: 65, neutral: 25, negative: 10 },
    { time: '1 PM', positive: 70, neutral: 20, negative: 10 },
    { time: '2 PM', positive: 78, neutral: 16, negative: 6 },
    { time: '3 PM', positive: 74, neutral: 19, negative: 7 },
    { time: 'Now', positive: 76, neutral: 17, negative: 7 },
]

export default function VoiceAgentMonitor() {
    const [liveCallCount, setLiveCallCount] = useState(247)
    const [selectedCall, setSelectedCall] = useState<string | null>('C-4821')
    const [searchQuery, setSearchQuery] = useState('')
    const [refreshing, setRefreshing] = useState(false)

    // Animate the live call counter
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveCallCount(prev => prev + Math.floor(Math.random() * 3) - 1)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const handleRefresh = useCallback(() => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 1500)
    }, [])

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return <Smile size={14} />
            case 'negative': return <Frown size={14} />
            default: return <Meh size={14} />
        }
    }

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return '#22c55e'
            case 'negative': return '#ef4444'
            default: return '#f59e0b'
        }
    }

    const getOutcomeBadge = (outcome: CompletedCall['outcome']) => {
        switch (outcome) {
            case 'resolved': return <Badge variant="success" size="sm" icon={<CheckCircle2 size={10} />}>Resolved</Badge>
            case 'escalated': return <Badge variant="warning" size="sm" icon={<AlertTriangle size={10} />}>Escalated</Badge>
            case 'callback': return <Badge variant="info" size="sm" icon={<PhoneCall size={10} />}>Callback</Badge>
            case 'dropped': return <Badge variant="critical" size="sm" icon={<XCircle size={10} />}>Dropped</Badge>
        }
    }

    const getStatusBadge = (status: ActiveCall['status']) => {
        switch (status) {
            case 'active': return <Badge variant="success" size="sm" pulse dot>Active</Badge>
            case 'wrapping': return <Badge variant="info" size="sm" dot>Wrapping</Badge>
            case 'escalating': return <Badge variant="critical" size="sm" pulse dot>Escalating</Badge>
        }
    }

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const filteredCalls = activeCalls.filter(c =>
        c.caller.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.topic.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="voice-agent-monitor">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="vam-header">
                    <div>
                        <h1 className="vam-title">
                            <Headphones size={28} />
                            Voice Agent Monitor
                            <Badge variant="success" pulse icon={<Activity size={10} />}>Live</Badge>
                        </h1>
                        <p className="vam-subtitle">Real-time AI voice agent call monitoring and analytics</p>
                    </div>
                    <div className="vam-header-actions">
                        <Button
                            variant="secondary"
                            icon={<RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />}
                            onClick={handleRefresh}
                        >
                            Refresh
                        </Button>
                        <Button variant="primary" icon={<BarChart3 size={16} />}>
                            Full Report
                        </Button>
                    </div>
                </div>

                {/* Live Counter + KPI Cards */}
                <div className="vam-kpis">
                    <div className="vam-live-counter">
                        <div className="vam-counter-pulse" />
                        <PhoneCall size={24} />
                        <div className="vam-counter-content">
                            <motion.span
                                key={liveCallCount}
                                className="vam-counter-value"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {liveCallCount}
                            </motion.span>
                            <span className="vam-counter-label">Live Calls</span>
                        </div>
                    </div>
                    <MetricCard
                        label="Avg Wait Time"
                        value="0:12"
                        icon={<Timer size={20} />}
                        change={-18}
                        subtitle="Target: 0:15"
                    />
                    <MetricCard
                        label="Avg Handle Time"
                        value="4:32"
                        icon={<Clock size={20} />}
                        change={-8}
                        subtitle="Down from 4:55"
                    />
                    <MetricCard
                        label="First Call Resolution"
                        value="89.2%"
                        icon={<CheckCircle2 size={20} />}
                        change={5.1}
                        subtitle="Above 85% target"
                        variant="success"
                    />
                </div>

                {/* Main Content */}
                <div className="vam-grid">
                    {/* Active Calls List */}
                    <GlassCard className="vam-active-calls">
                        <div className="vam-section-header">
                            <h3>
                                <Phone size={18} />
                                Active Calls ({activeCalls.length})
                            </h3>
                            <div className="vam-search">
                                <Search size={14} />
                                <input
                                    type="text"
                                    placeholder="Search calls..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="vam-calls-list">
                            {filteredCalls.map((call, index) => (
                                <motion.div
                                    key={call.id}
                                    className={`vam-call-item ${selectedCall === call.id ? 'selected' : ''}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedCall(call.id)}
                                >
                                    <div className="vam-call-sentiment" style={{ color: getSentimentColor(call.sentiment) }}>
                                        {getSentimentIcon(call.sentiment)}
                                    </div>
                                    <div className="vam-call-info">
                                        <div className="vam-call-caller">
                                            <span className="vam-call-name">{call.caller}</span>
                                            <span className="vam-call-id">{call.memberId}</span>
                                        </div>
                                        <div className="vam-call-meta">
                                            <span><Bot size={12} /> {call.agentName}</span>
                                            <span><MessageSquare size={12} /> {call.topic}</span>
                                        </div>
                                    </div>
                                    <div className="vam-call-right">
                                        <span className="vam-call-duration">{formatDuration(call.duration)}</span>
                                        {getStatusBadge(call.status)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Transcript Viewer */}
                    <GlassCard className="vam-transcript">
                        <div className="vam-section-header">
                            <h3>
                                <MessageSquare size={18} />
                                Live Transcript
                            </h3>
                            {selectedCall && (
                                <Badge variant="teal" size="sm">Call {selectedCall}</Badge>
                            )}
                        </div>
                        <div className="vam-transcript-content">
                            {sampleTranscript.map((line, i) => (
                                <motion.div
                                    key={i}
                                    className={`vam-transcript-line ${line.speaker}`}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                >
                                    <div className="vam-transcript-meta">
                                        <span className="vam-transcript-speaker">
                                            {line.speaker === 'agent' ? <Bot size={12} /> : <Users size={12} />}
                                            {line.speaker === 'agent' ? 'Aria' : 'Caller'}
                                        </span>
                                        <span className="vam-transcript-time">{line.timestamp}</span>
                                        {line.sentiment && (
                                            <span style={{ color: getSentimentColor(line.sentiment) }}>
                                                {getSentimentIcon(line.sentiment)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="vam-transcript-text">{line.text}</p>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Bottom Section */}
                <div className="vam-bottom-grid">
                    {/* Sentiment Over Time */}
                    <GlassCard className="vam-sentiment-chart">
                        <h3 className="vam-section-title">
                            <Smile size={18} />
                            Sentiment Trend (Today)
                        </h3>
                        <div className="vam-sentiment-bars">
                            {sentimentData.map((entry, i) => (
                                <div key={i} className="vam-sentiment-bar-group">
                                    <div className="vam-sentiment-stack">
                                        <div className="vam-bar positive" style={{ height: `${entry.positive}%` }} title={`Positive: ${entry.positive}%`} />
                                        <div className="vam-bar neutral" style={{ height: `${entry.neutral}%` }} title={`Neutral: ${entry.neutral}%`} />
                                        <div className="vam-bar negative" style={{ height: `${entry.negative}%` }} title={`Negative: ${entry.negative}%`} />
                                    </div>
                                    <span className="vam-bar-label">{entry.time}</span>
                                </div>
                            ))}
                        </div>
                        <div className="vam-sentiment-legend">
                            <span><span className="legend-dot positive" /> Positive</span>
                            <span><span className="legend-dot neutral" /> Neutral</span>
                            <span><span className="legend-dot negative" /> Negative</span>
                        </div>
                    </GlassCard>

                    {/* Agent Utilization */}
                    <GlassCard className="vam-utilization">
                        <h3 className="vam-section-title">
                            <Gauge size={18} />
                            Agent Utilization
                        </h3>
                        <div className="vam-util-gauges">
                            {[
                                { name: 'Aria', pct: 87, color: '#14b8a6', calls: 156 },
                                { name: 'Marcus', pct: 72, color: '#8b5cf6', calls: 98 },
                                { name: 'Sophia', pct: 91, color: '#3b82f6', calls: 171 },
                                { name: 'James', pct: 45, color: '#f59e0b', calls: 52 },
                            ].map((agent, i) => (
                                <div key={i} className="vam-gauge-item">
                                    <div className="vam-gauge-header">
                                        <span className="vam-gauge-name">{agent.name}</span>
                                        <span className="vam-gauge-pct" style={{ color: agent.color }}>{agent.pct}%</span>
                                    </div>
                                    <div className="vam-gauge-bar">
                                        <motion.div
                                            className="vam-gauge-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${agent.pct}%` }}
                                            transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                                            style={{ background: agent.color }}
                                        />
                                    </div>
                                    <span className="vam-gauge-calls">{agent.calls} calls today</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Escalation Alerts */}
                    <GlassCard className="vam-escalations">
                        <h3 className="vam-section-title">
                            <AlertTriangle size={18} />
                            Escalation Alerts
                        </h3>
                        <div className="vam-escalation-list">
                            {[
                                { id: 'ESC-301', caller: 'James Wilson', reason: 'Claim denial dispute - member requesting supervisor', time: '1 min ago', severity: 'high' },
                                { id: 'ESC-300', caller: 'Amanda Foster', reason: 'Billing error - system unable to resolve', time: '8 min ago', severity: 'medium' },
                                { id: 'ESC-299', caller: 'Dr. Patel', reason: 'Urgent pre-cert needed for emergency procedure', time: '15 min ago', severity: 'high' },
                            ].map((esc, i) => (
                                <motion.div
                                    key={esc.id}
                                    className={`vam-escalation-item ${esc.severity}`}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="vam-esc-indicator" />
                                    <div className="vam-esc-info">
                                        <div className="vam-esc-header-row">
                                            <span className="vam-esc-caller">{esc.caller}</span>
                                            <Badge variant={esc.severity === 'high' ? 'critical' : 'warning'} size="sm">
                                                {esc.severity}
                                            </Badge>
                                        </div>
                                        <p className="vam-esc-reason">{esc.reason}</p>
                                        <span className="vam-esc-time">{esc.time}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Recent Completed Calls */}
                <GlassCard className="vam-completed">
                    <div className="vam-section-header">
                        <h3>
                            <PhoneOff size={18} />
                            Recent Completed Calls
                        </h3>
                        <Button variant="ghost" size="sm" icon={<Eye size={14} />}>View All</Button>
                    </div>
                    <div className="vam-completed-table">
                        <div className="vam-table-header">
                            <span>Call ID</span>
                            <span>Caller</span>
                            <span>Agent Type</span>
                            <span>Topic</span>
                            <span>Duration</span>
                            <span>Outcome</span>
                            <span>CSAT</span>
                            <span>Time</span>
                        </div>
                        {completedCalls.map((call, index) => (
                            <motion.div
                                key={call.id}
                                className="vam-table-row"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <span className="vam-cell-id">{call.id}</span>
                                <span>{call.caller}</span>
                                <span>{call.agentType}</span>
                                <span>{call.topic}</span>
                                <span>{call.duration}</span>
                                <span>{getOutcomeBadge(call.outcome)}</span>
                                <span className="vam-cell-rating">
                                    {call.satisfaction > 0 ? (
                                        <>
                                            <Star size={12} style={{ color: '#f59e0b' }} />
                                            {call.satisfaction}/5
                                        </>
                                    ) : '—'}
                                </span>
                                <span className="vam-cell-time">{call.timestamp}</span>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    )
}
