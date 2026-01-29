import { useState } from 'react'
import { motion } from 'framer-motion'
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
    Search
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import { DigitalIDCard } from '../components/member/DigitalIDCard'
import './MemberPortal.css'

// Mock member data
const memberData = {
    name: 'Sarah Johnson',
    memberId: 'KH-2024-78432',
    groupNumber: 'GRP-5621',
    planName: 'Gold Standard Plan',
    effectiveDate: 'January 1, 2024',
}

// Benefits usage data
const benefits = [
    {
        type: 'Medical',
        icon: Heart,
        color: '#EF4444',
        deductible: { used: 850, total: 1500 },
        outOfPocket: { used: 2100, total: 6000 },
    },
    {
        type: 'Dental',
        icon: Stethoscope,
        color: '#10B981',
        deductible: { used: 0, total: 50 },
        outOfPocket: { used: 125, total: 1500 },
    },
    {
        type: 'Vision',
        icon: Eye,
        color: '#3B82F6',
        deductible: { used: 0, total: 0 },
        outOfPocket: { used: 0, total: 250 },
    },
    {
        type: 'Pharmacy',
        icon: Pill,
        color: '#8B5CF6',
        deductible: { used: 200, total: 500 },
        outOfPocket: { used: 450, total: 2000 },
    },
]

// Recent claims
const recentClaims = [
    {
        id: 'CLM-8472',
        provider: 'Metro Health Center',
        date: '2024-01-15',
        amount: 245.00,
        status: 'approved',
        type: 'medical',
    },
    {
        id: 'CLM-8469',
        provider: 'CVS Pharmacy',
        date: '2024-01-12',
        amount: 35.00,
        status: 'approved',
        type: 'pharmacy',
    },
    {
        id: 'CLM-8465',
        provider: 'Smile Dental Group',
        date: '2024-01-08',
        amount: 180.00,
        status: 'pending',
        type: 'dental',
    },
]

// Quick actions
const quickActions = [
    { icon: Search, label: 'Find a Doctor', color: 'teal' },
    { icon: FileText, label: 'View EOBs', color: 'blue' },
    { icon: Pill, label: 'Refill Rx', color: 'purple' },
    { icon: Phone, label: 'Get Support', color: 'green' },
]

// Wellness score data
const wellnessData = {
    score: 82,
    trend: '+5',
    breakdown: [
        { category: 'Preventive Care', score: 95, max: 100 },
        { category: 'Medication Adherence', score: 88, max: 100 },
        { category: 'Lifestyle', score: 72, max: 100 },
        { category: 'Mental Wellness', score: 78, max: 100 },
    ]
}

// Medications
const medications = [
    { name: 'Lisinopril', dose: '10mg', frequency: 'Daily', refillDate: 'Feb 15', daysLeft: 12 },
    { name: 'Metformin', dose: '500mg', frequency: '2x Daily', refillDate: 'Feb 8', daysLeft: 5 },
]

// Upcoming appointments
const upcomingAppointments = [
    { type: 'Annual Physical', provider: 'Dr. Sarah Chen', date: 'Feb 12, 2024', time: '10:00 AM', icon: Stethoscope },
    { type: 'Dental Cleaning', provider: 'Smile Dental Care', date: 'Mar 5, 2024', time: '2:30 PM', icon: Activity },
]

