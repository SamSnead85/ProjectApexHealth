import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    Star,
    TrendingUp,
    Search,
    Filter,
    Award,
    Zap,
    DollarSign,
    CheckCircle2,
    Activity,
    Eye
} from 'lucide-react'
import './ProviderPerformance.css'

interface Provider {
    id: string
    name: string
    initials: string
    specialty: string
    rating: number
    patientsServed: number
    qualityScore: number
    costEfficiency: number
    category: 'excellent' | 'good' | 'average' | 'poor'
}

const providers: Provider[] = [
    { id: '1', name: 'Dr. Sarah Mitchell', initials: 'SM', specialty: 'Primary Care', rating: 4.9, patientsServed: 2480, qualityScore: 96, costEfficiency: 92, category: 'excellent' },
    { id: '2', name: 'Dr. James Chen', initials: 'JC', specialty: 'Cardiology', rating: 4.8, patientsServed: 1890, qualityScore: 94, costEfficiency: 88, category: 'excellent' },
    { id: '3', name: 'Dr. Maria Rodriguez', initials: 'MR', specialty: 'Endocrinology', rating: 4.7, patientsServed: 1620, qualityScore: 91, costEfficiency: 85, category: 'good' },
    { id: '4', name: 'Dr. Robert Thompson', initials: 'RT', specialty: 'Orthopedics', rating: 4.6, patientsServed: 1340, qualityScore: 89, costEfficiency: 78, category: 'good' },
    { id: '5', name: 'Dr. Emily Davis', initials: 'ED', specialty: 'Oncology', rating: 4.5, patientsServed: 980, qualityScore: 87, costEfficiency: 72, category: 'average' },
    { id: '6', name: 'Dr. Michael Park', initials: 'MP', specialty: 'Gastroenterology', rating: 4.3, patientsServed: 1150, qualityScore: 82, costEfficiency: 68, category: 'average' },
]

const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
        <Star
            key={i}
            size={14}
            className={`star ${i < Math.floor(rating) ? '' : 'empty'}`}
            fill={i < Math.floor(rating) ? '#fbbf24' : 'transparent'}
        />
    ))
}

export default function ProviderPerformance() {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredProviders = providers.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="provider-performance">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <Users size={28} />
                    Provider Performance
                </h1>
                <p className="page-subtitle">
                    Track and analyze provider quality metrics, efficiency scores, and patient outcomes
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="perf-stats">
                <motion.div
                    className="perf-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h4>Network Providers</h4>
                    <div className="value">1,247</div>
                    <div className="subtitle">Active in-network</div>
                </motion.div>

                <motion.div
                    className="perf-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h4>Avg Quality Score</h4>
                    <div className="value">89.4</div>
                    <div className="subtitle">+3.2 vs benchmark</div>
                </motion.div>

                <motion.div
                    className="perf-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h4>Patient Satisfaction</h4>
                    <div className="value">4.6★</div>
                    <div className="subtitle">Based on 48K reviews</div>
                </motion.div>

                <motion.div
                    className="perf-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <h4>Cost Efficiency</h4>
                    <div className="value">82%</div>
                    <div className="subtitle">Below regional avg</div>
                </motion.div>
            </div>

            {/* Provider Table */}
            <motion.div
                className="provider-table-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Award size={20} />
                        Provider Scorecard
                    </span>
                    <div className="search-filter">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search providers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="filter-btn">
                            <Filter size={16} />
                            Filter
                        </button>
                    </div>
                </h2>
                <table className="provider-table">
                    <thead>
                        <tr>
                            <th>Provider</th>
                            <th>Rating</th>
                            <th>Patients Served</th>
                            <th>Quality Score</th>
                            <th>Cost Efficiency</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProviders.map((provider, index) => (
                            <motion.tr
                                key={provider.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.35 + index * 0.05 }}
                            >
                                <td>
                                    <div className="provider-info">
                                        <div className="provider-avatar">{provider.initials}</div>
                                        <div className="provider-details">
                                            <h4>{provider.name}</h4>
                                            <span>{provider.specialty}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="rating-stars">
                                        {renderStars(provider.rating)}
                                        <span style={{ marginLeft: '0.5rem', fontSize: '0.813rem' }}>{provider.rating}</span>
                                    </div>
                                </td>
                                <td>{provider.patientsServed.toLocaleString()}</td>
                                <td>{provider.qualityScore}%</td>
                                <td>{provider.costEfficiency}%</td>
                                <td>
                                    <span className={`performance-score ${provider.category}`}>
                                        {provider.category === 'excellent' && <CheckCircle2 size={12} />}
                                        {provider.category.charAt(0).toUpperCase() + provider.category.slice(1)}
                                    </span>
                                </td>
                                <td>
                                    <button className="view-btn">
                                        <Eye size={14} style={{ marginRight: '0.35rem' }} />
                                        View
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Metrics Cards */}
            <div className="metrics-grid">
                <motion.div
                    className="metric-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3>
                        <div className="metric-icon efficiency">
                            <Zap size={16} />
                        </div>
                        Efficiency Index
                    </h3>
                    <div className="metric-value">94.2%</div>
                    <div className="metric-label">Network utilization efficiency</div>
                </motion.div>

                <motion.div
                    className="metric-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                >
                    <h3>
                        <div className="metric-icon quality">
                            <Activity size={16} />
                        </div>
                        Quality Ranking
                    </h3>
                    <div className="metric-value">Top 15%</div>
                    <div className="metric-label">Regional performance benchmark</div>
                </motion.div>

                <motion.div
                    className="metric-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3>
                        <div className="metric-icon cost">
                            <DollarSign size={16} />
                        </div>
                        Cost Savings
                    </h3>
                    <div className="metric-value">$2.4M</div>
                    <div className="metric-label">Annual savings vs benchmark</div>
                </motion.div>
            </div>
        </div>
    )
}
