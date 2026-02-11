import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Pill,
    Search,
    RefreshCw,
    Clock,
    MapPin,
    Phone,
    Calendar,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Package,
    Truck,
    CreditCard,
    Plus,
    Filter,
    Building2,
    Heart,
    X,
    Bell,
    AlertTriangle,
    ShieldAlert,
    Info
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './Pharmacy.css'

interface Prescription {
    id: string
    drugName: string
    genericName: string
    strength: string
    form: string
    quantity: number
    daysSupply: number
    refillsRemaining: number
    lastFilled: string
    nextRefillDate: string
    prescriber: string
    pharmacy: string
    copay: number
    status: 'active' | 'expired' | 'pending' | 'discontinued'
    autoRefill: boolean
    tierLevel: 1 | 2 | 3 | 4
}

interface PharmacyLocation {
    id: string
    name: string
    address: string
    phone: string
    distance: string
    hours: string
    inNetwork: boolean
    specialty: boolean
}

const mockPrescriptions: Prescription[] = [
    {
        id: 'rx-1',
        drugName: 'Lisinopril',
        genericName: 'Lisinopril',
        strength: '10mg',
        form: 'Tablet',
        quantity: 90,
        daysSupply: 90,
        refillsRemaining: 5,
        lastFilled: '2024-01-15',
        nextRefillDate: '2024-04-15',
        prescriber: 'Dr. Sarah Chen',
        pharmacy: 'CVS Pharmacy #4521',
        copay: 10,
        status: 'active',
        autoRefill: true,
        tierLevel: 1
    },
    {
        id: 'rx-2',
        drugName: 'Metformin',
        genericName: 'Metformin HCL',
        strength: '500mg',
        form: 'Tablet',
        quantity: 60,
        daysSupply: 30,
        refillsRemaining: 2,
        lastFilled: '2024-01-10',
        nextRefillDate: '2024-02-10',
        prescriber: 'Dr. Sarah Chen',
        pharmacy: 'CVS Pharmacy #4521',
        copay: 10,
        status: 'active',
        autoRefill: false,
        tierLevel: 1
    },
    {
        id: 'rx-3',
        drugName: 'Atorvastatin',
        genericName: 'Atorvastatin Calcium',
        strength: '20mg',
        form: 'Tablet',
        quantity: 30,
        daysSupply: 30,
        refillsRemaining: 0,
        lastFilled: '2024-01-05',
        nextRefillDate: '2024-02-05',
        prescriber: 'Dr. Michael Roberts',
        pharmacy: 'Walgreens #8742',
        copay: 15,
        status: 'pending',
        autoRefill: true,
        tierLevel: 2
    }
]

const mockPharmacies: PharmacyLocation[] = [
    {
        id: 'pharm-1',
        name: 'CVS Pharmacy',
        address: '1234 Main Street, Suite 100',
        phone: '(555) 123-4567',
        distance: '0.8 mi',
        hours: 'Open until 9:00 PM',
        inNetwork: true,
        specialty: false
    },
    {
        id: 'pharm-2',
        name: 'Walgreens',
        address: '5678 Oak Avenue',
        phone: '(555) 987-6543',
        distance: '1.2 mi',
        hours: 'Open 24 hours',
        inNetwork: true,
        specialty: false
    },
    {
        id: 'pharm-3',
        name: 'Specialty Pharmacy Plus',
        address: '9012 Medical Center Drive',
        phone: '(555) 456-7890',
        distance: '3.5 mi',
        hours: 'Open until 6:00 PM',
        inNetwork: true,
        specialty: true
    }
]

