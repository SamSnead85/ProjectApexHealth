import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageCircle,
    Send,
    Mic,
    MicOff,
    Sparkles,
    User,
    Bot,
    Calendar,
    Stethoscope,
    DollarSign,
    Pill,
    Heart,
    HelpCircle,
    ArrowRight,
    Clock,
    MapPin,
    Phone
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './HealthConcierge.css'

// ============================================================================
// ROLE-BASED ACCESS PATTERN
// This module supports: Member (primary), Provider (reference)
// ============================================================================
export type UserRole = 'member' | 'provider'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    suggestions?: string[]
    actionCard?: ActionCard
}

interface ActionCard {
    type: 'provider' | 'appointment' | 'benefit' | 'cost'
    title: string
    data: Record<string, string | number>
}

interface QuickAction {
    id: string
    icon: React.ReactNode
    label: string
    query: string
}

const quickActions: QuickAction[] = [
    { id: 'schedule', icon: <Calendar size={18} />, label: 'Schedule Appointment', query: 'I need to schedule an appointment' },
    { id: 'find-doctor', icon: <Stethoscope size={18} />, label: 'Find a Doctor', query: 'Help me find a doctor' },
    { id: 'coverage', icon: <DollarSign size={18} />, label: 'Check Coverage', query: 'What does my plan cover?' },
    { id: 'rx', icon: <Pill size={18} />, label: 'Prescription Help', query: 'I need help with my prescription' },
    { id: 'symptoms', icon: <Heart size={18} />, label: 'Symptom Checker', query: 'I have some symptoms I want to check' },
    { id: 'faq', icon: <HelpCircle size={18} />, label: 'Common Questions', query: 'What are the most common questions?' }
]

// Simulated AI responses
const mockResponses: Record<string, { content: string; suggestions?: string[]; actionCard?: ActionCard }> = {
    'appointment': {
        content: "I'd be happy to help you schedule an appointment! Based on your care history, I notice you're due for an annual wellness visit. Would you like me to find available appointments with your primary care physician, Dr. Emily Chen?",
        suggestions: ['Yes, show me available times', 'I need a different type of appointment', 'Find a specialist instead'],
        actionCard: {
            type: 'provider',
            title: 'Recommended Provider',
            data: {
                name: 'Dr. Emily Chen',
                specialty: 'Internal Medicine',
                nextAvailable: 'Tomorrow, 10:00 AM',
                distance: '0.8 miles'
            }
        }
    },
    'doctor': {
        content: "I can help you find the right doctor. What type of care are you looking for? I can search for primary care physicians, specialists, or providers who meet specific criteria like language preference or telehealth availability.",
        suggestions: ['Primary care physician', 'Specialist referral', 'Telehealth appointment', 'Urgent care nearby']
    },
    'coverage': {
        content: "Great question! Your Apex Health PPO plan provides comprehensive coverage. Here's a quick overview:\n\n• **Preventive Care**: 100% covered\n• **Primary Care Visits**: $25 copay\n• **Specialist Visits**: $50 copay\n• **Emergency Room**: $250 copay\n• **Annual Deductible**: $500 (you've met $320)\n\nWould you like more details about a specific benefit?",
        suggestions: ['Mental health coverage', 'Prescription drug benefits', 'Out-of-network benefits', 'What counts as preventive care?']
    },
    'prescription': {
        content: "I can help with your prescriptions! I see you currently have Metformin 500mg. Here are some options:\n\n• **Mail Order**: 90-day supply for $25 (saves $5)\n• **Retail Pharmacy**: 30-day supply for $10\n\nWould you like to refill your medication or check coverage for a new prescription?",
        suggestions: ['Refill my current medication', 'Check coverage for new prescription', 'Find cheaper alternatives', 'Locate pharmacy nearby'],
        actionCard: {
            type: 'cost',
            title: 'Cost Comparison',
            data: {
                medication: 'Metformin 500mg',
                retailPrice: '$10/month',
                mailOrder: '$8.33/month',
                savings: '$20/year'
            }
        }
    },
    'symptoms': {
        content: "I'm here to help guide you. Please note that I'm an AI assistant and cannot provide medical diagnoses. For any serious or emergency symptoms, please call 911 or visit an emergency room.\n\nCan you describe your symptoms? I can help you understand when to seek care and what type of provider might be most appropriate.",
        suggestions: ['Mild symptoms - self care tips', 'Should I see a doctor?', 'Find urgent care nearby', 'Talk to a nurse hotline']
    },
    'default': {
        content: "I'm your AI Health Concierge, here to help with all your healthcare needs. I can assist you with:\n\n• Scheduling appointments\n• Finding in-network providers\n• Checking benefit coverage\n• Managing prescriptions\n• Answering health questions\n\nWhat would you like help with today?",
        suggestions: ['Schedule an appointment', 'Find a doctor', 'Check my benefits', 'Help with prescriptions']
    }
}

function getResponseKey(query: string): string {
    const lower = query.toLowerCase()
    if (lower.includes('appointment') || lower.includes('schedule')) return 'appointment'
    if (lower.includes('doctor') || lower.includes('find') || lower.includes('provider')) return 'doctor'
    if (lower.includes('coverage') || lower.includes('cover') || lower.includes('benefit') || lower.includes('plan')) return 'coverage'
    if (lower.includes('prescription') || lower.includes('rx') || lower.includes('medication') || lower.includes('refill')) return 'prescription'
    if (lower.includes('symptom') || lower.includes('sick') || lower.includes('pain') || lower.includes('feel')) return 'symptoms'
    return 'default'
}

