import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    RefreshCw,
    User,
    Calendar,
    Shield,
    DollarSign,
    Stethoscope,
    Pill,
    Eye,
    Brain,
    Clock
} from 'lucide-react'
import { GlassCard, Badge, Button, Input } from '../common'
import './EligibilityChecker.css'

interface CoverageDetail {
    category: string
    icon: React.ReactNode
    inNetwork: {
        deductible: { used: number; limit: number }
        outOfPocket: { used: number; limit: number }
        copay: string
        coinsurance: string
    }
    outOfNetwork: {
        deductible: { used: number; limit: number }
        outOfPocket: { used: number; limit: number }
        coinsurance: string
    }
}

interface EligibilityResult {
    status: 'active' | 'inactive' | 'pending'
    memberId: string
    memberName: string
    groupNumber: string
    groupName: string
    planName: string
    effectiveDate: string
    terminationDate: string | null
    pcp: string | null
    coverage: CoverageDetail[]
    lastVerified: string
    transactionId: string // EDI 271 reference
}

// Mock eligibility response (would come from EDI 270/271 transaction)
const mockEligibilityResult: EligibilityResult = {
    status: 'active',
    memberId: 'APX-2024-78432',
    memberName: 'Sarah Johnson',
    groupNumber: 'GRP-100245',
    groupName: 'Acme Corporation',
    planName: 'Apex Health PPO Gold',
    effectiveDate: '2024-01-01',
    terminationDate: null,
    pcp: 'Dr. Sarah Chen, MD',
    lastVerified: new Date().toISOString(),
    transactionId: 'TRN-271-2024012615573',
    coverage: [
        {
            category: 'Medical',
            icon: <Stethoscope size={18} />,
            inNetwork: {
                deductible: { used: 450, limit: 1500 },
                outOfPocket: { used: 1200, limit: 6000 },
                copay: '$25 PCP / $50 Specialist',
                coinsurance: '80/20'
            },
            outOfNetwork: {
                deductible: { used: 0, limit: 3000 },
                outOfPocket: { used: 0, limit: 12000 },
                coinsurance: '60/40'
            }
        },
        {
            category: 'Pharmacy',
            icon: <Pill size={18} />,
            inNetwork: {
                deductible: { used: 0, limit: 0 },
                outOfPocket: { used: 320, limit: 2000 },
                copay: '$10 Generic / $35 Preferred / $70 Non-Preferred',
                coinsurance: 'N/A'
            },
            outOfNetwork: {
                deductible: { used: 0, limit: 0 },
                outOfPocket: { used: 0, limit: 0 },
                coinsurance: 'Not Covered'
            }
        },
        {
            category: 'Vision',
            icon: <Eye size={18} />,
            inNetwork: {
                deductible: { used: 0, limit: 0 },
                outOfPocket: { used: 0, limit: 500 },
                copay: '$10 Exam / $150 Frames Allowance',
                coinsurance: 'N/A'
            },
            outOfNetwork: {
                deductible: { used: 0, limit: 0 },
                outOfPocket: { used: 0, limit: 500 },
                coinsurance: '50% up to $75'
            }
        },
        {
            category: 'Mental Health',
            icon: <Brain size={18} />,
            inNetwork: {
                deductible: { used: 100, limit: 500 },
                outOfPocket: { used: 400, limit: 3000 },
                copay: '$25 per session',
                coinsurance: '80/20 after deductible'
            },
            outOfNetwork: {
                deductible: { used: 0, limit: 1000 },
                outOfPocket: { used: 0, limit: 6000 },
                coinsurance: '50/50 after deductible'
            }
        }
    ]
}

