import { motion } from 'framer-motion'
import './Switch.css'

interface SwitchProps {
    checked: boolean
    onChange: (checked: boolean) => void
    label?: string
    description?: string
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function Switch({
    checked,
    onChange,
    label,
    description,
    disabled = false,
    size = 'md',
    className = ''
}: SwitchProps) {
    const handleClick = () => {
        if (!disabled) {
            onChange(!checked)
        }
    }

    return (
        <label className={`switch switch--${size} ${disabled ? 'switch--disabled' : ''} ${className}`}>
            <div className="switch__content">
                {label && <span className="switch__label">{label}</span>}
                {description && <span className="switch__description">{description}</span>}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                className={`switch__track ${checked ? 'switch__track--checked' : ''}`}
                onClick={handleClick}
                disabled={disabled}
            >
                <motion.span
                    className="switch__thumb"
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            </button>
        </label>
    )
}

// Simple inline switch
export function InlineSwitch({
    checked,
    onChange,
    disabled = false,
    className = ''
}: Omit<SwitchProps, 'label' | 'description' | 'size'>) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            className={`inline-switch ${checked ? 'inline-switch--checked' : ''} ${disabled ? 'inline-switch--disabled' : ''} ${className}`}
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
        >
            <motion.span
                className="inline-switch__thumb"
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </button>
    )
}

export default Switch
