import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Receipt,
    DollarSign,
    Calendar,
    CreditCard,
    Building2,
    Users,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Download,
    Send,
    Filter,
    Search,
    FileText
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './PremiumBilling.css'

interface Invoice {
    id: string
    groupName: string
    groupNumber: string
    period: string
    amount: number
    dueDate: string
    status: 'pending' | 'paid' | 'overdue' | 'partial'
    members: number
    paidAmount?: number
}

interface PaymentHistory {
    id: string
    groupName: string
    amount: number
    method: string
    date: string
    reference: string
}

const invoices: Invoice[] = [
    { id: 'INV-2024-001', groupName: 'Acme Corporation', groupNumber: 'GRP-001', period: 'January 2024', amount: 125000, dueDate: '2024-02-01', status: 'paid', members: 245, paidAmount: 125000 },
    { id: 'INV-2024-002', groupName: 'TechStart Inc', groupNumber: 'GRP-002', period: 'January 2024', amount: 68500, dueDate: '2024-02-01', status: 'pending', members: 134 },
    { id: 'INV-2024-003', groupName: 'Global Services LLC', groupNumber: 'GRP-003', period: 'January 2024', amount: 215000, dueDate: '2024-02-01', status: 'partial', members: 420, paidAmount: 150000 },
    { id: 'INV-2024-004', groupName: 'Sunrise Healthcare', groupNumber: 'GRP-004', period: 'December 2023', amount: 45000, dueDate: '2024-01-01', status: 'overdue', members: 88 }
]

const payments: PaymentHistory[] = [
    { id: 'PAY-001', groupName: 'Acme Corporation', amount: 125000, method: 'ACH', date: '2024-01-28', reference: 'ACH-2024-001245' },
    { id: 'PAY-002', groupName: 'Global Services LLC', amount: 150000, method: 'Wire', date: '2024-01-25', reference: 'WIRE-2024-00089' },
    { id: 'PAY-003', groupName: 'MediCare Partners', amount: 89500, method: 'ACH', date: '2024-01-22', reference: 'ACH-2024-001198' }
]

