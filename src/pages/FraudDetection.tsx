import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    ShieldAlert,
    AlertTriangle,
    Eye,
    FileText,
    XCircle,
    CheckCircle2,
    DollarSign,
    Users,
    Building2,
    TrendingUp,
    Search,
    Filter,
    Brain
} from 'lucide-react'
import './FraudDetection.css'

interface FraudCase {
    id: string
    provider: string
    type: 'billing' | 'upcoding' | 'phantom' | 'kickback'
    amount: number
    confidence: number
    status: 'investigating' | 'confirmed' | 'cleared'
    dateDetected: string
}

const mockCases: FraudCase[] = [
    { id: 'FR-2026-0147', provider: 'Midwest Pain Management', type: 'billing', amount: 847000, confidence: 94, status: 'confirmed', dateDetected: '2026-01-28' },
    { id: 'FR-2026-0146', provider: 'Summit Imaging Center', type: 'upcoding', amount: 312000, confidence: 87, status: 'investigating', dateDetected: '2026-01-27' },
    { id: 'FR-2026-0145', provider: 'Valley Medical Associates', type: 'phantom', amount: 156000, confidence: 91, status: 'investigating', dateDetected: '2026-01-26' },
    { id: 'FR-2026-0144', provider: 'Premier Pharmacy', type: 'kickback', amount: 89000, confidence: 78, status: 'investigating', dateDetected: '2026-01-25' },
    { id: 'FR-2026-0143', provider: 'Coastal Orthopedics', type: 'upcoding', amount: 234000, confidence: 82, status: 'cleared', dateDetected: '2026-01-24' },
]

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
}

const getTypeBadge = (type: FraudCase['type']) => {
    const labels: Record<FraudCase['type'], string> = {
        billing: 'Billing Fraud',
        upcoding: 'Upcoding',
        phantom: 'Phantom Services',
        kickback: 'Kickback Scheme'
    }
    return labels[type]
}

const getStatusIcon = (status: FraudCase['status']) => {
    switch (status) {
        case 'investigating': return <AlertTriangle size={12} />
        case 'confirmed': return <XCircle size={12} />
        case 'cleared': return <CheckCircle2 size={12} />
    }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function FraudDetection() {
    const [filter, setFilter] = useState<'all' | 'investigating' | 'confirmed' | 'cleared'>('all')
    const [apiCases, setApiCases] = useState<typeof mockCases | null>(null)

    // Fetch fraud analysis from AI services with mock fallback
    useEffect(() => {
        if (!API_BASE) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/v1/analytics/fraud-cases`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.data?.length) setApiCases(data.data);
                }
            } catch { /* use mock data */ }
        })();
    }, []);

    const cases = apiCases || mockCases;
    const filteredCases = filter === 'all'
        ? cases
        : cases.filter(c => c.status === filter)

    return (
        <div className="fraud-detection">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <ShieldAlert size={28} />
                    Fraud Detection Engine
                    <span className="ai-badge">
                        <Brain size={14} />
                        AI Powered
                    </span>
                </h1>
                <p className="page-subtitle">
                    Real-time anomaly detection and claims fraud investigation
                </p>
            </motion.div>

            {/* Alert Banner */}
            <motion.div
                className="alert-banner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="alert-content">
                    <div className="alert-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="alert-text">
                        <h3>3 High-Severity Cases Require Immediate Review</h3>
                        <p>AI has flagged potential billing fraud patterns with &gt;90% confidence</p>
                    </div>
                </div>
                <button className="alert-action">Review Now</button>
            </motion.div>

            {/* Stats Row */}
            <div className="fraud-stats">
                <motion.div
                    className="fraud-stat danger"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h4>Active Cases</h4>
                    <div className="value">47</div>
                </motion.div>

                <motion.div
                    className="fraud-stat warning"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h4>Under Investigation</h4>
                    <div className="value">$2.4M</div>
                </motion.div>

                <motion.div
                    className="fraud-stat success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <h4>Recovered YTD</h4>
                    <div className="value">$8.7M</div>
                </motion.div>

                <motion.div
                    className="fraud-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h4>Detection Rate</h4>
                    <div className="value">96.4%</div>
                </motion.div>
            </div>

            {/* Pattern Analysis */}
            <div className="pattern-grid">
                <motion.div
                    className="pattern-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <h3>
                        <div className="pattern-icon billing">
                            <DollarSign size={16} />
                        </div>
                        Billing Anomalies
                    </h3>
                    <div className="pattern-value">1,247</div>
                    <div className="pattern-label">Claims flagged this month</div>
                </motion.div>

                <motion.div
                    className="pattern-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3>
                        <div className="pattern-icon identity">
                            <Users size={16} />
                        </div>
                        Identity Patterns
                    </h3>
                    <div className="pattern-value">89</div>
                    <div className="pattern-label">Potential ID theft cases</div>
                </motion.div>

                <motion.div
                    className="pattern-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                >
                    <h3>
                        <div className="pattern-icon network">
                            <Building2 size={16} />
                        </div>
                        Network Analysis
                    </h3>
                    <div className="pattern-value">12</div>
                    <div className="pattern-label">Provider rings identified</div>
                </motion.div>
            </div>

            {/* Cases Table */}
            <motion.div
                className="fraud-cases"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2>
                    <FileText size={20} />
                    Active Fraud Cases
                </h2>
                <table className="case-table">
                    <thead>
                        <tr>
                            <th>Case ID</th>
                            <th>Provider</th>
                            <th>Type</th>
                            <th>Est. Amount</th>
                            <th>AI Confidence</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCases.map((c, index) => (
                            <motion.tr
                                key={c.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.55 + index * 0.05 }}
                            >
                                <td className="case-id">{c.id}</td>
                                <td>{c.provider}</td>
                                <td>
                                    <span className={`fraud-type ${c.type}`}>
                                        {getTypeBadge(c.type)}
                                    </span>
                                </td>
                                <td>{formatCurrency(c.amount)}</td>
                                <td>
                                    <div className="confidence-bar">
                                        <div
                                            className={`confidence-fill ${c.confidence >= 85 ? 'high' : 'medium'}`}
                                            style={{ width: `${c.confidence}%` }}
                                        />
                                    </div>
                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>{c.confidence}%</span>
                                </td>
                                <td>
                                    <span className={`case-status ${c.status}`}>
                                        {getStatusIcon(c.status)}
                                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                                    </span>
                                </td>
                                <td>
                                    <div className="case-actions">
                                        <button className="action-btn" title="View Details">
                                            <Eye size={16} />
                                        </button>
                                        <button className="action-btn" title="Generate Report">
                                            <FileText size={16} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    )
}
