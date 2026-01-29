import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Download,
    FileText,
    Database,
    Calendar,
    Clock,
    CheckCircle2,
    Settings,
    Play,
    Filter
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './DataExports.css'

interface ExportJob {
    id: string
    name: string
    dataType: 'claims' | 'members' | 'providers' | 'financial'
    format: 'csv' | 'xlsx' | 'json' | 'xml'
    status: 'completed' | 'running' | 'scheduled' | 'failed'
    records: number
    size: string
    createdAt: string
    completedAt: string | null
}

const exports: ExportJob[] = [
    { id: 'EXP-001', name: 'January Claims Export', dataType: 'claims', format: 'csv', status: 'completed', records: 48290, size: '156 MB', createdAt: '2024-01-26T08:00:00', completedAt: '2024-01-26T08:15:00' },
    { id: 'EXP-002', name: 'Member Roster Q1', dataType: 'members', format: 'xlsx', status: 'completed', records: 125340, size: '89 MB', createdAt: '2024-01-25T10:00:00', completedAt: '2024-01-25T10:22:00' },
    { id: 'EXP-003', name: 'Provider Network Data', dataType: 'providers', format: 'json', status: 'running', records: 0, size: '—', createdAt: '2024-01-26T14:00:00', completedAt: null },
    { id: 'EXP-004', name: 'Monthly Financial Report', dataType: 'financial', format: 'xlsx', status: 'scheduled', records: 0, size: '—', createdAt: '2024-02-01T06:00:00', completedAt: null }
]

export function DataExports() {
    const [allExports] = useState<ExportJob[]>(exports)
    const [filterType, setFilterType] = useState('all')

    const getStatusBadge = (status: ExportJob['status']) => {
        switch (status) {
            case 'completed': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Completed</Badge>
            case 'running': return <Badge variant="warning" icon={<Clock size={10} />}>Running</Badge>
            case 'scheduled': return <Badge variant="info">Scheduled</Badge>
            case 'failed': return <Badge variant="critical">Failed</Badge>
        }
    }

    const getTypeBadge = (type: ExportJob['dataType']) => {
        const variants: Record<string, any> = {
            claims: 'teal',
            members: 'purple',
            providers: 'info',
            financial: 'warning'
        }
        return <Badge variant={variants[type]} size="sm">{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>
    }

    const filteredExports = filterType === 'all'
        ? allExports
        : allExports.filter(e => e.dataType === filterType)

    return (
        <div className="data-exports-page">
            {/* Header */}
            <div className="exports__header">
                <div>
                    <h1 className="exports__title">Data Exports</h1>
                    <p className="exports__subtitle">
                        Export and download operational data
                    </p>
                </div>
                <Button variant="primary" icon={<Play size={16} />}>
                    New Export
                </Button>
            </div>

            {/* Quick Export */}
            <div className="quick-exports">
                <GlassCard className="quick-export-card">
                    <Database size={24} />
                    <h4>Claims Data</h4>
                    <p>Export all claims information</p>
                    <Button variant="secondary" size="sm">Export</Button>
                </GlassCard>
                <GlassCard className="quick-export-card">
                    <Database size={24} />
                    <h4>Member Roster</h4>
                    <p>Export member demographics</p>
                    <Button variant="secondary" size="sm">Export</Button>
                </GlassCard>
                <GlassCard className="quick-export-card">
                    <Database size={24} />
                    <h4>Provider Network</h4>
                    <p>Export provider directory</p>
                    <Button variant="secondary" size="sm">Export</Button>
                </GlassCard>
                <GlassCard className="quick-export-card">
                    <Database size={24} />
                    <h4>Financial Reports</h4>
                    <p>Export financial data</p>
                    <Button variant="secondary" size="sm">Export</Button>
                </GlassCard>
            </div>

            {/* Filters */}
            <div className="exports__filters">
                <div className="type-filters">
                    {['all', 'claims', 'members', 'providers', 'financial'].map(type => (
                        <button
                            key={type}
                            className={`filter-btn ${filterType === type ? 'active' : ''}`}
                            onClick={() => setFilterType(type)}
                        >
                            {type === 'all' ? 'All Exports' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Export History */}
            <GlassCard className="exports-history">
                <div className="history-header">
                    <h3>Export History</h3>
                </div>
                <table className="exports-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Format</th>
                            <th>Records</th>
                            <th>Size</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExports.map((exp, index) => (
                            <motion.tr
                                key={exp.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <td className="export-name">
                                    <FileText size={14} />
                                    <span>{exp.name}</span>
                                </td>
                                <td>{getTypeBadge(exp.dataType)}</td>
                                <td><Badge variant="default" size="sm">{exp.format.toUpperCase()}</Badge></td>
                                <td>{exp.records > 0 ? exp.records.toLocaleString() : '—'}</td>
                                <td>{exp.size}</td>
                                <td>{getStatusBadge(exp.status)}</td>
                                <td>{new Date(exp.createdAt).toLocaleString()}</td>
                                <td>
                                    {exp.status === 'completed' && (
                                        <Button variant="ghost" size="sm" icon={<Download size={14} />}>Download</Button>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    )
}

export default DataExports
