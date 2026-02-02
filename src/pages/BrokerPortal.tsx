import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Briefcase, Users, FileText, TrendingUp, DollarSign, Calendar,
    Building2, Search, Plus, Filter, ChevronRight, Bell, Settings,
    LogOut, User, Download, ExternalLink, Clock, CheckCircle,
    AlertCircle, PieChart, BarChart3, Target, Shield, Phone,
    MessageSquare, Star, Activity, Wallet, HelpCircle
} from 'lucide-react'
import { GlassCard, Badge, Button, Input } from '../components/common'
import './BrokerPortal.css'

// ============================================================================
// BROKER PORTAL - AGENCY-LEVEL DASHBOARD
// Focused portal for brokers to manage their book of business
// ============================================================================

// Mock broker data
const brokerData = {
    name: 'Michael Roberts',
    agency: 'Premier Benefits Group',
    agencyId: 'AGN-4821',
    licenseNumber: 'LIC-789234',
    tier: 'Gold Partner',
    clientCount: 47,
    totalLives: 8420,
    monthlyRevenue: 125400,
    pendingRenewals: 12,
}

// Client list
const clients = [
    { id: 1, name: 'TechCorp Industries', lives: 1240, premium: 2450000, renewal: '2026-06-01', status: 'active', health: 95 },
    { id: 2, name: 'Bay Area Manufacturing', lives: 890, premium: 1850000, renewal: '2026-04-15', status: 'renewal', health: 88 },
    { id: 3, name: 'Pacific Retail Group', lives: 2100, premium: 3200000, renewal: '2026-09-01', status: 'active', health: 92 },
    { id: 4, name: 'Golden State Logistics', lives: 560, premium: 980000, renewal: '2026-03-01', status: 'at-risk', health: 72 },
    { id: 5, name: 'Sunset Medical Partners', lives: 340, premium: 720000, renewal: '2026-07-15', status: 'active', health: 97 },
]

// Recent activity
const recentActivity = [
    { id: 1, type: 'quote', client: 'New Client Lead', action: 'Quote requested for 200 lives', time: '2 hours ago', icon: FileText },
    { id: 2, type: 'renewal', client: 'Bay Area Manufacturing', action: 'Renewal proposal sent', time: '4 hours ago', icon: Calendar },
    { id: 3, type: 'commission', client: 'System', action: 'Commission payment processed - $12,400', time: '1 day ago', icon: DollarSign },
    { id: 4, type: 'support', client: 'TechCorp Industries', action: 'Support ticket resolved', time: '2 days ago', icon: CheckCircle },
]

// Quick metrics
const quickMetrics = [
    { label: 'Active Clients', value: 47, icon: Building2, color: 'cyan', change: '+3' },
    { label: 'Total Lives', value: '8,420', icon: Users, color: 'emerald', change: '+156' },
    { label: 'Monthly Revenue', value: '$125K', icon: DollarSign, color: 'violet', change: '+8%' },
    { label: 'Pending Renewals', value: 12, icon: Calendar, color: 'amber', change: '' },
]

interface BrokerPortalProps {
    onLogout: () => void
    isAdmin?: boolean
}

// Metric Card Component
function MetricCard({ metric }: { metric: typeof quickMetrics[0] }) {
    const Icon = metric.icon
    return (
        <div className={`bp-metric-card bp-metric-card--${metric.color}`}>
            <div className="bp-metric-card__icon">
                <Icon size={20} />
            </div>
            <div className="bp-metric-card__content">
                <span className="bp-metric-card__value">{metric.value}</span>
                <span className="bp-metric-card__label">{metric.label}</span>
            </div>
            {metric.change && (
                <span className="bp-metric-card__change">{metric.change}</span>
            )}
        </div>
    )
}

// Client Row Component
function ClientRow({ client, onClick }: { client: typeof clients[0], onClick: () => void }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success'
            case 'renewal': return 'warning'
            case 'at-risk': return 'critical'
            default: return 'secondary'
        }
    }

    const getHealthColor = (health: number) => {
        if (health >= 90) return '#10B981'
        if (health >= 75) return '#F59E0B'
        return '#EF4444'
    }

    return (
        <motion.div
            className="bp-client-row"
            onClick={onClick}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
        >
            <div className="bp-client-row__name">
                <Building2 size={18} />
                <div>
                    <span className="bp-client-row__company">{client.name}</span>
                    <span className="bp-client-row__lives">{client.lives.toLocaleString()} lives</span>
                </div>
            </div>
            <div className="bp-client-row__premium">
                ${(client.premium / 1000000).toFixed(2)}M
            </div>
            <div className="bp-client-row__renewal">
                {new Date(client.renewal).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
            <div className="bp-client-row__health">
                <div
                    className="bp-client-row__health-bar"
                    style={{
                        width: `${client.health}%`,
                        backgroundColor: getHealthColor(client.health)
                    }}
                />
                <span>{client.health}%</span>
            </div>
            <Badge variant={getStatusColor(client.status)}>
                {client.status}
            </Badge>
            <ChevronRight size={16} className="bp-client-row__arrow" />
        </motion.div>
    )
}

// Activity Item
function ActivityItem({ activity }: { activity: typeof recentActivity[0] }) {
    const Icon = activity.icon
    return (
        <div className="bp-activity-item">
            <div className="bp-activity-item__icon">
                <Icon size={16} />
            </div>
            <div className="bp-activity-item__content">
                <span className="bp-activity-item__client">{activity.client}</span>
                <span className="bp-activity-item__action">{activity.action}</span>
            </div>
            <span className="bp-activity-item__time">{activity.time}</span>
        </div>
    )
}

