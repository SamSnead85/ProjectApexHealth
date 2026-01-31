import { ReactNode, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Smile, Paperclip, Image, MoreVertical, Reply, ThumbsUp, Edit2, Trash2, Pin, User, Clock, Check, CheckCheck, X } from 'lucide-react'
import './MessagingComponents.css'

// Message Bubble
interface Message {
    id: string
    content: string
    sender: { id: string; name: string; avatar?: string }
    timestamp: Date
    status?: 'sent' | 'delivered' | 'read'
    replyTo?: Message
    reactions?: { emoji: string; count: number }[]
    edited?: boolean
    pinned?: boolean
}

interface MessageBubbleProps {
    message: Message
    isOwn?: boolean
    onReply?: (message: Message) => void
    onReact?: (messageId: string, emoji: string) => void
    onEdit?: (message: Message) => void
    onDelete?: (messageId: string) => void
    onPin?: (messageId: string) => void
    className?: string
}

export function MessageBubble({
    message,
    isOwn = false,
    onReply,
    onReact,
    onEdit,
    onDelete,
    onPin,
    className = ''
}: MessageBubbleProps) {
    const [showMenu, setShowMenu] = useState(false)

    const StatusIcon = message.status === 'read' ? CheckCheck :
        message.status === 'delivered' ? CheckCheck : Check

    return (
        <div className={`message-bubble ${isOwn ? 'message-bubble--own' : ''} ${message.pinned ? 'message-bubble--pinned' : ''} ${className}`}>
            {!isOwn && (
                <div className="message-bubble__avatar">
                    {message.sender.avatar ? <img src={message.sender.avatar} alt="" /> : <User size={16} />}
                </div>
            )}

            <div className="message-bubble__content">
                {!isOwn && <span className="message-bubble__sender">{message.sender.name}</span>}

                {message.replyTo && (
                    <div className="message-bubble__reply-to">
                        <Reply size={12} />
                        <span>{message.replyTo.sender.name}</span>
                        <p>{message.replyTo.content.slice(0, 50)}...</p>
                    </div>
                )}

                <p className="message-bubble__text">{message.content}</p>

                <div className="message-bubble__meta">
                    <span className="message-bubble__time">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.edited && <span className="message-bubble__edited">(edited)</span>}
                    {isOwn && message.status && (
                        <StatusIcon size={14} className={`message-bubble__status message-bubble__status--${message.status}`} />
                    )}
                </div>

                {message.reactions && message.reactions.length > 0 && (
                    <div className="message-bubble__reactions">
                        {message.reactions.map((r, i) => (
                            <button key={i} onClick={() => onReact?.(message.id, r.emoji)}>
                                {r.emoji} {r.count}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="message-bubble__actions">
                <button onClick={() => setShowMenu(!showMenu)}><MoreVertical size={14} /></button>
                <AnimatePresence>
                    {showMenu && (
                        <motion.div className="message-bubble__menu" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                            <button onClick={() => { onReply?.(message); setShowMenu(false) }}><Reply size={14} /> Reply</button>
                            <button onClick={() => { onReact?.(message.id, '👍'); setShowMenu(false) }}><ThumbsUp size={14} /> React</button>
                            <button onClick={() => { onPin?.(message.id); setShowMenu(false) }}><Pin size={14} /> {message.pinned ? 'Unpin' : 'Pin'}</button>
                            {isOwn && <>
                                <button onClick={() => { onEdit?.(message); setShowMenu(false) }}><Edit2 size={14} /> Edit</button>
                                <button className="danger" onClick={() => { onDelete?.(message.id); setShowMenu(false) }}><Trash2 size={14} /> Delete</button>
                            </>}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// Message Input
interface MessageInputProps {
    onSend?: (content: string, attachments?: File[]) => void
    onTyping?: () => void
    replyingTo?: Message
    onCancelReply?: () => void
    placeholder?: string
    className?: string
}

export function MessageInput({ onSend, onTyping, replyingTo, onCancelReply, placeholder = 'Type a message...', className = '' }: MessageInputProps) {
    const [content, setContent] = useState('')
    const [attachments, setAttachments] = useState<File[]>([])

    const handleSend = () => {
        if (!content.trim() && attachments.length === 0) return
        onSend?.(content, attachments)
        setContent('')
        setAttachments([])
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    }

    return (
        <div className={`message-input ${className}`}>
            {replyingTo && (
                <div className="message-input__reply">
                    <Reply size={14} /><span>Replying to {replyingTo.sender.name}</span>
                    <button onClick={onCancelReply}><X size={14} /></button>
                </div>
            )}
            <div className="message-input__container">
                <button className="message-input__btn"><Paperclip size={18} /></button>
                <button className="message-input__btn"><Image size={18} /></button>
                <textarea value={content} onChange={(e) => { setContent(e.target.value); onTyping?.() }}
                    onKeyDown={handleKeyDown} placeholder={placeholder} rows={1} />
                <button className="message-input__btn"><Smile size={18} /></button>
                <button className="message-input__send" onClick={handleSend} disabled={!content.trim() && attachments.length === 0}>
                    <Send size={18} />
                </button>
            </div>
        </div>
    )
}

// Conversation List
interface Conversation { id: string; name: string; avatar?: string; lastMessage?: string; timestamp?: Date; unread?: number; online?: boolean }

interface ConversationListProps {
    conversations: Conversation[]
    selectedId?: string
    onSelect?: (id: string) => void
    className?: string
}

export function ConversationList({ conversations, selectedId, onSelect, className = '' }: ConversationListProps) {
    return (
        <div className={`conversation-list ${className}`}>
            {conversations.map(conv => (
                <div key={conv.id} className={`conversation-list__item ${selectedId === conv.id ? 'selected' : ''}`} onClick={() => onSelect?.(conv.id)}>
                    <div className="conversation-list__avatar">
                        {conv.avatar ? <img src={conv.avatar} alt="" /> : <User size={20} />}
                        {conv.online && <span className="conversation-list__online" />}
                    </div>
                    <div className="conversation-list__info">
                        <span className="conversation-list__name">{conv.name}</span>
                        {conv.lastMessage && <p className="conversation-list__preview">{conv.lastMessage}</p>}
                    </div>
                    <div className="conversation-list__meta">
                        {conv.timestamp && <span className="conversation-list__time">{conv.timestamp.toLocaleDateString()}</span>}
                        {conv.unread && conv.unread > 0 && <span className="conversation-list__unread">{conv.unread}</span>}
                    </div>
                </div>
            ))}
        </div>
    )
}

// Typing Indicator
interface TypingIndicatorProps { users: string[]; className?: string }

export function TypingIndicator({ users, className = '' }: TypingIndicatorProps) {
    if (users.length === 0) return null
    const text = users.length === 1 ? `${users[0]} is typing` :
        users.length === 2 ? `${users[0]} and ${users[1]} are typing` :
            `${users[0]} and ${users.length - 1} others are typing`

    return (
        <div className={`typing-indicator ${className}`}>
            <div className="typing-indicator__dots"><span /><span /><span /></div>
            <span>{text}...</span>
        </div>
    )
}

export default { MessageBubble, MessageInput, ConversationList, TypingIndicator }
