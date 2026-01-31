import { ReactNode, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    AlertTriangle, CheckCircle, XCircle, Info, WifiOff, Battery,
    BatteryLow, BatteryMedium, BatteryFull, Signal, SignalLow,
    SignalMedium, SignalHigh, Thermometer, Clock, Activity
} from 'lucide-react'
import './StatusIndicators.css'

// Connection Status
type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error'

interface ConnectionIndicatorProps {
    status: ConnectionStatus
    label?: string
    showLabel?: boolean
    size?: 'sm' | 'md' | 'lg'
}

export function ConnectionIndicator({
    status,
    label,
    showLabel = false,
    size = 'md'
}: ConnectionIndicatorProps) {
    const labels = {
        connected: label || 'Connected',
        connecting: label || 'Connecting',
        disconnected: label || 'Disconnected',
        error: label || 'Error'
    }

    const icons = {
        connected: <Signal size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} />,
        connecting: <SignalMedium size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} className="pulse" />,
        disconnected: <WifiOff size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} />,
        error: <SignalLow size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} />
    }

    return (
        <div className={`connection-indicator connection-indicator--${status} connection-indicator--${size}`}>
            <span className="connection-indicator__dot" />
            {icons[status]}
            {showLabel && <span className="connection-indicator__label">{labels[status]}</span>}
        </div>
    )
}

// Battery Status
interface BatteryIndicatorProps {
    level: number
    charging?: boolean
    showPercentage?: boolean
    size?: 'sm' | 'md' | 'lg'
}

export function BatteryIndicator({
    level,
    charging = false,
    showPercentage = true,
    size = 'md'
}: BatteryIndicatorProps) {
    const getIcon = () => {
        if (level <= 20) return <BatteryLow size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
        if (level <= 50) return <BatteryMedium size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
        return <BatteryFull size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
    }

    const getStatus = () => {
        if (level <= 20) return 'low'
        if (level <= 50) return 'medium'
        return 'high'
    }

    return (
        <div className={`battery-indicator battery-indicator--${getStatus()} battery-indicator--${size} ${charging ? 'battery-indicator--charging' : ''}`}>
            {getIcon()}
            {showPercentage && <span className="battery-indicator__level">{level}%</span>}
            {charging && <span className="battery-indicator__charging">⚡</span>}
        </div>
    )
}

// Server Health
interface HealthMetric {
    name: string
    value: number
    max: number
    unit?: string
    status: 'healthy' | 'warning' | 'critical'
}

interface ServerHealthProps {
    metrics: HealthMetric[]
    className?: string
}

export function ServerHealth({ metrics, className = '' }: ServerHealthProps) {
    return (
        <div className={`server-health ${className}`}>
            {metrics.map((metric, index) => (
                <div key={index} className={`server-health__metric server-health__metric--${metric.status}`}>
                    <div className="server-health__header">
                        <span className="server-health__name">{metric.name}</span>
                        <span className="server-health__value">
                            {metric.value}{metric.unit}
                        </span>
                    </div>
                    <div className="server-health__bar">
                        <motion.div
                            className="server-health__fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${(metric.value / metric.max) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

// Status Badge
type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface StatusBadgeProps {
    status: BadgeStatus
    text: string
    icon?: ReactNode
    pulse?: boolean
    size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, text, icon, pulse = false, size = 'md' }: StatusBadgeProps) {
    const defaultIcons = {
        success: <CheckCircle size={12} />,
        warning: <AlertTriangle size={12} />,
        error: <XCircle size={12} />,
        info: <Info size={12} />,
        neutral: null
    }

    return (
        <span className={`status-badge status-badge--${status} status-badge--${size} ${pulse ? 'status-badge--pulse' : ''}`}>
            {(icon || defaultIcons[status]) && (
                <span className="status-badge__icon">{icon || defaultIcons[status]}</span>
            )}
            {text}
        </span>
    )
}

// Live Indicator
interface LiveIndicatorProps {
    isLive: boolean
    label?: string
    showDot?: boolean
}

export function LiveIndicator({ isLive, label = 'LIVE', showDot = true }: LiveIndicatorProps) {
    return (
        <div className={`live-indicator ${isLive ? 'live-indicator--active' : ''}`}>
            {showDot && <span className="live-indicator__dot" />}
            <span className="live-indicator__label">{label}</span>
        </div>
    )
}

// Sync Status
interface SyncStatusProps {
    lastSync?: Date
    status: 'synced' | 'syncing' | 'error' | 'offline'
    onSync?: () => void
}

export function SyncStatus({ lastSync, status, onSync }: SyncStatusProps) {
    const formatTime = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        return `${Math.floor(minutes / 60)}h ago`
    }

    return (
        <div className={`sync-status sync-status--${status}`}>
            <span className="sync-status__icon">
                {status === 'syncing' && <Activity size={14} className="spin" />}
                {status === 'synced' && <CheckCircle size={14} />}
                {status === 'error' && <XCircle size={14} />}
                {status === 'offline' && <WifiOff size={14} />}
            </span>
            <span className="sync-status__text">
                {status === 'syncing' && 'Syncing...'}
                {status === 'synced' && lastSync && `Synced ${formatTime(lastSync)}`}
                {status === 'error' && 'Sync failed'}
                {status === 'offline' && 'Offline'}
            </span>
            {onSync && status !== 'syncing' && (
                <button className="sync-status__btn" onClick={onSync}>
                    Sync now
                </button>
            )}
        </div>
    )
}

// Uptime Counter
interface UptimeCounterProps {
    startTime: Date
    className?: string
}

export function UptimeCounter({ startTime, className = '' }: UptimeCounterProps) {
    const [uptime, setUptime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

    useEffect(() => {
        const calculate = () => {
            const diff = Date.now() - startTime.getTime()
            setUptime({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60)
            })
        }

        calculate()
        const interval = setInterval(calculate, 1000)
        return () => clearInterval(interval)
    }, [startTime])

    const pad = (n: number) => n.toString().padStart(2, '0')

    return (
        <div className={`uptime-counter ${className}`}>
            <Clock size={16} />
            <span>
                {uptime.days > 0 && `${uptime.days}d `}
                {pad(uptime.hours)}:{pad(uptime.minutes)}:{pad(uptime.seconds)}
            </span>
        </div>
    )
}

export default { ConnectionIndicator, BatteryIndicator, ServerHealth, StatusBadge, LiveIndicator, SyncStatus, UptimeCounter }
