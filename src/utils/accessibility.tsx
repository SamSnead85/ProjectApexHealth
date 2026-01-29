import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook to announce content to screen readers
 */
export function useAnnounce() {
    const announcerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        // Create announcer element if it doesn't exist
        let announcer = document.getElementById('a11y-announcer') as HTMLDivElement
        if (!announcer) {
            announcer = document.createElement('div')
            announcer.id = 'a11y-announcer'
            announcer.setAttribute('aria-live', 'polite')
            announcer.setAttribute('aria-atomic', 'true')
            announcer.className = 'sr-only'
            document.body.appendChild(announcer)
        }
        announcerRef.current = announcer

        return () => {
            // Don't remove on cleanup - other components might be using it
        }
    }, [])

    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        if (announcerRef.current) {
            announcerRef.current.setAttribute('aria-live', priority)
            announcerRef.current.textContent = message
            // Clear after brief delay to allow re-announcement of same message
            setTimeout(() => {
                if (announcerRef.current) {
                    announcerRef.current.textContent = ''
                }
            }, 1000)
        }
    }, [])

    return announce
}

/**
 * Hook to trap focus within an element (for modals, dialogs)
 */
export function useFocusTrap(isActive: boolean) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isActive || !containerRef.current) return

        const container = containerRef.current
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        // Store previously focused element
        const previouslyFocused = document.activeElement as HTMLElement

        // Focus first element
        firstElement?.focus()

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

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            // Restore focus
            previouslyFocused?.focus()
        }
    }, [isActive])

    return containerRef
}

/**
 * Hook to detect reduced motion preference
 */
export function useReducedMotion() {
    const mediaQuery = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null

    const getInitialState = () => mediaQuery?.matches ?? false
    const [reducedMotion, setReducedMotion] = useState(getInitialState)

    useEffect(() => {
        if (!mediaQuery) return

        const handleChange = (e: MediaQueryListEvent) => {
            setReducedMotion(e.matches)
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [mediaQuery])

    return reducedMotion
}

/**
 * Hook to manage keyboard shortcuts
 */
interface KeyboardShortcut {
    key: string
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    action: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                const matchesKey = e.key.toLowerCase() === shortcut.key.toLowerCase()
                const matchesCtrl = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
                const matchesShift = shortcut.shift ? e.shiftKey : !e.shiftKey
                const matchesAlt = shortcut.alt ? e.altKey : !e.altKey

                if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
                    e.preventDefault()
                    shortcut.action()
                    break
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [shortcuts])
}

// Need useState
import { useState } from 'react'

/**
 * Skip Link Component
 */
export function SkipLink({ targetId, children }: { targetId: string; children: React.ReactNode }) {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        const target = document.getElementById(targetId)
        target?.focus()
        target?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <a href={`#${targetId}`} className="skip-to-content" onClick={handleClick}>
            {children}
        </a>
    )
}

/**
 * Accessible Icon Button
 */
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode
    label: string
}

export function IconButton({ icon, label, ...props }: IconButtonProps) {
    return (
        <button {...props} aria-label={label} title={label}>
            {icon}
            <span className="sr-only">{label}</span>
        </button>
    )
}

/**
 * Live Region for dynamic content announcements
 */
export function LiveRegion({ message, priority = 'polite' }: { message: string; priority?: 'polite' | 'assertive' }) {
    return (
        <div aria-live={priority} aria-atomic="true" className="sr-only">
            {message}
        </div>
    )
}

export default {
    useAnnounce,
    useFocusTrap,
    useReducedMotion,
    useKeyboardShortcuts,
    SkipLink,
    IconButton,
    LiveRegion
}
