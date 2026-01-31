import { ReactNode, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet, PiggyBank, Receipt, ArrowUpRight, ArrowDownLeft, Calendar, BarChart2, PieChart, Target, AlertCircle, CheckCircle, Clock, Building, Banknote } from 'lucide-react'
import './FinanceComponents.css'

// Account Balance Card
interface AccountBalanceProps { accountName: string; accountNumber?: string; balance: number; currency?: string; type?: 'checking' | 'savings' | 'credit' | 'investment'; change?: { amount: number; period: string }; className?: string }

export function AccountBalanceCard({ accountName, accountNumber, balance, currency = 'USD', type = 'checking', change, className = '' }: AccountBalanceProps) {
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val)
    const icons = { checking: <Wallet size={20} />, savings: <PiggyBank size={20} />, credit: <CreditCard size={20} />, investment: <TrendingUp size={20} /> }

    return (
        <div className={`account-balance-card account-balance-card--${type} ${className}`}>
            <div className="account-balance-card__header">
                <div className="account-balance-card__icon">{icons[type]}</div>
                <div className="account-balance-card__info">
                    <span className="account-balance-card__name">{accountName}</span>
                    {accountNumber && <span className="account-balance-card__number">••••{accountNumber.slice(-4)}</span>}
                </div>
            </div>
            <div className="account-balance-card__balance">{formatCurrency(balance)}</div>
            {change && (
                <div className={`account-balance-card__change ${change.amount >= 0 ? 'positive' : 'negative'}`}>
                    {change.amount >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{change.amount >= 0 ? '+' : ''}{formatCurrency(change.amount)}</span>
                    <span className="account-balance-card__period">{change.period}</span>
                </div>
            )}
        </div>
    )
}

// Transaction Row
interface Transaction { id: string; type: 'credit' | 'debit'; category: string; description: string; amount: number; date: Date; status?: 'completed' | 'pending' | 'failed'; merchant?: { name: string; logo?: string } }

interface TransactionRowProps { transaction: Transaction; currency?: string; onClick?: () => void; className?: string }

export function TransactionRow({ transaction, currency = 'USD', onClick, className = '' }: TransactionRowProps) {
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val)

    const getCategoryIcon = () => {
        const icons: Record<string, ReactNode> = {
            'food': <Receipt size={18} />,
            'transport': <ArrowUpRight size={18} />,
            'shopping': <CreditCard size={18} />,
            'bills': <Building size={18} />,
            'income': <Banknote size={18} />,
            'default': <DollarSign size={18} />
        }
        return icons[transaction.category] || icons.default
    }

    return (
        <div className={`transaction-row transaction-row--${transaction.status || 'completed'} ${className}`} onClick={onClick}>
            <div className={`transaction-row__icon transaction-row__icon--${transaction.type}`}>
                {getCategoryIcon()}
            </div>
            <div className="transaction-row__content">
                <span className="transaction-row__description">{transaction.description}</span>
                <span className="transaction-row__meta">
                    {transaction.merchant?.name || transaction.category} • {transaction.date.toLocaleDateString()}
                </span>
            </div>
            <div className={`transaction-row__amount transaction-row__amount--${transaction.type}`}>
                {transaction.type === 'debit' ? '-' : '+'}{formatCurrency(transaction.amount)}
            </div>
            {transaction.status && transaction.status !== 'completed' && (
                <span className={`transaction-row__status transaction-row__status--${transaction.status}`}>
                    {transaction.status === 'pending' ? <Clock size={12} /> : <AlertCircle size={12} />}
                    {transaction.status}
                </span>
            )}
        </div>
    )
}

// Budget Progress
interface BudgetProgressProps { category: string; spent: number; budget: number; currency?: string; icon?: ReactNode; className?: string }

export function BudgetProgress({ category, spent, budget, currency = 'USD', icon, className = '' }: BudgetProgressProps) {
    const percentage = Math.min(100, (spent / budget) * 100)
    const remaining = budget - spent
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val)
    const isOverBudget = spent > budget

    return (
        <div className={`budget-progress ${isOverBudget ? 'over-budget' : ''} ${className}`}>
            <div className="budget-progress__header">
                {icon && <div className="budget-progress__icon">{icon}</div>}
                <span className="budget-progress__category">{category}</span>
                <span className="budget-progress__amount">{formatCurrency(spent)} / {formatCurrency(budget)}</span>
            </div>
            <div className="budget-progress__bar">
                <div className="budget-progress__fill" style={{ width: `${Math.min(100, percentage)}%` }} />
                {percentage >= 80 && percentage < 100 && <div className="budget-progress__warning" style={{ left: '80%' }} />}
            </div>
            <span className={`budget-progress__remaining ${isOverBudget ? 'negative' : ''}`}>
                {isOverBudget ? `${formatCurrency(Math.abs(remaining))} over budget` : `${formatCurrency(remaining)} remaining`}
            </span>
        </div>
    )
}

// Expense Breakdown
interface ExpenseCategory { category: string; amount: number; percentage: number; color: string }

