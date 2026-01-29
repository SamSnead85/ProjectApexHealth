import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Clock,
    DollarSign,
    Building2,
    TrendingUp,
    TrendingDown,
    Filter,
    Download,
    ChevronDown,
    AlertTriangle
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './AgingReports.css'

interface AgingBucket {
    range: string
    amount: number
    claims: number
    percentage: number
}

interface PayerAging {
    payerName: string
    payerId: string
    total: number
    buckets: { [key: string]: number }
}

const agingBuckets: AgingBucket[] = [
    { range: '0-30', amount: 245000, claims: 156, percentage: 35 },
    { range: '31-60', amount: 175000, claims: 98, percentage: 25 },
    { range: '61-90', amount: 140000, claims: 67, percentage: 20 },
    { range: '91-120', amount: 84000, claims: 42, percentage: 12 },
    { range: '120+', amount: 56000, claims: 31, percentage: 8 }
]

const payerAgings: PayerAging[] = [
    { payerName: 'Aetna', payerId: '60054', total: 125000, buckets: { '0-30': 45000, '31-60': 35000, '61-90': 25000, '91-120': 12000, '120+': 8000 } },
    { payerName: 'BCBS', payerId: '00060', total: 98000, buckets: { '0-30': 40000, '31-60': 28000, '61-90': 18000, '91-120': 8000, '120+': 4000 } },
    { payerName: 'UnitedHealthcare', payerId: '87726', total: 156000, buckets: { '0-30': 60000, '31-60': 42000, '61-90': 32000, '91-120': 15000, '120+': 7000 } },
    { payerName: 'Cigna', payerId: '62308', total: 78000, buckets: { '0-30': 32000, '31-60': 22000, '61-90': 14000, '91-120': 6000, '120+': 4000 } },
    { payerName: 'Medicare', payerId: '00301', total: 143000, buckets: { '0-30': 68000, '31-60': 48000, '61-90': 21000, '91-120': 4000, '120+': 2000 } }
]

export function AgingReports() {
    const [viewType, setViewType] = useState<'summary' | 'payer'>('summary')

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)

    const totalAR = agingBuckets.reduce((acc, b) => acc + b.amount, 0)

    return (
        <div className="aging-reports-page">
            {/* Header */}
            <div className="aging__header">
                <div>
                    <h1 className="aging__title">AR Aging Reports</h1>
                    <p className="aging__subtitle">
                        Accounts receivable aging by payer and provider
                    </p>
                </div>
                <div className="aging__actions">
                    <div className="view-toggle">
                        <button className={viewType === 'summary' ? 'active' : ''} onClick={() => setViewType('summary')}>Summary</button>
                        <button className={viewType === 'payer' ? 'active' : ''} onClick={() => setViewType('payer')}>By Payer</button>
                    </div>
                    <Button variant="secondary" icon={<Download size={16} />}>Export</Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="aging__summary">
                <GlassCard className="summary-stat total">
                    <DollarSign size={24} />
                    <div>
                        <span className="stat-value">{formatCurrency(totalAR)}</span>
                        <span className="stat-label">Total Outstanding AR</span>
                    </div>
                </GlassCard>
                <GlassCard className="summary-stat">
                    <Clock size={24} />
                    <div>
                        <span className="stat-value">42</span>
                        <span className="stat-label">Avg Days in AR</span>
                    </div>
                </GlassCard>
                <GlassCard className="summary-stat warning">
                    <AlertTriangle size={24} />
                    <div>
                        <span className="stat-value">{formatCurrency(agingBuckets[4].amount)}</span>
                        <span className="stat-label">Over 120 Days</span>
                    </div>
                </GlassCard>
            </div>

            {/* Aging Buckets Chart */}
            <GlassCard className="aging-chart">
                <h3>AR Aging Distribution</h3>
                <div className="buckets-container">
                    {agingBuckets.map((bucket, index) => (
                        <motion.div
                            key={bucket.range}
                            className="bucket"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="bucket-bar-container">
                                <div
                                    className="bucket-bar"
                                    style={{ height: `${bucket.percentage * 2}%` }}
                                />
                            </div>
                            <div className="bucket-info">
                                <span className="bucket-range">{bucket.range} days</span>
                                <span className="bucket-amount">{formatCurrency(bucket.amount)}</span>
                                <span className="bucket-claims">{bucket.claims} claims</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </GlassCard>

            {/* Payer Breakdown */}
            <GlassCard className="payer-breakdown">
                <div className="breakdown-header">
                    <h3>Aging by Payer</h3>
                    <Button variant="ghost" size="sm" icon={<Filter size={14} />}>Filter</Button>
                </div>
                <table className="aging-table">
                    <thead>
                        <tr>
                            <th>Payer</th>
                            <th>0-30</th>
                            <th>31-60</th>
                            <th>61-90</th>
                            <th>91-120</th>
                            <th>120+</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payerAgings.map((payer, index) => (
                            <motion.tr
                                key={payer.payerId}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <td>
                                    <div className="payer-cell">
                                        <Building2 size={14} />
                                        <span>{payer.payerName}</span>
                                    </div>
                                </td>
                                <td>{formatCurrency(payer.buckets['0-30'])}</td>
                                <td>{formatCurrency(payer.buckets['31-60'])}</td>
                                <td>{formatCurrency(payer.buckets['61-90'])}</td>
                                <td className="warning">{formatCurrency(payer.buckets['91-120'])}</td>
                                <td className="critical">{formatCurrency(payer.buckets['120+'])}</td>
                                <td className="total-cell">{formatCurrency(payer.total)}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    )
}

export default AgingReports
