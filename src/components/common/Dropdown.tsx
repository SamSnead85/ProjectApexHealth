import { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import './Dropdown.css'

interface DropdownOption {
    value: string
    label: string
    icon?: ReactNode
    disabled?: boolean
}

interface DropdownProps {
    options: DropdownOption[]
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    label?: string
    disabled?: boolean
    className?: string
}

export function Dropdown({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    label,
    disabled = false,
    className = ''
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.value === value)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (option: DropdownOption) => {
        if (option.disabled) return
        onChange?.(option.value)
        setIsOpen(false)
    }

    return (
        <div className={`dropdown ${disabled ? 'dropdown--disabled' : ''} ${className}`} ref={dropdownRef}>
            {label && <label className="dropdown__label">{label}</label>}
            <button
                className={`dropdown__trigger ${isOpen ? 'dropdown__trigger--open' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                type="button"
                disabled={disabled}
            >
                <span className="dropdown__value">
                    {selectedOption?.icon}
                    {selectedOption?.label || placeholder}
                </span>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={18} />
                </motion.span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="dropdown__menu"
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                className={`dropdown__option ${option.value === value ? 'dropdown__option--selected' : ''} ${option.disabled ? 'dropdown__option--disabled' : ''}`}
                                onClick={() => handleSelect(option)}
                                type="button"
                            >
                                {option.icon && <span className="dropdown__option-icon">{option.icon}</span>}
                                <span className="dropdown__option-label">{option.label}</span>
                                {option.value === value && <Check size={16} className="dropdown__check" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Dropdown
