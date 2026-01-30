import { useState } from 'react'
import { useNavigation } from '../context/NavigationContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Shield,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Calendar,
    FileText,
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Brain,
    Sparkles,
    Zap,
    Target,
    Activity,
    ChevronRight,
    AlertCircle,
    Building2,
    Scale,
    FileCheck,
    Bell,
    Calculator
} from 'lucide-react'
import { GlassCard, Button, Badge } from '../components/common'
import './ComplianceCenter.css'

// ============================================
// MOCK DATA - Compliance Center
// ============================================

const complianceMetrics = {
    overallScore: 94.2,
    acaCompliance: 97.8,
    affordability: 92.1,
    coverageOffer: 98.5,
    safeHarborStatus: 'Compliant',
    penaltyExposure: 0,
    employeesTracked: 1247,
    formsGenerated: 1189,
    pendingCorrections: 3
}

const upcomingDeadlines = [
    { id: 1, title: '1095-C Distribution Deadline', date: '2024-03-02', daysLeft: 31, priority: 'high', type: 'irs' },
    { id: 2, title: '1094-C Filing Deadline', date: '2024-03-31', daysLeft: 60, priority: 'high', type: 'irs' },
    { id: 3, title: 'Quarterly FTE Review', date: '2024-04-01', daysLeft: 61, priority: 'medium', type: 'internal' },
    { id: 4, title: 'Open Enrollment Planning', date: '2024-09-01', daysLeft: 214, priority: 'low', type: 'internal' },
]

const complianceAlerts = [
    { id: 1, severity: 'warning', title: '23 employees approaching FTE threshold', description: 'Variable hour employees may qualify for coverage', action: 'Review Now' },
    { id: 2, severity: 'info', title: 'Safe Harbor codes need review', description: '45 employees have pending code assignments', action: 'Assign Codes' },
    { id: 3, severity: 'success', title: 'All 1095-C forms validated', description: '1,189 forms ready for distribution', action: 'View Forms' },
]

const aiRecommendations = [
    { text: 'Switch to **Rate of Pay Safe Harbor** for 12 employees to reduce penalty exposure by $48,000', confidence: 94, impact: 'high' },
    { text: '**3 employees** have inconsistent offer codes vs. contribution data. Review recommended.', confidence: 91, impact: 'medium' },
    { text: 'Predicted **ALE status** maintained for 2025 based on current workforce trends', confidence: 88, impact: 'info' },
]

const quickActions = [
    { icon: Calculator, label: 'Penalty Calculator', path: '/compliance/penalty-risk', color: '#ef4444' },
    { icon: Users, label: 'ACA Eligibility', path: '/compliance/aca', color: '#06b6d4' },
    { icon: FileText, label: 'IRS Forms', path: '/compliance/irs-filing', color: '#8b5cf6' },
    { icon: Scale, label: 'Safe Harbor', path: '/compliance/safe-harbor', color: '#10b981' },
]

const recentActivity = [
    { action: '1095-C Generated', employee: 'John Martinez', time: '2 hours ago', status: 'complete' },
    { action: 'FTE Status Updated', employee: 'Sarah Chen', time: '4 hours ago', status: 'complete' },
    { action: 'Safe Harbor Code Assigned', employee: 'Emily Davis', time: '1 day ago', status: 'complete' },
    { action: 'Correction Submitted', employee: 'Michael Wilson', time: '2 days ago', status: 'pending' },
]

// ============================================
// HELPER COMPONENTS
// ============================================

