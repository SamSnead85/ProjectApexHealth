import { useState } from 'react'
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
    ChevronRight
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
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

export function CareTeam() {
    const [careTeam] = useState<CareProvider[]>(mockCareTeam)

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

    const primaryCare = careTeam.find(p => p.role === 'primary')
    const specialists = careTeam.filter(p => p.role !== 'primary')

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

            {/* Primary Care */}
            {primaryCare && (
                <GlassCard className="primary-provider-card">
                    <div className="primary-provider-card__badge">
                        <Badge variant="teal">Primary Care Provider</Badge>
                    </div>
                    <div className="primary-provider-card__content">
                        <div className="primary-provider-card__avatar">
                            <Stethoscope size={32} />
                        </div>
                        <div className="primary-provider-card__info">
                            <h2>{primaryCare.name}</h2>
                            <span className="primary-provider-card__specialty">{primaryCare.specialty}</span>
                            <span className="primary-provider-card__practice">{primaryCare.practice}</span>
                            <div className="primary-provider-card__rating">
                                <Star size={14} fill="currentColor" />
                                {primaryCare.rating} ({primaryCare.reviewCount} reviews)
                            </div>
                        </div>
                        <div className="primary-provider-card__contact">
                            <a href={`tel:${primaryCare.phone}`} className="contact-item">
                                <Phone size={16} /> {primaryCare.phone}
                            </a>
                            <span className="contact-item">
                                <MapPin size={16} /> {primaryCare.address}
                            </span>
                        </div>
                        <div className="primary-provider-card__actions">
                            <Button variant="secondary" icon={<Calendar size={14} />}>
                                Schedule
                            </Button>
                            <Button variant="secondary" icon={<MessageSquare size={14} />}>
                                Message
                            </Button>
                        </div>
                    </div>
                    {primaryCare.nextAppointment && (
                        <div className="primary-provider-card__next-apt">
                            <Calendar size={16} />
                            <span>Next appointment: {formatDateTime(primaryCare.nextAppointment)}</span>
                        </div>
                    )}
                </GlassCard>
            )}

            {/* Specialists Grid */}
            <h3 className="care-team__section-title">Specialists & Other Providers</h3>
            <div className="specialists-grid">
                {specialists.map((provider, index) => (
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
                            <span className="provider-card__specialty">{provider.specialty}</span>
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
                        <div className="provider-card__actions">
                            <Button variant="ghost" size="sm" icon={<Calendar size={14} />}>
                                Schedule
                            </Button>
                            <Button variant="ghost" size="sm" icon={<MessageSquare size={14} />}>
                                Message
                            </Button>
                        </div>
                    </motion.div>
                ))}

                {/* Add Provider Card */}
                <motion.button
                    className="add-provider-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: specialists.length * 0.1 }}
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
