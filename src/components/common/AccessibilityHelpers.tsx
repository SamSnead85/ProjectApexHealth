import { ReactNode, useRef, useEffect, HTMLAttributes, forwardRef, ComponentPropsWithRef } from 'react'
import './AccessibilityHelpers.css'

// Screen Reader Only
interface SROnlyProps {
    children: ReactNode
    focusable?: boolean
}

export function SROnly({ children, focusable = false }: SROnlyProps) {
    return (
        <span className={`sr-only ${focusable ? 'sr-only--focusable' : ''}`}>
            {children}
        </span>
    )
}

// Skip Link
interface SkipLinkProps {
    href: string
    children?: ReactNode
}

export function SkipLink({ href, children = 'Skip to main content' }: SkipLinkProps) {
    return (
        <a href={href} className="skip-link">
            {children}
        </a>
    )
}

// Focus Trap
interface FocusTrapProps {
    children: ReactNode
    active?: boolean
    initialFocus?: boolean
    returnFocus?: boolean
}

export function FocusTrap({ children, active = true, initialFocus = true, returnFocus = true }: FocusTrapProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const previousActiveElement = useRef<HTMLElement | null>(null)

    useEffect(() => {
        if (!active) return

        previousActiveElement.current = document.activeElement as HTMLElement

        const container = containerRef.current
        if (!container) return

        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (initialFocus && firstElement) {
            firstElement.focus()
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault()
                    lastElement?.focus()
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault()
                    firstElement?.focus()
                }
            }
        }

        container.addEventListener('keydown', handleKeyDown)

        return () => {
            container.removeEventListener('keydown', handleKeyDown)
            if (returnFocus && previousActiveElement.current) {
                previousActiveElement.current.focus()
            }
        }
    }, [active, initialFocus, returnFocus])

    return (
        <div ref={containerRef}>
            {children}
        </div>
    )
}

// Live Region (for announcements)
interface LiveRegionProps {
    message: string
    politeness?: 'polite' | 'assertive'
    atomic?: boolean
}

export function LiveRegion({ message, politeness = 'polite', atomic = true }: LiveRegionProps) {
    return (
        <div
            role="status"
            aria-live={politeness}
            aria-atomic={atomic}
            className="sr-only"
        >
            {message}
        </div>
    )
}

// Accessible Label
interface AccessibleLabelProps {
    id: string
    label: string
    description?: string
    required?: boolean
    children: ReactNode
}

export function AccessibleLabel({ id, label, description, required, children }: AccessibleLabelProps) {
    return (
        <div className="accessible-label">
            <label htmlFor={id} className="accessible-label__label">
                {label}
                {required && <span className="accessible-label__required" aria-label="required">*</span>}
            </label>
            {description && (
                <span id={`${id}-description`} className="accessible-label__description">
                    {description}
                </span>
            )}
            {children}
        </div>
    )
}

// Accessible Button
interface AccessibleButtonProps extends ComponentPropsWithRef<'button'> {
    loading?: boolean
    loadingText?: string
    icon?: ReactNode
    iconPosition?: 'left' | 'right'
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
    ({ children, loading, loadingText, icon, iconPosition = 'left', disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                aria-busy={loading}
                aria-disabled={disabled || loading}
                className="accessible-button"
                {...props}
            >
                {loading ? (
                    <>
                        <span className="accessible-button__spinner" aria-hidden="true" />
                        <span className="sr-only">{loadingText || 'Loading'}</span>
                        {loadingText && <span aria-hidden="true">{loadingText}</span>}
                    </>
                ) : (
                    <>
                        {icon && iconPosition === 'left' && <span aria-hidden="true">{icon}</span>}
                        {children}
                        {icon && iconPosition === 'right' && <span aria-hidden="true">{icon}</span>}
                    </>
                )}
            </button>
        )
    }
)

AccessibleButton.displayName = 'AccessibleButton'

// Accessible Link
interface AccessibleLinkProps extends ComponentPropsWithRef<'a'> {
    external?: boolean
    children: ReactNode
}

export const AccessibleLink = forwardRef<HTMLAnchorElement, AccessibleLinkProps>(
    ({ external, children, ...props }, ref) => {
        const externalProps = external ? {
            target: '_blank',
            rel: 'noopener noreferrer'
        } : {}

        return (
            <a ref={ref} className="accessible-link" {...externalProps} {...props}>
                {children}
                {external && (
                    <span className="sr-only"> (opens in new tab)</span>
                )}
            </a>
        )
    }
)

AccessibleLink.displayName = 'AccessibleLink'

// Error Summary
interface ErrorSummaryProps {
    errors: Array<{ id: string; message: string }>
    title?: string
}

export function ErrorSummary({ errors, title = 'There were problems with your submission' }: ErrorSummaryProps) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (errors.length > 0) {
            ref.current?.focus()
        }
    }, [errors])

    if (errors.length === 0) return null

    return (
        <div
            ref={ref}
            role="alert"
            aria-labelledby="error-summary-title"
            className="error-summary"
            tabIndex={-1}
        >
            <h2 id="error-summary-title" className="error-summary__title">
                {title}
            </h2>
            <ul className="error-summary__list">
                {errors.map(error => (
                    <li key={error.id}>
                        <a href={`#${error.id}`}>{error.message}</a>
                    </li>
                ))}
            </ul>
        </div>
    )
}

// Keyboard Hint
interface KeyboardHintProps {
    keys: string[]
    action: string
    className?: string
}

export function KeyboardHint({ keys, action, className = '' }: KeyboardHintProps) {
    return (
        <div className={`keyboard-hint ${className}`}>
            <div className="keyboard-hint__keys">
                {keys.map((key, i) => (
                    <span key={i}>
                        <kbd>{key}</kbd>
                        {i < keys.length - 1 && <span>+</span>}
                    </span>
                ))}
            </div>
            <span className="keyboard-hint__action">{action}</span>
        </div>
    )
}

// Focus Visible Wrapper
interface FocusVisibleProps {
    children: ReactNode
    className?: string
}

export function FocusVisible({ children, className = '' }: FocusVisibleProps) {
    return (
        <div className={`focus-visible-wrapper ${className}`}>
            {children}
        </div>
    )
}

export default { SROnly, SkipLink, FocusTrap, LiveRegion, AccessibleLabel, AccessibleButton, AccessibleLink, ErrorSummary, KeyboardHint, FocusVisible }
