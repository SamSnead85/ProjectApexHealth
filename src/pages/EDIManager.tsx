import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FileCode2,
    Upload,
    Download,
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCw,
    Filter,
    Activity,
    ArrowRight,
    AlertTriangle,
    Building2,
    Zap,
    RotateCcw,
    Wrench
} from 'lucide-react'
import { exportToCSV } from '../utils/exportData'
import './EDIManager.css'

interface EDIFile {
    id: string
    filename: string
    type: '837' | '834' | '835'
    direction: 'incoming' | 'outgoing'
    status: 'processed' | 'processing' | 'error' | 'pending'
    records: number
    size: string
    timestamp: string
}

const files: EDIFile[] = [
    { id: '1', filename: 'ACME_834_20260129_001.x12', type: '834', direction: 'incoming', status: 'processed', records: 2847, size: '1.2 MB', timestamp: '10:23 AM' },
    { id: '2', filename: 'CLM_837P_20260129_042.x12', type: '837', direction: 'outgoing', status: 'processing', records: 1234, size: '856 KB', timestamp: '10:18 AM' },
    { id: '3', filename: 'BCBS_835_20260129_REF.x12', type: '835', direction: 'incoming', status: 'processed', records: 478, size: '245 KB', timestamp: '9:45 AM' },
    { id: '4', filename: 'CIGNA_834_20260129_ENR.x12', type: '834', direction: 'incoming', status: 'error', records: 0, size: '1.8 MB', timestamp: '9:30 AM' },
    { id: '5', filename: 'CLM_837I_20260128_091.x12', type: '837', direction: 'outgoing', status: 'processed', records: 892, size: '634 KB', timestamp: 'Yesterday' },
    { id: '6', filename: 'UNITED_835_20260128_PMT.x12', type: '835', direction: 'incoming', status: 'pending', records: 0, size: '324 KB', timestamp: 'Yesterday' },
]

// Transaction flow data
const transactionTypes = [
    { code: '837', name: 'Claims', dailyVolume: 12450, errorRate: 0.3, color: '#818cf8', direction: 'outgoing' },
    { code: '835', name: 'Remittance', dailyVolume: 8920, errorRate: 0.1, color: '#f59e0b', direction: 'incoming' },
    { code: '270/271', name: 'Eligibility', dailyVolume: 23100, errorRate: 0.5, color: '#14b8a6', direction: 'both' },
    { code: '276/277', name: 'Claim Status', dailyVolume: 9870, errorRate: 0.2, color: '#3b82f6', direction: 'both' },
    { code: '278', name: 'Prior Auth', dailyVolume: 2341, errorRate: 0.4, color: '#8b5cf6', direction: 'outgoing' },
    { code: '834', name: 'Enrollment', dailyVolume: 4520, errorRate: 0.6, color: '#22c55e', direction: 'incoming' },
    { code: '820', name: 'Premium Pay', dailyVolume: 1890, errorRate: 0.1, color: '#06b6d4', direction: 'outgoing' },
]

// Trading partner data
const tradingPartners = [
    { name: 'Blue Cross Blue Shield', uptime: 99.97, avgResponse: '1.2s', errorRate: 0.08, status: 'healthy' as const },
    { name: 'Cigna Healthcare', uptime: 99.91, avgResponse: '1.8s', errorRate: 0.14, status: 'healthy' as const },
    { name: 'UnitedHealth Group', uptime: 99.85, avgResponse: '2.1s', errorRate: 0.22, status: 'warning' as const },
    { name: 'Aetna / CVS Health', uptime: 99.94, avgResponse: '1.4s', errorRate: 0.11, status: 'healthy' as const },
]

// Failed transactions queue
const failedTransactions = [
    { id: 'TXN-90241', type: '837P', partner: 'UnitedHealth', error: 'ISA segment validation failed — invalid receiver ID', timestamp: '11:42 AM', severity: 'high' as const },
    { id: 'TXN-90238', type: '834', partner: 'Cigna', error: 'Duplicate enrollment record detected (member ID collision)', timestamp: '10:18 AM', severity: 'medium' as const },
    { id: 'TXN-90235', type: '270', partner: 'BCBS', error: 'Timeout — no 271 response within 30s SLA', timestamp: '9:55 AM', severity: 'low' as const },
    { id: 'TXN-90229', type: '835', partner: 'Aetna', error: 'CLP segment amount mismatch ($1,247.00 vs $1,274.00)', timestamp: '9:12 AM', severity: 'medium' as const },
]

