import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X, ChevronRight, ExternalLink, MessageCircle, BookOpen, Video } from 'lucide-react'
import './HelpCenter.css'

interface HelpItem {
    id: string
    icon?: ReactNode
    title: string
    description: string
    action?: () => void
    href?: string
}

interface HelpCenterProps {
    items?: HelpItem[]
    className?: string
}

const defaultHelpItems: HelpItem[] = [
    { id: '1', icon: <BookOpen size={18} />, title: 'Documentation', description: 'Browse our comprehensive guides', href: '/docs' },
    { id: '2', icon: <Video size={18} />, title: 'Video Tutorials', description: 'Learn with step-by-step videos', href: '/tutorials' },
    { id: '3', icon: <MessageCircle size={18} />, title: 'Contact Support', description: '24/7 support available', href: '/support' },
]

export function HelpCenter({ items = defaultHelpItems, className = '' }: HelpCenterProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={`help-center ${className}`}>
            <motion.button
                className="help-center__trigger"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Help"
            >
                <HelpCircle size={20} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="help-center__overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            className="help-center__panel"
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        >
                            <div className="help-center__header">
                                <h3 className="help-center__title">Need Help?</h3>
                                <button className="help-center__close" onClick={() => setIsOpen(false)}>
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="help-center__content">
                                {items.map(item => (
                                    <motion.a
                                        key={item.id}
                                        className="help-center__item"
                                        href={item.href}
                                        onClick={item.action}
                                        whileHover={{ x: 4 }}
                                    >
                                        {item.icon && <span className="help-center__item-icon">{item.icon}</span>}
                                        <div className="help-center__item-content">
                                            <span className="help-center__item-title">{item.title}</span>
                                            <span className="help-center__item-description">{item.description}</span>
                                        </div>
                                        <ChevronRight size={16} className="help-center__item-arrow" />
                                    </motion.a>
                                ))}
                            </div>

                            <div className="help-center__footer">
                                <a href="/feedback" className="help-center__feedback">
                                    <ExternalLink size={14} />
                                    Send Feedback
                                </a>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

// Floating help button for bottom-right corner
export function FloatingHelp({ className = '' }: { className?: string }) {
    return (
        <div className={`floating-help ${className}`}>
            <HelpCenter />
        </div>
    )
}

export default HelpCenter
