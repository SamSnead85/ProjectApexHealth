import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    FileText,
    Users,
    DollarSign,
    Activity,
    PieChart,
    BarChart3,
    Filter,
    Download,
    Calendar,
    ChevronRight,
    Target,
    Zap
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './RiskAdjustment.css'

interface RafScore {
    memberId: string
    memberName: string
    currentRaf: number
    projectedRaf: number
    gap: number
    hccCount: number
    conditions: string[]
    lastAssessment: string
    nextAssessment?: string
}

interface HccCode {
    code: string
    description: string
    weight: number
    prevalence: number
    gapCount: number
}

const mockRafScores: RafScore[] = [
    {
        memberId: 'MEM-001',
        memberName: 'Robert Johnson',
        currentRaf: 1.24,
        projectedRaf: 1.52,
        gap: 0.28,
        hccCount: 4,
        conditions: ['Diabetes w/ Complications', 'CHF', 'CKD Stage 3'],
        lastAssessment: '2023-08-15',
        nextAssessment: '2024-02-15'
    },
    {
        memberId: 'MEM-002',
        memberName: 'Maria Garcia',
        currentRaf: 0.89,
        projectedRaf: 1.15,
        gap: 0.26,
        hccCount: 2,
        conditions: ['COPD', 'Major Depressive Disorder'],
        lastAssessment: '2023-10-20'
    },
    {
        memberId: 'MEM-003',
        memberName: 'James Wilson',
        currentRaf: 2.15,
        projectedRaf: 2.45,
        gap: 0.30,
        hccCount: 6,
        conditions: ['End Stage Renal Disease', 'Diabetes', 'Vascular Disease'],
        lastAssessment: '2023-11-05',
        nextAssessment: '2024-05-05'
    }
]

const topHccGaps: HccCode[] = [
    { code: 'HCC18', description: 'Diabetes with Chronic Complications', weight: 0.318, prevalence: 12.5, gapCount: 245 },
    { code: 'HCC85', description: 'Congestive Heart Failure', weight: 0.368, prevalence: 8.2, gapCount: 189 },
    { code: 'HCC111', description: 'COPD', weight: 0.346, prevalence: 9.8, gapCount: 156 },
    { code: 'HCC136', description: 'Chronic Kidney Disease, Stage 4', weight: 0.289, prevalence: 5.4, gapCount: 134 },
    { code: 'HCC58', description: 'Major Depressive Disorder', weight: 0.395, prevalence: 11.2, gapCount: 128 }
]

