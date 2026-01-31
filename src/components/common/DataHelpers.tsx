import { ReactNode, useState, useMemo, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, ArrowDown, SortAsc, SortDesc, Filter, Download, Search } from 'lucide-react'
import './DataHelpers.css'

// Data Table with sorting/filtering helpers
interface Column<T> {
    key: keyof T | string
    header: string
    sortable?: boolean
    filterable?: boolean
    render?: (value: any, row: T) => ReactNode
    width?: string | number
}

interface DataTableHelperProps<T> {
    data: T[]
    columns: Column<T>[]
    searchable?: boolean
    sortable?: boolean
    pagination?: { pageSize: number; currentPage: number }
    onSort?: (key: string, direction: 'asc' | 'desc') => void
    onSearch?: (query: string) => void
    className?: string
}

export function DataTableHelper<T extends Record<string, any>>({
    data,
    columns,
    searchable = true,
    sortable = true,
    pagination,
    onSort,
    onSearch,
    className = ''
}: DataTableHelperProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null)
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
    const [search, setSearch] = useState('')

    const handleSort = (key: string) => {
        if (!sortable) return
        const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'
        setSortKey(key)
        setSortDir(newDir)
        onSort?.(key, newDir)
    }

    const sortedData = useMemo(() => {
        if (!sortKey) return data
        return [...data].sort((a, b) => {
            const aVal = a[sortKey]
            const bVal = b[sortKey]
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
            return 0
        })
    }, [data, sortKey, sortDir])

    const filteredData = useMemo(() => {
        if (!search) return sortedData
        const lower = search.toLowerCase()
        return sortedData.filter(row =>
            columns.some(col => {
                const val = row[col.key as keyof T]
                return String(val).toLowerCase().includes(lower)
            })
        )
    }, [sortedData, search, columns])

    const paginatedData = useMemo(() => {
        if (!pagination) return filteredData
        const start = (pagination.currentPage - 1) * pagination.pageSize
        return filteredData.slice(start, start + pagination.pageSize)
    }, [filteredData, pagination])

    return (
        <div className={`data-table-helper ${className}`}>
            {searchable && (
                <div className="data-table-helper__search">
                    <Search size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); onSearch?.(e.target.value) }}
                        placeholder="Search..."
                    />
                </div>
            )}

            <div className="data-table-helper__table-wrapper">
                <table className="data-table-helper__table">
                    <thead>
                        <tr>
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    style={{ width: col.width }}
                                    className={col.sortable !== false && sortable ? 'sortable' : ''}
                                    onClick={() => col.sortable !== false && handleSort(String(col.key))}
                                >
                                    <span>{col.header}</span>
                                    {col.sortable !== false && sortKey === col.key && (
                                        <span className="data-table-helper__sort-icon">
                                            {sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex}>
                                        {col.render
                                            ? col.render(row[col.key as keyof T], row)
                                            : String(row[col.key as keyof T] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="data-table-helper__footer">
                <span>{filteredData.length} results</span>
            </div>
        </div>
    )
}

// Statistics Calculator
interface StatData {
    values: number[]
}

interface StatisticsProps {
    data: StatData
    show?: ('mean' | 'median' | 'mode' | 'min' | 'max' | 'sum' | 'count' | 'stddev')[]
    className?: string
}

export function Statistics({
    data,
    show = ['mean', 'median', 'min', 'max', 'count'],
    className = ''
}: StatisticsProps) {
    const stats = useMemo(() => {
        const { values } = data
        if (!values.length) return {}

        const sorted = [...values].sort((a, b) => a - b)
        const sum = values.reduce((a, b) => a + b, 0)
        const mean = sum / values.length

        // Median
        const mid = Math.floor(sorted.length / 2)
        const median = sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid]

        // Mode
        const freq: Record<number, number> = {}
        values.forEach(v => freq[v] = (freq[v] || 0) + 1)
        const maxFreq = Math.max(...Object.values(freq))
        const mode = Number(Object.keys(freq).find(k => freq[Number(k)] === maxFreq))

        // Standard Deviation
        const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length
        const stddev = Math.sqrt(variance)

        return {
            mean: mean.toFixed(2),
            median: median.toFixed(2),
            mode: mode.toFixed(2),
            min: sorted[0].toFixed(2),
            max: sorted[sorted.length - 1].toFixed(2),
            sum: sum.toFixed(2),
            count: values.length,
            stddev: stddev.toFixed(2)
        }
    }, [data])

    const labels: Record<string, string> = {
        mean: 'Mean',
        median: 'Median',
        mode: 'Mode',
        min: 'Minimum',
        max: 'Maximum',
        sum: 'Sum',
        count: 'Count',
        stddev: 'Std Dev'
    }

    return (
        <div className={`statistics ${className}`}>
            {show.map(key => (
                <div key={key} className="statistics__item">
                    <span className="statistics__label">{labels[key]}</span>
                    <span className="statistics__value">{stats[key as keyof typeof stats]}</span>
                </div>
            ))}
        </div>
    )
}

// Percentage Change
interface PercentageChangeProps {
    current: number
    previous: number
    format?: 'percentage' | 'multiplier'
    showIcon?: boolean
    className?: string
}

export function PercentageChange({
    current,
    previous,
    format = 'percentage',
    showIcon = true,
    className = ''
}: PercentageChangeProps) {
    const change = ((current - previous) / previous) * 100
    const isPositive = change >= 0

    const formattedValue = format === 'percentage'
        ? `${isPositive ? '+' : ''}${change.toFixed(1)}%`
        : `${(current / previous).toFixed(2)}x`

    return (
        <span className={`percentage-change ${isPositive ? 'percentage-change--positive' : 'percentage-change--negative'} ${className}`}>
            {showIcon && (isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            {formattedValue}
        </span>
    )
}

// Data Formatter
interface DataFormatterProps {
    value: number | string
    type: 'currency' | 'number' | 'percentage' | 'date' | 'bytes' | 'compact'
    options?: {
        currency?: string
        locale?: string
        decimals?: number
    }
}

export function DataFormatter({ value, type, options = {} }: DataFormatterProps) {
    const { currency = 'USD', locale = 'en-US', decimals = 2 } = options

    const formatted = useMemo(() => {
        const num = typeof value === 'string' ? parseFloat(value) : value

        switch (type) {
            case 'currency':
                return new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency
                }).format(num)

            case 'number':
                return new Intl.NumberFormat(locale, {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                }).format(num)

            case 'percentage':
                return `${(num * 100).toFixed(decimals)}%`

            case 'date':
                return new Date(value).toLocaleDateString(locale)

            case 'bytes':
                const units = ['B', 'KB', 'MB', 'GB', 'TB']
                let unitIndex = 0
                let size = num
                while (size >= 1024 && unitIndex < units.length - 1) {
                    size /= 1024
                    unitIndex++
                }
                return `${size.toFixed(1)} ${units[unitIndex]}`

            case 'compact':
                if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
                if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
                if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
                return num.toString()

            default:
                return String(value)
        }
    }, [value, type, currency, locale, decimals])

    return <span>{formatted}</span>
}

// Empty State
interface EmptyStateProps {
    icon?: ReactNode
    title: string
    description?: string
    action?: { label: string; onClick: () => void }
    className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
    return (
        <div className={`empty-state ${className}`}>
            {icon && <div className="empty-state__icon">{icon}</div>}
            <h3 className="empty-state__title">{title}</h3>
            {description && <p className="empty-state__description">{description}</p>}
            {action && (
                <button className="empty-state__action" onClick={action.onClick}>
                    {action.label}
                </button>
            )}
        </div>
    )
}

// Loading Placeholder (Skeleton)
interface SkeletonProps {
    width?: string | number
    height?: string | number
    variant?: 'text' | 'circular' | 'rectangular'
    animation?: 'pulse' | 'wave' | 'none'
    className?: string
}

export function Skeleton({
    width = '100%',
    height = 16,
    variant = 'text',
    animation = 'pulse',
    className = ''
}: SkeletonProps) {
    return (
        <span
            className={`skeleton skeleton--${variant} skeleton--${animation} ${className}`}
            style={{ width, height }}
        />
    )
}

export default { DataTableHelper, Statistics, PercentageChange, DataFormatter, EmptyState, Skeleton }
