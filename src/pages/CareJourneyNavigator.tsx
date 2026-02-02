import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Map,
    Users,
    TrendingUp,
    Calendar,
    DollarSign,
    Heart,
    Activity,
    Pill,
    Stethoscope,
    Clock,
    ChevronRight,
    Sparkles,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Info,
    BarChart3,
    Target,
    Zap
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './CareJourneyNavigator.css'

// ============================================================================
// ROLE-BASED ACCESS PATTERN
// This module supports: Member (primary), Provider (secondary), Admin (analytics)
// ============================================================================
export type UserRole = 'member' | 'provider' | 'admin' | 'broker'

// Care Journey Event Types
type EventType = 'appointment' | 'lab' | 'prescription' | 'procedure' | 'wellness' | 'claim'
type EventStatus = 'completed' | 'upcoming' | 'recommended' | 'overdue'

interface CareEvent {
    id: string
    type: EventType
    title: string
    provider?: string
    date: string
    status: EventStatus
    cost?: number
    yourCost?: number
    notes?: string
}

interface PeerInsight {
    metric: string
    yourValue: number | string
    peerAverage: number | string
    comparison: 'better' | 'average' | 'below'
    recommendation?: string
}

interface CareRecommendation {
    id: string
    type: EventType
    title: string
    reason: string
    urgency: 'high' | 'medium' | 'low'
    peerAdoption: number
    estimatedCost: number
}

// Mock member data
const memberProfile = {
    name: 'Sarah Johnson',
    age: 42,
    gender: 'Female',
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    primaryCare: 'Dr. Emily Chen',
    lastVisit: '2026-01-15',
    healthScore: 78
}

// Mock care journey timeline
const careTimeline: CareEvent[] = [
    {
        id: 'evt-001',
        type: 'appointment',
        title: 'Annual Wellness Visit',
        provider: 'Dr. Emily Chen',
        date: '2026-02-15',
        status: 'upcoming',
        cost: 0,
        yourCost: 0,
        notes: 'Preventive care - covered 100%'
    },
    {
        id: 'evt-002',
        type: 'lab',
        title: 'HbA1c Test',
        provider: 'Quest Diagnostics',
        date: '2026-01-28',
        status: 'completed',
        cost: 85,
        yourCost: 15
    },
    {
        id: 'evt-003',
        type: 'prescription',
        title: 'Metformin 500mg Refill',
        date: '2026-01-20',
        status: 'completed',
        cost: 45,
        yourCost: 10
    },
    {
        id: 'evt-004',
        type: 'appointment',
        title: 'Endocrinology Follow-up',
        provider: 'Dr. Michael Wong',
        date: '2025-12-10',
        status: 'completed',
        cost: 250,
        yourCost: 50
    },
    {
        id: 'evt-005',
        type: 'wellness',
        title: 'Eye Exam (Diabetic Screening)',
        date: '2026-03-01',
        status: 'recommended',
        cost: 150,
        yourCost: 30,
        notes: '85% of members like you complete annually'
    },
    {
        id: 'evt-006',
        type: 'lab',
        title: 'Lipid Panel',
        date: '2025-11-15',
        status: 'overdue',
        cost: 75,
        yourCost: 15,
        notes: 'Recommended every 6 months for your condition'
    }
]

// Mock peer insights (anonymized)
const peerInsights: PeerInsight[] = [
    {
        metric: 'Preventive Care Visits',
        yourValue: 2,
        peerAverage: 3,
        comparison: 'below',
        recommendation: 'Schedule your annual wellness visit to catch up'
    },
    {
        metric: 'Prescription Adherence',
        yourValue: '94%',
        peerAverage: '87%',
        comparison: 'better'
    },
    {
        metric: 'Annual Out-of-Pocket',
        yourValue: '$1,245',
        peerAverage: '$1,890',
        comparison: 'better',
        recommendation: 'You\'re spending less than similar members'
    },
    {
        metric: 'Lab Tests Completed',
        yourValue: 4,
        peerAverage: 5,
        comparison: 'average'
    }
]

