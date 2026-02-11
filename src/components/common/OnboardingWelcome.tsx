import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  BarChart3,
  Phone,
  Shield,
  X,
  ChevronRight,
  Zap,
  ClipboardList,
  LineChart,
  Settings2,
  Hexagon,
  Check
} from 'lucide-react'

// ============================================
// TYPES
// ============================================
interface OnboardingWelcomeProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (path: string) => void
  userRole?: 'admin' | 'broker' | 'employer' | 'member'
}

// ============================================
// CONSTANTS
// ============================================
const STORAGE_KEY = 'apex_onboarding_dismissed'

const TEAL = '#0D9488'
const TEAL_LIGHT = '#14B8A6'
const TEAL_DIM = 'rgba(13, 148, 136, 0.15)'

const featureHighlights = [
  {
    icon: Brain,
    title: 'AI-Powered Claims',
    description: 'Auto-adjudicate 94% of claims with ML',
    color: '#8B5CF6'
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Executive dashboards with predictive insights',
    color: '#3B82F6'
  },
  {
    icon: Phone,
    title: 'Voice AI Center',
    description: 'Build and deploy AI voice agents',
    color: '#F59E0B'
  },
  {
    icon: Shield,
    title: 'Compliance Automation',
    description: 'HIPAA, HITRUST, CMS-0057-F ready',
    color: TEAL
  }
]

interface QuickStartCard {
  icon: typeof Brain
  title: string
  description: string
  path: string
}

const quickStartByRole: Record<string, QuickStartCard[]> = {
  admin: [
    {
      icon: ClipboardList,
      title: 'Review Claims Queue',
      description: 'Process pending claims with AI-assisted adjudication',
      path: '/claims'
    },
    {
      icon: LineChart,
      title: 'Check Analytics',
      description: 'View real-time performance metrics and trends',
      path: '/analytics'
    },
    {
      icon: Settings2,
      title: 'Configure Workflows',
      description: 'Set up automated processing rules and triggers',
      path: '/workflows'
    }
  ],
  default: [
    {
      icon: BarChart3,
      title: 'View Dashboard',
      description: 'Get a bird\'s-eye view of your health platform',
      path: '/dashboard'
    },
    {
      icon: ClipboardList,
      title: 'Explore Claims',
      description: 'Browse and track claims status in real time',
      path: '/claims'
    },
    {
      icon: Shield,
      title: 'Compliance Center',
      description: 'Review compliance status and audit readiness',
      path: '/compliance'
    }
  ]
}

// ============================================
// ANIMATION VARIANTS
// ============================================
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } }
}

const panelVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 28, stiffness: 320, delay: 0.05 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.18 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 + i * 0.08, type: 'spring', damping: 22, stiffness: 260 }
  })
}

const stepContentVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 26, stiffness: 280 }
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    transition: { duration: 0.15 }
  })
}

// ============================================
// STYLES
// ============================================
const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: '24px'
  },
  panel: {
    position: 'relative' as const,
    width: '100%',
    maxWidth: 620,
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    background: 'rgba(10, 15, 26, 0.95)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '40px 36px 32px',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
    color: 'var(--apex-white, #FFFFFF)'
  },
  closeBtn: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--apex-steel, #94A3B8)',
    transition: 'all 0.2s'
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: `linear-gradient(135deg, ${TEAL}, ${TEAL_LIGHT})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 24px rgba(13, 148, 136, 0.35)`
  },
  title: {
    textAlign: 'center' as const,
    fontSize: 24,
    fontWeight: 700,
    margin: '0 0 6px',
    letterSpacing: '-0.02em',
    color: 'var(--apex-white, #FFFFFF)'
  },
  subtitle: {
    textAlign: 'center' as const,
    fontSize: 14,
    color: 'var(--apex-steel, #94A3B8)',
    margin: '0 0 32px',
    fontWeight: 400
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: TEAL,
    marginBottom: 14
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12
  },
  featureCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: '18px 16px',
    cursor: 'default',
    transition: 'all 0.25s'
  },
  featureIconWrap: (color: string) => ({
    width: 38,
    height: 38,
    borderRadius: 10,
    background: `${color}18`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  }),
  featureTitle: {
    fontSize: 13,
    fontWeight: 600,
    margin: '0 0 4px',
    color: 'var(--apex-white, #FFFFFF)'
  },
  featureDesc: {
    fontSize: 12,
    color: 'var(--apex-silver, #CBD5E1)',
    margin: 0,
    lineHeight: 1.45
  },
  quickStartList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10
  },
  quickStartCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.25s'
  },
  quickStartIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: TEAL_DIM,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  quickStartContent: {
    flex: 1,
    minWidth: 0
  },
  quickStartTitle: {
    fontSize: 14,
    fontWeight: 600,
    margin: '0 0 2px',
    color: 'var(--apex-white, #FFFFFF)'
  },
  quickStartDesc: {
    fontSize: 12,
    color: 'var(--apex-steel, #94A3B8)',
    margin: 0
  },
  goBtn: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 8,
    background: TEAL,
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    transition: 'all 0.2s'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    paddingTop: 20,
    borderTop: '1px solid rgba(255,255,255,0.06)'
  },
  checkboxWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer'
  },
  checkbox: (checked: boolean) => ({
    width: 18,
    height: 18,
    borderRadius: 5,
    border: checked ? `2px solid ${TEAL}` : '2px solid rgba(255,255,255,0.15)',
    background: checked ? TEAL : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0
  }),
  checkboxLabel: {
    fontSize: 12,
    color: 'var(--apex-steel, #94A3B8)',
    userSelect: 'none' as const
  },
  dotsWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  dot: (active: boolean) => ({
    width: active ? 20 : 8,
    height: 8,
    borderRadius: 4,
    background: active ? TEAL : 'rgba(255,255,255,0.12)',
    transition: 'all 0.3s'
  }),
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 22px',
    borderRadius: 10,
    border: 'none',
    background: `linear-gradient(135deg, ${TEAL}, ${TEAL_LIGHT})`,
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: `0 4px 16px rgba(13, 148, 136, 0.3)`
  }
}

