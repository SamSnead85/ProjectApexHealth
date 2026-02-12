import { ReactNode, useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SortAsc, SortDesc, Filter, Download, RefreshCw, Settings, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Eye, Edit2, Trash2 } from 'lucide-react'
import './AdvancedTable.css'

interface Column<T> {
    key: keyof T | string
    label: string
    sortable?: boolean
    filterable?: boolean
    width?: string | number
    align?: 'left' | 'center' | 'right'
    render?: (value: any, row: T) => ReactNode
    sticky?: boolean
}

interface AdvancedTableProps<T> {
    columns: Column<T>[]
    data: T[]
    keyField: keyof T
    loading?: boolean
    pagination?: boolean
    pageSize?: number
    pageSizeOptions?: number[]
    sortable?: boolean
    selectable?: boolean
    expandable?: boolean
    renderExpandedRow?: (row: T) => ReactNode
    onRowClick?: (row: T) => void
    onSelectionChange?: (selected: T[]) => void
    onSort?: (key: string, direction: 'asc' | 'desc') => void
    onPageChange?: (page: number) => void
    onExport?: () => void
    onRefresh?: () => void
    toolbar?: ReactNode
    emptyMessage?: string
    className?: string
}

export function AdvancedTable<T extends Record<string, any>>({
    columns,
    data,
    keyField,
    loading = false,
    pagination = true,
    pageSize: initialPageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    sortable = true,
    selectable = false,
    expandable = false,
    renderExpandedRow,
    onRowClick,
    onSelectionChange,
    onSort,
    onPageChange,
    onExport,
    onRefresh,
    toolbar,
    emptyMessage = 'No data available',
    className = ''
}: AdvancedTableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(initialPageSize)
    const [sortKey, setSortKey] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set())
    const [expandedRows, setExpandedRows] = useState<Set<any>>(new Set())
    const [searchQuery, setSearchQuery] = useState('')

    const totalPages = Math.ceil(data.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    const filteredData = useMemo(() => {
        if (!searchQuery) return data
        return data.filter(row =>
            Object.values(row).some(value =>
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
    }, [data, searchQuery])

    const sortedData = useMemo(() => {
        if (!sortKey) return filteredData
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortKey]
            const bVal = b[sortKey]
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
            return 0
        })
    }, [filteredData, sortKey, sortDirection])

    const paginatedData = pagination ? sortedData.slice(startIndex, endIndex) : sortedData

    const handleSort = (key: string) => {
        if (!sortable) return
        const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
        setSortKey(key)
        setSortDirection(newDirection)
        onSort?.(key, newDirection)
    }

    const handleSelectAll = () => {
        if (selectedRows.size === paginatedData.length) {
            setSelectedRows(new Set())
        } else {
            setSelectedRows(new Set(paginatedData.map(row => row[keyField])))
        }
    }

    const handleSelectRow = (row: T) => {
        const key = row[keyField]
        const newSelected = new Set(selectedRows)
        if (newSelected.has(key)) {
            newSelected.delete(key)
        } else {
            newSelected.add(key)
        }
        setSelectedRows(newSelected)
        onSelectionChange?.(data.filter(r => newSelected.has(r[keyField])))
    }

    const toggleExpand = (row: T) => {
        const key = row[keyField]
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(key)) {
            newExpanded.delete(key)
        } else {
            newExpanded.add(key)
        }
        setExpandedRows(newExpanded)
    }

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
        onPageChange?.(page)
    }

    return (
        <div className={`advanced-table ${className}`}>
            {/* Toolbar */}
            <div className="advanced-table__toolbar">
                <div className="advanced-table__search">
                    <Search size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                    />
                </div>

                <div className="advanced-table__actions">
                    {toolbar}
                    {onRefresh && (
                        <button className="advanced-table__action" onClick={onRefresh} title="Refresh">
                            <RefreshCw size={16} />
                        </button>
                    )}
                    {onExport && (
                        <button className="advanced-table__action" onClick={onExport} title="Export">
                            <Download size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="advanced-table__wrapper">
                <table className="advanced-table__table">
                    <thead>
                        <tr>
                            {selectable && (
                                <th className="advanced-table__th advanced-table__th--checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}
                            {expandable && <th className="advanced-table__th advanced-table__th--expand" />}
                            {columns.map(col => (
                                <th
                                    key={String(col.key)}
                                    className={`advanced-table__th ${col.sortable !== false && sortable ? 'advanced-table__th--sortable' : ''} ${col.sticky ? 'advanced-table__th--sticky' : ''}`}
                                    style={{ width: col.width, textAlign: col.align || 'left' }}
                                    onClick={() => col.sortable !== false && handleSort(String(col.key))}
                                >
                                    <span>{col.label}</span>
                                    {sortKey === col.key && (
                                        <span className="advanced-table__sort-icon">
                                            {sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)} className="advanced-table__loading">
                                    <RefreshCw size={20} className="spin" />
                                    Loading...
                                </td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)} className="advanced-table__empty">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map(row => (
                                <>
                                    <motion.tr
                                        key={String(row[keyField])}
                                        className={`advanced-table__row ${selectedRows.has(row[keyField]) ? 'advanced-table__row--selected' : ''} ${onRowClick ? 'advanced-table__row--clickable' : ''}`}
                                        onClick={() => onRowClick?.(row)}
                                        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                                    >
                                        {selectable && (
                                            <td className="advanced-table__td advanced-table__td--checkbox" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(row[keyField])}
                                                    onChange={() => handleSelectRow(row)}
                                                />
                                            </td>
                                        )}
                                        {expandable && (
                                            <td className="advanced-table__td advanced-table__td--expand" onClick={e => { e.stopPropagation(); toggleExpand(row) }}>
                                                <motion.span animate={{ rotate: expandedRows.has(row[keyField]) ? 90 : 0 }}>
                                                    <ChevronRight size={14} />
                                                </motion.span>
                                            </td>
                                        )}
                                        {columns.map(col => (
                                            <td
                                                key={String(col.key)}
                                                className={`advanced-table__td ${col.sticky ? 'advanced-table__td--sticky' : ''}`}
                                                style={{ textAlign: col.align || 'left' }}
                                            >
                                                {col.render ? col.render(row[col.key as keyof T], row) : String(row[col.key as keyof T] ?? '')}
                                            </td>
                                        ))}
                                    </motion.tr>
                                    <AnimatePresence>
                                        {expandable && expandedRows.has(row[keyField]) && renderExpandedRow && (
                                            <motion.tr
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="advanced-table__expanded-row"
                                            >
                                                <td colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)}>
                                                    {renderExpandedRow(row)}
                                                </td>
                                            </motion.tr>
                                        )}
                                    </AnimatePresence>
                                </>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
                <div className="advanced-table__pagination">
                    <div className="advanced-table__page-size">
                        <span>Rows per page:</span>
                        <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}>
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                    <div className="advanced-table__page-info">
                        {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of {sortedData.length}
                    </div>

                    <div className="advanced-table__page-controls">
                        <button onClick={() => goToPage(1)} disabled={currentPage === 1}>
                            <ChevronsLeft size={16} />
                        </button>
                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                            <ChevronLeft size={16} />
                        </button>
                        <span className="advanced-table__page-number">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                            <ChevronRight size={16} />
                        </button>
                        <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdvancedTable
