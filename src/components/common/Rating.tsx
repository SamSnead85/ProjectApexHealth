import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import './Rating.css'

interface RatingProps {
    value: number
    max?: number
    onChange?: (value: number) => void
    readonly?: boolean
    size?: 'sm' | 'md' | 'lg'
    showValue?: boolean
    label?: string
    className?: string
}

export function Rating({
    value,
    max = 5,
    onChange,
    readonly = false,
    size = 'md',
    showValue = false,
    label,
    className = ''
}: RatingProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null)
    const displayValue = hoverValue ?? value

    const handleClick = (rating: number) => {
        if (!readonly && onChange) {
            onChange(rating)
        }
    }

    return (
        <div className={`rating rating--${size} ${readonly ? 'rating--readonly' : ''} ${className}`}>
            {label && <span className="rating__label">{label}</span>}
            <div className="rating__stars">
                {Array.from({ length: max }, (_, i) => {
                    const rating = i + 1
                    const isFilled = rating <= displayValue
                    const isHalf = !isFilled && rating - 0.5 <= displayValue

                    return (
                        <motion.button
                            key={i}
                            type="button"
                            className={`rating__star ${isFilled ? 'rating__star--filled' : ''} ${isHalf ? 'rating__star--half' : ''}`}
                            onClick={() => handleClick(rating)}
                            onMouseEnter={() => !readonly && setHoverValue(rating)}
                            onMouseLeave={() => !readonly && setHoverValue(null)}
                            whileHover={!readonly ? { scale: 1.2 } : undefined}
                            whileTap={!readonly ? { scale: 0.9 } : undefined}
                            disabled={readonly}
                            aria-label={`Rate ${rating} of ${max}`}
                        >
                            <Star
                                fill={isFilled ? 'currentColor' : 'none'}
                                strokeWidth={isFilled ? 0 : 1.5}
                            />
                        </motion.button>
                    )
                })}
            </div>
            {showValue && (
                <span className="rating__value">{value.toFixed(1)}</span>
            )}
        </div>
    )
}

// Emoji rating
interface EmojiRatingProps {
    value: number
    onChange?: (value: number) => void
    readonly?: boolean
    className?: string
}

const emojis = ['😞', '😕', '😐', '🙂', '😃']

export function EmojiRating({ value, onChange, readonly = false, className = '' }: EmojiRatingProps) {
    return (
        <div className={`emoji-rating ${readonly ? 'emoji-rating--readonly' : ''} ${className}`}>
            {emojis.map((emoji, i) => {
                const rating = i + 1
                const isSelected = rating === value

                return (
                    <motion.button
                        key={i}
                        type="button"
                        className={`emoji-rating__item ${isSelected ? 'emoji-rating__item--selected' : ''}`}
                        onClick={() => !readonly && onChange?.(rating)}
                        whileHover={!readonly ? { scale: 1.1, y: -2 } : undefined}
                        whileTap={!readonly ? { scale: 0.95 } : undefined}
                        disabled={readonly}
                    >
                        <span className="emoji-rating__emoji">{emoji}</span>
                    </motion.button>
                )
            })}
        </div>
    )
}

// Thumbs rating
interface ThumbsRatingProps {
    value: 'up' | 'down' | null
    onChange?: (value: 'up' | 'down' | null) => void
    readonly?: boolean
    showLabels?: boolean
    className?: string
}

export function ThumbsRating({ value, onChange, readonly = false, showLabels = false, className = '' }: ThumbsRatingProps) {
    const handleClick = (rating: 'up' | 'down') => {
        if (!readonly && onChange) {
            onChange(value === rating ? null : rating)
        }
    }

    return (
        <div className={`thumbs-rating ${className}`}>
            <motion.button
                type="button"
                className={`thumbs-rating__btn ${value === 'up' ? 'thumbs-rating__btn--selected' : ''}`}
                onClick={() => handleClick('up')}
                whileHover={!readonly ? { scale: 1.1 } : undefined}
                whileTap={!readonly ? { scale: 0.95 } : undefined}
                disabled={readonly}
            >
                👍
                {showLabels && <span>Helpful</span>}
            </motion.button>
            <motion.button
                type="button"
                className={`thumbs-rating__btn ${value === 'down' ? 'thumbs-rating__btn--selected-down' : ''}`}
                onClick={() => handleClick('down')}
                whileHover={!readonly ? { scale: 1.1 } : undefined}
                whileTap={!readonly ? { scale: 0.95 } : undefined}
                disabled={readonly}
            >
                👎
                {showLabels && <span>Not helpful</span>}
            </motion.button>
        </div>
    )
}

export default Rating
