import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Heart,
    TrendingUp,
    TrendingDown,
    Users,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Download,
    RefreshCw,
    Filter,
    Search,
    BarChart3,
    Target,
    Calendar,
    Clock,
    Star,
    Activity,
    Zap,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Info,
    Award
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './PopulationHealth.css'

// Types
interface HEDISMeasure {
    id: string
    name: string
    abbreviation: string
    category: string
    performance: number
    benchmark: number
    target: number
    trend: number
    gapCount: number
    status: 'exceeds' | 'meets' | 'below' | 'critical'
}

interface CareGap {
    memberId: string
    memberName: string
    measure: string
    dueDate: string
    priority: 'high' | 'medium' | 'low'
    outreachStatus: 'pending' | 'scheduled' | 'attempted' | 'closed'
    lastContact: string | null
}

interface PopulationSegment {
    name: string
    count: number
    percentage: number
    riskScore: number
    color: string
}

interface StarRating {
    category: string
    rating: number
    maxRating: number
    weight: number
    measures: number
}

// Mock Data
const hedisCategories = [
    { name: 'Preventive Care', color: '#10B981' },
    { name: 'Chronic Conditions', color: '#3B82F6' },
    { name: 'Behavioral Health', color: '#8B5CF6' },
    { name: 'Medication Management', color: '#F59E0B' },
    { name: 'Access/Availability', color: '#EF4444' },
]

const hedisMeasures: HEDISMeasure[] = [
    { id: 'BCS', name: 'Breast Cancer Screening', abbreviation: 'BCS', category: 'Preventive Care', performance: 78.5, benchmark: 75, target: 80, trend: 2.3, gapCount: 145, status: 'meets' },
    { id: 'CCS', name: 'Cervical Cancer Screening', abbreviation: 'CCS', category: 'Preventive Care', performance: 72.1, benchmark: 70, target: 78, trend: -1.2, gapCount: 198, status: 'meets' },
    { id: 'COL', name: 'Colorectal Cancer Screening', abbreviation: 'COL', category: 'Preventive Care', performance: 65.8, benchmark: 68, target: 72, trend: 3.8, gapCount: 312, status: 'below' },
    { id: 'CDC-A1C', name: 'Diabetes: HbA1c Testing', abbreviation: 'CDC-A1c', category: 'Chronic Conditions', performance: 89.2, benchmark: 85, target: 90, trend: 1.5, gapCount: 67, status: 'exceeds' },
    { id: 'CDC-BP', name: 'Diabetes: Blood Pressure Control', abbreviation: 'CDC-BP', category: 'Chronic Conditions', performance: 71.3, benchmark: 70, target: 75, trend: 4.2, gapCount: 156, status: 'meets' },
    { id: 'CBP', name: 'Controlling High Blood Pressure', abbreviation: 'CBP', category: 'Chronic Conditions', performance: 68.9, benchmark: 65, target: 72, trend: 2.8, gapCount: 234, status: 'meets' },
    { id: 'AMM', name: 'Antidepressant Medication Mgmt', abbreviation: 'AMM', category: 'Behavioral Health', performance: 52.4, benchmark: 55, target: 60, trend: -3.1, gapCount: 89, status: 'critical' },
    { id: 'FUH', name: 'Follow-Up After Hospitalization', abbreviation: 'FUH', category: 'Behavioral Health', performance: 48.7, benchmark: 50, target: 55, trend: 5.6, gapCount: 42, status: 'below' },
    { id: 'PDC-DM', name: 'Medication Adherence - Diabetes', abbreviation: 'PDC-DM', category: 'Medication Management', performance: 82.1, benchmark: 80, target: 85, trend: 0.8, gapCount: 124, status: 'exceeds' },
    { id: 'PDC-HTN', name: 'Medication Adherence - HTN', abbreviation: 'PDC-HTN', category: 'Medication Management', performance: 79.6, benchmark: 80, target: 85, trend: -0.5, gapCount: 178, status: 'below' },
]

const careGaps: CareGap[] = [
    { memberId: 'MEM-7842', memberName: 'Sarah Johnson', measure: 'Breast Cancer Screening', dueDate: '2024-03-15', priority: 'high', outreachStatus: 'pending', lastContact: null },
    { memberId: 'MEM-3921', memberName: 'Michael Chen', measure: 'HbA1c Testing', dueDate: '2024-02-28', priority: 'high', outreachStatus: 'scheduled', lastContact: '2024-01-20' },
    { memberId: 'MEM-5634', memberName: 'Emily Rodriguez', measure: 'Colorectal Screening', dueDate: '2024-04-01', priority: 'medium', outreachStatus: 'attempted', lastContact: '2024-01-15' },
    { memberId: 'MEM-8127', memberName: 'James Wilson', measure: 'Blood Pressure Control', dueDate: '2024-03-01', priority: 'medium', outreachStatus: 'pending', lastContact: null },
    { memberId: 'MEM-2956', memberName: 'Lisa Thompson', measure: 'Medication Adherence', dueDate: '2024-02-15', priority: 'high', outreachStatus: 'closed', lastContact: '2024-01-22' },
]

