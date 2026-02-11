import { motion } from 'framer-motion'

// ============================================
// LOADING SKELETON SYSTEM
// Apex Obsidian v3 — Dark Theme Shimmer Skeletons
// ============================================

const SHIMMER_KEYFRAMES = `
@keyframes loadingSkeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`

// Inject keyframes once
let injected = false
function injectKeyframes() {
    if (injected || typeof document === 'undefined') return
    const style = document.createElement('style')
    style.textContent = SHIMMER_KEYFRAMES
    document.head.appendChild(style)
    injected = true
}

// ── Base shimmer style ──
const shimmerBase: React.CSSProperties = {
    background:
        'linear-gradient(90deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 100%)',
    backgroundSize: '200% 100%',
    animation: 'loadingSkeleton-shimmer 2s ease-in-out infinite',
    borderRadius: 12,
}

const shimmerNarrow: React.CSSProperties = {
    ...shimmerBase,
    borderRadius: 8,
}

const shimmerPill: React.CSSProperties = {
    ...shimmerBase,
    borderRadius: 20,
}

// ── Shared layout tokens ──
const gap = { small: 8, medium: 12, large: 16, xl: 24 }
const pagePadding: React.CSSProperties = {
    padding: '32px 32px 48px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: gap.xl,
}

// ── Animation wrapper ──
const fadeVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
        opacity: 1,
        transition: { delay: i * 0.06, duration: 0.4 },
    }),
}

// ============================================
// CardSkeleton
// ============================================
export interface CardSkeletonProps {
    /** Fixed width (default: 100%) */
    width?: string | number
    /** Fixed height (default: 140px) */
    height?: string | number
    /** Show a header bar inside the card */
    showHeader?: boolean
    className?: string
    style?: React.CSSProperties
}

export function CardSkeleton({
    width = '100%',
    height = 140,
    showHeader = true,
    className = '',
    style,
}: CardSkeletonProps) {
    injectKeyframes()
    return (
        <motion.div
            className={className}
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            style={{
                width,
                height,
                ...shimmerBase,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 20,
                boxSizing: 'border-box',
                border: '1px solid rgba(0,0,0,0.06)',
                ...style,
            }}
        >
            {showHeader && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div
                        style={{
                            width: '45%',
                            height: 12,
                            borderRadius: 6,
                            background: 'rgba(0,0,0,0.05)',
                        }}
                    />
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: 'rgba(0,0,0,0.04)',
                        }}
                    />
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                    style={{
                        width: '60%',
                        height: 24,
                        borderRadius: 6,
                        background: 'rgba(0,0,0,0.05)',
                    }}
                />
                <div
                    style={{
                        width: '35%',
                        height: 10,
                        borderRadius: 4,
                        background: 'rgba(0,0,0,0.03)',
                    }}
                />
            </div>
        </motion.div>
    )
}

// ============================================
// TableSkeleton
// ============================================
export interface TableSkeletonProps {
    rows?: number
    columns?: number
    className?: string
    style?: React.CSSProperties
}

export function TableSkeleton({
    rows = 6,
    columns = 5,
    className = '',
    style,
}: TableSkeletonProps) {
    injectKeyframes()

    const colWidths = ['22%', '18%', '16%', '20%', '14%']

    return (
        <motion.div
            className={className}
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            custom={3}
            style={{
                ...shimmerBase,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                border: '1px solid rgba(0,0,0,0.06)',
                flex: 1,
                ...style,
            }}
        >
            {/* Header row */}
            <div
                style={{
                    display: 'flex',
                    gap: gap.medium,
                    paddingBottom: 14,
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    marginBottom: 6,
                }}
            >
                {Array.from({ length: columns }, (_, c) => (
                    <div
                        key={c}
                        style={{
                            width: colWidths[c % colWidths.length],
                            height: 10,
                            borderRadius: 4,
                            background: 'rgba(0,0,0,0.07)',
                        }}
                    />
                ))}
            </div>

            {/* Data rows */}
            {Array.from({ length: rows }, (_, r) => (
                <div
                    key={r}
                    style={{
                        display: 'flex',
                        gap: gap.medium,
                        padding: '12px 0',
                        borderBottom: r < rows - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                    }}
                >
                    {Array.from({ length: columns }, (_, c) => (
                        <div
                            key={c}
                            style={{
                                width: colWidths[c % colWidths.length],
                                height: 10,
                                borderRadius: 4,
                                background: `rgba(0,0,0,${0.03 + (c % 2) * 0.02})`,
                            }}
                        />
                    ))}
                </div>
            ))}
        </motion.div>
    )
}

