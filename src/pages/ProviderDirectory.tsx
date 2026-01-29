import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    MapPin,
    Phone,
    Clock,
    Star,
    CheckCircle2,
    AlertCircle,
    Filter,
    ChevronDown,
    Navigation,
    Calendar,
    Users,
    Building2,
    Stethoscope,
    Heart,
    Brain,
    Eye,
    Baby
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './ProviderDirectory.css'

// NUCC Taxonomy Codes for specialty mapping
const SPECIALTY_TAXONOMY = {
    '207R00000X': 'Internal Medicine',
    '207Q00000X': 'Family Medicine',
    '208D00000X': 'General Practice',
    '2084P0800X': 'Psychiatry',
    '207V00000X': 'Obstetrics & Gynecology',
    '208000000X': 'Pediatrics',
    '207X00000X': 'Orthopedic Surgery',
    '207W00000X': 'Ophthalmology',
    '208600000X': 'Surgery',
    '2084N0400X': 'Neurology'
} as const

type NetworkStatus = 'in_network' | 'out_of_network' | 'preferred'
type AcceptingStatus = 'accepting' | 'waitlist' | 'not_accepting'

interface Provider {
    id: string
    npi: string
    name: string
    credentials: string
    specialty: string
    taxonomyCode: string
    networkStatus: NetworkStatus
    acceptingPatients: AcceptingStatus
    gender: 'Male' | 'Female'
    languages: string[]
    rating: number
    reviewCount: number
    address: {
        street: string
        city: string
        state: string
        zip: string
    }
    phone: string
    distance: number
    availability: string
    affiliations: string[]
    boardCertified: boolean
    telehealth: boolean
}

// Mock provider data with FHIR-compatible structure
const mockProviders: Provider[] = [
    {
        id: 'prov-001',
        npi: '1234567890',
        name: 'Dr. Sarah Chen',
        credentials: 'MD, FACP',
        specialty: 'Internal Medicine',
        taxonomyCode: '207R00000X',
        networkStatus: 'preferred',
        acceptingPatients: 'accepting',
        gender: 'Female',
        languages: ['English', 'Mandarin', 'Spanish'],
        rating: 4.9,
        reviewCount: 287,
        address: {
            street: '1250 Medical Center Drive, Suite 400',
            city: 'San Francisco',
            state: 'CA',
            zip: '94115'
        },
        phone: '(415) 555-0123',
        distance: 0.8,
        availability: 'Next available: Tomorrow',
        affiliations: ['UCSF Medical Center', 'Sutter Health'],
        boardCertified: true,
        telehealth: true
    },
    {
        id: 'prov-002',
        npi: '9876543210',
        name: 'Dr. Michael Rodriguez',
        credentials: 'MD, FACS',
        specialty: 'Orthopedic Surgery',
        taxonomyCode: '207X00000X',
        networkStatus: 'in_network',
        acceptingPatients: 'accepting',
        gender: 'Male',
        languages: ['English', 'Spanish'],
        rating: 4.7,
        reviewCount: 156,
        address: {
            street: '500 Parnassus Ave',
            city: 'San Francisco',
            state: 'CA',
            zip: '94143'
        },
        phone: '(415) 555-0456',
        distance: 2.3,
        availability: 'Next available: Jan 30',
        affiliations: ['UCSF Medical Center'],
        boardCertified: true,
        telehealth: false
    },
    {
        id: 'prov-003',
        npi: '5555555555',
        name: 'Dr. Emily Watson',
        credentials: 'MD, PhD',
        specialty: 'Psychiatry',
        taxonomyCode: '2084P0800X',
        networkStatus: 'in_network',
        acceptingPatients: 'waitlist',
        gender: 'Female',
        languages: ['English'],
        rating: 4.8,
        reviewCount: 203,
        address: {
            street: '450 Sutter St, Suite 1200',
            city: 'San Francisco',
            state: 'CA',
            zip: '94108'
        },
        phone: '(415) 555-0789',
        distance: 1.5,
        availability: 'Waitlist: ~2 weeks',
        affiliations: ['California Pacific Medical Center'],
        boardCertified: true,
        telehealth: true
    },
    {
        id: 'prov-004',
        npi: '7777777777',
        name: 'Dr. James Park',
        credentials: 'MD',
        specialty: 'Family Medicine',
        taxonomyCode: '207Q00000X',
        networkStatus: 'out_of_network',
        acceptingPatients: 'accepting',
        gender: 'Male',
        languages: ['English', 'Korean'],
        rating: 4.5,
        reviewCount: 89,
        address: {
            street: '2100 Webster St',
            city: 'San Francisco',
            state: 'CA',
            zip: '94115'
        },
        phone: '(415) 555-1234',
        distance: 3.1,
        availability: 'Next available: Today',
        affiliations: ['Kaiser Permanente'],
        boardCertified: true,
        telehealth: true
    },
    {
        id: 'prov-005',
        npi: '3333333333',
        name: 'Dr. Lisa Thompson',
        credentials: 'MD, FACOG',
        specialty: 'Obstetrics & Gynecology',
        taxonomyCode: '207V00000X',
        networkStatus: 'preferred',
        acceptingPatients: 'accepting',
        gender: 'Female',
        languages: ['English', 'French'],
        rating: 4.9,
        reviewCount: 412,
        address: {
            street: '3838 California St',
            city: 'San Francisco',
            state: 'CA',
            zip: '94118'
        },
        phone: '(415) 555-5678',
        distance: 1.2,
        availability: 'Next available: Jan 28',
        affiliations: ['CPMC', 'UCSF'],
        boardCertified: true,
        telehealth: true
    }
]

