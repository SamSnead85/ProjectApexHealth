import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import './Section.css'

interface SectionProps {
    title?: string
    description?: string
    children: ReactNode
    action?: ReactNode
    collapsible?: boolean
    defaultCollapsed?: boolean
    className?: string
}

export function Section({
    title,
    description,
    children,
    action,
    className = ''
}: SectionProps) {
    return (
        <motion.section
            className={`section ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {(title || description || action) && (
                <div className="section__header">
                    <div className="section__heading">
                        {title && <h2 className="section__title">{title}</h2>}
                        {description && <p className="section__description">{description}</p>}
                    </div>
                    {action && <div className="section__action">{action}</div>}
                </div>
            )}
            <div className="section__content">
                {children}
            </div>
        </motion.section>
    )
}

// Page title section
interface PageHeaderProps {
    title: string
    subtitle?: string
    breadcrumb?: ReactNode
    actions?: ReactNode
    className?: string
}

export function PageHeader({ title, subtitle, breadcrumb, actions, className = '' }: PageHeaderProps) {
    return (
        <header className={`page-header ${className}`}>
            {breadcrumb && <div className="page-header__breadcrumb">{breadcrumb}</div>}
            <div className="page-header__content">
                <div className="page-header__text">
                    <motion.h1
                        className="page-header__title"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {title}
                    </motion.h1>
                    {subtitle && (
                        <motion.p
                            className="page-header__subtitle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            {subtitle}
                        </motion.p>
                    )}
                </div>
                {actions && (
                    <motion.div
                        className="page-header__actions"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {actions}
                    </motion.div>
                )}
            </div>
        </header>
    )
}

// Container wrapper
interface ContainerProps {
    children: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    className?: string
}

export function Container({ children, size = 'lg', className = '' }: ContainerProps) {
    return (
        <div className={`container container--${size} ${className}`}>
            {children}
        </div>
    )
}

export default Section
