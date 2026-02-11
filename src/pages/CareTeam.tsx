import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    User,
    Phone,
    Mail,
    MapPin,
    Star,
    Calendar,
    MessageSquare,
    Heart,
    Stethoscope,
    Brain,
    Pill,
    Eye,
    Activity,
    ChevronRight,
    Search,
    X
} from 'lucide-react'
import { GlassCard, Badge, Button, PageSkeleton } from '../components/common'
import './CareTeam.css'

interface CareProvider {
    id: string
    name: string
    specialty: string
    role: 'primary' | 'specialist' | 'mental' | 'dental' | 'vision' | 'pharmacy'
    practice: string
    address: string
    phone: string
    fax?: string
    email?: string
    rating: number
    reviewCount: number
    nextAppointment?: string
    lastVisit?: string
    acceptingNewPatients: boolean
    inNetwork: boolean
}

const mockCareTeam: CareProvider[] = [
    {
        id: 'prov-1',
        name: 'Dr. Sarah Chen',
        specialty: 'Family Medicine',
        role: 'primary',
        practice: 'Premier Medical Associates',
        address: '123 Medical Center Drive, Suite 200',
        phone: '(555) 123-4567',
        fax: '(555) 123-4568',
        rating: 4.9,
        reviewCount: 324,
        nextAppointment: '2024-02-15T10:00:00Z',
        lastVisit: '2024-01-15',
        acceptingNewPatients: true,
        inNetwork: true
    },
    {
        id: 'prov-2',
        name: 'Dr. Michael Roberts',
        specialty: 'Cardiology',
        role: 'specialist',
        practice: 'Heart & Vascular Institute',
        address: '456 Cardiac Way, Building B',
        phone: '(555) 987-6543',
        rating: 4.8,
        reviewCount: 189,
        lastVisit: '2023-11-20',
        acceptingNewPatients: false,
        inNetwork: true
    },
    {
        id: 'prov-3',
        name: 'Dr. Lisa Thompson',
        specialty: 'Psychiatry',
        role: 'mental',
        practice: 'Behavioral Health Partners',
        address: '789 Wellness Blvd, Suite 100',
        phone: '(555) 456-7890',
        rating: 4.9,
        reviewCount: 156,
        nextAppointment: '2024-02-01T14:00:00Z',
        acceptingNewPatients: true,
        inNetwork: true
    },
    {
        id: 'prov-4',
        name: 'Dr. James Wilson',
        specialty: 'Optometry',
        role: 'vision',
        practice: 'Clear Vision Eye Care',
        address: '321 Eye Street',
        phone: '(555) 789-0123',
        rating: 4.7,
        reviewCount: 98,
        lastVisit: '2023-09-10',
        acceptingNewPatients: true,
        inNetwork: true
    }
]

