import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar,
    Clock,
    MapPin,
    User,
    Video,
    Phone,
    Plus,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
    Check,
    AlertCircle,
    Search,
    Bell,
    TestTube
} from 'lucide-react'
import { GlassCard, Badge, Button, PageSkeleton } from '../components/common'
import { useToast } from '../components/common/Toast'
import './Appointments.css'

interface Appointment {
    id: string
    provider: string
    specialty: string
    type: 'in-person' | 'video' | 'phone'
    date: string
    time: string
    duration: number
    location?: string
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
    notes?: string
}

const mockAppointments: Appointment[] = [
    {
        id: 'apt-1',
        provider: 'Dr. Sarah Chen',
        specialty: 'Family Medicine',
        type: 'in-person',
        date: '2024-02-15',
        time: '10:00 AM',
        duration: 30,
        location: 'Premier Medical Associates, Suite 200',
        status: 'confirmed',
        notes: 'Annual physical exam'
    },
    {
        id: 'apt-2',
        provider: 'Dr. Lisa Thompson',
        specialty: 'Psychiatry',
        type: 'video',
        date: '2024-02-01',
        time: '2:00 PM',
        duration: 45,
        status: 'confirmed',
        notes: 'Follow-up session'
    },
    {
        id: 'apt-3',
        provider: 'Dr. Michael Roberts',
        specialty: 'Cardiology',
        type: 'phone',
        date: '2024-01-28',
        time: '11:30 AM',
        duration: 15,
        status: 'pending',
        notes: 'Lab results review'
    }
]

const pastAppointments: Appointment[] = [
    {
        id: 'apt-4',
        provider: 'Dr. Sarah Chen',
        specialty: 'Family Medicine',
        type: 'in-person',
        date: '2024-01-15',
        time: '10:00 AM',
        duration: 30,
        location: 'Premier Medical Associates, Suite 200',
        status: 'completed',
        notes: 'Routine checkup'
    },
    {
        id: 'apt-5',
        provider: 'Dr. James Wilson',
        specialty: 'Optometry',
        type: 'in-person',
        date: '2023-09-10',
        time: '3:00 PM',
        duration: 45,
        location: 'Clear Vision Eye Care',
        status: 'completed',
        notes: 'Annual eye exam'
    }
]

