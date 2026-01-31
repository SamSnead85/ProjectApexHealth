import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import './Accordion.css'

interface AccordionItemProps {
    id: string
    title: ReactNode
    children: ReactNode
    icon?: ReactNode
    badge?: string | number
    defaultOpen?: boolean
}

interface AccordionProps {
    items: AccordionItemProps[]
    allowMultiple?: boolean
    className?: string
}

export function Accordion({ items, allowMultiple = false, className = '' }: AccordionProps) {
    const [openIds, setOpenIds] = useState<string[]>(
        items.filter(item => item.defaultOpen).map(item => item.id)
    )

    const toggle = (id: string) => {
        if (allowMultiple) {
            setOpenIds(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            )
        } else {
            setOpenIds(prev => prev.includes(id) ? [] : [id])
        }
    }

    return (
        <div className={`accordion ${className}`}>
            {items.map((item) => (
                <AccordionItem
                    key={item.id}
                    {...item}
                    isOpen={openIds.includes(item.id)}
                    onToggle={() => toggle(item.id)}
                />
            ))}
        </div>
    )
}

interface AccordionItemInternalProps extends AccordionItemProps {
    isOpen: boolean
    onToggle: () => void
}

function AccordionItem({
    title,
    children,
    icon,
    badge,
    isOpen,
    onToggle
}: AccordionItemInternalProps) {
    return (
        <div className={`accordion__item ${isOpen ? 'accordion__item--open' : ''}`}>
            <button
                className="accordion__trigger"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <div className="accordion__trigger-content">
                    {icon && <span className="accordion__icon">{icon}</span>}
                    <span className="accordion__title">{title}</span>
                    {badge && <span className="accordion__badge">{badge}</span>}
                </div>
                <motion.span
                    className="accordion__chevron"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={18} />
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        className="accordion__content-wrapper"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="accordion__content">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Accordion
