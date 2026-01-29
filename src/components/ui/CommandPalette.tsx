import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Home,
    Users,
    FileText,
    Activity,
    Settings,
    Shield,
    Brain,
    BarChart3,
    DollarSign,
    Crown,
    Key,
    Palette,
    Stethoscope,
    HeartPulse,
    Code2,
    TrendingUp,
    AlertTriangle,
    Calculator,
    Sparkles,
    Zap,
    Command,
    ArrowRight
} from 'lucide-react'
import './CommandPalette.css'

interface CommandItem {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    path: string
    category: string
    shortcut?: string[]
    badge?: string
    badgeType?: 'new' | 'ai'
}

const commands: CommandItem[] = [
    // Executive
    { id: 'exec', title: 'Executive Dashboard', description: 'C-suite KPIs and strategic insights', icon: <Crown size={18} />, path: '/executive', category: 'Executive', badge: 'New', badgeType: 'new' },

    // Intelligence
    { id: 'doc-intel', title: 'Document Intelligence', description: 'AI-powered document processing', icon: <FileText size={18} />, path: '/document-intelligence', category: 'Intelligence' },
    { id: 'member360', title: 'Member 360°', description: 'Unified member view and risk scoring', icon: <Users size={18} />, path: '/member-360', category: 'Intelligence' },
    { id: 'claims-pred', title: 'Claims Prediction', description: 'AI forecasting and risk analysis', icon: <Brain size={18} />, path: '/claims-prediction', category: 'Intelligence', badge: 'AI', badgeType: 'ai' },
    { id: 'fraud', title: 'Fraud Detection', description: 'Anomaly detection and case management', icon: <AlertTriangle size={18} />, path: '/fraud-detection', category: 'Intelligence', badge: 'AI', badgeType: 'ai' },
    { id: 'cds', title: 'Clinical Decision Support', description: 'Evidence-based recommendations', icon: <Stethoscope size={18} />, path: '/clinical-decision', category: 'Intelligence', badge: 'AI', badgeType: 'ai' },

    // Analytics
    { id: 'vbc', title: 'Value-Based Care', description: 'Quality measures and contracts', icon: <TrendingUp size={18} />, path: '/value-based-care', category: 'Analytics' },
    { id: 'provider', title: 'Provider Performance', description: 'Scorecard and efficiency metrics', icon: <Activity size={18} />, path: '/provider-performance', category: 'Analytics' },
    { id: 'sir', title: 'SIR Analytics', description: 'Self-insured reporting command center', icon: <BarChart3 size={18} />, path: '/sir', category: 'Analytics' },

    // Care
    { id: 'care', title: 'Care Management', description: 'Programs and patient tracking', icon: <HeartPulse size={18} />, path: '/care-management', category: 'Care' },
    { id: 'calc', title: 'Benefit Calculator', description: 'Cost estimation tool', icon: <Calculator size={18} />, path: '/benefit-calculator', category: 'Care' },

    // Admin
    { id: 'sso', title: 'SSO Configuration', description: 'Identity and authentication', icon: <Key size={18} />, path: '/sso', category: 'Administration', shortcut: ['⌘', 'S', 'S'] },
    { id: 'brand', title: 'Branding Settings', description: 'White-label customization', icon: <Palette size={18} />, path: '/branding', category: 'Administration' },
    { id: 'api', title: 'API Management', description: 'Developer portal and keys', icon: <Code2 size={18} />, path: '/api-management', category: 'Administration' },
    { id: 'audit', title: 'Audit Dashboard', description: 'Security and compliance logs', icon: <Shield size={18} />, path: '/audit', category: 'Administration' },
]

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
    onNavigate: (path: string) => void
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    const filteredCommands = query
        ? commands.filter(
            cmd =>
                cmd.title.toLowerCase().includes(query.toLowerCase()) ||
                cmd.description.toLowerCase().includes(query.toLowerCase()) ||
                cmd.category.toLowerCase().includes(query.toLowerCase())
        )
        : commands

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = []
        acc[cmd.category].push(cmd)
        return acc
    }, {} as Record<string, CommandItem[]>)

    const flatCommands = Object.values(groupedCommands).flat()

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose()
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => (prev + 1) % flatCommands.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => (prev - 1 + flatCommands.length) % flatCommands.length)
        } else if (e.key === 'Enter' && flatCommands[selectedIndex]) {
            onNavigate(flatCommands[selectedIndex].path)
            onClose()
        }
    }, [flatCommands, selectedIndex, onClose, onNavigate])

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus()
            setQuery('')
            setSelectedIndex(0)
            document.addEventListener('keydown', handleKeyDown)
        }
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, handleKeyDown])

    useEffect(() => {
        setSelectedIndex(0)
    }, [query])

    if (!isOpen) return null

    return createPortal(
        <div className="command-palette-overlay" onClick={onClose}>
            <motion.div
                className="command-palette"
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.15 }}
            >
                {/* Search Input */}
                <div className="command-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="command-input"
                        placeholder="Search pages, features, or ask AI..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <div className="command-shortcut">
                        <kbd>esc</kbd>
                    </div>
                </div>

                {/* AI Search Hint */}
                {query.length > 2 && (
                    <div className="ai-search-hint">
                        <Sparkles size={16} className="ai-icon" />
                        Press <kbd>Tab</kbd> to ask AI about "{query}"
                    </div>
                )}

                {/* Results */}
                <div className="command-results">
                    {flatCommands.length === 0 ? (
                        <div className="command-empty">
                            <div className="command-empty-icon">
                                <Search size={24} />
                            </div>
                            <h4>No results found</h4>
                            <p>Try a different search term</p>
                        </div>
                    ) : (
                        Object.entries(groupedCommands).map(([category, items]) => (
                            <div key={category} className="results-group">
                                <div className="group-label">{category}</div>
                                {items.map((cmd) => {
                                    const globalIndex = flatCommands.findIndex(c => c.id === cmd.id)
                                    return (
                                        <div
                                            key={cmd.id}
                                            className={`command-item ${globalIndex === selectedIndex ? 'selected' : ''}`}
                                            onClick={() => {
                                                onNavigate(cmd.path)
                                                onClose()
                                            }}
                                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                                        >
                                            <div className="command-icon">{cmd.icon}</div>
                                            <div className="command-content">
                                                <div className="command-title">{cmd.title}</div>
                                                <div className="command-description">{cmd.description}</div>
                                            </div>
                                            {cmd.badge && (
                                                <span className={`command-badge ${cmd.badgeType}`}>
                                                    {cmd.badgeType === 'ai' && <Brain size={10} style={{ marginRight: '0.25rem' }} />}
                                                    {cmd.badge}
                                                </span>
                                            )}
                                            {cmd.shortcut && (
                                                <div className="command-item-shortcut">
                                                    {cmd.shortcut.map((key, i) => (
                                                        <kbd key={i}>{key}</kbd>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="command-footer">
                    <div className="footer-hints">
                        <span className="footer-hint">
                            <kbd>↑</kbd><kbd>↓</kbd> Navigate
                        </span>
                        <span className="footer-hint">
                            <kbd>↵</kbd> Select
                        </span>
                        <span className="footer-hint">
                            <kbd>esc</kbd> Close
                        </span>
                    </div>
                    <div className="footer-branding">
                        <Zap size={12} />
                        Powered by Apex AI
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    )
}
