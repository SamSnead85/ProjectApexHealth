import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload,
    File,
    FileText,
    Image,
    X,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Shield,
    Eye,
    Download,
    Trash2,
    Search,
    Filter
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './DocumentUpload.css'

interface UploadedDocument {
    id: string
    name: string
    type: 'lab' | 'imaging' | 'clinical' | 'insurance' | 'consent'
    size: number
    status: 'uploading' | 'processing' | 'completed' | 'error'
    progress: number
    uploadedAt: string
    ocrProcessed: boolean
}

const documentTypes = [
    { value: 'lab', label: 'Lab Results', icon: <FileText size={16} /> },
    { value: 'imaging', label: 'Imaging/Radiology', icon: <Image size={16} /> },
    { value: 'clinical', label: 'Clinical Notes', icon: <File size={16} /> },
    { value: 'insurance', label: 'Insurance Card', icon: <Shield size={16} /> },
    { value: 'consent', label: 'Consent Form', icon: <FileText size={16} /> }
]

const recentUploads: UploadedDocument[] = [
    { id: 'DOC-001', name: 'Lab_Results_2024.pdf', type: 'lab', size: 245000, status: 'completed', progress: 100, uploadedAt: '2024-01-25T10:30:00Z', ocrProcessed: true },
    { id: 'DOC-002', name: 'MRI_Scan_Report.pdf', type: 'imaging', size: 1250000, status: 'completed', progress: 100, uploadedAt: '2024-01-24T14:15:00Z', ocrProcessed: true },
    { id: 'DOC-003', name: 'Insurance_Card_Front.jpg', type: 'insurance', size: 89000, status: 'completed', progress: 100, uploadedAt: '2024-01-23T09:00:00Z', ocrProcessed: true }
]

export function DocumentUpload() {
    const [uploads] = useState<UploadedDocument[]>(recentUploads)
    const [dragActive, setDragActive] = useState(false)
    const [selectedType, setSelectedType] = useState('clinical')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const getStatusBadge = (status: UploadedDocument['status']) => {
        switch (status) {
            case 'completed': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Completed</Badge>
            case 'processing': return <Badge variant="info" icon={<Clock size={10} />}>Processing</Badge>
            case 'uploading': return <Badge variant="warning">Uploading</Badge>
            case 'error': return <Badge variant="critical" icon={<AlertTriangle size={10} />}>Error</Badge>
        }
    }

    return (
        <div className="document-upload-page">
            {/* Header */}
            <div className="doc-upload__header">
                <div>
                    <h1 className="doc-upload__title">Document Upload</h1>
                    <p className="doc-upload__subtitle">
                        Securely upload medical documents with HIPAA-compliant OCR processing
                    </p>
                </div>
                <Badge variant="success" icon={<Shield size={12} />}>HIPAA Compliant</Badge>
            </div>

            {/* Upload Zone */}
            <GlassCard className="upload-zone-card">
                <div className="upload-type-selector">
                    <label>Document Type</label>
                    <div className="type-options">
                        {documentTypes.map(type => (
                            <button
                                key={type.value}
                                className={`type-option ${selectedType === type.value ? 'active' : ''}`}
                                onClick={() => setSelectedType(type.value)}
                            >
                                {type.icon}
                                <span>{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div
                    className={`upload-dropzone ${dragActive ? 'active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        style={{ display: 'none' }}
                    />
                    <div className="dropzone-icon">
                        <Upload size={32} />
                    </div>
                    <h3>Drag & drop files here</h3>
                    <p>or click to browse</p>
                    <span className="file-types">PDF, JPG, PNG, DOC up to 25MB</span>
                </div>

                <div className="upload-features">
                    <div className="feature">
                        <Shield size={16} />
                        <span>256-bit encryption</span>
                    </div>
                    <div className="feature">
                        <Eye size={16} />
                        <span>OCR text extraction</span>
                    </div>
                    <div className="feature">
                        <CheckCircle2 size={16} />
                        <span>Auto-categorization</span>
                    </div>
                </div>
            </GlassCard>

            {/* Recent Uploads */}
            <GlassCard className="recent-uploads">
                <div className="recent-uploads__header">
                    <h3>Recent Uploads</h3>
                    <div className="recent-uploads__actions">
                        <div className="search-box">
                            <Search size={16} />
                            <input type="text" placeholder="Search documents..." />
                        </div>
                        <Button variant="ghost" size="sm" icon={<Filter size={14} />}>Filter</Button>
                    </div>
                </div>

                <div className="uploads-list">
                    <AnimatePresence>
                        {uploads.map((doc, index) => (
                            <motion.div
                                key={doc.id}
                                className="upload-item"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="upload-item__icon">
                                    <FileText size={20} />
                                </div>
                                <div className="upload-item__info">
                                    <span className="upload-item__name">{doc.name}</span>
                                    <span className="upload-item__meta">
                                        {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="upload-item__ocr">
                                    {doc.ocrProcessed && (
                                        <Badge variant="teal" size="sm">OCR Complete</Badge>
                                    )}
                                </div>
                                {getStatusBadge(doc.status)}
                                <div className="upload-item__actions">
                                    <button className="action-btn"><Eye size={14} /></button>
                                    <button className="action-btn"><Download size={14} /></button>
                                    <button className="action-btn delete"><Trash2 size={14} /></button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </GlassCard>
        </div>
    )
}

export default DocumentUpload
