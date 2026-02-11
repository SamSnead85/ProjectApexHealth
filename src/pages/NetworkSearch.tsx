import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    MapPin,
    Phone,
    Clock,
    Star,
    Filter,
    Video,
    UserCheck,
    Navigation,
    ChevronDown,
    Heart,
    Building2,
    Stethoscope,
    X,
    CheckCircle2,
    Globe,
    Calendar,
    GitCompare
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'

interface Provider {
    id: number
    name: string
    specialty: string
    address: string
    phone: string
    distance: string
    rating: number
    reviewCount: number
    accepting: boolean
    telehealth: boolean
    nextAvailable: string
    languages: string[]
    inNetwork: boolean
    gender: string
    image: string
}

const providers: Provider[] = [
    { id: 1, name: 'Dr. Sarah Mitchell', specialty: 'Family Medicine', address: '123 Health Blvd, Suite 100, Austin TX', phone: '(555) 123-4567', distance: '1.2 mi', rating: 4.8, reviewCount: 245, accepting: true, telehealth: true, nextAvailable: 'Tomorrow, 9:00 AM', languages: ['English', 'Spanish'], inNetwork: true, gender: 'Female', image: 'SM' },
    { id: 2, name: 'Dr. James Chen', specialty: 'Cardiology', address: '789 Heart Center Way, Austin TX', phone: '(555) 345-6789', distance: '3.8 mi', rating: 4.9, reviewCount: 312, accepting: true, telehealth: true, nextAvailable: 'Feb 15, 2:30 PM', languages: ['English', 'Mandarin'], inNetwork: true, gender: 'Male', image: 'JC' },
    { id: 3, name: 'Metro Urgent Care', specialty: 'Urgent Care', address: '456 Medical Center Dr, Austin TX', phone: '(555) 234-5678', distance: '2.5 mi', rating: 4.5, reviewCount: 189, accepting: true, telehealth: false, nextAvailable: 'Walk-in available', languages: ['English', 'Spanish', 'Vietnamese'], inNetwork: true, gender: 'N/A', image: 'MU' },
    { id: 4, name: 'Dr. Priya Patel', specialty: 'Dermatology', address: '567 Skin Health Plaza, Suite 200, Austin TX', phone: '(555) 456-7890', distance: '4.2 mi', rating: 4.7, reviewCount: 178, accepting: true, telehealth: true, nextAvailable: 'Feb 18, 10:00 AM', languages: ['English', 'Hindi', 'Gujarati'], inNetwork: true, gender: 'Female', image: 'PP' },
    { id: 5, name: "Children's Health Pediatrics", specialty: 'Pediatrics', address: '321 Kids Lane, Austin TX', phone: '(555) 567-8901', distance: '4.1 mi', rating: 4.7, reviewCount: 423, accepting: false, telehealth: true, nextAvailable: 'Waitlist only', languages: ['English'], inNetwork: true, gender: 'N/A', image: 'CH' },
    { id: 6, name: 'Dr. Michael Torres', specialty: 'Orthopedics', address: '890 Bone & Joint Pkwy, Austin TX', phone: '(555) 678-9012', distance: '5.3 mi', rating: 4.6, reviewCount: 156, accepting: true, telehealth: false, nextAvailable: 'Feb 20, 11:00 AM', languages: ['English', 'Spanish'], inNetwork: true, gender: 'Male', image: 'MT' },
    { id: 7, name: 'Dr. Lisa Nguyen', specialty: 'Internal Medicine', address: '234 Wellness Ave, Suite 300, Austin TX', phone: '(555) 789-0123', distance: '2.8 mi', rating: 4.8, reviewCount: 201, accepting: true, telehealth: true, nextAvailable: 'Feb 14, 3:00 PM', languages: ['English', 'Vietnamese'], inNetwork: true, gender: 'Female', image: 'LN' },
    { id: 8, name: 'Austin Mental Health Associates', specialty: 'Psychiatry', address: '678 Mindful Way, Austin TX', phone: '(555) 890-1234', distance: '3.1 mi', rating: 4.4, reviewCount: 98, accepting: true, telehealth: true, nextAvailable: 'Feb 22, 1:00 PM', languages: ['English', 'Spanish', 'Portuguese'], inNetwork: true, gender: 'N/A', image: 'AM' }
]

type FilterKey = 'inNetwork' | 'accepting' | 'telehealth'

const filterChips: { key: FilterKey; label: string; icon: React.ReactNode }[] = [
    { key: 'inNetwork', label: 'In-Network', icon: <CheckCircle2 size={12} /> },
    { key: 'accepting', label: 'Accepting Patients', icon: <UserCheck size={12} /> },
    { key: 'telehealth', label: 'Telehealth Available', icon: <Video size={12} /> }
]

const specialties = ['All Specialties', 'Family Medicine', 'Cardiology', 'Urgent Care', 'Dermatology', 'Pediatrics', 'Orthopedics', 'Internal Medicine', 'Psychiatry']

const cardStyle: React.CSSProperties = {
    background: 'rgba(10, 15, 26, 0.6)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16
}

