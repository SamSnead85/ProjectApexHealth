import { useState, useEffect } from 'react'
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
    Activity,
    Wallet,
    Smartphone,
    QrCode,
    PiggyBank,
    ArrowRight,
    Stethoscope,
    Pill,
    Siren,
    CircleDollarSign
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard, PageSkeleton } from '../components/common'
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

// Phase 4A: Digital Health Wallet - Member ID Card data
const memberCardData = {
    name: 'Sarah Johnson',
    memberId: 'APX-2024-78432',
    groupNumber: 'GRP-APEX-2024',
    planName: 'Platinum PPO Plus',
    effectiveDate: '01/01/2024',
    pcp: 'Dr. Sarah Chen',
    rxBin: '004336',
    rxPcn: 'ADV'
}

// Phase 4A: HSA/FSA Balances
const accountBalances = {
    hsa: { balance: 2847.50, contributed: 2847.50, annualLimit: 4150, spent: 1302.50 },
    fsa: { balance: 1250.00, elected: 2850.00, spent: 1600.00 }
}

// Phase 4A: Benefits Usage
const benefitsUsage = [
    { label: 'Individual Deductible', used: 1200, total: 3000, color: 'teal' as const },
    { label: 'Family Deductible', used: 2400, total: 6000, color: 'teal' as const },
    { label: 'Out-of-Pocket Maximum', used: 3200, total: 8000, color: 'amber' as const }
]

// Phase 4A: Copay Quick Reference
const copaySchedule = [
    { label: 'PCP Visit', amount: 25, icon: <Stethoscope size={14} /> },
    { label: 'Specialist', amount: 50, icon: <User size={14} /> },
    { label: 'Urgent Care', amount: 75, icon: <Siren size={14} /> },
    { label: 'ER', amount: 250, icon: <AlertCircle size={14} /> },
    { label: 'Generic Rx', amount: 10, icon: <Pill size={14} /> },
    { label: 'Brand Rx', amount: 35, icon: <Pill size={14} /> }
]

// Mock QR code pattern (8x8 grid, 1=dark, 0=light)
const qrPattern = [
    [1,1,1,1,1,1,1,0],
    [1,0,0,0,0,0,1,0],
    [1,0,1,1,1,0,1,0],
    [1,0,1,1,1,0,1,1],
    [1,0,1,1,1,0,1,0],
    [1,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,0],
    [0,0,0,1,0,1,0,1]
]

