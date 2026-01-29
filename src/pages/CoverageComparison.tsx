import { GlassCard, Badge, Button } from '../components/common'
import { CheckCircle2, XCircle, DollarSign } from 'lucide-react'

const plans = [
    { name: 'Bronze Essential', premium: 299, deductible: 6000, maxOOP: 8000, primaryCopay: '$40', specialistCopay: '$80', urgentCare: '$75', er: '30%', preventive: 'Covered' },
    { name: 'Silver Plus', premium: 425, deductible: 3500, maxOOP: 6500, primaryCopay: '$30', specialistCopay: '$60', urgentCare: '$50', er: '25%', preventive: 'Covered', current: true },
    { name: 'Gold Premier', premium: 575, deductible: 1500, maxOOP: 4000, primaryCopay: '$20', specialistCopay: '$40', urgentCare: '$35', er: '20%', preventive: 'Covered' }
]

export function CoverageComparison() {
    return (
        <div style={{ padding: 'var(--space-xl)', maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--apex-white)', marginBottom: 'var(--space-xs)' }}>Coverage Comparison</h1>
                <p style={{ color: 'var(--apex-steel)' }}>Compare plan options side by side</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }}>
                {plans.map((plan) => (
                    <GlassCard key={plan.name} style={{ padding: 'var(--space-lg)', border: plan.current ? '2px solid var(--apex-teal)' : undefined }}>
                        {plan.current && <Badge variant="teal" style={{ marginBottom: 'var(--space-md)' }}>Current Plan</Badge>}
                        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--apex-white)', marginBottom: 'var(--space-sm)' }}>{plan.name}</h3>
                        <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--apex-teal)', marginBottom: 'var(--space-lg)' }}>${plan.premium}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--apex-steel)' }}>/mo</span></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--apex-silver)' }}><span>Deductible</span><span style={{ fontWeight: 600, color: 'var(--apex-white)' }}>${plan.deductible.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--apex-silver)' }}><span>Max Out-of-Pocket</span><span style={{ fontWeight: 600, color: 'var(--apex-white)' }}>${plan.maxOOP.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--apex-silver)' }}><span>Primary Care</span><span style={{ fontWeight: 600, color: 'var(--apex-white)' }}>{plan.primaryCopay}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--apex-silver)' }}><span>Specialist</span><span style={{ fontWeight: 600, color: 'var(--apex-white)' }}>{plan.specialistCopay}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--apex-silver)' }}><span>ER Visit</span><span style={{ fontWeight: 600, color: 'var(--apex-white)' }}>{plan.er}</span></div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    )
}

export default CoverageComparison
