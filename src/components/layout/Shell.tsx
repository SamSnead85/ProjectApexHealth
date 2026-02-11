import { ReactNode, useState, useEffect, useCallback } from 'react'
import { Search, Bell, User, ChevronDown, Shield, BarChart3, Building2, Users, Map, Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import { ThemeToggleCompact } from '../ThemeToggle'
import { CommandPalette } from '../common'
import { GuidedTour, ADMIN_TOUR_STEPS, MEMBER_TOUR_STEPS, BROKER_TOUR_STEPS, TourStep } from '../ui/GuidedTour'
import './Shell.css'

interface ShellProps {
    children: ReactNode
    activePortal: 'admin' | 'broker' | 'employer' | 'member'
    activePath: string
    onNavigate: (path: string) => void
    onSwitchPortal?: (portal: 'admin' | 'broker' | 'employer' | 'member') => void
    userName?: string
    userRole?: string
}

const portalConfig = {
    admin: { icon: Shield, label: 'Admin Console', color: '#0D9488' },
    broker: { icon: BarChart3, label: 'Broker Nexus', color: '#0891B2' },
    employer: { icon: Building2, label: 'Employer Hub', color: '#06B6D4' },
    member: { icon: Users, label: 'Member Portal', color: '#22D3EE' }
}

export function Shell({
    children,
    activePortal,
    activePath,
    onNavigate,
    onSwitchPortal,
    userName = 'John Smith',
    userRole = 'Administrator'
}: ShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [showCommandPalette, setShowCommandPalette] = useState(false)
    const [showTour, setShowTour] = useState(false)

    // Close mobile sidebar on window resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setMobileSidebarOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (mobileSidebarOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [mobileSidebarOpen])

    // Global ⌘K keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setShowCommandPalette(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleCommandPaletteNavigate = useCallback((path: string) => {
        onNavigate(path)
        setShowCommandPalette(false)
    }, [onNavigate])

    // Wrap onNavigate to close mobile sidebar on navigation
    const handleNavigateWithMobileClose = useCallback((path: string) => {
        onNavigate(path)
        setMobileSidebarOpen(false)
    }, [onNavigate])

    // Search items for quick navigation
    const searchableItems = [
        { label: 'Dashboard', path: '/admin', keywords: ['home', 'overview', 'main'] },
        { label: 'Workflow Builder', path: '/admin/workflows', keywords: ['automation', 'flows', 'builder'] },
        { label: 'Claims Processing', path: '/admin/claims', keywords: ['process', 'submit', 'adjudication'] },
        { label: 'Eligibility', path: '/admin/eligibility', keywords: ['coverage', 'check', 'verify'] },
        { label: 'Prior Authorization', path: '/admin/prior-auth', keywords: ['auth', 'approval', 'preauth'] },
        { label: 'Appeals & Grievances', path: '/admin/appeals', keywords: ['appeal', 'grievance', 'complaint'] },
        { label: 'Care Coordination', path: '/admin/care-coordination', keywords: ['care', 'coordinate', 'manage'] },
        { label: 'Provider Directory', path: '/admin/providers', keywords: ['provider', 'doctor', 'network'] },
        { label: 'Member Outreach', path: '/admin/outreach', keywords: ['member', 'outreach', 'communication'] },
        { label: 'Reports', path: '/admin/reports', keywords: ['report', 'analytics', 'insights'] },
        { label: 'Settings', path: '/admin/settings', keywords: ['config', 'configuration', 'preferences'] },
    ]

    // Filter search results based on query
    const searchResults = searchQuery.trim()
        ? searchableItems.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
        ).slice(0, 6)
        : []

    // Handle search input
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
        setShowSearchResults(e.target.value.trim().length > 0)
    }

    // Handle search result selection
    const handleSearchSelect = (path: string) => {
        onNavigate(path)
        setSearchQuery('')
        setShowSearchResults(false)
    }

    // Handle keyboard shortcut for search
    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchResults.length > 0) {
            handleSearchSelect(searchResults[0].path)
        }
        if (e.key === 'Escape') {
            setShowSearchResults(false)
            setSearchQuery('')
        }
    }

    return (
        <div className={`shell ${sidebarCollapsed ? 'shell--sidebar-collapsed' : ''}`}>
            {/* Mobile Sidebar Overlay */}
            <div
                className={`sidebar-overlay ${mobileSidebarOpen ? 'sidebar-overlay--visible' : ''}`}
                onClick={() => setMobileSidebarOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <Sidebar
                activePortal={activePortal}
                activePath={activePath}
                onNavigate={handleNavigateWithMobileClose}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={mobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="shell__main">
                {/* Top Bar */}
                <header className="shell__topbar">
                    <div className="shell__topbar-left">
                        {/* Mobile Hamburger */}
                        <button
                            className="sidebar-hamburger"
                            onClick={() => setMobileSidebarOpen(true)}
                            aria-label="Open navigation menu"
                        >
                            <Menu size={20} />
                        </button>

                        {/* Portal Switcher (Demo Mode) */}
                        {onSwitchPortal && (
                            <div className="portal-switcher">
                                {(Object.keys(portalConfig) as Array<keyof typeof portalConfig>).map((key) => {
                                    const config = portalConfig[key]
                                    const Icon = config.icon
                                    return (
                                        <button
                                            key={key}
                                            className={`portal-switcher__btn ${key === activePortal ? 'portal-switcher__btn--active' : ''}`}
                                            onClick={() => onSwitchPortal(key)}
                                            title={config.label}
                                        >
                                            <Icon size={14} />
                                            <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {/* Global Search */}
                        <div className="shell__search">
                            <Search size={18} className="shell__search-icon" />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="shell__search-input"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleSearchKeyDown}
                                onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                            />
                            <span className="shell__search-shortcut">⌘K</span>

                            {/* Search Results Dropdown */}
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="shell__search-results">
                                    {searchResults.map((item) => (
                                        <button
                                            key={item.path}
                                            className="shell__search-result"
                                            onClick={() => handleSearchSelect(item.path)}
                                        >
                                            <span>{item.label}</span>
                                            <span className="shell__search-result-path">{item.path}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {showSearchResults && searchQuery.trim() && searchResults.length === 0 && (
                                <div className="shell__search-results">
                                    <div className="shell__search-no-results">
                                        No results found for "{searchQuery}"
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="shell__topbar-right">
                        {/* Theme Toggle */}
                        <ThemeToggleCompact />

                        {/* Start Tour Button */}
                        <button
                            className="shell__topbar-btn shell__tour-btn"
                            onClick={() => setShowTour(true)}
                            title="Start Guided Tour"
                        >
                            <Map size={18} />
                        </button>

                        {/* Notifications */}
                        <button
                            className="shell__topbar-btn"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={20} />
                            <span className="shell__notification-dot" />
                        </button>

                        {/* User Menu */}
                        <button
                            className="shell__user-trigger"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="shell__user-avatar">
                                <User size={18} />
                            </div>
                            <div className="shell__user-info">
                                <span className="shell__user-name">{userName}</span>
                                <span className="shell__user-role">{userRole}</span>
                            </div>
                            <ChevronDown size={16} className="shell__user-chevron" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="shell__content">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="shell__page"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            {/* Command Palette (⌘K) */}
            <CommandPalette
                isOpen={showCommandPalette}
                onClose={() => setShowCommandPalette(false)}
                groups={[
                    {
                        label: 'Navigation',
                        items: searchableItems.map(item => ({
                            id: item.path,
                            label: item.label,
                            description: item.path,
                            keywords: item.keywords,
                            action: () => handleCommandPaletteNavigate(item.path)
                        }))
                    }
                ]}
            />

            {/* Guided Tour */}
            <GuidedTour
                isOpen={showTour}
                onClose={() => setShowTour(false)}
                tourName={`${activePortal.charAt(0).toUpperCase() + activePortal.slice(1)} Tour`}
                steps={
                    activePortal === 'admin' ? ADMIN_TOUR_STEPS :
                        activePortal === 'member' ? MEMBER_TOUR_STEPS :
                            activePortal === 'broker' ? BROKER_TOUR_STEPS :
                                ADMIN_TOUR_STEPS
                }
                onComplete={() => void 0}
            />
        </div>
    )
}

export default Shell
