import { ReactNode, useState, useRef, useEffect, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Menu, X, Bell, Search, Settings, User, LogOut, HelpCircle } from 'lucide-react'
import './MegaMenu.css'

interface MegaMenuColumn {
    title: string
    items: {
        label: string
        href?: string
        icon?: ReactNode
        description?: string
        badge?: string
        onClick?: () => void
    }[]
}

interface MegaMenuSection {
    id: string
    trigger: ReactNode
    columns: MegaMenuColumn[]
    featured?: ReactNode
    footer?: ReactNode
}

interface MegaMenuProps {
    sections: MegaMenuSection[]
    logo?: ReactNode
    userMenu?: ReactNode
    onSearch?: (query: string) => void
    className?: string
}

export function MegaMenu({
    sections,
    logo,
    userMenu,
    onSearch,
    className = ''
}: MegaMenuProps) {
    const [activeSection, setActiveSection] = useState<string | null>(null)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setActiveSection(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMouseEnter = (sectionId: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setActiveSection(sectionId)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setActiveSection(null), 150)
    }

    return (
        <nav ref={menuRef} className={`mega-menu ${className}`}>
            <div className="mega-menu__container">
                {/* Logo */}
                {logo && <div className="mega-menu__logo">{logo}</div>}

                {/* Mobile toggle */}
                <button
                    className="mega-menu__mobile-toggle"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                >
                    {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Desktop Navigation */}
                <div className="mega-menu__nav">
                    {sections.map(section => (
                        <div
                            key={section.id}
                            className={`mega-menu__trigger-wrapper ${activeSection === section.id ? 'mega-menu__trigger-wrapper--active' : ''}`}
                            onMouseEnter={() => handleMouseEnter(section.id)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button className="mega-menu__trigger">
                                {section.trigger}
                            </button>

                            <AnimatePresence>
                                {activeSection === section.id && (
                                    <motion.div
                                        className="mega-menu__dropdown"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.15 }}
                                        onMouseEnter={() => handleMouseEnter(section.id)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <div className="mega-menu__dropdown-content">
                                            {section.columns.map((column, idx) => (
                                                <div key={idx} className="mega-menu__column">
                                                    <h4 className="mega-menu__column-title">{column.title}</h4>
                                                    <ul className="mega-menu__list">
                                                        {column.items.map((item, itemIdx) => (
                                                            <li key={itemIdx}>
                                                                <a
                                                                    href={item.href || '#'}
                                                                    className="mega-menu__item"
                                                                    onClick={(e) => {
                                                                        if (item.onClick) {
                                                                            e.preventDefault()
                                                                            item.onClick()
                                                                        }
                                                                        setActiveSection(null)
                                                                    }}
                                                                >
                                                                    {item.icon && <span className="mega-menu__item-icon">{item.icon}</span>}
                                                                    <div className="mega-menu__item-content">
                                                                        <span className="mega-menu__item-label">
                                                                            {item.label}
                                                                            {item.badge && <span className="mega-menu__item-badge">{item.badge}</span>}
                                                                        </span>
                                                                        {item.description && (
                                                                            <span className="mega-menu__item-desc">{item.description}</span>
                                                                        )}
                                                                    </div>
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}

                                            {section.featured && (
                                                <div className="mega-menu__featured">
                                                    {section.featured}
                                                </div>
                                            )}
                                        </div>

                                        {section.footer && (
                                            <div className="mega-menu__dropdown-footer">
                                                {section.footer}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Right side actions */}
                <div className="mega-menu__actions">
                    {onSearch && (
                        <button className="mega-menu__action">
                            <Search size={18} />
                        </button>
                    )}
                    {userMenu || (
                        <button className="mega-menu__action">
                            <User size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        className="mega-menu__mobile"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {sections.map(section => (
                            <div key={section.id} className="mega-menu__mobile-section">
                                <button
                                    className="mega-menu__mobile-trigger"
                                    onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                                >
                                    {section.trigger}
                                    <ChevronRight size={16} className={activeSection === section.id ? 'rotate-90' : ''} />
                                </button>

                                <AnimatePresence>
                                    {activeSection === section.id && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            className="mega-menu__mobile-content"
                                        >
                                            {section.columns.map((column, idx) => (
                                                <div key={idx} className="mega-menu__mobile-column">
                                                    <h4>{column.title}</h4>
                                                    {column.items.map((item, itemIdx) => (
                                                        <a key={itemIdx} href={item.href || '#'} onClick={() => setIsMobileOpen(false)}>
                                                            {item.icon}
                                                            {item.label}
                                                        </a>
                                                    ))}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default MegaMenu
