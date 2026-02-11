import { useState, useMemo, useEffect } from 'react'
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
    Baby,
    Globe,
    Video,
    Sparkles,
    Moon,
    Sun,
    X,
    Sliders
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import { useToast } from '../components/common/Toast'
import './ProviderDirectory.css'

// ============================================================================
// ROLE-BASED ACCESS PATTERN
// This module supports: Member (primary), Provider (secondary), Admin (full)
// Future RBAC: Export role checks for integration
// ============================================================================
export type UserRole = 'member' | 'provider' | 'admin' | 'broker'

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
    eveningHours: boolean
    weekendHours: boolean
}

// Extended mock provider data with new fields
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
        telehealth: true,
        eveningHours: true,
        weekendHours: false
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
        telehealth: false,
        eveningHours: false,
        weekendHours: true
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
        telehealth: true,
        eveningHours: true,
        weekendHours: true
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
        telehealth: true,
        eveningHours: false,
        weekendHours: false
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
        telehealth: true,
        eveningHours: true,
        weekendHours: true
    },
    {
        id: 'prov-006',
        npi: '4444444444',
        name: 'Dr. Ahmed Hassan',
        credentials: 'MD, FAAP',
        specialty: 'Pediatrics',
        taxonomyCode: '208000000X',
        networkStatus: 'in_network',
        acceptingPatients: 'accepting',
        gender: 'Male',
        languages: ['English', 'Arabic', 'French'],
        rating: 4.8,
        reviewCount: 324,
        address: {
            street: '2200 Post Street',
            city: 'San Francisco',
            state: 'CA',
            zip: '94115'
        },
        phone: '(415) 555-9876',
        distance: 1.8,
        availability: 'Next available: Tomorrow',
        affiliations: ['UCSF Benioff Children\'s Hospital'],
        boardCertified: true,
        telehealth: true,
        eveningHours: true,
        weekendHours: true
    }
]

// Get all unique languages from providers
const allLanguages = [...new Set(mockProviders.flatMap(p => p.languages))].sort()

const specialtyIcons: Record<string, React.ReactNode> = {
    'Internal Medicine': <Stethoscope size={16} />,
    'Family Medicine': <Users size={16} />,
    'Orthopedic Surgery': <Building2 size={16} />,
    'Psychiatry': <Brain size={16} />,
    'Obstetrics & Gynecology': <Heart size={16} />,
    'Pediatrics': <Baby size={16} />,
    'Ophthalmology': <Eye size={16} />
}

// ============================================================================
// AI MATCH SCORING ALGORITHM
// Calculates personalized match score based on member preferences
// ============================================================================
interface MatchPreferences {
    preferredLanguage: string | null
    preferredGender: 'Male' | 'Female' | null
    requiresTelehealth: boolean
    requiresEveningHours: boolean
    requiresWeekendHours: boolean
}

function calculateMatchScore(provider: Provider, preferences: MatchPreferences): number {
    let score = 50 // Base score

    // Distance factor (closer = better, max 20 points)
    score += Math.max(0, 20 - (provider.distance * 4))

    // Rating factor (max 15 points)
    score += (provider.rating / 5) * 15

    // Network status bonus
    if (provider.networkStatus === 'preferred') score += 10
    else if (provider.networkStatus === 'in_network') score += 5

    // Accepting patients bonus
    if (provider.acceptingPatients === 'accepting') score += 5

    // Language match (exact match = 10 points)
    if (preferences.preferredLanguage && provider.languages.includes(preferences.preferredLanguage)) {
        score += 10
    }

    // Gender match
    if (preferences.preferredGender && provider.gender === preferences.preferredGender) {
        score += 8
    }

    // Telehealth requirement
    if (preferences.requiresTelehealth && provider.telehealth) {
        score += 7
    } else if (preferences.requiresTelehealth && !provider.telehealth) {
        score -= 15 // Penalty if required but not available
    }

    // Evening hours
    if (preferences.requiresEveningHours && provider.eveningHours) {
        score += 5
    } else if (preferences.requiresEveningHours && !provider.eveningHours) {
        score -= 10
    }

    // Weekend hours
    if (preferences.requiresWeekendHours && provider.weekendHours) {
        score += 5
    } else if (preferences.requiresWeekendHours && !provider.weekendHours) {
        score -= 10
    }

    // Board certified bonus
    if (provider.boardCertified) score += 3

    // Normalize to 0-100
    return Math.min(100, Math.max(0, score))
}

