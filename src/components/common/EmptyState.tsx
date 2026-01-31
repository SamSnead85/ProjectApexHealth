import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Inbox, Search, FileX, AlertCircle, Plus, RefreshCw, ArrowLeft } from 'lucide-react'
import './EmptyState.css'

interface EmptyStateProps {
    icon?: ReactNode
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
        icon?: ReactNode
    }
    secondaryAction?: {
        label: string
        onClick: () => void
    }
    variant?: 'default' | 'search' | 'error' | 'card'
    className?: string
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    secondaryAction,
    variant = 'default',
    className = ''
}: EmptyStateProps) {
    const getDefaultIcon = () => {
        switch (variant) {
            case 'search': return <Search size={48} />
            case 'error': return <AlertCircle size={48} />
            default: return <Inbox size={48} />
        }
    }

    return (
        <motion.div
            className={`empty-state empty-state--${variant} ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="empty-state__icon">
                {icon || getDefaultIcon()}
            </div>
            <h3 className="empty-state__title">{title}</h3>
            {description && (
                <p className="empty-state__description">{description}</p>
            )}
            {(action || secondaryAction) && (
                <div className="empty-state__actions">
                    {action && (
                        <motion.button
                            className="empty-state__action"
                            onClick={action.onClick}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {action.icon || <Plus size={16} />}
                            {action.label}
                        </motion.button>
                    )}
                    {secondaryAction && (
                        <button
                            className="empty-state__secondary-action"
                            onClick={secondaryAction.onClick}
                        >
                            {secondaryAction.label}
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    )
}

// No search results
export function NoSearchResults({
    query,
    onClear
}: {
    query: string
    onClear: () => void
}) {
    return (
        <EmptyState
            icon={<Search size={48} />}
            title="No results found"
            description={`We couldn't find anything matching "${query}". Try a different search term.`}
            action={{ label: 'Clear search', onClick: onClear, icon: <RefreshCw size={16} /> }}
            variant="search"
        />
    )
}

// Error state
export function ErrorState({
    title = 'Something went wrong',
    description = 'An unexpected error occurred. Please try again.',
    onRetry
}: {
    title?: string
    description?: string
    onRetry?: () => void
}) {
    return (
        <EmptyState
            icon={<AlertCircle size={48} />}
            title={title}
            description={description}
            action={onRetry ? { label: 'Try again', onClick: onRetry, icon: <RefreshCw size={16} /> } : undefined}
            variant="error"
        />
    )
}

// Not found state
export function NotFoundState({ onGoBack }: { onGoBack?: () => void }) {
    return (
        <EmptyState
            icon={<FileX size={48} />}
            title="Page not found"
            description="The page you're looking for doesn't exist or has been moved."
            action={onGoBack ? { label: 'Go back', onClick: onGoBack, icon: <ArrowLeft size={16} /> } : undefined}
        />
    )
}

export default EmptyState
