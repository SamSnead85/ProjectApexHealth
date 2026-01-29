import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Briefcase,
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    Eye,
    MoreHorizontal,
    Plus,
    FileText,
    Calculator,
    UserPlus,
    RefreshCw,
    ArrowUpRight
} from 'lucide-react'
import { GlassCard, Button, Badge, MetricCard } from '../components/common'
import './BrokerPortal.css'

// Mock data
const bookOfBusiness = [
    { id: 1, company: 'Innovate Dynamics', employees: 1250, lives: 3420, premium: 2847000, status: 'active', renewal: '2024-06-01' },
    { id: 2, company: 'TechFlow Solutions', employees: 480, lives: 1120, premium: 892000, status: 'active', renewal: '2024-04-15' },
    { id: 3, company: 'Metro Manufacturing', employees: 890, lives: 2340, premium: 1567000, status: 'active', renewal: '2024-05-20' },
    { id: 4, company: 'Coastal Healthcare', employees: 320, lives: 780, premium: 654000, status: 'pending', renewal: '2024-03-01' },
    { id: 5, company: 'Summit Financial', employees: 560, lives: 1450, premium: 1123000, status: 'active', renewal: '2024-07-10' },
]

const renewals = [
    { company: 'Coastal Healthcare', date: 'Mar 1', lives: 780, premium: '$654K' },
    { company: 'TechFlow Solutions', date: 'Apr 15', lives: 1120, premium: '$892K' },
    { company: 'Metro Manufacturing', date: 'May 20', lives: 2340, premium: '$1.57M' },
    { company: 'Innovate Dynamics', date: 'Jun 1', lives: 3420, premium: '$2.85M' },
]

