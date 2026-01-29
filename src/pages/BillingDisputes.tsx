import { useState } from 'react'
import { GlassCard, Badge, Button } from '../components/common'
import { AlertTriangle, Clock, CheckCircle2, Plus, FileText, MessageCircle } from 'lucide-react'

const disputes = [
    { id: 'DIS-001', claimId: 'CLM-2024-0892', date: '2024-01-20', amount: 450, reason: 'Incorrect charge amount', status: 'open' },
    { id: 'DIS-002', claimId: 'CLM-2024-0756', date: '2024-01-15', amount: 125, reason: 'Service not received', status: 'under_review' },
    { id: 'DIS-003', claimId: 'CLM-2023-1234', date: '2023-12-10', amount: 890, reason: 'Duplicate billing', status: 'resolved' }
]

export function BillingDisputes() {
    const [allDisputes] = useState(disputes)

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open': return <Badge variant="warning" icon={<Clock size={10} />}>Open</Badge>
            case 'under_review': return <Badge variant="info">Under Review</Badge>
            case 'resolved': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Resolved</Badge>
            default: return <Badge variant="default">{status}</Badge>
        }
    }

    return (
        <div style={{ padding: 'var(--space-xl)', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>
                <div>
                    <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--apex-white)', marginBottom: 'var(--space-xs)' }}>Billing Disputes</h1>
                    <p style={{ color: 'var(--apex-steel)' }}>Submit and track billing disputes</p>
                </div>
                <Button variant="primary" icon={<Plus size={16} />}>New Dispute</Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                    <Clock size={24} style={{ color: 'var(--apex-warning)' }} />
                    <div><span style={{ display: 'block', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--apex-white)' }}>{allDisputes.filter(d => d.status === 'open').length}</span><span style={{ color: 'var(--apex-steel)' }}>Open</span></div>
                </GlassCard>
                <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                    <AlertTriangle size={24} style={{ color: 'var(--apex-info)' }} />
                    <div><span style={{ display: 'block', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--apex-white)' }}>{allDisputes.filter(d => d.status === 'under_review').length}</span><span style={{ color: 'var(--apex-steel)' }}>Under Review</span></div>
                </GlassCard>
                <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                    <CheckCircle2 size={24} style={{ color: 'var(--apex-success)' }} />
                    <div><span style={{ display: 'block', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--apex-white)' }}>{allDisputes.filter(d => d.status === 'resolved').length}</span><span style={{ color: 'var(--apex-steel)' }}>Resolved</span></div>
                </GlassCard>
            </div>
            <GlassCard style={{ padding: 0 }}>
                {allDisputes.map(dispute => (
                    <div key={dispute.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', padding: 'var(--space-lg)', borderBottom: '1px solid var(--glass-border)' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--apex-warning-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={20} style={{ color: 'var(--apex-warning)' }} /></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: 'var(--apex-white)', marginBottom: 2 }}>{dispute.reason}</div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--apex-steel)' }}>Claim: {dispute.claimId} • Filed: {new Date(dispute.date).toLocaleDateString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--apex-white)', marginBottom: 4 }}>${dispute.amount}</div>
                            {getStatusBadge(dispute.status)}
                        </div>
                        <Button variant="ghost" size="sm" icon={<MessageCircle size={14} />}>Details</Button>
                    </div>
                ))}
            </GlassCard>
        </div>
    )
}

export default BillingDisputes
