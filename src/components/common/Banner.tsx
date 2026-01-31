import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, Info, X, ArrowRight } from 'lucide-react'
import './Banner.css'

interface BannerProps {
    type?: 'info' | 'success' | 'warning' | 'promo'
    icon?: ReactNode
    title?: string
    message: string
    action?: {
        label: string
        onClick: () => void
    }
    dismissible?: boolean
    onDismiss?: () => void
    className?: string
}

export function Banner({
    type = 'info',
    icon,
    title,
    message,
    action,
    dismissible = false,
    onDismiss,
    className = ''
}: BannerProps) {
    const getDefaultIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={18} />
            case 'warning': return <AlertTriangle size={18} />
            case 'promo': return null
            default: return <Info size={18} />
        }
    }

    return (
        <motion.div
            className={`banner banner--${type} ${className}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
        >
            <div className="banner__content">
                {(icon || getDefaultIcon()) && (
                    <span className="banner__icon">{icon || getDefaultIcon()}</span>
                )}
                <div className="banner__text">
                    {title && <span className="banner__title">{title}</span>}
                    <span className="banner__message">{message}</span>
                </div>
                {action && (
                    <button className="banner__action" onClick={action.onClick}>
                        {action.label}
                        <ArrowRight size={14} />
                    </button>
                )}
                {dismissible && (
                    <button className="banner__dismiss" onClick={onDismiss}>
                        <X size={16} />
                    </button>
                )}
            </div>
        </motion.div>
    )
}

// Cookie consent banner
interface CookieBannerProps {
    onAccept: () => void
    onDecline?: () => void
    onSettings?: () => void
}

export function CookieBanner({ onAccept, onDecline, onSettings }: CookieBannerProps) {
    return (
        <motion.div
            className="cookie-banner"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
        >
            <p className="cookie-banner__text">
                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
            </p>
            <div className="cookie-banner__actions">
                {onSettings && (
                    <button className="cookie-banner__btn cookie-banner__btn--settings" onClick={onSettings}>
                        Cookie Settings
                    </button>
                )}
                {onDecline && (
                    <button className="cookie-banner__btn cookie-banner__btn--decline" onClick={onDecline}>
                        Decline
                    </button>
                )}
                <button className="cookie-banner__btn cookie-banner__btn--accept" onClick={onAccept}>
                    Accept All
                </button>
            </div>
        </motion.div>
    )
}

// Announcement bar
interface AnnouncementBarProps {
    message: string
    link?: { label: string; href: string }
    onDismiss?: () => void
    variant?: 'default' | 'gradient'
}

export function AnnouncementBar({ message, link, onDismiss, variant = 'default' }: AnnouncementBarProps) {
    return (
        <div className={`announcement-bar announcement-bar--${variant}`}>
            <div className="announcement-bar__content">
                <span className="announcement-bar__message">{message}</span>
                {link && (
                    <a href={link.href} className="announcement-bar__link">
                        {link.label}
                        <ArrowRight size={14} />
                    </a>
                )}
            </div>
            {onDismiss && (
                <button className="announcement-bar__dismiss" onClick={onDismiss}>
                    <X size={16} />
                </button>
            )}
        </div>
    )
}

export default Banner
