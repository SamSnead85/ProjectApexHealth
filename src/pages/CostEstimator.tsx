import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    DollarSign,
    Calculator,
    Search,
    TrendingUp,
    TrendingDown,
    Info,
    ChevronRight,
    Building2,
    MapPin,
    Star,
    AlertCircle,
    CheckCircle2,
    HelpCircle,
    FileText,
    ShieldCheck,
    ShieldAlert,
    Clock,
    Lightbulb,
    ArrowRight
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard, PageSkeleton } from '../components/common'
import './CostEstimator.css'

// Price Transparency: CMS requires 300 shoppable services
interface ShoppableService {
    id: string
    cptCode: string
    description: string
    category: string
    averageCost: number
    yourCost: number
    yourCostOON: number // Phase 4B: Out-of-network estimated cost
    inNetworkRange: { min: number; max: number }
    outOfNetworkRange: { min: number; max: number }
    commonWith: string[] // Bundled services
    historicalCost?: { amount: number; date: string; provider: string } // Phase 4B: Historical cost
}

interface CostBreakdown {
    facilityFee: number
    professionalFee: number
    labFees: number
    imagingFees: number
    anesthesia: number
    supplies: number
    total: number
}

interface PatientResponsibility {
    deductibleRemaining: number
    deductibleApplied: number
    coinsurance: number
    copay: number
    outOfPocketRemaining: number
    totalPatientCost: number
    planPays: number
}

// Mock shoppable services (CMS requires 300+)
const mockServices: ShoppableService[] = [
    {
        id: 'srv-001',
        cptCode: '27447',
        description: 'Total Knee Replacement (Arthroplasty)',
        category: 'Orthopedic Surgery',
        averageCost: 35000,
        yourCost: 28500,
        yourCostOON: 52000,
        inNetworkRange: { min: 22000, max: 45000 },
        outOfNetworkRange: { min: 40000, max: 75000 },
        commonWith: ['Physical Therapy (6 weeks)', 'Pre-op Labs', 'Anesthesia']
    },
    {
        id: 'srv-002',
        cptCode: '72148',
        description: 'MRI Lumbar Spine without Contrast',
        category: 'Imaging',
        averageCost: 1200,
        yourCost: 850,
        yourCostOON: 2200,
        inNetworkRange: { min: 500, max: 1800 },
        outOfNetworkRange: { min: 1500, max: 3500 },
        commonWith: ['Radiologist Reading Fee'],
        historicalCost: { amount: 780, date: '2023-09-14', provider: 'Metro Imaging Center' }
    },
    {
        id: 'srv-003',
        cptCode: '43239',
        description: 'Upper GI Endoscopy with Biopsy',
        category: 'Gastroenterology',
        averageCost: 4500,
        yourCost: 3200,
        yourCostOON: 7500,
        inNetworkRange: { min: 2500, max: 6000 },
        outOfNetworkRange: { min: 5000, max: 10000 },
        commonWith: ['Facility Fee', 'Anesthesia', 'Pathology']
    },
    {
        id: 'srv-004',
        cptCode: '59400',
        description: 'Vaginal Delivery (Global)',
        category: 'Obstetrics',
        averageCost: 12000,
        yourCost: 8500,
        yourCostOON: 22000,
        inNetworkRange: { min: 7000, max: 18000 },
        outOfNetworkRange: { min: 15000, max: 30000 },
        commonWith: ['Prenatal Care', 'Hospital Stay', 'Newborn Care']
    },
    {
        id: 'srv-005',
        cptCode: '99213',
        description: 'Office Visit - Established Patient (Level 3)',
        category: 'Primary Care',
        averageCost: 150,
        yourCost: 25,
        yourCostOON: 185,
        inNetworkRange: { min: 75, max: 200 },
        outOfNetworkRange: { min: 150, max: 350 },
        commonWith: [],
        historicalCost: { amount: 25, date: '2024-01-10', provider: 'Premier Medical Associates' }
    },
    {
        id: 'srv-006',
        cptCode: '70553',
        description: 'MRI Brain with and without Contrast',
        category: 'Imaging',
        averageCost: 2800,
        yourCost: 1950,
        yourCostOON: 4800,
        inNetworkRange: { min: 1200, max: 4000 },
        outOfNetworkRange: { min: 3500, max: 7000 },
        commonWith: ['Radiologist Reading Fee', 'Contrast Material']
    },
    {
        id: 'srv-007',
        cptCode: '45380',
        description: 'Colonoscopy with Biopsy',
        category: 'Gastroenterology',
        averageCost: 3800,
        yourCost: 0,
        yourCostOON: 6200,
        inNetworkRange: { min: 2000, max: 5500 },
        outOfNetworkRange: { min: 4500, max: 9000 },
        commonWith: ['Facility Fee', 'Anesthesia', 'Pathology'],
        historicalCost: { amount: 0, date: '2023-03-20', provider: 'City GI Associates' }
    }
]

