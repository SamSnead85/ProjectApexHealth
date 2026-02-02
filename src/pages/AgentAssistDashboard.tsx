import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Headphones,
    User,
    Phone,
    Clock,
    MessageSquare,
    Sparkles,
    Send,
    Copy,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    FileText,
    Heart,
    Activity,
    DollarSign,
    Calendar,
    History,
    Mic,
    MicOff,
    ThumbsUp,
    ThumbsDown,
    Save,
    ChevronRight,
    Zap
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './AgentAssistDashboard.css'

// ============================================================================
// ROLE-BASED ACCESS PATTERN
// This module supports: Admin/Advocate ONLY
// ============================================================================
export type UserRole = 'admin' | 'advocate'

interface MemberProfile {
    id: string
    name: string
    age: number
    gender: string
    planType: string
    effectiveDate: string
    conditions: string[]
    lastContact: string
    sentiment: 'positive' | 'neutral' | 'negative'
    tier: 'standard' | 'premium' | 'vip'
}

interface CallContext {
    duration: string
    topic: string
    category: 'claims' | 'benefits' | 'providers' | 'billing' | 'general'
    previousCalls: number
    escalationRisk: 'low' | 'medium' | 'high'
}

interface SuggestedResponse {
    id: string
    text: string
    category: string
    confidence: number
    isRecommended?: boolean
}

interface CallNote {
    timestamp: string
    content: string
}

// Mock member data
const mockMember: MemberProfile = {
    id: 'MBR-10234',
    name: 'Sarah Johnson',
    age: 42,
    gender: 'Female',
    planType: 'Apex Health PPO - Gold',
    effectiveDate: '2024-01-01',
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    lastContact: '2026-01-15',
    sentiment: 'neutral',
    tier: 'premium'
}

const mockCallContext: CallContext = {
    duration: '3:42',
    topic: 'Out-of-Network Claim Inquiry',
    category: 'claims',
    previousCalls: 2,
    escalationRisk: 'medium'
}

// AI-suggested responses based on call context
const mockSuggestions: SuggestedResponse[] = [
    {
        id: 'sug-001',
        text: "I understand you're inquiring about your out-of-network claim. Let me pull up the details for you. I can see the claim was submitted on January 15th for $450. The typical processing time is 10-14 business days.",
        category: 'Claims',
        confidence: 94,
        isRecommended: true
    },
    {
        id: 'sug-002',
        text: "Your plan covers out-of-network services at 70% of the Usual, Customary, and Reasonable (UCR) rate after your deductible is met. You've currently met $320 of your $500 annual deductible.",
        category: 'Benefits',
        confidence: 88
    },
    {
        id: 'sug-003',
        text: "I can help you set up direct deposit for faster reimbursement. This would reduce your reimbursement time from 10-14 days to just 3-5 business days.",
        category: 'Service',
        confidence: 76
    }
]

// Recent member interactions
const recentInteractions = [
    { date: '2026-01-15', type: 'Call', topic: 'Provider search', resolution: 'Resolved' },
    { date: '2025-12-20', type: 'Chat', topic: 'Benefits inquiry', resolution: 'Resolved' },
    { date: '2025-11-10', type: 'Call', topic: 'Claim status', resolution: 'Escalated' }
]

