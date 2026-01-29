import React from 'react'
import './StatusIndicator.css'

interface StatusIndicatorProps {
    status: 'active' | 'pending' | 'inactive' | 'error' | 'success' | 'warning' | 'offline' | 'online'
    label?: string
    pulse?: boolean
    size?: 'sm' | 'md' | 'lg'
}

export function StatusIndicator({
    status,
    label,
    pulse = false,
    size = 'md'
}: StatusIndicatorProps) {
    const showPulse = pulse || status === 'active' || status === 'online'

    return (
        <div className={`status-indicator status-indicator--${size}`}>
            <span className={`status-dot status-dot--${status} ${showPulse ? 'pulse' : ''}`} />
            {label && <span className="status-label">{label}</span>}
        </div>
    )
}

// Connection Status Component
export function ConnectionStatus({ isOnline }: { isOnline: boolean }) {
    return (
        <StatusIndicator
            status={isOnline ? 'online' : 'offline'}
            label={isOnline ? 'Connected' : 'Offline'}
            pulse={isOnline}
            size="sm"
        />
    )
}

// Coverage Status Component
export function CoverageStatus({ status }: { status: 'active' | 'pending' | 'expired' }) {
    const labels: Record<string, string> = {
        active: 'Coverage Active',
        pending: 'Pending Approval',
        expired: 'Coverage Expired'
    }

    return (
        <StatusIndicator
            status={status === 'expired' ? 'error' : status}
            label={labels[status]}
            pulse={status === 'active'}
        />
    )
}

// Claim Status Component
export function ClaimStatus({ status }: { status: 'approved' | 'pending' | 'denied' | 'processing' }) {
    const statusMap: Record<string, 'success' | 'warning' | 'error' | 'pending'> = {
        approved: 'success',
        pending: 'pending',
        denied: 'error',
        processing: 'warning'
    }

    const labels: Record<string, string> = {
        approved: 'Approved',
        pending: 'Pending Review',
        denied: 'Denied',
        processing: 'Processing'
    }

    return (
        <StatusIndicator
            status={statusMap[status]}
            label={labels[status]}
            pulse={status === 'processing'}
        />
    )
}

export default StatusIndicator
