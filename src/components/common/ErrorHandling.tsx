import { ReactNode, useState, useEffect, useMemo, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, AlertTriangle, CheckCircle, Info, XCircle, RefreshCw, HelpCircle, ExternalLink, Copy, Bug, FileWarning, Wifi, WifiOff, Server, Database, Zap, Clock } from 'lucide-react'
import './ErrorHandling.css'

// Error Boundary UI
interface ErrorFallbackProps {
    error: Error
    resetError?: () => void
    className?: string
}

export function ErrorFallback({ error, resetError, className = '' }: ErrorFallbackProps) {
    const [showDetails, setShowDetails] = useState(false)
    const [copied, setCopied] = useState(false)

    const copyError = async () => {
        const errorText = `${error.name}: ${error.message}\n\n${error.stack || 'No stack trace'}`
        await navigator.clipboard.writeText(errorText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={`error-fallback ${className}`}>
            <div className="error-fallback__icon">
                <Bug size={48} />
            </div>
            <h2 className="error-fallback__title">Something went wrong</h2>
            <p className="error-fallback__message">{error.message}</p>

            <div className="error-fallback__actions">
                {resetError && (
                    <button className="error-fallback__btn error-fallback__btn--primary" onClick={resetError}>
                        <RefreshCw size={16} /> Try Again
                    </button>
                )}
                <button className="error-fallback__btn" onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
            </div>

            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        className="error-fallback__details"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="error-fallback__details-header">
                            <span>Error Details</span>
                            <button onClick={copyError}>
                                {copied ? 'Copied!' : <Copy size={14} />}
                            </button>
                        </div>
                        <pre>{error.stack || error.message}</pre>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Alert Banner
interface AlertBannerProps {
    type: 'info' | 'success' | 'warning' | 'error'
    title?: string
    message: string
    dismissible?: boolean
    onDismiss?: () => void
    action?: { label: string; onClick: () => void }
    className?: string
}

export function AlertBanner({
    type,
    title,
    message,
    dismissible = true,
    onDismiss,
    action,
    className = ''
}: AlertBannerProps) {
    const icons = {
        info: Info,
        success: CheckCircle,
        warning: AlertTriangle,
        error: XCircle
    }
    const Icon = icons[type]

    return (
        <motion.div
            className={`alert-banner alert-banner--${type} ${className}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <Icon className="alert-banner__icon" />
            <div className="alert-banner__content">
                {title && <strong className="alert-banner__title">{title}</strong>}
                <span className="alert-banner__message">{message}</span>
            </div>
            {action && (
                <button className="alert-banner__action" onClick={action.onClick}>
                    {action.label}
                </button>
            )}
            {dismissible && (
                <button className="alert-banner__dismiss" onClick={onDismiss}>
                    <XCircle size={16} />
                </button>
            )}
        </motion.div>
    )
}

// Status Page
interface SystemStatus {
    name: string
    status: 'operational' | 'degraded' | 'outage' | 'maintenance'
    latency?: number
    message?: string
}

interface StatusPageProps {
    systems: SystemStatus[]
    lastUpdated?: Date
    onRefresh?: () => void
    className?: string
}

export function StatusPage({ systems, lastUpdated, onRefresh, className = '' }: StatusPageProps) {
    const overallStatus = useMemo(() => {
        if (systems.some(s => s.status === 'outage')) return 'outage'
        if (systems.some(s => s.status === 'degraded')) return 'degraded'
        if (systems.some(s => s.status === 'maintenance')) return 'maintenance'
        return 'operational'
    }, [systems])

    const statusLabels = {
        operational: 'All Systems Operational',
        degraded: 'Degraded Performance',
        outage: 'System Outage',
        maintenance: 'Under Maintenance'
    }

    const statusIcons = {
        operational: CheckCircle,
        degraded: AlertTriangle,
        outage: XCircle,
        maintenance: Clock
    }

    const OverallIcon = statusIcons[overallStatus]

    return (
        <div className={`status-page ${className}`}>
            <div className={`status-page__header status-page__header--${overallStatus}`}>
                <OverallIcon size={24} />
                <h2>{statusLabels[overallStatus]}</h2>
            </div>

            <div className="status-page__systems">
                {systems.map((system, i) => {
                    const SystemIcon = statusIcons[system.status]
                    return (
                        <div key={i} className={`status-page__system status-page__system--${system.status}`}>
                            <div className="status-page__system-info">
                                <span className="status-page__system-name">{system.name}</span>
                                {system.message && (
                                    <span className="status-page__system-message">{system.message}</span>
                                )}
                            </div>
                            <div className="status-page__system-status">
                                {system.latency && (
                                    <span className="status-page__system-latency">{system.latency}ms</span>
                                )}
                                <SystemIcon size={16} />
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="status-page__footer">
                {lastUpdated && (
                    <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                )}
                {onRefresh && (
                    <button onClick={onRefresh}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                )}
            </div>
        </div>
    )
}

// Retry Button
interface RetryButtonProps {
    onRetry: () => Promise<void>
    maxAttempts?: number
    retryDelay?: number
    className?: string
}

export function RetryButton({
    onRetry,
    maxAttempts = 3,
    retryDelay = 1000,
    className = ''
}: RetryButtonProps) {
    const [attempts, setAttempts] = useState(0)
    const [isRetrying, setIsRetrying] = useState(false)
    const [countdown, setCountdown] = useState(0)

    const handleRetry = async () => {
        if (attempts >= maxAttempts) return

        setIsRetrying(true)
        try {
            await onRetry()
            setAttempts(0)
        } catch {
            setAttempts(prev => prev + 1)
            if (attempts + 1 < maxAttempts) {
                // Auto-retry with exponential backoff
                const delay = retryDelay * Math.pow(2, attempts)
                setCountdown(Math.ceil(delay / 1000))

                const interval = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(interval)
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)

                setTimeout(handleRetry, delay)
            }
        } finally {
            setIsRetrying(false)
        }
    }

    return (
        <button
            className={`retry-button ${isRetrying ? 'retry-button--retrying' : ''} ${className}`}
            onClick={handleRetry}
            disabled={isRetrying || attempts >= maxAttempts}
        >
            {isRetrying ? (
                <>
                    <RefreshCw size={16} className="spin" />
                    {countdown > 0 ? `Retrying in ${countdown}s...` : 'Retrying...'}
                </>
            ) : attempts >= maxAttempts ? (
                'Max retries reached'
            ) : (
                <>
                    <RefreshCw size={16} />
                    {attempts > 0 ? `Retry (${attempts}/${maxAttempts})` : 'Retry'}
                </>
            )}
        </button>
    )
}

// Validation Errors
interface ValidationError {
    field: string
    message: string
}

interface ValidationErrorsProps {
    errors: ValidationError[]
    onFieldClick?: (field: string) => void
    className?: string
}

export function ValidationErrors({ errors, onFieldClick, className = '' }: ValidationErrorsProps) {
    if (errors.length === 0) return null

    return (
        <motion.div
            className={`validation-errors ${className}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="validation-errors__header">
                <AlertCircle size={16} />
                <span>Please fix the following errors:</span>
            </div>
            <ul className="validation-errors__list">
                {errors.map((error, i) => (
                    <li key={i}>
                        <button onClick={() => onFieldClick?.(error.field)}>
                            <strong>{error.field}:</strong> {error.message}
                        </button>
                    </li>
                ))}
            </ul>
        </motion.div>
    )
}

// Connection Lost
interface ConnectionLostProps {
    onReconnect?: () => void
    retrying?: boolean
    className?: string
}

export function ConnectionLost({ onReconnect, retrying = false, className = '' }: ConnectionLostProps) {
    return (
        <div className={`connection-lost ${className}`}>
            <div className="connection-lost__icon">
                <WifiOff size={48} />
            </div>
            <h3>Connection Lost</h3>
            <p>We're having trouble connecting to the server. Please check your internet connection.</p>
            {onReconnect && (
                <button
                    className="connection-lost__btn"
                    onClick={onReconnect}
                    disabled={retrying}
                >
                    {retrying ? (
                        <><RefreshCw size={16} className="spin" /> Reconnecting...</>
                    ) : (
                        <><RefreshCw size={16} /> Try Again</>
                    )}
                </button>
            )}
        </div>
    )
}

export default { ErrorFallback, AlertBanner, StatusPage, RetryButton, ValidationErrors, ConnectionLost }
