import { motion } from 'framer-motion'
import './Avatar.css'

interface AvatarProps {
    src?: string
    alt?: string
    name?: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    status?: 'online' | 'offline' | 'away' | 'busy'
    className?: string
}

export function Avatar({
    src,
    alt,
    name = '',
    size = 'md',
    status,
    className = ''
}: AvatarProps) {
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const colors = [
        { bg: 'rgba(6, 182, 212, 0.2)', text: '#06b6d4' },
        { bg: 'rgba(139, 92, 246, 0.2)', text: '#8b5cf6' },
        { bg: 'rgba(16, 185, 129, 0.2)', text: '#10b981' },
        { bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' },
        { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
    ]

    const colorIndex = name.length % colors.length
    const { bg, text } = colors[colorIndex]

    return (
        <motion.div
            className={`avatar avatar--${size} ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
        >
            {src ? (
                <img src={src} alt={alt || name} className="avatar__image" />
            ) : (
                <div className="avatar__initials" style={{ background: bg, color: text }}>
                    {initials || '?'}
                </div>
            )}
            {status && (
                <span className={`avatar__status avatar__status--${status}`} />
            )}
        </motion.div>
    )
}

interface AvatarGroupProps {
    avatars: AvatarProps[]
    max?: number
    size?: 'xs' | 'sm' | 'md' | 'lg'
    className?: string
}

export function AvatarGroup({
    avatars,
    max = 4,
    size = 'sm',
    className = ''
}: AvatarGroupProps) {
    const visible = avatars.slice(0, max)
    const remaining = avatars.length - max

    return (
        <div className={`avatar-group ${className}`}>
            {visible.map((avatar, i) => (
                <Avatar key={i} {...avatar} size={size} />
            ))}
            {remaining > 0 && (
                <div className={`avatar avatar--${size} avatar--overflow`}>
                    <span className="avatar__count">+{remaining}</span>
                </div>
            )}
        </div>
    )
}

export default Avatar
