import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Home, Search, Heart, FileText, CreditCard, Calendar, Video, Pill,
    User, Bell, Settings, LogOut, ChevronRight, MapPin, Phone, Clock,
    DollarSign, Shield, Activity, Star, CheckCircle, AlertCircle,
    Wallet, Download, ExternalLink, HelpCircle, MessageSquare
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './MemberPortal.css'

// ============================================================================
// MEMBER PORTAL - FOCUSED SINGLE-PORTAL EXPERIENCE
// No sidebar, clean dashboard with member-specific features
// ============================================================================

// Mock member data
const memberData = {
    name: 'Sarah Chen',
    memberId: 'MBR-7829341',
    plan: 'Blue Shield Gold PPO',
    employer: 'TechCorp Industries',
    effectiveDate: '01/01/2026',
    deductible: { used: 850, total: 2500 },
    outOfPocket: { used: 1200, total: 6000 },
    copay: { primary: 25, specialist: 50, urgent: 75, er: 250 },
}

// Recent claims
const recentClaims = [
    { id: 'CLM-9821', provider: 'Bay Area Medical Group', service: 'Preventive Care Visit', date: '01/15/2026', amount: 175, status: 'paid' },
    { id: 'CLM-9802', provider: 'Quest Diagnostics', service: 'Lab Work - Blood Panel', date: '01/10/2026', amount: 425, status: 'processing' },
    { id: 'CLM-9788', provider: 'CVS Pharmacy', service: 'Rx - Metformin 500mg', date: '01/05/2026', amount: 32, status: 'paid' },
]

// Quick action cards
const quickActions = [
    { id: 'find-doctor', label: 'Find a Doctor', icon: Search, desc: 'Search providers & specialists', color: 'cyan' },
    { id: 'cost-estimate', label: 'Cost Estimator', icon: DollarSign, desc: 'Get procedure cost estimates', color: 'emerald' },
    { id: 'id-card', label: 'Digital ID Card', icon: CreditCard, desc: 'View or share your ID card', color: 'violet' },
    { id: 'virtual-care', label: 'Virtual Care', icon: Video, desc: 'Start a telehealth visit', color: 'pink' },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill, desc: 'Rx refills & drug search', color: 'amber' },
    { id: 'make-payment', label: 'Make Payment', icon: Wallet, desc: 'Pay bills & set autopay', color: 'rose' },
]

interface MemberPortalProps {
    onLogout: () => void
}

// Progress Ring Component
function ProgressRing({ value, max, label, color }: { value: number, max: number, label: string, color: string }) {
    const percentage = (value / max) * 100
    const circumference = 2 * Math.PI * 36
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div className="mp-progress-ring">
            <svg viewBox="0 0 80 80">
                <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="6"
                />
                <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke={color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 40 40)"
                />
            </svg>
            <div className="mp-progress-ring__content">
                <span className="mp-progress-ring__value">${value.toLocaleString()}</span>
                <span className="mp-progress-ring__max">of ${max.toLocaleString()}</span>
            </div>
            <span className="mp-progress-ring__label">{label}</span>
        </div>
    )
}

// Quick Action Card
function QuickActionCard({ action, onClick }: { action: typeof quickActions[0], onClick: () => void }) {
    return (
        <motion.button
            className={`mp-action-card mp-action-card--${action.color}`}
            onClick={onClick}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="mp-action-card__icon">
                <action.icon size={24} />
            </div>
            <span className="mp-action-card__label">{action.label}</span>
            <span className="mp-action-card__desc">{action.desc}</span>
        </motion.button>
    )
}

