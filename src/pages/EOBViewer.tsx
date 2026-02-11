import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText,
    DollarSign,
    Calendar,
    User,
    Building2,
    ChevronRight,
    ChevronDown,
    Download,
    MessageCircle,
    AlertCircle,
    CheckCircle2,
    HelpCircle,
    Printer,
    Info
} from 'lucide-react'
import { GlassCard, Badge, Button, PageSkeleton } from '../components/common'
import './EOBViewer.css'

// EOB Document Structure (based on CMS-1500/UB-04)
interface EOBLineItem {
    serviceDate: string
    procedureCode: string
    description: string
    providerCharge: number
    allowedAmount: number
    planPaid: number
    adjustmentCodes: string[]
    patientResponsibility: number
    status: 'paid' | 'denied' | 'pending'
}

interface EOB {
    id: string
    claimNumber: string
    statementDate: string
    provider: {
        name: string
        npi: string
        address: string
    }
    member: {
        name: string
        memberId: string
        groupNumber: string
    }
    serviceDate: string
    lineItems: EOBLineItem[]
    totals: {
        providerCharges: number
        allowedAmount: number
        planPaid: number
        patientResponsibility: number
        deductibleApplied: number
        coinsurance: number
        copay: number
        notCovered: number
    }
    plainLanguageSummary: string
}

// Adjustment code translations for plain language
const adjustmentCodeTranslations: Record<string, string> = {
    'CO-45': 'Charge exceeds fee schedule/maximum allowable',
    'CO-96': 'Not covered by your plan',
    'CO-97': 'Already included in another service',
    'PR-1': 'Applied to your deductible',
    'PR-2': 'Coinsurance amount you owe',
    'PR-3': 'Copay amount you owe',
    'OA-23': 'Adjusted based on our contract with provider'
}

// Mock EOBs
const mockEOBs: EOB[] = [
    {
        id: 'EOB-2024-00542',
        claimNumber: 'CLM-2024-00145',
        statementDate: '2024-01-28',
        provider: {
            name: 'Premier Medical Associates',
            npi: '1234567890',
            address: '123 Medical Center Dr, San Francisco, CA 94115'
        },
        member: {
            name: 'Sarah Johnson',
            memberId: 'APX-2024-78432',
            groupNumber: 'GRP-APEX-2024'
        },
        serviceDate: '2024-01-15',
        lineItems: [
            {
                serviceDate: '2024-01-15',
                procedureCode: '99213',
                description: 'Office visit, established patient (15-29 min)',
                providerCharge: 150.00,
                allowedAmount: 120.00,
                planPaid: 96.00,
                adjustmentCodes: ['CO-45', 'PR-2'],
                patientResponsibility: 24.00,
                status: 'paid'
            },
            {
                serviceDate: '2024-01-15',
                procedureCode: '36415',
                description: 'Blood draw (venipuncture)',
                providerCharge: 25.00,
                allowedAmount: 18.00,
                planPaid: 18.00,
                adjustmentCodes: ['CO-45'],
                patientResponsibility: 0.00,
                status: 'paid'
            },
            {
                serviceDate: '2024-01-15',
                procedureCode: '80053',
                description: 'Comprehensive metabolic panel (lab test)',
                providerCharge: 275.00,
                allowedAmount: 182.00,
                planPaid: 142.00,
                adjustmentCodes: ['CO-45', 'PR-2'],
                patientResponsibility: 40.00,
                status: 'paid'
            }
        ],
        totals: {
            providerCharges: 450.00,
            allowedAmount: 320.00,
            planPaid: 256.00,
            patientResponsibility: 64.00,
            deductibleApplied: 0.00,
            coinsurance: 64.00,
            copay: 0.00,
            notCovered: 0.00
        },
        plainLanguageSummary: 'Your doctor charged $450 total. Based on our agreement with your doctor, we allowed $320. We paid $256 directly to your doctor. You owe $64 for your 20% coinsurance. Your doctor cannot bill you for the $130 difference between what they charged and what we allowed.'
    },
    {
        id: 'EOB-2024-00538',
        claimNumber: 'CLM-2024-00143',
        statementDate: '2024-01-25',
        provider: {
            name: 'Valley Imaging Center',
            npi: '7777777777',
            address: '500 Imaging Way, San Francisco, CA 94110'
        },
        member: {
            name: 'Sarah Johnson',
            memberId: 'APX-2024-78432',
            groupNumber: 'GRP-APEX-2024'
        },
        serviceDate: '2024-01-10',
        lineItems: [
            {
                serviceDate: '2024-01-10',
                procedureCode: '72148',
                description: 'MRI of lower back (lumbar spine)',
                providerCharge: 1850.00,
                allowedAmount: 1200.00,
                planPaid: 0.00,
                adjustmentCodes: ['CO-45', 'PR-1'],
                patientResponsibility: 1200.00,
                status: 'paid'
            }
        ],
        totals: {
            providerCharges: 1850.00,
            allowedAmount: 1200.00,
            planPaid: 0.00,
            patientResponsibility: 1200.00,
            deductibleApplied: 1200.00,
            coinsurance: 0.00,
            copay: 0.00,
            notCovered: 0.00
        },
        plainLanguageSummary: 'Your imaging center charged $1,850 for your MRI. Based on our contract, we allowed $1,200. This full amount was applied to your annual deductible, so you owe $1,200. Once your deductible is met, we\'ll pay 80% of future claims.'
    }
]

