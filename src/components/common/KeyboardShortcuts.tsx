import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './KeyboardShortcuts.css'

interface ShortcutAction {
    key: string
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
    description: string
    action: () => void
}

interface KeyboardShortcutsProviderProps {
    shortcuts: ShortcutAction[]
    children: React.ReactNode
}

export function useKeyboardShortcut(
    key: string,
    callback: () => void,
    modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean } = {}
) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (
                e.key.toLowerCase() === key.toLowerCase() &&
                !!e.ctrlKey === !!modifiers.ctrl &&
                !!e.shiftKey === !!modifiers.shift &&
                !!e.altKey === !!modifiers.alt &&
                !!e.metaKey === !!modifiers.meta
            ) {
                // Don't trigger if user is typing in an input
                const target = e.target as HTMLElement
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                    return
                }
                e.preventDefault()
                callback()
            }
        }

        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [key, callback, modifiers.ctrl, modifiers.shift, modifiers.alt, modifiers.meta])
}

// Keyboard shortcut help modal
export function KeyboardShortcutsHelp({
    shortcuts,
    isOpen,
    onClose
}: {
    shortcuts: ShortcutAction[]
    isOpen: boolean
    onClose: () => void
}) {
    useKeyboardShortcut('Escape', onClose)

    const formatKey = (shortcut: ShortcutAction) => {
        const parts: string[] = []
        if (shortcut.ctrl) parts.push('Ctrl')
        if (shortcut.shift) parts.push('Shift')
        if (shortcut.alt) parts.push('Alt')
        if (shortcut.meta) parts.push('⌘')
        parts.push(shortcut.key.toUpperCase())
        return parts.join(' + ')
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="keyboard-shortcuts__overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="keyboard-shortcuts__modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    >
                        <div className="keyboard-shortcuts__header">
                            <h3 className="keyboard-shortcuts__title">Keyboard Shortcuts</h3>
                            <button className="keyboard-shortcuts__close" onClick={onClose}>×</button>
                        </div>
                        <div className="keyboard-shortcuts__list">
                            {shortcuts.map((shortcut, index) => (
                                <div key={index} className="keyboard-shortcuts__item">
                                    <span className="keyboard-shortcuts__description">{shortcut.description}</span>
                                    <kbd className="keyboard-shortcuts__key">{formatKey(shortcut)}</kbd>
                                </div>
                            ))}
                        </div>
                        <div className="keyboard-shortcuts__footer">
                            Press <kbd>?</kbd> to toggle this help
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// Global keyboard shortcuts provider
export function KeyboardShortcutsProvider({ shortcuts, children }: KeyboardShortcutsProviderProps) {
    const [showHelp, setShowHelp] = useState(false)

    // Register all shortcuts
    shortcuts.forEach(shortcut => {
        useKeyboardShortcut(
            shortcut.key,
            shortcut.action,
            { ctrl: shortcut.ctrl, shift: shortcut.shift, alt: shortcut.alt, meta: shortcut.meta }
        )
    })

    // Help toggle
    useKeyboardShortcut('?', () => setShowHelp(prev => !prev), { shift: true })

    return (
        <>
            {children}
            <KeyboardShortcutsHelp
                shortcuts={shortcuts}
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
            />
        </>
    )
}

export default KeyboardShortcutsProvider
