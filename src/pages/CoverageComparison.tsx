import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckCircle2,
    XCircle,
    DollarSign,
    Shield,
    Heart,
    Eye,
    Brain,
    Pill,
    Star,
    ChevronDown,
    ChevronUp,
    Award,
    Stethoscope,
    Sparkles,
    Info
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'

interface Plan {
    name: string
    tier: 'bronze' | 'silver' | 'gold'
    premium: number
    deductible: number
    maxOOP: number
    primaryCopay: string
    specialistCopay: string
    urgentCare: string
    er: string
    preventive: string
    current?: boolean
    bestValue?: boolean
    coverage: {
        medical: number
        dental: number
        vision: number
        mentalHealth: number
        prescription: number
    }
    extras: string[]
}

const plans: Plan[] = [
    {
        name: 'Bronze Essential',
        tier: 'bronze',
        premium: 299,
        deductible: 6000,
        maxOOP: 8000,
        primaryCopay: '$40',
        specialistCopay: '$80',
        urgentCare: '$75',
        er: '30% after deductible',
        preventive: '100% covered',
        coverage: { medical: 60, dental: 40, vision: 30, mentalHealth: 50, prescription: 50 },
        extras: ['Preventive care at no cost', 'Telehealth visits included', '3 free urgent care visits/yr']
    },
    {
        name: 'Silver Plus',
        tier: 'silver',
        premium: 425,
        deductible: 3500,
        maxOOP: 6500,
        primaryCopay: '$30',
        specialistCopay: '$60',
        urgentCare: '$50',
        er: '25% after deductible',
        preventive: '100% covered',
        current: true,
        bestValue: true,
        coverage: { medical: 75, dental: 60, vision: 50, mentalHealth: 70, prescription: 70 },
        extras: ['Preventive care at no cost', 'Unlimited telehealth', '6 free urgent care visits/yr', 'HSA eligible', 'Gym membership discount']
    },
    {
        name: 'Gold Premier',
        tier: 'gold',
        premium: 575,
        deductible: 1500,
        maxOOP: 4000,
        primaryCopay: '$20',
        specialistCopay: '$40',
        urgentCare: '$35',
        er: '20% after deductible',
        preventive: '100% covered',
        coverage: { medical: 90, dental: 80, vision: 75, mentalHealth: 85, prescription: 85 },
        extras: ['Preventive care at no cost', 'Unlimited telehealth', 'Unlimited urgent care', 'HSA eligible', 'Gym membership included', 'International coverage', 'Concierge support']
    }
]

const tierColors: Record<string, string> = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700'
}

const coverageCategories = [
    { key: 'medical' as const, label: 'Medical', icon: Stethoscope },
    { key: 'dental' as const, label: 'Dental', icon: Heart },
    { key: 'vision' as const, label: 'Vision', icon: Eye },
    { key: 'mentalHealth' as const, label: 'Mental Health', icon: Brain },
    { key: 'prescription' as const, label: 'Prescription Rx', icon: Pill }
]

const comparisonRows = [
    { label: 'Monthly Premium', key: 'premium', format: (v: number) => `$${v}` },
    { label: 'Annual Deductible', key: 'deductible', format: (v: number) => `$${v.toLocaleString()}` },
    { label: 'Max Out-of-Pocket', key: 'maxOOP', format: (v: number) => `$${v.toLocaleString()}` },
    { label: 'Primary Care Copay', key: 'primaryCopay', format: (v: string) => v },
    { label: 'Specialist Copay', key: 'specialistCopay', format: (v: string) => v },
    { label: 'Urgent Care', key: 'urgentCare', format: (v: string) => v },
    { label: 'Emergency Room', key: 'er', format: (v: string) => v },
    { label: 'Preventive Care', key: 'preventive', format: (v: string) => v }
]

const cardStyle: React.CSSProperties = {
    background: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--card-border, rgba(0,0,0,0.08))',
    borderRadius: 16,
    padding: 'var(--space-lg)'
}

