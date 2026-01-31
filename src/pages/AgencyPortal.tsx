import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    DollarSign,
    TrendingUp,
    Award,
    UserPlus,
    ChevronRight,
    BarChart3,
    Target,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './AgencyPortal.css'

// Mock agency data
const agencyData = {
    name: 'Apex Insurance Group',
    agencyId: 'AGY-2024-001',
    tier: 'Platinum Partner',
    totalBrokers: 24,
    activeLives: 125000,
    monthlyPremium: 8450000
}

// Broker roster
const brokers = [
    {
        id: 'BRK-001',
        name: 'Jennifer Martinez',
        avatar: 'JM',
        role: 'Senior Broker',
        clients: 42,
        lives: 8500,
        premium: 425000,
        commission: 42500,
        trend: 12,
        status: 'active'
    },
    {
        id: 'BRK-002',
        name: 'Michael Chen',
        avatar: 'MC',
        role: 'Associate Broker',
        clients: 28,
        lives: 5200,
        premium: 312000,
        commission: 28080,
        trend: 8,
        status: 'active'
    },
    {
        id: 'BRK-003',
        name: 'Sarah Thompson',
        avatar: 'ST',
        role: 'Senior Broker',
        clients: 38,
        lives: 7800,
        premium: 398000,
        commission: 39800,
        trend: -3,
        status: 'active'
    },
    {
        id: 'BRK-004',
        name: 'David Williams',
        avatar: 'DW',
        role: 'Associate Broker',
        clients: 22,
        lives: 4100,
        premium: 245000,
        commission: 22050,
        trend: 15,
        status: 'active'
    },
    {
        id: 'BRK-005',
        name: 'Emily Rodriguez',
        avatar: 'ER',
        role: 'Junior Broker',
        clients: 15,
        lives: 2800,
        premium: 168000,
        commission: 15120,
        trend: 22,
        status: 'new'
    }
]

// Aggregate commission data
const commissionData = {
    current: 2850000,
    previous: 2540000,
    growth: 12.2,
    monthly: [
        { month: 'Jan', amount: 225000 },
        { month: 'Feb', amount: 238000 },
        { month: 'Mar', amount: 242000 },
        { month: 'Apr', amount: 256000 },
        { month: 'May', amount: 268000 },
        { month: 'Jun', amount: 285000 }
    ]
}

// Performance leaderboard
const leaderboard = [
    { rank: 1, name: 'Jennifer Martinez', sales: 850000, growth: 24, badge: 'Top Performer' },
    { rank: 2, name: 'Sarah Thompson', sales: 780000, growth: 18, badge: 'Rising Star' },
    { rank: 3, name: 'Michael Chen', sales: 620000, growth: 15 },
    { rank: 4, name: 'David Williams', sales: 490000, growth: 28 },
    { rank: 5, name: 'Emily Rodriguez', sales: 320000, growth: 45, badge: 'Best Growth' }
]

