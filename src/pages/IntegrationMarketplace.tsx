import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Cloud, Database, FileText, CreditCard, Shield,
    MessageSquare, Users, BarChart3, Download, CheckCircle2,
    Star, ArrowRight, Zap, Clock, Settings, XCircle, Wifi,
    WifiOff, AlertTriangle, Eye, Plug, RefreshCw, Key,
    ExternalLink, Activity, Pill, TestTube, Building2,
    Fingerprint, DollarSign, X
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './IntegrationMarketplace.css'

// ============================================================================
// INTEGRATION MARKETPLACE - Connectors for EHRs, Clearinghouses, Labs
// Browse, connect, and manage healthcare ecosystem integrations
// ============================================================================

type ConnectorStatus = 'connected' | 'available' | 'coming_soon'
type Category = 'all' | 'ehr' | 'clearinghouse' | 'laboratory' | 'pharmacy' | 'identity' | 'payment'

interface Connector {
    id: string
    name: string
    vendor: string
    description: string
    category: Category
    status: ConnectorStatus
    version: string
    logo: typeof Cloud
    logoColor: string
    features: string[]
    healthStatus?: 'healthy' | 'degraded' | 'down'
    lastSync?: string
    apiCalls?: string
}

interface ActivityEvent {
    id: string
    connector: string
    event: string
    timestamp: string
    status: 'success' | 'error' | 'warning'
}

const categories: { id: Category; name: string; icon: typeof Cloud; count: number }[] = [
    { id: 'all', name: 'All', icon: Plug, count: 10 },
    { id: 'ehr', name: 'EHR', icon: FileText, count: 3 },
    { id: 'clearinghouse', name: 'Clearinghouse', icon: CreditCard, count: 3 },
    { id: 'laboratory', name: 'Laboratory', icon: TestTube, count: 2 },
    { id: 'pharmacy', name: 'Pharmacy', icon: Pill, count: 1 },
    { id: 'identity', name: 'Identity', icon: Fingerprint, count: 1 },
    { id: 'payment', name: 'Payment', icon: DollarSign, count: 1 },
]

