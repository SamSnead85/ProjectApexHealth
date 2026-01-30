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
    Filter
} from 'lucide-react'
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

            {/* File List */}
            <motion.div
                className="file-list-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="file-list-header">
                    <h3>
                        <FileText size={18} />
                        Recent Files
                    </h3>
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
