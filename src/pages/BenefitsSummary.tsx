import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Shield,
    Users,
    DollarSign,
    Calendar,
    Download,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    FileText,
    Heart,
    Pill,
    Eye,
    Stethoscope,
    Building2,
    Phone
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './BenefitsSummary.css'

interface BenefitCategory {
    id: string
    name: string
    icon: React.ReactNode
    inNetworkDeductible: string
    outOfNetworkDeductible: string
    inNetworkCoinsurance: string
    outOfNetworkCoinsurance: string
    inNetworkOOP: string
    outOfNetworkOOP: string
}

interface Dependent {
    id: string
    name: string
    relationship: string
    dob: string
    enrolled: boolean
}

const benefitCategories: BenefitCategory[] = [
    {
        id: 'medical',
        name: 'Medical',
        icon: <Stethoscope size={20} />,
        inNetworkDeductible: '$1,500',
        outOfNetworkDeductible: '$3,000',
        inNetworkCoinsurance: '80%',
        outOfNetworkCoinsurance: '60%',
        inNetworkOOP: '$5,000',
        outOfNetworkOOP: '$10,000'
    },
    {
        id: 'pharmacy',
        name: 'Pharmacy',
        icon: <Pill size={20} />,
        inNetworkDeductible: 'Combined',
        outOfNetworkDeductible: 'Combined',
        inNetworkCoinsurance: 'Tier-based',
        outOfNetworkCoinsurance: '50%',
        inNetworkOOP: 'Combined',
        outOfNetworkOOP: 'Combined'
    },
    {
        id: 'dental',
        name: 'Dental',
        icon: <Heart size={20} />,
        inNetworkDeductible: '$50',
        outOfNetworkDeductible: '$100',
        inNetworkCoinsurance: '100%/80%/50%',
        outOfNetworkCoinsurance: '80%/60%/40%',
        inNetworkOOP: '$1,500',
        outOfNetworkOOP: '$2,000'
    },
    {
        id: 'vision',
        name: 'Vision',
        icon: <Eye size={20} />,
        inNetworkDeductible: '$0',
        outOfNetworkDeductible: '$25',
        inNetworkCoinsurance: '$10 copay',
        outOfNetworkCoinsurance: '$25 copay',
        inNetworkOOP: '$150 frames',
        outOfNetworkOOP: '$75 frames'
    }
]

const dependents: Dependent[] = [
    { id: 'dep-1', name: 'Jane Doe', relationship: 'Spouse', dob: '1985-06-15', enrolled: true },
    { id: 'dep-2', name: 'Alex Doe', relationship: 'Child', dob: '2012-03-22', enrolled: true }
]

