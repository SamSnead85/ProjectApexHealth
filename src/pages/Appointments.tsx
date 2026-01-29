import { useState } from 'react'
import { motion } from 'framer-motion'
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
    AlertCircle
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
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
    const [upcoming] = useState<Appointment[]>(mockAppointments)
    const [past] = useState<Appointment[]>(pastAppointments)
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

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
                    <Button variant="primary" icon={<Plus size={16} />}>
                        Schedule Appointment
                    </Button>
                </div>
            </div>

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
                {(activeTab === 'upcoming' ? upcoming : past).map((apt, index) => (
                    <motion.div
                        key={apt.id}
                        className="appointment-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
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
