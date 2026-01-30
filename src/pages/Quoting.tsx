import { useState } from 'react'
import { useNavigation } from '../context/NavigationContext'
import { motion } from 'framer-motion'
import {
    Calculator,
    Upload,
    FileSpreadsheet,
    Building2,
    Users,
    ChevronRight,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    TrendingUp,
    Target,
    DollarSign,
    ArrowUpRight
} from 'lucide-react'
import { GlassCard, Button, Badge } from '../components/common'
import './Quoting.css'

// Mock quotes
const recentQuotes = [
    { id: 'QT-4821', company: 'Tech Innovators LLC', employees: 125, status: 'pending', created: '2 hours ago', value: '$485K' },
    { id: 'QT-4820', company: 'Summit Corp', employees: 340, status: 'sent', created: '1 day ago', value: '$1.2M' },
    { id: 'QT-4819', company: 'Valley Systems', employees: 89, status: 'accepted', created: '3 days ago', value: '$320K' },
    { id: 'QT-4818', company: 'Pacific Industries', employees: 210, status: 'expired', created: '2 weeks ago', value: '$780K' },
    { id: 'QT-4817', company: 'Coastal Manufacturing', employees: 175, status: 'accepted', created: '3 weeks ago', value: '$625K' },
]

const carriers = [
    { name: 'Blue Shield', logo: '🔵', plans: 12, status: 'active' },
    { name: 'Aetna', logo: '❤️', plans: 8, status: 'active' },
    { name: 'UnitedHealthcare', logo: '🟠', plans: 15, status: 'active' },
    { name: 'Cigna', logo: '🟢', plans: 10, status: 'active' },
    { name: 'Kaiser Permanente', logo: '🔷', plans: 6, status: 'active' },
]

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'accepted': return 'success'
        case 'pending': return 'warning'
        case 'sent': return 'info'
        case 'expired': return 'error'
        default: return 'default'
    }
}

export function Quoting() {
    const { navigate } = useNavigation()

    return (
        <div className="quoting-engine">
            {/* Header */}
            <motion.header
                className="qe__header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="qe__header-left">
                    <div className="qe__icon-container">
                        <Calculator size={28} />
                        <div className="qe__icon-pulse" />
                    </div>
                    <div>
                        <h1 className="qe__title">Quote Engine</h1>
                        <p className="qe__subtitle">Generate multi-carrier quotes and proposals</p>
                    </div>
                </div>
                <Button variant="primary" size="sm">
                    <Plus size={16} />
                    New Quote
                </Button>
            </motion.header>

            {/* Quick Actions */}
            <div className="qe__actions-grid">
                <motion.div
                    className="qe__action-card qe__action-card--upload"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="qe__action-icon">
                        <Upload size={28} />
                    </div>
                    <div className="qe__action-text">
                        <div className="qe__action-title">Upload Census</div>
                        <div className="qe__action-desc">Import employee data for accurate quotes</div>
                    </div>
                </motion.div>

                <motion.div
                    className="qe__action-card qe__action-card--quick"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="qe__action-icon">
                        <Calculator size={28} />
                    </div>
                    <div className="qe__action-text">
                        <div className="qe__action-title">Quick Quote</div>
                        <div className="qe__action-desc">Estimate without census data</div>
                    </div>
                </motion.div>

                <motion.div
                    className="qe__action-card qe__action-card--compare"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="qe__action-icon">
                        <FileSpreadsheet size={28} />
                    </div>
                    <div className="qe__action-text">
                        <div className="qe__action-title">Compare Plans</div>
                        <div className="qe__action-desc">Side-by-side plan comparison</div>
                    </div>
                </motion.div>
            </div>

            {/* Main Grid */}
            <div className="qe__grid">
                {/* Recent Quotes */}
                <motion.div
                    className="qe__section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="qe__section-header">
                        <h2 className="qe__section-title">Recent Quotes</h2>
                        <div className="qe__section-actions">
                            <Button variant="ghost" size="sm"><Search size={16} /></Button>
                            <Button variant="ghost" size="sm"><Filter size={16} /></Button>
                        </div>
                    </div>
                    <div>
                        {recentQuotes.map((quote, i) => (
                            <motion.div
                                key={quote.id}
                                className="qe__quote-row"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 + i * 0.05 }}
                            >
                                <div className="qe__quote-info">
                                    <div className="qe__quote-icon">
                                        <Building2 size={18} />
                                    </div>
                                    <div className="qe__quote-details">
                                        <span className="qe__quote-company">{quote.company}</span>
                                        <span className="qe__quote-meta">{quote.id} • {quote.employees} employees • {quote.value}</span>
                                    </div>
                                </div>
                                <div className="qe__quote-right">
                                    <span className="qe__quote-date">{quote.created}</span>
                                    <Badge variant={getStatusVariant(quote.status)}>{quote.status}</Badge>
                                    <ChevronRight size={16} style={{ color: 'var(--apex-steel)' }} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Available Carriers */}
                <motion.div
                    className="qe__section"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="qe__section-header">
                        <h2 className="qe__section-title">Available Carriers</h2>
                    </div>
                    <div>
                        {carriers.map((carrier, i) => (
                            <motion.div
                                key={carrier.name}
                                className="qe__carrier-row"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.45 + i * 0.05 }}
                            >
                                <span className="qe__carrier-logo">{carrier.logo}</span>
                                <div className="qe__carrier-info">
                                    <div className="qe__carrier-name">{carrier.name}</div>
                                    <div className="qe__carrier-plans">{carrier.plans} plans available</div>
                                </div>
                                <CheckCircle2 size={16} className="qe__carrier-status" />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Quoting