// Specialty tag color mapping
const specialtyColors: Record<string, { bg: string; text: string; border: string }> = {
    'Family Medicine': { bg: 'rgba(6,182,212,0.12)', text: '#22d3ee', border: 'rgba(6,182,212,0.3)' },
    'Cardiology': { bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
    'Psychiatry': { bg: 'rgba(168,85,247,0.12)', text: '#c084fc', border: 'rgba(168,85,247,0.3)' },
    'Optometry': { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' },
    'Dental': { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
    'default': { bg: 'rgba(99,102,241,0.12)', text: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
}

export function CareTeam() {
    const [careTeam] = useState<CareProvider[]>(mockCareTeam)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    if (loading) return <PageSkeleton />

    // Search filter logic
    const filteredTeam = careTeam.filter(p => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return p.name.toLowerCase().includes(q) || p.specialty.toLowerCase().includes(q) || p.practice.toLowerCase().includes(q)
    })
    const filteredPrimaryCare = filteredTeam.find(p => p.role === 'primary')
    const filteredSpecialists = filteredTeam.filter(p => p.role !== 'primary')

    const getSpecialtyStyle = (specialty: string) => specialtyColors[specialty] || specialtyColors['default']

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const formatDateTime = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

    const getRoleIcon = (role: CareProvider['role']) => {
        switch (role) {
            case 'primary': return <Stethoscope size={20} />
            case 'specialist': return <Heart size={20} />
            case 'mental': return <Brain size={20} />
            case 'dental': return <Activity size={20} />
            case 'vision': return <Eye size={20} />
            case 'pharmacy': return <Pill size={20} />
        }
    }

    const getRoleLabel = (role: CareProvider['role']) => {
        switch (role) {
            case 'primary': return 'Primary Care'
            case 'specialist': return 'Specialist'
            case 'mental': return 'Mental Health'
            case 'dental': return 'Dental'
            case 'vision': return 'Vision'
            case 'pharmacy': return 'Pharmacy'
        }
    }

    return (
        <div className="care-team-page">
            {/* Header */}
            <div className="care-team__header">
                <div>
                    <h1 className="care-team__title">My Care Team</h1>
                    <p className="care-team__subtitle">
                        Your healthcare providers all in one place
                    </p>
                </div>
                <div className="care-team__actions">
                    <Button variant="primary" icon={<User size={16} />}>
                        Add Provider
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'flex', gap: '0.75rem', alignItems: 'center',
                    padding: '0.85rem 1.25rem', borderRadius: '16px', marginBottom: '1.5rem',
                    background: '#FFFFFF', border: '1px solid #E5E7EB'
                }}
            >
                <Search size={16} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                <input
                    type="text"
                    placeholder="Search by name, specialty, or practice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        flex: 1, padding: '0.35rem 0', border: 'none', background: 'transparent',
                        color: '#111827', fontSize: '0.85rem', outline: 'none'
                    }}
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{
                        background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex', padding: '4px'
                    }}>
                        <X size={14} />
                    </button>
                )}
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                    {filteredTeam.length} provider{filteredTeam.length !== 1 ? 's' : ''}
                </span>
            </motion.div>

            {/* Primary Care */}
            {filteredPrimaryCare && (
                <GlassCard className="primary-provider-card">
                    <div className="primary-provider-card__badge">
                        <Badge variant="teal">Primary Care Provider</Badge>
                    </div>
                    <div className="primary-provider-card__content">
                        <div className="primary-provider-card__avatar">
                            <Stethoscope size={32} />
                        </div>
                        <div className="primary-provider-card__info">
                            <h2>{filteredPrimaryCare.name}</h2>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.35rem 0' }}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                    padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 500,
                                    background: getSpecialtyStyle(filteredPrimaryCare.specialty).bg,
                                    color: getSpecialtyStyle(filteredPrimaryCare.specialty).text,
                                    border: `1px solid ${getSpecialtyStyle(filteredPrimaryCare.specialty).border}`
                                }}>
                                    <Stethoscope size={10} /> {filteredPrimaryCare.specialty}
                                </span>
                                {filteredPrimaryCare.acceptingNewPatients && (
                                    <span style={{
                                        display: 'inline-flex', padding: '0.2rem 0.6rem', borderRadius: '6px',
                                        fontSize: '0.72rem', fontWeight: 500, background: 'rgba(34,197,94,0.1)',
                                        color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)'
                                    }}>Accepting Patients</span>
                                )}
                            </div>
                            <span className="primary-provider-card__practice">{filteredPrimaryCare.practice}</span>
                            <div className="primary-provider-card__rating">
                                <Star size={14} fill="currentColor" />
                                {filteredPrimaryCare.rating} ({filteredPrimaryCare.reviewCount} reviews)
                            </div>
                        </div>
                        <div className="primary-provider-card__contact">
                            <a href={`tel:${filteredPrimaryCare.phone}`} className="contact-item">
                                <Phone size={16} /> {filteredPrimaryCare.phone}
                            </a>
                            <span className="contact-item">
                                <MapPin size={16} /> {filteredPrimaryCare.address}
                            </span>
                        </div>
                        <div className="primary-provider-card__actions">
                            <Button variant="primary" icon={<Calendar size={14} />}>
                                Schedule
                            </Button>
                            <Button variant="secondary" icon={<MessageSquare size={14} />}>
                                Message
                            </Button>
                            <Button variant="ghost" icon={<Phone size={14} />}>
                                Call
                            </Button>
                        </div>
                    </div>
                    {filteredPrimaryCare.nextAppointment && (
                        <div className="primary-provider-card__next-apt">
                            <Calendar size={16} />
                            <span>Next appointment: {formatDateTime(filteredPrimaryCare.nextAppointment)}</span>
                        </div>
                    )}
                </GlassCard>
            )}

            {/* Specialists Grid */}
            <h3 className="care-team__section-title">Specialists & Other Providers</h3>
            {filteredSpecialists.length === 0 && !filteredPrimaryCare && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                    textAlign: 'center', padding: '2.5rem', color: '#9CA3AF', borderRadius: '16px',
                    background: '#F9FAFB', border: '1px solid #E5E7EB', marginBottom: '1.5rem'
                }}>
                    <Search size={28} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>No providers match "{searchQuery}"</p>
                    <button onClick={() => setSearchQuery('')} style={{
                        marginTop: '0.5rem', background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.85rem'
                    }}>Clear search</button>
                </motion.div>
            )}
            <div className="specialists-grid">
                {filteredSpecialists.map((provider, index) => (
                    <motion.div
                        key={provider.id}
                        className="provider-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="provider-card__header">
                            <div className="provider-card__avatar">
                                {getRoleIcon(provider.role)}
                            </div>
                            <div className="provider-card__badges">
                                <Badge variant="info" size="sm">{getRoleLabel(provider.role)}</Badge>
                                {provider.inNetwork && (
                                    <Badge variant="success" size="sm">In-Network</Badge>
                                )}
                            </div>
                        </div>
                        <div className="provider-card__info">
                            <h4>{provider.name}</h4>
                            {/* Specialty Tag */}
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                padding: '0.15rem 0.5rem', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 500,
                                background: getSpecialtyStyle(provider.specialty).bg,
                                color: getSpecialtyStyle(provider.specialty).text,
                                border: `1px solid ${getSpecialtyStyle(provider.specialty).border}`,
                                margin: '0.3rem 0'
                            }}>
                                {getRoleIcon(provider.role) && <span style={{ display: 'flex' }}>{(() => { switch(provider.role) { case 'specialist': return <Heart size={9} />; case 'mental': return <Brain size={9} />; case 'vision': return <Eye size={9} />; default: return null } })()}</span>}
                                {provider.specialty}
                            </span>
                            <span className="provider-card__practice">{provider.practice}</span>
                        </div>
                        <div className="provider-card__rating">
                            <Star size={12} fill="currentColor" />
                            {provider.rating} ({provider.reviewCount})
                        </div>
                        <div className="provider-card__contact">
                            <span><Phone size={14} /> {provider.phone}</span>
                        </div>
                        {provider.lastVisit && (
                            <div className="provider-card__last-visit">
                                Last visit: {formatDate(provider.lastVisit)}
                            </div>
                        )}
                        <div className="provider-card__actions" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <Button variant="secondary" size="sm" icon={<MessageSquare size={13} />}>
                                Message
                            </Button>
                            <Button variant="primary" size="sm" icon={<Calendar size={13} />}>
                                Schedule
                            </Button>
                        </div>
                    </motion.div>
                ))}

                {/* Add Provider Card */}
                <motion.button
                    className="add-provider-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: filteredSpecialists.length * 0.1 }}
                >
                    <User size={32} />
                    <span>Add a Provider</span>
                    <ChevronRight size={16} />
                </motion.button>
            </div>

            {/* Care Reminders */}
            <GlassCard className="care-reminders">
                <h3>Care Reminders</h3>
                <div className="care-reminders__list">
                    <div className="care-reminder">
                        <div className="care-reminder__icon care-reminder__icon--warning">
                            <Activity size={16} />
                        </div>
                        <div className="care-reminder__info">
                            <span className="care-reminder__title">Annual Physical Due</span>
                            <span className="care-reminder__desc">Schedule with Dr. Chen</span>
                        </div>
                        <Button variant="secondary" size="sm">Schedule</Button>
                    </div>
                    <div className="care-reminder">
                        <div className="care-reminder__icon care-reminder__icon--success">
                            <Eye size={16} />
                        </div>
                        <div className="care-reminder__info">
                            <span className="care-reminder__title">Eye Exam Complete</span>
                            <span className="care-reminder__desc">Next due: September 2024</span>
                        </div>
                        <Badge variant="success" size="sm">Up to Date</Badge>
                    </div>
                </div>
            </GlassCard>
        </div>
    )
}

export default CareTeam