export function BenefitsSummary() {
    const navigate = useNavigate()
    const [activeCategory, setActiveCategory] = useState('medical')

    const planInfo = {
        name: 'Premier PPO Plan',
        effective: 'January 1, 2024',
        memberId: 'XYZ123456789',
        groupNumber: 'GRP-8574291'
    }

    return (
        <div className="benefits-summary-page">
            {/* Header */}
            <div className="benefits-summary__header">
                <div>
                    <h1 className="benefits-summary__title">Benefits Summary</h1>
                    <p className="benefits-summary__subtitle">
                        View your coverage details and plan information
                    </p>
                </div>
                <div className="benefits-summary__actions">
                    <Button variant="secondary" icon={<Download size={16} />}>
                        Download SBC
                    </Button>
                    <Button variant="secondary" icon={<FileText size={16} />} onClick={() => navigate('/member/id-card')}>
                        View ID Card
                    </Button>
                </div>
            </div>

            {/* Plan Overview */}
            <GlassCard className="plan-overview-card">
                <div className="plan-overview__header">
                    <div className="plan-overview__icon">
                        <Shield size={28} />
                    </div>
                    <div className="plan-overview__info">
                        <h2>{planInfo.name}</h2>
                        <span className="plan-overview__effective">
                            <Calendar size={14} /> Effective: {planInfo.effective}
                        </span>
                    </div>
                    <Badge variant="success" icon={<CheckCircle2 size={12} />}>Active Coverage</Badge>
                </div>
                <div className="plan-overview__details">
                    <div className="plan-overview__detail">
                        <span className="plan-overview__label">Member ID</span>
                        <span className="plan-overview__value">{planInfo.memberId}</span>
                    </div>
                    <div className="plan-overview__detail">
                        <span className="plan-overview__label">Group Number</span>
                        <span className="plan-overview__value">{planInfo.groupNumber}</span>
                    </div>
                    <div className="plan-overview__detail">
                        <span className="plan-overview__label">Plan Type</span>
                        <span className="plan-overview__value">PPO</span>
                    </div>
                    <div className="plan-overview__detail">
                        <span className="plan-overview__label">Network</span>
                        <span className="plan-overview__value">Premier National</span>
                    </div>
                </div>
            </GlassCard>

            {/* Benefit Categories */}
            <div className="benefits-categories">
                <div className="benefits-categories__tabs">
                    {benefitCategories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`benefits-category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            <span className="benefits-category-tab__icon">{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {benefitCategories.filter(c => c.id === activeCategory).map(cat => (
                    <motion.div
                        key={cat.id}
                        className="benefits-details"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="benefits-table">
                            <div className="benefits-table__header">
                                <span></span>
                                <span>In-Network</span>
                                <span>Out-of-Network</span>
                            </div>
                            <div className="benefits-table__row">
                                <span className="benefits-table__label">Deductible</span>
                                <span className="benefits-table__value benefits-table__value--primary">{cat.inNetworkDeductible}</span>
                                <span className="benefits-table__value">{cat.outOfNetworkDeductible}</span>
                            </div>
                            <div className="benefits-table__row">
                                <span className="benefits-table__label">Coinsurance</span>
                                <span className="benefits-table__value benefits-table__value--primary">{cat.inNetworkCoinsurance}</span>
                                <span className="benefits-table__value">{cat.outOfNetworkCoinsurance}</span>
                            </div>
                            <div className="benefits-table__row">
                                <span className="benefits-table__label">Out-of-Pocket Max</span>
                                <span className="benefits-table__value benefits-table__value--primary">{cat.inNetworkOOP}</span>
                                <span className="benefits-table__value">{cat.outOfNetworkOOP}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Dependents */}
            <GlassCard className="dependents-card">
                <div className="dependents-card__header">
                    <h3><Users size={18} /> Covered Dependents</h3>
                    <Button variant="ghost" size="sm">Manage</Button>
                </div>
                <div className="dependents-list">
                    {dependents.map((dep, index) => (
                        <motion.div
                            key={dep.id}
                            className="dependent-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="dependent-item__avatar">
                                <Users size={16} />
                            </div>
                            <div className="dependent-item__info">
                                <span className="dependent-item__name">{dep.name}</span>
                                <span className="dependent-item__relationship">{dep.relationship}</span>
                            </div>
                            <Badge variant={dep.enrolled ? 'success' : 'info'} size="sm">
                                {dep.enrolled ? 'Enrolled' : 'Not Enrolled'}
                            </Badge>
                        </motion.div>
                    ))}
                </div>
            </GlassCard>

            {/* Contact Info */}
            <div className="benefits-contacts">
                <GlassCard className="contact-card">
                    <Building2 size={24} />
                    <h4>Insurance Company</h4>
                    <span className="contact-card__name">Premier Health Insurance</span>
                    <span className="contact-card__phone">
                        <Phone size={14} /> 1-800-555-0123
                    </span>
                </GlassCard>
                <GlassCard className="contact-card">
                    <Users size={24} />
                    <h4>Member Services</h4>
                    <span className="contact-card__name">24/7 Support</span>
                    <span className="contact-card__phone">
                        <Phone size={14} /> 1-800-555-0124
                    </span>
                </GlassCard>
                <GlassCard className="contact-card">
                    <AlertCircle size={24} />
                    <h4>Nurse Hotline</h4>
                    <span className="contact-card__name">Ask-A-Nurse</span>
                    <span className="contact-card__phone">
                        <Phone size={14} /> 1-800-555-0125
                    </span>
                </GlassCard>
            </div>
        </div>
    )
}

export default BenefitsSummary
