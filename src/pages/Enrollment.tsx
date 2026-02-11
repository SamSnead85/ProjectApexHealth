import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Mail,
    Settings,
    Download,
    Search,
    Brain,
    Sparkles,
    Shield,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Heart,
    Activity,
    FileText,
    Zap,
    ChevronRight,
    Eye,
    DollarSign,
    Building2
} from 'lucide-react'
import { GlassCard, Button, Badge } from '../components/common'
import { useToast } from '../components/common/Toast'
import { exportToCSV } from '../utils/exportData'
import './Enrollment.css'

// ============================================
// MOCK DATA - Benefits Administration
// ============================================

const enrollmentStats = {
    total: 487,
    completed: 442,
    inProgress: 28,
    notStarted: 17,
    deadline: 'February 15, 2024',
    daysRemaining: 45
}

const employees = [
    { id: 'EMP-001', name: 'Daniel Johnson', initials: 'DJ', department: 'Engineering', status: 'active', plan: 'PPO Gold', planTier: 'Family', cost: 524, coverageStart: '2024-01-01' },
    { id: 'EMP-002', name: 'Michael Chen', initials: 'MC', department: 'Marketing', status: 'pending', plan: 'HMO Silver', planTier: 'Employee+Spouse', cost: 389, coverageStart: '2024-02-01' },
    { id: 'EMP-003', name: 'Emily Rodriguez', initials: 'ER', department: 'Sales', status: 'active', plan: 'HDHP', planTier: 'Employee', cost: 245, coverageStart: '2024-01-01' },
    { id: 'EMP-004', name: 'James Wilson', initials: 'JW', department: 'Finance', status: 'active', plan: 'PPO Gold', planTier: 'Employee+Child', cost: 412, coverageStart: '2024-01-01' },
    { id: 'EMP-005', name: 'Lisa Thompson', initials: 'LT', department: 'HR', status: 'pending', plan: 'PPO Gold', planTier: 'Family', cost: 524, coverageStart: '2024-02-01' },
    { id: 'EMP-006', name: 'David Kim', initials: 'DK', department: 'IT', status: 'active', plan: 'HMO Silver', planTier: 'Employee', cost: 198, coverageStart: '2024-01-01' },
]

const benefitPlans = [
    { name: 'PPO Gold', enrolled: 245, percent: 50.3, color: '#f59e0b', cost: '$17.9K/mo' },
    { name: 'HMO Silver', enrolled: 156, percent: 32.0, color: '#6366f1', cost: '$9.8K/mo' },
    { name: 'HDHP Bronze', enrolled: 86, percent: 17.7, color: '#10b981', cost: '$4.2K/mo' },
]

const timelineEvents = [
    { event: 'Open Enrollment Period Begins', date: '2024-02-01', status: 'upcoming' },
    { event: 'Life Event: New Baby for John Adams', date: '2024-02-05', status: 'upcoming' },
    { event: 'Termination Processing: Robert Miller', date: '2024-01-15', status: 'complete' },
    { event: 'Quarterly Benefits Review', date: '2024-01-10', status: 'complete' },
]

const aiInsights = [
    { text: 'Based on current enrollment patterns, recommend adding a **Dental Vision Bundle** to increase participation by 12%', confidence: 87 },
    { text: '**23 employees** have not completed enrollment forms. Auto-reminder scheduled for tomorrow.', confidence: 94 },
]

// ============================================
// COMPONENT
// ============================================

