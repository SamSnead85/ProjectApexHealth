import { ReactNode, useState, useEffect, createContext, useContext, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Command, Search, ArrowRight, Clock, Star, Hash, Keyboard, X } from 'lucide-react'
import './CommandCenter.css'

interface CommandItem {
    id: string
    label: string
    description?: string
    icon?: ReactNode
    shortcut?: string[]
    category?: string
    action: () => void
    keywords?: string[]
}

interface CommandCenterContextType {
    isOpen: boolean
    open: () => void
    close: () => void
    toggle: () => void
    registerCommand: (command: CommandItem) => void
    unregisterCommand: (id: string) => void
}

const CommandCenterContext = createContext<CommandCenterContextType | null>(null)

export function useCommandCenter() {
    const context = useContext(CommandCenterContext)
    if (!context) throw new Error('useCommandCenter must be used within CommandCenterProvider')
    return context
}

interface CommandCenterProviderProps {
    children: ReactNode
    globalShortcut?: string[]
}

export function CommandCenterProvider({
    children,
    globalShortcut = ['Meta', 'k']
}: CommandCenterProviderProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [commands, setCommands] = useState<CommandItem[]>([])

    const open = useCallback(() => setIsOpen(true), [])
    const close = useCallback(() => setIsOpen(false), [])
    const toggle = useCallback(() => setIsOpen(prev => !prev), [])

    const registerCommand = useCallback((command: CommandItem) => {
        setCommands(prev => {
            if (prev.some(c => c.id === command.id)) return prev
            return [...prev, command]
        })
    }, [])

    const unregisterCommand = useCallback((id: string) => {
        setCommands(prev => prev.filter(c => c.id !== id))
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                (e.metaKey || e.ctrlKey) &&
                e.key.toLowerCase() === globalShortcut[1].toLowerCase()
            ) {
                e.preventDefault()
                toggle()
            }
            if (e.key === 'Escape' && isOpen) {
                close()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [globalShortcut, isOpen, toggle, close])

    return (
        <CommandCenterContext.Provider value={{ isOpen, open, close, toggle, registerCommand, unregisterCommand }}>
            {children}
            <CommandPalette commands={commands} isOpen={isOpen} onClose={close} />
        </CommandCenterContext.Provider>
    )
}

interface CommandPaletteProps {
    commands: CommandItem[]
    isOpen: boolean
    onClose: () => void
}

function CommandPalette({ commands, isOpen, onClose }: CommandPaletteProps) {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [recentCommands, setRecentCommands] = useState<string[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setSelectedIndex(0)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isOpen])

    const filteredCommands = commands.filter(cmd => {
        if (!query) return true
        const searchText = `${cmd.label} ${cmd.description || ''} ${cmd.keywords?.join(' ') || ''}`.toLowerCase()
        return searchText.includes(query.toLowerCase())
    })

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        const category = cmd.category || 'General'
        if (!acc[category]) acc[category] = []
        acc[category].push(cmd)
        return acc
    }, {} as Record<string, CommandItem[]>)

    const handleSelect = (command: CommandItem) => {
        command.action()
        setRecentCommands(prev => [command.id, ...prev.filter(id => id !== command.id)].slice(0, 5))
        onClose()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
            handleSelect(filteredCommands[selectedIndex])
        }
    }

    if (!isOpen) return null

    return (
        <>
            <motion.div
                className="command-palette__overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />

            <motion.div
                className="command-palette"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
            >
                <div className="command-palette__header">
                    <Search size={18} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search commands..."
                    />
                    <kbd>ESC</kbd>
                </div>

                <div className="command-palette__content">
                    {filteredCommands.length === 0 ? (
                        <div className="command-palette__empty">
                            No commands found
                        </div>
                    ) : (
                        Object.entries(groupedCommands).map(([category, items]) => (
                            <div key={category} className="command-palette__group">
                                <div className="command-palette__group-label">{category}</div>
                                {items.map((cmd, index) => {
                                    const globalIndex = filteredCommands.indexOf(cmd)
                                    return (
                                        <button
                                            key={cmd.id}
                                            className={`command-palette__item ${globalIndex === selectedIndex ? 'command-palette__item--selected' : ''}`}
                                            onClick={() => handleSelect(cmd)}
                                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                                        >
                                            <span className="command-palette__item-icon">
                                                {cmd.icon || <Command size={14} />}
                                            </span>
                                            <span className="command-palette__item-label">{cmd.label}</span>
                                            {cmd.description && (
                                                <span className="command-palette__item-desc">{cmd.description}</span>
                                            )}
                                            {cmd.shortcut && (
                                                <span className="command-palette__item-shortcut">
                                                    {cmd.shortcut.map((key, i) => (
                                                        <kbd key={i}>{key}</kbd>
                                                    ))}
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        ))
                    )}
                </div>

                <div className="command-palette__footer">
                    <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
                    <span><kbd>Enter</kbd> to select</span>
                    <span><kbd>ESC</kbd> to close</span>
                </div>
            </motion.div>
        </>
    )
}

// Quick Action Button
interface QuickActionProps {
    icon: ReactNode
    label: string
    shortcut?: string[]
    onClick: () => void
}

export function QuickAction({ icon, label, shortcut, onClick }: QuickActionProps) {
    return (
        <button className="quick-action" onClick={onClick}>
            <span className="quick-action__icon">{icon}</span>
            <span className="quick-action__label">{label}</span>
            {shortcut && (
                <span className="quick-action__shortcut">
                    {shortcut.map((key, i) => <kbd key={i}>{key}</kbd>)}
                </span>
            )}
        </button>
    )
}

export default CommandCenterProvider
