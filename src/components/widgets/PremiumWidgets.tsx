import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    GripVertical, Maximize2, Minimize2, X, MoreHorizontal,
    RefreshCw, Settings, Pin, ChevronDown, ChevronUp
} from 'lucide-react'
import './PremiumWidgets.css'

// ============================================
// COLLAPSIBLE WIDGET
// ============================================
interface CollapsibleWidgetProps {
    title: string
    icon?: ReactNode
    badge?: ReactNode
    children: ReactNode
    defaultCollapsed?: boolean
    onRefresh?: () => void
    onSettings?: () => void
    actions?: ReactNode
}

export function CollapsibleWidget({
    title,
    icon,
    badge,
    children,
    defaultCollapsed = false,
    onRefresh,
    onSettings,
    actions
}: CollapsibleWidgetProps) {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = async () => {
        if (!onRefresh) return
        setIsRefreshing(true)
        await onRefresh()
        setTimeout(() => setIsRefreshing(false), 1000)
    }

    return (
        <motion.div
            className={`widget widget--collapsible ${isCollapsed ? 'widget--collapsed' : ''}`}
            layout
        >
            <div className="widget__header" onClick={() => setIsCollapsed(!isCollapsed)}>
                <div className="widget__title-section">
                    {icon && <div className="widget__icon">{icon}</div>}
                    <h3 className="widget__title">{title}</h3>
                    {badge}
                </div>
                <div className="widget__controls">
                    {onRefresh && (
                        <button
                            className={`widget__control ${isRefreshing ? 'widget__control--active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); handleRefresh(); }}
                            aria-label="Refresh"
                        >
                            <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
                        </button>
                    )}
                    {onSettings && (
                        <button
                            className="widget__control"
                            onClick={(e) => { e.stopPropagation(); onSettings(); }}
                            aria-label="Settings"
                        >
                            <Settings size={14} />
                        </button>
                    )}
                    {actions}
                    <button className="widget__control widget__collapse-btn">
                        {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                </div>
            </div>
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        className="widget__content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// ============================================
// DRAGGABLE WIDGET
// ============================================
interface DraggableWidgetProps {
    id: string
    title: string
    icon?: ReactNode
    children: ReactNode
    onRemove?: () => void
    onMaximize?: () => void
    isPinned?: boolean
    onPin?: () => void
}

export function DraggableWidget({
    title,
    icon,
    children,
    onRemove,
    onMaximize,
    isPinned,
    onPin
}: DraggableWidgetProps) {
    const [isMaximized, setIsMaximized] = useState(false)

    const handleMaximize = () => {
        setIsMaximized(!isMaximized)
        onMaximize?.()
    }

    return (
        <motion.div
            className={`widget widget--draggable ${isMaximized ? 'widget--maximized' : ''}`}
            layout
            whileHover={{ scale: isMaximized ? 1 : 1.01 }}
        >
            <div className="widget__header">
                <div className="widget__drag-handle">
                    <GripVertical size={14} />
                </div>
                <div className="widget__title-section">
                    {icon && <div className="widget__icon">{icon}</div>}
                    <h3 className="widget__title">{title}</h3>
                </div>
                <div className="widget__controls">
                    {onPin && (
                        <button
                            className={`widget__control ${isPinned ? 'widget__control--active' : ''}`}
                            onClick={onPin}
                            aria-label="Pin widget"
                        >
                            <Pin size={14} />
                        </button>
                    )}
                    <button
                        className="widget__control"
                        onClick={handleMaximize}
                        aria-label={isMaximized ? "Minimize" : "Maximize"}
                    >
                        {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    {onRemove && (
                        <button
                            className="widget__control widget__control--danger"
                            onClick={onRemove}
                            aria-label="Remove widget"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>
            <div className="widget__content">
                {children}
            </div>
        </motion.div>
    )
}

// ============================================
// STATUS CARD WIDGET
// ============================================
interface StatusCardProps {
    title: string
    status: 'healthy' | 'warning' | 'critical' | 'inactive'
    message?: string
    lastChecked?: Date
    icon?: ReactNode
    metrics?: Array<{ label: string; value: string | number }>
}

export function StatusCard({ title, status, message, lastChecked, icon, metrics }: StatusCardProps) {
    const statusConfig = {
        healthy: { color: 'var(--apex-success)', label: 'Healthy' },
        warning: { color: 'var(--apex-warning)', label: 'Warning' },
        critical: { color: 'var(--apex-critical)', label: 'Critical' },
        inactive: { color: 'var(--apex-steel)', label: 'Inactive' }
    }

    return (
        <motion.div
            className={`status-card status-card--${status}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="status-card__header">
                <div className="status-card__title-section">
                    {icon && <div className="status-card__icon">{icon}</div>}
                    <h4 className="status-card__title">{title}</h4>
                </div>
                <span
                    className="status-card__indicator"
                    style={{ backgroundColor: statusConfig[status].color }}
                />
            </div>
            <div className="status-card__status" style={{ color: statusConfig[status].color }}>
                {statusConfig[status].label}
            </div>
            {message && <p className="status-card__message">{message}</p>}
            {metrics && metrics.length > 0 && (
                <div className="status-card__metrics">
                    {metrics.map((metric, i) => (
                        <div key={i} className="status-card__metric">
                            <span className="status-card__metric-value">{metric.value}</span>
                            <span className="status-card__metric-label">{metric.label}</span>
                        </div>
                    ))}
                </div>
            )}
            {lastChecked && (
                <div className="status-card__footer">
                    Last checked: {lastChecked.toLocaleTimeString()}
                </div>
            )}
        </motion.div>
    )
}

// ============================================
// QUICK ACTION CARD
// ============================================
interface QuickActionProps {
    icon: ReactNode
    title: string
    description?: string
    onClick: () => void
    variant?: 'default' | 'primary' | 'success' | 'warning'
    badge?: string
}

export function QuickAction({ icon, title, description, onClick, variant = 'default', badge }: QuickActionProps) {
    return (
        <motion.button
            className={`quick-action quick-action--${variant}`}
            onClick={onClick}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="quick-action__icon">{icon}</div>
            <div className="quick-action__content">
                <span className="quick-action__title">{title}</span>
                {description && <span className="quick-action__description">{description}</span>}
            </div>
            {badge && <span className="quick-action__badge">{badge}</span>}
        </motion.button>
    )
}

// ============================================
// TIMELINE WIDGET
// ============================================
interface TimelineItem {
    id: string
    title: string
    description?: string
    timestamp: Date
    icon?: ReactNode
    status?: 'completed' | 'current' | 'pending'
}

interface TimelineProps {
    items: TimelineItem[]
    maxItems?: number
}

export function Timeline({ items, maxItems = 5 }: TimelineProps) {
    const displayItems = items.slice(0, maxItems)

    return (
        <div className="timeline">
            {displayItems.map((item, index) => (
                <motion.div
                    key={item.id}
                    className={`timeline__item timeline__item--${item.status || 'pending'}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <div className="timeline__marker">
                        {item.icon || <div className="timeline__dot" />}
                    </div>
                    <div className="timeline__connector" />
                    <div className="timeline__content">
                        <h5 className="timeline__title">{item.title}</h5>
                        {item.description && (
                            <p className="timeline__description">{item.description}</p>
                        )}
                        <span className="timeline__timestamp">
                            {item.timestamp.toLocaleString()}
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// NOTIFICATION BANNER
// ============================================
interface NotificationBannerProps {
    variant: 'info' | 'success' | 'warning' | 'error'
    title: string
    message?: string
    action?: { label: string; onClick: () => void }
    onDismiss?: () => void
}

export function NotificationBanner({ variant, title, message, action, onDismiss }: NotificationBannerProps) {
    return (
        <motion.div
            className={`notification-banner notification-banner--${variant}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <div className="notification-banner__content">
                <strong className="notification-banner__title">{title}</strong>
                {message && <p className="notification-banner__message">{message}</p>}
            </div>
            <div className="notification-banner__actions">
                {action && (
                    <button className="notification-banner__action" onClick={action.onClick}>
                        {action.label}
                    </button>
                )}
                {onDismiss && (
                    <button className="notification-banner__dismiss" onClick={onDismiss}>
                        <X size={16} />
                    </button>
                )}
            </div>
        </motion.div>
    )
}

export default {
    CollapsibleWidget,
    DraggableWidget,
    StatusCard,
    QuickAction,
    Timeline,
    NotificationBanner
}
