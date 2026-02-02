import { ReactNode, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, ChevronRight, ArrowRight, X, Clock, Star,
    Sparkles, Command, CornerDownLeft, Hash, ArrowUp
} from 'lucide-react'
import './PremiumNav.css'

// ============================================
// SPOTLIGHT SEARCH
// ============================================
interface SearchItem {
    id: string
    title: string
    subtitle?: string
    category: string
    icon?: ReactNode
    path?: string
    action?: () => void
    keywords?: string[]
}

interface SpotlightSearchProps {
    isOpen: boolean
    onClose: () => void
    items: SearchItem[]
    onSelect: (item: SearchItem) => void
    recentSearches?: string[]
    placeholder?: string
}

export function SpotlightSearch({
    isOpen,
    onClose,
    items,
    onSelect,
    recentSearches = [],
    placeholder = 'Search anything...'
}: SpotlightSearchProps) {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    const filteredItems = query.trim()
        ? items.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
            item.keywords?.some(k => k.toLowerCase().includes(query.toLowerCase()))
        )
        : []

    // Group by category
    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)
        return acc
    }, {} as Record<string, SearchItem[]>)

    const flatItems = Object.values(groupedItems).flat()

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault()
                    setSelectedIndex(prev => Math.min(prev + 1, flatItems.length - 1))
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    setSelectedIndex(prev => Math.max(prev - 1, 0))
                    break
                case 'Enter':
                    if (flatItems[selectedIndex]) {
                        onSelect(flatItems[selectedIndex])
                        onClose()
                    }
                    break
                case 'Escape':
                    onClose()
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, flatItems, selectedIndex, onSelect, onClose])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="spotlight-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="spotlight-container"
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="spotlight-input-wrapper">
                        <Search size={20} className="spotlight-search-icon" />
                        <input
                            ref={inputRef}
                            type="text"
                            className="spotlight-input"
                            placeholder={placeholder}
                            value={query}
                            onChange={e => {
                                setQuery(e.target.value)
                                setSelectedIndex(0)
                            }}
                        />
                        <div className="spotlight-shortcuts">
                            <kbd className="spotlight-kbd">⌘</kbd>
                            <kbd className="spotlight-kbd">K</kbd>
                        </div>
                    </div>

                    <div className="spotlight-results">
                        {query.trim() === '' ? (
                            <>
                                {recentSearches.length > 0 && (
                                    <div className="spotlight-section">
                                        <div className="spotlight-section-title">
                                            <Clock size={14} /> Recent
                                        </div>
                                        {recentSearches.slice(0, 5).map((search, i) => (
                                            <button
                                                key={i}
                                                className="spotlight-item"
                                                onClick={() => setQuery(search)}
                                            >
                                                <span className="spotlight-item-title">{search}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="spotlight-quick-actions">
                                    <span className="spotlight-hint">
                                        <Sparkles size={14} /> Type to search pages, actions, and commands
                                    </span>
                                </div>
                            </>
                        ) : flatItems.length === 0 ? (
                            <div className="spotlight-empty">
                                No results for "{query}"
                            </div>
                        ) : (
                            Object.entries(groupedItems).map(([category, categoryItems]) => (
                                <div key={category} className="spotlight-section">
                                    <div className="spotlight-section-title">{category}</div>
                                    {categoryItems.map((item, i) => {
                                        const globalIndex = flatItems.indexOf(item)
                                        return (
                                            <button
                                                key={item.id}
                                                className={`spotlight-item ${globalIndex === selectedIndex ? 'spotlight-item--selected' : ''}`}
                                                onClick={() => {
                                                    onSelect(item)
                                                    onClose()
                                                }}
                                            >
                                                {item.icon && <span className="spotlight-item-icon">{item.icon}</span>}
                                                <div className="spotlight-item-content">
                                                    <span className="spotlight-item-title">{item.title}</span>
                                                    {item.subtitle && (
                                                        <span className="spotlight-item-subtitle">{item.subtitle}</span>
                                                    )}
                                                </div>
                                                <ChevronRight size={14} className="spotlight-item-arrow" />
                                            </button>
                                        )
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="spotlight-footer">
                        <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                        <span><kbd>↵</kbd> Select</span>
                        <span><kbd>Esc</kbd> Close</span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

// ============================================
// BREADCRUMB TRAIL (Enhanced)
// ============================================
interface BreadcrumbItem {
    label: string
    path?: string
    icon?: ReactNode
}

interface BreadcrumbTrailProps {
    items: BreadcrumbItem[]
    onNavigate?: (path: string) => void
    showHome?: boolean
}

export function BreadcrumbTrail({ items, onNavigate, showHome = true }: BreadcrumbTrailProps) {
    return (
        <nav className="breadcrumb-trail" aria-label="Breadcrumb">
            {showHome && (
                <>
                    <button
                        className="breadcrumb-item breadcrumb-home"
                        onClick={() => onNavigate?.('/')}
                    >
                        Home
                    </button>
                    <ChevronRight size={14} className="breadcrumb-separator" />
                </>
            )}
            {items.map((item, index) => (
                <motion.span
                    key={index}
                    className="breadcrumb-segment"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    {index > 0 && <ChevronRight size={14} className="breadcrumb-separator" />}
                    {item.path && index < items.length - 1 ? (
                        <button
                            className="breadcrumb-item"
                            onClick={() => onNavigate?.(item.path!)}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ) : (
                        <span className="breadcrumb-item breadcrumb-current">
                            {item.icon}
                            {item.label}
                        </span>
                    )}
                </motion.span>
            ))}
        </nav>
    )
}

// ============================================
// SECTION TABS
// ============================================
interface Tab {
    id: string
    label: string
    icon?: ReactNode
    badge?: string | number
    disabled?: boolean
}

interface SectionTabsProps {
    tabs: Tab[]
    activeTab: string
    onTabChange: (tabId: string) => void
    variant?: 'default' | 'pills' | 'underline'
}

export function SectionTabs({ tabs, activeTab, onTabChange, variant = 'default' }: SectionTabsProps) {
    return (
        <div className={`section-tabs section-tabs--${variant}`}>
            {tabs.map(tab => (
                <motion.button
                    key={tab.id}
                    className={`section-tab ${tab.id === activeTab ? 'section-tab--active' : ''} ${tab.disabled ? 'section-tab--disabled' : ''}`}
                    onClick={() => !tab.disabled && onTabChange(tab.id)}
                    whileHover={!tab.disabled ? { scale: 1.02 } : undefined}
                    whileTap={!tab.disabled ? { scale: 0.98 } : undefined}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.badge && <span className="section-tab__badge">{tab.badge}</span>}
                </motion.button>
            ))}
        </div>
    )
}

// ============================================
// SCROLL TO TOP
// ============================================
export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 300)
        }
        window.addEventListener('scroll', toggleVisibility)
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    className="scroll-to-top"
                    onClick={scrollToTop}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <ArrowUp size={20} />
                </motion.button>
            )}
        </AnimatePresence>
    )
}

// ============================================
// STEP INDICATOR
// ============================================
interface Step {
    id: string
    label: string
    description?: string
}

interface StepIndicatorProps {
    steps: Step[]
    currentStep: number
    variant?: 'horizontal' | 'vertical'
}

export function StepIndicator({ steps, currentStep, variant = 'horizontal' }: StepIndicatorProps) {
    return (
        <div className={`step-indicator step-indicator--${variant}`}>
            {steps.map((step, index) => (
                <div
                    key={step.id}
                    className={`step-indicator__item ${index < currentStep ? 'step-indicator__item--completed' :
                            index === currentStep ? 'step-indicator__item--current' :
                                'step-indicator__item--pending'
                        }`}
                >
                    <div className="step-indicator__marker">
                        {index < currentStep ? (
                            <motion.svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                            >
                                <motion.path d="M5 13l4 4L19 7" />
                            </motion.svg>
                        ) : (
                            <span>{index + 1}</span>
                        )}
                    </div>
                    {index < steps.length - 1 && <div className="step-indicator__connector" />}
                    <div className="step-indicator__content">
                        <span className="step-indicator__label">{step.label}</span>
                        {step.description && (
                            <span className="step-indicator__description">{step.description}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default {
    SpotlightSearch,
    BreadcrumbTrail,
    SectionTabs,
    ScrollToTop,
    StepIndicator
}
