import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle } from 'lucide-react'
import { Button } from '../common'
import './GuidedTour.css'

export interface TourStep {
    id: string
    title: string
    description: string
    target?: string // CSS selector for the element to highlight
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
    action?: string // Optional action label
}

interface GuidedTourProps {
    steps: TourStep[]
    isOpen: boolean
    onClose: () => void
    onComplete?: () => void
    tourName: string
}

export function GuidedTour({ steps, isOpen, onClose, onComplete, tourName }: GuidedTourProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

    const step = steps[currentStep]
    const isLastStep = currentStep === steps.length - 1
    const isFirstStep = currentStep === 0

    // Find and highlight the target element
    useEffect(() => {
        if (!isOpen || !step?.target) {
            setTargetRect(null)
            return
        }

        const findElement = () => {
            const element = document.querySelector(step.target!)
            if (element) {
                const rect = element.getBoundingClientRect()
                setTargetRect(rect)
            }
        }

        findElement()
        // Re-calculate on resize
        window.addEventListener('resize', findElement)
        return () => window.removeEventListener('resize', findElement)
    }, [isOpen, step])

    const handleNext = useCallback(() => {
        if (isLastStep) {
            onComplete?.()
            onClose()
        } else {
            setCurrentStep(prev => prev + 1)
        }
    }, [isLastStep, onComplete, onClose])

    const handlePrev = useCallback(() => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1)
        }
    }, [isFirstStep])

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return
        if (e.key === 'Escape') onClose()
        if (e.key === 'ArrowRight') handleNext()
        if (e.key === 'ArrowLeft') handlePrev()
    }, [isOpen, onClose, handleNext, handlePrev])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    // Reset step when opening
    useEffect(() => {
        if (isOpen) setCurrentStep(0)
    }, [isOpen])

    if (!isOpen) return null

    const getTooltipPosition = () => {
        if (!targetRect || step.position === 'center') {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            }
        }

        const padding = 16
        const tooltipWidth = 360 // Approximate

        switch (step.position) {
            case 'top':
                return {
                    bottom: `${window.innerHeight - targetRect.top + padding}px`,
                    left: `${targetRect.left + targetRect.width / 2}px`,
                    transform: 'translateX(-50%)'
                }
            case 'bottom':
                return {
                    top: `${targetRect.bottom + padding}px`,
                    left: `${targetRect.left + targetRect.width / 2}px`,
                    transform: 'translateX(-50%)'
                }
            case 'left':
                return {
                    top: `${targetRect.top + targetRect.height / 2}px`,
                    right: `${window.innerWidth - targetRect.left + padding}px`,
                    transform: 'translateY(-50%)'
                }
            case 'right':
            default:
                return {
                    top: `${targetRect.top + targetRect.height / 2}px`,
                    left: `${targetRect.right + padding}px`,
                    transform: 'translateY(-50%)'
                }
        }
    }

    return (
        <AnimatePresence>
            <div className="guided-tour">
                {/* Overlay */}
                <motion.div
                    className="guided-tour__overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                />

                {/* Spotlight cutout */}
                {targetRect && (
                    <motion.div
                        className="guided-tour__spotlight"
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            top: targetRect.top - 8,
                            left: targetRect.left - 8,
                            width: targetRect.width + 16,
                            height: targetRect.height + 16,
                        }}
                    />
                )}

                {/* Tooltip */}
                <motion.div
                    className="guided-tour__tooltip"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={getTooltipPosition()}
                >
                    {/* Header */}
                    <div className="guided-tour__header">
                        <div className="guided-tour__badge">
                            <Sparkles size={12} />
                            <span>{tourName}</span>
                        </div>
                        <button className="guided-tour__close" onClick={onClose}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="guided-tour__content">
                        <h3 className="guided-tour__title">{step.title}</h3>
                        <p className="guided-tour__description">{step.description}</p>
                    </div>

                    {/* Progress */}
                    <div className="guided-tour__progress">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`guided-tour__dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                            />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="guided-tour__actions">
                        <span className="guided-tour__step-count">
                            {currentStep + 1} of {steps.length}
                        </span>
                        <div className="guided-tour__buttons">
                            {!isFirstStep && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handlePrev}
                                    icon={<ChevronLeft size={14} />}
                                >
                                    Back
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleNext}
                                icon={isLastStep ? <CheckCircle size={14} /> : <ChevronRight size={14} />}
                                iconPosition="right"
                            >
                                {isLastStep ? 'Complete' : 'Next'}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

// Pre-defined tour configurations
export const ADMIN_TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to the Admin Dashboard',
        description: 'This is your command center for managing healthcare operations. Let\'s take a quick tour of the key features.',
        position: 'center'
    },
    {
        id: 'ai-forecast',
        title: 'AI-Powered Forecasting',
        description: 'Get real-time predictions on claims volume, costs, and potential issues before they happen.',
        target: '[data-tour="ai-forecast"]',
        position: 'bottom'
    },
    {
        id: 'smart-actions',
        title: 'Smart Actions',
        description: 'AI-prioritized tasks that need your attention, ranked by impact and urgency.',
        target: '[data-tour="smart-actions"]',
        position: 'left'
    },
    {
        id: 'sidebar',
        title: 'Navigation Sidebar',
        description: 'Access all modules including Claims, Prior Auth, Document AI, and the new Agent Assist Dashboard.',
        target: '.sidebar',
        position: 'right'
    },
    {
        id: 'complete',
        title: 'You\'re All Set!',
        description: 'Explore the platform and discover powerful tools for healthcare administration. Use the AI Copilot in the bottom right for help anytime.',
        position: 'center'
    }
]

export const MEMBER_TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Your Benefits Portal',
        description: 'Manage your healthcare benefits, find providers, and track your health journey all in one place.',
        position: 'center'
    },
    {
        id: 'coverage',
        title: 'Coverage Summary',
        description: 'See your deductible, out-of-pocket maximum, and claims at a glance.',
        target: '.member-home__metrics',
        position: 'bottom'
    },
    {
        id: 'quick-actions',
        title: 'Quick Actions',
        description: 'Find doctors, view EOBs, estimate costs, and access your digital ID card.',
        target: '.member-home__quick-actions',
        position: 'top'
    },
    {
        id: 'care-journey',
        title: 'Care Journey Navigator',
        description: 'Track your health journey with personalized insights from members like you.',
        target: '[data-tour="care-journey"]',
        position: 'right'
    },
    {
        id: 'concierge',
        title: 'AI Health Concierge',
        description: 'Get instant answers about your benefits, find the right care, and book appointments.',
        target: '[data-tour="concierge"]',
        position: 'right'
    }
]

export const BROKER_TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to the Broker Command Center',
        description: 'Your complete sales and client management hub. Track pipeline, commissions, and client health.',
        position: 'center'
    },
    {
        id: 'pipeline',
        title: 'Sales Pipeline',
        description: 'Visual funnel of your active opportunities with AI-scored deal insights.',
        target: '.bcc__pipeline',
        position: 'bottom'
    },
    {
        id: 'book',
        title: 'Book of Business',
        description: 'Client health scores, renewal risks, and premium tracking at a glance.',
        target: '.bcc__book',
        position: 'top'
    },
    {
        id: 'ai-recs',
        title: 'AI Recommendations',
        description: 'Upsell opportunities, retention alerts, and growth insights powered by Intellisure™.',
        target: '.bcc__ai-panel',
        position: 'left'
    }
]

export default GuidedTour
