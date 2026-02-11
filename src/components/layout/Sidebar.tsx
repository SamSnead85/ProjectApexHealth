import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    GitBranch,
    FileSearch,
    BarChart3,
    Users,
    Building2,
    Heart,
    Settings,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Briefcase,
    FileText,
    CreditCard,
    Shield,
    LogOut,
    Activity,
    Brain,
    Radar,
    Landmark,
    Scale,
    Building,
    Target,
    Database,
    Plug,
    Map,
    Sparkles,
    MessageCircle,
    Headphones,
    Phone,
    PhoneCall,
    MonitorSpeaker,
    Globe,
    Blocks,
    AlertTriangle,
    Archive,
    Workflow,
    ShieldCheck,
    X
} from 'lucide-react'
import './Sidebar.css'

interface NavItem {
    id: string
    label: string
    icon: React.ReactNode
    path: string
    badge?: string
}

interface NavGroup {
    title: string
    items: NavItem[]
}

interface SidebarProps {
    activePortal: 'admin' | 'broker' | 'employer' | 'member'
    activePath: string
    onNavigate: (path: string) => void
    collapsed?: boolean
    onToggleCollapse?: () => void
    mobileOpen?: boolean
    onMobileClose?: () => void
}

const portalNavigation: Record<string, NavGroup[]> = {
    admin: [
        {
            title: 'Core',
            items: [
                { id: 'command-center', label: 'Command Center', icon: <LayoutDashboard size={20} />, path: '/command-center', badge: 'New' },
                { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
                { id: 'sir', label: 'Performance Intelligence', icon: <Activity size={20} />, path: '/admin/sir' },
                { id: 'workflows', label: 'Workflow Builder', icon: <GitBranch size={20} />, path: '/admin/workflows' },
                { id: 'insights', label: 'Analytics', icon: <BarChart3 size={20} />, path: '/admin/insights' },
            ]
        },

        {
            title: 'Intelligence',
            items: [
                { id: 'documents', label: 'Document AI', icon: <Brain size={20} />, path: '/admin/document-intelligence' },
                { id: 'member360', label: 'Member 360°', icon: <Users size={20} />, path: '/admin/member-360' },
                { id: 'regulatory', label: 'Regulatory Hub', icon: <Landmark size={20} />, path: '/admin/regulatory-hub' },
                { id: 'claims-prediction', label: 'Claims Prediction', icon: <Activity size={20} />, path: '/admin/claims-prediction' },
                { id: 'fraud-detection', label: 'Fraud Detection', icon: <Shield size={20} />, path: '/admin/fraud-detection' },
                { id: 'benefit-calc', label: 'Benefit Calculator', icon: <CreditCard size={20} />, path: '/admin/benefit-calculator' },
                { id: 'star-ratings', label: 'STAR Ratings', icon: <Target size={20} />, path: '/admin/star-ratings', badge: 'New' },
                { id: 'denial-mgmt', label: 'Denial Management', icon: <AlertTriangle size={20} />, path: '/admin/denial-management', badge: 'New' },
                { id: 'sdoh', label: 'Social Determinants', icon: <Map size={20} />, path: '/admin/social-determinants', badge: 'New' },
            ]
        },
        {
            title: 'Compliance & Data',
            items: [
                { id: 'compliance-center', label: 'Compliance Center', icon: <Shield size={20} />, path: '/admin/compliance-center' },
                { id: 'data-hub', label: 'Integration Hub', icon: <Database size={20} />, path: '/admin/data-integration' },
            ]
        },
        {
            title: 'TPA Suite',
            items: [
                { id: 'stoploss', label: 'Stop-Loss', icon: <Target size={20} />, path: '/admin/stop-loss' },
                { id: 'carrier', label: 'Carrier Portal', icon: <Building size={20} />, path: '/admin/carrier-portal' },
                { id: 'fiduciary', label: 'Fiduciary', icon: <Scale size={20} />, path: '/admin/fiduciary' },
            ]
        },
        {
            title: 'Operations',
            items: [
                { id: 'claims', label: 'Claims', icon: <FileText size={20} />, path: '/admin/claims', badge: '147' },
                { id: 'priorauth', label: 'Prior Auth', icon: <FileSearch size={20} />, path: '/admin/prior-auth', badge: '23' },
                { id: 'eligibility', label: 'Eligibility', icon: <Shield size={20} />, path: '/admin/eligibility' },
                { id: 'payments', label: 'Payments', icon: <CreditCard size={20} />, path: '/admin/payments' },
                { id: 'agent-assist', label: 'Agent Assist', icon: <Headphones size={20} />, path: '/agent-assist', badge: 'AI' },
            ]
        },
        {
            title: 'Network',
            items: [
                { id: 'providers', label: 'Providers', icon: <Building2 size={20} />, path: '/admin/providers' },
                { id: 'network', label: 'Network Mgmt', icon: <Building2 size={20} />, path: '/admin/network' },
                { id: 'groups', label: 'Groups', icon: <Users size={20} />, path: '/admin/groups' },
            ]
        },
        {
            title: 'Voice Center',
            items: [
                { id: 'voice-builder', label: 'Voice Agent Builder', icon: <Phone size={20} />, path: '/admin/voice-agent-builder', badge: 'AI' },
                { id: 'voice-monitor', label: 'Call Monitor', icon: <PhoneCall size={20} />, path: '/admin/voice-monitor' },
                { id: 'call-center', label: 'Call Center', icon: <Headphones size={20} />, path: '/admin/call-center' },
            ]
        },
        {
            title: 'Interoperability',
            items: [
                { id: 'fhir', label: 'FHIR Explorer', icon: <Globe size={20} />, path: '/admin/fhir-explorer' },
                { id: 'edi-manager', label: 'EDI Manager', icon: <Database size={20} />, path: '/admin/edi-manager' },
                { id: 'integrations', label: 'Integrations', icon: <Plug size={20} />, path: '/admin/integrations' },
            ]
        },
        {
            title: 'System',
            items: [
                { id: 'audit', label: 'Audit Trail', icon: <FileSearch size={20} />, path: '/admin/audit' },
                { id: 'compliance', label: 'Compliance', icon: <ShieldCheck size={20} />, path: '/admin/compliance' },
                { id: 'breach-response', label: 'Breach Response', icon: <AlertTriangle size={20} />, path: '/admin/breach-response' },
                { id: 'data-retention', label: 'Data Retention', icon: <Archive size={20} />, path: '/admin/data-retention' },
                { id: 'modules', label: 'Module Licensing', icon: <Blocks size={20} />, path: '/admin/module-licensing' },
                { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
            ]
        }
    ],
    broker: [
        {
            title: 'Sales',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/broker' },
                { id: 'clients', label: 'Book of Business', icon: <Briefcase size={20} />, path: '/broker/clients', badge: '24' },
                { id: 'quotes', label: 'Quoting', icon: <FileText size={20} />, path: '/broker/quotes' },
            ]
        },
        {
            title: 'Finance',
            items: [
                { id: 'commissions', label: 'Commissions', icon: <CreditCard size={20} />, path: '/broker/commissions' },
                { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} />, path: '/broker/reports' },
            ]
        }
    ],
    employer: [
        {
            title: 'Benefits',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/employer' },
                { id: 'enrollment', label: 'Enrollment', icon: <Users size={20} />, path: '/employer/enrollment' },
                { id: 'census', label: 'Census', icon: <Building2 size={20} />, path: '/employer/census' },
            ]
        },
        {
            title: 'Admin',
            items: [
                { id: 'billing', label: 'Billing', icon: <CreditCard size={20} />, path: '/employer/billing' },
                { id: 'compliance', label: 'Compliance', icon: <Shield size={20} />, path: '/employer/compliance' },
            ]
        }
    ],
    member: [
        {
            title: 'My Benefits',
            items: [
                { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={20} />, path: '/member' },
                { id: 'idcard', label: 'ID Card', icon: <CreditCard size={20} />, path: '/member/id-card' },
                { id: 'coverage', label: 'Coverage', icon: <Shield size={20} />, path: '/member/coverage' },
                { id: 'claims', label: 'Claims', icon: <FileText size={20} />, path: '/member/claims' },
                { id: 'oon-claims', label: 'Submit OON Claim', icon: <FileText size={20} />, path: '/oon-claims' },
            ]
        },
        {
            title: 'Care',
            items: [
                { id: 'findcare', label: 'Find Care', icon: <Heart size={20} />, path: '/member/providers' },
                { id: 'care-journey', label: 'Care Journey', icon: <Map size={20} />, path: '/care-journey' },
                { id: 'concierge', label: 'AI Concierge', icon: <Sparkles size={20} />, path: '/health-concierge', badge: 'AI' },
                { id: 'costestimator', label: 'Cost Estimator', icon: <CreditCard size={20} />, path: '/member/cost-estimator' },
                { id: 'pharmacy', label: 'Pharmacy', icon: <Heart size={20} />, path: '/member/pharmacy' },
            ]
        },
        {
            title: 'Account',
            items: [
                { id: 'hsa', label: 'HSA/FSA', icon: <CreditCard size={20} />, path: '/member/hsa' },
                { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/member/settings' },
            ]
        }
    ]
}

