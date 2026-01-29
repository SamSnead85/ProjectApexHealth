import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User,
    Phone,
    Mail,
    Calendar,
    MapPin,
    Star,
    MessageSquare,
    Video,
    Clock,
    Award,
    ChevronRight,
    Heart,
    Stethoscope,
    Brain,
    Bone,
    Eye
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './CareTeam.css'

// Provider specialties
const specialtyIcons: Record<string, React.ReactNode> = {
    'Primary Care': <Stethoscope size={20} />,
    'Cardiology': <Heart size={20} />,
    'Neurology': <Brain size={20} />,
    'Orthopedics': <Bone size={20} />,
    'Ophthalmology': <Eye size={20} />
}

// Provider data
interface Provider {
    id: string
    name: string
    title: string
    specialty: string
    clinic: string
    address: string
    phone: string
    email: string
    photo?: string
    rating: number
    reviewCount: number
    nextAvailable: string
    acceptingPatients: boolean
    telehealth: boolean
    isPrimary: boolean
}

const careTeam: Provider[] = [
    {
        id: 'dr-1',
        name: 'Dr. Sarah Chen',
        title: 'MD, FACP',
        specialty: 'Primary Care',
        clinic: 'Apex Medical Group',
        address: '1200 Healthcare Blvd, Suite 300',
        phone: '(555) 234-5678',
        email: 'schen@apexmedical.com',
        rating: 4.9,
        reviewCount: 247,
        nextAvailable: 'Tomorrow, 10:30 AM',
        acceptingPatients: true,
        telehealth: true,
        isPrimary: true
    },
    {
        id: 'dr-2',
        name: 'Dr. Michael Rivera',
        title: 'MD, FACC',
        specialty: 'Cardiology',
        clinic: 'Heart & Vascular Institute',
        address: '800 Cardiac Way, Floor 5',
        phone: '(555) 345-6789',
        email: 'mrivera@heartinst.com',
        rating: 4.8,
        reviewCount: 189,
        nextAvailable: 'Friday, 2:00 PM',
        acceptingPatients: true,
        telehealth: true,
        isPrimary: false
    },
    {
        id: 'dr-3',
        name: 'Dr. Emily Watson',
        title: 'DO, FAAN',
        specialty: 'Neurology',
        clinic: 'Neuroscience Center',
        address: '950 Brain Health Dr, Suite 200',
        phone: '(555) 456-7890',
        email: 'ewatson@neurocenter.com',
        rating: 4.7,
        reviewCount: 156,
        nextAvailable: 'Next Monday, 9:00 AM',
        acceptingPatients: true,
        telehealth: false,
        isPrimary: false
    }
]

export function CareTeamWidget() {
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
    const [showAll, setShowAll] = useState(false)

    const displayedProviders = showAll ? careTeam : careTeam.slice(0, 3)

    return (
        <div className="care-team-widget">
            {/* Header */}
            <div className="care-team-header">
                <div className="care-team-header__title">
                    <Stethoscope size={22} className="care-team-header__icon" />
                    <div>
                        <h2>Your Care Team</h2>
                        <p>{careTeam.length} providers managing your care</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" icon={<ChevronRight size={16} />}>
                    Find a Doctor
                </Button>
            </div>

            {/* Provider Cards */}
            <div className="care-team-grid">
                {displayedProviders.map((provider, index) => (
                    <motion.div
                        key={provider.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedProvider(
                            selectedProvider?.id === provider.id ? null : provider
                        )}
                    >
                        <GlassCard className={`provider-card ${selectedProvider?.id === provider.id ? 'selected' : ''} ${provider.isPrimary ? 'primary' : ''}`}>
                            {/* Primary Badge */}
                            {provider.isPrimary && (
                                <Badge variant="teal" size="sm" className="provider-card__primary-badge">
                                    Primary Care
                                </Badge>
                            )}

                            {/* Provider Header */}
                            <div className="provider-card__header">
                                <div className="provider-card__avatar">
                                    {specialtyIcons[provider.specialty] || <User size={24} />}
                                </div>
                                <div className="provider-card__info">
                                    <h3 className="provider-card__name">{provider.name}</h3>
                                    <span className="provider-card__title">{provider.title}</span>
                                    <span className="provider-card__specialty">{provider.specialty}</span>
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="provider-card__rating">
                                <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                                <span className="provider-card__rating-value">{provider.rating}</span>
                                <span className="provider-card__rating-count">({provider.reviewCount} reviews)</span>
                            </div>

                            {/* Availability */}
                            <div className="provider-card__availability">
                                <Clock size={14} />
                                <span>Next: {provider.nextAvailable}</span>
                            </div>

                            {/* Quick Actions */}
                            <div className="provider-card__actions">
                                <button className="provider-action" title="Call">
                                    <Phone size={16} />
                                </button>
                                <button className="provider-action" title="Message">
                                    <MessageSquare size={16} />
                                </button>
                                {provider.telehealth && (
                                    <button className="provider-action provider-action--video" title="Video Visit">
                                        <Video size={16} />
                                    </button>
                                )}
                                <button className="provider-action provider-action--schedule" title="Schedule">
                                    <Calendar size={16} />
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Selected Provider Detail */}
            <AnimatePresence>
                {selectedProvider && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="provider-detail"
                    >
                        <GlassCard>
                            <div className="provider-detail__header">
                                <div className="provider-detail__avatar">
                                    {specialtyIcons[selectedProvider.specialty] || <User size={32} />}
                                </div>
                                <div className="provider-detail__info">
                                    <h3>{selectedProvider.name}</h3>
                                    <p>{selectedProvider.title} • {selectedProvider.specialty}</p>
                                </div>
                                {selectedProvider.acceptingPatients && (
                                    <Badge variant="success" size="sm">Accepting Patients</Badge>
                                )}
                            </div>

                            <div className="provider-detail__grid">
                                <div className="provider-detail__item">
                                    <MapPin size={16} />
                                    <div>
                                        <span className="provider-detail__label">Location</span>
                                        <span className="provider-detail__value">{selectedProvider.clinic}</span>
                                        <span className="provider-detail__subvalue">{selectedProvider.address}</span>
                                    </div>
                                </div>
                                <div className="provider-detail__item">
                                    <Phone size={16} />
                                    <div>
                                        <span className="provider-detail__label">Phone</span>
                                        <span className="provider-detail__value">{selectedProvider.phone}</span>
                                    </div>
                                </div>
                                <div className="provider-detail__item">
                                    <Mail size={16} />
                                    <div>
                                        <span className="provider-detail__label">Email</span>
                                        <span className="provider-detail__value">{selectedProvider.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="provider-detail__actions">
                                <Button variant="primary" icon={<Calendar size={16} />}>
                                    Schedule Appointment
                                </Button>
                                {selectedProvider.telehealth && (
                                    <Button variant="secondary" icon={<Video size={16} />}>
                                        Start Video Visit
                                    </Button>
                                )}
                                <Button variant="ghost" icon={<MessageSquare size={16} />}>
                                    Send Message
                                </Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Show All Toggle */}
            {careTeam.length > 3 && (
                <div className="care-team-footer">
                    <Button
                        variant="ghost"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Show Less' : `View All ${careTeam.length} Providers`}
                    </Button>
                </div>
            )}
        </div>
    )
}

export default CareTeamWidget
