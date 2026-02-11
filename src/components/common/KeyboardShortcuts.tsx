import React, { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Command, Keyboard } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface KeyboardShortcutsProps {
  isOpen: boolean
  onClose: () => void
}

interface ShortcutGroup {
  title: string
  shortcuts: { keys: string[]; description: string }[]
}

// ============================================================================
// SHORTCUT DATA
// ============================================================================

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Global',
    shortcuts: [
      { keys: ['?'], description: 'Toggle this shortcuts dialog' },
      { keys: ['⌘', 'K'], description: 'Command Palette' },
      { keys: ['⌘', '/'], description: 'AI Copilot' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'B'], description: 'Toggle Sidebar' },
      { keys: ['G', 'then', 'D'], description: 'Dashboard' },
      { keys: ['G', 'then', 'C'], description: 'Claims' },
      { keys: ['G', 'then', 'A'], description: 'Analytics' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['⌘', 'S'], description: 'Save' },
      { keys: ['⌘', 'E'], description: 'Export' },
      { keys: ['⌘', 'N'], description: 'New' },
    ],
  },
]

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  modal: {
    width: '100%',
    maxWidth: 520,
    margin: '0 24px',
    borderRadius: 16,
    background: 'rgba(18, 18, 26, 0.92)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px 16px',
    borderBottom: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--apex-white, #FFFFFF)',
    letterSpacing: '-0.01em',
  },
  closeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
    borderRadius: 8,
    color: 'var(--apex-steel, #71717A)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  body: {
    padding: '16px 24px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
  },
  groupTitle: {
    margin: 0,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: 'var(--apex-steel, #71717A)',
    marginBottom: 8,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 0',
  },
  description: {
    fontSize: 13,
    color: 'var(--apex-silver, #A1A1AA)',
  },
  keysContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  kbd: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 26,
    height: 26,
    padding: '0 7px',
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'inherit',
    color: 'var(--apex-white, #FFFFFF)',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: 6,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
  },
  kbdSeparator: {
    fontSize: 11,
    color: 'var(--apex-muted, #52525B)',
    padding: '0 2px',
  },
  footer: {
    padding: '12px 24px',
    borderTop: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
    textAlign: 'center' as const,
    fontSize: 12,
    color: 'var(--apex-muted, #52525B)',
  },
} as const

// ============================================================================
// KEYBOARD SHORTCUTS COMPONENT
// ============================================================================

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={styles.overlay}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.headerLeft}>
                <Keyboard
                  size={18}
                  style={{ color: 'var(--apex-teal, #06B6D4)' }}
                />
                <h3 style={styles.title}>Keyboard Shortcuts</h3>
              </div>
              <button
                style={styles.closeBtn}
                onClick={onClose}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = 'var(--apex-white, #FFFFFF)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.color = 'var(--apex-steel, #71717A)'
                }}
                aria-label="Close shortcuts"
              >
                <X size={16} />
              </button>
            </div>

            {/* Shortcut groups */}
            <div style={styles.body}>
              {shortcutGroups.map((group) => (
                <div key={group.title}>
                  <p style={styles.groupTitle}>{group.title}</p>
                  {group.shortcuts.map((shortcut) => (
                    <div key={shortcut.description} style={styles.row}>
                      <span style={styles.description}>
                        {shortcut.description}
                      </span>
                      <span style={styles.keysContainer}>
                        {shortcut.keys.map((key, i) =>
                          key === 'then' ? (
                            <span key={i} style={styles.kbdSeparator}>
                              then
                            </span>
                          ) : (
                            <kbd key={i} style={styles.kbd}>
                              {key}
                            </kbd>
                          )
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              Press <kbd style={{ ...styles.kbd, height: 22, minWidth: 22, fontSize: 11 }}>?</kbd> to
              toggle &middot; <kbd style={{ ...styles.kbd, height: 22, minWidth: 22, fontSize: 11 }}>Esc</kbd> to
              close
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default KeyboardShortcuts