export function Pharmacy() {
    const [prescriptions] = useState<Prescription[]>(mockPrescriptions)
    const [pharmacies] = useState<PharmacyLocation[]>(mockPharmacies)
    const [activeTab, setActiveTab] = useState<'prescriptions' | 'pharmacies' | 'drug-search'>('prescriptions')
    const [searchQuery, setSearchQuery] = useState('')
    const [showTransferModal, setShowTransferModal] = useState(false)
    const [drugSearchQuery, setDrugSearchQuery] = useState('')

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const getDaysUntilRefill = (nextRefillDate: string) => {
        const now = new Date()
        const refill = new Date(nextRefillDate)
        const diffDays = Math.ceil((refill.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const getStatusBadge = (status: Prescription['status']) => {
        switch (status) {
            case 'active':
                return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Active</Badge>
            case 'expired':
                return <Badge variant="critical">Expired</Badge>
            case 'pending':
                return <Badge variant="warning" icon={<Clock size={10} />}>Pending Refill</Badge>
            case 'discontinued':
                return <Badge variant="info">Discontinued</Badge>
        }
    }

    const getTierLabel = (tier: Prescription['tierLevel']) => {
        switch (tier) {
            case 1: return 'Tier 1 - Generic'
            case 2: return 'Tier 2 - Preferred Brand'
            case 3: return 'Tier 3 - Non-Preferred'
            case 4: return 'Tier 4 - Specialty'
        }
    }

    const activePrescriptions = prescriptions.filter(rx => rx.status === 'active' || rx.status === 'pending')
    const totalMonthlyCost = prescriptions.reduce((sum, rx) => sum + (rx.status === 'active' ? rx.copay : 0), 0)

    // Refill reminders - prescriptions due within 14 days
    const refillDueRx = prescriptions.filter(rx => {
        if (rx.status !== 'active') return false
        const days = getDaysUntilRefill(rx.nextRefillDate)
        return days <= 14 && days >= 0
    })

    // Drug interaction warnings (mock data)
    const drugInteractions = [
        {
            id: 'int-1',
            severity: 'moderate' as const,
            drugs: ['Lisinopril', 'Metformin'],
            description: 'Monitor kidney function regularly. Both medications can affect renal function — ensure adequate hydration.',
        },
        {
            id: 'int-2',
            severity: 'mild' as const,
            drugs: ['Atorvastatin', 'Metformin'],
            description: 'Minor interaction. Atorvastatin may slightly increase blood sugar levels. Monitor glucose as usual.',
        }
    ]

    const [showInteractions, setShowInteractions] = useState(true)

    return (
        <div className="pharmacy-page">
            {/* Refill Reminder Banner */}
            {refillDueRx.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.25rem',
                        borderRadius: '16px', marginBottom: '1.25rem',
                        background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.06) 100%)',
                        border: '1px solid rgba(251,191,36,0.2)'
                    }}
                >
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        background: 'rgba(251,191,36,0.15)'
                    }}>
                        <Bell size={20} style={{ color: '#fbbf24' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fbbf24', marginBottom: '0.15rem' }}>
                            Refill Reminder
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#4B5563' }}>
                            {refillDueRx.length === 1
                                ? `${refillDueRx[0].drugName} ${refillDueRx[0].strength} is due for refill on ${formatDate(refillDueRx[0].nextRefillDate)}`
                                : `${refillDueRx.length} prescriptions are due for refill soon: ${refillDueRx.map(rx => rx.drugName).join(', ')}`
                            }
                        </div>
                    </div>
                    <Button variant="primary" size="sm" icon={<RefreshCw size={13} />} onClick={() => alert('Refill requests submitted for all due prescriptions!')}>
                        Refill {refillDueRx.length > 1 ? 'All' : 'Now'}
                    </Button>
                </motion.div>
            )}

            {/* Drug Interaction Warnings */}
            {showInteractions && drugInteractions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        borderRadius: '16px', marginBottom: '1.25rem', overflow: 'hidden',
                        background: '#FFFFFF', border: '1px solid #E5E7EB'
                    }}
                >
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.85rem 1.25rem',
                        background: 'rgba(239,68,68,0.04)', borderBottom: '1px solid rgba(239,68,68,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <ShieldAlert size={18} style={{ color: '#f87171' }} />
                            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f87171' }}>
                                Drug Interaction Alerts
                            </span>
                            <Badge variant="critical" size="sm">{drugInteractions.length}</Badge>
                        </div>
                        <button onClick={() => setShowInteractions(false)} style={{
                            background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex', padding: '4px'
                        }}>
                            <X size={16} />
                        </button>
                    </div>
                    <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {drugInteractions.map(interaction => (
                            <div key={interaction.id} style={{
                                display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem',
                                borderRadius: '10px', background: interaction.severity === 'moderate'
                                    ? 'rgba(251,191,36,0.06)' : 'rgba(99,102,241,0.06)',
                                border: `1px solid ${interaction.severity === 'moderate'
                                    ? 'rgba(251,191,36,0.12)' : 'rgba(99,102,241,0.12)'}`
                            }}>
                                {interaction.severity === 'moderate'
                                    ? <AlertTriangle size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
                                    : <Info size={16} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
                                }
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#111827' }}>
                                            {interaction.drugs.join(' + ')}
                                        </span>
                                        <Badge
                                            variant={interaction.severity === 'moderate' ? 'warning' : 'info'}
                                            size="sm"
                                        >
                                            {interaction.severity}
                                        </Badge>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.5 }}>
                                        {interaction.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Header */}
            <div className="pharmacy__header">
                <div>
                    <h1 className="pharmacy__title">Pharmacy</h1>
                    <p className="pharmacy__subtitle">
                        Manage prescriptions and find pharmacies
                    </p>
                </div>
                <div className="pharmacy__actions">
                    <Button variant="secondary" icon={<MapPin size={16} />} onClick={() => setActiveTab('pharmacies')}>
                        Find Pharmacy
                    </Button>
                    <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowTransferModal(true)}>
                        Transfer Rx
                    </Button>
                </div>
            </div>

            {/* Metrics */}
            <div className="pharmacy__metrics">
                <MetricCard
                    title="Active Prescriptions"
                    value={activePrescriptions.length.toString()}
                    icon={<Pill size={20} />}
                    subtitle={`${prescriptions.filter(rx => rx.status === 'pending').length} pending refill`}
                    variant="teal"
                />
                <MetricCard
                    title="Monthly Rx Cost"
                    value={`$${totalMonthlyCost}`}
                    icon={<CreditCard size={20} />}
                    subtitle="Based on current copays"
                />
                <MetricCard
                    title="Auto-Refill Enabled"
                    value={prescriptions.filter(rx => rx.autoRefill).length.toString()}
                    icon={<RefreshCw size={20} />}
                    subtitle="Never miss a refill"
                    variant="success"
                />
                <MetricCard
                    title="In-Network Pharmacies"
                    value="247"
                    icon={<Building2 size={20} />}
                    subtitle="Within 10 miles"
                />
            </div>

            {/* Tabs */}
            <div className="pharmacy__tabs">
                <button
                    className={`pharmacy__tab ${activeTab === 'prescriptions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('prescriptions')}
                >
                    <Pill size={16} />
                    My Prescriptions
                </button>
                <button
                    className={`pharmacy__tab ${activeTab === 'pharmacies' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pharmacies')}
                >
                    <MapPin size={16} />
                    Pharmacies
                </button>
                <button
                    className={`pharmacy__tab ${activeTab === 'drug-search' ? 'active' : ''}`}
                    onClick={() => setActiveTab('drug-search')}
                >
                    <Search size={16} />
                    Drug Search
                </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'prescriptions' && (
                    <motion.div
                        key="prescriptions"
                        className="pharmacy__content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="prescriptions__list">
                            {prescriptions.map((rx, index) => (
                                <motion.div
                                    key={rx.id}
                                    className="prescription-card netflix-card"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="prescription-card__header">
                                        <div className="prescription-card__drug">
                                            <div className="prescription-card__icon">
                                                <Pill size={20} />
                                            </div>
                                            <div>
                                                <h3>{rx.drugName} {rx.strength}</h3>
                                                <span className="prescription-card__generic">{rx.genericName}</span>
                                            </div>
                                        </div>
                                        {getStatusBadge(rx.status)}
                                    </div>

                                    <div className="prescription-card__details">
                                        <div className="prescription-card__detail">
                                            <span className="prescription-card__label">Form</span>
                                            <span className="prescription-card__value">{rx.form}</span>
                                        </div>
                                        <div className="prescription-card__detail">
                                            <span className="prescription-card__label">Quantity</span>
                                            <span className="prescription-card__value">{rx.quantity} ({rx.daysSupply} days)</span>
                                        </div>
                                        <div className="prescription-card__detail">
                                            <span className="prescription-card__label">Refills Left</span>
                                            <span className="prescription-card__value">{rx.refillsRemaining}</span>
                                        </div>
                                        <div className="prescription-card__detail">
                                            <span className="prescription-card__label">Copay</span>
                                            <span className="prescription-card__value prescription-card__copay">${rx.copay}</span>
                                        </div>
                                    </div>

                                    <div className="prescription-card__meta">
                                        <span className="prescription-card__tier">
                                            <Heart size={12} /> {getTierLabel(rx.tierLevel)}
                                        </span>
                                        <span className="prescription-card__prescriber">
                                            Prescribed by {rx.prescriber}
                                        </span>
                                    </div>

                                    <div className="prescription-card__footer">
                                        <div className="prescription-card__refill-info">
                                            {rx.status === 'pending' ? (
                                                <span className="prescription-card__pending">
                                                    <Truck size={14} /> Refill in progress
                                                </span>
                                            ) : (
                                                <span>
                                                    Next refill: {formatDate(rx.nextRefillDate)}
                                                    {getDaysUntilRefill(rx.nextRefillDate) <= 7 && (
                                                        <Badge variant="warning" size="sm" className="ml-2">
                                                            {getDaysUntilRefill(rx.nextRefillDate)} days
                                                        </Badge>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        <div className="prescription-card__actions">
                                            {rx.autoRefill && (
                                                <Badge variant="info" size="sm" icon={<RefreshCw size={10} />}>
                                                    Auto-Refill
                                                </Badge>
                                            )}
                                            <Button variant="secondary" size="sm" onClick={() => alert(`Refill requested for ${rx.drugName}! Your pharmacy will be notified.`)}>
                                                Request Refill
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'pharmacies' && (
                    <motion.div
                        key="pharmacies"
                        className="pharmacy__content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="pharmacies__search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, address, or ZIP code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="pharmacies__list">
                            {pharmacies.map((pharm, index) => (
                                <motion.div
                                    key={pharm.id}
                                    className="pharmacy-card"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="pharmacy-card__header">
                                        <div className="pharmacy-card__icon">
                                            <Building2 size={20} />
                                        </div>
                                        <div className="pharmacy-card__info">
                                            <h3>{pharm.name}</h3>
                                            <span className="pharmacy-card__address">{pharm.address}</span>
                                        </div>
                                        <div className="pharmacy-card__badges">
                                            {pharm.inNetwork && (
                                                <Badge variant="success" size="sm">In-Network</Badge>
                                            )}
                                            {pharm.specialty && (
                                                <Badge variant="teal" size="sm">Specialty</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pharmacy-card__details">
                                        <span className="pharmacy-card__distance">
                                            <MapPin size={14} /> {pharm.distance}
                                        </span>
                                        <span className="pharmacy-card__hours">
                                            <Clock size={14} /> {pharm.hours}
                                        </span>
                                        <span className="pharmacy-card__phone">
                                            <Phone size={14} /> {pharm.phone}
                                        </span>
                                    </div>
                                    <div className="pharmacy-card__actions">
                                        <Button variant="ghost" size="sm" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharm.address)}`, '_blank')}>Get Directions</Button>
                                        <Button variant="secondary" size="sm" onClick={() => alert(`${pharm.name} has been set as your preferred pharmacy.`)}>Set as Preferred</Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'drug-search' && (
                    <motion.div
                        key="drug-search"
                        className="pharmacy__content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <GlassCard className="drug-search-card">
                            <h3>Search Drug Formulary</h3>
                            <p className="drug-search-card__subtitle">
                                Check if a medication is covered and find lower-cost alternatives
                            </p>
                            <div className="drug-search__input">
                                <Search size={20} />
                                <input
                                    type="text"
                                    placeholder="Enter drug name..."
                                    value={drugSearchQuery}
                                    onChange={(e) => setDrugSearchQuery(e.target.value)}
                                />
                                <Button variant="primary" onClick={() => {
                                    if (drugSearchQuery.trim()) {
                                        alert(`Searching formulary for "${drugSearchQuery}"...\n\nFound: ${drugSearchQuery} is covered under Tier 1 (Generic) with a $10 copay.`)
                                    }
                                }}>Search</Button>
                            </div>

                            <div className="drug-tiers">
                                <h4>Formulary Tiers</h4>
                                <div className="drug-tiers__grid">
                                    <div className="drug-tier">
                                        <span className="drug-tier__number">1</span>
                                        <span className="drug-tier__name">Generic</span>
                                        <span className="drug-tier__cost">$10 copay</span>
                                    </div>
                                    <div className="drug-tier">
                                        <span className="drug-tier__number">2</span>
                                        <span className="drug-tier__name">Preferred Brand</span>
                                        <span className="drug-tier__cost">$35 copay</span>
                                    </div>
                                    <div className="drug-tier">
                                        <span className="drug-tier__number">3</span>
                                        <span className="drug-tier__name">Non-Preferred</span>
                                        <span className="drug-tier__cost">$60 copay</span>
                                    </div>
                                    <div className="drug-tier">
                                        <span className="drug-tier__number">4</span>
                                        <span className="drug-tier__name">Specialty</span>
                                        <span className="drug-tier__cost">20% coinsurance</span>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transfer Rx Modal */}
            <AnimatePresence>
                {showTransferModal && (
                    <motion.div
                        className="pharmacy__modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowTransferModal(false)}
                    >
                        <motion.div
                            className="pharmacy__modal"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="pharmacy__modal-header">
                                <h3>Transfer Prescription</h3>
                                <button className="pharmacy__modal-close" onClick={() => setShowTransferModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="pharmacy__modal-content">
                                <p className="pharmacy__modal-desc">
                                    Transfer your prescriptions from another pharmacy to one of our in-network locations.
                                </p>
                                <div className="transfer-form">
                                    <div className="transfer-form__field">
                                        <label>Current Pharmacy Name</label>
                                        <input type="text" placeholder="e.g., Walgreens, CVS..." />
                                    </div>
                                    <div className="transfer-form__field">
                                        <label>Prescription Number (Rx#)</label>
                                        <input type="text" placeholder="Found on prescription label" />
                                    </div>
                                    <div className="transfer-form__field">
                                        <label>Transfer To</label>
                                        <select>
                                            <option value="">Select a pharmacy...</option>
                                            {pharmacies.filter(p => p.inNetwork).map(p => (
                                                <option key={p.id} value={p.id}>{p.name} - {p.address}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="pharmacy__modal-actions">
                                <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
                                    Cancel
                                </Button>
                                <Button variant="primary" icon={<RefreshCw size={16} />} onClick={() => {
                                    alert('Transfer request submitted! You will receive a confirmation within 24-48 hours.')
                                    setShowTransferModal(false)
                                }}>
                                    Submit Transfer
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Pharmacy
