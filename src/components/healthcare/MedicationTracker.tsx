import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Pill,
    Clock,
    AlertCircle,
    RefreshCcw,
    Calendar,
    ChevronRight,
    CheckCircle2,
    MapPin,
    Phone,
    Plus,
    Bell
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './MedicationTracker.css'

// Medication data
interface Medication {
    id: string
    name: string
    genericName: string
    dosage: string
    frequency: string
    timeOfDay: ('morning' | 'afternoon' | 'evening' | 'bedtime')[]
    prescriber: string
    pharmacy: string
    pharmacyPhone: string
    refillsRemaining: number
    daysUntilRefill: number
    lastFilled: string
    sideEffects?: string[]
    instructions?: string
    adherence: number
    isControlled: boolean
}

const medications: Medication[] = [
    {
        id: 'med-1',
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        timeOfDay: ['morning'],
        prescriber: 'Dr. Sarah Chen',
        pharmacy: 'Apex Pharmacy',
        pharmacyPhone: '(555) 123-4567',
        refillsRemaining: 3,
        daysUntilRefill: 12,
        lastFilled: '2024-01-15',
        instructions: 'Take with or without food. Stay hydrated.',
        adherence: 95,
        isControlled: false
    },
    {
        id: 'med-2',
        name: 'Metformin',
        genericName: 'Metformin HCl',
        dosage: '500mg',
        frequency: 'Twice daily',
        timeOfDay: ['morning', 'evening'],
        prescriber: 'Dr. Sarah Chen',
        pharmacy: 'Apex Pharmacy',
        pharmacyPhone: '(555) 123-4567',
        refillsRemaining: 5,
        daysUntilRefill: 25,
        lastFilled: '2024-01-10',
        instructions: 'Take with meals to reduce stomach upset.',
        adherence: 88,
        isControlled: false
    },
    {
        id: 'med-3',
        name: 'Atorvastatin',
        genericName: 'Atorvastatin Calcium',
        dosage: '20mg',
        frequency: 'Once daily',
        timeOfDay: ['bedtime'],
        prescriber: 'Dr. Michael Rivera',
        pharmacy: 'CVS Pharmacy',
        pharmacyPhone: '(555) 234-5678',
        refillsRemaining: 1,
        daysUntilRefill: 5,
        lastFilled: '2024-01-20',
        sideEffects: ['Muscle pain', 'Nausea'],
        instructions: 'Take at bedtime for best effectiveness.',
        adherence: 92,
        isControlled: false
    }
]

// Upcoming doses
interface UpcomingDose {
    medication: Medication
    scheduledTime: string
    taken: boolean
}

const todaysDoses: UpcomingDose[] = [
    { medication: medications[0], scheduledTime: '8:00 AM', taken: true },
    { medication: medications[1], scheduledTime: '8:00 AM', taken: true },
    { medication: medications[1], scheduledTime: '6:00 PM', taken: false },
    { medication: medications[2], scheduledTime: '10:00 PM', taken: false }
]

