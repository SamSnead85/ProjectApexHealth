import { ReactNode, useState, createContext, useContext, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Send, Bot, User, Loader2, Maximize2, Minimize2, RefreshCw } from 'lucide-react'
import './ChatWidget.css'

interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
    isTyping?: boolean
}

interface ChatContextType {
    messages: Message[]
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
    clearMessages: () => void
    isTyping: boolean
    setIsTyping: (typing: boolean) => void
}

const ChatContext = createContext<ChatContextType | null>(null)

export function useChatContext() {
    const context = useContext(ChatContext)
    if (!context) throw new Error('useChatContext must be used within ChatProvider')
    return context
}

interface ChatProviderProps {
    children: ReactNode
    onSendMessage?: (message: string) => Promise<string>
}

export function ChatProvider({ children, onSendMessage }: ChatProviderProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isTyping, setIsTyping] = useState(false)

    const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
        const newMessage: Message = {
            ...message,
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, newMessage])
    }, [])

    const clearMessages = useCallback(() => {
        setMessages([])
    }, [])

    return (
        <ChatContext.Provider value={{ messages, addMessage, clearMessages, isTyping, setIsTyping }}>
            {children}
        </ChatContext.Provider>
    )
}

interface ChatWidgetProps {
    title?: string
    subtitle?: string
    placeholder?: string
    welcomeMessage?: string
    position?: 'bottom-right' | 'bottom-left'
    onSendMessage: (message: string) => Promise<string>
    className?: string
}

export function ChatWidget({
    title = 'Support',
    subtitle = 'How can we help?',
    placeholder = 'Type a message...',
    welcomeMessage = 'Hello! How can I assist you today?',
    position = 'bottom-right',
    onSendMessage,
    className = ''
}: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { id: 'welcome', role: 'assistant', content: welcomeMessage, timestamp: new Date() }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return

        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsTyping(true)

        try {
            const response = await onSendMessage(inputValue)
            const assistantMessage: Message = {
                id: `msg-${Date.now()}-assistant`,
                role: 'assistant',
                content: response,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            const errorMessage: Message = {
                id: `msg-${Date.now()}-error`,
                role: 'system',
                content: 'Sorry, something went wrong. Please try again.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsTyping(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <>
            {/* Toggle Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        className={`chat-widget__toggle chat-widget__toggle--${position}`}
                        onClick={() => setIsOpen(true)}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <MessageCircle size={24} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={`chat-widget ${isExpanded ? 'chat-widget--expanded' : ''} chat-widget--${position} ${className}`}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    >
                        {/* Header */}
                        <div className="chat-widget__header">
                            <div className="chat-widget__header-info">
                                <span className="chat-widget__title">{title}</span>
                                <span className="chat-widget__subtitle">{subtitle}</span>
                            </div>
                            <div className="chat-widget__header-actions">
                                <button onClick={() => setIsExpanded(!isExpanded)}>
                                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                </button>
                                <button onClick={() => setIsOpen(false)}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="chat-widget__messages">
                            {messages.map(message => (
                                <div
                                    key={message.id}
                                    className={`chat-widget__message chat-widget__message--${message.role}`}
                                >
                                    <div className="chat-widget__message-avatar">
                                        {message.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className="chat-widget__message-content">
                                        {message.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="chat-widget__message chat-widget__message--assistant">
                                    <div className="chat-widget__message-avatar">
                                        <Bot size={14} />
                                    </div>
                                    <div className="chat-widget__typing">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="chat-widget__input">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={placeholder}
                                disabled={isTyping}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isTyping}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

// Inline Chat (embedded version)
interface InlineChatProps {
    messages: Message[]
    onSendMessage: (message: string) => void
    isTyping?: boolean
    placeholder?: string
    className?: string
}

export function InlineChat({
    messages,
    onSendMessage,
    isTyping = false,
    placeholder = 'Type a message...',
    className = ''
}: InlineChatProps) {
    const [inputValue, setInputValue] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = () => {
        if (!inputValue.trim() || isTyping) return
        onSendMessage(inputValue)
        setInputValue('')
    }

    return (
        <div className={`inline-chat ${className}`}>
            <div className="inline-chat__messages">
                {messages.map(message => (
                    <div
                        key={message.id}
                        className={`inline-chat__message inline-chat__message--${message.role}`}
                    >
                        {message.content}
                    </div>
                ))}
                {isTyping && (
                    <div className="inline-chat__typing">
                        <Loader2 size={14} className="spin" />
                        Typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="inline-chat__input">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={placeholder}
                />
                <button onClick={handleSend} disabled={!inputValue.trim() || isTyping}>
                    <Send size={16} />
                </button>
            </div>
        </div>
    )
}

export default ChatWidget
