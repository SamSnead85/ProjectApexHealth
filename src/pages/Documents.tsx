import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText,
    Download,
    Upload,
    Search,
    Filter,
    Calendar,
    Eye,
    Trash2,
    FolderOpen,
    File,
    FileImage,
    FilePlus,
    Share2,
    Lock,
    CheckCircle2,
    Clock,
    ChevronRight,
    MoreVertical
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './Documents.css'

interface Document {
    id: string
    name: string
    type: 'eob' | 'claim' | 'id-card' | 'form' | 'letter' | 'tax'
    category: string
    dateAdded: string
    size: string
    status: 'available' | 'processing' | 'expired'
    secure: boolean
}

interface DocumentCategory {
    id: string
    name: string
    count: number
    icon: React.ReactNode
}

const mockDocuments: Document[] = [
    {
        id: 'doc-1',
        name: 'EOB - Office Visit January 15',
        type: 'eob',
        category: 'Explanation of Benefits',
        dateAdded: '2024-01-22',
        size: '245 KB',
        status: 'available',
        secure: true
    },
    {
        id: 'doc-2',
        name: 'Digital ID Card - 2024',
        type: 'id-card',
        category: 'ID Cards',
        dateAdded: '2024-01-01',
        size: '128 KB',
        status: 'available',
        secure: false
    },
    {
        id: 'doc-3',
        name: '1095-B Tax Form 2023',
        type: 'tax',
        category: 'Tax Documents',
        dateAdded: '2024-01-15',
        size: '89 KB',
        status: 'available',
        secure: true
    },
    {
        id: 'doc-4',
        name: 'Prior Authorization Approval',
        type: 'letter',
        category: 'Letters',
        dateAdded: '2024-01-20',
        size: '156 KB',
        status: 'available',
        secure: true
    },
    {
        id: 'doc-5',
        name: 'Claim Submission Form',
        type: 'form',
        category: 'Forms',
        dateAdded: '2024-01-10',
        size: '342 KB',
        status: 'processing',
        secure: false
    }
]

const documentCategories: DocumentCategory[] = [
    { id: 'all', name: 'All Documents', count: 5, icon: <FolderOpen size={18} /> },
    { id: 'eob', name: 'Explanation of Benefits', count: 1, icon: <FileText size={18} /> },
    { id: 'id-card', name: 'ID Cards', count: 1, icon: <FileImage size={18} /> },
    { id: 'tax', name: 'Tax Documents', count: 1, icon: <File size={18} /> },
    { id: 'letter', name: 'Letters', count: 1, icon: <FileText size={18} /> },
    { id: 'form', name: 'Forms', count: 1, icon: <FilePlus size={18} /> }
]

export function Documents() {
    const navigate = useNavigate()
    const [documents] = useState<Document[]>(mockDocuments)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const getTypeIcon = (type: Document['type']) => {
        switch (type) {
            case 'eob': return <FileText size={20} />
            case 'id-card': return <FileImage size={20} />
            case 'tax': return <File size={20} />
            case 'letter': return <FileText size={20} />
            case 'form': return <FilePlus size={20} />
            case 'claim': return <FileText size={20} />
        }
    }

    const getStatusBadge = (status: Document['status']) => {
        switch (status) {
            case 'available':
                return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Available</Badge>
            case 'processing':
                return <Badge variant="warning" icon={<Clock size={10} />}>Processing</Badge>
            case 'expired':
                return <Badge variant="critical">Expired</Badge>
        }
    }

    const filteredDocuments = documents.filter(doc => {
        if (selectedCategory !== 'all' && doc.type !== selectedCategory) return false
        if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
        return true
    })

    return (
        <div className="documents-page">
            {/* Header */}
            <div className="documents__header">
                <div>
                    <h1 className="documents__title">Documents</h1>
                    <p className="documents__subtitle">
                        Access your healthcare documents and forms
                    </p>
                </div>
                <div className="documents__actions">
                    <Button variant="secondary" icon={<Upload size={16} />}>
                        Upload Document
                    </Button>
                </div>
            </div>

            <div className="documents__layout">
                {/* Sidebar */}
                <div className="documents__sidebar">
                    <h3>Categories</h3>
                    <div className="documents__categories">
                        {documentCategories.map((cat) => (
                            <button
                                key={cat.id}
                                className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                <span className="category-item__icon">{cat.icon}</span>
                                <span className="category-item__name">{cat.name}</span>
                                <span className="category-item__count">{cat.count}</span>
                            </button>
                        ))}
                    </div>

                    <div className="documents__quick-access">
                        <h4>Quick Access</h4>
                        <button className="quick-access-item" onClick={() => navigate('/member/id-card')}>
                            <FileImage size={16} />
                            View ID Card
                        </button>
                        <button className="quick-access-item">
                            <File size={16} />
                            Tax Documents
                        </button>
                        <button className="quick-access-item">
                            <FilePlus size={16} />
                            Claim Form
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="documents__main">
                    {/* Search & Filters */}
                    <div className="documents__toolbar">
                        <div className="documents__search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="documents__filters">
                            <Button variant="ghost" size="sm" icon={<Filter size={14} />}>
                                Filter
                            </Button>
                            <Button variant="ghost" size="sm" icon={<Calendar size={14} />}>
                                Date Range
                            </Button>
                        </div>
                    </div>

                    {/* Document List */}
                    <div className="documents__list">
                        <AnimatePresence>
                            {filteredDocuments.map((doc, index) => (
                                <motion.div
                                    key={doc.id}
                                    className="document-item"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className={`document-item__icon document-item__icon--${doc.type}`}>
                                        {getTypeIcon(doc.type)}
                                    </div>
                                    <div className="document-item__info">
                                        <div className="document-item__name">
                                            {doc.name}
                                            {doc.secure && <Lock size={12} className="secure-icon" />}
                                        </div>
                                        <div className="document-item__meta">
                                            <span>{doc.category}</span>
                                            <span>•</span>
                                            <span>{doc.size}</span>
                                            <span>•</span>
                                            <span>{formatDate(doc.dateAdded)}</span>
                                        </div>
                                    </div>
                                    <div className="document-item__status">
                                        {getStatusBadge(doc.status)}
                                    </div>
                                    <div className="document-item__actions">
                                        <button className="document-action" title="View">
                                            <Eye size={16} />
                                        </button>
                                        <button className="document-action" title="Download">
                                            <Download size={16} />
                                        </button>
                                        <button className="document-action" title="Share">
                                            <Share2 size={16} />
                                        </button>
                                        <button className="document-action document-action--more">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredDocuments.length === 0 && (
                            <div className="documents__empty">
                                <FolderOpen size={48} />
                                <p>No documents found</p>
                            </div>
                        )}
                    </div>

                    {/* Storage Info */}
                    <GlassCard className="documents__storage">
                        <div className="storage-info">
                            <div className="storage-info__header">
                                <span>Storage Used</span>
                                <span className="storage-info__value">1.2 MB of 100 MB</span>
                            </div>
                            <div className="storage-info__bar">
                                <div className="storage-info__fill" style={{ width: '1.2%' }} />
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}

export default Documents
