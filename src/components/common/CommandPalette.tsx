import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Command,
    LayoutDashboard,
    GitBranch,
    FileText,
    Shield,
    Users,
    Building2,
    BarChart3,
    Settings,
    CreditCard,
    Heart,
    X,
    ArrowRight,
    Zap
} from 'lucide-react'
import './CommandPalette.css'

interface CommandItem {
    id: string
    label: string
    description?: string
    icon: React.ReactNode
    path?: string
    action?: () => void
    category: 'navigation' | 'action' | 'workflow'
    keywords: string[]
}

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
    onNavigate: (path: string) => void
}

const NAVIGATION_COMMANDS: CommandItem[] = [
    // Admin Pages
    { id: 'dashboard', label: 'Dashboard', description: 'Platform overview', icon: <LayoutDashboard size={18} />, path: '/admin', category: 'navigation', keywords: ['home', 'overview', 'main'] },
    { id: 'workflows', label: 'Workflow Builder', description: 'Automate processes', icon: <GitBranch size={18} />, path: '/admin/workflows', category: 'navigation', keywords: ['automation', 'flow', 'builder', 'process'] },
    { id: 'claims', label: 'Claims Processing', description: 'Manage claims', icon: <FileText size={18} />, path: '/admin/claims', category: 'navigation', keywords: ['claims', 'process', 'adjudication'] },
    { id: 'eligibility', label: 'Eligibility', description: 'Member coverage', icon: <Shield size={18} />, path: '/admin/eligibility', category: 'navigation', keywords: ['eligible', 'coverage', 'verify'] },
    { id: 'priorauth', label: 'Prior Authorization', description: 'Authorization requests', icon: <FileText size={18} />, path: '/admin/prior-auth', category: 'navigation', keywords: ['auth', 'prior', 'approval'] },
    { id: 'providers', label: 'Provider Directory', description: 'Network providers', icon: <Building2 size={18} />, path: '/admin/providers', category: 'navigation', keywords: ['provider', 'doctor', 'network'] },
    { id: 'analytics', label: 'Analytics', description: 'Insights & reports', icon: <BarChart3 size={18} />, path: '/admin/insights', category: 'navigation', keywords: ['analytics', 'reports', 'insights', 'data'] },
    { id: 'payments', label: 'Payments', description: 'Payment processing', icon: <CreditCard size={18} />, path: '/admin/payments', category: 'navigation', keywords: ['payment', 'billing', 'finance'] },
    { id: 'network', label: 'Network Management', description: 'Manage network', icon: <Building2 size={18} />, path: '/admin/network', category: 'navigation', keywords: ['network', 'providers', 'contracts'] },
    { id: 'compliance', label: 'Compliance', description: 'Regulatory compliance', icon: <Shield size={18} />, path: '/admin/compliance', category: 'navigation', keywords: ['compliance', 'hipaa', 'regulatory'] },
    { id: 'audit', label: 'Audit Trail', description: 'Activity logs', icon: <FileText size={18} />, path: '/admin/audit', category: 'navigation', keywords: ['audit', 'logs', 'activity', 'history'] },
    { id: 'settings', label: 'Settings', description: 'Platform settings', icon: <Settings size={18} />, path: '/admin/settings', category: 'navigation', keywords: ['settings', 'config', 'preferences'] },

    // Member Pages
    { id: 'member-home', label: 'Member Home', description: 'Member portal', icon: <Users size={18} />, path: '/member', category: 'navigation', keywords: ['member', 'home', 'portal'] },
    { id: 'find-care', label: 'Find Care', description: 'Search providers', icon: <Heart size={18} />, path: '/member/providers', category: 'navigation', keywords: ['find', 'care', 'doctor', 'search'] },
    { id: 'id-card', label: 'Member ID Card', description: 'View ID card', icon: <CreditCard size={18} />, path: '/member/id-card', category: 'navigation', keywords: ['id', 'card', 'insurance'] },
    { id: 'hsa', label: 'HSA/FSA Wallet', description: 'Health accounts', icon: <CreditCard size={18} />, path: '/member/hsa', category: 'navigation', keywords: ['hsa', 'fsa', 'wallet', 'savings'] },
]

