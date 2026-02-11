import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare, X, Send, User, Brain, ArrowRight,
    BarChart3, FileText, Shield, Users, Clock, Zap
} from 'lucide-react'
import './AICopilot.css'

// ── Types ──
interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    actions?: { label: string; path?: string; type?: string }[]
    dataCard?: { title: string; items: { label: string; value: string; status?: string }[] }
}

// ── Healthcare Knowledge Base ──
interface KBEntry {
    patterns: RegExp[]
    response: string
    actions?: Message['actions']
    dataCard?: Message['dataCard']
    followUp?: string[]
}

const knowledgeBase: KBEntry[] = [
    // Claims
    {
        patterns: [/claim.*(status|track|where|check)/i, /where.*claim/i, /CLM-\d+/i],
        response: "I found the claim information. Claim CLM-2024-4821 is currently in **Adjudication Review** — submitted 2 days ago for $3,240.00 (Orthopedic Consult). The auto-adjudication engine flagged it for manual review due to a modifier mismatch on line 2. Expected resolution: within 24 hours.",
        dataCard: { title: 'Claim CLM-2024-4821', items: [
            { label: 'Status', value: 'In Review', status: 'warning' },
            { label: 'Amount', value: '$3,240.00' },
            { label: 'Provider', value: 'Dr. James Wilson' },
            { label: 'Flag', value: 'Modifier mismatch' }
        ]},
        actions: [{ label: 'View Claim Details', path: '/admin/claims' }],
        followUp: ['What are the top denial reasons?', 'Show claims pending review']
    },
    {
        patterns: [/claim.*(trend|volume|how many)/i, /claims.*today/i, /claim.*summary/i],
        response: "Today's claims summary: **2,847 claims** received, **94.2% auto-adjudicated**, denial rate at **4.8%** (down from 5.3% last week). Top category: Professional Services (62%). Average processing time: 1.2 seconds for auto-adjudicated claims.",
        actions: [{ label: 'Open Claims Dashboard', path: '/admin/claims' }, { label: 'View Denial Analysis', path: '/admin/denial-management' }],
        followUp: ['What are the denial trends?', 'Compare to last month']
    },
    {
        patterns: [/denial.*(rate|trend|top|reason|why)/i, /why.*denied/i],
        response: "Current denial rate: **4.8%**. Top 5 denial reasons this month:\n1. Missing/invalid authorization (28%)\n2. Service not covered (19%)\n3. Timely filing exceeded (15%)\n4. Duplicate claim (12%)\n5. Coding error (11%)\n\nAI recommendation: Focus on prior auth automation — it could reduce denials by 22%.",
        actions: [{ label: 'Denial Command Center', path: '/admin/denial-management' }]
    },
    // Eligibility
    {
        patterns: [/eligib.*(check|verify|status|look)/i, /is.*eligible/i, /member.*active/i],
        response: "To verify eligibility, I need a member ID or name. However, I can share current stats: **98.7% of eligibility checks** are returning results in under 200ms. Real-time 270/271 EDI verification is active with all major payers. 12 members had eligibility changes today.",
        actions: [{ label: 'Check Eligibility', path: '/admin/eligibility' }],
        followUp: ['Show recent eligibility changes', 'Check member MBR-001']
    },
    {
        patterns: [/MBR-\d+/i, /member.*(info|details|look up|find)/i],
        response: "Member lookup result for **MBR-10042 (Sarah Martinez)**:\n- Plan: Gold PPO\n- Status: Active (enrolled since Jan 2024)\n- Deductible: $1,200 used of $2,500\n- PCP: Dr. Amanda Park, Internal Medicine\n- Last claim: Dec 15, 2025 — Routine checkup ($185)",
        dataCard: { title: 'Sarah Martinez — MBR-10042', items: [
            { label: 'Plan', value: 'Gold PPO', status: 'success' },
            { label: 'Deductible Used', value: '$1,200 / $2,500' },
            { label: 'OOP Max', value: '$3,800 / $6,500' },
            { label: 'Last Visit', value: 'Dec 15, 2025' }
        ]},
        actions: [{ label: 'Full Member 360°', path: '/admin/member-360' }]
    },
    // Prior Auth
    {
        patterns: [/prior.*auth/i, /pre.*auth/i, /authorization.*(status|pending|require)/i],
        response: "Prior authorization overview: **47 pending** reviews, **12 urgent** (under 72-hour deadline). Auto-approval rate: 68% (up 5% this quarter). Average turnaround: 18 hours for standard, 4 hours for urgent. CMS compliance: all within regulatory timeframes.",
        actions: [{ label: 'Prior Auth Queue', path: '/admin/prior-auth' }]
    },
    // Benefits
    {
        patterns: [/benefit|deductible|copay|coinsurance|out.*pocket|oop/i],
        response: "I can look up specific benefit details. For a general overview: the platform manages **23 active benefit plans** across 4 plan types (HMO, PPO, EPO, HDHP). Deductibles range from $500–$6,500. Average utilization this year: 62% of deductible, 41% of OOP max.",
        actions: [{ label: 'Benefit Calculator', path: '/admin/benefit-calculator' }]
    },
    // Compliance
    {
        patterns: [/hipaa|compliance|audit|security|phi/i],
        response: "Compliance status: **All green.** HIPAA audit score: 97/100. Last PHI access audit: today at 06:00 AM — 0 violations detected. SOC 2 Type II certification current through Q3 2026. HITRUST r2 assessment: validated. 284 access events logged today, all within policy.",
        actions: [{ label: 'Compliance Center', path: '/admin/compliance-center' }, { label: 'Audit Dashboard', path: '/admin/audit' }]
    },
    {
        patterns: [/fhir|interop|api.*compliance|cms.*0057/i],
        response: "FHIR R4 compliance dashboard: Patient Access API — **operational**, Provider Directory API — **operational**, Payer-to-Payer — **operational**. CMS-0057-F deadline countdown: 187 days. All endpoints meeting latency SLA (<500ms). 12,847 API calls today.",
        actions: [{ label: 'FHIR Explorer', path: '/admin/fhir-explorer' }]
    },
    // Analytics & Reports
    {
        patterns: [/report|executive.*summary|analytics|kpi/i],
        response: "Key metrics this quarter: MLR **82.4%** (target: 85%), PMPM cost **$487** (down 3.2%), enrollment **+2.1%**, NPS **72** (up 4 points). I can generate a detailed executive report with trend analysis, benchmark comparisons, and AI recommendations.",
        actions: [{ label: 'Executive Dashboard', path: '/admin/executive-dashboard' }, { label: 'Build Custom Report', path: '/admin/custom-report-builder' }]
    },
    {
        patterns: [/star.*rating|hedis|quality.*measure|cahps/i],
        response: "Current CMS Star Rating: **4.2 / 5.0** (up from 3.8 last year). HEDIS measures: 82% of measures meeting threshold. CAHPS scores improving across all domains. Top improvement opportunity: Medication Adherence for Diabetes (currently 71%, target 80%).",
        actions: [{ label: 'STAR Ratings Dashboard', path: '/admin/star-ratings' }]
    },
    // Billing & Financial
    {
        patterns: [/billing|invoice|payment|revenue|financial/i],
        response: "Financial snapshot: Accounts receivable **$4.2M** (down 8% from last month). Clean claim rate: **96.3%**. Average days in AR: 28 (industry avg: 42). Collections rate: 98.1%. $890K in payments processed today.",
        actions: [{ label: 'Revenue Analytics', path: '/admin/revenue-analytics' }, { label: 'Aging Reports', path: '/admin/aging-reports' }]
    },
    // Provider
    {
        patterns: [/provider.*(network|find|directory|search)/i, /doctor|specialist/i],
        response: "Provider network: **8,420 active providers** across 42 specialties. Network adequacy: meeting CMS standards in all regions. 23 new provider applications pending credentialing. Average credentialing turnaround: 12 business days.",
        actions: [{ label: 'Provider Directory', path: '/admin/provider-network' }, { label: 'Credentialing', path: '/admin/credentialing' }]
    },
    // EDI
    {
        patterns: [/edi|x12|837|835|270|271|transaction/i],
        response: "EDI transaction status: **23,847 transactions** processed today. Success rate: 99.2%. 189 failed transactions in retry queue. Top trading partners: Anthem (4.2K), UHC (3.8K), Aetna (3.1K). All within SLA.",
        actions: [{ label: 'EDI Monitor', path: '/admin/edi-manager' }]
    },
    // Workflow
    {
        patterns: [/workflow|automat|process/i],
        response: "Active workflows: **34 running**, 8 paused, 2 with errors. Top performing: Claims Auto-Adjudication (94.2% auto-rate), Member Welcome (100% delivery). Workflow engine processed 12,400 tasks today. 2 workflows need attention — both are awaiting human-in-the-loop approval.",
        actions: [{ label: 'Workflow Builder', path: '/admin/workflow-builder' }]
    },
    // Fraud
    {
        patterns: [/fraud|suspicious|anomal|waste|abuse|fwa/i],
        response: "FWA detection: **23 flagged claims** this week (down from 31 last week). AI confidence scores range from 72%–96%. Estimated savings from fraud prevention this quarter: **$1.8M**. Top patterns: upcoding (8), unbundling (6), duplicate billing (5).",
        actions: [{ label: 'Fraud Detection', path: '/admin/fraud-detection' }]
    },
    // SDOH
    {
        patterns: [/sdoh|social.*determinant|food.*insec|housing|transport/i],
        response: "SDOH screening results: **4,200 members screened** this quarter. Risk distribution: 18% high risk, 34% moderate, 48% low. Top risk factors: food insecurity (22%), transportation barriers (18%), housing instability (14%). 847 community resource referrals made.",
        actions: [{ label: 'SDOH Dashboard', path: '/admin/social-determinants' }]
    },
]

