import { motion } from 'framer-motion'
import {
    Shield,
    Heart,
    FileText,
    CreditCard,
    Calendar,
    Clock,
    ChevronRight,
    Bell,
    User,
    Building2,
    AlertCircle,
    CheckCircle2,
    DollarSign,
    Activity
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import { useNavigation } from '../context/NavigationContext'
import './MemberHome.css'

interface QuickAction {
    id: string
    label: string
    description: string
    icon: React.ReactNode
    path: string
    badge?: string
}

interface RecentActivity {
    id: string
    type: 'claim' | 'eob' | 'auth' | 'rx' | 'appointment'
    title: string
    description: string
    date: string
    status: 'completed' | 'pending' | 'action_required'
    amount?: number
}

interface HealthReminder {
    id: string
    title: string
    dueDate: string
    type: 'preventive' | 'followup' | 'medication'
    icon: React.ReactNode
}

const quickActions: QuickAction[] = [
    {
        id: 'find-doctor',
        label: 'Find a Doctor',
        description: 'Search in-network providers',
        icon: <Building2 size={24} />,
        path: '/member/providers'
    },
    {
        id: 'view-eob',
        label: 'View EOBs',
        description: 'Explanation of Benefits',
        icon: <FileText size={24} />,
        path: '/member/eob',
        badge: '2'
    },
    {
        id: 'cost-estimate',
        label: 'Estimate Costs',
        description: 'Get procedure prices',
        icon: <DollarSign size={24} />,
        path: '/member/cost-estimator'
    },
    {
        id: 'id-card',
        label: 'Digital ID Card',
        description: 'Access your ID card',
        icon: <CreditCard size={24} />,
        path: '/member/id-card'
    }
]

const recentActivity: RecentActivity[] = [
    {
        id: 'act-1',
        type: 'claim',
        title: 'Office Visit - Dr. Sarah Chen',
        description: 'Premier Medical Associates',
        date: '2024-01-22',
        status: 'completed',
        amount: 24.00
    },
    {
        id: 'act-2',
        type: 'eob',
        title: 'New EOB Available',
        description: 'MRI Lumbar Spine',
        date: '2024-01-20',
        status: 'action_required'
    },
    {
        id: 'act-3',
        type: 'rx',
        title: 'Prescription Filled',
        description: 'Lisinopril 10mg - 90 day supply',
        date: '2024-01-18',
        status: 'completed',
        amount: 10.00
    },
    {
        id: 'act-4',
        type: 'auth',
        title: 'Prior Auth Approved',
        description: 'Physical Therapy - 12 visits',
        date: '2024-01-15',
        status: 'completed'
    }
]

const healthReminders: HealthReminder[] = [
    {
        id: 'rem-1',
        title: 'Annual Physical Due',
        dueDate: '2024-02-15',
        type: 'preventive',
        icon: <User size={16} />
    },
    {
        id: 'rem-2',
        title: 'Flu Shot Available',
        dueDate: '2024-03-01',
        type: 'preventive',
        icon: <Activity size={16} />
    }
]

export function MemberHome() {
    const { navigate } = useNavigation()
    const memberName = 'Sarah'
    const planName = 'Platinum PPO Plus'

    const formatCurrency = (amount: number) =>
        `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    const getActivityIcon = (type: RecentActivity['type']) => {
        switch (type) {
            case 'claim': return <FileText size={16} />
            case 'eob': return <FileText size={16} />
            case 'auth': return <Shield size={16} />
            case 'rx': return <Heart size={16} />
            case 'appointment': return <Calendar size={16} />
        }
    }

    const getStatusBadge = (status: RecentActivity['status']) => {
        switch (status) {
            case 'completed':
                return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Complete</Badge>
            case 'pending':
                return <Badge variant="warning" icon={<Clock size={10} />}>Pending</Badge>
            case 'action_required':
                return <Badge variant="critical" icon={<AlertCircle size={10} />}>Action Needed</Badge>
        }
    }

    return (
        <div className="member-home">
            {/* Welcome Header */}
            <motion.div
                className="member-home__welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="member-home__greeting">
                    <h1>Welcome back, {memberName}!</h1>
                    <p className="member-home__plan">
                        <Shield size={16} /> {planName}
                    </p>
                </div>
                <div className="member-home__notifications">
                    <button className="notification-button">
                        <Bell size={20} />
                        <span className="notification-badge">3</span>
                    </button>
                </div>
            </motion.div>

            {/* Coverage Summary */}
            <div className="member-home__metrics">
                <MetricCard
                    title="Deductible Remaining"
                    value="$1,050"
                    icon={<CreditCard size={20} />}
                    subtitle="$450 of $1,500 used"
                    trend={{ value: 30, direction: 'down' }}
                />
                <MetricCard
                    title="Out-of-Pocket Remaining"
                    value="$4,800"
                    icon={<Shield size={20} />}
                    subtitle="$1,200 of $6,000 used"
                    variant="teal"
                />
                <MetricCard
                    title="Claims This Year"
                    value="7"
                    icon={<FileText size={20} />}
                    subtitle="$2,847 total billed"
                    variant="success"
                    trend={{ value: 2, direction: 'up' }}
                />
                <MetricCard
                    title="HSA Balance"
                    value="$2,450"
                    icon={<DollarSign size={20} />}
                    subtitle="Available to spend"
                />
            </div>

            {/* Quick Actions */}
            <GlassCard className="member-home__quick-actions">
                <h2>Quick Actions</h2>
                <div className="quick-actions__grid">
                    {quickActions.map((action, index) => (
                        <motion.button
                            key={action.id}
                            className="quick-action netflix-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(action.path)}
                        >
                            <div className="quick-action__icon">{action.icon}</div>
                            <div className="quick-action__content">
                                <span className="quick-action__label">{action.label}</span>
                                <span className="quick-action__description">{action.description}</span>
                            </div>
                            {action.badge && (
                                <span className="quick-action__badge">{action.badge}</span>
                            )}
                            <ChevronRight size={16} className="quick-action__arrow" />
                        </motion.button>
                    ))}
                </div>
            </GlassCard>

            {/* Two Column Layout */}
            <div className="member-home__grid">
                {/* Recent Activity */}
                <GlassCard className="member-home__activity">
                    <div className="activity__header">
                        <h2>Recent Activity</h2>
                        <Button variant="ghost" size="sm">View All</Button>
                    </div>
                    <div className="activity__list">
                        {recentActivity.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className="activity-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="activity-item__icon">
                                    {getActivityIcon(item.type)}
                                </div>
                                <div className="activity-item__info">
                                    <span className="activity-item__title">{item.title}</span>
                                    <span className="activity-item__description">{item.description}</span>
                                </div>
                                <div className="activity-item__meta">
                                    {getStatusBadge(item.status)}
                                    <span className="activity-item__date">{formatDate(item.date)}</span>
                                    {item.amount !== undefined && (
                                        <span className="activity-item__amount">{formatCurrency(item.amount)}</span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Health Reminders */}
                <GlassCard className="member-home__reminders">
                    <div className="reminders__header">
                        <h2>Health Reminders</h2>
                        <Badge variant="info">{healthReminders.length} upcoming</Badge>
                    </div>
                    <div className="reminders__list">
                        {healthReminders.map((reminder, index) => (
                            <motion.div
                                key={reminder.id}
                                className="reminder-item"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="reminder-item__icon">{reminder.icon}</div>
                                <div className="reminder-item__info">
                                    <span className="reminder-item__title">{reminder.title}</span>
                                    <span className="reminder-item__date">
                                        <Calendar size={12} /> Due by {formatDate(reminder.dueDate)}
                                    </span>
                                </div>
                                <Button variant="secondary" size="sm">Schedule</Button>
                            </motion.div>
                        ))}
                    </div>

                    {/* ID Card Preview */}
                    <div className="id-card-preview">
                        <h3>Your ID Card</h3>
                        <div className="id-card">
                            <div className="id-card__header">
                                <span className="id-card__logo">Apex Health</span>
                                <span className="id-card__plan">{planName}</span>
                            </div>
                            <div className="id-card__member">
                                <span className="id-card__name">Sarah Johnson</span>
                                <span className="id-card__id">APX-2024-78432</span>
                            </div>
                            <div className="id-card__details">
                                <div className="id-card__detail">
                                    <span>Group</span>
                                    <span>GRP-APEX-2024</span>
                                </div>
                                <div className="id-card__detail">
                                    <span>PCP Copay</span>
                                    <span>$25</span>
                                </div>
                                <div className="id-card__detail">
                                    <span>Specialist</span>
                                    <span>$50</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="id-card__view-full">
                            View Full Card
                        </Button>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default MemberHome
