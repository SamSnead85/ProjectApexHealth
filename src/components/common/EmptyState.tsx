import React from 'react'
import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '56px 24px',
        textAlign: 'center',
        minHeight: 300,
      }}
    >
      {/* Circular icon container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
        style={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          color: 'var(--apex-steel, #71717A)',
        }}
      >
        {icon || <Inbox size={36} strokeWidth={1.5} />}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.3 }}
        style={{
          margin: '0 0 8px',
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--apex-white, #FFFFFF)',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.3 }}
        style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.6,
          color: 'var(--apex-silver, #A1A1AA)',
          maxWidth: 380,
        }}
      >
        {description}
      </motion.p>

      {/* Optional action button */}
      {actionLabel && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.3 }}
          whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(6, 182, 212, 0.25)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          style={{
            marginTop: 24,
            padding: '10px 24px',
            fontSize: 14,
            fontWeight: 500,
            color: '#fff',
            background: 'var(--apex-teal, #2563EB)',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}

export default EmptyState
