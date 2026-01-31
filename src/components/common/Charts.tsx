import { ReactNode, useMemo } from 'react'
import { motion } from 'framer-motion'
import './Charts.css'

interface DataPoint {
    label: string
    value: number
    color?: string
}

// Bar Chart
interface BarChartProps {
    data: DataPoint[]
    height?: number
    showValues?: boolean
    showLabels?: boolean
    animate?: boolean
    horizontal?: boolean
    className?: string
}

export function BarChart({
    data,
    height = 200,
    showValues = true,
    showLabels = true,
    animate = true,
    horizontal = false,
    className = ''
}: BarChartProps) {
    const maxValue = Math.max(...data.map(d => d.value))

    return (
        <div className={`chart bar-chart ${horizontal ? 'bar-chart--horizontal' : ''} ${className}`}>
            <div className="bar-chart__container" style={{ height: horizontal ? 'auto' : height }}>
                {data.map((item, index) => {
                    const percentage = (item.value / maxValue) * 100
                    return (
                        <div key={index} className="bar-chart__item">
                            {showLabels && <span className="bar-chart__label">{item.label}</span>}
                            <div className="bar-chart__bar-wrapper">
                                <motion.div
                                    className="bar-chart__bar"
                                    style={{ backgroundColor: item.color || 'var(--apex-teal)' }}
                                    initial={animate ? { [horizontal ? 'width' : 'height']: 0 } : false}
                                    animate={{ [horizontal ? 'width' : 'height']: `${percentage}%` }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                />
                                {showValues && (
                                    <span className="bar-chart__value">
                                        {item.value.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Pie / Donut Chart
interface PieChartProps {
    data: DataPoint[]
    size?: number
    donut?: boolean
    donutWidth?: number
    showLegend?: boolean
    showValues?: boolean
    animate?: boolean
    centerContent?: ReactNode
    className?: string
}

export function PieChart({
    data,
    size = 200,
    donut = false,
    donutWidth = 40,
    showLegend = true,
    showValues = false,
    animate = true,
    centerContent,
    className = ''
}: PieChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const radius = size / 2
    const innerRadius = donut ? radius - donutWidth : 0

    const segments = useMemo(() => {
        let cumulativeAngle = -90
        return data.map((item, index) => {
            const angle = (item.value / total) * 360
            const startAngle = cumulativeAngle
            const endAngle = cumulativeAngle + angle
            cumulativeAngle = endAngle

            const startRad = (startAngle * Math.PI) / 180
            const endRad = (endAngle * Math.PI) / 180

            const x1 = radius + radius * Math.cos(startRad)
            const y1 = radius + radius * Math.sin(startRad)
            const x2 = radius + radius * Math.cos(endRad)
            const y2 = radius + radius * Math.sin(endRad)

            const ix1 = radius + innerRadius * Math.cos(startRad)
            const iy1 = radius + innerRadius * Math.sin(startRad)
            const ix2 = radius + innerRadius * Math.cos(endRad)
            const iy2 = radius + innerRadius * Math.sin(endRad)

            const largeArc = angle > 180 ? 1 : 0

            const path = donut
                ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`
                : `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

            return { ...item, path, percentage: (item.value / total) * 100 }
        })
    }, [data, total, radius, innerRadius, donut])

    const defaultColors = ['#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6']

    return (
        <div className={`chart pie-chart ${className}`}>
            <div className="pie-chart__container">
                <svg width={size} height={size} className="pie-chart__svg">
                    {segments.map((segment, index) => (
                        <motion.path
                            key={index}
                            d={segment.path}
                            fill={segment.color || defaultColors[index % defaultColors.length]}
                            initial={animate ? { opacity: 0, scale: 0.8 } : false}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="pie-chart__segment"
                        />
                    ))}
                </svg>
                {donut && centerContent && (
                    <div className="pie-chart__center" style={{ width: innerRadius * 2, height: innerRadius * 2 }}>
                        {centerContent}
                    </div>
                )}
            </div>

            {showLegend && (
                <div className="pie-chart__legend">
                    {segments.map((segment, index) => (
                        <div key={index} className="pie-chart__legend-item">
                            <span
                                className="pie-chart__legend-color"
                                style={{ backgroundColor: segment.color || defaultColors[index % defaultColors.length] }}
                            />
                            <span className="pie-chart__legend-label">{segment.label}</span>
                            <span className="pie-chart__legend-value">
                                {showValues ? segment.value.toLocaleString() : `${segment.percentage.toFixed(1)}%`}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// Line Chart (simplified SVG version)
interface LineChartProps {
    data: { x: number | string; y: number }[]
    height?: number
    showDots?: boolean
    showArea?: boolean
    color?: string
    animate?: boolean
    className?: string
}

export function LineChart({
    data,
    height = 200,
    showDots = true,
    showArea = true,
    color = 'var(--apex-teal)',
    animate = true,
    className = ''
}: LineChartProps) {
    const padding = 20
    const width = 400
    const chartHeight = height - padding * 2

    const values = data.map(d => d.y)
    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)
    const range = maxValue - minValue || 1

    const points = data.map((d, i) => ({
        x: padding + (i / (data.length - 1)) * (width - padding * 2),
        y: padding + chartHeight - ((d.y - minValue) / range) * chartHeight
    }))

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`

    return (
        <div className={`chart line-chart ${className}`}>
            <svg viewBox={`0 0 ${width} ${height}`} className="line-chart__svg">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(pct => (
                    <line
                        key={pct}
                        x1={padding}
                        y1={padding + chartHeight * pct}
                        x2={width - padding}
                        y2={padding + chartHeight * pct}
                        className="line-chart__grid"
                    />
                ))}

                {/* Area */}
                {showArea && (
                    <motion.path
                        d={areaPath}
                        fill={`url(#areaGradient-${className})`}
                        initial={animate ? { opacity: 0 } : false}
                        animate={{ opacity: 0.3 }}
                        transition={{ duration: 0.6 }}
                    />
                )}

                {/* Line */}
                <motion.path
                    d={linePath}
                    stroke={color}
                    strokeWidth={2}
                    fill="none"
                    initial={animate ? { pathLength: 0 } : false}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                />

                {/* Dots */}
                {showDots && points.map((p, i) => (
                    <motion.circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={4}
                        fill={color}
                        initial={animate ? { scale: 0 } : false}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                        className="line-chart__dot"
                    />
                ))}

                {/* Gradient */}
                <defs>
                    <linearGradient id={`areaGradient-${className}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    )
}

// Progress Ring
interface ProgressRingProps {
    value: number
    max?: number
    size?: number
    strokeWidth?: number
    color?: string
    showLabel?: boolean
    label?: string
    animate?: boolean
    className?: string
}

export function ProgressRing({
    value,
    max = 100,
    size = 120,
    strokeWidth = 8,
    color = 'var(--apex-teal)',
    showLabel = true,
    label,
    animate = true,
    className = ''
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const percentage = Math.min(value / max, 1)
    const strokeDashoffset = circumference - percentage * circumference

    return (
        <div className={`chart progress-ring ${className}`} style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={animate ? { strokeDashoffset: circumference } : false}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1 }}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            {showLabel && (
                <div className="progress-ring__label">
                    <span className="progress-ring__value">{Math.round(percentage * 100)}%</span>
                    {label && <span className="progress-ring__text">{label}</span>}
                </div>
            )}
        </div>
    )
}

export default {
    BarChart,
    PieChart,
    LineChart,
    ProgressRing
}
