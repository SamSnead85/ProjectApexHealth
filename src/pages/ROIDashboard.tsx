import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    DollarSign,
    Clock,
    Users,
    BarChart3,
    ArrowRight,
    Calculator,
    Sparkles,
    CheckCircle2,
    Target,
    Zap,
    Shield
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './ROIDashboard.css'

interface ROIMetric {
    id: string
    label: string
    currentValue: number
    projectedValue: number
    unit: string
    prefix?: string
    improvement: number
    icon: React.ReactNode
}

interface CalculatorInput {
    claims: number
    employees: number
    currentProcessingCost: number
    denialRate: number
}

const roiMetrics: ROIMetric[] = [
    {
        id: 'cost-savings',
        label: 'Annual Cost Savings',
        currentValue: 0,
        projectedValue: 2340000,
        unit: '',
        prefix: '$',
        improvement: 127,
        icon: <DollarSign size={20} />
    },
    {
        id: 'time-savings',
        label: 'Hours Saved Per Month',
        currentValue: 0,
        projectedValue: 2847,
        unit: 'hrs',
        improvement: 340,
        icon: <Clock size={20} />
    },
    {
        id: 'processing-time',
        label: 'Claim Processing Time',
        currentValue: 14,
        projectedValue: 1.8,
        unit: 'days',
        improvement: 87,
        icon: <Zap size={20} />
    },
    {
        id: 'denial-reduction',
        label: 'Denial Rate Reduction',
        currentValue: 18,
        projectedValue: 3.2,
        unit: '%',
        improvement: 82,
        icon: <Target size={20} />
    }
]

const valuePropositions = [
    { icon: <Zap size={18} />, title: '94% Auto-Adjudication', description: 'AI-powered straight-through processing' },
    { icon: <Clock size={18} />, title: '45% Faster Enrollment', description: 'Streamlined digital-first workflows' },
    { icon: <Shield size={18} />, title: '99.99% Uptime', description: 'Enterprise-grade reliability' },
    { icon: <Users size={18} />, title: '4.9/5 Satisfaction', description: 'Industry-leading NPS scores' }
]

const caseStudies = [
    {
        company: 'Regional Health Network',
        industry: 'Healthcare Provider',
        employees: '15,000+',
        savings: '$4.2M',
        timeReduction: '62%',
        quote: 'Project Apex transformed our claims operation within 90 days.'
    },
    {
        company: 'National Insurance Group',
        industry: 'Insurance Carrier',
        employees: '50,000+',
        savings: '$12.7M',
        timeReduction: '78%',
        quote: 'The ROI exceeded our projections by 3x in the first year.'
    },
    {
        company: 'Fortune 500 Employer',
        industry: 'Self-Insured',
        employees: '100,000+',
        savings: '$8.9M',
        timeReduction: '71%',
        quote: 'Best-in-class platform for enterprise benefits administration.'
    }
]

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) {
    const [displayValue, setDisplayValue] = useState(0)

    useState(() => {
        const duration = 2000
        const steps = 60
        const increment = value / steps
        let current = 0
        const timer = setInterval(() => {
            current += increment
            if (current >= value) {
                setDisplayValue(value)
                clearInterval(timer)
            } else {
                setDisplayValue(Math.floor(current))
            }
        }, duration / steps)
        return () => clearInterval(timer)
    })

    return (
        <span className="animated-number">
            {prefix}{displayValue.toLocaleString()}{suffix}
        </span>
    )
}

