import { useState } from 'react'
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
    X
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
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

export function FindCare() {
    const [searchQuery, setSearchQuery] = useState('')
    const [location, setLocation] = useState('Tampa, FL')
    const [activeFilter, setActiveFilter] = useState('All')
    const [providers, setProviders] = useState(mockProviders)
    const [showFilters, setShowFilters] = useState(false)

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

    return (
        <div className="find-care">
            {/* Header */}
            <div className="find-care__header">
                <div>
                    <h1 className="find-care__title">Find Care</h1>
                    <p className="find-care__subtitle">Search in-network providers near you</p>
                </div>
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
