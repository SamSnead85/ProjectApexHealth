import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    Target,
    Award,
    Star,
    CheckCircle2,
    AlertTriangle,
    BarChart3,
    PieChart,
    Calendar,
    Download,
    Filter,
    ChevronRight,
    Activity,
    Heart,
    Pill,
    Stethoscope
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './QualityMetrics.css'

interface QualityMeasure {
    id: string
    name: string
    category: string
    currentRate: number
    targetRate: number
    nationalBenchmark: number
    starRating: number
    trend: 'up' | 'down' | 'stable'
    weight: number
}

interface StarCategory {
    name: string
    rating: number
    measures: number
    weight: number
}

const qualityMeasures: QualityMeasure[] = [
    { id: 'HEDIS-001', name: 'Controlling High Blood Pressure', category: 'Chronic Conditions', currentRate: 72.5, targetRate: 75.0, nationalBenchmark: 68.4, starRating: 4, trend: 'up', weight: 3 },
    { id: 'HEDIS-002', name: 'Diabetes Care - HbA1c Control', category: 'Chronic Conditions', currentRate: 68.2, targetRate: 70.0, nationalBenchmark: 65.8, starRating: 3, trend: 'up', weight: 3 },
    { id: 'HEDIS-003', name: 'Breast Cancer Screening', category: 'Prevention', currentRate: 78.9, targetRate: 80.0, nationalBenchmark: 74.2, starRating: 4, trend: 'stable', weight: 1 },
    { id: 'HEDIS-004', name: 'Medication Adherence - Diabetes', category: 'Pharmacy', currentRate: 81.5, targetRate: 85.0, nationalBenchmark: 78.6, starRating: 4, trend: 'up', weight: 3 },
    { id: 'HEDIS-005', name: 'Adult BMI Assessment', category: 'Prevention', currentRate: 94.2, targetRate: 95.0, nationalBenchmark: 91.5, starRating: 5, trend: 'stable', weight: 1 },
    { id: 'CAHPS-001', name: 'Getting Needed Care', category: 'Member Experience', currentRate: 86.4, targetRate: 88.0, nationalBenchmark: 84.2, starRating: 4, trend: 'up', weight: 2 }
]

const starCategories: StarCategory[] = [
    { name: 'Staying Healthy', rating: 4.0, measures: 12, weight: 0.15 },
    { name: 'Managing Chronic Conditions', rating: 3.5, measures: 15, weight: 0.25 },
    { name: 'Member Experience', rating: 4.5, measures: 8, weight: 0.20 },
    { name: 'Complaints & Access', rating: 4.0, measures: 6, weight: 0.15 },
    { name: 'Pharmacy', rating: 4.0, measures: 5, weight: 0.25 }
]

