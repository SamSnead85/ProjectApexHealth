import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Home } from 'lucide-react'
import './PageHeader.css'

export interface BreadcrumbItem {
    label: string
    path?: string
    icon?: ReactNode
}

interface PageHeaderProps {
    title: string
    subtitle?: string
    icon?: ReactNode
    breadcrumbs?: BreadcrumbItem[]
    onNavigate?: (path: string) => void
    actions?: ReactNode
    badge?: {
        text: string
        variant?: 'teal' | 'purple' | 'gold' | 'success' | 'warning'
    }
}

export function PageHeader({
    title,
    subtitle,
    icon,
    breadcrumbs = [],
    onNavigate,
    actions,
    badge
}: PageHeaderProps) {
    return (
        <motion.header
            className="page-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <nav className="page-header__breadcrumbs" aria-label="Breadcrumb">
                    <ol className="page-header__breadcrumb-list">
                        <li className="page-header__breadcrumb-item">
                            <button
                                className="page-header__breadcrumb-link page-header__breadcrumb-link--home"
                                onClick={() => onNavigate?.('/')}
                                aria-label="Home"
                            >
                                <Home size={14} />
                            </button>
                            <ChevronRight size={12} className="page-header__breadcrumb-sep" />
                        </li>
                        {breadcrumbs.map((item, index) => {
                            const isLast = index === breadcrumbs.length - 1
                            return (
                                <li key={item.path || item.label} className="page-header__breadcrumb-item">
                                    {isLast ? (
                                        <span className="page-header__breadcrumb-current" aria-current="page">
                                            {item.label}
                                        </span>
                                    ) : (
                                        <>
                                            <button
                                                className="page-header__breadcrumb-link"
                                                onClick={() => item.path && onNavigate?.(item.path)}
                                            >
                                                {item.label}
                                            </button>
                                            <ChevronRight size={12} className="page-header__breadcrumb-sep" />
                                        </>
                                    )}
                                </li>
                            )
                        })}
                    </ol>
                </nav>
            )}

            {/* Main Header */}
            <div className="page-header__main">
                <div className="page-header__title-section">
                    {icon && <div className="page-header__icon">{icon}</div>}
                    <div className="page-header__text">
                        <h1 className="page-header__title">
                            {title}
                            {badge && (
                                <span className={`page-header__badge page-header__badge--${badge.variant || 'teal'}`}>
                                    {badge.text}
                                </span>
                            )}
                        </h1>
                        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
                    </div>
                </div>
                {actions && <div className="page-header__actions">{actions}</div>}
            </div>
        </motion.header>
    )
}

export default PageHeader
