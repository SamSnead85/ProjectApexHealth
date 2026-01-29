import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare,
    X,
    Send,
    Sparkles,
    Bot,
    User,
    Loader2,
    Minimize2,
    Maximize2,
    HelpCircle,
    FileText,
    DollarSign,
    Calendar,
    Shield
} from 'lucide-react'
import { Button } from '../common'
import './AIAssistantWidget.css'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

interface QuickPrompt {
    icon: React.ReactNode
    label: string
    prompt: string
}

const quickPrompts: QuickPrompt[] = [
    { icon: <HelpCircle size={14} />, label: 'How to file a claim?', prompt: 'How do I file a new claim?' },
    { icon: <FileText size={14} />, label: 'Find my EOB', prompt: 'Where can I find my Explanation of Benefits?' },
    { icon: <DollarSign size={14} />, label: 'Check deductible', prompt: 'What is my current deductible status?' },
    { icon: <Calendar size={14} />, label: 'Schedule appointment', prompt: 'Help me schedule a doctor appointment' },
    { icon: <Shield size={14} />, label: 'Prior authorization', prompt: 'How do I get a prior authorization?' },
]

const aiResponses: Record<string, string> = {
    'claim': `To file a new claim, follow these steps:

1. Navigate to **Claims** in the sidebar
2. Click **"New Claim"** button
3. Enter the service details and provider information
4. Upload any supporting documents
5. Submit for processing

Most claims are auto-adjudicated within 24-48 hours. Would you like me to guide you through the process?`,
    'eob': `Your Explanation of Benefits (EOB) documents can be found in:

📁 **Member Portal → Documents → EOB Viewer**

You have **2 new EOBs** waiting to be reviewed. The most recent is from your MRI on January 20th.

Would you like me to open your EOB viewer now?`,
    'deductible': `Here's your current deductible status:

💰 **Individual Deductible**
- Used: $450 of $1,500
- Remaining: **$1,050**

👨‍👩‍👧 **Family Deductible**
- Used: $890 of $3,000
- Remaining: **$2,110**

You're 30% through your annual deductible. Would you like to see a breakdown of eligible expenses?`,
    'appointment': `I can help you schedule an appointment! Here are your options:

🏥 **In-Network Providers**
- Dr. Sarah Chen (PCP) - Next available: Jan 29
- Premier Urgent Care - Same day appointments
- Telehealth - Available now

📅 Would you like me to:
1. Check Dr. Chen's availability
2. Find a specialist
3. Start a telehealth visit

Just let me know how I can help!`,
    'authorization': `Prior authorization is required for certain services. Here's how it works:

**Common services requiring prior auth:**
- Advanced imaging (MRI, CT, PET)
- Specialty medications
- Elective surgeries
- Physical therapy (after 12 visits)

**To request prior auth:**
1. Go to **Prior Authorization** in the menu
2. Click **"New Request"**
3. Your provider can also submit on your behalf

Current turnaround time: **1-2 business days**

Do you have a specific procedure you need authorized?`,
    'default': `I'm your AI Health Assistant, here to help you navigate your healthcare benefits! I can assist with:

• **Claims & EOBs** - File claims, track status, understand benefits
• **Coverage** - Check deductibles, copays, and out-of-pocket costs  
• **Appointments** - Find providers and schedule visits
• **Authorizations** - Prior auth requests and status
• **General Questions** - Anything about your health plan

What would you like help with today?`
}

function getAIResponse(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('claim') || lowerMessage.includes('file')) {
        return aiResponses['claim']
    }
    if (lowerMessage.includes('eob') || lowerMessage.includes('explanation') || lowerMessage.includes('benefit')) {
        return aiResponses['eob']
    }
    if (lowerMessage.includes('deductible') || lowerMessage.includes('out of pocket') || lowerMessage.includes('oop')) {
        return aiResponses['deductible']
    }
    if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('doctor')) {
        return aiResponses['appointment']
    }
    if (lowerMessage.includes('auth') || lowerMessage.includes('prior')) {
        return aiResponses['authorization']
    }
    
    return aiResponses['default']
}

