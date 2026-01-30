import { useState } from 'react'
import { useNavigation } from '../context/NavigationContext'
import { motion } from 'framer-motion'
import {
    DollarSign,
    CreditCard,
    Download,
    FileText,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Calendar,
    ChevronRight,
    TrendingUp,
    ArrowUpRight
} from 'lucide-react'
import { GlassCard, Button, Badge } from '../components/common'
import './Billing.css'

// Mock data
const invoices = [
    { id: 'INV-2024-02', period: 'February 2024', amount: 247850, dueDate: 'Feb 1, 2024', status: 'pending' },
    { id: 'INV-2024-01', period: 'January 2024', amount: 245200, dueDate: 'Jan 1, 2024', status: 'paid', paidDate: 'Dec 28, 2023' },
    { id: 'INV-2023-12', period: 'December 2023', amount: 243600, dueDate: 'Dec 1, 2023', status: 'paid', paidDate: 'Nov 29, 2023' },
    { id: 'INV-2023-11', period: 'November 2023', amount: 241800, dueDate: 'Nov 1, 2023', status: 'paid', paidDate: 'Oct 30, 2023' },
    { id: 'INV-2023-10', period: 'October 2023', amount: 239500, dueDate: 'Oct 1, 2023', status: 'paid', paidDate: 'Sep 28, 2023' },
]

export function Billing() {
    const { navigate } = useNavigation()

    return (
        <div className="billing-center">
            {/* Header */}
            <motion.header
                className="bl__header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="bl__header-left">
                    <div className="bl__icon-container">
                        <CreditCard size={28} />
                        <div className="bl__icon-pulse" />
                    </div>
                    <div>
                        <h1 className="bl__title">Billing & Invoices</h1>
                        <p className="bl__subtitle">Manage invoices and payment history</p>
                    </div>
                </div>
                <div className="bl__header-actions">
                    <Button variant="ghost" size="sm">
                        <Download size={16} />
                        Export
                    </Button>
                    <Button variant="primary" size="sm">
                        <CreditCard size={16} />
                        Make Payment
                    </Button>
                </div>
            </motion.header>

            {/* Current Invoice Banner */}
            <motion.div
                className="bl__current-invoice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ marginBottom: 'var(--space-xl)' }}
            >
                <div className="bl__current-label">Current Balance Due</div>
                <div className="bl__current-amount">$247,850.00</div>
                <div className="bl__current-due">Due by February 1, 2024</div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center' }}>
                    <Button variant="ghost" size="sm"><Download size={16} /> Download Invoice</Button>
                    <Button variant="primary" size="sm"><CreditCard size={16} /> Pay Now</Button>
                </div>
            </motion.div>

            {/* Metrics */}
            <div className="bl__metrics">
                {[
                    { label: 'YTD Payments', value: '$978K', icon: DollarSign, color: '#10b981' },
                    { label: 'Current Invoice', value: '$247,850', icon: FileText, color: '#8b5cf6' },
                    { label: 'Payment Status', value: 'On Time', icon: CheckCircle2, color: '#06b6d4' },
                    { label: 'Next Due', value: 'Feb 1', icon: Calendar, color: '#f59e0b' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="bl__stat-card"
                        style={{ '--stat-color': stat.color } as any}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                    >
                        <div className="bl__stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={20} />
                        </div>
                        <div className="bl__stat-content">
                            <div className="bl__stat-value">{stat.value}</div>
                            <div className="bl__stat-label">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Invoice History */}
            <motion.div
                className="bl__section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="bl__section-header">
                    <h2 className="bl__section-title">
                        <FileText size={20} />
                        Invoice History
                    </h2>
                    <Button variant="ghost" size="sm">View All</Button>
                </div>

                {/* Invoice Rows */}
                <div>
                    {invoices.map((inv, i) => (
                        <motion.div
                            key={inv.id}
                            className="bl__invoice-row"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 + i * 0.05 }}
                        >
                            <span className="bl__invoice-id">{inv.id}</span>
                            <span className="bl__invoice-date">{inv.period}</span>
                            <span className="bl__invoice-amount">${inv.amount.toLocaleString()}</span>
                            <div>
                                <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                                    {inv.status === 'paid' ? 'Paid' : `Due ${inv.dueDate}`}
                                </Badge>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                                <Button variant="ghost" size="sm"><Download size={14} /></Button>
                                <Button variant="ghost" size="sm"><FileText size={14} /></Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}

export default Billing
