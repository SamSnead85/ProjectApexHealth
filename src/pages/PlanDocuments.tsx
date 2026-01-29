import { GlassCard, Badge, Button } from '../components/common'
import { FileText, Download, Calendar, Search } from 'lucide-react'

const documents = [
    { id: 'DOC-001', name: 'Summary of Benefits', type: 'PDF', date: '2024-01-01', size: '2.4 MB' },
    { id: 'DOC-002', name: 'Evidence of Coverage', type: 'PDF', date: '2024-01-01', size: '45 MB' },
    { id: 'DOC-003', name: 'Member Handbook', type: 'PDF', date: '2024-01-01', size: '12 MB' },
    { id: 'DOC-004', name: 'Formulary Drug List', type: 'PDF', date: '2024-01-15', size: '8.2 MB' },
    { id: 'DOC-005', name: 'Provider Directory', type: 'PDF', date: '2024-01-10', size: '18 MB' }
]

export function PlanDocuments() {
    return (
        <div style={{ padding: 'var(--space-xl)', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--apex-white)', marginBottom: 'var(--space-xs)' }}>Plan Documents</h1>
                <p style={{ color: 'var(--apex-steel)' }}>Access your plan documentation and benefit materials</p>
            </div>
            <GlassCard style={{ padding: 0 }}>
                {documents.map((doc) => (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)', borderBottom: '1px solid var(--glass-border)' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--apex-teal-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={20} style={{ color: 'var(--apex-teal)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: 'var(--apex-white)' }}>{doc.name}</div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--apex-steel)' }}>{doc.type} • {doc.size} • Updated {new Date(doc.date).toLocaleDateString()}</div>
                        </div>
                        <Button variant="secondary" size="sm" icon={<Download size={14} />}>Download</Button>
                    </div>
                ))}
            </GlassCard>
        </div>
    )
}

export default PlanDocuments
