import { ReactNode, useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, User, Sparkles, Mic, MicOff, Send, Copy, ThumbsUp, ThumbsDown, RotateCcw, Loader, MessageSquare, Wand2, Lightbulb, ChevronDown, StopCircle, Zap } from 'lucide-react'
import './AIComponents.css'

// Chat Message
interface ChatMessage { id: string; role: 'user' | 'assistant' | 'system'; content: string; timestamp?: Date; status?: 'sending' | 'sent' | 'error' }

interface ChatMessageProps { message: ChatMessage; onCopy?: () => void; onRegenerate?: () => void; onFeedback?: (positive: boolean) => void; className?: string }

export function ChatMessageBubble({ message, onCopy, onRegenerate, onFeedback, className = '' }: ChatMessageProps) {
    const isUser = message.role === 'user'
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content)
        setCopied(true)
        onCopy?.()
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'} ${className}`}>
            <div className="chat-message__avatar">
                {isUser ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className="chat-message__content">
                <p>{message.content}</p>
                {!isUser && (
                    <div className="chat-message__actions">
                        <button onClick={handleCopy}>{copied ? 'Copied!' : <Copy size={14} />}</button>
                        <button onClick={() => onFeedback?.(true)}><ThumbsUp size={14} /></button>
                        <button onClick={() => onFeedback?.(false)}><ThumbsDown size={14} /></button>
                        <button onClick={onRegenerate}><RotateCcw size={14} /></button>
                    </div>
                )}
            </div>
            {message.timestamp && (
                <span className="chat-message__time">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
        </div>
    )
}

// AI Chat Input
interface AIChatInputProps { onSend?: (message: string) => void; onVoice?: () => void; isListening?: boolean; isLoading?: boolean; placeholder?: string; className?: string }

export function AIChatInput({ onSend, onVoice, isListening = false, isLoading = false, placeholder = 'Ask anything...', className = '' }: AIChatInputProps) {
    const [message, setMessage] = useState('')

    const handleSend = () => {
        if (!message.trim() || isLoading) return
        onSend?.(message)
        setMessage('')
    }

    return (
        <div className={`ai-chat-input ${className}`}>
            <div className="ai-chat-input__container">
                <Sparkles size={18} className="ai-chat-input__icon" />
                <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                    placeholder={placeholder} rows={1}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }} />
                {onVoice && (
                    <button className={`ai-chat-input__voice ${isListening ? 'listening' : ''}`} onClick={onVoice}>
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                )}
                <button className="ai-chat-input__send" onClick={handleSend} disabled={!message.trim() || isLoading}>
                    {isLoading ? <Loader size={18} className="spinning" /> : <Send size={18} />}
                </button>
            </div>
        </div>
    )
}

// AI Suggestion Chips
interface Suggestion { id: string; text: string; icon?: ReactNode }

interface AISuggestionChipsProps { suggestions: Suggestion[]; onSelect?: (suggestion: Suggestion) => void; className?: string }

export function AISuggestionChips({ suggestions, onSelect, className = '' }: AISuggestionChipsProps) {
    return (
        <div className={`ai-suggestion-chips ${className}`}>
            {suggestions.map(s => (
                <button key={s.id} className="ai-suggestion-chips__chip" onClick={() => onSelect?.(s)}>
                    {s.icon || <Lightbulb size={14} />}
                    <span>{s.text}</span>
                </button>
            ))}
        </div>
    )
}

// AI Thinking Indicator
interface AIThinkingProps { text?: string; className?: string }

export function AIThinking({ text = 'Thinking...', className = '' }: AIThinkingProps) {
    return (
        <div className={`ai-thinking ${className}`}>
            <div className="ai-thinking__dots"><span /><span /><span /></div>
            <span>{text}</span>
        </div>
    )
}

// AI Model Selector
interface AIModel { id: string; name: string; description?: string; badge?: string }

interface AIModelSelectorProps { models: AIModel[]; selectedId: string; onSelect?: (id: string) => void; className?: string }

export function AIModelSelector({ models, selectedId, onSelect, className = '' }: AIModelSelectorProps) {
    const [open, setOpen] = useState(false)
    const selected = models.find(m => m.id === selectedId)

    return (
        <div className={`ai-model-selector ${className}`}>
            <button className="ai-model-selector__trigger" onClick={() => setOpen(!open)}>
                <Zap size={14} />
                <span>{selected?.name || 'Select Model'}</span>
                <ChevronDown size={14} className={open ? 'rotated' : ''} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div className="ai-model-selector__dropdown" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        {models.map(m => (
                            <button key={m.id} className={`ai-model-selector__option ${m.id === selectedId ? 'selected' : ''}`}
                                onClick={() => { onSelect?.(m.id); setOpen(false) }}>
                                <div className="ai-model-selector__option-info">
                                    <span className="ai-model-selector__option-name">{m.name}</span>
                                    {m.description && <span className="ai-model-selector__option-desc">{m.description}</span>}
                                </div>
                                {m.badge && <span className="ai-model-selector__badge">{m.badge}</span>}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// AI Generation Card
interface AIGenerationProps { title: string; description?: string; icon?: ReactNode; onGenerate?: () => void; isGenerating?: boolean; className?: string }

export function AIGenerationCard({ title, description, icon, onGenerate, isGenerating = false, className = '' }: AIGenerationProps) {
    return (
        <div className={`ai-generation-card ${className}`}>
            <div className="ai-generation-card__icon">{icon || <Wand2 size={24} />}</div>
            <div className="ai-generation-card__content">
                <h4>{title}</h4>
                {description && <p>{description}</p>}
            </div>
            <button className="ai-generation-card__btn" onClick={onGenerate} disabled={isGenerating}>
                {isGenerating ? <><Loader size={16} className="spinning" /> Generating...</> : <><Sparkles size={16} /> Generate</>}
            </button>
        </div>
    )
}

// AI Streaming Text
interface AIStreamingTextProps { text: string; speed?: number; onComplete?: () => void; className?: string }

export function AIStreamingText({ text, speed = 30, onComplete, className = '' }: AIStreamingTextProps) {
    const [displayed, setDisplayed] = useState('')
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (index < text.length) {
            const timer = setTimeout(() => {
                setDisplayed(text.slice(0, index + 1))
                setIndex(index + 1)
            }, speed)
            return () => clearTimeout(timer)
        } else {
            onComplete?.()
        }
    }, [index, text, speed, onComplete])

    return (
        <div className={`ai-streaming-text ${className}`}>
            <p>{displayed}</p>
            {index < text.length && <span className="ai-streaming-text__cursor">|</span>}
        </div>
    )
}

export default { ChatMessageBubble, AIChatInput, AISuggestionChips, AIThinking, AIModelSelector, AIGenerationCard, AIStreamingText }