// ============================================
// COMPONENT
// ============================================
export function OnboardingWelcome({
  isOpen,
  onClose,
  onNavigate,
  userRole
}: OnboardingWelcomeProps) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const totalSteps = 2

  // Check localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'true') {
        setDismissed(true)
      }
    } catch {
      // localStorage unavailable
    }
  }, [])

  // Auto-close when dismissed from storage
  useEffect(() => {
    if (dismissed && isOpen) {
      onClose()
    }
  }, [dismissed, isOpen, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen && !dismissed) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, dismissed])

  // Keyboard dismiss
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dontShowAgain]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true')
      } catch {
        // localStorage unavailable
      }
    }
    onClose()
  }

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setDirection(1)
      setStep(s => s + 1)
    } else {
      handleClose()
    }
  }

  const handleGoTo = (path: string) => {
    handleClose()
    onNavigate(path)
  }

  const roleCards = quickStartByRole[userRole || ''] || quickStartByRole.default

  if (dismissed) return null

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          style={styles.overlay}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleClose}
        >
          <motion.div
            style={styles.panel}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              style={styles.closeBtn}
              onClick={handleClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.color = 'var(--apex-steel, #94A3B8)'
              }}
              aria-label="Close onboarding"
            >
              <X size={18} />
            </button>

            {/* Logo */}
            <div style={styles.logoWrap}>
              <motion.div
                style={styles.logoIcon}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.15 }}
              >
                <Hexagon size={28} color="#fff" strokeWidth={2.2} />
              </motion.div>
            </div>

            {/* Title */}
            <motion.h2
              style={styles.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Welcome to Apex Health Intelligence
            </motion.h2>
            <motion.p
              style={styles.subtitle}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
            >
              Your AI-native healthcare administration platform
            </motion.p>

            {/* Step Content */}
            <div style={{ minHeight: 240, position: 'relative', overflow: 'hidden' }}>
              <AnimatePresence mode="wait" custom={direction}>
                {step === 0 && (
                  <motion.div
                    key="features"
                    custom={direction}
                    variants={stepContentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <div style={styles.sectionLabel}>Platform Highlights</div>
                    <div style={styles.featureGrid}>
                      {featureHighlights.map((feature, i) => {
                        const Icon = feature.icon
                        return (
                          <motion.div
                            key={feature.title}
                            style={styles.featureCard}
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{
                              background: 'rgba(255,255,255,0.06)',
                              borderColor: 'rgba(255,255,255,0.12)',
                              y: -2
                            }}
                          >
                            <div style={styles.featureIconWrap(feature.color)}>
                              <Icon size={20} color={feature.color} />
                            </div>
                            <p style={styles.featureTitle}>{feature.title}</p>
                            <p style={styles.featureDesc}>{feature.description}</p>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="quickstart"
                    custom={direction}
                    variants={stepContentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <div style={styles.sectionLabel}>
                      <Zap size={12} style={{ marginRight: 4, verticalAlign: -1 }} />
                      Quick Start
                    </div>
                    <div style={styles.quickStartList}>
                      {roleCards.map((card, i) => {
                        const Icon = card.icon
                        return (
                          <motion.div
                            key={card.title}
                            style={styles.quickStartCard}
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{
                              background: 'rgba(255,255,255,0.06)',
                              borderColor: 'rgba(255,255,255,0.12)'
                            }}
                            onClick={() => handleGoTo(card.path)}
                          >
                            <div style={styles.quickStartIconWrap}>
                              <Icon size={20} color={TEAL} />
                            </div>
                            <div style={styles.quickStartContent}>
                              <p style={styles.quickStartTitle}>{card.title}</p>
                              <p style={styles.quickStartDesc}>{card.description}</p>
                            </div>
                            <button
                              style={styles.goBtn}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleGoTo(card.path)
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = TEAL_LIGHT
                                e.currentTarget.style.transform = 'scale(1.08)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = TEAL
                                e.currentTarget.style.transform = 'scale(1)'
                              }}
                              aria-label={`Go to ${card.title}`}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              {/* Don't show again */}
              <div
                style={styles.checkboxWrap}
                onClick={() => setDontShowAgain(v => !v)}
                role="checkbox"
                aria-checked={dontShowAgain}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setDontShowAgain(v => !v)
                  }
                }}
              >
                <div style={styles.checkbox(dontShowAgain)}>
                  {dontShowAgain && <Check size={12} color="#fff" strokeWidth={3} />}
                </div>
                <span style={styles.checkboxLabel}>Don&apos;t show again</span>
              </div>

              {/* Step dots + button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={styles.dotsWrap}>
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <motion.div
                      key={i}
                      style={styles.dot(i === step)}
                      layout
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    />
                  ))}
                </div>
                <motion.button
                  style={styles.primaryBtn}
                  whileHover={{ scale: 1.04, boxShadow: `0 6px 24px rgba(13, 148, 136, 0.45)` }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNext}
                >
                  {step < totalSteps - 1 ? (
                    <>
                      Next
                      <ChevronRight size={15} />
                    </>
                  ) : (
                    'Get Started'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OnboardingWelcome
