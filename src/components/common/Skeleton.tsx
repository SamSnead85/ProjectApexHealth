import { motion } from 'framer-motion'
import './Skeleton.css'

interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'metric'
    width?: string | number
    height?: string | number
    className?: string
    count?: number
}

export function Skeleton({
    variant = 'text',
    width,
    height,
    className = '',
    count = 1
}: SkeletonProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'circular':
                return {
                    width: width || 40,
                    height: height || 40,
                    borderRadius: '50%'
                }
            case 'rectangular':
                return {
                    width: width || '100%',
                    height: height || 120
                }
            case 'text':
                return {
                    width: width || '100%',
                    height: height || 16,
                    borderRadius: 4
                }
            case 'card':
                return {
                    width: width || '100%',
                    height: height || 180,
                    borderRadius: 12
                }
            case 'metric':
                return {
                    width: width || '100%',
                    height: height || 80,
                    borderRadius: 12
                }
            default:
                return { width, height }
        }
    }

    const items = Array.from({ length: count }, (_, i) => i)

    return (
        <>
            {items.map((_, index) => (
                <motion.div
                    key={index}
                    className={`skeleton skeleton--${variant} ${className}`}
                    style={getVariantStyles()}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.1
                    }}
                />
            ))}
        </>
    )
}

// Pre-built skeleton layouts
export function DashboardSkeleton() {
    return (
        <div className="skeleton-dashboard">
            {/* Header */}
            <div className="skeleton-header">
                <Skeleton variant="text" width="30%" height={32} />
                <Skeleton variant="text" width="40%" height={16} />
            </div>

            {/* Metrics */}
            <div className="skeleton-metrics">
                <Skeleton variant="metric" />
                <Skeleton variant="metric" />
                <Skeleton variant="metric" />
                <Skeleton variant="metric" />
            </div>

            {/* Cards */}
            <div className="skeleton-cards">
                <Skeleton variant="card" height={240} />
                <Skeleton variant="card" height={240} />
            </div>
        </div>
    )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="skeleton-table">
            {/* Header */}
            <div className="skeleton-table-header">
                <Skeleton variant="text" width="15%" />
                <Skeleton variant="text" width="25%" />
                <Skeleton variant="text" width="20%" />
                <Skeleton variant="text" width="15%" />
                <Skeleton variant="text" width="10%" />
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="skeleton-table-row">
                    <Skeleton variant="text" width="15%" />
                    <Skeleton variant="text" width="25%" />
                    <Skeleton variant="text" width="20%" />
                    <Skeleton variant="text" width="15%" />
                    <Skeleton variant="text" width="10%" />
                </div>
            ))}
        </div>
    )
}

export function CardGridSkeleton({ cards = 6 }: { cards?: number }) {
    return (
        <div className="skeleton-card-grid">
            {Array.from({ length: cards }).map((_, i) => (
                <Skeleton key={i} variant="card" height={200} />
            ))}
        </div>
    )
}

export default Skeleton
