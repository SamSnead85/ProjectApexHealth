import React from 'react'
import './SkeletonLoader.css'

interface SkeletonLoaderProps {
    variant?: 'text' | 'title' | 'avatar' | 'card' | 'metric' | 'table-row' | 'image'
    lines?: number
    width?: string | number
    height?: string | number
    className?: string
    animate?: boolean
}

export function SkeletonLoader({
    variant = 'text',
    lines = 1,
    width,
    height,
    className = '',
    animate = true
}: SkeletonLoaderProps) {
    const baseClass = `skeleton skeleton--${variant} ${animate ? 'skeleton--animated' : ''} ${className}`

    const style: React.CSSProperties = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
    }

    if (variant === 'text' && lines > 1) {
        return (
            <div className="skeleton-text-block">
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={baseClass}
                        style={{
                            ...style,
                            width: i === lines - 1 ? '70%' : '100%'
                        }}
                    />
                ))}
            </div>
        )
    }

    return <div className={baseClass} style={style} />
}

// Preset skeleton components for common patterns
export function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-card__header">
                <SkeletonLoader variant="avatar" />
                <div className="skeleton-card__header-text">
                    <SkeletonLoader variant="title" width="60%" />
                    <SkeletonLoader variant="text" width="40%" />
                </div>
            </div>
            <SkeletonLoader variant="text" lines={3} />
        </div>
    )
}

export function SkeletonMetric() {
    return (
        <div className="skeleton-metric">
            <SkeletonLoader variant="text" width={80} />
            <SkeletonLoader variant="title" width={120} height={32} />
            <SkeletonLoader variant="text" width={100} />
        </div>
    )
}

export function SkeletonTableRow() {
    return (
        <div className="skeleton-table-row">
            <SkeletonLoader width="25%" height={16} />
            <SkeletonLoader width="20%" height={16} />
            <SkeletonLoader width="30%" height={16} />
            <SkeletonLoader width="15%" height={16} />
        </div>
    )
}

export function SkeletonProviderCard() {
    return (
        <div className="skeleton-provider-card">
            <SkeletonLoader variant="avatar" width={56} height={56} />
            <div className="skeleton-provider-card__info">
                <SkeletonLoader variant="title" width="70%" />
                <SkeletonLoader variant="text" width="50%" />
                <SkeletonLoader variant="text" width="60%" />
            </div>
        </div>
    )
}

export function SkeletonAppointment() {
    return (
        <div className="skeleton-appointment">
            <div className="skeleton-appointment__date">
                <SkeletonLoader width={36} height={36} />
            </div>
            <div className="skeleton-appointment__content">
                <SkeletonLoader variant="title" width="60%" />
                <SkeletonLoader variant="text" width="40%" />
                <SkeletonLoader variant="text" width="50%" />
            </div>
        </div>
    )
}

export function SkeletonDashboard() {
    return (
        <div className="skeleton-dashboard">
            <div className="skeleton-dashboard__header">
                <SkeletonLoader variant="title" width={200} height={28} />
                <SkeletonLoader width={120} height={32} />
            </div>
            <div className="skeleton-dashboard__metrics">
                <SkeletonMetric />
                <SkeletonMetric />
                <SkeletonMetric />
                <SkeletonMetric />
            </div>
            <div className="skeleton-dashboard__content">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    )
}

export default SkeletonLoader
