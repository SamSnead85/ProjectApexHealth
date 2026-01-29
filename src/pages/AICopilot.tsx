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

// Mock AI response generator
const generateAIResponse = (query: string): Promise<Message> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const responses: Record<string, { content: string; hasViz: boolean }> = {
                'cost driver': {
                    content: `Based on YTD claims analysis, here are your **top 10 cost drivers**:

1. **Specialty Pharmacy** - $720K (↑23% vs prior year)
   - Key drugs: Humira, Stelara, Ozempic
   
2. **Inpatient Surgical** - $485K (↑8%)
   - High-volume procedures: Joint replacements, spinal fusion
   
3. **Oncology** - $312K (↑15%)
   - 4 active cancer cases contributing 78% of category spend
   
4. **Dialysis/ESRD** - $285K (↑5%)
   - 3 members requiring ongoing treatment
   
5. **Mental Health** - $198K (↑32%)
   - Significant increase in residential treatment

**Recommended Actions:**
- Review specialty pharmacy formulary
- Evaluate COE program for orthopedic procedures
- Expand telehealth access for behavioral health`,
                    hasViz: true
                },
                'high-risk': {
                    content: `The ML model (91% accuracy) has identified **3 members** with elevated risk of becoming high-cost claimants:

| Member ID | Risk Score | Primary Conditions | Predicted 12-Mo Cost |
|-----------|-----------|-------------------|---------------------|
| HCC-2847 | 823 | Pre-diabetes, HTN, Obesity | $95K-$125K |
| HCC-1923 | 798 | CKD Stage 3, Diabetes | $110K-$145K |
| HCC-3412 | 756 | Chronic Pain, Depression | $75K-$95K |

**Key Risk Indicators:**
- Rising HbA1c levels in 2 members
- Increased ED utilization (3+ visits in 90 days)
- Gaps in preventive care compliance

**Intervention Recommendations:**
1. Enroll in disease management programs
2. Schedule PCP outreach calls
3. Review medication adherence`,
                    hasViz: true
                },
                'pharmacy': {
                    content: `**Year-over-Year Pharmacy Spend by Therapeutic Class:**

| Class | Current YTD | Prior YTD | Change |
|-------|-------------|-----------|--------|
| Specialty | $720K | $585K | +23% |
| Diabetes | $145K | $98K | +48% |
| Cardiovascular | $87K | $92K | -5% |
| Mental Health | $65K | $58K | +12% |
| Pain Management | $42K | $51K | -18% |

**Key Insights:**
- GLP-1 drugs (Ozempic, Wegovy) driving 65% of diabetes increase
- Specialty spend now represents 51% of total pharmacy
- Biosimilar adoption at 12% (industry avg: 28%)

**Savings Opportunities:**
- Biosimilar conversion: Est. $85K/year
- Site-of-care optimization: Est. $45K/year`,
                    hasViz: true
                },
                'default': {
                    content: `I'd be happy to help with that analysis. Based on your current claims data, I can provide insights on:

- **Claims trending** by category, provider, or diagnosis
- **Predictive analytics** for high-cost claimant identification
- **Benchmark comparisons** against industry standards
- **Stop-loss tracking** and recovery projections
- **Population health** metrics and care gaps

What specific aspect would you like to explore?`,
                    hasViz: false
                }
            }

            const lowerQuery = query.toLowerCase()
            let response = responses.default

            if (lowerQuery.includes('cost driver') || lowerQuery.includes('top')) {
                response = responses['cost driver']
            } else if (lowerQuery.includes('high-risk') || lowerQuery.includes('predict') || lowerQuery.includes('claimant')) {
                response = responses['high-risk']
            } else if (lowerQuery.includes('pharmacy') || lowerQuery.includes('drug') || lowerQuery.includes('rx')) {
                response = responses.pharmacy
            }

            resolve({
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: response.content,
                timestamp: new Date(),
                visualizations: response.hasViz ? [{ type: 'chart', data: {} }] : undefined
            })
        }, 1500)
    })
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
