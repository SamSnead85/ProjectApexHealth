import { useState } from 'react'
import { useNavigation } from '../context/NavigationContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Heart,
    Pill,
    Eye,
    Stethoscope,
    DollarSign,
    Calendar,
    TrendingUp,
    ChevronRight,
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    Activity,
    Target,
    Shield,
    Phone,
    MapPin,
    Search,
    CreditCard,
    Wallet,
    MessageSquare,
    Bell,
    Award,
    Video,
    Users,
    Settings,
    Download,
    Send,
    Upload,
    Building2,
    History,
    ArrowUpRight
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import { DigitalIDCard } from '../components/member/DigitalIDCard'
import './MemberPortal.css'

// Navigation tabs configuration
const portalTabs = [
    { id: 'overview', label: 'Overview', icon: Heart },
    { id: 'benefits', label: 'Benefits', icon: Shield },
    { id: 'claims', label: 'Claims & EOBs', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
    { id: 'care', label: 'My Care', icon: Stethoscope },
]

// Quick Action Cards
const quickAccessModules = [
    { icon: Search, label: 'Find a Doctor', path: '/member/find-care', color: 'teal', desc: 'Search providers in your network' },
    { icon: FileText, label: 'View EOBs', path: '/member/eob', color: 'blue', desc: 'Explanation of Benefits' },
    { icon: Pill, label: 'Manage Rx', path: '/member/pharmacy', color: 'purple', desc: 'Refills & drug costs' },
    { icon: Video, label: 'Telehealth', path: '/member/telehealth', color: 'green', desc: 'Virtual care visits' },
    { icon: Wallet, label: 'HSA/FSA', path: '/member/hsa', color: 'orange', desc: 'Manage your accounts' },
    { icon: CreditCard, label: 'Make Payment', path: '/member/payments', color: 'pink', desc: 'Pay your premium' },
    { icon: Calendar, label: 'Appointments', path: '/member/appointments', color: 'cyan', desc: 'Schedule & manage' },
    { icon: MessageSquare, label: 'Messages', path: '/member/secure-messaging', color: 'indigo', desc: 'Secure inbox' },
]

// Mock member data
const memberData = {
    name: 'Sarah Johnson',
    memberId: 'KH-2024-78432',
    groupNumber: 'GRP-5621',
    planName: 'Gold Standard PPO',
    planType: 'Family',
    effectiveDate: 'January 1, 2024',
    employerName: 'TechCorp Industries',
    pcp: 'Dr. Michael Chen, MD',
}

// Benefits usage data
const benefits = [
    {
        type: 'Medical',
        icon: Heart,
        color: '#EF4444',
        deductible: { used: 850, total: 1500, family: { used: 1700, total: 4500 } },
        outOfPocket: { used: 2100, total: 6000, family: { used: 3200, total: 12000 } },
        coinsurance: 80,
    },
    {
        type: 'Dental',
        icon: Stethoscope,
        color: '#10B981',
        deductible: { used: 0, total: 50 },
        outOfPocket: { used: 125, total: 1500 },
        remaining: 1375,
    },
    {
        type: 'Vision',
        icon: Eye,
        color: '#3B82F6',
        deductible: { used: 0, total: 0 },
        outOfPocket: { used: 0, total: 250 },
        allowance: { frames: 150, lenses: true, contacts: 150 },
    },
    {
        type: 'Pharmacy',
        icon: Pill,
        color: '#8B5CF6',
        deductible: { used: 200, total: 500 },
        outOfPocket: { used: 450, total: 2000 },
        tiers: { generic: 10, preferred: 35, specialty: 100 },
    },
]

// Recent claims
const recentClaims = [
    {
        id: 'CLM-8472',
        provider: 'Metro Health Center',
        date: '2024-01-15',
        serviceDate: '2024-01-10',
        amount: 245.00,
        planPaid: 196.00,
        youOwe: 49.00,
        status: 'processed',
        type: 'medical',
    },
    {
        id: 'CLM-8469',
        provider: 'CVS Pharmacy',
        date: '2024-01-12',
        serviceDate: '2024-01-12',
        amount: 85.00,
        planPaid: 50.00,
        youOwe: 35.00,
        status: 'processed',
        type: 'pharmacy',
    },
    {
        id: 'CLM-8465',
        provider: 'Smile Dental Group',
        date: '2024-01-08',
        serviceDate: '2024-01-05',
        amount: 180.00,
        planPaid: 0,
        youOwe: 0,
        status: 'pending',
        type: 'dental',
    },
    {
        id: 'CLM-8460',
        provider: 'MRI Imaging Center',
        date: '2024-01-02',
        serviceDate: '2023-12-28',
        amount: 1250.00,
        planPaid: 1000.00,
        youOwe: 250.00,
        status: 'processed',
        type: 'medical',
    },
]

// Payment/Billing data
const billingData = {
    currentBalance: 0,
    nextPremiumDue: 485.00,
    nextDueDate: 'February 1, 2024',
    autopayEnabled: true,
    paymentMethod: '**** 4532',
    ytdPaid: 1455.00,
}

// Payment history
const paymentHistory = [
    { id: 'PAY-001', date: 'Jan 1, 2024', amount: 485.00, method: 'Auto-pay', status: 'completed' },
    { id: 'PAY-002', date: 'Dec 1, 2023', amount: 485.00, method: 'Auto-pay', status: 'completed' },
    { id: 'PAY-003', date: 'Nov 1, 2023', amount: 485.00, method: 'Auto-pay', status: 'completed' },
]

// Medications
const medications = [
    { name: 'Lisinopril', dose: '10mg', frequency: 'Daily', refillDate: 'Feb 15, 2024', daysLeft: 12, copay: 10, tier: 'Generic' },
    { name: 'Metformin', dose: '500mg', frequency: '2x Daily', refillDate: 'Feb 8, 2024', daysLeft: 5, copay: 10, tier: 'Generic' },
    { name: 'Atorvastatin', dose: '20mg', frequency: 'Daily', refillDate: 'Mar 1, 2024', daysLeft: 26, copay: 35, tier: 'Preferred' },
]

// Upcoming appointments
const upcomingAppointments = [
    { type: 'Annual Physical', provider: 'Dr. Michael Chen', date: 'Feb 12, 2024', time: '10:00 AM', icon: Stethoscope, location: 'Metro Health Center' },
    { type: 'Dental Cleaning', provider: 'Dr. Lisa Park', date: 'Mar 5, 2024', time: '2:30 PM', icon: Activity, location: 'Smile Dental Care' },
]

// Care team
const careTeam = [
    { name: 'Dr. Michael Chen', specialty: 'Primary Care', phone: '(555) 123-4567', lastVisit: 'Jan 10, 2024' },
    { name: 'Dr. Lisa Park', specialty: 'Dentist', phone: '(555) 234-5678', lastVisit: 'Dec 15, 2023' },
    { name: 'Dr. Sarah Williams', specialty: 'Cardiologist', phone: '(555) 345-6789', lastVisit: 'Nov 20, 2023' },
]

type TabType = 'overview' | 'benefits' | 'claims' | 'payments' | 'pharmacy' | 'care'

export function MemberPortal() {
    const { navigate } = useNavigation()
    const [activeTab, setActiveTab] = useState<TabType>('overview')

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'processed':
            case 'approved':
            case 'completed':
                return <Badge variant="success" size="sm" icon={<CheckCircle2 size={10} />}>{status === 'completed' ? 'Paid' : 'Processed'}</Badge>
            case 'pending':
                return <Badge variant="warning" size="sm" icon={<Clock size={10} />}>Pending</Badge>
            case 'denied':
                return <Badge variant="critical" size="sm" icon={<AlertCircle size={10} />}>Denied</Badge>
            default:
                return null
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    }

    // Overview Tab Content
    const renderOverview = () => (
        <div className="member-portal__grid">
            {/* Left Column - ID Card & Quick Actions */}
            <div className="member-portal__column member-portal__column--left">
                {/* Digital ID Card */}
                <section className="member-portal__section">
                    <div className="member-portal__section-header">
                        <h2>Digital ID Card</h2>
                        <button className="member-portal__section-link" onClick={() => navigate('/member/id-card')}>
                            View Full Card <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <DigitalIDCard
                        insurerName="Apex Health"
                        planName={memberData.planName}
                        memberName={memberData.name}
                        memberId={memberData.memberId}
                        groupNumber={memberData.groupNumber}
                        effectiveDate={memberData.effectiveDate}
                    />
                </section>

                {/* Quick Access Grid */}
                <section className="member-portal__section">
                    <h2 className="member-portal__section-title">Quick Access</h2>
                    <div className="member-portal__quick-grid">
                        {quickAccessModules.map((module, index) => (
                            <motion.button
                                key={module.label}
                                className={`member-portal__module-card member-portal__module-card--${module.color}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(module.path)}
                            >
                                <div className="member-portal__module-icon">
                                    <module.icon size={22} />
                                </div>
                                <div className="member-portal__module-content">
                                    <span className="member-portal__module-label">{module.label}</span>
                                    <span className="member-portal__module-desc">{module.desc}</span>
                                </div>
                                <ChevronRight size={16} className="member-portal__module-arrow" />
                            </motion.button>
                        ))}
                    </div>
                </section>
            </div>

            {/* Right Column - Summary Widgets */}
            <div className="member-portal__column member-portal__column--right">
                {/* Benefits Summary */}
                <section className="member-portal__section">
                    <div className="member-portal__section-header">
                        <h2>Benefits at a Glance</h2>
                        <button className="member-portal__section-link" onClick={() => setActiveTab('benefits')}>
                            View Details <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <div className="member-portal__benefits-mini">
                        {benefits.slice(0, 2).map((benefit, index) => {
                            const Icon = benefit.icon
                            const deductiblePercent = (benefit.deductible.used / benefit.deductible.total) * 100 || 0

                            return (
                                <motion.div
                                    key={benefit.type}
                                    className="member-portal__benefit-mini"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="member-portal__benefit-mini-header">
                                        <div className="member-portal__benefit-icon" style={{ background: `${benefit.color}20`, color: benefit.color }}>
                                            <Icon size={16} />
                                        </div>
                                        <span>{benefit.type}</span>
                                    </div>
                                    <div className="member-portal__benefit-mini-bar">
                                        <div className="member-portal__benefit-bar-track">
                                            <motion.div
                                                className="member-portal__benefit-bar-fill"
                                                style={{ background: benefit.color }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(deductiblePercent, 100)}%` }}
                                            />
                                        </div>
                                        <span>${benefit.deductible.used} / ${benefit.deductible.total}</span>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </section>

                {/* Recent Claims */}
                <section className="member-portal__section">
                    <div className="member-portal__section-header">
                        <h2>Recent Claims</h2>
                        <button className="member-portal__section-link" onClick={() => setActiveTab('claims')}>
                            View All <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <div className="member-portal__claims-mini">
                        {recentClaims.slice(0, 3).map((claim, index) => (
                            <motion.div
                                key={claim.id}
                                className="member-portal__claim-mini"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="member-portal__claim-mini-info">
                                    <span className="member-portal__claim-provider">{claim.provider}</span>
                                    <span className="member-portal__claim-meta">{claim.date}</span>
                                </div>
                                <div className="member-portal__claim-mini-right">
                                    <span className="member-portal__claim-amount">{formatCurrency(claim.youOwe)}</span>
                                    {getStatusBadge(claim.status)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Upcoming Appointments */}
                <section className="member-portal__section">
                    <div className="member-portal__section-header">
                        <h2>Upcoming Appointments</h2>
                        <button className="member-portal__section-link" onClick={() => navigate('/member/appointments')}>
                            Manage <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <div className="member-portal__appointments-mini">
                        {upcomingAppointments.map((apt, index) => {
                            const Icon = apt.icon
                            return (
                                <motion.div
                                    key={apt.type}
                                    className="member-portal__appointment-mini"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="member-portal__appointment-icon">
                                        <Icon size={16} />
                                    </div>
                                    <div className="member-portal__appointment-info">
                                        <span className="member-portal__appointment-type">{apt.type}</span>
                                        <span className="member-portal__appointment-provider">{apt.provider}</span>
                                    </div>
                                    <div className="member-portal__appointment-datetime">
                                        <span>{apt.date}</span>
                                        <span>{apt.time}</span>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </section>

                {/* Payment Status */}
                <section className="member-portal__section">
                    <div className="member-portal__section-header">
                        <h2>Payment Status</h2>
                        <button className="member-portal__section-link" onClick={() => setActiveTab('payments')}>
                            Manage <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <GlassCard className="member-portal__payment-status">
                        <div className="member-portal__payment-summary">
                            <div className="member-portal__payment-next">
                                <span className="member-portal__payment-label">Next Premium Due</span>
                                <span className="member-portal__payment-amount">{formatCurrency(billingData.nextPremiumDue)}</span>
                                <span className="member-portal__payment-date">Due: {billingData.nextDueDate}</span>
                            </div>
                            <div className="member-portal__payment-autopay">
                                <Badge variant="success" icon={<CheckCircle2 size={10} />}>Auto-pay Active</Badge>
                                <span className="member-portal__payment-method">Card ending {billingData.paymentMethod}</span>
                            </div>
                        </div>
                    </GlassCard>
                </section>
            </div>
        </div>
    )

    // Benefits Tab Content
    const renderBenefits = () => (
        <div className="member-portal__benefits-tab">
            <div className="member-portal__benefits-header">
                <div>
                    <h2>Your Benefits Summary</h2>
                    <p>{memberData.planName} • {memberData.planType} Coverage</p>
                </div>
                <div className="member-portal__benefits-actions">
                    <Button variant="ghost" size="sm" icon={<Download size={14} />}>
                        Download SBC
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => navigate('/member/benefits')}>
                        Full Plan Details
                    </Button>
                </div>
            </div>

            <div className="member-portal__benefits-grid">
                {benefits.map((benefit, index) => {
                    const Icon = benefit.icon
                    const deductiblePercent = (benefit.deductible.used / benefit.deductible.total) * 100 || 0
                    const oopPercent = (benefit.outOfPocket.used / benefit.outOfPocket.total) * 100 || 0

                    return (
                        <motion.div
                            key={benefit.type}
                            className="member-portal__benefit-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="member-portal__benefit-card-header">
                                <div className="member-portal__benefit-icon-lg" style={{ background: `${benefit.color}20`, color: benefit.color }}>
                                    <Icon size={24} />
                                </div>
                                <h3>{benefit.type}</h3>
                            </div>

                            <div className="member-portal__benefit-metrics">
                                {benefit.deductible.total > 0 && (
                                    <div className="member-portal__benefit-metric">
                                        <div className="member-portal__benefit-metric-header">
                                            <span>Individual Deductible</span>
                                            <span className="member-portal__benefit-metric-value">
                                                {formatCurrency(benefit.deductible.used)} / {formatCurrency(benefit.deductible.total)}
                                            </span>
                                        </div>
                                        <div className="member-portal__benefit-bar-track">
                                            <motion.div
                                                className="member-portal__benefit-bar-fill"
                                                style={{ background: benefit.color }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(deductiblePercent, 100)}%` }}
                                            />
                                        </div>
                                        <span className="member-portal__benefit-remaining">
                                            {formatCurrency(benefit.deductible.total - benefit.deductible.used)} remaining
                                        </span>
                                    </div>
                                )}

                                <div className="member-portal__benefit-metric">
                                    <div className="member-portal__benefit-metric-header">
                                        <span>Out-of-Pocket Max</span>
                                        <span className="member-portal__benefit-metric-value">
                                            {formatCurrency(benefit.outOfPocket.used)} / {formatCurrency(benefit.outOfPocket.total)}
                                        </span>
                                    </div>
                                    <div className="member-portal__benefit-bar-track">
                                        <motion.div
                                            className="member-portal__benefit-bar-fill"
                                            style={{ background: benefit.color, opacity: 0.7 }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(oopPercent, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )

    // Claims Tab Content
    const renderClaims = () => (
        <div className="member-portal__claims-tab">
            <div className="member-portal__claims-header">
                <div>
                    <h2>Claims & EOBs</h2>
                    <p>View your claims history and explanation of benefits</p>
                </div>
                <div className="member-portal__claims-actions">
                    <Button variant="ghost" size="sm" icon={<Search size={14} />}>
                        Search Claims
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => navigate('/member/eob')}>
                        View All EOBs
                    </Button>
                </div>
            </div>

            <GlassCard className="member-portal__claims-table">
                <div className="member-portal__claims-table-header">
                    <span>Provider / Service</span>
                    <span>Date</span>
                    <span>Total</span>
                    <span>Plan Paid</span>
                    <span>You Owe</span>
                    <span>Status</span>
                    <span></span>
                </div>
                {recentClaims.map((claim, index) => (
                    <motion.div
                        key={claim.id}
                        className="member-portal__claims-row"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="member-portal__claims-cell member-portal__claims-cell--provider">
                            <span className="member-portal__claim-id">{claim.id}</span>
                            <span>{claim.provider}</span>
                        </div>
                        <span>{claim.serviceDate}</span>
                        <span>{formatCurrency(claim.amount)}</span>
                        <span className="member-portal__claims-cell--plan">{formatCurrency(claim.planPaid)}</span>
                        <span className="member-portal__claims-cell--owe">{formatCurrency(claim.youOwe)}</span>
                        <span>{getStatusBadge(claim.status)}</span>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/member/eob/${claim.id}`)}>
                            View EOB
                        </Button>
                    </motion.div>
                ))}
            </GlassCard>
        </div>
    )

    // Payments Tab Content
    const renderPayments = () => (
        <div className="member-portal__payments-tab">
            <div className="member-portal__payments-header">
                <div>
                    <h2>Payments & Billing</h2>
                    <p>Manage your premium payments and view payment history</p>
                </div>
            </div>

            <div className="member-portal__payments-grid">
                {/* Current Balance Card */}
                <GlassCard className="member-portal__payment-balance-card">
                    <div className="member-portal__payment-balance-header">
                        <DollarSign size={24} />
                        <h3>Premium Payment</h3>
                    </div>
                    <div className="member-portal__payment-balance-content">
                        <div className="member-portal__payment-balance-amount">
                            <span className="member-portal__payment-balance-label">Next Payment Due</span>
                            <span className="member-portal__payment-balance-value">{formatCurrency(billingData.nextPremiumDue)}</span>
                            <span className="member-portal__payment-balance-due">Due: {billingData.nextDueDate}</span>
                        </div>
                        <div className="member-portal__payment-balance-status">
                            <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                                Auto-pay Enabled
                            </Badge>
                            <span>Card ending {billingData.paymentMethod}</span>
                        </div>
                    </div>
                    <div className="member-portal__payment-balance-actions">
                        <Button variant="primary" icon={<CreditCard size={16} />}>
                            Make a Payment
                        </Button>
                        <Button variant="ghost" onClick={() => navigate('/member/settings')}>
                            Manage Auto-pay
                        </Button>
                    </div>
                </GlassCard>

                {/* YTD Summary */}
                <GlassCard className="member-portal__payment-summary-card">
                    <h3>Year-to-Date Summary</h3>
                    <div className="member-portal__payment-ytd">
                        <div className="member-portal__payment-ytd-item">
                            <span>Total Premiums Paid</span>
                            <span className="member-portal__payment-ytd-value">{formatCurrency(billingData.ytdPaid)}</span>
                        </div>
                        <div className="member-portal__payment-ytd-item">
                            <span>Payments Made</span>
                            <span className="member-portal__payment-ytd-value">3</span>
                        </div>
                        <div className="member-portal__payment-ytd-item">
                            <span>Current Balance</span>
                            <span className="member-portal__payment-ytd-value member-portal__payment-ytd-value--success">{formatCurrency(billingData.currentBalance)}</span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Payment History */}
            <GlassCard className="member-portal__payment-history">
                <div className="member-portal__payment-history-header">
                    <h3>Payment History</h3>
                    <Button variant="ghost" size="sm" icon={<Download size={14} />}>
                        Download Receipts
                    </Button>
                </div>
                <div className="member-portal__payment-history-list">
                    {paymentHistory.map((payment, index) => (
                        <motion.div
                            key={payment.id}
                            className="member-portal__payment-history-row"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="member-portal__payment-history-info">
                                <span className="member-portal__payment-history-date">{payment.date}</span>
                                <span className="member-portal__payment-history-method">{payment.method}</span>
                            </div>
                            <div className="member-portal__payment-history-amount">
                                {formatCurrency(payment.amount)}
                            </div>
                            {getStatusBadge(payment.status)}
                        </motion.div>
                    ))}
                </div>
            </GlassCard>
        </div>
    )

    // Pharmacy Tab Content
    const renderPharmacy = () => (
        <div className="member-portal__pharmacy-tab">
            <div className="member-portal__pharmacy-header">
                <div>
                    <h2>My Medications</h2>
                    <p>Manage your prescriptions and refills</p>
                </div>
                <div className="member-portal__pharmacy-actions">
                    <Button variant="secondary" size="sm" onClick={() => navigate('/member/pharmacy')}>
                        Full Pharmacy Portal
                    </Button>
                </div>
            </div>

            <div className="member-portal__medications-grid">
                {medications.map((med, index) => (
                    <motion.div
                        key={med.name}
                        className="member-portal__medication-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="member-portal__medication-header">
                            <Pill size={20} />
                            <div>
                                <h4>{med.name}</h4>
                                <span>{med.dose} • {med.frequency}</span>
                            </div>
                        </div>
                        <div className="member-portal__medication-details">
                            <div className="member-portal__medication-refill">
                                <span>Next Refill</span>
                                <span className={med.daysLeft <= 7 ? 'warning' : ''}>{med.refillDate}</span>
                                <span className="member-portal__medication-days">{med.daysLeft} days left</span>
                            </div>
                            <div className="member-portal__medication-cost">
                                <Badge variant="teal">{med.tier}</Badge>
                                <span className="member-portal__medication-copay">{formatCurrency(med.copay)} copay</span>
                            </div>
                        </div>
                        <Button variant="primary" size="sm" className="member-portal__medication-refill-btn">
                            Request Refill
                        </Button>
                    </motion.div>
                ))}
            </div>
        </div>
    )

    // Care Tab Content
    const renderCare = () => (
        <div className="member-portal__care-tab">
            <div className="member-portal__care-header">
                <div>
                    <h2>My Care Team</h2>
                    <p>Your healthcare providers and upcoming visits</p>
                </div>
                <div className="member-portal__care-actions">
                    <Button variant="secondary" size="sm" onClick={() => navigate('/member/find-care')}>
                        Find New Provider
                    </Button>
                </div>
            </div>

            <div className="member-portal__care-grid">
                {/* Care Team */}
                <GlassCard className="member-portal__care-team-card">
                    <h3>My Providers</h3>
                    <div className="member-portal__care-team-list">
                        {careTeam.map((provider, index) => (
                            <motion.div
                                key={provider.name}
                                className="member-portal__provider-item"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="member-portal__provider-avatar">
                                    <Users size={18} />
                                </div>
                                <div className="member-portal__provider-info">
                                    <span className="member-portal__provider-name">{provider.name}</span>
                                    <span className="member-portal__provider-specialty">{provider.specialty}</span>
                                </div>
                                <div className="member-portal__provider-actions">
                                    <Button variant="ghost" size="sm" icon={<Phone size={14} />}>
                                        Call
                                    </Button>
                                    <Button variant="ghost" size="sm" icon={<Calendar size={14} />}>
                                        Book
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Appointments */}
                <GlassCard className="member-portal__appointments-card">
                    <h3>Upcoming Appointments</h3>
                    <div className="member-portal__appointments-list">
                        {upcomingAppointments.map((apt, index) => {
                            const Icon = apt.icon
                            return (
                                <motion.div
                                    key={apt.type}
                                    className="member-portal__appointment-item"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="member-portal__appointment-icon-lg">
                                        <Icon size={20} />
                                    </div>
                                    <div className="member-portal__appointment-details">
                                        <span className="member-portal__appointment-type-lg">{apt.type}</span>
                                        <span className="member-portal__appointment-provider-lg">{apt.provider}</span>
                                        <span className="member-portal__appointment-location">{apt.location}</span>
                                    </div>
                                    <div className="member-portal__appointment-time-lg">
                                        <span>{apt.date}</span>
                                        <span>{apt.time}</span>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                    <Button variant="primary" className="member-portal__schedule-btn" onClick={() => navigate('/member/appointments')}>
                        <Calendar size={16} />
                        Schedule New Appointment
                    </Button>
                </GlassCard>
            </div>
        </div>
    )

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview()
            case 'benefits':
                return renderBenefits()
            case 'claims':
                return renderClaims()
            case 'payments':
                return renderPayments()
            case 'pharmacy':
                return renderPharmacy()
            case 'care':
                return renderCare()
            default:
                return renderOverview()
        }
    }

    return (
        <div className="member-portal">
            {/* Header */}
            <div className="member-portal__header">
                <div className="member-portal__header-content">
                    <motion.h1
                        className="member-portal__title"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Welcome back, {memberData.name.split(' ')[0]}
                    </motion.h1>
                    <p className="member-portal__subtitle">
                        {memberData.planName} • Member ID: {memberData.memberId}
                    </p>
                </div>
                <div className="member-portal__header-actions">
                    <Button variant="ghost" icon={<Phone size={16} />}>
                        24/7 Support
                    </Button>
                    <Button variant="primary" icon={<Search size={16} />} onClick={() => navigate('/member/find-care')}>
                        Find Care
                    </Button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="member-portal__tabs">
                {portalTabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            className={`member-portal__tab ${activeTab === tab.id ? 'member-portal__tab--active' : ''}`}
                            onClick={() => setActiveTab(tab.id as TabType)}
                        >
                            <Icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    className="member-portal__content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderTabContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default MemberPortal
