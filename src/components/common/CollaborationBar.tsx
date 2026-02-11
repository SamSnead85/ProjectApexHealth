import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, MessageCircle, Eye, Bell, Circle, Send, AtSign } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface CollaborationBarProps {
  pageName?: string
}

interface User {
  id: string
  name: string
  role: string
  initials: string
  color: string
}

interface Comment {
  id: string
  author: User
  text: string
  timestamp: string
}

interface Activity {
  id: string
  user: User
  action: string
  timestamp: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockUsers: User[] = [
  { id: '1', name: 'Sarah Chen', role: 'Claims', initials: 'SC', color: '#0D9488' },
  { id: '2', name: 'Mike Johnson', role: 'Analytics', initials: 'MJ', color: '#8B5CF6' },
  { id: '3', name: 'Lisa Park', role: 'Compliance', initials: 'LP', color: '#F59E0B' },
]

const mockComments: Comment[] = [
  {
    id: '1',
    author: mockUsers[0],
    text: 'This claim needs review for duplicate billing',
    timestamp: '2m ago',
  },
  {
    id: '2',
    author: mockUsers[1],
    text: '@Sarah Chen Can you check the analytics on this?',
    timestamp: '15m ago',
  },
]

const mockActivities: Activity[] = [
  {
    id: '1',
    user: mockUsers[0],
    action: 'reviewed claim #4821',
    timestamp: '2m ago',
  },
  {
    id: '2',
    user: mockUsers[1],
    action: 'exported analytics report',
    timestamp: '15m ago',
  },
  {
    id: '3',
    user: mockUsers[2],
    action: 'approved compliance update',
    timestamp: '1h ago',
  },
]

// ============================================================================
// STYLES
// ============================================================================

const s = {
  bar: {
    position: 'fixed' as const,
    bottom: '24px',
    right: '24px',
    zIndex: 90,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: 'rgba(10, 15, 26, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    maxWidth: '400px',
  } as React.CSSProperties,

  presenceGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '-4px',
    position: 'relative' as const,
  } as React.CSSProperties,

  avatar: (color: string, index: number) => ({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--apex-white, #ffffff)',
    fontSize: '11px',
    fontWeight: 600,
    border: '2px solid rgba(10, 15, 26, 0.9)',
    marginLeft: index > 0 ? '-8px' : '0',
    cursor: 'pointer',
    position: 'relative' as const,
    zIndex: mockUsers.length - index,
  } as React.CSSProperties),

