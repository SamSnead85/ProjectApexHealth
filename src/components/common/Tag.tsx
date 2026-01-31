import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import './Tag.css'

interface TagProps {
    children: ReactNode
    color?: 'gray' | 'teal' | 'blue' | 'green' | 'yellow' | 'red' | 'purple'
    size?: 'sm' | 'md' | 'lg'
    variant?: 'solid' | 'outline' | 'subtle'
    removable?: boolean
    onRemove?: () => void
    icon?: ReactNode
    className?: string
}

export function Tag({
    children,
    color = 'gray',
    size = 'md',
    variant = 'subtle',
    removable = false,
    onRemove,
    icon,
    className = ''
}: TagProps) {
    return (
        <motion.span
            className={`tag tag--${color} tag--${size} tag--${variant} ${className}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            layout
        >
            {icon && <span className="tag__icon">{icon}</span>}
            <span className="tag__text">{children}</span>
            {removable && (
                <button className="tag__remove" onClick={onRemove} aria-label="Remove">
                    <X size={12} />
                </button>
            )}
        </motion.span>
    )
}

// Tag group wrapper
export function TagGroup({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`tag-group ${className}`}>{children}</div>
}

// Chip variant (clickable)
interface ChipProps {
    children: ReactNode
    selected?: boolean
    onClick?: () => void
    icon?: ReactNode
    className?: string
}

export function Chip({
    children,
    selected = false,
    onClick,
    icon,
    className = ''
}: ChipProps) {
    return (
        <motion.button
            className={`chip ${selected ? 'chip--selected' : ''} ${className}`}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {icon && <span className="chip__icon">{icon}</span>}
            <span className="chip__text">{children}</span>
        </motion.button>
    )
}

// Chip group for selection
export function ChipGroup({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`chip-group ${className}`}>{children}</div>
}

export default Tag