// ─── Memoized Nav Item to prevent re-renders on parent state changes ─────

interface SidebarNavItemProps {
    item: NavItem
    isActive: boolean
    isFocused: boolean
    collapsed: boolean
    itemIndex: number
    onNavigate: (path: string) => void
    onFocus: (index: number) => void
}

const SidebarNavItem = React.memo(function SidebarNavItem({
    item, isActive, isFocused, collapsed, itemIndex, onNavigate, onFocus,
}: SidebarNavItemProps) {
    return (
        <li role="listitem">
            <button
                className={`sidebar__item ${isActive ? 'sidebar__item--active' : ''} ${isFocused ? 'sidebar__item--focused' : ''}`}
                onClick={() => onNavigate(item.path)}
                onFocus={() => onFocus(itemIndex)}
                title={collapsed ? item.label : undefined}
                tabIndex={0}
                aria-current={isActive ? 'page' : undefined}
            >
                <span className="sidebar__item-icon">{item.icon}</span>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span
                            className="sidebar__item-label"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            {item.label}
                        </motion.span>
                    )}
                </AnimatePresence>
                {item.badge && !collapsed && (
                    <span className="sidebar__item-badge">{item.badge}</span>
                )}
            </button>
        </li>
    )
})

const portalLabels: Record<string, { label: string; color: string }> = {
    admin: { label: 'Admin Console', color: '#0D9488' },
    broker: { label: 'Broker Nexus', color: '#0891B2' },
    employer: { label: 'Employer Hub', color: '#06B6D4' },
    member: { label: 'Member Portal', color: '#22D3EE' }
}

