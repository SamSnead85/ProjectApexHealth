import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    User,
    Calendar,
    Clock,
    Mail,
    Phone,
    MapPin,
    Heart,
    Baby,
    FileText,
    Shield,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    MessageSquare,
    ChevronRight,
    Users,
    Activity,
    Briefcase,
    Home
} from 'lucide-react'
import './Member360.css'

interface Member {
    id: string
    firstName: string
    lastName: string
    memberId: string
    ssn: string
    dob: string
    email: string
    phone: string
    address: string
    plan: string
    tier: string
    status: 'active' | 'pending' | 'terminated'
    riskScore: number
    enrollmentDate: string
}

interface TimelineEvent {
    id: string
    type: 'enrollment' | 'change' | 'gap' | 'termination' | 'reinstatement'
    title: string
    description: string
    date: string
    isActive?: boolean
}

interface LifeEvent {
    id: string
    type: 'marriage' | 'birth' | 'cobra' | 'address'
    title: string
    description: string
    date: string
}

interface Communication {
    id: string
    type: 'email' | 'letter' | 'sms'
    subject: string
    date: string
    status: 'sent' | 'delivered' | 'opened'
}

interface Dependent {
    id: string
    name: string
    relationship: string
    dob: string
    verificationStatus: 'verified' | 'pending' | 'expired'
    lastVerified?: string
}

const mockMember: Member = {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    memberId: 'MBR-2026-001847',
    ssn: '***-**-4521',
    dob: '1985-06-15',
    email: 'sarah.mitchell@email.com',
    phone: '(555) 234-5678',
    address: '1847 Healthcare Ave, Austin, TX 78701',
    plan: 'Premium PPO Gold',
    tier: 'Employee + Family',
    status: 'active',
    riskScore: 78,
    enrollmentDate: '2022-01-01'
}

const mockTimeline: TimelineEvent[] = [
    {
        id: '1',
        type: 'enrollment',
        title: 'Initial Enrollment',
        description: 'Enrolled in Premium PPO Gold plan',
        date: '2022-01-01',
        isActive: false
    },
    {
        id: '2',
        type: 'change',
        title: 'Added Dependent',
        description: 'Added spouse Michael Mitchell to coverage',
        date: '2022-08-15',
        isActive: false
    },
    {
        id: '3',
        type: 'gap',
        title: 'Coverage Gap',
        description: 'COBRA elected - 3 month gap identified',
        date: '2023-04-01',
        isActive: false
    },
    {
        id: '4',
        type: 'reinstatement',
        title: 'Coverage Reinstated',
        description: 'Rehired and coverage restored',
        date: '2023-07-01',
        isActive: false
    },
    {
        id: '5',
        type: 'change',
        title: 'Annual Enrollment',
        description: 'Upgraded to Employee + Family tier',
        date: '2026-01-01',
        isActive: true
    }
]

const mockLifeEvents: LifeEvent[] = [
    {
        id: '1',
        type: 'marriage',
        title: 'Marriage',
        description: 'Married Michael Mitchell',
        date: '2022-08-01'
    },
    {
        id: '2',
        type: 'birth',
        title: 'Birth of Child',
        description: 'Emily Mitchell born',
        date: '2024-03-15'
    },
    {
        id: '3',
        type: 'address',
        title: 'Address Change',
        description: 'Moved to Austin, TX',
        date: '2025-06-01'
    }
]

const mockCommunications: Communication[] = [
    { id: '1', type: 'email', subject: 'Annual Enrollment Confirmation', date: '2026-01-15', status: 'opened' },
    { id: '2', type: 'letter', subject: 'EOB - December 2025', date: '2026-01-10', status: 'sent' },
    { id: '3', type: 'sms', subject: 'Appointment Reminder', date: '2026-01-08', status: 'delivered' },
    { id: '4', type: 'email', subject: 'Deductible Reset Notice', date: '2026-01-02', status: 'opened' },
    { id: '5', type: 'email', subject: 'ID Card Available', date: '2025-12-20', status: 'opened' }
]