export function RiskAdjustment() {
    const [rafScores] = useState<RafScore[]>(mockRafScores)
    const [hccGaps] = useState<HccCode[]>(topHccGaps)

    const totalGapValue = rafScores.reduce((sum, m) => sum + (m.gap * 12000), 0)
    const avgRaf = rafScores.reduce((sum, m) => sum + m.currentRaf, 0) / rafScores.length

    return (
        <div className="risk-adjustment-page">
            {/* Header */}
            <div className="risk-adjustment__header">
                <div>
                    <h1 className="risk-adjustment__title">Risk Adjustment</h1>
                    <p className="risk-adjustment__subtitle">
                        HCC coding, RAF score management, and gap closure analytics
                    </p>
                </div>
                <div className="risk-adjustment__actions">
                    <Button variant="secondary" icon={<Download size={16} />}>
                        Export Report
                    </Button>
                    <Button variant="primary" icon={<Target size={16} />}>
                        Run Analysis
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="risk-adjustment__overview">
                <MetricCard
                    title="Avg RAF Score"
                    value={avgRaf.toFixed(2)}
                    change={{ value: 5.2, type: 'increase' }}
                    icon={<Activity size={20} />}
                />
                <MetricCard
                    title="Total Gap Value"
                    value={`$${(totalGapValue / 1000).toFixed(0)}K`}
                    icon={<DollarSign size={20} />}
                />
                <MetricCard
                    title="Open HCC Gaps"
                    value="852"
                    change={{ value: 12, type: 'decrease' }}
                    icon={<AlertTriangle size={20} />}
                />
                <MetricCard
                    title="Closure Rate"
                    value="78%"
                    change={{ value: 8.5, type: 'increase' }}
                    icon={<Target size={20} />}
                />
            </div>

            {/* Two Column Layout */}
            <div className="risk-adjustment__grid">
                {/* Member RAF Scores */}
                <GlassCard className="raf-scores-panel">
                    <div className="panel-header">
                        <h3>Member RAF Scores</h3>
                        <div className="panel-actions">
                            <Button variant="ghost" size="sm" icon={<Filter size={14} />}>Filter</Button>
                        </div>
                    </div>

                    <div className="raf-scores-list">
                        {rafScores.map((member, index) => (
                            <motion.div
                                key={member.memberId}
                                className="raf-score-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="raf-score-card__header">
                                    <div className="raf-score-card__member">
                                        <div className="member-avatar">
                                            <Users size={16} />
                                        </div>
                                        <div className="member-info">
                                            <span className="member-name">{member.memberName}</span>
                                            <span className="member-id">{member.memberId}</span>
                                        </div>
                                    </div>
                                    <Badge variant={member.gap > 0.25 ? 'warning' : 'info'} size="sm">
                                        {member.hccCount} HCCs
                                    </Badge>
                                </div>

                                <div className="raf-score-card__scores">
                                    <div className="score-block">
                                        <span className="score-label">Current RAF</span>
                                        <span className="score-value">{member.currentRaf.toFixed(2)}</span>
                                    </div>
                                    <div className="score-arrow">
                                        <ChevronRight size={16} />
                                    </div>
                                    <div className="score-block projected">
                                        <span className="score-label">Projected</span>
                                        <span className="score-value">{member.projectedRaf.toFixed(2)}</span>
                                    </div>
                                    <div className={`score-block gap ${member.gap > 0.25 ? 'high' : ''}`}>
                                        <span className="score-label">Gap</span>
                                        <span className="score-value">+{member.gap.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="raf-score-card__conditions">
                                    {member.conditions.slice(0, 3).map((condition, i) => (
                                        <Badge key={i} variant="info" size="sm">{condition}</Badge>
                                    ))}
                                </div>

                                <div className="raf-score-card__footer">
                                    <span className="assessment-date">
                                        <Calendar size={12} /> Last: {new Date(member.lastAssessment).toLocaleDateString()}
                                    </span>
                                    <Button variant="secondary" size="sm" icon={<FileText size={12} />}>
                                        Review
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Top HCC Gaps */}
                <GlassCard className="hcc-gaps-panel">
                    <div className="panel-header">
                        <h3>Top HCC Gaps</h3>
                        <Badge variant="warning" icon={<Zap size={10} />}>Priority</Badge>
                    </div>

                    <div className="hcc-gaps-list">
                        {hccGaps.map((hcc, index) => (
                            <motion.div
                                key={hcc.code}
                                className="hcc-gap-item"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="hcc-gap-item__main">
                                    <div className="hcc-code">{hcc.code}</div>
                                    <div className="hcc-info">
                                        <span className="hcc-desc">{hcc.description}</span>
                                        <div className="hcc-meta">
                                            <span>Weight: {hcc.weight.toFixed(3)}</span>
                                            <span>Prevalence: {hcc.prevalence}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hcc-gap-item__count">
                                    <span className="gap-count">{hcc.gapCount}</span>
                                    <span className="gap-label">gaps</span>
                                </div>
                                <div className="hcc-gap-item__bar">
                                    <div
                                        className="hcc-gap-item__bar-fill"
                                        style={{ width: `${(hcc.gapCount / 250) * 100}%` }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="hcc-gaps-footer">
                        <Button variant="primary" size="sm" icon={<BarChart3 size={14} />}>
                            View Full Analysis
                        </Button>
                    </div>
                </GlassCard>
            </div>

            {/* Revenue Impact */}
            <GlassCard className="revenue-impact">
                <div className="revenue-impact__header">
                    <h3>Projected Revenue Impact</h3>
                    <Badge variant="success" icon={<TrendingUp size={10} />}>+12.5% YoY</Badge>
                </div>
                <div className="revenue-impact__metrics">
                    <div className="revenue-metric">
                        <span className="revenue-metric__label">Current Annual Revenue</span>
                        <span className="revenue-metric__value">$24.5M</span>
                    </div>
                    <div className="revenue-metric">
                        <span className="revenue-metric__label">Gap Closure Opportunity</span>
                        <span className="revenue-metric__value revenue-metric__value--success">+$2.8M</span>
                    </div>
                    <div className="revenue-metric">
                        <span className="revenue-metric__label">Projected Total</span>
                        <span className="revenue-metric__value revenue-metric__value--highlight">$27.3M</span>
                    </div>
                </div>
            </GlassCard>
        </div>
    )
}

export default RiskAdjustment
