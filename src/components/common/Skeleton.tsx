import { motion } from 'framer-motion'
import './Skeleton.css'

interface SkeletonProps {
    width?: string | number
    height?: string | number
    variant?: 'text' | 'circular' | 'rectangular'
    animation?: 'pulse' | 'wave' | 'none'
    className?: string
}

export function Skeleton({
    width,
    height,
    variant = 'text',
    animation = 'pulse',
    className = ''
}: SkeletonProps) {
    const style = {
        width: width || (variant === 'circular' ? height : '100%'),
        height: height || (variant === 'text' ? '1em' : undefined),
        aspectRatio: variant === 'circular' ? '1' : undefined
    }

    return (
        <span
            className={`skeleton skeleton--${variant} skeleton--${animation} ${className}`}
            style={style}
        />
    )
}

// Skeleton text line
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`skeleton-text ${className}`}>
            {Array.from({ length: lines }, (_, i) => (
                <Skeleton
                    key={i}
                    width={i === lines - 1 ? '60%' : '100%'}
                    height={14}
                    variant="rectangular"
                />
            ))}
        </div>
    )
}

// Skeleton card
export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`skeleton-card ${className}`}>
            <Skeleton variant="rectangular" height={160} />
            <div className="skeleton-card__content">
                <Skeleton variant="text" height={20} width="70%" />
                <SkeletonText lines={2} />
            </div>
        </div>
    )
}

// Skeleton table row
export function SkeletonTableRow({ columns = 4, className = '' }: { columns?: number; className?: string }) {
    return (
        <div className={`skeleton-table-row ${className}`}>
            {Array.from({ length: columns }, (_, i) => (
                <Skeleton key={i} variant="rectangular" height={16} width={i === 0 ? '40%' : '60%'} />
            ))}
        </div>
    )
}

// Skeleton avatar with text
export function SkeletonAvatar({ withText = true, className = '' }: { withText?: boolean; className?: string }) {
    return (
        <div className={`skeleton-avatar ${className}`}>
            <Skeleton variant="circular" width={40} height={40} />
            {withText && (
                <div className="skeleton-avatar__text">
                    <Skeleton variant="rectangular" height={14} width={120} />
                    <Skeleton variant="rectangular" height={12} width={80} />
                </div>
            )}
        </div>
    )
}

// Full page skeleton
export function SkeletonPage({ className = '' }: { className?: string }) {
    return (
        <div className={`skeleton-page ${className}`}>
            <div className="skeleton-page__header">
                <Skeleton variant="rectangular" height={32} width={200} />
                <Skeleton variant="rectangular" height={16} width={300} />
            </div>
            <div className="skeleton-page__grid">
                {Array.from({ length: 4 }, (_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        </div>
    )
}

export default Skeleton
