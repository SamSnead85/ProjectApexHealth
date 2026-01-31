import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor, Eye, Type, Volume2, VolumeX, Contrast, ZoomIn, ZoomOut, Focus } from 'lucide-react'
import './Accessibility.css'

// Skip Link for keyboard navigation
interface SkipLinkProps {
    targetId: string
    label?: string
}

export function SkipLink({ targetId, label = 'Skip to main content' }: SkipLinkProps) {
    return (
        <a href={`#${targetId}`} className="skip-link">
            {label}
        </a>
    )
}

// Visual for screen readers only
interface ScreenReaderOnlyProps {
    children: ReactNode
}

export function ScreenReaderOnly({ children }: ScreenReaderOnlyProps) {
    return <span className="sr-only">{children}</span>
}

// Announce changes for screen readers
interface LiveRegionProps {
    message: string
    politeness?: 'polite' | 'assertive'
    atomic?: boolean
}

export function LiveRegion({ message, politeness = 'polite', atomic = true }: LiveRegionProps) {
    return (
        <div
            aria-live={politeness}
            aria-atomic={atomic}
            className="sr-only"
        >
            {message}
        </div>
    )
}

// Focus trap for modals
interface FocusTrapProps {
    children: ReactNode
    active?: boolean
}

export function FocusTrap({ children, active = true }: FocusTrapProps) {
    useEffect(() => {
        if (!active) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return

            const container = document.querySelector('[data-focus-trap="true"]')
            if (!container) return

            const focusable = container.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )

            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault()
                last?.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault()
                first?.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [active])

    return (
        <div data-focus-trap={active}>
            {children}
        </div>
    )
}

// Accessibility Panel
interface AccessibilityPanelProps {
    isOpen: boolean
    onClose: () => void
}

export function AccessibilityPanel({ isOpen, onClose }: AccessibilityPanelProps) {
    const [fontSize, setFontSize] = useState(100)
    const [highContrast, setHighContrast] = useState(false)
    const [reduceMotion, setReduceMotion] = useState(false)
    const [focusMode, setFocusMode] = useState(false)

    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}%`
    }, [fontSize])

    useEffect(() => {
        document.documentElement.classList.toggle('high-contrast', highContrast)
    }, [highContrast])

    useEffect(() => {
        document.documentElement.classList.toggle('reduce-motion', reduceMotion)
    }, [reduceMotion])

    useEffect(() => {
        document.documentElement.classList.toggle('focus-mode', focusMode)
    }, [focusMode])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="accessibility-panel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                >
                    <div className="accessibility-panel__header">
                        <h3>Accessibility Options</h3>
                        <button onClick={onClose} className="accessibility-panel__close">×</button>
                    </div>

                    <div className="accessibility-panel__content">
                        <div className="accessibility-panel__group">
                            <label className="accessibility-panel__label">
                                <Type size={16} />
                                Text Size
                            </label>
                            <div className="accessibility-panel__controls">
                                <button onClick={() => setFontSize(Math.max(80, fontSize - 10))}>
                                    <ZoomOut size={16} />
                                </button>
                                <span>{fontSize}%</span>
                                <button onClick={() => setFontSize(Math.min(150, fontSize + 10))}>
                                    <ZoomIn size={16} />
                                </button>
                            </div>
                        </div>

                        <button
                            className={`accessibility-panel__option ${highContrast ? 'accessibility-panel__option--active' : ''}`}
                            onClick={() => setHighContrast(!highContrast)}
                        >
                            <Contrast size={16} />
                            <span>High Contrast</span>
                        </button>

                        <button
                            className={`accessibility-panel__option ${reduceMotion ? 'accessibility-panel__option--active' : ''}`}
                            onClick={() => setReduceMotion(!reduceMotion)}
                        >
                            <Eye size={16} />
                            <span>Reduce Motion</span>
                        </button>

                        <button
                            className={`accessibility-panel__option ${focusMode ? 'accessibility-panel__option--active' : ''}`}
                            onClick={() => setFocusMode(!focusMode)}
                        >
                            <Focus size={16} />
                            <span>Focus Mode</span>
                        </button>

                        <button
                            className="accessibility-panel__reset"
                            onClick={() => {
                                setFontSize(100)
                                setHighContrast(false)
                                setReduceMotion(false)
                                setFocusMode(false)
                            }}
                        >
                            Reset All
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Floating accessibility button
interface AccessibilityToggleProps {
    className?: string
}

export function AccessibilityToggle({ className = '' }: AccessibilityToggleProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <motion.button
                className={`accessibility-toggle ${className}`}
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Accessibility options"
            >
                <Eye size={20} />
            </motion.button>

            <AccessibilityPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    )
}

export default AccessibilityToggle
