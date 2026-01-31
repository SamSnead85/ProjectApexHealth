import { ReactNode } from 'react'
import './Responsive.css'

// Show only on specific breakpoints
interface ShowOnProps {
    children: ReactNode
    breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide'
    className?: string
}

export function ShowOn({ children, breakpoint, className = '' }: ShowOnProps) {
    return (
        <div className={`show-on show-on--${breakpoint} ${className}`}>
            {children}
        </div>
    )
}

// Hide on specific breakpoints
interface HideOnProps {
    children: ReactNode
    breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide'
    className?: string
}

export function HideOn({ children, breakpoint, className = '' }: HideOnProps) {
    return (
        <div className={`hide-on hide-on--${breakpoint} ${className}`}>
            {children}
        </div>
    )
}

// Responsive stack (row on desktop, column on mobile)
interface ResponsiveStackProps {
    children: ReactNode
    breakpoint?: 'sm' | 'md' | 'lg'
    gap?: number | string
    reverseOnMobile?: boolean
    className?: string
}

export function ResponsiveStack({
    children,
    breakpoint = 'md',
    gap = 16,
    reverseOnMobile = false,
    className = ''
}: ResponsiveStackProps) {
    return (
        <div
            className={`responsive-stack responsive-stack--${breakpoint} ${reverseOnMobile ? 'responsive-stack--reverse' : ''} ${className}`}
            style={{ '--stack-gap': typeof gap === 'number' ? `${gap}px` : gap } as React.CSSProperties}
        >
            {children}
        </div>
    )
}

// Responsive grid
interface ResponsiveGridProps {
    children: ReactNode
    columns?: { mobile?: number; tablet?: number; desktop?: number }
    gap?: number | string
    className?: string
}

export function ResponsiveGrid({
    children,
    columns = { mobile: 1, tablet: 2, desktop: 3 },
    gap = 16,
    className = ''
}: ResponsiveGridProps) {
    return (
        <div
            className={`responsive-grid ${className}`}
            style={{
                '--grid-gap': typeof gap === 'number' ? `${gap}px` : gap,
                '--grid-cols-mobile': columns.mobile || 1,
                '--grid-cols-tablet': columns.tablet || 2,
                '--grid-cols-desktop': columns.desktop || 3
            } as React.CSSProperties}
        >
            {children}
        </div>
    )
}

// Responsive text (different sizes per breakpoint)
interface ResponsiveTextProps {
    children: ReactNode
    as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
    size?: { mobile?: string; tablet?: string; desktop?: string }
    className?: string
}

export function ResponsiveText({
    children,
    as: Component = 'span',
    size = { mobile: '14px', tablet: '16px', desktop: '18px' },
    className = ''
}: ResponsiveTextProps) {
    return (
        <Component
            className={`responsive-text ${className}`}
            style={{
                '--text-size-mobile': size.mobile,
                '--text-size-tablet': size.tablet,
                '--text-size-desktop': size.desktop
            } as React.CSSProperties}
        >
            {children}
        </Component>
    )
}

// Aspect ratio container
interface AspectRatioProps {
    children: ReactNode
    ratio: '1:1' | '16:9' | '4:3' | '21:9' | number
    className?: string
}

export function AspectRatio({ children, ratio, className = '' }: AspectRatioProps) {
    const getPercent = () => {
        if (typeof ratio === 'number') return ratio * 100
        const [w, h] = ratio.split(':').map(Number)
        return (h / w) * 100
    }

    return (
        <div
            className={`aspect-ratio ${className}`}
            style={{ '--aspect-padding': `${getPercent()}%` } as React.CSSProperties}
        >
            {children}
        </div>
    )
}

// Container with max-width and centering
interface ContainerMaxProps {
    children: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    padding?: boolean
    className?: string
}

export function ContainerMax({
    children,
    size = 'lg',
    padding = true,
    className = ''
}: ContainerMaxProps) {
    return (
        <div className={`container-max container-max--${size} ${padding ? 'container-max--padded' : ''} ${className}`}>
            {children}
        </div>
    )
}

export default ResponsiveStack