// Fallback responses
const fallbacks = [
    "I can help with claims processing, eligibility verification, prior authorizations, compliance monitoring, analytics, and more. Could you be more specific about what you'd like to explore?",
    "That's an interesting question. I can pull data on claims, members, providers, financials, or compliance metrics. Which area would be most helpful?",
    "I'd be happy to assist. Try asking about specific topics like 'claim status', 'denial trends', 'eligibility check', or 'compliance audit'. I have deep knowledge across all healthcare operations.",
]

// ── Suggestions ──
const defaultSuggestions = [
    { icon: BarChart3, text: "Today's claims summary" },
    { icon: Shield, text: 'Compliance status check' },
    { icon: Users, text: 'Member eligibility overview' },
    { icon: FileText, text: 'Generate executive report' },
]

// ── Component ──
export default function AICopilot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>(() => {
        const stored = sessionStorage.getItem('apex_copilot_messages')
        if (stored) {
            try {
                return JSON.parse(stored).map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) }))
            } catch { /* ignore */ }
        }
        return [{
            id: '1', role: 'assistant' as const,
            content: "Welcome to Apex AI. I have access to your platform's claims, eligibility, compliance, and analytics data. How can I help you today?",
            timestamp: new Date()
        }]
    })
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [fallbackIdx, setFallbackIdx] = useState(0)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Persist messages
    useEffect(() => {
        sessionStorage.setItem('apex_copilot_messages', JSON.stringify(messages))
    }, [messages])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    const findResponse = useCallback((userInput: string): KBEntry | null => {
        const lower = userInput.toLowerCase()
        for (const entry of knowledgeBase) {
            for (const pattern of entry.patterns) {
                if (pattern.test(lower) || pattern.test(userInput)) {
                    return entry
                }
            }
        }
        return null
    }, [])

    const handleSend = useCallback(async (text?: string) => {
        const msg = text || input.trim()
        if (!msg) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: msg,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsTyping(true)

        // Simulate processing delay (realistic typing speed)
        const delay = 800 + Math.random() * 1200
        setTimeout(() => {
            const match = findResponse(msg)

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: match?.response || fallbacks[fallbackIdx % fallbacks.length],
                timestamp: new Date(),
                actions: match?.actions,
                dataCard: match?.dataCard,
            }

            if (!match) setFallbackIdx(prev => prev + 1)
            setMessages(prev => [...prev, assistantMessage])
            setIsTyping(false)
        }, delay)
    }, [input, findResponse, fallbackIdx])

    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const statusColor = (s?: string) => s === 'success' ? '#0E7B5A' : s === 'warning' ? '#B8860B' : s === 'error' ? '#C53030' : '#9BA4B4'

    return (
        <>
            {/* Subtle trigger button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        className="ai-copilot-trigger"
                        onClick={() => setIsOpen(true)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        aria-label="Open AI Assistant"
                    >
                        <MessageSquare size={20} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && createPortal(
                    <motion.div
                        className="ai-copilot-panel"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Header */}
                        <div className="copilot-header">
                            <div className="copilot-title">
                                <div className="copilot-avatar"><Brain size={18} /></div>
                                <div>
                                    <h3>Apex AI</h3>
                                    <span><span className="online-dot" />Healthcare Intelligence</span>
                                </div>
                            </div>
                            <button className="copilot-close" onClick={() => setIsOpen(false)} aria-label="Close"><X size={16} /></button>
                        </div>

                        {/* Messages */}
                        <div className="copilot-messages">
                            {messages.map((message) => (
                                <div key={message.id} className={`message ${message.role}`}>
                                    <div className="message-avatar">
                                        {message.role === 'assistant' ? <Brain size={14} /> : <User size={14} />}
                                    </div>
                                    <div className="message-body">
                                        <div className="message-content">{message.content}</div>

                                        {/* Data Card */}
                                        {message.dataCard && (
                                            <div className="message-data-card">
                                                <div className="data-card-title">{message.dataCard.title}</div>
                                                {message.dataCard.items.map((item, i) => (
                                                    <div key={i} className="data-card-row">
                                                        <span className="data-card-label">{item.label}</span>
                                                        <span className="data-card-value" style={{ color: statusColor(item.status) }}>{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        {message.actions && (
                                            <div className="message-actions">
                                                {message.actions.map((action, i) => (
                                                    <button key={i} className="action-btn" onClick={() => {
                                                        if (action.path) {
                                                            const nav = document.querySelector('[data-navigate]') as HTMLElement
                                                            if (nav) nav.click()
                                                        }
                                                    }}>
                                                        {action.label} <ArrowRight size={12} />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <div className="message-time">{formatTime(message.timestamp)}</div>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="message assistant">
                                    <div className="message-avatar"><Brain size={14} /></div>
                                    <div className="message-body">
                                        <div className="message-content">
                                            <div className="typing-indicator">
                                                <span className="typing-dot" />
                                                <span className="typing-dot" />
                                                <span className="typing-dot" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestions (show when few messages) */}
                        {messages.length <= 2 && (
                            <div className="copilot-suggestions">
                                {defaultSuggestions.map((s, i) => (
                                    <button key={i} className="suggestion-chip" onClick={() => handleSend(s.text)}>
                                        <s.icon size={13} /> {s.text}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="copilot-input">
                            <input
                                type="text"
                                placeholder="Ask about claims, eligibility, compliance..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button className="send-btn" onClick={() => handleSend()} disabled={!input.trim() || isTyping}>
                                <Send size={16} />
                            </button>
                        </div>
                    </motion.div>,
                    document.body
                )}
            </AnimatePresence>
        </>
    )
}
