import { useState, useEffect } from 'react'
import { useNavigation } from '../context/NavigationContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    Heart,
    Eye as VisionIcon,
    Shield,
    DollarSign,
    Calendar,
    UserPlus,
    UserMinus,
    FileText,
    Download,
    CreditCard,
    TrendingUp,
    CheckCircle2,
    Clock,
    Building2,
    ArrowUpRight,
    ArrowDownRight,
    Brain,
    Sparkles,
    AlertTriangle,
    ChevronRight,
    Activity,
    Zap
} from 'lucide-react'
import { GlassCard, Button, Badge } from '../components/common'
import './EmployerPortal.css'

// ============================================
// PREMIUM MOCK DATA - Employer Command Center
// ============================================

interface Plan {
    id: number
    name: string
    carrier: string
    type: 'medical' | 'dental' | 'vision' | 'life'
    enrolled: number
    premium: number
    trend: number
}

interface BillingItem {
    date: string
    amount: number
    status: 'paid' | 'pending' | 'overdue'
    paidDate?: string
}

interface CensusChange {
    type: 'add' | 'remove' | 'change'
    name: string
    date: string
    action: string
}

interface EmployeeMetric {
    eligible: number
    enrolled: number
    pending: number
    waived: number
}

const plans: Plan[] = [
    { id: 1, name: 'Gold PPO Plan', carrier: 'Blue Shield', type: 'medical', enrolled: 892, premium: 485000, trend: 3.2 },
    { id: 2, name: 'Delta Dental Premier', carrier: 'Delta Dental', type: 'dental', enrolled: 1045, premium: 42000, trend: 1.8 },
    { id: 3, name: 'VSP Choice Plan', carrier: 'VSP', type: 'vision', enrolled: 978, premium: 18500, trend: 0.5 },
    { id: 4, name: 'Basic Life + AD&D', carrier: 'MetLife', type: 'life', enrolled: 1250, premium: 15800, trend: 0 },
]

const billingHistory: BillingItem[] = [
    { date: 'Feb 2024', amount: 561300, status: 'pending' },
    { date: 'Jan 2024', amount: 547850, status: 'paid', paidDate: 'Feb 1, 2024' },
    { date: 'Dec 2023', amount: 545200, status: 'paid', paidDate: 'Jan 2, 2024' },
    { date: 'Nov 2023', amount: 543600, status: 'paid', paidDate: 'Dec 1, 2023' },
]

const censusChanges: CensusChange[] = [
    { type: 'add', name: 'Sarah Johnson', date: '2 hours ago', action: 'New hire enrollment' },
    { type: 'add', name: 'Michael Chen', date: '1 day ago', action: 'Benefits election' },
    { type: 'change', name: 'Emily Rodriguez', date: '2 days ago', action: 'Added dependent' },
    { type: 'remove', name: 'Robert Williams', date: '1 week ago', action: 'Termination' },
]

const employeeMetrics: EmployeeMetric = {
    eligible: 1350,
    enrolled: 1250,
    pending: 65,
    waived: 35,
}

const enrollmentProgress = 92.6
const complianceScore = 98.4

// ============================================
// HELPER FUNCTIONS
// ============================================

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'medical': return Heart
        case 'dental': return FileText
        case 'vision': return VisionIcon
        case 'life': return Shield
        default: return FileText
    }
}

const getTypeColor = (type: string) => {
    switch (type) {
        case 'medical': return '#ef4444'
        case 'dental': return '#06b6d4'
        case 'vision': return '#8b5cf6'
        case 'life': return '#10b981'
        default: return '#6b7280'
    }
}