const ACTION_COMMANDS: CommandItem[] = [
    { id: 'new-workflow', label: 'Create New Workflow', description: 'Start from scratch', icon: <Zap size={18} />, path: '/admin/workflows', category: 'action', keywords: ['new', 'create', 'workflow'] },
    { id: 'file-claim', label: 'File a Claim', description: 'Submit new claim', icon: <FileText size={18} />, path: '/admin/claims', category: 'action', keywords: ['file', 'new', 'claim', 'submit'] },
    { id: 'check-eligibility', label: 'Check Eligibility', description: 'Verify coverage', icon: <Shield size={18} />, path: '/admin/eligibility', category: 'action', keywords: ['check', 'verify', 'eligibility'] },
]

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)

    const allCommands = useMemo(() => [...NAVIGATION_COMMANDS, ...ACTION_COMMANDS], [])

    const filteredCommands = useMemo(() => {
        if (!query.trim()) return allCommands.slice(0, 8) // Show top 8 by default

        const lowerQuery = query.toLowerCase()
        return allCommands.filter(cmd =>
            cmd.label.toLowerCase().includes(lowerQuery) ||
            cmd.description?.toLowerCase().includes(lowerQuery) ||
            cmd.keywords.some(k => k.includes(lowerQuery))
        ).slice(0, 10)
    }, [query, allCommands])

    // Reset selection when results change
    useEffect(() => {
        setSelectedIndex(0)
    }, [filteredCommands])

    // Reset query when closed
    useEffect(() => {
        if (!isOpen) {
            setQuery('')
            setSelectedIndex(0)
        }
    }, [isOpen])

    const handleSelect = useCallback((command: CommandItem) => {
        if (command.path) {
            onNavigate(command.path)
        }
        if (command.action) {
            command.action()
        }
        onClose()
    }, [onNavigate, onClose])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1))
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(i => Math.max(i - 1, 0))
                break
            case 'Enter':
                e.preventDefault()
                if (filteredCommands[selectedIndex]) {
                    handleSelect(filteredCommands[selectedIndex])
                }
                break
            case 'Escape':
                e.preventDefault()
                onClose()
                break
        }
    }, [filteredCommands, selectedIndex, handleSelect, onClose])

    // Global keyboard shortcut
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                if (!isOpen) {
                    // Open is handled by parent component
                }
            }
        }

        window.addEventListener('keydown', handleGlobalKeyDown)
        return () => window.removeEventListener('keydown', handleGlobalKeyDown)
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="command-palette__backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Palette */}
                    <motion.div
                        className="command-palette"
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                    >
                        {/* Search Input */}
                        <div className="command-palette__header">
                            <Search size={20} className="command-palette__search-icon" />
                            <input
                                type="text"
                                className="command-palette__input"
                                placeholder="Search or jump to..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                            <div className="command-palette__shortcut">
                                <Command size={12} />
                                <span>K</span>
                            </div>
                            <button className="command-palette__close" onClick={onClose}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* Results */}
                        <div className="command-palette__results">
                            {filteredCommands.length === 0 ? (
                                <div className="command-palette__empty">
                                    No results for "{query}"
                                </div>
                            ) : (
                                <>
                                    {/* Navigation Section */}
                                    {filteredCommands.some(c => c.category === 'navigation') && (
                                        <div className="command-palette__section">
                                            <div className="command-palette__section-title">Pages</div>
                                            {filteredCommands
                                                .filter(c => c.category === 'navigation')
                                                .map((command) => {
                                                    const actualIndex = filteredCommands.indexOf(command)
                                                    return (
                                                        <button
                                                            key={command.id}
                                                            className={`command-palette__item ${actualIndex === selectedIndex ? 'command-palette__item--selected' : ''}`}
                                                            onClick={() => handleSelect(command)}
                                                            onMouseEnter={() => setSelectedIndex(actualIndex)}
                                                        >
                                                            <span className="command-palette__item-icon">
                                                                {command.icon}
                                                            </span>
                                                            <div className="command-palette__item-content">
                                                                <span className="command-palette__item-label">{command.label}</span>
                                                                {command.description && (
                                                                    <span className="command-palette__item-description">
                                                                        {command.description}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <ArrowRight size={14} className="command-palette__item-arrow" />
                                                        </button>
                                                    )
                                                })}
                                        </div>
                                    )}

                                    {/* Actions Section */}
                                    {filteredCommands.some(c => c.category === 'action') && (
                                        <div className="command-palette__section">
                                            <div className="command-palette__section-title">Actions</div>
                                            {filteredCommands
                                                .filter(c => c.category === 'action')
                                                .map((command) => {
                                                    const actualIndex = filteredCommands.indexOf(command)
                                                    return (
                                                        <button
                                                            key={command.id}
                                                            className={`command-palette__item ${actualIndex === selectedIndex ? 'command-palette__item--selected' : ''}`}
                                                            onClick={() => handleSelect(command)}
                                                            onMouseEnter={() => setSelectedIndex(actualIndex)}
                                                        >
                                                            <span className="command-palette__item-icon command-palette__item-icon--action">
                                                                {command.icon}
                                                            </span>
                                                            <div className="command-palette__item-content">
                                                                <span className="command-palette__item-label">{command.label}</span>
                                                                {command.description && (
                                                                    <span className="command-palette__item-description">
                                                                        {command.description}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <ArrowRight size={14} className="command-palette__item-arrow" />
                                                        </button>
                                                    )
                                                })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="command-palette__footer">
                            <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
                            <span><kbd>↵</kbd> to select</span>
                            <span><kbd>esc</kbd> to close</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default CommandPalette
