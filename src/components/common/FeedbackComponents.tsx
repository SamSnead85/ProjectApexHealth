import { ReactNode, useState, useEffect, useRef, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThumbsUp, ThumbsDown, Heart, Star, MessageSquare, Flag, Share2, Bookmark, Send, MoreHorizontal } from 'lucide-react'
import './FeedbackComponents.css'

// Rating Component
interface RatingProps {
    value?: number
    max?: number
    onChange?: (value: number) => void
    size?: 'sm' | 'md' | 'lg'
    readonly?: boolean
    showValue?: boolean
    icon?: 'star' | 'heart'
    className?: string
}

export function Rating({
    value = 0,
    max = 5,
    onChange,
    size = 'md',
    readonly = false,
    showValue = false,
    icon = 'star',
    className = ''
}: RatingProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null)
    const displayValue = hoverValue ?? value

    const Icon = icon === 'star' ? Star : Heart

    return (
        <div className={`rating rating--${size} ${readonly ? 'rating--readonly' : ''} ${className}`}>
            <div className="rating__stars">
                {Array.from({ length: max }, (_, i) => (
                    <button
                        key={i}
                        type="button"
                        className={`rating__star ${i < displayValue ? 'rating__star--filled' : ''}`}
                        onClick={() => !readonly && onChange?.(i + 1)}
                        onMouseEnter={() => !readonly && setHoverValue(i + 1)}
                        onMouseLeave={() => setHoverValue(null)}
                        disabled={readonly}
                        aria-label={`Rate ${i + 1} out of ${max}`}
                    >
                        <Icon />
                    </button>
                ))}
            </div>
            {showValue && (
                <span className="rating__value">{value.toFixed(1)}</span>
            )}
        </div>
    )
}

// Like/Dislike Button
interface ReactionButtonProps {
    type: 'like' | 'dislike' | 'love' | 'bookmark'
    count?: number
    active?: boolean
    onChange?: (active: boolean) => void
    showCount?: boolean
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function ReactionButton({
    type,
    count = 0,
    active = false,
    onChange,
    showCount = true,
    size = 'md',
    className = ''
}: ReactionButtonProps) {
    const [isActive, setIsActive] = useState(active)
    const [displayCount, setDisplayCount] = useState(count)

    const icons = {
        like: ThumbsUp,
        dislike: ThumbsDown,
        love: Heart,
        bookmark: Bookmark
    }

    const Icon = icons[type]

    const handleClick = () => {
        const newActive = !isActive
        setIsActive(newActive)
        setDisplayCount(prev => newActive ? prev + 1 : prev - 1)
        onChange?.(newActive)
    }

    return (
        <motion.button
            className={`reaction-button reaction-button--${type} reaction-button--${size} ${isActive ? 'reaction-button--active' : ''} ${className}`}
            onClick={handleClick}
            whileTap={{ scale: 0.9 }}
        >
            <motion.span
                animate={isActive ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
            >
                <Icon />
            </motion.span>
            {showCount && <span className="reaction-button__count">{displayCount}</span>}
        </motion.button>
    )
}

// Comment Input
interface CommentInputProps {
    placeholder?: string
    onSubmit?: (text: string) => void
    maxLength?: number
    showCharCount?: boolean
    avatarUrl?: string
    className?: string
}

export function CommentInput({
    placeholder = 'Write a comment...',
    onSubmit,
    maxLength = 500,
    showCharCount = true,
    avatarUrl,
    className = ''
}: CommentInputProps) {
    const [text, setText] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSubmit = () => {
        if (text.trim()) {
            onSubmit?.(text.trim())
            setText('')
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            handleSubmit()
        }
    }

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [text])

    return (
        <div className={`comment-input ${className}`}>
            {avatarUrl && (
                <div className="comment-input__avatar">
                    <img src={avatarUrl} alt="Your avatar" />
                </div>
            )}
            <div className="comment-input__wrapper">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, maxLength))}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    rows={1}
                />
                <div className="comment-input__footer">
                    {showCharCount && (
                        <span className={`comment-input__count ${text.length >= maxLength * 0.9 ? 'comment-input__count--warning' : ''}`}>
                            {text.length}/{maxLength}
                        </span>
                    )}
                    <button
                        className="comment-input__submit"
                        onClick={handleSubmit}
                        disabled={!text.trim()}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}

