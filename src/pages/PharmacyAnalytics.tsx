import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Pill,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    AlertTriangle,
    ChevronRight,
    Download,
    RefreshCw,
    Filter,
    Search,
    BarChart3,
    PieChart,
    Package,
    Building2,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Info,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Target
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './PharmacyAnalytics.css'

// Types
interface DrugSpend {
    name: string
    therapeuticClass: string
    spend: number
    claims: number
    members: number
    trend: number
    tier: 'Generic' | 'Preferred' | 'Non-Preferred' | 'Specialty'
    rebateEligible: boolean
}

interface TherapeuticClass {
    name: string
    spend: number
    percentage: number
    trend: number
    color: string
}

interface RebateAnalysis {
    category: string
    grossSpend: number
    rebateAmount: number
    netSpend: number
    rebateRate: number
}

interface PBMMetric {
    label: string
    value: string | number
    change: number
    trend: 'up' | 'down' | 'neutral'
    icon: React.ElementType
    color: string
}

// Mock Data
const pbmMetrics: PBMMetric[] = [
    { label: 'Total Rx Spend YTD', value: 720000, change: 23.5, trend: 'up', icon: DollarSign, color: '#EF4444' },
    { label: 'Scripts Filled', value: 4825, change: 8.2, trend: 'up', icon: Pill, color: '#3B82F6' },
    { label: 'Generic Fill Rate', value: '87%', change: 2.1, trend: 'up', icon: Target, color: '#10B981' },
    { label: 'Specialty % of Spend', value: '51%', change: 8.5, trend: 'up', icon: Zap, color: '#8B5CF6' },
]

const topDrugs: DrugSpend[] = [
    { name: 'Humira', therapeuticClass: 'Immunology', spend: 142000, claims: 24, members: 8, trend: 5.2, tier: 'Specialty', rebateEligible: true },
    { name: 'Ozempic', therapeuticClass: 'Diabetes', spend: 98000, claims: 156, members: 52, trend: 48.5, tier: 'Preferred', rebateEligible: true },
    { name: 'Stelara', therapeuticClass: 'Immunology', spend: 87000, claims: 18, members: 6, trend: 12.3, tier: 'Specialty', rebateEligible: true },
    { name: 'Eliquis', therapeuticClass: 'Cardiovascular', spend: 45000, claims: 312, members: 78, trend: 3.1, tier: 'Preferred', rebateEligible: true },
    { name: 'Trulicity', therapeuticClass: 'Diabetes', spend: 42000, claims: 98, members: 32, trend: 28.4, tier: 'Preferred', rebateEligible: true },
    { name: 'Jardiance', therapeuticClass: 'Diabetes', spend: 38000, claims: 145, members: 48, trend: 15.2, tier: 'Preferred', rebateEligible: true },
    { name: 'Atorvastatin', therapeuticClass: 'Cardiovascular', spend: 8500, claims: 892, members: 223, trend: -2.5, tier: 'Generic', rebateEligible: false },
    { name: 'Metformin', therapeuticClass: 'Diabetes', spend: 6200, claims: 1245, members: 312, trend: -1.8, tier: 'Generic', rebateEligible: false },
]

const therapeuticClasses: TherapeuticClass[] = [
    { name: 'Specialty', spend: 320000, percentage: 44, trend: 18.5, color: '#8B5CF6' },
    { name: 'Diabetes', spend: 145000, percentage: 20, trend: 32.4, color: '#F59E0B' },
    { name: 'Cardiovascular', spend: 87000, percentage: 12, trend: 1.2, color: '#EF4444' },
    { name: 'Mental Health', spend: 65000, percentage: 9, trend: 12.8, color: '#3B82F6' },
    { name: 'Pain Management', spend: 42000, percentage: 6, trend: -18.2, color: '#10B981' },
    { name: 'Other', spend: 61000, percentage: 9, trend: 2.1, color: '#6B7280' },
]

