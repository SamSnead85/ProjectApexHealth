import { motion } from 'framer-motion'
import './Sparkline.css'

interface SparklineProps {
    data: number[]
    width?: number
    height?: number
    color?: string
    showDots?: boolean
    showArea?: boolean
    className?: string
}

export function Sparkline({
    data,
    width = 100,
    height = 32,
    color = 'var(--apex-teal)',
    showDots = false,
    showArea = true,
    className = ''
}: SparklineProps) {
    if (!data.length) return null

    const padding = 2
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const points = data.map((value, i) => ({
        x: padding + (i / (data.length - 1)) * (width - padding * 2),
        y: height - padding - ((value - min) / range) * (height - padding * 2)
    }))

    const linePath = points
        .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
        .join(' ')

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

    return (
        <svg
            className={`sparkline ${className}`}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
        >
            {/* Gradient definition */}
            <defs>
                <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Area fill */}
            {showArea && (
                <motion.path
                    d={areaPath}
                    fill="url(#sparkline-gradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />
            )}

            {/* Line */}
            <motion.path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            />

            {/* Dots */}
            {showDots && points.map((p, i) => (
                <motion.circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="2"
                    fill={color}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                />
            ))}

            {/* Last point indicator */}
            <motion.circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="3"
                fill={color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
            />
        </svg>
    )
}

// Mini chart with label
interface MiniChartProps {
    label: string
    value: string | number
    data: number[]
    trend?: 'up' | 'down'
    className?: string
}

export function MiniChart({ label, value, data, trend, className = '' }: MiniChartProps) {
    const color = trend === 'down' ? '#ef4444' : '#10b981'

    return (
        <div className={`mini-chart ${className}`}>
            <div className="mini-chart__info">
                <span className="mini-chart__label">{label}</span>
                <span className="mini-chart__value">{value}</span>
            </div>
            <Sparkline data={data} color={color} width={80} height={28} />
        </div>
    )
}

export default Sparkline