export function ROIDashboard() {
    const [calculatorInputs, setCalculatorInputs] = useState<CalculatorInput>({
        claims: 50000,
        employees: 5000,
        currentProcessingCost: 25,
        denialRate: 15
    })

    const calculateROI = () => {
        const claimsProcessingSavings = calculatorInputs.claims * (calculatorInputs.currentProcessingCost - 8) * 0.94
        const denialReduction = calculatorInputs.claims * 0.1 * 500 * ((calculatorInputs.denialRate - 3) / 100)
        const laborSavings = calculatorInputs.employees * 2.5 * 12 * 45
        return claimsProcessingSavings + denialReduction + laborSavings
    }

    const projectedROI = calculateROI()

    return (
        <div className="roi-dashboard">
            {/* Header with AI Badge */}
            <div className="roi-dashboard__header">
                <div className="roi-dashboard__header-content">
                    <Badge variant="teal" dot pulse>
                        <Sparkles size={12} />
                        ROI Intelligence
                    </Badge>
                    <h1 className="roi-dashboard__title">Return on Investment</h1>
                    <p className="roi-dashboard__subtitle">
                        See how Project Apex delivers measurable value for your organization
                    </p>
                </div>
            </div>

            {/* Key ROI Metrics */}
            <div className="roi-dashboard__metrics">
                {roiMetrics.map((metric, index) => (
                    <motion.div
                        key={metric.id}
                        className="roi-metric-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="roi-metric-card__icon">{metric.icon}</div>
                        <div className="roi-metric-card__content">
                            <span className="roi-metric-card__label">{metric.label}</span>
                            <span className="roi-metric-card__value">
                                {metric.prefix}
                                <AnimatedNumber value={metric.projectedValue} />
                                {metric.unit && <span className="roi-metric-card__unit">{metric.unit}</span>}
                            </span>
                            <Badge variant="success" icon={<TrendingUp size={10} />}>
                                {metric.improvement}% improvement
                            </Badge>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ROI Calculator */}
            <GlassCard className="roi-dashboard__calculator">
                <div className="calculator__header">
                    <div className="calculator__title-row">
                        <Calculator size={20} className="text-teal" />
                        <h2>Calculate Your Savings</h2>
                    </div>
                    <p className="calculator__description">
                        Enter your organization's metrics to see projected ROI
                    </p>
                </div>

                <div className="calculator__inputs">
                    <div className="calculator__input-group">
                        <label>Annual Claims Volume</label>
                        <input
                            type="number"
                            value={calculatorInputs.claims}
                            onChange={(e) => setCalculatorInputs(prev => ({ ...prev, claims: Number(e.target.value) }))}
                        />
                    </div>
                    <div className="calculator__input-group">
                        <label>Total Employees</label>
                        <input
                            type="number"
                            value={calculatorInputs.employees}
                            onChange={(e) => setCalculatorInputs(prev => ({ ...prev, employees: Number(e.target.value) }))}
                        />
                    </div>
                    <div className="calculator__input-group">
                        <label>Current Cost per Claim ($)</label>
                        <input
                            type="number"
                            value={calculatorInputs.currentProcessingCost}
                            onChange={(e) => setCalculatorInputs(prev => ({ ...prev, currentProcessingCost: Number(e.target.value) }))}
                        />
                    </div>
                    <div className="calculator__input-group">
                        <label>Current Denial Rate (%)</label>
                        <input
                            type="number"
                            value={calculatorInputs.denialRate}
                            onChange={(e) => setCalculatorInputs(prev => ({ ...prev, denialRate: Number(e.target.value) }))}
                        />
                    </div>
                </div>

                <motion.div
                    className="calculator__result"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <span className="calculator__result-label">Projected Annual Savings</span>
                    <span className="calculator__result-value">
                        ${projectedROI.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                    <Badge variant="success">First Year ROI: {Math.round((projectedROI / (calculatorInputs.employees * 50)) * 100)}%</Badge>
                </motion.div>

                <Button variant="primary" icon={<ArrowRight size={16} />} iconPosition="right" fullWidth>
                    Get Detailed Analysis
                </Button>
            </GlassCard>

            {/* Value Propositions */}
            <div className="roi-dashboard__value-props">
                <h2 className="section-title">
                    <Target size={20} />
                    Key Value Drivers
                </h2>
                <div className="value-props__grid">
                    {valuePropositions.map((prop, index) => (
                        <motion.div
                            key={prop.title}
                            className="value-prop-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                        >
                            <div className="value-prop-card__icon">{prop.icon}</div>
                            <div className="value-prop-card__content">
                                <span className="value-prop-card__title">{prop.title}</span>
                                <span className="value-prop-card__description">{prop.description}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Case Studies */}
            <div className="roi-dashboard__case-studies">
                <h2 className="section-title">
                    <BarChart3 size={20} />
                    Proven Results
                </h2>
                <div className="case-studies__grid">
                    {caseStudies.map((study, index) => (
                        <motion.div
                            key={study.company}
                            className="case-study-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                        >
                            <div className="case-study-card__header">
                                <span className="case-study-card__company">{study.company}</span>
                                <Badge variant="subtle">{study.industry}</Badge>
                            </div>
                            <div className="case-study-card__metrics">
                                <div className="case-study-card__metric">
                                    <span className="case-study-card__metric-value text-success">{study.savings}</span>
                                    <span className="case-study-card__metric-label">Annual Savings</span>
                                </div>
                                <div className="case-study-card__metric">
                                    <span className="case-study-card__metric-value text-teal">{study.timeReduction}</span>
                                    <span className="case-study-card__metric-label">Time Reduction</span>
                                </div>
                                <div className="case-study-card__metric">
                                    <span className="case-study-card__metric-value">{study.employees}</span>
                                    <span className="case-study-card__metric-label">Employees</span>
                                </div>
                            </div>
                            <blockquote className="case-study-card__quote">
                                <CheckCircle2 size={14} className="text-success" />
                                "{study.quote}"
                            </blockquote>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <GlassCard className="roi-dashboard__cta">
                <div className="cta__content">
                    <Sparkles size={24} className="text-teal" />
                    <h2>Ready to See Your Custom ROI?</h2>
                    <p>Schedule a personalized demo with our solutions team</p>
                </div>
                <div className="cta__actions">
                    <Button variant="primary" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
                        Schedule Demo
                    </Button>
                    <Button variant="secondary" size="lg">
                        Download ROI Report
                    </Button>
                </div>
            </GlassCard>
        </div>
    )
}

export default ROIDashboard