export function EligibilityChecker() {
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<EligibilityResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string>('Medical')

    const handleSearch = async () => {
        if (!searchQuery.trim()) return

        setIsLoading(true)
        setError(null)

        // Simulate EDI 270/271 transaction
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Mock response
        if (searchQuery.toLowerCase().includes('invalid')) {
            setResult({
                ...mockEligibilityResult,
                status: 'inactive',
                terminationDate: '2024-12-31'
            })
        } else if (searchQuery.toLowerCase().includes('pending')) {
            setResult({
                ...mockEligibilityResult,
                status: 'pending'
            })
        } else {
            setResult(mockEligibilityResult)
        }

        setIsLoading(false)
    }

    const handleRefresh = async () => {
        if (!result) return
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setResult({
            ...result,
            lastVerified: new Date().toISOString(),
            transactionId: `TRN-271-${Date.now()}`
        })
        setIsLoading(false)
    }

    const getStatusBadge = (status: EligibilityResult['status']) => {
        switch (status) {
            case 'active':
                return <Badge variant="success" icon={<CheckCircle2 size={12} />}>Active Coverage</Badge>
            case 'inactive':
                return <Badge variant="critical" icon={<XCircle size={12} />}>Inactive</Badge>
            case 'pending':
                return <Badge variant="warning" icon={<AlertTriangle size={12} />}>Pending Verification</Badge>
        }
    }

    const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`

    const calculateProgress = (used: number, limit: number) => {
        if (limit === 0) return 0
        return Math.min((used / limit) * 100, 100)
    }

    const selectedCoverage = result?.coverage.find(c => c.category === selectedCategory)

    return (
        <div className="eligibility-checker">
            {/* Header */}
            <div className="eligibility-checker__header">
                <div>
                    <h1 className="eligibility-checker__title">Eligibility Verification</h1>
                    <p className="eligibility-checker__subtitle">
                        Real-time member eligibility via EDI 270/271 transactions
                    </p>
                </div>
                <Badge variant="info" size="sm" icon={<Shield size={12} />}>
                    HIPAA Compliant
                </Badge>
            </div>

            {/* Search */}
            <GlassCard className="eligibility-checker__search-card">
                <div className="eligibility-checker__search-row">
                    <div className="eligibility-checker__search-input-wrapper">
                        <Search className="eligibility-checker__search-icon" size={18} />
                        <input
                            type="text"
                            className="eligibility-checker__search-input"
                            placeholder="Enter Member ID, SSN (last 4), or Name + DOB..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleSearch}
                        disabled={isLoading || !searchQuery.trim()}
                    >
                        {isLoading ? 'Verifying...' : 'Verify Eligibility'}
                    </Button>
                </div>
                <p className="eligibility-checker__search-hint">
                    <Clock size={12} /> Results cached for 24 hours. Last query: EDI 270 → Payer → EDI 271 response
                </p>
            </GlassCard>

            {/* Results */}
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        className="eligibility-checker__loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="eligibility-checker__spinner" />
                        <span>Sending EDI 270 transaction...</span>
                    </motion.div>
                )}

                {result && !isLoading && (
                    <motion.div
                        className="eligibility-checker__results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {/* Member Info Card */}
                        <GlassCard className="eligibility-checker__member-card">
                            <div className="eligibility-checker__member-header">
                                <div className="eligibility-checker__member-avatar">
                                    <User size={24} />
                                </div>
                                <div className="eligibility-checker__member-info">
                                    <h2>{result.memberName}</h2>
                                    <span className="eligibility-checker__member-id">
                                        Member ID: {result.memberId}
                                    </span>
                                </div>
                                {getStatusBadge(result.status)}
                            </div>

                            <div className="eligibility-checker__member-details">
                                <div className="eligibility-checker__detail-row">
                                    <span className="eligibility-checker__detail-label">Plan</span>
                                    <span className="eligibility-checker__detail-value">{result.planName}</span>
                                </div>
                                <div className="eligibility-checker__detail-row">
                                    <span className="eligibility-checker__detail-label">Group</span>
                                    <span className="eligibility-checker__detail-value">
                                        {result.groupName} ({result.groupNumber})
                                    </span>
                                </div>
                                <div className="eligibility-checker__detail-row">
                                    <span className="eligibility-checker__detail-label">Effective Date</span>
                                    <span className="eligibility-checker__detail-value">
                                        {new Date(result.effectiveDate).toLocaleDateString()}
                                    </span>
                                </div>
                                {result.pcp && (
                                    <div className="eligibility-checker__detail-row">
                                        <span className="eligibility-checker__detail-label">PCP</span>
                                        <span className="eligibility-checker__detail-value">{result.pcp}</span>
                                    </div>
                                )}
                                {result.terminationDate && (
                                    <div className="eligibility-checker__detail-row eligibility-checker__detail-row--warning">
                                        <span className="eligibility-checker__detail-label">Terminated</span>
                                        <span className="eligibility-checker__detail-value">
                                            {new Date(result.terminationDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="eligibility-checker__transaction-info">
                                <span>Transaction ID: {result.transactionId}</span>
                                <span>Verified: {new Date(result.lastVerified).toLocaleString()}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={<RefreshCw size={14} />}
                                    onClick={handleRefresh}
                                >
                                    Refresh
                                </Button>
                            </div>
                        </GlassCard>

                        {/* Coverage Breakdown */}
                        <div className="eligibility-checker__coverage">
                            <div className="eligibility-checker__coverage-header">
                                <h3>Coverage Breakdown</h3>
                                <p>Select a benefit category to view details</p>
                            </div>

                            {/* Category Tabs */}
                            <div className="eligibility-checker__category-tabs">
                                {result.coverage.map((coverage) => (
                                    <button
                                        key={coverage.category}
                                        className={`eligibility-checker__category-tab ${selectedCategory === coverage.category ? 'active' : ''
                                            }`}
                                        onClick={() => setSelectedCategory(coverage.category)}
                                    >
                                        {coverage.icon}
                                        <span>{coverage.category}</span>
                                    </button>
                                ))}
                            </div>

                            {/* In-Network / Out-of-Network Comparison */}
                            {selectedCoverage && (
                                <div className="eligibility-checker__coverage-grid">
                                    {/* In-Network */}
                                    <GlassCard className="eligibility-checker__network-card eligibility-checker__network-card--in">
                                        <h4>
                                            <CheckCircle2 size={16} />
                                            In-Network
                                        </h4>

                                        {selectedCoverage.inNetwork.deductible.limit > 0 && (
                                            <div className="eligibility-checker__benefit-bar">
                                                <div className="eligibility-checker__benefit-bar-header">
                                                    <span>Deductible</span>
                                                    <span>
                                                        {formatCurrency(selectedCoverage.inNetwork.deductible.used)} / {formatCurrency(selectedCoverage.inNetwork.deductible.limit)}
                                                    </span>
                                                </div>
                                                <div className="eligibility-checker__progress-track">
                                                    <motion.div
                                                        className="eligibility-checker__progress-fill eligibility-checker__progress-fill--teal"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${calculateProgress(selectedCoverage.inNetwork.deductible.used, selectedCoverage.inNetwork.deductible.limit)}%` }}
                                                        transition={{ duration: 0.5 }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="eligibility-checker__benefit-bar">
                                            <div className="eligibility-checker__benefit-bar-header">
                                                <span>Out-of-Pocket Max</span>
                                                <span>
                                                    {formatCurrency(selectedCoverage.inNetwork.outOfPocket.used)} / {formatCurrency(selectedCoverage.inNetwork.outOfPocket.limit)}
                                                </span>
                                            </div>
                                            <div className="eligibility-checker__progress-track">
                                                <motion.div
                                                    className="eligibility-checker__progress-fill eligibility-checker__progress-fill--purple"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${calculateProgress(selectedCoverage.inNetwork.outOfPocket.used, selectedCoverage.inNetwork.outOfPocket.limit)}%` }}
                                                    transition={{ duration: 0.5, delay: 0.1 }}
                                                />
                                            </div>
                                        </div>

                                        <div className="eligibility-checker__benefit-detail">
                                            <span className="eligibility-checker__benefit-label">Copay</span>
                                            <span className="eligibility-checker__benefit-value">{selectedCoverage.inNetwork.copay}</span>
                                        </div>

                                        <div className="eligibility-checker__benefit-detail">
                                            <span className="eligibility-checker__benefit-label">Coinsurance</span>
                                            <span className="eligibility-checker__benefit-value">{selectedCoverage.inNetwork.coinsurance}</span>
                                        </div>
                                    </GlassCard>

                                    {/* Out-of-Network */}
                                    <GlassCard className="eligibility-checker__network-card eligibility-checker__network-card--out">
                                        <h4>
                                            <AlertTriangle size={16} />
                                            Out-of-Network
                                        </h4>

                                        {selectedCoverage.outOfNetwork.deductible.limit > 0 && (
                                            <div className="eligibility-checker__benefit-bar">
                                                <div className="eligibility-checker__benefit-bar-header">
                                                    <span>Deductible</span>
                                                    <span>
                                                        {formatCurrency(selectedCoverage.outOfNetwork.deductible.used)} / {formatCurrency(selectedCoverage.outOfNetwork.deductible.limit)}
                                                    </span>
                                                </div>
                                                <div className="eligibility-checker__progress-track">
                                                    <motion.div
                                                        className="eligibility-checker__progress-fill eligibility-checker__progress-fill--orange"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${calculateProgress(selectedCoverage.outOfNetwork.deductible.used, selectedCoverage.outOfNetwork.deductible.limit)}%` }}
                                                        transition={{ duration: 0.5 }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {selectedCoverage.outOfNetwork.outOfPocket.limit > 0 && (
                                            <div className="eligibility-checker__benefit-bar">
                                                <div className="eligibility-checker__benefit-bar-header">
                                                    <span>Out-of-Pocket Max</span>
                                                    <span>
                                                        {formatCurrency(selectedCoverage.outOfNetwork.outOfPocket.used)} / {formatCurrency(selectedCoverage.outOfNetwork.outOfPocket.limit)}
                                                    </span>
                                                </div>
                                                <div className="eligibility-checker__progress-track">
                                                    <motion.div
                                                        className="eligibility-checker__progress-fill eligibility-checker__progress-fill--red"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${calculateProgress(selectedCoverage.outOfNetwork.outOfPocket.used, selectedCoverage.outOfNetwork.outOfPocket.limit)}%` }}
                                                        transition={{ duration: 0.5, delay: 0.1 }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="eligibility-checker__benefit-detail">
                                            <span className="eligibility-checker__benefit-label">Coinsurance</span>
                                            <span className="eligibility-checker__benefit-value">{selectedCoverage.outOfNetwork.coinsurance}</span>
                                        </div>
                                    </GlassCard>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default EligibilityChecker
