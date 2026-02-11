import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText,
    Download,
    Calendar,
    Search,
    Filter,
    BookOpen,
    Pill,
    Users,
    Shield,
    AlertCircle,
    ExternalLink,
    ChevronRight,
    Clock,
    Eye,
    FolderOpen,
    FileCheck
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'

type DocCategory = 'all' | 'benefits' | 'policy' | 'formulary' | 'directory' | 'updates'

interface PlanDocument {
    id: string
    name: string
    description: string
    category: DocCategory
    type: string
    date: string
    size: string
    icon: React.ReactNode
    important?: boolean
    version?: string
}

interface PolicyUpdate {
    id: string
    title: string
    date: string
    summary: string
    category: string
    isNew: boolean
}

const documents: PlanDocument[] = [
    { id: 'DOC-001', name: 'Summary of Benefits and Coverage (SBC)', description: 'A comprehensive overview of your plan benefits, costs, and coverage details for the 2024 plan year.', category: 'benefits', type: 'PDF', date: '2024-01-01', size: '2.4 MB', icon: <Shield size={20} />, important: true, version: '2024.1' },
    { id: 'DOC-002', name: 'Evidence of Coverage (EOC)', description: 'Complete legal document describing your health plan coverage, rights, and responsibilities.', category: 'benefits', type: 'PDF', date: '2024-01-01', size: '45 MB', icon: <BookOpen size={20} />, version: '2024.1' },
    { id: 'DOC-003', name: 'Member Handbook', description: 'Quick-reference guide covering how to use your plan, find providers, and file claims.', category: 'benefits', type: 'PDF', date: '2024-01-01', size: '12 MB', icon: <FileText size={20} />, version: '3.2' },
    { id: 'DOC-004', name: 'Formulary Drug List', description: 'Complete list of covered prescription medications organized by tier and therapeutic class.', category: 'formulary', type: 'PDF', date: '2024-01-15', size: '8.2 MB', icon: <Pill size={20} />, important: true, version: '2024-Q1' },
    { id: 'DOC-005', name: 'Provider Directory', description: 'Searchable directory of in-network physicians, specialists, and facilities.', category: 'directory', type: 'PDF', date: '2024-01-10', size: '18 MB', icon: <Users size={20} />, version: '2024-Jan' },
    { id: 'DOC-006', name: 'Plan Brochure', description: 'Marketing overview highlighting plan features, premiums, and enrollment information.', category: 'benefits', type: 'PDF', date: '2024-01-01', size: '4.8 MB', icon: <FolderOpen size={20} />, version: '2024' },
    { id: 'DOC-007', name: 'Prior Authorization Guide', description: 'Services and procedures that require prior authorization and how to obtain approval.', category: 'policy', type: 'PDF', date: '2024-01-05', size: '1.2 MB', icon: <FileCheck size={20} /> },
    { id: 'DOC-008', name: 'Appeals & Grievances Process', description: 'Step-by-step guide on how to file an appeal or grievance if a claim is denied.', category: 'policy', type: 'PDF', date: '2023-12-01', size: '960 KB', icon: <AlertCircle size={20} /> },
    { id: 'DOC-009', name: 'Preventive Care Benefits', description: 'Complete list of preventive services covered at no additional cost to you.', category: 'benefits', type: 'PDF', date: '2024-01-01', size: '520 KB', icon: <Shield size={20} /> },
    { id: 'DOC-010', name: 'Specialty Drug Coverage', description: 'Coverage details for specialty medications including step therapy requirements.', category: 'formulary', type: 'PDF', date: '2024-02-01', size: '3.1 MB', icon: <Pill size={20} /> }
]

