import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard,
    Building2,
    DollarSign,
    TrendingUp,
    Calendar,
    Download,
    Send,
    RefreshCw,
    CheckCircle2,
    Clock,
    AlertCircle,
    Filter,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Receipt
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './PaymentProcessing.css'

interface Payment {
    id: string
    type: 'premium' | 'claim' | 'refund' | 'adjustment'
    payee: string
    amount: number
    status: 'pending' | 'processing' | 'completed' | 'failed'
    method: 'ach' | 'check' | 'wire' | 'eft'
    date: string
    reference: string
}

interface Transaction {
    id: string
    description: string
    amount: number
    type: 'credit' | 'debit'
    date: string
    category: string
}

const mockPayments: Payment[] = [
    {
        id: 'PAY-2024-001',
        type: 'claim',
        payee: 'Premier Medical Associates',
        amount: 12450.00,
        status: 'completed',
        method: 'eft',
        date: '2024-01-25',
        reference: 'CLM-2024-45678'
    },
    {
        id: 'PAY-2024-002',
        type: 'premium',
        payee: 'Acme Corporation',
        amount: 45000.00,
        status: 'processing',
        method: 'ach',
        date: '2024-01-26',
        reference: 'INV-2024-001'
    },
    {
        id: 'PAY-2024-003',
        type: 'refund',
        payee: 'John Smith',
        amount: 250.00,
        status: 'pending',
        method: 'check',
        date: '2024-01-26',
        reference: 'REF-2024-0012'
    }
]

const recentTransactions: Transaction[] = [
    { id: 'TXN-001', description: 'Premium Payment - Acme Corp', amount: 45000, type: 'credit', date: '2024-01-26', category: 'Premium' },
    { id: 'TXN-002', description: 'Claim Payout - CLM-45678', amount: 12450, type: 'debit', date: '2024-01-25', category: 'Claims' },
    { id: 'TXN-003', description: 'Provider Payment - Heart Institute', amount: 8900, type: 'debit', date: '2024-01-24', category: 'Claims' },
    { id: 'TXN-004', description: 'Premium Payment - TechStart Inc', amount: 22500, type: 'credit', date: '2024-01-24', category: 'Premium' },
    { id: 'TXN-005', description: 'Member Refund - Overpayment', amount: 175, type: 'debit', date: '2024-01-23', category: 'Refund' }
]

