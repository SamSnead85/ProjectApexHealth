import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Shield,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    CreditCard,
    FileText,
    RefreshCw,
    Download,
    Building2,
    Heart,
    Pill,
    Eye,
    Activity
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './Eligibility.css'

// EDI 270/271 compliant benefit structure
interface BenefitCategory {
    code: string
    name: string
    icon: React.ReactNode
    inNetwork: CoverageDetail
    outOfNetwork?: CoverageDetail
}

interface CoverageDetail {
    covered: boolean
    copay?: number
    coinsurance?: number
    deductible?: number
    maxBenefit?: number
    remainingBenefit?: number
    authRequired: boolean
    notes?: string
}

interface MemberEligibility {
    memberId: string
    memberName: string
    dateOfBirth: string
    groupNumber: string
    groupName: string
    planName: string
    effectiveDate: string
    terminationDate?: string
    status: 'active' | 'inactive' | 'pending' | 'cobra'
    subscriberRelation: 'self' | 'spouse' | 'child' | 'other'
    pcp?: string
    deductible: {
        individual: { used: number; max: number }
        family: { used: number; max: number }
    }
    outOfPocket: {
        individual: { used: number; max: number }
        family: { used: number; max: number }
    }
    benefits: BenefitCategory[]
    lastVerified: string
}

// Mock EDI 271 response data
const mockEligibility: MemberEligibility = {
    memberId: 'APX-2024-78432',
    memberName: 'Sarah Johnson',
    dateOfBirth: '1985-03-15',
    groupNumber: 'GRP-APEX-2024',
    groupName: 'Innovate Dynamics Health',
    planName: 'Platinum PPO Plus',
    effectiveDate: '2024-01-01',
    status: 'active',
    subscriberRelation: 'self',
    pcp: 'Dr. Sarah Chen, MD',
    deductible: {
        individual: { used: 450, max: 1500 },
        family: { used: 850, max: 3000 }
    },
    outOfPocket: {
        individual: { used: 1200, max: 6000 },
        family: { used: 2400, max: 12000 }
    },
    benefits: [
        {
            code: '30',
            name: 'Preventive Care',
            icon: <Shield size={20} />,
            inNetwork: { covered: true, copay: 0, coinsurance: 0, authRequired: false, notes: 'No cost sharing for ACA preventive services' },
            outOfNetwork: { covered: true, coinsurance: 40, authRequired: false }
        },
        {
            code: '98',
            name: 'Primary Care Visit',
            icon: <User size={20} />,
            inNetwork: { covered: true, copay: 25, authRequired: false },
            outOfNetwork: { covered: true, coinsurance: 40, authRequired: false }
        },
        {
            code: '99',
            name: 'Specialist Visit',
            icon: <Heart size={20} />,
            inNetwork: { covered: true, copay: 50, authRequired: false },
            outOfNetwork: { covered: true, coinsurance: 40, authRequired: false }
        },
        {
            code: '47',
            name: 'Hospital Inpatient',
            icon: <Building2 size={20} />,
            inNetwork: { covered: true, coinsurance: 20, deductible: 500, authRequired: true },
            outOfNetwork: { covered: true, coinsurance: 40, deductible: 1000, authRequired: true }
        },
        {
            code: '73',
            name: 'Outpatient Surgery',
            icon: <Activity size={20} />,
            inNetwork: { covered: true, coinsurance: 20, authRequired: true },
            outOfNetwork: { covered: true, coinsurance: 40, authRequired: true }
        },
        {
            code: '88',
            name: 'Prescription Drugs',
            icon: <Pill size={20} />,
            inNetwork: { covered: true, copay: 10, notes: 'Generic: $10, Preferred: $35, Non-Preferred: $60', authRequired: false }
        },
        {
            code: '35',
            name: 'Mental Health',
            icon: <Heart size={20} />,
            inNetwork: { covered: true, copay: 25, authRequired: false, notes: 'Parity with medical benefits' },
            outOfNetwork: { covered: true, coinsurance: 40, authRequired: false }
        },
        {
            code: '27',
            name: 'Vision',
            icon: <Eye size={20} />,
            inNetwork: { covered: true, copay: 10, maxBenefit: 200, remainingBenefit: 150, authRequired: false },
            outOfNetwork: { covered: false, authRequired: false, notes: 'Not covered out-of-network' }
        }
    ],
    lastVerified: '2024-01-26T15:45:00Z'
}

