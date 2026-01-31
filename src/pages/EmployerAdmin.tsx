import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2,
    Users,
    DollarSign,
    Calendar,
    TrendingUp,
    TrendingDown,
    ChevronRight,
    Download,
    RefreshCw,
    Filter,
    Search,
    Plus,
    UserPlus,
    UserMinus,
    Clock,
    CheckCircle2,
    AlertTriangle,
    FileText,
    CreditCard,
    Shield,
    Heart,
    Pill,
    Eye,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
    PieChart,
    Award,
    Brain,
    Sparkles,
    Zap,
    Activity
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './EmployerAdmin.css'

// ==============================================
// TYPES
// ==============================================

interface Employee {
    id: string
    name: string
    initials: string
    department: string
    hireDate: string
    status: 'active' | 'pending' | 'terminated' | 'cobra'
    planType: string
    tier: 'employee' | 'employee+spouse' | 'employee+child' | 'family'
    monthlyCost: number
    lastAction: string
}

interface BenefitPlan {
    id: string
    name: string
    type: 'medical' | 'dental' | 'vision' | 'life' | 'disability'
    enrolled: number
    eligible: number
    monthlyCost: number
    employerContribution: number
    employeeContribution: number
}

interface UpcomingEvent {
    id: string
    type: 'enrollment' | 'termination' | 'life-event' | 'renewal'
    title: string
    date: string
    employee?: string
    priority: 'high' | 'medium' | 'low'
}

interface AIInsight {
    text: string
    confidence: number
    type: 'recommendation' | 'alert' | 'optimization'
}

// ==============================================
// PREMIUM MOCK DATA
// ==============================================

const employees: Employee[] = [
    { id: 'EMP-001', name: 'Sarah Johnson', initials: 'SJ', department: 'Engineering', hireDate: '2022-03-15', status: 'active', planType: 'PPO Gold', tier: 'family', monthlyCost: 1850, lastAction: 'Annual enrollment' },
    { id: 'EMP-002', name: 'Michael Chen', initials: 'MC', department: 'Marketing', hireDate: '2023-06-01', status: 'active', planType: 'HDHP', tier: 'employee+spouse', monthlyCost: 1250, lastAction: 'Life event - marriage' },
    { id: 'EMP-003', name: 'Emily Rodriguez', initials: 'ER', department: 'Sales', hireDate: '2024-01-08', status: 'pending', planType: 'PPO Silver', tier: 'employee', monthlyCost: 650, lastAction: 'New hire enrollment' },
    { id: 'EMP-004', name: 'James Wilson', initials: 'JW', department: 'Finance', hireDate: '2021-08-22', status: 'active', planType: 'PPO Gold', tier: 'employee+child', monthlyCost: 1450, lastAction: 'Dependent add' },
    { id: 'EMP-005', name: 'Lisa Thompson', initials: 'LT', department: 'HR', hireDate: '2019-11-01', status: 'cobra', planType: 'PPO Gold', tier: 'family', monthlyCost: 2150, lastAction: 'COBRA election' },
    { id: 'EMP-006', name: 'David Kim', initials: 'DK', department: 'Engineering', hireDate: '2023-09-15', status: 'active', planType: 'HDHP', tier: 'employee', monthlyCost: 480, lastAction: 'HSA contribution update' },
]

const benefitPlans: BenefitPlan[] = [
    { id: 'PLN-001', name: 'PPO Gold', type: 'medical', enrolled: 285, eligible: 320, monthlyCost: 142500, employerContribution: 99750, employeeContribution: 42750 },
    { id: 'PLN-002', name: 'HDHP with HSA', type: 'medical', enrolled: 156, eligible: 320, monthlyCost: 62400, employerContribution: 49920, employeeContribution: 12480 },
    { id: 'PLN-003', name: 'Delta Dental PPO', type: 'dental', enrolled: 412, eligible: 487, monthlyCost: 20600, employerContribution: 16480, employeeContribution: 4120 },
    { id: 'PLN-004', name: 'VSP Vision', type: 'vision', enrolled: 389, eligible: 487, monthlyCost: 7780, employerContribution: 5835, employeeContribution: 1945 },
    { id: 'PLN-005', name: 'Basic Life & AD&D', type: 'life', enrolled: 487, eligible: 487, monthlyCost: 4870, employerContribution: 4870, employeeContribution: 0 },
]

const upcomingEvents: UpcomingEvent[] = [
    { id: 'EVT-001', type: 'enrollment', title: 'Open Enrollment Period Begins', date: '2024-03-01', priority: 'high' },
    { id: 'EVT-002', type: 'life-event', title: 'Life Event: New Baby', date: '2024-02-05', employee: 'Jennifer Adams', priority: 'high' },
    { id: 'EVT-003', type: 'termination', title: 'Termination Processing', date: '2024-02-15', employee: 'Robert Miller', priority: 'medium' },
    { id: 'EVT-004', type: 'renewal', title: 'Dental Plan Renewal Review', date: '2024-02-28', priority: 'medium' },
    { id: 'EVT-005', type: 'enrollment', title: 'New Hire 30-Day Deadline', date: '2024-02-08', employee: 'Emily Rodriguez', priority: 'high' },
]

