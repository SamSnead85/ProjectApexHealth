import { ReactNode, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Search, X, Filter, MoreHorizontal, Home, Star } from 'lucide-react'
import './TreeView.css'

interface TreeNode {
    id: string
    label: string
    icon?: ReactNode
    children?: TreeNode[]
    isExpanded?: boolean
    isSelected?: boolean
    isFavorite?: boolean
    metadata?: Record<string, any>
}

interface TreeViewProps {
    data: TreeNode[]
    onSelect?: (node: TreeNode) => void
    onExpand?: (node: TreeNode) => void
    onFavorite?: (node: TreeNode) => void
    selectedId?: string
    expandedIds?: string[]
    showSearch?: boolean
    showFavorites?: boolean
    multiSelect?: boolean
    className?: string
}

export function TreeView({
    data,
    onSelect,
    onExpand,
    onFavorite,
    selectedId,
    expandedIds = [],
    showSearch = true,
    showFavorites = false,
    multiSelect = false,
    className = ''
}: TreeViewProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [expanded, setExpanded] = useState<Set<string>>(new Set(expandedIds))
    const [selected, setSelected] = useState<Set<string>>(selectedId ? new Set([selectedId]) : new Set())

    const toggleExpand = useCallback((node: TreeNode) => {
        setExpanded(prev => {
            const next = new Set(prev)
            if (next.has(node.id)) {
                next.delete(node.id)
            } else {
                next.add(node.id)
            }
            return next
        })
        onExpand?.(node)
    }, [onExpand])

    const handleSelect = useCallback((node: TreeNode) => {
        if (multiSelect) {
            setSelected(prev => {
                const next = new Set(prev)
                if (next.has(node.id)) {
                    next.delete(node.id)
                } else {
                    next.add(node.id)
                }
                return next
            })
        } else {
            setSelected(new Set([node.id]))
        }
        onSelect?.(node)
    }, [multiSelect, onSelect])

    const filterNodes = useCallback((nodes: TreeNode[], query: string): TreeNode[] => {
        if (!query) return nodes
        return nodes.reduce<TreeNode[]>((acc, node) => {
            if (node.label.toLowerCase().includes(query.toLowerCase())) {
                acc.push(node)
            } else if (node.children) {
                const filtered = filterNodes(node.children, query)
                if (filtered.length > 0) {
                    acc.push({ ...node, children: filtered })
                }
            }
            return acc
        }, [])
    }, [])

    const filteredData = useMemo(() => filterNodes(data, searchQuery), [data, searchQuery, filterNodes])

    const renderNode = (node: TreeNode, depth: number = 0) => {
        const hasChildren = node.children && node.children.length > 0
        const isExpanded = expanded.has(node.id)
        const isSelected = selected.has(node.id)

        return (
            <div key={node.id} className="tree-view__node-wrapper">
                <motion.div
                    className={`tree-view__node ${isSelected ? 'tree-view__node--selected' : ''}`}
                    style={{ paddingLeft: `${depth * 20 + 8}px` }}
                    onClick={() => handleSelect(node)}
                    whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                    whileTap={{ scale: 0.99 }}
                >
                    {hasChildren ? (
                        <button
                            className="tree-view__expand"
                            onClick={(e) => {
                                e.stopPropagation()
                                toggleExpand(node)
                            }}
                        >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    ) : (
                        <span className="tree-view__expand-placeholder" />
                    )}

                    {node.icon && <span className="tree-view__icon">{node.icon}</span>}
                    <span className="tree-view__label">{node.label}</span>

                    {showFavorites && (
                        <button
                            className={`tree-view__favorite ${node.isFavorite ? 'tree-view__favorite--active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation()
                                onFavorite?.(node)
                            }}
                        >
                            <Star size={12} />
                        </button>
                    )}
                </motion.div>

                <AnimatePresence>
                    {hasChildren && isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {node.children!.map(child => renderNode(child, depth + 1))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    return (
        <div className={`tree-view ${className}`}>
            {showSearch && (
                <div className="tree-view__search">
                    <Search size={14} className="tree-view__search-icon" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="tree-view__search-input"
                    />
                    {searchQuery && (
                        <button className="tree-view__search-clear" onClick={() => setSearchQuery('')}>
                            <X size={12} />
                        </button>
                    )}
                </div>
            )}

            <div className="tree-view__content">
                {filteredData.length > 0 ? (
                    filteredData.map(node => renderNode(node))
                ) : (
                    <div className="tree-view__empty">No items found</div>
                )}
            </div>
        </div>
    )
}

// File explorer variant
interface FileExplorerProps {
    files: TreeNode[]
    onFileSelect?: (file: TreeNode) => void
    className?: string
}

export function FileExplorer({ files, onFileSelect, className = '' }: FileExplorerProps) {
    return (
        <div className={`file-explorer ${className}`}>
            <div className="file-explorer__header">
                <Home size={14} />
                <span>Files</span>
            </div>
            <TreeView
                data={files}
                onSelect={onFileSelect}
                showSearch={true}
                showFavorites={true}
            />
        </div>
    )
}

export default TreeView
