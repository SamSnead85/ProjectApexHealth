import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Check, AlertCircle, Info } from 'lucide-react'
import './FormField.css'

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string
    description?: string
    error?: string
    success?: string
    hint?: string
    leftIcon?: ReactNode
    rightIcon?: ReactNode
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'filled' | 'ghost'
    showCharCount?: boolean
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({
    label,
    description,
    error,
    success,
    hint,
    leftIcon,
    rightIcon,
    size = 'md',
    variant = 'default',
    showCharCount = false,
    type = 'text',
    maxLength,
    value,
    className = '',
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    const hasError = !!error
    const hasSuccess = !!success

    return (
        <div className={`form-field form-field--${size} form-field--${variant} ${hasError ? 'form-field--error' : ''} ${hasSuccess ? 'form-field--success' : ''} ${className}`}>
            {(label || description) && (
                <div className="form-field__header">
                    {label && (
                        <label className="form-field__label">
                            {label}
                            {props.required && <span className="form-field__required">*</span>}
                        </label>
                    )}
                    {description && (
                        <span className="form-field__description">{description}</span>
                    )}
                </div>
            )}

            <div className="form-field__input-wrapper">
                {leftIcon && <span className="form-field__icon form-field__icon--left">{leftIcon}</span>}

                <input
                    ref={ref}
                    type={inputType}
                    maxLength={maxLength}
                    value={value}
                    className="form-field__input"
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        className="form-field__toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}

                {rightIcon && !isPassword && (
                    <span className="form-field__icon form-field__icon--right">{rightIcon}</span>
                )}

                {hasError && <AlertCircle size={16} className="form-field__status-icon form-field__status-icon--error" />}
                {hasSuccess && <Check size={16} className="form-field__status-icon form-field__status-icon--success" />}
            </div>

            <div className="form-field__footer">
                {error && <span className="form-field__error">{error}</span>}
                {success && <span className="form-field__success">{success}</span>}
                {hint && !error && !success && (
                    <span className="form-field__hint">
                        <Info size={12} />
                        {hint}
                    </span>
                )}
                {showCharCount && maxLength && (
                    <span className="form-field__char-count">
                        {String(value || '').length}/{maxLength}
                    </span>
                )}
            </div>
        </div>
    )
})

FormField.displayName = 'FormField'

// Textarea variant
interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    description?: string
    error?: string
    success?: string
    hint?: string
    showCharCount?: boolean
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(({
    label,
    description,
    error,
    success,
    hint,
    showCharCount = false,
    maxLength,
    value,
    className = '',
    ...props
}, ref) => {
    const hasError = !!error
    const hasSuccess = !!success

    return (
        <div className={`form-field ${hasError ? 'form-field--error' : ''} ${hasSuccess ? 'form-field--success' : ''} ${className}`}>
            {(label || description) && (
                <div className="form-field__header">
                    {label && (
                        <label className="form-field__label">
                            {label}
                            {props.required && <span className="form-field__required">*</span>}
                        </label>
                    )}
                    {description && <span className="form-field__description">{description}</span>}
                </div>
            )}

            <textarea
                ref={ref}
                maxLength={maxLength}
                value={value}
                className="form-field__textarea"
                {...props}
            />

            <div className="form-field__footer">
                {error && <span className="form-field__error">{error}</span>}
                {success && <span className="form-field__success">{success}</span>}
                {hint && !error && !success && (
                    <span className="form-field__hint"><Info size={12} />{hint}</span>
                )}
                {showCharCount && maxLength && (
                    <span className="form-field__char-count">
                        {String(value || '').length}/{maxLength}
                    </span>
                )}
            </div>
        </div>
    )
})

TextAreaField.displayName = 'TextAreaField'

// Select field
interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    description?: string
    error?: string
    options: { value: string; label: string; disabled?: boolean }[]
    placeholder?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(({
    label,
    description,
    error,
    options,
    placeholder,
    className = '',
    ...props
}, ref) => {
    return (
        <div className={`form-field ${error ? 'form-field--error' : ''} ${className}`}>
            {(label || description) && (
                <div className="form-field__header">
                    {label && (
                        <label className="form-field__label">
                            {label}
                            {props.required && <span className="form-field__required">*</span>}
                        </label>
                    )}
                    {description && <span className="form-field__description">{description}</span>}
                </div>
            )}

            <select ref={ref} className="form-field__select" {...props}>
                {placeholder && <option value="">{placeholder}</option>}
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {error && (
                <div className="form-field__footer">
                    <span className="form-field__error">{error}</span>
                </div>
            )}
        </div>
    )
})

SelectField.displayName = 'SelectField'

export default FormField
