import { ReactNode, useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Clock, ArrowRight, TrendingUp, Star, Hash, Loader2 } from 'lucide-react'
import './SmartSearch.css'

interface SearchResult {
    id: string
    type: 'page' | 'action' | 'data' | 'help'
    title: string
    description?: string
    icon?: ReactNode
    path?: string
    keywords?: string[]
    score?: number
}

interface SearchCategory {
    id: string
    label: string
    icon?: ReactNode
}

interface SmartSearchProps {
    isOpen: boolean
    onClose: () => void
    onSearch?: (query: string) => Promise<SearchResult[]>
    onSelect: (result: SearchResult) => void
    placeholder?: string
    categories?: SearchCategory[]
    recentSearches?: string[]
    trendingSearches?: string[]
    quickActions?: SearchResult[]
}

export function SmartSearch({
    isOpen,
    onClose,
    onSearch,
    onSelect,
    placeholder = 'Search anything...',
    categories = [],
    recentSearches = [],
    trendingSearches = [],
    quickActions = []
}: SmartSearchProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout>>()

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus()
            setQuery('')
            setResults([])
            setSelectedIndex(0)
        }
    }, [isOpen])

    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return
        }

        if (debounceRef.current) clearTimeout(debounceRef.current)

        debounceRef.current = setTimeout(async () => {
            if (onSearch) {
                setIsLoading(true)
                try {
                    const searchResults = await onSearch(query)
                    setResults(searchResults)
                } catch (error) {
                    console.error('Search error:', error)
                } finally {
                    setIsLoading(false)
                }
            }
        }, 300)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [query, onSearch])

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const items = results.length > 0 ? results : quickActions

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev => Math.min(prev + 1, items.length - 1))
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => Math.max(prev - 1, 0))
                break
            case 'Enter':
                e.preventDefault()
                if (items[selectedIndex]) {
                    onSelect(items[selectedIndex])
                    onClose()
                }
                break
            case 'Escape':
                onClose()
                break
        }
    }, [results, quickActions, selectedIndex, onSelect, onClose])

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            return () => document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, handleKeyDown])

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'page': return <Hash size={14} />
            case 'action': return <ArrowRight size={14} />
            case 'help': return <Star size={14} />
            default: return <Search size={14} />
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="smart-search__overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="smart-search"
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <div className="smart-search__header">
                            <Search size={18} className="smart-search__icon" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={placeholder}
                                className="smart-search__input"
                            />
                            {isLoading && <Loader2 size={16} className="smart-search__loader" />}
                            {query && !isLoading && (
                                <button className="smart-search__clear" onClick={() => setQuery('')}>
                                    <X size={14} />
                                </button>
                            )}
                            <kbd className="smart-search__kbd">ESC</kbd>
                        </div>

                        {/* Categories */}
                        {categories.length > 0 && (
                            <div className="smart-search__categories">
                                <button
                                    className={`smart-search__category ${!activeCategory ? 'smart-search__category--active' : ''}`}
                                    onClick={() => setActiveCategory(null)}
                                >
                                    All
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`smart-search__category ${activeCategory === cat.id ? 'smart-search__category--active' : ''}`}
                                        onClick={() => setActiveCategory(cat.id)}
                                    >
                                        {cat.icon}
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="smart-search__body">
                            {/* Results */}
                            {results.length > 0 ? (
                                <div className="smart-search__results">
                                    <div className="smart-search__section-title">Results</div>
                                    {results.map((result, index) => (
                                        <motion.button
                                            key={result.id}
                                            className={`smart-search__result ${index === selectedIndex ? 'smart-search__result--selected' : ''}`}
                                            onClick={() => {
                                                onSelect(result)
                                                onClose()
                                            }}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            whileHover={{ x: 2 }}
                                        >
                                            <span className="smart-search__result-icon">
                                                {result.icon || getTypeIcon(result.type)}
                                            </span>
                                            <div className="smart-search__result-content">
                                                <span className="smart-search__result-title">{result.title}</span>
                                                {result.description && (
                                                    <span className="smart-search__result-desc">{result.description}</span>
                                                )}
                                            </div>
                                            <span className="smart-search__result-type">{result.type}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            ) : query ? (
                                <div className="smart-search__empty">
                                    {isLoading ? 'Searching...' : 'No results found'}
                                </div>
                            ) : (
                                <>
                                    {/* Recent Searches */}
                                    {recentSearches.length > 0 && (
                                        <div className="smart-search__section">
                                            <div className="smart-search__section-title">
                                                <Clock size={12} />
                                                Recent
                                            </div>
                                            {recentSearches.slice(0, 5).map((search, i) => (
                                                <button
                                                    key={i}
                                                    className="smart-search__recent"
                                                    onClick={() => setQuery(search)}
                                                >
                                                    {search}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    {quickActions.length > 0 && (
                                        <div className="smart-search__section">
                                            <div className="smart-search__section-title">
                                                <Star size={12} />
                                                Quick Actions
                                            </div>
                                            {quickActions.map((action, index) => (
                                                <motion.button
                                                    key={action.id}
                                                    className={`smart-search__result ${index === selectedIndex && !query ? 'smart-search__result--selected' : ''}`}
                                                    onClick={() => {
                                                        onSelect(action)
                                                        onClose()
                                                    }}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                    whileHover={{ x: 2 }}
                                                >
                                                    <span className="smart-search__result-icon">
                                                        {action.icon || getTypeIcon(action.type)}
                                                    </span>
                                                    <span className="smart-search__result-title">{action.title}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Trending */}
                                    {trendingSearches.length > 0 && (
                                        <div className="smart-search__section">
                                            <div className="smart-search__section-title">
                                                <TrendingUp size={12} />
                                                Trending
                                            </div>
                                            <div className="smart-search__trending">
                                                {trendingSearches.slice(0, 5).map((search, i) => (
                                                    <button
                                                        key={i}
                                                        className="smart-search__trending-item"
                                                        onClick={() => setQuery(search)}
                                                    >
                                                        {search}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="smart-search__footer">
                            <span><kbd>↑↓</kbd> Navigate</span>
                            <span><kbd>↵</kbd> Select</span>
                            <span><kbd>ESC</kbd> Close</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default SmartSearch
