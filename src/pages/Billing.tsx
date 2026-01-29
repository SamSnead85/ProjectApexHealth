import { useState } from 'react'
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
    TrendingUp
} from 'lucide-react'
import { GlassCard, Button, Badge, MetricCard } from '../components/common'

// Mock data
const invoices = [
    { id: 'INV-2024-02', period: 'February 2024', amount: 247850, dueDate: 'Feb 1, 2024', status: 'pending' },
    { id: 'INV-2024-01', period: 'January 2024', amount: 245200, dueDate: 'Jan 1, 2024', status: 'paid', paidDate: 'Dec 28, 2023' },
    { id: 'INV-2023-12', period: 'December 2023', amount: 243600, dueDate: 'Dec 1, 2023', status: 'paid', paidDate: 'Nov 29, 2023' },
    { id: 'INV-2023-11', period: 'November 2023', amount: 241800, dueDate: 'Nov 1, 2023', status: 'paid', paidDate: 'Oct 30, 2023' },
]

export function Billing() {
    return (
        <div style={{ padding: 'var(--space-2xl)', background: 'var(--apex-obsidian)', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2xl)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--apex-white)', margin: 0 }}>Billing & Invoices</h1>
                    <p style={{ fontSize: 'var(--text-base)', color: 'var(--apex-steel)' }}>
                        Manage invoices and payment history
                    </p>
                </div>
                <Button variant="primary" size="sm">
                    <CreditCard size={16} />
                    Make Payment
                </Button>
            </div>

            {/* Current Due Banner */}
            <GlassCard style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-xl)', background: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.05) 100%)', border: '1px solid rgba(6,182,212,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>Current Balance Due</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--apex-white)' }}>$247,850.00</div>
                        <div style={{ color: 'var(--apex-teal)', fontSize: 'var(--text-sm)' }}>Due by February 1, 2024</div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <Button variant="ghost" size="sm"><Download size={16} /> Download Invoice</Button>
                        <Button variant="primary" size="sm"><CreditCard size={16} /> Pay Now</Button>
                    </div>
                </div>
            </GlassCard>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                <MetricCard label="YTD Payments" value="$978K" change={5.2} trend="up" icon={<DollarSign size={20} />} />
                <MetricCard label="Current Invoice" value="$247,850" icon={<FileText size={20} />} />
                <MetricCard label="Payment Status" value="On Time" icon={<CheckCircle2 size={20} />} iconColor="#10B981" />
                <MetricCard label="Next Due" value="Feb 1" icon={<Calendar size={20} />} />
            </div>

            {/* Invoice History */}
            <GlassCard>
                <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--apex-white)', margin: 0 }}>Invoice History</h2>
                    <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 120px', padding: 'var(--space-md) var(--space-lg)', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase' }}>Invoice</span>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase' }}>Period</span>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase' }}>Amount</span>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase' }}>Status</span>
                        <span></span>
                    </div>
                    {invoices.map((inv, i) => (
                        <motion.div
                            key={inv.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr 1fr 120px',
                                padding: 'var(--space-md) var(--space-lg)',
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                alignItems: 'center'
                            }}
                        >
                            <span style={{ color: 'var(--apex-white)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{inv.id}</span>
                            <span style={{ color: 'var(--apex-silver)' }}>{inv.period}</span>
                            <span style={{ color: 'var(--apex-white)', fontFamily: 'var(--font-mono)' }}>${inv.amount.toLocaleString()}</span>
                            <div>
                                {inv.status === 'paid' ? (
                                    <Badge variant="success">Paid</Badge>
                                ) : (
                                    <Badge variant="warning">Due {inv.dueDate}</Badge>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                                <Button variant="ghost" size="sm"><Download size={14} /></Button>
                                <Button variant="ghost" size="sm"><FileText size={14} /></Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </GlassCard>
        </div>
    )
}

export default Billing
