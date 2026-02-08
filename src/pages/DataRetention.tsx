import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Database, Clock, Shield, FileText, Trash2, AlertTriangle,
    CheckCircle2, XCircle, Calendar, Lock, Eye, Download,
    Search, Settings, Activity, BarChart3, Archive,
    Scale, PauseCircle, PlayCircle, RefreshCw, HardDrive,
    Folder, Timer, Flag, Users, Filter, TrendingUp
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './DataRetention.css'

// ============================================================================
// DATA RETENTION - HIPAA Data Retention Policy Management
// Manage retention policies, purge schedules, and legal holds
// ============================================================================

type ComplianceStatus = 'compliant' | 'review_needed' | 'non_compliant'

interface RetentionPolicy {
    id: string
    recordType: string
    category: string
    retentionPeriod: string
    legalBasis: string
    lastReview: string
    nextReview: string
    status: ComplianceStatus
    recordCount: number
    storageUsed: string
}

interface PendingDeletion {
    id: string
    recordType: string
    recordCount: number
    retentionExpiry: string
    status: 'scheduled' | 'on_hold' | 'approved' | 'processing'
    scheduledDate: string
    holdReason?: string
}

interface LegalHold {
    id: string
    name: string
    reason: string
    createdBy: string
    createdDate: string
    affectedRecords: number
    affectedPolicies: string[]
    status: 'active' | 'released'
    caseNumber?: string
}

interface StorageCategory {
    name: string
    size: string
    percentage: number
    color: string
    records: string
}

const retentionPolicies: RetentionPolicy[] = [
    {
        id: 'RP-001', recordType: 'Medical Records', category: 'Clinical',
        retentionPeriod: '7 years from last service', legalBasis: 'HIPAA §164.530(j), State law',
        lastReview: '2026-01-15', nextReview: '2026-07-15', status: 'compliant',
        recordCount: 284521, storageUsed: '42.8 GB'
    },
    {
        id: 'RP-002', recordType: 'Claims Records', category: 'Financial',
        retentionPeriod: '10 years', legalBasis: 'CMS Requirements, IRS §6501',
        lastReview: '2026-01-10', nextReview: '2026-07-10', status: 'compliant',
        recordCount: 1247893, storageUsed: '28.4 GB'
    },
    {
        id: 'RP-003', recordType: 'HIPAA Audit Logs', category: 'Compliance',
        retentionPeriod: '6 years', legalBasis: 'HIPAA §164.530(j)',
        lastReview: '2025-12-20', nextReview: '2026-06-20', status: 'compliant',
        recordCount: 89234567, storageUsed: '156.2 GB'
    },
    {
        id: 'RP-004', recordType: 'Financial Records', category: 'Financial',
        retentionPeriod: '7 years', legalBasis: 'IRS §6501, SOX Requirements',
        lastReview: '2026-01-05', nextReview: '2026-07-05', status: 'compliant',
        recordCount: 567234, storageUsed: '18.7 GB'
    },
    {
        id: 'RP-005', recordType: 'Provider Credentials', category: 'Network',
        retentionPeriod: 'Duration of contract + 5 years', legalBasis: 'CMS §42 CFR 438.214',
        lastReview: '2025-11-30', nextReview: '2026-05-30', status: 'review_needed',
        recordCount: 12456, storageUsed: '3.2 GB'
    },
    {
        id: 'RP-006', recordType: 'Member Correspondence', category: 'Communication',
        retentionPeriod: '6 years', legalBasis: 'HIPAA §164.530(j)',
        lastReview: '2025-10-15', nextReview: '2026-04-15', status: 'review_needed',
        recordCount: 892341, storageUsed: '12.1 GB'
    },
    {
        id: 'RP-007', recordType: 'Grievance & Appeal Records', category: 'Compliance',
        retentionPeriod: '10 years', legalBasis: 'CMS §42 CFR 438.416',
        lastReview: '2026-01-20', nextReview: '2026-07-20', status: 'compliant',
        recordCount: 34521, storageUsed: '5.4 GB'
    },
    {
        id: 'RP-008', recordType: 'Marketing Consent Records', category: 'Privacy',
        retentionPeriod: '6 years from last activity', legalBasis: 'HIPAA §164.508, TCPA',
        lastReview: '2025-09-01', nextReview: '2026-03-01', status: 'non_compliant',
        recordCount: 145672, storageUsed: '1.8 GB'
    },
]

