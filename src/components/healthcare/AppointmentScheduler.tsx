import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar,
    Clock,
    MapPin,
    User,
    Video,
    Phone,
    ChevronLeft,
    ChevronRight,
    Plus,
    Check,
    X,
    AlertCircle,
    Stethoscope
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './AppointmentScheduler.css'

// Appointment data
interface Appointment {
    id: string
    type: 'in-person' | 'telehealth' | 'phone'
    title: string
    provider: string
    specialty: string
    datetime: Date
    duration: number
    location?: string
    status: 'upcoming' | 'confirmed' | 'pending' | 'completed' | 'cancelled'
    notes?: string
    prepInstructions?: string[]
}

const appointments: Appointment[] = [
    {
        id: 'apt-1',
        type: 'in-person',
        title: 'Annual Physical Exam',
        provider: 'Dr. Sarah Chen',
        specialty: 'Primary Care',
        datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duration: 45,
        location: 'Apex Medical Group - Suite 300',
        status: 'confirmed',
        prepInstructions: ['Fast for 12 hours before visit', 'Bring current medications list', 'Wear loose clothing']
    },
    {
        id: 'apt-2',
        type: 'telehealth',
        title: 'Cardiology Follow-up',
        provider: 'Dr. Michael Rivera',
        specialty: 'Cardiology',
        datetime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        duration: 30,
        status: 'confirmed',
        notes: 'Review latest blood pressure readings'
    },
    {
        id: 'apt-3',
        type: 'in-person',
        title: 'Lab Work',
        provider: 'Quest Diagnostics',
        specialty: 'Laboratory',
        datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        duration: 15,
        location: '450 Lab Center Dr',
        status: 'pending',
        prepInstructions: ['Fast for 8-12 hours', 'Drink plenty of water']
    }
]

// Time slots for scheduling
const timeSlots = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
]