export default function NetworkSearch() {
    const [search, setSearch] = useState('')
    const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set(['inNetwork']))
    const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties')
    const [compareList, setCompareList] = useState<number[]>([])
    const [selectedProvider, setSelectedProvider] = useState<number | null>(null)

    const toggleFilter = (key: FilterKey) => {
        setActiveFilters(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    const toggleCompare = (id: number) => {
        setCompareList(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
        )
    }

    const filteredProviders = providers.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.specialty.toLowerCase().includes(search.toLowerCase())
        const matchesSpecialty = selectedSpecialty === 'All Specialties' || p.specialty === selectedSpecialty
        const matchesFilters =
            (!activeFilters.has('inNetwork') || p.inNetwork) &&
            (!activeFilters.has('accepting') || p.accepting) &&
            (!activeFilters.has('telehealth') || p.telehealth)
        return matchesSearch && matchesSpecialty && matchesFilters
    })

    const selectedProviderData = providers.find(p => p.id === selectedProvider)

    return (
        <div style={{ padding: 'var(--space-xl)', maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: 'var(--space-xl)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--apex-white)', marginBottom: 'var(--space-xs)' }}>
                            Network Search
                        </h1>
                        <p style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-md)' }}>
                            Find in-network providers, specialists, and facilities near you
                        </p>
                    </div>
                    {compareList.length > 0 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <Button variant="primary" icon={<GitCompare size={14} />}>
                                Compare ({compareList.length})
                            </Button>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Search & Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ marginBottom: 'var(--space-lg)' }}
            >
                <div style={{
                    ...cardStyle,
                    padding: 'var(--space-md)',
                    display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-md)'
                }}>
                    <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                        padding: '10px var(--space-md)',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                        <Search size={16} style={{ color: 'var(--apex-steel)', flexShrink: 0 }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, specialty, or condition..."
                            style={{ flex: 1, background: 'none', border: 'none', color: 'var(--apex-white)', outline: 'none', fontSize: 'var(--text-sm)' }}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--apex-steel)', display: 'flex' }}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                        padding: '10px var(--space-md)',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.06)',
                        minWidth: 200
                    }}>
                        <Stethoscope size={16} style={{ color: 'var(--apex-steel)', flexShrink: 0 }} />
                        <select
                            value={selectedSpecialty}
                            onChange={e => setSelectedSpecialty(e.target.value)}
                            style={{
                                flex: 1, background: 'none', border: 'none',
                                color: 'var(--apex-white)', outline: 'none',
                                fontSize: 'var(--text-sm)', cursor: 'pointer'
                            }}
                        >
                            {specialties.map(s => <option key={s} value={s} style={{ background: '#0a0f1a', color: '#fff' }}>{s}</option>)}
                        </select>
                    </div>
                    <Button variant="primary" icon={<Search size={14} />}>Search</Button>
                </div>

                {/* Filter Chips */}
                <div style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'center' }}>
                    <Filter size={14} style={{ color: 'var(--apex-steel)', marginRight: 4 }} />
                    {filterChips.map(chip => (
                        <button
                            key={chip.key}
                            onClick={() => toggleFilter(chip.key)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '6px 14px',
                                borderRadius: 20,
                                border: activeFilters.has(chip.key)
                                    ? '1px solid var(--apex-teal)'
                                    : '1px solid rgba(255,255,255,0.1)',
                                background: activeFilters.has(chip.key)
                                    ? 'rgba(0, 200, 180, 0.1)'
                                    : 'rgba(255,255,255,0.03)',
                                color: activeFilters.has(chip.key)
                                    ? 'var(--apex-teal)'
                                    : 'var(--apex-silver)',
                                cursor: 'pointer',
                                fontSize: 'var(--text-xs)', fontWeight: 500
                            }}
                        >
                            {chip.icon} {chip.label}
                        </button>
                    ))}
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--apex-steel)', marginLeft: 'auto' }}>
                        {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
                    </span>
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedProvider ? '1fr 380px' : '1fr', gap: 'var(--space-xl)' }}>
                {/* Provider Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
                    <AnimatePresence>
                        {filteredProviders.map((provider, index) => (
                            <motion.div
                                key={provider.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                onClick={() => setSelectedProvider(selectedProvider === provider.id ? null : provider.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div style={{
                                    ...cardStyle,
                                    padding: 'var(--space-lg)',
                                    border: selectedProvider === provider.id
                                        ? '1px solid var(--apex-teal)'
                                        : compareList.includes(provider.id)
                                            ? '1px solid rgba(0, 200, 180, 0.3)'
                                            : '1px solid rgba(255,255,255,0.06)',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}>
                                    {/* Compare checkbox */}
                                    <button
                                        onClick={e => { e.stopPropagation(); toggleCompare(provider.id) }}
                                        style={{
                                            position: 'absolute', top: 12, right: 12,
                                            width: 22, height: 22, borderRadius: 6,
                                            border: compareList.includes(provider.id)
                                                ? '1px solid var(--apex-teal)'
                                                : '1px solid rgba(255,255,255,0.15)',
                                            background: compareList.includes(provider.id)
                                                ? 'rgba(0, 200, 180, 0.2)'
                                                : 'transparent',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--apex-teal)'
                                        }}
                                        title="Add to compare"
                                    >
                                        {compareList.includes(provider.id) && <CheckCircle2 size={14} />}
                                    </button>

                                    {/* Avatar & Info */}
                                    <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                                        <div style={{
                                            width: 56, height: 56, borderRadius: 14,
                                            background: 'linear-gradient(135deg, rgba(0, 200, 180, 0.15), rgba(0, 200, 180, 0.05))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 'var(--text-md)', fontWeight: 700,
                                            color: 'var(--apex-teal)', flexShrink: 0
                                        }}>
                                            {provider.image}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, color: 'var(--apex-white)', fontSize: 'var(--text-md)', marginBottom: 2 }}>
                                                {provider.name}
                                            </div>
                                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--apex-teal)', marginBottom: 6 }}>
                                                {provider.specialty}
                                            </div>
                                            <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                                                {provider.accepting
                                                    ? <Badge variant="success" style={{ fontSize: 10 }}>Accepting</Badge>
                                                    : <Badge variant="warning" style={{ fontSize: 10 }}>Waitlist</Badge>
                                                }
                                                {provider.telehealth && <Badge variant="info" style={{ fontSize: 10 }}>Telehealth</Badge>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--apex-silver)' }}>
                                            <MapPin size={12} style={{ flexShrink: 0 }} /> {provider.address}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--apex-silver)' }}>
                                            <Navigation size={12} style={{ flexShrink: 0 }} /> {provider.distance} away
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--apex-silver)' }}>
                                            <Calendar size={12} style={{ flexShrink: 0 }} /> Next: {provider.nextAvailable}
                                        </div>
                                    </div>

                                    {/* Rating & Distance */}
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        marginTop: 'var(--space-md)',
                                        paddingTop: 'var(--space-sm)',
                                        borderTop: '1px solid rgba(255,255,255,0.04)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Star size={14} style={{ color: '#FFD700', fill: '#FFD700' }} />
                                            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--apex-white)' }}>
                                                {provider.rating}
                                            </span>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--apex-steel)' }}>
                                                ({provider.reviewCount})
                                            </span>
                                        </div>
                                        <Button variant="secondary" size="sm" onClick={e => e.stopPropagation()}>
                                            Book Visit
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Provider Detail Panel */}
                <AnimatePresence>
                    {selectedProvider && selectedProviderData && (
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div style={{ ...cardStyle, padding: 'var(--space-lg)', position: 'sticky', top: 'var(--space-xl)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--apex-steel)' }}>
                                        Provider Details
                                    </span>
                                    <button
                                        onClick={() => setSelectedProvider(null)}
                                        style={{ background: 'none', border: 'none', color: 'var(--apex-steel)', cursor: 'pointer', display: 'flex' }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                                    <div style={{
                                        width: 72, height: 72, borderRadius: 18, margin: '0 auto var(--space-md)',
                                        background: 'linear-gradient(135deg, rgba(0, 200, 180, 0.2), rgba(0, 200, 180, 0.05))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--apex-teal)'
                                    }}>
                                        {selectedProviderData.image}
                                    </div>
                                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--apex-white)' }}>
                                        {selectedProviderData.name}
                                    </div>
                                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--apex-teal)', marginBottom: 'var(--space-sm)' }}>
                                        {selectedProviderData.specialty}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star
                                                key={i}
                                                size={14}
                                                style={{
                                                    color: i <= Math.floor(selectedProviderData.rating) ? '#FFD700' : 'rgba(255,255,255,0.1)',
                                                    fill: i <= Math.floor(selectedProviderData.rating) ? '#FFD700' : 'none'
                                                }}
                                            />
                                        ))}
                                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--apex-silver)', marginLeft: 4 }}>
                                            {selectedProviderData.rating} ({selectedProviderData.reviewCount} reviews)
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                                    {[
                                        { icon: <MapPin size={14} />, label: selectedProviderData.address },
                                        { icon: <Phone size={14} />, label: selectedProviderData.phone },
                                        { icon: <Navigation size={14} />, label: `${selectedProviderData.distance} from your location` },
                                        { icon: <Clock size={14} />, label: `Next available: ${selectedProviderData.nextAvailable}` },
                                        { icon: <Globe size={14} />, label: selectedProviderData.languages.join(', ') }
                                    ].map((item, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)',
                                            padding: 'var(--space-xs) 0',
                                            fontSize: 'var(--text-sm)', color: 'var(--apex-silver)'
                                        }}>
                                            <span style={{ color: 'var(--apex-steel)', flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                                            {item.label}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                    <Button variant="primary" style={{ width: '100%' }} icon={<Calendar size={14} />}>
                                        Schedule Appointment
                                    </Button>
                                    {selectedProviderData.telehealth && (
                                        <Button variant="secondary" style={{ width: '100%' }} icon={<Video size={14} />}>
                                            Book Telehealth Visit
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
