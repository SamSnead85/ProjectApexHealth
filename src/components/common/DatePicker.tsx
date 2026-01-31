import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import './DatePicker.css'

interface DatePickerProps {
    value: Date | null
    onChange: (date: Date | null) => void
    label?: string
    placeholder?: string
    minDate?: Date
    maxDate?: Date
    disabled?: boolean
    error?: string
    className?: string
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function DatePicker({
    value,
    onChange,
    label,
    placeholder = 'Select date',
    minDate,
    maxDate,
    disabled = false,
    error,
    className = ''
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [viewDate, setViewDate] = useState(value || new Date())
    const containerRef = useRef<HTMLDivElement>(null)

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const isDateDisabled = (date: Date) => {
        if (minDate && date < minDate) return true
        if (maxDate && date > maxDate) return true
        return false
    }

    const isSelectedDate = (day: number) => {
        if (!value) return false
        return (
            value.getDate() === day &&
            value.getMonth() === month &&
            value.getFullYear() === year
        )
    }

    const isToday = (day: number) => {
        const today = new Date()
        return (
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year
        )
    }

    const handlePrevMonth = () => {
        setViewDate(new Date(year, month - 1, 1))
    }

    const handleNextMonth = () => {
        setViewDate(new Date(year, month + 1, 1))
    }

    const handleSelectDate = (day: number) => {
        const selectedDate = new Date(year, month, day)
        if (!isDateDisabled(selectedDate)) {
            onChange(selectedDate)
            setIsOpen(false)
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    // Generate calendar grid
    const calendarDays: { day: number; isCurrentMonth: boolean; isDisabled: boolean }[] = []

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        calendarDays.push({
            day: daysInPrevMonth - i,
            isCurrentMonth: false,
            isDisabled: true
        })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push({
            day,
            isCurrentMonth: true,
            isDisabled: isDateDisabled(new Date(year, month, day))
        })
    }

    // Next month days
    const remaining = 42 - calendarDays.length
    for (let i = 1; i <= remaining; i++) {
        calendarDays.push({
            day: i,
            isCurrentMonth: false,
            isDisabled: true
        })
    }

    return (
        <div ref={containerRef} className={`date-picker ${error ? 'date-picker--error' : ''} ${className}`}>
            {label && <label className="date-picker__label">{label}</label>}

            <button
                type="button"
                className="date-picker__trigger"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <Calendar size={16} className="date-picker__icon" />
                <span className={`date-picker__value ${!value ? 'date-picker__value--placeholder' : ''}`}>
                    {value ? formatDate(value) : placeholder}
                </span>
                {value && (
                    <button
                        type="button"
                        className="date-picker__clear"
                        onClick={e => { e.stopPropagation(); onChange(null) }}
                    >
                        <X size={14} />
                    </button>
                )}
            </button>

            {error && <span className="date-picker__error">{error}</span>}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="date-picker__dropdown"
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    >
                        <div className="date-picker__header">
                            <button type="button" className="date-picker__nav-btn" onClick={handlePrevMonth}>
                                <ChevronLeft size={16} />
                            </button>
                            <span className="date-picker__current-month">
                                {MONTHS[month]} {year}
                            </span>
                            <button type="button" className="date-picker__nav-btn" onClick={handleNextMonth}>
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="date-picker__days-header">
                            {DAYS.map(day => (
                                <span key={day} className="date-picker__day-name">{day}</span>
                            ))}
                        </div>

                        <div className="date-picker__grid">
                            {calendarDays.map((item, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`date-picker__day ${item.isCurrentMonth ? '' : 'date-picker__day--outside'} ${item.isDisabled ? 'date-picker__day--disabled' : ''} ${item.isCurrentMonth && isSelectedDate(item.day) ? 'date-picker__day--selected' : ''} ${item.isCurrentMonth && isToday(item.day) ? 'date-picker__day--today' : ''}`}
                                    onClick={() => item.isCurrentMonth && handleSelectDate(item.day)}
                                    disabled={item.isDisabled}
                                >
                                    {item.day}
                                </button>
                            ))}
                        </div>

                        <div className="date-picker__footer">
                            <button
                                type="button"
                                className="date-picker__today-btn"
                                onClick={() => {
                                    const today = new Date()
                                    setViewDate(today)
                                    onChange(today)
                                    setIsOpen(false)
                                }}
                            >
                                Today
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default DatePicker
