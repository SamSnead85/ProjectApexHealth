import { useState, useEffect, useRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Command, ArrowRight, CornerDownLeft } from 'lucide-react'
import './CommandPalette.css'

interface CommandItem {
    id: string
    icon?: ReactNode
    label: string
    shortcut?: string
    description?: string
    action: () => void
    keywords?: string[]
}

interface CommandGroup {
    label: string
    items: CommandItem[]
}

interface CommandPaletteProps {
    groups: CommandGroup[]
    isOpen: boolean
    onClose: () => void
    placeholder?: string
}

export function CommandPalette({
    groups,
    isOpen,
    onClose,
    placeholder = 'Type a command or search...'
}: CommandPaletteProps) {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    // Flatten items for keyboard navigation
    const allItems = groups.flatMap(g => g.items)

    // Filter items based on query
    const filteredGroups = groups.map(group => ({
        ...group,
        items: group.items.filter(item => {
            const searchText = `${item.label} ${item.description || ''} ${item.keywords?.join(' ') || ''}`.toLowerCase()
            return searchText.includes(query.toLowerCase())
        })
    })).filter(group => group.items.length > 0)

    const filteredItems = filteredGroups.flatMap(g => g.items)

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setSelectedIndex(0)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isOpen])

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return

        const handler = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault()
                    setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1))
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    setSelectedIndex(prev => Math.max(prev - 1, 0))
                    break
                case 'Enter':
                    e.preventDefault()
                    if (filteredItems[selectedIndex]) {
                        filteredItems[selectedIndex].action()
                        onClose()
                    }
                    break
                case 'Escape':
                    onClose()
                    break
            }
        }

        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [isOpen, filteredItems, selectedIndex, onClose])

    // Reset selection when query changes
    useEffect(() => {
        setSelectedIndex(0)
    }, [query])

    let currentIndex = -1

    return (
        <AnimatePresence>
            {isOpen && (
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
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    >
                        <div className="command-palette__search">
                            <Search size={18} className="command-palette__search-icon" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="command-palette__input"
                                placeholder={placeholder}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <div className="command-palette__shortcut">
                                <kbd>Esc</kbd>
                            </div>
                        </div>

                        <div className="command-palette__content">
                            {filteredGroups.length === 0 ? (
                                <div className="command-palette__empty">
                                    No results found for "{query}"
                                </div>
                            ) : (
                                filteredGroups.map(group => (
                                    <div key={group.label} className="command-palette__group">
                                        <div className="command-palette__group-label">{group.label}</div>
                                        {group.items.map(item => {
                                            currentIndex++
                                            const index = currentIndex
                                            return (
                                                <motion.button
                                                    key={item.id}
                                                    className={`command-palette__item ${index === selectedIndex ? 'command-palette__item--selected' : ''}`}
                                                    onClick={() => { item.action(); onClose() }}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                    whileHover={{ x: 2 }}
                                                >
                                                    {item.icon && <span className="command-palette__item-icon">{item.icon}</span>}
                                                    <div className="command-palette__item-content">
                                                        <span className="command-palette__item-label">{item.label}</span>
                                                        {item.description && (
                                                            <span className="command-palette__item-description">{item.description}</span>
                                                        )}
                                                    </div>
                                                    {item.shortcut && (
                                                        <kbd className="command-palette__item-shortcut">{item.shortcut}</kbd>
                                                    )}
                                                    {index === selectedIndex && <CornerDownLeft size={14} className="command-palette__item-enter" />}
                                                </motion.button>
                                            )
                                        })}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="command-palette__footer">
                            <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                            <span><kbd>↵</kbd> Select</span>
                            <span><kbd>Esc</kbd> Close</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// Hook to open command palette with Cmd/Ctrl + K
export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(prev => !prev)
            }
        }

        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [])

    return { isOpen, setIsOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }
}

export default CommandPalette
