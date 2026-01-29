import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FileText,
    Download,
    Upload,
    Folder,
    FolderOpen,
    Search,
    Filter,
    Grid,
    List,
    Eye,
    Share2,
    Trash2,
    MoreVertical,
    Shield,
    Clock,
    ChevronRight,
    File,
    FileImage,
    FileScan,
    CreditCard,
    Receipt
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './DocumentCenter.css'

// Document type
interface Document {
    id: string
    name: string
    type: 'pdf' | 'image' | 'eob' | 'id-card' | 'form' | 'tax'
    category: string
    date: Date
    size: string
    description?: string
}

const mockDocuments: Document[] = [
    {
        id: 'd1',
        name: 'ID Card - Front & Back',
        type: 'id-card',
        category: 'ID Cards',
        date: new Date('2024-01-01'),
        size: '245 KB',
        description: 'Digital Member ID Card'
    },
    {
        id: 'd2',
        name: 'EOB - January 2024',
        type: 'eob',
        category: 'EOB',
        date: new Date('2024-01-22'),
        size: '1.2 MB',
        description: 'Explanation of Benefits for January'
    },
    {
        id: 'd3',
        name: 'Lab Results - Metabolic Panel',
        type: 'pdf',
        category: 'Medical Records',
        date: new Date('2024-01-15'),
        size: '340 KB'
    },
    {
        id: 'd4',
        name: '1095-A Tax Form',
        type: 'tax',
        category: 'Tax Documents',
        date: new Date('2024-01-31'),
        size: '180 KB',
        description: 'Health Insurance Marketplace Statement'
    },
    {
        id: 'd5',
        name: 'FSA Claim Receipt',
        type: 'image',
        category: 'Receipts',
        date: new Date('2024-01-18'),
        size: '2.1 MB'
    },
    {
        id: 'd6',
        name: 'Prior Authorization Form',
        type: 'form',
        category: 'Forms',
        date: new Date('2024-01-10'),
        size: '95 KB'
    }
]

const categories = [
    { id: 'all', name: 'All Documents', icon: <Folder size={18} /> },
    { id: 'id-cards', name: 'ID Cards', icon: <CreditCard size={18} /> },
    { id: 'eob', name: 'EOB', icon: <Receipt size={18} /> },
    { id: 'medical', name: 'Medical Records', icon: <FileScan size={18} /> },
    { id: 'tax', name: 'Tax Documents', icon: <FileText size={18} /> },
    { id: 'forms', name: 'Forms', icon: <File size={18} /> }
]

const getDocumentIcon = (type: string) => {
    switch (type) {
        case 'id-card': return <CreditCard size={24} />
        case 'eob': return <Receipt size={24} />
        case 'image': return <FileImage size={24} />
        case 'tax': return <FileText size={24} />
        case 'form': return <File size={24} />
        default: return <FileText size={24} />
    }
}

export function DocumentCenter() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedDocs, setSelectedDocs] = useState<string[]>([])

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const filteredDocuments = mockDocuments.filter(doc => {
        const matchesSearch = searchQuery === '' ||
            doc.name.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCategory = activeCategory === 'all' ||
            doc.category.toLowerCase().includes(activeCategory.replace('-', ' '))

        return matchesSearch && matchesCategory
    })

    return (
        <div className="document-center">
            {/* Header */}
            <div className="document-center__header">
                <div className="header-content">
                    <h1>Document Center</h1>
                    <p>Access and manage your healthcare documents securely</p>
                </div>
                <Button variant="primary" icon={<Upload size={16} />}>
                    Upload Document
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="document-center__toolbar">
                <div className="doc-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="toolbar-actions">
                    <div className="view-toggle">
                        <button
                            className={viewMode === 'grid' ? 'active' : ''}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            className={viewMode === 'list' ? 'active' : ''}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="document-center__content">
                {/* Sidebar Categories */}
                <aside className="doc-sidebar">
                    <h3>Categories</h3>
                    <nav className="category-nav">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                {cat.icon}
                                <span>{cat.name}</span>
                                <Badge variant="info" size="sm">
                                    {cat.id === 'all'
                                        ? mockDocuments.length
                                        : mockDocuments.filter(d =>
                                            d.category.toLowerCase().includes(cat.name.toLowerCase().split(' ')[0])
                                        ).length
                                    }
                                </Badge>
                            </button>
                        ))}
                    </nav>

                    <div className="storage-info">
                        <div className="storage-header">
                            <span>Storage Used</span>
                            <span>4.2 GB / 10 GB</span>
                        </div>
                        <div className="storage-bar">
                            <div className="storage-bar__fill" style={{ width: '42%' }} />
                        </div>
                    </div>
                </aside>

                {/* Document Grid */}
                <main className={`doc-main ${viewMode === 'list' ? 'list-view' : ''}`}>
                    <div className="doc-grid">
                        {filteredDocuments.map((doc, index) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <GlassCard className="doc-card">
                                    <div className="doc-card__icon">
                                        {getDocumentIcon(doc.type)}
                                    </div>
                                    <div className="doc-card__content">
                                        <h4>{doc.name}</h4>
                                        {doc.description && (
                                            <p className="doc-description">{doc.description}</p>
                                        )}
                                        <div className="doc-meta">
                                            <span><Clock size={12} /> {formatDate(doc.date)}</span>
                                            <span>{doc.size}</span>
                                        </div>
                                    </div>
                                    <div className="doc-card__actions">
                                        <button className="doc-action" title="View">
                                            <Eye size={16} />
                                        </button>
                                        <button className="doc-action" title="Download">
                                            <Download size={16} />
                                        </button>
                                        <button className="doc-action" title="Share">
                                            <Share2 size={16} />
                                        </button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DocumentCenter
