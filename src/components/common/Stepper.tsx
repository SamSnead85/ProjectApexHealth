import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import './Stepper.css'

interface Step {
    id: string
    title: string
    description?: string
    icon?: ReactNode
}

interface StepperProps {
    steps: Step[]
    currentStep: number
    orientation?: 'horizontal' | 'vertical'
    variant?: 'default' | 'numbered' | 'dotted'
    size?: 'sm' | 'md' | 'lg'
    onStepClick?: (index: number) => void
    className?: string
}

export function Stepper({
    steps,
    currentStep,
    orientation = 'horizontal',
    variant = 'default',
    size = 'md',
    onStepClick,
    className = ''
}: StepperProps) {
    const getStepStatus = (index: number) => {
        if (index < currentStep) return 'completed'
        if (index === currentStep) return 'current'
        return 'upcoming'
    }

    return (
        <div className={`stepper stepper--${orientation} stepper--${variant} stepper--${size} ${className}`}>
            {steps.map((step, index) => {
                const status = getStepStatus(index)
                const isLast = index === steps.length - 1
                const isClickable = onStepClick && status !== 'current'

                return (
                    <div key={step.id} className="stepper__step-wrapper">
                        <motion.div
                            className={`stepper__step stepper__step--${status} ${isClickable ? 'stepper__step--clickable' : ''}`}
                            onClick={() => isClickable && onStepClick(index)}
                            whileHover={isClickable ? { scale: 1.05 } : undefined}
                            whileTap={isClickable ? { scale: 0.95 } : undefined}
                        >
                            <div className="stepper__indicator">
                                {status === 'completed' ? (
                                    <Check size={16} />
                                ) : variant === 'numbered' ? (
                                    <span className="stepper__number">{index + 1}</span>
                                ) : variant === 'dotted' ? (
                                    <span className="stepper__dot" />
                                ) : (
                                    step.icon || <span className="stepper__number">{index + 1}</span>
                                )}
                            </div>
                            <div className="stepper__content">
                                <span className="stepper__title">{step.title}</span>
                                {step.description && orientation === 'vertical' && (
                                    <span className="stepper__description">{step.description}</span>
                                )}
                            </div>
                        </motion.div>

                        {!isLast && (
                            <div className={`stepper__connector stepper__connector--${status === 'completed' ? 'completed' : 'pending'}`}>
                                {status === 'completed' && (
                                    <motion.div
                                        className="stepper__connector-fill"
                                        initial={{ scaleX: orientation === 'horizontal' ? 0 : 1, scaleY: orientation === 'vertical' ? 0 : 1 }}
                                        animate={{ scaleX: 1, scaleY: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// Simple step indicator (dots only)
interface StepIndicatorProps {
    total: number
    current: number
    onStepClick?: (index: number) => void
    className?: string
}

export function StepIndicator({ total, current, onStepClick, className = '' }: StepIndicatorProps) {
    return (
        <div className={`step-indicator ${className}`}>
            {Array.from({ length: total }, (_, i) => (
                <motion.button
                    key={i}
                    className={`step-indicator__dot ${i === current ? 'step-indicator__dot--active' : ''} ${i < current ? 'step-indicator__dot--completed' : ''}`}
                    onClick={() => onStepClick?.(i)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={!onStepClick}
                />
            ))}
        </div>
    )
}

export default Stepper