  tooltip: {
    position: 'absolute' as const,
    bottom: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(10, 15, 26, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '12px',
    color: 'var(--apex-white, #ffffff)',
    whiteSpace: 'nowrap' as const,
    pointerEvents: 'none' as const,
    zIndex: 1000,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  } as React.CSSProperties,

  tooltipRole: {
    fontSize: '10px',
    color: 'var(--apex-steel, #8892a4)',
    marginTop: '2px',
  } as React.CSSProperties,

  button: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.04)',
    color: 'var(--apex-steel, #8892a4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
  } as React.CSSProperties,

  badge: {
    position: 'absolute' as const,
    top: '-4px',
    right: '-4px',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    background: '#EF4444',
    color: 'var(--apex-white, #ffffff)',
    fontSize: '10px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 5px',
    border: '2px solid rgba(10, 15, 26, 0.9)',
  } as React.CSSProperties,

  dropdown: {
    position: 'absolute' as const,
    bottom: 'calc(100% + 12px)',
    right: 0,
    width: '320px',
    maxHeight: '400px',
    background: 'rgba(10, 15, 26, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,

  dropdownHeader: {
    padding: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  } as React.CSSProperties,

  dropdownTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--apex-white, #ffffff)',
    margin: 0,
  } as React.CSSProperties,

  commentInput: {
    width: '100%',
    minHeight: '60px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    color: 'var(--apex-white, #ffffff)',
    fontSize: '13px',
    fontFamily: 'inherit',
    resize: 'none' as const,
    outline: 'none',
    marginTop: '12px',
  } as React.CSSProperties,

  commentInputMention: {
    color: '#0D9488',
    fontWeight: 600,
  } as React.CSSProperties,

  commentSend: {
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
  } as React.CSSProperties,

  sendButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(13, 148, 136, 0.3)',
    background: 'rgba(13, 148, 136, 0.15)',
    color: '#0D9488',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  commentsList: {
    padding: '12px',
    overflowY: 'auto' as const,
    maxHeight: '240px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  } as React.CSSProperties,

  commentItem: {
    display: 'flex',
    gap: '10px',
  } as React.CSSProperties,

  commentAvatar: (color: string) => ({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--apex-white, #ffffff)',
    fontSize: '10px',
    fontWeight: 600,
    flexShrink: 0,
  } as React.CSSProperties),

  commentContent: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,

  commentText: {
    fontSize: '13px',
    color: 'var(--apex-white, #ffffff)',
    margin: '0 0 4px 0',
    lineHeight: 1.5,
  } as React.CSSProperties,

  commentMeta: {
    fontSize: '11px',
    color: 'var(--apex-steel, #8892a4)',
    margin: 0,
  } as React.CSSProperties,

  activitiesList: {
    padding: '12px',
    overflowY: 'auto' as const,
    maxHeight: '300px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  } as React.CSSProperties,

  activityItem: {
    display: 'flex',
    gap: '10px',
    padding: '10px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.02)',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  activityText: {
    fontSize: '13px',
    color: 'var(--apex-white, #ffffff)',
    margin: 0,
    lineHeight: 1.5,
  } as React.CSSProperties,

  activityMeta: {
    fontSize: '11px',
    color: 'var(--apex-steel, #8892a4)',
    margin: '4px 0 0 0',
  } as React.CSSProperties,

  toggleActive: {
    background: 'rgba(13, 148, 136, 0.2)',
    borderColor: 'rgba(13, 148, 136, 0.4)',
    color: '#0D9488',
  } as React.CSSProperties,
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CollaborationBar({ pageName }: CollaborationBarProps) {
  const [hoveredUser, setHoveredUser] = useState<string | null>(null)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [activitiesOpen, setActivitiesOpen] = useState(false)
  const [sharedView, setSharedView] = useState(false)
  const [commentText, setCommentText] = useState('')
  const commentsRef = useRef<HTMLDivElement>(null)
  const activitiesRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commentsRef.current && !commentsRef.current.contains(event.target as Node)) {
        setCommentsOpen(false)
      }
      if (activitiesRef.current && !activitiesRef.current.contains(event.target as Node)) {
        setActivitiesOpen(false)
      }
    }

    if (commentsOpen || activitiesOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [commentsOpen, activitiesOpen])

  const handleSendComment = () => {
    if (commentText.trim()) {
      // In a real app, this would send the comment
      setCommentText('')
      setCommentsOpen(false)
    }
  }

  const handleMention = () => {
    const text = commentText || ''
    setCommentText(text + '@')
  }

  return (
    <motion.div
      style={s.bar}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {/* Presence Indicators */}
      <div style={s.presenceGroup}>
        {mockUsers.map((user, index) => (
          <motion.div
            key={user.id}
            style={s.avatar(user.color, index)}
            onMouseEnter={() => setHoveredUser(user.id)}
            onMouseLeave={() => setHoveredUser(null)}
            whileHover={{ scale: 1.1, zIndex: 100 }}
          >
            {user.initials}
            <AnimatePresence>
              {hoveredUser === user.id && (
                <motion.div
                  style={s.tooltip}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  {user.name}
                  <div style={s.tooltipRole}>{user.role}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Comment Button */}
      <div ref={commentsRef} style={{ position: 'relative' }}>
        <motion.button
          style={{
            ...s.button,
            ...(commentsOpen ? s.toggleActive : {}),
          }}
          onClick={() => {
            setCommentsOpen(!commentsOpen)
            setActivitiesOpen(false)
          }}
          whileHover={{ background: 'rgba(255, 255, 255, 0.08)' }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle size={16} />
        </motion.button>

        <AnimatePresence>
          {commentsOpen && (
            <motion.div
              style={s.dropdown}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div style={s.dropdownHeader}>
                <h4 style={s.dropdownTitle}>Comments</h4>
                <textarea
                  style={s.commentInput}
                  placeholder="Add a comment... Type @ to mention"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSendComment()
                    }
                  }}
                />
                <div style={s.commentSend}>
                  <button
                    style={s.sendButton}
                    onClick={handleMention}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(13, 148, 136, 0.25)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(13, 148, 136, 0.15)'
                    }}
                  >
                    <AtSign size={14} />
                    Mention
                  </button>
                  <button
                    style={s.sendButton}
                    onClick={handleSendComment}
                    disabled={!commentText.trim()}
                    onMouseEnter={(e) => {
                      if (commentText.trim()) {
                        e.currentTarget.style.background = 'rgba(13, 148, 136, 0.25)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(13, 148, 136, 0.15)'
                    }}
                  >
                    <Send size={14} />
                    Send
                  </button>
                </div>
              </div>

              {mockComments.length > 0 && (
                <div style={s.commentsList}>
                  {mockComments.map((comment) => (
                    <div key={comment.id} style={s.commentItem}>
                      <div style={s.commentAvatar(comment.author.color)}>
                        {comment.author.initials}
                      </div>
                      <div style={s.commentContent}>
                        <p style={s.commentText}>{comment.text}</p>
                        <p style={s.commentMeta}>
                          {comment.author.name} · {comment.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Activity Feed Toggle */}
      <div ref={activitiesRef} style={{ position: 'relative' }}>
        <motion.button
          style={s.button}
          onClick={() => {
            setActivitiesOpen(!activitiesOpen)
            setCommentsOpen(false)
          }}
          whileHover={{ background: 'rgba(255, 255, 255, 0.08)' }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell size={16} />
          <span style={s.badge}>3</span>
        </motion.button>

        <AnimatePresence>
          {activitiesOpen && (
            <motion.div
              style={s.dropdown}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div style={s.dropdownHeader}>
                <h4 style={s.dropdownTitle}>Recent Activity</h4>
              </div>
              <div style={s.activitiesList}>
                {mockActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    style={s.activityItem}
                    whileHover={{ background: 'rgba(255, 255, 255, 0.04)' }}
                  >
                    <div style={s.commentAvatar(activity.user.color)}>
                      {activity.user.initials}
                    </div>
                    <div style={s.commentContent}>
                      <p style={s.activityText}>
                        <strong>{activity.user.name}</strong> {activity.action}
                      </p>
                      <p style={s.activityMeta}>{activity.timestamp}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shared View Toggle */}
      <motion.button
        style={{
          ...s.button,
          ...(sharedView ? s.toggleActive : {}),
        }}
        onClick={() => setSharedView(!sharedView)}
        whileHover={{ background: 'rgba(255, 255, 255, 0.08)' }}
        whileTap={{ scale: 0.95 }}
        title={sharedView ? 'Stop sharing view' : 'Share your view'}
      >
        <Eye size={16} />
      </motion.button>
    </motion.div>
  )
}

export default CollaborationBar