// Claim Row
function ClaimRow({ claim }: { claim: typeof recentClaims[0] }) {
    return (
        <div className="mp-claim-row">
            <div className="mp-claim-row__info">
                <span className="mp-claim-row__provider">{claim.provider}</span>
                <span className="mp-claim-row__service">{claim.service}</span>
            </div>
            <div className="mp-claim-row__date">{claim.date}</div>
            <div className="mp-claim-row__amount">${claim.amount}</div>
            <Badge variant={claim.status === 'paid' ? 'success' : 'warning'}>
                {claim.status === 'paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                {claim.status}
            </Badge>
        </div>
    )
}

export function MemberPortal({ onLogout }: MemberPortalProps) {
    const [activeTab, setActiveTab] = useState('dashboard')

    return (
        <div className="member-portal">
            {/* Header - Clean, focused navigation */}
            <header className="mp-header">
                <div className="mp-header__brand">
                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="mpLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#06B6D4" />
                            </linearGradient>
                        </defs>
                        <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#mpLogoGrad)" />
                        <rect x="5" y="5" width="30" height="30" rx="8" fill="#030712" fillOpacity="0.9" />
                        <path d="M20 10L30 28H10L20 10Z" fill="none" stroke="url(#mpLogoGrad)" strokeWidth="2" />
                    </svg>
                    <div className="mp-header__text">
                        <span className="mp-header__name">APEX</span>
                        <span className="mp-header__plan">{memberData.plan}</span>
                    </div>
                </div>

                <nav className="mp-header__nav">
                    {['dashboard', 'claims', 'benefits', 'documents'].map(tab => (
                        <button
                            key={tab}
                            className={`mp-nav-btn ${activeTab === tab ? 'mp-nav-btn--active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>

                <div className="mp-header__actions">
                    <button className="mp-header__icon-btn">
                        <Bell size={20} />
                        <span className="mp-header__badge">2</span>
                    </button>
                    <button className="mp-header__icon-btn">
                        <HelpCircle size={20} />
                    </button>
                    <div className="mp-header__user">
                        <div className="mp-header__avatar">
                            {memberData.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="mp-header__user-name">{memberData.name}</span>
                    </div>
                    <button className="mp-header__logout" onClick={onLogout}>
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="mp-main">
                {/* Welcome Section */}
                <section className="mp-welcome">
                    <div className="mp-welcome__content">
                        <h1 className="mp-welcome__title">
                            Good morning, {memberData.name.split(' ')[0]}
                        </h1>
                        <p className="mp-welcome__subtitle">
                            Member ID: {memberData.memberId} • {memberData.employer}
                        </p>
                    </div>
                    <div className="mp-welcome__cta">
                        <Button icon={<MessageSquare size={16} />}>
                            Chat with Support
                        </Button>
                    </div>
                </section>

                {/* Coverage Summary */}
                <section className="mp-coverage">
                    <div className="mp-coverage__header">
                        <h2>Your Coverage</h2>
                        <span className="mp-coverage__effective">Effective {memberData.effectiveDate}</span>
                    </div>
                    <div className="mp-coverage__cards">
                        <div className="mp-coverage__progress-group">
                            <ProgressRing
                                value={memberData.deductible.used}
                                max={memberData.deductible.total}
                                label="Deductible"
                                color="#06B6D4"
                            />
                            <ProgressRing
                                value={memberData.outOfPocket.used}
                                max={memberData.outOfPocket.total}
                                label="Out-of-Pocket Max"
                                color="#8B5CF6"
                            />
                        </div>
                        <div className="mp-coverage__copays">
                            <h3>Your Copays</h3>
                            <div className="mp-copay-grid">
                                <div className="mp-copay">
                                    <span className="mp-copay__label">Primary Care</span>
                                    <span className="mp-copay__amount">${memberData.copay.primary}</span>
                                </div>
                                <div className="mp-copay">
                                    <span className="mp-copay__label">Specialist</span>
                                    <span className="mp-copay__amount">${memberData.copay.specialist}</span>
                                </div>
                                <div className="mp-copay">
                                    <span className="mp-copay__label">Urgent Care</span>
                                    <span className="mp-copay__amount">${memberData.copay.urgent}</span>
                                </div>
                                <div className="mp-copay">
                                    <span className="mp-copay__label">Emergency</span>
                                    <span className="mp-copay__amount">${memberData.copay.er}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="mp-quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="mp-actions-grid">
                        {quickActions.map(action => (
                            <QuickActionCard
                                key={action.id}
                                action={action}
                                onClick={() => console.log('Navigate to', action.id)}
                            />
                        ))}
                    </div>
                </section>

                {/* Recent Claims */}
                <section className="mp-claims">
                    <div className="mp-claims__header">
                        <h2>Recent Claims</h2>
                        <Button variant="ghost" size="sm" icon={<ChevronRight size={14} />} iconPosition="right">
                            View All
                        </Button>
                    </div>
                    <div className="mp-claims__list">
                        {recentClaims.map(claim => (
                            <ClaimRow key={claim.id} claim={claim} />
                        ))}
                    </div>
                </section>

                {/* Digital ID Card Preview */}
                <section className="mp-id-card-preview">
                    <div className="mp-id-card">
                        <div className="mp-id-card__header">
                            <Shield size={24} />
                            <span>Blue Shield Gold PPO</span>
                        </div>
                        <div className="mp-id-card__name">{memberData.name}</div>
                        <div className="mp-id-card__id">ID: {memberData.memberId}</div>
                        <div className="mp-id-card__actions">
                            <Button variant="secondary" size="sm" icon={<Download size={14} />}>
                                Download
                            </Button>
                            <Button variant="secondary" size="sm" icon={<ExternalLink size={14} />}>
                                Add to Wallet
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="mp-footer">
                <div className="mp-footer__links">
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                    <a href="#">Accessibility</a>
                    <a href="#">Contact Us</a>
                </div>
                <span className="mp-footer__copy">© 2026 Apex Health Intelligence</span>
            </footer>
        </div>
    )
}

export default MemberPortal
