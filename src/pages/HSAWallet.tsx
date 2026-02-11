import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CreditCard,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    Clock,
    ChevronRight,
    Download,
    Plus,
    Receipt,
    Heart,
    Pill,
    Eye,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard, PageSkeleton } from '../components/common'
import { useToast } from '../components/common/Toast'
import { exportToCSV } from '../utils/exportData'
import './HSAWallet.css'

interface Transaction {
    id: string
    type: 'expense' | 'contribution' | 'reimburse'
    description: string
    merchant: string
    amount: number
    date: string
    category: 'medical' | 'dental' | 'vision' | 'rx' | 'contribution'
    status: 'posted' | 'pending' | 'flagged'
    eligible: boolean
}

interface Account {
    type: 'hsa' | 'fsa' | 'hra'
    name: string
    balance: number
    ytdContributions: number
    ytdExpenses: number
    annualLimit: number
    employerContribution: number
    investedBalance?: number
    cardLastFour?: string
}

const mockAccount: Account = {
    type: 'hsa',
    name: 'Health Savings Account',
    balance: 4287.52,
    ytdContributions: 1500,
    ytdExpenses: 847.23,
    annualLimit: 4150,
    employerContribution: 500,
    investedBalance: 2150.00,
    cardLastFour: '4821'
}

const mockTransactions: Transaction[] = [
    {
        id: 'txn-1',
        type: 'expense',
        description: 'Office Visit Copay',
        merchant: 'Premier Medical Associates',
        amount: -25.00,
        date: '2024-01-22',
        category: 'medical',
        status: 'posted',
        eligible: true
    },
    {
        id: 'txn-2',
        type: 'expense',
        description: 'Prescription - Lisinopril',
        merchant: 'CVS Pharmacy',
        amount: -10.00,
        date: '2024-01-18',
        category: 'rx',
        status: 'posted',
        eligible: true
    },
    {
        id: 'txn-3',
        type: 'contribution',
        description: 'Payroll Contribution',
        merchant: 'Employer Contribution',
        amount: 250.00,
        date: '2024-01-15',
        category: 'contribution',
        status: 'posted',
        eligible: true
    },
    {
        id: 'txn-4',
        type: 'expense',
        description: 'Eye Exam',
        merchant: 'LensCrafters',
        amount: -45.00,
        date: '2024-01-10',
        category: 'vision',
        status: 'posted',
        eligible: true
    },
    {
        id: 'txn-5',
        type: 'expense',
        description: 'Amazon Purchase',
        merchant: 'Amazon.com',
        amount: -32.99,
        date: '2024-01-08',
        category: 'medical',
        status: 'flagged',
        eligible: false
    },
    {
        id: 'txn-6',
        type: 'contribution',
        description: 'Employer Match',
        merchant: 'Innovate Dynamics',
        amount: 41.67,
        date: '2024-01-01',
        category: 'contribution',
        status: 'posted',
        eligible: true
    }
]

