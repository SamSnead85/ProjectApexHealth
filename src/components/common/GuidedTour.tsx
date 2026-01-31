import { ReactNode, useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, HelpCircle, Lightbulb, X, ChevronLeft, ChevronRight, Check, ArrowRight } from 'lucide-react'
import './GuidedTour.css'

interface TourStep {
    id: string
    target: string // CSS selector
    title: string
    content: ReactNode
    position?: 'top' | 'bottom' | 'left' | 'right'
    action?: { label: string; onClick: () => void }
    highlight?: boolean
}

interface GuidedTourProps {
    steps: TourStep[]
    isOpen: boolean
    onComplete: () => void
    onSkip?: () => void
    onStepChange?: (step: number) => void
    showProgress?: boolean
    className?: string
}

export function GuidedTour({
    steps,
    isOpen,
    onComplete,
    onSkip,
    onStepChange,
    showProgress = true,
    className = ''
}: GuidedTourProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
    const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom')

    const step = steps[currentStep]
    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === steps.length - 1

    useEffect(() => {
        if (!isOpen || !step) return

        const updatePosition = () => {
            const target = document.querySelector(step.target)
            if (!target) return

            const rect = target.getBoundingClientRect()
            const tooltipWidth = 320
            const tooltipHeight = 180
            const offset = 16

            let top = 0
            let left = 0
            let position = step.position || 'bottom'

            // Calculate best position
            switch (position) {
                case 'top':
                    top = rect.top - tooltipHeight - offset
                    left = rect.left + rect.width / 2 - tooltipWidth / 2
                    break
                case 'bottom':
                    top = rect.bottom + offset
                    left = rect.left + rect.width / 2 - tooltipWidth / 2
                    break
                case 'left':
                    top = rect.top + rect.height / 2 - tooltipHeight / 2
                    left = rect.left - tooltipWidth - offset
                    break
                case 'right':
                    top = rect.top + rect.height / 2 - tooltipHeight / 2
                    left = rect.right + offset
                    break
            }

            // Adjust if off-screen
            left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16))
            top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16))

            setTooltipPosition({ top, left })
            setArrowPosition(position)

            // Highlight target
            if (step.highlight) {
                target.classList.add('tour-highlight')
            }
        }

        updatePosition()
        window.addEventListener('resize', updatePosition)
        window.addEventListener('scroll', updatePosition)

        return () => {
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', updatePosition)

            const target = document.querySelector(step.target)
            if (target) target.classList.remove('tour-highlight')
        }
    }, [isOpen, step, currentStep])

    const goToStep = (index: number) => {
        setCurrentStep(index)
        onStepChange?.(index)
    }

    const handleNext = () => {
        if (isLastStep) {
            onComplete()
        } else {
            goToStep(currentStep + 1)
        }
    }

    const handlePrev = () => {
        if (!isFirstStep) {
            goToStep(currentStep - 1)
        }
    }

    if (!isOpen || !step) return null

    return (
        <>
            {/* Overlay */}
            <div className="guided-tour__overlay" onClick={onSkip} />

            {/* Tooltip */}
            <motion.div
                className={`guided-tour__tooltip guided-tour__tooltip--${arrowPosition} ${className}`}
                style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
            >
                <div className="guided-tour__header">
                    <Lightbulb size={16} />
                    <span className="guided-tour__title">{step.title}</span>
                    {onSkip && (
                        <button className="guided-tour__close" onClick={onSkip}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="guided-tour__content">
                    {step.content}
                </div>

                {showProgress && (
                    <div className="guided-tour__progress">
                        {steps.map((_, index) => (
                            <span
                                key={index}
                                className={`guided-tour__dot ${index === currentStep ? 'guided-tour__dot--active' : ''} ${index < currentStep ? 'guided-tour__dot--completed' : ''}`}
                            />
                        ))}
                    </div>
                )}

                <div className="guided-tour__actions">
                    {!isFirstStep && (
                        <button className="guided-tour__btn guided-tour__btn--secondary" onClick={handlePrev}>
                            <ChevronLeft size={14} />
                            Back
                        </button>
                    )}
                    {step.action && (
                        <button className="guided-tour__btn guided-tour__btn--action" onClick={step.action.onClick}>
                            {step.action.label}
                        </button>
                    )}
                    <button className="guided-tour__btn guided-tour__btn--primary" onClick={handleNext}>
                        {isLastStep ? (
                            <>
                                <Check size={14} />
                                Done
                            </>
                        ) : (
                            <>
                                Next
                                <ChevronRight size={14} />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </>
    )
}

// Tooltip component
interface TooltipProps {
    content: ReactNode
    position?: 'top' | 'bottom' | 'left' | 'right'
    delay?: number
    children: ReactNode
    className?: string
}

export function Tooltip({
    content,
    position = 'top',
    delay = 200,
    children,
    className = ''
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout>()
    const triggerRef = useRef<HTMLSpanElement>(null)

    const show = () => {
        timeoutRef.current = setTimeout(() => setIsVisible(true), delay)
    }

    const hide = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setIsVisible(false)
    }

    return (
        <span
            ref={triggerRef}
            className={`tooltip-wrapper ${className}`}
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.span
                        className={`tooltip tooltip--${position}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                    >
                        {content}
                    </motion.span>
                )}
            </AnimatePresence>
        </span>
    )
}

// Info button with tooltip
interface InfoTooltipProps {
    content: ReactNode
    position?: 'top' | 'bottom' | 'left' | 'right'
}

export function InfoTooltip({ content, position = 'top' }: InfoTooltipProps) {
    return (
        <Tooltip content={content} position={position}>
            <span className="info-tooltip">
                <Info size={14} />
            </span>
        </Tooltip>
    )
}

// Help button with popover
interface HelpButtonProps {
    title: string
    content: ReactNode
    links?: { label: string; url: string }[]
}

export function HelpButton({ title, content, links }: HelpButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="help-button__wrapper">
            <button className="help-button" onClick={() => setIsOpen(!isOpen)}>
                <HelpCircle size={16} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="help-button__overlay" onClick={() => setIsOpen(false)} />
                        <motion.div
                            className="help-button__popover"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <h4 className="help-button__title">{title}</h4>
                            <div className="help-button__content">{content}</div>
                            {links && links.length > 0 && (
                                <div className="help-button__links">
                                    {links.map((link, i) => (
                                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer">
                                            {link.label}
                                            <ArrowRight size={12} />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default GuidedTour