export function MedicationTracker() {
    const [selectedMed, setSelectedMed] = useState<Medication | null>(null)
    const [activeTab, setActiveTab] = useState<'medications' | 'schedule'>('medications')

    const lowRefillMeds = medications.filter(m => m.daysUntilRefill <= 7 || m.refillsRemaining <= 1)
    const avgAdherence = Math.round(medications.reduce((sum, m) => sum + m.adherence, 0) / medications.length)

    const getTimeIcon = (times: string[]) => {
        if (times.includes('morning')) return '🌅'
        if (times.includes('afternoon')) return '☀️'
        if (times.includes('evening')) return '🌆'
        if (times.includes('bedtime')) return '🌙'
        return '💊'
    }

    return (
        <div className="medication-tracker">
            {/* Header */}
            <div className="medication-tracker__header">
                <div className="medication-tracker__title">
                    <Pill size={22} className="medication-tracker__icon" />
                    <div>
                        <h2>Medications</h2>
                        <p>{medications.length} active prescriptions</p>
                    </div>
                </div>
                <Button variant="primary" size="sm" icon={<Plus size={16} />}>
                    Add Medication
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="medication-summary">
                <GlassCard className="summary-card">
                    <div className="summary-card__icon summary-card__icon--success">
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="summary-card__content">
                        <span className="summary-card__value">{avgAdherence}%</span>
                        <span className="summary-card__label">Adherence Rate</span>
                    </div>
                </GlassCard>
                <GlassCard className="summary-card">
                    <div className="summary-card__icon summary-card__icon--info">
                        <Clock size={20} />
                    </div>
                    <div className="summary-card__content">
                        <span className="summary-card__value">{todaysDoses.filter(d => d.taken).length}/{todaysDoses.length}</span>
                        <span className="summary-card__label">Today's Doses</span>
                    </div>
                </GlassCard>
                {lowRefillMeds.length > 0 && (
                    <GlassCard className="summary-card summary-card--alert">
                        <div className="summary-card__icon summary-card__icon--warning">
                            <AlertCircle size={20} />
                        </div>
                        <div className="summary-card__content">
                            <span className="summary-card__value">{lowRefillMeds.length}</span>
                            <span className="summary-card__label">Need Refill</span>
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* Tabs */}
            <div className="medication-tabs">
                <button
                    className={`medication-tab ${activeTab === 'medications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('medications')}
                >
                    All Medications
                </button>
                <button
                    className={`medication-tab ${activeTab === 'schedule' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schedule')}
                >
                    Today's Schedule
                </button>
            </div>

            {/* Medications List */}
            {activeTab === 'medications' && (
                <div className="medication-list">
                    {medications.map((med, index) => (
                        <motion.div
                            key={med.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <GlassCard
                                className={`medication-card ${selectedMed?.id === med.id ? 'selected' : ''}`}
                                onClick={() => setSelectedMed(selectedMed?.id === med.id ? null : med)}
                            >
                                <div className="medication-card__main">
                                    <div className="medication-card__icon">
                                        <Pill size={20} />
                                    </div>
                                    <div className="medication-card__info">
                                        <div className="medication-card__header">
                                            <h3>{med.name}</h3>
                                            {med.daysUntilRefill <= 7 && (
                                                <Badge variant="warning" size="sm">
                                                    Refill Soon
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="medication-card__dosage">{med.dosage} • {med.frequency}</span>
                                        <div className="medication-card__timing">
                                            {med.timeOfDay.map(time => (
                                                <span key={time} className="timing-badge">
                                                    {getTimeIcon([time])} {time.charAt(0).toUpperCase() + time.slice(1)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="medication-card__adherence">
                                        <div className="adherence-ring" style={{ '--adherence': med.adherence } as React.CSSProperties}>
                                            <span>{med.adherence}%</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedMed?.id === med.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="medication-card__details"
                                    >
                                        <div className="medication-detail-grid">
                                            <div className="medication-detail">
                                                <span className="medication-detail__label">Generic Name</span>
                                                <span className="medication-detail__value">{med.genericName}</span>
                                            </div>
                                            <div className="medication-detail">
                                                <span className="medication-detail__label">Prescriber</span>
                                                <span className="medication-detail__value">{med.prescriber}</span>
                                            </div>
                                            <div className="medication-detail">
                                                <span className="medication-detail__label">Refills Remaining</span>
                                                <span className="medication-detail__value">{med.refillsRemaining}</span>
                                            </div>
                                            <div className="medication-detail">
                                                <span className="medication-detail__label">Days Until Refill</span>
                                                <span className="medication-detail__value">{med.daysUntilRefill} days</span>
                                            </div>
                                        </div>
                                        {med.instructions && (
                                            <div className="medication-instructions">
                                                <AlertCircle size={14} />
                                                <span>{med.instructions}</span>
                                            </div>
                                        )}
                                        <div className="medication-card__actions">
                                            <Button variant="secondary" size="sm" icon={<RefreshCcw size={14} />}>
                                                Request Refill
                                            </Button>
                                            <Button variant="ghost" size="sm" icon={<Phone size={14} />}>
                                                Call Pharmacy
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Today's Schedule */}
            {activeTab === 'schedule' && (
                <div className="schedule-list">
                    {todaysDoses.map((dose, index) => (
                        <motion.div
                            key={`${dose.medication.id}-${index}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`schedule-item ${dose.taken ? 'taken' : ''}`}
                        >
                            <div className="schedule-item__time">{dose.scheduledTime}</div>
                            <div className="schedule-item__content">
                                <div className="schedule-item__medication">
                                    <Pill size={16} />
                                    <span>{dose.medication.name}</span>
                                    <span className="schedule-item__dosage">{dose.medication.dosage}</span>
                                </div>
                            </div>
                            <div className="schedule-item__status">
                                {dose.taken ? (
                                    <CheckCircle2 size={20} className="status-taken" />
                                ) : (
                                    <button className="mark-taken-btn">Mark Taken</button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MedicationTracker
