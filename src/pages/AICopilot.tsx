import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles,
    Send,
    Mic,
    X,
    Maximize2,
    Minimize2,
    ChevronDown,
    BarChart3,
    TrendingUp,
    Users,
    DollarSign,
    AlertTriangle,
    Pill,
    Building2,
    Calendar,
    RefreshCw
} from 'lucide-react'
import { GlassCard, Button, Badge } from '../components/common'
import './AICopilot.css'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    visualizations?: Array<{
        type: 'chart' | 'table' | 'metric' | 'insight'
        data: unknown
    }>
}

interface SuggestedQuery {
    icon: React.ElementType
    label: string
    query: string
    category: string
}

const suggestedQueries: SuggestedQuery[] = [
    {
        icon: TrendingUp,
        label: 'Top Cost Drivers',
        query: 'Show me the top 10 cost drivers this quarter',
        category: 'Claims'
    },
    {
        icon: Users,
        label: 'High-Risk Members',
        query: 'Identify members likely to become high-cost claimants in the next 6 months',
        category: 'Prediction'
    },
    {
        icon: Pill,
        label: 'Pharmacy Trends',
        query: 'Compare pharmacy spend year-over-year by therapeutic class',
        category: 'Pharmacy'
    },
    {
        icon: DollarSign,
        label: 'PEPM Analysis',
        query: 'How does our PEPM compare to industry benchmarks?',
        category: 'Benchmark'
    },
    {
        icon: AlertTriangle,
        label: 'Stop-Loss Status',
        query: 'Which members are approaching their specific deductible?',
        category: 'Stop-Loss'
    },
    {
        icon: Building2,
        label: 'Provider Variance',
        query: 'Which providers have the highest cost variance for similar procedures?',
        category: 'Network'
    }
]
import { geminiService } from '../services/gemini'

// Generate AI response using Gemini
const generateAIResponse = async (query: string): Promise<Message> => {
    try {
        // Create a healthcare analytics context for the AI
        const systemPrompt = `You are an expert healthcare analytics AI copilot for the Apex Health platform. 
You help administrators, brokers, and employers analyze health plan data including:
- Claims analysis and cost drivers
- Member risk stratification and predictions  
- Pharmacy trends and spend optimization
- Stop-loss tracking and projections
- Provider performance and network analytics
- Benchmark comparisons against industry standards

When responding:
- Use markdown formatting with **bold** for emphasis
- Include specific numbers and percentages when relevant
- Provide actionable insights and recommendations
- Format tables using | for columns when presenting data
- Be concise but comprehensive

User Query: ${query}

Provide a helpful, data-driven response as if you have access to the organization's health plan data.`

        const response = await geminiService.chat(systemPrompt)

        return {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: response,
            timestamp: new Date(),
            visualizations: query.toLowerCase().includes('chart') ||
                query.toLowerCase().includes('trend') ||
                query.toLowerCase().includes('compare')
                ? [{ type: 'chart', data: {} }]
                : undefined
        }
    } catch (error) {
        console.error('Gemini API error:', error)
        return {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: `I apologize, but I encountered an issue processing your request. This could be due to:

- **API connectivity** - Please check your network connection
- **API key** - Ensure the Gemini API key is configured correctly

Please try again or contact support if the issue persists.`,
            timestamp: new Date()
        }
    }
}

export function AICopilot() {
    const [isOpen, setIsOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (query: string) => {
        if (!query.trim()) return

        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: query,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsTyping(true)

        try {
            const response = await generateAIResponse(query)
            setMessages(prev => [...prev, response])
        } catch (error) {
            console.error('Error generating response:', error)
        } finally {
            setIsTyping(false)
        }
    }

    const handleQuickQuery = (query: string) => {
        setInputValue(query)
        handleSubmit(query)
    }

    if (!isOpen) {
        return (
            <motion.button
                className="ai-copilot__trigger"
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Sparkles size={24} />
                <span>AI Copilot</span>
            </motion.button>
        )
    }

    return (
        <AnimatePresence>
            <motion.div
                className={`ai-copilot ${isExpanded ? 'ai-copilot--expanded' : ''}`}
                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.9 }}
            >
                {/* Header */}
                <div className="ai-copilot__header">
                    <div className="ai-copilot__header-left">
                        <div className="ai-copilot__icon">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3>AI Analytics Copilot</h3>
                            <span>Ask anything about your health data</span>
                        </div>
                    </div>
                    <div className="ai-copilot__header-actions">
                        <button onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                        <button onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="ai-copilot__messages">
                    {messages.length === 0 ? (
                        <div className="ai-copilot__welcome">
                            <div className="ai-copilot__welcome-icon">
                                <Sparkles size={32} />
                            </div>
                            <h4>Welcome to AI Analytics</h4>
                            <p>Ask questions about your claims, costs, predictions, and more in natural language.</p>

                            <div className="ai-copilot__suggestions">
                                <span className="ai-copilot__suggestions-label">Try asking:</span>
                                <div className="ai-copilot__suggestions-grid">
                                    {suggestedQueries.map((sq) => {
                                        const Icon = sq.icon
                                        return (
                                            <button
                                                key={sq.label}
                                                className="ai-copilot__suggestion"
                                                onClick={() => handleQuickQuery(sq.query)}
                                            >
                                                <Icon size={16} />
                                                <span>{sq.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    className={`ai-copilot__message ai-copilot__message--${msg.role}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="ai-copilot__message-icon">
                                            <Sparkles size={16} />
                                        </div>
                                    )}
                                    <div className="ai-copilot__message-content">
                                        <div className="ai-copilot__message-text" dangerouslySetInnerHTML={{
                                            __html: msg.content
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/\n/g, '<br/>')
                                                .replace(/\|([^\|]+)\|/g, '<span class="table-cell">$1</span>')
                                        }} />
                                        <span className="ai-copilot__message-time">
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="ai-copilot__typing">
                                    <div className="ai-copilot__typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <span>Analyzing data...</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input */}
                <div className="ai-copilot__input-area">
                    <div className="ai-copilot__input-wrapper">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(inputValue)}
                            placeholder="Ask about claims, costs, predictions..."
                        />
                        <button
                            className="ai-copilot__send"
                            onClick={() => handleSubmit(inputValue)}
                            disabled={!inputValue.trim() || isTyping}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <div className="ai-copilot__input-footer">
                        <span>Powered by Apex AI • Data updated 2 min ago</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export default AICopilot