// Member's benefit info
const memberBenefits = {
    deductibleRemaining: 450,
    outOfPocketRemaining: 4800,
    coinsuranceRate: 20,
    copayPCP: 25,
    copaySpecialist: 50
}

export function CostEstimator() {
    const [services] = useState<ShoppableService[]>(mockServices)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedService, setSelectedService] = useState<ShoppableService | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    if (loading) return <PageSkeleton />

    const categories = [...new Set(services.map(s => s.category))]

    const filteredServices = services.filter(service => {
        const matchesSearch = !searchQuery ||
            service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.cptCode.includes(searchQuery)
        const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const calculatePatientResponsibility = (service: ShoppableService): PatientResponsibility => {
        const allowedAmount = service.yourCost
        let remaining = allowedAmount

        // Apply deductible first
        const deductibleApplied = Math.min(memberBenefits.deductibleRemaining, remaining)
        remaining -= deductibleApplied

        // Apply coinsurance to remaining
        const coinsurance = remaining * (memberBenefits.coinsuranceRate / 100)
        const planPays = remaining - coinsurance

        const totalPatientCost = deductibleApplied + coinsurance

        return {
            deductibleRemaining: memberBenefits.deductibleRemaining,
            deductibleApplied,
            coinsurance,
            copay: 0, // Not applicable to facility services
            outOfPocketRemaining: memberBenefits.outOfPocketRemaining,
            totalPatientCost,
            planPays
        }
    }

    const formatCurrency = (amount: number) =>
        `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

    const getSavingsPercent = (service: ShoppableService) => {
        const savings = ((service.averageCost - service.yourCost) / service.averageCost) * 100
        return savings.toFixed(0)
    }

    return (
        <div className="cost-estimator">
            {/* Header */}
            <div className="cost-estimator__header">
                <div>
                    <h1 className="cost-estimator__title">Cost Estimator</h1>
                    <p className="cost-estimator__subtitle">
                        Price Transparency Tool • CMS 300 Shoppable Services
                    </p>
                </div>
                <Badge variant="success" icon={<DollarSign size={12} />}>
                    Price Transparency Compliant
                </Badge>
            </div>

            {/* Your Benefits Summary */}
            <div className="cost-estimator__benefits-summary">
                <MetricCard
                    title="Deductible Remaining"
                    value={formatCurrency(memberBenefits.deductibleRemaining)}
                    icon={<DollarSign size={20} />}
                    subtitle="of $1,500 annual"
                />
                <MetricCard
                    title="Out-of-Pocket Remaining"
                    value={formatCurrency(memberBenefits.outOfPocketRemaining)}
                    icon={<Calculator size={20} />}
                    subtitle="of $6,000 max"
                    variant="teal"
                />
                <MetricCard
                    title="Coinsurance"
                    value={`${memberBenefits.coinsuranceRate}%`}
                    icon={<TrendingDown size={20} />}
                    subtitle="You pay after deductible"
                    variant="success"
                />
                <MetricCard
                    title="Specialist Copay"
                    value={formatCurrency(memberBenefits.copaySpecialist)}
                    icon={<FileText size={20} />}
                    subtitle="In-network visits"
                />
            </div>

            {/* Search & Filter */}
            <GlassCard className="cost-estimator__search-card">
                <div className="cost-estimator__search-row">
                    <div className="cost-estimator__search-wrapper">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by procedure name or CPT code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="cost-estimator__category-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </GlassCard>

            {/* Results Grid */}
            <div className="cost-estimator__grid">
                {/* Service List */}
                <div className="cost-estimator__list">
                    {filteredServices.map((service, index) => (
                        <motion.div
                            key={service.id}
                            className={`cost-card netflix-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedService(service)}
                        >
                            <div className="cost-card__header">
                                <div className="cost-card__info">
                                    <span className="cost-card__cpt">{service.cptCode}</span>
                                    <h3>{service.description}</h3>
                                    <span className="cost-card__category">{service.category}</span>
                                </div>
                                <ChevronRight size={16} className="cost-card__chevron" />
                            </div>

                            {/* Phase 4B: In-Network vs Out-of-Network Comparison */}
                            <div className="cost-card__network-compare">
                                <div className="cost-card__network cost-card__network--in">
                                    <div className="cost-card__network-badge">
                                        <ShieldCheck size={12} />
                                        <span>In-Network</span>
                                    </div>
                                    <span className="cost-card__amount">
                                        {service.yourCost === 0 ? '$0' : formatCurrency(service.yourCost)}
                                    </span>
                                </div>
                                <div className="cost-card__network-divider">
                                    <span>vs</span>
                                </div>
                                <div className="cost-card__network cost-card__network--out">
                                    <div className="cost-card__network-badge cost-card__network-badge--out">
                                        <ShieldAlert size={12} />
                                        <span>Out-of-Network</span>
                                    </div>
                                    <span className="cost-card__amount-oon">
                                        {formatCurrency(service.yourCostOON)}
                                    </span>
                                </div>
                            </div>

                            {/* Phase 4B: Savings Recommendation */}
                            {service.yourCostOON > service.yourCost && service.yourCost > 0 && (
                                <div className="cost-card__savings-rec">
                                    <Lightbulb size={14} />
                                    <span>
                                        Save <strong>{formatCurrency(service.yourCostOON - service.yourCost)}</strong> by using an in-network provider
                                    </span>
                                </div>
                            )}

                            {service.yourCost > 0 && service.yourCost < service.averageCost && (
                                <div className="cost-card__savings">
                                    <TrendingDown size={14} />
                                    <span>You save {getSavingsPercent(service)}% vs average</span>
                                </div>
                            )}

                            {service.yourCost === 0 && (
                                <div className="cost-card__preventive">
                                    <CheckCircle2 size={14} />
                                    <span>Preventive care - No cost share</span>
                                </div>
                            )}

                            {/* Phase 4B: Historical Cost */}
                            {service.historicalCost && (
                                <div className="cost-card__historical">
                                    <Clock size={12} />
                                    <span>
                                        You paid {service.historicalCost.amount === 0 ? '$0' : formatCurrency(service.historicalCost.amount)} on{' '}
                                        {new Date(service.historicalCost.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        {' at '}{service.historicalCost.provider}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Cost Breakdown Detail */}
                <AnimatePresence mode="wait">
                    {selectedService ? (
                        <motion.div
                            key={selectedService.id}
                            className="cost-detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <GlassCard className="cost-detail__card">
                                <div className="cost-detail__header">
                                    <span className="cost-detail__cpt">{selectedService.cptCode}</span>
                                    <h2>{selectedService.description}</h2>
                                    <span className="cost-detail__category">{selectedService.category}</span>
                                </div>

                                {/* Patient Responsibility Breakdown */}
                                {(() => {
                                    const resp = calculatePatientResponsibility(selectedService)
                                    return (
                                        <div className="cost-detail__breakdown">
                                            <h3>Your Cost Breakdown</h3>

                                            <div className="cost-detail__line">
                                                <span>Allowed Amount (In-Network)</span>
                                                <span>{formatCurrency(selectedService.yourCost)}</span>
                                            </div>

                                            {resp.deductibleApplied > 0 && (
                                                <div className="cost-detail__line cost-detail__line--deductible">
                                                    <span>
                                                        <HelpCircle size={12} />
                                                        Deductible Applied
                                                    </span>
                                                    <span>{formatCurrency(resp.deductibleApplied)}</span>
                                                </div>
                                            )}

                                            {resp.coinsurance > 0 && (
                                                <div className="cost-detail__line cost-detail__line--coinsurance">
                                                    <span>
                                                        <HelpCircle size={12} />
                                                        Coinsurance ({memberBenefits.coinsuranceRate}%)
                                                    </span>
                                                    <span>{formatCurrency(resp.coinsurance)}</span>
                                                </div>
                                            )}

                                            <div className="cost-detail__line cost-detail__line--plan">
                                                <span>Plan Pays</span>
                                                <span className="cost-detail__plan-pays">{formatCurrency(resp.planPays)}</span>
                                            </div>

                                            <div className="cost-detail__total">
                                                <span>Your Estimated Total</span>
                                                <span className="cost-detail__total-amount">
                                                    {selectedService.yourCost === 0 ? '$0' : formatCurrency(resp.totalPatientCost)}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })()}

                                {/* Phase 4B: Network vs OON Side-by-Side Detail */}
                                <div className="cost-detail__network-comparison">
                                    <h3>Network Cost Comparison</h3>
                                    <div className="cost-detail__network-cards">
                                        <div className="network-card network-card--in">
                                            <div className="network-card__badge">
                                                <ShieldCheck size={14} />
                                                In-Network
                                            </div>
                                            <span className="network-card__cost">
                                                {selectedService.yourCost === 0 ? '$0' : formatCurrency(selectedService.yourCost)}
                                            </span>
                                            <span className="network-card__range">
                                                Range: {formatCurrency(selectedService.inNetworkRange.min)} – {formatCurrency(selectedService.inNetworkRange.max)}
                                            </span>
                                        </div>
                                        <div className="network-card network-card--out">
                                            <div className="network-card__badge network-card__badge--out">
                                                <ShieldAlert size={14} />
                                                Out-of-Network
                                            </div>
                                            <span className="network-card__cost network-card__cost--out">
                                                {formatCurrency(selectedService.yourCostOON)}
                                            </span>
                                            <span className="network-card__range">
                                                Range: {formatCurrency(selectedService.outOfNetworkRange.min)} – {formatCurrency(selectedService.outOfNetworkRange.max)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Savings Recommendation Callout */}
                                    {selectedService.yourCostOON > selectedService.yourCost && (
                                        <motion.div
                                            className="cost-detail__savings-callout"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <div className="savings-callout__icon">
                                                <Lightbulb size={18} />
                                            </div>
                                            <div className="savings-callout__content">
                                                <span className="savings-callout__title">Savings Recommendation</span>
                                                <span className="savings-callout__text">
                                                    Use an in-network provider to save{' '}
                                                    <strong>{formatCurrency(selectedService.yourCostOON - selectedService.yourCost)}</strong>
                                                    {' '}on this procedure.
                                                </span>
                                            </div>
                                            <ArrowRight size={16} className="savings-callout__arrow" />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Phase 4B: Historical Cost */}
                                {selectedService.historicalCost && (
                                    <div className="cost-detail__historical">
                                        <h3>Your History</h3>
                                        <div className="cost-detail__historical-card">
                                            <Clock size={16} />
                                            <div className="cost-detail__historical-info">
                                                <span className="cost-detail__historical-label">
                                                    You paid <strong>
                                                        {selectedService.historicalCost.amount === 0
                                                            ? '$0'
                                                            : formatCurrency(selectedService.historicalCost.amount)
                                                        }
                                                    </strong> last time
                                                </span>
                                                <span className="cost-detail__historical-sub">
                                                    {new Date(selectedService.historicalCost.date).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                    {' at '}{selectedService.historicalCost.provider}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Price Range Comparison */}
                                <div className="cost-detail__ranges">
                                    <h3>Price Comparison</h3>

                                    <div className="cost-detail__range">
                                        <div className="cost-detail__range-header">
                                            <CheckCircle2 size={14} className="in-network" />
                                            <span>In-Network Range</span>
                                        </div>
                                        <div className="cost-detail__range-bar">
                                            <div
                                                className="cost-detail__range-fill cost-detail__range-fill--in"
                                                style={{ width: '60%' }}
                                            />
                                            <div className="cost-detail__range-marker" style={{ left: '30%' }} />
                                        </div>
                                        <div className="cost-detail__range-labels">
                                            <span>{formatCurrency(selectedService.inNetworkRange.min)}</span>
                                            <span>{formatCurrency(selectedService.inNetworkRange.max)}</span>
                                        </div>
                                    </div>

                                    <div className="cost-detail__range">
                                        <div className="cost-detail__range-header">
                                            <AlertCircle size={14} className="out-of-network" />
                                            <span>Out-of-Network Range</span>
                                        </div>
                                        <div className="cost-detail__range-bar">
                                            <div
                                                className="cost-detail__range-fill cost-detail__range-fill--out"
                                                style={{ width: '80%' }}
                                            />
                                        </div>
                                        <div className="cost-detail__range-labels">
                                            <span>{formatCurrency(selectedService.outOfNetworkRange.min)}</span>
                                            <span>{formatCurrency(selectedService.outOfNetworkRange.max)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Commonly Bundled */}
                                {selectedService.commonWith.length > 0 && (
                                    <div className="cost-detail__bundled">
                                        <h3>Often Includes</h3>
                                        <ul>
                                            {selectedService.commonWith.map((item, i) => (
                                                <li key={i}>
                                                    <Info size={12} />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="cost-detail__disclaimer">
                                    <AlertCircle size={14} />
                                    <p>
                                        This is an estimate based on your current benefits.
                                        Actual costs may vary based on provider, facility, and your benefits at time of service.
                                    </p>
                                </div>

                                <div className="cost-detail__actions">
                                    <Button variant="primary" icon={<Building2 size={16} />}>
                                        Find Providers
                                    </Button>
                                    <Button variant="secondary" icon={<FileText size={16} />}>
                                        Save Estimate
                                    </Button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="cost-estimator__no-selection"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Calculator size={48} />
                            <p>Select a service to see your cost breakdown</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default CostEstimator
