import { GlassCard, Badge, Button } from '../components/common'
import { DollarSign, CreditCard, CheckCircle2, Clock, Calendar, Download } from 'lucide-react'

const payments = [
    { id: 'PAY-001', date: '2024-01-15', amount: 425.00, method: 'Visa •••• 4532', type: 'Premium', status: 'completed' },
    { id: 'PAY-002', date: '2024-01-10', amount: 75.50, method: 'HSA Card', type: 'Copay', status: 'completed' },
    { id: 'PAY-003', date: '2023-12-15', amount: 425.00, method: 'Visa •••• 4532', type: 'Premium', status: 'completed' },
    { id: 'PAY-004', date: '2023-12-05', amount: 150.00, method: 'Bank Transfer', type: 'Deductible', status: 'completed' },
    { id: 'PAY-005', date: '2023-11-15', amount: 425.00, method: 'Visa •••• 4532', type: 'Premium', status: 'completed' }
]

export function PaymentHistory() {
    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0)

    return (
        <div style={{ padding: 'var(--space-xl)', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--apex-white)', marginBottom: 'var(--space-xs)' }}>Payment History</h1>
                <p style={{ color: 'var(--apex-steel)' }}>View your past payments and transactions</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                    <DollarSign size={24} style={{ color: 'var(--apex-teal)' }} />
                    <div><span style={{ display: 'block', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--apex-white)' }}>${totalPaid.toLocaleString()}</span><span style={{ color: 'var(--apex-steel)' }}>Total Paid YTD</span></div>
                </GlassCard>
                <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                    <CreditCard size={24} style={{ color: 'var(--apex-teal)' }} />
                    <div><span style={{ display: 'block', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--apex-white)' }}>{payments.length}</span><span style={{ color: 'var(--apex-steel)' }}>Transactions</span></div>
                </GlassCard>
                <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                    <CheckCircle2 size={24} style={{ color: 'var(--apex-success)' }} />
                    <div><span style={{ display: 'block', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--apex-white)' }}>All Clear</span><span style={{ color: 'var(--apex-steel)' }}>No Outstanding</span></div>
                </GlassCard>
            </div>
            <GlassCard style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ textAlign: 'left', padding: 'var(--space-sm) var(--space-md)', color: 'var(--apex-steel)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Date</th>
                            <th style={{ textAlign: 'left', padding: 'var(--space-sm) var(--space-md)', color: 'var(--apex-steel)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Type</th>
                            <th style={{ textAlign: 'left', padding: 'var(--space-sm) var(--space-md)', color: 'var(--apex-steel)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Method</th>
                            <th style={{ textAlign: 'right', padding: 'var(--space-sm) var(--space-md)', color: 'var(--apex-steel)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Amount</th>
                            <th style={{ textAlign: 'left', padding: 'var(--space-sm) var(--space-md)', color: 'var(--apex-steel)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(payment => (
                            <tr key={payment.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: 'var(--space-md)', color: 'var(--apex-white)' }}>{new Date(payment.date).toLocaleDateString()}</td>
                                <td style={{ padding: 'var(--space-md)', color: 'var(--apex-silver)' }}>{payment.type}</td>
                                <td style={{ padding: 'var(--space-md)', color: 'var(--apex-silver)' }}>{payment.method}</td>
                                <td style={{ padding: 'var(--space-md)', color: 'var(--apex-white)', fontWeight: 600, textAlign: 'right' }}>${payment.amount.toFixed(2)}</td>
                                <td style={{ padding: 'var(--space-md)' }}><Badge variant="success" icon={<CheckCircle2 size={10} />}>Completed</Badge></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    )
}

export default PaymentHistory
