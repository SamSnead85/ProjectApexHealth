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
    Briefcase,
    FileText,
    CreditCard,
    Shield,
    LogOut
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
}

const portalNavigation: Record<string, NavGroup[]> = {
    admin: [
        {
            title: 'Core',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
                { id: 'workflows', label: 'Workflow Builder', icon: <GitBranch size={20} />, path: '/admin/workflows' },
                { id: 'insights', label: 'Analytics', icon: <BarChart3 size={20} />, path: '/admin/insights' },
            ]
        },
        {
            title: 'Operations',
            items: [
                { id: 'claims', label: 'Claims', icon: <FileText size={20} />, path: '/admin/claims', badge: '147' },
                { id: 'priorauth', label: 'Prior Auth', icon: <FileSearch size={20} />, path: '/admin/prior-auth', badge: '23' },
                { id: 'eligibility', label: 'Eligibility', icon: <Shield size={20} />, path: '/admin/eligibility' },
                { id: 'payments', label: 'Payments', icon: <CreditCard size={20} />, path: '/admin/payments' },
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
            title: 'System',
            items: [
                { id: 'audit', label: 'Audit Trail', icon: <FileSearch size={20} />, path: '/admin/audit' },
                { id: 'compliance', label: 'Compliance', icon: <Shield size={20} />, path: '/admin/compliance' },
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
            ]
        },
        {
            title: 'Care',
            items: [
                { id: 'findcare', label: 'Find Care', icon: <Heart size={20} />, path: '/member/providers' },
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
    onToggleCollapse
}: SidebarProps) {
    const navigation = portalNavigation[activePortal] || []
    const portalInfo = portalLabels[activePortal]

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
            className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
            initial={false}
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
            {/* Portal Header */}
            <div className="sidebar__header">
                <div className="sidebar__brand">
                    <div
                        className="sidebar__brand-icon"
                        style={{ background: portalInfo.color }}
                    >
                        <span>A</span>
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
                                <span className="sidebar__brand-name">Project Apex</span>
                                <span className="sidebar__portal-name" style={{ color: portalInfo.color }}>
                                    {portalInfo.label}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

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
                {navigation.map((group) => (
                    <div key={group.title} className="sidebar__group" role="group" aria-label={group.title}>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    className="sidebar__group-title"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {group.title}
                                </motion.span>
                            )}
                        </AnimatePresence>

                        <ul className="sidebar__list" role="list">
                            {group.items.map((item) => {
                                const isActive = activePath === item.path
                                const itemIndex = flatItems.findIndex(i => i.id === item.id)
                                const isFocused = focusedIndex === itemIndex
                                return (
                                    <li key={item.id} role="listitem">
                                        <button
                                            className={`sidebar__item ${isActive ? 'sidebar__item--active' : ''} ${isFocused ? 'sidebar__item--focused' : ''}`}
                                            onClick={() => onNavigate(item.path)}
                                            onFocus={() => setFocusedIndex(itemIndex)}
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
                            })}
                        </ul>
                    </div>
                ))}
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