export function AppointmentScheduler() {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
    const [showScheduler, setShowScheduler] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'telehealth': return <Video size={16} />
            case 'phone': return <Phone size={16} />
            default: return <MapPin size={16} />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed': return <Badge variant="success" size="sm">Confirmed</Badge>
            case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>
            case 'completed': return <Badge variant="info" size="sm">Completed</Badge>
            case 'cancelled': return <Badge variant="critical" size="sm">Cancelled</Badge>
            default: return <Badge variant="info" size="sm">Upcoming</Badge>
        }
    }

    // Generate calendar days
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const days: (Date | null)[] = []

        // Add empty slots for days before the first day
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null)
        }

        // Add all days in the month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d))
        }

        return days
    }

    const hasAppointment = (date: Date | null) => {
        if (!date) return false
        return appointments.some(apt =>
            apt.datetime.toDateString() === date.toDateString()
        )
    }

    const isToday = (date: Date | null) => {
        if (!date) return false
        return date.toDateString() === new Date().toDateString()
    }

    const isPast = (date: Date | null) => {
        if (!date) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date < today
    }

    return (
        <div className="appointment-scheduler">
            {/* Header */}
            <div className="scheduler-header">
                <div className="scheduler-header__title">
                    <Calendar size={22} className="scheduler-header__icon" />
                    <div>
                        <h2>Appointments</h2>
                        <p>{appointments.filter(a => a.status !== 'cancelled').length} upcoming</p>
                    </div>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus size={16} />}
                    onClick={() => setShowScheduler(!showScheduler)}
                >
                    Schedule New
                </Button>
            </div>

            {/* Mini Calendar */}
            <GlassCard className="mini-calendar">
                <div className="mini-calendar__header">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
                        <ChevronLeft size={18} />
                    </button>
                    <span>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
                        <ChevronRight size={18} />
                    </button>
                </div>
                <div className="mini-calendar__weekdays">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <span key={day}>{day}</span>
                    ))}
                </div>
                <div className="mini-calendar__days">
                    {getDaysInMonth(currentMonth).map((date, index) => (
                        <button
                            key={index}
                            className={`calendar-day ${date ? '' : 'empty'} ${isToday(date) ? 'today' : ''} ${isPast(date) ? 'past' : ''} ${hasAppointment(date) ? 'has-appointment' : ''} ${date && date.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`}
                            onClick={() => date && !isPast(date) && setSelectedDate(date)}
                            disabled={!date || isPast(date)}
                        >
                            {date?.getDate()}
                            {hasAppointment(date) && <span className="appointment-dot" />}
                        </button>
                    ))}
                </div>
            </GlassCard>

            {/* Upcoming Appointments */}
            <div className="appointments-list">
                <h3>Upcoming Appointments</h3>
                {appointments.filter(a => a.status !== 'cancelled').map((apt, index) => (
                    <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <GlassCard
                            className={`appointment-card ${selectedAppointment?.id === apt.id ? 'selected' : ''}`}
                            onClick={() => setSelectedAppointment(selectedAppointment?.id === apt.id ? null : apt)}
                        >
                            <div className="appointment-card__date">
                                <span className="appointment-card__day">{apt.datetime.getDate()}</span>
                                <span className="appointment-card__month">{apt.datetime.toLocaleDateString('en-US', { month: 'short' })}</span>
                            </div>
                            <div className="appointment-card__content">
                                <div className="appointment-card__header">
                                    <h4>{apt.title}</h4>
                                    {getStatusBadge(apt.status)}
                                </div>
                                <div className="appointment-card__provider">
                                    <User size={14} />
                                    <span>{apt.provider}</span>
                                </div>
                                <div className="appointment-card__details">
                                    <span className="appointment-card__time">
                                        <Clock size={14} />
                                        {formatTime(apt.datetime)} ({apt.duration} min)
                                    </span>
                                    <span className="appointment-card__type">
                                        {getTypeIcon(apt.type)}
                                        {apt.type === 'telehealth' ? 'Video Visit' : apt.type === 'phone' ? 'Phone' : apt.location}
                                    </span>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Appointment Detail Overlay */}
            <AnimatePresence>
                {selectedAppointment && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="appointment-detail"
                    >
                        <GlassCard>
                            <div className="appointment-detail__header">
                                <div>
                                    <h3>{selectedAppointment.title}</h3>
                                    <p>{selectedAppointment.provider} • {selectedAppointment.specialty}</p>
                                </div>
                                {getStatusBadge(selectedAppointment.status)}
                            </div>

                            <div className="appointment-detail__info">
                                <div className="appointment-detail__item">
                                    <Calendar size={16} />
                                    <span>{formatDate(selectedAppointment.datetime)}</span>
                                </div>
                                <div className="appointment-detail__item">
                                    <Clock size={16} />
                                    <span>{formatTime(selectedAppointment.datetime)} ({selectedAppointment.duration} min)</span>
                                </div>
                                {selectedAppointment.location && (
                                    <div className="appointment-detail__item">
                                        <MapPin size={16} />
                                        <span>{selectedAppointment.location}</span>
                                    </div>
                                )}
                                {selectedAppointment.type === 'telehealth' && (
                                    <div className="appointment-detail__item appointment-detail__item--telehealth">
                                        <Video size={16} />
                                        <span>Video Visit - Link will be sent 15 min before</span>
                                    </div>
                                )}
                            </div>

                            {selectedAppointment.prepInstructions && (
                                <div className="appointment-detail__prep">
                                    <h4><AlertCircle size={16} /> Preparation Instructions</h4>
                                    <ul>
                                        {selectedAppointment.prepInstructions.map((instruction, i) => (
                                            <li key={i}>{instruction}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="appointment-detail__actions">
                                {selectedAppointment.type === 'telehealth' && (
                                    <Button variant="primary" icon={<Video size={16} />}>
                                        Join Video Visit
                                    </Button>
                                )}
                                <Button variant="secondary" icon={<Calendar size={16} />}>
                                    Reschedule
                                </Button>
                                <Button variant="ghost" icon={<X size={16} />}>
                                    Cancel
                                </Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AppointmentScheduler
