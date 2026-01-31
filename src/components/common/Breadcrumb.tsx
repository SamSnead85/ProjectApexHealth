import { Fragment, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Home } from 'lucide-react'
import './Breadcrumb.css'

interface BreadcrumbItem {
    label: string
    href?: string
    icon?: ReactNode
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]
    onNavigate?: (href: string) => void
    showHome?: boolean
    className?: string
}

export function Breadcrumb({
    items,
    onNavigate,
    showHome = true,
    className = ''
}: BreadcrumbProps) {
    const handleClick = (href?: string) => {
        if (href && onNavigate) {
            onNavigate(href)
        }
    }

    const allItems = showHome
        ? [{ label: 'Home', href: '/', icon: <Home size={14} /> }, ...items]
        : items

    return (
        <nav className={`breadcrumb ${className}`} aria-label="Breadcrumb">
            <ol className="breadcrumb__list">
                {allItems.map((item, index) => {
                    const isLast = index === allItems.length - 1

                    return (
                        <Fragment key={index}>
                            <motion.li
                                className="breadcrumb__item"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                {item.href && !isLast ? (
                                    <button
                                        className="breadcrumb__link"
                                        onClick={() => handleClick(item.href)}
                                        type="button"
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </button>
                                ) : (
                                    <span className="breadcrumb__current" aria-current="page">
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </span>
                                )}
                            </motion.li>
                            {!isLast && (
                                <li className="breadcrumb__separator" aria-hidden="true">
                                    <ChevronRight size={14} />
                                </li>
                            )}
                        </Fragment>
                    )
                })}
            </ol>
        </nav>
    )
}

export default Breadcrumb
