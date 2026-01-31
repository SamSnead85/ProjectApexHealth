import { ReactNode, useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ChevronLeft, ChevronRight, Plus, X, Users, MapPin, Video, Bell, Repeat, MoreVertical, Trash2, Edit2 } from 'lucide-react'
import './SchedulingComponents.css'

// Calendar View
interface CalendarEvent {
    id: string
    title: string
    start: Date
    end: Date
    color?: string
    allDay?: boolean
    location?: string
    attendees?: string[]
    recurring?: boolean
}

interface CalendarViewProps {
    events: CalendarEvent[]
    view?: 'month' | 'week' | 'day'
    onDateSelect?: (date: Date) => void
    onEventClick?: (event: CalendarEvent) => void
    onEventCreate?: (start: Date, end: Date) => void
    className?: string
}

export function CalendarView({
    events,
    view = 'month',
    onDateSelect,
    onEventClick,
    onEventCreate,
    className = ''
}: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDay = firstDay.getDay()

        const days: (Date | null)[] = []

        // Add empty slots for days before first of month
        for (let i = 0; i < startingDay; i++) {
            days.push(null)
        }

        // Add days of month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i))
        }

        return days
    }

    const days = useMemo(() => getDaysInMonth(currentDate), [currentDate])

    const getEventsForDate = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.start)
            return eventDate.toDateString() === date.toDateString()
        })
    }

    const navigateMonth = (direction: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1))
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const handleDateClick = (date: Date) => {
        setSelectedDate(date)
        onDateSelect?.(date)
    }

    return (
        <div className={`calendar-view calendar-view--${view} ${className}`}>
            <div className="calendar-view__header">
                <button onClick={() => navigateMonth(-1)}>
                    <ChevronLeft size={20} />
                </button>
                <h3>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <button onClick={() => navigateMonth(1)}>
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="calendar-view__weekdays">
                {daysOfWeek.map(day => (
                    <div key={day} className="calendar-view__weekday">{day}</div>
                ))}
            </div>

            <div className="calendar-view__days">
                {days.map((date, i) => (
                    <div
                        key={i}
                        className={`calendar-view__day ${!date ? 'calendar-view__day--empty' : ''} ${date && isToday(date) ? 'calendar-view__day--today' : ''} ${date && selectedDate?.toDateString() === date.toDateString() ? 'calendar-view__day--selected' : ''}`}
                        onClick={() => date && handleDateClick(date)}
                    >
                        {date && (
                            <>
                                <span className="calendar-view__day-number">{date.getDate()}</span>
                                <div className="calendar-view__day-events">
                                    {getEventsForDate(date).slice(0, 3).map(event => (
                                        <div
                                            key={event.id}
                                            className="calendar-view__event"
                                            style={{ backgroundColor: event.color || 'var(--apex-teal)' }}
                                            onClick={(e) => { e.stopPropagation(); onEventClick?.(event) }}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                    {getEventsForDate(date).length > 3 && (
                                        <span className="calendar-view__more">
                                            +{getEventsForDate(date).length - 3} more
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Time Slot Picker
interface TimeSlot {
    start: string
    end: string
    available: boolean
}

interface TimeSlotPickerProps {
    date: Date
    slots: TimeSlot[]
    selected?: TimeSlot
    onSelect?: (slot: TimeSlot) => void
    className?: string
}

export function TimeSlotPicker({
    date,
    slots,
    selected,
    onSelect,
    className = ''
}: TimeSlotPickerProps) {
    return (
        <div className={`time-slot-picker ${className}`}>
            <div className="time-slot-picker__header">
                <Calendar size={16} />
                <span>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="time-slot-picker__slots">
                {slots.map((slot, i) => (
                    <button
                        key={i}
                        className={`time-slot-picker__slot ${!slot.available ? 'time-slot-picker__slot--unavailable' : ''} ${selected?.start === slot.start ? 'time-slot-picker__slot--selected' : ''}`}
                        onClick={() => slot.available && onSelect?.(slot)}
                        disabled={!slot.available}
                    >
                        <Clock size={14} />
                        <span>{slot.start} - {slot.end}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

// Event Card
interface EventCardProps {
    event: CalendarEvent
    onEdit?: (event: CalendarEvent) => void
    onDelete?: (id: string) => void
    compact?: boolean
    className?: string
}

export function EventCard({
    event,
    onEdit,
    onDelete,
    compact = false,
    className = ''
}: EventCardProps) {
    const [showMenu, setShowMenu] = useState(false)

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }

    return (
        <div
            className={`event-card ${compact ? 'event-card--compact' : ''} ${className}`}
            style={{ '--event-color': event.color || 'var(--apex-teal)' } as React.CSSProperties}
        >
            <div className="event-card__indicator" />
            <div className="event-card__content">
                <h4 className="event-card__title">{event.title}</h4>
                <div className="event-card__time">
                    <Clock size={12} />
                    <span>
                        {event.allDay ? 'All Day' : `${formatTime(event.start)} - ${formatTime(event.end)}`}
                    </span>
                </div>
                {!compact && (
                    <>
                        {event.location && (
                            <div className="event-card__location">
                                <MapPin size={12} />
                                <span>{event.location}</span>
                            </div>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                            <div className="event-card__attendees">
                                <Users size={12} />
                                <span>{event.attendees.length} attendee{event.attendees.length > 1 ? 's' : ''}</span>
                            </div>
                        )}
                        {event.recurring && (
                            <div className="event-card__recurring">
                                <Repeat size={12} />
                                <span>Recurring</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="event-card__actions">
                <button className="event-card__menu-btn" onClick={() => setShowMenu(!showMenu)}>
                    <MoreVertical size={16} />
                </button>
                <AnimatePresence>
                    {showMenu && (
                        <motion.div
                            className="event-card__menu"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <button onClick={() => { onEdit?.(event); setShowMenu(false) }}>
                                <Edit2 size={14} /> Edit
                            </button>
                            <button className="danger" onClick={() => { onDelete?.(event.id); setShowMenu(false) }}>
                                <Trash2 size={14} /> Delete
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// Agenda View
interface AgendaViewProps {
    events: CalendarEvent[]
    onEventClick?: (event: CalendarEvent) => void
    daysToShow?: number
    className?: string
}

export function AgendaView({
    events,
    onEventClick,
    daysToShow = 7,
    className = ''
}: AgendaViewProps) {
    const groupedEvents = useMemo(() => {
        const today = new Date()
        const grouped: Record<string, CalendarEvent[]> = {}

        for (let i = 0; i < daysToShow; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            const key = date.toDateString()
            grouped[key] = events.filter(e =>
                new Date(e.start).toDateString() === key
            ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        }

        return grouped
    }, [events, daysToShow])

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)

        if (date.toDateString() === today.toDateString()) return 'Today'
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    }

    return (
        <div className={`agenda-view ${className}`}>
            {Object.entries(groupedEvents).map(([dateStr, dayEvents]) => (
                <div key={dateStr} className="agenda-view__day">
                    <h4 className="agenda-view__date">{formatDate(dateStr)}</h4>
                    {dayEvents.length > 0 ? (
                        <div className="agenda-view__events">
                            {dayEvents.map(event => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    compact
                                    className="agenda-view__event"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="agenda-view__empty">No events scheduled</p>
                    )}
                </div>
            ))}
        </div>
    )
}

// Quick Add Event
interface QuickAddEventProps {
    onAdd?: (event: Partial<CalendarEvent>) => void
    defaultDate?: Date
    className?: string
}

export function QuickAddEvent({
    onAdd,
    defaultDate = new Date(),
    className = ''
}: QuickAddEventProps) {
    const [title, setTitle] = useState('')
    const [date, setDate] = useState(defaultDate.toISOString().split('T')[0])
    const [time, setTime] = useState('09:00')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        const [hours, minutes] = time.split(':').map(Number)
        const start = new Date(date)
        start.setHours(hours, minutes)

        const end = new Date(start)
        end.setHours(hours + 1)

        onAdd?.({
            title: title.trim(),
            start,
            end
        })

        setTitle('')
    }

    return (
        <form className={`quick-add-event ${className}`} onSubmit={handleSubmit}>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add new event..."
                className="quick-add-event__title"
            />
            <div className="quick-add-event__fields">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />
                <button type="submit" disabled={!title.trim()}>
                    <Plus size={16} />
                </button>
            </div>
        </form>
    )
}

export default { CalendarView, TimeSlotPicker, EventCard, AgendaView, QuickAddEvent }
