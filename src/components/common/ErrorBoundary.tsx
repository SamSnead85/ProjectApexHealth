import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onReset?: () => void
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    level?: 'page' | 'section' | 'widget'
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

/* ─── Level-based sizing ──────────────────────────────────── */
const levelStyles: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', padding: '2rem' },
    section: { minHeight: '320px', padding: '1.5rem' },
    widget: { minHeight: '180px', padding: '1rem' },
}

const iconSizes: Record<string, number> = {
    page: 48,
    section: 36,
    widget: 24,
}

const headingSizes: Record<string, string> = {
    page: '1.5rem',
    section: '1.25rem',
    widget: '1rem',
}

/* ─── Error display component ─────────────────────────────── */
function ErrorDisplay({
    error,
    level = 'page',
    onReset,
}: {
    error: Error
    level: 'page' | 'section' | 'widget'
    onReset?: () => void
}) {
    const isCompact = level === 'widget'

    const handleTryAgain = () => {
        if (onReset) {
            onReset()
        } else {
            window.location.reload()
        }
    }

    const handleGoHome = () => {
        window.location.href = '/'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: isCompact ? '0.75rem' : '1.25rem',
                ...levelStyles[level],
                background: level === 'page' ? 'var(--page-bg, #f8fafc)' : 'var(--card-bg, #ffffff)',
                borderRadius: level === 'page' ? 0 : '12px',
                border: level === 'page' ? 'none' : '1px solid var(--card-border, rgba(0,0,0,0.08))',
            }}
        >
            {/* Error Icon */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: iconSizes[level] * 1.75,
                    height: iconSizes[level] * 1.75,
                    borderRadius: '50%',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                }}
            >
                <AlertTriangle
                    size={iconSizes[level]}
                    style={{ color: '#ef4444' }}
                />
            </div>

            {/* Heading */}
            <h2
                style={{
                    margin: 0,
                    fontSize: headingSizes[level],
                    fontWeight: 600,
                    color: 'var(--text-primary, #1e293b)',
                    letterSpacing: '-0.01em',
                }}
            >
                Something went wrong
            </h2>

            {/* Error message code block */}
            {!isCompact && (
                <div
                    style={{
                        maxWidth: '520px',
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'rgba(0,0,0,0.04)',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.08)',
                        fontFamily: 'ui-monospace, "Cascadia Code", "Fira Code", monospace',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary, #64748b)',
                        textAlign: 'left',
                        wordBreak: 'break-word',
                        lineHeight: 1.6,
                        overflowY: 'auto',
                        maxHeight: '120px',
                    }}
                >
                    {error.message || 'An unexpected error occurred.'}
                </div>
            )}

            {/* Action buttons */}
            <div
                style={{
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
            >
                {/* Try Again */}
                <button
                    onClick={handleTryAgain}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: isCompact ? '0.4rem 0.85rem' : '0.6rem 1.25rem',
                        fontSize: isCompact ? '0.8rem' : '0.875rem',
                        fontWeight: 500,
                        color: '#fff',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                    <RefreshCw size={isCompact ? 14 : 16} />
                    Try Again
                </button>

                {/* Go Home - only for page/section levels */}
                {level !== 'widget' && (
                    <button
                        onClick={handleGoHome}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1.25rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'var(--text-secondary, #64748b)',
                            background: 'rgba(0,0,0,0.04)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0,0,0,0.08)'
                            e.currentTarget.style.color = '#1e293b'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
                            e.currentTarget.style.color = '#64748b'
                        }}
                    >
                        <Home size={16} />
                        Go Home
                    </button>
                )}
            </div>

            {/* Report Issue link - page level only */}
            {level === 'page' && (
                <a
                    href="mailto:support@apexhealth.io?subject=Error Report"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        marginTop: '0.5rem',
                        fontSize: '0.8rem',
                        color: '#64748b',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#94a3b8')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                >
                    <MessageCircle size={14} />
                    Report Issue
                </a>
            )}
        </motion.div>
    )
}

/* ─── ErrorBoundary class component ───────────────────────── */

/**
 * React Error Boundary - catches unhandled errors in the component tree
 * and displays a recovery UI instead of crashing the entire app.
 *
 * Supports three levels:
 *  - `page`    – full-screen recovery UI (default)
 *  - `section` – mid-size recovery for page sections
 *  - `widget`  – compact inline recovery for small widgets
 *
 * Must be a class component per React API requirements.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo })
        // Log to error reporting service in production
        console.error('[ErrorBoundary] Uncaught error:', error, errorInfo)
        this.props.onError?.(error, errorInfo)
    }

    resetError = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
        this.props.onReset?.()
    }

    render() {
        if (this.state.hasError && this.state.error) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <ErrorDisplay
                    error={this.state.error}
                    level={this.props.level ?? 'page'}
                    onReset={this.resetError}
                />
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
