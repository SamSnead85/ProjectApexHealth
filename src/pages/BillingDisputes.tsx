import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    AlertTriangle,
    Clock,
    CheckCircle2,
    Plus,
    FileText,
    MessageCircle,
    X,
    Send,
    DollarSign,
    TrendingDown,
    Timer,
    User,
    Calendar,
    ChevronRight,
    ArrowRight,
    Filter,
    Search,
    Upload,
    Hash
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'

type DisputeStatus = 'open' | 'under_review' | 'escalated' | 'resolved' | 'denied'

interface Dispute {
    id: string
    claimId: string
    date: string
    amount: number
    reason: string
    description: string
    status: DisputeStatus
    assignee: string
    provider: string
    lastUpdate: string
    timeline: { date: string; event: string; by: string }[]
}

const disputes: Dispute[] = [
    {
        id: 'DIS-001', claimId: 'CLM-2024-0892', date: '2024-01-20', amount: 450.00,
        reason: 'Incorrect charge amount', description: 'Billed for a Level 5 visit but only received a Level 3 office visit. Documentation supports Level 3 E/M code.',
        status: 'open', assignee: 'Jennifer Walsh', provider: 'Austin Medical Associates',
        lastUpdate: '2024-02-10',
        timeline: [
            { date: '2024-01-20', event: 'Dispute filed', by: 'Member' },
            { date: '2024-01-22', event: 'Assigned to reviewer', by: 'System' },
            { date: '2024-02-01', event: 'Documentation requested from provider', by: 'Jennifer Walsh' },
            { date: '2024-02-10', event: 'Awaiting provider response', by: 'Jennifer Walsh' }
        ]
    },
    {
        id: 'DIS-002', claimId: 'CLM-2024-0756', date: '2024-01-15', amount: 125.00,
        reason: 'Service not received', description: 'Charged copay for follow-up visit that was cancelled within the 24-hour window. Cancellation confirmation email available.',
        status: 'under_review', assignee: 'Marcus Reyes', provider: 'Metro Urgent Care',
        lastUpdate: '2024-02-08',
        timeline: [
            { date: '2024-01-15', event: 'Dispute filed', by: 'Member' },
            { date: '2024-01-16', event: 'Under review - documentation verified', by: 'Marcus Reyes' },
            { date: '2024-02-08', event: 'Cancellation confirmed, processing refund', by: 'Marcus Reyes' }
        ]
    },
    {
        id: 'DIS-003', claimId: 'CLM-2024-0601', date: '2024-01-08', amount: 890.00,
        reason: 'Duplicate billing', description: 'Billed twice for the same MRI procedure on the same date of service. Only one MRI was performed.',
        status: 'escalated', assignee: 'Sarah Kim', provider: 'Austin Imaging Center',
        lastUpdate: '2024-02-05',
        timeline: [
            { date: '2024-01-08', event: 'Dispute filed', by: 'Member' },
            { date: '2024-01-10', event: 'Initial review completed', by: 'Jennifer Walsh' },
            { date: '2024-01-20', event: 'Escalated to senior reviewer', by: 'Jennifer Walsh' },
            { date: '2024-02-05', event: 'Provider billing department contacted', by: 'Sarah Kim' }
        ]
    },
    {
        id: 'DIS-004', claimId: 'CLM-2023-1234', date: '2023-12-10', amount: 350.00,
        reason: 'Out-of-network billed as in-network', description: 'Emergency room visit at in-network hospital but attending physician was out-of-network. Should be covered under surprise billing protections.',
        status: 'resolved', assignee: 'Marcus Reyes', provider: 'St. David\'s Medical Center',
        lastUpdate: '2024-01-25',
        timeline: [
            { date: '2023-12-10', event: 'Dispute filed', by: 'Member' },
            { date: '2023-12-12', event: 'Assigned to reviewer', by: 'System' },
            { date: '2023-12-20', event: 'No Surprises Act review initiated', by: 'Marcus Reyes' },
            { date: '2024-01-15', event: 'Provider agreed to in-network rate', by: 'Marcus Reyes' },
            { date: '2024-01-25', event: 'Refund of $350 processed', by: 'System' }
        ]
    },
    {
        id: 'DIS-005', claimId: 'CLM-2023-1098', date: '2023-11-28', amount: 75.00,
        reason: 'Preventive care charged copay', description: 'Annual wellness exam was billed with a copay but should be covered at 100% as preventive care.',
        status: 'resolved', assignee: 'Jennifer Walsh', provider: 'Mitchell Family Medicine',
        lastUpdate: '2024-01-10',
        timeline: [
            { date: '2023-11-28', event: 'Dispute filed', by: 'Member' },
            { date: '2023-12-02', event: 'Coding review initiated', by: 'Jennifer Walsh' },
            { date: '2023-12-15', event: 'Confirmed incorrect coding by provider', by: 'Jennifer Walsh' },
            { date: '2024-01-10', event: 'Refund of $75 processed', by: 'System' }
        ]
    },
    {
        id: 'DIS-006', claimId: 'CLM-2023-0945', date: '2023-11-15', amount: 200.00,
        reason: 'Pre-authorization not honored', description: 'Specialist visit was pre-authorized but claim was denied stating no authorization on file.',
        status: 'denied', assignee: 'Sarah Kim', provider: 'Heart Center Cardiology',
        lastUpdate: '2024-01-05',
        timeline: [
            { date: '2023-11-15', event: 'Dispute filed', by: 'Member' },
            { date: '2023-11-18', event: 'Authorization records reviewed', by: 'Sarah Kim' },
            { date: '2023-12-01', event: 'Authorization was for different service code', by: 'Sarah Kim' },
            { date: '2024-01-05', event: 'Dispute denied - authorization mismatch', by: 'Sarah Kim' }
        ]
    }
]