const populationSegments: PopulationSegment[] = [
    { name: 'Healthy', count: 4250, percentage: 52, riskScore: 0.8, color: '#10B981' },
    { name: 'Low Risk', count: 1890, percentage: 23, riskScore: 1.2, color: '#3B82F6' },
    { name: 'Rising Risk', count: 1285, percentage: 16, riskScore: 2.1, color: '#F59E0B' },
    { name: 'High Risk', count: 580, percentage: 7, riskScore: 3.8, color: '#EF4444' },
    { name: 'Complex', count: 165, percentage: 2, riskScore: 5.2, color: '#8B5CF6' },
]

const starRatings: StarRating[] = [
    { category: 'Preventive Health', rating: 3.5, maxRating: 5, weight: 25, measures: 8 },
    { category: 'Chronic Care', rating: 4.0, maxRating: 5, weight: 30, measures: 12 },
    { category: 'Member Experience', rating: 3.0, maxRating: 5, weight: 20, measures: 6 },
    { category: 'Medication Management', rating: 4.0, maxRating: 5, weight: 25, measures: 5 },
]

// Utility functions
const getStatusColor = (status: string): string => {
    switch (status) {
        case 'exceeds': return '#10B981'
        case 'meets': return '#3B82F6'
        case 'below': return '#F59E0B'
        case 'critical': return '#EF4444'
        default: return '#6B7280'
    }
}

