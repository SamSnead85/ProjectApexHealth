import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

// ============================================================================
// ERROR STATE COMPONENT
// ============================================================================

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
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
      {/* Error icon with red-accented circular background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'var(--apex-critical-soft, rgba(239, 68, 68, 0.15))',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          color: 'var(--apex-critical, #EF4444)',
        }}
      >
        <AlertTriangle size={34} strokeWidth={1.5} />
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

      {/* Error message */}
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.3 }}
          style={{
            margin: '0 0 4px',
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--apex-silver, #A1A1AA)',
            maxWidth: 420,
          }}
        >
          {message}
        </motion.p>
      )}

      {/* Action row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.3 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginTop: 24,
        }}
      >
        {/* Try Again button */}
        {onRetry && (
          <motion.button
            whileHover={{
              scale: 1.04,
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onRetry}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              fontSize: 14,
              fontWeight: 500,
              color: '#fff',
              background: 'var(--apex-critical, #EF4444)',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <RefreshCw size={15} />
            Try Again
          </motion.button>
        )}

        {/* Contact Support link */}
        <a
          href="mailto:support@apexhealth.io"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--apex-steel, #71717A)',
            textDecoration: 'none',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = 'var(--apex-silver, #A1A1AA)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = 'var(--apex-steel, #71717A)')
          }
        >
          <ExternalLink size={13} />
          Contact Support
        </a>
      </motion.div>
    </motion.div>
  )
}

export default ErrorState
