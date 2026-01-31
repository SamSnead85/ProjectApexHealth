import { ReactNode, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Activity, Thermometer, Droplet, Brain, Pill, FileText, User, AlertCircle, TrendingUp, TrendingDown, Scale, Clock, Calendar, ChevronRight, CircleAlert, CheckCircle } from 'lucide-react'
import './HealthcareComponents.css'

// Vital Signs Card
interface VitalSign { label: string; value: number | string; unit: string; status: 'normal' | 'warning' | 'critical'; icon?: ReactNode }

interface VitalSignsCardProps { vitals: VitalSign[]; title?: string; className?: string }

export function VitalSignsCard({ vitals, title = 'Vital Signs', className = '' }: VitalSignsCardProps) {
    const statusColors = { normal: '#10b981', warning: '#f59e0b', critical: '#ef4444' }

    return (
        <div className={`vital-signs-card ${className}`}>
            <h4 className="vital-signs-card__title"><Activity size={18} /> {title}</h4>
            <div className="vital-signs-card__grid">
                {vitals.map((vital, i) => (
                    <div key={i} className={`vital-signs-card__item vital-signs-card__item--${vital.status}`}>
                        <div className="vital-signs-card__icon" style={{ color: statusColors[vital.status] }}>
                            {vital.icon || <Activity size={20} />}
                        </div>
                        <div className="vital-signs-card__info">
                            <span className="vital-signs-card__label">{vital.label}</span>
                            <span className="vital-signs-card__value">{vital.value} <small>{vital.unit}</small></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Medication Card
interface Medication { name: string; dosage: string; frequency: string; time?: string; refillsLeft?: number; nextRefill?: Date }

interface MedicationCardProps { medication: Medication; onTake?: () => void; onRefill?: () => void; className?: string }

export function MedicationCard({ medication, onTake, onRefill, className = '' }: MedicationCardProps) {
    const needsRefill = medication.refillsLeft !== undefined && medication.refillsLeft <= 1

    return (
        <div className={`medication-card ${needsRefill ? 'medication-card--refill' : ''} ${className}`}>
            <div className="medication-card__icon"><Pill size={24} /></div>
            <div className="medication-card__content">
                <h4 className="medication-card__name">{medication.name}</h4>
                <span className="medication-card__dosage">{medication.dosage}</span>
                <div className="medication-card__schedule">
                    <Clock size={12} /> {medication.frequency}
                    {medication.time && <span>• {medication.time}</span>}
                </div>
                {medication.refillsLeft !== undefined && (
                    <span className={`medication-card__refills ${needsRefill ? 'low' : ''}`}>
                        {medication.refillsLeft} refills remaining
                    </span>
                )}
            </div>
            <div className="medication-card__actions">
                {onTake && <button className="medication-card__take" onClick={onTake}><CheckCircle size={16} /> Take</button>}
                {needsRefill && onRefill && <button className="medication-card__refill" onClick={onRefill}>Refill</button>}
            </div>
        </div>
    )
}

// Health Metric
interface HealthMetricProps {
    label: string
    value: number
    unit: string
    min?: number
    max?: number
    target?: number
    trend?: 'up' | 'down' | 'stable'
    history?: number[]
    className?: string
}

export function HealthMetric({
    label,
    value,
    unit,
    min = 0,
    max = 100,
    target,
    trend,
    history,
    className = ''
}: HealthMetricProps) {
    const percentage = ((value - min) / (max - min)) * 100
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null

    return (
        <div className={`health-metric ${className}`}>
            <div className="health-metric__header">
                <span className="health-metric__label">{label}</span>
                {TrendIcon && <TrendIcon size={14} className={`health-metric__trend health-metric__trend--${trend}`} />}
            </div>
            <div className="health-metric__value">{value} <span>{unit}</span></div>
            <div className="health-metric__bar">
                <div className="health-metric__fill" style={{ width: `${Math.min(100, percentage)}%` }} />
                {target && <div className="health-metric__target" style={{ left: `${((target - min) / (max - min)) * 100}%` }} />}
            </div>
            <div className="health-metric__range">
                <span>{min} {unit}</span>
                {target && <span className="health-metric__target-label">Target: {target}</span>}
                <span>{max} {unit}</span>
            </div>
            {history && history.length > 0 && (
                <div className="health-metric__chart">
                    <svg viewBox={`0 0 ${history.length * 20} 40`} preserveAspectRatio="none">
                        <polyline
                            fill="none"
                            stroke="var(--apex-teal)"
                            strokeWidth="2"
                            points={history.map((v, i) => {
                                const y = 40 - ((v - min) / (max - min)) * 38
                                return `${i * 20 + 10},${y}`
                            }).join(' ')}
                        />
                    </svg>
                </div>
            )}
        </div>
    )
}

// Appointment Card
interface Appointment { id: string; type: string; provider: string; specialty?: string; date: Date; location?: string; status: 'upcoming' | 'confirmed' | 'completed' | 'cancelled' }

interface AppointmentCardProps { appointment: Appointment; onReschedule?: () => void; onCancel?: () => void; className?: string }

export function AppointmentCard({ appointment, onReschedule, onCancel, className = '' }: AppointmentCardProps) {
    const isPast = appointment.date < new Date()
    const statusColors = { upcoming: 'var(--apex-teal)', confirmed: '#10b981', completed: 'var(--apex-steel)', cancelled: '#ef4444' }

    return (
        <div className={`appointment-card appointment-card--${appointment.status} ${className}`}>
            <div className="appointment-card__date">
                <span className="appointment-card__day">{appointment.date.getDate()}</span>
                <span className="appointment-card__month">{appointment.date.toLocaleString('default', { month: 'short' })}</span>
            </div>
            <div className="appointment-card__content">
                <span className="appointment-card__type">{appointment.type}</span>
                <span className="appointment-card__provider">{appointment.provider}</span>
                {appointment.specialty && <span className="appointment-card__specialty">{appointment.specialty}</span>}
                <span className="appointment-card__time">
                    <Clock size={12} /> {appointment.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {appointment.location && <span className="appointment-card__location">{appointment.location}</span>}
            </div>
            <div className="appointment-card__status" style={{ color: statusColors[appointment.status] }}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </div>
            {!isPast && appointment.status !== 'cancelled' && (
                <div className="appointment-card__actions">
                    {onReschedule && <button onClick={onReschedule}>Reschedule</button>}
                    {onCancel && <button className="danger" onClick={onCancel}>Cancel</button>}
                </div>
            )}
        </div>
    )
}

// Health Alert
interface HealthAlert { type: 'info' | 'warning' | 'urgent'; title: string; message: string; action?: { label: string; onClick: () => void } }

interface HealthAlertBannerProps { alert: HealthAlert; onDismiss?: () => void; className?: string }

export function HealthAlertBanner({ alert, onDismiss, className = '' }: HealthAlertBannerProps) {
    const icons = { info: Activity, warning: AlertCircle, urgent: CircleAlert }
    const Icon = icons[alert.type]

    return (
        <div className={`health-alert-banner health-alert-banner--${alert.type} ${className}`}>
            <div className="health-alert-banner__icon"><Icon size={20} /></div>
            <div className="health-alert-banner__content">
                <strong>{alert.title}</strong>
                <p>{alert.message}</p>
            </div>
            {alert.action && (
                <button className="health-alert-banner__action" onClick={alert.action.onClick}>
                    {alert.action.label} <ChevronRight size={14} />
                </button>
            )}
        </div>
    )
}

// BMI Calculator Display
interface BMIDisplayProps { weight: number; height: number; unit?: 'metric' | 'imperial'; className?: string }

export function BMIDisplay({ weight, height, unit = 'metric', className = '' }: BMIDisplayProps) {
    const bmi = useMemo(() => {
        if (unit === 'imperial') {
            return (weight / (height * height)) * 703
        }
        return weight / ((height / 100) * (height / 100))
    }, [weight, height, unit])

    const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
    const categoryColor = bmi < 18.5 ? '#f59e0b' : bmi < 25 ? '#10b981' : bmi < 30 ? '#f59e0b' : '#ef4444'

    return (
        <div className={`bmi-display ${className}`}>
            <div className="bmi-display__icon"><Scale size={24} /></div>
            <div className="bmi-display__content">
                <span className="bmi-display__value">{bmi.toFixed(1)}</span>
                <span className="bmi-display__category" style={{ color: categoryColor }}>{category}</span>
            </div>
            <div className="bmi-display__scale">
                <div className="bmi-display__marker" style={{ left: `${Math.min(100, (bmi / 40) * 100)}%` }} />
            </div>
        </div>
    )
}

export default { VitalSignsCard, MedicationCard, HealthMetric, AppointmentCard, HealthAlertBanner, BMIDisplay }
