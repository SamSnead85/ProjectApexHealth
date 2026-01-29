import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles,
    X,
    Send,
    User,
    Brain
} from 'lucide-react'
import './AICopilot.css'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

const suggestions = [
    'Show high-risk members',
    'Claims trend analysis',
    'Generate executive summary',
    'Compare to benchmarks'
]

const initialMessages: Message[] = [
    {
        id: '1',
        role: 'assistant',
        content: "Hi! I'm Apex AI, your intelligent healthcare analytics assistant. I can help you analyze data, generate reports, and find insights. What would you like to explore?",
        timestamp: new Date()
    }
]

export default function AICopilot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsTyping(true)

        // Simulate AI response
        setTimeout(() => {
            const responses: Record<string, string> = {
                'high-risk': 'I found 234 high-risk members in your population. 47 are flagged for cardiac conditions, 89 for diabetes management, and 98 for mental health needs. Would you like me to create a detailed risk stratification report?',
                'claims': 'Claims are trending 4.2% below budget this quarter. Key drivers: -8.3% inpatient utilization, +12.1% telehealth adoption, and -3.2% pharmacy spend from generic substitution. Should I generate a detailed variance analysis?',
                'executive': 'I can generate an executive summary with: KPIs (MLR, PMPM, enrollment), AI insights on cost drivers, benchmark comparisons, and strategic recommendations. Shall I start the report now?',
                'benchmark': 'Compared to industry benchmarks: Admin costs are 28% lower, claims turnaround is 37% faster, member satisfaction is 12% higher. You\'re outperforming on 4 of 5 key metrics!',
                'default': 'I can help you analyze claims data, identify high-risk members, generate reports, and provide strategic insights. What specific aspect would you like to explore?'
            }

            let responseText = responses.default
            const lowerInput = input.toLowerCase()
            if (lowerInput.includes('risk') || lowerInput.includes('high')) {
                responseText = responses['high-risk']
            } else if (lowerInput.includes('claim') || lowerInput.includes('trend')) {
                responseText = responses['claims']
            } else if (lowerInput.includes('executive') || lowerInput.includes('summary') || lowerInput.includes('report')) {
                responseText = responses['executive']
            } else if (lowerInput.includes('benchmark') || lowerInput.includes('compare')) {
                responseText = responses['benchmark']
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
            setIsTyping(false)
        }, 1500)
    }

    const handleSuggestion = (suggestion: string) => {
        setInput(suggestion)
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <>
            {/* Trigger Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        className="ai-copilot-trigger"
                        onClick={() => setIsOpen(true)}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Sparkles size={24} className="icon" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && createPortal(
                    <motion.div
                        className="ai-copilot-panel"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Header */}
                        <div className="copilot-header">
                            <div className="copilot-title">
                                <div className="copilot-avatar">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h3>Apex AI</h3>
                                    <span>
                                        <span className="online-dot" />
                                        Online • Ready to help
                                    </span>
                                </div>
                            </div>
                            <button className="copilot-close" onClick={() => setIsOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Suggestions */}
                        <div className="copilot-suggestions">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    className="suggestion-chip"
                                    onClick={() => handleSuggestion(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>

                        {/* Messages */}
                        <div className="copilot-messages">
                            {messages.map((message) => (
                                <div key={message.id} className={`message ${message.role}`}>
                                    <div className="message-avatar">
                                        {message.role === 'assistant' ? (
                                            <Brain size={16} />
                                        ) : (
                                            <User size={16} />
                                        )}
                                    </div>
                                    <div>
                                        <div className="message-content">
                                            {message.content}
                                        </div>
                                        <div className="message-time">
                                            {formatTime(message.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="message assistant">
                                    <div className="message-avatar">
                                        <Brain size={16} />
                                    </div>
                                    <div className="message-content">
                                        <div className="typing-indicator">
                                            <span className="typing-dot" />
                                            <span className="typing-dot" />
                                            <span className="typing-dot" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="copilot-input">
                            <input
                                type="text"
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                className="send-btn"
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>,
                    document.body
                )}
            </AnimatePresence>
        </>
    )
}