// ============================================
// MAIN COMPONENT
// ============================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function EmployerPortal() {
    const { navigate } = useNavigation()
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
    const [apiEmployerData, setApiEmployerData] = useState<any>(null)

    // Fetch employer dashboard data from API with mock fallback
    useEffect(() => {
        if (!API_BASE) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/v1/analytics/employer-dashboard`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.data) setApiEmployerData(data.data);
                }
            } catch { /* use mock data */ }
        })();
    }, []);

    const totalPremium = plans.reduce((sum, p) => sum + p.premium, 0)
    const totalEnrolled = plans.reduce((sum, p) => sum + p.enrolled, 0)

    return (
        <div className="employer-command">
            {/* Premium Header */}
            <motion.header
                className="ecc__header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="ecc__header-left">
                    <div className="ecc__icon-container">
                        <Building2 size={28} />
                        <div className="ecc__icon-pulse" />
                    </div>
                    <div>
                        <h1 className="ecc__title">Employer Command Center</h1>
                        <div className="ecc__subtitle">
                            <span>Innovate Dynamics Health</span>
                            <Badge variant="default">Group #GRP-5621</Badge>
                        </div>
                    </div>
                </div>
                <div className="ecc__header-badges">
                    <div className="ecc__badge ecc__badge--compliance">
                        <Shield size={14} />
                        {complianceScore}% Compliant
                    </div>
                    <div className="ecc__badge ecc__badge--ai">
                        <Sparkles size={14} />
                        AI Insights
                    </div>
                </div>
                <div className="ecc__header-actions">
                    <Button variant="ghost" size="sm">
                        <Download size={16} />
                        Export Data
                    </Button>
                    <Button variant="primary" size="sm">
                        <UserPlus size={16} />
                        Add Employee
                    </Button>
                </div>
            </motion.header>

            {/* Premium Metrics */}
            <div className="ecc__metrics">
                {[
                    { label: 'Total Employees', value: employeeMetrics.eligible.toLocaleString(), icon: Users, color: '#06b6d4', change: 3.2 },
                    { label: 'Enrolled Members', value: employeeMetrics.enrolled.toLocaleString(), icon: CheckCircle2, color: '#10b981', change: 2.8 },
                    { label: 'Monthly Premium', value: `$${(totalPremium / 1000).toFixed(0)}K`, icon: DollarSign, color: '#8b5cf6', change: 1.5 },
                    { label: 'Enrollment Rate', value: `${enrollmentProgress}%`, icon: TrendingUp, color: '#f59e0b', change: 2.1 },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="ecc__stat-card"
                        style={{ '--stat-color': stat.color } as any}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                    >
                        <div className="ecc__stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={20} />
                        </div>
                        <div className="ecc__stat-content">
                            <div className="ecc__stat-value">{stat.value}</div>
                            <div className="ecc__stat-label">{stat.label}</div>
                        </div>
                        <div className="ecc__stat-change" style={{ color: stat.change >= 0 ? '#10b981' : '#ef4444' }}>
                            {stat.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            <span>{Math.abs(stat.change)}%</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="ecc__grid">
                {/* Left Column - Plans & Enrollment */}
                <div className="ecc__main">
                    {/* Enrollment Progress */}
                    <motion.div
                        className="ecc__enrollment-tracker"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="ecc__section-header">
                            <div className="ecc__section-title">
                                <Activity size={20} />
                                <h2>Open Enrollment Progress</h2>
                            </div>
                            <Badge variant="info">Ends Feb 15, 2024</Badge>
                        </div>
                        <div className="ecc__progress-container">
                            <div className="ecc__progress-header">
                                <span>Overall Completion</span>
                                <span className="ecc__progress-value">{enrollmentProgress}%</span>
                            </div>
                            <div className="ecc__progress-bar">
                                <motion.div
                                    className="ecc__progress-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${enrollmentProgress}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                />
                            </div>
                            <div className="ecc__progress-stats">
                                <div className="ecc__progress-stat ecc__progress-stat--enrolled">
                                    <span className="ecc__progress-stat-value">{employeeMetrics.enrolled}</span>
                                    <span className="ecc__progress-stat-label">Enrolled</span>
                                </div>
                                <div className="ecc__progress-stat ecc__progress-stat--pending">
                                    <span className="ecc__progress-stat-value">{employeeMetrics.pending}</span>
                                    <span className="ecc__progress-stat-label">In Progress</span>
                                </div>
                                <div className="ecc__progress-stat ecc__progress-stat--waived">
                                    <span className="ecc__progress-stat-value">{employeeMetrics.waived}</span>
                                    <span className="ecc__progress-stat-label">Waived</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Plan Summary */}
                    <motion.div
                        className="ecc__plans"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="ecc__section-header">
                            <div className="ecc__section-title">
                                <Heart size={20} />
                                <h2>Benefit Plans</h2>
                            </div>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>
                        <div className="ecc__plans-grid">
                            {plans.map((plan, i) => {
                                const TypeIcon = getTypeIcon(plan.type)
                                const typeColor = getTypeColor(plan.type)
                                return (
                                    <motion.div
                                        key={plan.id}
                                        className="ecc__plan-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 + i * 0.05 }}
                                        onClick={() => setSelectedPlan(plan)}
                                    >
                                        <div className="ecc__plan-header">
                                            <div
                                                className="ecc__plan-icon"
                                                style={{ background: `${typeColor}15`, color: typeColor }}
                                            >
                                                <TypeIcon size={20} />
                                            </div>
                                            <div className="ecc__plan-info">
                                                <div className="ecc__plan-name">{plan.name}</div>
                                                <div className="ecc__plan-carrier">{plan.carrier}</div>
                                            </div>
                                        </div>
                                        <div className="ecc__plan-stats">
                                            <div className="ecc__plan-stat">
                                                <span className="ecc__plan-stat-value">{plan.enrolled.toLocaleString()}</span>
                                                <span className="ecc__plan-stat-label">enrolled</span>
                                            </div>
                                            <div className="ecc__plan-stat">
                                                <span className="ecc__plan-stat-value">${(plan.premium / 1000).toFixed(0)}K</span>
                                                <span className="ecc__plan-stat-label">monthly</span>
                                            </div>
                                            {plan.trend !== 0 && (
                                                <div className={`ecc__plan-trend ${plan.trend >= 0 ? 'positive' : 'negative'}`}>
                                                    {plan.trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                    {Math.abs(plan.trend)}%
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="ecc__sidebar">
                    {/* Billing Card */}
                    <motion.div
                        className="ecc__billing"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="ecc__billing-header">
                            <CreditCard size={18} />
                            <h3>Billing</h3>
                            <Button variant="ghost" size="sm">Pay Now</Button>
                        </div>
                        <div className="ecc__billing-current">
                            <div className="ecc__billing-label">Current Invoice</div>
                            <div className="ecc__billing-amount">${billingHistory[0].amount.toLocaleString()}</div>
                            <div className="ecc__billing-due">Due: February 15, 2024</div>
                        </div>
                        <div className="ecc__billing-history">
                            <div className="ecc__billing-history-title">Recent Payments</div>
                            {billingHistory.slice(1).map((item, i) => (
                                <motion.div
                                    key={item.date}
                                    className="ecc__billing-item"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 + i * 0.05 }}
                                >
                                    <span className="ecc__billing-item-date">{item.date}</span>
                                    <span className="ecc__billing-item-amount">${item.amount.toLocaleString()}</span>
                                    <span className="ecc__billing-item-status">
                                        <CheckCircle2 size={12} />
                                        Paid
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Census Activity */}
                    <motion.div
                        className="ecc__census"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="ecc__census-header">
                            <Users size={18} />
                            <h3>Census Activity</h3>
                            <Button variant="ghost" size="sm">Manage</Button>
                        </div>
                        <div className="ecc__census-stats">
                            <div className="ecc__census-stat">
                                <span className="ecc__census-stat-value">{employeeMetrics.eligible.toLocaleString()}</span>
                                <span className="ecc__census-stat-label">Employees</span>
                            </div>
                            <div className="ecc__census-stat">
                                <span className="ecc__census-stat-value">2,170</span>
                                <span className="ecc__census-stat-label">Dependents</span>
                            </div>
                        </div>
                        <div className="ecc__census-changes">
                            <div className="ecc__census-changes-title">Recent Changes</div>
                            {censusChanges.map((change, i) => (
                                <motion.div
                                    key={i}
                                    className={`ecc__census-change ecc__census-change--${change.type}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.55 + i * 0.05 }}
                                >
                                    <div className="ecc__census-change-icon">
                                        {change.type === 'add' && <UserPlus size={14} />}
                                        {change.type === 'remove' && <UserMinus size={14} />}
                                        {change.type === 'change' && <Activity size={14} />}
                                    </div>
                                    <div className="ecc__census-change-info">
                                        <span className="ecc__census-change-name">{change.name}</span>
                                        <span className="ecc__census-change-action">{change.action}</span>
                                    </div>
                                    <span className="ecc__census-change-date">{change.date}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default EmployerPortal
