import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    MapPin,
    Star,
    Phone,
    Calendar,
    Video,
    Heart,
    Filter,
    Grid,
    List,
    ChevronRight,
    Clock,
    CheckCircle2,
    Shield,
    Navigation,
    Building2
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './ProviderSearch.css'

// Provider type
interface Provider {
    id: string
    name: string
    title: string
    specialty: string
    practice: string
    address: string
    distance: number
    rating: number
    reviewCount: number
    acceptingNew: boolean
    inNetwork: boolean
    telehealth: boolean
    nextAvailable: string
    languages: string[]
    photo?: string
}

const mockProviders: Provider[] = [
    {
        id: 'p1',
        name: 'Dr. Sarah Chen',
        title: 'MD, FACP',
        specialty: 'Internal Medicine',
        practice: 'Apex Medical Group',
        address: '123 Health Way, Suite 200',
        distance: 1.2,
        rating: 4.9,
        reviewCount: 248,
        acceptingNew: true,
        inNetwork: true,
        telehealth: true,
        nextAvailable: 'Tomorrow, 10:30 AM',
        languages: ['English', 'Mandarin']
    },
    {
        id: 'p2',
        name: 'Dr. Michael Rivera',
        title: 'MD, FACC',
        specialty: 'Cardiology',
        practice: 'Heart & Vascular Institute',
        address: '456 Cardiac Lane',
        distance: 2.8,
        rating: 4.8,
        reviewCount: 189,
        acceptingNew: true,
        inNetwork: true,
        telehealth: true,
        nextAvailable: 'Friday, 2:00 PM',
        languages: ['English', 'Spanish']
    },
    {
        id: 'p3',
        name: 'Dr. Emily Watson',
        title: 'MD',
        specialty: 'Dermatology',
        practice: 'SkinCare Specialists',
        address: '789 Derm Drive',
        distance: 3.5,
        rating: 4.7,
        reviewCount: 156,
        acceptingNew: false,
        inNetwork: true,
        telehealth: false,
        nextAvailable: 'Next Week',
        languages: ['English']
    },
    {
        id: 'p4',
        name: 'Dr. James Park',
        title: 'DO',
        specialty: 'Family Medicine',
        practice: 'Community Health Center',
        address: '321 Wellness Blvd',
        distance: 0.8,
        rating: 4.6,
        reviewCount: 312,
        acceptingNew: true,
        inNetwork: true,
        telehealth: true,
        nextAvailable: 'Today, 4:00 PM',
        languages: ['English', 'Korean']
    }
]

const specialties = [
    'All Specialties',
    'Primary Care',
    'Cardiology',
    'Dermatology',
    'Family Medicine',
    'Internal Medicine',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry'
]

