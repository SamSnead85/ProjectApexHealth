import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles,
    Send,
    Loader2,
    Wand2,
    Lightbulb,
    AlertCircle,
    CheckCircle2,
    X
} from 'lucide-react'
import { useWorkflowStore } from '../../stores/workflowStore'
import { geminiService } from '../../services/gemini'
import { Button } from '../common'
import './AIAssistant.css'

interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
    status?: 'pending' | 'success' | 'error'
}

export function AIAssistant() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'system',
            content: 'Welcome to Apex AI Copilot! I can help you build workflows. Try asking me to "Create a claims adjudication workflow" or "Add a human review checkpoint".',
            timestamp: new Date(),
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { workflow, toggleAIAssistant, setNodes, setEdges } = useWorkflowStore()

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            // Check if user wants to generate a workflow
            const isWorkflowRequest =
                input.toLowerCase().includes('create') ||
                input.toLowerCase().includes('build') ||
                input.toLowerCase().includes('generate') ||
                input.toLowerCase().includes('workflow')

            if (isWorkflowRequest && input.toLowerCase().includes('workflow')) {
                // Generate workflow
                const generatedWorkflow = await geminiService.generateWorkflow(input)

                if (generatedWorkflow.nodes && generatedWorkflow.edges) {
                    setNodes(generatedWorkflow.nodes as any)
                    setEdges(generatedWorkflow.edges as any)

                    const assistantMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: `I've created a "${generatedWorkflow.name || 'New Workflow'}" with ${generatedWorkflow.nodes.length} nodes. ${generatedWorkflow.description || ''}\n\nYou can now drag nodes to reposition them, click on any node to configure it, or ask me to make changes.`,
                        timestamp: new Date(),
                        status: 'success',
                    }
                    setMessages((prev) => [...prev, assistantMessage])
                }
            } else {
                // Regular chat
                const response = await geminiService.chat(input, { workflow: workflow || undefined })

                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response,
                    timestamp: new Date(),
                }
                setMessages((prev) => [...prev, assistantMessage])
            }
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
                timestamp: new Date(),
                status: 'error',
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const quickActions = [
        { label: 'Claims workflow', prompt: 'Create a claims adjudication workflow with eligibility check, AI analysis, and human review' },
        { label: 'Prior auth flow', prompt: 'Create a prior authorization workflow for medical procedures' },
        { label: 'Add HITL node', prompt: 'Add a human-in-the-loop checkpoint before the final decision' },
        { label: 'Optimize workflow', prompt: 'Suggest optimizations for the current workflow' },
    ]

    return (
        <div className="ai-assistant">
            {/* Header */}
            <div className="ai-assistant__header">
                <div className="ai-assistant__header-left">
                    <Sparkles size={18} className="ai-assistant__header-icon" />
                    <span className="ai-assistant__header-title">AI Copilot</span>
                    <span className="ai-assistant__header-badge">Gemini</span>
                </div>
                <button
                    className="ai-assistant__close"
                    onClick={toggleAIAssistant}
                >
                    <X size={16} />
                </button>
            </div>

            {/* Messages */}
            <div className="ai-assistant__messages">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            className={`ai-assistant__message ai-assistant__message--${message.role}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {message.role === 'system' && (
                                <div className="ai-assistant__message-icon">
                                    <Lightbulb size={16} />
                                </div>
                            )}
                            {message.status === 'success' && (
                                <div className="ai-assistant__message-icon ai-assistant__message-icon--success">
                                    <CheckCircle2 size={16} />
                                </div>
                            )}
                            {message.status === 'error' && (
                                <div className="ai-assistant__message-icon ai-assistant__message-icon--error">
                                    <AlertCircle size={16} />
                                </div>
                            )}
                            <div className="ai-assistant__message-content">
                                {message.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        className="ai-assistant__message ai-assistant__message--assistant"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="ai-assistant__typing">
                            <Loader2 size={16} className="ai-assistant__spinner" />
                            <span>Thinking...</span>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
                <div className="ai-assistant__quick-actions">
                    <span className="ai-assistant__quick-label">Quick actions:</span>
                    <div className="ai-assistant__quick-buttons">
                        {quickActions.map((action) => (
                            <button
                                key={action.label}
                                className="ai-assistant__quick-btn"
                                onClick={() => {
                                    setInput(action.prompt)
                                    // Auto-submit the prompt after a small delay
                                    setTimeout(() => {
                                        const form = document.querySelector('.ai-assistant__input-area') as HTMLFormElement
                                        if (form) form.requestSubmit()
                                    }, 100)
                                }}
                                disabled={isLoading}
                            >
                                <Wand2 size={12} />
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <form className="ai-assistant__input-area" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Ask me to create or modify workflows..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="ai-assistant__input"
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!input.trim() || isLoading}
                    icon={isLoading ? <Loader2 size={14} className="ai-assistant__spinner" /> : <Send size={14} />}
                >
                    Send
                </Button>
            </form>
        </div>
    )
}

export default AIAssistant