export function AgentAssistDashboard() {
    const [currentRole] = useState<UserRole>('advocate')
    const [callNotes, setCallNotes] = useState<CallNote[]>([])
    const [currentNote, setCurrentNote] = useState('')
    const [isRecording, setIsRecording] = useState(true)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [showSummary, setShowSummary] = useState(false)
    const [callSummary, setCallSummary] = useState('')

    const handleCopyResponse = (response: SuggestedResponse) => {
        navigator.clipboard.writeText(response.text)
        setCopiedId(response.id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleAddNote = () => {
        if (!currentNote.trim()) return
        setCallNotes(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: currentNote
        }])
        setCurrentNote('')
    }

    const handleGenerateSummary = () => {
        // Simulate AI summary generation
        const summary = `Member called regarding OON claim (CLM-2026-001234) submitted 01/15. Explained 70% UCR coverage and current deductible status ($320/$500 met). Member concerned about processing time. Offered direct deposit setup for faster reimbursement. Member agreed - updated payment preferences. Follow-up not required.`
        setCallSummary(summary)
        setShowSummary(true)
    }

    const getSentimentColor = (sentiment: MemberProfile['sentiment']) => {
        switch (sentiment) {
            case 'positive': return '#4CAF50'
            case 'neutral': return '#FF9800'
            case 'negative': return '#F44336'
        }
    }

    const getEscalationBadge = (risk: CallContext['escalationRisk']) => {
        switch (risk) {
            case 'low':
                return <Badge variant="success" size="sm">Low Risk</Badge>
            case 'medium':
                return <Badge variant="warning" size="sm">Medium Risk</Badge>
            case 'high':
                return <Badge variant="critical" size="sm">High Risk</Badge>
        }
    }

    return (
        <div className="agent-assist">
            {/* Header */}
            <div className="agent-assist__header">
                <div className="agent-assist__header-left">
                    <h1 className="agent-assist__title">
                        <Headphones className="agent-assist__title-icon" size={28} />
                        Agent Assist
                    </h1>
                    <p className="agent-assist__subtitle">
                        AI-powered advocate support • Real-time assistance
                    </p>
                </div>
                <div className="agent-assist__call-status">
                    <div className={`call-indicator ${isRecording ? 'active' : ''}`}>
                        {isRecording ? <Mic size={16} /> : <MicOff size={16} />}
                        <span>{isRecording ? 'Call Active' : 'Call Paused'}</span>
                    </div>
                    <div className="call-timer">
                        <Clock size={16} />
                        <span>{mockCallContext.duration}</span>
                    </div>
                    <Badge variant="info" size="sm">
                        {currentRole === 'advocate' ? '🎧 Advocate Mode' : '⚙️ Admin Mode'}
                    </Badge>
                </div>
            </div>

            <div className="agent-assist__grid">
                {/* Member Context Sidebar */}
                <div className="member-sidebar">
                    <GlassCard className="member-profile-card">
                        <div className="member-profile__header">
                            <div className="member-profile__avatar">
                                {mockMember.name.charAt(0)}
                            </div>
                            <div className="member-profile__info">
                                <h3>{mockMember.name}</h3>
                                <span className="member-id">{mockMember.id}</span>
                            </div>
                            <div
                                className="sentiment-indicator"
                                style={{ backgroundColor: getSentimentColor(mockMember.sentiment) }}
                                title={`Sentiment: ${mockMember.sentiment}`}
                            />
                        </div>

                        <div className="member-badges">
                            <Badge variant="teal" size="sm">{mockMember.tier.toUpperCase()}</Badge>
                            {getEscalationBadge(mockCallContext.escalationRisk)}
                        </div>

                        <div className="member-details">
                            <div className="detail-row">
                                <span>Plan</span>
                                <strong>{mockMember.planType}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Age/Gender</span>
                                <strong>{mockMember.age} / {mockMember.gender}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Effective Date</span>
                                <strong>{mockMember.effectiveDate}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Previous Calls</span>
                                <strong>{mockCallContext.previousCalls}</strong>
                            </div>
                        </div>

                        <div className="member-conditions">
                            <h4>Active Conditions</h4>
                            <div className="conditions-list">
                                {mockMember.conditions.map(condition => (
                                    <Badge key={condition} variant="info" size="sm">{condition}</Badge>
                                ))}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Quick Metrics */}
                    <div className="quick-metrics">
                        <MetricCard
                            label="YTD Spend"
                            value="$1,245"
                            icon={<DollarSign size={18} />}
                        />
                        <MetricCard
                            label="Claims"
                            value="7"
                            icon={<FileText size={18} />}
                        />
                    </div>

                    {/* Recent Interactions */}
                    <GlassCard className="recent-interactions">
                        <h4><History size={16} /> Recent Interactions</h4>
                        <div className="interactions-list">
                            {recentInteractions.map((interaction, index) => (
                                <div key={index} className="interaction-item">
                                    <div className="interaction-date">{interaction.date}</div>
                                    <div className="interaction-details">
                                        <span className="interaction-type">{interaction.type}</span>
                                        <span className="interaction-topic">{interaction.topic}</span>
                                    </div>
                                    <Badge
                                        variant={interaction.resolution === 'Resolved' ? 'success' : 'warning'}
                                        size="sm"
                                    >
                                        {interaction.resolution}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    {/* Call Context Banner */}
                    <div className="call-context-banner">
                        <div className="call-topic">
                            <MessageSquare size={18} />
                            <div>
                                <strong>{mockCallContext.topic}</strong>
                                <span>{mockCallContext.category}</span>
                            </div>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => setIsRecording(!isRecording)}>
                            {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                            {isRecording ? 'Pause' : 'Resume'}
                        </Button>
                    </div>

                    {/* AI Suggestions */}
                    <GlassCard className="ai-suggestions">
                        <div className="ai-suggestions__header">
                            <div className="ai-suggestions__title">
                                <Sparkles size={18} />
                                <h3>AI Suggested Responses</h3>
                            </div>
                            <Badge variant="teal" size="sm">Live Analysis</Badge>
                        </div>

                        <div className="suggestions-list">
                            {mockSuggestions.map(suggestion => (
                                <motion.div
                                    key={suggestion.id}
                                    className={`suggestion-card ${suggestion.isRecommended ? 'recommended' : ''}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {suggestion.isRecommended && (
                                        <div className="recommended-badge">
                                            <Zap size={12} /> Recommended
                                        </div>
                                    )}
                                    <div className="suggestion-header">
                                        <Badge variant="info" size="sm">{suggestion.category}</Badge>
                                        <div className="confidence-score">
                                            <TrendingUp size={12} />
                                            <span>{suggestion.confidence}% confidence</span>
                                        </div>
                                    </div>
                                    <p className="suggestion-text">{suggestion.text}</p>
                                    <div className="suggestion-actions">
                                        <button
                                            className={`copy-button ${copiedId === suggestion.id ? 'copied' : ''}`}
                                            onClick={() => handleCopyResponse(suggestion)}
                                        >
                                            {copiedId === suggestion.id ? (
                                                <><CheckCircle size={14} /> Copied</>
                                            ) : (
                                                <><Copy size={14} /> Copy</>
                                            )}
                                        </button>
                                        <div className="feedback-buttons">
                                            <button className="feedback-btn" title="Helpful">
                                                <ThumbsUp size={14} />
                                            </button>
                                            <button className="feedback-btn" title="Not helpful">
                                                <ThumbsDown size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Call Notes */}
                    <GlassCard className="call-notes">
                        <div className="call-notes__header">
                            <h3><FileText size={18} /> Call Notes</h3>
                            <Button variant="primary" size="sm" onClick={handleGenerateSummary}>
                                <Sparkles size={14} /> Generate Summary
                            </Button>
                        </div>

                        {callNotes.length > 0 && (
                            <div className="notes-list">
                                {callNotes.map((note, index) => (
                                    <div key={index} className="note-item">
                                        <span className="note-time">{note.timestamp}</span>
                                        <p>{note.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="note-input">
                            <input
                                type="text"
                                placeholder="Add a note..."
                                value={currentNote}
                                onChange={(e) => setCurrentNote(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                            />
                            <Button variant="secondary" size="sm" onClick={handleAddNote}>
                                <Send size={14} />
                            </Button>
                        </div>
                    </GlassCard>

                    {/* AI Summary */}
                    <AnimatePresence>
                        {showSummary && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <GlassCard className="call-summary">
                                    <div className="call-summary__header">
                                        <div className="call-summary__title">
                                            <Sparkles size={18} />
                                            <h3>AI Call Summary</h3>
                                        </div>
                                        <Badge variant="success" size="sm">Auto-generated</Badge>
                                    </div>
                                    <p className="summary-text">{callSummary}</p>
                                    <div className="summary-actions">
                                        <Button variant="primary" icon={<Save size={14} />}>
                                            Save to Member Record
                                        </Button>
                                        <Button variant="secondary" icon={<Copy size={14} />}>
                                            Copy Summary
                                        </Button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Quick Actions Sidebar */}
                <div className="actions-sidebar">
                    <h4>Quick Actions</h4>
                    <div className="quick-actions">
                        <button className="quick-action-btn">
                            <Calendar size={16} />
                            Schedule Follow-up
                            <ChevronRight size={14} />
                        </button>
                        <button className="quick-action-btn">
                            <FileText size={16} />
                            View Claims
                            <ChevronRight size={14} />
                        </button>
                        <button className="quick-action-btn">
                            <Heart size={16} />
                            View Benefits
                            <ChevronRight size={14} />
                        </button>
                        <button className="quick-action-btn">
                            <Activity size={16} />
                            Care History
                            <ChevronRight size={14} />
                        </button>
                        <button className="quick-action-btn warning">
                            <AlertTriangle size={16} />
                            Escalate Call
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AgentAssistDashboard