const specialtyIcons: Record<string, React.ReactNode> = {
    'Internal Medicine': <Stethoscope size={16} />,
    'Family Medicine': <Users size={16} />,
    'Orthopedic Surgery': <Building2 size={16} />,
    'Psychiatry': <Brain size={16} />,
    'Obstetrics & Gynecology': <Heart size={16} />,
    'Pediatrics': <Baby size={16} />,
    'Ophthalmology': <Eye size={16} />
}

export function ProviderDirectory() {
    const [providers] = useState<Provider[]>(mockProviders)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
    const [selectedNetwork, setSelectedNetwork] = useState<NetworkStatus | 'all'>('all')
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
    const [showFilters, setShowFilters] = useState(false)

    const specialties = [...new Set(providers.map(p => p.specialty))]

    const filteredProviders = providers.filter(provider => {
        const matchesSearch = !searchQuery ||
            provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            provider.specialty.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesSpecialty = selectedSpecialty === 'all' || provider.specialty === selectedSpecialty
        const matchesNetwork = selectedNetwork === 'all' || provider.networkStatus === selectedNetwork
        return matchesSearch && matchesSpecialty && matchesNetwork
    })

    const getNetworkBadge = (status: NetworkStatus) => {
        switch (status) {
            case 'preferred':
                return <Badge variant="teal" icon={<Star size={10} />}>Preferred</Badge>
            case 'in_network':
                return <Badge variant="success" icon={<CheckCircle2 size={10} />}>In-Network</Badge>
            case 'out_of_network':
                return <Badge variant="warning" icon={<AlertCircle size={10} />}>Out-of-Network</Badge>
        }
    }

    const getAcceptingBadge = (status: AcceptingStatus) => {
        switch (status) {
            case 'accepting':
                return <Badge variant="success" size="sm">Accepting Patients</Badge>
            case 'waitlist':
                return <Badge variant="warning" size="sm">Waitlist Only</Badge>
            case 'not_accepting':
                return <Badge variant="critical" size="sm">Not Accepting</Badge>
        }
    }

    return (
        <div className="provider-directory">
            {/* Header */}
            <div className="provider-directory__header">
                <div>
                    <h1 className="provider-directory__title">Provider Directory</h1>
                    <p className="provider-directory__subtitle">
                        CMS-compliant provider search • FHIR Practitioner/Organization API
                    </p>
                </div>
                <Badge variant="info" icon={<CheckCircle2 size={12} />}>
                    NUCC Taxonomy Codes
                </Badge>
            </div>

            {/* Search & Filters */}
            <GlassCard className="provider-directory__search-card">
                <div className="provider-directory__search-row">
                    <div className="provider-directory__search-wrapper">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, specialty, or condition..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="provider-directory__location">
                        <MapPin size={16} />
                        <span>San Francisco, CA 94102</span>
                    </div>
                    <Button
                        variant="secondary"
                        icon={<Filter size={16} />}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filters
                        <ChevronDown size={14} className={showFilters ? 'rotated' : ''} />
                    </Button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            className="provider-directory__filters"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <div className="provider-directory__filter-group">
                                <label>Specialty</label>
                                <select
                                    value={selectedSpecialty}
                                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                                >
                                    <option value="all">All Specialties</option>
                                    {specialties.map(specialty => (
                                        <option key={specialty} value={specialty}>{specialty}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="provider-directory__filter-group">
                                <label>Network Status</label>
                                <select
                                    value={selectedNetwork}
                                    onChange={(e) => setSelectedNetwork(e.target.value as NetworkStatus | 'all')}
                                >
                                    <option value="all">All Networks</option>
                                    <option value="preferred">Preferred</option>
                                    <option value="in_network">In-Network</option>
                                    <option value="out_of_network">Out-of-Network</option>
                                </select>
                            </div>
                            <div className="provider-directory__filter-group">
                                <label>Accepting Patients</label>
                                <select>
                                    <option value="all">Any</option>
                                    <option value="accepting">Accepting New Patients</option>
                                    <option value="telehealth">Offers Telehealth</option>
                                </select>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>

            {/* Results */}
            <div className="provider-directory__results">
                <div className="provider-directory__results-header">
                    <span>{filteredProviders.length} providers found</span>
                    <select className="provider-directory__sort">
                        <option>Sort: Distance</option>
                        <option>Sort: Rating</option>
                        <option>Sort: Availability</option>
                    </select>
                </div>

                <div className="provider-directory__grid">
                    {/* Provider List */}
                    <div className="provider-directory__list">
                        {filteredProviders.map((provider, index) => (
                            <motion.div
                                key={provider.id}
                                className={`provider-card netflix-card ${selectedProvider?.id === provider.id ? 'selected' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedProvider(provider)}
                            >
                                <div className="provider-card__header">
                                    <div className="provider-card__avatar">
                                        {specialtyIcons[provider.specialty] || <Stethoscope size={20} />}
                                    </div>
                                    <div className="provider-card__info">
                                        <h3>{provider.name}</h3>
                                        <span className="provider-card__credentials">{provider.credentials}</span>
                                    </div>
                                    {getNetworkBadge(provider.networkStatus)}
                                </div>

                                <div className="provider-card__specialty">
                                    <span>{provider.specialty}</span>
                                    <span className="provider-card__taxonomy">NUCC: {provider.taxonomyCode}</span>
                                </div>

                                <div className="provider-card__meta">
                                    <div className="provider-card__rating">
                                        <Star size={14} className="star-filled" />
                                        <span>{provider.rating}</span>
                                        <span className="provider-card__reviews">({provider.reviewCount})</span>
                                    </div>
                                    <div className="provider-card__distance">
                                        <Navigation size={14} />
                                        <span>{provider.distance} mi</span>
                                    </div>
                                </div>

                                <div className="provider-card__availability">
                                    <Clock size={14} />
                                    <span>{provider.availability}</span>
                                </div>

                                <div className="provider-card__footer">
                                    {getAcceptingBadge(provider.acceptingPatients)}
                                    {provider.telehealth && (
                                        <Badge variant="info" size="sm">Telehealth</Badge>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Provider Detail */}
                    <AnimatePresence mode="wait">
                        {selectedProvider ? (
                            <motion.div
                                key={selectedProvider.id}
                                className="provider-detail"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <GlassCard className="provider-detail__card">
                                    <div className="provider-detail__header">
                                        <div className="provider-detail__avatar">
                                            {specialtyIcons[selectedProvider.specialty] || <Stethoscope size={24} />}
                                        </div>
                                        <div>
                                            <h2>{selectedProvider.name}</h2>
                                            <span>{selectedProvider.credentials}</span>
                                        </div>
                                    </div>

                                    <div className="provider-detail__badges">
                                        {getNetworkBadge(selectedProvider.networkStatus)}
                                        {selectedProvider.boardCertified && (
                                            <Badge variant="success" size="sm" icon={<CheckCircle2 size={10} />}>
                                                Board Certified
                                            </Badge>
                                        )}
                                        {getAcceptingBadge(selectedProvider.acceptingPatients)}
                                    </div>

                                    <div className="provider-detail__section">
                                        <h4>Specialty</h4>
                                        <p>{selectedProvider.specialty}</p>
                                        <span className="provider-detail__code">NUCC Taxonomy: {selectedProvider.taxonomyCode}</span>
                                    </div>

                                    <div className="provider-detail__section">
                                        <h4>NPI</h4>
                                        <p className="provider-detail__npi">{selectedProvider.npi}</p>
                                    </div>

                                    <div className="provider-detail__section">
                                        <h4>Location</h4>
                                        <p>{selectedProvider.address.street}</p>
                                        <p>{selectedProvider.address.city}, {selectedProvider.address.state} {selectedProvider.address.zip}</p>
                                        <a href="#" className="provider-detail__link">
                                            <MapPin size={14} /> Get Directions
                                        </a>
                                    </div>

                                    <div className="provider-detail__section">
                                        <h4>Contact</h4>
                                        <a href={`tel:${selectedProvider.phone}`} className="provider-detail__phone">
                                            <Phone size={14} /> {selectedProvider.phone}
                                        </a>
                                    </div>

                                    <div className="provider-detail__section">
                                        <h4>Languages</h4>
                                        <div className="provider-detail__languages">
                                            {selectedProvider.languages.map(lang => (
                                                <Badge key={lang} variant="info" size="sm">{lang}</Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="provider-detail__section">
                                        <h4>Hospital Affiliations</h4>
                                        <ul className="provider-detail__affiliations">
                                            {selectedProvider.affiliations.map(aff => (
                                                <li key={aff}><Building2 size={12} /> {aff}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="provider-detail__actions">
                                        <Button variant="primary" icon={<Calendar size={16} />}>
                                            Schedule Appointment
                                        </Button>
                                        {selectedProvider.telehealth && (
                                            <Button variant="secondary">
                                                Book Telehealth
                                            </Button>
                                        )}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="provider-directory__no-selection"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Stethoscope size={48} />
                                <p>Select a provider to view details</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

export default ProviderDirectory