// Components
const MeasureCard = ({ measure, index }: { measure: HEDISMeasure; index: number }) => (
    <motion.div
        className="hedis-measure-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
    >
        <div className="hedis-measure-card__header">
            <div className="hedis-measure-card__info">
                <span className="hedis-measure-card__abbr">{measure.abbreviation}</span>
                <span className="hedis-measure-card__name">{measure.name}</span>
            </div>
            <Badge
                variant={measure.status === 'exceeds' ? 'success' : measure.status === 'meets' ? 'info' : measure.status === 'below' ? 'warning' : 'critical'}
                size="sm"
            >
                {measure.status}
            </Badge>
        </div>
        <div className="hedis-measure-card__performance">
            <div className="hedis-measure-card__gauge">
                <div className="hedis-measure-card__gauge-track">
                    <motion.div
                        className="hedis-measure-card__gauge-fill"
                        style={{ background: getStatusColor(measure.status) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${measure.performance}%` }}
                        transition={{ delay: index * 0.05, duration: 0.5 }}
                    />
                    <div className="hedis-measure-card__benchmark" style={{ left: `${measure.benchmark}%` }} />
                    <div className="hedis-measure-card__target" style={{ left: `${measure.target}%` }} />
                </div>
                <div className="hedis-measure-card__gauge-labels">
                    <span>0%</span>
                    <span>Benchmark: {measure.benchmark}%</span>
                    <span>100%</span>
                </div>
            </div>
            <div className="hedis-measure-card__value">{measure.performance}%</div>
        </div>
        <div className="hedis-measure-card__footer">
            <span className={`hedis-measure-card__trend ${measure.trend >= 0 ? 'up' : 'down'}`}>
                {measure.trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(measure.trend)}%
            </span>
            <span className="hedis-measure-card__gaps">
                <Users size={12} /> {measure.gapCount} gaps
            </span>
        </div>
    </motion.div>
)

const CareGapRow = ({ gap, index }: { gap: CareGap; index: number }) => (
    <motion.div
        className="care-gap-row"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
    >
        <div className="care-gap-row__member">
            <span className="care-gap-row__name">{gap.memberName}</span>
            <span className="care-gap-row__id">{gap.memberId}</span>
        </div>
        <span className="care-gap-row__measure">{gap.measure}</span>
        <span className="care-gap-row__due">{gap.dueDate}</span>
        <Badge
            variant={gap.priority === 'high' ? 'critical' : gap.priority === 'medium' ? 'warning' : 'info'}
            size="sm"
        >
            {gap.priority}
        </Badge>
        <Badge
            variant={gap.outreachStatus === 'closed' ? 'success' : gap.outreachStatus === 'scheduled' ? 'info' : gap.outreachStatus === 'attempted' ? 'warning' : 'default'}
            size="sm"
        >
            {gap.outreachStatus}
        </Badge>
        <Button variant="ghost" size="sm">View</Button>
    </motion.div>
)

const RiskPyramid = ({ segments }: { segments: PopulationSegment[] }) => {
    const totalPopulation = segments.reduce((sum, s) => sum + s.count, 0)

    return (
        <div className="risk-pyramid">
            <div className="risk-pyramid__chart">
                {[...segments].reverse().map((segment, index) => (
                    <motion.div
                        key={segment.name}
                        className="risk-pyramid__segment"
                        style={{
                            width: `${30 + (segments.length - 1 - index) * 15}%`,
                            background: segment.color
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <span className="risk-pyramid__segment-label">{segment.name}</span>
                        <span className="risk-pyramid__segment-count">{segment.count.toLocaleString()}</span>
                    </motion.div>
                ))}
            </div>
            <div className="risk-pyramid__legend">
                {segments.map((segment) => (
                    <div key={segment.name} className="risk-pyramid__legend-item">
                        <span className="risk-pyramid__legend-color" style={{ background: segment.color }} />
                        <span className="risk-pyramid__legend-name">{segment.name}</span>
                        <span className="risk-pyramid__legend-pct">{segment.percentage}%</span>
                        <span className="risk-pyramid__legend-risk">Risk: {segment.riskScore}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

const StarRatingCard = ({ rating, index }: { rating: StarRating; index: number }) => (
    <motion.div
        className="star-rating-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
    >
        <div className="star-rating-card__header">
            <span className="star-rating-card__category">{rating.category}</span>
            <span className="star-rating-card__weight">Weight: {rating.weight}%</span>
        </div>
        <div className="star-rating-card__stars">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={20}
                    className={star <= rating.rating ? 'filled' : star - 0.5 <= rating.rating ? 'half' : 'empty'}
                />
            ))}
            <span className="star-rating-card__value">{rating.rating}</span>
        </div>
        <span className="star-rating-card__measures">{rating.measures} measures</span>
    </motion.div>
)

export function PopulationHealth() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')

    const filteredMeasures = useMemo(() => {
        let measures = hedisMeasures
        if (selectedCategory !== 'all') {
            measures = measures.filter(m => m.category === selectedCategory)
        }
        if (searchTerm) {
            measures = measures.filter(m =>
                m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        return measures
    }, [selectedCategory, searchTerm])

    const overallStarRating = useMemo(() => {
        const weightedSum = starRatings.reduce((sum, r) => sum + (r.rating * r.weight), 0)
        const totalWeight = starRatings.reduce((sum, r) => sum + r.weight, 0)
        return (weightedSum / totalWeight).toFixed(1)
    }, [])

    return (
        <div className="population-health-page">
            {/* Header */}
            <div className="population-health-page__header">
                <div className="population-health-page__header-content">
                    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        Population Health & Quality
                    </motion.h1>
                    <p>HEDIS Measures • Care Gap Management • Risk Stratification</p>
                </div>
                <div className="population-health-page__header-actions">
                    <div className="population-health-page__star-badge">
                        <Award size={20} />
                        <span>Overall Rating: <strong>{overallStarRating} ★</strong></span>
                    </div>
                    <Button variant="secondary" icon={<Download size={16} />}>Export</Button>
                </div>
            </div>

            {/* Star Ratings */}
            <section className="population-health-page__stars">
                {starRatings.map((rating, index) => (
                    <StarRatingCard key={rating.category} rating={rating} index={index} />
                ))}
            </section>

            {/* Main Grid */}
            <div className="population-health-page__grid">
                {/* HEDIS Measures */}
                <GlassCard className="population-health-page__card population-health-page__card--measures">
                    <div className="population-health-page__card-header">
                        <h3><Target size={18} /> HEDIS Performance</h3>
                        <div className="population-health-page__filters">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                {hedisCategories.map(cat => (
                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                            <div className="population-health-page__search">
                                <Search size={14} />
                                <input
                                    type="text"
                                    placeholder="Search measures..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="population-health-page__measures-grid">
                        {filteredMeasures.map((measure, index) => (
                            <MeasureCard key={measure.id} measure={measure} index={index} />
                        ))}
                    </div>
                </GlassCard>

                {/* Risk Stratification */}
                <GlassCard className="population-health-page__card population-health-page__card--risk">
                    <div className="population-health-page__card-header">
                        <h3><Activity size={18} /> Risk Stratification</h3>
                        <span className="population-health-page__total-pop">
                            Total: {populationSegments.reduce((s, p) => s + p.count, 0).toLocaleString()} members
                        </span>
                    </div>
                    <RiskPyramid segments={populationSegments} />
                </GlassCard>

                {/* Care Gaps */}
                <GlassCard className="population-health-page__card population-health-page__card--gaps">
                    <div className="population-health-page__card-header">
                        <h3><AlertTriangle size={18} /> Priority Care Gaps</h3>
                        <Badge variant="warning" size="sm">{careGaps.length} Active</Badge>
                    </div>
                    <div className="population-health-page__gaps-header">
                        <span>Member</span>
                        <span>Measure</span>
                        <span>Due Date</span>
                        <span>Priority</span>
                        <span>Outreach</span>
                        <span></span>
                    </div>
                    <div className="population-health-page__gaps-list">
                        {careGaps.map((gap, index) => (
                            <CareGapRow key={gap.memberId} gap={gap} index={index} />
                        ))}
                    </div>
                    <Button variant="ghost" className="population-health-page__view-all">
                        View All Care Gaps <ChevronRight size={14} />
                    </Button>
                </GlassCard>
            </div>
        </div>
    )
}

export default PopulationHealth
