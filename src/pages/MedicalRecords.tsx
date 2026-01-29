import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FileText,
    Calendar,
    User,
    Building2,
    Activity,
    Pill,
    Stethoscope,
    ChevronRight,
    Download,
    Share2,
    Filter,
    Search,
    Clock
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './MedicalRecords.css'

interface MedicalRecord {
    id: string
    type: 'encounter' | 'lab' | 'imaging' | 'procedure' | 'immunization' | 'medication'
    title: string
    provider: string
    facility: string
    date: string
    summary: string
}

const records: MedicalRecord[] = [
    { id: 'REC-001', type: 'encounter', title: 'Annual Physical Exam', provider: 'Dr. Sarah Mitchell', facility: 'Apex Primary Care', date: '2024-01-15', summary: 'Routine annual physical examination. All vitals normal.' },
    { id: 'REC-002', type: 'lab', title: 'Comprehensive Metabolic Panel', provider: 'Quest Diagnostics', facility: 'Quest Diagnostics', date: '2024-01-15', summary: 'Glucose 95, Creatinine 0.9, All values within normal range.' },
    { id: 'REC-003', type: 'imaging', title: 'Chest X-Ray', provider: 'Dr. James Chen', facility: 'Apex Radiology Center', date: '2024-01-10', summary: 'No acute cardiopulmonary process. Heart size normal.' },
    { id: 'REC-004', type: 'medication', title: 'Lisinopril 10mg', provider: 'Dr. Sarah Mitchell', facility: 'Apex Primary Care', date: '2024-01-15', summary: 'New prescription for blood pressure management.' },
    { id: 'REC-005', type: 'immunization', title: 'Influenza Vaccine', provider: 'Nurse Johnson', facility: 'Apex Pharmacy', date: '2024-10-01', summary: '2024-2025 Seasonal flu vaccine administered.' }
]

export function MedicalRecords() {
    const [allRecords] = useState<MedicalRecord[]>(records)
    const [selectedType, setSelectedType] = useState<string>('all')
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)

    const recordTypes = [
        { value: 'all', label: 'All Records', icon: <FileText size={16} /> },
        { value: 'encounter', label: 'Visits', icon: <Stethoscope size={16} /> },
        { value: 'lab', label: 'Lab Results', icon: <Activity size={16} /> },
        { value: 'imaging', label: 'Imaging', icon: <FileText size={16} /> },
        { value: 'medication', label: 'Medications', icon: <Pill size={16} /> }
    ]

    const filteredRecords = selectedType === 'all'
        ? allRecords
        : allRecords.filter(r => r.type === selectedType)

    const getTypeBadge = (type: MedicalRecord['type']) => {
        const variants: Record<string, any> = {
            encounter: { variant: 'teal', label: 'Visit' },
            lab: { variant: 'purple', label: 'Lab' },
            imaging: { variant: 'info', label: 'Imaging' },
            procedure: { variant: 'warning', label: 'Procedure' },
            immunization: { variant: 'success', label: 'Immunization' },
            medication: { variant: 'info', label: 'Medication' }
        }
        const config = variants[type] || { variant: 'default', label: type }
        return <Badge variant={config.variant} size="sm">{config.label}</Badge>
    }

    return (
        <div className="medical-records-page">
            {/* Header */}
            <div className="records__header">
                <div>
                    <h1 className="records__title">Medical Records</h1>
                    <p className="records__subtitle">
                        Complete longitudinal health record across all providers
                    </p>
                </div>
                <div className="records__actions">
                    <Button variant="secondary" icon={<Share2 size={16} />}>
                        Share Records
                    </Button>
                    <Button variant="primary" icon={<Download size={16} />}>
                        Export All
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="records__filters">
                <div className="type-filters">
                    {recordTypes.map(type => (
                        <button
                            key={type.value}
                            className={`type-filter ${selectedType === type.value ? 'active' : ''}`}
                            onClick={() => setSelectedType(type.value)}
                        >
                            {type.icon}
                            <span>{type.label}</span>
                        </button>
                    ))}
                </div>
                <div className="search-filter">
                    <Search size={16} />
                    <input type="text" placeholder="Search records..." />
                </div>
            </div>

            {/* Timeline */}
            <div className="records__content">
                <div className="records-timeline">
                    {filteredRecords.map((record, index) => (
                        <motion.div
                            key={record.id}
                            className={`timeline-item ${selectedRecord?.id === record.id ? 'selected' : ''}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedRecord(record)}
                        >
                            <div className="timeline-date">
                                <Clock size={12} />
                                {new Date(record.date).toLocaleDateString()}
                            </div>
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    {getTypeBadge(record.type)}
                                    <h4>{record.title}</h4>
                                </div>
                                <div className="timeline-provider">
                                    <User size={12} />
                                    <span>{record.provider}</span>
                                </div>
                                <div className="timeline-facility">
                                    <Building2 size={12} />
                                    <span>{record.facility}</span>
                                </div>
                                <p className="timeline-summary">{record.summary}</p>
                            </div>
                            <ChevronRight size={16} className="timeline-arrow" />
                        </motion.div>
                    ))}
                </div>

                {/* Detail Panel */}
                {selectedRecord && (
                    <GlassCard className="record-detail">
                        <div className="record-detail__header">
                            {getTypeBadge(selectedRecord.type)}
                            <h3>{selectedRecord.title}</h3>
                        </div>
                        <div className="record-detail__meta">
                            <div className="meta-row">
                                <Calendar size={14} />
                                <span>{new Date(selectedRecord.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="meta-row">
                                <User size={14} />
                                <span>{selectedRecord.provider}</span>
                            </div>
                            <div className="meta-row">
                                <Building2 size={14} />
                                <span>{selectedRecord.facility}</span>
                            </div>
                        </div>
                        <div className="record-detail__content">
                            <h4>Summary</h4>
                            <p>{selectedRecord.summary}</p>
                        </div>
                        <div className="record-detail__actions">
                            <Button variant="secondary" size="sm" icon={<Download size={14} />}>Download</Button>
                            <Button variant="secondary" size="sm" icon={<Share2 size={14} />}>Share</Button>
                        </div>
                    </GlassCard>
                )}
            </div>
        </div>
    )
}

export default MedicalRecords
