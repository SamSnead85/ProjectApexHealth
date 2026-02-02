import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText,
    Upload,
    DollarSign,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    User,
    Building2,
    Calendar,
    Camera,
    AlertCircle,
    Sparkles,
    Info,
    FileCheck,
    Receipt,
    Send,
    Clock,
    X
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './OONClaimsWizard.css'

// ============================================================================
// ROLE-BASED ACCESS PATTERN
// This module supports: Member (primary - submission), Admin (view/override)
// ============================================================================
export type UserRole = 'member' | 'admin'

interface ClaimInfo {
    memberName: string
    memberId: string
    dateOfService: string
    providerName: string
    providerNPI: string
    providerAddress: string
    serviceDescription: string
    diagnosisCode: string
    procedureCode: string
    amountBilled: number
}

interface Document {
    id: string
    name: string
    type: 'receipt' | 'invoice' | 'explanation' | 'other'
    size: string
    status: 'uploading' | 'processing' | 'ready' | 'error'
    extractedData?: Partial<ClaimInfo>
}

// Mock OCR extraction results
const mockOCRExtraction: Partial<ClaimInfo> = {
    providerName: 'Dr. James Park, MD',
    providerNPI: '1234567890',
    providerAddress: '2100 Webster St, San Francisco, CA 94115',
    dateOfService: '2026-01-15',
    amountBilled: 450
}

const WIZARD_STEPS = [
    { id: 'info', title: 'Member & Provider Info', icon: <User size={18} /> },
    { id: 'documents', title: 'Upload Documents', icon: <Upload size={18} /> },
    { id: 'review', title: 'Review & Estimate', icon: <DollarSign size={18} /> },
    { id: 'submit', title: 'Submit Claim', icon: <Send size={18} /> }
]