const statusConfig: Record<DisputeStatus, { label: string; variant: string; icon: React.ReactNode; color: string }> = {
    open: { label: 'Open', variant: 'warning', icon: <Clock size={10} />, color: 'var(--apex-warning)' },
    under_review: { label: 'Under Review', variant: 'info', icon: <Search size={10} />, color: 'var(--apex-info)' },
    escalated: { label: 'Escalated', variant: 'danger', icon: <AlertTriangle size={10} />, color: 'var(--apex-danger)' },
    resolved: { label: 'Resolved', variant: 'success', icon: <CheckCircle2 size={10} />, color: 'var(--apex-success)' },
    denied: { label: 'Denied', variant: 'danger', icon: <X size={10} />, color: 'var(--apex-danger)' }
}

const cardStyle: React.CSSProperties = {
    background: 'rgba(10, 15, 26, 0.6)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16
}

export default function BillingDisputes() {
    const [selectedDispute, setSelectedDispute] = useState<string | null>(null)
    const [showNewForm, setShowNewForm] = useState(false)
    const [filterStatus, setFilterStatus] = useState<'all' | DisputeStatus>('all')

    const openCount = disputes.filter(d => d.status === 'open' || d.status === 'under_review' || d.status === 'escalated').length
    const resolvedCount = disputes.filter(d => d.status === 'resolved').length
    const totalDisputed = disputes.filter(d => d.status !== 'resolved').reduce((s, d) => s + d.amount, 0)
    const avgResolutionDays = 32

    const selectedDisputeData = disputes.find(d => d.id === selectedDispute)
    const filteredDisputes = disputes.filter(d => filterStatus === 'all' || d.status === filterStatus)

    const kpis = [
        { label: 'Open Disputes', value: openCount, icon: <Clock size={22} />, color: 'var(--apex-warning)' },
        { label: 'Resolved', value: resolvedCount, icon: <CheckCircle2 size={22} />, color: 'var(--apex-success)' },
        { label: 'Amount Disputed', value: `$${totalDisputed.toLocaleString()}`, icon: <DollarSign size={22} />, color: 'var(--apex-danger)' },
        { label: 'Avg Resolution', value: `${avgResolutionDays} days`, icon: <Timer size={22} />, color: 'var(--apex-info)' }
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
                        Billing Disputes
                    </h1>
                    <p style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-md)' }}>
                        Submit, track, and manage billing disputes and claim corrections
                    </p>
                </div>
                <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowNewForm(!showNewForm)}>
                    File New Dispute
                </Button>
            </motion.div>

            {/* New Dispute Form */}
            <AnimatePresence>
                {showNewForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden', marginBottom: 'var(--space-xl)' }}
                    >
                        <div style={{
                            ...cardStyle,
                            padding: 'var(--space-xl)',
                            border: '1px solid rgba(0, 200, 180, 0.15)',
                            background: 'linear-gradient(135deg, rgba(0, 200, 180, 0.04), rgba(10, 15, 26, 0.6))'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--apex-white)' }}>
                                    File a New Dispute
                                </h2>
                                <button onClick={() => setShowNewForm(false)} style={{ background: 'none', border: 'none', color: 'var(--apex-steel)', cursor: 'pointer' }}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                                {[
                                    { label: 'Claim ID', placeholder: 'CLM-2024-XXXX', icon: <Hash size={14} /> },
                                    { label: 'Disputed Amount', placeholder: '$0.00', icon: <DollarSign size={14} /> },
                                    { label: 'Provider Name', placeholder: 'Enter provider name', icon: <User size={14} /> },
                                    { label: 'Date of Service', placeholder: 'MM/DD/YYYY', icon: <Calendar size={14} /> }
                                ].map(field => (
                                    <div key={field.label}>
                                        <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            {field.label}
                                        </label>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '10px 14px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: 10
                                        }}>
                                            <span style={{ color: 'var(--apex-steel)' }}>{field.icon}</span>
                                            <input placeholder={field.placeholder} style={{ flex: 1, background: 'none', border: 'none', color: 'var(--apex-white)', outline: 'none', fontSize: 'var(--text-sm)' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Reason for Dispute
                                </label>
                                <select style={{
                                    width: '100%', padding: '10px 14px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 10, color: 'var(--apex-silver)',
                                    fontSize: 'var(--text-sm)', outline: 'none'
                                }}>
                                    <option value="" style={{ background: '#0a0f1a' }}>Select a reason...</option>
                                    <option value="incorrect-charge" style={{ background: '#0a0f1a' }}>Incorrect charge amount</option>
                                    <option value="duplicate" style={{ background: '#0a0f1a' }}>Duplicate billing</option>
                                    <option value="not-received" style={{ background: '#0a0f1a' }}>Service not received</option>
                                    <option value="network" style={{ background: '#0a0f1a' }}>Out-of-network billed incorrectly</option>
                                    <option value="preauth" style={{ background: '#0a0f1a' }}>Pre-authorization not honored</option>
                                    <option value="other" style={{ background: '#0a0f1a' }}>Other</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Description
                                </label>
                                <textarea
                                    placeholder="Describe the billing issue in detail..."
                                    rows={3}
                                    style={{
                                        width: '100%', padding: '10px 14px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: 10, color: 'var(--apex-white)',
                                        fontSize: 'var(--text-sm)', outline: 'none',
                                        resize: 'vertical', fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Button variant="ghost" icon={<Upload size={14} />}>Attach Documents</Button>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                    <Button variant="secondary" onClick={() => setShowNewForm(false)}>Cancel</Button>
                                    <Button variant="primary" icon={<Send size={14} />}>Submit Dispute</Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: `${kpi.color}15`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: kpi.color, marginBottom: 'var(--space-md)'
                            }}>
                                {kpi.icon}
                            </div>
                            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--apex-white)', marginBottom: 4 }}>
                                {kpi.value}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--apex-steel)' }}>{kpi.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Status Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                style={{ display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-lg)', alignItems: 'center' }}
            >
                <Filter size={14} style={{ color: 'var(--apex-steel)', marginRight: 4 }} />
                {(['all', 'open', 'under_review', 'escalated', 'resolved', 'denied'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        style={{
                            padding: '5px 12px', borderRadius: 8,
                            border: filterStatus === status ? '1px solid var(--apex-teal)' : '1px solid rgba(255,255,255,0.08)',
                            background: filterStatus === status ? 'rgba(0, 200, 180, 0.1)' : 'rgba(255,255,255,0.03)',
                            color: filterStatus === status ? 'var(--apex-teal)' : 'var(--apex-silver)',
                            cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 500
                        }}
                    >
                        {status === 'all' ? 'All' : status === 'under_review' ? 'Under Review' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedDisputeData ? '1fr 420px' : '1fr', gap: 'var(--space-xl)' }}>
                {/* Disputes Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    {['Dispute ID', 'Date Filed', 'Reason', 'Amount', 'Status', 'Assignee'].map(header => (
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
                                {filteredDisputes.map((dispute, index) => {
                                    const config = statusConfig[dispute.status]
                                    const isSelected = selectedDispute === dispute.id
                                    return (
                                        <motion.tr
                                            key={dispute.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2, delay: index * 0.03 }}
                                            onClick={() => setSelectedDispute(isSelected ? null : dispute.id)}
                                            style={{
                                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                cursor: 'pointer',
                                                background: isSelected ? 'rgba(0, 200, 180, 0.03)' : 'transparent'
                                            }}
                                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                                        >
                                            <td style={{ padding: 'var(--space-md)', color: 'var(--apex-teal)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                                                {dispute.id}
                                            </td>
                                            <td style={{ padding: 'var(--space-md)', color: 'var(--apex-silver)', fontSize: 'var(--text-sm)' }}>
                                                {new Date(dispute.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: 'var(--space-md)' }}>
                                                <div style={{ color: 'var(--apex-white)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                                                    {dispute.reason}
                                                </div>
                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--apex-steel)', marginTop: 2 }}>
                                                    {dispute.claimId} • {dispute.provider}
                                                </div>
                                            </td>
                                            <td style={{ padding: 'var(--space-md)', textAlign: 'right', fontWeight: 700, color: 'var(--apex-white)', fontSize: 'var(--text-sm)', fontVariantNumeric: 'tabular-nums' }}>
                                                ${dispute.amount.toFixed(2)}
                                            </td>
                                            <td style={{ padding: 'var(--space-md)' }}>
                                                <Badge variant={config.variant === 'danger' ? 'error' : config.variant as 'warning' | 'info' | 'success'} icon={config.icon}>
                                                    {config.label}
                                                </Badge>
                                            </td>
                                            <td style={{ padding: 'var(--space-md)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <div style={{
                                                        width: 24, height: 24, borderRadius: 6,
                                                        background: 'rgba(255,255,255,0.06)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 'var(--text-xs)', color: 'var(--apex-silver)', fontWeight: 600
                                                    }}>
                                                        {dispute.assignee.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--apex-silver)' }}>
                                                        {dispute.assignee}
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Dispute Detail Panel */}
                <AnimatePresence>
                    {selectedDisputeData && (
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div style={{ ...cardStyle, padding: 'var(--space-lg)', position: 'sticky', top: 'var(--space-xl)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                                    <div>
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--apex-steel)' }}>Dispute Details</span>
                                        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--apex-teal)' }}>
                                            {selectedDisputeData.id}
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedDispute(null)} style={{ background: 'none', border: 'none', color: 'var(--apex-steel)', cursor: 'pointer' }}>
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Status & Amount */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                                    <Badge variant={statusConfig[selectedDisputeData.status].variant === 'danger' ? 'error' : statusConfig[selectedDisputeData.status].variant as 'warning' | 'info' | 'success'} icon={statusConfig[selectedDisputeData.status].icon}>
                                        {statusConfig[selectedDisputeData.status].label}
                                    </Badge>
                                    <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--apex-white)' }}>
                                        ${selectedDisputeData.amount.toFixed(2)}
                                    </span>
                                </div>

                                {/* Details Grid */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                                    {[
                                        { label: 'Claim ID', value: selectedDisputeData.claimId },
                                        { label: 'Provider', value: selectedDisputeData.provider },
                                        { label: 'Reason', value: selectedDisputeData.reason },
                                        { label: 'Filed', value: new Date(selectedDisputeData.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                                        { label: 'Assignee', value: selectedDisputeData.assignee },
                                        { label: 'Last Update', value: new Date(selectedDisputeData.lastUpdate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }
                                    ].map(item => (
                                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--apex-steel)' }}>{item.label}</span>
                                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--apex-white)', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Description */}
                                <div style={{ marginBottom: 'var(--space-lg)' }}>
                                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-xs)' }}>
                                        Description
                                    </div>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--apex-silver)', lineHeight: 1.6 }}>
                                        {selectedDisputeData.description}
                                    </p>
                                </div>

                                {/* Resolution Timeline */}
                                <div style={{ marginBottom: 'var(--space-lg)' }}>
                                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-md)' }}>
                                        Resolution Timeline
                                    </div>
                                    <div style={{ position: 'relative', paddingLeft: 20 }}>
                                        {/* Vertical line */}
                                        <div style={{
                                            position: 'absolute', left: 5, top: 6, bottom: 6,
                                            width: 2, background: 'rgba(255,255,255,0.06)'
                                        }} />
                                        {selectedDisputeData.timeline.map((event, i) => (
                                            <div key={i} style={{ position: 'relative', marginBottom: i < selectedDisputeData.timeline.length - 1 ? 'var(--space-md)' : 0 }}>
                                                <div style={{
                                                    position: 'absolute', left: -17, top: 4,
                                                    width: 10, height: 10, borderRadius: '50%',
                                                    background: i === selectedDisputeData.timeline.length - 1
                                                        ? statusConfig[selectedDisputeData.status].color
                                                        : 'rgba(255,255,255,0.15)',
                                                    border: i === selectedDisputeData.timeline.length - 1
                                                        ? `2px solid ${statusConfig[selectedDisputeData.status].color}`
                                                        : '2px solid rgba(255,255,255,0.1)'
                                                }} />
                                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--apex-white)', fontWeight: 500, marginBottom: 2 }}>
                                                    {event.event}
                                                </div>
                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--apex-steel)' }}>
                                                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {event.by}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                {(selectedDisputeData.status === 'open' || selectedDisputeData.status === 'under_review' || selectedDisputeData.status === 'escalated') && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                        <Button variant="primary" style={{ width: '100%' }} icon={<MessageCircle size={14} />}>
                                            Add Comment
                                        </Button>
                                        <Button variant="secondary" style={{ width: '100%' }} icon={<Upload size={14} />}>
                                            Upload Documentation
                                        </Button>
                                    </div>
                                )}
                                {selectedDisputeData.status === 'denied' && (
                                    <Button variant="primary" style={{ width: '100%' }} icon={<ArrowRight size={14} />}>
                                        File Appeal
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