export function EOBViewer() {
    const [eobs] = useState<EOB[]>(mockEOBs)
    const [selectedEOB, setSelectedEOB] = useState<EOB | null>(null)
    const [expandedItems, setExpandedItems] = useState<number[]>([])
    const [showPlainLanguage, setShowPlainLanguage] = useState(true)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    if (loading) return <PageSkeleton />

    const toggleLineItem = (index: number) => {
        setExpandedItems(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    const formatCurrency = (amount: number) =>
        `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    return (
        <div className="eob-viewer">
            {/* Header */}
            <div className="eob-viewer__header">
                <div>
                    <h1 className="eob-viewer__title">Explanation of Benefits</h1>
                    <p className="eob-viewer__subtitle">
                        Understand your healthcare costs in plain language
                    </p>
                </div>
                <div className="eob-viewer__toggle">
                    <label>
                        <input
                            type="checkbox"
                            checked={showPlainLanguage}
                            onChange={(e) => setShowPlainLanguage(e.target.checked)}
                        />
                        <span>Plain Language Mode</span>
                    </label>
                    <Badge variant="success" icon={<MessageCircle size={12} />}>
                        78% find this helpful
                    </Badge>
                </div>
            </div>

            {/* EOB Grid */}
            <div className="eob-viewer__grid">
                {/* EOB List */}
                <div className="eob-viewer__list">
                    {eobs.map((eob, index) => (
                        <motion.div
                            key={eob.id}
                            className={`eob-card netflix-card ${selectedEOB?.id === eob.id ? 'selected' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => {
                                setSelectedEOB(eob)
                                setExpandedItems([])
                            }}
                        >
                            <div className="eob-card__header">
                                <FileText size={20} className="eob-card__icon" />
                                <div className="eob-card__info">
                                    <span className="eob-card__id">{eob.id}</span>
                                    <span className="eob-card__date">{formatDate(eob.statementDate)}</span>
                                </div>
                                <ChevronRight size={16} />
                            </div>

                            <div className="eob-card__provider">
                                <Building2 size={14} />
                                <span>{eob.provider.name}</span>
                            </div>

                            <div className="eob-card__amounts">
                                <div className="eob-card__amount">
                                    <span className="eob-card__amount-label">Plan Paid</span>
                                    <span className="eob-card__amount-value eob-card__amount-value--plan">
                                        {formatCurrency(eob.totals.planPaid)}
                                    </span>
                                </div>
                                <div className="eob-card__amount">
                                    <span className="eob-card__amount-label">You Owe</span>
                                    <span className="eob-card__amount-value eob-card__amount-value--patient">
                                        {formatCurrency(eob.totals.patientResponsibility)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* EOB Detail */}
                <AnimatePresence mode="wait">
                    {selectedEOB ? (
                        <motion.div
                            key={selectedEOB.id}
                            className="eob-detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <GlassCard className="eob-detail__card">
                                {/* Header */}
                                <div className="eob-detail__header">
                                    <div>
                                        <span className="eob-detail__id">{selectedEOB.id}</span>
                                        <h2>Statement of Benefits</h2>
                                        <span className="eob-detail__date">
                                            Statement Date: {formatDate(selectedEOB.statementDate)}
                                        </span>
                                    </div>
                                    <div className="eob-detail__actions-top">
                                        <Button variant="ghost" size="sm" icon={<Printer size={14} />}>
                                            Print
                                        </Button>
                                        <Button variant="ghost" size="sm" icon={<Download size={14} />}>
                                            Download
                                        </Button>
                                    </div>
                                </div>

                                {/* Plain Language Summary */}
                                {showPlainLanguage && (
                                    <motion.div
                                        className="eob-detail__plain-language"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                    >
                                        <div className="eob-detail__plain-language-header">
                                            <MessageCircle size={16} />
                                            <span>What This Means</span>
                                        </div>
                                        <p>{selectedEOB.plainLanguageSummary}</p>
                                    </motion.div>
                                )}

                                {/* Member & Provider Info */}
                                <div className="eob-detail__info-grid">
                                    <div className="eob-detail__info-section">
                                        <h4><User size={14} /> Member</h4>
                                        <p>{selectedEOB.member.name}</p>
                                        <span>ID: {selectedEOB.member.memberId}</span>
                                        <span>Group: {selectedEOB.member.groupNumber}</span>
                                    </div>
                                    <div className="eob-detail__info-section">
                                        <h4><Building2 size={14} /> Provider</h4>
                                        <p>{selectedEOB.provider.name}</p>
                                        <span>NPI: {selectedEOB.provider.npi}</span>
                                    </div>
                                </div>

                                {/* Line Items */}
                                <div className="eob-detail__line-items">
                                    <h3>Services</h3>
                                    {selectedEOB.lineItems.map((item, index) => (
                                        <div key={index} className="eob-line-item">
                                            <div
                                                className="eob-line-item__header"
                                                onClick={() => toggleLineItem(index)}
                                            >
                                                <div className="eob-line-item__main">
                                                    <span className="eob-line-item__code">{item.procedureCode}</span>
                                                    <span className="eob-line-item__desc">{item.description}</span>
                                                </div>
                                                <div className="eob-line-item__amounts">
                                                    <span className="eob-line-item__charged">{formatCurrency(item.providerCharge)}</span>
                                                    <span className="eob-line-item__you-owe">
                                                        {item.patientResponsibility > 0
                                                            ? `You owe: ${formatCurrency(item.patientResponsibility)}`
                                                            : 'Fully covered'}
                                                    </span>
                                                    <button className="eob-line-item__expand">
                                                        {expandedItems.includes(index)
                                                            ? <ChevronDown size={14} />
                                                            : <ChevronRight size={14} />
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                            <AnimatePresence>
                                                {expandedItems.includes(index) && (
                                                    <motion.div
                                                        className="eob-line-item__details"
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                    >
                                                        <div className="eob-line-item__detail-row">
                                                            <span>Provider Charged</span>
                                                            <span>{formatCurrency(item.providerCharge)}</span>
                                                        </div>
                                                        <div className="eob-line-item__detail-row">
                                                            <span>We Allowed</span>
                                                            <span>{formatCurrency(item.allowedAmount)}</span>
                                                        </div>
                                                        <div className="eob-line-item__detail-row eob-line-item__detail-row--savings">
                                                            <span>Savings (Provider Writes Off)</span>
                                                            <span>−{formatCurrency(item.providerCharge - item.allowedAmount)}</span>
                                                        </div>
                                                        <div className="eob-line-item__detail-row eob-line-item__detail-row--plan">
                                                            <span>Plan Paid</span>
                                                            <span>{formatCurrency(item.planPaid)}</span>
                                                        </div>
                                                        <div className="eob-line-item__detail-row eob-line-item__detail-row--patient">
                                                            <span>Your Responsibility</span>
                                                            <span>{formatCurrency(item.patientResponsibility)}</span>
                                                        </div>

                                                        {/* Adjustment Code Translations */}
                                                        {showPlainLanguage && item.adjustmentCodes.length > 0 && (
                                                            <div className="eob-line-item__codes">
                                                                <span className="eob-line-item__codes-label">
                                                                    <Info size={12} /> Why It's This Amount:
                                                                </span>
                                                                <ul>
                                                                    {item.adjustmentCodes.map((code, i) => (
                                                                        <li key={i}>
                                                                            <Badge variant="info" size="sm">{code}</Badge>
                                                                            <span>{adjustmentCodeTranslations[code] || 'Adjustment applied'}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="eob-detail__totals">
                                    <h3>Summary</h3>
                                    <div className="eob-detail__total-row">
                                        <span>Total Provider Charged</span>
                                        <span>{formatCurrency(selectedEOB.totals.providerCharges)}</span>
                                    </div>
                                    <div className="eob-detail__total-row">
                                        <span>Total Allowed Amount</span>
                                        <span>{formatCurrency(selectedEOB.totals.allowedAmount)}</span>
                                    </div>
                                    {selectedEOB.totals.deductibleApplied > 0 && (
                                        <div className="eob-detail__total-row eob-detail__total-row--deductible">
                                            <span>
                                                <HelpCircle size={12} />
                                                Applied to Deductible
                                            </span>
                                            <span>{formatCurrency(selectedEOB.totals.deductibleApplied)}</span>
                                        </div>
                                    )}
                                    {selectedEOB.totals.coinsurance > 0 && (
                                        <div className="eob-detail__total-row eob-detail__total-row--deductible">
                                            <span>
                                                <HelpCircle size={12} />
                                                Coinsurance (Your Share)
                                            </span>
                                            <span>{formatCurrency(selectedEOB.totals.coinsurance)}</span>
                                        </div>
                                    )}
                                    <div className="eob-detail__total-row eob-detail__total-row--plan">
                                        <span><CheckCircle2 size={14} /> Plan Paid</span>
                                        <span>{formatCurrency(selectedEOB.totals.planPaid)}</span>
                                    </div>
                                    <div className="eob-detail__total-row eob-detail__total-row--final">
                                        <span><AlertCircle size={14} /> You May Owe Provider</span>
                                        <span>{formatCurrency(selectedEOB.totals.patientResponsibility)}</span>
                                    </div>
                                </div>

                                {/* Help Section */}
                                <div className="eob-detail__help">
                                    <h4>Questions about this EOB?</h4>
                                    <p>Contact Member Services at 1-800-HEALTH or chat with us in the app.</p>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="eob-viewer__no-selection"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <FileText size={48} />
                            <p>Select an EOB to view details</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default EOBViewer