const rebateAnalysis: RebateAnalysis[] = [
    { category: 'Brand Preferred', grossSpend: 285000, rebateAmount: 68400, netSpend: 216600, rebateRate: 24 },
    { category: 'Specialty', grossSpend: 320000, rebateAmount: 32000, netSpend: 288000, rebateRate: 10 },
    { category: 'Brand Non-Preferred', grossSpend: 45000, rebateAmount: 13500, netSpend: 31500, rebateRate: 30 },
    { category: 'Generic', grossSpend: 70000, rebateAmount: 0, netSpend: 70000, rebateRate: 0 },
]

const biosimilarOpportunities = [
    { brand: 'Humira', biosimilar: 'Hadlima', currentSpend: 142000, potentialSavings: 42600, adoptionRate: 0 },
    { brand: 'Neulasta', biosimilar: 'Udenyca', currentSpend: 28000, potentialSavings: 8400, adoptionRate: 15 },
    { brand: 'Remicade', biosimilar: 'Inflectra', currentSpend: 45000, potentialSavings: 13500, adoptionRate: 8 },
]

// Utility functions
const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
}

// Components
const MetricCard = ({ metric, index }: { metric: PBMMetric; index: number }) => {
    const Icon = metric.icon
    const formattedValue = typeof metric.value === 'number' ? formatCurrency(metric.value) : metric.value

    return (
        <motion.div
            className="pbm-metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <div className="pbm-metric-card__header">
                <div className="pbm-metric-card__icon" style={{ background: `${metric.color}15`, color: metric.color }}>
                    <Icon size={20} />
                </div>
                <div className={`pbm-metric-card__trend pbm-metric-card__trend--${metric.trend}`}>
                    {metric.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
                </div>
            </div>
            <div className="pbm-metric-card__value">{formattedValue}</div>
            <div className="pbm-metric-card__label">{metric.label}</div>
        </motion.div>
    )
}

const DrugSpendTable = ({ drugs }: { drugs: DrugSpend[] }) => (
    <div className="pbm-drug-table">
        <div className="pbm-drug-table__header">
            <span>Drug Name</span>
            <span>Class</span>
            <span>Spend</span>
            <span>Claims</span>
            <span>Tier</span>
            <span>Trend</span>
        </div>
        {drugs.map((drug, index) => (
            <motion.div
                key={drug.name}
                className="pbm-drug-table__row"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
            >
                <span className="pbm-drug-table__name">
                    {drug.name}
                    {drug.rebateEligible && <Badge variant="teal" size="sm">Rebate</Badge>}
                </span>
                <span className="pbm-drug-table__class">{drug.therapeuticClass}</span>
                <span className="pbm-drug-table__spend">{formatCurrency(drug.spend)}</span>
                <span className="pbm-drug-table__claims">{drug.claims.toLocaleString()}</span>
                <span>
                    <Badge
                        variant={drug.tier === 'Generic' ? 'success' : drug.tier === 'Specialty' ? 'critical' : 'info'}
                        size="sm"
                    >
                        {drug.tier}
                    </Badge>
                </span>
                <span className={`pbm-drug-table__trend ${drug.trend >= 0 ? 'up' : 'down'}`}>
                    {drug.trend >= 0 ? '+' : ''}{drug.trend}%
                </span>
            </motion.div>
        ))}
    </div>
)

const TherapeuticDonut = ({ classes }: { classes: TherapeuticClass[] }) => {
    const total = classes.reduce((sum, c) => sum + c.spend, 0)

    return (
        <div className="pbm-donut">
            <div className="pbm-donut__chart">
                <svg viewBox="0 0 100 100">
                    {(() => {
                        let currentAngle = 0
                        return classes.map((cls, index) => {
                            const angle = (cls.percentage / 100) * 360
                            const startAngle = currentAngle
                            currentAngle += angle

                            const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180)
                            const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180)
                            const x2 = 50 + 40 * Math.cos((startAngle + angle - 90) * Math.PI / 180)
                            const y2 = 50 + 40 * Math.sin((startAngle + angle - 90) * Math.PI / 180)
                            const largeArc = angle > 180 ? 1 : 0

                            return (
                                <path
                                    key={cls.name}
                                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill={cls.color}
                                    stroke="var(--bg-card)"
                                    strokeWidth="1"
                                />
                            )
                        })
                    })()}
                    <circle cx="50" cy="50" r="25" fill="var(--bg-card)" />
                </svg>
                <div className="pbm-donut__center">
                    <span className="pbm-donut__total">{formatCurrency(total)}</span>
                    <span className="pbm-donut__label">Total Spend</span>
                </div>
            </div>
            <div className="pbm-donut__legend">
                {classes.map((cls) => (
                    <div key={cls.name} className="pbm-donut__legend-item">
                        <span className="pbm-donut__legend-color" style={{ background: cls.color }} />
                        <span className="pbm-donut__legend-name">{cls.name}</span>
                        <span className="pbm-donut__legend-value">{cls.percentage}%</span>
                        <span className={`pbm-donut__legend-trend ${cls.trend >= 0 ? 'up' : 'down'}`}>
                            {cls.trend >= 0 ? '+' : ''}{cls.trend}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

const RebateWaterfall = ({ data }: { data: RebateAnalysis[] }) => {
    const totalGross = data.reduce((sum, d) => sum + d.grossSpend, 0)
    const totalRebate = data.reduce((sum, d) => sum + d.rebateAmount, 0)
    const totalNet = data.reduce((sum, d) => sum + d.netSpend, 0)

    return (
        <div className="pbm-rebate">
            <div className="pbm-rebate__summary">
                <div className="pbm-rebate__summary-item">
                    <span>Gross Spend</span>
                    <strong>{formatCurrency(totalGross)}</strong>
                </div>
                <div className="pbm-rebate__summary-arrow">→</div>
                <div className="pbm-rebate__summary-item pbm-rebate__summary-item--rebate">
                    <span>Rebates</span>
                    <strong>-{formatCurrency(totalRebate)}</strong>
                </div>
                <div className="pbm-rebate__summary-arrow">→</div>
                <div className="pbm-rebate__summary-item pbm-rebate__summary-item--net">
                    <span>Net Spend</span>
                    <strong>{formatCurrency(totalNet)}</strong>
                </div>
            </div>
            <div className="pbm-rebate__breakdown">
                {data.map((item, index) => (
                    <motion.div
                        key={item.category}
                        className="pbm-rebate__row"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <span className="pbm-rebate__category">{item.category}</span>
                        <span className="pbm-rebate__gross">{formatCurrency(item.grossSpend)}</span>
                        <span className="pbm-rebate__amount">-{formatCurrency(item.rebateAmount)}</span>
                        <span className="pbm-rebate__net">{formatCurrency(item.netSpend)}</span>
                        <span className="pbm-rebate__rate">{item.rebateRate}%</span>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

const BiosimilarOpportunities = () => (
    <div className="pbm-biosimilar">
        <div className="pbm-biosimilar__header">
            <Zap size={18} />
            <span>Potential Annual Savings: <strong>{formatCurrency(biosimilarOpportunities.reduce((sum, b) => sum + b.potentialSavings, 0))}</strong></span>
        </div>
        <div className="pbm-biosimilar__list">
            {biosimilarOpportunities.map((opp, index) => (
                <motion.div
                    key={opp.brand}
                    className="pbm-biosimilar__item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <div className="pbm-biosimilar__brands">
                        <span className="pbm-biosimilar__brand">{opp.brand}</span>
                        <ChevronRight size={14} />
                        <span className="pbm-biosimilar__alt">{opp.biosimilar}</span>
                    </div>
                    <div className="pbm-biosimilar__metrics">
                        <span>Current: {formatCurrency(opp.currentSpend)}</span>
                        <span className="pbm-biosimilar__savings">Save: {formatCurrency(opp.potentialSavings)}</span>
                        <span>Adoption: {opp.adoptionRate}%</span>
                    </div>
                    <Button variant="ghost" size="sm">Review</Button>
                </motion.div>
            ))}
        </div>
    </div>
)

export function PharmacyAnalytics() {
    const [selectedPeriod, setSelectedPeriod] = useState('ytd')
    const [searchTerm, setSearchTerm] = useState('')

    const filteredDrugs = useMemo(() => {
        if (!searchTerm) return topDrugs
        return topDrugs.filter(d =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.therapeuticClass.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [searchTerm])

    return (
        <div className="pbm-page">
            {/* Header */}
            <div className="pbm-page__header">
                <div className="pbm-page__header-content">
                    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        Pharmacy & PBM Analytics
                    </motion.h1>
                    <p>Drug Spend Analysis • Rebate Tracking • Formulary Optimization</p>
                </div>
                <div className="pbm-page__header-actions">
                    <Button variant="ghost" icon={<RefreshCw size={16} />}>Refresh</Button>
                    <Button variant="secondary" icon={<Download size={16} />}>Export</Button>
                </div>
            </div>

            {/* Metrics */}
            <section className="pbm-page__metrics">
                {pbmMetrics.map((metric, index) => (
                    <MetricCard key={metric.label} metric={metric} index={index} />
                ))}
            </section>

            {/* Main Grid */}
            <div className="pbm-page__grid">
                {/* Top Drugs */}
                <GlassCard className="pbm-page__card pbm-page__card--drugs">
                    <div className="pbm-page__card-header">
                        <h3><Pill size={18} /> Top Drugs by Spend</h3>
                        <div className="pbm-page__search">
                            <Search size={14} />
                            <input
                                type="text"
                                placeholder="Search drugs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <DrugSpendTable drugs={filteredDrugs} />
                </GlassCard>

                {/* Therapeutic Class Distribution */}
                <GlassCard className="pbm-page__card pbm-page__card--classes">
                    <div className="pbm-page__card-header">
                        <h3><PieChart size={18} /> Spend by Therapeutic Class</h3>
                    </div>
                    <TherapeuticDonut classes={therapeuticClasses} />
                </GlassCard>

                {/* Rebate Analysis */}
                <GlassCard className="pbm-page__card pbm-page__card--rebates">
                    <div className="pbm-page__card-header">
                        <h3><DollarSign size={18} /> Rebate Analysis</h3>
                        <Badge variant="success" size="sm">
                            {((rebateAnalysis.reduce((s, r) => s + r.rebateAmount, 0) / rebateAnalysis.reduce((s, r) => s + r.grossSpend, 0)) * 100).toFixed(1)}% Effective Rate
                        </Badge>
                    </div>
                    <RebateWaterfall data={rebateAnalysis} />
                </GlassCard>

                {/* Biosimilar Opportunities */}
                <GlassCard className="pbm-page__card pbm-page__card--biosimilar">
                    <div className="pbm-page__card-header">
                        <h3><Target size={18} /> Biosimilar Opportunities</h3>
                        <Badge variant="warning" size="sm">3 Available</Badge>
                    </div>
                    <BiosimilarOpportunities />
                </GlassCard>
            </div>

            {/* Insights */}
            <GlassCard className="pbm-page__insights">
                <div className="pbm-page__insights-header">
                    <Info size={18} />
                    <h4>PBM Optimization Insights</h4>
                </div>
                <ul className="pbm-page__insights-list">
                    <li><AlertTriangle size={14} className="warning" /> GLP-1 medications (Ozempic, Trulicity) driving 65% of diabetes category growth</li>
                    <li><Target size={14} className="success" /> Biosimilar conversion opportunity could save $64K annually (30% of current specialty spend)</li>
                    <li><CheckCircle2 size={14} className="success" /> Generic fill rate at 87% exceeds industry benchmark of 85%</li>
                    <li><Info size={14} className="info" /> Specialty accumulators program could reduce member out-of-pocket by $18K/year</li>
                </ul>
            </GlassCard>
        </div>
    )
}

export default PharmacyAnalytics
