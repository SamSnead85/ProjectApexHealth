import { useState } from 'react'
import { motion } from 'framer-motion'
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
    CheckCircle2
} from 'lucide-react'
import { GlassCard, Button, Badge, MetricCard } from '../components/common'
import './EmployerPortal.css'

// Mock data
const plans = [
    { id: 1, name: 'Gold PPO Plan', carrier: 'Blue Shield', type: 'medical', enrolled: 892 },
    { id: 2, name: 'Delta Dental Premier', carrier: 'Delta Dental', type: 'dental', enrolled: 1045 },
    { id: 3, name: 'VSP Choice Plan', carrier: 'VSP', type: 'vision', enrolled: 978 },
    { id: 4, name: 'Basic Life + AD&D', carrier: 'MetLife', type: 'life', enrolled: 1250 },
]

const billingHistory = [
    { date: 'Jan 2024', amount: 247850, status: 'paid' },
    { date: 'Dec 2023', amount: 245200, status: 'paid' },
    { date: 'Nov 2023', amount: 243600, status: 'paid' },
]

const censusChanges = [
    { type: 'add', name: 'Sarah Johnson', date: '2 days ago' },
    { type: 'add', name: 'Michael Chen', date: '5 days ago' },
    { type: 'remove', name: 'Robert Williams', date: '1 week ago' },
]

export function EmployerPortal() {
    const enrollmentProgress = 78 // percentage
    const totalEmployees = 1250
    const enrolled = 975
    const pending = 180
    const notStarted = 95

    return (
        <div className="employer-portal">
            {/* Header */}
            <div className="employer-portal__header">
                <div className="employer-portal__title-section">
                    <h1 className="employer-portal__title">Employer Dashboard</h1>
                    <p className="employer-portal__subtitle">
                        Innovate Dynamics Health - Group #GRP-5621
                    </p>
                </div>
                <div className="employer-portal__actions">
                    <Button variant="ghost" size="sm">
                        <Download size={16} />
                        Export Data
                    </Button>
                    <Button variant="primary" size="sm">
                        <UserPlus size={16} />
                        Add Employee
                    </Button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="employer-portal__metrics">
                <MetricCard
                    label="Total Employees"
                    value="1,250"
                    change={3.2}
                    trend="up"
                    icon={<Users size={20} />}
                />
                <MetricCard
                    label="Total Dependents"
                    value="2,170"
                    change={2.8}
                    trend="up"
                    icon={<Users size={20} />}
                />
                <MetricCard
                    label="Monthly Premium"
                    value="$247,850"
                    change={1.5}
                    trend="up"
                    icon={<DollarSign size={20} />}
                />
                <MetricCard
                    label="Enrollment Rate"
                    value="94.2%"
                    change={2.1}
                    trend="up"
                    icon={<TrendingUp size={20} />}
                />
            </div>

            {/* Main Grid */}
            <div className="employer-portal__grid">
                <div className="employer-portal__main">
                    {/* Enrollment Tracker */}
                    <div className="enrollment-tracker">
                        <div className="enrollment-tracker__header">
                            <h2 className="enrollment-tracker__title">Open Enrollment Progress</h2>
                            <Badge variant="info">Ends Feb 15, 2024</Badge>
                        </div>
                        <div className="enrollment-tracker__progress">
                            <div className="enrollment-tracker__progress-header">
                                <span className="enrollment-tracker__progress-label">Overall Progress</span>
                                <span className="enrollment-tracker__progress-value">{enrollmentProgress}%</span>
                            </div>
                            <div className="enrollment-tracker__progress-bar">
                                <motion.div
                                    className="enrollment-tracker__progress-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${enrollmentProgress}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                        <div className="enrollment-tracker__stats">
                            <div className="enrollment-stat enrollment-stat--complete">
                                <div className="enrollment-stat__value">{enrolled}</div>
                                <div className="enrollment-stat__label">Enrolled</div>
                            </div>
                            <div className="enrollment-stat enrollment-stat--pending">
                                <div className="enrollment-stat__value">{pending}</div>
                                <div className="enrollment-stat__label">In Progress</div>
                            </div>
                            <div className="enrollment-stat">
                                <div className="enrollment-stat__value">{notStarted}</div>
                                <div className="enrollment-stat__label">Not Started</div>
                            </div>
                        </div>
                    </div>

                    {/* Plan Summary */}
                    <div className="plan-summary">
                        <div className="plan-summary__header">
                            <h2 className="plan-summary__title">Plan Selection Summary</h2>
                            <Button variant="ghost" size="sm">View Details</Button>
                        </div>
                        <div className="plan-summary__list">
                            {plans.map((plan, index) => (
                                <motion.div
                                    key={plan.id}
                                    className="plan-item"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className={`plan-item__icon plan-item__icon--${plan.type}`}>
                                        {plan.type === 'medical' && <Heart size={20} />}
                                        {plan.type === 'dental' && <FileText size={20} />}
                                        {plan.type === 'vision' && <VisionIcon size={20} />}
                                        {plan.type === 'life' && <Shield size={20} />}
                                    </div>
                                    <div className="plan-item__details">
                                        <div className="plan-item__name">{plan.name}</div>
                                        <div className="plan-item__carrier">{plan.carrier}</div>
                                    </div>
                                    <div className="plan-item__enrolled">
                                        <div className="plan-item__enrolled-count">{plan.enrolled.toLocaleString()}</div>
                                        <div className="plan-item__enrolled-label">enrolled</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="employer-portal__sidebar">
                    {/* Billing Card */}
                    <div className="billing-card">
                        <div className="billing-card__header">
                            <h2 className="billing-card__title">Billing</h2>
                            <Button variant="ghost" size="sm">
                                <CreditCard size={16} />
                                Pay Now
                            </Button>
                        </div>
                        <div className="billing-card__amount">
                            <div className="billing-card__amount-label">Current Invoice</div>
                            <div className="billing-card__amount-value">$247,850.00</div>
                            <div className="billing-card__due">Due: February 1, 2024</div>
                        </div>
                        <div className="billing-card__history">
                            <div className="billing-card__history-title">Recent Payments</div>
                            {billingHistory.map((item, index) => (
                                <motion.div
                                    key={item.date}
                                    className="billing-history-item"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <span className="billing-history-item__date">{item.date}</span>
                                    <span className="billing-history-item__amount">
                                        ${item.amount.toLocaleString()}
                                    </span>
                                    <span className="billing-history-item__status billing-history-item__status--paid">
                                        Paid
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Census Widget */}
                    <div className="census-widget">
                        <div className="census-widget__header">
                            <h2 className="census-widget__title">Census</h2>
                            <Button variant="ghost" size="sm">Manage</Button>
                        </div>
                        <div className="census-widget__stats">
                            <div className="census-stat">
                                <div className="census-stat__value">1,250</div>
                                <div className="census-stat__label">Employees</div>
                            </div>
                            <div className="census-stat">
                                <div className="census-stat__value">2,170</div>
                                <div className="census-stat__label">Dependents</div>
                            </div>
                        </div>
                        <div className="census-widget__recent">
                            <div className="census-widget__recent-title">Recent Changes</div>
                            {censusChanges.map((change, index) => (
                                <motion.div
                                    key={index}
                                    className="census-change"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className={`census-change__icon census-change__icon--${change.type}`}>
                                        {change.type === 'add' ? <UserPlus size={14} /> : <UserMinus size={14} />}
                                    </div>
                                    <span className="census-change__text">
                                        {change.type === 'add' ? 'Added' : 'Removed'} {change.name}
                                    </span>
                                    <span className="census-change__date">{change.date}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmployerPortal
