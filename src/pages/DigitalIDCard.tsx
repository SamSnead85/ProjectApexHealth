import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard,
    Wallet,
    Share2,
    WifiOff,
    Shield,
    Smartphone,
    Download,
    Heart,
    Mail,
    FileDown,
    Copy,
    Check
} from 'lucide-react'
import { PageSkeleton, Button } from '../components/common'
import './DigitalIDCard.css'

export default function DigitalIDCard() {
    const [isFlipped, setIsFlipped] = useState(false)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    const handleCopyId = () => {
        navigator.clipboard?.writeText('APX-87429-001')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) return <PageSkeleton />

    return (
        <div className="digital-id-card">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <CreditCard size={28} />
                    Digital ID Card
                </h1>
                <p className="page-subtitle">
                    Access your member ID instantly on any device with mobile wallet integration
                </p>
            </motion.div>

            <div className="card-container">
                {/* ID Card Preview */}
                <motion.div
                    className="id-card-preview"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div
                        className={`id-card ${isFlipped ? 'flipped' : ''}`}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        {/* Front */}
                        <div className="card-front">
                            <div className="card-logo">
                                <div className="logo-icon">
                                    <Heart size={20} />
                                </div>
                                <div className="logo-text">
                                    Apex <span>Health</span>
                                </div>
                            </div>

                            <div className="member-info">
                                <div className="member-name">John A. Smith</div>
                                <div className="member-id" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    Member ID: APX-87429-001
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleCopyId() }}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: copied ? '#4ade80' : 'rgba(255,255,255,0.5)', display: 'flex', padding: '2px'
                                        }}
                                        title="Copy Member ID"
                                    >
                                        {copied ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>
                                    Dependent: Self
                                </div>
                            </div>

                            <div className="card-details">
                                <div className="detail-item">
                                    <label>Plan</label>
                                    <span>PPO Gold</span>
                                </div>
                                <div className="detail-item">
                                    <label>Group</label>
                                    <span>ACME-2024</span>
                                </div>
                                <div className="detail-item">
                                    <label>Effective</label>
                                    <span>01/01/2026</span>
                                </div>
                            </div>

                            <div className="card-chip">
                                <div className="chip-lines">
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                            </div>
                        </div>

                        {/* Back */}
                        <div className="card-back">
                            <div className="back-header">
                                <span>Plan & Pharmacy Information</span>
                            </div>

                            <div className="rxbin-group">
                                <div className="rxbin-item">
                                    <label>Group #</label>
                                    <span>ACME-2024</span>
                                </div>
                                <div className="rxbin-item">
                                    <label>Payer ID</label>
                                    <span>APX00612</span>
                                </div>
                                <div className="rxbin-item">
                                    <label>Plan Type</label>
                                    <span>PPO Gold</span>
                                </div>
                            </div>

                            <div className="rxbin-group">
                                <div className="rxbin-item">
                                    <label>RxBIN</label>
                                    <span>610014</span>
                                </div>
                                <div className="rxbin-item">
                                    <label>RxPCN</label>
                                    <span>HDPPO</span>
                                </div>
                                <div className="rxbin-item">
                                    <label>RxGRP</label>
                                    <span>APX2024</span>
                                </div>
                            </div>

                            <div className="rxbin-group">
                                <div className="rxbin-item">
                                    <label>Generic Copay</label>
                                    <span>$10</span>
                                </div>
                                <div className="rxbin-item">
                                    <label>Brand Copay</label>
                                    <span>$35</span>
                                </div>
                                <div className="rxbin-item">
                                    <label>Specialty</label>
                                    <span>$75</span>
                                </div>
                            </div>

                            <div className="contact-info">
                                <p><strong>Member Services:</strong> 1-800-555-APEX</p>
                                <p><strong>Provider Services:</strong> 1-800-555-PROV</p>
                                <p><strong>24/7 Nurse Line:</strong> 1-800-555-NURS</p>
                                <p><strong>Behavioral Health:</strong> 1-800-555-MIND</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-actions">
                        <button className="card-action-btn apple">
                            <Smartphone size={18} />
                            Add to Apple Wallet
                        </button>
                        <button className="card-action-btn google">
                            <Wallet size={18} />
                            Add to Google Pay
                        </button>
                    </div>

                    {/* Share & Download Actions */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            display: 'flex', gap: '0.6rem', justifyContent: 'center',
                            marginTop: '1rem', flexWrap: 'wrap'
                        }}
                    >
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={<Mail size={14} />}
                            onClick={() => {
                                window.location.href = 'mailto:?subject=My%20Apex%20Health%20ID%20Card&body=Here%20is%20my%20digital%20insurance%20ID%20card%20information.%0A%0AMember%20ID:%20APX-87429-001%0APlan:%20PPO%20Gold%0AGroup:%20ACME-2024%0APayer%20ID:%20APX00612'
                            }}
                        >
                            Share via Email
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={<FileDown size={14} />}
                            onClick={() => alert('Generating PDF of your ID card... Download will start shortly.')}
                        >
                            Download PDF
                        </Button>
                    </motion.div>

                    <p style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                        marginTop: '0.75rem'
                    }}>
                        Click card to flip &bull; Front shows coverage, back shows pharmacy & contact details
                    </p>
                </motion.div>

                {/* Features */}
                <motion.div
                    className="features-panel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3>Digital ID Features</h3>

                    <div className="feature-list">
                        <div className="feature-item">
                            <div className="feature-icon wallet">
                                <Wallet size={20} />
                            </div>
                            <div className="feature-content">
                                <h4>Mobile Wallet Integration</h4>
                                <p>Add your ID to Apple Wallet or Google Pay for instant access at the pharmacy or doctor's office.</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon share">
                                <Share2 size={20} />
                            </div>
                            <div className="feature-content">
                                <h4>Easy Sharing</h4>
                                <p>Share your ID with providers via QR code, email, or text message securely.</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon offline">
                                <WifiOff size={20} />
                            </div>
                            <div className="feature-content">
                                <h4>Works Offline</h4>
                                <p>Access your ID even without internet connection. Always have your coverage info.</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon secure">
                                <Shield size={20} />
                            </div>
                            <div className="feature-content">
                                <h4>HIPAA Compliant</h4>
                                <p>Bank-level encryption protects your health information at all times.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
