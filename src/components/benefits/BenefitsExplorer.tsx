import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Shield,
    Heart,
    Eye,
    Stethoscope,
    Pill,
    BrainCircuit,
    Baby,
    Activity,
    ChevronDown,
    ChevronRight,
    Info,
    DollarSign,
    Check,
    X,
    Search
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './BenefitsExplorer.css'

// Benefit category
interface BenefitCategory {
    id: string
    name: string
    icon: React.ReactNode
    description: string
    inNetwork: {
        copay?: string
        coinsurance?: string
        deductible?: string
        limit?: string
    }
    outOfNetwork: {
        copay?: string
        coinsurance?: string
        deductible?: string
        limit?: string
    }
    notes?: string[]
    priorAuth?: boolean
}

const benefitCategories: BenefitCategory[] = [
    {
        id: 'preventive',
        name: 'Preventive Care',
        icon: <Shield size={24} />,
        description: 'Annual checkups, immunizations, and screenings',
        inNetwork: { copay: '$0', coinsurance: '0%' },
        outOfNetwork: { coinsurance: '40%', deductible: 'Applies' },
        notes: ['No prior authorization required', 'Includes annual wellness visit']
    },
    {
        id: 'primary',
        name: 'Primary Care',
        icon: <Stethoscope size={24} />,
        description: 'Office visits for illness or injury',
        inNetwork: { copay: '$25' },
        outOfNetwork: { coinsurance: '40%', deductible: 'Applies' },
        notes: ['PCP referral not required for specialists']
    },
    {
        id: 'specialist',
        name: 'Specialist Care',
        icon: <Heart size={24} />,
        description: 'Cardiologist, dermatologist, and other specialists',
        inNetwork: { copay: '$50' },
        outOfNetwork: { coinsurance: '40%', deductible: 'Applies' },
        priorAuth: true
    },
    {
        id: 'vision',
        name: 'Vision',
        icon: <Eye size={24} />,
        description: 'Eye exams, glasses, and contacts',
        inNetwork: { copay: '$20', limit: '1 exam/year' },
        outOfNetwork: { coinsurance: '50%' },
        notes: ['$150 allowance for frames', '$150 allowance for contacts']
    },
    {
        id: 'prescription',
        name: 'Prescription Drugs',
        icon: <Pill size={24} />,
        description: 'Generic and brand name medications',
        inNetwork: {
            copay: 'Generic: $10 | Preferred: $35 | Non-Preferred: $60'
        },
        outOfNetwork: { coinsurance: 'Not covered' },
        notes: ['Mail order: 90-day supply for 2x copay', 'Prior auth may be required']
    },
    {
        id: 'mental',
        name: 'Mental Health',
        icon: <BrainCircuit size={24} />,
        description: 'Therapy, counseling, and psychiatric services',
        inNetwork: { copay: '$25' },
        outOfNetwork: { coinsurance: '40%', deductible: 'Applies' }
    },
    {
        id: 'maternity',
        name: 'Maternity Care',
        icon: <Baby size={24} />,
        description: 'Prenatal, delivery, and postnatal care',
        inNetwork: { coinsurance: '20%', deductible: 'Applies' },
        outOfNetwork: { coinsurance: '40%', deductible: 'Applies' },
        priorAuth: true
    },
    {
        id: 'emergency',
        name: 'Emergency Care',
        icon: <Activity size={24} />,
        description: 'ER visits and urgent care',
        inNetwork: { copay: 'ER: $250 | Urgent: $75' },
        outOfNetwork: { copay: 'ER: $250 (waived if admitted)' },
        notes: ['ER copay waived if admitted']
    }
]

// Deductible and OOP Summary
interface CostSummaryProps {
    individual: {
        deductible: number
        deductibleMet: number
        oopMax: number
        oopMet: number
    }
    family: {
        deductible: number
        deductibleMet: number
        oopMax: number
        oopMet: number
    }
}

