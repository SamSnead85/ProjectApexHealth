import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    Calculator,
    DollarSign,
    Heart,
    Pill,
    Stethoscope,
    Eye,
    Activity,
    Sparkles,
    Check,
    Info
} from 'lucide-react'
import './BenefitCalculator.css'

interface ServiceType {
    id: string
    label: string
    icon: React.ReactNode
    baseCost: number
}

const serviceTypes: ServiceType[] = [
    { id: 'primaryCare', label: 'Primary Care Visit', icon: <Stethoscope size={16} />, baseCost: 150 },
    { id: 'specialist', label: 'Specialist Visit', icon: <Activity size={16} />, baseCost: 350 },
    { id: 'prescription', label: 'Prescription (30-day)', icon: <Pill size={16} />, baseCost: 80 },
    { id: 'labWork', label: 'Lab Work', icon: <Heart size={16} />, baseCost: 200 },
    { id: 'imaging', label: 'Imaging/X-Ray', icon: <Eye size={16} />, baseCost: 450 },
    { id: 'preventive', label: 'Preventive Care', icon: <Sparkles size={16} />, baseCost: 0 },
]

export default function BenefitCalculator() {
    const [selectedServices, setSelectedServices] = useState<string[]>(['primaryCare'])
    const [deductibleMet, setDeductibleMet] = useState(850)
    const [planType, setPlanType] = useState<'ppo' | 'hmo' | 'hdhp'>('ppo')
    const [inNetwork, setInNetwork] = useState(true)
    const [visits, setVisits] = useState(1)

    const planDetails = {
        ppo: { deductible: 1500, coinsurance: 0.2, copay: 30, oopMax: 6000 },
        hmo: { deductible: 500, coinsurance: 0.15, copay: 20, oopMax: 4000 },
        hdhp: { deductible: 3000, coinsurance: 0.1, copay: 0, oopMax: 7000 }
    }

    const currentPlan = planDetails[planType]
    const deductibleRemaining = Math.max(0, currentPlan.deductible - deductibleMet)

    const toggleService = (serviceId: string) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(s => s !== serviceId)
                : [...prev, serviceId]
        )
    }

    const calculations = useMemo(() => {
        const selectedServiceData = serviceTypes.filter(s => selectedServices.includes(s.id))
        const grossCost = selectedServiceData.reduce((sum, s) => sum + s.baseCost, 0) * visits

        // Apply network discount
        const networkAdjustedCost = inNetwork ? grossCost : grossCost * 1.4

        // Apply deductible
        let remainingCost = networkAdjustedCost
        let appliedToDeductible = 0

        if (deductibleRemaining > 0) {
            appliedToDeductible = Math.min(remainingCost, deductibleRemaining)
            remainingCost -= appliedToDeductible
        }

        // Apply coinsurance
        const coinsuranceAmount = remainingCost * currentPlan.coinsurance
        const planPays = remainingCost - coinsuranceAmount

        // Add copay if applicable
        const copayTotal = planType !== 'hdhp' ? currentPlan.copay * visits : 0

        const yourCost = appliedToDeductible + coinsuranceAmount + copayTotal
        const savings = networkAdjustedCost - yourCost

        return {
            grossCost: networkAdjustedCost,
            appliedToDeductible,
            coinsuranceAmount,
            copayTotal,
            planPays,
            yourCost,
            savings
        }
    }, [selectedServices, visits, planType, inNetwork, deductibleRemaining, currentPlan])

    const formatCurrency = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    return (
        <div className="benefit-calculator">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>Benefit Calculator</h1>
                <p className="page-subtitle">
                    Estimate your out-of-pocket costs for healthcare services
                </p>
            </motion.div>

            <div className="calculator-layout">
                {/* Input Panel */}
                <motion.div
                    className="input-panel"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2>
                        <Calculator size={20} />
                        Service Details
                    </h2>

                    <div className="input-row">
                        <div className="input-group">
                            <label>Plan Type</label>
                            <select
                                value={planType}
                                onChange={(e) => setPlanType(e.target.value as 'ppo' | 'hmo' | 'hdhp')}
                            >
                                <option value="ppo">PPO - Preferred Provider</option>
                                <option value="hmo">HMO - Health Maintenance</option>
                                <option value="hdhp">HDHP - High Deductible</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Network Status</label>
                            <select
                                value={inNetwork ? 'in' : 'out'}
                                onChange={(e) => setInNetwork(e.target.value === 'in')}
                            >
                                <option value="in">In-Network Provider</option>
                                <option value="out">Out-of-Network Provider</option>
                            </select>
                        </div>
                    </div>

                    <div className="slider-group">
                        <div className="slider-header">
                            <span className="slider-label">Deductible Already Met</span>
                            <span className="slider-value">{formatCurrency(deductibleMet)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={currentPlan.deductible}
                            value={deductibleMet}
                            onChange={(e) => setDeductibleMet(Number(e.target.value))}
                        />
                    </div>

                    <div className="slider-group">
                        <div className="slider-header">
                            <span className="slider-label">Number of Visits/Services</span>
                            <span className="slider-value">{visits}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="12"
                            value={visits}
                            onChange={(e) => setVisits(Number(e.target.value))}
                        />
                    </div>

                    <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Select Services
                    </label>
                    <div className="service-toggles">
                        {serviceTypes.map((service) => (
                            <label
                                key={service.id}
                                className={`service-toggle ${selectedServices.includes(service.id) ? 'active' : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedServices.includes(service.id)}
                                    onChange={() => toggleService(service.id)}
                                />
                                <span className="toggle-check">
                                    {selectedServices.includes(service.id) && <Check size={14} />}
                                </span>
                                {service.icon}
                                <span className="toggle-label">{service.label}</span>
                            </label>
                        ))}
                    </div>
                </motion.div>

                {/* Results Panel */}
                <motion.div
                    className="results-panel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2>
                        <DollarSign size={20} />
                        Cost Estimate
                    </h2>

                    {calculations.savings > 0 && (
                        <div className="savings-callout">
                            <h4>Your Plan Saves You</h4>
                            <div className="savings-amount">{formatCurrency(calculations.savings)}</div>
                        </div>
                    )}

                    <div className="deductible-progress">
                        <div className="progress-header">
                            <span className="progress-label">Deductible Progress</span>
                            <span className="progress-value">
                                {formatCurrency(deductibleMet + calculations.appliedToDeductible)} / {formatCurrency(currentPlan.deductible)}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${Math.min(100, ((deductibleMet + calculations.appliedToDeductible) / currentPlan.deductible) * 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="cost-breakdown">
                        <div className="cost-row">
                            <span className="cost-label">Total Service Cost</span>
                            <span className="cost-value">{formatCurrency(calculations.grossCost)}</span>
                        </div>
                        {calculations.appliedToDeductible > 0 && (
                            <div className="cost-row">
                                <span className="cost-label">Applied to Deductible</span>
                                <span className="cost-value">{formatCurrency(calculations.appliedToDeductible)}</span>
                            </div>
                        )}
                        {calculations.coinsuranceAmount > 0 && (
                            <div className="cost-row">
                                <span className="cost-label">Your Coinsurance ({currentPlan.coinsurance * 100}%)</span>
                                <span className="cost-value">{formatCurrency(calculations.coinsuranceAmount)}</span>
                            </div>
                        )}
                        {calculations.copayTotal > 0 && (
                            <div className="cost-row">
                                <span className="cost-label">Copay</span>
                                <span className="cost-value">{formatCurrency(calculations.copayTotal)}</span>
                            </div>
                        )}
                        <div className="cost-row">
                            <span className="cost-label">Plan Pays</span>
                            <span className="cost-value" style={{ color: '#22c55e' }}>
                                -{formatCurrency(calculations.planPays)}
                            </span>
                        </div>
                        <div className="cost-row total">
                            <span className="cost-label">Your Estimated Cost</span>
                            <span className="cost-value">{formatCurrency(calculations.yourCost)}</span>
                        </div>
                    </div>

                    <p className="disclaimer">
                        <Info size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        This is an estimate only. Actual costs may vary based on specific services, provider contracts, and claim adjudication.
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
