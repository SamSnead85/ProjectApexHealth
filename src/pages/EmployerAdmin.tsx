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
    Award
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './EmployerAdmin.css'

// Types
interface Employee {
    id: string
    name: string
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

interface EmployerMetric {
    label: string
    value: string | number
    change: number
    trend: 'up' | 'down' | 'neutral'
    icon: React.ElementType
    color: string
}

// Mock Data
const employerMetrics: EmployerMetric[] = [
    { label: 'Total Employees', value: 487, change: 3.2, trend: 'up', icon: Users, color: '#3B82F6' },
    { label: 'Monthly Premium', value: 245800, change: 5.1, trend: 'up', icon: DollarSign, color: '#EF4444' },
    { label: 'Enrollment Rate', value: '94.5%', change: 1.8, trend: 'up', icon: CheckCircle2, color: '#10B981' },
    { label: 'Days to Open Enrollment', value: 45, change: 0, trend: 'neutral', icon: Calendar, color: '#F59E0B' },
]

const employees: Employee[] = [
    { id: 'EMP-001', name: 'Sarah Johnson', department: 'Engineering', hireDate: '2022-03-15', status: 'active', planType: 'PPO Gold', tier: 'family', monthlyCost: 1850, lastAction: 'Annual enrollment' },
    { id: 'EMP-002', name: 'Michael Chen', department: 'Marketing', hireDate: '2023-06-01', status: 'active', planType: 'HDHP', tier: 'employee+spouse', monthlyCost: 1250, lastAction: 'Life event - marriage' },
    { id: 'EMP-003', name: 'Emily Rodriguez', department: 'Sales', hireDate: '2024-01-08', status: 'pending', planType: 'PPO Silver', tier: 'employee', monthlyCost: 650, lastAction: 'New hire enrollment' },
    { id: 'EMP-004', name: 'James Wilson', department: 'Finance', hireDate: '2021-08-22', status: 'active', planType: 'PPO Gold', tier: 'employee+child', monthlyCost: 1450, lastAction: 'Dependent add' },
    { id: 'EMP-005', name: 'Lisa Thompson', department: 'HR', hireDate: '2019-11-01', status: 'cobra', planType: 'PPO Gold', tier: 'family', monthlyCost: 2150, lastAction: 'COBRA election' },
    { id: 'EMP-006', name: 'David Kim', department: 'Engineering', hireDate: '2023-09-15', status: 'active', planType: 'HDHP', tier: 'employee', monthlyCost: 480, lastAction: 'HSA contribution update' },
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

// Utility functions
const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
}

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'active': return '#10B981'
        case 'pending': return '#F59E0B'
        case 'terminated': return '#EF4444'
        case 'cobra': return '#8B5CF6'
        default: return '#6B7280'
    }
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

