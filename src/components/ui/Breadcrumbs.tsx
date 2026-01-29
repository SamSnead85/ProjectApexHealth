import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import './Breadcrumbs.css'

interface BreadcrumbItem {
    label: string
    href?: string
    icon?: React.ReactNode
    onClick?: () => void
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
    separator?: React.ReactNode
    showHome?: boolean
    onHomeClick?: () => void
}

export function Breadcrumbs({
    items,
    separator = <ChevronRight size={14} />,
    showHome = true,
    onHomeClick
}: BreadcrumbsProps) {
    const allItems = showHome
        ? [{ label: 'Home', icon: <Home size={14} />, onClick: onHomeClick }, ...items]
        : items

    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol className="breadcrumbs__list">
                {allItems.map((item, index) => {
                    const isLast = index === allItems.length - 1

                    return (
                        <li key={index} className="breadcrumbs__item">
                            {!isLast ? (
                                <>
                                    <button
                                        className="breadcrumbs__link"
                                        onClick={item.onClick}
                                        aria-current={undefined}
                                    >
                                        {item.icon && <span className="breadcrumbs__icon">{item.icon}</span>}
                                        <span>{item.label}</span>
                                    </button>
                                    <span className="breadcrumbs__separator" aria-hidden="true">
                                        {separator}
                                    </span>
                                </>
                            ) : (
                                <span className="breadcrumbs__current" aria-current="page">
                                    {item.icon && <span className="breadcrumbs__icon">{item.icon}</span>}
                                    <span>{item.label}</span>
                                </span>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}

export default Breadcrumbs
