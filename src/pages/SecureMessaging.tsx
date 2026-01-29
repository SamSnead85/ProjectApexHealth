import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    MessageSquare,
    Send,
    Search,
    Filter,
    User,
    Clock,
    CheckCircle2,
    Paperclip,
    Plus,
    Star,
    Archive,
    Trash2,
    MoreVertical
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './SecureMessaging.css'

interface Message {
    id: string
    subject: string
    from: string
    fromRole: 'member' | 'provider' | 'support' | 'system'
    preview: string
    date: string
    read: boolean
    starred: boolean
    hasAttachment: boolean
}

const messages: Message[] = [
    { id: 'MSG-001', subject: 'Lab Results Available', from: 'Dr. Sarah Mitchell', fromRole: 'provider', preview: 'Your recent lab results are now available for review...', date: '2024-01-26T10:30:00', read: false, starred: true, hasAttachment: true },
    { id: 'MSG-002', subject: 'Prescription Refill Approved', from: 'Apex Pharmacy', fromRole: 'system', preview: 'Your prescription refill request has been approved...', date: '2024-01-25T14:22:00', read: false, starred: false, hasAttachment: false },
    { id: 'MSG-003', subject: 'Appointment Reminder', from: 'Member Services', fromRole: 'support', preview: 'This is a reminder about your upcoming appointment...', date: '2024-01-24T09:00:00', read: true, starred: false, hasAttachment: false },
    { id: 'MSG-004', subject: 'Claim Status Update', from: 'Claims Department', fromRole: 'system', preview: 'Your claim CLM-2024-1234 has been processed...', date: '2024-01-23T16:45:00', read: true, starred: false, hasAttachment: true },
    { id: 'MSG-005', subject: 'Welcome to Apex Health', from: 'Member Services', fromRole: 'support', preview: 'Welcome! Here are some tips to get started...', date: '2024-01-15T08:00:00', read: true, starred: true, hasAttachment: false }
]

export function SecureMessaging() {
    const [allMessages] = useState<Message[]>(messages)
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
    const [filterType, setFilterType] = useState('all')

    const getAvatarColor = (role: Message['fromRole']) => {
        switch (role) {
            case 'provider': return 'provider'
            case 'support': return 'support'
            case 'system': return 'system'
            default: return 'member'
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const today = new Date()
        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const unreadCount = allMessages.filter(m => !m.read).length

    return (
        <div className="secure-messaging-page">
            {/* Header */}
            <div className="messaging__header">
                <div>
                    <h1 className="messaging__title">Secure Messages</h1>
                    <p className="messaging__subtitle">
                        HIPAA-compliant messaging with your care team
                    </p>
                </div>
                <Button variant="primary" icon={<Plus size={16} />}>
                    New Message
                </Button>
            </div>

            {/* Content */}
            <div className="messaging__content">
                {/* Sidebar */}
                <div className="messaging__sidebar">
                    <div className="messaging__folders">
                        <button className={`folder-item ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>
                            <MessageSquare size={16} />
                            <span>Inbox</span>
                            {unreadCount > 0 && <Badge variant="teal" size="sm">{unreadCount}</Badge>}
                        </button>
                        <button className={`folder-item ${filterType === 'starred' ? 'active' : ''}`} onClick={() => setFilterType('starred')}>
                            <Star size={16} />
                            <span>Starred</span>
                        </button>
                        <button className={`folder-item ${filterType === 'sent' ? 'active' : ''}`} onClick={() => setFilterType('sent')}>
                            <Send size={16} />
                            <span>Sent</span>
                        </button>
                        <button className="folder-item">
                            <Archive size={16} />
                            <span>Archive</span>
                        </button>
                    </div>
                </div>

                {/* Message List */}
                <div className="messaging__list">
                    <div className="list-header">
                        <div className="search-box">
                            <Search size={16} />
                            <input type="text" placeholder="Search messages..." />
                        </div>
                        <Button variant="ghost" size="sm" icon={<Filter size={14} />} />
                    </div>

                    <div className="messages-list">
                        {allMessages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                className={`message-item ${!message.read ? 'unread' : ''} ${selectedMessage?.id === message.id ? 'selected' : ''}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => setSelectedMessage(message)}
                            >
                                <div className={`message-avatar ${getAvatarColor(message.fromRole)}`}>
                                    <User size={16} />
                                </div>
                                <div className="message-content">
                                    <div className="message-header">
                                        <span className="message-from">{message.from}</span>
                                        <span className="message-date">{formatDate(message.date)}</span>
                                    </div>
                                    <span className="message-subject">{message.subject}</span>
                                    <span className="message-preview">{message.preview}</span>
                                </div>
                                <div className="message-indicators">
                                    {message.starred && <Star size={14} className="starred" />}
                                    {message.hasAttachment && <Paperclip size={14} />}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Message Detail */}
                {selectedMessage && (
                    <GlassCard className="messaging__detail">
                        <div className="detail-header">
                            <h3>{selectedMessage.subject}</h3>
                            <div className="detail-actions">
                                <Button variant="ghost" size="sm" icon={<Star size={14} />} />
                                <Button variant="ghost" size="sm" icon={<Archive size={14} />} />
                                <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} />
                            </div>
                        </div>
                        <div className="detail-meta">
                            <div className={`detail-avatar ${getAvatarColor(selectedMessage.fromRole)}`}>
                                <User size={20} />
                            </div>
                            <div className="detail-from">
                                <span className="from-name">{selectedMessage.from}</span>
                                <span className="from-date">{new Date(selectedMessage.date).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="detail-body">
                            <p>{selectedMessage.preview}</p>
                            <p>This is additional message content that would appear in the full message view. The secure messaging system ensures all communications are encrypted and HIPAA-compliant.</p>
                        </div>
                        <div className="detail-reply">
                            <textarea placeholder="Write a reply..." />
                            <Button variant="primary" icon={<Send size={14} />}>Send Reply</Button>
                        </div>
                    </GlassCard>
                )}
            </div>
        </div>
    )
}

export default SecureMessaging
