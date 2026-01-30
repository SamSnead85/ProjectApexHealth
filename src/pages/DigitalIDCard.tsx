import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard,
    Wallet,
    Share2,
    WifiOff,
    Shield,
    Smartphone,
    Download,
    Heart
} from 'lucide-react'
import './DigitalIDCard.css'

export default function DigitalIDCard() {
    const [isFlipped, setIsFlipped] = useState(false)

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
                                <div className="member-id">Member ID: APX-87429-001</div>
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
                            <div className="back-header">Pharmacy Benefits</div>

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
                                    <label>Copay Generic</label>
                                    <span>$10</span>
                                </div>
                                <div className="rxbin-item">
                                    <label>Brand</label>
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

                    <p style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                        marginTop: '1rem'
                    }}>
                        Click card to flip
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
