import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Image,
    Calendar,
    User,
    Building2,
    Download,
    Share2,
    Maximize2,
    FileText,
    Search,
    Filter,
    Eye
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './ImagingResults.css'

interface ImagingStudy {
    id: string
    studyType: 'xray' | 'ct' | 'mri' | 'ultrasound' | 'mammogram' | 'pet'
    bodyPart: string
    description: string
    date: string
    radiologist: string
    facility: string
    status: 'pending' | 'preliminary' | 'final'
    findings: string
    impression: string
}

const imagingStudies: ImagingStudy[] = [
    { id: 'IMG-001', studyType: 'mri', bodyPart: 'Brain', description: 'MRI Brain w/o Contrast', date: '2024-01-20', radiologist: 'Dr. Michael Torres', facility: 'Apex Imaging Center', status: 'final', findings: 'No acute intracranial abnormality. Normal ventricles and sulci.', impression: 'Normal MRI of the brain.' },
    { id: 'IMG-002', studyType: 'xray', bodyPart: 'Chest', description: 'Chest X-Ray PA/LAT', date: '2024-01-18', radiologist: 'Dr. Jennifer Lee', facility: 'Apex Radiology', status: 'final', findings: 'Lungs are clear. Heart size normal. No pleural effusion.', impression: 'No acute cardiopulmonary process.' },
    { id: 'IMG-003', studyType: 'ct', bodyPart: 'Abdomen', description: 'CT Abdomen/Pelvis w/ Contrast', date: '2024-01-15', radiologist: 'Dr. Michael Torres', facility: 'Apex Imaging Center', status: 'final', findings: 'Liver, spleen, pancreas, and kidneys appear normal. No lymphadenopathy.', impression: 'Unremarkable CT of the abdomen and pelvis.' },
    { id: 'IMG-004', studyType: 'ultrasound', bodyPart: 'Thyroid', description: 'Thyroid Ultrasound', date: '2024-01-25', radiologist: 'Dr. Amanda Chen', facility: 'Apex Imaging Center', status: 'preliminary', findings: 'Pending official read.', impression: 'Preliminary findings suggest normal thyroid gland.' }
]

export function ImagingResults() {
    const [studies] = useState<ImagingStudy[]>(imagingStudies)
    const [selectedStudy, setSelectedStudy] = useState<ImagingStudy | null>(null)
    const [viewerOpen, setViewerOpen] = useState(false)

    const getTypeBadge = (type: ImagingStudy['studyType']) => {
        const colors: Record<string, any> = {
            xray: 'info',
            ct: 'purple',
            mri: 'teal',
            ultrasound: 'success',
            mammogram: 'warning',
            pet: 'critical'
        }
        return <Badge variant={colors[type]} size="sm">{type.toUpperCase()}</Badge>
    }

    const getStatusBadge = (status: ImagingStudy['status']) => {
        switch (status) {
            case 'final': return <Badge variant="success">Final</Badge>
            case 'preliminary': return <Badge variant="warning">Preliminary</Badge>
            case 'pending': return <Badge variant="info">Pending</Badge>
        }
    }

    return (
        <div className="imaging-results-page">
            {/* Header */}
            <div className="imaging__header">
                <div>
                    <h1 className="imaging__title">Imaging Results</h1>
                    <p className="imaging__subtitle">
                        View radiology studies and diagnostic imaging reports
                    </p>
                </div>
                <div className="imaging__actions">
                    <Button variant="secondary" icon={<Share2 size={16} />}>Share</Button>
                    <Button variant="primary" icon={<Download size={16} />}>Download All</Button>
                </div>
            </div>

            {/* Filters */}
            <div className="imaging__filters">
                <div className="type-filters">
                    <button className="filter-btn active">All Studies</button>
                    <button className="filter-btn">X-Ray</button>
                    <button className="filter-btn">CT</button>
                    <button className="filter-btn">MRI</button>
                    <button className="filter-btn">Ultrasound</button>
                </div>
                <div className="search-box">
                    <Search size={16} />
                    <input type="text" placeholder="Search studies..." />
                </div>
            </div>

            {/* Studies Grid */}
            <div className="imaging__content">
                <div className="studies-grid">
                    {studies.map((study, index) => (
                        <motion.div
                            key={study.id}
                            className={`study-card ${selectedStudy?.id === study.id ? 'selected' : ''}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedStudy(study)}
                        >
                            <div className="study-card__preview">
                                <Image size={32} />
                                <button className="preview-btn" onClick={() => setViewerOpen(true)}>
                                    <Maximize2 size={16} />
                                </button>
                            </div>
                            <div className="study-card__content">
                                <div className="study-card__header">
                                    {getTypeBadge(study.studyType)}
                                    {getStatusBadge(study.status)}
                                </div>
                                <h4>{study.description}</h4>
                                <div className="study-card__meta">
                                    <span><Calendar size={12} />{new Date(study.date).toLocaleDateString()}</span>
                                    <span><Building2 size={12} />{study.facility}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Detail Panel */}
                {selectedStudy && (
                    <GlassCard className="study-detail">
                        <div className="study-detail__header">
                            <div className="study-detail__badges">
                                {getTypeBadge(selectedStudy.studyType)}
                                {getStatusBadge(selectedStudy.status)}
                            </div>
                            <h3>{selectedStudy.description}</h3>
                        </div>

                        <div className="study-detail__info">
                            <div className="info-row">
                                <Calendar size={14} />
                                <span>Study Date: {new Date(selectedStudy.date).toLocaleDateString()}</span>
                            </div>
                            <div className="info-row">
                                <User size={14} />
                                <span>Radiologist: {selectedStudy.radiologist}</span>
                            </div>
                            <div className="info-row">
                                <Building2 size={14} />
                                <span>Facility: {selectedStudy.facility}</span>
                            </div>
                        </div>

                        <div className="study-detail__report">
                            <div className="report-section">
                                <h4>Findings</h4>
                                <p>{selectedStudy.findings}</p>
                            </div>
                            <div className="report-section">
                                <h4>Impression</h4>
                                <p className="impression">{selectedStudy.impression}</p>
                            </div>
                        </div>

                        <div className="study-detail__actions">
                            <Button variant="primary" icon={<Eye size={14} />}>View Images</Button>
                            <Button variant="secondary" icon={<FileText size={14} />}>Full Report</Button>
                            <Button variant="secondary" icon={<Download size={14} />}>Download</Button>
                        </div>
                    </GlassCard>
                )}
            </div>
        </div>
    )
}

export default ImagingResults
