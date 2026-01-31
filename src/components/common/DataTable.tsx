import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, ChevronsUpDown, ArrowLeft, ArrowRight, Search, Filter, MoreHorizontal } from 'lucide-react'
import './DataTable.css'

export interface Column<T> {
    key: string
    header: string
    width?: string
    sortable?: boolean
    render?: (value: any, row: T, index: number) => ReactNode
}

interface DataTableProps<T> {
    columns: Column<T>[]
    data: T[]
    keyField: keyof T
    loading?: boolean
    emptyMessage?: string
    sortable?: boolean
    onSort?: (key: string, direction: 'asc' | 'desc') => void
    selectable?: boolean
    selectedKeys?: Set<string>
    onSelectionChange?: (keys: Set<string>) => void
    pagination?: {
        currentPage: number
        totalPages: number
        pageSize: number
        totalItems: number
        onPageChange: (page: number) => void
    }
    onRowClick?: (row: T) => void
    className?: string
}

export function DataTable<T extends Record<string, any>>({
    columns,
    data,
    keyField,
    loading = false,
    emptyMessage = 'No data available',
    sortable = false,
    onSort,
    selectable = false,
    selectedKeys = new Set(),
    onSelectionChange,
    pagination,
    onRowClick,
    className = ''
}: DataTableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

    const handleSort = (key: string) => {
        if (!sortable) return

        let direction: 'asc' | 'desc' = 'asc'
        if (sortKey === key && sortDirection === 'asc') {
            direction = 'desc'
        }
        setSortKey(key)
        setSortDirection(direction)
        onSort?.(key, direction)
    }

    const handleSelectAll = () => {
        if (selectedKeys.size === data.length) {
            onSelectionChange?.(new Set())
        } else {
            onSelectionChange?.(new Set(data.map(row => String(row[keyField]))))
        }
    }

    const handleSelectRow = (key: string) => {
        const newKeys = new Set(selectedKeys)
        if (newKeys.has(key)) {
            newKeys.delete(key)
        } else {
            newKeys.add(key)
        }
        onSelectionChange?.(newKeys)
    }

    const getSortIcon = (key: string) => {
        if (sortKey !== key) return <ChevronsUpDown size={14} />
        return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    }

    return (
        <div className={`data-table-wrapper ${className}`}>
            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            {selectable && (
                                <th className="data-table__th data-table__th--checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedKeys.size === data.length && data.length > 0}
                                        onChange={handleSelectAll}
                                        className="data-table__checkbox"
                                    />
                                </th>
                            )}
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className={`data-table__th ${col.sortable !== false && sortable ? 'data-table__th--sortable' : ''}`}
                                    style={{ width: col.width }}
                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                >
                                    <span className="data-table__th-content">
                                        {col.header}
                                        {col.sortable !== false && sortable && (
                                            <span className={`data-table__sort-icon ${sortKey === col.key ? 'data-table__sort-icon--active' : ''}`}>
                                                {getSortIcon(col.key)}
                                            </span>
                                        )}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="data-table__row data-table__row--skeleton">
                                    {selectable && <td><div className="skeleton" /></td>}
                                    {columns.map(col => (
                                        <td key={col.key}><div className="skeleton" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr className="data-table__row--empty">
                                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => {
                                const key = String(row[keyField])
                                return (
                                    <motion.tr
                                        key={key}
                                        className={`data-table__row ${selectedKeys.has(key) ? 'data-table__row--selected' : ''} ${onRowClick ? 'data-table__row--clickable' : ''}`}
                                        onClick={() => onRowClick?.(row)}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                    >
                                        {selectable && (
                                            <td className="data-table__td data-table__td--checkbox" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedKeys.has(key)}
                                                    onChange={() => handleSelectRow(key)}
                                                    className="data-table__checkbox"
                                                />
                                            </td>
                                        )}
                                        {columns.map(col => (
                                            <td key={col.key} className="data-table__td">
                                                {col.render ? col.render(row[col.key], row, index) : row[col.key]}
                                            </td>
                                        ))}
                                    </motion.tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className="data-table__pagination">
                    <span className="data-table__pagination-info">
                        Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems} results
                    </span>
                    <div className="data-table__pagination-controls">
                        <button
                            className="data-table__pagination-btn"
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage <= 1}
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <span className="data-table__pagination-pages">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <button
                            className="data-table__pagination-btn"
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages}
                        >
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// Table toolbar
interface TableToolbarProps {
    searchValue?: string
    onSearchChange?: (value: string) => void
    searchPlaceholder?: string
    actions?: ReactNode
    filters?: ReactNode
    selectedCount?: number
    onClearSelection?: () => void
}

export function TableToolbar({
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Search...',
    actions,
    filters,
    selectedCount = 0,
    onClearSelection
}: TableToolbarProps) {
    return (
        <div className="table-toolbar">
            {selectedCount > 0 ? (
                <div className="table-toolbar__selection">
                    <span>{selectedCount} selected</span>
                    <button onClick={onClearSelection}>Clear</button>
                </div>
            ) : (
                <>
                    {onSearchChange && (
                        <div className="table-toolbar__search">
                            <Search size={16} />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={e => onSearchChange(e.target.value)}
                                placeholder={searchPlaceholder}
                            />
                        </div>
                    )}
                    {filters && (
                        <div className="table-toolbar__filters">
                            {filters}
                        </div>
                    )}
                </>
            )}
            {actions && (
                <div className="table-toolbar__actions">
                    {actions}
                </div>
            )}
        </div>
    )
}

export default DataTable
