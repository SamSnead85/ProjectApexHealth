import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare,
    Search,
    Send,
    Paperclip,
    Image,
    Mic,
    MoreVertical,
    Phone,
    Video,
    User,
    Check,
    CheckCheck,
    Clock,
    ChevronLeft,
    Plus,
    Archive,
    Star,
    Trash2
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './SecureMessaging.css'

// Message types
interface Message {
    id: string
    senderId: string
    content: string
    timestamp: Date
    status: 'sent' | 'delivered' | 'read'
    attachments?: { name: string; type: string }[]
}

interface Conversation {
    id: string
    participant: {
        name: string
        title: string
        avatar?: string
    }
    lastMessage: string
    lastMessageTime: Date
    unreadCount: number
    isOnline: boolean
}

const mockConversations: Conversation[] = [
    {
        id: 'c1',
        participant: { name: 'Dr. Sarah Chen', title: 'Primary Care Physician' },
        lastMessage: 'Your lab results look great! Keep up the good work.',
        lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
        unreadCount: 1,
        isOnline: true
    },
    {
        id: 'c2',
        participant: { name: 'Care Coordinator', title: 'Member Services' },
        lastMessage: 'Your appointment has been confirmed for Friday.',
        lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        unreadCount: 0,
        isOnline: true
    },
    {
        id: 'c3',
        participant: { name: 'Dr. Michael Rivera', title: 'Cardiologist' },
        lastMessage: "I've reviewed your ECG and everything looks normal.",
        lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        unreadCount: 0,
        isOnline: false
    }
]

const mockMessages: Message[] = [
    {
        id: 'm1',
        senderId: 'provider',
        content: 'Hello! I wanted to follow up on your recent lab results.',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        status: 'read'
    },
    {
        id: 'm2',
        senderId: 'me',
        content: 'Hi Dr. Chen! Yes, I was hoping to discuss them.',
        timestamp: new Date(Date.now() - 55 * 60 * 1000),
        status: 'read'
    },
    {
        id: 'm3',
        senderId: 'provider',
        content: 'Your lab results look great! Your cholesterol levels have improved significantly since your last visit.',
        timestamp: new Date(Date.now() - 50 * 60 * 1000),
        status: 'read'
    },
    {
        id: 'm4',
        senderId: 'provider',
        content: 'Keep up the good work with the diet and exercise changes we discussed.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'read'
    }
]

export function SecureMessaging() {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0])
    const [messages, setMessages] = useState(mockMessages)
    const [newMessage, setNewMessage] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }

    const formatDate = (date: Date) => {
        const diff = Date.now() - date.getTime()
        if (diff < 24 * 60 * 60 * 1000) return formatTime(date)
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            return date.toLocaleDateString('en-US', { weekday: 'short' })
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const handleSend = () => {
        if (!newMessage.trim()) return

        const message: Message = {
            id: `m${messages.length + 1}`,
            senderId: 'me',
            content: newMessage,
            timestamp: new Date(),
            status: 'sent'
        }

        setMessages([...messages, message])
        setNewMessage('')
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="secure-messaging">
            {/* Conversations List */}
            <aside className="conversations-panel">
                <div className="conversations-header">
                    <h2>Messages</h2>
                    <Button variant="ghost" size="sm" icon={<Plus size={16} />}>
                        New
                    </Button>
                </div>

                <div className="conversations-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="conversations-list">
                    {mockConversations.map(conv => (
                        <motion.button
                            key={conv.id}
                            className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                            onClick={() => setSelectedConversation(conv)}
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
                        >
                            <div className="conversation-avatar">
                                <span>{conv.participant.name.split(' ').map(n => n[0]).join('')}</span>
                                {conv.isOnline && <span className="online-indicator" />}
                            </div>
                            <div className="conversation-info">
                                <div className="conversation-header">
                                    <span className="conversation-name">{conv.participant.name}</span>
                                    <span className="conversation-time">{formatDate(conv.lastMessageTime)}</span>
                                </div>
                                <p className="conversation-preview">{conv.lastMessage}</p>
                            </div>
                            {conv.unreadCount > 0 && (
                                <Badge variant="teal" size="sm">{conv.unreadCount}</Badge>
                            )}
                        </motion.button>
                    ))}
                </div>
            </aside>

            {/* Chat Panel */}
            {selectedConversation ? (
                <main className="chat-panel">
                    {/* Chat Header */}
                    <div className="chat-header">
                        <button className="back-btn">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="chat-participant">
                            <div className="chat-avatar">
                                <span>{selectedConversation.participant.name.split(' ').map(n => n[0]).join('')}</span>
                                {selectedConversation.isOnline && <span className="online-indicator" />}
                            </div>
                            <div className="chat-participant-info">
                                <h3>{selectedConversation.participant.name}</h3>
                                <span>{selectedConversation.participant.title}</span>
                            </div>
                        </div>
                        <div className="chat-actions">
                            <button className="chat-action"><Phone size={18} /></button>
                            <button className="chat-action"><Video size={18} /></button>
                            <button className="chat-action"><MoreVertical size={18} /></button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.map((message, index) => {
                            const isMe = message.senderId === 'me'
                            const showAvatar = !isMe && (
                                index === 0 || messages[index - 1].senderId !== message.senderId
                            )

                            return (
                                <motion.div
                                    key={message.id}
                                    className={`message ${isMe ? 'message--sent' : 'message--received'}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {!isMe && showAvatar && (
                                        <div className="message-avatar">
                                            <span>{selectedConversation.participant.name.split(' ').map(n => n[0]).join('')}</span>
                                        </div>
                                    )}
                                    <div className="message-content">
                                        <div className="message-bubble">
                                            {message.content}
                                        </div>
                                        <div className="message-meta">
                                            <span className="message-time">{formatTime(message.timestamp)}</span>
                                            {isMe && (
                                                <span className="message-status">
                                                    {message.status === 'read' ? <CheckCheck size={14} /> : <Check size={14} />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chat-input">
                        <button className="input-action"><Paperclip size={18} /></button>
                        <button className="input-action"><Image size={18} /></button>
                        <div className="input-field">
                            <textarea
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                rows={1}
                            />
                        </div>
                        <button
                            className={`send-btn ${newMessage.trim() ? 'active' : ''}`}
                            onClick={handleSend}
                            disabled={!newMessage.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </main>
            ) : (
                <div className="chat-empty">
                    <MessageSquare size={48} />
                    <h3>Select a conversation</h3>
                    <p>Choose from your existing conversations or start a new one</p>
                </div>
            )}
        </div>
    )
}

export default SecureMessaging
