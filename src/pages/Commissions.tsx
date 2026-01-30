import { useState } from 'react'
import { useNavigation } from '../context/NavigationContext'
import { motion } from 'framer-motion'
import {
    DollarSign,
    Download,
    Calendar,
    TrendingUp,
    Building2,
    Filter,
    Search,
    ChevronRight,
    FileText,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Award
} from 'lucide-react'
import { GlassCard, Button, Badge } from '../components/common'
import './Commissions.css'

// Mock data
const commissionStatements = [
    { id: 1, month: 'February 2024', amount: 19250, groups: 48, status: 'pending', paidDate: null },
    { id: 2, month: 'January 2024', amount: 18420, groups: 47, status: 'paid', paidDate: 'Feb 1, 2024' },
    { id: 3, month: 'December 2023', amount: 17850, groups: 45, status: 'paid', paidDate: 'Jan 2, 2024' },
    { id: 4, month: 'November 2023', amount: 16920, groups: 44, status: 'paid', paidDate: 'Dec 1, 2023' },
    { id: 5, month: 'October 2023', amount: 17230, groups: 44, status: 'paid', paidDate: 'Nov 1, 2023' },
]

const topGroups = [
    { name: 'Innovate Dynamics', premium: 284700, commission: 4270, trend: 8.5 },
    { name: 'Metro Manufacturing', premium: 156700, commission: 2350, trend: 3.2 },
    { name: 'TechFlow Solutions', premium: 89200, commission: 1338, trend: -2.1 },
    { name: 'Summit Financial', premium: 112300, commission: 1684, trend: 5.8 },
    { name: 'Coastal Industries', premium: 78500, commission: 1177, trend: 12.4 },
]

const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
}

export function Commissions() {
    const { navigate } = useNavigation()
    const [period, setPeriod] = useState('ytd')

    const ytdCommission = commissionStatements.reduce((sum, s) => sum + s.amount, 0)
    const mtdCommission = commissionStatements[0].amount

    return (
        <div className="commissions-dashboard">
            {/* Header */}
            <motion.header
                className="cm__header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="cm__header-left">
                    <div className="cm__icon-container">
                        <DollarSign size={28} />
                        <div className="cm__icon-pulse" />
                    </div>
                    <div>
                        <h1 className="cm__title">Commissions</h1>
                        <p className="cm__subtitle">Track your earnings and view commission statements</p>
                    </div>
                </div>
                <div className="cm__header-actions">
                    <Button variant="ghost" size="sm">
                        <Calendar size={16} />
                        Schedule
                    </Button>
                    <Button variant="primary" size="sm">
                        <Download size={16} />
                        Export All
                    </Button>
                </div>
            </motion.header>

            {/* Metrics */}
            <div className="cm__metrics">
                {[
                    { label: 'YTD Commission', value: formatCurrency(ytdCommission), icon: DollarSign, color: '#10b981', change: 12.4 },
                    { label: 'MTD Commission', value: formatCurrency(mtdCommission), icon: DollarSign, color: '#06b6d4', change: 8.2 },
                    { label: 'Active Groups', value: '47', icon: Building2, color: '#8b5cf6', change: 4.4 },
                    { label: 'Avg. Per Group', value: '$392', icon: TrendingUp, color: '#f59e0b', change: 3.1 },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="cm__stat-card"
                        style={{ '--stat-color': stat.color } as any}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                    >
                        <div className="cm__stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={20} />
                        </div>
                        <div className="cm__stat-content">
                            <div className="cm__stat-value">{stat.value}</div>
                            <div className="cm__stat-label">{stat.label}</div>
                        </div>
                        <div className="cm__stat-change" style={{ color: stat.change >= 0 ? '#10b981' : '#ef4444' }}>
                            {stat.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            <span>{Math.abs(stat.change)}%</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="cm__grid">
                {/* Statements */}
                <motion.div
                    className="cm__section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="cm__section-header">
                        <h2 className="cm__section-title">Commission Statements</h2>
                        <Button variant="ghost" size="sm"><Filter size={16} /> Filter</Button>
                    </div>
                    <div>
                        {commissionStatements.map((stmt, i) => (
                            <motion.div
                                key={stmt.id}
                                className="cm__statement-row"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 + i * 0.05 }}
                            >
                                <span className="cm__statement-month">{stmt.month}</span>
                                <span className="cm__statement-amount">${stmt.amount.toLocaleString()}</span>
                                <span className="cm__statement-groups">{stmt.groups} groups</span>
                                <Badge variant={stmt.status === 'paid' ? 'success' : 'warning'}>
                                    {stmt.status === 'paid' ? `Paid ${stmt.paidDate}` : 'Pending'}
                                </Badge>
                                <Button variant="ghost" size="sm"><Download size={14} /></Button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Top Groups */}
                <motion.div
                    className="cm__section"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="cm__section-header">
                        <h2 className="cm__section-title">Top Earning Groups</h2>
                    </div>
                    <div>
                        {topGroups.map((group, i) => (
                            <motion.div
                                key={group.name}
                                className="cm__group-row"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.45 + i * 0.05 }}
                            >
                                <div className="cm__group-info">
                                    <div className="cm__group-name">{group.name}</div>
                                    <div className="cm__group-premium">{formatCurrency(group.premium)} premium</div>
                                </div>
                                <div className="cm__group-commission">{formatCurrency(group.commission)}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Commissions
