import { useState, useEffect, useRef, useCallback } from 'react'
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
    Camera,
    CameraOff,
    MessageSquare,
    FileText,
    Stethoscope,
    Heart,
    Brain,
    Activity,
    Shield,
    CheckCircle2,
    Plus,
    PhoneOff,
    Send,
    X,
    AlertCircle
} from 'lucide-react'
import { GlassCard, Badge, Button, PageSkeleton } from '../components/common'
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

interface ChatMessage {
    id: string
    sender: 'you' | 'doctor'
    text: string
    time: string
}

interface ScheduleForm {
    visitType: string
    provider: string
    date: string
    time: string
    reason: string
}

interface ScheduleErrors {
    visitType?: string
    date?: string
    time?: string
    reason?: string
}

export function Telehealth() {
    const [providers] = useState<Provider[]>(mockProviders)
    const [upcomingVisits] = useState<UpcomingVisit[]>(mockUpcomingVisits)
    const [activeTab, setActiveTab] = useState<'start-visit' | 'schedule' | 'history'>('start-visit')
    const [selectedVisitType, setSelectedVisitType] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Video call state
    const [inCall, setInCall] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [callDuration, setCallDuration] = useState(0)
    const [callProvider, setCallProvider] = useState<{ name: string; specialty: string }>({
        name: 'Dr. Amanda Foster',
        specialty: 'Family Medicine'
    })
    const [chatOpen, setChatOpen] = useState(false)
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { id: '1', sender: 'doctor', text: 'Hello! I can see you now. How can I help you today?', time: '0:05' }
    ])
    const [chatInput, setChatInput] = useState('')
    const [cameraError, setCameraError] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)

    // Schedule form state
    const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
        visitType: '', provider: '', date: '', time: '', reason: ''
    })
    const [scheduleErrors, setScheduleErrors] = useState<ScheduleErrors>({})
    const [scheduleSuccess, setScheduleSuccess] = useState(false)

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    // Call timer
    useEffect(() => {
        if (inCall) {
            callTimerRef.current = setInterval(() => {
                setCallDuration(d => d + 1)
            }, 1000)
        }
        return () => {
            if (callTimerRef.current) clearInterval(callTimerRef.current)
        }
    }, [inCall])

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages])

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 4000)
            return () => clearTimeout(t)
        }
    }, [toast])

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
    }

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const startCall = useCallback(async (providerName?: string, providerSpecialty?: string) => {
        setCameraError(null)
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            setStream(mediaStream)
            setInCall(true)
            setCallDuration(0)
            setIsMuted(false)
            setIsVideoOff(false)
            if (providerName && providerSpecialty) {
                setCallProvider({ name: providerName, specialty: providerSpecialty })
            }
            // Attach stream to video after a tick so the ref is mounted
            requestAnimationFrame(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream
                }
            })
        } catch (err) {
            console.error('Camera access error:', err)
            setCameraError('Camera or microphone access was denied. Please allow permissions and try again.')
            showToast('Camera access denied. Please check your browser permissions.', 'error')
        }
    }, [])

    const endCall = useCallback(() => {
        stream?.getTracks().forEach(t => t.stop())
        setStream(null)
        setInCall(false)
        setCallDuration(0)
        setChatOpen(false)
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current)
            callTimerRef.current = null
        }
        showToast('Call ended. Visit summary will be available in your history.', 'success')
    }, [stream])

    const toggleMute = useCallback(() => {
        stream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
        setIsMuted(m => !m)
    }, [stream])

    const toggleVideo = useCallback(() => {
        stream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
        setIsVideoOff(v => !v)
    }, [stream])

    const sendChatMessage = () => {
        if (!chatInput.trim()) return
        const now = formatDuration(callDuration)
        setChatMessages(prev => [
            ...prev,
            { id: `msg-${Date.now()}`, sender: 'you', text: chatInput.trim(), time: now }
        ])
        setChatInput('')
        // Simulate doctor reply after a short delay
        setTimeout(() => {
            setChatMessages(prev => [
                ...prev,
                { id: `msg-${Date.now()}-reply`, sender: 'doctor', text: 'Thank you for sharing that. Let me take a look.', time: formatDuration(callDuration + 3) }
            ])
        }, 2500)
    }

    // Schedule form logic
    const validateScheduleForm = (): boolean => {
        const errors: ScheduleErrors = {}
        if (!scheduleForm.visitType) errors.visitType = 'Please select a visit type'
        if (!scheduleForm.date) errors.date = 'Please select a date'
        if (!scheduleForm.time) errors.time = 'Please select a time'
        if (!scheduleForm.reason.trim()) errors.reason = 'Please describe your reason for visiting'
        setScheduleErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleScheduleSubmit = () => {
        if (!validateScheduleForm()) return
        setScheduleSuccess(true)
        showToast('Visit scheduled successfully! You will receive a confirmation email shortly.', 'success')
        // Reset form after brief display
        setTimeout(() => {
            setScheduleForm({ visitType: '', provider: '', date: '', time: '', reason: '' })
            setScheduleErrors({})
            setScheduleSuccess(false)
        }, 3000)
    }

    const updateScheduleField = (field: keyof ScheduleForm, value: string) => {
        setScheduleForm(prev => ({ ...prev, [field]: value }))
        // Clear error for this field when user types
        if (scheduleErrors[field as keyof ScheduleErrors]) {
            setScheduleErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    if (loading) return <PageSkeleton />

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    return (
        <div className="telehealth-page">
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={`telehealth-toast telehealth-toast--${toast.type}`}
                        initial={{ opacity: 0, y: -40, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -40, x: '-50%' }}
                    >
                        {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{toast.message}</span>
                        <button className="telehealth-toast__close" onClick={() => setToast(null)}>
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Camera Error Banner */}
            <AnimatePresence>
                {cameraError && !inCall && (
                    <motion.div
                        className="telehealth-camera-error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <AlertCircle size={18} />
                        <span>{cameraError}</span>
                        <button onClick={() => setCameraError(null)}><X size={14} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========== VIDEO CALL OVERLAY ========== */}
            <AnimatePresence>
                {inCall && (
                    <motion.div
                        className="video-call-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Video Feed */}
                        <div className="video-call__main">
                            <div className={`video-call__feed ${isVideoOff ? 'video-off' : ''}`}>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="video-call__video"
                                />
                                {isVideoOff && (
                                    <div className="video-call__video-off-placeholder">
                                        <CameraOff size={48} />
                                        <span>Camera is off</span>
                                    </div>
                                )}
                            </div>

                            {/* Provider Info (floating) */}
                            <div className="video-call__provider-info">
                                <div className="video-call__provider-avatar">
                                    <User size={16} />
                                </div>
                                <div>
                                    <span className="video-call__provider-name">{callProvider.name}</span>
                                    <span className="video-call__provider-specialty">{callProvider.specialty}</span>
                                </div>
                            </div>

                            {/* Call Timer */}
                            <div className="video-call__timer">
                                <span className="video-call__timer-dot" />
                                {formatDuration(callDuration)}
                            </div>

                            {/* Controls Bar */}
                            <div className="video-call__controls">
                                <button
                                    className={`video-call__control-btn ${isMuted ? 'active' : ''}`}
                                    onClick={toggleMute}
                                    title={isMuted ? 'Unmute' : 'Mute'}
                                >
                                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                                    <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                                </button>

                                <button
                                    className={`video-call__control-btn ${isVideoOff ? 'active' : ''}`}
                                    onClick={toggleVideo}
                                    title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
                                >
                                    {isVideoOff ? <CameraOff size={22} /> : <Camera size={22} />}
                                    <span>{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
                                </button>

                                <button
                                    className={`video-call__control-btn ${chatOpen ? 'active' : ''}`}
                                    onClick={() => setChatOpen(o => !o)}
                                    title="Chat"
                                >
                                    <MessageSquare size={22} />
                                    <span>Chat</span>
                                </button>

                                <button
                                    className="video-call__control-btn video-call__control-btn--end"
                                    onClick={endCall}
                                    title="End call"
                                >
                                    <PhoneOff size={22} />
                                    <span>End</span>
                                </button>
                            </div>
                        </div>

                        {/* Chat Sidebar */}
                        <AnimatePresence>
                            {chatOpen && (
                                <motion.div
                                    className="video-call__chat"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 360, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                >
                                    <div className="video-call__chat-header">
                                        <h4>In-Call Chat</h4>
                                        <button onClick={() => setChatOpen(false)}>
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <div className="video-call__chat-messages">
                                        {chatMessages.map(msg => (
                                            <div
                                                key={msg.id}
                                                className={`video-call__chat-msg video-call__chat-msg--${msg.sender}`}
                                            >
                                                <span className="video-call__chat-msg-text">{msg.text}</span>
                                                <span className="video-call__chat-msg-time">{msg.time}</span>
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>

                                    <div className="video-call__chat-input">
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                                        />
                                        <button onClick={sendChatMessage} disabled={!chatInput.trim()}>
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="telehealth__header">
                <div>
                    <h1 className="telehealth__title">Telehealth</h1>
                    <p className="telehealth__subtitle">
                        See a doctor from the comfort of your home
                    </p>
                </div>
                <div className="telehealth__actions">
                    <Button
                        variant="primary"
                        icon={<Video size={16} />}
                        onClick={() => startCall()}
                    >
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
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={<Play size={14} />}
                                    onClick={() => startCall(visit.provider, visit.specialty)}
                                >
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
                                            onClick={() => {
                                                if (provider.available) {
                                                    startCall(provider.name, provider.specialty)
                                                } else {
                                                    setActiveTab('schedule')
                                                    updateScheduleField('provider', provider.id)
                                                }
                                            }}
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

                            {scheduleSuccess ? (
                                <motion.div
                                    className="schedule-success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <CheckCircle2 size={48} />
                                    <h4>Visit Scheduled!</h4>
                                    <p>You will receive a confirmation email with your visit details and a link to join.</p>
                                </motion.div>
                            ) : (
                                <div className="schedule-form">
                                    <div className={`schedule-form__field ${scheduleErrors.visitType ? 'has-error' : ''}`}>
                                        <label>Visit Type <span className="required">*</span></label>
                                        <select
                                            value={scheduleForm.visitType}
                                            onChange={e => updateScheduleField('visitType', e.target.value)}
                                        >
                                            <option value="">Select visit type...</option>
                                            {visitTypes.map(type => (
                                                <option key={type.id} value={type.id}>{type.name}</option>
                                            ))}
                                        </select>
                                        {scheduleErrors.visitType && (
                                            <span className="schedule-form__error">
                                                <AlertCircle size={12} /> {scheduleErrors.visitType}
                                            </span>
                                        )}
                                    </div>
                                    <div className="schedule-form__field">
                                        <label>Preferred Provider (optional)</label>
                                        <select
                                            value={scheduleForm.provider}
                                            onChange={e => updateScheduleField('provider', e.target.value)}
                                        >
                                            <option value="">Any available provider</option>
                                            {providers.map(prov => (
                                                <option key={prov.id} value={prov.id}>{prov.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="schedule-form__row">
                                        <div className={`schedule-form__field ${scheduleErrors.date ? 'has-error' : ''}`}>
                                            <label>Date <span className="required">*</span></label>
                                            <input
                                                type="date"
                                                value={scheduleForm.date}
                                                onChange={e => updateScheduleField('date', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            {scheduleErrors.date && (
                                                <span className="schedule-form__error">
                                                    <AlertCircle size={12} /> {scheduleErrors.date}
                                                </span>
                                            )}
                                        </div>
                                        <div className={`schedule-form__field ${scheduleErrors.time ? 'has-error' : ''}`}>
                                            <label>Time <span className="required">*</span></label>
                                            <select
                                                value={scheduleForm.time}
                                                onChange={e => updateScheduleField('time', e.target.value)}
                                            >
                                                <option value="">Select time...</option>
                                                <option value="9:00 AM">9:00 AM</option>
                                                <option value="10:00 AM">10:00 AM</option>
                                                <option value="11:00 AM">11:00 AM</option>
                                                <option value="1:00 PM">1:00 PM</option>
                                                <option value="2:00 PM">2:00 PM</option>
                                                <option value="3:00 PM">3:00 PM</option>
                                            </select>
                                            {scheduleErrors.time && (
                                                <span className="schedule-form__error">
                                                    <AlertCircle size={12} /> {scheduleErrors.time}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`schedule-form__field ${scheduleErrors.reason ? 'has-error' : ''}`}>
                                        <label>Reason for visit <span className="required">*</span></label>
                                        <textarea
                                            placeholder="Describe your symptoms or reason for visit..."
                                            value={scheduleForm.reason}
                                            onChange={e => updateScheduleField('reason', e.target.value)}
                                        />
                                        {scheduleErrors.reason && (
                                            <span className="schedule-form__error">
                                                <AlertCircle size={12} /> {scheduleErrors.reason}
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        variant="primary"
                                        icon={<Calendar size={16} />}
                                        onClick={handleScheduleSubmit}
                                    >
                                        Schedule Visit
                                    </Button>
                                </div>
                            )}
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
                                <Button
                                    variant="secondary"
                                    icon={<Video size={16} />}
                                    onClick={() => startCall()}
                                >
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
