import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Mail,
    Plus,
    Edit3,
    Copy,
    Trash2,
    Eye,
    Send,
    Search,
    Filter,
    FileText,
    Clock,
    CheckCircle2
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './EmailTemplates.css'

interface Template {
    id: string
    name: string
    category: 'welcome' | 'claims' | 'appointments' | 'billing' | 'general'
    subject: string
    lastModified: string
    status: 'active' | 'draft'
    usageCount: number
}

const templates: Template[] = [
    { id: 'TPL-001', name: 'Welcome Email', category: 'welcome', subject: 'Welcome to Apex Health!', lastModified: '2024-01-20', status: 'active', usageCount: 1250 },
    { id: 'TPL-002', name: 'Claim Processed', category: 'claims', subject: 'Your claim has been processed', lastModified: '2024-01-18', status: 'active', usageCount: 3420 },
    { id: 'TPL-003', name: 'Appointment Reminder', category: 'appointments', subject: 'Reminder: Upcoming Appointment', lastModified: '2024-01-15', status: 'active', usageCount: 8900 },
    { id: 'TPL-004', name: 'Payment Due', category: 'billing', subject: 'Payment Reminder', lastModified: '2024-01-10', status: 'active', usageCount: 2100 },
    { id: 'TPL-005', name: 'New Feature Announcement', category: 'general', subject: 'Exciting New Features!', lastModified: '2024-01-25', status: 'draft', usageCount: 0 }
]

export function EmailTemplates() {
    const [allTemplates] = useState<Template[]>(templates)
    const [selectedCategory, setSelectedCategory] = useState('all')

    const getCategoryBadge = (category: Template['category']) => {
        const variants: Record<string, any> = {
            welcome: 'teal',
            claims: 'purple',
            appointments: 'info',
            billing: 'warning',
            general: 'default'
        }
        return <Badge variant={variants[category]} size="sm">{category}</Badge>
    }

    const filteredTemplates = selectedCategory === 'all'
        ? allTemplates
        : allTemplates.filter(t => t.category === selectedCategory)

    return (
        <div className="email-templates-page">
            {/* Header */}
            <div className="templates__header">
                <div>
                    <h1 className="templates__title">Email Templates</h1>
                    <p className="templates__subtitle">
                        Build and manage communication templates
                    </p>
                </div>
                <Button variant="primary" icon={<Plus size={16} />}>
                    New Template
                </Button>
            </div>

            {/* Stats */}
            <div className="templates__stats">
                <GlassCard className="stat-card">
                    <Mail size={24} />
                    <div>
                        <span className="stat-value">{allTemplates.length}</span>
                        <span className="stat-label">Total Templates</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <CheckCircle2 size={24} />
                    <div>
                        <span className="stat-value">{allTemplates.filter(t => t.status === 'active').length}</span>
                        <span className="stat-label">Active</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <Send size={24} />
                    <div>
                        <span className="stat-value">{allTemplates.reduce((acc, t) => acc + t.usageCount, 0).toLocaleString()}</span>
                        <span className="stat-label">Emails Sent</span>
                    </div>
                </GlassCard>
            </div>

            {/* Filters */}
            <div className="templates__filters">
                <div className="category-filters">
                    {['all', 'welcome', 'claims', 'appointments', 'billing', 'general'].map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="search-box">
                    <Search size={16} />
                    <input type="text" placeholder="Search templates..." />
                </div>
            </div>

            {/* Templates Grid */}
            <div className="templates__grid">
                {filteredTemplates.map((template, index) => (
                    <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <GlassCard className="template-card">
                            <div className="template-card__header">
                                {getCategoryBadge(template.category)}
                                <Badge variant={template.status === 'active' ? 'success' : 'warning'} size="sm">
                                    {template.status}
                                </Badge>
                            </div>
                            <h4 className="template-card__name">{template.name}</h4>
                            <p className="template-card__subject">{template.subject}</p>
                            <div className="template-card__meta">
                                <span><Clock size={12} /> {new Date(template.lastModified).toLocaleDateString()}</span>
                                <span><Send size={12} /> {template.usageCount.toLocaleString()} sent</span>
                            </div>
                            <div className="template-card__actions">
                                <Button variant="ghost" size="sm" icon={<Eye size={14} />}>Preview</Button>
                                <Button variant="ghost" size="sm" icon={<Edit3 size={14} />}>Edit</Button>
                                <Button variant="ghost" size="sm" icon={<Copy size={14} />}>Clone</Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default EmailTemplates