export function CostSummary({
    individual = {
        deductible: 1500,
        deductibleMet: 850,
        oopMax: 4000,
        oopMet: 1200
    },
    family = {
        deductible: 3000,
        deductibleMet: 1850,
        oopMax: 8000,
        oopMet: 2450
    }
}: CostSummaryProps) {
    const [view, setView] = useState<'individual' | 'family'>('individual')
    const data = view === 'individual' ? individual : family

    const deductiblePercent = (data.deductibleMet / data.deductible) * 100
    const oopPercent = (data.oopMet / data.oopMax) * 100

    return (
        <GlassCard className="cost-summary">
            <div className="cost-summary__header">
                <h3>Cost Summary</h3>
                <div className="cost-summary__toggle">
                    <button
                        className={view === 'individual' ? 'active' : ''}
                        onClick={() => setView('individual')}
                    >
                        Individual
                    </button>
                    <button
                        className={view === 'family' ? 'active' : ''}
                        onClick={() => setView('family')}
                    >
                        Family
                    </button>
                </div>
            </div>

            <div className="cost-summary__meters">
                {/* Deductible */}
                <div className="cost-meter">
                    <div className="cost-meter__header">
                        <span className="cost-meter__label">Deductible</span>
                        <span className="cost-meter__values">
                            ${data.deductibleMet.toLocaleString()} / ${data.deductible.toLocaleString()}
                        </span>
                    </div>
                    <div className="cost-meter__bar">
                        <motion.div
                            className="cost-meter__fill cost-meter__fill--deductible"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(deductiblePercent, 100)}%` }}
                            transition={{ duration: 1 }}
                        />
                    </div>
                    <span className="cost-meter__remaining">
                        ${(data.deductible - data.deductibleMet).toLocaleString()} remaining
                    </span>
                </div>

                {/* Out-of-Pocket Max */}
                <div className="cost-meter">
                    <div className="cost-meter__header">
                        <span className="cost-meter__label">Out-of-Pocket Maximum</span>
                        <span className="cost-meter__values">
                            ${data.oopMet.toLocaleString()} / ${data.oopMax.toLocaleString()}
                        </span>
                    </div>
                    <div className="cost-meter__bar">
                        <motion.div
                            className="cost-meter__fill cost-meter__fill--oop"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(oopPercent, 100)}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                        />
                    </div>
                    <span className="cost-meter__remaining">
                        ${(data.oopMax - data.oopMet).toLocaleString()} to maximum
                    </span>
                </div>
            </div>
        </GlassCard>
    )
}

// Benefits Explorer
export function BenefitsExplorer() {
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

    const filteredCategories = benefitCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="benefits-explorer">
            <div className="benefits-explorer__header">
                <h2>Benefits Explorer</h2>
                <div className="benefits-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search benefits..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="benefits-grid">
                {filteredCategories.map((category, index) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <GlassCard
                            className={`benefit-card ${expandedCategory === category.id ? 'expanded' : ''}`}
                        >
                            <div
                                className="benefit-card__header"
                                onClick={() => setExpandedCategory(
                                    expandedCategory === category.id ? null : category.id
                                )}
                            >
                                <div className="benefit-card__icon">{category.icon}</div>
                                <div className="benefit-card__info">
                                    <h3>{category.name}</h3>
                                    <p>{category.description}</p>
                                </div>
                                {category.priorAuth && (
                                    <Badge variant="warning" size="sm">Prior Auth</Badge>
                                )}
                                <ChevronDown
                                    size={20}
                                    className={`benefit-card__expand ${expandedCategory === category.id ? 'rotated' : ''}`}
                                />
                            </div>

                            {expandedCategory === category.id && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="benefit-card__details"
                                >
                                    <div className="coverage-comparison">
                                        <div className="coverage-column coverage-column--in">
                                            <h4>In-Network</h4>
                                            {category.inNetwork.copay && (
                                                <div className="coverage-item">
                                                    <span>Copay</span>
                                                    <strong>{category.inNetwork.copay}</strong>
                                                </div>
                                            )}
                                            {category.inNetwork.coinsurance && (
                                                <div className="coverage-item">
                                                    <span>Coinsurance</span>
                                                    <strong>{category.inNetwork.coinsurance}</strong>
                                                </div>
                                            )}
                                            {category.inNetwork.deductible && (
                                                <div className="coverage-item">
                                                    <span>Deductible</span>
                                                    <strong>{category.inNetwork.deductible}</strong>
                                                </div>
                                            )}
                                            {category.inNetwork.limit && (
                                                <div className="coverage-item">
                                                    <span>Limit</span>
                                                    <strong>{category.inNetwork.limit}</strong>
                                                </div>
                                            )}
                                        </div>
                                        <div className="coverage-column coverage-column--out">
                                            <h4>Out-of-Network</h4>
                                            {category.outOfNetwork.copay && (
                                                <div className="coverage-item">
                                                    <span>Copay</span>
                                                    <strong>{category.outOfNetwork.copay}</strong>
                                                </div>
                                            )}
                                            {category.outOfNetwork.coinsurance && (
                                                <div className="coverage-item">
                                                    <span>Coinsurance</span>
                                                    <strong>{category.outOfNetwork.coinsurance}</strong>
                                                </div>
                                            )}
                                            {category.outOfNetwork.deductible && (
                                                <div className="coverage-item">
                                                    <span>Deductible</span>
                                                    <strong>{category.outOfNetwork.deductible}</strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {category.notes && category.notes.length > 0 && (
                                        <div className="benefit-notes">
                                            <Info size={14} />
                                            <ul>
                                                {category.notes.map((note, i) => (
                                                    <li key={i}>{note}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default { CostSummary, BenefitsExplorer }
