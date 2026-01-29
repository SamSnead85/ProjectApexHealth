import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare,
    Send,
    Paperclip,
    Search,
    Phone,
    Video,
    MoreVertical,
    Star,
    Archive,
    Trash2,
    User,
    Users,
    Building2,
    Clock,
    CheckCheck,
    Check,
    Plus,
    Filter
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './MessageCenter.css'

interface Message {
    id: string
    content: string
    timestamp: string
    sender: 'user' | 'other'
    status: 'sent' | 'delivered' | 'read'
}

interface Conversation {
    id: string
    type: 'member' | 'provider' | 'support' | 'broker'
    name: string
    avatar?: string
    lastMessage: string
    lastMessageTime: string
    unreadCount: number
    online: boolean
    department?: string
    messages: Message[]
}

const mockConversations: Conversation[] = [
    {
        id: 'conv-1',
        type: 'support',
        name: 'Member Services',
        lastMessage: 'Your claim has been approved. You should see the payment within 3-5 business days.',
        lastMessageTime: '2024-01-26T15:30:00Z',
        unreadCount: 2,
        online: true,
        department: 'Claims Department',
        messages: [
            { id: 'm1', content: 'Hi, I have a question about my recent claim.', timestamp: '2024-01-26T15:00:00Z', sender: 'user', status: 'read' },
            { id: 'm2', content: 'Hello! I\'d be happy to help. Could you please provide your claim number?', timestamp: '2024-01-26T15:05:00Z', sender: 'other', status: 'read' },
            { id: 'm3', content: 'Sure, it\'s CLM-2024-45892', timestamp: '2024-01-26T15:10:00Z', sender: 'user', status: 'read' },
            { id: 'm4', content: 'Thank you. Let me check the status for you.', timestamp: '2024-01-26T15:15:00Z', sender: 'other', status: 'read' },
            { id: 'm5', content: 'Your claim has been approved. You should see the payment within 3-5 business days.', timestamp: '2024-01-26T15:30:00Z', sender: 'other', status: 'read' }
        ]
    },
    {
        id: 'conv-2',
        type: 'provider',
        name: 'Dr. Sarah Chen',
        lastMessage: 'Your lab results are ready. Please schedule a follow-up appointment.',
        lastMessageTime: '2024-01-25T10:00:00Z',
        unreadCount: 1,
        online: false,
        department: 'Premier Medical Associates',
        messages: [
            { id: 'm1', content: 'Good morning! Your lab results are ready.', timestamp: '2024-01-25T09:45:00Z', sender: 'other', status: 'read' },
            { id: 'm2', content: 'Your lab results are ready. Please schedule a follow-up appointment.', timestamp: '2024-01-25T10:00:00Z', sender: 'other', status: 'delivered' }
        ]
    },
    {
        id: 'conv-3',
        type: 'broker',
        name: 'James Wilson',
        lastMessage: 'I\'ve attached the updated plan comparison for your review.',
        lastMessageTime: '2024-01-24T16:30:00Z',
        unreadCount: 0,
        online: true,
        department: 'Benefits Advisor',
        messages: [
            { id: 'm1', content: 'Hi, can you help me compare dental plans?', timestamp: '2024-01-24T14:00:00Z', sender: 'user', status: 'read' },
            { id: 'm2', content: 'Of course! Let me pull together some options for you.', timestamp: '2024-01-24T14:30:00Z', sender: 'other', status: 'read' },
            { id: 'm3', content: 'I\'ve attached the updated plan comparison for your review.', timestamp: '2024-01-24T16:30:00Z', sender: 'other', status: 'read' }
        ]
    }
]

