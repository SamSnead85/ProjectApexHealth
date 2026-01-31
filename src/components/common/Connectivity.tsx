import { ReactNode, createContext, useContext, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, CloudOff, RefreshCw } from 'lucide-react'
import './Connectivity.css'

// Connection context
interface ConnectivityContextType {
    isOnline: boolean
    isSlowConnection: boolean
    connectionType: string | null
}

const ConnectivityContext = createContext<ConnectivityContextType>({
    isOnline: true,
    isSlowConnection: false,
    connectionType: null
})

export function useConnectivity() {
    return useContext(ConnectivityContext)
}

interface ConnectivityProviderProps {
    children: ReactNode
}

export function ConnectivityProvider({ children }: ConnectivityProviderProps) {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [connectionType, setConnectionType] = useState<string | null>(null)
    const [isSlowConnection, setIsSlowConnection] = useState(false)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Check connection type if available
        const checkConnection = () => {
            const connection = (navigator as any).connection
            if (connection) {
                setConnectionType(connection.effectiveType)
                setIsSlowConnection(['slow-2g', '2g'].includes(connection.effectiveType))
            }
        }

        checkConnection()
        const connection = (navigator as any).connection
        if (connection) {
            connection.addEventListener('change', checkConnection)
        }

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            if (connection) {
                connection.removeEventListener('change', checkConnection)
            }
        }
    }, [])

    return (
        <ConnectivityContext.Provider value={{ isOnline, isSlowConnection, connectionType }}>
            {children}
        </ConnectivityContext.Provider>
    )
}

// Offline Banner
interface OfflineBannerProps {
    message?: string
    retryMessage?: string
}

export function OfflineBanner({
    message = 'You are currently offline',
    retryMessage = 'Connecting...'
}: OfflineBannerProps) {
    const { isOnline } = useConnectivity()
    const [wasOffline, setWasOffline] = useState(false)
    const [isReconnecting, setIsReconnecting] = useState(false)

    useEffect(() => {
        if (!isOnline) {
            setWasOffline(true)
        } else if (wasOffline) {
            setIsReconnecting(true)
            setTimeout(() => {
                setIsReconnecting(false)
                setWasOffline(false)
            }, 2000)
        }
    }, [isOnline, wasOffline])

    return (
        <AnimatePresence>
            {(!isOnline || isReconnecting) && (
                <motion.div
                    className={`offline-banner ${isReconnecting ? 'offline-banner--reconnecting' : ''}`}
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                >
                    {isReconnecting ? (
                        <>
                            <RefreshCw size={16} className="offline-banner__icon offline-banner__icon--spin" />
                            <span>{retryMessage}</span>
                        </>
                    ) : (
                        <>
                            <WifiOff size={16} className="offline-banner__icon" />
                            <span>{message}</span>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Connection status indicator
interface ConnectionStatusProps {
    showLabel?: boolean
    size?: 'sm' | 'md' | 'lg'
}

export function ConnectionStatus({ showLabel = false, size = 'md' }: ConnectionStatusProps) {
    const { isOnline, isSlowConnection, connectionType } = useConnectivity()

    const getLabel = () => {
        if (!isOnline) return 'Offline'
        if (isSlowConnection) return 'Slow connection'
        return 'Connected'
    }

    const getIcon = () => {
        if (!isOnline) return <WifiOff size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        return <Wifi size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
    }

    return (
        <div className={`connection-status connection-status--${size} ${isOnline ? (isSlowConnection ? 'connection-status--slow' : 'connection-status--online') : 'connection-status--offline'}`}>
            {getIcon()}
            {showLabel && <span>{getLabel()}</span>}
        </div>
    )
}

// Render only when online
interface OnlineOnlyProps {
    children: ReactNode
    fallback?: ReactNode
}

export function OnlineOnly({ children, fallback }: OnlineOnlyProps) {
    const { isOnline } = useConnectivity()

    if (!isOnline) {
        return fallback ? <>{fallback}</> : null
    }

    return <>{children}</>
}

// Render only when offline
interface OfflineOnlyProps {
    children: ReactNode
}

export function OfflineOnly({ children }: OfflineOnlyProps) {
    const { isOnline } = useConnectivity()

    if (isOnline) return null

    return <>{children}</>
}

export default ConnectivityProvider
