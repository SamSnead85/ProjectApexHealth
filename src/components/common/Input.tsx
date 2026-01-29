import { InputHTMLAttributes, ReactNode, forwardRef } from 'react'
import './Input.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    hint?: string
    icon?: ReactNode
    iconPosition?: 'left' | 'right'
    fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    hint,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
    id,
    ...props
}, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    const wrapperClass = [
        'apex-input-wrapper',
        fullWidth ? 'apex-input-wrapper--full' : '',
        error ? 'apex-input-wrapper--error' : '',
        className
    ].filter(Boolean).join(' ')

    const inputClass = [
        'apex-input',
        icon && iconPosition === 'left' ? 'apex-input--icon-left' : '',
        icon && iconPosition === 'right' ? 'apex-input--icon-right' : ''
    ].filter(Boolean).join(' ')

    return (
        <div className={wrapperClass}>
            {label && (
                <label htmlFor={inputId} className="apex-input__label">
                    {label}
                </label>
            )}
            <div className="apex-input__container">
                {icon && iconPosition === 'left' && (
                    <span className="apex-input__icon apex-input__icon--left">{icon}</span>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={inputClass}
                    {...props}
                />
                {icon && iconPosition === 'right' && (
                    <span className="apex-input__icon apex-input__icon--right">{icon}</span>
                )}
            </div>
            {(error || hint) && (
                <span className={`apex-input__message ${error ? 'apex-input__message--error' : ''}`}>
                    {error || hint}
                </span>
            )}
        </div>
    )
})

Input.displayName = 'Input'

export default Input
