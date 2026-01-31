import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import './SideNav.css'

interface NavItem {
    id: string
    label: string
    icon?: ReactNode
    href?: string
    badge?: string | number
    children?: Omit<NavItem, 'children'>[]
    isNew?: boolean
}

interface SideNavProps {
    items: NavItem[]
    header?: ReactNode
    footer?: ReactNode
    collapsed?: boolean
    onCollapsedChange?: (collapsed: boolean) => void
    className?: string
}

export function SideNav({
    items,
    header,
    footer,
    collapsed = false,
    onCollapsedChange,
    className = ''
}: SideNavProps) {
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const location = useLocation()

    const toggleExpanded = (id: string) => {
        setExpandedItems(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        )
    }

    const isItemActive = (item: NavItem) => {
        if (item.href && location.pathname === item.href) return true
        if (item.children?.some(child => child.href === location.pathname)) return true
        return false
    }

    return (
        <nav className={`side-nav ${collapsed ? 'side-nav--collapsed' : ''} ${className}`}>
            {header && (
                <div className="side-nav__header">
                    {header}
                </div>
            )}

            <div className="side-nav__content">
                {items.map(item => (
                    <div key={item.id} className="side-nav__item-wrapper">
                        {item.href ? (
                            <NavLink
                                to={item.href}
                                className={({ isActive }) =>
                                    `side-nav__item ${isActive ? 'side-nav__item--active' : ''}`
                                }
                            >
                                {item.icon && <span className="side-nav__item-icon">{item.icon}</span>}
                                {!collapsed && (
                                    <>
                                        <span className="side-nav__item-label">{item.label}</span>
                                        {item.badge && <span className="side-nav__item-badge">{item.badge}</span>}
                                        {item.isNew && <span className="side-nav__item-new">New</span>}
                                    </>
                                )}
                            </NavLink>
                        ) : (
                            <button
                                className={`side-nav__item ${isItemActive(item) ? 'side-nav__item--active' : ''}`}
                                onClick={() => toggleExpanded(item.id)}
                            >
                                {item.icon && <span className="side-nav__item-icon">{item.icon}</span>}
                                {!collapsed && (
                                    <>
                                        <span className="side-nav__item-label">{item.label}</span>
                                        <ChevronDown
                                            size={14}
                                            className={`side-nav__item-chevron ${expandedItems.includes(item.id) ? 'side-nav__item-chevron--expanded' : ''}`}
                                        />
                                    </>
                                )}
                            </button>
                        )}

                        {item.children && !collapsed && (
                            <AnimatePresence>
                                {expandedItems.includes(item.id) && (
                                    <motion.div
                                        className="side-nav__children"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                    >
                                        {item.children.map(child => (
                                            <NavLink
                                                key={child.id}
                                                to={child.href || '#'}
                                                className={({ isActive }) =>
                                                    `side-nav__child ${isActive ? 'side-nav__child--active' : ''}`
                                                }
                                            >
                                                {child.icon && <span className="side-nav__child-icon">{child.icon}</span>}
                                                <span className="side-nav__child-label">{child.label}</span>
                                                {child.badge && <span className="side-nav__child-badge">{child.badge}</span>}
                                            </NavLink>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                ))}
            </div>

            {onCollapsedChange && (
                <button
                    className="side-nav__toggle"
                    onClick={() => onCollapsedChange(!collapsed)}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            )}

            {footer && !collapsed && (
                <div className="side-nav__footer">
                    {footer}
                </div>
            )}
        </nav>
    )
}

// Mobile bottom navigation
interface BottomNavItem {
    id: string
    label: string
    icon: ReactNode
    href: string
    badge?: number
}

interface BottomNavProps {
    items: BottomNavItem[]
    className?: string
}

export function BottomNav({ items, className = '' }: BottomNavProps) {
    return (
        <nav className={`bottom-nav ${className}`}>
            {items.map(item => (
                <NavLink
                    key={item.id}
                    to={item.href}
                    className={({ isActive }) =>
                        `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
                    }
                >
                    <span className="bottom-nav__icon">
                        {item.icon}
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="bottom-nav__badge">{item.badge}</span>
                        )}
                    </span>
                    <span className="bottom-nav__label">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    )
}

export default SideNav