export function MemberHome() {
    const [loading, setLoading] = useState(true)
    useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t) }, [])
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

    const hsaPercent = (accountBalances.hsa.spent / accountBalances.hsa.annualLimit) * 100
    const fsaPercent = (accountBalances.fsa.spent / accountBalances.fsa.elected) * 100

    if (loading) return <PageSkeleton />

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
                    <button className="notification-button" aria-label="Notifications, 3 unread">
                        <Bell size={20} />
                        <span className="notification-badge" aria-hidden="true">3</span>
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
                            aria-label={`${action.label}: ${action.description}`}
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

            {/* Phase 4A: Digital Health Wallet Section */}
            <motion.div
                className="member-home__wallet-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="wallet-section__header">
                    <h2><Wallet size={20} /> Digital Health Wallet</h2>
                    <Badge variant="info" icon={<QrCode size={10} />}>Phase 4A</Badge>
                </div>

                <div className="wallet-section__grid">
                    {/* Digital ID Card with QR Code */}
                    <GlassCard className="digital-id-card">
                        <div className="digital-id-card__inner">
                            <div className="digital-id-card__front">
                                <div className="digital-id-card__top">
                                    <div className="digital-id-card__branding">
                                        <span className="digital-id-card__logo">Apex Health</span>
                                        <span className="digital-id-card__plan-badge">{memberCardData.planName}</span>
                                    </div>
                                    <div className="digital-id-card__qr">
                                        <div className="qr-code-mock">
                                            {qrPattern.map((row, ri) => (
                                                <div key={ri} className="qr-row">
                                                    {row.map((cell, ci) => (
                                                        <div
                                                            key={ci}
                                                            className={`qr-cell ${cell ? 'qr-cell--dark' : 'qr-cell--light'}`}
                                                        />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="digital-id-card__member-info">
                                    <span className="digital-id-card__name">{memberCardData.name}</span>
                                    <span className="digital-id-card__member-id">
                                        ID: {memberCardData.memberId}
                                    </span>
                                </div>

                                <div className="digital-id-card__details-grid">
                                    <div className="digital-id-card__field">
                                        <span className="digital-id-card__field-label">Group #</span>
                                        <span className="digital-id-card__field-value">{memberCardData.groupNumber}</span>
                                    </div>
                                    <div className="digital-id-card__field">
                                        <span className="digital-id-card__field-label">Effective</span>
                                        <span className="digital-id-card__field-value">{memberCardData.effectiveDate}</span>
                                    </div>
                                    <div className="digital-id-card__field">
                                        <span className="digital-id-card__field-label">PCP</span>
                                        <span className="digital-id-card__field-value">{memberCardData.pcp}</span>
                                    </div>
                                    <div className="digital-id-card__field">
                                        <span className="digital-id-card__field-label">Rx BIN / PCN</span>
                                        <span className="digital-id-card__field-value">{memberCardData.rxBin} / {memberCardData.rxPcn}</span>
                                    </div>
                                </div>

                                <div className="digital-id-card__wallet-buttons">
                                    <motion.button
                                        className="wallet-btn wallet-btn--apple"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        aria-label="Add insurance ID card to Apple Wallet"
                                    >
                                        <Smartphone size={16} />
                                        Add to Apple Wallet
                                    </motion.button>
                                    <motion.button
                                        className="wallet-btn wallet-btn--google"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        aria-label="Add insurance ID card to Google Pay"
                                    >
                                        <Wallet size={16} />
                                        Add to Google Pay
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* HSA/FSA Balance Display */}
                    <div className="wallet-section__accounts">
                        <GlassCard className="hsa-fsa-card">
                            <div className="hsa-fsa-card__header">
                                <h3><PiggyBank size={18} /> Account Balances</h3>
                            </div>

                            <div className="hsa-fsa-card__accounts">
                                {/* HSA */}
                                <div className="account-balance">
                                    <div className="account-balance__info">
                                        <span className="account-balance__label">HSA Balance</span>
                                        <span className="account-balance__amount">{formatCurrency(accountBalances.hsa.balance)}</span>
                                        <span className="account-balance__sub">
                                            of ${accountBalances.hsa.annualLimit.toLocaleString()} annual limit
                                        </span>
                                    </div>
                                    <div className="account-balance__donut">
                                        <svg viewBox="0 0 80 80">
                                            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                                            <circle
                                                cx="40" cy="40" r="32" fill="none"
                                                stroke="var(--apex-teal)" strokeWidth="8"
                                                strokeDasharray={`${(hsaPercent / 100) * 201} 201`}
                                                strokeLinecap="round"
                                                transform="rotate(-90 40 40)"
                                            />
                                            <text x="40" y="38" textAnchor="middle" fill="var(--apex-white)" fontSize="12" fontWeight="600">
                                                {Math.round(hsaPercent)}%
                                            </text>
                                            <text x="40" y="50" textAnchor="middle" fill="var(--apex-steel)" fontSize="8">
                                                spent
                                            </text>
                                        </svg>
                                    </div>
                                </div>

                                {/* FSA */}
                                <div className="account-balance">
                                    <div className="account-balance__info">
                                        <span className="account-balance__label">FSA Balance</span>
                                        <span className="account-balance__amount">{formatCurrency(accountBalances.fsa.balance)}</span>
                                        <span className="account-balance__sub">
                                            of ${accountBalances.fsa.elected.toLocaleString()} elected
                                        </span>
                                    </div>
                                    <div className="account-balance__donut">
                                        <svg viewBox="0 0 80 80">
                                            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                                            <circle
                                                cx="40" cy="40" r="32" fill="none"
                                                stroke="var(--apex-electric-purple)" strokeWidth="8"
                                                strokeDasharray={`${(fsaPercent / 100) * 201} 201`}
                                                strokeLinecap="round"
                                                transform="rotate(-90 40 40)"
                                            />
                                            <text x="40" y="38" textAnchor="middle" fill="var(--apex-white)" fontSize="12" fontWeight="600">
                                                {Math.round(fsaPercent)}%
                                            </text>
                                            <text x="40" y="50" textAnchor="middle" fill="var(--apex-steel)" fontSize="8">
                                                spent
                                            </text>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<ArrowRight size={14} />}
                                className="hsa-fsa-card__view-btn"
                            >
                                View Transactions
                            </Button>
                        </GlassCard>

                        {/* Copay Quick Reference */}
                        <GlassCard className="copay-card">
                            <div className="copay-card__header">
                                <h3><CircleDollarSign size={18} /> Copay Quick Reference</h3>
                            </div>
                            <div className="copay-card__grid">
                                {copaySchedule.map((item) => (
                                    <div key={item.label} className="copay-item">
                                        <div className="copay-item__icon">{item.icon}</div>
                                        <span className="copay-item__label">{item.label}</span>
                                        <span className="copay-item__amount">${item.amount}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </motion.div>

            {/* Phase 4B: Benefits Usage Progress */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <GlassCard className="benefits-usage-card">
                    <div className="benefits-usage-card__header">
                        <h2><Activity size={20} /> Benefits Usage</h2>
                        <Badge variant="info">2024 Plan Year</Badge>
                    </div>
                    <div className="benefits-usage-card__bars">
                        {benefitsUsage.map((benefit, index) => {
                            const pct = Math.round((benefit.used / benefit.total) * 100)
                            const isApproaching = benefit.color === 'amber'
                            return (
                                <motion.div
                                    key={benefit.label}
                                    className="benefit-bar"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                >
                                    <div className="benefit-bar__header">
                                        <span className="benefit-bar__label">{benefit.label}</span>
                                        <span className="benefit-bar__values">
                                            <span className={`benefit-bar__used ${isApproaching ? 'benefit-bar__used--amber' : ''}`}>
                                                ${benefit.used.toLocaleString()}
                                            </span>
                                            {' / '}
                                            <span className="benefit-bar__total">${benefit.total.toLocaleString()}</span>
                                        </span>
                                    </div>
                                    <div className="benefit-bar__track" role="progressbar" aria-valuenow={benefit.used} aria-valuemin={0} aria-valuemax={benefit.total} aria-label={`${benefit.label}: ${pct}% used`}>
                                        <motion.div
                                            className={`benefit-bar__fill benefit-bar__fill--${benefit.color}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1, delay: 0.4 + index * 0.1, ease: 'easeOut' }}
                                        />
                                    </div>
                                    <div className="benefit-bar__footer">
                                        <span className={`benefit-bar__pct ${isApproaching ? 'benefit-bar__pct--amber' : ''}`}>
                                            {pct}% used
                                        </span>
                                        <span className="benefit-bar__remaining">
                                            ${(benefit.total - benefit.used).toLocaleString()} remaining
                                        </span>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </GlassCard>
            </motion.div>

            {/* Two Column Layout */}
            <div className="member-home__grid">
                {/* Recent Activity */}
                <GlassCard className="member-home__activity">
                    <div className="activity__header">
                        <h2>Recent Activity</h2>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/claims')}>View All</Button>
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
                                <Button variant="secondary" size="sm" onClick={() => alert(`Scheduling ${reminder.title}...`)}>Schedule</Button>
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
                        <Button variant="ghost" size="sm" className="id-card__view-full" onClick={() => navigate('/id-card')}>
                            View Full Card
                        </Button>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default MemberHome