export function Eligibility() {
    const [eligibility] = useState<MemberEligibility>(mockEligibility)
    const [searchQuery, setSearchQuery] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [activeTab, setActiveTab] = useState<'summary' | 'benefits' | 'accumulators'>('summary')

    const handleVerify = async () => {
        setIsVerifying(true)
        // Simulate EDI 270 transaction
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsVerifying(false)
    }

    const formatCurrency = (amount: number) =>
        `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const getStatusBadge = (status: MemberEligibility['status']) => {
        switch (status) {
            case 'active':
                return <Badge variant="success" icon={<CheckCircle2 size={12} />}>Active</Badge>
            case 'inactive':
                return <Badge variant="critical" icon={<XCircle size={12} />}>Inactive</Badge>
            case 'pending':
                return <Badge variant="warning" icon={<Clock size={12} />}>Pending</Badge>
            case 'cobra':
                return <Badge variant="info" icon={<Shield size={12} />}>COBRA</Badge>
        }
    }

    const calculateProgress = (used: number, max: number) => ((used / max) * 100).toFixed(0)

    return (
        <div className="eligibility-page">
            {/* Header */}
            <div className="eligibility__header">
                <div>
                    <h1 className="eligibility__title">Eligibility Verification</h1>
                    <p className="eligibility__subtitle">
                        EDI 270/271 Real-Time Coverage Check
                    </p>
                </div>
                <div className="eligibility__actions">
                    <Button
                        variant="secondary"
                        icon={<Download size={16} />}
                    >
                        Export 271
                    </Button>
                    <Button
                        variant="primary"
                        icon={isVerifying ? <RefreshCw size={16} className="spinning" /> : <Search size={16} />}
                        onClick={handleVerify}
                        disabled={isVerifying}
                    >
                        {isVerifying ? 'Verifying...' : 'Verify Eligibility'}
                    </Button>
                </div>
            </div>

            {/* Search */}
            <GlassCard className="eligibility__search-card">
                <div className="eligibility__search-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Enter Member ID, SSN, or Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="eligibility__search-filters">
                    <Badge variant="teal">Last verified: {formatDate(eligibility.lastVerified)}</Badge>
                </div>
            </GlassCard>

            {/* Member Card */}
            <motion.div
                className="eligibility__member-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <GlassCard className="member-card">
                    <div className="member-card__header">
                        <div className="member-card__avatar">
                            <User size={32} />
                        </div>
                        <div className="member-card__info">
                            <h2>{eligibility.memberName}</h2>
                            <div className="member-card__meta">
                                <span className="member-card__id">
                                    <FileText size={14} /> {eligibility.memberId}
                                </span>
                                <span className="member-card__dob">
                                    <Calendar size={14} /> DOB: {formatDate(eligibility.dateOfBirth)}
                                </span>
                            </div>
                        </div>
                        <div className="member-card__status">
                            {getStatusBadge(eligibility.status)}
                        </div>
                    </div>

                    <div className="member-card__details">
                        <div className="member-card__detail">
                            <span className="member-card__label">Group</span>
                            <span className="member-card__value">{eligibility.groupName}</span>
                            <span className="member-card__sub">{eligibility.groupNumber}</span>
                        </div>
                        <div className="member-card__detail">
                            <span className="member-card__label">Plan</span>
                            <span className="member-card__value">{eligibility.planName}</span>
                            <span className="member-card__sub">Effective: {formatDate(eligibility.effectiveDate)}</span>
                        </div>
                        <div className="member-card__detail">
                            <span className="member-card__label">PCP</span>
                            <span className="member-card__value">{eligibility.pcp || 'Not assigned'}</span>
                            <span className="member-card__sub">{eligibility.subscriberRelation === 'self' ? 'Subscriber' : eligibility.subscriberRelation}</span>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Tabs */}
            <div className="eligibility__tabs">
                <button
                    className={`eligibility__tab ${activeTab === 'summary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('summary')}
                >
                    Summary
                </button>
                <button
                    className={`eligibility__tab ${activeTab === 'benefits' ? 'active' : ''}`}
                    onClick={() => setActiveTab('benefits')}
                >
                    Benefits
                </button>
                <button
                    className={`eligibility__tab ${activeTab === 'accumulators' ? 'active' : ''}`}
                    onClick={() => setActiveTab('accumulators')}
                >
                    Accumulators
                </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'summary' && (
                    <motion.div
                        key="summary"
                        className="eligibility__content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <div className="eligibility__metrics">
                            <MetricCard
                                title="Individual Deductible"
                                value={formatCurrency(eligibility.deductible.individual.max - eligibility.deductible.individual.used)}
                                icon={<CreditCard size={20} />}
                                subtitle={`${formatCurrency(eligibility.deductible.individual.used)} of ${formatCurrency(eligibility.deductible.individual.max)} used`}
                            />
                            <MetricCard
                                title="Out-of-Pocket Max"
                                value={formatCurrency(eligibility.outOfPocket.individual.max - eligibility.outOfPocket.individual.used)}
                                icon={<Shield size={20} />}
                                subtitle={`${formatCurrency(eligibility.outOfPocket.individual.used)} of ${formatCurrency(eligibility.outOfPocket.individual.max)} used`}
                                variant="teal"
                            />
                            <MetricCard
                                title="PCP Copay"
                                value="$25"
                                icon={<User size={20} />}
                                subtitle="In-network"
                                variant="success"
                            />
                            <MetricCard
                                title="Specialist Copay"
                                value="$50"
                                icon={<Heart size={20} />}
                                subtitle="In-network"
                            />
                        </div>

                        {/* Quick Benefits Summary */}
                        <GlassCard className="eligibility__quick-benefits">
                            <h3>Key Coverage</h3>
                            <div className="quick-benefits__grid">
                                {eligibility.benefits.slice(0, 4).map((benefit, index) => (
                                    <motion.div
                                        key={benefit.code}
                                        className="quick-benefit"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="quick-benefit__icon">{benefit.icon}</div>
                                        <div className="quick-benefit__info">
                                            <span className="quick-benefit__name">{benefit.name}</span>
                                            <span className="quick-benefit__cost">
                                                {benefit.inNetwork.copay !== undefined
                                                    ? `$${benefit.inNetwork.copay} copay`
                                                    : benefit.inNetwork.coinsurance !== undefined
                                                        ? `${benefit.inNetwork.coinsurance}% coinsurance`
                                                        : 'Covered'
                                                }
                                            </span>
                                        </div>
                                        {benefit.inNetwork.authRequired && (
                                            <Badge variant="warning" size="sm">Auth Req</Badge>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'benefits' && (
                    <motion.div
                        key="benefits"
                        className="eligibility__content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <div className="eligibility__benefits-list">
                            {eligibility.benefits.map((benefit, index) => (
                                <motion.div
                                    key={benefit.code}
                                    className="benefit-card netflix-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="benefit-card__header">
                                        <div className="benefit-card__icon">{benefit.icon}</div>
                                        <div className="benefit-card__info">
                                            <h4>{benefit.name}</h4>
                                            <span className="benefit-card__code">Service Code: {benefit.code}</span>
                                        </div>
                                        {benefit.inNetwork.covered ? (
                                            <Badge variant="success" icon={<CheckCircle2 size={10} />}>Covered</Badge>
                                        ) : (
                                            <Badge variant="critical" icon={<XCircle size={10} />}>Not Covered</Badge>
                                        )}
                                    </div>

                                    <div className="benefit-card__coverage">
                                        <div className="benefit-card__network">
                                            <span className="benefit-card__network-label">In-Network</span>
                                            <div className="benefit-card__network-details">
                                                {benefit.inNetwork.copay !== undefined && (
                                                    <span>${benefit.inNetwork.copay} copay</span>
                                                )}
                                                {benefit.inNetwork.coinsurance !== undefined && (
                                                    <span>{benefit.inNetwork.coinsurance}% coinsurance</span>
                                                )}
                                                {benefit.inNetwork.deductible !== undefined && (
                                                    <span>${benefit.inNetwork.deductible} deductible</span>
                                                )}
                                            </div>
                                        </div>
                                        {benefit.outOfNetwork && (
                                            <div className="benefit-card__network benefit-card__network--out">
                                                <span className="benefit-card__network-label">Out-of-Network</span>
                                                <div className="benefit-card__network-details">
                                                    {benefit.outOfNetwork.covered ? (
                                                        <>
                                                            {benefit.outOfNetwork.coinsurance !== undefined && (
                                                                <span>{benefit.outOfNetwork.coinsurance}% coinsurance</span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="benefit-card__not-covered">Not covered</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {benefit.inNetwork.authRequired && (
                                        <div className="benefit-card__auth">
                                            <AlertCircle size={14} />
                                            <span>Prior Authorization Required</span>
                                        </div>
                                    )}

                                    {benefit.inNetwork.notes && (
                                        <div className="benefit-card__notes">
                                            {benefit.inNetwork.notes}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'accumulators' && (
                    <motion.div
                        key="accumulators"
                        className="eligibility__content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <div className="eligibility__accumulators">
                            <GlassCard className="accumulator-card">
                                <h3>Individual Deductible</h3>
                                <div className="accumulator__progress">
                                    <div className="accumulator__bar">
                                        <motion.div
                                            className="accumulator__fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${calculateProgress(eligibility.deductible.individual.used, eligibility.deductible.individual.max)}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                        />
                                    </div>
                                    <div className="accumulator__labels">
                                        <span>{formatCurrency(eligibility.deductible.individual.used)} used</span>
                                        <span>{formatCurrency(eligibility.deductible.individual.max)} max</span>
                                    </div>
                                </div>
                                <div className="accumulator__remaining">
                                    <span className="accumulator__remaining-value">
                                        {formatCurrency(eligibility.deductible.individual.max - eligibility.deductible.individual.used)}
                                    </span>
                                    <span className="accumulator__remaining-label">remaining</span>
                                </div>
                            </GlassCard>

                            <GlassCard className="accumulator-card">
                                <h3>Family Deductible</h3>
                                <div className="accumulator__progress">
                                    <div className="accumulator__bar">
                                        <motion.div
                                            className="accumulator__fill accumulator__fill--family"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${calculateProgress(eligibility.deductible.family.used, eligibility.deductible.family.max)}%` }}
                                            transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                                        />
                                    </div>
                                    <div className="accumulator__labels">
                                        <span>{formatCurrency(eligibility.deductible.family.used)} used</span>
                                        <span>{formatCurrency(eligibility.deductible.family.max)} max</span>
                                    </div>
                                </div>
                                <div className="accumulator__remaining">
                                    <span className="accumulator__remaining-value">
                                        {formatCurrency(eligibility.deductible.family.max - eligibility.deductible.family.used)}
                                    </span>
                                    <span className="accumulator__remaining-label">remaining</span>
                                </div>
                            </GlassCard>

                            <GlassCard className="accumulator-card">
                                <h3>Individual Out-of-Pocket Maximum</h3>
                                <div className="accumulator__progress">
                                    <div className="accumulator__bar">
                                        <motion.div
                                            className="accumulator__fill accumulator__fill--oop"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${calculateProgress(eligibility.outOfPocket.individual.used, eligibility.outOfPocket.individual.max)}%` }}
                                            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                        />
                                    </div>
                                    <div className="accumulator__labels">
                                        <span>{formatCurrency(eligibility.outOfPocket.individual.used)} used</span>
                                        <span>{formatCurrency(eligibility.outOfPocket.individual.max)} max</span>
                                    </div>
                                </div>
                                <div className="accumulator__remaining">
                                    <span className="accumulator__remaining-value">
                                        {formatCurrency(eligibility.outOfPocket.individual.max - eligibility.outOfPocket.individual.used)}
                                    </span>
                                    <span className="accumulator__remaining-label">remaining</span>
                                </div>
                            </GlassCard>

                            <GlassCard className="accumulator-card">
                                <h3>Family Out-of-Pocket Maximum</h3>
                                <div className="accumulator__progress">
                                    <div className="accumulator__bar">
                                        <motion.div
                                            className="accumulator__fill accumulator__fill--oop-family"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${calculateProgress(eligibility.outOfPocket.family.used, eligibility.outOfPocket.family.max)}%` }}
                                            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                                        />
                                    </div>
                                    <div className="accumulator__labels">
                                        <span>{formatCurrency(eligibility.outOfPocket.family.used)} used</span>
                                        <span>{formatCurrency(eligibility.outOfPocket.family.max)} max</span>
                                    </div>
                                </div>
                                <div className="accumulator__remaining">
                                    <span className="accumulator__remaining-value">
                                        {formatCurrency(eligibility.outOfPocket.family.max - eligibility.outOfPocket.family.used)}
                                    </span>
                                    <span className="accumulator__remaining-label">remaining</span>
                                </div>
                            </GlassCard>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Eligibility
