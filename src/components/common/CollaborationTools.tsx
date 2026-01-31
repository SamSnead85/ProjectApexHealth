import { ReactNode, useState, useEffect, useMemo, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, UserPlus, UserMinus, Crown, Shield, MessageCircle, AtSign, Circle, Lock, Unlock, Eye, EyeOff, Copy, Link, QrCode, Settings } from 'lucide-react'
import './CollaborationTools.css'

// Online Users Indicator
interface User {
    id: string
    name: string
    avatar?: string
    status?: 'online' | 'away' | 'busy' | 'offline'
    role?: string
}

interface OnlineUsersProps {
    users: User[]
    maxVisible?: number
    showStatus?: boolean
    onUserClick?: (user: User) => void
    className?: string
}

export function OnlineUsers({
    users,
    maxVisible = 5,
    showStatus = true,
    onUserClick,
    className = ''
}: OnlineUsersProps) {
    const visibleUsers = users.slice(0, maxVisible)
    const remainingCount = users.length - maxVisible

    return (
        <div className={`online-users ${className}`}>
            <div className="online-users__list">
                {visibleUsers.map((user, i) => (
                    <motion.div
                        key={user.id}
                        className="online-users__item"
                        style={{ zIndex: users.length - i }}
                        onClick={() => onUserClick?.(user)}
                        whileHover={{ scale: 1.1, zIndex: 100 }}
                    >
                        <div className="online-users__avatar">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} />
                            ) : (
                                <span>{user.name.charAt(0)}</span>
                            )}
                        </div>
                        {showStatus && (
                            <span className={`online-users__status online-users__status--${user.status || 'offline'}`} />
                        )}
                    </motion.div>
                ))}
                {remainingCount > 0 && (
                    <div className="online-users__more">
                        +{remainingCount}
                    </div>
                )}
            </div>
        </div>
    )
}

