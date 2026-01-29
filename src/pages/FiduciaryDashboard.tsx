import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Scale,
    DollarSign,
    FileCheck,
    Folder,
    ClipboardCheck,
    History,
    Shield,
    Award,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Eye,
    Download,
    FileText,
    Users,
    Upload
} from 'lucide-react'
import './FiduciaryDashboard.css'

interface FeeBenchmark {
    id: string
    service: string
    yourFee: number
    medianFee: number
    p75Fee: number
    status: 'competitive' | 'above-median' | 'high'
}

interface PrudenceItem {
    id: string
    title: string
    description: string
    dueDate: string
    status: 'complete' | 'pending' | 'upcoming'
}

interface AuditEntry {
    id: string
    action: 'review' | 'approve' | 'request' | 'upload'
    description: string
    user: string
    timestamp: string
}

interface ComplianceCategory {
    name: string
    score: number
    status: 'excellent' | 'good' | 'warning' | 'poor'
}

const mockBenchmarks: FeeBenchmark[] = [
    { id: '1', service: 'TPA Administration', yourFee: 28.50, medianFee: 32.00, p75Fee: 38.50, status: 'competitive' },
    { id: '2', service: 'PBM Fees', yourFee: 4.25, medianFee: 3.80, p75Fee: 4.50, status: 'above-median' },
    { id: '3', service: 'Stop-Loss Premium', yourFee: 42.00, medianFee: 38.00, p75Fee: 45.00, status: 'above-median' },
    { id: '4', service: 'Wellness Program', yourFee: 8.50, medianFee: 6.00, p75Fee: 7.50, status: 'high' }
]

const mockPrudenceItems: PrudenceItem[] = [
    { id: '1', title: 'Annual Fee Review', description: 'Completed comprehensive vendor fee analysis', dueDate: '2026-01-15', status: 'complete' },
    { id: '2', title: 'Investment Policy Update', description: 'Review and update 401(k) investment policy statement', dueDate: '2026-02-28', status: 'pending' },
    { id: '3', title: 'Quarterly Committee Meeting', description: 'Q1 2026 benefits committee meeting scheduled', dueDate: '2026-03-15', status: 'upcoming' },
    { id: '4', title: 'Vendor RFP Process', description: 'Initiate RFP for PBM services renewal', dueDate: '2026-04-01', status: 'upcoming' }
]

const mockAuditEntries: AuditEntry[] = [
    { id: '1', action: 'approve', description: 'Approved Q4 2025 claims audit report', user: 'John Smith', timestamp: '2026-01-28 14:32' },
    { id: '2', action: 'review', description: 'Reviewed updated SPD for medical plan', user: 'Sarah Johnson', timestamp: '2026-01-27 11:15' },
    { id: '3', action: 'upload', description: 'Uploaded vendor service agreement - TPA', user: 'Mike Williams', timestamp: '2026-01-26 16:48' },
    { id: '4', action: 'request', description: 'Requested fee disclosure from PBM vendor', user: 'Emily Davis', timestamp: '2026-01-25 09:22' },
    { id: '5', action: 'approve', description: 'Approved plan amendment #2026-001', user: 'John Smith', timestamp: '2026-01-24 13:55' }
]

const complianceCategories: ComplianceCategory[] = [
    { name: 'Fee Reasonableness', score: 92, status: 'excellent' },
    { name: 'Documentation', score: 88, status: 'good' },
    { name: 'Process Adherence', score: 95, status: 'excellent' },
    { name: 'Vendor Management', score: 78, status: 'warning' },
    { name: 'Conflict Disclosure', score: 100, status: 'excellent' }
]