export default function EDIManager() {
    const [activeFilter, setActiveFilter] = useState('all')
    const [dragActive, setDragActive] = useState(false)

    const filteredFiles = activeFilter === 'all'
        ? files
        : files.filter(f => f.type === activeFilter)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    return (
        <div className="edi-manager">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <FileCode2 size={28} />
                    EDI Manager
                </h1>
                <p className="page-subtitle">
                    Process and manage X12 healthcare transaction files (837, 834, 835)
                </p>
            </motion.div>

            {/* Stats */}
            <div className="edi-stats">
                <motion.div
                    className="edi-stat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="edi-stat-header">
                        <span className="edi-stat-label">Incoming Today</span>
                        <div className="edi-stat-icon incoming">
                            <ArrowDownLeft size={16} />
                        </div>
                    </div>
                    <div className="edi-stat-value">47</div>
                    <div className="edi-stat-trend">+12 from yesterday</div>
                </motion.div>

                <motion.div
                    className="edi-stat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="edi-stat-header">
                        <span className="edi-stat-label">Outgoing Today</span>
                        <div className="edi-stat-icon outgoing">
                            <ArrowUpRight size={16} />
                        </div>
                    </div>
                    <div className="edi-stat-value">23</div>
                    <div className="edi-stat-trend">+5 from yesterday</div>
                </motion.div>

                <motion.div
                    className="edi-stat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="edi-stat-header">
                        <span className="edi-stat-label">Errors</span>
                        <div className="edi-stat-icon errors">
                            <XCircle size={16} />
                        </div>
                    </div>
                    <div className="edi-stat-value">2</div>
                    <div className="edi-stat-trend">-3 from yesterday</div>
                </motion.div>

                <motion.div
                    className="edi-stat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <div className="edi-stat-header">
                        <span className="edi-stat-label">Pending</span>
                        <div className="edi-stat-icon pending">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="edi-stat-value">8</div>
                    <div className="edi-stat-trend">Processing...</div>
                </motion.div>
            </div>

            {/* Upload */}
            <motion.div
                className="upload-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3>
                    <Upload size={18} />
                    Upload EDI Files
                </h3>
                <div
                    className={`upload-dropzone ${dragActive ? 'active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                >
                    <div className="upload-icon">
                        <Upload size={28} />
                    </div>
                    <h4>Drop files here or click to upload</h4>
                    <p>Supported formats: X12 837, 834, 835, 270/271, 276/277</p>
                    <div className="file-types">
                        <span className="file-type">837 Claims</span>
                        <span className="file-type">834 Enrollment</span>
                        <span className="file-type">835 Remittance</span>
                    </div>
                </div>
            </motion.div>

            {/* ========== REAL-TIME TRANSACTION FLOW ========== */}
            <motion.div
                className="edi-txn-flow-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <h3>
                    <Activity size={18} />
                    Real-Time Transaction Flow
                </h3>
                <div className="edi-txn-pipeline">
                    {transactionTypes.map((txn, index) => (
                        <motion.div
                            key={txn.code}
                            className="edi-txn-node"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.35 + index * 0.05 }}
                        >
                            <div className="edi-txn-node-header" style={{ borderColor: txn.color }}>
                                <span className="edi-txn-code" style={{ color: txn.color }}>{txn.code}</span>
                                <span className="edi-txn-name">{txn.name}</span>
                            </div>
                            <div className="edi-txn-node-stats">
                                <div className="edi-txn-stat">
                                    <span className="edi-txn-stat-value">{txn.dailyVolume.toLocaleString()}</span>
                                    <span className="edi-txn-stat-label">daily vol</span>
                                </div>
                                <div className="edi-txn-stat">
                                    <span className="edi-txn-stat-value" style={{ color: txn.errorRate > 0.4 ? '#f59e0b' : '#22c55e' }}>{txn.errorRate}%</span>
                                    <span className="edi-txn-stat-label">errors</span>
                                </div>
                            </div>
                            <div className="edi-txn-direction">
                                {txn.direction === 'incoming' && <span style={{ color: '#22c55e' }}>↓ IN</span>}
                                {txn.direction === 'outgoing' && <span style={{ color: '#818cf8' }}>↑ OUT</span>}
                                {txn.direction === 'both' && <span style={{ color: '#14b8a6' }}>↕ BOTH</span>}
                            </div>
                            {index < transactionTypes.length - 1 && (
                                <ArrowRight size={14} className="edi-txn-arrow" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ========== TRADING PARTNER SCORECARDS ========== */}
            <motion.div
                className="edi-partners-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h3>
                    <Building2 size={18} />
                    Trading Partner Performance
                </h3>
                <div className="edi-partner-grid">
                    {tradingPartners.map((partner, index) => (
                        <motion.div
                            key={partner.name}
                            className="edi-partner-card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.06 }}
                        >
                            <div className="edi-partner-header">
                                <span className="edi-partner-name">{partner.name}</span>
                                <span className={`edi-partner-status ${partner.status}`}>
                                    {partner.status === 'healthy' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                    {partner.status}
                                </span>
                            </div>
                            <div className="edi-partner-metrics">
                                <div className="edi-partner-metric">
                                    <span className="edi-partner-metric-label">Uptime</span>
                                    <span className="edi-partner-metric-value">{partner.uptime}%</span>
                                </div>
                                <div className="edi-partner-metric">
                                    <span className="edi-partner-metric-label">Avg Response</span>
                                    <span className="edi-partner-metric-value">{partner.avgResponse}</span>
                                </div>
                                <div className="edi-partner-metric">
                                    <span className="edi-partner-metric-label">Error Rate</span>
                                    <span className="edi-partner-metric-value" style={{ color: partner.errorRate > 0.15 ? '#f59e0b' : '#22c55e' }}>{partner.errorRate}%</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ========== FAILED TRANSACTION QUEUE ========== */}
            <motion.div
                className="edi-failed-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
            >
                <div className="edi-failed-header">
                    <h3>
                        <XCircle size={18} />
                        Failed Transaction Queue
                    </h3>
                    <span className="edi-failed-count">{failedTransactions.length} items</span>
                </div>
                <div className="edi-failed-list">
                    {failedTransactions.map((txn, index) => (
                        <motion.div
                            key={txn.id}
                            className={`edi-failed-item severity-${txn.severity}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + index * 0.05 }}
                        >
                            <div className="edi-failed-main">
                                <div className="edi-failed-id-row">
                                    <span className="edi-failed-id">{txn.id}</span>
                                    <span className="edi-failed-type">{txn.type}</span>
                                    <span className="edi-failed-partner">{txn.partner}</span>
                                    <span className="edi-failed-time">{txn.timestamp}</span>
                                </div>
                                <p className="edi-failed-error">{txn.error}</p>
                            </div>
                            <div className="edi-failed-actions">
                                <button className="edi-failed-btn retry" title="Retry">
                                    <RotateCcw size={14} />
                                    Retry
                                </button>
                                <button className="edi-failed-btn resolve" title="Resolve">
                                    <Wrench size={14} />
                                    Resolve
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* File List */}
            <motion.div
                className="file-list-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="file-list-header">
                    <h3>
                        <FileText size={18} />
                        Recent Files
                    </h3>
                    <button
                        className="file-filter"
                        onClick={() => exportToCSV(filteredFiles.map(f => ({
                            'File ID': f.id,
                            'Filename': f.filename,
                            'Type': f.type,
                            'Direction': f.direction,
                            'Status': f.status,
                            'Records': f.records,
                            'Size': f.size,
                            'Timestamp': f.timestamp,
                        })), 'edi_transactions')}
                        title="Export EDI files to CSV"
                    >
                        <Download size={14} style={{ marginRight: 4 }} />
                        Export CSV
                    </button>
                    <div className="file-filters">
                        {['all', '837', '834', '835'].map((filter) => (
                            <button
                                key={filter}
                                className={`file-filter ${activeFilter === filter ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter === 'all' ? 'All' : filter}
                            </button>
                        ))}
                    </div>
                </div>
                <table className="file-table">
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th>Type</th>
                            <th>Direction</th>
                            <th>Status</th>
                            <th>Records</th>
                            <th>Size</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFiles.map((file) => (
                            <tr key={file.id}>
                                <td>
                                    <div className="file-name">
                                        <div className={`file-icon x12-${file.type}`}>
                                            <FileCode2 size={16} />
                                        </div>
                                        {file.filename}
                                    </div>
                                </td>
                                <td>{file.type}</td>
                                <td>
                                    {file.direction === 'incoming' ? (
                                        <span style={{ color: '#22c55e' }}>↓ Incoming</span>
                                    ) : (
                                        <span style={{ color: '#818cf8' }}>↑ Outgoing</span>
                                    )}
                                </td>
                                <td>
                                    <span className={`file-status ${file.status}`}>
                                        {file.status === 'processed' && <CheckCircle2 size={12} />}
                                        {file.status === 'processing' && <RefreshCw size={12} className="animate-spin" />}
                                        {file.status === 'error' && <XCircle size={12} />}
                                        {file.status === 'pending' && <Clock size={12} />}
                                        {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                                    </span>
                                </td>
                                <td>{file.records > 0 ? file.records.toLocaleString() : '-'}</td>
                                <td>{file.size}</td>
                                <td style={{ color: 'var(--text-tertiary)' }}>{file.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    )
}
