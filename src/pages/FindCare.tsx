import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    MapPin,
    Phone,
    Navigation,
    Star,
    Heart,
    Filter,
    Check,
    Calendar,
    Clock,
    ChevronRight,
    X,
    Video,
    MessageSquare,
    User,
    Stethoscope,
    Brain,
    Eye
} from 'lucide-react'
import { GlassCard, Badge, Button, PageSkeleton } from '../components/common'
import './FindCare.css'

interface Provider {
    id: string
    name: string
    specialty: string
    practice: string
    distance: string
    nextAvailable: string
    inNetwork: boolean
    rating: number
    reviewCount: number
    isFavorite?: boolean
}

interface CareTeamMember {
    id: string
    name: string
    role: string
    specialty: string
    icon: React.ReactNode
    lastVisit: string
    nextVisit?: string
    avatarColor: string
}

interface TimeSlot {
    time: string
    available: boolean
}

// Filter categories
const filterCategories = [
    'All',
    'Primary Care',
    'Dermatology',
    'Cardiology',
    'Orthopedics',
    'Mental Health',
    'Pediatrics',
    'OB/GYN'
]

// Mock providers
const mockProviders: Provider[] = [
    {
        id: '1',
        name: 'Dr. Emily Chen',
        specialty: 'Primary Care',
        practice: 'QuantOS Health Partners',
        distance: '0.8 mi',
        nextAvailable: 'Tomorrow, 10:00 AM',
        inNetwork: true,
        rating: 4.9,
        reviewCount: 234,
        isFavorite: true,
    },
    {
        id: '2',
        name: 'Dr. Michael Torres',
        specialty: 'Dermatology',
        practice: 'SkinCare Specialists',
        distance: '1.2 mi',
        nextAvailable: 'Jan 25, 2:30 PM',
        inNetwork: true,
        rating: 4.8,
        reviewCount: 189,
    },
    {
        id: '3',
        name: 'Dr. Sarah Williams',
        specialty: 'Cardiology',
        practice: 'Heart Health Center',
        distance: '2.1 mi',
        nextAvailable: 'Jan 26, 9:00 AM',
        inNetwork: true,
        rating: 4.7,
        reviewCount: 156,
    },
    {
        id: '4',
        name: 'Dr. James Park',
        specialty: 'Orthopedics',
        practice: 'Joint & Spine Institute',
        distance: '3.4 mi',
        nextAvailable: 'Jan 28, 11:00 AM',
        inNetwork: true,
        rating: 4.9,
        reviewCount: 312,
    },
    {
        id: '5',
        name: 'Dr. Lisa Martinez',
        specialty: 'Mental Health',
        practice: 'Mindful Wellness Center',
        distance: '1.8 mi',
        nextAvailable: 'Jan 24, 3:00 PM',
        inNetwork: true,
        rating: 4.8,
        reviewCount: 98,
    },
]

// Mock care team
const mockCareTeam: CareTeamMember[] = [
    {
        id: 'ct-1',
        name: 'Dr. Emily Chen',
        role: 'Primary Care Physician',
        specialty: 'Internal Medicine',
        icon: <Stethoscope size={20} />,
        lastVisit: 'Dec 15, 2025',
        nextVisit: 'Mar 15, 2026',
        avatarColor: '#00d2be',
    },
    {
        id: 'ct-2',
        name: 'Dr. Sarah Williams',
        role: 'Specialist',
        specialty: 'Cardiology',
        icon: <Heart size={20} />,
        lastVisit: 'Nov 8, 2025',
        nextVisit: 'Feb 20, 2026',
        avatarColor: '#a855f7',
    },
    {
        id: 'ct-3',
        name: 'Dr. Lisa Martinez',
        role: 'Behavioral Health',
        specialty: 'Psychiatry',
        icon: <Brain size={20} />,
        lastVisit: 'Jan 10, 2026',
        nextVisit: 'Feb 14, 2026',
        avatarColor: '#f59e0b',
    },
    {
        id: 'ct-4',
        name: 'Dr. Rachel Kim',
        role: 'Vision Care',
        specialty: 'Ophthalmology',
        icon: <Eye size={20} />,
        lastVisit: 'Aug 22, 2025',
        avatarColor: '#3b82f6',
    },
]

// Mock appointment time slots
const morningSlots: TimeSlot[] = [
    { time: '8:00 AM', available: false },
    { time: '8:30 AM', available: true },
    { time: '9:00 AM', available: true },
    { time: '9:30 AM', available: false },
    { time: '10:00 AM', available: true },
    { time: '10:30 AM', available: true },
    { time: '11:00 AM', available: false },
    { time: '11:30 AM', available: true },
]

