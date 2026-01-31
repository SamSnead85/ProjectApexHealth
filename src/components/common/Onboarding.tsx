import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react'
import './Onboarding.css'

interface OnboardingStep {
    id: string
    title: string
    description: string
    target?: string // CSS selector for element to highlight
    position?: 'top' | 'bottom' | 'left' | 'right'
    image?: string
}

interface OnboardingTourProps {
    steps: OnboardingStep[]
    isOpen: boolean
    onComplete: () => void
    onDismiss: () => void
}

export function OnboardingTour({ steps, isOpen, onComplete, onDismiss }: OnboardingTourProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const step = steps[currentStep]
    const isLast = currentStep === steps.length - 1
    const isFirst = currentStep === 0

    const handleNext = () => {
        if (isLast) {
            onComplete()
        } else {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (!isFirst) {
            setCurrentStep(prev => prev - 1)
        }
    }

    useEffect(() => {
        if (!isOpen) setCurrentStep(0)
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="onboarding__overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                    <motion.div
                        className="onboarding__modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    >
                        <button className="onboarding__close" onClick={onDismiss}>
                            <X size={16} />
                        </button>

                        {step.image && (
                            <div className="onboarding__image">
                                <img src={step.image} alt={step.title} />
                            </div>
                        )}

                        <div className="onboarding__content">
                            <div className="onboarding__progress">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`onboarding__progress-dot ${i === currentStep ? 'onboarding__progress-dot--active' : ''} ${i < currentStep ? 'onboarding__progress-dot--completed' : ''}`}
                                    />
                                ))}
                            </div>

                            <h3 className="onboarding__title">{step.title}</h3>
                            <p className="onboarding__description">{step.description}</p>

                            <div className="onboarding__actions">
                                {!isFirst && (
                                    <button className="onboarding__btn onboarding__btn--secondary" onClick={handlePrev}>
                                        <ChevronLeft size={16} />
                                        Back
                                    </button>
                                )}
                                <button className="onboarding__btn onboarding__btn--primary" onClick={handleNext}>
                                    {isLast ? (
                                        <>
                                            <Check size={16} />
                                            Get Started
                                        </>
                                    ) : (
                                        <>
                                            Next
                                            <ChevronRight size={16} />
                                        </>
                                    )}
                                </button>
                            </div>

                            <button className="onboarding__skip" onClick={onDismiss}>
                                Skip tutorial
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// Welcome modal for first-time users
interface WelcomeModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    description?: string
    features?: { icon: ReactNode; title: string; description: string }[]
    actionLabel?: string
    onAction?: () => void
}

export function WelcomeModal({
    isOpen,
    onClose,
    title = 'Welcome to the Platform',
    description = 'Here are some things to help you get started.',
    features = [],
    actionLabel = 'Get Started',
    onAction
}: WelcomeModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="welcome__overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="welcome__modal"
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    >
                        <h2 className="welcome__title">{title}</h2>
                        <p className="welcome__description">{description}</p>

                        {features.length > 0 && (
                            <div className="welcome__features">
                                {features.map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        className="welcome__feature"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div className="welcome__feature-icon">{feature.icon}</div>
                                        <div className="welcome__feature-content">
                                            <span className="welcome__feature-title">{feature.title}</span>
                                            <span className="welcome__feature-description">{feature.description}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        <div className="welcome__actions">
                            <button
                                className="welcome__btn"
                                onClick={() => { onAction?.(); onClose() }}
                            >
                                {actionLabel}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default OnboardingTour
