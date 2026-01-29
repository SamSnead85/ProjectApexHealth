import { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'glass'
    size?: 'sm' | 'md' | 'lg'
    icon?: ReactNode
    iconPosition?: 'left' | 'right'
    loading?: boolean
    fullWidth?: boolean
    className?: string
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseClass = 'apex-btn'
    const variantClass = `apex-btn--${variant}`
    const sizeClass = `apex-btn--${size}`
    const fullWidthClass = fullWidth ? 'apex-btn--full' : ''
    const loadingClass = loading ? 'apex-btn--loading' : ''

    const classes = [baseClass, variantClass, sizeClass, fullWidthClass, loadingClass, className]
        .filter(Boolean)
        .join(' ')

    return (
        <motion.button
            className={classes}
            disabled={disabled || loading}
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -1 }}
            transition={{ duration: 0.1 }}
            {...props}
        >
            {loading && (
                <span className="apex-btn__spinner">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </span>
            )}
            {!loading && icon && iconPosition === 'left' && (
                <span className="apex-btn__icon apex-btn__icon--left">{icon}</span>
            )}
            <span className="apex-btn__text">{children}</span>
            {!loading && icon && iconPosition === 'right' && (
                <span className="apex-btn__icon apex-btn__icon--right">{icon}</span>
            )}
        </motion.button>
    )
}

export default Button
