import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2 } from 'lucide-react'
import './SearchInput.css'

interface SearchInputProps {
    value?: string
    onChange?: (value: string) => void
    onSearch?: (value: string) => void
    placeholder?: string
    isLoading?: boolean
    debounceMs?: number
    className?: string
}

export function SearchInput({
    value: controlledValue,
    onChange,
    onSearch,
    placeholder = 'Search...',
    isLoading = false,
    debounceMs = 300,
    className = ''
}: SearchInputProps) {
    const [internalValue, setInternalValue] = useState(controlledValue || '')
    const [isFocused, setIsFocused] = useState(false)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const value = controlledValue !== undefined ? controlledValue : internalValue

    useEffect(() => {
        if (controlledValue !== undefined) {
            setInternalValue(controlledValue)
        }
    }, [controlledValue])

    const handleChange = (newValue: string) => {
        setInternalValue(newValue)
        onChange?.(newValue)

        // Debounced search
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            onSearch?.(newValue)
        }, debounceMs)
    }

    const handleClear = () => {
        handleChange('')
        inputRef.current?.focus()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (debounceRef.current) clearTimeout(debounceRef.current)
            onSearch?.(value)
        }
        if (e.key === 'Escape') {
            handleClear()
        }
    }

    return (
        <motion.div
            className={`search-input ${isFocused ? 'search-input--focused' : ''} ${className}`}
            animate={{ boxShadow: isFocused ? '0 0 0 3px rgba(6, 182, 212, 0.1)' : '0 0 0 0px transparent' }}
            transition={{ duration: 0.2 }}
        >
            <div className="search-input__icon">
                {isLoading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                        <Loader2 size={18} />
                    </motion.div>
                ) : (
                    <Search size={18} />
                )}
            </div>
            <input
                ref={inputRef}
                type="text"
                className="search-input__field"
                placeholder={placeholder}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
            />
            <AnimatePresence>
                {value && (
                    <motion.button
                        className="search-input__clear"
                        onClick={handleClear}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        type="button"
                    >
                        <X size={14} />
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default SearchInput
