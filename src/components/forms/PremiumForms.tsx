import { ReactNode, useState, forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Check, AlertCircle, Info, Search, X, ChevronDown } from 'lucide-react'
import './PremiumForms.css'

// ============================================
// PREMIUM INPUT
// ============================================
interface PremiumInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string
    hint?: string
    error?: string
    success?: string
    icon?: ReactNode
    iconPosition?: 'left' | 'right'
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'filled' | 'outline'
    isLoading?: boolean
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(({
    label,
    hint,
    error,
    success,
    icon,
    iconPosition = 'left',
    size = 'md',
    variant = 'default',
    isLoading,
    type = 'text',
    className = '',
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const isPassword = type === 'password'

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    const getStatus = () => {
        if (error) return 'error'
        if (success) return 'success'
        return 'default'
    }

    return (
        <div className={`premium-input-wrapper ${className}`}>
            {label && (
                <label className="premium-input__label">
                    {label}
                    {props.required && <span className="premium-input__required">*</span>}
                </label>
            )}
            <div
                className={`premium-input premium-input--${size} premium-input--${variant} premium-input--${getStatus()} ${isFocused ? 'premium-input--focused' : ''} ${icon ? `premium-input--icon-${iconPosition}` : ''}`}
            >
                {icon && iconPosition === 'left' && (
                    <span className="premium-input__icon premium-input__icon--left">{icon}</span>
                )}
                <input
                    ref={ref}
                    type={inputType}
                    className="premium-input__field"
                    onFocus={(e) => { setIsFocused(true); props.onFocus?.(e) }}
                    onBlur={(e) => { setIsFocused(false); props.onBlur?.(e) }}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="premium-input__toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
                {icon && iconPosition === 'right' && !isPassword && (
                    <span className="premium-input__icon premium-input__icon--right">{icon}</span>
                )}
                {isLoading && <span className="premium-input__loader" />}
                {error && <AlertCircle size={18} className="premium-input__status-icon premium-input__status-icon--error" />}
                {success && <Check size={18} className="premium-input__status-icon premium-input__status-icon--success" />}
            </div>
            <AnimatePresence>
                {(hint || error || success) && (
                    <motion.div
                        className={`premium-input__message ${error ? 'premium-input__message--error' : success ? 'premium-input__message--success' : ''}`}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                    >
                        {error || success || hint}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
})

PremiumInput.displayName = 'PremiumInput'

// ============================================
// PREMIUM TEXTAREA
// ============================================
interface PremiumTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    hint?: string
    error?: string
    maxLength?: number
    showCount?: boolean
}

export const PremiumTextarea = forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(({
    label,
    hint,
    error,
    maxLength,
    showCount = false,
    className = '',
    value,
    ...props
}, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const charCount = typeof value === 'string' ? value.length : 0

    return (
        <div className={`premium-textarea-wrapper ${className}`}>
            {label && (
                <label className="premium-textarea__label">
                    {label}
                    {props.required && <span className="premium-textarea__required">*</span>}
                </label>
            )}
            <div className={`premium-textarea ${error ? 'premium-textarea--error' : ''} ${isFocused ? 'premium-textarea--focused' : ''}`}>
                <textarea
                    ref={ref}
                    className="premium-textarea__field"
                    value={value}
                    maxLength={maxLength}
                    onFocus={(e) => { setIsFocused(true); props.onFocus?.(e) }}
                    onBlur={(e) => { setIsFocused(false); props.onBlur?.(e) }}
                    {...props}
                />
            </div>
            <div className="premium-textarea__footer">
                {(hint || error) && (
                    <span className={`premium-textarea__message ${error ? 'premium-textarea__message--error' : ''}`}>
                        {error || hint}
                    </span>
                )}
                {showCount && maxLength && (
                    <span className="premium-textarea__count">
                        {charCount}/{maxLength}
                    </span>
                )}
            </div>
        </div>
    )
})

PremiumTextarea.displayName = 'PremiumTextarea'

// ============================================
// PREMIUM SELECT
// ============================================
interface SelectOption {
    value: string
    label: string
    icon?: ReactNode
    disabled?: boolean
    description?: string
}

interface PremiumSelectProps {
    options: SelectOption[]
    value?: string
    onChange?: (value: string) => void
    label?: string
    placeholder?: string
    error?: string
    disabled?: boolean
    searchable?: boolean
}

export function PremiumSelect({
    options,
    value,
    onChange,
    label,
    placeholder = 'Select an option',
    error,
    disabled,
    searchable = false
}: PremiumSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')

    const selectedOption = options.find(opt => opt.value === value)
    const filteredOptions = searchable
        ? options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()))
        : options

    return (
        <div className={`premium-select-wrapper ${disabled ? 'premium-select-wrapper--disabled' : ''}`}>
            {label && <label className="premium-select__label">{label}</label>}
            <div className={`premium-select ${isOpen ? 'premium-select--open' : ''} ${error ? 'premium-select--error' : ''}`}>
                <button
                    type="button"
                    className="premium-select__trigger"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                >
                    {selectedOption ? (
                        <span className="premium-select__selected">
                            {selectedOption.icon}
                            {selectedOption.label}
                        </span>
                    ) : (
                        <span className="premium-select__placeholder">{placeholder}</span>
                    )}
                    <ChevronDown size={18} className={`premium-select__chevron ${isOpen ? 'premium-select__chevron--open' : ''}`} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            className="premium-select__dropdown"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {searchable && (
                                <div className="premium-select__search">
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        autoFocus
                                    />
                                    {search && (
                                        <button onClick={() => setSearch('')}>
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className="premium-select__options">
                                {filteredOptions.map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`premium-select__option ${option.value === value ? 'premium-select__option--selected' : ''} ${option.disabled ? 'premium-select__option--disabled' : ''}`}
                                        onClick={() => {
                                            if (!option.disabled) {
                                                onChange?.(option.value)
                                                setIsOpen(false)
                                                setSearch('')
                                            }
                                        }}
                                        disabled={option.disabled}
                                    >
                                        {option.icon && <span className="premium-select__option-icon">{option.icon}</span>}
                                        <div className="premium-select__option-content">
                                            <span className="premium-select__option-label">{option.label}</span>
                                            {option.description && (
                                                <span className="premium-select__option-description">{option.description}</span>
                                            )}
                                        </div>
                                        {option.value === value && <Check size={16} className="premium-select__check" />}
                                    </button>
                                ))}
                                {filteredOptions.length === 0 && (
                                    <div className="premium-select__empty">No options found</div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {error && <span className="premium-select__error">{error}</span>}
        </div>
    )
}

// ============================================
// PREMIUM CHECKBOX
// ============================================
interface PremiumCheckboxProps {
    checked?: boolean
    onChange?: (checked: boolean) => void
    label?: string
    description?: string
    disabled?: boolean
    indeterminate?: boolean
}

export function PremiumCheckbox({
    checked = false,
    onChange,
    label,
    description,
    disabled,
    indeterminate
}: PremiumCheckboxProps) {
    return (
        <label className={`premium-checkbox ${disabled ? 'premium-checkbox--disabled' : ''}`}>
            <div className="premium-checkbox__input-wrapper">
                <input
                    type="checkbox"
                    className="premium-checkbox__input"
                    checked={checked}
                    onChange={e => onChange?.(e.target.checked)}
                    disabled={disabled}
                />
                <div className={`premium-checkbox__box ${checked ? 'premium-checkbox__box--checked' : ''} ${indeterminate ? 'premium-checkbox__box--indeterminate' : ''}`}>
                    <motion.svg
                        viewBox="0 0 12 12"
                        initial={false}
                        animate={checked ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                    >
                        {indeterminate ? (
                            <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="2" />
                        ) : (
                            <motion.path
                                d="M2 6l3 3 5-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: checked ? 1 : 0 }}
                            />
                        )}
                    </motion.svg>
                </div>
            </div>
            {(label || description) && (
                <div className="premium-checkbox__content">
                    {label && <span className="premium-checkbox__label">{label}</span>}
                    {description && <span className="premium-checkbox__description">{description}</span>}
                </div>
            )}
        </label>
    )
}

// ============================================
// PREMIUM TOGGLE
// ============================================
interface PremiumToggleProps {
    checked?: boolean
    onChange?: (checked: boolean) => void
    label?: string
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
}

export function PremiumToggle({
    checked = false,
    onChange,
    label,
    size = 'md',
    disabled
}: PremiumToggleProps) {
    return (
        <label className={`premium-toggle premium-toggle--${size} ${disabled ? 'premium-toggle--disabled' : ''}`}>
            <input
                type="checkbox"
                className="premium-toggle__input"
                checked={checked}
                onChange={e => onChange?.(e.target.checked)}
                disabled={disabled}
            />
            <div className={`premium-toggle__track ${checked ? 'premium-toggle__track--checked' : ''}`}>
                <motion.div
                    className="premium-toggle__thumb"
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            </div>
            {label && <span className="premium-toggle__label">{label}</span>}
        </label>
    )
}

// ============================================
// PREMIUM RADIO GROUP
// ============================================
interface RadioOption {
    value: string
    label: string
    description?: string
    disabled?: boolean
}

interface PremiumRadioGroupProps {
    options: RadioOption[]
    value?: string
    onChange?: (value: string) => void
    name: string
    label?: string
    variant?: 'default' | 'cards'
}

export function PremiumRadioGroup({
    options,
    value,
    onChange,
    name,
    label,
    variant = 'default'
}: PremiumRadioGroupProps) {
    return (
        <div className={`premium-radio-group premium-radio-group--${variant}`}>
            {label && <label className="premium-radio-group__label">{label}</label>}
            <div className="premium-radio-group__options">
                {options.map(option => (
                    <label
                        key={option.value}
                        className={`premium-radio ${option.value === value ? 'premium-radio--selected' : ''} ${option.disabled ? 'premium-radio--disabled' : ''}`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={option.value === value}
                            onChange={() => onChange?.(option.value)}
                            disabled={option.disabled}
                            className="premium-radio__input"
                        />
                        <div className="premium-radio__indicator">
                            <motion.div
                                className="premium-radio__dot"
                                initial={false}
                                animate={option.value === value ? { scale: 1 } : { scale: 0 }}
                            />
                        </div>
                        <div className="premium-radio__content">
                            <span className="premium-radio__label">{option.label}</span>
                            {option.description && (
                                <span className="premium-radio__description">{option.description}</span>
                            )}
                        </div>
                    </label>
                ))}
            </div>
        </div>
    )
}

export default {
    PremiumInput,
    PremiumTextarea,
    PremiumSelect,
    PremiumCheckbox,
    PremiumToggle,
    PremiumRadioGroup
}
