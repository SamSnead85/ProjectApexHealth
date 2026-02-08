import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorFallback } from './ErrorHandling'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

/**
 * React Error Boundary - catches unhandled errors in the component tree
 * and displays a recovery UI instead of crashing the entire app.
 *
 * Must be a class component per React API requirements.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to error reporting service in production
        console.error('[ErrorBoundary] Uncaught error:', error, errorInfo)
        this.props.onError?.(error, errorInfo)
    }

    resetError = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError && this.state.error) {
            if (this.props.fallback) {
                return this.props.fallback
            }
            return (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    background: 'var(--apex-bg-primary, #0a0a0f)',
                    padding: '2rem',
                }}>
                    <ErrorFallback
                        error={this.state.error}
                        resetError={this.resetError}
                    />
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
