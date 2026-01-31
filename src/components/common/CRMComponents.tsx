import { ReactNode, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Building, Mail, Phone, MapPin, Globe, Calendar, Tag, Edit2, Trash2, Plus, Search, Filter, MoreVertical, Star, Users, Briefcase, ChevronRight } from 'lucide-react'
import './CRMComponents.css'

// Contact Card
interface Contact {
    id: string
    name: string
    email?: string
    phone?: string
    company?: string
    role?: string
    avatar?: string
    tags?: string[]
    starred?: boolean
    lastContact?: Date
}

interface ContactCardProps {
    contact: Contact
    onEdit?: (contact: Contact) => void
    onDelete?: (id: string) => void
    onStar?: (id: string) => void
    compact?: boolean
    className?: string
}

export function ContactCard({
    contact,
    onEdit,
    onDelete,
    onStar,
    compact = false,
    className = ''
}: ContactCardProps) {
    const [showMenu, setShowMenu] = useState(false)

    return (
        <div className={`contact-card ${compact ? 'contact-card--compact' : ''} ${className}`}>
            <div className="contact-card__avatar">
                {contact.avatar ? (
                    <img src={contact.avatar} alt={contact.name} />
                ) : (
                    <User size={compact ? 20 : 24} />
                )}
            </div>

            <div className="contact-card__info">
                <div className="contact-card__header">
                    <h4 className="contact-card__name">{contact.name}</h4>
                    {contact.starred && <Star className="contact-card__star" size={14} />}
                </div>

                {contact.role && (
                    <span className="contact-card__role">{contact.role}</span>
                )}

                {!compact && (
                    <>
                        {contact.company && (
                            <div className="contact-card__detail">
                                <Building size={12} />
                                <span>{contact.company}</span>
                            </div>
                        )}
                        {contact.email && (
                            <div className="contact-card__detail">
                                <Mail size={12} />
                                <span>{contact.email}</span>
                            </div>
                        )}
                        {contact.phone && (
                            <div className="contact-card__detail">
                                <Phone size={12} />
                                <span>{contact.phone}</span>
                            </div>
                        )}

                        {contact.tags && contact.tags.length > 0 && (
                            <div className="contact-card__tags">
                                {contact.tags.map(tag => (
                                    <span key={tag} className="contact-card__tag">{tag}</span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="contact-card__actions">
                <button className="contact-card__menu-btn" onClick={() => setShowMenu(!showMenu)}>
                    <MoreVertical size={16} />
                </button>

                <AnimatePresence>
                    {showMenu && (
                        <motion.div
                            className="contact-card__menu"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <button onClick={() => { onStar?.(contact.id); setShowMenu(false) }}>
                                <Star size={14} /> {contact.starred ? 'Unstar' : 'Star'}
                            </button>
                            <button onClick={() => { onEdit?.(contact); setShowMenu(false) }}>
                                <Edit2 size={14} /> Edit
                            </button>
                            <button className="danger" onClick={() => { onDelete?.(contact.id); setShowMenu(false) }}>
                                <Trash2 size={14} /> Delete
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// Contact List
interface ContactListProps {
    contacts: Contact[]
    onSelect?: (contact: Contact) => void
    onEdit?: (contact: Contact) => void
    onDelete?: (id: string) => void
    searchable?: boolean
    filterable?: boolean
    className?: string
}

export function ContactList({
    contacts,
    onSelect,
    onEdit,
    onDelete,
    searchable = true,
    filterable = true,
    className = ''
}: ContactListProps) {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'starred'>('all')

    const filtered = useMemo(() => {
        let result = contacts

        if (search) {
            const q = search.toLowerCase()
            result = result.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.email?.toLowerCase().includes(q) ||
                c.company?.toLowerCase().includes(q)
            )
        }

        if (filter === 'starred') {
            result = result.filter(c => c.starred)
        }

        return result
    }, [contacts, search, filter])

    return (
        <div className={`contact-list ${className}`}>
            <div className="contact-list__header">
                {searchable && (
                    <div className="contact-list__search">
                        <Search size={16} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search contacts..."
                        />
                    </div>
                )}

                {filterable && (
                    <div className="contact-list__filters">
                        <button
                            className={filter === 'all' ? 'active' : ''}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={filter === 'starred' ? 'active' : ''}
                            onClick={() => setFilter('starred')}
                        >
                            <Star size={12} /> Starred
                        </button>
                    </div>
                )}
            </div>

            <div className="contact-list__items">
                {filtered.map(contact => (
                    <div
                        key={contact.id}
                        className="contact-list__item"
                        onClick={() => onSelect?.(contact)}
                    >
                        <ContactCard
                            contact={contact}
                            compact
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                        <ChevronRight size={16} className="contact-list__arrow" />
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="contact-list__empty">
                        No contacts found
                    </div>
                )}
            </div>
        </div>
    )
}

// Deal Pipeline
interface Deal {
    id: string
    title: string
    value: number
    company?: string
    contact?: string
    stage: string
    probability?: number
    expectedClose?: Date
    owner?: string
}

interface PipelineStage {
    id: string
    name: string
    color?: string
}

interface DealPipelineProps {
    deals: Deal[]
    stages: PipelineStage[]
    onDealClick?: (deal: Deal) => void
    onDealMove?: (dealId: string, newStage: string) => void
    currency?: string
    className?: string
}

export function DealPipeline({
    deals,
    stages,
    onDealClick,
    onDealMove,
    currency = '$',
    className = ''
}: DealPipelineProps) {
    const dealsByStage = useMemo(() => {
        const grouped: Record<string, Deal[]> = {}
        stages.forEach(s => grouped[s.id] = [])
        deals.forEach(d => {
            if (grouped[d.stage]) {
                grouped[d.stage].push(d)
            }
        })
        return grouped
    }, [deals, stages])

    const stageValues = useMemo(() => {
        const values: Record<string, number> = {}
        stages.forEach(s => {
            values[s.id] = dealsByStage[s.id]?.reduce((sum, d) => sum + d.value, 0) || 0
        })
        return values
    }, [stages, dealsByStage])

    const formatValue = (value: number) => {
        if (value >= 1000000) return `${currency}${(value / 1000000).toFixed(1)}M`
        if (value >= 1000) return `${currency}${(value / 1000).toFixed(0)}K`
        return `${currency}${value}`
    }

    return (
        <div className={`deal-pipeline ${className}`}>
            {stages.map(stage => (
                <div
                    key={stage.id}
                    className="deal-pipeline__stage"
                    style={{ '--stage-color': stage.color || 'var(--apex-teal)' } as React.CSSProperties}
                >
                    <div className="deal-pipeline__stage-header">
                        <h4>{stage.name}</h4>
                        <span className="deal-pipeline__stage-count">{dealsByStage[stage.id].length}</span>
                        <span className="deal-pipeline__stage-value">{formatValue(stageValues[stage.id])}</span>
                    </div>

                    <div className="deal-pipeline__deals">
                        {dealsByStage[stage.id].map(deal => (
                            <motion.div
                                key={deal.id}
                                className="deal-pipeline__deal"
                                onClick={() => onDealClick?.(deal)}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="deal-pipeline__deal-header">
                                    <h5>{deal.title}</h5>
                                    <span className="deal-pipeline__deal-value">{formatValue(deal.value)}</span>
                                </div>
                                {deal.company && (
                                    <div className="deal-pipeline__deal-company">
                                        <Building size={12} />
                                        {deal.company}
                                    </div>
                                )}
                                {deal.probability !== undefined && (
                                    <div className="deal-pipeline__deal-probability">
                                        <div className="deal-pipeline__deal-probability-bar">
                                            <div style={{ width: `${deal.probability}%` }} />
                                        </div>
                                        <span>{deal.probability}%</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

// Activity Timeline
interface Activity {
    id: string
    type: 'call' | 'email' | 'meeting' | 'note' | 'task'
    title: string
    description?: string
    date: Date
    user?: string
    contact?: string
}

interface ActivityTimelineProps {
    activities: Activity[]
    onActivityClick?: (activity: Activity) => void
    className?: string
}

export function ActivityTimeline({ activities, onActivityClick, className = '' }: ActivityTimelineProps) {
    const icons = {
        call: Phone,
        email: Mail,
        meeting: Calendar,
        note: Edit2,
        task: Briefcase
    }

    const sortedActivities = useMemo(() =>
        [...activities].sort((a, b) => b.date.getTime() - a.date.getTime()),
        [activities]
    )

    const formatDate = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) return 'Today'
        if (days === 1) return 'Yesterday'
        if (days < 7) return `${days} days ago`
        return date.toLocaleDateString()
    }

    return (
        <div className={`activity-timeline ${className}`}>
            {sortedActivities.map((activity, i) => {
                const Icon = icons[activity.type]
                return (
                    <motion.div
                        key={activity.id}
                        className="activity-timeline__item"
                        onClick={() => onActivityClick?.(activity)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <div className={`activity-timeline__icon activity-timeline__icon--${activity.type}`}>
                            <Icon size={14} />
                        </div>
                        <div className="activity-timeline__content">
                            <div className="activity-timeline__header">
                                <h5>{activity.title}</h5>
                                <span className="activity-timeline__date">{formatDate(activity.date)}</span>
                            </div>
                            {activity.description && (
                                <p className="activity-timeline__desc">{activity.description}</p>
                            )}
                            {activity.user && (
                                <span className="activity-timeline__user">by {activity.user}</span>
                            )}
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}

// Lead Score
interface LeadScoreProps {
    score: number
    maxScore?: number
    showLabel?: boolean
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function LeadScore({ score, maxScore = 100, showLabel = true, size = 'md', className = '' }: LeadScoreProps) {
    const percentage = (score / maxScore) * 100
    const quality = percentage >= 70 ? 'hot' : percentage >= 40 ? 'warm' : 'cold'

    return (
        <div className={`lead-score lead-score--${size} lead-score--${quality} ${className}`}>
            <div className="lead-score__ring">
                <svg viewBox="0 0 36 36">
                    <path
                        className="lead-score__bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                        className="lead-score__fill"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        strokeDasharray={`${percentage}, 100`}
                    />
                </svg>
                <span className="lead-score__value">{score}</span>
            </div>
            {showLabel && (
                <span className="lead-score__label">{quality.toUpperCase()}</span>
            )}
        </div>
    )
}

export default { ContactCard, ContactList, DealPipeline, ActivityTimeline, LeadScore }
