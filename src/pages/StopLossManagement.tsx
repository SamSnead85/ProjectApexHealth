import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Shield,
    Target,
    Users,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Clock,
    DollarSign,
    Activity,
    Crosshair,
    PieChart,
    BarChart3,
    ArrowRight
} from 'lucide-react'
import './StopLossManagement.css'

interface LaserClaimant {
    id: string
    name: string
    memberId: string
    laserAmount: number
    ytdClaims: number
    percentUsed: number
    primaryDiagnosis: string
    riskLevel: 'high' | 'medium' | 'low'
}

interface HighCostClaimant {
    id: string
    name: string
    memberId: string
    totalClaims: number
    attachmentPoint: number
    percentToAttachment: number
    primaryCondition: string
    interventionStatus: 'active' | 'pending' | 'needed'
}

const mockLaserClaimants: LaserClaimant[] = [
    {
        id: '1',
        name: 'Robert Thompson',
        memberId: 'MBR-001847',
        laserAmount: 150000,
        ytdClaims: 127500,
        percentUsed: 85,
        primaryDiagnosis: 'Chronic Kidney Disease Stage 4',
        riskLevel: 'high'
    },
    {
        id: '2',
        name: 'Maria Garcia',
        memberId: 'MBR-002451',
        laserAmount: 200000,
        ytdClaims: 145000,
        percentUsed: 72.5,
        primaryDiagnosis: 'Metastatic Breast Cancer',
        riskLevel: 'high'
    },
    {
        id: '3',
        name: 'James Wilson',
        memberId: 'MBR-003298',
        laserAmount: 100000,
        ytdClaims: 42000,
        percentUsed: 42,
        primaryDiagnosis: 'Hemophilia A',
        riskLevel: 'medium'
    },
    {
        id: '4',
        name: 'Patricia Anderson',
        memberId: 'MBR-004127',
        laserAmount: 125000,
        ytdClaims: 28750,
        percentUsed: 23,
        primaryDiagnosis: 'Rheumatoid Arthritis',
        riskLevel: 'low'
    }
]

const mockHighCostClaimants: HighCostClaimant[] = [
    {
        id: '1',
        name: 'David Chen',
        memberId: 'MBR-005892',
        totalClaims: 187500,
        attachmentPoint: 250000,
        percentToAttachment: 75,
        primaryCondition: 'Liver Transplant Recovery',
        interventionStatus: 'active'
    },
    {
        id: '2',
        name: 'Sarah Miller',
        memberId: 'MBR-006341',
        totalClaims: 142000,
        attachmentPoint: 250000,
        percentToAttachment: 56.8,
        primaryCondition: 'Multiple Sclerosis',
        interventionStatus: 'pending'
    },
    {
        id: '3',
        name: 'Michael Brown',
        memberId: 'MBR-007218',
        totalClaims: 98500,
        attachmentPoint: 250000,
        percentToAttachment: 39.4,
        primaryCondition: 'End-Stage Renal Disease',
        interventionStatus: 'needed'
    }
]

type WindowType = '12/12' | '15/12' | '24/12'

