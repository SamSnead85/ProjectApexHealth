import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Key,
    Shield,
    Settings,
    CheckCircle2,
    XCircle,
    RefreshCw,
    AlertTriangle,
    Clock,
    Info
} from 'lucide-react'
import './SSOConfiguration.css'

interface SSOProvider {
    id: string
    name: string
    type: string
    logo: string
    status: 'connected' | 'disconnected'
    lastSync?: string
}

interface LogEntry {
    id: string
    type: 'success' | 'warning' | 'info'
    title: string
    description: string
    time: string
}

const providers: SSOProvider[] = [
    { id: '1', name: 'Azure Active Directory', type: 'azure', logo: 'AD', status: 'connected', lastSync: '5 min ago' },
    { id: '2', name: 'Okta', type: 'okta', logo: 'OK', status: 'connected', lastSync: '12 min ago' },
    { id: '3', name: 'Google Workspace', type: 'google', logo: 'G', status: 'disconnected' },
    { id: '4', name: 'Custom SAML 2.0', type: 'saml', logo: 'S', status: 'disconnected' },
]

const activityLog: LogEntry[] = [
    { id: '1', type: 'success', title: 'Azure AD Sync Completed', description: '2,847 users synchronized successfully', time: '5 min ago' },
    { id: '2', type: 'success', title: 'Okta Login', description: 'admin@company.com authenticated via Okta', time: '12 min ago' },
    { id: '3', type: 'warning', title: 'Session Token Refresh', description: 'Token refresh required for 3 users', time: '1 hour ago' },
    { id: '4', type: 'info', title: 'Policy Update', description: 'MFA requirement enabled for all admin roles', time: '2 hours ago' },
]

export default function SSOConfiguration() {
    const [mfaEnabled, setMfaEnabled] = useState(true)
    const [sessionTimeout, setSessionTimeout] = useState(true)
    const [rememberDevice, setRememberDevice] = useState(false)

    return (
        <div className="sso-configuration">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <Key size={28} />
                    SSO Configuration
                </h1>
                <p className="page-subtitle">
                    Configure single sign-on providers and identity management settings
                </p>
            </motion.div>

            {/* Provider Cards */}
            <div className="provider-grid">
                {providers.map((provider, index) => (
                    <motion.div
                        key={provider.id}
                        className="provider-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                    >
                        <div className="provider-header">
                            <div className={`provider-logo ${provider.type}`}>
                                {provider.logo}
                            </div>
                            <div className="provider-info">
                                <h3>{provider.name}</h3>
                                <span>{provider.lastSync ? `Synced ${provider.lastSync}` : 'Not configured'}</span>
                            </div>
                            <span className={`provider-status ${provider.status}`}>
                                {provider.status === 'connected' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                            </span>
                        </div>
                        <div className="provider-actions">
                            <button className="configure-btn">
                                {provider.status === 'connected' ? 'Configure' : 'Connect'}
                            </button>
                            {provider.status === 'connected' && (
                                <button className="disconnect-btn">Disconnect</button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Settings Panel */}
            <motion.div
                className="sso-settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2>
                    <Settings size={20} />
                    Security Settings
                </h2>

                <div className="toggle-row">
                    <div className="toggle-info">
                        <h4>Multi-Factor Authentication</h4>
                        <p>Require MFA for all user logins</p>
                    </div>
                    <div
                        className={`toggle-switch ${mfaEnabled ? 'active' : ''}`}
                        onClick={() => setMfaEnabled(!mfaEnabled)}
                    />
                </div>

                <div className="toggle-row">
                    <div className="toggle-info">
                        <h4>Session Timeout</h4>
                        <p>Automatically log out users after 30 minutes of inactivity</p>
                    </div>
                    <div
                        className={`toggle-switch ${sessionTimeout ? 'active' : ''}`}
                        onClick={() => setSessionTimeout(!sessionTimeout)}
                    />
                </div>

                <div className="toggle-row">
                    <div className="toggle-info">
                        <h4>Remember Device</h4>
                        <p>Allow users to skip MFA on trusted devices</p>
                    </div>
                    <div
                        className={`toggle-switch ${rememberDevice ? 'active' : ''}`}
                        onClick={() => setRememberDevice(!rememberDevice)}
                    />
                </div>
            </motion.div>

            {/* Activity Log */}
            <motion.div
                className="activity-log"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h2>
                    <Clock size={20} />
                    Authentication Activity
                </h2>
                {activityLog.map((entry) => (
                    <div key={entry.id} className="log-entry">
                        <div className={`log-icon ${entry.type}`}>
                            {entry.type === 'success' && <CheckCircle2 size={16} />}
                            {entry.type === 'warning' && <AlertTriangle size={16} />}
                            {entry.type === 'info' && <Info size={16} />}
                        </div>
                        <div className="log-content">
                            <h4>{entry.title}</h4>
                            <p>{entry.description}</p>
                        </div>
                        <span className="log-time">{entry.time}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