const pendingDeletions: PendingDeletion[] = [
    { id: 'PD-001', recordType: 'Expired Claims (2015)', recordCount: 23456, retentionExpiry: '2025-12-31', status: 'approved', scheduledDate: '2026-02-15' },
    { id: 'PD-002', recordType: 'Old Member Correspondence', recordCount: 45678, retentionExpiry: '2026-01-31', status: 'scheduled', scheduledDate: '2026-03-01' },
    { id: 'PD-003', recordType: 'Expired Audit Logs (2019)', recordCount: 1234567, retentionExpiry: '2025-12-31', status: 'on_hold', scheduledDate: '—', holdReason: 'Legal hold: DOJ Investigation LH-003' },
    { id: 'PD-004', recordType: 'Terminated Provider Records', recordCount: 892, retentionExpiry: '2026-02-28', status: 'processing', scheduledDate: '2026-02-07' },
]

const legalHolds: LegalHold[] = [
    {
        id: 'LH-003', name: 'DOJ Investigation Hold', reason: 'Federal investigation into billing practices',
        createdBy: 'General Counsel', createdDate: '2025-09-15', affectedRecords: 1567234,
        affectedPolicies: ['Claims Records', 'HIPAA Audit Logs', 'Financial Records'],
        status: 'active', caseNumber: 'DOJ-2025-FCA-4521'
    },
    {
        id: 'LH-004', name: 'Member Class Action Hold', reason: 'Class action regarding denied claims',
        createdBy: 'Legal Department', createdDate: '2025-11-01', affectedRecords: 234567,
        affectedPolicies: ['Claims Records', 'Grievance & Appeal Records'],
        status: 'active', caseNumber: 'CV-2025-89012'
    },
    {
        id: 'LH-002', name: 'State Audit Hold', reason: 'State DOI market conduct examination',
        createdBy: 'Compliance Officer', createdDate: '2025-06-01', affectedRecords: 456789,
        affectedPolicies: ['Claims Records', 'Member Correspondence'],
        status: 'released'
    },
]

const storageCategories: StorageCategory[] = [
    { name: 'HIPAA Audit Logs', size: '156.2 GB', percentage: 57.4, color: '#8b5cf6', records: '89.2M' },
    { name: 'Medical Records', size: '42.8 GB', percentage: 15.7, color: '#14b8a6', records: '284K' },
    { name: 'Claims Records', size: '28.4 GB', percentage: 10.4, color: '#3b82f6', records: '1.2M' },
    { name: 'Financial Records', size: '18.7 GB', percentage: 6.9, color: '#f59e0b', records: '567K' },
    { name: 'Correspondence', size: '12.1 GB', percentage: 4.4, color: '#06b6d4', records: '892K' },
    { name: 'Other', size: '14.0 GB', percentage: 5.2, color: '#64748b', records: '193K' },
]

