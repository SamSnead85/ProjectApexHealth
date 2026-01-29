import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Search,
    Filter,
    Download,
    RefreshCw,
    Zap,
    FileText,
    Brain,
    Users
} from 'lucide-react'
import { ExecutionLog } from '../../types/workflow'
import { Button, Badge, GlassCard } from '../common'
import './ExecutionLogs.css'

// Mock execution logs
const mockLogs: ExecutionLog[] = [
    {
        id: '1',
        nodeId: 'node-1',
        nodeName: 'Claim Intake',
        timestamp: new Date(Date.now() - 60000),
        status: 'completed',
        input: { source: 'EDI', format: '837' },
        output: { claimId: 'CLM-2847', status: 'received' },
        duration: 234,
    },
    {
        id: '2',
        nodeId: 'node-2',
        nodeName: 'Document Analyzer',
        timestamp: new Date(Date.now() - 55000),
        status: 'completed',
        input: { documentType: 'claim' },
        output: { extracted: true, fields: 12 },
        duration: 892,
        confidenceScore: 0.94,
    },
    {
        id: '3',
        nodeId: 'node-3',
        nodeName: 'Eligibility Check',
        timestamp: new Date(Date.now() - 50000),
        status: 'completed',
        input: { memberId: 'MBR-10234' },
        output: { eligible: true, coverage: 'active' },
        duration: 456,
        confidenceScore: 0.99,
    },
    {
        id: '4',
        nodeId: 'node-4',
        nodeName: 'Gemini Analyzer',
        timestamp: new Date(Date.now() - 45000),
        status: 'completed',
        input: { analysis: 'medical_necessity' },
        output: { recommendation: 'approve', factors: 3 },
        duration: 1234,
        confidenceScore: 0.87,
    },
    {
        id: '5',
        nodeId: 'node-5',
        nodeName: 'HITL Checkpoint',
        timestamp: new Date(Date.now() - 40000),
        status: 'paused',
        input: { threshold: 0.9 },
        output: { reason: 'Below confidence threshold' },
        duration: 0,
    },
    {
        id: '6',
        nodeId: 'node-6',
        nodeName: 'Fraud Detection',
        timestamp: new Date(Date.now() - 120000),
        status: 'error',
        input: { claimId: 'CLM-2845' },
        output: {},
        duration: 567,
        error: 'External service timeout',
    },
]

export function ExecutionLogs() {
    const [logs, setLogs] = useState<ExecutionLog[]>(mockLogs)
    const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const toggleExpanded = (logId: string) => {
        setExpandedLogs(prev => {
            const next = new Set(prev)
            if (next.has(logId)) {
                next.delete(logId)
            } else {
                next.add(logId)
            }
            return next
        })
    }

    const getStatusIcon = (status: ExecutionLog['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 size={16} className="text-success" />
            case 'error':
                return <XCircle size={16} className="text-critical" />
            case 'running':
                return <RefreshCw size={16} className="text-info animate-spin" />
            case 'paused':
                return <Clock size={16} className="text-warning" />
            default:
                return <Clock size={16} className="text-steel" />
        }
    }

    const formatDuration = (ms: number) => {
        if (ms < 1000) return `${ms}ms`
        return `${(ms / 1000).toFixed(2)}s`
    }

    const filteredLogs = logs.filter(log => {
        if (statusFilter !== 'all' && log.status !== statusFilter) return false
        if (searchQuery && !log.nodeName.toLowerCase().includes(searchQuery.toLowerCase())) return false
        return true
    })

    const stats = {
        total: logs.length,
        completed: logs.filter(l => l.status === 'completed').length,
        errors: logs.filter(l => l.status === 'error').length,
        avgDuration: logs.reduce((acc, l) => acc + l.duration, 0) / logs.length,
    }

    return (
        <div className="execution-logs">
            {/* Header */}
            <div className="execution-logs__header">
                <h2 className="execution-logs__title">Execution Logs</h2>
                <div className="execution-logs__actions">
                    <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />}>
                        Refresh
                    </Button>
                    <Button variant="ghost" size="sm" icon={<Download size={14} />}>
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="execution-logs__stats">
                <div className="execution-logs__stat">
                    <span className="execution-logs__stat-value">{stats.total}</span>
                    <span className="execution-logs__stat-label">Total Steps</span>
                </div>
                <div className="execution-logs__stat execution-logs__stat--success">
                    <span className="execution-logs__stat-value">{stats.completed}</span>
                    <span className="execution-logs__stat-label">Completed</span>
                </div>
                <div className="execution-logs__stat execution-logs__stat--error">
                    <span className="execution-logs__stat-value">{stats.errors}</span>
                    <span className="execution-logs__stat-label">Errors</span>
                </div>
                <div className="execution-logs__stat">
                    <span className="execution-logs__stat-value">{formatDuration(stats.avgDuration)}</span>
                    <span className="execution-logs__stat-label">Avg Duration</span>
                </div>
            </div>

            {/* Filters */}
            <div className="execution-logs__filters">
                <div className="execution-logs__search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search nodes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="execution-logs__filter-select"
                >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="running">Running</option>
                    <option value="paused">Paused</option>
                    <option value="error">Error</option>
                </select>
            </div>

            {/* Log List */}
            <div className="execution-logs__list">
                <AnimatePresence>
                    {filteredLogs.map((log, index) => {
                        const isExpanded = expandedLogs.has(log.id)

                        return (
                            <motion.div
                                key={log.id}
                                className={`execution-logs__item execution-logs__item--${log.status}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ delay: index * 0.02 }}
                            >
                                <div
                                    className="execution-logs__item-header"
                                    onClick={() => toggleExpanded(log.id)}
                                >
                                    <button className="execution-logs__item-expand">
                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </button>

                                    <div className="execution-logs__item-status">
                                        {getStatusIcon(log.status)}
                                    </div>

                                    <div className="execution-logs__item-info">
                                        <span className="execution-logs__item-name">{log.nodeName}</span>
                                        <span className="execution-logs__item-time">
                                            {log.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>

                                    <div className="execution-logs__item-meta">
                                        {log.confidenceScore !== undefined && (
                                            <Badge
                                                variant={log.confidenceScore > 0.9 ? 'success' : log.confidenceScore > 0.7 ? 'warning' : 'critical'}
                                                size="sm"
                                            >
                                                {Math.round(log.confidenceScore * 100)}%
                                            </Badge>
                                        )}
                                        <span className="execution-logs__item-duration">
                                            {formatDuration(log.duration)}
                                        </span>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            className="execution-logs__item-details"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                        >
                                            <div className="execution-logs__detail-grid">
                                                <div className="execution-logs__detail-section">
                                                    <h5>Input</h5>
                                                    <pre className="execution-logs__code">
                                                        {JSON.stringify(log.input, null, 2)}
                                                    </pre>
                                                </div>
                                                <div className="execution-logs__detail-section">
                                                    <h5>Output</h5>
                                                    <pre className="execution-logs__code">
                                                        {JSON.stringify(log.output, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>

                                            {log.error && (
                                                <div className="execution-logs__error">
                                                    <AlertTriangle size={14} />
                                                    <span>{log.error}</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default ExecutionLogs