const policyUpdates: PolicyUpdate[] = [
    { id: 'UPD-001', title: 'Telehealth Coverage Expansion', date: '2024-02-01', summary: 'Telehealth visits now covered at $0 copay for primary care through June 2024.', category: 'Coverage', isNew: true },
    { id: 'UPD-002', title: 'Formulary Update - Q1 2024', date: '2024-01-15', summary: 'New generic medications added to Tier 1. Three brand-name drugs moved to Tier 3.', category: 'Formulary', isNew: true },
    { id: 'UPD-003', title: 'Network Addition: Metro Health System', date: '2024-01-10', summary: 'Metro Health System and all affiliated clinics are now in-network effective immediately.', category: 'Network', isNew: false },
    { id: 'UPD-004', title: 'Mental Health Parity Update', date: '2024-01-05', summary: 'Updated mental health coverage to comply with new federal parity requirements.', category: 'Policy', isNew: false },
    { id: 'UPD-005', title: 'Out-of-Pocket Maximum Adjustment', date: '2023-12-15', summary: 'Annual out-of-pocket maximums adjusted per CMS guidelines for plan year 2024.', category: 'Benefits', isNew: false }
]

const categories: { key: DocCategory; label: string; count: number }[] = [
    { key: 'all', label: 'All Documents', count: documents.length },
    { key: 'benefits', label: 'Benefits', count: documents.filter(d => d.category === 'benefits').length },
    { key: 'policy', label: 'Policy', count: documents.filter(d => d.category === 'policy').length },
    { key: 'formulary', label: 'Formulary', count: documents.filter(d => d.category === 'formulary').length },
    { key: 'directory', label: 'Directory', count: documents.filter(d => d.category === 'directory').length }
]

const cardStyle: React.CSSProperties = {
    background: 'rgba(10, 15, 26, 0.6)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16
}

