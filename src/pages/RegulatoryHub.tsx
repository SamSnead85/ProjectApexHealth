import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Landmark,
    Scale,
    Heart,
    Building,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle2,
    FileText,
    ChevronLeft,
    ChevronRight,
    Radio,
    Upload,
    ExternalLink,
    AlertCircle,
    Zap
} from 'lucide-react'
import './RegulatoryHub.css'

interface Deadline {
    id: string
    title: string
    type: 'Form 5500' | '1094-C' | '1095-C' | 'State Filing' | 'PCORI'
    dueDate: string
    daysRemaining: number
    priority: 'urgent' | 'warning' | 'normal' | 'complete'
}

interface FeedItem {
    id: string
    source: 'IRS' | 'DOL' | 'HHS' | 'CMS'
    title: string
    summary: string
    date: string
    impact: 'high' | 'medium' | 'low'
    aiSummary?: string
}

interface Filing {
    id: string
    type: string
    client: string
    planYear: string
    deadline: string
    status: 'submitted' | 'pending' | 'not-started' | 'rejected'
    submissionDate?: string
    confirmationNumber?: string
}

const mockDeadlines: Deadline[] = [
    {
        id: '1',
        title: 'PCORI Fee Payment',
        type: 'PCORI',
        dueDate: '2026-07-31',
        daysRemaining: 183,
        priority: 'normal'
    },
    {
        id: '2',
        title: 'Form 5500 Filing',
        type: 'Form 5500',
        dueDate: '2026-07-31',
        daysRemaining: 183,
        priority: 'normal'
    },
    {
        id: '3',
        title: '1095-C Distribution',
        type: '1095-C',
        dueDate: '2026-03-02',
        daysRemaining: 32,
        priority: 'warning'
    },
    {
        id: '4',
        title: '1094-C E-Filing',
        type: '1094-C',
        dueDate: '2026-03-31',
        daysRemaining: 61,
        priority: 'normal'
    }
]

const mockFeedItems: FeedItem[] = [
    {
        id: '1',
        source: 'IRS',
        title: 'Final Regulations on ACA Reporting Requirements Released',
        summary: 'The IRS has issued final regulations clarifying ACA information reporting requirements for employers. Changes affect filing deadlines and penalty calculations for tax year 2026.',
        date: '2026-01-28',
        impact: 'high',
        aiSummary: 'Key changes: Extended deadline for electronic filing, updated penalty amounts, simplified correction procedures.'
    },
    {
        id: '2',
        source: 'DOL',
        title: 'New ERISA Disclosure Requirements for Group Health Plans',
        summary: 'Department of Labor announces enhanced disclosure requirements for group health plan fiduciaries, effective for plan years beginning after January 1, 2027.',
        date: '2026-01-25',
        impact: 'medium'
    },
    {
        id: '3',
        source: 'HHS',
        title: 'Mental Health Parity Compliance Guidance Updated',
        summary: 'HHS releases updated guidance on MHPAEA compliance requirements, including new NQTL comparative analysis requirements.',
        date: '2026-01-22',
        impact: 'high'
    },
    {
        id: '4',
        source: 'CMS',
        title: 'Transparency in Coverage Machine-Readable Files Update',
        summary: 'CMS provides technical guidance on machine-readable file format requirements for the 2026 plan year.',
        date: '2026-01-18',
        impact: 'low'
    }
]

const mockFilings: Filing[] = [
    {
        id: '1',
        type: 'Form 5500',
        client: 'Acme Corporation',
        planYear: '2025',
        deadline: '2026-07-31',
        status: 'not-started'
    },
    {
        id: '2',
        type: '1094-C',
        client: 'TechCorp Industries',
        planYear: '2025',
        deadline: '2026-03-31',
        status: 'pending'
    },
    {
        id: '3',
        type: '1095-C',
        client: 'Global Solutions Inc',
        planYear: '2025',
        deadline: '2026-03-02',
        status: 'submitted',
        submissionDate: '2026-01-15',
        confirmationNumber: 'EFC-2026-00482'
    },
    {
        id: '4',
        type: 'Form 5500',
        client: 'Healthcare Partners',
        planYear: '2024',
        deadline: '2025-07-31',
        status: 'submitted',
        submissionDate: '2025-07-28',
        confirmationNumber: 'DOL-5500-98271'
    },
    {
        id: '5',
        type: 'State Filing',
        client: 'Regional Health Co',
        planYear: '2025',
        deadline: '2026-04-15',
        status: 'rejected'
    }
]

