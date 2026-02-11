import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Video,
    Phone,
    Calendar,
    Clock,
    User,
    Star,
    ChevronRight,
    Play,
    Mic,
    MicOff,
    VideoOff,
    MessageSquare,
    FileText,
    Stethoscope,
    Heart,
    Brain,
    Activity,
    Shield,
    CheckCircle2,
    Plus
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard, PageSkeleton } from '../components/common'
import './Telehealth.css'

interface Provider {
    id: string
    name: string
    specialty: string
    avatar?: string
    rating: number
    reviewCount: number
    nextAvailable: string
    consultationFee: number
    languages: string[]
    available: boolean
}

interface VisitType {
    id: string
    name: string
    description: string
    icon: React.ReactNode
    duration: string
    copay: number
    popular: boolean
}

interface UpcomingVisit {
    id: string
    provider: string
    specialty: string
    date: string
    time: string
    type: 'video' | 'phone'
    status: 'confirmed' | 'waiting' | 'completed'
}

const visitTypes: VisitType[] = [
    {
        id: 'urgent',
        name: 'Urgent Care',
        description: 'Flu, cold, infections, minor injuries',
        icon: <Activity size={24} />,
        duration: '15-20 min',
        copay: 0,
        popular: true
    },
    {
        id: 'primary',
        name: 'Primary Care',
        description: 'General health, chronic conditions, preventive care',
        icon: <Stethoscope size={24} />,
        duration: '20-30 min',
        copay: 25,
        popular: false
    },
    {
        id: 'mental',
        name: 'Mental Health',
        description: 'Anxiety, depression, stress management',
        icon: <Brain size={24} />,
        duration: '45-60 min',
        copay: 25,
        popular: true
    },
    {
        id: 'dermatology',
        name: 'Dermatology',
        description: 'Skin conditions, rashes, acne',
        icon: <Heart size={24} />,
        duration: '15-20 min',
        copay: 50,
        popular: false
    }
]

const mockProviders: Provider[] = [
    {
        id: 'prov-1',
        name: 'Dr. Amanda Foster',
        specialty: 'Family Medicine',
        rating: 4.9,
        reviewCount: 324,
        nextAvailable: '10 min',
        consultationFee: 0,
        languages: ['English', 'Spanish'],
        available: true
    },
    {
        id: 'prov-2',
        name: 'Dr. James Mitchell',
        specialty: 'Internal Medicine',
        rating: 4.8,
        reviewCount: 256,
        nextAvailable: '25 min',
        consultationFee: 0,
        languages: ['English'],
        available: true
    },
    {
        id: 'prov-3',
        name: 'Dr. Sarah Kim',
        specialty: 'Psychiatry',
        rating: 4.9,
        reviewCount: 189,
        nextAvailable: 'Tomorrow 9:00 AM',
        consultationFee: 25,
        languages: ['English', 'Korean'],
        available: false
    }
]

const mockUpcomingVisits: UpcomingVisit[] = [
    {
        id: 'visit-1',
        provider: 'Dr. Sarah Chen',
        specialty: 'Primary Care',
        date: '2024-01-28',
        time: '10:00 AM',
        type: 'video',
        status: 'confirmed'
    }
]