export function Enrollment() {
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const progressPercent = Math.round((enrollmentStats.completed / enrollmentStats.total) * 100)

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="benefits-admin">
            {/* Premium Header */}
            <motion.header
                className="benefits-admin__header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="benefits-admin__title-section">
                    <div className="benefits-admin__icon-container">
                        <Heart size={28} />
                        <div className="benefits-admin__icon-pulse" />
                    </div>
                    <div>
                        <h1 className="benefits-admin__title">Benefits Administration</h1>
                        <div className="benefits-admin__subtitle">
                            <span>Employee Management • Plan Configuration • Cost Analysis</span>
                        </div>
                    </div>
                </div>
                <div className="benefits-admin__badges">
                    <div className="benefits-admin__badge benefits-admin__badge--live">
                        Live Sync
                    </div>
                    <div className="benefits-admin__badge">
                        <Zap size={14} />
                        94.5% Enrolled
                    </div>
                </div>
                <div className="benefits-admin__actions">
                    <Button variant="ghost" size="sm" onClick={() => {
                        exportToCSV(employees.map(e => ({
                            'ID': e.id,
                            'Name': e.name,
                            'Department': e.department,
                            'Status': e.status,
                            'Plan': e.plan,
                            'Tier': e.planTier,
                            'Monthly Cost': `$${e.cost}`,
                            'Coverage Start': e.coverageStart,
                        })), 'enrollment_census')
                        addToast({ type: 'success', title: 'Export Complete', message: 'Enrollment census exported to CSV', duration: 3000 })
                    }}>
                        <Download size={16} />
                        Export Census
                    </Button>
                    <Button variant="primary" size="sm">
                        <Users size={16} />
                        Add Employee
                    </Button>
                </div>
            </motion.header>

            {/* Progress Banner */}
            <motion.div
                className="benefits-admin__progress-banner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="benefits-admin__progress-header">
                    <div className="benefits-admin__progress-info">
                        <h2>
                            <Calendar size={22} />
                            Open Enrollment Progress
                            <span className="benefits-admin__ai-tag">
                                <Sparkles size={10} />
                                AI Monitored
                            </span>
                        </h2>
                        <p>Deadline: {enrollmentStats.deadline} • {enrollmentStats.daysRemaining} days remaining</p>
                    </div>
                    <div className="benefits-admin__progress-stats">
                        <motion.div
                            className="benefits-admin__progress-percent"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                        >
                            {progressPercent}%
                        </motion.div>
                        <div className="benefits-admin__progress-meta">
                            {enrollmentStats.completed} of {enrollmentStats.total} employees
                        </div>
                    </div>
                </div>

                <div className="benefits-admin__progress-track">
                    <motion.div
                        className="benefits-admin__progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                </div>

                <div className="benefits-admin__progress-segments">
                    <div className="benefits-admin__progress-segment">
                        <span className="benefits-admin__progress-segment-dot benefits-admin__progress-segment-dot--complete" />
                        <div className="benefits-admin__progress-segment-info">
                            <span className="benefits-admin__progress-segment-label">Completed</span>
                            <span className="benefits-admin__progress-segment-value">{enrollmentStats.completed}</span>
                        </div>
                    </div>
                    <div className="benefits-admin__progress-segment">
                        <span className="benefits-admin__progress-segment-dot benefits-admin__progress-segment-dot--progress" />
                        <div className="benefits-admin__progress-segment-info">
                            <span className="benefits-admin__progress-segment-label">In Progress</span>
                            <span className="benefits-admin__progress-segment-value">{enrollmentStats.inProgress}</span>
                        </div>
                    </div>
                    <div className="benefits-admin__progress-segment">
                        <span className="benefits-admin__progress-segment-dot benefits-admin__progress-segment-dot--not-started" />
                        <div className="benefits-admin__progress-segment-info">
                            <span className="benefits-admin__progress-segment-label">Not Started</span>
                            <span className="benefits-admin__progress-segment-value">{enrollmentStats.notStarted}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Premium Metrics Grid */}
            <div className="benefits-admin__metrics">
                {[
                    { label: 'Total Employees', value: '487', change: '+12', isUp: true, icon: Users, color: '#06b6d4' },
                    { label: 'Monthly Premium', value: '$248K', change: '+4.2%', isUp: false, icon: DollarSign, color: '#f59e0b' },
                    { label: 'Enrollment Rate', value: '94.5%', change: '+2.1%', isUp: true, icon: TrendingUp, color: '#10b981' },
                    { label: 'Days to Deadline', value: '45', change: null, isUp: null, icon: Calendar, color: '#8b5cf6' },
                    { label: 'Pending Actions', value: '23', change: '-8', isUp: true, icon: Clock, color: '#ef4444' },
                    { label: 'Cost per Employee', value: '$509', change: '-2.3%', isUp: true, icon: Activity, color: '#6366f1' },
                ].map((metric, i) => (
                    <motion.div
                        key={metric.label}
                        className="benefits-admin__metric-card"
                        style={{ '--card-glow-color': metric.color } as any}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                    >
                        <div className="benefits-admin__metric-glow" />
                        <div className="benefits-admin__metric-header">
                            <div
                                className="benefits-admin__metric-icon"
                                style={{ background: `${metric.color}15`, color: metric.color }}
                            >
                                <metric.icon size={20} />
                            </div>
                            {metric.change && (
                                <span className={`benefits-admin__metric-trend benefits-admin__metric-trend--${metric.isUp ? 'up' : 'down'}`}>
                                    {metric.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {metric.change}
                                </span>
                            )}
                        </div>
                        <div className="benefits-admin__metric-value">{metric.value}</div>
                        <div className="benefits-admin__metric-label">{metric.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="benefits-admin__grid">
                {/* Employee Roster */}
                <motion.div
                    className="benefits-admin__roster"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="benefits-admin__roster-header">
                        <div className="benefits-admin__roster-title">
                            <Users size={20} />
                            <h3>Employee Roster</h3>
                            <Badge variant="default">{employees.length} employees</Badge>
                        </div>
                        <div className="benefits-admin__roster-search">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <table className="benefits-admin__roster-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Plan</th>
                                <th>Cost/Mo</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((emp, i) => (
                                <motion.tr
                                    key={emp.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 + i * 0.03 }}
                                >
                                    <td>
                                        <div className="benefits-admin__roster-employee">
                                            <div
                                                className="benefits-admin__roster-avatar"
                                                style={{ background: `hsl(${i * 60}, 70%, 40%)` }}
                                            >
                                                {emp.initials}
                                            </div>
                                            <div className="benefits-admin__roster-employee-info">
                                                <span className="benefits-admin__roster-employee-name">{emp.name}</span>
                                                <span className="benefits-admin__roster-employee-id">{emp.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{emp.department}</td>
                                    <td>
                                        <span className={`benefits-admin__roster-status benefits-admin__roster-status--${emp.status}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="benefits-admin__roster-plan">
                                            <span className="benefits-admin__roster-plan-name">{emp.plan}</span>
                                            <span className="benefits-admin__roster-plan-tier">{emp.planTier}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="benefits-admin__roster-cost">${emp.cost}</span>
                                    </td>
                                    <td>
                                        <button className="benefits-admin__roster-action">
                                            Manage
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>

                {/* Sidebar */}
                <div className="benefits-admin__sidebar">
                    {/* AI Insights Panel */}
                    <motion.div
                        className="benefits-admin__ai-panel"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="benefits-admin__ai-header">
                            <div className="benefits-admin__ai-icon">
                                <Brain size={22} />
                            </div>
                            <div>
                                <h3 className="benefits-admin__ai-title">AI Insights</h3>
                                <p className="benefits-admin__ai-subtitle">Powered by Intellisure™</p>
                            </div>
                        </div>
                        {aiInsights.map((insight, i) => (
                            <motion.div
                                key={i}
                                className="benefits-admin__ai-insight"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                            >
                                <p dangerouslySetInnerHTML={{ __html: insight.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </motion.div>
                        ))}
                        <div className="benefits-admin__ai-confidence">
                            <span>Model Confidence</span>
                            <span>94.2%</span>
                        </div>
                    </motion.div>

                    {/* Timeline Events */}
                    <motion.div
                        className="benefits-admin__timeline"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="benefits-admin__timeline-header">
                            <Calendar size={18} />
                            <h3>Upcoming Events</h3>
                        </div>
                        <div className="benefits-admin__timeline-list">
                            {timelineEvents.map((event, i) => (
                                <div key={i} className={`benefits-admin__timeline-item benefits-admin__timeline-item--${event.status}`}>
                                    <div className="benefits-admin__timeline-marker">
                                        <div className="benefits-admin__timeline-dot" />
                                        {i < timelineEvents.length - 1 && <div className="benefits-admin__timeline-line" />}
                                    </div>
                                    <div className="benefits-admin__timeline-content">
                                        <div className="benefits-admin__timeline-event">{event.event}</div>
                                        <div className="benefits-admin__timeline-date">{event.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Plan Distribution */}
                    <motion.div
                        className="benefits-admin__plans"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <div className="benefits-admin__plans-header">
                            <Shield size={18} />
                            <h3>Benefit Plans</h3>
                        </div>
                        {benefitPlans.map((plan, i) => (
                            <motion.div
                                key={plan.name}
                                className="benefits-admin__plan-item"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + i * 0.1 }}
                            >
                                <div
                                    className="benefits-admin__plan-color"
                                    style={{ background: plan.color }}
                                />
                                <div className="benefits-admin__plan-info">
                                    <div className="benefits-admin__plan-name">{plan.name}</div>
                                    <div className="benefits-admin__plan-bar">
                                        <motion.div
                                            className="benefits-admin__plan-fill"
                                            style={{ background: plan.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${plan.percent}%` }}
                                            transition={{ duration: 0.8, delay: 0.9 + i * 0.1 }}
                                        />
                                    </div>
                                </div>
                                <div className="benefits-admin__plan-stats">
                                    <div className="benefits-admin__plan-enrolled">{plan.enrolled}</div>
                                    <div className="benefits-admin__plan-percent">{plan.percent}%</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default Enrollment