export default function PlanDocuments() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<DocCategory>('all')
    const [previewDoc, setPreviewDoc] = useState<string | null>(null)

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = activeCategory === 'all' || doc.category === activeCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div style={{ padding: 'var(--space-xl)', maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: 'var(--space-xl)' }}
            >
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--apex-white)', marginBottom: 'var(--space-xs)' }}>
                    Plan Documents
                </h1>
                <p style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-md)' }}>
                    Access your plan documentation, benefit materials, and recent policy updates
                </p>
            </motion.div>

            {/* Quick Access SBC */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ marginBottom: 'var(--space-xl)' }}
            >
                <div style={{
                    ...cardStyle,
                    padding: 'var(--space-lg)',
                    background: 'linear-gradient(135deg, rgba(0, 200, 180, 0.08), rgba(10, 15, 26, 0.6))',
                    border: '1px solid rgba(0, 200, 180, 0.15)',
                    display: 'flex', alignItems: 'center', gap: 'var(--space-lg)'
                }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 16,
                        background: 'rgba(0, 200, 180, 0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <Shield size={28} style={{ color: 'var(--apex-teal)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 4 }}>
                            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--apex-white)' }}>
                                Summary of Benefits and Coverage (SBC)
                            </span>
                            <Badge variant="teal">Required Document</Badge>
                        </div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--apex-silver)', lineHeight: 1.5 }}>
                            Your SBC provides a standardized summary of plan costs and coverage. Updated for the 2024 plan year.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexShrink: 0 }}>
                        <Button variant="secondary" size="sm" icon={<Eye size={14} />}>Preview</Button>
                        <Button variant="primary" size="sm" icon={<Download size={14} />}>Download SBC</Button>
                    </div>
                </div>
            </motion.div>

            {/* Search & Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                style={{ marginBottom: 'var(--space-lg)' }}
            >
                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                    <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                        padding: '10px var(--space-md)',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 12
                    }}>
                        <Search size={16} style={{ color: 'var(--apex-steel)', flexShrink: 0 }} />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search documents by name or description..."
                            style={{
                                flex: 1, background: 'none', border: 'none',
                                color: 'var(--apex-white)', outline: 'none',
                                fontSize: 'var(--text-sm)'
                            }}
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: 8,
                                border: activeCategory === cat.key
                                    ? '1px solid var(--apex-teal)'
                                    : '1px solid rgba(255,255,255,0.08)',
                                background: activeCategory === cat.key
                                    ? 'rgba(0, 200, 180, 0.1)'
                                    : 'rgba(255,255,255,0.03)',
                                color: activeCategory === cat.key
                                    ? 'var(--apex-teal)'
                                    : 'var(--apex-silver)',
                                cursor: 'pointer',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 500,
                                display: 'flex', alignItems: 'center', gap: 6
                            }}
                        >
                            {cat.label}
                            <span style={{
                                fontSize: 'var(--text-xs)',
                                opacity: 0.7,
                                background: 'rgba(255,255,255,0.06)',
                                padding: '1px 6px',
                                borderRadius: 4
                            }}>
                                {cat.count}
                            </span>
                        </button>
                    ))}
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-xl)' }}>
                {/* Documents List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: 'var(--space-md) var(--space-lg)',
                            borderBottom: '1px solid rgba(255,255,255,0.06)'
                        }}>
                            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--apex-white)' }}>
                                {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}
                            </span>
                            <Button variant="ghost" size="sm" icon={<Download size={14} />}>
                                Download All
                            </Button>
                        </div>

                        <AnimatePresence>
                            {filteredDocs.map((doc, index) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                    onClick={() => setPreviewDoc(previewDoc === doc.id ? null : doc.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                                        padding: 'var(--space-md) var(--space-lg)',
                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                        cursor: 'pointer',
                                        background: previewDoc === doc.id ? 'rgba(0, 200, 180, 0.03)' : 'transparent',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={e => { if (previewDoc !== doc.id) (e.currentTarget.style.background = 'rgba(255,255,255,0.02)') }}
                                    onMouseLeave={e => { if (previewDoc !== doc.id) (e.currentTarget.style.background = 'transparent') }}
                                >
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 10,
                                        background: doc.important ? 'rgba(0, 200, 180, 0.12)' : 'rgba(255,255,255,0.04)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: doc.important ? 'var(--apex-teal)' : 'var(--apex-silver)',
                                        flexShrink: 0
                                    }}>
                                        {doc.icon}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 2 }}>
                                            <span style={{
                                                fontWeight: 600, color: 'var(--apex-white)',
                                                fontSize: 'var(--text-sm)',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                            }}>
                                                {doc.name}
                                            </span>
                                            {doc.important && <Badge variant="warning" style={{ fontSize: 10, padding: '1px 6px' }}>Important</Badge>}
                                        </div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--apex-steel)' }}>
                                            {doc.type} • {doc.size} • Updated {new Date(doc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            {doc.version && ` • v${doc.version}`}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-xs)', flexShrink: 0 }}>
                                        <Button variant="ghost" size="sm" icon={<Eye size={14} />} onClick={e => e.stopPropagation()}>View</Button>
                                        <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={e => e.stopPropagation()}>Download</Button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredDocs.length === 0 && (
                            <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
                                <FolderOpen size={40} style={{ color: 'var(--apex-steel)', marginBottom: 'var(--space-md)', opacity: 0.4 }} />
                                <p style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-sm)' }}>
                                    No documents match your search
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Policy Updates Sidebar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div style={{ ...cardStyle, padding: 'var(--space-lg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                            <Clock size={18} style={{ color: 'var(--apex-teal)' }} />
                            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--apex-white)' }}>
                                Recent Policy Updates
                            </h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            {policyUpdates.map((update, index) => (
                                <motion.div
                                    key={update.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                                    style={{
                                        padding: 'var(--space-sm)',
                                        borderRadius: 10,
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        background: 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 4 }}>
                                        {update.isNew && <Badge variant="info" style={{ fontSize: 9, padding: '0px 5px' }}>New</Badge>}
                                        <Badge variant="default" style={{ fontSize: 9, padding: '0px 5px' }}>{update.category}</Badge>
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--text-sm)', fontWeight: 600,
                                        color: 'var(--apex-white)', marginBottom: 4
                                    }}>
                                        {update.title}
                                    </div>
                                    <p style={{
                                        fontSize: 'var(--text-xs)', color: 'var(--apex-steel)',
                                        lineHeight: 1.5, marginBottom: 6
                                    }}>
                                        {update.summary}
                                    </p>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        fontSize: 'var(--text-xs)', color: 'var(--apex-steel)', opacity: 0.7
                                    }}>
                                        <Calendar size={10} />
                                        {new Date(update.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <button style={{
                            width: '100%', marginTop: 'var(--space-md)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: 'var(--space-sm)',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 8,
                            color: 'var(--apex-teal)',
                            cursor: 'pointer',
                            fontSize: 'var(--text-sm)', fontWeight: 500
                        }}>
                            View all updates <ChevronRight size={14} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
