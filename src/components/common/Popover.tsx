import { ReactNode, useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Popover.css'

interface PopoverProps {
    trigger: ReactNode
    content: ReactNode
    position?: 'top' | 'bottom' | 'left' | 'right'
    align?: 'start' | 'center' | 'end'
    triggerType?: 'click' | 'hover'
    isOpen?: boolean
    onOpenChange?: (isOpen: boolean) => void
    closeOnContentClick?: boolean
    offset?: number
    className?: string
}

export function Popover({
    trigger,
    content,
    position = 'bottom',
    align = 'center',
    triggerType = 'click',
    isOpen: controlledIsOpen,
    onOpenChange,
    closeOnContentClick = false,
    offset = 8,
    className = ''
}: PopoverProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false)
    const isOpen = controlledIsOpen ?? internalIsOpen
    const containerRef = useRef<HTMLDivElement>(null)

    const setIsOpen = (value: boolean) => {
        if (onOpenChange) {
            onOpenChange(value)
        } else {
            setInternalIsOpen(value)
        }
    }

    useEffect(() => {
        if (triggerType !== 'click') return

        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [triggerType])

    const handleTriggerClick = () => {
        if (triggerType === 'click') {
            setIsOpen(!isOpen)
        }
    }

    const handleMouseEnter = () => {
        if (triggerType === 'hover') {
            setIsOpen(true)
        }
    }

    const handleMouseLeave = () => {
        if (triggerType === 'hover') {
            setIsOpen(false)
        }
    }

    const handleContentClick = () => {
        if (closeOnContentClick) {
            setIsOpen(false)
        }
    }

    const getPopoverStyle = (): React.CSSProperties => {
        const offsetValue = `${offset}px`
        const style: React.CSSProperties = {}

        switch (position) {
            case 'top':
                style.bottom = `calc(100% + ${offsetValue})`
                break
            case 'bottom':
                style.top = `calc(100% + ${offsetValue})`
                break
            case 'left':
                style.right = `calc(100% + ${offsetValue})`
                break
            case 'right':
                style.left = `calc(100% + ${offsetValue})`
                break
        }

        if (position === 'top' || position === 'bottom') {
            switch (align) {
                case 'start':
                    style.left = 0
                    break
                case 'center':
                    style.left = '50%'
                    style.transform = 'translateX(-50%)'
                    break
                case 'end':
                    style.right = 0
                    break
            }
        } else {
            switch (align) {
                case 'start':
                    style.top = 0
                    break
                case 'center':
                    style.top = '50%'
                    style.transform = 'translateY(-50%)'
                    break
                case 'end':
                    style.bottom = 0
                    break
            }
        }

        return style
    }

    const getAnimationVariants = () => {
        switch (position) {
            case 'top':
                return { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 } }
            case 'bottom':
                return { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }
            case 'left':
                return { initial: { opacity: 0, x: 8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 8 } }
            case 'right':
                return { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -8 } }
        }
    }

    const variants = getAnimationVariants()

    return (
        <div
            ref={containerRef}
            className={`popover ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="popover__trigger" onClick={handleTriggerClick}>
                {trigger}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={`popover__content popover__content--${position}`}
                        style={getPopoverStyle()}
                        {...variants}
                        transition={{ duration: 0.15 }}
                        onClick={handleContentClick}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Simple menu variant
interface PopoverMenuProps {
    trigger: ReactNode
    items: { label: string; icon?: ReactNode; onClick: () => void; danger?: boolean }[]
    position?: 'top' | 'bottom' | 'left' | 'right'
    align?: 'start' | 'center' | 'end'
}

export function PopoverMenu({ trigger, items, position = 'bottom', align = 'end' }: PopoverMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Popover
            trigger={trigger}
            position={position}
            align={align}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            content={
                <div className="popover-menu">
                    {items.map((item, index) => (
                        <button
                            key={index}
                            className={`popover-menu__item ${item.danger ? 'popover-menu__item--danger' : ''}`}
                            onClick={() => {
                                item.onClick()
                                setIsOpen(false)
                            }}
                        >
                            {item.icon && <span className="popover-menu__item-icon">{item.icon}</span>}
                            {item.label}
                        </button>
                    ))}
                </div>
            }
        />
    )
}

export default Popover
