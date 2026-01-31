import { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, Check } from 'lucide-react'
import './Autocomplete.css'

interface Option {
    value: string
    label: string
    description?: string
    icon?: ReactNode
    disabled?: boolean
}

interface AutocompleteProps {
    value: string | string[]
    options: Option[]
    onChange: (value: string | string[]) => void
    onSearch?: (query: string) => void
    placeholder?: string
    label?: string
    multiple?: boolean
    loading?: boolean
    disabled?: boolean
    error?: string
    emptyMessage?: string
    className?: string
}

export function Autocomplete({
    value,
    options,
    onChange,
    onSearch,
    placeholder = 'Search...',
    label,
    multiple = false,
    loading = false,
    disabled = false,
    error,
    emptyMessage = 'No options found',
    className = ''
}: AutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const selectedValues = Array.isArray(value) ? value : value ? [value] : []

    const filteredOptions = query
        ? options.filter(opt =>
            opt.label.toLowerCase().includes(query.toLowerCase()) ||
            opt.description?.toLowerCase().includes(query.toLowerCase())
        )
        : options

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        setHighlightedIndex(0)
    }, [filteredOptions.length])

    const handleSelect = (option: Option) => {
        if (option.disabled) return

        if (multiple) {
            const newValues = selectedValues.includes(option.value)
                ? selectedValues.filter(v => v !== option.value)
                : [...selectedValues, option.value]
            onChange(newValues)
        } else {
            onChange(option.value)
            setIsOpen(false)
            setQuery('')
        }
    }

    const handleRemove = (val: string) => {
        onChange(selectedValues.filter(v => v !== val))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlightedIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter' && filteredOptions[highlightedIndex]) {
            e.preventDefault()
            handleSelect(filteredOptions[highlightedIndex])
        } else if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value
        setQuery(newQuery)
        onSearch?.(newQuery)
        if (!isOpen) setIsOpen(true)
    }

    const getSelectedLabel = (val: string) => {
        return options.find(opt => opt.value === val)?.label || val
    }

    return (
        <div ref={containerRef} className={`autocomplete ${error ? 'autocomplete--error' : ''} ${className}`}>
            {label && <label className="autocomplete__label">{label}</label>}

            <div className="autocomplete__control">
                {multiple && selectedValues.length > 0 && (
                    <div className="autocomplete__tags">
                        {selectedValues.map(val => (
                            <span key={val} className="autocomplete__tag">
                                {getSelectedLabel(val)}
                                <button
                                    type="button"
                                    className="autocomplete__tag-remove"
                                    onClick={() => handleRemove(val)}
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="autocomplete__input-wrapper">
                    <Search size={16} className="autocomplete__icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleQueryChange}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={multiple && selectedValues.length > 0 ? '' : placeholder}
                        disabled={disabled}
                        className="autocomplete__input"
                    />
                    {loading && <Loader2 size={16} className="autocomplete__loader" />}
                </div>
            </div>

            {error && <span className="autocomplete__error">{error}</span>}

            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.div
                        className="autocomplete__dropdown"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                    >
                        {filteredOptions.length === 0 ? (
                            <div className="autocomplete__empty">{emptyMessage}</div>
                        ) : (
                            filteredOptions.map((option, index) => {
                                const isSelected = selectedValues.includes(option.value)
                                const isHighlighted = index === highlightedIndex

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`autocomplete__option ${isSelected ? 'autocomplete__option--selected' : ''} ${isHighlighted ? 'autocomplete__option--highlighted' : ''} ${option.disabled ? 'autocomplete__option--disabled' : ''}`}
                                        onClick={() => handleSelect(option)}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                        disabled={option.disabled}
                                    >
                                        {option.icon && <span className="autocomplete__option-icon">{option.icon}</span>}
                                        <div className="autocomplete__option-content">
                                            <span className="autocomplete__option-label">{option.label}</span>
                                            {option.description && (
                                                <span className="autocomplete__option-description">{option.description}</span>
                                            )}
                                        </div>
                                        {isSelected && <Check size={16} className="autocomplete__option-check" />}
                                    </button>
                                )
                            })
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Autocomplete