export default function FiduciaryDashboard() {
    const [overallScore] = useState(90)

    const getActionIcon = (action: AuditEntry['action']) => {
        switch (action) {
            case 'review': return <Eye size={14} />
            case 'approve': return <CheckCircle2 size={14} />
            case 'request': return <FileText size={14} />
            case 'upload': return <Upload size={14} />
        }
    }

    const getPrudenceIcon = (status: PrudenceItem['status']) => {
        switch (status) {
            case 'complete': return <CheckCircle2 size={10} />
            case 'pending': return null
            case 'upcoming': return null
        }
    }

    const circumference = 2 * Math.PI * 52
    const offset = circumference - (overallScore / 100) * circumference

    return (
        <div className="fiduciary-dashboard">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>Fiduciary Dashboard</h1>
                <p className="page-subtitle">
                    ERISA compliance, fee benchmarking, and prudent decision documentation
                </p>
            </motion.div>

            {/* Fee Benchmarking */}
            <motion.div
                className="fee-benchmarking"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2>
                    <DollarSign size={20} />
                    Fee Benchmarking
                </h2>
                <div className="benchmark-cards">
                    {mockBenchmarks.map((benchmark, index) => (
                        <motion.div
                            key={benchmark.id}
                            className="benchmark-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                        >
                            <div className="benchmark-header">
                                <h4>{benchmark.service}</h4>
                                <span className={`benchmark-status ${benchmark.status}`}>
                                    {benchmark.status.replace('-', ' ').toUpperCase()}
                                </span>
                            </div>
                            <div className="benchmark-comparison">
                                <div className="benchmark-column">
                                    <div className="benchmark-value">${benchmark.yourFee.toFixed(2)}</div>
                                    <div className="benchmark-label">Your Fee PMPM</div>
                                </div>
                                <div className="benchmark-column">
                                    <div className="benchmark-value">${benchmark.medianFee.toFixed(2)}</div>
                                    <div className="benchmark-label">Median</div>
                                </div>
                                <div className="benchmark-column">
                                    <div className="benchmark-value">${benchmark.p75Fee.toFixed(2)}</div>
                                    <div className="benchmark-label">75th Pctl</div>
                                </div>
                            </div>
                            <div className="benchmark-bar">
                                <div
                                    className="benchmark-bar-segment you"
                                    style={{ flex: benchmark.yourFee / benchmark.p75Fee }}
                                />
                                <div
                                    className="benchmark-bar-segment median"
                                    style={{ flex: (benchmark.medianFee - benchmark.yourFee) / benchmark.p75Fee }}
                                />
                                <div
                                    className="benchmark-bar-segment p75"
                                    style={{ flex: (benchmark.p75Fee - benchmark.medianFee) / benchmark.p75Fee }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Prudence Tracker */}
            <motion.div
                className="prudence-tracker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2>
                    <ClipboardCheck size={20} />
                    Prudence Tracker
                </h2>
                <div className="prudence-timeline">
                    {mockPrudenceItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            className="prudence-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <div className={`prudence-dot ${item.status}`}>
                                {getPrudenceIcon(item.status)}
                            </div>
                            <div className="prudence-content">
                                <h4>{item.title}</h4>
                                <p>{item.description}</p>
                                <div className="prudence-date">
                                    {item.status === 'complete' ? 'Completed' : 'Due'}: {item.dueDate}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Document Vault */}
            <motion.div
                className="document-vault"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2>
                    <Folder size={20} />
                    Fiduciary Document Vault
                </h2>
                <div className="vault-categories">
                    <motion.div
                        className="vault-category"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="vault-icon policies">
                            <FileCheck size={24} />
                        </div>
                        <h4>Plan Documents & SPDs</h4>
                        <p>24 documents</p>
                    </motion.div>
                    <motion.div
                        className="vault-category"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="vault-icon minutes">
                            <Users size={24} />
                        </div>
                        <h4>Committee Minutes</h4>
                        <p>18 documents</p>
                    </motion.div>
                    <motion.div
                        className="vault-category"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="vault-icon contracts">
                            <FileText size={24} />
                        </div>
                        <h4>Vendor Contracts</h4>
                        <p>12 documents</p>
                    </motion.div>
                    <motion.div
                        className="vault-category"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="vault-icon audits">
                            <Shield size={24} />
                        </div>
                        <h4>Audit Reports</h4>
                        <p>8 documents</p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Compliance Score */}
            <motion.div
                className="compliance-score-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h2>
                    <Award size={20} />
                    Fiduciary Compliance Score
                </h2>
                <div className="score-overview">
                    <div className="overall-score">
                        <div className="score-circle">
                            <svg className="score-svg" width="120" height="120" viewBox="0 0 120 120">
                                <circle
                                    className="score-bg"
                                    cx="60"
                                    cy="60"
                                    r="52"
                                />
                                <circle
                                    className="score-fill"
                                    cx="60"
                                    cy="60"
                                    r="52"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                />
                            </svg>
                            <div className="score-value">{overallScore}</div>
                        </div>
                        <div className="score-label">Overall Compliance Score</div>
                    </div>
                    <div className="score-categories">
                        {complianceCategories.map((category, index) => (
                            <motion.div
                                key={category.name}
                                className="score-category"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <span className="score-category-label">{category.name}</span>
                                <div className="score-bar">
                                    <div
                                        className={`score-bar-fill ${category.status}`}
                                        style={{ width: `${category.score}%` }}
                                    />
                                </div>
                                <span className="score-category-value">{category.score}%</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Audit Trail */}
            <motion.div
                className="audit-trail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2>
                    <History size={20} />
                    Fiduciary Audit Trail
                </h2>
                <table className="audit-table">
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Description</th>
                            <th>User</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockAuditEntries.map((entry) => (
                            <tr key={entry.id}>
                                <td>
                                    <span className={`audit-action-badge ${entry.action}`}>
                                        {getActionIcon(entry.action)}
                                        {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                                    </span>
                                </td>
                                <td>{entry.description}</td>
                                <td>{entry.user}</td>
                                <td>{entry.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    )
}
