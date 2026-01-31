import { ReactNode, useState, useCallback, useMemo, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check, Circle, Loader2, AlertCircle } from 'lucide-react'
import './FormWizard.css'

interface WizardStep {
    id: string
    title: string
    description?: string
    icon?: ReactNode
    validate?: () => boolean | Promise<boolean>
    optional?: boolean
}

interface FormWizardProps {
    steps: WizardStep[]
    children: ReactNode[]
    onComplete: () => void
    onStepChange?: (step: number) => void
    showProgress?: boolean
    allowSkip?: boolean
    allowBack?: boolean
    completeButtonText?: string
    nextButtonText?: string
    backButtonText?: string
    className?: string
}

export function FormWizard({
    steps,
    children,
    onComplete,
    onStepChange,
    showProgress = true,
    allowSkip = false,
    allowBack = true,
    completeButtonText = 'Complete',
    nextButtonText = 'Continue',
    backButtonText = 'Back',
    className = ''
}: FormWizardProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
    const [isValidating, setIsValidating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === steps.length - 1
    const progress = ((currentStep + 1) / steps.length) * 100

    const goToStep = useCallback(async (step: number) => {
        if (step < 0 || step >= steps.length) return

        // Going back doesn't require validation
        if (step < currentStep) {
            setCurrentStep(step)
            setError(null)
            onStepChange?.(step)
            return
        }

        // Validate current step before advancing
        const currentStepConfig = steps[currentStep]
        if (currentStepConfig.validate) {
            setIsValidating(true)
            setError(null)
            try {
                const isValid = await currentStepConfig.validate()
                if (!isValid) {
                    setError('Please complete this step before continuing')
                    setIsValidating(false)
                    return
                }
            } catch (err) {
                setError('Validation failed. Please try again.')
                setIsValidating(false)
                return
            }
            setIsValidating(false)
        }

        setCompletedSteps(prev => new Set([...prev, currentStep]))
        setCurrentStep(step)
        setError(null)
        onStepChange?.(step)
    }, [currentStep, steps, onStepChange])

    const handleNext = () => {
        if (isLastStep) {
            onComplete()
        } else {
            goToStep(currentStep + 1)
        }
    }

    const handleBack = () => {
        if (!isFirstStep) {
            goToStep(currentStep - 1)
        }
    }

    const handleSkip = () => {
        if (!isLastStep && (allowSkip || steps[currentStep].optional)) {
            goToStep(currentStep + 1)
        }
    }

    return (
        <div className={`form-wizard ${className}`}>
            {/* Progress Bar */}
            {showProgress && (
                <div className="form-wizard__progress">
                    <div className="form-wizard__progress-bar">
                        <motion.div
                            className="form-wizard__progress-fill"
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="form-wizard__progress-text">
                        Step {currentStep + 1} of {steps.length}
                    </span>
                </div>
            )}

            {/* Steps Indicator */}
            <div className="form-wizard__steps">
                {steps.map((step, index) => {
                    const isCompleted = completedSteps.has(index)
                    const isCurrent = index === currentStep

                    return (
                        <div
                            key={step.id}
                            className={`form-wizard__step ${isCurrent ? 'form-wizard__step--current' : ''} ${isCompleted ? 'form-wizard__step--completed' : ''}`}
                            onClick={() => index < currentStep && goToStep(index)}
                        >
                            <div className="form-wizard__step-indicator">
                                {isCompleted ? (
                                    <Check size={14} />
                                ) : step.icon ? (
                                    step.icon
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </div>
                            <div className="form-wizard__step-info">
                                <span className="form-wizard__step-title">{step.title}</span>
                                {step.description && (
                                    <span className="form-wizard__step-desc">{step.description}</span>
                                )}
                            </div>
                            {index < steps.length - 1 && <div className="form-wizard__step-connector" />}
                        </div>
                    )
                })}
            </div>

            {/* Content */}
            <div className="form-wizard__content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children[currentStep]}
                    </motion.div>
                </AnimatePresence>

                {error && (
                    <motion.div
                        className="form-wizard__error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <AlertCircle size={16} />
                        {error}
                    </motion.div>
                )}
            </div>

            {/* Actions */}
            <div className="form-wizard__actions">
                {allowBack && !isFirstStep && (
                    <button className="form-wizard__btn form-wizard__btn--secondary" onClick={handleBack}>
                        <ChevronLeft size={16} />
                        {backButtonText}
                    </button>
                )}

                <div className="form-wizard__actions-right">
                    {(allowSkip || steps[currentStep].optional) && !isLastStep && (
                        <button className="form-wizard__btn form-wizard__btn--ghost" onClick={handleSkip}>
                            Skip
                        </button>
                    )}

                    <button
                        className="form-wizard__btn form-wizard__btn--primary"
                        onClick={handleNext}
                        disabled={isValidating}
                    >
                        {isValidating ? (
                            <Loader2 size={16} className="spin" />
                        ) : isLastStep ? (
                            completeButtonText
                        ) : (
                            <>
                                {nextButtonText}
                                <ChevronRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Simple multi-step form
interface MultiStepFormProps {
    steps: { title: string; content: ReactNode }[]
    onSubmit: () => void
    className?: string
}

export function MultiStepForm({ steps, onSubmit, className = '' }: MultiStepFormProps) {
    const wizardSteps = steps.map((step, index) => ({
        id: `step-${index}`,
        title: step.title
    }))

    return (
        <FormWizard steps={wizardSteps} onComplete={onSubmit} className={className}>
            {steps.map((step, index) => (
                <div key={index}>{step.content}</div>
            ))}
        </FormWizard>
    )
}

export default FormWizard