// Feedback Banner
interface FeedbackBannerProps {
    question: string
    onPositive?: () => void
    onNegative?: () => void
    positiveLabel?: string
    negativeLabel?: string
    className?: string
}

export function FeedbackBanner({
    question,
    onPositive,
    onNegative,
    positiveLabel = 'Yes',
    negativeLabel = 'No',
    className = ''
}: FeedbackBannerProps) {
    const [submitted, setSubmitted] = useState(false)
    const [response, setResponse] = useState<'positive' | 'negative' | null>(null)

    const handleResponse = (type: 'positive' | 'negative') => {
        setResponse(type)
        setSubmitted(true)
        if (type === 'positive') onPositive?.()
        else onNegative?.()
    }

    return (
        <div className={`feedback-banner ${className}`}>
            <AnimatePresence mode="wait">
                {!submitted ? (
                    <motion.div
                        key="question"
                        className="feedback-banner__content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <span className="feedback-banner__question">{question}</span>
                        <div className="feedback-banner__actions">
                            <button onClick={() => handleResponse('positive')}>
                                <ThumbsUp size={16} /> {positiveLabel}
                            </button>
                            <button onClick={() => handleResponse('negative')}>
                                <ThumbsDown size={16} /> {negativeLabel}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="thanks"
                        className="feedback-banner__thanks"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Thanks for your feedback!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// NPS Score
interface NPSScoreProps {
    onSubmit?: (score: number) => void
    title?: string
    lowLabel?: string
    highLabel?: string
    className?: string
}

export function NPSScore({
    onSubmit,
    title = 'How likely are you to recommend us?',
    lowLabel = 'Not likely',
    highLabel = 'Very likely',
    className = ''
}: NPSScoreProps) {
    const [score, setScore] = useState<number | null>(null)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (value: number) => {
        setScore(value)
        setSubmitted(true)
        onSubmit?.(value)
    }

    return (
        <div className={`nps-score ${className}`}>
            <AnimatePresence mode="wait">
                {!submitted ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <h3 className="nps-score__title">{title}</h3>
                        <div className="nps-score__scale">
                            {Array.from({ length: 11 }, (_, i) => (
                                <button
                                    key={i}
                                    className={`nps-score__btn ${i <= 6 ? 'nps-score__btn--detractor' : i <= 8 ? 'nps-score__btn--passive' : 'nps-score__btn--promoter'}`}
                                    onClick={() => handleSubmit(i)}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                        <div className="nps-score__labels">
                            <span>{lowLabel}</span>
                            <span>{highLabel}</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="thanks"
                        className="nps-score__thanks"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Heart className="nps-score__heart" />
                        <span>Thank you for your feedback!</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Report Button
interface ReportButtonProps {
    onReport?: (reason: string) => void
    reasons?: string[]
    className?: string
}

export function ReportButton({
    onReport,
    reasons = ['Spam', 'Inappropriate content', 'Harassment', 'Misinformation', 'Other'],
    className = ''
}: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleReport = (reason: string) => {
        onReport?.(reason)
        setSubmitted(true)
        setTimeout(() => {
            setIsOpen(false)
            setSubmitted(false)
        }, 1500)
    }

    return (
        <div className={`report-button ${className}`}>
            <button className="report-button__trigger" onClick={() => setIsOpen(true)}>
                <Flag size={14} />
                <span>Report</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="report-button__modal"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <div className="report-button__overlay" onClick={() => setIsOpen(false)} />
                        <div className="report-button__content">
                            {!submitted ? (
                                <>
                                    <h4>Report Content</h4>
                                    <p>Why are you reporting this?</p>
                                    <div className="report-button__reasons">
                                        {reasons.map(reason => (
                                            <button key={reason} onClick={() => handleReport(reason)}>
                                                {reason}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="report-button__submitted">
                                    Thanks for reporting. We'll review this content.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default { Rating, ReactionButton, CommentInput, FeedbackBanner, NPSScore, ReportButton }