export default function CoverageComparison() {
    const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
    const [showDetails, setShowDetails] = useState(true)
    const [selectedScenario, setSelectedScenario] = useState<'low' | 'moderate' | 'high'>('moderate')

    const estimatedCosts = {
        low: { bronze: 4188, silver: 5550, gold: 7400 },
        moderate: { bronze: 7788, silver: 7350, gold: 8300 },
        high: { bronze: 11588, silver: 10050, gold: 10900 }
    }

    return (
        <div style={{ padding: 'var(--space-xl)', maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: 'var(--space-xl)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--apex-white)', marginBottom: 'var(--space-xs)' }}>
                            Coverage Comparison
                        </h1>
                        <p style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-md)' }}>
                            Compare plan options side by side to find the best fit for your needs
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={<Info size={14} />}
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            {showDetails ? 'Simple View' : 'Detailed View'}
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Plan Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <div
                            style={{
                                ...cardStyle,
                                border: plan.current
                                    ? '2px solid var(--apex-teal)'
                                    : '1px solid var(--card-border, rgba(0,0,0,0.08))',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Tier accent bar */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                                background: `linear-gradient(90deg, ${tierColors[plan.tier]}, transparent)`
                            }} />

                            {/* Badges */}
                            <div style={{ display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)', minHeight: 28 }}>
                                {plan.current && (
                                    <Badge variant="teal" icon={<Shield size={10} />}>Your Plan</Badge>
                                )}
                                {plan.bestValue && (
                                    <Badge variant="success" icon={<Award size={10} />}>Best Value</Badge>
                                )}
                            </div>

                            {/* Plan name & price */}
                            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--apex-white)', marginBottom: 'var(--space-xs)' }}>
                                {plan.name}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 'var(--space-lg)' }}>
                                <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: tierColors[plan.tier] }}>
                                    ${plan.premium}
                                </span>
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--apex-steel)' }}>/month</span>
                            </div>

                            {/* Key Metrics */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                                {comparisonRows.map(row => {
                                    const value = plan[row.key as keyof Plan]
                                    return (
                                        <div key={row.key} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '6px 0',
                                            borderBottom: '1px solid var(--card-border, rgba(0,0,0,0.06))'
                                        }}>
                                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--apex-silver)' }}>{row.label}</span>
                                            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--apex-white)' }}>
                                                {row.format(value as never)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Coverage Bars */}
                            {showDetails && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ marginBottom: 'var(--space-lg)' }}
                                >
                                    <div style={{
                                        fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)',
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                        marginBottom: 'var(--space-sm)'
                                    }}>
                                        Coverage Levels
                                    </div>
                                    {coverageCategories.map(cat => {
                                        const Icon = cat.icon
                                        const pct = plan.coverage[cat.key]
                                        return (
                                            <div key={cat.key} style={{ marginBottom: 'var(--space-xs)' }}>
                                                <div style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    marginBottom: 3
                                                }}>
                                                    <span style={{
                                                        display: 'flex', alignItems: 'center', gap: 6,
                                                        fontSize: 'var(--text-xs)', color: 'var(--apex-silver)'
                                                    }}>
                                                        <Icon size={12} /> {cat.label}
                                                    </span>
                                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--apex-white)', fontWeight: 600 }}>
                                                        {pct}%
                                                    </span>
                                                </div>
                                                <div style={{
                                                    height: 6, borderRadius: 3,
                                                    background: 'rgba(0,0,0,0.06)', overflow: 'hidden'
                                                }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 0.8, delay: 0.3 }}
                                                        style={{
                                                            height: '100%', borderRadius: 3,
                                                            background: `linear-gradient(90deg, ${tierColors[plan.tier]}88, ${tierColors[plan.tier]})`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </motion.div>
                            )}

                            {/* Expand extras */}
                            <button
                                onClick={() => setExpandedPlan(expandedPlan === plan.name ? null : plan.name)}
                                style={{
                                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: 'var(--space-sm) 0', background: 'none', border: 'none',
                                    color: 'var(--apex-teal)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500
                                }}
                            >
                                <span>{plan.extras.length} included benefits</span>
                                {expandedPlan === plan.name ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            <AnimatePresence>
                                {expandedPlan === plan.name && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', paddingTop: 'var(--space-sm)' }}>
                                            {plan.extras.map(extra => (
                                                <div key={extra} style={{
                                                    display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
                                                    fontSize: 'var(--text-sm)', color: 'var(--apex-silver)'
                                                }}>
                                                    <CheckCircle2 size={14} style={{ color: 'var(--apex-success)', flexShrink: 0 }} />
                                                    {extra}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* CTA */}
                            <div style={{ marginTop: 'var(--space-lg)' }}>
                                {plan.current ? (
                                    <Button variant="secondary" style={{ width: '100%' }} icon={<Shield size={14} />}>
                                        Current Plan
                                    </Button>
                                ) : (
                                    <Button variant="primary" style={{ width: '100%' }} icon={<Sparkles size={14} />}>
                                        Select This Plan
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Cost Estimator */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <div style={{ ...cardStyle, padding: 'var(--space-xl)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <div>
                            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--apex-white)', marginBottom: 4 }}>
                                <DollarSign size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                                Annual Cost Estimator
                            </h2>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--apex-steel)' }}>
                                Estimated total annual cost based on your usage scenario
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                            {(['low', 'moderate', 'high'] as const).map(scenario => (
                                <button
                                    key={scenario}
                                    onClick={() => setSelectedScenario(scenario)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: 8,
                                        border: selectedScenario === scenario
                                            ? '1px solid var(--apex-teal)'
                                            : '1px solid rgba(0,0,0,0.1)',
                                        background: selectedScenario === scenario
                                            ? 'rgba(0, 200, 180, 0.1)'
                                            : 'rgba(0,0,0,0.03)',
                                        color: selectedScenario === scenario
                                            ? 'var(--apex-teal)'
                                            : 'var(--apex-silver)',
                                        cursor: 'pointer',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 500,
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {scenario} Usage
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }}>
                        {plans.map(plan => {
                            const cost = estimatedCosts[selectedScenario][plan.tier]
                            const isLowest = cost === Math.min(
                                estimatedCosts[selectedScenario].bronze,
                                estimatedCosts[selectedScenario].silver,
                                estimatedCosts[selectedScenario].gold
                            )
                            return (
                                <div key={plan.name} style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    padding: 'var(--space-lg)',
                                    borderRadius: 12,
                                    background: isLowest ? 'rgba(0, 200, 180, 0.05)' : 'transparent',
                                    border: isLowest ? '1px solid rgba(0, 200, 180, 0.2)' : '1px solid transparent'
                                }}>
                                    {isLowest && (
                                        <Badge variant="success" icon={<Star size={10} />} style={{ marginBottom: 'var(--space-sm)' }}>
                                            Lowest Cost
                                        </Badge>
                                    )}
                                    <div style={{
                                        fontSize: 'var(--text-sm)', fontWeight: 500,
                                        color: 'var(--apex-silver)', marginBottom: 4
                                    }}>
                                        {plan.name}
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--text-2xl)', fontWeight: 800,
                                        color: isLowest ? 'var(--apex-teal)' : 'var(--apex-white)'
                                    }}>
                                        ${cost.toLocaleString()}
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--text-xs)', color: 'var(--apex-steel)', marginTop: 2
                                    }}>
                                        estimated annual
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