export function Sidebar({
    activePortal,
    activePath,
    onNavigate,
    collapsed = false,
    onToggleCollapse,
    mobileOpen = false,
    onMobileClose
}: SidebarProps) {
    const navigation = portalNavigation[activePortal] || []
    const portalInfo = portalLabels[activePortal]

    // Track which groups are expanded (start with first two expanded)
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
        const initialExpanded = new Set<string>()
        // Default expand first 2 groups
        navigation.slice(0, 2).forEach(g => initialExpanded.add(g.title))
        return initialExpanded
    })

    const toggleGroup = (title: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev)
            if (next.has(title)) {
                next.delete(title)
            } else {
                next.add(title)
            }
            return next
        })
    }

    // Flatten all nav items for keyboard navigation
    const flatItems = useMemo(() => {
        return navigation.flatMap(group => group.items)
    }, [navigation])

    const [focusedIndex, setFocusedIndex] = useState(-1)
    const navRef = useRef<HTMLElement>(null)

    // Keyboard navigation handler
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setFocusedIndex(prev =>
                    prev < flatItems.length - 1 ? prev + 1 : 0
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setFocusedIndex(prev =>
                    prev > 0 ? prev - 1 : flatItems.length - 1
                )
                break
            case 'Enter':
            case ' ':
                e.preventDefault()
                if (focusedIndex >= 0 && flatItems[focusedIndex]) {
                    onNavigate(flatItems[focusedIndex].path)
                }
                break
            case 'Home':
                e.preventDefault()
                setFocusedIndex(0)
                break
            case 'End':
                e.preventDefault()
                setFocusedIndex(flatItems.length - 1)
                break
        }
    }, [flatItems, focusedIndex, onNavigate])

    // Focus the item when focusedIndex changes
    useEffect(() => {
        if (focusedIndex >= 0 && navRef.current) {
            const buttons = navRef.current.querySelectorAll('.sidebar__item:not(.sidebar__item--logout)')
            const button = buttons[focusedIndex] as HTMLButtonElement
            button?.focus()
        }
    }, [focusedIndex])

    return (
        <motion.aside
            className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}
            initial={false}
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
            {/* Portal Header */}
            <div className="sidebar__header">
                <div className="sidebar__brand">
                    <div
                        className="sidebar__brand-icon"
                        style={{ background: `linear-gradient(135deg, ${portalInfo.color}, #06B6D4)` }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                            <path d="M12 4L20 18H4L12 4Z" fill="none" stroke="#030712" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M10 13H14M12 11V15" stroke="#030712" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                className="sidebar__brand-text"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                <span className="sidebar__brand-name">APEX</span>
                                <span className="sidebar__portal-name" style={{ color: portalInfo.color }}>
                                    {portalInfo.label}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Mobile close button */}
                {onMobileClose && (
                    <button
                        className="sidebar__mobile-close"
                        onClick={onMobileClose}
                        aria-label="Close navigation menu"
                    >
                        <X size={18} />
                    </button>
                )}

                {onToggleCollapse && (
                    <button
                        className="sidebar__toggle"
                        onClick={onToggleCollapse}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav
                className="sidebar__nav"
                ref={navRef}
                onKeyDown={handleKeyDown}
                role="navigation"
                aria-label="Main navigation"
            >
                {navigation.map((group) => {
                    const isExpanded = expandedGroups.has(group.title)
                    const hasActiveItem = group.items.some(item => activePath === item.path)

                    return (
                        <div key={group.title} className="sidebar__group" role="group" aria-label={group.title}>
                            {/* Collapsible Header */}
                            {!collapsed && (
                                <button
                                    className={`sidebar__group-header ${isExpanded ? 'sidebar__group-header--expanded' : ''} ${hasActiveItem ? 'sidebar__group-header--active' : ''}`}
                                    onClick={() => toggleGroup(group.title)}
                                    aria-expanded={isExpanded}
                                >
                                    <span className="sidebar__group-title">{group.title}</span>
                                    <motion.span
                                        className="sidebar__group-chevron"
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown size={16} />
                                    </motion.span>
                                </button>
                            )}

                            {/* Collapsible Items */}
                            <AnimatePresence initial={false}>
                                {(isExpanded || collapsed) && (
                                    <motion.ul
                                        className="sidebar__list"
                                        role="list"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        {group.items.map((item) => {
                                            const itemIndex = flatItems.findIndex(i => i.id === item.id)
                                            return (
                                                <SidebarNavItem
                                                    key={item.id}
                                                    item={item}
                                                    isActive={activePath === item.path}
                                                    isFocused={focusedIndex === itemIndex}
                                                    collapsed={collapsed}
                                                    itemIndex={itemIndex}
                                                    onNavigate={onNavigate}
                                                    onFocus={setFocusedIndex}
                                                />
                                            )
                                        })}
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="sidebar__footer">
                <button className="sidebar__item sidebar__item--logout">
                    <span className="sidebar__item-icon"><LogOut size={20} /></span>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                className="sidebar__item-label"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                Sign Out
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    )
}

export default Sidebar
