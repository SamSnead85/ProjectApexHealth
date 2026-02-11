import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Phone, PhoneOff, Mic, MicOff, Volume2, Settings,
    MessageSquare, Clock, Activity, User, Bot
} from 'lucide-react'
import './VoiceAgentBuilder.css'

// ============================================================================
// VOICE AGENT BUILDER — Functional Voice Agent with Web Speech API
// Real mic input, real text-to-speech, healthcare response tree
// ============================================================================

declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition
        webkitSpeechRecognition: typeof SpeechRecognition
    }
}

interface TranscriptMessage {
    id: string
    role: 'caller' | 'agent'
    text: string
    timestamp: Date
    sentiment: 'positive' | 'neutral' | 'negative'
}

interface AgentConfig {
    name: string
    greeting: string
    voiceIndex: number
    speed: number
}

// ── Response tree for healthcare scenarios ──────────────────────────────
function matchResponse(input: string): string {
    const lower = input.toLowerCase()
    if (/\b(claim|claims)\b/.test(lower))
        return "I can help you with your claim. Can you provide your claim number so I can look that up for you?"
    if (/\b(appointment|schedule|visit)\b/.test(lower))
        return "I'd be happy to help schedule an appointment. What type of visit do you need — primary care, specialist, or urgent care?"
    if (/\b(prescription|refill|medication|medicine)\b/.test(lower))
        return "Let me look up your prescription information. Can you confirm your member ID so I can pull up your records?"
    if (/\b(bill|billing|statement|payment|pay)\b/.test(lower))
        return "I can help with billing questions. Are you calling about a specific statement or a recent charge?"
    if (/\b(coverage|covered|benefits|plan)\b/.test(lower))
        return "I can check your coverage details. Could you tell me the service or procedure you're asking about?"
    if (/\b(referral|refer)\b/.test(lower))
        return "I can assist with referrals. Do you already have a provider in mind, or would you like recommendations?"
    if (/\b(emergency|urgent)\b/.test(lower))
        return "If this is a medical emergency, please hang up and dial 911. Otherwise, I can help locate an urgent care facility near you."
    if (/\b(thank|thanks|bye|goodbye)\b/.test(lower))
        return "You're welcome! Is there anything else I can help you with before we end the call?"
    if (/\b(yes|yeah|sure|okay|ok)\b/.test(lower))
        return "Great. Please go ahead and I'll do my best to assist you."
    if (/\b(no|nope|nothing|that's all|that's it)\b/.test(lower))
        return "Alright, thank you for calling Apex Health. Have a wonderful day!"
    return "I understand. Let me connect you with a specialist who can help with that. One moment please."
}

function detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const lower = text.toLowerCase()
    if (/\b(thank|thanks|great|good|happy|appreciate|wonderful|love|excellent|perfect)\b/.test(lower)) return 'positive'
    if (/\b(angry|upset|frustrated|terrible|horrible|worst|bad|hate|ridiculous|unacceptable)\b/.test(lower)) return 'negative'
    return 'neutral'
}

