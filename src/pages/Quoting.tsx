import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Calculator,
    Upload,
    FileSpreadsheet,
    Building2,
    Users,
    ChevronRight,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle2
} from 'lucide-react'
import { GlassCard, Button, Badge, MetricCard } from '../components/common'

// Mock quotes
const recentQuotes = [
    { id: 'QT-4821', company: 'Tech Innovators LLC', employees: 125, status: 'pending', created: '2 hours ago' },
    { id: 'QT-4820', company: 'Summit Corp', employees: 340, status: 'sent', created: '1 day ago' },
    { id: 'QT-4819', company: 'Valley Systems', employees: 89, status: 'accepted', created: '3 days ago' },
    { id: 'QT-4818', company: 'Pacific Industries', employees: 210, status: 'expired', created: '2 weeks ago' },
]

const carriers = [
    { name: 'Blue Shield', logo: '🔵', plans: 12 },
    { name: 'Aetna', logo: '❤️', plans: 8 },
    { name: 'UnitedHealthcare', logo: '🟠', plans: 15 },
    { name: 'Cigna', logo: '🟢', plans: 10 },
]

export function Quoting() {
    return (
        <div style={{ padding: 'var(--space-2xl)', background: 'var(--apex-obsidian)', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2xl)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--apex-white)', margin: 0 }}>Quote Engine</h1>
                    <p style={{ fontSize: 'var(--text-base)', color: 'var(--apex-steel)' }}>
                        Generate multi-carrier quotes and proposals
                    </p>
                </div>
                <Button variant="primary" size="sm">
                    <Plus size={16} />
                    New Quote
                </Button>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                <GlassCard>
                    <div style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)', cursor: 'pointer' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--apex-teal)' }}>
                            <Upload size={24} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'var(--apex-white)', fontWeight: 600 }}>Upload Census</div>
                            <div style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-sm)' }}>Import employee data</div>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)', cursor: 'pointer' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                            <Calculator size={24} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'var(--apex-white)', fontWeight: 600 }}>Quick Quote</div>
                            <div style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-sm)' }}>Estimate without census</div>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)', cursor: 'pointer' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                            <FileSpreadsheet size={24} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'var(--apex-white)', fontWeight: 600 }}>Compare Plans</div>
                            <div style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-sm)' }}>Side-by-side comparison</div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)' }}>
                {/* Recent Quotes */}
                <GlassCard>
                    <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--apex-white)', margin: 0 }}>Recent Quotes</h2>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <Button variant="ghost" size="sm"><Search size={16} /></Button>
                            <Button variant="ghost" size="sm"><Filter size={16} /></Button>
                        </div>
                    </div>
                    <div>
                        {recentQuotes.map((quote, i) => (
                            <motion.div
                                key={quote.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--space-md) var(--space-lg)',
                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--apex-silver)' }}>
                                        <Building2 size={18} />
                                    </div>
                                    <div>
                                        <div style={{ color: 'var(--apex-white)', fontWeight: 500 }}>{quote.company}</div>
                                        <div style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-xs)' }}>{quote.id} • {quote.employees} employees</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                    <span style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-xs)' }}>{quote.created}</span>
                                    <Badge variant={quote.status === 'accepted' ? 'success' : quote.status === 'expired' ? 'error' : 'info'}>
                                        {quote.status}
                                    </Badge>
                                    <ChevronRight size={16} style={{ color: 'var(--apex-steel)' }} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Available Carriers */}
                <GlassCard>
                    <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--glass-border)' }}>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--apex-white)', margin: 0 }}>Available Carriers</h2>
                    </div>
                    <div style={{ padding: 'var(--space-md)' }}>
                        {carriers.map((carrier, i) => (
                            <motion.div
                                key={carrier.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-md)',
                                    padding: 'var(--space-md)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>{carrier.logo}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: 'var(--apex-white)', fontWeight: 500, fontSize: 'var(--text-sm)' }}>{carrier.name}</div>
                                    <div style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-xs)' }}>{carrier.plans} plans available</div>
                                </div>
                                <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default Quoting
