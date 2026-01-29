import React from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    FileText,
    Users,
    Calendar,
    Inbox,
    Folder,
    ClipboardList,
    AlertCircle,
    RefreshCcw,
    Plus,
    ArrowRight
} from 'lucide-react'
import { Button } from '../../components/common'
import './EmptyState.css'

interface EmptyStateProps {
    variant?: 'default' | 'search' | 'documents' | 'members' | 'appointments' | 'inbox' | 'folder' | 'tasks' | 'error'
    title: string
    description: string
    icon?: React.ReactNode
    primaryAction?: {
        label: string
        onClick: () => void
        icon?: React.ReactNode
    }
    secondaryAction?: {
        label: string
        onClick: () => void
    }
}

const defaultIcons: Record<string, React.ReactNode> = {
    default: <Inbox size={48} />,
    search: <Search size={48} />,
    documents: <FileText size={48} />,
    members: <Users size={48} />,
    appointments: <Calendar size={48} />,
    inbox: <Inbox size={48} />,
    folder: <Folder size={48} />,
    tasks: <ClipboardList size={48} />,
    error: <AlertCircle size={48} />
}

export function EmptyState({
    variant = 'default',
    title,
    description,
    icon,
    primaryAction,
    secondaryAction
}: EmptyStateProps) {
    const displayIcon = icon || defaultIcons[variant]

    return (
        <motion.div
            className={`empty-state empty-state--${variant}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="empty-state__illustration">
                <div className="empty-state__icon-container">
                    {displayIcon}
                </div>
                {/* Atmospheric rings */}
                <div className="empty-state__ring empty-state__ring--1" />
                <div className="empty-state__ring empty-state__ring--2" />
                <div className="empty-state__ring empty-state__ring--3" />
            </div>

            <div className="empty-state__content">
                <h3 className="empty-state__title">{title}</h3>
                <p className="empty-state__description">{description}</p>
            </div>

            {(primaryAction || secondaryAction) && (
                <div className="empty-state__actions">
                    {primaryAction && (
                        <Button
                            variant="primary"
                            icon={primaryAction.icon || <Plus size={16} />}
                            onClick={primaryAction.onClick}
                        >
                            {primaryAction.label}
                        </Button>
                    )}
                    {secondaryAction && (
                        <Button
                            variant="ghost"
                            onClick={secondaryAction.onClick}
                        >
                            {secondaryAction.label}
                        </Button>
                    )}
                </div>
            )}
        </motion.div>
    )
}

// Preset empty states for common scenarios
export function NoSearchResults({ query, onClear }: { query: string; onClear: () => void }) {
    return (
        <EmptyState
            variant="search"
            title="No results found"
            description={`We couldn't find anything matching "${query}". Try adjusting your search terms.`}
            primaryAction={{
                label: 'Clear Search',
                onClick: onClear,
                icon: <RefreshCcw size={16} />
            }}
        />
    )
}

export function NoDocuments({ onUpload }: { onUpload: () => void }) {
    return (
        <EmptyState
            variant="documents"
            title="No documents yet"
            description="Upload your first document to get started with secure document storage."
            primaryAction={{
                label: 'Upload Document',
                onClick: onUpload
            }}
        />
    )
}

export function NoAppointments({ onSchedule }: { onSchedule: () => void }) {
    return (
        <EmptyState
            variant="appointments"
            title="No upcoming appointments"
            description="Schedule your next visit with one of your care team providers."
            primaryAction={{
                label: 'Schedule Appointment',
                onClick: onSchedule,
                icon: <Calendar size={16} />
            }}
        />
    )
}

export function NoMessages({ onCompose }: { onCompose: () => void }) {
    return (
        <EmptyState
            variant="inbox"
            title="Your inbox is empty"
            description="All caught up! Messages from your care team will appear here."
            primaryAction={{
                label: 'Send a Message',
                onClick: onCompose
            }}
        />
    )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <EmptyState
            variant="error"
            title="Something went wrong"
            description="We're having trouble loading this content. Please try again."
            primaryAction={{
                label: 'Try Again',
                onClick: onRetry,
                icon: <RefreshCcw size={16} />
            }}
        />
    )
}

export default EmptyState