export function Telehealth() {
    const [providers] = useState<Provider[]>(mockProviders)
    const [upcomingVisits] = useState<UpcomingVisit[]>(mockUpcomingVisits)
    const [activeTab, setActiveTab] = useState<'start-visit' | 'schedule' | 'history'>('start-visit')
    const [selectedVisitType, setSelectedVisitType] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    if (loading) return <PageSkeleton />

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    return (
        <div className="telehealth-page">
            {/* Header */}
            <div className="telehealth__header">
                <div>
                    <h1 className="telehealth__title">Telehealth</h1>
                    <p className="telehealth__subtitle">
                        See a doctor from the comfort of your home
                    </p>
                </div>
                <div className="telehealth__actions">
                    <Button variant="primary" icon={<Video size={16} />}>
                        Start Video Visit
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="telehealth__quick-stats">
                <div className="quick-stat">
                    <Clock size={20} />
                    <span>Average wait: <strong>12 min</strong></span>
                </div>
                <div className="quick-stat">
                    <User size={20} />
                    <span><strong>47</strong> providers available now</span>
                </div>
                <div className="quick-stat">
                    <Shield size={20} />
                    <span>$0 copay for urgent care visits</span>
                </div>
            </div>

            {/* Upcoming Visits */}
            {upcomingVisits.length > 0 && (
                <GlassCard className="telehealth__upcoming">
                    <h3>Upcoming Visits</h3>
                    <div className="upcoming-visits__list">
                        {upcomingVisits.map((visit) => (
                            <div key={visit.id} className="upcoming-visit">
                                <div className="upcoming-visit__icon">
                                    {visit.type === 'video' ? <Video size={20} /> : <Phone size={20} />}
                                </div>
                                <div className="upcoming-visit__info">
                                    <span className="upcoming-visit__provider">{visit.provider}</span>
                                    <span className="upcoming-visit__specialty">{visit.specialty}</span>
                                </div>
                                <div className="upcoming-visit__datetime">
                                    <span className="upcoming-visit__date">
                                        <Calendar size={14} /> {formatDate(visit.date)}
                                    </span>
                                    <span className="upcoming-visit__time">
                                        <Clock size={14} /> {visit.time}
                                    </span>
                                </div>
                                <Badge variant="success" icon={<CheckCircle2 size={10} />}>
                                    {visit.status}
                                </Badge>
                                <Button variant="primary" size="sm" icon={<Play size={14} />}>
                                    Join
                                </Button>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* Tabs */}
            <div className="telehealth__tabs">
                <button
                    className={`telehealth__tab ${activeTab === 'start-visit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('start-visit')}
                >
                    <Play size={16} />
                    Start a Visit
                </button>
                <button
                    className={`telehealth__tab ${activeTab === 'schedule' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schedule')}
                >
                    <Calendar size={16} />
                    Schedule
                </button>
                <button
                    className={`telehealth__tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <FileText size={16} />
                    Visit History
                </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'start-visit' && (
                    <motion.div
                        key="start-visit"
                        className="telehealth__content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {/* Visit Types */}
                        <div className="visit-types">
                            <h3>What brings you in today?</h3>
                            <div className="visit-types__grid">
                                {visitTypes.map((type, index) => (
                                    <motion.button
                                        key={type.id}
                                        className={`visit-type-card ${selectedVisitType === type.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedVisitType(type.id)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        {type.popular && (
                                            <Badge variant="teal" size="sm" className="visit-type-card__badge">
                                                Popular
                                            </Badge>
                                        )}
                                        <div className="visit-type-card__icon">{type.icon}</div>
                                        <h4>{type.name}</h4>
                                        <p>{type.description}</p>
                                        <div className="visit-type-card__meta">
                                            <span className="visit-type-card__duration">
                                                <Clock size={12} /> {type.duration}
                                            </span>
                                            <span className="visit-type-card__copay">
                                                {type.copay === 0 ? (
                                                    <Badge variant="success" size="sm">$0 copay</Badge>
                                                ) : (
                                                    `$${type.copay}`
                                                )}
                                            </span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Available Providers */}
                        <div className="available-providers">
                            <h3>Available Now</h3>
                            <div className="providers__list">
                                {providers.map((provider, index) => (
                                    <motion.div
                                        key={provider.id}
                                        className="provider-card"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="provider-card__avatar">
                                            <User size={24} />
                                            {provider.available && <span className="online-dot" />}
                                        </div>
                                        <div className="provider-card__info">
                                            <h4>{provider.name}</h4>
                                            <span className="provider-card__specialty">{provider.specialty}</span>
                                            <div className="provider-card__rating">
                                                <Star size={12} fill="currentColor" />
                                                {provider.rating} ({provider.reviewCount} reviews)
                                            </div>
                                        </div>
                                        <div className="provider-card__availability">
                                            <span className={`provider-card__next ${provider.available ? 'available' : ''}`}>
                                                {provider.available ? (
                                                    <>Available in {provider.nextAvailable}</>
                                                ) : (
                                                    <>Next: {provider.nextAvailable}</>
                                                )}
                                            </span>
                                            <span className="provider-card__languages">
                                                {provider.languages.join(', ')}
                                            </span>
                                        </div>
                                        <Button
                                            variant={provider.available ? 'primary' : 'secondary'}
                                            size="sm"
                                            icon={provider.available ? <Video size={14} /> : <Calendar size={14} />}
                                        >
                                            {provider.available ? 'Start Visit' : 'Schedule'}
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'schedule' && (
                    <motion.div
                        key="schedule"
                        className="telehealth__content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <GlassCard className="schedule-card">
                            <h3>Schedule a Future Visit</h3>
                            <p className="schedule-card__subtitle">
                                Choose a date and time that works for you
                            </p>

                            <div className="schedule-form">
                                <div className="schedule-form__field">
                                    <label>Visit Type</label>
                                    <select>
                                        <option>Select visit type...</option>
                                        {visitTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="schedule-form__field">
                                    <label>Preferred Provider (optional)</label>
                                    <select>
                                        <option>Any available provider</option>
                                        {providers.map(prov => (
                                            <option key={prov.id} value={prov.id}>{prov.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="schedule-form__row">
                                    <div className="schedule-form__field">
                                        <label>Date</label>
                                        <input type="date" />
                                    </div>
                                    <div className="schedule-form__field">
                                        <label>Time</label>
                                        <select>
                                            <option>9:00 AM</option>
                                            <option>10:00 AM</option>
                                            <option>11:00 AM</option>
                                            <option>1:00 PM</option>
                                            <option>2:00 PM</option>
                                            <option>3:00 PM</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="schedule-form__field">
                                    <label>Reason for visit</label>
                                    <textarea placeholder="Describe your symptoms or reason for visit..."></textarea>
                                </div>
                                <Button variant="primary" icon={<Calendar size={16} />}>
                                    Schedule Visit
                                </Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'history' && (
                    <motion.div
                        key="history"
                        className="telehealth__content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <GlassCard className="history-card">
                            <h3>Visit History</h3>
                            <div className="history-empty">
                                <Video size={48} />
                                <p>No past telehealth visits</p>
                                <Button variant="secondary" icon={<Video size={16} />}>
                                    Start Your First Visit
                                </Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* How It Works */}
            <GlassCard className="telehealth__how-it-works">
                <h3>How Virtual Visits Work</h3>
                <div className="how-it-works__steps">
                    <div className="how-it-works__step">
                        <div className="how-it-works__number">1</div>
                        <h4>Choose Your Visit</h4>
                        <p>Select the type of care you need</p>
                    </div>
                    <ChevronRight size={24} className="how-it-works__arrow" />
                    <div className="how-it-works__step">
                        <div className="how-it-works__number">2</div>
                        <h4>Connect with a Provider</h4>
                        <p>Video chat with a licensed doctor</p>
                    </div>
                    <ChevronRight size={24} className="how-it-works__arrow" />
                    <div className="how-it-works__step">
                        <div className="how-it-works__number">3</div>
                        <h4>Get Treatment</h4>
                        <p>Receive prescriptions and care plan</p>
                    </div>
                </div>
            </GlassCard>
        </div>
    )
}

export default Telehealth
