import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Stethoscope,
    Brain,
    AlertTriangle,
    TrendingUp,
    Users,
    FileText,
    Shield,
    Activity,
    Pill,
    HeartPulse,
    Clock,
    CheckCircle2,
    X
} from 'lucide-react'
import './ClinicalDecisionSupport.css'

interface Recommendation {
    id: string
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    guideline: string
    impactedMembers: number
    dueDate: string
}

const recommendations: Recommendation[] = [
    {
        id: '1',
        title: 'A1c Testing Overdue for Diabetic Members',
        description: 'Based on ADA guidelines, 847 members with diabetes have not received HbA1c testing in the past 6 months. Evidence shows regular monitoring reduces complications by 40%.',
        priority: 'high',
        guideline: 'ADA Standards of Care 2024',
        impactedMembers: 847,
        dueDate: 'Review by Feb 15'
    },
    {
        id: '2',
        title: 'Statin Therapy for High-Risk Cardiovascular Patients',
        description: 'ACC/AHA guidelines recommend statin therapy for 234 members with elevated ASCVD risk scores who are not currently on lipid-lowering medication.',
        priority: 'high',
        guideline: 'ACC/AHA CV Prevention 2023',
        impactedMembers: 234,
        dueDate: 'Review by Feb 20'
    },
    {
        id: '3',
        title: 'Preventive Screenings Due',
        description: 'USPSTF recommends colorectal cancer screening for 512 eligible members aged 45-75 who have not completed screening in the past 10 years.',
        priority: 'medium',
        guideline: 'USPSTF Recommendations',
        impactedMembers: 512,
        dueDate: 'Review by Mar 1'
    },
    {
        id: '4',
        title: 'Medication Reconciliation Alert',
        description: 'Potential drug interactions identified for 89 members taking multiple medications. Consider pharmacist consultation for comprehensive medication review.',
        priority: 'medium',
        guideline: 'ISMP Safety Guidelines',
        impactedMembers: 89,
        dueDate: 'Review by Feb 28'
    },
]

export default function ClinicalDecisionSupport() {
    return (
        <div className="clinical-decision-support">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <Stethoscope size={28} />
                    Clinical Decision Support
                    <span className="ai-badge">
                        <Brain size={14} />
                        AI Powered
                    </span>
                </h1>
                <p className="page-subtitle">
                    Evidence-based clinical recommendations and care gap alerts
                </p>
            </motion.div>

            {/* Alert Banner */}
            <motion.div
                className="cds-alert"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="alert-icon">
                    <AlertTriangle size={20} />
                </div>
                <div className="alert-content">
                    <h4>12 High-Priority Recommendations Pending</h4>
                    <p>Action required for 1,081 members with care gaps based on clinical guidelines</p>
                </div>
                <button className="alert-action">View All Alerts</button>
            </motion.div>

            {/* Stats Grid */}
            <div className="cds-stats">
                <motion.div
                    className="cds-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h4>Active Recommendations</h4>
                    <div className="value">
                        847
                        <span className="trend warning">+23</span>
                    </div>
                </motion.div>

                <motion.div
                    className="cds-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h4>Compliance Rate</h4>
                    <div className="value">
                        78.4%
                        <span className="trend positive">+4.2%</span>
                    </div>
                </motion.div>

                <motion.div
                    className="cds-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <h4>Guidelines Active</h4>
                    <div className="value">42</div>
                </motion.div>

                <motion.div
                    className="cds-stat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h4>Interventions This Month</h4>
                    <div className="value">
                        1,234
                        <span className="trend positive">+18%</span>
                    </div>
                </motion.div>
            </div>

            {/* Recommendations Panel */}
            <motion.div
                className="recommendations-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <h2>
                    <Brain size={20} />
                    AI-Generated Recommendations
                </h2>
                {recommendations.map((rec, index) => (
                    <motion.div
                        key={rec.id}
                        className={`recommendation-card ${rec.priority}-priority`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                    >
                        <div className="rec-header">
                            <h3>
                                {rec.priority === 'high' && <AlertTriangle size={16} style={{ color: '#ef4444' }} />}
                                {rec.title}
                            </h3>
                            <span className={`priority-badge ${rec.priority}`}>
                                {rec.priority}
                            </span>
                        </div>
                        <div className="rec-content">
                            <p>{rec.description}</p>
                            <div className="rec-meta">
                                <span>
                                    <FileText size={12} />
                                    {rec.guideline}
                                </span>
                                <span>
                                    <Users size={12} />
                                    {rec.impactedMembers.toLocaleString()} members
                                </span>
                                <span>
                                    <Clock size={12} />
                                    {rec.dueDate}
                                </span>
                            </div>
                        </div>
                        <div className="rec-actions">
                            <button className="rec-btn primary">
                                <CheckCircle2 size={14} style={{ marginRight: '0.35rem' }} />
                                Take Action
                            </button>
                            <button className="rec-btn secondary">
                                View Details
                            </button>
                            <button className="rec-btn secondary">
                                <X size={14} />
                                Dismiss
                            </button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Guidelines Grid */}
            <motion.div
                className="guidelines-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <div className="guideline-card">
                    <h3>
                        <div className="guideline-icon preventive">
                            <Shield size={16} />
                        </div>
                        Preventive Care
                    </h3>
                    <p>USPSTF, CDC immunization, and wellness screening guidelines integrated into member care pathways.</p>
                    <span className="guideline-count">18 active guidelines</span>
                </div>

                <div className="guideline-card">
                    <h3>
                        <div className="guideline-icon chronic">
                            <HeartPulse size={16} />
                        </div>
                        Chronic Disease
                    </h3>
                    <p>Evidence-based protocols for diabetes, hypertension, heart failure, and COPD management.</p>
                    <span className="guideline-count">14 active guidelines</span>
                </div>

                <div className="guideline-card">
                    <h3>
                        <div className="guideline-icon medication">
                            <Pill size={16} />
                        </div>
                        Medication Safety
                    </h3>
                    <p>Drug interaction checks, therapeutic duplications, and age-specific prescribing alerts.</p>
                    <span className="guideline-count">10 active guidelines</span>
                </div>
            </motion.div>
        </div>
    )
}