export function OONClaimsWizard() {
    const [currentStep, setCurrentStep] = useState(0)
    const [currentRole] = useState<UserRole>('member')
    const [documents, setDocuments] = useState<Document[]>([])
    const [isProcessingOCR, setIsProcessingOCR] = useState(false)
    const [claimInfo, setClaimInfo] = useState<ClaimInfo>({
        memberName: 'Sarah Johnson',
        memberId: 'MBR-10234',
        dateOfService: '',
        providerName: '',
        providerNPI: '',
        providerAddress: '',
        serviceDescription: '',
        diagnosisCode: '',
        procedureCode: '',
        amountBilled: 0
    })
    const [estimatedReimbursement, setEstimatedReimbursement] = useState<number | null>(null)
    const [claimSubmitted, setClaimSubmitted] = useState(false)

    // Simulate document upload with OCR
    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files?.length) return

        const newDocs: Document[] = Array.from(files).map((file, index) => ({
            id: `doc-${Date.now()}-${index}`,
            name: file.name,
            type: 'receipt' as const,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            status: 'uploading' as const
        }))

        setDocuments(prev => [...prev, ...newDocs])
        setIsProcessingOCR(true)

        // Simulate upload and OCR processing
        setTimeout(() => {
            setDocuments(prev => prev.map(doc =>
                newDocs.find(nd => nd.id === doc.id)
                    ? { ...doc, status: 'processing' as const }
                    : doc
            ))
        }, 500)

        setTimeout(() => {
            setDocuments(prev => prev.map(doc =>
                newDocs.find(nd => nd.id === doc.id)
                    ? { ...doc, status: 'ready' as const, extractedData: mockOCRExtraction }
                    : doc
            ))
            setIsProcessingOCR(false)

            // Auto-fill extracted data
            setClaimInfo(prev => ({
                ...prev,
                ...mockOCRExtraction
            }))
        }, 2000)
    }, [])

    const removeDocument = (docId: string) => {
        setDocuments(prev => prev.filter(d => d.id !== docId))
    }

    const calculateReimbursement = () => {
        // Simulate reimbursement calculation based on UCR rates
        const ucrRate = 0.70 // 70% of UCR
        const deductible = 500
        const coinsurance = 0.30

        const allowedAmount = claimInfo.amountBilled * ucrRate
        const memberResponsibility = Math.min(deductible, allowedAmount) + (allowedAmount - deductible) * coinsurance
        const estimated = Math.max(0, allowedAmount - memberResponsibility)

        setEstimatedReimbursement(estimated)
    }

    const handleSubmit = () => {
        setClaimSubmitted(true)
    }

    const nextStep = () => {
        if (currentStep === 2) {
            calculateReimbursement()
        }
        if (currentStep < WIZARD_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    }

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return claimInfo.providerName && claimInfo.dateOfService
            case 1:
                return documents.length > 0 && documents.every(d => d.status === 'ready')
            case 2:
                return claimInfo.amountBilled > 0
            default:
                return true
        }
    }

    if (claimSubmitted) {
        return (
            <div className="oon-wizard">
                <motion.div
                    className="oon-wizard__success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <GlassCard className="success-card">
                        <div className="success-card__icon">
                            <CheckCircle size={64} />
                        </div>
                        <h2>Claim Submitted Successfully!</h2>
                        <p className="success-card__claim-id">
                            Claim Reference: <strong>OON-2026-{Date.now().toString().slice(-6)}</strong>
                        </p>
                        <div className="success-card__details">
                            <div className="detail-row">
                                <span>Provider</span>
                                <strong>{claimInfo.providerName}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Amount Billed</span>
                                <strong>{formatCurrency(claimInfo.amountBilled)}</strong>
                            </div>
                            <div className="detail-row highlight">
                                <span>Estimated Reimbursement</span>
                                <strong>{formatCurrency(estimatedReimbursement || 0)}</strong>
                            </div>
                        </div>
                        <div className="success-card__timeline">
                            <Clock size={16} />
                            <span>Expected processing time: 10-14 business days</span>
                        </div>
                        <Button variant="primary" onClick={() => window.location.reload()}>
                            Submit Another Claim
                        </Button>
                    </GlassCard>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="oon-wizard">
            {/* Header */}
            <div className="oon-wizard__header">
                <div>
                    <h1 className="oon-wizard__title">
                        <Receipt className="oon-wizard__title-icon" size={28} />
                        Out-of-Network Claims
                    </h1>
                    <p className="oon-wizard__subtitle">
                        Submit OON claims with AI-powered document processing
                    </p>
                </div>
                <Badge variant="info" size="sm">
                    {currentRole === 'member' ? '👤 Member Submission' : '⚙️ Admin Override'}
                </Badge>
            </div>

            {/* Progress Steps */}
            <div className="oon-wizard__progress">
                {WIZARD_STEPS.map((step, index) => (
                    <div
                        key={step.id}
                        className={`progress-step ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
                    >
                        <div className="progress-step__indicator">
                            {index < currentStep ? <CheckCircle size={18} /> : step.icon}
                        </div>
                        <span className="progress-step__title">{step.title}</span>
                        {index < WIZARD_STEPS.length - 1 && <div className="progress-step__connector" />}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <GlassCard className="oon-wizard__content">
                <AnimatePresence mode="wait">
                    {/* Step 1: Member & Provider Info */}
                    {currentStep === 0 && (
                        <motion.div
                            key="info"
                            className="wizard-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2>Member & Provider Information</h2>
                            <p className="wizard-step__description">
                                Enter provider and service details. You can also upload documents to auto-fill this information.
                            </p>

                            <div className="form-grid">
                                <div className="form-section">
                                    <h3><User size={16} /> Member Information</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Member Name</label>
                                            <input
                                                type="text"
                                                value={claimInfo.memberName}
                                                disabled
                                                className="disabled"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Member ID</label>
                                            <input
                                                type="text"
                                                value={claimInfo.memberId}
                                                disabled
                                                className="disabled"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3><Building2 size={16} /> Provider Information</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Provider Name *</label>
                                            <input
                                                type="text"
                                                placeholder="Dr. Jane Smith, MD"
                                                value={claimInfo.providerName}
                                                onChange={(e) => setClaimInfo(prev => ({ ...prev, providerName: e.target.value }))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Provider NPI</label>
                                            <input
                                                type="text"
                                                placeholder="10-digit NPI number"
                                                value={claimInfo.providerNPI}
                                                onChange={(e) => setClaimInfo(prev => ({ ...prev, providerNPI: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Provider Address</label>
                                        <input
                                            type="text"
                                            placeholder="Full address including city, state, zip"
                                            value={claimInfo.providerAddress}
                                            onChange={(e) => setClaimInfo(prev => ({ ...prev, providerAddress: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3><Calendar size={16} /> Service Details</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Date of Service *</label>
                                            <input
                                                type="date"
                                                value={claimInfo.dateOfService}
                                                onChange={(e) => setClaimInfo(prev => ({ ...prev, dateOfService: e.target.value }))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Amount Billed</label>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={claimInfo.amountBilled || ''}
                                                onChange={(e) => setClaimInfo(prev => ({ ...prev, amountBilled: parseFloat(e.target.value) || 0 }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Service Description</label>
                                        <textarea
                                            placeholder="Describe the service received..."
                                            value={claimInfo.serviceDescription}
                                            onChange={(e) => setClaimInfo(prev => ({ ...prev, serviceDescription: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Upload Documents */}
                    {currentStep === 1 && (
                        <motion.div
                            key="documents"
                            className="wizard-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2>Upload Supporting Documents</h2>
                            <p className="wizard-step__description">
                                Upload receipts, invoices, or explanations of benefits. Our AI will automatically extract relevant information.
                            </p>

                            <div className="upload-zone">
                                <input
                                    type="file"
                                    id="file-upload"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileUpload}
                                    className="upload-zone__input"
                                />
                                <label htmlFor="file-upload" className="upload-zone__label">
                                    <div className="upload-zone__icon">
                                        <Camera size={32} />
                                    </div>
                                    <h3>Drag & drop files here</h3>
                                    <p>or click to browse</p>
                                    <span className="upload-zone__formats">Supported: PDF, JPG, PNG</span>
                                </label>
                            </div>

                            {/* OCR Processing Banner */}
                            {isProcessingOCR && (
                                <motion.div
                                    className="ocr-banner"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Sparkles size={18} className="ocr-banner__icon" />
                                    <div>
                                        <strong>AI Document Processing</strong>
                                        <p>Extracting provider and service information...</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Document List */}
                            {documents.length > 0 && (
                                <div className="documents-list">
                                    <h3>Uploaded Documents</h3>
                                    {documents.map(doc => (
                                        <motion.div
                                            key={doc.id}
                                            className={`document-item ${doc.status}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <FileText size={20} />
                                            <div className="document-item__info">
                                                <span className="document-item__name">{doc.name}</span>
                                                <span className="document-item__size">{doc.size}</span>
                                            </div>
                                            <div className="document-item__status">
                                                {doc.status === 'uploading' && <span className="status uploading">Uploading...</span>}
                                                {doc.status === 'processing' && <span className="status processing"><Sparkles size={14} /> Processing...</span>}
                                                {doc.status === 'ready' && <span className="status ready"><CheckCircle size={14} /> Ready</span>}
                                                {doc.status === 'error' && <span className="status error"><AlertCircle size={14} /> Error</span>}
                                            </div>
                                            <button className="document-item__remove" onClick={() => removeDocument(doc.id)}>
                                                <X size={16} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Extracted Data Preview */}
                            {documents.some(d => d.extractedData) && (
                                <div className="extracted-data">
                                    <div className="extracted-data__header">
                                        <Sparkles size={16} />
                                        <h4>AI Extracted Data</h4>
                                    </div>
                                    <div className="extracted-data__grid">
                                        {claimInfo.providerName && (
                                            <div className="extracted-item">
                                                <span className="label">Provider</span>
                                                <span className="value">{claimInfo.providerName}</span>
                                            </div>
                                        )}
                                        {claimInfo.dateOfService && (
                                            <div className="extracted-item">
                                                <span className="label">Date</span>
                                                <span className="value">{claimInfo.dateOfService}</span>
                                            </div>
                                        )}
                                        {claimInfo.amountBilled > 0 && (
                                            <div className="extracted-item">
                                                <span className="label">Amount</span>
                                                <span className="value">{formatCurrency(claimInfo.amountBilled)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 3: Review & Estimate */}
                    {currentStep === 2 && (
                        <motion.div
                            key="review"
                            className="wizard-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2>Review & Reimbursement Estimate</h2>
                            <p className="wizard-step__description">
                                Review your claim details and see an estimated reimbursement based on your plan's out-of-network benefits.
                            </p>

                            <div className="review-grid">
                                <div className="review-section">
                                    <h3>Claim Summary</h3>
                                    <div className="review-card">
                                        <div className="review-row">
                                            <span>Member</span>
                                            <strong>{claimInfo.memberName} ({claimInfo.memberId})</strong>
                                        </div>
                                        <div className="review-row">
                                            <span>Provider</span>
                                            <strong>{claimInfo.providerName}</strong>
                                        </div>
                                        {claimInfo.providerNPI && (
                                            <div className="review-row">
                                                <span>NPI</span>
                                                <strong>{claimInfo.providerNPI}</strong>
                                            </div>
                                        )}
                                        <div className="review-row">
                                            <span>Date of Service</span>
                                            <strong>{new Date(claimInfo.dateOfService).toLocaleDateString()}</strong>
                                        </div>
                                        <div className="review-row">
                                            <span>Amount Billed</span>
                                            <strong className="highlight">{formatCurrency(claimInfo.amountBilled)}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="review-section">
                                    <h3>Documents</h3>
                                    <div className="review-card documents">
                                        {documents.map(doc => (
                                            <div key={doc.id} className="doc-preview">
                                                <FileCheck size={16} />
                                                <span>{doc.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="estimate-section">
                                    <h3><DollarSign size={18} /> Reimbursement Estimate</h3>
                                    <div className="estimate-card">
                                        <div className="estimate-breakdown">
                                            <div className="estimate-row">
                                                <span>Amount Billed</span>
                                                <span>{formatCurrency(claimInfo.amountBilled)}</span>
                                            </div>
                                            <div className="estimate-row">
                                                <span>UCR Allowed (70%)</span>
                                                <span>{formatCurrency(claimInfo.amountBilled * 0.7)}</span>
                                            </div>
                                            <div className="estimate-row">
                                                <span>Deductible Applied</span>
                                                <span>-{formatCurrency(Math.min(500, claimInfo.amountBilled * 0.7))}</span>
                                            </div>
                                            <div className="estimate-row">
                                                <span>Your Coinsurance (30%)</span>
                                                <span>-{formatCurrency((claimInfo.amountBilled * 0.7 - 500) * 0.3)}</span>
                                            </div>
                                        </div>
                                        <div className="estimate-total">
                                            <span>Estimated Reimbursement</span>
                                            <strong>{formatCurrency(Math.max(0, (claimInfo.amountBilled * 0.7 - 500) * 0.7))}</strong>
                                        </div>
                                        <div className="estimate-disclaimer">
                                            <Info size={14} />
                                            <p>This is an estimate only. Actual reimbursement may vary based on claim review.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Submit */}
                    {currentStep === 3 && (
                        <motion.div
                            key="submit"
                            className="wizard-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2>Ready to Submit</h2>
                            <p className="wizard-step__description">
                                Review the information below and submit your out-of-network claim for processing.
                            </p>

                            <div className="submit-summary">
                                <div className="summary-highlight">
                                    <DollarSign size={32} />
                                    <div>
                                        <span>Estimated Reimbursement</span>
                                        <strong>{formatCurrency(estimatedReimbursement || 0)}</strong>
                                    </div>
                                </div>

                                <div className="submit-checklist">
                                    <div className="checklist-item">
                                        <CheckCircle size={16} />
                                        <span>Provider information verified</span>
                                    </div>
                                    <div className="checklist-item">
                                        <CheckCircle size={16} />
                                        <span>{documents.length} document(s) attached</span>
                                    </div>
                                    <div className="checklist-item">
                                        <CheckCircle size={16} />
                                        <span>Service date: {new Date(claimInfo.dateOfService).toLocaleDateString()}</span>
                                    </div>
                                    <div className="checklist-item">
                                        <CheckCircle size={16} />
                                        <span>Amount billed: {formatCurrency(claimInfo.amountBilled)}</span>
                                    </div>
                                </div>

                                <div className="submit-notice">
                                    <AlertCircle size={16} />
                                    <p>
                                        By submitting, I certify that the information provided is accurate and complete.
                                        False claims may result in claim denial and potential legal action.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="wizard-navigation">
                    <Button
                        variant="secondary"
                        icon={<ArrowLeft size={16} />}
                        onClick={prevStep}
                        disabled={currentStep === 0}
                    >
                        Back
                    </Button>

                    {currentStep < WIZARD_STEPS.length - 1 ? (
                        <Button
                            variant="primary"
                            onClick={nextStep}
                            disabled={!canProceed()}
                        >
                            Continue <ArrowRight size={16} />
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            icon={<Send size={16} />}
                            onClick={handleSubmit}
                        >
                            Submit Claim
                        </Button>
                    )}
                </div>
            </GlassCard>
        </div>
    )
}

export default OONClaimsWizard