export function BrokerPortal({ onLogout, isAdmin = false }: BrokerPortalProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('dashboard')

    return (
        <div className="broker-portal">
            {/* Header */}
            <header className="bp-header">
                <div className="bp-header__brand">
                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="bpLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8B5CF6" />
                                <stop offset="100%" stopColor="#EC4899" />
                            </linearGradient>
                        </defs>
                        <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#bpLogoGrad)" />
                        <rect x="5" y="5" width="30" height="30" rx="8" fill="#030712" fillOpacity="0.9" />
                        <path d="M20 10L30 28H10L20 10Z" fill="none" stroke="url(#bpLogoGrad)" strokeWidth="2" />
                    </svg>
                    <div className="bp-header__text">
                        <span className="bp-header__name">APEX</span>
                        <span className="bp-header__portal">Broker Portal</span>
                    </div>
                </div>

                <nav className="bp-header__nav">
                    {['dashboard', 'clients', 'quotes', 'renewals', 'commissions', 'reports'].map(tab => (
                        <button
                            key={tab}
                            className={`bp-nav-btn ${activeTab === tab ? 'bp-nav-btn--active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>

                <div className="bp-header__actions">
                    <Button variant="primary" size="sm" icon={<Plus size={16} />}>
                        New Quote
                    </Button>
                    <button className="bp-header__icon-btn">
                        <Bell size={20} />
                        <span className="bp-header__badge">5</span>
                    </button>
                    <div className="bp-header__user">
                        <div className="bp-header__avatar">
                            {brokerData.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="bp-header__user-info">
                            <span className="bp-header__user-name">{brokerData.name}</span>
                            <span className="bp-header__agency">{brokerData.agency}</span>
                        </div>
                    </div>
                    <button className="bp-header__logout" onClick={onLogout}>
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="bp-main">
                {/* Welcome & Quick Stats */}
                <section className="bp-welcome">
                    <div className="bp-welcome__content">
                        <h1>Welcome back, {brokerData.name.split(' ')[0]}</h1>
                        <p>{brokerData.agency} • {brokerData.tier}</p>
                    </div>
                    <div className="bp-welcome__metrics">
                        {quickMetrics.map(metric => (
                            <MetricCard key={metric.label} metric={metric} />
                        ))}
                    </div>
                </section>

                {/* Content Grid */}
                <div className="bp-content-grid">
                    {/* Client List */}
                    <section className="bp-clients">
                        <div className="bp-section-header">
                            <h2>Your Clients</h2>
                            <div className="bp-section-header__actions">
                                <div className="bp-search">
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search clients..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="ghost" size="sm" icon={<Filter size={14} />}>
                                    Filter
                                </Button>
                            </div>
                        </div>
                        <div className="bp-clients-table">
                            <div className="bp-clients-table__header">
                                <span>Client</span>
                                <span>Premium</span>
                                <span>Renewal</span>
                                <span>Health Score</span>
                                <span>Status</span>
                                <span></span>
                            </div>
                            <div className="bp-clients-table__body">
                                {clients.filter(c =>
                                    c.name.toLowerCase().includes(searchQuery.toLowerCase())
                                ).map(client => (
                                    <ClientRow
                                        key={client.id}
                                        client={client}
                                        onClick={() => console.log('Navigate to client', client.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Sidebar */}
                    <aside className="bp-sidebar">
                        {/* Recent Activity */}
                        <div className="bp-sidebar-card">
                            <h3>Recent Activity</h3>
                            <div className="bp-activity-list">
                                {recentActivity.map(activity => (
                                    <ActivityItem key={activity.id} activity={activity} />
                                ))}
                            </div>
                            <Button variant="ghost" size="sm" fullWidth>
                                View All Activity
                            </Button>
                        </div>

                        {/* Quick Actions */}
                        <div className="bp-sidebar-card">
                            <h3>Quick Actions</h3>
                            <div className="bp-quick-actions">
                                <button className="bp-quick-action">
                                    <FileText size={18} />
                                    <span>Create Quote</span>
                                </button>
                                <button className="bp-quick-action">
                                    <Users size={18} />
                                    <span>Add Client</span>
                                </button>
                                <button className="bp-quick-action">
                                    <Download size={18} />
                                    <span>Commission Statement</span>
                                </button>
                                <button className="bp-quick-action">
                                    <Phone size={18} />
                                    <span>Contact Support</span>
                                </button>
                            </div>
                        </div>

                        {/* Performance */}
                        <div className="bp-sidebar-card bp-sidebar-card--highlight">
                            <div className="bp-performance-header">
                                <Star size={20} />
                                <span>Gold Partner Status</span>
                            </div>
                            <p className="bp-performance-text">
                                You're on track for Platinum! Add 3 more clients this quarter.
                            </p>
                            <div className="bp-performance-bar">
                                <div className="bp-performance-bar__fill" style={{ width: '78%' }} />
                            </div>
                            <span className="bp-performance-label">78% to Platinum</span>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Footer */}
            <footer className="bp-footer">
                <div className="bp-footer__links">
                    <a href="#">Partner Resources</a>
                    <a href="#">Training</a>
                    <a href="#">Support</a>
                    <a href="#">Terms</a>
                </div>
                <span className="bp-footer__copy">© 2026 Apex Health Intelligence • Partner Portal</span>
            </footer>
        </div>
    )
}

export default BrokerPortal