const connectors: Connector[] = [
    {
        id: 'epic', name: 'Epic Systems', vendor: 'Epic Systems Corporation',
        description: 'Comprehensive EHR integration with FHIR R4, MyChart connectivity, real-time patient data sync.',
        category: 'ehr', status: 'connected', version: '3.2.1', logo: Cloud, logoColor: '#14b8a6',
        features: ['FHIR R4', 'HL7v2', 'Real-time Sync', 'MyChart'],
        healthStatus: 'healthy', lastSync: '2 min ago', apiCalls: '12.4K/day'
    },
    {
        id: 'cerner', name: 'Oracle Cerner', vendor: 'Oracle Health',
        description: 'Oracle Cerner integration for clinical workflows, decision support, and population health management.',
        category: 'ehr', status: 'connected', version: '2.8.0', logo: Database, logoColor: '#3b82f6',
        features: ['FHIR R4', 'CDS Hooks', 'Bulk Data', 'Analytics'],
        healthStatus: 'healthy', lastSync: '5 min ago', apiCalls: '8.7K/day'
    },
    {
        id: 'athena', name: 'Athenahealth', vendor: 'Athenahealth',
        description: 'Cloud-based EHR integration for scheduling, clinical data, and revenue cycle management.',
        category: 'ehr', status: 'available', version: '2.1.0', logo: Cloud, logoColor: '#8b5cf6',
        features: ['REST API', 'HL7v2', 'Scheduling', 'RCM'],
    },
    {
        id: 'change', name: 'Change Healthcare', vendor: 'Change Healthcare (Optum)',
        description: 'Claims processing, real-time eligibility, ERA/EFT, and revenue cycle optimization.',
        category: 'clearinghouse', status: 'connected', version: '4.1.0', logo: CreditCard, logoColor: '#f59e0b',
        features: ['EDI 837/835', 'Real-time Elig.', 'ERA/EFT', 'Analytics'],
        healthStatus: 'degraded', lastSync: '15 min ago', apiCalls: '22.1K/day'
    },
    {
        id: 'availity', name: 'Availity', vendor: 'Availity LLC',
        description: 'Multi-payer connectivity for claims, eligibility, prior auth, and remittance.',
        category: 'clearinghouse', status: 'connected', version: '3.0.2', logo: Shield, logoColor: '#06b6d4',
        features: ['Multi-payer', 'Prior Auth', 'Eligibility', 'Remittance'],
        healthStatus: 'healthy', lastSync: '1 min ago', apiCalls: '18.5K/day'
    },
    {
        id: 'trizetto', name: 'TriZetto', vendor: 'Cognizant TriZetto',
        description: 'Healthcare IT solutions for claims adjudication, enrollment, and payer operations.',
        category: 'clearinghouse', status: 'available', version: '1.5.0', logo: Settings, logoColor: '#64748b',
        features: ['QNXT', 'Facets', 'Claims Adj.', 'Enrollment'],
    },
    {
        id: 'quest', name: 'Quest Diagnostics', vendor: 'Quest Diagnostics',
        description: 'Lab results integration, order management, and diagnostic data exchange.',
        category: 'laboratory', status: 'connected', version: '2.2.0', logo: TestTube, logoColor: '#22c55e',
        features: ['HL7 ORU', 'Lab Orders', 'Results', 'Genomics'],
        healthStatus: 'healthy', lastSync: '3 min ago', apiCalls: '5.2K/day'
    },
    {
        id: 'labcorp', name: 'LabCorp', vendor: 'Laboratory Corporation of America',
        description: 'Clinical laboratory and drug testing results integration.',
        category: 'laboratory', status: 'available', version: '1.8.0', logo: TestTube, logoColor: '#0ea5e9',
        features: ['HL7 ORU', 'Lab Orders', 'Results', 'Pathology'],
    },
    {
        id: 'surescripts', name: 'Surescripts', vendor: 'Surescripts',
        description: 'E-prescribing, medication history, formulary, and pharmacy benefit data exchange.',
        category: 'pharmacy', status: 'coming_soon', version: '—', logo: Pill, logoColor: '#ec4899',
        features: ['NCPDP', 'E-Prescribe', 'Med History', 'Formulary'],
    },
    {
        id: 'stripe', name: 'Stripe Healthcare', vendor: 'Stripe Inc.',
        description: 'Payment processing for member premiums, copays, and provider reimbursements.',
        category: 'payment', status: 'connected', version: '2.0.0', logo: DollarSign, logoColor: '#7c3aed',
        features: ['ACH', 'Card Processing', 'Invoicing', 'Reconciliation'],
        healthStatus: 'healthy', lastSync: 'Real-time', apiCalls: '3.4K/day'
    },
]

const activityLog: ActivityEvent[] = [
    { id: 'e1', connector: 'Epic Systems', event: 'Patient sync completed - 234 records updated', timestamp: '2 min ago', status: 'success' },
    { id: 'e2', connector: 'Change Healthcare', event: 'Batch claims submission - 89 claims sent (3 rejected)', timestamp: '8 min ago', status: 'warning' },
    { id: 'e3', connector: 'Availity', event: 'Real-time eligibility check - 1,247 requests processed', timestamp: '12 min ago', status: 'success' },
    { id: 'e4', connector: 'Quest Diagnostics', event: 'Lab results received - 56 new results', timestamp: '15 min ago', status: 'success' },
    { id: 'e5', connector: 'Change Healthcare', event: 'Connection timeout - retrying in 30s', timestamp: '18 min ago', status: 'error' },
    { id: 'e6', connector: 'Stripe Healthcare', event: 'Premium batch processed - $127,450 collected', timestamp: '22 min ago', status: 'success' },
    { id: 'e7', connector: 'Oracle Cerner', event: 'CDS Hooks trigger - 12 alerts generated', timestamp: '30 min ago', status: 'success' },
]