const ComplianceScoreRing = ({ score, label, size = 120 }: { score: number; label: string; size?: number }) => {
    const getScoreColor = (s: number) => {
        if (s >= 95) return '#10b981'
        if (s >= 85) return '#f59e0b'
        return '#ef4444'
    }
    const color = getScoreColor(score)
    const circumference = 2 * Math.PI * 45
    const strokeDashoffset = circumference - (score / 100) * circumference

    return (
        <div className="compliance-score-ring" style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                />
            </svg>
            <div className="compliance-score-ring__content">
                <motion.span
                    className="compliance-score-ring__value"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ color }}
                >
                    {score}%
                </motion.span>
                <span className="compliance-score-ring__label">{label}</span>
            </div>
        </div>
    )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ComplianceCenter() {
    const { navigate } = useNavigation()

    return (
        <div className="compliance-center">
            {/* Premium Header */}
            <motion.header
                className="cc__header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="cc__header-left">
                    <div className="cc__icon-container">
                        <Shield size={28} />
                        <div className="cc__icon-pulse" />
                    </div>
                    <div>
                        <h1 className="cc__title">Compliance Center</h1>
                        <div className="cc__subtitle">
                            <span>ACA Compliance • Penalty Avoidance • IRS Filing • Audit Readiness</span>
                        </div>
                    </div>
                </div>
                <div className="cc__header-badges">
                    <div className="cc__badge cc__badge--compliant">
                        <CheckCircle2 size={14} />
                        ALE Compliant
                    </div>
                    <div className="cc__badge">
                        <Sparkles size={14} />
                        AI Monitored
                    </div>
                </div>
                <div className="cc__header-actions">
                    <Button variant="ghost" size="sm">
                        <Bell size={16} />
                        Alerts
                    </Button>
                    <Button variant="primary" size="sm">
                        <FileCheck size={16} />
                        Run Audit
                    </Button>
                </div>
            </motion.header>

            {/* Compliance Score Overview */}
            <motion.div
                className="cc__score-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="cc__score-main">
                    <ComplianceScoreRing score={complianceMetrics.overallScore} label="Overall Score" size={160} />
                    <div className="cc__score-breakdown">
                        <div className="cc__score-item">
                            <span className="cc__score-item-label">ACA Compliance</span>
                            <div className="cc__score-item-bar">
                                <motion.div
                                    className="cc__score-item-fill"
                                    style={{ background: '#10b981' }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${complianceMetrics.acaCompliance}%` }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                />
                            </div>
                            <span className="cc__score-item-value">{complianceMetrics.acaCompliance}%</span>
                        </div>
                        <div className="cc__score-item">
                            <span className="cc__score-item-label">Affordability</span>
                            <div className="cc__score-item-bar">
                                <motion.div
                                    className="cc__score-item-fill"
                                    style={{ background: '#f59e0b' }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${complianceMetrics.affordability}%` }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                />
                            </div>
                            <span className="cc__score-item-value">{complianceMetrics.affordability}%</span>
                        </div>
                        <div className="cc__score-item">
                            <span className="cc__score-item-label">Coverage Offer</span>
                            <div className="cc__score-item-bar">
                                <motion.div
                                    className="cc__score-item-fill"
                                    style={{ background: '#06b6d4' }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${complianceMetrics.coverageOffer}%` }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                />
                            </div>
                            <span className="cc__score-item-value">{complianceMetrics.coverageOffer}%</span>
                        </div>
                    </div>
                </div>
                <div className="cc__score-stats">
                    {[
                        { label: 'Employees Tracked', value: complianceMetrics.employeesTracked.toLocaleString(), icon: Users, color: '#06b6d4' },
                        { label: 'Forms Generated', value: complianceMetrics.formsGenerated.toLocaleString(), icon: FileText, color: '#8b5cf6' },
                        { label: 'Penalty Exposure', value: '$0', icon: DollarSign, color: '#10b981' },
                        { label: 'Pending Corrections', value: complianceMetrics.pendingCorrections.toString(), icon: AlertCircle, color: '#f59e0b' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            className="cc__stat-card"
                            style={{ '--stat-color': stat.color } as any}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.05 }}
                        >
                            <div className="cc__stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                                <stat.icon size={20} />
                            </div>
                            <div className="cc__stat-value">{stat.value}</div>
                            <div className="cc__stat-label">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Main Grid */}
            <div className="cc__grid">
                {/* Left Column */}
                <div className="cc__main">
                    {/* Alerts Section */}
                    <motion.div
                        className="cc__alerts"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="cc__section-header">
                            <div className="cc__section-title">
                                <AlertTriangle size={20} />
                                <h2>Compliance Alerts</h2>
                                <Badge variant="default">{complianceAlerts.length} active</Badge>
                            </div>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>
                        <div className="cc__alerts-list">
                            {complianceAlerts.map((alert, i) => (
                                <motion.div
                                    key={alert.id}
                                    className={`cc__alert cc__alert--${alert.severity}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                >
                                    <div className="cc__alert-icon">
                                        {alert.severity === 'warning' && <AlertTriangle size={18} />}
                                        {alert.severity === 'info' && <AlertCircle size={18} />}
                                        {alert.severity === 'success' && <CheckCircle2 size={18} />}
                                    </div>
                                    <div className="cc__alert-content">
                                        <div className="cc__alert-title">{alert.title}</div>
                                        <div className="cc__alert-description">{alert.description}</div>
                                    </div>
                                    <button className="cc__alert-action">{alert.action}</button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        className="cc__quick-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="cc__section-header">
                            <div className="cc__section-title">
                                <Zap size={20} />
                                <h2>Quick Actions</h2>
                            </div>
                        </div>
                        <div className="cc__actions-grid">
                            {quickActions.map((action, i) => (
                                <motion.button
                                    key={action.label}
                                    className="cc__action-card"
                                    style={{ '--action-color': action.color } as any}
                                    onClick={() => navigate(action.path)}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + i * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="cc__action-icon" style={{ background: `${action.color}15`, color: action.color }}>
                                        <action.icon size={24} />
                                    </div>
                                    <span className="cc__action-label">{action.label}</span>
                                    <ChevronRight size={16} className="cc__action-arrow" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        className="cc__activity"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="cc__section-header">
                            <div className="cc__section-title">
                                <Activity size={20} />
                                <h2>Recent Activity</h2>
                            </div>
                        </div>
                        <div className="cc__activity-list">
                            {recentActivity.map((item, i) => (
                                <div key={i} className="cc__activity-item">
                                    <div className={`cc__activity-dot cc__activity-dot--${item.status}`} />
                                    <div className="cc__activity-content">
                                        <span className="cc__activity-action">{item.action}</span>
                                        <span className="cc__activity-employee">{item.employee}</span>
                                    </div>
                                    <span className="cc__activity-time">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="cc__sidebar">
                    {/* AI Recommendations */}
                    <motion.div
                        className="cc__ai-panel"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="cc__ai-header">
                            <div className="cc__ai-icon">
                                <Brain size={22} />
                            </div>
                            <div>
                                <h3>AI Recommendations</h3>
                                <p>Powered by Intellisure™</p>
                            </div>
                        </div>
                        {aiRecommendations.map((rec, i) => (
                            <motion.div
                                key={i}
                                className={`cc__ai-rec cc__ai-rec--${rec.impact}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                            >
                                <div className="cc__ai-rec-header">
                                    <span className="cc__ai-rec-confidence">{rec.confidence}%</span>
                                </div>
                                <p dangerouslySetInnerHTML={{ __html: rec.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Upcoming Deadlines */}
                    <motion.div
                        className="cc__deadlines"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="cc__deadlines-header">
                            <Calendar size={18} />
                            <h3>Upcoming Deadlines</h3>
                        </div>
                        <div className="cc__deadlines-list">
                            {upcomingDeadlines.map((deadline, i) => (
                                <motion.div
                                    key={deadline.id}
                                    className={`cc__deadline cc__deadline--${deadline.priority}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                >
                                    <div className="cc__deadline-days">
                                        <span className="cc__deadline-days-value">{deadline.daysLeft}</span>
                                        <span className="cc__deadline-days-label">days</span>
                                    </div>
                                    <div className="cc__deadline-info">
                                        <div className="cc__deadline-title">{deadline.title}</div>
                                        <div className="cc__deadline-date">{deadline.date}</div>
                                    </div>
                                    <div className={`cc__deadline-badge cc__deadline-badge--${deadline.type}`}>
                                        {deadline.type === 'irs' ? 'IRS' : 'Internal'}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default ComplianceCenter