function detectTopics(messages: TranscriptMessage[]): string[] {
    const topics = new Set<string>()
    const text = messages.map(m => m.text).join(' ').toLowerCase()
    if (/claim/.test(text)) topics.add('Claims')
    if (/appointment|schedule|visit/.test(text)) topics.add('Appointments')
    if (/prescription|refill|medication/.test(text)) topics.add('Prescriptions')
    if (/bill|billing|payment/.test(text)) topics.add('Billing')
    if (/coverage|benefits|plan/.test(text)) topics.add('Coverage')
    if (/referral/.test(text)) topics.add('Referrals')
    if (topics.size === 0) topics.add('General Inquiry')
    return Array.from(topics)
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatTimestamp(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ── Main Component ──────────────────────────────────────────────────────
export default function VoiceAgentBuilder() {
    // Agent configuration
    const [config, setConfig] = useState<AgentConfig>({
        name: 'Aria',
        greeting: 'Thank you for calling Apex Health. How can I help you today?',
        voiceIndex: 0,
        speed: 0.95,
    })
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

    // Call state
    const [callActive, setCallActive] = useState(false)
    const [muted, setMuted] = useState(false)
    const [volume, setVolume] = useState(80)
    const [callDuration, setCallDuration] = useState(0)
    const [agentSpeaking, setAgentSpeaking] = useState(false)
    const [listening, setListening] = useState(false)

    // Transcript
    const [messages, setMessages] = useState<TranscriptMessage[]>([])
    const [interimText, setInterimText] = useState('')

    // Refs
    const recognitionRef = useRef<SpeechRecognition | null>(null)
    const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const transcriptEndRef = useRef<HTMLDivElement | null>(null)
    const messagesRef = useRef<TranscriptMessage[]>([])

    // Keep messagesRef in sync
    useEffect(() => { messagesRef.current = messages }, [messages])

    // ── Load voices ─────────────────────────────────────────────────────
    useEffect(() => {
        const loadVoices = () => {
            const v = window.speechSynthesis.getVoices()
            if (v.length > 0) setVoices(v)
        }
        loadVoices()
        window.speechSynthesis.onvoiceschanged = loadVoices
    }, [])

    // ── Auto-scroll transcript ──────────────────────────────────────────
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, interimText])

    // ── Call duration timer ─────────────────────────────────────────────
    useEffect(() => {
        if (callActive) {
            timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000)
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [callActive])

    // ── Speak function ──────────────────────────────────────────────────
    const speak = useCallback((text: string) => {
        if (!synthRef.current) return
        synthRef.current.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = config.speed
        utterance.pitch = 1.0
        utterance.volume = volume / 100
        if (voices.length > 0 && voices[config.voiceIndex]) {
            utterance.voice = voices[config.voiceIndex]
        }
        utterance.onstart = () => setAgentSpeaking(true)
        utterance.onend = () => {
            setAgentSpeaking(false)
            // Resume listening after agent finishes speaking
            if (recognitionRef.current && !muted) {
                try { recognitionRef.current.start() } catch { /* already started */ }
            }
        }
        // Pause recognition while agent speaks
        if (recognitionRef.current) {
            try { recognitionRef.current.stop() } catch { /* ok */ }
        }
        synthRef.current.speak(utterance)
    }, [config.speed, config.voiceIndex, volume, voices, muted])

    // ── Add a message helper ────────────────────────────────────────────
    const addMessage = useCallback((role: 'caller' | 'agent', text: string) => {
        const msg: TranscriptMessage = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            role,
            text,
            timestamp: new Date(),
            sentiment: detectSentiment(text),
        }
        setMessages(prev => [...prev, msg])
        return msg
    }, [])

    // ── Start call ──────────────────────────────────────────────────────
    const startCall = useCallback(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SR) {
            alert('Speech Recognition is not supported in this browser. Please use Chrome or Edge.')
            return
        }

        const recognition = new SR()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = ''
            let finalTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript
                if (event.results[i].isFinal) {
                    finalTranscript += transcript
                } else {
                    interim += transcript
                }
            }

            setInterimText(interim)

            if (finalTranscript.trim()) {
                setInterimText('')
                addMessage('caller', finalTranscript.trim())

                // Clear any existing silence timer
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)

                // Wait a brief moment after caller stops, then respond
                silenceTimerRef.current = setTimeout(() => {
                    const response = matchResponse(finalTranscript.trim())
                    addMessage('agent', response)
                    speak(response)
                }, 800)
            }
        }

        recognition.onstart = () => setListening(true)
        recognition.onend = () => {
            setListening(false)
            // Auto-restart if call is still active and not muted
        }
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error !== 'aborted' && event.error !== 'no-speech') {
                console.error('Speech recognition error:', event.error)
            }
        }

        recognitionRef.current = recognition

        // Activate call
        setCallActive(true)
        setCallDuration(0)
        setMessages([])
        setInterimText('')
        setMuted(false)

        // Agent greeting
        const greetingMsg = config.greeting
        setTimeout(() => {
            addMessage('agent', greetingMsg)
            speak(greetingMsg)
        }, 500)
    }, [config.greeting, addMessage, speak])

    // ── End call ────────────────────────────────────────────────────────
    const endCall = useCallback(() => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop() } catch { /* ok */ }
            recognitionRef.current = null
        }
        if (synthRef.current) synthRef.current.cancel()
        if (timerRef.current) clearInterval(timerRef.current)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        setCallActive(false)
        setAgentSpeaking(false)
        setListening(false)
        setInterimText('')
    }, [])

    // ── Toggle mute ─────────────────────────────────────────────────────
    const toggleMute = useCallback(() => {
        if (!recognitionRef.current) return
        if (muted) {
            try { recognitionRef.current.start() } catch { /* ok */ }
        } else {
            try { recognitionRef.current.stop() } catch { /* ok */ }
        }
        setMuted(m => !m)
    }, [muted])

    // ── Analytics computations ──────────────────────────────────────────
    const callerWords = messages.filter(m => m.role === 'caller').reduce((sum, m) => sum + m.text.split(/\s+/).length, 0)
    const agentWords = messages.filter(m => m.role === 'agent').reduce((sum, m) => sum + m.text.split(/\s+/).length, 0)
    const topics = detectTopics(messages)
    const sentimentCounts = messages.reduce(
        (acc, m) => { acc[m.sentiment]++; return acc },
        { positive: 0, neutral: 0, negative: 0 } as Record<string, number>
    )

    // ── Waveform bars ───────────────────────────────────────────────────
    const waveformBars = Array.from({ length: 24 }, (_, i) => i)

    return (
        <div className="va-page">
            <motion.div
                className="va-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                {/* ── Header ─────────────────────────────────────────── */}
                <div className="va-header">
                    <div className="va-header-left">
                        <h1 className="va-title">
                            <Bot size={24} />
                            Voice Agent
                        </h1>
                        <span className="va-subtitle">Real-time healthcare voice assistant</span>
                    </div>
                    <div className="va-header-right">
                        {callActive && (
                            <motion.div
                                className="va-call-badge"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <span className="va-call-dot" />
                                <Clock size={13} />
                                <span>{formatTime(callDuration)}</span>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* ── 3-column layout ────────────────────────────────── */}
                <div className="va-layout">

                    {/* ── LEFT: Agent Config ────────────────────────── */}
                    <aside className="va-panel va-config">
                        <div className="va-panel-header">
                            <Settings size={16} />
                            <span>Agent Configuration</span>
                        </div>

                        <div className="va-config-body">
                            <label className="va-label">Agent Name</label>
                            <input
                                className="va-input"
                                value={config.name}
                                onChange={e => setConfig(c => ({ ...c, name: e.target.value }))}
                            />

                            <label className="va-label">Voice</label>
                            <select
                                className="va-select"
                                value={config.voiceIndex}
                                onChange={e => setConfig(c => ({ ...c, voiceIndex: Number(e.target.value) }))}
                            >
                                {voices.length === 0 && <option value={0}>Default</option>}
                                {voices.map((v, i) => (
                                    <option key={i} value={i}>{v.name} ({v.lang})</option>
                                ))}
                            </select>

                            <label className="va-label">Speed ({config.speed.toFixed(2)}x)</label>
                            <input
                                type="range"
                                className="va-range"
                                min={0.5}
                                max={1.5}
                                step={0.05}
                                value={config.speed}
                                onChange={e => setConfig(c => ({ ...c, speed: Number(e.target.value) }))}
                            />

                            <label className="va-label">Greeting Message</label>
                            <textarea
                                className="va-textarea"
                                rows={3}
                                value={config.greeting}
                                onChange={e => setConfig(c => ({ ...c, greeting: e.target.value }))}
                            />

                            <label className="va-label">Volume ({volume}%)</label>
                            <div className="va-volume-row">
                                <Volume2 size={14} />
                                <input
                                    type="range"
                                    className="va-range"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={volume}
                                    onChange={e => setVolume(Number(e.target.value))}
                                />
                            </div>

                            <div className="va-divider" />

                            <label className="va-label">Response Templates</label>
                            <div className="va-templates">
                                {[
                                    { trigger: '"claim"', response: 'Claim assistance flow' },
                                    { trigger: '"appointment"', response: 'Scheduling flow' },
                                    { trigger: '"prescription"', response: 'Rx lookup flow' },
                                    { trigger: '"billing"', response: 'Billing inquiry flow' },
                                    { trigger: '"coverage"', response: 'Benefits check flow' },
                                ].map((t, i) => (
                                    <div key={i} className="va-template-item">
                                        <span className="va-template-trigger">{t.trigger}</span>
                                        <span className="va-template-arrow">&rarr;</span>
                                        <span className="va-template-resp">{t.response}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* ── CENTER: Call + Transcript ─────────────────── */}
                    <main className="va-panel va-center">
                        {/* Waveform + call controls */}
                        <div className="va-call-area">
                            <div className="va-waveform">
                                {waveformBars.map(i => (
                                    <motion.div
                                        key={i}
                                        className={`va-wave-bar ${(listening || agentSpeaking) && callActive ? 'active' : ''}`}
                                        animate={
                                            (listening || agentSpeaking) && callActive
                                                ? { scaleY: [0.3, 0.6 + Math.random() * 0.8, 0.3], transition: { duration: 0.4 + Math.random() * 0.4, repeat: Infinity, repeatType: 'reverse' as const } }
                                                : { scaleY: 0.15 }
                                        }
                                        style={{
                                            background: agentSpeaking ? '#0D7C8C' : listening ? '#4A6FA5' : '#6B7585',
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="va-status-text">
                                {!callActive && 'Ready to start a call'}
                                {callActive && agentSpeaking && `${config.name} is speaking...`}
                                {callActive && listening && !agentSpeaking && 'Listening...'}
                                {callActive && !listening && !agentSpeaking && (muted ? 'Microphone muted' : 'Processing...')}
                            </div>

                            <div className="va-controls">
                                {!callActive ? (
                                    <motion.button
                                        className="va-btn va-btn-call"
                                        onClick={startCall}
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        <Phone size={18} />
                                        Start Call
                                    </motion.button>
                                ) : (
                                    <>
                                        <motion.button
                                            className={`va-btn va-btn-mute ${muted ? 'muted' : ''}`}
                                            onClick={toggleMute}
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.96 }}
                                        >
                                            {muted ? <MicOff size={16} /> : <Mic size={16} />}
                                            {muted ? 'Unmute' : 'Mute'}
                                        </motion.button>
                                        <motion.button
                                            className="va-btn va-btn-end"
                                            onClick={endCall}
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.96 }}
                                        >
                                            <PhoneOff size={16} />
                                            End Call
                                        </motion.button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Transcript */}
                        <div className="va-transcript-header">
                            <MessageSquare size={15} />
                            <span>Live Transcript</span>
                            {messages.length > 0 && (
                                <span className="va-msg-count">{messages.length} messages</span>
                            )}
                        </div>
                        <div className="va-transcript">
                            {messages.length === 0 && !callActive && (
                                <div className="va-transcript-empty">
                                    <Mic size={28} />
                                    <p>Start a call to begin the conversation</p>
                                </div>
                            )}
                            {messages.length === 0 && callActive && !agentSpeaking && (
                                <div className="va-transcript-empty">
                                    <Bot size={28} />
                                    <p>Connecting...</p>
                                </div>
                            )}
                            <AnimatePresence>
                                {messages.map(msg => (
                                    <motion.div
                                        key={msg.id}
                                        className={`va-msg ${msg.role}`}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <div className="va-msg-avatar">
                                            {msg.role === 'agent' ? <Bot size={14} /> : <User size={14} />}
                                        </div>
                                        <div className="va-msg-body">
                                            <div className="va-msg-meta">
                                                <span className="va-msg-role">
                                                    {msg.role === 'agent' ? config.name : 'Caller'}
                                                </span>
                                                <span className="va-msg-time">{formatTimestamp(msg.timestamp)}</span>
                                                <span className={`va-sentiment va-sentiment-${msg.sentiment}`}>
                                                    {msg.sentiment === 'positive' ? '+' : msg.sentiment === 'negative' ? '−' : '•'}
                                                </span>
                                            </div>
                                            <p className="va-msg-text">{msg.text}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {interimText && (
                                <div className="va-msg caller interim">
                                    <div className="va-msg-avatar">
                                        <User size={14} />
                                    </div>
                                    <div className="va-msg-body">
                                        <p className="va-msg-text va-interim">{interimText}</p>
                                    </div>
                                </div>
                            )}
                            <div ref={transcriptEndRef} />
                        </div>
                    </main>

                    {/* ── RIGHT: Analytics ──────────────────────────── */}
                    <aside className="va-panel va-analytics">
                        <div className="va-panel-header">
                            <Activity size={16} />
                            <span>Call Analytics</span>
                        </div>

                        <div className="va-analytics-body">
                            <div className="va-stat">
                                <div className="va-stat-icon" style={{ background: 'rgba(13,124,140,0.12)', color: '#0D7C8C' }}>
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <div className="va-stat-value">{formatTime(callDuration)}</div>
                                    <div className="va-stat-label">Duration</div>
                                </div>
                            </div>

                            <div className="va-stat">
                                <div className="va-stat-icon" style={{ background: 'rgba(74,111,165,0.12)', color: '#4A6FA5' }}>
                                    <User size={16} />
                                </div>
                                <div>
                                    <div className="va-stat-value">{callerWords}</div>
                                    <div className="va-stat-label">Caller Words</div>
                                </div>
                            </div>

                            <div className="va-stat">
                                <div className="va-stat-icon" style={{ background: 'rgba(13,124,140,0.12)', color: '#0D7C8C' }}>
                                    <Bot size={16} />
                                </div>
                                <div>
                                    <div className="va-stat-value">{agentWords}</div>
                                    <div className="va-stat-label">Agent Words</div>
                                </div>
                            </div>

                            <div className="va-divider" />

                            <label className="va-label">Sentiment Trend</label>
                            <div className="va-sentiment-bars">
                                <div className="va-sbar">
                                    <span className="va-sbar-label">Positive</span>
                                    <div className="va-sbar-track">
                                        <motion.div
                                            className="va-sbar-fill positive"
                                            animate={{ width: `${messages.length ? (sentimentCounts.positive / messages.length) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="va-sbar-count">{sentimentCounts.positive}</span>
                                </div>
                                <div className="va-sbar">
                                    <span className="va-sbar-label">Neutral</span>
                                    <div className="va-sbar-track">
                                        <motion.div
                                            className="va-sbar-fill neutral"
                                            animate={{ width: `${messages.length ? (sentimentCounts.neutral / messages.length) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="va-sbar-count">{sentimentCounts.neutral}</span>
                                </div>
                                <div className="va-sbar">
                                    <span className="va-sbar-label">Negative</span>
                                    <div className="va-sbar-track">
                                        <motion.div
                                            className="va-sbar-fill negative"
                                            animate={{ width: `${messages.length ? (sentimentCounts.negative / messages.length) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="va-sbar-count">{sentimentCounts.negative}</span>
                                </div>
                            </div>

                            <div className="va-divider" />

                            <label className="va-label">Topics Detected</label>
                            <div className="va-topics">
                                {topics.map(topic => (
                                    <span key={topic} className="va-topic-tag">{topic}</span>
                                ))}
                            </div>

                            <div className="va-divider" />

                            <label className="va-label">Messages</label>
                            <div className="va-msg-breakdown">
                                <div className="va-breakdown-row">
                                    <span>Caller</span>
                                    <span>{messages.filter(m => m.role === 'caller').length}</span>
                                </div>
                                <div className="va-breakdown-row">
                                    <span>Agent</span>
                                    <span>{messages.filter(m => m.role === 'agent').length}</span>
                                </div>
                                <div className="va-breakdown-row total">
                                    <span>Total</span>
                                    <span>{messages.length}</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </motion.div>
        </div>
    )
}
