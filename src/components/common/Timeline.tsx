import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Check, Circle } from 'lucide-react'
import './Timeline.css'

interface TimelineStep {
    id: string
    title: string
    description?: string
    date?: string
    status: 'completed' | 'current' | 'upcoming'
    icon?: ReactNode
}

interface TimelineProps {
    steps: TimelineStep[]
    orientation?: 'vertical' | 'horizontal'
    className?: string
}

export function Timeline({ steps, orientation = 'vertical', className = '' }: TimelineProps) {
    return (
        <div className={`timeline timeline--${orientation} ${className}`}>
            {steps.map((step, index) => (
                <motion.div
                    key={step.id}
                    className={`timeline__step timeline__step--${step.status}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <div className="timeline__marker">
                        {step.status === 'completed' ? (
                            <Check size={14} />
                        ) : step.icon ? (
                            step.icon
                        ) : (
                            <Circle size={8} />
                        )}
                    </div>
                    {index < steps.length - 1 && <div className="timeline__connector" />}
                    <div className="timeline__content">
                        <div className="timeline__header">
                            <span className="timeline__title">{step.title}</span>
                            {step.date && <span className="timeline__date">{step.date}</span>}
                        </div>
                        {step.description && (
                            <p className="timeline__description">{step.description}</p>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

// Simple progress timeline
interface ProgressTimelineProps {
    currentStep: number
    totalSteps: number
    labels?: string[]
    className?: string
}

export function ProgressTimeline({
    currentStep,
    totalSteps,
    labels = [],
    className = ''
}: ProgressTimelineProps) {
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

    return (
        <div className={`progress-timeline ${className}`}>
            <div className="progress-timeline__track">
                <motion.div
                    className="progress-timeline__fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
            <div className="progress-timeline__steps">
                {Array.from({ length: totalSteps }, (_, i) => {
                    const stepNum = i + 1
                    const status = stepNum < currentStep ? 'completed' : stepNum === currentStep ? 'current' : 'upcoming'
                    return (
                        <div key={i} className={`progress-timeline__step progress-timeline__step--${status}`}>
                            <motion.div
                                className="progress-timeline__dot"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                {status === 'completed' && <Check size={12} />}
                            </motion.div>
                            {labels[i] && <span className="progress-timeline__label">{labels[i]}</span>}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Timeline
