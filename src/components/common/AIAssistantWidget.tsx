import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Send,
    Bot,
    User,
    Sparkles,
    X,
    Minimize2,
    Maximize2,
    MessageSquare
} from 'lucide-react'
import './AIAssistantWidget.css'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

const welcomeMessage: Message = {
    id: '0',
    role: 'assistant',
    content: "Hi! I'm Apex AI, your healthcare assistant. Ask me about finding a plan, understanding your coverage, or navigating your healthcare journey.",
    timestamp: new Date(),
}

const suggestedPrompts = [
    "Find a dermatologist near me",
    "What's my deductible status?",
    "Explain my copay for specialists",
    "How do I file a claim?",
]

export function AIAssistantWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<Message[]>([welcomeMessage])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsTyping(true)

        // Simulate AI response
        setTimeout(() => {
            const responses: Record<string, string> = {
                'dermatologist': "I found 3 in-network dermatologists near you. Dr. Michael Torres at SkinCare Specialists has excellent reviews (4.8★) and availability tomorrow. Would you like me to book an appointment?",
                'deductible': "Your current deductible status:\n\n• Medical: $450 of $1,500 used (30%)\n• Pharmacy: $125 of $500 used (25%)\n\nYou have $1,425 remaining before reaching your full deductible.",
                'copay': "For specialists, your copay is $40 per visit after meeting your deductible. For in-network primary care visits, it's only $20. Would you like me to help you find a specialist?",
                'claim': "To file a claim:\n\n1. Go to Claims → Submit New Claim\n2. Upload your itemized receipt or EOB\n3. Fill in the service details\n4. Submit for review\n\nMost claims are processed within 5-7 business days. Need help with a specific claim?",
            }

            let response = "I'd be happy to help with that! Let me look into it for you. Is there anything specific you'd like to know about your coverage or benefits?"

            for (const [key, value] of Object.entries(responses)) {
                if (input.toLowerCase().includes(key)) {
                    response = value
                    break
                }
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            }

            setMessages(prev => [...prev, assistantMessage])
            setIsTyping(false)
        }, 1500)
    }

    const handleSuggestion = (prompt: string) => {
        setInput(prompt)
    }

    if (!isOpen) {
        return (
            <motion.button
                className="ai-widget__trigger"
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <MessageSquare size={24} />
                <span className="ai-widget__trigger-label">Ask Apex AI</span>
            </motion.button>
        )
    }

    return (
        <motion.div
            className={`ai-widget ${isMinimized ? 'ai-widget--minimized' : ''}`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
        >
            {/* Header */}
            <div className="ai-widget__header">
                <div className="ai-widget__header-info">
                    <div className="ai-widget__avatar">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <span className="ai-widget__title">Ask Apex AI</span>
                        <span className="ai-widget__subtitle">Powered by Gemini</span>
                    </div>
                </div>
                <div className="ai-widget__header-actions">
                    <button onClick={() => setIsMinimized(!isMinimized)}>
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button onClick={() => setIsOpen(false)}>
                        <X size={16} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="ai-widget__messages">
                        {messages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                className={`ai-widget__message ai-widget__message--${message.role}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="ai-widget__message-avatar">
                                    {message.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                                </div>
                                <div className="ai-widget__message-content">
                                    {message.content}
                                </div>
                            </motion.div>
                        ))}

                        {isTyping && (
                            <motion.div
                                className="ai-widget__message ai-widget__message--assistant"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="ai-widget__message-avatar">
                                    <Bot size={14} />
                                </div>
                                <div className="ai-widget__typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {messages.length === 1 && (
                        <div className="ai-widget__suggestions">
                            {suggestedPrompts.map(prompt => (
                                <button
                                    key={prompt}
                                    className="ai-widget__suggestion"
                                    onClick={() => handleSuggestion(prompt)}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="ai-widget__input-container">
                        <input
                            type="text"
                            className="ai-widget__input"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            className="ai-widget__send"
                            onClick={handleSend}
                            disabled={!input.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </>
            )}
        </motion.div>
    )
}

export default AIAssistantWidget
