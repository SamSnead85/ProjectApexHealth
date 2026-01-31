import { ReactNode, useState, useEffect, useMemo, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Menu, LayoutGrid, List, SidebarOpen, SidebarClose, PanelLeft, PanelRight, Maximize2, Minimize2, GripVertical } from 'lucide-react'
import './LayoutComponents.css'

// Split View
interface SplitViewProps { left: ReactNode; right: ReactNode; initialRatio?: number; minRatio?: number; maxRatio?: number; resizable?: boolean; className?: string }

export function SplitView({ left, right, initialRatio = 50, minRatio = 20, maxRatio = 80, resizable = true, className = '' }: SplitViewProps) {
    const [ratio, setRatio] = useState(initialRatio)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const handleMouseDown = () => { if (resizable) setIsDragging(true) }

    useEffect(() => {
        if (!isDragging) return
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            const newRatio = ((e.clientX - rect.left) / rect.width) * 100
            setRatio(Math.max(minRatio, Math.min(maxRatio, newRatio)))
        }
        const handleMouseUp = () => setIsDragging(false)
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp) }
    }, [isDragging, minRatio, maxRatio])

    return (
        <div ref={containerRef} className={`split-view ${isDragging ? 'dragging' : ''} ${className}`}>
            <div className="split-view__left" style={{ width: `${ratio}%` }}>{left}</div>
            {resizable && <div className="split-view__divider" onMouseDown={handleMouseDown}><GripVertical size={12} /></div>}
            <div className="split-view__right" style={{ width: `${100 - ratio}%` }}>{right}</div>
        </div>
    )
}

// Accordion
interface AccordionItem { id: string; title: string; content: ReactNode; icon?: ReactNode; disabled?: boolean }

interface AccordionProps { items: AccordionItem[]; allowMultiple?: boolean; defaultOpen?: string[]; className?: string }

export function Accordion({ items, allowMultiple = false, defaultOpen = [], className = '' }: AccordionProps) {
    const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpen))

    const toggle = (id: string) => {
        const newOpen = new Set(openIds)
        if (newOpen.has(id)) newOpen.delete(id)
        else {
            if (!allowMultiple) newOpen.clear()
            newOpen.add(id)
        }
        setOpenIds(newOpen)
    }

    return (
        <div className={`accordion ${className}`}>
            {items.map(item => (
                <div key={item.id} className={`accordion__item ${openIds.has(item.id) ? 'open' : ''} ${item.disabled ? 'disabled' : ''}`}>
                    <button className="accordion__header" onClick={() => !item.disabled && toggle(item.id)} disabled={item.disabled}>
                        {item.icon}
                        <span>{item.title}</span>
                        <ChevronDown size={16} className="accordion__chevron" />
                    </button>
                    <AnimatePresence>
                        {openIds.has(item.id) && (
                            <motion.div className="accordion__content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                <div className="accordion__content-inner">{item.content}</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    )
}

// Masonry Grid
interface MasonryGridProps { columns?: number; gap?: number; children: ReactNode[]; className?: string }

export function MasonryGrid({ columns = 3, gap = 16, children, className = '' }: MasonryGridProps) {
    const columnItems = useMemo(() => {
        const cols: ReactNode[][] = Array.from({ length: columns }, () => [])
        children.forEach((child, i) => cols[i % columns].push(child))
        return cols
    }, [children, columns])

    return (
        <div className={`masonry-grid ${className}`} style={{ gap }}>
            {columnItems.map((col, i) => (
                <div key={i} className="masonry-grid__column" style={{ gap }}>{col}</div>
            ))}
        </div>
    )
}

// Side Panel
interface SidePanelProps { isOpen: boolean; onClose?: () => void; side?: 'left' | 'right'; width?: number; title?: string; children: ReactNode; className?: string }

export function SidePanel({ isOpen, onClose, side = 'right', width = 320, title, children, className = '' }: SidePanelProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="side-panel__backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                    <motion.div className={`side-panel side-panel--${side} ${className}`} style={{ width }}
                        initial={{ x: side === 'right' ? width : -width }} animate={{ x: 0 }} exit={{ x: side === 'right' ? width : -width }}>
                        {title && (
                            <div className="side-panel__header">
                                <h3>{title}</h3>
                                <button onClick={onClose}><X size={18} /></button>
                            </div>
                        )}
                        <div className="side-panel__content">{children}</div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// Container
interface ContainerProps { size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; padding?: boolean; centered?: boolean; children: ReactNode; className?: string }

export function Container({ size = 'lg', padding = true, centered = true, children, className = '' }: ContainerProps) {
    return (
        <div className={`container container--${size} ${padding ? 'container--padding' : ''} ${centered ? 'container--centered' : ''} ${className}`}>
            {children}
        </div>
    )
}

// Stack
interface StackProps { direction?: 'horizontal' | 'vertical'; gap?: number | string; align?: 'start' | 'center' | 'end' | 'stretch'; justify?: 'start' | 'center' | 'end' | 'between' | 'around'; wrap?: boolean; children: ReactNode; className?: string }

export function Stack({ direction = 'vertical', gap = 16, align = 'stretch', justify = 'start', wrap = false, children, className = '' }: StackProps) {
    return (
        <div className={`stack stack--${direction} ${wrap ? 'stack--wrap' : ''} ${className}`}
            style={{ gap, alignItems: align === 'stretch' ? 'stretch' : `flex-${align}`, justifyContent: justify === 'between' ? 'space-between' : justify === 'around' ? 'space-around' : `flex-${justify}` }}>
            {children}
        </div>
    )
}

// View Switcher
interface ViewSwitcherProps { views: { id: string; icon: ReactNode; label?: string }[]; activeView: string; onChange?: (id: string) => void; className?: string }

export function ViewSwitcher({ views, activeView, onChange, className = '' }: ViewSwitcherProps) {
    return (
        <div className={`view-switcher ${className}`}>
            {views.map(v => (
                <button key={v.id} className={`view-switcher__btn ${activeView === v.id ? 'active' : ''}`}
                    onClick={() => onChange?.(v.id)} title={v.label}>
                    {v.icon}
                </button>
            ))}
        </div>
    )
}

import React from 'react'

export default { SplitView, Accordion, MasonryGrid, SidePanel, Container, Stack, ViewSwitcher }