interface ExpenseBreakdownProps { categories: ExpenseCategory[]; total: number; currency?: string; className?: string }

export function ExpenseBreakdown({ categories, total, currency = 'USD', className = '' }: ExpenseBreakdownProps) {
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val)

    return (
        <div className={`expense-breakdown ${className}`}>
            <div className="expense-breakdown__chart">
                <svg viewBox="0 0 100 100">
                    {categories.reduce((acc, cat, i) => {
                        const startAngle = acc.angle
                        const sweep = (cat.percentage / 100) * 360
                        const endAngle = startAngle + sweep
                        const largeArc = sweep > 180 ? 1 : 0
                        const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180)
                        const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180)
                        const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180)
                        const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180)
                        acc.paths.push(<path key={i} d={`M50,50 L${x1},${y1} A40,40 0 ${largeArc},1 ${x2},${y2} Z`} fill={cat.color} />)
                        acc.angle = endAngle
                        return acc
                    }, { paths: [] as ReactNode[], angle: 0 }).paths}
                </svg>
                <div className="expense-breakdown__center">
                    <span className="expense-breakdown__total">{formatCurrency(total)}</span>
                    <span className="expense-breakdown__label">Total</span>
                </div>
            </div>
            <div className="expense-breakdown__legend">
                {categories.map(cat => (
                    <div key={cat.category} className="expense-breakdown__item">
                        <span className="expense-breakdown__dot" style={{ background: cat.color }} />
                        <span className="expense-breakdown__name">{cat.category}</span>
                        <span className="expense-breakdown__value">{formatCurrency(cat.amount)}</span>
                        <span className="expense-breakdown__percent">{cat.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Investment Card
interface Investment { id: string; name: string; symbol: string; shares: number; currentPrice: number; purchasePrice: number; change: number; changePercent: number }

interface InvestmentCardProps { investment: Investment; currency?: string; onTrade?: () => void; className?: string }

export function InvestmentCard({ investment, currency = 'USD', onTrade, className = '' }: InvestmentCardProps) {
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val)
    const totalValue = investment.shares * investment.currentPrice
    const totalGain = (investment.currentPrice - investment.purchasePrice) * investment.shares
    const isPositive = investment.change >= 0

    return (
        <div className={`investment-card ${className}`}>
            <div className="investment-card__header">
                <div className="investment-card__symbol">{investment.symbol}</div>
                <div className="investment-card__info">
                    <span className="investment-card__name">{investment.name}</span>
                    <span className="investment-card__shares">{investment.shares} shares</span>
                </div>
            </div>
            <div className="investment-card__price">
                <span className="investment-card__current">{formatCurrency(investment.currentPrice)}</span>
                <span className={`investment-card__change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {isPositive ? '+' : ''}{formatCurrency(investment.change)} ({investment.changePercent}%)
                </span>
            </div>
            <div className="investment-card__footer">
                <div className="investment-card__stat">
                    <span className="investment-card__stat-label">Total Value</span>
                    <span className="investment-card__stat-value">{formatCurrency(totalValue)}</span>
                </div>
                <div className="investment-card__stat">
                    <span className="investment-card__stat-label">Total Gain</span>
                    <span className={`investment-card__stat-value ${totalGain >= 0 ? 'positive' : 'negative'}`}>
                        {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
                    </span>
                </div>
                {onTrade && <button className="investment-card__trade" onClick={onTrade}>Trade</button>}
            </div>
        </div>
    )
}

// Quick Transfer
interface QuickTransferProps { recipients: { id: string; name: string; avatar?: string }[]; onTransfer?: (recipientId: string, amount: number) => void; className?: string }

export function QuickTransfer({ recipients, onTransfer, className = '' }: QuickTransferProps) {
    const [selectedId, setSelectedId] = useState('')
    const [amount, setAmount] = useState('')

    const handleTransfer = () => {
        if (selectedId && amount) {
            onTransfer?.(selectedId, parseFloat(amount))
            setAmount('')
        }
    }

    return (
        <div className={`quick-transfer ${className}`}>
            <h4 className="quick-transfer__title">Quick Transfer</h4>
            <div className="quick-transfer__recipients">
                {recipients.map(r => (
                    <button key={r.id} className={`quick-transfer__recipient ${selectedId === r.id ? 'selected' : ''}`} onClick={() => setSelectedId(r.id)}>
                        <div className="quick-transfer__avatar">{r.avatar ? <img src={r.avatar} alt="" /> : r.name.charAt(0)}</div>
                        <span>{r.name}</span>
                    </button>
                ))}
            </div>
            <div className="quick-transfer__form">
                <div className="quick-transfer__input">
                    <DollarSign size={18} />
                    <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <button className="quick-transfer__submit" onClick={handleTransfer} disabled={!selectedId || !amount}>Send</button>
            </div>
        </div>
    )
}

export default { AccountBalanceCard, TransactionRow, BudgetProgress, ExpenseBreakdown, InvestmentCard, QuickTransfer }