// AI-driven recommendations based on peer data
const recommendations: CareRecommendation[] = [
    {
        id: 'rec-001',
        type: 'wellness',
        title: 'Diabetic Eye Exam',
        reason: 'Annual screening recommended for diabetes management',
        urgency: 'high',
        peerAdoption: 85,
        estimatedCost: 30
    },
    {
        id: 'rec-002',
        type: 'lab',
        title: 'Lipid Panel Blood Test',
        reason: 'Overdue by 2 months - monitors cardiovascular health',
        urgency: 'high',
        peerAdoption: 92,
        estimatedCost: 15
    },
    {
        id: 'rec-003',
        type: 'appointment',
        title: 'Nutritionist Consultation',
        reason: '72% of members with similar conditions found this helpful',
        urgency: 'medium',
        peerAdoption: 72,
        estimatedCost: 45
    },
    {
        id: 'rec-004',
        type: 'wellness',
        title: 'Flu Vaccination',
        reason: 'Recommended annually, especially with chronic conditions',
        urgency: 'low',
        peerAdoption: 78,
        estimatedCost: 0
    }
]

// Peer cohort definition (anonymized)
const peerCohort = {
    totalMembers: 12847,
    matchCriteria: ['Age 40-50', 'Female', 'Type 2 Diabetes'],
    avgHealthScore: 74
}

// Event type icons and colors
const eventConfig: Record<EventType, { icon: React.ReactNode; color: string }> = {
    appointment: { icon: <Stethoscope size={16} />, color: 'var(--apex-teal)' },
    lab: { icon: <Activity size={16} />, color: 'var(--apex-purple)' },
    prescription: { icon: <Pill size={16} />, color: '#4CAF50' },
    procedure: { icon: <Heart size={16} />, color: '#E91E63' },
    wellness: { icon: <Target size={16} />, color: '#FF9800' },
    claim: { icon: <DollarSign size={16} />, color: '#2196F3' }
}