const calendarDays = [
    { day: 1, deadlines: [] as string[] },
    { day: 2, deadlines: ['1095-C'] as string[], priority: 'warning' as const },
    { day: 3, deadlines: [] as string[] },
    { day: 4, deadlines: [] as string[] },
    { day: 5, deadlines: [] as string[] },
    { day: 6, deadlines: [] as string[] },
    { day: 7, deadlines: [] as string[] },
    { day: 8, deadlines: [] as string[] },
    { day: 9, deadlines: [] as string[] },
    { day: 10, deadlines: [] as string[] },
    { day: 11, deadlines: [] as string[] },
    { day: 12, deadlines: [] as string[] },
    { day: 13, deadlines: [] as string[] },
    { day: 14, deadlines: [] as string[] },
    { day: 15, deadlines: ['State'] as string[], priority: 'normal' as const },
    { day: 16, deadlines: [] as string[] },
    { day: 17, deadlines: [] as string[] },
    { day: 18, deadlines: [] as string[] },
    { day: 19, deadlines: [] as string[] },
    { day: 20, deadlines: [] as string[] },
    { day: 21, deadlines: [] as string[] },
    { day: 22, deadlines: [] as string[] },
    { day: 23, deadlines: [] as string[] },
    { day: 24, deadlines: [] as string[] },
    { day: 25, deadlines: [] as string[] },
    { day: 26, deadlines: [] as string[] },
    { day: 27, deadlines: [] as string[] },
    { day: 28, deadlines: [] as string[] },
    { day: 29, deadlines: [] as string[] },
    { day: 30, deadlines: [] as string[] },
    { day: 31, deadlines: ['1094-C'] as string[], priority: 'normal' as const }
]

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function RegulatoryHub() {
    const [activeFilter, setActiveFilter] = useState<string>('all')
    const [currentMonth] = useState('March 2026')
    const [apiDeadlines, setApiDeadlines] = useState<typeof mockDeadlines | null>(null)

    // Fetch regulatory deadlines from API with mock fallback
    useEffect(() => {
        if (!API_BASE) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/v1/analytics/regulatory-deadlines`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.data?.length) setApiDeadlines(data.data);
                }
            } catch { /* use mock data */ }
        })();
    }, []);

    const getDeadlineIcon = (priority: Deadline['priority']) => {
        switch (priority) {
            case 'urgent': return <AlertTriangle size={16} />
            case 'warning': return <Clock size={16} />
            case 'normal': return <Calendar size={16} />
            case 'complete': return <CheckCircle2 size={16} />
        }
    }

    const getSourceIcon = (source: FeedItem['source']) => {
        switch (source) {
            case 'IRS': return <Landmark size={24} />
            case 'DOL': return <Scale size={24} />
            case 'HHS': return <Heart size={24} />
            case 'CMS': return <Building size={24} />
        }
    }

    const getStatusIcon = (status: Filing['status']) => {
        switch (status) {
            case 'submitted': return <CheckCircle2 size={14} />
            case 'pending': return <Clock size={14} />
            case 'not-started': return <AlertCircle size={14} />
            case 'rejected': return <AlertTriangle size={14} />
        }
    }

    const filteredFeed = activeFilter === 'all'
        ? mockFeedItems
        : mockFeedItems.filter(item => item.source.toLowerCase() === activeFilter)

    return (
        <div className="regulatory-hub">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>Regulatory Command Center</h1>
                <p className="page-subtitle">
                    Live regulatory intelligence with compliance tracking and filing management
                </p>
            </motion.div>

            {/* Deadline Countdown Cards */}
            <motion.div
                className="deadline-cards"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {mockDeadlines.map((deadline, index) => (
                    <motion.div
                        key={deadline.id}
                        className={`deadline-card ${deadline.priority}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                    >
                        <div className="deadline-header">
                            <span className="deadline-type">{deadline.type}</span>
                            <div className={`deadline-icon ${deadline.priority}`}>
                                {getDeadlineIcon(deadline.priority)}
                            </div>
                        </div>
                        <div className="deadline-title">{deadline.title}</div>
                        <div className="deadline-date">Due: {deadline.dueDate}</div>
                        <div className={`deadline-countdown ${deadline.priority}`}>
                            {deadline.daysRemaining} days
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Live Regulatory Feed */}
            <motion.div
                className="live-feed-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="live-feed-header">
                    <h2>
                        <Radio size={20} />
                        Live Regulatory Feed
                        <span className="live-indicator">LIVE</span>
                    </h2>
                    <div className="feed-filters">
                        {['all', 'irs', 'dol', 'hhs', 'cms'].map(filter => (
                            <button
                                key={filter}
                                className={`feed-filter-btn ${activeFilter === filter ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="feed-items">
                    {filteredFeed.map((item, index) => (
                        <motion.div
                            key={item.id}
                            className="feed-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <div className={`feed-item-icon ${item.source.toLowerCase()}`}>
                                {getSourceIcon(item.source)}
                            </div>
                            <div className="feed-item-content">
                                <div className="feed-item-header">
                                    <span className={`feed-source-badge ${item.source.toLowerCase()}`}>
                                        {item.source}
                                    </span>
                                    <span className="feed-date">{item.date}</span>
                                </div>
                                <h3 className="feed-title">{item.title}</h3>
                                <p className="feed-summary">{item.summary}</p>
                                {item.aiSummary && (
                                    <p className="feed-summary" style={{ color: 'var(--accent-teal)', fontStyle: 'italic' }}>
                                        <Zap size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                        AI Summary: {item.aiSummary}
                                    </p>
                                )}
                                <span className={`feed-impact ${item.impact}`}>
                                    <AlertTriangle size={12} />
                                    {item.impact.toUpperCase()} IMPACT
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Compliance Calendar */}
            <motion.div
                className="compliance-calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2>
                    <Calendar size={20} />
                    Compliance Calendar
                </h2>
                <div className="calendar-month-nav">
                    <span className="calendar-month">{currentMonth}</span>
                    <div className="month-nav-btns">
                        <button className="month-nav-btn">
                            <ChevronLeft size={18} />
                        </button>
                        <button className="month-nav-btn">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
                <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="calendar-header">{day}</div>
                    ))}
                    {/* Empty cells for alignment (March 2026 starts on Sunday) */}
                    {calendarDays.map((dayInfo) => (
                        <div
                            key={dayInfo.day}
                            className={`calendar-day ${dayInfo.day === 29 ? 'today' : ''} ${dayInfo.deadlines.length > 0 ? `has-deadline ${dayInfo.priority}` : ''}`}
                        >
                            {dayInfo.day}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Filing Tracker */}
            <motion.div
                className="filing-tracker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h2>
                    <FileText size={20} />
                    Filing Tracker
                </h2>
                <table className="filing-table">
                    <thead>
                        <tr>
                            <th>Filing Type</th>
                            <th>Client</th>
                            <th>Plan Year</th>
                            <th>Deadline</th>
                            <th>E-File Status</th>
                            <th>Confirmation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockFilings.map((filing) => (
                            <tr key={filing.id}>
                                <td>
                                    <span className="filing-type-badge">
                                        <FileText size={12} />
                                        {filing.type}
                                    </span>
                                </td>
                                <td>{filing.client}</td>
                                <td>{filing.planYear}</td>
                                <td>{filing.deadline}</td>
                                <td>
                                    <span className={`efile-status ${filing.status}`}>
                                        {getStatusIcon(filing.status)}
                                        {filing.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                </td>
                                <td>
                                    {filing.confirmationNumber || '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    )
}
