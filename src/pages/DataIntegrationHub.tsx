import { useState } from 'react'
import { useNavigation } from '../context/NavigationContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plug,
    Database,
    RefreshCw,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    Zap,
    Users,
    Calendar,
    ChevronRight,
    Activity,
    ArrowUpRight,
    ArrowDownLeft,
    Brain,
    Sparkles,
    Settings,
    Plus,
    Play,
    Pause,
    ExternalLink,
    Server,
    Upload,
    FileText
} from 'lucide-react'
import { GlassCard, Button, Badge } from '../components/common'
import './DataIntegrationHub.css'

// ============================================
// MOCK DATA - Data Integration Hub
// ============================================

interface Integration {
    id: string
    name: string
    type: 'hris' | 'payroll' | 'benefits' | 'erp' | 'custom'
    provider: string
    providerIcon: string
    status: 'connected' | 'disconnected' | 'error' | 'syncing'
    lastSync: string
    nextSync: string
    recordsIn: number
    recordsOut: number
    errorCount: number
    healthScore: number
}

interface SyncLog {
    id: string
    integrationId: string
    integrationName: string
    timestamp: string
    direction: 'inbound' | 'outbound'
    records: number
    status: 'success' | 'partial' | 'failed'
    duration: string
}

const integrations: Integration[] = [
    { id: 'int1', name: 'Workday HCM', type: 'hris', provider: 'Workday', providerIcon: '🔵', status: 'connected', lastSync: '5 min ago', nextSync: 'Every 15 min', recordsIn: 12450, recordsOut: 890, errorCount: 0, healthScore: 100 },
    { id: 'int2', name: 'ADP Payroll', type: 'payroll', provider: 'ADP', providerIcon: '🔴', status: 'connected', lastSync: '1 hour ago', nextSync: 'Daily 6AM', recordsIn: 8920, recordsOut: 1200, errorCount: 2, healthScore: 96 },
    { id: 'int3', name: 'SAP SuccessFactors', type: 'hris', provider: 'SAP', providerIcon: '🟡', status: 'syncing', lastSync: 'Syncing...', nextSync: 'Every 30 min', recordsIn: 5680, recordsOut: 450, errorCount: 0, healthScore: 100 },
    { id: 'int4', name: 'Oracle NetSuite', type: 'erp', provider: 'Oracle', providerIcon: '🔶', status: 'error', lastSync: '2 hours ago', nextSync: 'Retry in 10 min', recordsIn: 3400, recordsOut: 890, errorCount: 15, healthScore: 72 },
    { id: 'int5', name: 'Custom TPA Feed', type: 'custom', provider: 'Custom API', providerIcon: '⚙️', status: 'connected', lastSync: '30 min ago', nextSync: 'Daily 6AM', recordsIn: 890, recordsOut: 0, errorCount: 0, healthScore: 100 },
]

const syncLogs: SyncLog[] = [
    { id: 'log1', integrationId: 'int1', integrationName: 'Workday HCM', timestamp: 'Today 2:35 PM', direction: 'inbound', records: 156, status: 'success', duration: '12s' },
    { id: 'log2', integrationId: 'int2', integrationName: 'ADP Payroll', timestamp: 'Today 2:00 PM', direction: 'inbound', records: 89, status: 'success', duration: '8s' },
    { id: 'log3', integrationId: 'int4', integrationName: 'Oracle NetSuite', timestamp: 'Today 1:45 PM', direction: 'outbound', records: 45, status: 'failed', duration: '32s' },
    { id: 'log4', integrationId: 'int3', integrationName: 'SAP SuccessFactors', timestamp: 'Today 1:30 PM', direction: 'inbound', records: 234, status: 'success', duration: '18s' },
    { id: 'log5', integrationId: 'int1', integrationName: 'Workday HCM', timestamp: 'Today 1:20 PM', direction: 'inbound', records: 142, status: 'success', duration: '11s' },
]