export function BrokerPortal() {
    const navigate = useNavigate()
    const [commissionPeriod, setCommissionPeriod] = useState<'mtd' | 'ytd'>('ytd')
    const [selectedEmployer, setSelectedEmployer] = useState<number | null>(null)
    const [showMenu, setShowMenu] = useState<number | null>(null)

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(2)}M`
        }
        return `$${(amount / 1000).toFixed(0)}K`
    }

    return (
        <div className="broker-portal">
            {/* Header */}
            <div className="broker-portal__header">
                <div className="broker-portal__title-section">
                    <h1 className="broker-portal__title">Broker Dashboard</h1>
                    <p className="broker-portal__subtitle">
                        Welcome back, Marcus. Here's your portfolio overview.
                    </p>
                </div>
                <div className="broker-portal__actions">
                    <Button variant="ghost" size="sm">
                        <RefreshCw size={16} />
                        Sync Data
                    </Button>
                    <Button variant="primary" size="sm">
                        <Plus size={16} />
                        New Quote
                    </Button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="broker-portal__metrics">
                <MetricCard
                    label="Total Employers"
                    value="47"
                    change={8.5}
                    trend="up"
                    icon={<Briefcase size={20} />}
                />
                <MetricCard
                    label="Total Lives"
                    value="12,450"
                    change={12.3}
                    trend="up"
                    icon={<Users size={20} />}
                />
                <MetricCard
                    label="Annual Premium"
                    value="$8.2M"
                    change={15.7}
                    trend="up"
                    icon={<DollarSign size={20} />}
                />
                <MetricCard
                    label="Win Rate"
                    value="72%"
                    change={3.2}
                    trend="up"
                    icon={<TrendingUp size={20} />}
                />
            </div>

            {/* Main Grid */}
            <div className="broker-portal__grid">
                <div className="broker-portal__main">
                    {/* Book of Business */}
                    <div className="book-of-business">
                        <div className="book-of-business__header">
                            <h2 className="book-of-business__title">Book of Business</h2>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>
                        <div className="book-of-business__table">
                            <div className="book-of-business__row book-of-business__row--header">
                                <span className="book-of-business__cell book-of-business__cell--header">Company</span>
                                <span className="book-of-business__cell book-of-business__cell--header">Employees</span>
                                <span className="book-of-business__cell book-of-business__cell--header">Lives</span>
                                <span className="book-of-business__cell book-of-business__cell--header">Premium</span>
                                <span className="book-of-business__cell book-of-business__cell--header"></span>
                            </div>
                            {bookOfBusiness.map((employer) => (
                                <motion.div
                                    key={employer.id}
                                    className="book-of-business__row"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: employer.id * 0.05 }}
                                >
                                    <span className="book-of-business__cell book-of-business__cell--primary">
                                        {employer.company}
                                    </span>
                                    <span className="book-of-business__cell book-of-business__cell--number">
                                        {employer.employees.toLocaleString()}
                                    </span>
                                    <span className="book-of-business__cell book-of-business__cell--number">
                                        {employer.lives.toLocaleString()}
                                    </span>
                                    <span className="book-of-business__cell book-of-business__cell--number">
                                        {formatCurrency(employer.premium)}
                                    </span>
                                    <div className="book-of-business__cell book-of-business__cell--actions">
                                        <button
                                            className="book-of-business__action-btn"
                                            onClick={() => navigate(`/broker/clients/${employer.id}`)}
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            className="book-of-business__action-btn"
                                            onClick={() => setShowMenu(showMenu === employer.id ? null : employer.id)}
                                            title="More Options"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>
                                        {showMenu === employer.id && (
                                            <div className="book-of-business__dropdown">
                                                <button onClick={() => { navigate(`/broker/clients/${employer.id}/edit`); setShowMenu(null); }}>Edit Group</button>
                                                <button onClick={() => { navigate('/broker/quotes'); setShowMenu(null); }}>Generate Quote</button>
                                                <button onClick={() => { navigate('/broker/documents'); setShowMenu(null); }}>View Documents</button>
                                                <button onClick={() => setShowMenu(null)}>Cancel</button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Renewal Pipeline */}
                    <div className="renewal-pipeline">
                        <div className="renewal-pipeline__header">
                            <h2 className="renewal-pipeline__title">Renewal Pipeline (90 Days)</h2>
                            <Button variant="ghost" size="sm">
                                <Calendar size={16} />
                                Calendar View
                            </Button>
                        </div>
                        <div className="renewal-pipeline__list">
                            {renewals.map((renewal, index) => (
                                <motion.div
                                    key={renewal.company}
                                    className="renewal-item"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="renewal-item__date">
                                        <span className="renewal-item__month">{renewal.date.split(' ')[0]}</span>
                                        <span className="renewal-item__day">{renewal.date.split(' ')[1]}</span>
                                    </div>
                                    <div className="renewal-item__details">
                                        <div className="renewal-item__company">{renewal.company}</div>
                                        <div className="renewal-item__meta">{renewal.lives.toLocaleString()} lives</div>
                                    </div>
                                    <div className="renewal-item__premium">{renewal.premium}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="broker-portal__sidebar">
                    {/* Commission Widget */}
                    <div className="commission-widget">
                        <div className="commission-widget__header">
                            <h2 className="commission-widget__title">Commissions</h2>
                            <div className="commission-widget__period">
                                <button
                                    className={`commission-widget__period-btn ${commissionPeriod === 'mtd' ? 'commission-widget__period-btn--active' : ''}`}
                                    onClick={() => setCommissionPeriod('mtd')}
                                >
                                    MTD
                                </button>
                                <button
                                    className={`commission-widget__period-btn ${commissionPeriod === 'ytd' ? 'commission-widget__period-btn--active' : ''}`}
                                    onClick={() => setCommissionPeriod('ytd')}
                                >
                                    YTD
                                </button>
                            </div>
                        </div>
                        <div className="commission-widget__amount">
                            {commissionPeriod === 'ytd' ? '$124,850' : '$18,420'}
                        </div>
                        <div className="commission-widget__change commission-widget__change--positive">
                            <TrendingUp size={16} />
                            <span>+12.4% vs last {commissionPeriod === 'ytd' ? 'year' : 'month'}</span>
                        </div>
                        <div className="commission-widget__breakdown">
                            <div className="commission-widget__breakdown-title">Breakdown</div>
                            <div className="commission-widget__breakdown-item">
                                <span className="commission-widget__breakdown-label">Medical</span>
                                <span className="commission-widget__breakdown-value">
                                    {commissionPeriod === 'ytd' ? '$82,400' : '$12,100'}
                                </span>
                            </div>
                            <div className="commission-widget__breakdown-item">
                                <span className="commission-widget__breakdown-label">Dental</span>
                                <span className="commission-widget__breakdown-value">
                                    {commissionPeriod === 'ytd' ? '$24,200' : '$3,580'}
                                </span>
                            </div>
                            <div className="commission-widget__breakdown-item">
                                <span className="commission-widget__breakdown-label">Vision</span>
                                <span className="commission-widget__breakdown-value">
                                    {commissionPeriod === 'ytd' ? '$18,250' : '$2,740'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <h3 className="quick-actions__title">Quick Actions</h3>
                        <div className="quick-actions__grid">
                            <button className="quick-action-btn">
                                <div className="quick-action-btn__icon">
                                    <Calculator size={20} />
                                </div>
                                <span className="quick-action-btn__label">New Quote</span>
                            </button>
                            <button className="quick-action-btn">
                                <div className="quick-action-btn__icon">
                                    <UserPlus size={20} />
                                </div>
                                <span className="quick-action-btn__label">Add Group</span>
                            </button>
                            <button className="quick-action-btn">
                                <div className="quick-action-btn__icon">
                                    <FileText size={20} />
                                </div>
                                <span className="quick-action-btn__label">Commissions</span>
                            </button>
                            <button className="quick-action-btn">
                                <div className="quick-action-btn__icon">
                                    <ArrowUpRight size={20} />
                                </div>
                                <span className="quick-action-btn__label">Reports</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BrokerPortal