// ============================================
// ChartSkeleton
// ============================================
export interface ChartSkeletonProps {
    /** Chart variant */
    variant?: 'area' | 'bar' | 'pie'
    className?: string
    style?: React.CSSProperties
}

export function ChartSkeleton({
    variant = 'area',
    className = '',
    style,
}: ChartSkeletonProps) {
    injectKeyframes()

    return (
        <motion.div
            className={className}
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            custom={2}
            style={{
                ...shimmerBase,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: gap.large,
                border: '1px solid rgba(0,0,0,0.06)',
                flex: 1,
                minHeight: 280,
                ...style,
            }}
        >
            {/* Chart title bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '30%', height: 12, borderRadius: 6, background: 'rgba(0,0,0,0.06)' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 50, height: 22, ...shimmerPill, background: 'rgba(0,0,0,0.04)' }} />
                    <div style={{ width: 50, height: 22, ...shimmerPill, background: 'rgba(0,0,0,0.04)' }} />
                </div>
            </div>

            {/* Chart area */}
            {variant === 'bar' ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 10, padding: '0 8px' }}>
                    {[65, 85, 45, 70, 90, 55, 75, 40, 80, 60].map((h, i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                height: `${h}%`,
                                borderRadius: '4px 4px 0 0',
                                background: 'rgba(0,0,0,0.04)',
                            }}
                        />
                    ))}
                </div>
            ) : variant === 'pie' ? (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div
                        style={{
                            width: 160,
                            height: 160,
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.04)',
                            border: '12px solid rgba(0,0,0,0.06)',
                        }}
                    />
                </div>
            ) : (
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 400 150"
                        preserveAspectRatio="none"
                        style={{ opacity: 0.15 }}
                    >
                        <path
                            d="M0,120 C50,100 80,40 140,60 C200,80 220,20 280,50 C340,80 370,30 400,45"
                            fill="none"
                            stroke="rgba(0,0,0,0.15)"
                            strokeWidth="2"
                        />
                        <path
                            d="M0,120 C50,100 80,40 140,60 C200,80 220,20 280,50 C340,80 370,30 400,45 L400,150 L0,150 Z"
                            fill="rgba(0,0,0,0.04)"
                        />
                    </svg>
                </div>
            )}

            {/* X-axis labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {Array.from({ length: 6 }, (_, i) => (
                    <div
                        key={i}
                        style={{
                            width: 32,
                            height: 8,
                            borderRadius: 4,
                            background: 'rgba(0,0,0,0.04)',
                        }}
                    />
                ))}
            </div>
        </motion.div>
    )
}

// ============================================
// PageSkeleton — Full page loading state
// ============================================
export interface PageSkeletonProps {
    /** Number of KPI cards (default 4) */
    kpiCount?: number
    /** Show the 2-col bottom section (default true) */
    showChartAndTable?: boolean
    className?: string
    style?: React.CSSProperties
}

export function PageSkeleton({
    kpiCount = 4,
    showChartAndTable = true,
    className = '',
    style,
}: PageSkeletonProps) {
    injectKeyframes()

    return (
        <div className={className} style={{ ...pagePadding, ...style }}>
            {/* ─── Breadcrumb bar ─── */}
            <motion.div
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                style={{ display: 'flex', gap: gap.small, alignItems: 'center' }}
            >
                <div style={{ width: 60, height: 10, ...shimmerPill }} />
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(0,0,0,0.06)' }} />
                <div style={{ width: 90, height: 10, ...shimmerPill }} />
            </motion.div>

            {/* ─── Page header ─── */}
            <motion.div
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: gap.small }}>
                    <div style={{ width: 260, height: 28, ...shimmerNarrow }} />
                    <div style={{ width: 180, height: 12, ...shimmerPill }} />
                </div>
                <div style={{ display: 'flex', gap: gap.medium }}>
                    <div style={{ width: 100, height: 36, ...shimmerPill }} />
                    <div style={{ width: 100, height: 36, ...shimmerPill }} />
                </div>
            </motion.div>

            {/* ─── KPI cards row ─── */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${kpiCount}, 1fr)`,
                    gap: gap.large,
                }}
            >
                {Array.from({ length: kpiCount }, (_, i) => (
                    <motion.div key={i} variants={fadeVariants} initial="hidden" animate="visible" custom={i + 2}>
                        <CardSkeleton height={140} />
                    </motion.div>
                ))}
            </div>

            {/* ─── Chart + Table 2-column ─── */}
            {showChartAndTable && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: gap.large,
                        flex: 1,
                    }}
                >
                    <ChartSkeleton variant="area" />
                    <TableSkeleton rows={6} columns={5} />
                </div>
            )}
        </div>
    )
}

export default PageSkeleton