export function ProviderSearch() {
    const [searchQuery, setSearchQuery] = useState('')
    const [specialty, setSpecialty] = useState('All Specialties')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [filters, setFilters] = useState({
        acceptingNew: false,
        telehealth: false,
        inNetwork: true
    })

    const filteredProviders = mockProviders.filter(provider => {
        const matchesSearch = searchQuery === '' ||
            provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            provider.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
            provider.practice.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesSpecialty = specialty === 'All Specialties' ||
            provider.specialty === specialty

        const matchesFilters =
            (!filters.acceptingNew || provider.acceptingNew) &&
            (!filters.telehealth || provider.telehealth) &&
            (!filters.inNetwork || provider.inNetwork)

        return matchesSearch && matchesSpecialty && matchesFilters
    })

    return (
        <div className="provider-search">
            {/* Search Header */}
            <div className="provider-search__header">
                <h1>Find a Provider</h1>
                <p>Search our network of trusted healthcare professionals</p>
            </div>

            {/* Search Bar */}
            <GlassCard className="provider-search__bar">
                <div className="search-field">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Doctor name, specialty, or condition"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="location-field">
                    <MapPin size={20} />
                    <input
                        type="text"
                        placeholder="Location or ZIP code"
                        defaultValue="San Francisco, CA"
                    />
                </div>
                <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="specialty-select"
                >
                    {specialties.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <Button variant="primary">Search</Button>
            </GlassCard>

            {/* Filters */}
            <div className="provider-search__controls">
                <div className="quick-filters">
                    <button
                        className={`filter-chip ${filters.inNetwork ? 'active' : ''}`}
                        onClick={() => setFilters(f => ({ ...f, inNetwork: !f.inNetwork }))}
                    >
                        <Shield size={14} />
                        In-Network
                    </button>
                    <button
                        className={`filter-chip ${filters.acceptingNew ? 'active' : ''}`}
                        onClick={() => setFilters(f => ({ ...f, acceptingNew: !f.acceptingNew }))}
                    >
                        <CheckCircle2 size={14} />
                        Accepting New Patients
                    </button>
                    <button
                        className={`filter-chip ${filters.telehealth ? 'active' : ''}`}
                        onClick={() => setFilters(f => ({ ...f, telehealth: !f.telehealth }))}
                    >
                        <Video size={14} />
                        Telehealth Available
                    </button>
                </div>
                <div className="view-toggle">
                    <button
                        className={viewMode === 'grid' ? 'active' : ''}
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid size={18} />
                    </button>
                    <button
                        className={viewMode === 'list' ? 'active' : ''}
                        onClick={() => setViewMode('list')}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Results Count */}
            <div className="provider-search__results-header">
                <h3>{filteredProviders.length} providers found</h3>
                <span>Sorted by: Distance</span>
            </div>

            {/* Provider Grid */}
            <div className={`provider-grid ${viewMode === 'list' ? 'provider-grid--list' : ''}`}>
                {filteredProviders.map((provider, index) => (
                    <motion.div
                        key={provider.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <GlassCard className="provider-card">
                            <div className="provider-card__header">
                                <div className="provider-avatar">
                                    {provider.photo ? (
                                        <img src={provider.photo} alt={provider.name} />
                                    ) : (
                                        <span>{provider.name.split(' ').map(n => n[0]).join('')}</span>
                                    )}
                                </div>
                                <div className="provider-card__info">
                                    <h3>{provider.name}, {provider.title}</h3>
                                    <p className="specialty">{provider.specialty}</p>
                                    <div className="provider-meta">
                                        <span className="rating">
                                            <Star size={14} />
                                            {provider.rating} ({provider.reviewCount})
                                        </span>
                                        <span className="distance">
                                            <Navigation size={14} />
                                            {provider.distance} mi
                                        </span>
                                    </div>
                                </div>
                                <button className="favorite-btn">
                                    <Heart size={20} />
                                </button>
                            </div>

                            <div className="provider-card__details">
                                <div className="detail">
                                    <Building2 size={14} />
                                    <span>{provider.practice}</span>
                                </div>
                                <div className="detail">
                                    <MapPin size={14} />
                                    <span>{provider.address}</span>
                                </div>
                                <div className="detail">
                                    <Clock size={14} />
                                    <span>Next Available: {provider.nextAvailable}</span>
                                </div>
                            </div>

                            <div className="provider-card__badges">
                                {provider.inNetwork && (
                                    <Badge variant="success" size="sm">In-Network</Badge>
                                )}
                                {provider.acceptingNew && (
                                    <Badge variant="teal" size="sm">Accepting New</Badge>
                                )}
                                {provider.telehealth && (
                                    <Badge variant="purple" size="sm">Telehealth</Badge>
                                )}
                            </div>

                            <div className="provider-card__actions">
                                <Button variant="secondary" size="sm" icon={<Phone size={14} />}>
                                    Call
                                </Button>
                                <Button variant="primary" size="sm" icon={<Calendar size={14} />}>
                                    Schedule
                                </Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default ProviderSearch
