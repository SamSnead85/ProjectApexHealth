import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Users,
    FileText,
    Shield,
    Bell,
    Settings,
    Check,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    Building2,
    HeartPulse,
    ChevronRight
} from 'lucide-react'
import './OnboardingFlow.css'

interface OnboardingStep {
    id: number
    title: string
    label: string
    description: string
    content: React.ReactNode
}

interface OnboardingFlowProps {
    onComplete: () => void
    onSkip: () => void
}

const OnboardingFlow = ({ onComplete, onSkip }: OnboardingFlowProps) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [completedSteps, setCompletedSteps] = useState<number[]>([])
    const [selectedRole, setSelectedRole] = useState<string | null>(null)
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
    const [preferences, setPreferences] = useState({
        notifications: true,
        darkMode: true,
        aiSuggestions: true,
        weeklyDigest: false
    })

    const totalSteps = 5

    const toggleFeature = (feature: string) => {
        setSelectedFeatures(prev =>
            prev.includes(feature)
                ? prev.filter(f => f !== feature)
                : [...prev, feature]
        )
    }

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCompletedSteps(prev => [...prev, currentStep])
            setCurrentStep(prev => prev + 1)
        } else {
            onComplete()
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onSkip()
        }
    }, [onSkip])

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    const progressPercent = ((currentStep + 1) / totalSteps) * 100

    const steps: OnboardingStep[] = [
        {
            id: 0,
            title: 'Welcome to Apex Health',
            label: 'Welcome',
            description: "We're excited to have you. Let's personalize your experience to help you get the most out of the platform.",
            content: (
                <div className="welcome-animation">
                    <motion.div
                        className="welcome-logo"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                        <HeartPulse size={40} color="white" />
                    </motion.div>
                    <motion.h2
                        className="welcome-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        Welcome to Apex Health
                    </motion.h2>
                    <motion.p
                        className="welcome-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        The AI-native healthcare administration platform designed for modern enterprises.
                    </motion.p>
                </div>
            )
        },
        {
            id: 1,
            title: 'Select Your Role',
            label: 'Step 1 of 4',
            description: 'Choose your primary role to customize your dashboard and available features.',
            content: (
                <div className="feature-grid">
                    {[
                        { id: 'admin', icon: Shield, title: 'Administrator', desc: 'Full platform access and user management' },
                        { id: 'broker', icon: Building2, title: 'Broker', desc: 'Client management and quoting tools' },
                        { id: 'employer', icon: Users, title: 'Employer', desc: 'Benefits administration and reporting' },
                        { id: 'member', icon: HeartPulse, title: 'Member', desc: 'Personal health portal and claims' }
                    ].map((role, index) => (
                        <motion.div
                            key={role.id}
                            className={`feature-card ${selectedRole === role.id ? 'selected' : ''}`}
                            onClick={() => setSelectedRole(role.id)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="feature-icon">
                                <role.icon size={24} />
                            </div>
                            <div className="feature-title">{role.title}</div>
                            <div className="feature-desc">{role.desc}</div>
                        </motion.div>
                    ))}
                </div>
            )
        },
        {
            id: 2,
            title: 'Quick Access Features',
            label: 'Step 2 of 4',
            description: 'Select features you use most for quick dashboard access.',
            content: (
                <div className="checklist">
                    {[
                        { id: 'claims', label: 'Claims Processing & Analytics' },
                        { id: 'eligibility', label: 'Eligibility Verification' },
                        { id: 'reports', label: 'Custom Reports & Exports' },
                        { id: 'members', label: 'Member Management' },
                        { id: 'analytics', label: 'AI-Powered Analytics' },
                        { id: 'compliance', label: 'Regulatory Compliance' }
                    ].map((item, index) => (
                        <motion.div
                            key={item.id}
                            className={`checklist-item ${selectedFeatures.includes(item.id) ? 'checked' : ''}`}
                            onClick={() => toggleFeature(item.id)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="checklist-checkbox">
                                {selectedFeatures.includes(item.id) && <Check size={14} />}
                            </div>
                            <span className="checklist-text">{item.label}</span>
                        </motion.div>
                    ))}
                </div>
            )
        },
        {
            id: 3,
            title: 'Notification Preferences',
            label: 'Step 3 of 4',
            description: 'Configure how you want to receive updates and alerts.',
            content: (
                <div className="checklist">
                    {[
                        { id: 'notifications', label: 'Browser push notifications', checked: preferences.notifications },
                        { id: 'darkMode', label: 'Dark mode interface', checked: preferences.darkMode },
                        { id: 'aiSuggestions', label: 'AI-powered suggestions', checked: preferences.aiSuggestions },
                        { id: 'weeklyDigest', label: 'Weekly email digest', checked: preferences.weeklyDigest }
                    ].map((item, index) => (
                        <motion.div
                            key={item.id}
                            className={`checklist-item ${item.checked ? 'checked' : ''}`}
                            onClick={() => setPreferences(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="checklist-checkbox">
                                {item.checked && <Check size={14} />}
                            </div>
                            <span className="checklist-text">{item.label}</span>
                        </motion.div>
                    ))}
                </div>
            )
        },
        {
            id: 4,
            title: "You're All Set!",
            label: 'Complete',
            description: 'Your workspace has been customized. Explore the platform or jump into your dashboard.',
            content: (
                <div className="completion-screen">
                    <motion.div
                        className="completion-icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                    >
                        <Sparkles size={48} color="white" />
                    </motion.div>
                    <motion.h3
                        className="completion-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Setup Complete!
                    </motion.h3>
                    <motion.p
                        className="completion-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Your personalized dashboard is ready. Use ⌘+K anytime to quickly navigate or search across the platform.
                    </motion.p>
                </div>
            )
        }
    ]

    const currentStepData = steps[currentStep]

    return (
        <motion.div
            className="onboarding-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="onboarding-container"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {/* Progress Bar */}
                <div className="onboarding-progress">
                    <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Content */}
                <div className="onboarding-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentStep > 0 && currentStep < totalSteps - 1 && (
                                <div className="step-header">
                                    <div className="step-number">{currentStep}</div>
                                    <div className="step-meta">
                                        <div className="step-label">{currentStepData.label}</div>
                                        <div className="step-title">{currentStepData.title}</div>
                                    </div>
                                    <button className="step-skip" onClick={onSkip}>
                                        Skip Setup
                                    </button>
                                </div>
                            )}

                            {currentStep > 0 && currentStep < totalSteps - 1 && (
                                <p className="step-description">{currentStepData.description}</p>
                            )}

                            <div className="step-content">
                                {currentStepData.content}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="onboarding-footer">
                    <div className="step-indicators">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`step-dot ${index === currentStep ? 'active' : ''} ${completedSteps.includes(index) ? 'completed' : ''}`}
                                onClick={() => index <= currentStep && setCurrentStep(index)}
                            />
                        ))}
                    </div>

                    <div className="footer-actions">
                        {currentStep > 0 && currentStep < totalSteps - 1 && (
                            <button className="btn-secondary" onClick={handleBack}>
                                <ArrowLeft size={18} />
                                Back
                            </button>
                        )}
                        <button
                            className="btn-primary"
                            onClick={handleNext}
                            disabled={currentStep === 1 && !selectedRole}
                        >
                            {currentStep === totalSteps - 1 ? (
                                <>Go to Dashboard</>
                            ) : currentStep === 0 ? (
                                <>Get Started</>
                            ) : (
                                <>Continue</>
                            )}
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default OnboardingFlow