export default function IntegrationMarketplace() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<Category>('all')
    const [showWizard, setShowWizard] = useState(false)
    const [wizardConnector, setWizardConnector] = useState<Connector | null>(null)
    const [wizardStep, setWizardStep] = useState(0)

    const filteredConnectors = connectors.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = activeCategory === 'all' || c.category === activeCategory
        return matchesSearch && matchesCategory
    })

    const openWizard = useCallback((connector: Connector) => {
        setWizardConnector(connector)
        setWizardStep(0)
        setShowWizard(true)
    }, [])

    const getStatusBadge = (status: ConnectorStatus) => {
        switch (status) {
            case 'connected': return <Badge variant="success" size="sm" dot pulse>Connected</Badge>
            case 'available': return <Badge variant="info" size="sm">Available</Badge>
            case 'coming_soon': return <Badge variant="default" size="sm">Coming Soon</Badge>
        }
    }

    const getHealthBadge = (health?: string) => {
        switch (health) {
            case 'healthy': return <Badge variant="success" size="sm" icon={<Wifi size={10} />}>Healthy</Badge>
            case 'degraded': return <Badge variant="warning" size="sm" icon={<AlertTriangle size={10} />}>Degraded</Badge>
            case 'down': return <Badge variant="critical" size="sm" icon={<WifiOff size={10} />}>Down</Badge>
            default: return null
        }
    }

    const getEventBadge = (status: ActivityEvent['status']) => {
        switch (status) {
            case 'success': return <Badge variant="success" size="sm" icon={<CheckCircle2 size={10} />}>Success</Badge>
            case 'error': return <Badge variant="critical" size="sm" icon={<XCircle size={10} />}>Error</Badge>
            case 'warning': return <Badge variant="warning" size="sm" icon={<AlertTriangle size={10} />}>Warning</Badge>
        }
    }

    const connectedCount = connectors.filter(c => c.status === 'connected').length

    return (
        <div className="integration-marketplace">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="im-header">
                    <div>
                        <h1 className="im-title">
                            <Plug size={28} />
                            Integration Marketplace
                            <Badge variant="teal" icon={<Zap size={10} />}>{connectedCount} Active</Badge>
                        </h1>
                        <p className="im-subtitle">Connect EHRs, clearinghouses, labs, and payment systems to your platform</p>
                    </div>
                    <div className="im-header-actions">
                        <Button variant="secondary" icon={<Activity size={16} />}>System Health</Button>
                    </div>
                </div>

                {/* KPI Summary */}
                <div className="im-kpis">
                    <MetricCard
                        label="Active Connections"
                        value={connectedCount.toString()}
                        icon={<Plug size={20} />}
                        subtitle={`of ${connectors.length} connectors`}
                        variant="success"
                    />
                    <MetricCard
                        label="API Calls Today"
                        value="70.3K"
                        icon={<Activity size={20} />}
                        change={8.4}
                        subtitle="Across all connectors"
                    />
                    <MetricCard
                        label="Uptime"
                        value="99.94%"
                        icon={<Wifi size={20} />}
                        subtitle="Last 30 days"
                        variant="success"
                    />
                    <MetricCard
                        label="Data Synced"
                        value="2.4M"
                        icon={<Database size={20} />}
                        change={12}
                        subtitle="Records this month"
                    />
                </div>

                {/* Search & Categories */}
                <div className="im-filters">
                    <div className="im-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search integrations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="im-categories">
                        {categories.map((cat) => {
                            const Icon = cat.icon
                            return (
                                <motion.button
                                    key={cat.id}
                                    className={`im-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Icon size={14} />
                                    <span>{cat.name}</span>
                                    <span className="im-cat-count">{cat.count}</span>
                                </motion.button>
                            )
                        })}
                    </div>
                </div>

                {/* Connectors Grid */}
                <div className="im-connectors-grid">
                    {filteredConnectors.map((connector, index) => {
                        const LogoIcon = connector.logo
                        return (
                            <motion.div
                                key={connector.id}
                                className={`im-connector-card ${connector.status}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="im-connector-header">
                                    <div className="im-connector-logo" style={{ background: `${connector.logoColor}15`, color: connector.logoColor }}>
                                        <LogoIcon size={24} />
                                    </div>
                                    <div className="im-connector-info">
                                        <span className="im-connector-name">{connector.name}</span>
                                        <span className="im-connector-vendor">{connector.vendor}</span>
                                    </div>
                                    {getStatusBadge(connector.status)}
                                </div>

                                <p className="im-connector-desc">{connector.description}</p>

                                <div className="im-connector-features">
                                    {connector.features.map(f => (
                                        <span key={f} className="im-feature-tag">
                                            <Zap size={10} /> {f}
                                        </span>
                                    ))}
                                </div>

                                {connector.status === 'connected' && (
                                    <div className="im-connector-health">
                                        {getHealthBadge(connector.healthStatus)}
                                        <span className="im-health-meta">
                                            <Clock size={10} /> {connector.lastSync}
                                        </span>
                                        <span className="im-health-meta">
                                            <Activity size={10} /> {connector.apiCalls}
                                        </span>
                                    </div>
                                )}

                                <div className="im-connector-footer">
                                    <span className="im-version">v{connector.version}</span>
                                    {connector.status === 'connected' ? (
                                        <Button variant="ghost" size="sm" icon={<Settings size={14} />}>Configure</Button>
                                    ) : connector.status === 'available' ? (
                                        <Button variant="primary" size="sm" icon={<Plug size={14} />} onClick={() => openWizard(connector)}>
                                            Connect
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" size="sm" disabled>Coming Soon</Button>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Activity Log */}
                <GlassCard className="im-activity-log">
                    <div className="im-section-header">
                        <h3 className="im-section-title">
                            <Activity size={18} />
                            Recent Integration Events
                        </h3>
                        <Button variant="ghost" size="sm" icon={<Eye size={14} />}>View All</Button>
                    </div>
                    <div className="im-events-list">
                        {activityLog.map((event, index) => (
                            <motion.div
                                key={event.id}
                                className="im-event-item"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="im-event-connector">{event.connector}</div>
                                <div className="im-event-text">{event.event}</div>
                                {getEventBadge(event.status)}
                                <span className="im-event-time">{event.timestamp}</span>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Connection Wizard Modal */}
                <AnimatePresence>
                    {showWizard && wizardConnector && (
                        <motion.div
                            className="im-modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowWizard(false)}
                        >
                            <motion.div
                                className="im-modal"
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="im-modal-header">
                                    <div className="im-modal-title">
                                        <Plug size={20} />
                                        <span>Connect {wizardConnector.name}</span>
                                    </div>
                                    <button className="im-modal-close" onClick={() => setShowWizard(false)}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="im-modal-steps">
                                    {['Credentials', 'Configuration', 'Test & Confirm'].map((step, i) => (
                                        <div key={i} className={`im-step ${wizardStep >= i ? 'active' : ''} ${wizardStep === i ? 'current' : ''}`}>
                                            <div className="im-step-num">{i + 1}</div>
                                            <span>{step}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="im-modal-body">
                                    {wizardStep === 0 && (
                                        <div className="im-wizard-fields">
                                            <div className="im-wiz-field">
                                                <label><Key size={14} /> Client ID</label>
                                                <input type="text" placeholder="Enter client ID..." />
                                            </div>
                                            <div className="im-wiz-field">
                                                <label><Shield size={14} /> Client Secret</label>
                                                <input type="password" placeholder="Enter client secret..." />
                                            </div>
                                            <div className="im-wiz-field">
                                                <label><ExternalLink size={14} /> Base URL</label>
                                                <input type="text" placeholder={`https://api.${wizardConnector.id}.com/fhir/r4`} />
                                            </div>
                                        </div>
                                    )}
                                    {wizardStep === 1 && (
                                        <div className="im-wizard-fields">
                                            <div className="im-wiz-field">
                                                <label><RefreshCw size={14} /> Sync Frequency</label>
                                                <select>
                                                    <option>Real-time</option>
                                                    <option>Every 5 minutes</option>
                                                    <option>Every 15 minutes</option>
                                                    <option>Hourly</option>
                                                </select>
                                            </div>
                                            <div className="im-wiz-field">
                                                <label><Database size={14} /> Data Scope</label>
                                                <select>
                                                    <option>All Resources</option>
                                                    <option>Patient + Coverage only</option>
                                                    <option>Claims only</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    {wizardStep === 2 && (
                                        <div className="im-wizard-test">
                                            <CheckCircle2 size={48} style={{ color: '#22c55e' }} />
                                            <h4>Connection Test Passed</h4>
                                            <p>Successfully authenticated and retrieved test data from {wizardConnector.name}.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="im-modal-footer">
                                    {wizardStep > 0 && (
                                        <Button variant="ghost" onClick={() => setWizardStep(prev => prev - 1)}>Back</Button>
                                    )}
                                    <div style={{ flex: 1 }} />
                                    {wizardStep < 2 ? (
                                        <Button variant="primary" onClick={() => setWizardStep(prev => prev + 1)}>
                                            {wizardStep === 0 ? 'Next: Configure' : 'Test Connection'}
                                        </Button>
                                    ) : (
                                        <Button variant="success" icon={<CheckCircle2 size={16} />} onClick={() => setShowWizard(false)}>
                                            Activate Connection
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
