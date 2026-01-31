import { ReactNode, useState, useEffect, createContext, useContext, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, AlertTriangle, RefreshCw, Check, X, Download, Cloud, CloudOff } from 'lucide-react'
import './OfflineSupport.css'

// Connectivity Context
interface ConnectivityContextType {
    isOnline: boolean
    wasOffline: boolean
    syncStatus: 'idle' | 'syncing' | 'synced' | 'error'
    lastSync: Date | null
    pendingChanges: number
    sync: () => Promise<void>
}

const ConnectivityContext = createContext<ConnectivityContextType | null>(null)

export function useConnectivity() {
    const context = useContext(ConnectivityContext)
    if (!context) throw new Error('useConnectivity must be used within ConnectivityProvider')
    return context
}

interface ConnectivityProviderProps {
    children: ReactNode
    onSync?: () => Promise<void>
    syncInterval?: number
}

export function ConnectivityProvider({
    children,
    onSync,
    syncInterval = 30000
}: ConnectivityProviderProps) {
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
    const [wasOffline, setWasOffline] = useState(false)
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle')
    const [lastSync, setLastSync] = useState<Date | null>(null)
    const [pendingChanges, setPendingChanges] = useState(0)

    const sync = useCallback(async () => {
        if (!isOnline || !onSync) return

        setSyncStatus('syncing')
        try {
            await onSync()
            setSyncStatus('synced')
            setLastSync(new Date())
            setPendingChanges(0)
            setTimeout(() => setSyncStatus('idle'), 2000)
        } catch {
            setSyncStatus('error')
        }
    }, [isOnline, onSync])

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            if (wasOffline) {
                sync()
            }
            setWasOffline(false)
        }

        const handleOffline = () => {
            setIsOnline(false)
            setWasOffline(true)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [wasOffline, sync])

    // Auto-sync
    useEffect(() => {
        if (!isOnline || !onSync) return

        const interval = setInterval(sync, syncInterval)
        return () => clearInterval(interval)
    }, [isOnline, onSync, syncInterval, sync])

    return (
        <ConnectivityContext.Provider value={{
            isOnline,
            wasOffline,
            syncStatus,
            lastSync,
            pendingChanges,
            sync
        }}>
            {children}
        </ConnectivityContext.Provider>
    )
}

// Offline Banner
interface OfflineBannerProps {
    className?: string
}

export function OfflineBanner({ className = '' }: OfflineBannerProps) {
    const { isOnline, wasOffline, syncStatus, sync, pendingChanges } = useConnectivity()

    if (isOnline && !wasOffline && syncStatus === 'idle') return null

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    className={`offline-banner offline-banner--offline ${className}`}
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                >
                    <WifiOff size={16} />
                    <span>You're offline. Changes will sync when you reconnect.</span>
                    {pendingChanges > 0 && (
                        <span className="offline-banner__badge">{pendingChanges} pending</span>
                    )}
                </motion.div>
            )}

            {isOnline && wasOffline && (
                <motion.div
                    className={`offline-banner offline-banner--syncing ${className}`}
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                >
                    {syncStatus === 'syncing' && (
                        <>
                            <RefreshCw size={16} className="spin" />
                            <span>Syncing your changes...</span>
                        </>
                    )}
                    {syncStatus === 'synced' && (
                        <>
                            <Check size={16} />
                            <span>All changes synced!</span>
                        </>
                    )}
                    {syncStatus === 'error' && (
                        <>
                            <AlertTriangle size={16} />
                            <span>Sync failed.</span>
                            <button onClick={sync}>Retry</button>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Sync Indicator
interface SyncIndicatorProps {
    size?: 'sm' | 'md' | 'lg'
    showLabel?: boolean
    className?: string
}

export function SyncIndicator({ size = 'md', showLabel = true, className = '' }: SyncIndicatorProps) {
    const { isOnline, syncStatus, lastSync, sync } = useConnectivity()

    const formatTime = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        return `${Math.floor(mins / 60)}h ago`
    }

    const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 20

    return (
        <div className={`sync-indicator sync-indicator--${size} ${className}`}>
            <button
                className={`sync-indicator__btn sync-indicator__btn--${syncStatus}`}
                onClick={sync}
                disabled={!isOnline || syncStatus === 'syncing'}
            >
                {syncStatus === 'syncing' ? (
                    <RefreshCw size={iconSize} className="spin" />
                ) : isOnline ? (
                    <Cloud size={iconSize} />
                ) : (
                    <CloudOff size={iconSize} />
                )}
            </button>

            {showLabel && (
                <span className="sync-indicator__label">
                    {!isOnline && 'Offline'}
                    {isOnline && syncStatus === 'syncing' && 'Syncing...'}
                    {isOnline && syncStatus === 'synced' && 'Synced'}
                    {isOnline && syncStatus === 'idle' && lastSync && formatTime(lastSync)}
                    {isOnline && syncStatus === 'error' && 'Sync failed'}
                </span>
            )}
        </div>
    )
}

// Offline-capable Action
interface OfflineActionProps {
    onlineAction: () => Promise<void>
    offlineAction?: () => void
    offlineMessage?: string
    children: ReactNode
    className?: string
}

export function OfflineAction({
    onlineAction,
    offlineAction,
    offlineMessage = 'This action requires an internet connection',
    children,
    className = ''
}: OfflineActionProps) {
    const { isOnline } = useConnectivity()
    const [showMessage, setShowMessage] = useState(false)

    const handleClick = async () => {
        if (isOnline) {
            await onlineAction()
        } else if (offlineAction) {
            offlineAction()
        } else {
            setShowMessage(true)
            setTimeout(() => setShowMessage(false), 3000)
        }
    }

    return (
        <div className={`offline-action ${className}`}>
            <div onClick={handleClick}>{children}</div>

            <AnimatePresence>
                {showMessage && (
                    <motion.div
                        className="offline-action__message"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        <AlertTriangle size={14} />
                        {offlineMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Network Quality Indicator
interface NetworkQualityProps {
    showSpeed?: boolean
    className?: string
}

export function NetworkQuality({ showSpeed = true, className = '' }: NetworkQualityProps) {
    const [quality, setQuality] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'offline'>('good')
    const [downlink, setDownlink] = useState<number | null>(null)

    useEffect(() => {
        const connection = (navigator as any).connection

        if (!connection) return

        const updateQuality = () => {
            if (!navigator.onLine) {
                setQuality('offline')
                return
            }

            const dl = connection.downlink
            setDownlink(dl)

            if (dl >= 10) setQuality('excellent')
            else if (dl >= 5) setQuality('good')
            else if (dl >= 1) setQuality('fair')
            else setQuality('poor')
        }

        updateQuality()
        connection.addEventListener('change', updateQuality)
        window.addEventListener('online', updateQuality)
        window.addEventListener('offline', updateQuality)

        return () => {
            connection.removeEventListener('change', updateQuality)
            window.removeEventListener('online', updateQuality)
            window.removeEventListener('offline', updateQuality)
        }
    }, [])

    return (
        <div className={`network-quality network-quality--${quality} ${className}`}>
            <div className="network-quality__bars">
                <span className={quality !== 'offline' ? 'active' : ''} />
                <span className={quality === 'good' || quality === 'excellent' ? 'active' : ''} />
                <span className={quality === 'excellent' ? 'active' : ''} />
            </div>
            {showSpeed && downlink && (
                <span className="network-quality__speed">{downlink.toFixed(1)} Mbps</span>
            )}
        </div>
    )
}

export default { ConnectivityProvider, useConnectivity, OfflineBanner, SyncIndicator, OfflineAction, NetworkQuality }