export function PaymentProcessing() {
    const [payments] = useState<Payment[]>(mockPayments)
    const [transactions] = useState<Transaction[]>(recentTransactions)
    const [activeTab, setActiveTab] = useState<'payments' | 'transactions'>('payments')

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const getStatusBadge = (status: Payment['status']) => {
        switch (status) {
            case 'pending': return <Badge variant="warning" icon={<Clock size={10} />}>Pending</Badge>
            case 'processing': return <Badge variant="info" icon={<RefreshCw size={10} />}>Processing</Badge>
            case 'completed': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Completed</Badge>
            case 'failed': return <Badge variant="critical" icon={<AlertCircle size={10} />}>Failed</Badge>
        }
    }

    const getMethodLabel = (method: Payment['method']) => {
        switch (method) {
            case 'ach': return 'ACH Transfer'
            case 'check': return 'Paper Check'
            case 'wire': return 'Wire Transfer'
            case 'eft': return 'EFT'
        }
    }

    return (
        <div className="payment-processing-page">
            {/* Header */}
            <div className="payment-processing__header">
                <div>
                    <h1 className="payment-processing__title">Payment Processing</h1>
                    <p className="payment-processing__subtitle">
                        Manage payments, remittances, and financial transactions
                    </p>
                </div>
                <div className="payment-processing__actions">
                    <Button variant="secondary" icon={<Download size={16} />}>
                        Export
                    </Button>
                    <Button variant="primary" icon={<Send size={16} />}>
                        New Payment
                    </Button>
                </div>
            </div>

            {/* Financial Overview */}
            <div className="payment-processing__overview">
                <MetricCard
                    title="Total Processed (MTD)"
                    value="$1,245,780"
                    change={{ value: 12.5, type: 'increase' }}
                    icon={<DollarSign size={20} />}
                />
                <MetricCard
                    title="Pending Payments"
                    value="$78,450"
                    change={{ value: 5, type: 'decrease' }}
                    icon={<Clock size={20} />}
                />
                <MetricCard
                    title="Claims Paid"
                    value="$892,340"
                    change={{ value: 8.2, type: 'increase' }}
                    icon={<Receipt size={20} />}
                />
                <MetricCard
                    title="Premium Collected"
                    value="$567,500"
                    change={{ value: 3.1, type: 'increase' }}
                    icon={<Wallet size={20} />}
                />
            </div>

            {/* Tabs */}
            <div className="payment-processing__tabs">
                <button
                    className={`payment-processing__tab ${activeTab === 'payments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payments')}
                >
                    Payment Queue
                </button>
                <button
                    className={`payment-processing__tab ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}
                >
                    Recent Transactions
                </button>
            </div>

            {/* Payment Queue */}
            {activeTab === 'payments' && (
                <GlassCard className="payment-queue">
                    <div className="payment-queue__header">
                        <h3>Payment Queue</h3>
                        <div className="payment-queue__filters">
                            <div className="payment-queue__search">
                                <Search size={16} />
                                <input type="text" placeholder="Search payments..." />
                            </div>
                            <Button variant="ghost" size="sm" icon={<Filter size={14} />}>
                                Filter
                            </Button>
                        </div>
                    </div>

                    <div className="payment-queue__list">
                        {payments.map((payment, index) => (
                            <motion.div
                                key={payment.id}
                                className="payment-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="payment-item__icon">
                                    {payment.type === 'claim' && <Receipt size={20} />}
                                    {payment.type === 'premium' && <Building2 size={20} />}
                                    {payment.type === 'refund' && <RefreshCw size={20} />}
                                    {payment.type === 'adjustment' && <DollarSign size={20} />}
                                </div>
                                <div className="payment-item__info">
                                    <div className="payment-item__payee">{payment.payee}</div>
                                    <div className="payment-item__meta">
                                        <span className="payment-item__id">{payment.id}</span>
                                        <span className="payment-item__method">{getMethodLabel(payment.method)}</span>
                                        <span className="payment-item__date">{formatDate(payment.date)}</span>
                                    </div>
                                </div>
                                <div className="payment-item__amount">
                                    {formatCurrency(payment.amount)}
                                </div>
                                {getStatusBadge(payment.status)}
                                <Button variant="ghost" size="sm">View</Button>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* Transactions */}
            {activeTab === 'transactions' && (
                <GlassCard className="transactions-list">
                    <div className="transactions-list__header">
                        <h3>Recent Transactions</h3>
                        <Button variant="ghost" size="sm" icon={<Calendar size={14} />}>
                            Date Range
                        </Button>
                    </div>

                    <div className="transactions-list__items">
                        {transactions.map((txn, index) => (
                            <motion.div
                                key={txn.id}
                                className="transaction-item"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className={`transaction-item__icon ${txn.type}`}>
                                    {txn.type === 'credit' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                </div>
                                <div className="transaction-item__info">
                                    <div className="transaction-item__desc">{txn.description}</div>
                                    <div className="transaction-item__meta">
                                        <span>{txn.category}</span>
                                        <span>{formatDate(txn.date)}</span>
                                    </div>
                                </div>
                                <div className={`transaction-item__amount ${txn.type}`}>
                                    {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* Bank Accounts */}
            <div className="bank-accounts">
                <h3>Connected Bank Accounts</h3>
                <div className="bank-accounts__grid">
                    <GlassCard className="bank-account">
                        <div className="bank-account__icon">
                            <Building2 size={24} />
                        </div>
                        <div className="bank-account__info">
                            <span className="bank-account__name">Operating Account</span>
                            <span className="bank-account__number">****4521</span>
                        </div>
                        <div className="bank-account__balance">
                            <span className="bank-account__balance-label">Available</span>
                            <span className="bank-account__balance-value">$2,345,678</span>
                        </div>
                        <Badge variant="success" size="sm">Primary</Badge>
                    </GlassCard>
                    <GlassCard className="bank-account">
                        <div className="bank-account__icon">
                            <CreditCard size={24} />
                        </div>
                        <div className="bank-account__info">
                            <span className="bank-account__name">Claims Reserve</span>
                            <span className="bank-account__number">****8934</span>
                        </div>
                        <div className="bank-account__balance">
                            <span className="bank-account__balance-label">Available</span>
                            <span className="bank-account__balance-value">$5,678,900</span>
                        </div>
                        <Badge variant="info" size="sm">Reserve</Badge>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}

export default PaymentProcessing
