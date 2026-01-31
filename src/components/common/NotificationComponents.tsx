import { ReactNode, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, AlertCircle, Info, AlertTriangle, CheckCircle, Mail, MessageSquare, Calendar, Users, Settings, ChevronRight, MoreHorizontal, Archive, Trash2, Eye, EyeOff } from 'lucide-react'
import './NotificationComponents.css'

// Toast Notification
interface ToastProps { id: string; type?: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string; duration?: number; onClose?: () => void; action?: { label: string; onClick: () => void }; className?: string }

export function Toast({ id, type = 'info', title, message, duration = 5000, onClose, action, className = '' }: ToastProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => onClose?.(), duration)
            return () => clearTimeout(timer)
        }
    }, [duration, onClose])

    const icons = { success: <CheckCircle size={20} />, error: <AlertCircle size={20} />, warning: <AlertTriangle size={20} />, info: <Info size={20} /> }

    return (
        <motion.div className={`toast toast--${type} ${className}`} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}>
            <div className="toast__icon">{icons[type]}</div>
            <div className="toast__content">
                <span className="toast__title">{title}</span>
                {message && <span className="toast__message">{message}</span>}
            </div>
            {action && <button className="toast__action" onClick={action.onClick}>{action.label}</button>}
            <button className="toast__close" onClick={onClose}><X size={16} /></button>
        </motion.div>
    )
}

// Notification Center
interface Notification { id: string; type: 'message' | 'alert' | 'update' | 'event' | 'mention'; title: string; message: string; timestamp: Date; isRead: boolean; avatar?: string }

interface NotificationCenterProps { notifications: Notification[]; onMarkRead?: (id: string) => void; onMarkAllRead?: () => void; onDelete?: (id: string) => void; onClear?: () => void; className?: string }

export function NotificationCenter({ notifications, onMarkRead, onMarkAllRead, onDelete, onClear, className = '' }: NotificationCenterProps) {
    const unreadCount = notifications.filter(n => !n.isRead).length

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'message': return <MessageSquare size={16} />
            case 'alert': return <AlertCircle size={16} />
            case 'update': return <Info size={16} />
            case 'event': return <Calendar size={16} />
            case 'mention': return <Users size={16} />
        }
    }

    return (
        <div className={`notification-center ${className}`}>
            <div className="notification-center__header">
                <h3>Notifications</h3>
                {unreadCount > 0 && <span className="notification-center__badge">{unreadCount}</span>}
                <div className="notification-center__actions">
                    <button onClick={onMarkAllRead}><Eye size={14} /> Mark all read</button>
                    <button onClick={onClear}><Trash2 size={14} /> Clear all</button>
                </div>
            </div>
            <div className="notification-center__list">
                {notifications.length === 0 ? (
                    <div className="notification-center__empty"><Bell size={32} /><span>No notifications</span></div>
                ) : (
                    notifications.map(n => (
                        <div key={n.id} className={`notification-center__item ${n.isRead ? '' : 'unread'}`}>
                            <div className={`notification-center__icon notification-center__icon--${n.type}`}>{getIcon(n.type)}</div>
                            <div className="notification-center__content" onClick={() => onMarkRead?.(n.id)}>
                                <span className="notification-center__title">{n.title}</span>
                                <span className="notification-center__message">{n.message}</span>
                                <span className="notification-center__time">{n.timestamp.toLocaleTimeString()}</span>
                            </div>
                            <button className="notification-center__delete" onClick={() => onDelete?.(n.id)}><X size={14} /></button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

// Badge
interface BadgeProps { count?: number; dot?: boolean; color?: 'default' | 'success' | 'warning' | 'danger'; max?: number; children: ReactNode; className?: string }

export function Badge({ count, dot = false, color = 'default', max = 99, children, className = '' }: BadgeProps) {
    const displayCount = count && count > max ? `${max}+` : count

    return (
        <div className={`badge-wrapper ${className}`}>
            {children}
            {(dot || (count !== undefined && count > 0)) && (
                <span className={`badge badge--${color} ${dot ? 'badge--dot' : ''}`}>
                    {!dot && displayCount}
                </span>
            )}
        </div>
    )
}

// Notification Bell
interface NotificationBellProps { count?: number; onClick?: () => void; className?: string }

export function NotificationBell({ count = 0, onClick, className = '' }: NotificationBellProps) {
    return (
        <button className={`notification-bell ${className}`} onClick={onClick}>
            <Bell size={20} />
            {count > 0 && <span className="notification-bell__badge">{count > 99 ? '99+' : count}</span>}
        </button>
    )
}

// Inline Alert
interface InlineAlertProps { type?: 'success' | 'error' | 'warning' | 'info'; title?: string; message: string; dismissible?: boolean; onDismiss?: () => void; action?: { label: string; onClick: () => void }; className?: string }

export function InlineAlert({ type = 'info', title, message, dismissible = false, onDismiss, action, className = '' }: InlineAlertProps) {
    const icons = { success: <CheckCircle size={18} />, error: <AlertCircle size={18} />, warning: <AlertTriangle size={18} />, info: <Info size={18} /> }

    return (
        <div className={`inline-alert inline-alert--${type} ${className}`}>
            <div className="inline-alert__icon">{icons[type]}</div>
            <div className="inline-alert__content">
                {title && <span className="inline-alert__title">{title}</span>}
                <span className="inline-alert__message">{message}</span>
            </div>
            {action && <button className="inline-alert__action" onClick={action.onClick}>{action.label}</button>}
            {dismissible && <button className="inline-alert__dismiss" onClick={onDismiss}><X size={16} /></button>}
        </div>
    )
}

// Snackbar
interface SnackbarProps { message: string; action?: { label: string; onClick: () => void }; duration?: number; position?: 'top' | 'bottom'; onClose?: () => void; className?: string }

export function Snackbar({ message, action, duration = 4000, position = 'bottom', onClose, className = '' }: SnackbarProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => onClose?.(), duration)
            return () => clearTimeout(timer)
        }
    }, [duration, onClose])

    return (
        <motion.div className={`snackbar snackbar--${position} ${className}`} initial={{ opacity: 0, y: position === 'bottom' ? 50 : -50 }}
            animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: position === 'bottom' ? 50 : -50 }}>
            <span className="snackbar__message">{message}</span>
            {action && <button className="snackbar__action" onClick={action.onClick}>{action.label}</button>}
            <button className="snackbar__close" onClick={onClose}><X size={14} /></button>
        </motion.div>
    )
}

// Banner
interface BannerProps { type?: 'info' | 'warning' | 'error' | 'success' | 'promo'; message: string; action?: { label: string; onClick: () => void }; dismissible?: boolean; onDismiss?: () => void; className?: string }

export function Banner({ type = 'info', message, action, dismissible = true, onDismiss, className = '' }: BannerProps) {
    return (
        <div className={`banner banner--${type} ${className}`}>
            <span className="banner__message">{message}</span>
            {action && <button className="banner__action" onClick={action.onClick}>{action.label} <ChevronRight size={14} /></button>}
            {dismissible && <button className="banner__dismiss" onClick={onDismiss}><X size={18} /></button>}
        </div>
    )
}

export default { Toast, NotificationCenter, Badge, NotificationBell, InlineAlert, Snackbar, Banner }
