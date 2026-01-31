import { ReactNode, useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { GripVertical, Plus, X, MoreHorizontal, Edit2, Copy, Trash2, Eye, EyeOff, Lock, Unlock } from 'lucide-react'
import './DragDrop.css'

// Sortable List
interface SortableItem {
    id: string
    content: ReactNode
    locked?: boolean
    hidden?: boolean
}

interface SortableListProps {
    items: SortableItem[]
    onReorder: (items: SortableItem[]) => void
    onRemove?: (id: string) => void
    onToggleLock?: (id: string) => void
    onToggleVisibility?: (id: string) => void
    renderItem?: (item: SortableItem, dragHandle: ReactNode) => ReactNode
    className?: string
}

export function SortableList({
    items,
    onReorder,
    onRemove,
    onToggleLock,
    onToggleVisibility,
    renderItem,
    className = ''
}: SortableListProps) {
    const [activeId, setActiveId] = useState<string | null>(null)

    const DragHandle = () => (
        <span className="sortable-list__handle">
            <GripVertical size={16} />
        </span>
    )

    return (
        <Reorder.Group
            axis="y"
            values={items}
            onReorder={onReorder}
            className={`sortable-list ${className}`}
        >
            {items.map(item => (
                <Reorder.Item
                    key={item.id}
                    value={item}
                    className={`sortable-list__item ${item.locked ? 'sortable-list__item--locked' : ''} ${item.hidden ? 'sortable-list__item--hidden' : ''}`}
                    dragListener={!item.locked}
                    onDragStart={() => setActiveId(item.id)}
                    onDragEnd={() => setActiveId(null)}
                >
                    {renderItem ? (
                        renderItem(item, <DragHandle />)
                    ) : (
                        <>
                            {!item.locked && <DragHandle />}
                            <span className="sortable-list__content">{item.content}</span>
                            <div className="sortable-list__actions">
                                {onToggleVisibility && (
                                    <button onClick={() => onToggleVisibility(item.id)}>
                                        {item.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                )}
                                {onToggleLock && (
                                    <button onClick={() => onToggleLock(item.id)}>
                                        {item.locked ? <Lock size={14} /> : <Unlock size={14} />}
                                    </button>
                                )}
                                {onRemove && !item.locked && (
                                    <button onClick={() => onRemove(item.id)}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </Reorder.Item>
            ))}
        </Reorder.Group>
    )
}

// Kanban Board
interface KanbanCard {
    id: string
    title: string
    description?: string
    labels?: { text: string; color: string }[]
    assignee?: { name: string; avatar?: string }
}

interface KanbanColumn {
    id: string
    title: string
    cards: KanbanCard[]
    color?: string
}

interface KanbanBoardProps {
    columns: KanbanColumn[]
    onCardMove: (cardId: string, fromColumn: string, toColumn: string) => void
    onCardAdd?: (columnId: string) => void
    onCardClick?: (card: KanbanCard) => void
    className?: string
}

export function KanbanBoard({
    columns,
    onCardMove,
    onCardAdd,
    onCardClick,
    className = ''
}: KanbanBoardProps) {
    const [draggedCard, setDraggedCard] = useState<{ card: KanbanCard; columnId: string } | null>(null)

    const handleDragStart = (card: KanbanCard, columnId: string) => {
        setDraggedCard({ card, columnId })
    }

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
        e.preventDefault()
        if (draggedCard && draggedCard.columnId !== targetColumnId) {
            onCardMove(draggedCard.card.id, draggedCard.columnId, targetColumnId)
        }
        setDraggedCard(null)
    }

    return (
        <div className={`kanban-board ${className}`}>
            {columns.map(column => (
                <div
                    key={column.id}
                    className="kanban-column"
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    <div className="kanban-column__header">
                        <span
                            className="kanban-column__indicator"
                            style={{ backgroundColor: column.color }}
                        />
                        <h3 className="kanban-column__title">{column.title}</h3>
                        <span className="kanban-column__count">{column.cards.length}</span>
                        {onCardAdd && (
                            <button
                                className="kanban-column__add"
                                onClick={() => onCardAdd(column.id)}
                            >
                                <Plus size={16} />
                            </button>
                        )}
                    </div>

                    <div className="kanban-column__cards">
                        {column.cards.map(card => (
                            <motion.div
                                key={card.id}
                                className="kanban-card"
                                draggable
                                onDragStart={() => handleDragStart(card, column.id)}
                                onClick={() => onCardClick?.(card)}
                                layout
                                whileHover={{ y: -2 }}
                            >
                                {card.labels && card.labels.length > 0 && (
                                    <div className="kanban-card__labels">
                                        {card.labels.map((label, i) => (
                                            <span
                                                key={i}
                                                className="kanban-card__label"
                                                style={{ backgroundColor: label.color }}
                                            >
                                                {label.text}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <h4 className="kanban-card__title">{card.title}</h4>
                                {card.description && (
                                    <p className="kanban-card__desc">{card.description}</p>
                                )}
                                {card.assignee && (
                                    <div className="kanban-card__assignee">
                                        {card.assignee.avatar ? (
                                            <img src={card.assignee.avatar} alt={card.assignee.name} />
                                        ) : (
                                            <span>{card.assignee.name.charAt(0)}</span>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

// Dropzone
interface DropzoneProps {
    onDrop: (files: File[]) => void
    accept?: string
    multiple?: boolean
    maxSize?: number
    children?: ReactNode
    className?: string
}

export function Dropzone({
    onDrop,
    accept,
    multiple = true,
    maxSize,
    children,
    className = ''
}: DropzoneProps) {
    const [isDragActive, setIsDragActive] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(true)
    }, [])

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)

        const files = Array.from(e.dataTransfer.files)
        const validFiles = maxSize
            ? files.filter(f => f.size <= maxSize)
            : files
        onDrop(validFiles)
    }, [maxSize, onDrop])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : []
        onDrop(files)
    }

    return (
        <div
            className={`dropzone ${isDragActive ? 'dropzone--active' : ''} ${className}`}
            onDrag={handleDrag}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleChange}
                style={{ display: 'none' }}
            />
            {children || (
                <div className="dropzone__content">
                    <span className="dropzone__icon">📁</span>
                    <span className="dropzone__text">
                        {isDragActive ? 'Drop files here' : 'Drag & drop files, or click to browse'}
                    </span>
                </div>
            )}
        </div>
    )
}

export default { SortableList, KanbanBoard, Dropzone }