export function AgencyPortal() {
    const [brokerFilter, setBrokerFilter] = useState<'all' | 'active' | 'new'>('all')

    const filteredBrokers = brokers.filter(b =>
        brokerFilter === 'all' || b.status === brokerFilter
    )

    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`
        }
        return `$${(value / 1000).toFixed(0)}K`
    }

    return (
        <div className="agency-portal">
            {/* Header */}
            <div className="agency-portal__header">
                <div>
                    <motion.h1
                        className="agency-portal__title"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {agencyData.name}
                    </motion.h1>
                    <div className="agency-portal__meta">
                        <span>{agencyData.agencyId}</span>
                        <Badge variant="teal">{agencyData.tier}</Badge>
                    </div>
                </div>
                <div className="agency-portal__header-actions">
                    <Button variant="secondary" icon={<BarChart3 size={16} />}>
                        Generate Report
                    </Button>
                    <Button variant="primary" icon={<UserPlus size={16} />}>
                        Add Broker
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="agency-portal__metrics">
                <MetricCard
                    label="Total Brokers"
                    value={agencyData.totalBrokers.toString()}
                    icon={<Users size={20} />}
                    change={3}
                    trend="up"
                    variant="success"
                />
                <MetricCard
                    label="Active Lives"
                    value={formatCurrency(agencyData.activeLives)}
                    icon={<Target size={20} />}
                    change={8.5}
                    trend="up"
                    variant="success"
                />
                <MetricCard
                    label="Monthly Premium"
                    value={formatCurrency(agencyData.monthlyPremium)}
                    icon={<DollarSign size={20} />}
                    change={12.2}
                    trend="up"
                    variant="success"
                />
                <MetricCard
                    label="YTD Commission"
                    value={formatCurrency(commissionData.current)}
                    icon={<TrendingUp size={20} />}
                    change={commissionData.growth}
                    trend="up"
                    variant="success"
                />
            </div>

            {/* Main Grid */}
            <div className="agency-portal__grid">
                {/* Broker Roster */}
                <section className="agency-portal__section agency-portal__section--roster">
                    <div className="agency-portal__section-header">
                        <h2>Broker Roster</h2>
                        <div className="agency-portal__filters">
                            <button
                                className={`agency-portal__filter-btn ${brokerFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setBrokerFilter('all')}
                            >
                                All
                            </button>
                            <button
                                className={`agency-portal__filter-btn ${brokerFilter === 'active' ? 'active' : ''}`}
                                onClick={() => setBrokerFilter('active')}
                            >
                                Active
                            </button>
                            <button
                                className={`agency-portal__filter-btn ${brokerFilter === 'new' ? 'active' : ''}`}
                                onClick={() => setBrokerFilter('new')}
                            >
                                New
                            </button>
                        </div>
                    </div>

                    <div className="agency-portal__roster">
                        {filteredBrokers.map((broker, index) => (
                            <motion.div
                                key={broker.id}
                                className="agency-portal__broker-card netflix-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="agency-portal__broker-header">
                                    <div className="agency-portal__broker-avatar">
                                        {broker.avatar}
                                    </div>
                                    <div className="agency-portal__broker-info">
                                        <span className="agency-portal__broker-name">{broker.name}</span>
                                        <span className="agency-portal__broker-role">{broker.role}</span>
                                    </div>
                                    {broker.status === 'new' && (
                                        <Badge variant="info" size="sm">New</Badge>
                                    )}
                                </div>

                                <div className="agency-portal__broker-stats">
                                    <div className="agency-portal__broker-stat">
                                        <span className="agency-portal__broker-stat-value">{broker.clients}</span>
                                        <span className="agency-portal__broker-stat-label">Clients</span>
                                    </div>
                                    <div className="agency-portal__broker-stat">
                                        <span className="agency-portal__broker-stat-value">{(broker.lives / 1000).toFixed(1)}K</span>
                                        <span className="agency-portal__broker-stat-label">Lives</span>
                                    </div>
                                    <div className="agency-portal__broker-stat">
                                        <span className="agency-portal__broker-stat-value">{formatCurrency(broker.premium)}</span>
                                        <span className="agency-portal__broker-stat-label">Premium</span>
                                    </div>
                                </div>

                                <div className="agency-portal__broker-footer">
                                    <div className="agency-portal__broker-commission">
                                        <span className="agency-portal__broker-commission-value">
                                            {formatCurrency(broker.commission)}
                                        </span>
                                        <span className={`agency-portal__broker-trend ${broker.trend >= 0 ? 'positive' : 'negative'}`}>
                                            {broker.trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                            {Math.abs(broker.trend)}%
                                        </span>
                                    </div>
                                    <Button variant="ghost" size="sm" icon={<ChevronRight size={14} />}>
                                        View
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Right Column */}
                <div className="agency-portal__column">
                    {/* Performance Leaderboard */}
                    <section className="agency-portal__section">
                        <div className="agency-portal__section-header">
                            <h2>Performance Leaderboard</h2>
                            <Badge variant="teal" size="sm" icon={<Award size={10} />}>Q1 2024</Badge>
                        </div>

                        <GlassCard className="agency-portal__leaderboard">
                            {leaderboard.map((entry, index) => (
                                <motion.div
                                    key={entry.rank}
                                    className="agency-portal__leaderboard-row"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="agency-portal__leaderboard-rank">
                                        {entry.rank <= 3 ? (
                                            <span className={`agency-portal__medal agency-portal__medal--${entry.rank}`}>
                                                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                                            </span>
                                        ) : (
                                            <span className="agency-portal__rank-number">{entry.rank}</span>
                                        )}
                                    </div>
                                    <div className="agency-portal__leaderboard-info">
                                        <span className="agency-portal__leaderboard-name">{entry.name}</span>
                                        {entry.badge && (
                                            <Badge variant={entry.rank === 1 ? 'success' : 'info'} size="sm">
                                                {entry.badge}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="agency-portal__leaderboard-stats">
                                        <span className="agency-portal__leaderboard-sales">{formatCurrency(entry.sales)}</span>
                                        <span className="agency-portal__leaderboard-growth">
                                            <ArrowUpRight size={12} />
                                            {entry.growth}%
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </GlassCard>
                    </section>

                    {/* Commission Summary */}
                    <section className="agency-portal__section">
                        <div className="agency-portal__section-header">
                            <h2>Commission Trend</h2>
                            <span className="agency-portal__section-link">Full Report →</span>
                        </div>

                        <GlassCard className="agency-portal__commission-chart">
                            <div className="agency-portal__chart-header">
                                <div>
                                    <span className="agency-portal__chart-value">{formatCurrency(commissionData.current)}</span>
                                    <span className="agency-portal__chart-label">YTD Commission</span>
                                </div>
                                <Badge variant="success">
                                    +{commissionData.growth}% vs Last Year
                                </Badge>
                            </div>

                            <div className="agency-portal__chart-bars">
                                {commissionData.monthly.map((month, index) => (
                                    <div key={month.month} className="agency-portal__chart-bar-group">
                                        <motion.div
                                            className="agency-portal__chart-bar"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(month.amount / 300000) * 100}%` }}
                                            transition={{ delay: index * 0.1, duration: 0.5 }}
                                        />
                                        <span className="agency-portal__chart-bar-label">{month.month}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default AgencyPortal
