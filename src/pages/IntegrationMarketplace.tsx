import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    Cloud,
    Database,
    FileText,
    CreditCard,
    Shield,
    MessageSquare,
    Calendar,
    Users,
    BarChart3,
    Download,
    CheckCircle2,
    Star,
    ArrowRight,
    Zap,
    Clock,
    Settings
} from 'lucide-react'
import './IntegrationMarketplace.css'

interface Integration {
    id: string
    name: string
    vendor: string
    description: string
    category: string
    badges: ('certified' | 'popular' | 'new')[]
    features: string[]
    installs: string
    rating: number
    installed: boolean
}

const IntegrationMarketplace = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')

    const categories = [
        { id: 'all', name: 'All', icon: BarChart3, count: 48 },
        { id: 'ehr', name: 'EHR/EMR', icon: FileText, count: 12 },
        { id: 'claims', name: 'Claims', icon: CreditCard, count: 8 },
        { id: 'analytics', name: 'Analytics', icon: BarChart3, count: 10 },
        { id: 'security', name: 'Security', icon: Shield, count: 6 },
        { id: 'communication', name: 'Communication', icon: MessageSquare, count: 7 },
        { id: 'hr', name: 'HR/Payroll', icon: Users, count: 5 }
    ]

    const featuredIntegrations = [
        { id: 'epic', name: 'Epic MyChart', desc: 'Full EHR integration', icon: Cloud },
        { id: 'salesforce', name: 'Salesforce Health', desc: 'CRM & engagement', icon: Cloud },
        { id: 'workday', name: 'Workday', desc: 'HR & benefits sync', icon: Users }
    ]

    const integrations: Integration[] = [
        {
            id: '1',
            name: 'Epic Systems',
            vendor: 'Epic Systems Corporation',
            description: 'Comprehensive EHR integration with real-time patient data sync, clinical workflows, and MyChart connectivity.',
            category: 'ehr',
            badges: ['certified', 'popular'],
            features: ['FHIR R4', 'HL7', 'Real-time Sync'],
            installs: '2.4K',
            rating: 4.9,
            installed: true
        },
        {
            id: '2',
            name: 'Cerner Health',
            vendor: 'Oracle Cerner',
            description: 'Oracle Cerner integration for health data exchange, clinical decision support, and population health management.',
            category: 'ehr',
            badges: ['certified'],
            features: ['FHIR R4', 'CDS Hooks', 'Analytics'],
            installs: '1.8K',
            rating: 4.7,
            installed: false
        },
        {
            id: '3',
            name: 'Salesforce Health Cloud',
            vendor: 'Salesforce',
            description: 'Connect member engagement, care coordination, and CRM data with your health platform.',
            category: 'analytics',
            badges: ['certified', 'popular'],
            features: ['API', 'Webhooks', 'SSO'],
            installs: '3.1K',
            rating: 4.8,
            installed: true
        },
        {
            id: '4',
            name: 'Workday HCM',
            vendor: 'Workday',
            description: 'Bi-directional sync with Workday for employee benefits, eligibility, and enrollment data.',
            category: 'hr',
            badges: ['certified'],
            features: ['REST API', 'Webhooks', 'Batch'],
            installs: '1.5K',
            rating: 4.6,
            installed: false
        },
        {
            id: '5',
            name: 'Change Healthcare',
            vendor: 'Change Healthcare',
            description: 'Claims processing, eligibility verification, and revenue cycle management integration.',
            category: 'claims',
            badges: ['certified', 'popular'],
            features: ['EDI 837', 'EDI 835', 'Real-time'],
            installs: '2.9K',
            rating: 4.7,
            installed: false
        },
        {
            id: '6',
            name: 'Okta Identity',
            vendor: 'Okta',
            description: 'Enterprise SSO, multi-factor authentication, and identity governance for secure access.',
            category: 'security',
            badges: ['certified', 'new'],
            features: ['SAML 2.0', 'OAuth 2.0', 'SCIM'],
            installs: '4.2K',
            rating: 4.9,
            installed: true
        },
        {
            id: '7',
            name: 'Twilio Healthcare',
            vendor: 'Twilio',
            description: 'HIPAA-compliant messaging, video, and voice communications for member engagement.',
            category: 'communication',
            badges: ['certified'],
            features: ['SMS', 'Voice', 'Video'],
            installs: '2.1K',
            rating: 4.5,
            installed: false
        },
        {
            id: '8',
            name: 'Snowflake Health',
            vendor: 'Snowflake',
            description: 'Cloud data warehouse integration for advanced analytics, ML models, and data sharing.',
            category: 'analytics',
            badges: ['new'],
            features: ['Data Share', 'ML/AI', 'Real-time'],
            installs: '890',
            rating: 4.8,
            installed: false
        }
    ]

    const filteredIntegrations = integrations.filter(integration => {
        const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            integration.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = activeCategory === 'all' || integration.category === activeCategory
        return matchesSearch && matchesCategory
    })

    return (
        <motion.div
            className="integration-marketplace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <h1>Integration Marketplace</h1>
            <p>Pre-built connectors for seamless healthcare ecosystem integration</p>

            {/* Search & Filters */}
            <div className="marketplace-header">
                <div className="marketplace-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search integrations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-chips">
                    <div className="filter-chip active">
                        <CheckCircle2 size={14} />
                        Certified
                    </div>
                    <div className="filter-chip">
                        <Zap size={14} />
                        Real-time
                    </div>
                    <div className="filter-chip">
                        <Shield size={14} />
                        HIPAA
                    </div>
                </div>
            </div>

            {/* Featured Section */}
            <div className="featured-section">
                <h2>Featured Integrations</h2>
                <div className="featured-grid">
                    {featuredIntegrations.map((item, index) => (
                        <motion.div
                            key={item.id}
                            className="featured-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="featured-logo">
                                <item.icon size={24} color="#3B82F6" />
                            </div>
                            <div className="featured-info">
                                <h4>{item.name}</h4>
                                <p>{item.desc}</p>
                            </div>
                            <ArrowRight size={20} color="rgba(255,255,255,0.4)" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="marketplace-categories">
                {categories.map(category => (
                    <motion.div
                        key={category.id}
                        className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(category.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="category-icon">
                            <category.icon size={24} />
                        </div>
                        <span className="category-name">{category.name}</span>
                        <span className="category-count">{category.count} apps</span>
                    </motion.div>
                ))}
            </div>

            {/* Integrations Grid */}
            <div className="integrations-grid">
                {filteredIntegrations.map((integration, index) => (
                    <motion.div
                        key={integration.id}
                        className="integration-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="integration-header">
                            <div className="integration-logo">
                                <Cloud size={28} />
                            </div>
                            <div className="integration-info">
                                <div className="integration-name">{integration.name}</div>
                                <div className="integration-vendor">{integration.vendor}</div>
                                <div className="integration-badges">
                                    {integration.badges.map(badge => (
                                        <span key={badge} className={`badge ${badge}`}>
                                            {badge}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="integration-description">{integration.description}</p>
                        <div className="integration-features">
                            {integration.features.map(feature => (
                                <span key={feature} className="feature-tag">
                                    <Zap size={12} />
                                    {feature}
                                </span>
                            ))}
                        </div>
                        <div className="integration-footer">
                            <div className="integration-stats">
                                <div className="stat-item">
                                    <Download size={14} />
                                    {integration.installs}
                                </div>
                                <div className="rating">
                                    <Star size={14} />
                                    <span>{integration.rating}</span>
                                </div>
                            </div>
                            <button className={`install-btn ${integration.installed ? 'installed' : ''}`}>
                                {integration.installed ? (
                                    <>
                                        <CheckCircle2 size={16} />
                                        Installed
                                    </>
                                ) : (
                                    <>
                                        <Download size={16} />
                                        Install
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}

export default IntegrationMarketplace