const mockDependents: Dependent[] = [
    {
        id: '1',
        name: 'Michael Mitchell',
        relationship: 'Spouse',
        dob: '1983-09-22',
        verificationStatus: 'verified',
        lastVerified: '2025-08-15'
    },
    {
        id: '2',
        name: 'Emily Mitchell',
        relationship: 'Child',
        dob: '2024-03-15',
        verificationStatus: 'verified',
        lastVerified: '2024-04-01'
    },
    {
        id: '3',
        name: 'James Mitchell',
        relationship: 'Child',
        dob: '2020-11-08',
        verificationStatus: 'pending'
    }
]

type TabType = 'overview' | 'eligibility' | 'events' | 'communications' | 'dependents' | 'aca'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function Member360() {
    const [activeTab, setActiveTab] = useState<TabType>('overview')
    const [searchQuery, setSearchQuery] = useState('')
    const [member, setMember] = useState(mockMember)
    const [timeline, setTimeline] = useState(mockTimeline)

    // Fetch member data from API with mock fallback
    useEffect(() => {
        if (!API_BASE) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/v1/members/AHP100001/360`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.data?.member) setMember(data.data.member);
                    if (data.data?.timeline) setTimeline(data.data.timeline);
                }
            } catch { /* use mock data */ }
        })();
    }, []);

    const getInitials = (first: string, last: string) =>
        `${first.charAt(0)}${last.charAt(0)}`

    const getLifeEventIcon = (type: LifeEvent['type']) => {
        switch (type) {
            case 'marriage': return <Heart size={20} />
            case 'birth': return <Baby size={20} />
            case 'cobra': return <Briefcase size={20} />
            case 'address': return <Home size={20} />
        }
    }

    const getVerificationIcon = (status: Dependent['verificationStatus']) => {
        switch (status) {
            case 'verified': return <CheckCircle2 size={14} />
            case 'pending': return <Clock size={14} />
            case 'expired': return <XCircle size={14} />
        }
    }

    return (
        <div className="member-360">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>Member 360° View</h1>
                <p className="page-subtitle">
                    Complete member intelligence with eligibility history and life events
                </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
                className="member-search-bar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="search-input-wrapper">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by member ID, name, SSN, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </motion.div>

            {/* Member Profile Header */}
            <motion.div
                className="member-profile-header"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="member-avatar">
                    {getInitials(mockMember.firstName, mockMember.lastName)}
                </div>
                <div className="member-details">
                    <h2>{mockMember.firstName} {mockMember.lastName}</h2>
                    <p className="member-id">{mockMember.memberId}</p>
                    <div className="member-badges">
                        <span className="member-badge active">
                            <CheckCircle2 size={12} /> Active
                        </span>
                        <span className="member-badge plan">
                            <Shield size={12} /> {mockMember.plan}
                        </span>
                        <span className="member-badge tier">
                            <Users size={12} /> {mockMember.tier}
                        </span>
                    </div>
                    <div className="member-meta-row">
                        <span><Calendar size={14} /> DOB: {mockMember.dob}</span>
                        <span><Mail size={14} /> {mockMember.email}</span>
                        <span><Phone size={14} /> {mockMember.phone}</span>
                        <span><MapPin size={14} /> {mockMember.address}</span>
                    </div>
                </div>
                <div className="member-risk-score">
                    <div className="risk-score-value">{mockMember.riskScore}</div>
                    <div className="risk-score-label">Risk Score</div>
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
                className="member-tabs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                {[
                    { id: 'overview', label: 'Overview', icon: User },
                    { id: 'eligibility', label: 'Eligibility', icon: Shield },
                    { id: 'events', label: 'Life Events', icon: Heart },
                    { id: 'communications', label: 'Communications', icon: MessageSquare },
                    { id: 'dependents', label: 'Dependents', icon: Users },
                    { id: 'aca', label: 'ACA Status', icon: Activity }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        className={`member-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id as TabType)}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </motion.div>

            {/* Eligibility Timeline */}
            {(activeTab === 'overview' || activeTab === 'eligibility') && (
                <motion.div
                    className="eligibility-timeline"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3>
                        <Shield size={18} />
                        Eligibility Timeline
                    </h3>
                    <div className="timeline">
                        {mockTimeline.map((event, index) => (
                            <div key={event.id} className="timeline-item">
                                <div className={`timeline-dot ${event.type === 'gap' ? 'gap' : ''} ${event.isActive ? 'active' : ''}`} />
                                <motion.div
                                    className="timeline-content"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    <div className="timeline-header">
                                        <span className="timeline-title">{event.title}</span>
                                        <span className="timeline-date">{event.date}</span>
                                    </div>
                                    <p className="timeline-desc">{event.description}</p>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Life Events */}
            {(activeTab === 'overview' || activeTab === 'events') && (
                <motion.div
                    className="life-events-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3>
                        <Heart size={18} />
                        Life Events
                    </h3>
                    <div className="life-events-grid">
                        {mockLifeEvents.map((event, index) => (
                            <motion.div
                                key={event.id}
                                className="life-event-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <div className={`life-event-icon ${event.type}`}>
                                    {getLifeEventIcon(event.type)}
                                </div>
                                <div className="life-event-content">
                                    <h4>{event.title}</h4>
                                    <p>{event.description}</p>
                                    <div className="life-event-date">
                                        <Calendar size={12} /> {event.date}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Communication Log */}
            {(activeTab === 'overview' || activeTab === 'communications') && (
                <motion.div
                    className="communication-log"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3>
                        <MessageSquare size={18} />
                        Communication Log
                    </h3>
                    <table className="comm-log-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Subject</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockCommunications.map((comm) => (
                                <tr key={comm.id}>
                                    <td>
                                        <span className={`comm-type-badge ${comm.type}`}>
                                            {comm.type === 'email' && <Mail size={12} />}
                                            {comm.type === 'letter' && <FileText size={12} />}
                                            {comm.type === 'sms' && <MessageSquare size={12} />}
                                            {comm.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{comm.subject}</td>
                                    <td>{comm.date}</td>
                                    <td>{comm.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            )}

            {/* Dependent Tracker */}
            {(activeTab === 'overview' || activeTab === 'dependents') && (
                <motion.div
                    className="dependent-tracker"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <h3>
                        <Users size={18} />
                        Dependent Tracker
                    </h3>
                    <div className="dependent-cards">
                        {mockDependents.map((dep, index) => (
                            <motion.div
                                key={dep.id}
                                className="dependent-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <div className="dependent-avatar">
                                    {dep.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="dependent-info">
                                    <h4>{dep.name}</h4>
                                    <p>{dep.relationship} • DOB: {dep.dob}</p>
                                </div>
                                <div className="dependent-status">
                                    <span className={`verification-badge ${dep.verificationStatus}`}>
                                        {getVerificationIcon(dep.verificationStatus)}
                                        {dep.verificationStatus.charAt(0).toUpperCase() + dep.verificationStatus.slice(1)}
                                    </span>
                                    {dep.lastVerified && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                            Last: {dep.lastVerified}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* ACA Status */}
            {(activeTab === 'overview' || activeTab === 'aca') && (
                <motion.div
                    className="aca-status-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <h3>
                        <Activity size={18} />
                        ACA Measurement Status
                    </h3>
                    <div className="aca-metrics-grid">
                        <div className="aca-metric-card">
                            <h4>Employment Status</h4>
                            <div className="aca-metric-value">FT</div>
                            <div className="aca-metric-label">Full-Time</div>
                        </div>
                        <div className="aca-metric-card">
                            <h4>Avg Weekly Hours</h4>
                            <div className="aca-metric-value">42.5</div>
                            <div className="aca-metric-label">hrs/week</div>
                        </div>
                        <div className="aca-metric-card">
                            <h4>Measurement Period</h4>
                            <div className="aca-metric-value">12M</div>
                            <div className="aca-metric-label">Standard</div>
                        </div>
                        <div className="aca-metric-card">
                            <h4>Stability Period</h4>
                            <div className="aca-metric-value">Active</div>
                            <div className="aca-metric-label">Until Dec 2026</div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