// Presence Indicator
interface PresenceIndicatorProps {
    status: 'online' | 'away' | 'busy' | 'offline'
    showLabel?: boolean
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function PresenceIndicator({ status, showLabel = false, size = 'md', className = '' }: PresenceIndicatorProps) {
    const labels = {
        online: 'Online',
        away: 'Away',
        busy: 'Do not disturb',
        offline: 'Offline'
    }

    return (
        <div className={`presence-indicator presence-indicator--${status} presence-indicator--${size} ${className}`}>
            <span className="presence-indicator__dot" />
            {showLabel && <span className="presence-indicator__label">{labels[status]}</span>}
        </div>
    )
}

// Share Link Generator
interface ShareLinkProps {
    url: string
    title?: string
    permissions?: 'view' | 'edit' | 'admin'
    onPermissionChange?: (permission: string) => void
    expiresIn?: string
    className?: string
}

export function ShareLink({
    url,
    title = 'Share Link',
    permissions = 'view',
    onPermissionChange,
    expiresIn,
    className = ''
}: ShareLinkProps) {
    const [copied, setCopied] = useState(false)

    const copyLink = async () => {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={`share-link ${className}`}>
            <div className="share-link__header">
                <Link size={16} />
                <span>{title}</span>
            </div>

            <div className="share-link__input">
                <input type="text" value={url} readOnly />
                <button onClick={copyLink} className={copied ? 'copied' : ''}>
                    {copied ? 'Copied!' : <Copy size={14} />}
                </button>
            </div>

            <div className="share-link__options">
                <div className="share-link__permissions">
                    <span>Anyone with link can:</span>
                    <select
                        value={permissions}
                        onChange={(e) => onPermissionChange?.(e.target.value)}
                    >
                        <option value="view">View</option>
                        <option value="edit">Edit</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                {expiresIn && (
                    <span className="share-link__expires">
                        Expires {expiresIn}
                    </span>
                )}
            </div>
        </div>
    )
}

// Team Members Panel
interface TeamMember {
    id: string
    name: string
    email: string
    avatar?: string
    role: 'owner' | 'admin' | 'member' | 'viewer'
    status?: 'online' | 'away' | 'busy' | 'offline'
}

interface TeamMembersPanelProps {
    members: TeamMember[]
    onRoleChange?: (memberId: string, newRole: string) => void
    onRemove?: (memberId: string) => void
    onInvite?: () => void
    currentUserId?: string
    className?: string
}

export function TeamMembersPanel({
    members,
    onRoleChange,
    onRemove,
    onInvite,
    currentUserId,
    className = ''
}: TeamMembersPanelProps) {
    const roleIcons = {
        owner: Crown,
        admin: Shield,
        member: Users,
        viewer: Eye
    }

    const roleColors = {
        owner: '#f59e0b',
        admin: '#8b5cf6',
        member: 'var(--apex-teal)',
        viewer: 'var(--apex-steel)'
    }

    return (
        <div className={`team-members ${className}`}>
            <div className="team-members__header">
                <h4>Team Members</h4>
                <span className="team-members__count">{members.length}</span>
                {onInvite && (
                    <button className="team-members__invite" onClick={onInvite}>
                        <UserPlus size={14} /> Invite
                    </button>
                )}
            </div>

            <div className="team-members__list">
                {members.map(member => {
                    const RoleIcon = roleIcons[member.role]
                    const isCurrentUser = member.id === currentUserId

                    return (
                        <div key={member.id} className="team-members__item">
                            <div className="team-members__avatar">
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} />
                                ) : (
                                    <span>{member.name.charAt(0)}</span>
                                )}
                                {member.status && (
                                    <PresenceIndicator status={member.status} size="sm" />
                                )}
                            </div>

                            <div className="team-members__info">
                                <span className="team-members__name">
                                    {member.name} {isCurrentUser && <span className="team-members__you">(you)</span>}
                                </span>
                                <span className="team-members__email">{member.email}</span>
                            </div>

                            <div className="team-members__role" style={{ color: roleColors[member.role] }}>
                                <RoleIcon size={14} />
                                {member.role === 'owner' ? (
                                    <span>Owner</span>
                                ) : (
                                    <select
                                        value={member.role}
                                        onChange={(e) => onRoleChange?.(member.id, e.target.value)}
                                        disabled={isCurrentUser || member.role === 'owner'}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="member">Member</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                )}
                            </div>

                            {!isCurrentUser && member.role !== 'owner' && (
                                <button
                                    className="team-members__remove"
                                    onClick={() => onRemove?.(member.id)}
                                >
                                    <UserMinus size={14} />
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Mentions Input
interface MentionsInputProps {
    value: string
    onChange: (value: string) => void
    users: User[]
    placeholder?: string
    onMention?: (user: User) => void
    className?: string
}

export function MentionsInput({
    value,
    onChange,
    users,
    placeholder = 'Type @ to mention...',
    onMention,
    className = ''
}: MentionsInputProps) {
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [query, setQuery] = useState('')
    const [cursorPosition, setCursorPosition] = useState(0)

    const suggestions = useMemo(() => {
        if (!query) return []
        return users.filter(u =>
            u.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5)
    }, [users, query])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        const pos = e.target.selectionStart

        onChange(newValue)
        setCursorPosition(pos)

        // Check for @ mention
        const textBeforeCursor = newValue.slice(0, pos)
        const atIndex = textBeforeCursor.lastIndexOf('@')

        if (atIndex !== -1) {
            const queryText = textBeforeCursor.slice(atIndex + 1)
            if (!queryText.includes(' ')) {
                setQuery(queryText)
                setShowSuggestions(true)
                return
            }
        }

        setShowSuggestions(false)
        setQuery('')
    }

    const insertMention = (user: User) => {
        const textBeforeCursor = value.slice(0, cursorPosition)
        const atIndex = textBeforeCursor.lastIndexOf('@')
        const textAfterCursor = value.slice(cursorPosition)

        const newValue = textBeforeCursor.slice(0, atIndex) + `@${user.name} ` + textAfterCursor
        onChange(newValue)
        setShowSuggestions(false)
        onMention?.(user)
    }

    return (
        <div className={`mentions-input ${className}`}>
            <textarea
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
            />

            <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                        className="mentions-input__suggestions"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {suggestions.map(user => (
                            <button
                                key={user.id}
                                onClick={() => insertMention(user)}
                            >
                                <div className="mentions-input__suggestion-avatar">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} />
                                    ) : (
                                        <span>{user.name.charAt(0)}</span>
                                    )}
                                </div>
                                <span>{user.name}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Cursors (collaborative editing)
interface Cursor {
    id: string
    userId: string
    userName: string
    userColor: string
    x: number
    y: number
}

interface CollaborativeCursorsProps {
    cursors: Cursor[]
    className?: string
}

export function CollaborativeCursors({ cursors, className = '' }: CollaborativeCursorsProps) {
    return (
        <div className={`collaborative-cursors ${className}`}>
            {cursors.map(cursor => (
                <motion.div
                    key={cursor.id}
                    className="collaborative-cursors__cursor"
                    style={{ left: cursor.x, top: cursor.y }}
                    animate={{ x: 0, y: 0 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 500 }}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill={cursor.userColor}
                    >
                        <path d="M5.65 3.11L20.85 12.5L12.09 14.04L8.51 21.88L5.65 3.11Z" />
                    </svg>
                    <span
                        className="collaborative-cursors__label"
                        style={{ backgroundColor: cursor.userColor }}
                    >
                        {cursor.userName}
                    </span>
                </motion.div>
            ))}
        </div>
    )
}

export default { OnlineUsers, PresenceIndicator, ShareLink, TeamMembersPanel, MentionsInput, CollaborativeCursors }