export function CareJourneyNavigator() {
    const [selectedEvent, setSelectedEvent] = useState<CareEvent | null>(null)
    const [activeTab, setActiveTab] = useState<'timeline' | 'insights' | 'recommendations'>('timeline')
    const [currentRole] = useState<UserRole>('member')

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    }

    const getStatusBadge = (status: EventStatus) => {
        switch (status) {
            case 'completed':
                return <Badge variant="success" size="sm" icon={<CheckCircle2 size={10} />}>Completed</Badge>
            case 'upcoming':
                return <Badge variant="info" size="sm" icon={<Calendar size={10} />}>Upcoming</Badge>
            case 'recommended':
                return <Badge variant="teal" size="sm" icon={<Sparkles size={10} />}>Recommended</Badge>
            case 'overdue':
                return <Badge variant="critical" size="sm" icon={<AlertCircle size={10} />}>Overdue</Badge>
        }
    }

    const getComparisonBadge = (comparison: PeerInsight['comparison']) => {
        switch (comparison) {
            case 'better':
                return <Badge variant="success" size="sm" icon={<TrendingUp size={10} />}>Above Average</Badge>
            case 'average':
                return <Badge variant="info" size="sm">Average</Badge>
            case 'below':
                return <Badge variant="warning" size="sm" icon={<AlertCircle size={10} />}>Below Average</Badge>
        }
    }

    const getUrgencyBadge = (urgency: CareRecommendation['urgency']) => {
        switch (urgency) {
            case 'high':
                return <Badge variant="critical" size="sm">High Priority</Badge>
            case 'medium':
                return <Badge variant="warning" size="sm">Recommended</Badge>
            case 'low':
                return <Badge variant="info" size="sm">Optional</Badge>
        }
    }

    // Sort timeline by date, most recent first
    const sortedTimeline = [...careTimeline].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return (
        <div className="care-journey">
            {/* Header */}
            <div className="care-journey__header">
                <div>
                    <h1 className="care-journey__title">
                        <Map className="care-journey__title-icon" size={28} />
                        Care Journey Navigator
                    </h1>
                    <p className="care-journey__subtitle">
                        Your personalized health journey • AI-powered insights from members like you
                    </p>
                </div>
                <div className="care-journey__header-badges">
                    <Badge variant="teal" icon={<Users size={12} />}>
                        {peerCohort.totalMembers.toLocaleString()} Similar Members
                    </Badge>
                    <Badge variant="info" size="sm">
                        {currentRole === 'member' ? '👤 Member View' :
                            currentRole === 'provider' ? '🩺 Provider View' : '⚙️ Admin View'}
                    </Badge>
                </div>
            </div>

            {/* Member Summary */}
            <div className="care-journey__summary">
                <GlassCard className="member-profile-card">
                    <div className="member-profile__header">
                        <div className="member-profile__avatar">
                            {memberProfile.name.charAt(0)}
                        </div>
                        <div className="member-profile__info">
                            <h3>{memberProfile.name}</h3>
                            <span>{memberProfile.age} years old • {memberProfile.gender}</span>
                        </div>
                        <div className="member-profile__health-score">
                            <div className="health-score__ring" style={{ '--score': memberProfile.healthScore } as React.CSSProperties}>
                                <span>{memberProfile.healthScore}</span>
                            </div>
                            <span className="health-score__label">Health Score</span>
                        </div>
                    </div>
                    <div className="member-profile__conditions">
                        {memberProfile.conditions.map(condition => (
                            <Badge key={condition} variant="info" size="sm">{condition}</Badge>
                        ))}
                    </div>
                    <div className="member-profile__pcp">
                        <Stethoscope size={14} />
                        <span>Primary Care: {memberProfile.primaryCare}</span>
                    </div>
                </GlassCard>

                <div className="care-journey__metrics">
                    <MetricCard
                        label="Next Appointment"
                        value="Feb 15"
                        icon={<Calendar size={20} />}
                        subtitle="14 days away"
                    />
                    <MetricCard
                        label="YTD Spending"
                        value="$1,245"
                        icon={<DollarSign size={20} />}
                        trend={{ value: 34, direction: 'down' }}
                        subtitle="vs peer average"
                    />
                    <MetricCard
                        label="Care Completion"
                        value="78%"
                        icon={<Target size={20} />}
                        trend={{ value: 4, direction: 'up' }}
                        subtitle="above peer avg"
                    />
                </div>
            </div>

            {/* Peer Cohort Banner */}
            <GlassCard className="peer-cohort-banner">
                <div className="peer-cohort__content">
                    <Sparkles size={20} />
                    <div>
                        <strong>"Members Like You"</strong>
                        <p>Insights based on {peerCohort.totalMembers.toLocaleString()} members matching: {peerCohort.matchCriteria.join(' • ')}</p>
                    </div>
                </div>
                <Badge variant="teal">Avg Health Score: {peerCohort.avgHealthScore}</Badge>
            </GlassCard>

            {/* Tab Navigation */}
            <div className="care-journey__tabs">
                <button
                    className={`care-journey__tab ${activeTab === 'timeline' ? 'active' : ''}`}
                    onClick={() => setActiveTab('timeline')}
                >
                    <Clock size={16} /> Care Timeline
                </button>
                <button
                    className={`care-journey__tab ${activeTab === 'insights' ? 'active' : ''}`}
                    onClick={() => setActiveTab('insights')}
                >
                    <BarChart3 size={16} /> Peer Insights
                </button>
                <button
                    className={`care-journey__tab ${activeTab === 'recommendations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recommendations')}
                >
                    <Zap size={16} /> Recommendations
                    <span className="tab-badge">{recommendations.filter(r => r.urgency === 'high').length}</span>
                </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'timeline' && (
                    <motion.div
                        key="timeline"
                        className="care-journey__content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="timeline-grid">
                            <div className="timeline-list">
                                {sortedTimeline.map((event, index) => (
                                    <motion.div
                                        key={event.id}
                                        className={`timeline-event ${selectedEvent?.id === event.id ? 'selected' : ''} ${event.status}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => setSelectedEvent(event)}
                                    >
                                        <div className="timeline-event__connector">
                                            <div className="timeline-event__dot" style={{ backgroundColor: eventConfig[event.type].color }}>
                                                {eventConfig[event.type].icon}
                                            </div>
                                            {index < sortedTimeline.length - 1 && <div className="timeline-event__line" />}
                                        </div>
                                        <div className="timeline-event__content">
                                            <div className="timeline-event__header">
                                                <h4>{event.title}</h4>
                                                {getStatusBadge(event.status)}
                                            </div>
                                            {event.provider && (
                                                <p className="timeline-event__provider">{event.provider}</p>
                                            )}
                                            <div className="timeline-event__meta">
                                                <span className="timeline-event__date">
                                                    <Calendar size={12} /> {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                {event.yourCost !== undefined && (
                                                    <span className="timeline-event__cost">
                                                        <DollarSign size={12} /> Your cost: {formatCurrency(event.yourCost)}
                                                    </span>
                                                )}
                                            </div>
                                            {event.notes && (
                                                <p className="timeline-event__notes">
                                                    <Info size={12} /> {event.notes}
                                                </p>
                                            )}
                                        </div>
                                        <ChevronRight size={16} className="timeline-event__arrow" />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Event Detail Sidebar */}
                            <AnimatePresence mode="wait">
                                {selectedEvent ? (
                                    <motion.div
                                        key={selectedEvent.id}
                                        className="event-detail"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <GlassCard className="event-detail__card">
                                            <div className="event-detail__header" style={{ borderColor: eventConfig[selectedEvent.type].color }}>
                                                <div className="event-detail__icon" style={{ backgroundColor: eventConfig[selectedEvent.type].color }}>
                                                    {eventConfig[selectedEvent.type].icon}
                                                </div>
                                                <div>
                                                    <h3>{selectedEvent.title}</h3>
                                                    {getStatusBadge(selectedEvent.status)}
                                                </div>
                                            </div>

                                            <div className="event-detail__section">
                                                <label>Date</label>
                                                <p>{new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                            </div>

                                            {selectedEvent.provider && (
                                                <div className="event-detail__section">
                                                    <label>Provider</label>
                                                    <p>{selectedEvent.provider}</p>
                                                </div>
                                            )}

                                            {selectedEvent.cost !== undefined && (
                                                <div className="event-detail__costs">
                                                    <div className="cost-item">
                                                        <span>Total Cost</span>
                                                        <strong>{formatCurrency(selectedEvent.cost)}</strong>
                                                    </div>
                                                    <div className="cost-item highlight">
                                                        <span>Your Cost</span>
                                                        <strong>{formatCurrency(selectedEvent.yourCost || 0)}</strong>
                                                    </div>
                                                    <div className="cost-item">
                                                        <span>Plan Pays</span>
                                                        <strong>{formatCurrency((selectedEvent.cost || 0) - (selectedEvent.yourCost || 0))}</strong>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedEvent.notes && (
                                                <div className="event-detail__notes">
                                                    <Info size={14} />
                                                    <p>{selectedEvent.notes}</p>
                                                </div>
                                            )}

                                            {(selectedEvent.status === 'upcoming' || selectedEvent.status === 'recommended') && (
                                                <div className="event-detail__actions">
                                                    <Button variant="primary" icon={<Calendar size={16} />}>
                                                        {selectedEvent.status === 'upcoming' ? 'View Details' : 'Schedule Now'}
                                                    </Button>
                                                </div>
                                            )}
                                        </GlassCard>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        className="event-detail__empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <Map size={48} />
                                        <p>Select an event to view details</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'insights' && (
                    <motion.div
                        key="insights"
                        className="care-journey__content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="insights-grid">
                            {peerInsights.map((insight, index) => (
                                <motion.div
                                    key={insight.metric}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <GlassCard className={`insight-card ${insight.comparison}`}>
                                        <div className="insight-card__header">
                                            <h4>{insight.metric}</h4>
                                            {getComparisonBadge(insight.comparison)}
                                        </div>
                                        <div className="insight-card__comparison">
                                            <div className="insight-value you">
                                                <span className="label">You</span>
                                                <span className="value">{insight.yourValue}</span>
                                            </div>
                                            <div className="insight-divider">
                                                <ArrowRight size={20} />
                                            </div>
                                            <div className="insight-value peer">
                                                <span className="label">Peer Avg</span>
                                                <span className="value">{insight.peerAverage}</span>
                                            </div>
                                        </div>
                                        {insight.recommendation && (
                                            <div className="insight-card__recommendation">
                                                <Sparkles size={14} />
                                                <p>{insight.recommendation}</p>
                                            </div>
                                        )}
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'recommendations' && (
                    <motion.div
                        key="recommendations"
                        className="care-journey__content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="recommendations-list">
                            {recommendations.map((rec, index) => (
                                <motion.div
                                    key={rec.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <GlassCard className={`recommendation-card ${rec.urgency}`}>
                                        <div className="recommendation-card__icon" style={{ backgroundColor: eventConfig[rec.type].color }}>
                                            {eventConfig[rec.type].icon}
                                        </div>
                                        <div className="recommendation-card__content">
                                            <div className="recommendation-card__header">
                                                <h4>{rec.title}</h4>
                                                {getUrgencyBadge(rec.urgency)}
                                            </div>
                                            <p className="recommendation-card__reason">{rec.reason}</p>
                                            <div className="recommendation-card__meta">
                                                <span className="peer-adoption">
                                                    <Users size={14} />
                                                    {rec.peerAdoption}% of similar members
                                                </span>
                                                <span className="estimated-cost">
                                                    <DollarSign size={14} />
                                                    Est. cost: {formatCurrency(rec.estimatedCost)}
                                                </span>
                                            </div>
                                        </div>
                                        <Button variant="primary" size="sm">
                                            Schedule <ArrowRight size={14} />
                                        </Button>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default CareJourneyNavigator
