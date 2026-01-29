import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronDown,
    ChevronRight,
    Info,
    HelpCircle,
    CheckCircle2,
    X
} from 'lucide-react'
import './PremiumComponents.css'

// Accordion Component
interface AccordionItem {
    id: string
    title: string
    content: ReactNode
    icon?: ReactNode
}

interface AccordionProps {
    items: AccordionItem[]
    allowMultiple?: boolean
}

export function Accordion({ items, allowMultiple = false }: AccordionProps) {
    const [openItems, setOpenItems] = useState<string[]>([])

    const toggleItem = (id: string) => {
        if (allowMultiple) {
            setOpenItems(prev =>
                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
            )
        } else {
            setOpenItems(prev => prev.includes(id) ? [] : [id])
        }
    }

    return (
        <div className="accordion">
            {items.map((item) => {
                const isOpen = openItems.includes(item.id)
                return (
                    <div key={item.id} className={`accordion-item ${isOpen ? 'open' : ''}`}>
                        <button
                            className="accordion-trigger"
                            onClick={() => toggleItem(item.id)}
                        >
                            {item.icon && <span className="accordion-icon">{item.icon}</span>}
                            <span className="accordion-title">{item.title}</span>
                            <ChevronDown
                                size={18}
                                className={`accordion-chevron ${isOpen ? 'rotated' : ''}`}
                            />
                        </button>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="accordion-content"
                                >
                                    <div className="accordion-content-inner">
                                        {item.content}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            })}
        </div>
    )
}

// Tooltip Component
interface TooltipProps {
    content: string
    children: ReactNode
    position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <div
            className="tooltip-wrapper"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className={`tooltip tooltip--${position}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Modal Component
interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
    size?: 'sm' | 'md' | 'lg'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={`modal modal--${size}`}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    >
                        <div className="modal-header">
                            <h2>{title}</h2>
                            <button className="modal-close" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// Alert Banner Component
interface AlertProps {
    type: 'info' | 'success' | 'warning' | 'error'
    title?: string
    message: string
    dismissible?: boolean
    onDismiss?: () => void
}

export function Alert({ type, title, message, dismissible, onDismiss }: AlertProps) {
    const icons = {
        info: <Info size={18} />,
        success: <CheckCircle2 size={18} />,
        warning: <HelpCircle size={18} />,
        error: <X size={18} />
    }

    return (
        <div className={`alert alert--${type}`}>
            <span className="alert-icon">{icons[type]}</span>
            <div className="alert-content">
                {title && <strong className="alert-title">{title}</strong>}
                <span className="alert-message">{message}</span>
            </div>
            {dismissible && (
                <button className="alert-dismiss" onClick={onDismiss}>
                    <X size={16} />
                </button>
            )}
        </div>
    )
}

// Tabs Component
interface Tab {
    id: string
    label: string
    content: ReactNode
    icon?: ReactNode
}

interface TabsProps {
    tabs: Tab[]
    defaultTab?: string
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

    return (
        <div className="tabs">
            <div className="tabs-list">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-trigger ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon && <span className="tab-icon">{tab.icon}</span>}
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="tabs-content">
                {tabs.find(t => t.id === activeTab)?.content}
            </div>
        </div>
    )
}

// Stepper Component
interface Step {
    id: string
    title: string
    description?: string
}

interface StepperProps {
    steps: Step[]
    currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
    return (
        <div className="stepper">
            {steps.map((step, index) => {
                const isComplete = index < currentStep
                const isCurrent = index === currentStep

                return (
                    <div
                        key={step.id}
                        className={`step ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                        <div className="step-indicator">
                            {isComplete ? (
                                <CheckCircle2 size={20} />
                            ) : (
                                <span>{index + 1}</span>
                            )}
                        </div>
                        <div className="step-content">
                            <span className="step-title">{step.title}</span>
                            {step.description && (
                                <span className="step-description">{step.description}</span>
                            )}
                        </div>
                        {index < steps.length - 1 && <div className="step-connector" />}
                    </div>
                )
            })}
        </div>
    )
}

export default { Accordion, Tooltip, Modal, Alert, Tabs, Stepper }