export function Appointments() {
    const { addToast } = useToast()
    const [upcoming, setUpcoming] = useState<Appointment[]>(mockAppointments)
    const [past] = useState<Appointment[]>(pastAppointments)
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'in-person' | 'video' | 'phone'>('all')
    const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'cancelled' | 'completed'>('all')
    const [showFilters, setShowFilters] = useState(false)
    const [showBookForm, setShowBookForm] = useState(false)
    const [bookForm, setBookForm] = useState({ provider: '', specialty: '', type: 'in-person' as Appointment['type'], date: '', time: '', notes: '' })
    const [bookingLoading, setBookingLoading] = useState(false)
    const [bookErrors, setBookErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    if (loading) return <PageSkeleton />

    // Filter logic
    const filterAppointments = (appointments: Appointment[]) => {
        return appointments.filter(apt => {
            const matchesSearch = searchQuery === '' ||
                apt.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                apt.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (apt.notes && apt.notes.toLowerCase().includes(searchQuery.toLowerCase()))
            const matchesType = filterType === 'all' || apt.type === filterType
            const matchesStatus = filterStatus === 'all' || apt.status === filterStatus
            return matchesSearch && matchesType && matchesStatus
        })
    }

    // Reminder badge logic
    const getReminderBadge = (apt: Appointment) => {
        const aptDate = new Date(apt.date)
        const now = new Date()
        const diffMs = aptDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
        if (diffDays === 0) return <Badge variant="critical" icon={<Bell size={10} />}>Today at {apt.time}</Badge>
        if (diffDays === 1) return <Badge variant="warning" icon={<Bell size={10} />}>Tomorrow at {apt.time}</Badge>
        if (diffDays > 1 && diffDays <= 3) return <Badge variant="info" icon={<Bell size={10} />}>In {diffDays} days</Badge>
        return null
    }

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

    const getTypeIcon = (type: Appointment['type']) => {
        switch (type) {
            case 'in-person': return <MapPin size={16} />
            case 'video': return <Video size={16} />
            case 'phone': return <Phone size={16} />
        }
    }

    const getTypeBadge = (type: Appointment['type']) => {
        switch (type) {
            case 'in-person': return <Badge variant="info" icon={<MapPin size={10} />}>In-Person</Badge>
            case 'video': return <Badge variant="teal" icon={<Video size={10} />}>Video</Badge>
            case 'phone': return <Badge variant="warning" icon={<Phone size={10} />}>Phone</Badge>
        }
    }

    const getStatusBadge = (status: Appointment['status']) => {
        switch (status) {
            case 'confirmed': return <Badge variant="success" icon={<Check size={10} />}>Confirmed</Badge>
            case 'pending': return <Badge variant="warning" icon={<AlertCircle size={10} />}>Pending</Badge>
            case 'cancelled': return <Badge variant="critical" icon={<X size={10} />}>Cancelled</Badge>
            case 'completed': return <Badge variant="info">Completed</Badge>
        }
    }

    return (
        <div className="appointments-page">
            {/* Header */}
            <div className="appointments__header">
                <div>
                    <h1 className="appointments__title">Appointments</h1>
                    <p className="appointments__subtitle">
                        Manage your healthcare appointments
                    </p>
                </div>
                <div className="appointments__actions">
                    <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowBookForm(!showBookForm)}>
                        Book New Appointment
                    </Button>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <motion.div
                className="appointments__filter-bar"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap',
                    padding: '1rem 1.25rem', borderRadius: '16px', marginBottom: '1.5rem',
                    background: '#FFFFFF', border: '1px solid #E5E7EB'
                }}
            >
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                        type="text"
                        placeholder="Search by provider, specialty, or notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', borderRadius: '10px',
                            border: '1px solid #E5E7EB', background: 'rgba(0,0,0,0.02)',
                            color: '#111827', fontSize: '0.85rem', outline: 'none'
                        }}
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem',
                        borderRadius: '10px',                         border: showFilters ? '1px solid rgba(99,102,241,0.3)' : '1px solid #E5E7EB',
                        background: showFilters ? 'rgba(99,102,241,0.08)' : 'rgba(0,0,0,0.02)',
                        color: showFilters ? '#818cf8' : '#4B5563', cursor: 'pointer', fontSize: '0.85rem'
                    }}
                >
                    <Filter size={14} /> Filters
                </button>
                {(filterType !== 'all' || filterStatus !== 'all' || searchQuery) && (
                    <button
                        onClick={() => { setFilterType('all'); setFilterStatus('all'); setSearchQuery('') }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.75rem',
                            borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.08)',
                            color: '#f87171', cursor: 'pointer', fontSize: '0.8rem'
                        }}
                    >
                        <X size={12} /> Clear
                    </button>
                )}
            </motion.div>

            {/* Filter Options */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            overflow: 'hidden', marginBottom: '1.25rem', padding: '1rem 1.25rem',
                            borderRadius: '16px', background: '#FFFFFF', border: '1px solid #E5E7EB'
                        }}
                    >
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>Type</span>
                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    {([['all', 'All'], ['in-person', 'In-Person'], ['video', 'Telehealth'], ['phone', 'Phone']] as const).map(([val, label]) => (
                                        <button key={val} onClick={() => setFilterType(val as typeof filterType)} style={{
                                            padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer',
                                            border: filterType === val ? '1px solid rgba(99,102,241,0.4)' : '1px solid #E5E7EB',
                                            background: filterType === val ? 'rgba(99,102,241,0.08)' : 'rgba(0,0,0,0.02)',
                                            color: filterType === val ? '#6366f1' : '#4B5563'
                                        }}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>Status</span>
                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    {([['all', 'All'], ['confirmed', 'Upcoming'], ['completed', 'Past'], ['cancelled', 'Cancelled'], ['pending', 'Pending']] as const).map(([val, label]) => (
                                        <button key={val} onClick={() => setFilterStatus(val as typeof filterStatus)} style={{
                                            padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer',
                                            border: filterStatus === val ? '1px solid rgba(99,102,241,0.4)' : '1px solid #E5E7EB',
                                            background: filterStatus === val ? 'rgba(99,102,241,0.08)' : 'rgba(0,0,0,0.02)',
                                            color: filterStatus === val ? '#6366f1' : '#4B5563'
                                        }}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Book New Appointment Form */}
            <AnimatePresence>
                {showBookForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
                    >
                        <GlassCard style={{ borderRadius: '16px', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Book New Appointment</h3>
                                <button onClick={() => setShowBookForm(false)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                {[
                                    { label: 'Provider Name', key: 'provider', placeholder: 'e.g., Dr. Sarah Chen', type: 'text' },
                                    { label: 'Specialty', key: 'specialty', placeholder: 'e.g., Family Medicine', type: 'text' },
                                    { label: 'Date', key: 'date', placeholder: '', type: 'date' },
                                    { label: 'Time', key: 'time', placeholder: '', type: 'time' },
                                ].map(field => (
                                    <div key={field.key}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: bookErrors[field.key] ? '#f87171' : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' }}>{field.label} *</label>
                                        <input
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            value={bookForm[field.key as keyof typeof bookForm]}
                                            onChange={(e) => { setBookForm({ ...bookForm, [field.key]: e.target.value }); setBookErrors(prev => { const n = { ...prev }; delete n[field.key]; return n }) }}
                                            style={{
                                                width: '100%', padding: '0.6rem 0.75rem', borderRadius: '10px',
                                                border: bookErrors[field.key] ? '1px solid rgba(248,113,113,0.5)' : '1px solid #E5E7EB',
                                                background: bookErrors[field.key] ? 'rgba(248,113,113,0.05)' : 'rgba(0,0,0,0.02)',
                                                color: '#111827', fontSize: '0.85rem', outline: 'none'
                                            }}
                                        />
                                        {bookErrors[field.key] && <span style={{ fontSize: '0.7rem', color: '#f87171', marginTop: '0.25rem', display: 'block' }}>{bookErrors[field.key]}</span>}
                                    </div>
                                ))}
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' }}>Visit Type</label>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        {([['in-person', 'In-Person', MapPin], ['video', 'Telehealth', Video], ['phone', 'Phone', Phone]] as const).map(([val, label, Icon]) => (
                                            <button key={val} onClick={() => setBookForm({ ...bookForm, type: val })} style={{
                                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                                                padding: '0.55rem 0.5rem', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer',
                                                border: bookForm.type === val ? '1px solid rgba(6,182,212,0.4)' : '1px solid #E5E7EB',
                                                background: bookForm.type === val ? 'rgba(6,182,212,0.08)' : 'rgba(0,0,0,0.02)',
                                                color: bookForm.type === val ? '#0891b2' : '#4B5563'
                                            }}>
                                                <Icon size={13} /> {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' }}>Notes</label>
                                    <input
                                        type="text"
                                        placeholder="Reason for visit..."
                                        value={bookForm.notes}
                                        onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                                        style={{
                                            width: '100%', padding: '0.6rem 0.75rem', borderRadius: '10px',
                                            border: '1px solid #E5E7EB', background: 'rgba(0,0,0,0.02)',
                                            color: '#111827', fontSize: '0.85rem', outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                                <Button variant="ghost" onClick={() => { setShowBookForm(false); setBookErrors({}) }}>Cancel</Button>
                                <Button variant="primary" icon={<Check size={14} />} loading={bookingLoading} disabled={bookingLoading} onClick={() => {
                                    const errors: Record<string, string> = {}
                                    if (!bookForm.provider.trim()) errors.provider = 'Provider is required'
                                    if (!bookForm.specialty.trim()) errors.specialty = 'Specialty is required'
                                    if (!bookForm.date) errors.date = 'Date is required'
                                    if (!bookForm.time) errors.time = 'Time is required'
                                    if (Object.keys(errors).length > 0) {
                                        setBookErrors(errors)
                                        addToast({ type: 'error', title: 'Validation Error', message: 'Please fill in all required fields', duration: 3000 })
                                        return
                                    }
                                    setBookErrors({})
                                    setBookingLoading(true)
                                    setTimeout(() => {
                                        const newAppointment: Appointment = {
                                            id: `apt-${Date.now()}`,
                                            provider: bookForm.provider,
                                            specialty: bookForm.specialty,
                                            type: bookForm.type,
                                            date: bookForm.date,
                                            time: bookForm.time,
                                            duration: 30,
                                            status: 'pending',
                                            notes: bookForm.notes || undefined,
                                        }
                                        setUpcoming(prev => [newAppointment, ...prev])
                                        setShowBookForm(false)
                                        setBookForm({ provider: '', specialty: '', type: 'in-person', date: '', time: '', notes: '' })
                                        setBookingLoading(false)
                                        addToast({ type: 'success', title: 'Appointment Booked', message: `Appointment with ${newAppointment.provider} on ${new Date(newAppointment.date).toLocaleDateString()} confirmed.`, duration: 5000 })
                                    }, 800)
                                }}>{bookingLoading ? 'Booking...' : 'Confirm Booking'}</Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Stats */}
            <div className="appointments__stats">
                <GlassCard className="stat-card">
                    <Calendar size={24} />
                    <div className="stat-card__info">
                        <span className="stat-card__value">{upcoming.length}</span>
                        <span className="stat-card__label">Upcoming</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <Clock size={24} />
                    <div className="stat-card__info">
                        <span className="stat-card__value">Next: Feb 1</span>
                        <span className="stat-card__label">In 5 days</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <Video size={24} />
                    <div className="stat-card__info">
                        <span className="stat-card__value">1</span>
                        <span className="stat-card__label">Video visit ready</span>
                    </div>
                </GlassCard>
            </div>

            {/* Tabs */}
            <div className="appointments__tabs">
                <button
                    className={`appointments__tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming ({upcoming.length})
                </button>
                <button
                    className={`appointments__tab ${activeTab === 'past' ? 'active' : ''}`}
                    onClick={() => setActiveTab('past')}
                >
                    Past ({past.length})
                </button>
            </div>

            {/* Appointments List */}
            <div className="appointments__list">
                {filterAppointments(activeTab === 'upcoming' ? upcoming : past).length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                        textAlign: 'center', padding: '3rem', color: '#9CA3AF', borderRadius: '16px',
                        background: '#F9FAFB', border: '1px solid #E5E7EB'
                    }}>
                        <Search size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>No appointments match your filters</p>
                        <button onClick={() => { setFilterType('all'); setFilterStatus('all'); setSearchQuery('') }}
                            style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.85rem' }}>
                            Clear all filters
                        </button>
                    </motion.div>
                )}
                {filterAppointments(activeTab === 'upcoming' ? upcoming : past).map((apt, index) => (
                    <motion.div
                        key={apt.id}
                        className="appointment-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        {/* Reminder Badge */}
                        {activeTab === 'upcoming' && getReminderBadge(apt) && (
                            <div style={{
                                padding: '0.4rem 0.75rem', borderRadius: '12px 12px 0 0',
                                background: 'rgba(251,191,36,0.08)', borderBottom: '1px solid rgba(251,191,36,0.12)',
                                display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem'
                            }}>
                                {getReminderBadge(apt)}
                            </div>
                        )}
                        <div className="appointment-card__date-section">
                            <div className="appointment-card__date">
                                <span className="appointment-card__day">
                                    {new Date(apt.date).getDate()}
                                </span>
                                <span className="appointment-card__month">
                                    {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}
                                </span>
                            </div>
                            <div className="appointment-card__time">
                                <Clock size={14} />
                                {apt.time}
                            </div>
                        </div>

                        <div className="appointment-card__content">
                            <div className="appointment-card__header">
                                <div className="appointment-card__provider">
                                    <h3>{apt.provider}</h3>
                                    <span className="appointment-card__specialty">{apt.specialty}</span>
                                </div>
                                <div className="appointment-card__badges">
                                    {getTypeBadge(apt.type)}
                                    {getStatusBadge(apt.status)}
                                </div>
                            </div>

                            {apt.location && (
                                <div className="appointment-card__location">
                                    <MapPin size={14} />
                                    {apt.location}
                                </div>
                            )}

                            {apt.notes && (
                                <div className="appointment-card__notes">
                                    {apt.notes}
                                </div>
                            )}

                            <div className="appointment-card__footer">
                                <span className="appointment-card__duration">
                                    <Clock size={12} /> {apt.duration} min
                                </span>
                                {activeTab === 'upcoming' && (
                                    <div className="appointment-card__actions">
                                        {apt.type === 'video' && apt.status === 'confirmed' && (
                                            <Button variant="primary" size="sm" icon={<Video size={14} />}>
                                                Join
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm">Reschedule</Button>
                                        <Button variant="ghost" size="sm">Cancel</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Calendar Quick View */}
            <GlassCard className="calendar-quick-view">
                <div className="calendar-quick-view__header">
                    <h3>February 2024</h3>
                    <div className="calendar-quick-view__nav">
                        <button><ChevronLeft size={16} /></button>
                        <button><ChevronRight size={16} /></button>
                    </div>
                </div>
                <div className="calendar-quick-view__grid">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <span key={day} className="calendar-quick-view__day-label">{day}</span>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                        const day = i - 3 // Offset for starting day
                        const hasAppointment = [1, 15, 28].includes(day)
                        return (
                            <button
                                key={i}
                                className={`calendar-quick-view__day ${day < 1 || day > 29 ? 'disabled' : ''} ${hasAppointment ? 'has-appointment' : ''} ${day === 15 ? 'today' : ''}`}
                                disabled={day < 1 || day > 29}
                            >
                                {day > 0 && day <= 29 ? day : ''}
                            </button>
                        )
                    })}
                </div>
            </GlassCard>
        </div>
    )
}

export default Appointments