const pipelineStats = {
    totalRecordsProcessed: 31340,
    successRate: 98.4,
    avgProcessingTime: '14.2s',
    activeConnections: 5,
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'connected': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', label: 'Connected' }
        case 'syncing': return { bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', label: 'Syncing' }
        case 'error': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'Error' }
        case 'disconnected': return { bg: 'rgba(107, 114, 128, 0.15)', color: '#6b7280', label: 'Disconnected' }
        default: return { bg: 'rgba(107, 114, 128, 0.15)', color: '#6b7280', label: 'Unknown' }
    }
}

const getHealthColor = (score: number) => {
    if (score >= 95) return '#10b981'
    if (score >= 80) return '#f59e0b'
    return '#ef4444'
}

const getTypeColor = (type: string) => {
    switch (type) {
        case 'hris': return '#06b6d4'
        case 'payroll': return '#8b5cf6'
        case 'benefits': return '#10b981'
        case 'erp': return '#f59e0b'
        case 'custom': return '#6366f1'
        default: return '#6b7280'
    }
}

// ============================================
// MAIN COMPONENT
// ============================================

export function DataIntegrationHub() {
    const { navigate } = useNavigation()
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

    const connectedCount = integrations.filter(i => i.status === 'connected' || i.status === 'syncing').length
    const errorCount = integrations.filter(i => i.status === 'error').length

    return (
        <div className="data-hub">
            {/* Premium Header */}
            <motion.header
                className="dh__header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="dh__header-left">
                    <div className="dh__icon-container">
                        <Database size={28} />
                        <div className="dh__icon-pulse" />
                    </div>
                    <div>
                        <h1 className="dh__title">Data Integration Hub</h1>
                        <div className="dh__subtitle">
                            <span>HRIS Connections • Data Pipelines • Sync Monitoring</span>
                        </div>
                    </div>
                </div>
                <div className="dh__header-badges">
                    <div className="dh__badge dh__badge--active">
                        <Zap size={14} />
                        {connectedCount} Active
                    </div>
                    {errorCount > 0 && (
                        <div className="dh__badge dh__badge--error">
                            <AlertTriangle size={14} />
                            {errorCount} Error{errorCount !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
                <div className="dh__header-actions">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/data/pipeline-builder')}>
                        <Play size={16} />
                        Pipeline Builder
                    </Button>
                    <Button variant="primary" size="sm">
                        <Plus size={16} />
                        Add Connection
                    </Button>
                </div>
            </motion.header>

            {/* Stats Row */}
            <div className="dh__stats">
                {[
                    { label: 'Records Processed', value: pipelineStats.totalRecordsProcessed.toLocaleString(), icon: Database, color: '#06b6d4' },
                    { label: 'Success Rate', value: `${pipelineStats.successRate}%`, icon: CheckCircle2, color: '#10b981' },
                    { label: 'Avg Processing Time', value: pipelineStats.avgProcessingTime, icon: Clock, color: '#8b5cf6' },
                    { label: 'Active Connections', value: pipelineStats.activeConnections.toString(), icon: Plug, color: '#f59e0b' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="dh__stat-card"
                        style={{ '--stat-color': stat.color } as any}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                    >
                        <div className="dh__stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={20} />
                        </div>
                        <div className="dh__stat-content">
                            <div className="dh__stat-value">{stat.value}</div>
                            <div className="dh__stat-label">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="dh__grid">
                {/* Integrations List */}
                <motion.div
                    className="dh__integrations"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="dh__section-header">
                        <div className="dh__section-title">
                            <Plug size={20} />
                            <h2>Connected Integrations</h2>
                            <Badge variant="default">{integrations.length} total</Badge>
                        </div>
                        <Button variant="ghost" size="sm">Manage All</Button>
                    </div>
                    <div className="dh__integrations-grid">
                        {integrations.map((integration, i) => {
                            const statusStyle = getStatusStyle(integration.status)
                            return (
                                <motion.div
                                    key={integration.id}
                                    className={`dh__integration-card ${selectedIntegration?.id === integration.id ? 'selected' : ''}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.05 }}
                                    onClick={() => setSelectedIntegration(integration)}
                                >
                                    <div className="dh__integration-header">
                                        <div className="dh__integration-provider">
                                            <span className="dh__integration-icon">{integration.providerIcon}</span>
                                            <div>
                                                <div className="dh__integration-name">{integration.name}</div>
                                                <div className="dh__integration-type" style={{ color: getTypeColor(integration.type) }}>
                                                    {integration.type.toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className="dh__integration-status"
                                            style={{ background: statusStyle.bg, color: statusStyle.color }}
                                        >
                                            {integration.status === 'syncing' && <RefreshCw size={10} className="spinning" />}
                                            {statusStyle.label}
                                        </span>
                                    </div>
                                    <div className="dh__integration-stats">
                                        <div className="dh__integration-stat">
                                            <ArrowDownLeft size={14} style={{ color: '#10b981' }} />
                                            <span>{integration.recordsIn.toLocaleString()}</span>
                                        </div>
                                        <div className="dh__integration-stat">
                                            <ArrowUpRight size={14} style={{ color: '#06b6d4' }} />
                                            <span>{integration.recordsOut.toLocaleString()}</span>
                                        </div>
                                        <div className="dh__integration-health">
                                            <div
                                                className="dh__integration-health-ring"
                                                style={{
                                                    background: `conic-gradient(${getHealthColor(integration.healthScore)} ${integration.healthScore * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
                                                }}
                                            >
                                                <span>{integration.healthScore}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="dh__integration-footer">
                                        <div className="dh__integration-sync">
                                            <Clock size={12} />
                                            <span>{integration.lastSync}</span>
                                        </div>
                                        {integration.errorCount > 0 && (
                                            <div className="dh__integration-errors">
                                                <AlertTriangle size={12} />
                                                <span>{integration.errorCount} errors</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Sidebar */}
                <div className="dh__sidebar">
                    {/* Sync Activity */}
                    <motion.div
                        className="dh__sync-log"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="dh__sync-header">
                            <Activity size={18} />
                            <h3>Sync Activity</h3>
                        </div>
                        <div className="dh__sync-list">
                            {syncLogs.map((log, i) => (
                                <motion.div
                                    key={log.id}
                                    className={`dh__sync-item dh__sync-item--${log.status}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.05 }}
                                >
                                    <div className="dh__sync-direction">
                                        {log.direction === 'inbound' ? (
                                            <ArrowDownLeft size={16} style={{ color: '#10b981' }} />
                                        ) : (
                                            <ArrowUpRight size={16} style={{ color: '#06b6d4' }} />
                                        )}
                                    </div>
                                    <div className="dh__sync-info">
                                        <div className="dh__sync-integration">{log.integrationName}</div>
                                        <div className="dh__sync-meta">
                                            <span>{log.records} records</span>
                                            <span>•</span>
                                            <span>{log.duration}</span>
                                        </div>
                                    </div>
                                    <div className="dh__sync-time">{log.timestamp}</div>
                                    <div className={`dh__sync-status dh__sync-status--${log.status}`}>
                                        {log.status === 'success' && <CheckCircle2 size={14} />}
                                        {log.status === 'failed' && <XCircle size={14} />}
                                        {log.status === 'partial' && <AlertTriangle size={14} />}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        className="dh__quick-actions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h3>Quick Actions</h3>
                        <div className="dh__quick-grid">
                            {[
                                { icon: Play, label: 'Run Pipeline', path: '/data/pipeline-builder' },
                                { icon: Upload, label: 'Upload Data', path: '/data/upload' },
                                { icon: FileText, label: 'View Schemas', path: '/data/schemas' },
                                { icon: Settings, label: 'Settings', path: '/data/settings' },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    className="dh__quick-btn"
                                    onClick={() => navigate(action.path)}
                                >
                                    <action.icon size={18} />
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default DataIntegrationHub