export function QualityMetrics() {
    const [measures] = useState<QualityMeasure[]>(qualityMeasures)
    const [categories] = useState<StarCategory[]>(starCategories)

    const overallStarRating = categories.reduce((sum, c) => sum + (c.rating * c.weight), 0)

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return <TrendingUp size={14} />
            case 'down': return <TrendingDown size={14} />
            case 'stable': return <Activity size={14} />
        }
    }

    const getStarDisplay = (rating: number) => {
        return (
            <div className="star-display">
                {[1, 2, 3, 4, 5].map(i => (
                    <Star
                        key={i}
                        size={14}
                        fill={i <= rating ? 'var(--apex-warning)' : 'transparent'}
                        stroke={i <= rating ? 'var(--apex-warning)' : 'var(--apex-steel)'}
                    />
                ))}
            </div>
        )
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Chronic Conditions': return <Heart size={14} />
            case 'Prevention': return <Stethoscope size={14} />
            case 'Pharmacy': return <Pill size={14} />
            default: return <Activity size={14} />
        }
    }

    return (
        <div className="quality-metrics-page">
            {/* Header */}
            <div className="quality__header">
                <div>
                    <h1 className="quality__title">Quality Metrics & Star Ratings</h1>
                    <p className="quality__subtitle">
                        HEDIS, CAHPS, and CMS Star Rating performance tracking
                    </p>
                </div>
                <div className="quality__actions">
                    <Button variant="secondary" icon={<Calendar size={16} />}>
                        Measurement Year
                    </Button>
                    <Button variant="secondary" icon={<Download size={16} />}>
                        Export Report
                    </Button>
                    <Button variant="primary" icon={<Target size={16} />}>
                        Run Analysis
                    </Button>
                </div>
            </div>

            {/* Overall Star Rating */}
            <GlassCard className="overall-star-rating">
                <div className="overall-star-rating__main">
                    <div className="overall-star-rating__badge">
                        <Award size={32} />
                    </div>
                    <div className="overall-star-rating__info">
                        <h2>Overall Star Rating</h2>
                        <div className="overall-star-rating__value">
                            <span className="rating-number">{overallStarRating.toFixed(1)}</span>
                            {getStarDisplay(Math.round(overallStarRating))}
                        </div>
                    </div>
                </div>
                <div className="overall-star-rating__categories">
                    {categories.map((category) => (
                        <div key={category.name} className="category-rating">
                            <div className="category-rating__name">{category.name}</div>
                            <div className="category-rating__stars">{getStarDisplay(Math.round(category.rating))}</div>
                            <div className="category-rating__value">{category.rating.toFixed(1)}</div>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Stats */}
            <div className="quality__stats">
                <MetricCard
                    title="Measures at Target"
                    value="42/56"
                    change={{ value: 5, type: 'increase' }}
                    icon={<CheckCircle2 size={20} />}
                />
                <MetricCard
                    title="Improvement Opportunities"
                    value="8"
                    icon={<Target size={20} />}
                />
                <MetricCard
                    title="4+ Star Measures"
                    value="38"
                    change={{ value: 12, type: 'increase' }}
                    icon={<Star size={20} />}
                />
                <MetricCard
                    title="Bonus Opportunity"
                    value="$2.4M"
                    change={{ value: 8.5, type: 'increase' }}
                    icon={<Award size={20} />}
                />
            </div>

            {/* Measures Table */}
            <GlassCard className="quality-measures">
                <div className="quality-measures__header">
                    <h3>Quality Measures Performance</h3>
                    <div className="quality-measures__filters">
                        <Button variant="ghost" size="sm" icon={<Filter size={14} />}>Filter</Button>
                    </div>
                </div>

                <table className="quality-measures__table">
                    <thead>
                        <tr>
                            <th>Measure</th>
                            <th>Category</th>
                            <th>Current</th>
                            <th>Target</th>
                            <th>Benchmark</th>
                            <th>Stars</th>
                            <th>Trend</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {measures.map((measure, index) => (
                            <motion.tr
                                key={measure.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <td className="measure-name">
                                    <span className="measure-id">{measure.id}</span>
                                    {measure.name}
                                </td>
                                <td>
                                    <div className="category-badge">
                                        {getCategoryIcon(measure.category)}
                                        {measure.category}
                                    </div>
                                </td>
                                <td className={measure.currentRate >= measure.targetRate ? 'success' : 'warning'}>
                                    {measure.currentRate.toFixed(1)}%
                                </td>
                                <td>{measure.targetRate.toFixed(1)}%</td>
                                <td className="benchmark">{measure.nationalBenchmark.toFixed(1)}%</td>
                                <td>{getStarDisplay(measure.starRating)}</td>
                                <td>
                                    <div className={`trend-badge ${measure.trend}`}>
                                        {getTrendIcon(measure.trend)}
                                    </div>
                                </td>
                                <td>
                                    <Button variant="ghost" size="sm" icon={<ChevronRight size={14} />} />
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>

            {/* Improvement Opportunities */}
            <div className="quality__opportunities">
                <GlassCard className="opportunity-card">
                    <div className="opportunity-card__header">
                        <AlertTriangle size={20} />
                        <h4>Priority Improvement Areas</h4>
                    </div>
                    <ul className="opportunity-list">
                        <li>
                            <span className="opportunity-measure">Diabetes Care - HbA1c Control</span>
                            <span className="opportunity-gap">1.8% below target</span>
                        </li>
                        <li>
                            <span className="opportunity-measure">Medication Adherence - Diabetes</span>
                            <span className="opportunity-gap">3.5% below target</span>
                        </li>
                        <li>
                            <span className="opportunity-measure">Breast Cancer Screening</span>
                            <span className="opportunity-gap">1.1% below target</span>
                        </li>
                    </ul>
                </GlassCard>
                <GlassCard className="opportunity-card success">
                    <div className="opportunity-card__header">
                        <CheckCircle2 size={20} />
                        <h4>Top Performers</h4>
                    </div>
                    <ul className="opportunity-list">
                        <li>
                            <span className="opportunity-measure">Adult BMI Assessment</span>
                            <span className="opportunity-gap success">5 Stars</span>
                        </li>
                        <li>
                            <span className="opportunity-measure">Controlling High Blood Pressure</span>
                            <span className="opportunity-gap success">4.2% above benchmark</span>
                        </li>
                        <li>
                            <span className="opportunity-measure">Breast Cancer Screening</span>
                            <span className="opportunity-gap success">4.7% above benchmark</span>
                        </li>
                    </ul>
                </GlassCard>
            </div>
        </div>
    )
}

export default QualityMetrics