export default function DataRetention() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null)
    const [expandedHold, setExpandedHold] = useState<string | null>(null)

    const getComplianceBadge = (status: ComplianceStatus) => {
        switch (status) {
            case 'compliant': return <Badge variant="success" size="sm" icon={<CheckCircle2 size={10} />}>Compliant</Badge>
            case 'review_needed': return <Badge variant="warning" size="sm" icon={<Clock size={10} />}>Review Needed</Badge>
            case 'non_compliant': return <Badge variant="critical" size="sm" icon={<XCircle size={10} />}>Non-Compliant</Badge>
        }
    }

    const getDeletionBadge = (status: PendingDeletion['status']) => {
        switch (status) {
            case 'scheduled': return <Badge variant="info" size="sm" icon={<Calendar size={10} />}>Scheduled</Badge>
            case 'approved': return <Badge variant="success" size="sm" icon={<CheckCircle2 size={10} />}>Approved</Badge>
            case 'on_hold': return <Badge variant="warning" size="sm" icon={<PauseCircle size={10} />}>On Hold</Badge>
            case 'processing': return <Badge variant="teal" size="sm" pulse icon={<Activity size={10} />}>Processing</Badge>
        }
    }

    const filteredPolicies = retentionPolicies.filter(p => {
        const matchesSearch = p.recordType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const compliantCount = retentionPolicies.filter(p => p.status === 'compliant').length
    const totalStorage = '272.2 GB'
    const pendingCount = pendingDeletions.filter(d => d.status !== 'on_hold').length

    return (
        <div className="data-retention">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="dr-header">
                    <div>
                        <h1 className="dr-title">
                            <Archive size={28} />
                            Data Retention
                            <Badge variant="teal" icon={<Shield size={10} />}>HIPAA</Badge>
                        </h1>
                        <p className="dr-subtitle">HIPAA data retention policy management, automated purge scheduling, and legal holds</p>
                    </div>
                    <div className="dr-header-actions">
                        <Button variant="secondary" icon={<Download size={16} />}>Export Policies</Button>
                        <Button variant="primary" icon={<RefreshCw size={16} />}>Run Compliance Check</Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="dr-kpis">
                    <MetricCard
                        label="Policy Compliance"
                        value={`${compliantCount}/${retentionPolicies.length}`}
                        icon={<Shield size={20} />}
                        subtitle={`${Math.round(compliantCount / retentionPolicies.length * 100)}% compliant`}
                        variant={compliantCount === retentionPolicies.length ? 'success' : 'warning'}
                    />
                    <MetricCard
                        label="Total Storage"
                        value={totalStorage}
                        icon={<HardDrive size={20} />}
                        subtitle="Across all categories"
                    />
                    <MetricCard
                        label="Pending Deletions"
                        value={pendingCount.toString()}
                        icon={<Trash2 size={20} />}
                        subtitle={`${pendingDeletions.filter(d => d.status === 'on_hold').length} on hold`}
                    />
                    <MetricCard
                        label="Active Legal Holds"
                        value={legalHolds.filter(h => h.status === 'active').length.toString()}
                        icon={<Lock size={20} />}
                        subtitle="Preventing deletion"
                        variant="warning"
                    />
                </div>

                {/* Retention Policies Table */}
                <GlassCard className="dr-policies">
                    <div className="dr-section-header">
                        <h3 className="dr-section-title">
                            <FileText size={18} />
                            Retention Policies
                        </h3>
                        <div className="dr-filters">
                            <div className="dr-search">
                                <Search size={14} />
                                <input
                                    type="text"
                                    placeholder="Search policies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="dr-status-filter">
                                {['all', 'compliant', 'review_needed', 'non_compliant'].map(s => (
                                    <button
                                        key={s}
                                        className={`dr-filter-btn ${filterStatus === s ? 'active' : ''}`}
                                        onClick={() => setFilterStatus(s)}
                                    >
                                        {s === 'all' ? 'All' : s === 'review_needed' ? 'Review Needed' : s === 'non_compliant' ? 'Non-Compliant' : 'Compliant'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="dr-table">
                        <div className="dr-table-header">
                            <span>Record Type</span>
                            <span>Category</span>
                            <span>Retention Period</span>
                            <span>Legal Basis</span>
                            <span>Last Review</span>
                            <span>Records</span>
                            <span>Storage</span>
                            <span>Status</span>
                        </div>
                        {filteredPolicies.map((policy, index) => (
                            <motion.div
                                key={policy.id}
                                className={`dr-table-row ${selectedPolicy === policy.id ? 'selected' : ''}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => setSelectedPolicy(policy.id === selectedPolicy ? null : policy.id)}
                            >
                                <span className="dr-cell-type">
                                    <Folder size={14} />
                                    {policy.recordType}
                                </span>
                                <span>
                                    <Badge variant="default" size="sm">{policy.category}</Badge>
                                </span>
                                <span className="dr-cell-period">{policy.retentionPeriod}</span>
                                <span className="dr-cell-basis">{policy.legalBasis}</span>
                                <span className="dr-cell-date">{policy.lastReview}</span>
                                <span className="dr-cell-count">{policy.recordCount.toLocaleString()}</span>
                                <span className="dr-cell-storage">{policy.storageUsed}</span>
                                <span>{getComplianceBadge(policy.status)}</span>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Bottom Grid */}
                <div className="dr-bottom-grid">
                    {/* Pending Deletions */}
                    <GlassCard className="dr-deletions">
                        <h3 className="dr-section-title">
                            <Trash2 size={18} />
                            Pending Deletions Queue
                        </h3>
                        <div className="dr-deletion-list">
                            {pendingDeletions.map((deletion, index) => (
                                <motion.div
                                    key={deletion.id}
                                    className={`dr-deletion-item ${deletion.status}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="dr-del-header">
                                        <span className="dr-del-type">{deletion.recordType}</span>
                                        {getDeletionBadge(deletion.status)}
                                    </div>
                                    <div className="dr-del-meta">
                                        <span><Database size={12} /> {deletion.recordCount.toLocaleString()} records</span>
                                        <span><Calendar size={12} /> Expires: {deletion.retentionExpiry}</span>
                                        <span><Timer size={12} /> Scheduled: {deletion.scheduledDate}</span>
                                    </div>
                                    {deletion.holdReason && (
                                        <div className="dr-del-hold">
                                            <Lock size={12} />
                                            <span>{deletion.holdReason}</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Storage Usage */}
                    <GlassCard className="dr-storage">
                        <h3 className="dr-section-title">
                            <HardDrive size={18} />
                            Storage by Category
                        </h3>
                        <div className="dr-storage-list">
                            {storageCategories.map((cat, i) => (
                                <div key={i} className="dr-storage-item">
                                    <div className="dr-storage-header">
                                        <span className="dr-storage-name">{cat.name}</span>
                                        <span className="dr-storage-size">{cat.size}</span>
                                    </div>
                                    <div className="dr-storage-bar">
                                        <motion.div
                                            className="dr-storage-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${cat.percentage}%` }}
                                            transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                                            style={{ background: cat.color }}
                                        />
                                    </div>
                                    <div className="dr-storage-meta">
                                        <span>{cat.records} records</span>
                                        <span>{cat.percentage}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="dr-storage-total">
                            <span>Total storage used</span>
                            <strong>{totalStorage}</strong>
                        </div>
                    </GlassCard>
                </div>

                {/* Legal Holds */}
                <GlassCard className="dr-legal-holds">
                    <div className="dr-section-header">
                        <h3 className="dr-section-title">
                            <Lock size={18} />
                            Legal Hold Management
                        </h3>
                        <Button variant="ghost" size="sm" icon={<Eye size={14} />}>View All</Button>
                    </div>
                    <div className="dr-holds-list">
                        {legalHolds.map((hold, index) => (
                            <motion.div
                                key={hold.id}
                                className={`dr-hold-card ${hold.status}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="dr-hold-header">
                                    <div className="dr-hold-info">
                                        <span className="dr-hold-name">{hold.name}</span>
                                        <span className="dr-hold-id">{hold.id}</span>
                                    </div>
                                    <Badge
                                        variant={hold.status === 'active' ? 'warning' : 'success'}
                                        size="sm"
                                        icon={hold.status === 'active' ? <PauseCircle size={10} /> : <PlayCircle size={10} />}
                                    >
                                        {hold.status === 'active' ? 'Active Hold' : 'Released'}
                                    </Badge>
                                </div>
                                <p className="dr-hold-reason">{hold.reason}</p>
                                <div className="dr-hold-meta">
                                    <span><Users size={12} /> {hold.createdBy}</span>
                                    <span><Calendar size={12} /> {hold.createdDate}</span>
                                    <span><Database size={12} /> {hold.affectedRecords.toLocaleString()} records</span>
                                    {hold.caseNumber && <span><Scale size={12} /> {hold.caseNumber}</span>}
                                </div>
                                <div className="dr-hold-policies">
                                    <span className="dr-hold-label">Affected policies:</span>
                                    {hold.affectedPolicies.map(p => (
                                        <Badge key={p} variant="default" size="sm">{p}</Badge>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Automated Purge Schedule */}
                <GlassCard className="dr-purge-schedule">
                    <h3 className="dr-section-title">
                        <Calendar size={18} />
                        Automated Purge Schedule
                    </h3>
                    <div className="dr-schedule-grid">
                        {[
                            { day: 'Daily', task: 'Temporary files & session data cleanup', lastRun: 'Today 02:00 AM', status: 'success' },
                            { day: 'Weekly', task: 'Expired cache & temp audit entries', lastRun: 'Feb 3, 2026', status: 'success' },
                            { day: 'Monthly', task: 'Expired correspondence & notification logs', lastRun: 'Jan 31, 2026', status: 'success' },
                            { day: 'Quarterly', task: 'Expired records per retention policies', lastRun: 'Dec 31, 2025', status: 'warning' },
                            { day: 'Annual', task: 'Full retention compliance review & purge', lastRun: 'Dec 31, 2025', status: 'success' },
                        ].map((schedule, i) => (
                            <div key={i} className="dr-schedule-item">
                                <div className="dr-sched-freq">{schedule.day}</div>
                                <div className="dr-sched-task">{schedule.task}</div>
                                <div className="dr-sched-last">Last: {schedule.lastRun}</div>
                                <Badge
                                    variant={schedule.status === 'success' ? 'success' : 'warning'}
                                    size="sm"
                                    icon={schedule.status === 'success' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                                >
                                    {schedule.status === 'success' ? 'Success' : 'Review'}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    )
}
