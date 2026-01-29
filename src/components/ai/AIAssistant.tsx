import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles,
    MessageSquare,
    Search,
    Send,
    Calendar,
    FileText,
    DollarSign,
    Heart,
    Pill,
    HelpCircle,
    ChevronRight,
    X,
    Mic,
    User
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './AIAssistant.css'

// Quick action suggestions
const quickActions = [
    { id: 'benefits', icon: <FileText size={16} />, label: 'Explain my benefits' },
    { id: 'claims', icon: <DollarSign size={16} />, label: 'Check claim status' },
    { id: 'doctor', icon: <Heart size={16} />, label: 'Find a doctor' },
    { id: 'refill', icon: <Pill size={16} />, label: 'Refill prescription' },
    { id: 'appointment', icon: <Calendar size={16} />, label: 'Schedule appointment' },
    { id: 'help', icon: <HelpCircle size={16} />, label: 'General questions' }
]

// Chat message type
interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    actions?: { label: string; action: string }[]
}

const initialMessages: ChatMessage[] = [
    {
        id: 'welcome',
        role: 'assistant',
        content: "👋 Hi! I'm your AI Health Assistant. I can help you understand your benefits, find providers, check claims, and answer health plan questions. How can I assist you today?",
        timestamp: new Date(),
        actions: [
            { label: 'View my benefits', action: 'benefits' },
            { label: 'Find a doctor', action: 'find-doctor' }
        ]
    }
]

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)

    const handleSend = () => {
        if (!input.trim()) return

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsTyping(true)

        // Simulate AI response
        setTimeout(() => {
            const aiResponse: ChatMessage = {
                id: `ai-${Date.now()}`,
                role: 'assistant',
                content: getAIResponse(input),
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiResponse])
            setIsTyping(false)
        }, 1500)
    }

    const getAIResponse = (query: string): string => {
        const q = query.toLowerCase()
        if (q.includes('deductible')) {
            return "Your current individual deductible is $1,500, and you've met $850 so far this year. That means you have $650 remaining before your plan starts covering more of your costs. Would you like me to explain how your deductible works?"
        }
        if (q.includes('copay') || q.includes('co-pay')) {
            return "Your copays depend on the type of visit:\n\n• Primary Care: $25\n• Specialist: $50\n• Urgent Care: $75\n• Emergency Room: $250\n\nIs there a specific type of visit you're planning?"
        }
        if (q.includes('prescription') || q.includes('medication')) {
            return "I can help with prescriptions! You have 2 medications due for refill soon:\n\n• Lisinopril 10mg - Refill available now\n• Metformin 500mg - Refill available in 5 days\n\nWould you like me to start a refill request?"
        }
        return "I understand you're asking about your health plan. Let me look into that for you. In the meantime, you can also check your Benefits section for detailed coverage information, or I can connect you with a care coordinator if you prefer to speak with someone directly."
    }

    const handleQuickAction = (action: string) => {
        const actionMessages: Record<string, string> = {
            benefits: 'Can you explain my benefits?',
            claims: 'What is the status of my recent claims?',
            doctor: 'Help me find a doctor',
            refill: 'I need to refill my prescription',
            appointment: 'I want to schedule an appointment',
            help: 'I have a general question'
        }
        setInput(actionMessages[action] || action)
    }

    return (
        <>
            {/* Floating Trigger Button */}
            <motion.button
                className="ai-trigger"
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Sparkles size={24} />
                <span>AI Assistant</span>
            </motion.button>

            {/* Chat Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="ai-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            className="ai-panel"
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        >
                            {/* Header */}
                            <div className="ai-header">
                                <div className="ai-header__title">
                                    <div className="ai-avatar">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <h3>AI Health Assistant</h3>
                                        <span>Powered by Apex Intelligence</span>
                                    </div>
                                </div>
                                <button className="ai-close" onClick={() => setIsOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="ai-messages">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        className={`ai-message ai-message--${message.role}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="message-avatar">
                                                <Sparkles size={14} />
                                            </div>
                                        )}
                                        <div className="message-content">
                                            <p>{message.content}</p>
                                            {message.actions && (
                                                <div className="message-actions">
                                                    {message.actions.map(action => (
                                                        <button
                                                            key={action.action}
                                                            className="action-btn"
                                                            onClick={() => handleQuickAction(action.action)}
                                                        >
                                                            {action.label}
                                                            <ChevronRight size={14} />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <div className="ai-message ai-message--assistant">
                                        <div className="message-avatar">
                                            <Sparkles size={14} />
                                        </div>
                                        <div className="message-content">
                                            <div className="typing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="ai-quick-actions">
                                {quickActions.map(action => (
                                    <button
                                        key={action.id}
                                        className="quick-action"
                                        onClick={() => handleQuickAction(action.id)}
                                    >
                                        {action.icon}
                                        <span>{action.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="ai-input">
                                <input
                                    type="text"
                                    placeholder="Ask me anything about your health plan..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button className="mic-btn">
                                    <Mic size={18} />
                                </button>
                                <button
                                    className={`send-btn ${input.trim() ? 'active' : ''}`}
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export default AIAssistant
