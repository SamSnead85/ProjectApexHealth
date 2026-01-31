import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, LayoutList, Columns, Rows, Maximize, Minimize, Grid3X3, PanelLeft, PanelRight, PanelTop } from 'lucide-react'
import './LayoutHelpers.css'

// Split View
interface SplitViewProps {
    left: ReactNode
    right: ReactNode
    defaultRatio?: number
    minRatio?: number
    maxRatio?: number
    orientation?: 'horizontal' | 'vertical'
    collapsible?: 'left' | 'right' | 'both' | 'none'
    className?: string
}

export function SplitView({
    left,
    right,
    defaultRatio = 50,
    minRatio = 20,
    maxRatio = 80,
    orientation = 'horizontal',
    collapsible = 'none',
    className = ''
}: SplitViewProps) {
    const [ratio, setRatio] = useState(defaultRatio)
    const [collapsed, setCollapsed] = useState<'left' | 'right' | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleMouseDown = () => {
        setIsDragging(true)
    }

    useEffect(() => {
        if (!isDragging) return

        const handleMouseMove = (e: MouseEvent) => {
            const container = document.querySelector('.split-view')
            if (!container) return

            const rect = container.getBoundingClientRect()
            let newRatio: number

            if (orientation === 'horizontal') {
                newRatio = ((e.clientX - rect.left) / rect.width) * 100
            } else {
                newRatio = ((e.clientY - rect.top) / rect.height) * 100
            }

            setRatio(Math.min(maxRatio, Math.max(minRatio, newRatio)))
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, orientation, minRatio, maxRatio])

    const toggleCollapse = (side: 'left' | 'right') => {
        if (collapsed === side) {
            setCollapsed(null)
        } else {
            setCollapsed(side)
        }
    }

    return (
        <div className={`split-view split-view--${orientation} ${isDragging ? 'split-view--dragging' : ''} ${className}`}>
            <div
                className={`split-view__panel split-view__panel--left ${collapsed === 'left' ? 'split-view__panel--collapsed' : ''}`}
                style={{ [orientation === 'horizontal' ? 'width' : 'height']: collapsed === 'left' ? '0' : `${collapsed === 'right' ? 100 : ratio}%` }}
            >
                {left}
            </div>

            <div className="split-view__divider" onMouseDown={handleMouseDown}>
                <div className="split-view__divider-handle" />
                {collapsible !== 'none' && (
                    <div className="split-view__divider-controls">
                        {(collapsible === 'left' || collapsible === 'both') && (
                            <button onClick={() => toggleCollapse('left')}>
                                {collapsed === 'left' ? <PanelLeft size={12} /> : <Minimize size={12} />}
                            </button>
                        )}
                        {(collapsible === 'right' || collapsible === 'both') && (
                            <button onClick={() => toggleCollapse('right')}>
                                {collapsed === 'right' ? <PanelRight size={12} /> : <Minimize size={12} />}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div
                className={`split-view__panel split-view__panel--right ${collapsed === 'right' ? 'split-view__panel--collapsed' : ''}`}
                style={{ [orientation === 'horizontal' ? 'width' : 'height']: collapsed === 'right' ? '0' : `${collapsed === 'left' ? 100 : 100 - ratio}%` }}
            >
                {right}
            </div>
        </div>
    )
}

// Masonry Grid
interface MasonryItem {
    id: string
    content: ReactNode
    height?: number
}

interface MasonryGridProps {
    items: MasonryItem[]
    columns?: number
    gap?: number
    className?: string
}

export function MasonryGrid({ items, columns = 3, gap = 16, className = '' }: MasonryGridProps) {
    const getColumnItems = () => {
        const columnItems: MasonryItem[][] = Array.from({ length: columns }, () => [])
        items.forEach((item, index) => {
            columnItems[index % columns].push(item)
        })
        return columnItems
    }

    return (
        <div className={`masonry-grid ${className}`} style={{ gap }}>
            {getColumnItems().map((column, colIndex) => (
                <div key={colIndex} className="masonry-grid__column" style={{ gap }}>
                    {column.map(item => (
                        <motion.div
                            key={item.id}
                            className="masonry-grid__item"
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {item.content}
                        </motion.div>
                    ))}
                </div>
            ))}
        </div>
    )
}

// Responsive Container
interface ResponsiveContainerProps {
    children: ReactNode
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    centered?: boolean
    className?: string
}

export function ResponsiveContainer({
    children,
    maxWidth = 'xl',
    padding = 'md',
    centered = true,
    className = ''
}: ResponsiveContainerProps) {
    return (
        <div className={`responsive-container responsive-container--${maxWidth} responsive-container--padding-${padding} ${centered ? 'responsive-container--centered' : ''} ${className}`}>
            {children}
        </div>
    )
}

// Stack
interface StackProps {
    children: ReactNode
    direction?: 'row' | 'column'
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    align?: 'start' | 'center' | 'end' | 'stretch'
    justify?: 'start' | 'center' | 'end' | 'between' | 'around'
    wrap?: boolean
    className?: string
}

export function Stack({
    children,
    direction = 'column',
    gap = 'md',
    align = 'stretch',
    justify = 'start',
    wrap = false,
    className = ''
}: StackProps) {
    return (
        <div className={`stack stack--${direction} stack--gap-${gap} stack--align-${align} stack--justify-${justify} ${wrap ? 'stack--wrap' : ''} ${className}`}>
            {children}
        </div>
    )
}

// Cluster (for inline items)
interface ClusterProps {
    children: ReactNode
    gap?: 'xs' | 'sm' | 'md' | 'lg'
    align?: 'start' | 'center' | 'end'
    justify?: 'start' | 'center' | 'end' | 'between'
    className?: string
}

export function Cluster({ children, gap = 'sm', align = 'center', justify = 'start', className = '' }: ClusterProps) {
    return (
        <div className={`cluster cluster--gap-${gap} cluster--align-${align} cluster--justify-${justify} ${className}`}>
            {children}
        </div>
    )
}

// Grid
interface GridProps {
    children: ReactNode
    columns?: number | { sm?: number; md?: number; lg?: number; xl?: number }
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    alignItems?: 'start' | 'center' | 'end' | 'stretch'
    className?: string
}

export function Grid({ children, columns = 3, gap = 'md', alignItems = 'stretch', className = '' }: GridProps) {
    const cols = typeof columns === 'number' ? columns : undefined
    const responsiveCols = typeof columns === 'object' ? columns : undefined

    return (
        <div
            className={`grid-layout grid-layout--gap-${gap} grid-layout--align-${alignItems} ${className}`}
            style={cols ? { gridTemplateColumns: `repeat(${cols}, 1fr)` } : undefined}
            data-cols-sm={responsiveCols?.sm}
            data-cols-md={responsiveCols?.md}
            data-cols-lg={responsiveCols?.lg}
            data-cols-xl={responsiveCols?.xl}
        >
            {children}
        </div>
    )
}

// Aspect Ratio Box
interface AspectRatioProps {
    children: ReactNode
    ratio?: '1:1' | '4:3' | '16:9' | '21:9' | '3:2'
    className?: string
}

export function AspectRatio({ children, ratio = '16:9', className = '' }: AspectRatioProps) {
    const ratioMap = {
        '1:1': 100,
        '4:3': 75,
        '16:9': 56.25,
        '21:9': 42.86,
        '3:2': 66.66
    }

    return (
        <div className={`aspect-ratio ${className}`} style={{ paddingBottom: `${ratioMap[ratio]}%` }}>
            <div className="aspect-ratio__content">
                {children}
            </div>
        </div>
    )
}

// Cover (full height/width)
interface CoverProps {
    children: ReactNode
    minHeight?: string
    className?: string
}

export function Cover({ children, minHeight = '100vh', className = '' }: CoverProps) {
    return (
        <div className={`cover ${className}`} style={{ minHeight }}>
            {children}
        </div>
    )
}

export default { SplitView, MasonryGrid, ResponsiveContainer, Stack, Cluster, Grid, AspectRatio, Cover }