export function AIAssistantWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (isOpen && !isMinimized) {
            inputRef.current?.focus()
        }
    }, [isOpen, isMinimized])

    const handleOpen = () => {
        setIsOpen(true)
        setIsMinimized(false)
        if (messages.length === 0) {
            // Add initial greeting
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: `👋 Hi! I'm your AI Health Assistant powered by **Project Apex Intelligence**.

I can help you with claims, appointments, coverage questions, and more. What would you like to know?`,
                timestamp: new Date()
            }])
        }
    }

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsTyping(true)

        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

        const aiResponse = getAIResponse(content)
        
        const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
        }

        setIsTyping(false)
        setMessages(prev => [...prev, assistantMessage])
    }

    const handleQuickPrompt = (prompt: string) => {
        handleSendMessage(prompt)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage(inputValue)
        }
    }

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        className="ai-assistant__fab"
                        onClick={handleOpen}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="ai-assistant__fab-pulse" />
                        <Bot size={24} />
                        <span className="ai-assistant__fab-label">AI Assistant</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={`ai-assistant ${isMinimized ? 'ai-assistant--minimized' : ''}`}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div className="ai-assistant__header">
                            <div className="ai-assistant__header-info">
                                <div className="ai-assistant__avatar">
                                    <Sparkles size={18} />
                                </div>
                                <div className="ai-assistant__title">
                                    <span className="ai-assistant__name">Apex AI Assistant</span>
                                    <span className="ai-assistant__status">
                                        <span className="ai-assistant__status-dot" />
                                        Online
                                    </span>
                                </div>
                            </div>
                            <div className="ai-assistant__header-actions">
                                <button
                                    className="ai-assistant__action"
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    title={isMinimized ? 'Maximize' : 'Minimize'}
                                >
                                    {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                                </button>
                                <button
                                    className="ai-assistant__action"
                                    onClick={() => setIsOpen(false)}
                                    title="Close"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        {!isMinimized && (
                            <>
                                {/* Messages */}
                                <div className="ai-assistant__messages">
                                    {messages.map((message, index) => (
                                        <motion.div
                                            key={message.id}
                                            className={`ai-assistant__message ai-assistant__message--${message.role}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index === messages.length - 1 ? 0 : 0 }}
                                        >
                                            <div className="ai-assistant__message-avatar">
                                                {message.role === 'assistant' ? (
                                                    <Bot size={14} />
                                                ) : (
                                                    <User size={14} />
                                                )}
                                            </div>
                                            <div className="ai-assistant__message-content">
                                                {message.content.split('\n').map((line, i) => (
                                                    <p key={i}>{line}</p>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Typing Indicator */}
                                    {isTyping && (
                                        <motion.div
                                            className="ai-assistant__message ai-assistant__message--assistant"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <div className="ai-assistant__message-avatar">
                                                <Bot size={14} />
                                            </div>
                                            <div className="ai-assistant__typing">
                                                <span />
                                                <span />
                                                <span />
                                            </div>
                                        </motion.div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Quick Prompts */}
                                {messages.length <= 1 && (
                                    <div className="ai-assistant__quick-prompts">
                                        {quickPrompts.map((prompt, index) => (
                                            <motion.button
                                                key={prompt.label}
                                                className="ai-assistant__quick-prompt"
                                                onClick={() => handleQuickPrompt(prompt.prompt)}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {prompt.icon}
                                                <span>{prompt.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}

                                {/* Input */}
                                <div className="ai-assistant__input-container">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="ai-assistant__input"
                                        placeholder="Ask me anything about your health benefits..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        disabled={isTyping}
                                    />
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="ai-assistant__send"
                                        onClick={() => handleSendMessage(inputValue)}
                                        disabled={!inputValue.trim() || isTyping}
                                        icon={isTyping ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                                    />
                                </div>

                                {/* Footer */}
                                <div className="ai-assistant__footer">
                                    <Sparkles size={12} />
                                    <span>Powered by Project Apex Intelligence</span>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default AIAssistantWidget
