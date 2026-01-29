import { motion } from 'framer-motion'
import {
    Inbox,
    FileText,
    Search,
    Plus,
    GitBranch,
    Users,
    CreditCard,
    BarChart3,
    Shield
} from 'lucide-react'
import { Button } from './Button'
import './EmptyState.css'

type EmptyStateType =
    | 'default'
    | 'search'
    | 'claims'
    | 'workflows'
    | 'members'
    | 'payments'
    | 'analytics'
    | 'compliance'

interface EmptyStateProps {
    type?: EmptyStateType
    title?: string
    description?: string
    actionLabel?: string
    onAction?: () => void
    showAction?: boolean
}

const EMPTY_STATE_CONFIG: Record<EmptyStateType, {
    icon: React.ReactNode
    title: string
    description: string
    actionLabel: string
}> = {
    default: {
        icon: <Inbox size={48} />,
        title: 'No data yet',
        description: 'There\'s nothing here at the moment. Data will appear once available.',
        actionLabel: 'Get Started'
    },
    search: {
        icon: <Search size={48} />,
        title: 'No results found',
        description: 'We couldn\'t find anything matching your search. Try different keywords.',
        actionLabel: 'Clear Search'
    },
    claims: {
        icon: <FileText size={48} />,
        title: 'No claims to display',
        description: 'All claims have been processed or there are no pending claims.',
        actionLabel: 'Submit Claim'
    },
    workflows: {
        icon: <GitBranch size={48} />,
        title: 'No workflows created',
        description: 'Create your first workflow to automate healthcare processes.',
        actionLabel: 'Create Workflow'
    },
    members: {
        icon: <Users size={48} />,
        title: 'No members found',
        description: 'Add members to start managing their healthcare benefits.',
        actionLabel: 'Add Member'
    },
    payments: {
        icon: <CreditCard size={48} />,
        title: 'No payment history',
        description: 'Payment transactions will appear here once processed.',
        actionLabel: 'Process Payment'
    },
    analytics: {
        icon: <BarChart3 size={48} />,
        title: 'No data available',
        description: 'Analytics will populate as more data flows through the system.',
        actionLabel: 'Configure Reports'
    },
    compliance: {
        icon: <Shield size={48} />,
        title: 'All compliant',
        description: 'Great news! There are no compliance issues requiring attention.',
        actionLabel: 'View Details'
    }
}

export function EmptyState({
    type = 'default',
    title,
    description,
    actionLabel,
    onAction,
    showAction = true
}: EmptyStateProps) {
    const config = EMPTY_STATE_CONFIG[type]

    return (
        <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            <motion.div
                className="empty-state__icon"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
                {config.icon}
            </motion.div>

            <div className="empty-state__content">
                <h3 className="empty-state__title">
                    {title || config.title}
                </h3>
                <p className="empty-state__description">
                    {description || config.description}
                </p>
            </div>

            {showAction && onAction && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button
                        variant="primary"
                        onClick={onAction}
                        icon={<Plus size={16} />}
                    >
                        {actionLabel || config.actionLabel}
                    </Button>
                </motion.div>
            )}

            {/* Decorative background */}
            <div className="empty-state__bg" />
        </motion.div>
    )
}

export default EmptyState
