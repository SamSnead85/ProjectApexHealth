import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign,
    CreditCard,
    CheckCircle2,
    Clock,
    Calendar,
    Download,
    Filter,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    Receipt,
    AlertCircle,
    ChevronDown,
    Banknote,
    Building2,
    Wallet,
    Search
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import { exportToCSV } from '../utils/exportData'

type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded'
type PaymentType = 'all' | 'Premium' | 'Copay' | 'Deductible' | 'Coinsurance' | 'Refund'

interface Payment {
    id: string
    date: string
    description: string
    amount: number
    method: string
    type: string
    status: PaymentStatus
    claimId?: string
    provider?: string
}

const payments: Payment[] = [
    { id: 'PAY-001', date: '2024-02-15', description: 'Monthly Premium - February 2024', amount: 425.00, method: 'Visa •••• 4532', type: 'Premium', status: 'completed' },
    { id: 'PAY-002', date: '2024-02-10', description: 'Office Visit - Dr. Sarah Mitchell', amount: 30.00, method: 'HSA Debit •••• 8821', type: 'Copay', status: 'completed', claimId: 'CLM-2024-1052', provider: 'Mitchell Family Medicine' },
    { id: 'PAY-003', date: '2024-02-05', description: 'Lab Work - Quest Diagnostics', amount: 87.50, method: 'Visa •••• 4532', type: 'Coinsurance', status: 'completed', claimId: 'CLM-2024-0998', provider: 'Quest Diagnostics' },
    { id: 'PAY-004', date: '2024-01-28', description: 'Specialist Visit - Dr. James Chen', amount: 60.00, method: 'HSA Debit •••• 8821', type: 'Copay', status: 'completed', claimId: 'CLM-2024-0945', provider: 'Heart Center Cardiology' },
    { id: 'PAY-005', date: '2024-01-22', description: 'Prescription - Lisinopril 10mg', amount: 12.00, method: 'HSA Debit •••• 8821', type: 'Copay', status: 'completed', claimId: 'CLM-2024-0912' },
    { id: 'PAY-006', date: '2024-01-15', description: 'Monthly Premium - January 2024', amount: 425.00, method: 'Visa •••• 4532', type: 'Premium', status: 'completed' },
    { id: 'PAY-007', date: '2024-01-10', description: 'Urgent Care Visit - Metro Urgent Care', amount: 50.00, method: 'Visa •••• 4532', type: 'Copay', status: 'completed', claimId: 'CLM-2024-0867', provider: 'Metro Urgent Care' },
    { id: 'PAY-008', date: '2024-01-05', description: 'Physical Therapy - 3 Sessions', amount: 150.00, method: 'Bank Transfer •••• 1100', type: 'Deductible', status: 'completed', claimId: 'CLM-2024-0834', provider: 'Austin PT Associates' },
    { id: 'PAY-009', date: '2023-12-28', description: 'Overcharge Correction - Lab Work', amount: -45.00, method: 'Visa •••• 4532', type: 'Refund', status: 'refunded', claimId: 'CLM-2023-2145' },
    { id: 'PAY-010', date: '2023-12-15', description: 'Monthly Premium - December 2023', amount: 425.00, method: 'Visa •••• 4532', type: 'Premium', status: 'completed' },
    { id: 'PAY-011', date: '2023-12-10', description: 'MRI - Austin Imaging Center', amount: 350.00, method: 'Bank Transfer •••• 1100', type: 'Deductible', status: 'completed', claimId: 'CLM-2023-2089', provider: 'Austin Imaging Center' },
    { id: 'PAY-012', date: '2023-12-05', description: 'Dental Cleaning - Bright Smiles', amount: 0.00, method: 'N/A (Covered)', type: 'Copay', status: 'completed', claimId: 'CLM-2023-2034', provider: 'Bright Smiles Dental' }
]

const statusConfig: Record<PaymentStatus, { color: string; variant: string; icon: React.ReactNode }> = {
    completed: { color: 'var(--apex-success)', variant: 'success', icon: <CheckCircle2 size={10} /> },
    pending: { color: 'var(--apex-warning)', variant: 'warning', icon: <Clock size={10} /> },
    failed: { color: 'var(--apex-danger)', variant: 'danger', icon: <AlertCircle size={10} /> },
    refunded: { color: 'var(--apex-info)', variant: 'info', icon: <ArrowDownRight size={10} /> }
}

