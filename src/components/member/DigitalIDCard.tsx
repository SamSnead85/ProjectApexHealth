import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard,
    Copy,
    Check,
    Shield,
    QrCode,
    Smartphone,
    Download,
    Share2
} from 'lucide-react'
import './DigitalIDCard.css'

interface DigitalIDCardProps {
    insurerName?: string
    insurerLogo?: string
    planName?: string
    memberName: string
    memberId: string
    groupNumber?: string
    effectiveDate?: string
    rxBin?: string
    rxPcn?: string
    variant?: 'teal' | 'blue' | 'purple'
}

export function DigitalIDCard({
    insurerName = 'Apex Health',
    planName = 'Gold Standard Plan',
    memberName,
    memberId,
    groupNumber = 'GRP-5621',
    effectiveDate = 'January 1, 2024',
    rxBin = '610014',
    rxPcn = 'OHCP',
    variant = 'teal'
}: DigitalIDCardProps) {
    const [copied, setCopied] = useState(false)
    const [isFlipped, setIsFlipped] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(memberId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="digital-id-card-container">
            <motion.div
                className={`digital-id-card digital-id-card--${variant}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div className={`digital-id-card__inner ${isFlipped ? 'digital-id-card__inner--flipped' : ''}`}>
                    {/* Front of Card */}
                    <div className="digital-id-card__front">
                        {/* Card Header */}
                        <div className="digital-id-card__header">
                            <div className="digital-id-card__badge">
                                <CreditCard size={14} />
                                <span>HEALTH ID</span>
                            </div>
                            <span className="digital-id-card__plan">{planName}</span>
                        </div>

                        {/* Insurer */}
                        <h2 className="digital-id-card__insurer">{insurerName}</h2>

                        {/* Member Info */}
                        <div className="digital-id-card__member-section">
                            <div className="digital-id-card__field">
                                <span className="digital-id-card__label">MEMBER NAME</span>
                                <span className="digital-id-card__value">{memberName}</span>
                            </div>
                        </div>

                        {/* IDs Row */}
                        <div className="digital-id-card__ids">
                            <div className="digital-id-card__field">
                                <span className="digital-id-card__label">MEMBER ID</span>
                                <span className="digital-id-card__value digital-id-card__value--mono">
                                    {memberId}
                                </span>
                            </div>
                            <div className="digital-id-card__field">
                                <span className="digital-id-card__label">GROUP #</span>
                                <span className="digital-id-card__value digital-id-card__value--mono">
                                    {groupNumber}
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="digital-id-card__footer">
                            <span className="digital-id-card__effective">
                                Eff: Rx • Effective: {effectiveDate}
                            </span>
                        </div>

                        {/* QR Code */}
                        <div className="digital-id-card__qr">
                            <QrCode size={48} />
                        </div>

                        {/* Flip Hint */}
                        <div className="digital-id-card__flip-hint">
                            Tap to flip
                        </div>

                        {/* Decorative Elements */}
                        <div className="digital-id-card__glow" />
                        <div className="digital-id-card__pattern" />
                    </div>

                    {/* Back of Card */}
                    <div className="digital-id-card__back">
                        <h3 className="digital-id-card__back-title">Pharmacy Information</h3>
                        <div className="digital-id-card__back-grid">
                            <div className="digital-id-card__field">
                                <span className="digital-id-card__label">RX BIN</span>
                                <span className="digital-id-card__value digital-id-card__value--mono">{rxBin}</span>
                            </div>
                            <div className="digital-id-card__field">
                                <span className="digital-id-card__label">RX PCN</span>
                                <span className="digital-id-card__value digital-id-card__value--mono">{rxPcn}</span>
                            </div>
                            <div className="digital-id-card__field">
                                <span className="digital-id-card__label">RX GROUP</span>
                                <span className="digital-id-card__value digital-id-card__value--mono">{groupNumber}</span>
                            </div>
                            <div className="digital-id-card__field">
                                <span className="digital-id-card__label">MEMBER ID</span>
                                <span className="digital-id-card__value digital-id-card__value--mono">{memberId}</span>
                            </div>
                        </div>
                        <p className="digital-id-card__back-note">
                            For customer service call: 1-800-APEX-HEALTH
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Card Actions */}
            <div className="digital-id-card__actions">
                <motion.button
                    className="digital-id-card__action"
                    onClick={handleCopy}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="digital-id-card__action-icon">
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </div>
                    <div className="digital-id-card__action-text">
                        <span className="digital-id-card__action-title">
                            {copied ? 'Copied!' : 'Copy Member ID'}
                        </span>
                        <span className="digital-id-card__action-subtitle">{memberId}</span>
                    </div>
                </motion.button>

                <motion.div
                    className="digital-id-card__status"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="digital-id-card__status-icon">
                        <Shield size={18} />
                    </div>
                    <div className="digital-id-card__status-text">
                        <span className="digital-id-card__status-title">Coverage Active</span>
                        <span className="digital-id-card__status-subtitle">
                            Your insurance is active and in good standing
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="digital-id-card__quick-actions">
                <button className="digital-id-card__quick-btn">
                    <Smartphone size={16} />
                    Add to Wallet
                </button>
                <button className="digital-id-card__quick-btn">
                    <Download size={16} />
                    Download PDF
                </button>
                <button className="digital-id-card__quick-btn">
                    <Share2 size={16} />
                    Share
                </button>
            </div>
        </div>
    )
}

export default DigitalIDCard