const aiInsights: AIInsight[] = [
    { text: 'Based on utilization patterns, recommend promoting **HDHP with HSA** to reduce employer costs by ~12%', confidence: 91, type: 'optimization' },
    { text: '**3 employees** approaching 30-day enrollment deadline. Auto-reminders scheduled.', confidence: 98, type: 'alert' },
    { text: 'Dental plan renewal in 28 days. Current rates **3.2% below market** - recommend early lock-in.', confidence: 87, type: 'recommendation' },
]

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
}

const getPlanTypeIcon = (type: string): React.ElementType => {
    switch (type) {
        case 'medical': return Heart
        case 'dental': return Shield
        case 'vision': return Eye
        case 'life': return Award
        case 'disability': return Shield
        default: return FileText
    }
}

// ==============================================
// MAIN COMPONENT
// ==============================================

export function EmployerAdmin() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const filteredEmployees = useMemo(() => {
        let emps = employees
        if (statusFilter !== 'all') {
            emps = emps.filter(e => e.status === statusFilter)
        }
        if (searchTerm) {
            emps = emps.filter(e =>
                e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.department.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        return emps
    }, [statusFilter, searchTerm])

    const totalEmployerContribution = benefitPlans.reduce((sum, p) => sum + p.employerContribution, 0)
    const enrollmentRate = 94.5
    const totalEmployees = 487

    return (
        <div className="employer-admin-modern">
            {/* Premium Header */}
            <motion.header
                className="employer-admin-modern__header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="employer-admin-modern__title-section">
                    <div className="employer-admin-modern__icon-container">
                        <Heart size={28} />
                        <div className="employer-admin-modern__icon-pulse" />
                    </div>
                    <div>
                        <h1 className="employer-admin-modern__title">Benefits Administration</h1>
                        <div className="employer-admin-modern__subtitle">
                            <span>Employee Management • Plan Configuration • Cost Analysis</span>
                        </div>
                    </div>
                </div>
                <div className="employer-admin-modern__badges">
                    <div className="employer-admin-modern__badge employer-admin-modern__badge--live">
                        <span className="employer-admin-modern__badge-dot" />
                        Live Sync
                    </div>
                    <div className="employer-admin-modern__badge">
                        <Sparkles size={12} />
                        AI Monitored
                    </div>
                </div>
                <div className="employer-admin-modern__actions">
                    <Button variant="ghost" size="sm" icon={<Download size={16} />}>
                        Export Census
                    </Button>
                    <Button variant="primary" size="sm" icon={<UserPlus size={16} />}>
                        Add Employee
                    </Button>
                </div>
            </motion.header>

            {/* Premium Metrics Grid */}
            <div className="employer-admin-modern__metrics">
                {[
                    { label: 'Total Employees', value: totalEmployees.toString(), change: '+12', isUp: true, icon: Users, color: '#06b6d4' },
                    { label: 'Monthly Premium', value: formatCurrency(totalEmployerContribution * 1.4), change: '+4.2%', isUp: false, icon: DollarSign, color: '#f59e0b' },
                    { label: 'Enrollment Rate', value: `${enrollmentRate}%`, change: '+2.1%', isUp: true, icon: TrendingUp, color: '#10b981' },
                    { label: 'Days to Deadline', value: '45', change: null, isUp: null, icon: Calendar, color: '#8b5cf6' },
                ].map((metric, i) => (
                    <motion.div
                        key={metric.label}
                        className="employer-admin-modern__metric-card"
                        style={{ '--card-glow-color': metric.color } as any}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                    >
                        <div className="employer-admin-modern__metric-glow" />
                        <div className="employer-admin-modern__metric-header">
                            <div
                                className="employer-admin-modern__metric-icon"
                                style={{ background: `${metric.color}15`, color: metric.color }}
                            >
                                <metric.icon size={20} />
                            </div>
                            {metric.change && (
                                <span className={`employer-admin-modern__metric-trend employer-admin-modern__metric-trend--${metric.isUp ? 'up' : 'down'}`}>
                                    {metric.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {metric.change}
                                </span>
                            )}
                        </div>
                        <div className="employer-admin-modern__metric-value">{metric.value}</div>
                        <div className="employer-admin-modern__metric-label">{metric.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="employer-admin-modern__grid">
                {/* Employee Roster */}
                <motion.div
                    className="employer-admin-modern__roster"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="employer-admin-modern__roster-header">
                        <div className="employer-admin-modern__roster-title">
                            <Users size={20} />
                            <h3>Employee Roster</h3>
                            <Badge variant="default">{employees.length} employees</Badge>
                        </div>
                        <div className="employer-admin-modern__roster-controls">
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="cobra">COBRA</option>
                                <option value="terminated">Terminated</option>
                            </select>
                            <div className="employer-admin-modern__roster-search">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <table className="employer-admin-modern__roster-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Plan</th>
                                <th>Tier</th>
                                <th>Monthly</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((emp, i) => (
                                <motion.tr
                                    key={emp.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 + i * 0.03 }}
                                >
                                    <td>
                                        <div className="employer-admin-modern__employee">
                                            <div
                                                className="employer-admin-modern__avatar"
                                                style={{ background: `hsl(${i * 60}, 70%, 40%)` }}
                                            >
                                                {emp.initials}
                                            </div>
                                            <div className="employer-admin-modern__employee-info">
                                                <span className="employer-admin-modern__employee-name">{emp.name}</span>
                                                <span className="employer-admin-modern__employee-id">{emp.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{emp.department}</td>
                                    <td>
                                        <span className={`employer-admin-modern__status employer-admin-modern__status--${emp.status}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td>{emp.planType}</td>
                                    <td>{emp.tier}</td>
                                    <td className="employer-admin-modern__cost">{formatCurrency(emp.monthlyCost)}</td>
                                    <td>
                                        <button className="employer-admin-modern__manage-btn">Manage</button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>

                {/* Sidebar */}
                <div className="employer-admin-modern__sidebar">
                    {/* AI Insights Panel */}
                    <motion.div
                        className="employer-admin-modern__ai-panel"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="employer-admin-modern__ai-header">
                            <div className="employer-admin-modern__ai-icon">
                                <Brain size={22} />
                            </div>
                            <div>
                                <h3 className="employer-admin-modern__ai-title">AI Insights</h3>
                                <p className="employer-admin-modern__ai-subtitle">Powered by Intellisure™</p>
                            </div>
                        </div>
                        {aiInsights.map((insight, i) => (
                            <motion.div
                                key={i}
                                className={`employer-admin-modern__ai-insight employer-admin-modern__ai-insight--${insight.type}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                            >
                                <p dangerouslySetInnerHTML={{ __html: insight.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                <div className="employer-admin-modern__ai-confidence">
                                    <Activity size={10} />
                                    <span>{insight.confidence}% confidence</span>
                                </div>
                            </motion.div>
                        ))}
                        <div className="employer-admin-modern__ai-footer">
                            <span>Model Confidence</span>
                            <span>94.2%</span>
                        </div>
                    </motion.div>

                    {/* Benefit Plans */}
                    <motion.div
                        className="employer-admin-modern__plans"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="employer-admin-modern__plans-header">
                            <Shield size={18} />
                            <h3>Benefit Plans</h3>
                            <span className="employer-admin-modern__cost-tag">ER: {formatCurrency(totalEmployerContribution)}/mo</span>
                        </div>
                        {benefitPlans.map((plan, i) => {
                            const Icon = getPlanTypeIcon(plan.type)
                            const rate = (plan.enrolled / plan.eligible) * 100
                            return (
                                <motion.div
                                    key={plan.id}
                                    className="employer-admin-modern__plan-item"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.05 }}
                                >
                                    <div className="employer-admin-modern__plan-icon">
                                        <Icon size={14} />
                                    </div>
                                    <div className="employer-admin-modern__plan-info">
                                        <div className="employer-admin-modern__plan-name">{plan.name}</div>
                                        <div className="employer-admin-modern__plan-bar">
                                            <motion.div
                                                className="employer-admin-modern__plan-fill"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${rate}%` }}
                                                transition={{ duration: 0.8, delay: 0.7 + i * 0.05 }}
                                            />
                                        </div>
                                    </div>
                                    <div className="employer-admin-modern__plan-stats">
                                        <span className="employer-admin-modern__plan-enrolled">{plan.enrolled}/{plan.eligible}</span>
                                        <span className="employer-admin-modern__plan-percent">{rate.toFixed(0)}%</span>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>

                    {/* Upcoming Events */}
                    <motion.div
                        className="employer-admin-modern__events"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="employer-admin-modern__events-header">
                            <Calendar size={18} />
                            <h3>Upcoming Events</h3>
                            <Badge variant="warning" size="sm">
                                {upcomingEvents.filter(e => e.priority === 'high').length} urgent
                            </Badge>
                        </div>
                        <div className="employer-admin-modern__events-list">
                            {upcomingEvents.slice(0, 4).map((event, i) => (
                                <div key={event.id} className={`employer-admin-modern__event employer-admin-modern__event--${event.priority}`}>
                                    <div className="employer-admin-modern__event-marker">
                                        <div className="employer-admin-modern__event-dot" />
                                        {i < 3 && <div className="employer-admin-modern__event-line" />}
                                    </div>
                                    <div className="employer-admin-modern__event-content">
                                        <div className="employer-admin-modern__event-title">{event.title}</div>
                                        {event.employee && <div className="employer-admin-modern__event-employee">{event.employee}</div>}
                                        <div className="employer-admin-modern__event-date">{event.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default EmployerAdmin
