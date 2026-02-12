import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import {
    Code2,
    Key,
    Plus,
    Copy,
    Trash2,
    RefreshCw,
    CheckCircle2,
    Clock,
    Activity,
    Shield,
    Zap,
    AlertTriangle
} from 'lucide-react'
import './APIManagement.css'

interface APIKey {
    id: string
    name: string
    key: string
    type: 'production' | 'sandbox'
    created: string
    lastUsed: string
    requests: number
}

interface Endpoint {
    id: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    path: string
    description: string
    status: 'active' | 'deprecated'
}

const apiKeys: APIKey[] = [
    { id: '1', name: 'Production API Key', key: 'apex_prod_sk_...8f4a', type: 'production', created: 'Jan 15, 2026', lastUsed: '2 min ago', requests: 1248500 },
    { id: '2', name: 'Sandbox API Key', key: 'apex_test_sk_...2b9c', type: 'sandbox', created: 'Jan 10, 2026', lastUsed: '1 hour ago', requests: 45200 },
]

const endpoints: Endpoint[] = [
    { id: '1', method: 'GET', path: '/v1/members', description: 'List all members', status: 'active' },
    { id: '2', method: 'GET', path: '/v1/members/{id}', description: 'Get member details', status: 'active' },
    { id: '3', method: 'POST', path: '/v1/claims', description: 'Submit a new claim', status: 'active' },
    { id: '4', method: 'GET', path: '/v1/claims/{id}', description: 'Get claim status', status: 'active' },
    { id: '5', method: 'PUT', path: '/v1/eligibility', description: 'Update eligibility', status: 'active' },
    { id: '6', method: 'DELETE', path: '/v1/members/{id}', description: 'Terminate member', status: 'deprecated' },
]

const usageData = [
    { day: 'Mon', requests: 45000 },
    { day: 'Tue', requests: 52000 },
    { day: 'Wed', requests: 48000 },
    { day: 'Thu', requests: 61000 },
    { day: 'Fri', requests: 55000 },
    { day: 'Sat', requests: 32000 },
    { day: 'Sun', requests: 28000 },
]

export default function APIManagement() {
    const [copiedKey, setCopiedKey] = useState<string | null>(null)

    const handleCopyKey = (key: string) => {
        setCopiedKey(key)
        setTimeout(() => setCopiedKey(null), 2000)
    }

    return (
        <div className="api-management">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <Code2 size={28} />
                    API Management
                </h1>
                <p className="page-subtitle">
                    Manage API keys, monitor usage, and explore available endpoints
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="api-stats">
                <motion.div
                    className="api-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h4>Total Requests (30d)</h4>
                    <div className="value">1.29M</div>
                    <div className="subtitle">+12.4% vs last month</div>
                </motion.div>

                <motion.div
                    className="api-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h4>Avg Response Time</h4>
                    <div className="value">127ms</div>
                    <div className="subtitle">P95: 245ms</div>
                </motion.div>

                <motion.div
                    className="api-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h4>Success Rate</h4>
                    <div className="value">99.94%</div>
                    <div className="subtitle">8 errors in 24h</div>
                </motion.div>

                <motion.div
                    className="api-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <h4>Active Integrations</h4>
                    <div className="value">24</div>
                    <div className="subtitle">3 pending approval</div>
                </motion.div>
            </div>

            {/* API Keys */}
            <motion.div
                className="api-keys-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="section-header">
                    <h2>
                        <Key size={20} />
                        API Keys
                    </h2>
                    <button className="create-key-btn">
                        <Plus size={16} />
                        Create New Key
                    </button>
                </div>
                {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="api-key-card">
                        <div className={`key-icon ${apiKey.type}`}>
                            <Key size={18} />
                        </div>
                        <div className="key-info">
                            <h4>{apiKey.name}</h4>
                            <div className="key-value">
                                {apiKey.key}
                                <button
                                    onClick={() => handleCopyKey(apiKey.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                >
                                    {copiedKey === apiKey.id ? <CheckCircle2 size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                        <div className="key-meta">
                            <span>Created: {apiKey.created}</span>
                            <span>Last used: {apiKey.lastUsed}</span>
                            <span>{apiKey.requests.toLocaleString()} requests</span>
                        </div>
                        <div className="key-actions">
                            <button className="key-btn">
                                <RefreshCw size={12} style={{ marginRight: '0.25rem' }} />
                                Rotate
                            </button>
                            <button className="key-btn danger">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Endpoints */}
            <motion.div
                className="endpoints-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <h2>
                    <Zap size={20} />
                    Available Endpoints
                </h2>
                {endpoints.map((endpoint) => (
                    <div key={endpoint.id} className="endpoint-row">
                        <span className={`method-badge ${endpoint.method.toLowerCase()}`}>
                            {endpoint.method}
                        </span>
                        <span className="endpoint-path">{endpoint.path}</span>
                        <span className="endpoint-desc">{endpoint.description}</span>
                        <span className={`endpoint-status ${endpoint.status}`}>
                            {endpoint.status === 'active' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                            {endpoint.status}
                        </span>
                    </div>
                ))}
            </motion.div>

            {/* Usage and Rate Limits */}
            <div className="usage-section">
                <motion.div
                    className="usage-chart"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2>
                        <Activity size={20} />
                        Request Volume (7 days)
                    </h2>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={usageData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                <XAxis dataKey="day" stroke="var(--text-muted)" />
                                <YAxis stroke="var(--text-muted)" tickFormatter={(v) => `${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="requests"
                                    stroke="#14b8a6"
                                    fill="rgba(20, 184, 166, 0.2)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    className="rate-limits"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                >
                    <h2>
                        <Shield size={20} />
                        Rate Limits
                    </h2>
                    <div className="limit-row">
                        <span className="limit-label">Requests/minute</span>
                        <span className="limit-value">1,000</span>
                    </div>
                    <div className="limit-row">
                        <span className="limit-label">Requests/hour</span>
                        <span className="limit-value">50,000</span>
                    </div>
                    <div className="limit-row">
                        <span className="limit-label">Requests/day</span>
                        <span className="limit-value">1,000,000</span>
                    </div>
                    <div className="limit-row">
                        <span className="limit-label">Max payload size</span>
                        <span className="limit-value">10 MB</span>
                    </div>
                    <div className="limit-row">
                        <span className="limit-label">Timeout</span>
                        <span className="limit-value">30s</span>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