export function MemberPortal() {
    const [activeTab, setActiveTab] = useState<'overview' | 'claims' | 'benefits'>('overview')

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge variant="success" size="sm" icon={<CheckCircle2 size={10} />}>Approved</Badge>
            case 'pending':
                return <Badge variant="warning" size="sm" icon={<Clock size={10} />}>Pending</Badge>
            case 'denied':
                return <Badge variant="critical" size="sm" icon={<AlertCircle size={10} />}>Denied</Badge>
            default:
                return null
        }
    }

    return (
        <div className="member-portal">
            {/* Header */}
            <div className="member-portal__header">
                <div>
                    <motion.h1
                        className="member-portal__title"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Welcome back, {memberData.name.split(' ')[0]}
                    </motion.h1>
                    <p className="member-portal__subtitle">
                        Your health benefits at a glance
                    </p>
                </div>
                <div className="member-portal__header-actions">
                    <Button variant="ghost" icon={<Phone size={16} />}>
                        24/7 Support
                    </Button>
                    <Button variant="primary" icon={<Search size={16} />}>
                        Find Care
                    </Button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="member-portal__grid">
                {/* Left Column - ID Card Section */}
                <div className="member-portal__column member-portal__column--left">
                    {/* Digital ID Card */}
                    <section className="member-portal__section">
                        <div className="member-portal__section-header">
                            <h2>Digital ID Card</h2>
                            <span className="member-portal__section-hint">Tap to flip</span>
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

                    {/* Quick Actions */}
                    <section className="member-portal__section">
                        <h2 className="member-portal__section-title">Quick Actions</h2>
                        <div className="member-portal__quick-actions">
                            {quickActions.map((action, index) => (
                                <motion.button
                                    key={action.label}
                                    className={`member-portal__quick-action member-portal__quick-action--${action.color}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <action.icon size={20} />
                                    <span>{action.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column - Benefits & Claims */}
                <div className="member-portal__column member-portal__column--right">
                    {/* Benefits Summary */}
                    <section className="member-portal__section">
                        <div className="member-portal__section-header">
                            <h2>Benefits Summary</h2>
                            <span className="member-portal__section-link">View All →</span>
                        </div>
                        <div className="member-portal__benefits">
                            {benefits.map((benefit, index) => {
                                const Icon = benefit.icon
                                const deductiblePercent = (benefit.deductible.used / benefit.deductible.total) * 100 || 0
                                const oopPercent = (benefit.outOfPocket.used / benefit.outOfPocket.total) * 100 || 0

                                return (
                                    <motion.div
                                        key={benefit.type}
                                        className="member-portal__benefit"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="member-portal__benefit-header">
                                            <div
                                                className="member-portal__benefit-icon"
                                                style={{ background: `${benefit.color}20`, color: benefit.color }}
                                            >
                                                <Icon size={18} />
                                            </div>
                                            <span className="member-portal__benefit-type">{benefit.type}</span>
                                        </div>

                                        <div className="member-portal__benefit-bars">
                                            {benefit.deductible.total > 0 && (
                                                <div className="member-portal__benefit-bar-group">
                                                    <div className="member-portal__benefit-bar-header">
                                                        <span>Deductible</span>
                                                        <span>${benefit.deductible.used} / ${benefit.deductible.total}</span>
                                                    </div>
                                                    <div className="member-portal__benefit-bar-track">
                                                        <motion.div
                                                            className="member-portal__benefit-bar-fill"
                                                            style={{ background: benefit.color }}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(deductiblePercent, 100)}%` }}
                                                            transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="member-portal__benefit-bar-group">
                                                <div className="member-portal__benefit-bar-header">
                                                    <span>Out of Pocket</span>
                                                    <span>${benefit.outOfPocket.used} / ${benefit.outOfPocket.total}</span>
                                                </div>
                                                <div className="member-portal__benefit-bar-track">
                                                    <motion.div
                                                        className="member-portal__benefit-bar-fill"
                                                        style={{ background: benefit.color, opacity: 0.6 }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(oopPercent, 100)}%` }}
                                                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                                    />
                                                </div>
                                            </div>
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
                            <span className="member-portal__section-link">View All →</span>
                        </div>
                        <div className="member-portal__claims">
                            {recentClaims.map((claim, index) => (
                                <motion.div
                                    key={claim.id}
                                    className="member-portal__claim"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="member-portal__claim-info">
                                        <span className="member-portal__claim-provider">{claim.provider}</span>
                                        <span className="member-portal__claim-meta">
                                            {claim.id} • {claim.date}
                                        </span>
                                    </div>
                                    <div className="member-portal__claim-right">
                                        <span className="member-portal__claim-amount">${claim.amount.toFixed(2)}</span>
                                        {getStatusBadge(claim.status)}
                                    </div>
                                    <ChevronRight size={16} className="member-portal__claim-arrow" />
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Health Insights */}
                    <section className="member-portal__section">
                        <div className="member-portal__section-header">
                            <h2>Health Insights</h2>
                            <Badge variant="teal" size="sm">AI Powered</Badge>
                        </div>
                        <GlassCard className="member-portal__insights">
                            <div className="member-portal__insight">
                                <div className="member-portal__insight-icon member-portal__insight-icon--success">
                                    <Activity size={16} />
                                </div>
                                <div className="member-portal__insight-content">
                                    <span className="member-portal__insight-title">
                                        You're on track with preventive care
                                    </span>
                                    <span className="member-portal__insight-desc">
                                        Annual physical completed. Next: Dental cleaning due in March.
                                    </span>
                                </div>
                            </div>
                            <div className="member-portal__insight">
                                <div className="member-portal__insight-icon member-portal__insight-icon--info">
                                    <Target size={16} />
                                </div>
                                <div className="member-portal__insight-content">
                                    <span className="member-portal__insight-title">
                                        $1,150 remaining in HSA
                                    </span>
                                    <span className="member-portal__insight-desc">
                                        Consider using pre-tax dollars for upcoming dental work.
                                    </span>
                                </div>
                            </div>
                        </GlassCard>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default MemberPortal
