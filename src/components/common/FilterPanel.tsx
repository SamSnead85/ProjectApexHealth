import { ReactNode, useState, useCallback, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, ChevronDown, Search, Check, Calendar, RefreshCw } from 'lucide-react'
import './FilterPanel.css'

type FilterValue = string | number | boolean | string[] | [number, number] | [Date, Date]

interface FilterOption {
    value: string
    label: string
    count?: number
}

interface FilterDefinition {
    id: string
    label: string
    type: 'select' | 'multiselect' | 'search' | 'range' | 'daterange' | 'boolean'
    options?: FilterOption[]
    min?: number
    max?: number
    placeholder?: string
}

interface ActiveFilter {
    id: string
    value: FilterValue
    label?: string
}

interface FilterContextType {
    filters: ActiveFilter[]
    setFilter: (id: string, value: FilterValue, label?: string) => void
    removeFilter: (id: string) => void
    clearFilters: () => void
}

const FilterContext = createContext<FilterContextType | null>(null)

export function useFilters() {
    const context = useContext(FilterContext)
    if (!context) throw new Error('useFilters must be used within FilterProvider')
    return context
}

interface FilterProviderProps {
    children: ReactNode
    onFiltersChange?: (filters: ActiveFilter[]) => void
}

export function FilterProvider({ children, onFiltersChange }: FilterProviderProps) {
    const [filters, setFilters] = useState<ActiveFilter[]>([])

    const setFilter = useCallback((id: string, value: FilterValue, label?: string) => {
        setFilters(prev => {
            const existing = prev.findIndex(f => f.id === id)
            if (existing >= 0) {
                const updated = [...prev]
                updated[existing] = { id, value, label }
                return updated
            }
            return [...prev, { id, value, label }]
        })
    }, [])

    const removeFilter = useCallback((id: string) => {
        setFilters(prev => prev.filter(f => f.id !== id))
    }, [])

    const clearFilters = useCallback(() => {
        setFilters([])
    }, [])

    useEffect(() => {
        onFiltersChange?.(filters)
    }, [filters, onFiltersChange])

    return (
        <FilterContext.Provider value={{ filters, setFilter, removeFilter, clearFilters }}>
            {children}
        </FilterContext.Provider>
    )
}

interface FilterPanelProps {
    definitions: FilterDefinition[]
    className?: string
}

export function FilterPanel({ definitions, className = '' }: FilterPanelProps) {
    const { filters, setFilter, removeFilter, clearFilters } = useFilters()
    const [expandedFilter, setExpandedFilter] = useState<string | null>(null)

    const getValue = (id: string) => filters.find(f => f.id === id)?.value

    const renderFilter = (def: FilterDefinition) => {
        const currentValue = getValue(def.id)

        switch (def.type) {
            case 'select':
            case 'multiselect':
                return (
                    <div className="filter-panel__options">
                        {def.options?.map(opt => {
                            const isSelected = def.type === 'multiselect'
                                ? (currentValue as string[] || []).includes(opt.value)
                                : currentValue === opt.value

                            return (
                                <button
                                    key={opt.value}
                                    className={`filter-panel__option ${isSelected ? 'filter-panel__option--selected' : ''}`}
                                    onClick={() => {
                                        if (def.type === 'multiselect') {
                                            const current = (currentValue as string[]) || []
                                            const updated = isSelected
                                                ? current.filter(v => v !== opt.value)
                                                : [...current, opt.value]
                                            setFilter(def.id, updated, `${def.label}: ${updated.length} selected`)
                                        } else {
                                            if (isSelected) {
                                                removeFilter(def.id)
                                            } else {
                                                setFilter(def.id, opt.value, `${def.label}: ${opt.label}`)
                                            }
                                        }
                                    }}
                                >
                                    {isSelected && <Check size={12} />}
                                    <span>{opt.label}</span>
                                    {opt.count !== undefined && <span className="filter-panel__count">{opt.count}</span>}
                                </button>
                            )
                        })}
                    </div>
                )

            case 'search':
                return (
                    <div className="filter-panel__search">
                        <Search size={14} />
                        <input
                            type="text"
                            value={(currentValue as string) || ''}
                            onChange={(e) => setFilter(def.id, e.target.value, `${def.label}: "${e.target.value}"`)}
                            placeholder={def.placeholder || 'Search...'}
                        />
                    </div>
                )

            case 'range':
                const min = def.min ?? 0
                const max = def.max ?? 100
                const rangeValue = (currentValue as [number, number]) || [min, max]
                return (
                    <div className="filter-panel__range">
                        <input
                            type="range"
                            min={min}
                            max={max}
                            value={rangeValue[0]}
                            onChange={(e) => setFilter(def.id, [Number(e.target.value), rangeValue[1]], `${def.label}: ${e.target.value}-${rangeValue[1]}`)}
                        />
                        <span>{rangeValue[0]} - {rangeValue[1]}</span>
                        <input
                            type="range"
                            min={min}
                            max={max}
                            value={rangeValue[1]}
                            onChange={(e) => setFilter(def.id, [rangeValue[0], Number(e.target.value)], `${def.label}: ${rangeValue[0]}-${e.target.value}`)}
                        />
                    </div>
                )

            case 'boolean':
                const boolValue = currentValue as boolean | undefined
                return (
                    <div className="filter-panel__boolean">
                        <button
                            className={boolValue === true ? 'active' : ''}
                            onClick={() => setFilter(def.id, true, `${def.label}: Yes`)}
                        >
                            Yes
                        </button>
                        <button
                            className={boolValue === false ? 'active' : ''}
                            onClick={() => setFilter(def.id, false, `${def.label}: No`)}
                        >
                            No
                        </button>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className={`filter-panel ${className}`}>
            <div className="filter-panel__header">
                <Filter size={16} />
                <span>Filters</span>
                {filters.length > 0 && (
                    <button className="filter-panel__clear" onClick={clearFilters}>
                        Clear all
                    </button>
                )}
            </div>

            <div className="filter-panel__filters">
                {definitions.map(def => (
                    <div key={def.id} className="filter-panel__filter">
                        <button
                            className="filter-panel__filter-header"
                            onClick={() => setExpandedFilter(expandedFilter === def.id ? null : def.id)}
                        >
                            <span>{def.label}</span>
                            {getValue(def.id) && <span className="filter-panel__active-dot" />}
                            <ChevronDown
                                size={14}
                                style={{ transform: expandedFilter === def.id ? 'rotate(180deg)' : 'none' }}
                            />
                        </button>

                        <AnimatePresence>
                            {expandedFilter === def.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="filter-panel__filter-body"
                                >
                                    {renderFilter(def)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Active Filters Bar
export function ActiveFiltersBar({ className = '' }: { className?: string }) {
    const { filters, removeFilter, clearFilters } = useFilters()

    if (filters.length === 0) return null

    return (
        <div className={`active-filters-bar ${className}`}>
            {filters.map(filter => (
                <span key={filter.id} className="active-filters-bar__tag">
                    {filter.label || filter.id}
                    <button onClick={() => removeFilter(filter.id)}>
                        <X size={12} />
                    </button>
                </span>
            ))}
            <button className="active-filters-bar__clear" onClick={clearFilters}>
                <RefreshCw size={12} />
                Clear all
            </button>
        </div>
    )
}

export default FilterPanel
