import { useState } from 'react'
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
    FileText
} from 'lucide-react'
import { GlassCard, Button, Badge, MetricCard } from '../components/common'

// Mock data
const commissionStatements = [
    { id: 1, month: 'January 2024', amount: 18420, groups: 47, status: 'paid', paidDate: 'Feb 1, 2024' },
    { id: 2, month: 'December 2023', amount: 17850, groups: 45, status: 'paid', paidDate: 'Jan 2, 2024' },
    { id: 3, month: 'November 2023', amount: 16920, groups: 44, status: 'paid', paidDate: 'Dec 1, 2023' },
    { id: 4, month: 'October 2023', amount: 17230, groups: 44, status: 'paid', paidDate: 'Nov 1, 2023' },
]

const topGroups = [
    { name: 'Innovate Dynamics', premium: 284700, commission: 4270 },
    { name: 'Metro Manufacturing', premium: 156700, commission: 2350 },
    { name: 'TechFlow Solutions', premium: 89200, commission: 1338 },
    { name: 'Summit Financial', premium: 112300, commission: 1684 },
]

export function Commissions() {
    const [period, setPeriod] = useState('ytd')

    return (
        <div style={{ padding: 'var(--space-2xl)', background: 'var(--apex-obsidian)', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2xl)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--apex-white)', margin: 0 }}>Commissions</h1>
                    <p style={{ fontSize: 'var(--text-base)', color: 'var(--apex-steel)' }}>
                        Track your earnings and view commission statements
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <Button variant="ghost" size="sm">
                        <Calendar size={16} />
                        Schedule
                    </Button>
                    <Button variant="primary" size="sm">
                        <Download size={16} />
                        Export All
                    </Button>
                </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                <MetricCard label="YTD Commission" value="$124,850" change={12.4} trend="up" icon={<DollarSign size={20} />} />
                <MetricCard label="MTD Commission" value="$18,420" change={8.2} trend="up" icon={<DollarSign size={20} />} />
                <MetricCard label="Active Groups" value="47" change={4.4} trend="up" icon={<Building2 size={20} />} />
                <MetricCard label="Avg. Per Group" value="$392" change={3.1} trend="up" icon={<TrendingUp size={20} />} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)' }}>
                {/* Statements */}
                <GlassCard>
                    <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--apex-white)', margin: 0 }}>Commission Statements</h2>
                        <Button variant="ghost" size="sm"><Filter size={16} /> Filter</Button>
                    </div>
                    <div>
                        {commissionStatements.map((stmt, i) => (
                            <motion.div
                                key={stmt.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr 1fr 80px',
                                    padding: 'var(--space-md) var(--space-lg)',
                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    alignItems: 'center'
                                }}
                            >
                                <span style={{ color: 'var(--apex-white)', fontWeight: 500 }}>{stmt.month}</span>
                                <span style={{ color: 'var(--apex-silver)', fontFamily: 'var(--font-mono)' }}>
                                    ${stmt.amount.toLocaleString()}
                                </span>
                                <span style={{ color: 'var(--apex-steel)' }}>{stmt.groups} groups</span>
                                <Badge variant="success">Paid {stmt.paidDate}</Badge>
                                <Button variant="ghost" size="sm"><Download size={14} /></Button>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Top Groups */}
                <GlassCard>
                    <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--glass-border)' }}>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--apex-white)', margin: 0 }}>Top Earning Groups</h2>
                    </div>
                    <div style={{ padding: 'var(--space-md)' }}>
                        {topGroups.map((group, i) => (
                            <motion.div
                                key={group.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--space-md)',
                                    borderRadius: 'var(--radius-md)',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div>
                                    <div style={{ color: 'var(--apex-white)', fontWeight: 500, fontSize: 'var(--text-sm)' }}>{group.name}</div>
                                    <div style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-xs)' }}>
                                        ${group.premium.toLocaleString()} premium
                                    </div>
                                </div>
                                <div style={{ color: 'var(--apex-teal)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                                    ${group.commission.toLocaleString()}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default Commissions