export default function StopLossManagement() {
    const [activeWindow, setActiveWindow] = useState<WindowType>('12/12')

    const getProgressColor = (percent: number) => {
        if (percent >= 80) return 'critical'
        if (percent >= 50) return 'warning'
        return 'healthy'
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const getInterventionIcon = (status: HighCostClaimant['interventionStatus']) => {
        switch (status) {
            case 'active': return <CheckCircle2 size={14} />
            case 'pending': return <Clock size={14} />
            case 'needed': return <AlertTriangle size={14} />
        }
    }

    const projectionData = {
        '12/12': {
            pmpm: 485.50,
            pmpmChange: '+4.2%',
            totalClaims: 2847500,
            claimsChange: '+12.1%',
            lossRatio: 82.3,
            lossChange: '+2.1%',
            projectedRenewal: '+8.5%'
        },
        '15/12': {
            pmpm: 478.25,
            pmpmChange: '+3.8%',
            totalClaims: 2712000,
            claimsChange: '+9.4%',
            lossRatio: 80.1,
            lossChange: '+1.2%',
            projectedRenewal: '+6.2%'
        },
        '24/12': {
            pmpm: 462.80,
            pmpmChange: '+2.1%',
            totalClaims: 2584000,
            claimsChange: '+5.8%',
            lossRatio: 77.8,
            lossChange: '-0.4%',
            projectedRenewal: '+4.1%'
        }
    }

    const currentProjection = projectionData[activeWindow]

    return (
        <div className="stop-loss-management">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>Stop-Loss Management Suite</h1>
                <p className="page-subtitle">
                    Attachment point monitoring, laser tracking, and renewal projections
                </p>
            </motion.div>

            {/* Attachment Gauges */}
            <motion.div
                className="attachment-gauges"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {/* Specific Stop-Loss */}
                <div className="gauge-card">
                    <div className="gauge-header">
                        <h3>
                            <Target size={18} />
                            Specific Stop-Loss
                        </h3>
                        <span className="gauge-badge warning">MONITORING</span>
                    </div>
                    <div className="gauge-container">
                        <svg className="gauge-svg" viewBox="0 0 200 100">
                            <defs>
                                <linearGradient id="gaugeGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#22c55e" />
                                    <stop offset="100%" stopColor="#4ade80" />
                                </linearGradient>
                                <linearGradient id="gaugeYellow" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#f59e0b" />
                                    <stop offset="100%" stopColor="#fbbf24" />
                                </linearGradient>
                                <linearGradient id="gaugeRed" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#ef4444" />
                                    <stop offset="100%" stopColor="#f87171" />
                                </linearGradient>
                            </defs>
                            <path
                                className="gauge-bg"
                                d="M 20 90 A 80 80 0 0 1 180 90"
                            />
                            <path
                                className="gauge-fill warning"
                                d="M 20 90 A 80 80 0 0 1 180 90"
                                strokeDasharray="251"
                                strokeDashoffset={251 * (1 - 0.68)}
                            />
                        </svg>
                        <div className="gauge-value">
                            <div className="gauge-percent">68%</div>
                            <div className="gauge-label">Utilization</div>
                        </div>
                    </div>
                    <div className="gauge-details">
                        <div className="gauge-detail">
                            <div className="gauge-detail-value">$250K</div>
                            <div className="gauge-detail-label">Attachment</div>
                        </div>
                        <div className="gauge-detail">
                            <div className="gauge-detail-value">4</div>
                            <div className="gauge-detail-label">Lasers</div>
                        </div>
                        <div className="gauge-detail">
                            <div className="gauge-detail-value">2</div>
                            <div className="gauge-detail-label">At Risk</div>
                        </div>
                    </div>
                </div>

                {/* Aggregate Stop-Loss */}
                <div className="gauge-card">
                    <div className="gauge-header">
                        <h3>
                            <Shield size={18} />
                            Aggregate Stop-Loss
                        </h3>
                        <span className="gauge-badge healthy">HEALTHY</span>
                    </div>
                    <div className="gauge-container">
                        <svg className="gauge-svg" viewBox="0 0 200 100">
                            <path
                                className="gauge-bg"
                                d="M 20 90 A 80 80 0 0 1 180 90"
                            />
                            <path
                                className="gauge-fill healthy"
                                d="M 20 90 A 80 80 0 0 1 180 90"
                                strokeDasharray="251"
                                strokeDashoffset={251 * (1 - 0.52)}
                            />
                        </svg>
                        <div className="gauge-value">
                            <div className="gauge-percent">52%</div>
                            <div className="gauge-label">Utilization</div>
                        </div>
                    </div>
                    <div className="gauge-details">
                        <div className="gauge-detail">
                            <div className="gauge-detail-value">$4.2M</div>
                            <div className="gauge-detail-label">Corridor</div>
                        </div>
                        <div className="gauge-detail">
                            <div className="gauge-detail-value">$2.18M</div>
                            <div className="gauge-detail-label">YTD Claims</div>
                        </div>
                        <div className="gauge-detail">
                            <div className="gauge-detail-value">$2.02M</div>
                            <div className="gauge-detail-label">Remaining</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Laser Tracker */}
            <motion.div
                className="laser-tracker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2>
                    <Crosshair size={20} />
                    Laser Tracker
                </h2>
                <table className="laser-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Laser Amount</th>
                            <th>YTD Claims</th>
                            <th>Utilization</th>
                            <th>Condition</th>
                            <th>Risk</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockLaserClaimants.map((claimant) => (
                            <tr key={claimant.id}>
                                <td>
                                    <div className="laser-member">
                                        <div className="laser-avatar">
                                            {claimant.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{claimant.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {claimant.memberId}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>{formatCurrency(claimant.laserAmount)}</td>
                                <td>{formatCurrency(claimant.ytdClaims)}</td>
                                <td>
                                    <div style={{ width: '120px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '0.75rem' }}>{claimant.percentUsed}%</span>
                                        </div>
                                        <div className="laser-progress-bar">
                                            <div
                                                className={`laser-progress-fill ${getProgressColor(claimant.percentUsed)}`}
                                                style={{ width: `${claimant.percentUsed}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontSize: '0.813rem' }}>{claimant.primaryDiagnosis}</td>
                                <td>
                                    <span className={`risk-badge ${claimant.riskLevel}`}>
                                        {claimant.riskLevel === 'high' && <AlertTriangle size={12} />}
                                        {claimant.riskLevel.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Renewal Projections */}
            <motion.div
                className="renewal-projections"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2>
                    <TrendingUp size={20} />
                    Renewal Projections
                </h2>
                <div className="window-tabs">
                    {(['12/12', '15/12', '24/12'] as WindowType[]).map(window => (
                        <button
                            key={window}
                            className={`window-tab ${activeWindow === window ? 'active' : ''}`}
                            onClick={() => setActiveWindow(window)}
                        >
                            {window} Window
                        </button>
                    ))}
                </div>
                <div className="projection-grid">
                    <div className="projection-card">
                        <h4>PMPM</h4>
                        <div className="projection-value">
                            {formatCurrency(currentProjection.pmpm)}
                        </div>
                        <div className="projection-change">{currentProjection.pmpmChange} vs prior</div>
                    </div>
                    <div className="projection-card">
                        <h4>Total Claims</h4>
                        <div className="projection-value">
                            {formatCurrency(currentProjection.totalClaims)}
                        </div>
                        <div className="projection-change">{currentProjection.claimsChange} vs prior</div>
                    </div>
                    <div className="projection-card">
                        <h4>Loss Ratio</h4>
                        <div className="projection-value">
                            {currentProjection.lossRatio}%
                        </div>
                        <div className="projection-change">{currentProjection.lossChange} vs prior</div>
                    </div>
                    <div className="projection-card">
                        <h4>Projected Renewal</h4>
                        <div className={`projection-value ${currentProjection.projectedRenewal.startsWith('+') ? 'negative' : 'positive'}`}>
                            {currentProjection.projectedRenewal}
                        </div>
                        <div className="projection-change">Rate increase</div>
                    </div>
                </div>
            </motion.div>

            {/* Terminal Liability */}
            <motion.div
                className="terminal-liability"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h2>
                    <DollarSign size={20} />
                    Terminal Liability Estimator
                </h2>
                <div className="liability-metrics">
                    <div className="liability-card">
                        <div className="liability-icon ibnr">
                            <Activity size={24} />
                        </div>
                        <div className="liability-value">$487,200</div>
                        <div className="liability-label">IBNR Reserve</div>
                    </div>
                    <div className="liability-card">
                        <div className="liability-icon runout">
                            <BarChart3 size={24} />
                        </div>
                        <div className="liability-value">$312,800</div>
                        <div className="liability-label">Run-Out Estimate</div>
                    </div>
                    <div className="liability-card">
                        <div className="liability-icon total">
                            <PieChart size={24} />
                        </div>
                        <div className="liability-value">$800,000</div>
                        <div className="liability-label">Total Terminal Liability</div>
                    </div>
                </div>
                <div className="liability-chart">
                    <span>Run-out projection chart would render here (Recharts)</span>
                </div>
            </motion.div>

            {/* High-Cost Claimants */}
            <motion.div
                className="high-cost-claimants"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2>
                    <Users size={20} />
                    High-Cost Claimants Approaching Attachment
                </h2>
                <div className="claimant-cards">
                    {mockHighCostClaimants.map((claimant, index) => (
                        <motion.div
                            key={claimant.id}
                            className="claimant-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <div className="claimant-avatar">
                                {claimant.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="claimant-info">
                                <h4>{claimant.name}</h4>
                                <p>{claimant.primaryCondition} • {claimant.memberId}</p>
                            </div>
                            <div className="claimant-metrics">
                                <div className="claimant-metric">
                                    <span className="claimant-metric-value">{formatCurrency(claimant.totalClaims)}</span>
                                    <span className="claimant-metric-label">YTD Claims</span>
                                </div>
                                <div className="claimant-metric">
                                    <span className="claimant-metric-value">{claimant.percentToAttachment}%</span>
                                    <span className="claimant-metric-label">To Attachment</span>
                                </div>
                            </div>
                            <span className={`intervention-badge ${claimant.interventionStatus}`}>
                                {getInterventionIcon(claimant.interventionStatus)}
                                {claimant.interventionStatus.charAt(0).toUpperCase() + claimant.interventionStatus.slice(1)}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