export function MessageCenter() {
    const [conversations] = useState<Conversation[]>(mockConversations)
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0])
    const [newMessage, setNewMessage] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all')

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        } else if (diffDays === 1) {
            return 'Yesterday'
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
    }

    const getTypeIcon = (type: Conversation['type']) => {
        switch (type) {
            case 'member': return <User size={16} />
            case 'provider': return <Building2 size={16} />
            case 'support': return <Users size={16} />
            case 'broker': return <User size={16} />
        }
    }

    const getStatusIcon = (status: Message['status']) => {
        switch (status) {
            case 'sent': return <Check size={12} />
            case 'delivered': return <CheckCheck size={12} />
            case 'read': return <CheckCheck size={12} className="read" />
        }
    }

    const handleSend = () => {
        if (newMessage.trim() && selectedConversation) {
            // In production, this would send to backend
            console.log('Sending:', newMessage)
            setNewMessage('')
        }
    }

    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

    return (
        <div className="message-center">
            {/* Sidebar */}
            <div className="message-center__sidebar">
                <div className="message-center__sidebar-header">
                    <h2>Messages</h2>
                    {totalUnread > 0 && (
                        <Badge variant="critical">{totalUnread}</Badge>
                    )}
                </div>

                {/* Search */}
                <div className="message-center__search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filters */}
                <div className="message-center__filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Unread
                    </button>
                    <button
                        className={`filter-btn ${filter === 'starred' ? 'active' : ''}`}
                        onClick={() => setFilter('starred')}
                    >
                        <Star size={12} />
                    </button>
                </div>

                {/* Conversation List */}
                <div className="message-center__conversations">
                    {conversations.map((conv, index) => (
                        <motion.button
                            key={conv.id}
                            className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''} ${conv.unreadCount > 0 ? 'unread' : ''}`}
                            onClick={() => setSelectedConversation(conv)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="conversation-item__avatar">
                                {getTypeIcon(conv.type)}
                                {conv.online && <span className="online-indicator" />}
                            </div>
                            <div className="conversation-item__info">
                                <div className="conversation-item__header">
                                    <span className="conversation-item__name">{conv.name}</span>
                                    <span className="conversation-item__time">{formatTime(conv.lastMessageTime)}</span>
                                </div>
                                <div className="conversation-item__preview">
                                    <span className="conversation-item__message">{conv.lastMessage}</span>
                                    {conv.unreadCount > 0 && (
                                        <span className="conversation-item__badge">{conv.unreadCount}</span>
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* New Message Button */}
                <Button variant="primary" icon={<Plus size={16} />} className="new-message-btn">
                    New Message
                </Button>
            </div>

            {/* Chat Area */}
            <div className="message-center__chat">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="chat__header">
                            <div className="chat__header-info">
                                <div className="chat__avatar">
                                    {getTypeIcon(selectedConversation.type)}
                                    {selectedConversation.online && <span className="online-indicator" />}
                                </div>
                                <div>
                                    <h3>{selectedConversation.name}</h3>
                                    <span className="chat__department">{selectedConversation.department}</span>
                                </div>
                            </div>
                            <div className="chat__header-actions">
                                <button className="chat__action-btn">
                                    <Phone size={18} />
                                </button>
                                <button className="chat__action-btn">
                                    <Video size={18} />
                                </button>
                                <button className="chat__action-btn">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="chat__messages">
                            <AnimatePresence>
                                {selectedConversation.messages.map((message, index) => (
                                    <motion.div
                                        key={message.id}
                                        className={`chat__message ${message.sender === 'user' ? 'outgoing' : 'incoming'}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div className="chat__message-content">
                                            <p>{message.content}</p>
                                            <div className="chat__message-meta">
                                                <span>{formatTime(message.timestamp)}</span>
                                                {message.sender === 'user' && getStatusIcon(message.status)}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Input */}
                        <div className="chat__input-area">
                            <button className="chat__attach-btn">
                                <Paperclip size={18} />
                            </button>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                className="chat__send-btn"
                                onClick={handleSend}
                                disabled={!newMessage.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="chat__empty">
                        <MessageSquare size={48} />
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MessageCenter