export function HealthConcierge() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hello! 👋 I'm your AI Health Concierge. I'm here to help you navigate your healthcare journey. Whether you need to find a doctor, schedule an appointment, check your benefits, or get answers to your health questions - I'm here to help!\n\nWhat can I assist you with today?",
            timestamp: new Date(),
            suggestions: ['Schedule an appointment', 'Find a doctor', 'Check my coverage', 'Prescription help']
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [currentRole] = useState<UserRole>('member')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (content: string) => {
        if (!content.trim()) return

        // Add user message
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: content.trim(),
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsTyping(true)

        // Simulate AI response delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

        const responseKey = getResponseKey(content)
        const response = mockResponses[responseKey]

        const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response.content,
            timestamp: new Date(),
            suggestions: response.suggestions,
            actionCard: response.actionCard
        }

        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
    }

    const handleQuickAction = (action: QuickAction) => {
        handleSend(action.query)
    }

    const handleSuggestion = (suggestion: string) => {
        handleSend(suggestion)
    }

    const toggleVoice = () => {
        setIsListening(!isListening)
        // Voice recognition would be integrated here
    }

    const renderActionCard = (card: ActionCard) => {
        switch (card.type) {
            case 'provider':
                return (
                    <div className="action-card provider">
                        <div className="action-card__icon">
                            <Stethoscope size={20} />
                        </div>
                        <div className="action-card__content">
                            <h4>{card.title}</h4>
                            <p className="provider-name">{card.data.name}</p>
                            <span className="provider-specialty">{card.data.specialty}</span>
                            <div className="action-card__meta">
                                <span><Clock size={12} /> {card.data.nextAvailable}</span>
                                <span><MapPin size={12} /> {card.data.distance}</span>
                            </div>
                        </div>
                        <Button variant="primary" size="sm">
                            Book <ArrowRight size={14} />
                        </Button>
                    </div>
                )
            case 'cost':
                return (
                    <div className="action-card cost">
                        <div className="action-card__icon">
                            <DollarSign size={20} />
                        </div>
                        <div className="action-card__content">
                            <h4>{card.title}</h4>
                            <p className="medication-name">{card.data.medication}</p>
                            <div className="cost-comparison">
                                <div className="cost-option">
                                    <span>Retail</span>
                                    <strong>{card.data.retailPrice}</strong>
                                </div>
                                <div className="cost-option highlight">
                                    <span>Mail Order</span>
                                    <strong>{card.data.mailOrder}</strong>
                                </div>
                            </div>
                            <Badge variant="success" size="sm">Save {card.data.savings}</Badge>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="health-concierge">
            {/* Header */}
            <div className="health-concierge__header">
                <div>
                    <h1 className="health-concierge__title">
                        <MessageCircle className="health-concierge__title-icon" size={28} />
                        AI Health Concierge
                    </h1>
                    <p className="health-concierge__subtitle">
                        Your personal healthcare assistant • Powered by Apex AI
                    </p>
                </div>
                <div className="health-concierge__header-badges">
                    <Badge variant="teal" icon={<Sparkles size={12} />}>
                        AI-Powered
                    </Badge>
                    <Badge variant="info" size="sm">
                        {currentRole === 'member' ? '👤 Member' : '🩺 Provider View'}
                    </Badge>
                </div>
            </div>

            <div className="health-concierge__container">
                {/* Quick Actions */}
                <div className="quick-actions">
                    <h3>Quick Actions</h3>
                    <div className="quick-actions__grid">
                        {quickActions.map(action => (
                            <button
                                key={action.id}
                                className="quick-action"
                                onClick={() => handleQuickAction(action)}
                            >
                                {action.icon}
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Container */}
                <GlassCard className="chat-container">
                    {/* Messages */}
                    <div className="chat-messages">
                        <AnimatePresence initial={false}>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    className={`message ${message.role}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="message__avatar">
                                        {message.role === 'assistant' ? (
                                            <Bot size={20} />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div className="message__content">
                                        <div className="message__bubble">
                                            <p>{message.content}</p>
                                        </div>
                                        {message.actionCard && renderActionCard(message.actionCard)}
                                        {message.suggestions && message.suggestions.length > 0 && (
                                            <div className="message__suggestions">
                                                {message.suggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        className="suggestion-chip"
                                                        onClick={() => handleSuggestion(suggestion)}
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <span className="message__time">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Typing Indicator */}
                        {isTyping && (
                            <motion.div
                                className="message assistant typing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="message__avatar">
                                    <Bot size={20} />
                                </div>
                                <div className="message__content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chat-input">
                        <div className="chat-input__wrapper">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Type your message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)}
                            />
                            <button
                                className={`voice-button ${isListening ? 'active' : ''}`}
                                onClick={toggleVoice}
                            >
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                            <button
                                className="send-button"
                                onClick={() => handleSend(inputValue)}
                                disabled={!inputValue.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <p className="chat-input__disclaimer">
                            AI-powered responses. For emergencies, call 911.
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default HealthConcierge