export function PremiumBilling() {
    const [invoiceList] = useState<Invoice[]>(invoices)
    const [paymentList] = useState<PaymentHistory[]>(payments)
    const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices')

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

    const getStatusBadge = (status: Invoice['status']) => {
        switch (status) {
            case 'paid': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Paid</Badge>
            case 'pending': return <Badge variant="warning" icon={<Clock size={10} />}>Pending</Badge>
            case 'overdue': return <Badge variant="critical" icon={<AlertTriangle size={10} />}>Overdue</Badge>
            case 'partial': return <Badge variant="info" icon={<DollarSign size={10} />}>Partial</Badge>
        }
    }

    const stats = {
        totalBilled: invoiceList.reduce((sum, inv) => sum + inv.amount, 0),
        collected: invoiceList.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0),
        outstanding: invoiceList.reduce((sum, inv) => sum + (inv.amount - (inv.paidAmount || 0)), 0),
        overdue: invoiceList.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0)
    }

    return (
        <div className="premium-billing-page">
            {/* Header */}
            <div className="billing__header">
                <div>
                    <h1 className="billing__title">Premium Billing</h1>
                    <p className="billing__subtitle">
                        Invoice management and premium collection
                    </p>
                </div>
                <div className="billing__actions">
                    <Button variant="secondary" icon={<Download size={16} />}>
                        Export
                    </Button>
                    <Button variant="primary" icon={<Receipt size={16} />}>
                        Generate Invoice
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="billing__stats">
                <MetricCard
                    title="Total Billed (MTD)"
                    value={formatCurrency(stats.totalBilled)}
                    icon={<Receipt size={20} />}
                />
                <MetricCard
                    title="Collected"
                    value={formatCurrency(stats.collected)}
                    change={{ value: 8.5, type: 'increase' }}
                    icon={<CheckCircle2 size={20} />}
                />
                <MetricCard
                    title="Outstanding"
                    value={formatCurrency(stats.outstanding)}
                    icon={<Clock size={20} />}
                />
                <MetricCard
                    title="Overdue"
                    value={formatCurrency(stats.overdue)}
                    icon={<AlertTriangle size={20} />}
                />
            </div>

            {/* Tabs */}
            <div className="billing__tabs">
                <button
                    className={`billing__tab ${activeTab === 'invoices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('invoices')}
                >
                    <Receipt size={16} /> Invoices
                </button>
                <button
                    className={`billing__tab ${activeTab === 'payments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payments')}
                >
                    <CreditCard size={16} /> Payment History
                </button>
            </div>

            {/* Invoices */}
            {activeTab === 'invoices' && (
                <GlassCard className="invoices-panel">
                    <div className="invoices-panel__header">
                        <h3>Current Invoices</h3>
                        <div className="invoices-panel__filters">
                            <div className="invoices-panel__search">
                                <Search size={16} />
                                <input type="text" placeholder="Search groups..." />
                            </div>
                            <Button variant="ghost" size="sm" icon={<Filter size={14} />}>Filter</Button>
                        </div>
                    </div>

                    <table className="invoices-table">
                        <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Group</th>
                                <th>Period</th>
                                <th>Members</th>
                                <th>Amount</th>
                                <th>Paid</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceList.map((invoice, index) => (
                                <motion.tr
                                    key={invoice.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={invoice.status === 'overdue' ? 'overdue' : ''}
                                >
                                    <td className="invoice-id">{invoice.id}</td>
                                    <td>
                                        <div className="group-info">
                                            <span className="group-name">{invoice.groupName}</span>
                                            <span className="group-number">{invoice.groupNumber}</span>
                                        </div>
                                    </td>
                                    <td>{invoice.period}</td>
                                    <td><Users size={12} /> {invoice.members}</td>
                                    <td className="amount">{formatCurrency(invoice.amount)}</td>
                                    <td className="amount paid">{formatCurrency(invoice.paidAmount || 0)}</td>
                                    <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                    <td>{getStatusBadge(invoice.status)}</td>
                                    <td>
                                        <div className="table-actions">
                                            <Button variant="ghost" size="sm" icon={<FileText size={12} />} />
                                            <Button variant="ghost" size="sm" icon={<Send size={12} />} />
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </GlassCard>
            )}

            {/* Payments */}
            {activeTab === 'payments' && (
                <GlassCard className="payments-panel">
                    <div className="payments-panel__header">
                        <h3>Recent Payments</h3>
                        <Button variant="ghost" size="sm" icon={<Calendar size={14} />}>Date Range</Button>
                    </div>

                    <div className="payments-list">
                        {paymentList.map((payment, index) => (
                            <motion.div
                                key={payment.id}
                                className="payment-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="payment-item__icon">
                                    <CreditCard size={20} />
                                </div>
                                <div className="payment-item__info">
                                    <span className="payment-group">{payment.groupName}</span>
                                    <span className="payment-reference">{payment.reference}</span>
                                </div>
                                <div className="payment-item__method">
                                    <Badge variant="info" size="sm">{payment.method}</Badge>
                                </div>
                                <div className="payment-item__date">
                                    {new Date(payment.date).toLocaleDateString()}
                                </div>
                                <div className="payment-item__amount">
                                    {formatCurrency(payment.amount)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* Collection Summary */}
            <div className="collection-summary">
                <GlassCard className="collection-card">
                    <div className="collection-card__header">
                        <TrendingUp size={20} />
                        <h4>Collection Rate</h4>
                    </div>
                    <div className="collection-card__value">
                        {((stats.collected / stats.totalBilled) * 100).toFixed(1)}%
                    </div>
                    <div className="collection-card__progress">
                        <div
                            className="progress-fill"
                            style={{ width: `${(stats.collected / stats.totalBilled) * 100}%` }}
                        />
                    </div>
                </GlassCard>
                <GlassCard className="collection-card warning">
                    <div className="collection-card__header">
                        <AlertTriangle size={20} />
                        <h4>Past Due</h4>
                    </div>
                    <div className="collection-card__value">
                        {formatCurrency(stats.overdue)}
                    </div>
                    <p className="collection-card__desc">1 group with overdue balance</p>
                </GlassCard>
            </div>
        </div>
    )
}

export default PremiumBilling