const paymentTypes: PaymentType[] = ['all', 'Premium', 'Copay', 'Deductible', 'Coinsurance', 'Refund']

const cardStyle: React.CSSProperties = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 16
}

export default function PaymentHistory() {
    const [filterType, setFilterType] = useState<PaymentType>('all')
    const [dateRange, setDateRange] = useState<'all' | '30d' | '90d' | '1y'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const totalPaidYTD = payments
        .filter(p => p.date >= '2024-01-01' && p.status === 'completed' && p.amount > 0)
        .reduce((acc, p) => acc + p.amount, 0)

    const lastPayment = payments.find(p => p.status === 'completed' && p.amount > 0)

    const filteredPayments = payments.filter(p => {
        const matchesType = filterType === 'all' || p.type === filterType
        const matchesSearch = p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase())
        let matchesDate = true
        if (dateRange === '30d') matchesDate = new Date(p.date) >= new Date('2024-01-18')
        else if (dateRange === '90d') matchesDate = new Date(p.date) >= new Date('2023-11-18')
        else if (dateRange === '1y') matchesDate = new Date(p.date) >= new Date('2023-02-18')
        return matchesType && matchesSearch && matchesDate
    })

    const kpis = [
        {
            label: 'Total Paid YTD',
            value: `$${totalPaidYTD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            icon: <DollarSign size={22} />,
            color: 'var(--apex-teal)',
            trend: '+$425 from last month',
            trendUp: true
        },
        {
            label: 'Last Payment',
            value: `$${lastPayment?.amount.toFixed(2)}`,
            icon: <Receipt size={22} />,
            color: 'var(--apex-success)',
            trend: lastPayment ? new Date(lastPayment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
            trendUp: null
        },
        {
            label: 'Next Due',
            value: '$425.00',
            icon: <Calendar size={22} />,
            color: 'var(--apex-warning)',
            trend: 'Mar 15, 2024 - Premium',
            trendUp: null
        },
        {
            label: 'Payment Method',
            value: 'Visa •••• 4532',
            icon: <CreditCard size={22} />,
            color: 'var(--apex-info)',
            trend: 'Auto-pay enabled',
            trendUp: null
        }
    ]

    return (
        <div style={{ padding: 'var(--space-xl)', maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}
            >
                <div>
                    <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--apex-white)', marginBottom: 'var(--space-xs)' }}>
                        Payment History
                    </h1>
                    <p style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-md)' }}>
                        View transactions, download statements, and manage payment methods
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => exportToCSV(payments.map(p => ({
                        'Payment ID': p.id,
                        'Date': p.date,
                        'Description': p.description,
                        'Amount': p.amount,
                        'Method': p.method,
                        'Type': p.type,
                        'Status': p.status,
                        'Claim ID': p.claimId ?? '',
                        'Provider': p.provider ?? '',
                    })), 'payment_statement')}>
                        Download Statement
                    </Button>
                    <Button variant="primary" size="sm" icon={<CreditCard size={14} />}>
                        Manage Payments
                    </Button>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                {kpis.map((kpi, index) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.08 }}
                    >
                        <div style={{ ...cardStyle, padding: 'var(--space-lg)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: `${kpi.color}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: kpi.color
                                }}>
                                    {kpi.icon}
                                </div>
                                {kpi.trendUp !== null && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 2,
                                        fontSize: 'var(--text-xs)',
                                        color: kpi.trendUp ? 'var(--apex-success)' : 'var(--apex-danger)'
                                    }}>
                                        {kpi.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--apex-white)', marginBottom: 4 }}>
                                {kpi.value}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--apex-steel)' }}>
                                {kpi.label}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--apex-silver)', marginTop: 6 }}>
                                {kpi.trend}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                style={{ marginBottom: 'var(--space-lg)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'center' }}>
                        <Filter size={14} style={{ color: 'var(--apex-steel)', marginRight: 4 }} />
                        {paymentTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                style={{
                                    padding: '5px 12px', borderRadius: 8,
                                    border: filterType === type ? '1px solid var(--apex-teal)' : '1px solid var(--border-default)',
                                    background: filterType === type ? 'rgba(0, 200, 180, 0.1)' : 'rgba(0,0,0,0.02)',
                                    color: filterType === type ? 'var(--apex-teal)' : 'var(--apex-silver)',
                                    cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 500,
                                    textTransform: type === 'all' ? 'capitalize' : 'none'
                                }}
                            >
                                {type === 'all' ? 'All Types' : type}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'center' }}>
                        {(['all', '30d', '90d', '1y'] as const).map(range => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                style={{
                                    padding: '5px 12px', borderRadius: 8,
                                    border: dateRange === range ? '1px solid var(--apex-teal)' : '1px solid var(--border-default)',
                                    background: dateRange === range ? 'rgba(0, 200, 180, 0.1)' : 'rgba(0,0,0,0.02)',
                                    color: dateRange === range ? 'var(--apex-teal)' : 'var(--apex-silver)',
                                    cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 500
                                }}
                            >
                                {range === 'all' ? 'All Time' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                style={{ marginBottom: 'var(--space-md)' }}
            >
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                    padding: '10px var(--space-md)',
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 12
                }}>
                    <Search size={16} style={{ color: 'var(--apex-steel)' }} />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search transactions by description or ID..."
                        style={{ flex: 1, background: 'none', border: 'none', color: 'var(--apex-white)', outline: 'none', fontSize: 'var(--text-sm)' }}
                    />
                </div>
            </motion.div>

            {/* Transactions Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
            >
                <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: 'var(--space-md) var(--space-lg)',
                        borderBottom: '1px solid var(--border-default)'
                    }}>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--apex-white)' }}>
                            {filteredPayments.length} transaction{filteredPayments.length !== 1 ? 's' : ''}
                        </span>
                        <Button variant="ghost" size="sm" icon={<Download size={14} />} onClick={() => exportToCSV(filteredPayments.map(p => ({
                            'Payment ID': p.id,
                            'Date': p.date,
                            'Description': p.description,
                            'Amount': p.amount,
                            'Method': p.method,
                            'Type': p.type,
                            'Status': p.status,
                            'Claim ID': p.claimId ?? '',
                            'Provider': p.provider ?? '',
                        })), 'payment_history')}>Export CSV</Button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                                {['Date', 'Description', 'Type', 'Method', 'Amount', 'Status'].map(header => (
                                    <th key={header} style={{
                                        textAlign: header === 'Amount' ? 'right' : 'left',
                                        padding: 'var(--space-sm) var(--space-md)',
                                        color: 'var(--apex-steel)',
                                        fontSize: 'var(--text-xs)',
                                        textTransform: 'uppercase',
                                        fontWeight: 600,
                                        letterSpacing: '0.04em'
                                    }}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map((payment, index) => {
                                const config = statusConfig[payment.status]
                                return (
                                    <motion.tr
                                        key={payment.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2, delay: index * 0.02 }}
                                        style={{
                                            borderBottom: '1px solid rgba(0,0,0,0.04)',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.02)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td style={{ padding: 'var(--space-md)', color: 'var(--apex-silver)', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>
                                            {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: 'var(--space-md)' }}>
                                            <div style={{ color: 'var(--apex-white)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                                                {payment.description}
                                            </div>
                                            {payment.claimId && (
                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--apex-steel)', marginTop: 2 }}>
                                                    {payment.claimId}{payment.provider ? ` • ${payment.provider}` : ''}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: 'var(--space-md)' }}>
                                            <Badge variant="default" style={{ fontSize: 10 }}>{payment.type}</Badge>
                                        </td>
                                        <td style={{ padding: 'var(--space-md)', color: 'var(--apex-silver)', fontSize: 'var(--text-sm)' }}>
                                            {payment.method}
                                        </td>
                                        <td style={{
                                            padding: 'var(--space-md)',
                                            textAlign: 'right',
                                            fontWeight: 700,
                                            fontSize: 'var(--text-sm)',
                                            color: payment.amount < 0 ? 'var(--apex-success)' : 'var(--apex-white)',
                                            fontVariantNumeric: 'tabular-nums'
                                        }}>
                                            {payment.amount < 0 ? '-' : ''}${Math.abs(payment.amount).toFixed(2)}
                                        </td>
                                        <td style={{ padding: 'var(--space-md)' }}>
                                            <Badge variant={config.variant === 'danger' ? 'error' : config.variant as 'success' | 'warning' | 'info'} icon={config.icon}>
                                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                            </Badge>
                                        </td>
                                    </motion.tr>
                                )
                            })}
                        </tbody>
                    </table>

                    {filteredPayments.length === 0 && (
                        <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
                            <Receipt size={40} style={{ color: 'var(--apex-steel)', marginBottom: 'var(--space-md)', opacity: 0.4 }} />
                            <p style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-sm)' }}>No transactions match your filters</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
