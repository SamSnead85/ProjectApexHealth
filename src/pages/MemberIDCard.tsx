import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CreditCard,
    Download,
    Share2,
    Grid3X3,
    Copy,
    CheckCircle2,
    ArrowLeft
} from 'lucide-react'
import { Button } from '../components/common'
import './MemberIDCard.css'

interface MemberInfo {
    carrierId: string
    carrierName: string
    planName: string
    memberName: string
    memberId: string
    groupNumber: string
    effectiveDate: string
    rxBin: string
    rxPcn: string
    rxGroup: string
}

const memberInfo: MemberInfo = {
    carrierId: 'HEALTH ID',
    carrierName: 'Blue Cross Blue Shield',
    planName: 'Gold Standard Plan',
    memberName: 'Sarah Johnson',
    memberId: 'KH-2024-78432',
    groupNumber: 'GRP-5621',
    effectiveDate: 'January 1, 2024',
    rxBin: '610014',
    rxPcn: 'APEX',
    rxGroup: 'APXRX01'
}

export function MemberIDCard() {
    const [member] = useState<MemberInfo>(memberInfo)
    const [showBack, setShowBack] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCopyId = async () => {
        await navigator.clipboard.writeText(member.memberId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="id-card-page">
            {/* Header */}
            <header className="id-card-page__header">
                <div className="id-card-page__header-left">
                    <button className="id-card-page__back">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1>Digital ID Card</h1>
                        <p>Show this at any provider</p>
                    </div>
                </div>
                <div className="id-card-page__actions">
                    <Button variant="secondary" icon={<Download size={16} />}>
                        Download
                    </Button>
                    <Button variant="secondary" icon={<Share2 size={16} />}>
                        Share
                    </Button>
                </div>
            </header>

            {/* Card Container with 3D Effect */}
            <div className="id-card-3d-container">
                <motion.div
                    className="id-card-3d-wrapper"
                    animate={{ rotateY: showBack ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    onClick={() => setShowBack(!showBack)}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front of Card */}
                    <div className="id-card-3d id-card-3d--front">
                        {/* Gradient overlay */}
                        <div className="id-card-3d__gradient" />

                        {/* Card Content */}
                        <div className="id-card-3d__content">
                            {/* Header Row */}
                            <div className="id-card-3d__header">
                                <div className="id-card-3d__carrier-badge">
                                    <CreditCard size={14} />
                                    <span>{member.carrierId}</span>
                                </div>
                                <div className="id-card-3d__plan-info">
                                    <span className="id-card-3d__plan-label">PLAN</span>
                                    <span className="id-card-3d__plan-name">{member.planName}</span>
                                </div>
                            </div>

                            {/* Carrier Name */}
                            <h2 className="id-card-3d__carrier-name">{member.carrierName}</h2>

                            {/* Member Name */}
                            <div className="id-card-3d__member-section">
                                <span className="id-card-3d__label">MEMBER NAME</span>
                                <span className="id-card-3d__member-name">{member.memberName}</span>
                            </div>

                            {/* IDs Row */}
                            <div className="id-card-3d__ids-row">
                                <div className="id-card-3d__id-field">
                                    <span className="id-card-3d__label">MEMBER ID</span>
                                    <span className="id-card-3d__id-value">{member.memberId}</span>
                                </div>
                                <div className="id-card-3d__id-field">
                                    <span className="id-card-3d__label">GROUP #</span>
                                    <span className="id-card-3d__id-value">{member.groupNumber}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="id-card-3d__footer">
                                <span className="id-card-3d__tap-hint">Tap to flip • Effective: {member.effectiveDate}</span>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="id-card-3d__qr">
                            <Grid3X3 size={36} strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Back of Card */}
                    <div className="id-card-3d id-card-3d--back">
                        <div className="id-card-3d__gradient" />

                        <div className="id-card-3d__content">
                            <h3 className="id-card-3d__back-title">Pharmacy Benefits</h3>

                            <div className="id-card-3d__rx-grid">
                                <div className="id-card-3d__rx-item">
                                    <span className="id-card-3d__label">BIN</span>
                                    <span className="id-card-3d__rx-value">{member.rxBin}</span>
                                </div>
                                <div className="id-card-3d__rx-item">
                                    <span className="id-card-3d__label">PCN</span>
                                    <span className="id-card-3d__rx-value">{member.rxPcn}</span>
                                </div>
                                <div className="id-card-3d__rx-item">
                                    <span className="id-card-3d__label">GROUP</span>
                                    <span className="id-card-3d__rx-value">{member.rxGroup}</span>
                                </div>
                            </div>

                            <div className="id-card-3d__contact">
                                <h4>Member Services</h4>
                                <p>1-800-APEX-CARE (273-2227)</p>
                                <p>www.apexhealth.com</p>
                            </div>

                            <div className="id-card-3d__footer">
                                <span className="id-card-3d__tap-hint">Tap to flip</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Quick Action Cards */}
            <div className="id-card-page__quick-actions">
                <motion.button
                    className="id-card-quick-action"
                    onClick={handleCopyId}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="id-card-quick-action__icon">
                        <AnimatePresence mode="wait">
                            {copied ? (
                                <motion.div
                                    key="check"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                >
                                    <CheckCircle2 size={20} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="copy"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                >
                                    <Copy size={20} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="id-card-quick-action__text">
                        <span className="id-card-quick-action__title">
                            {copied ? 'Copied!' : 'Copy Member ID'}
                        </span>
                        <span className="id-card-quick-action__subtitle">{member.memberId}</span>
                    </div>
                </motion.button>

                <div className="id-card-quick-action id-card-quick-action--status">
                    <div className="id-card-quick-action__icon id-card-quick-action__icon--success">
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="id-card-quick-action__text">
                        <span className="id-card-quick-action__title">Coverage Active</span>
                        <span className="id-card-quick-action__subtitle">Your insurance is active and in good standing</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MemberIDCard