// Components
const MetricCard = ({ metric, index }: { metric: EmployerMetric; index: number }) => {
    const Icon = metric.icon
    const formattedValue = typeof metric.value === 'number' && metric.label.includes('Premium')
        ? formatCurrency(metric.value)
        : typeof metric.value === 'number'
            ? metric.value.toLocaleString()
            : metric.value

    return (
        <motion.div
            className="employer-metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <div className="employer-metric-card__header">
                <div className="employer-metric-card__icon" style={{ background: `${metric.color}15`, color: metric.color }}>
                    <Icon size={20} />
                </div>
                {metric.trend !== 'neutral' && (
                    <div className={`employer-metric-card__trend employer-metric-card__trend--${metric.trend}`}>
                        {metric.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
                    </div>
                )}
            </div>
            <div className="employer-metric-card__value">{formattedValue}</div>
            <div className="employer-metric-card__label">{metric.label}</div>
        </motion.div>
    )
}

const EmployeeRow = ({ employee, index }: { employee: Employee; index: number }) => (
    <motion.div
        className="employee-row"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
    >
        <div className="employee-row__info">
            <span className="employee-row__name">{employee.name}</span>
            <span className="employee-row__id">{employee.id}</span>
        </div>
        <span className="employee-row__dept">{employee.department}</span>
        <Badge
            variant={employee.status === 'active' ? 'success' : employee.status === 'pending' ? 'warning' : employee.status === 'cobra' ? 'info' : 'critical'}
            size="sm"
        >
            {employee.status}
        </Badge>
        <span className="employee-row__plan">{employee.planType}</span>
        <span className="employee-row__tier">{employee.tier}</span>
        <span className="employee-row__cost">{formatCurrency(employee.monthlyCost)}</span>
        <Button variant="ghost" size="sm">Manage</Button>
    </motion.div>
)

const BenefitPlanCard = ({ plan, index }: { plan: BenefitPlan; index: number }) => {
    const Icon = getPlanTypeIcon(plan.type)
    const enrollmentRate = (plan.enrolled / plan.eligible) * 100

    return (
        <motion.div
            className="benefit-plan-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <div className="benefit-plan-card__header">
                <div className="benefit-plan-card__icon">
                    <Icon size={18} />
                </div>
                <div className="benefit-plan-card__info">
                    <span className="benefit-plan-card__name">{plan.name}</span>
                    <span className="benefit-plan-card__type">{plan.type}</span>
                </div>
            </div>
            <div className="benefit-plan-card__enrollment">
                <div className="benefit-plan-card__enrollment-bar">
                    <motion.div
                        className="benefit-plan-card__enrollment-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${enrollmentRate}%` }}
                        transition={{ delay: index * 0.05, duration: 0.5 }}
                    />
                </div>
                <span>{plan.enrolled}/{plan.eligible} enrolled ({enrollmentRate.toFixed(0)}%)</span>
            </div>
            <div className="benefit-plan-card__costs">
                <div className="benefit-plan-card__cost-item">
                    <span>Employer</span>
                    <strong>{formatCurrency(plan.employerContribution)}</strong>
                </div>
                <div className="benefit-plan-card__cost-item">
                    <span>Employee</span>
                    <strong>{formatCurrency(plan.employeeContribution)}</strong>
                </div>
            </div>
        </motion.div>
    )
}

const EventCard = ({ event, index }: { event: UpcomingEvent; index: number }) => {
    const getEventIcon = () => {
        switch (event.type) {
            case 'enrollment': return <UserPlus size={16} />
            case 'termination': return <UserMinus size={16} />
            case 'life-event': return <Heart size={16} />
            case 'renewal': return <RefreshCw size={16} />
            default: return <Calendar size={16} />
        }
    }

    return (
        <motion.div
            className={`event-card event-card--${event.priority}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <div className="event-card__icon">{getEventIcon()}</div>
            <div className="event-card__content">
                <span className="event-card__title">{event.title}</span>
                {event.employee && <span className="event-card__employee">{event.employee}</span>}
            </div>
            <div className="event-card__date">
                <Calendar size={12} />
                <span>{event.date}</span>
            </div>
        </motion.div>
    )
}

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

    const totalMonthlyPremium = benefitPlans.reduce((sum, p) => sum + p.monthlyCost, 0)
    const totalEmployerContribution = benefitPlans.reduce((sum, p) => sum + p.employerContribution, 0)

    return (
        <div className="employer-admin">
            {/* Header */}
            <div className="employer-admin__header">
                <div className="employer-admin__header-content">
                    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        Benefits Administration
                    </motion.h1>
                    <p>Employee Management • Plan Configuration • Cost Analysis</p>
                </div>
                <div className="employer-admin__header-actions">
                    <Button variant="secondary" icon={<Download size={16} />}>Export Census</Button>
                    <Button variant="primary" icon={<UserPlus size={16} />}>Add Employee</Button>
                </div>
            </div>

            {/* Metrics */}
            <section className="employer-admin__metrics">
                {employerMetrics.map((metric, index) => (
                    <MetricCard key={metric.label} metric={metric} index={index} />
                ))}
            </section>

            {/* Main Grid */}
            <div className="employer-admin__grid">
                {/* Employee Roster */}
                <GlassCard className="employer-admin__card employer-admin__card--employees">
                    <div className="employer-admin__card-header">
                        <h3><Users size={18} /> Employee Roster</h3>
                        <div className="employer-admin__filters">
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="cobra">COBRA</option>
                                <option value="terminated">Terminated</option>
                            </select>
                            <div className="employer-admin__search">
                                <Search size={14} />
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="employer-admin__roster-header">
                        <span>Employee</span>
                        <span>Department</span>
                        <span>Status</span>
                        <span>Plan</span>
                        <span>Tier</span>
                        <span>Monthly</span>
                        <span></span>
                    </div>
                    <div className="employer-admin__roster-list">
                        {filteredEmployees.map((employee, index) => (
                            <EmployeeRow key={employee.id} employee={employee} index={index} />
                        ))}
                    </div>
                </GlassCard>

                {/* Benefit Plans */}
                <GlassCard className="employer-admin__card employer-admin__card--plans">
                    <div className="employer-admin__card-header">
                        <h3><Shield size={18} /> Benefit Plans</h3>
                        <span className="employer-admin__cost-summary">
                            ER Cost: <strong>{formatCurrency(totalEmployerContribution)}</strong>/mo
                        </span>
                    </div>
                    <div className="employer-admin__plans-grid">
                        {benefitPlans.map((plan, index) => (
                            <BenefitPlanCard key={plan.id} plan={plan} index={index} />
                        ))}
                    </div>
                </GlassCard>

                {/* Upcoming Events */}
                <GlassCard className="employer-admin__card employer-admin__card--events">
                    <div className="employer-admin__card-header">
                        <h3><Calendar size={18} /> Upcoming Events</h3>
                        <Badge variant="warning" size="sm">
                            {upcomingEvents.filter(e => e.priority === 'high').length} High Priority
                        </Badge>
                    </div>
                    <div className="employer-admin__events-list">
                        {upcomingEvents.map((event, index) => (
                            <EventCard key={event.id} event={event} index={index} />
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default EmployerAdmin