export function HSAWallet() {
    const { addToast } = useToast()
    const [account] = useState<Account>(mockAccount)
    const [transactions] = useState<Transaction[]>(mockTransactions)
    const [activeTab, setActiveTab] = useState<'all' | 'expenses' | 'contributions'>('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    if (loading) return <PageSkeleton />

    const formatCurrency = (amount: number) =>
        `$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    const getCategoryIcon = (category: Transaction['category']) => {
        switch (category) {
            case 'medical': return <Heart size={14} />
            case 'rx': return <Pill size={14} />
            case 'vision': return <Eye size={14} />
            case 'dental': return <Heart size={14} />
            case 'contribution': return <Plus size={14} />
        }
    }

    const filteredTransactions = transactions.filter(t => {
        if (activeTab === 'expenses') return t.type === 'expense'
        if (activeTab === 'contributions') return t.type === 'contribution'
        return true
    })

    const contributionRemaining = account.annualLimit - account.ytdContributions
    const contributionProgress = (account.ytdContributions / account.annualLimit) * 100

    return (
        <div className="hsa-wallet">
            {/* Header */}
            <div className="hsa-wallet__header">
                <div>
                    <h1 className="hsa-wallet__title">HSA Wallet</h1>
                    <p className="hsa-wallet__subtitle">
                        Manage your Health Savings Account
                    </p>
                </div>
                <div className="hsa-wallet__actions">
                    <Button variant="secondary" icon={<Download size={16} />} onClick={() => {
                        exportToCSV(transactions.map(t => ({
                            'Date': t.date,
                            'Description': t.description,
                            'Merchant': t.merchant,
                            'Category': t.category,
                            'Amount': `$${Math.abs(t.amount).toFixed(2)}`,
                            'Type': t.type,
                            'Status': t.status,
                            'Eligible': t.eligible ? 'Yes' : 'No',
                        })), 'hsa_transactions')
                        addToast({ type: 'success', title: 'Export Complete', message: 'HSA transactions exported to CSV', duration: 3000 })
                    }}>
                        Export
                    </Button>
                    <Button variant="primary" icon={<Plus size={16} />}>
                        Add Funds
                    </Button>
                </div>
            </div>

            {/* Balance Card */}
            <motion.div
                className="hsa-wallet__balance-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <GlassCard className="balance-card">
                    <div className="balance-card__main">
                        <div className="balance-card__info">
                            <span className="balance-card__label">Available Balance</span>
                            <span className="balance-card__amount">{formatCurrency(account.balance)}</span>
                            <div className="balance-card__breakdown">
                                <span className="balance-card__cash">
                                    <Wallet size={14} />
                                    Cash: {formatCurrency(account.balance - (account.investedBalance || 0))}
                                </span>
                                {account.investedBalance && (
                                    <span className="balance-card__invested">
                                        <TrendingUp size={14} />
                                        Invested: {formatCurrency(account.investedBalance)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="balance-card__card">
                            <div className="virtual-card">
                                <div className="virtual-card__header">
                                    <span className="virtual-card__type">HSA</span>
                                    <CreditCard size={24} />
                                </div>
                                <div className="virtual-card__number">
                                    •••• •••• •••• {account.cardLastFour}
                                </div>
                                <div className="virtual-card__footer">
                                    <span>Sarah Johnson</span>
                                    <span>Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Metrics */}
            <div className="hsa-wallet__metrics">
                <MetricCard
                    title="YTD Contributions"
                    value={formatCurrency(account.ytdContributions)}
                    icon={<ArrowDownLeft size={20} />}
                    subtitle={`${formatCurrency(contributionRemaining)} remaining limit`}
                    variant="success"
                />
                <MetricCard
                    title="YTD Expenses"
                    value={formatCurrency(account.ytdExpenses)}
                    icon={<ArrowUpRight size={20} />}
                    subtitle="Eligible expenses"
                />
                <MetricCard
                    title="Employer Contribution"
                    value={formatCurrency(account.employerContribution)}
                    icon={<DollarSign size={20} />}
                    subtitle="Annual employer match"
                    variant="teal"
                />
                <MetricCard
                    title="2024 Limit"
                    value={formatCurrency(account.annualLimit)}
                    icon={<Calendar size={20} />}
                    subtitle="IRS annual maximum"
                />
            </div>

            {/* Contribution Progress */}
            <GlassCard className="hsa-wallet__contribution-progress">
                <div className="contribution-progress__header">
                    <h3>Annual Contribution Progress</h3>
                    <Badge variant="info">{contributionProgress.toFixed(0)}% of limit</Badge>
                </div>
                <div className="contribution-progress__bar-container">
                    <div className="contribution-progress__bar">
                        <motion.div
                            className="contribution-progress__fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${contributionProgress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                        <div
                            className="contribution-progress__employer"
                            style={{ width: `${(account.employerContribution / account.annualLimit) * 100}%` }}
                        />
                    </div>
                    <div className="contribution-progress__labels">
                        <span>{formatCurrency(account.ytdContributions)}</span>
                        <span>{formatCurrency(account.annualLimit)}</span>
                    </div>
                </div>
                <div className="contribution-progress__legend">
                    <span className="contribution-progress__legend-item">
                        <span className="legend-dot legend-dot--employee"></span>
                        Your Contributions
                    </span>
                    <span className="contribution-progress__legend-item">
                        <span className="legend-dot legend-dot--employer"></span>
                        Employer Match
                    </span>
                </div>
            </GlassCard>

            {/* Transactions */}
            <GlassCard className="hsa-wallet__transactions">
                <div className="transactions__header">
                    <h3>Recent Transactions</h3>
                    <div className="transactions__tabs">
                        <button
                            className={`transactions__tab ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All
                        </button>
                        <button
                            className={`transactions__tab ${activeTab === 'expenses' ? 'active' : ''}`}
                            onClick={() => setActiveTab('expenses')}
                        >
                            Expenses
                        </button>
                        <button
                            className={`transactions__tab ${activeTab === 'contributions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('contributions')}
                        >
                            Contributions
                        </button>
                    </div>
                </div>

                <div className="transactions__list">
                    <AnimatePresence>
                        {filteredTransactions.map((txn, index) => (
                            <motion.div
                                key={txn.id}
                                className={`transaction-item ${!txn.eligible ? 'transaction-item--flagged' : ''}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className={`transaction-item__icon transaction-item__icon--${txn.category}`}>
                                    {getCategoryIcon(txn.category)}
                                </div>
                                <div className="transaction-item__info">
                                    <span className="transaction-item__description">{txn.description}</span>
                                    <span className="transaction-item__merchant">{txn.merchant}</span>
                                </div>
                                <div className="transaction-item__meta">
                                    {!txn.eligible && (
                                        <Badge variant="warning" size="sm" icon={<AlertCircle size={10} />}>
                                            Needs Receipt
                                        </Badge>
                                    )}
                                    {txn.eligible && txn.type === 'expense' && (
                                        <Badge variant="success" size="sm" icon={<CheckCircle2 size={10} />}>
                                            Eligible
                                        </Badge>
                                    )}
                                    <span className="transaction-item__date">{formatDate(txn.date)}</span>
                                    <span className={`transaction-item__amount ${txn.amount > 0 ? 'positive' : 'negative'}`}>
                                        {txn.amount > 0 ? '+' : '-'}{formatCurrency(txn.amount)}
                                    </span>
                                </div>
                                <ChevronRight size={16} className="transaction-item__arrow" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="transactions__footer">
                    <Button variant="ghost">View All Transactions</Button>
                </div>
            </GlassCard>

            {/* Eligible Expenses Info */}
            <GlassCard className="hsa-wallet__eligible-info">
                <h3>Common Eligible Expenses</h3>
                <div className="eligible-expenses__grid">
                    <div className="eligible-expense">
                        <Heart size={20} />
                        <span>Doctor Visits</span>
                    </div>
                    <div className="eligible-expense">
                        <Pill size={20} />
                        <span>Prescriptions</span>
                    </div>
                    <div className="eligible-expense">
                        <Eye size={20} />
                        <span>Vision Care</span>
                    </div>
                    <div className="eligible-expense">
                        <Receipt size={20} />
                        <span>Lab Tests</span>
                    </div>
                </div>
                <p className="eligible-expenses__note">
                    Your HSA funds can be used for qualified medical expenses. Non-qualified purchases may be subject to taxes and penalties.
                </p>
            </GlassCard>
        </div>
    )
}

export default HSAWallet