const afternoonSlots: TimeSlot[] = [
    { time: '1:00 PM', available: true },
    { time: '1:30 PM', available: false },
    { time: '2:00 PM', available: true },
    { time: '2:30 PM', available: true },
    { time: '3:00 PM', available: false },
    { time: '3:30 PM', available: true },
    { time: '4:00 PM', available: false },
    { time: '4:30 PM', available: true },
]

export function FindCare() {
    const [loading, setLoading] = useState(true)
    useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t) }, [])
    const [searchQuery, setSearchQuery] = useState('')
    const [location, setLocation] = useState('Tampa, FL')
    const [activeFilter, setActiveFilter] = useState('All')
    const [providers, setProviders] = useState(mockProviders)
    const [showFilters, setShowFilters] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [bookingConfirmed, setBookingConfirmed] = useState(false)

    const filteredProviders = providers.filter(provider => {
        if (activeFilter !== 'All' && provider.specialty !== activeFilter) return false
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
                provider.name.toLowerCase().includes(query) ||
                provider.specialty.toLowerCase().includes(query) ||
                provider.practice.toLowerCase().includes(query)
            )
        }
        return true
    })

    const toggleFavorite = (id: string) => {
        setProviders(providers.map(p =>
            p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
        ))
    }

    const handleBookAppointment = () => {
        if (selectedSlot) {
            setBookingConfirmed(true)
            setTimeout(() => setBookingConfirmed(false), 3000)
        }
    }

    if (loading) return <PageSkeleton />

    return (
        <div className="find-care">
            {/* Header */}
            <div className="find-care__header">
                <div>
                    <h1 className="find-care__title">Find Care</h1>
                    <p className="find-care__subtitle">Search in-network providers near you</p>
                </div>
            </div>

            {/* Virtual Visit + Care Quick Actions */}
            <div className="find-care__quick-actions">
                {/* Virtual Visit Launcher */}
                <motion.div
                    className="find-care__virtual-visit"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="virtual-visit__icon-wrapper">
                        <div className="virtual-visit__icon-pulse" />
                        <Video size={28} />
                    </div>
                    <div className="virtual-visit__info">
                        <h3 className="virtual-visit__title">Start Virtual Visit</h3>
                        <p className="virtual-visit__subtitle">See a provider from the comfort of home</p>
                        <div className="virtual-visit__availability">
                            <span className="virtual-visit__dot" />
                            <span>Next Available: <strong>In 10 minutes</strong></span>
                        </div>
                    </div>
                    <div className="virtual-visit__action">
                        <Button variant="primary" icon={<Video size={16} />}>
                            Launch Visit
                        </Button>
                        <span className="virtual-visit__cost">$0 copay</span>
                    </div>
                </motion.div>
            </div>

            {/* My Care Team Dashboard */}
            <div className="find-care__care-team-section">
                <div className="find-care__section-header">
                    <h2 className="find-care__section-title">My Care Team</h2>
                    <Button variant="ghost" size="sm" icon={<ChevronRight size={14} />}>
                        View All
                    </Button>
                </div>
                <div className="care-team__grid">
                    {mockCareTeam.map((member, index) => (
                        <motion.div
                            key={member.id}
                            className="care-team__card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                        >
                            <div className="care-team__card-top">
                                <div
                                    className="care-team__avatar"
                                    style={{ background: `${member.avatarColor}20`, color: member.avatarColor }}
                                >
                                    {member.icon}
                                </div>
                                <div className="care-team__member-info">
                                    <h4 className="care-team__name">{member.name}</h4>
                                    <span className="care-team__role">{member.role}</span>
                                    <span className="care-team__specialty">{member.specialty}</span>
                                </div>
                            </div>
                            <div className="care-team__visits">
                                <div className="care-team__visit-item">
                                    <span className="care-team__visit-label">Last Visit</span>
                                    <span className="care-team__visit-date">{member.lastVisit}</span>
                                </div>
                                {member.nextVisit && (
                                    <div className="care-team__visit-item">
                                        <span className="care-team__visit-label">Next Visit</span>
                                        <span className="care-team__visit-date care-team__visit-date--upcoming">{member.nextVisit}</span>
                                    </div>
                                )}
                            </div>
                            <div className="care-team__actions">
                                <Button variant="secondary" size="sm" icon={<MessageSquare size={14} />}>
                                    Message
                                </Button>
                                <Button variant="ghost" size="sm" icon={<Calendar size={14} />}>
                                    Schedule
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Appointment Booking UI */}
            <div className="find-care__booking-section">
                <div className="find-care__section-header">
                    <h2 className="find-care__section-title">Book an Appointment</h2>
                    <Badge variant="info">Dr. Emily Chen &mdash; Primary Care</Badge>
                </div>
                <GlassCard className="booking__card">
                    <div className="booking__date-header">
                        <Calendar size={18} />
                        <span className="booking__date-label">Available Slots &mdash; Tomorrow, Feb 10</span>
                    </div>

                    {/* Morning Slots */}
                    <div className="booking__period">
                        <span className="booking__period-label">Morning</span>
                        <div className="booking__slots-grid">
                            {morningSlots.map(slot => (
                                <button
                                    key={slot.time}
                                    className={`booking__slot ${!slot.available ? 'booking__slot--unavailable' : ''} ${selectedSlot === slot.time ? 'booking__slot--selected' : ''}`}
                                    disabled={!slot.available}
                                    onClick={() => setSelectedSlot(slot.time)}
                                >
                                    {slot.time}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Afternoon Slots */}
                    <div className="booking__period">
                        <span className="booking__period-label">Afternoon</span>
                        <div className="booking__slots-grid">
                            {afternoonSlots.map(slot => (
                                <button
                                    key={slot.time}
                                    className={`booking__slot ${!slot.available ? 'booking__slot--unavailable' : ''} ${selectedSlot === slot.time ? 'booking__slot--selected' : ''}`}
                                    disabled={!slot.available}
                                    onClick={() => setSelectedSlot(slot.time)}
                                >
                                    {slot.time}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Booking Footer */}
                    <div className="booking__footer">
                        <div className="booking__selected-info">
                            {selectedSlot ? (
                                <>
                                    <Clock size={14} />
                                    <span>Selected: <strong>{selectedSlot}</strong> with Dr. Emily Chen</span>
                                </>
                            ) : (
                                <span className="booking__hint">Select a time slot to book</span>
                            )}
                        </div>
                        <AnimatePresence>
                            {bookingConfirmed ? (
                                <motion.div
                                    className="booking__confirmed"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Check size={16} />
                                    <span>Appointment Confirmed!</span>
                                </motion.div>
                            ) : (
                                <Button
                                    variant="primary"
                                    icon={<Calendar size={14} />}
                                    onClick={handleBookAppointment}
                                    disabled={!selectedSlot}
                                >
                                    Book Appointment
                                </Button>
                            )}
                        </AnimatePresence>
                    </div>
                </GlassCard>
            </div>

            {/* Search Bar */}
            <div className="find-care__search-section">
                <div className="find-care__search-bar">
                    <div className="find-care__search-input">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, specialty, or condition..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="find-care__search-divider" />
                    <div className="find-care__location-input">
                        <MapPin size={18} />
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="ghost"
                        icon={<Filter size={16} />}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filters
                    </Button>
                </div>

                {/* Filter Chips */}
                <div className="find-care__filters">
                    {filterCategories.map(filter => (
                        <button
                            key={filter}
                            className={`find-care__filter-chip ${activeFilter === filter ? 'find-care__filter-chip--active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Provider List */}
            <div className="find-care__providers">
                <AnimatePresence>
                    {filteredProviders.map((provider, index) => (
                        <motion.div
                            key={provider.id}
                            className="find-care__provider"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            {/* Favorite Button */}
                            <button
                                className={`find-care__favorite ${provider.isFavorite ? 'find-care__favorite--active' : ''}`}
                                onClick={() => toggleFavorite(provider.id)}
                            >
                                <Heart size={18} fill={provider.isFavorite ? 'currentColor' : 'none'} />
                            </button>

                            {/* Provider Info */}
                            <div className="find-care__provider-info">
                                <div className="find-care__provider-header">
                                    <h3 className="find-care__provider-name">{provider.name}</h3>
                                    <div className="find-care__provider-rating">
                                        <Star size={14} fill="currentColor" />
                                        <span>{provider.rating}</span>
                                        <span className="find-care__review-count">({provider.reviewCount})</span>
                                    </div>
                                </div>

                                <div className="find-care__provider-details">
                                    <span className="find-care__specialty">{provider.specialty}</span>
                                    <span className="find-care__practice">{provider.practice}</span>
                                </div>

                                <div className="find-care__provider-meta">
                                    <span className="find-care__distance">
                                        <MapPin size={12} /> {provider.distance}
                                    </span>
                                    <span className="find-care__availability">
                                        <Clock size={12} /> {provider.nextAvailable}
                                    </span>
                                    {provider.inNetwork && (
                                        <Badge variant="success" size="sm" icon={<Check size={10} />}>
                                            In-Network
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="find-care__provider-actions">
                                <Button variant="primary" size="sm" icon={<Calendar size={14} />}>
                                    Book Appointment
                                </Button>
                                <Button variant="ghost" size="sm" icon={<Phone size={14} />}>
                                    Call
                                </Button>
                                <Button variant="ghost" size="sm" icon={<Navigation size={14} />}>
                                    Directions
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default FindCare