function getMatchLabel(score: number): { label: string; variant: 'teal' | 'success' | 'warning' | 'info' } {
    if (score >= 85) return { label: 'Best Match', variant: 'teal' }
    if (score >= 70) return { label: 'Great Fit', variant: 'success' }
    if (score >= 55) return { label: 'Good Match', variant: 'info' }
    return { label: 'Match', variant: 'warning' }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function ProviderDirectory() {
    const { addToast } = useToast()
    const [providers, setProviders] = useState<Provider[]>(mockProviders)
    const [compareList, setCompareList] = useState<string[]>([])

    // Fetch providers from API with mock fallback
    useEffect(() => {
        if (!API_BASE) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/v1/providers?limit=50`);
                if (!res.ok) return;
                const data = await res.json();
                if (data.data?.length) setProviders(data.data);
            } catch { /* use mock data */ }
        })();
    }, []);
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
    const [selectedNetwork, setSelectedNetwork] = useState<NetworkStatus | 'all'>('all')
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
    const [showFilters, setShowFilters] = useState(false)
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

    // Smart Match preferences
    const [preferredLanguage, setPreferredLanguage] = useState<string>('')
    const [preferredGender, setPreferredGender] = useState<'Male' | 'Female' | ''>('')
    const [requiresTelehealth, setRequiresTelehealth] = useState(false)
    const [requiresEveningHours, setRequiresEveningHours] = useState(false)
    const [requiresWeekendHours, setRequiresWeekendHours] = useState(false)
    const [sortBy, setSortBy] = useState<'match' | 'distance' | 'rating'>('match')

    // Current role context (will be provided by auth context in production)
    const [currentRole] = useState<UserRole>('member')

    const specialties = [...new Set(providers.map(p => p.specialty))]

    // Build match preferences object
    const matchPreferences: MatchPreferences = useMemo(() => ({
        preferredLanguage: preferredLanguage || null,
        preferredGender: preferredGender || null,
        requiresTelehealth,
        requiresEveningHours,
        requiresWeekendHours
    }), [preferredLanguage, preferredGender, requiresTelehealth, requiresEveningHours, requiresWeekendHours])

    // Check if any smart filters are active
    const hasActiveSmartFilters = preferredLanguage || preferredGender || requiresTelehealth || requiresEveningHours || requiresWeekendHours

    // Filter and sort providers with match scores
    const filteredProviders = useMemo(() => {
        let result = providers.filter(provider => {
            const matchesSearch = !searchQuery ||
                provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                provider.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                provider.languages.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
            const matchesSpecialty = selectedSpecialty === 'all' || provider.specialty === selectedSpecialty
            const matchesNetwork = selectedNetwork === 'all' || provider.networkStatus === selectedNetwork

            // Smart filters
            const matchesLanguage = !preferredLanguage || provider.languages.includes(preferredLanguage)
            const matchesGender = !preferredGender || provider.gender === preferredGender
            const matchesTelehealth = !requiresTelehealth || provider.telehealth
            const matchesEvening = !requiresEveningHours || provider.eveningHours
            const matchesWeekend = !requiresWeekendHours || provider.weekendHours

            return matchesSearch && matchesSpecialty && matchesNetwork &&
                matchesLanguage && matchesGender && matchesTelehealth &&
                matchesEvening && matchesWeekend
        })

        // Calculate match scores
        const withScores = result.map(provider => ({
            provider,
            matchScore: calculateMatchScore(provider, matchPreferences)
        }))

        // Sort based on selection
        withScores.sort((a, b) => {
            switch (sortBy) {
                case 'match':
                    return b.matchScore - a.matchScore
                case 'distance':
                    return a.provider.distance - b.provider.distance
                case 'rating':
                    return b.provider.rating - a.provider.rating
                default:
                    return b.matchScore - a.matchScore
            }
        })

        return withScores
    }, [providers, searchQuery, selectedSpecialty, selectedNetwork, preferredLanguage,
        preferredGender, requiresTelehealth, requiresEveningHours, requiresWeekendHours,
        matchPreferences, sortBy])

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

    const clearSmartFilters = () => {
        setPreferredLanguage('')
        setPreferredGender('')
        setRequiresTelehealth(false)
        setRequiresEveningHours(false)
        setRequiresWeekendHours(false)
    }

    return (
        <div className="provider-directory">
            {/* Header */}
            <div className="provider-directory__header">
                <div>
                    <h1 className="provider-directory__title">
                        <Sparkles className="provider-directory__title-icon" size={28} />
                        Smart Provider Match
                    </h1>
                    <p className="provider-directory__subtitle">
                        AI-powered personalized provider recommendations • CMS-compliant
                    </p>
                </div>
                <div className="provider-directory__header-badges">
                    <Badge variant="info" icon={<CheckCircle2 size={12} />}>
                        NUCC Taxonomy
                    </Badge>
                    <Badge variant="teal" size="sm">
                        {currentRole === 'member' ? '👤 Member View' :
                            currentRole === 'provider' ? '🩺 Provider View' : '⚙️ Admin View'}
                    </Badge>
                </div>
            </div>

            {/* Search & Filters */}
            <GlassCard className="provider-directory__search-card">
                <div className="provider-directory__search-row">
                    <div className="provider-directory__search-wrapper">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, specialty, language, or condition..."
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
                    <Button
                        variant={showAdvancedFilters ? 'primary' : 'secondary'}
                        icon={<Sliders size={16} />}
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                        Smart Match
                        {hasActiveSmartFilters && <span className="filter-active-dot" />}
                    </Button>
                </div>

                {/* Basic Filters */}
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

                {/* Smart Match Filters */}
                <AnimatePresence>
                    {showAdvancedFilters && (
                        <motion.div
                            className="provider-directory__smart-filters"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <div className="smart-filters__header">
                                <div className="smart-filters__title">
                                    <Sparkles size={16} />
                                    <span>Smart Match Preferences</span>
                                </div>
                                {hasActiveSmartFilters && (
                                    <button className="smart-filters__clear" onClick={clearSmartFilters}>
                                        <X size={14} /> Clear All
                                    </button>
                                )}
                            </div>

                            <div className="smart-filters__grid">
                                <div className="provider-directory__filter-group">
                                    <label><Globe size={14} /> Preferred Language</label>
                                    <select
                                        value={preferredLanguage}
                                        onChange={(e) => setPreferredLanguage(e.target.value)}
                                    >
                                        <option value="">Any Language</option>
                                        {allLanguages.map(lang => (
                                            <option key={lang} value={lang}>{lang}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="provider-directory__filter-group">
                                    <label><Users size={14} /> Provider Gender</label>
                                    <select
                                        value={preferredGender}
                                        onChange={(e) => setPreferredGender(e.target.value as 'Male' | 'Female' | '')}
                                    >
                                        <option value="">No Preference</option>
                                        <option value="Female">Female</option>
                                        <option value="Male">Male</option>
                                    </select>
                                </div>

                                <div className="smart-filters__toggles">
                                    <label className={`smart-toggle ${requiresTelehealth ? 'active' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={requiresTelehealth}
                                            onChange={(e) => setRequiresTelehealth(e.target.checked)}
                                        />
                                        <Video size={14} />
                                        <span>Telehealth</span>
                                    </label>

                                    <label className={`smart-toggle ${requiresEveningHours ? 'active' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={requiresEveningHours}
                                            onChange={(e) => setRequiresEveningHours(e.target.checked)}
                                        />
                                        <Moon size={14} />
                                        <span>Evening</span>
                                    </label>

                                    <label className={`smart-toggle ${requiresWeekendHours ? 'active' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={requiresWeekendHours}
                                            onChange={(e) => setRequiresWeekendHours(e.target.checked)}
                                        />
                                        <Sun size={14} />
                                        <span>Weekend</span>
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>

            {/* Results */}
            <div className="provider-directory__results">
                <div className="provider-directory__results-header">
                    <span>
                        {filteredProviders.length} providers found
                        {hasActiveSmartFilters && <span className="results-ai-badge"><Sparkles size={12} /> AI Ranked</span>}
                    </span>
                    <select
                        className="provider-directory__sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'match' | 'distance' | 'rating')}
                    >
                        <option value="match">Sort: Best Match</option>
                        <option value="distance">Sort: Distance</option>
                        <option value="rating">Sort: Rating</option>
                    </select>
                </div>

                <div className="provider-directory__grid">
                    {/* Provider List */}
                    <div className="provider-directory__list">
                        {filteredProviders.map(({ provider, matchScore }, index) => {
                            const matchInfo = getMatchLabel(matchScore)
                            return (
                                <motion.div
                                    key={provider.id}
                                    className={`provider-card netflix-card ${selectedProvider?.id === provider.id ? 'selected' : ''} ${matchScore >= 85 ? 'best-match' : ''}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedProvider(provider)}
                                >
                                    {/* Match Score Indicator */}
                                    <div className="provider-card__match-score">
                                        <div className="match-score__ring" style={{ '--score': matchScore } as React.CSSProperties}>
                                            <span>{Math.round(matchScore)}%</span>
                                        </div>
                                        <Badge variant={matchInfo.variant} size="sm" icon={<Sparkles size={10} />}>
                                            {matchInfo.label}
                                        </Badge>
                                    </div>

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

                                    {/* Quick match indicators */}
                                    <div className="provider-card__quick-tags">
                                        {provider.languages.length > 1 && (
                                            <span className="quick-tag"><Globe size={12} /> {provider.languages.length} languages</span>
                                        )}
                                        {provider.telehealth && (
                                            <span className="quick-tag active"><Video size={12} /> Telehealth</span>
                                        )}
                                        {provider.eveningHours && (
                                            <span className="quick-tag"><Moon size={12} /> Evening</span>
                                        )}
                                        {provider.weekendHours && (
                                            <span className="quick-tag"><Sun size={12} /> Weekend</span>
                                        )}
                                    </div>

                                    <div className="provider-card__availability">
                                        <Clock size={14} />
                                        <span>{provider.availability}</span>
                                    </div>

                                    <div className="provider-card__footer">
                                        {getAcceptingBadge(provider.acceptingPatients)}
                                    </div>
                                </motion.div>
                            )
                        })}
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
                                        <h4>Availability</h4>
                                        <div className="provider-detail__availability-tags">
                                            {selectedProvider.telehealth && (
                                                <Badge variant="teal" size="sm" icon={<Video size={10} />}>Telehealth</Badge>
                                            )}
                                            {selectedProvider.eveningHours && (
                                                <Badge variant="info" size="sm" icon={<Moon size={10} />}>Evening Hours</Badge>
                                            )}
                                            {selectedProvider.weekendHours && (
                                                <Badge variant="info" size="sm" icon={<Sun size={10} />}>Weekend Hours</Badge>
                                            )}
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
                                        <Button variant="primary" icon={<Calendar size={16} />} onClick={() => {
                                            addToast({ type: 'success', title: 'Appointment Request Sent', message: `Scheduling request sent to ${selectedProvider.name}'s office. You'll receive a confirmation shortly.`, duration: 4000 })
                                        }}>
                                            Schedule Appointment
                                        </Button>
                                        {selectedProvider.telehealth && (
                                            <Button variant="secondary" icon={<Video size={16} />} onClick={() => {
                                                addToast({ type: 'success', title: 'Telehealth Booked', message: `Virtual visit request sent to ${selectedProvider.name}. Check your email for the link.`, duration: 4000 })
                                            }}>
                                                Book Telehealth
                                            </Button>
                                        )}
                                        <Button
                                            variant={compareList.includes(selectedProvider.id) ? 'primary' : 'ghost'}
                                            size="sm"
                                            onClick={() => {
                                                setCompareList(prev =>
                                                    prev.includes(selectedProvider.id)
                                                        ? prev.filter(id => id !== selectedProvider.id)
                                                        : prev.length < 3
                                                            ? [...prev, selectedProvider.id]
                                                            : (addToast({ type: 'warning', title: 'Compare Limit', message: 'You can compare up to 3 providers at a time', duration: 3000 }), prev)
                                                )
                                            }}
                                        >
                                            {compareList.includes(selectedProvider.id) ? 'Remove from Compare' : 'Add to Compare'}
                                        </Button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="provider-directory__no-selection"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Sparkles size={48} />
                                <p>Select a provider to view details</p>
                                <span className="no-selection__hint">AI-ranked based on your preferences</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Compare Providers Floating Bar */}
            <AnimatePresence>
                {compareList.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20 }}
                        style={{
                            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                            background: 'rgba(255,255,255,0.97)', border: '1px solid #E5E7EB',
                            borderRadius: 16, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16,
                            backdropFilter: 'blur(20px)', zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                        }}
                    >
                        <span style={{ color: '#4B5563', fontSize: '0.85rem' }}>
                            Comparing {compareList.length} provider{compareList.length > 1 ? 's' : ''}:
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {compareList.map(id => {
                                const p = providers.find(prov => prov.id === id)
                                return p ? (
                                    <Badge key={id} variant="teal" size="sm">{p.name}</Badge>
                                ) : null
                            })}
                        </div>
                        <Button variant="primary" size="sm" disabled={compareList.length < 2} onClick={() => {
                            const compared = compareList.map(id => providers.find(p => p.id === id)!).filter(Boolean)
                            addToast({
                                type: 'info',
                                title: 'Provider Comparison',
                                message: compared.map(p => `${p.name}: ★${p.rating} • ${p.distance}mi • ${p.networkStatus.replace('_', '-')}`).join(' | '),
                                duration: 8000
                            })
                        }}>
                            Compare Now
                        </Button>
                        <button onClick={() => setCompareList([])} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4 }}>
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ProviderDirectory
