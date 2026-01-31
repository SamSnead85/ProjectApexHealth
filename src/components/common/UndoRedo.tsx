import { ReactNode, useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Undo2, Redo2, History, Clock, X } from 'lucide-react'
import './UndoRedo.css'

// History Context
interface HistoryState<T> {
    past: T[]
    present: T
    future: T[]
}

interface HistoryContextType<T> {
    state: T
    canUndo: boolean
    canRedo: boolean
    undo: () => void
    redo: () => void
    set: (newState: T, skipHistory?: boolean) => void
    reset: (initialState: T) => void
    history: HistoryState<T>
}

const HistoryContext = createContext<HistoryContextType<any> | null>(null)

export function useHistory<T>() {
    const context = useContext(HistoryContext)
    if (!context) throw new Error('useHistory must be used within HistoryProvider')
    return context as HistoryContextType<T>
}

interface HistoryProviderProps<T> {
    initialState: T
    maxHistory?: number
    children: ReactNode
}

export function HistoryProvider<T>({ initialState, maxHistory = 50, children }: HistoryProviderProps<T>) {
    const [history, setHistory] = useState<HistoryState<T>>({
        past: [],
        present: initialState,
        future: []
    })

    const canUndo = history.past.length > 0
    const canRedo = history.future.length > 0

    const undo = useCallback(() => {
        if (!canUndo) return
        setHistory(prev => ({
            past: prev.past.slice(0, -1),
            present: prev.past[prev.past.length - 1],
            future: [prev.present, ...prev.future]
        }))
    }, [canUndo])

    const redo = useCallback(() => {
        if (!canRedo) return
        setHistory(prev => ({
            past: [...prev.past, prev.present],
            present: prev.future[0],
            future: prev.future.slice(1)
        }))
    }, [canRedo])

    const set = useCallback((newState: T, skipHistory = false) => {
        if (skipHistory) {
            setHistory(prev => ({ ...prev, present: newState }))
        } else {
            setHistory(prev => ({
                past: [...prev.past.slice(-maxHistory + 1), prev.present],
                present: newState,
                future: []
            }))
        }
    }, [maxHistory])

    const reset = useCallback((newInitialState: T) => {
        setHistory({
            past: [],
            present: newInitialState,
            future: []
        })
    }, [])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault()
                if (e.shiftKey) {
                    redo()
                } else {
                    undo()
                }
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
                e.preventDefault()
                redo()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [undo, redo])

    return (
        <HistoryContext.Provider value={{
            state: history.present,
            canUndo,
            canRedo,
            undo,
            redo,
            set,
            reset,
            history
        }}>
            {children}
        </HistoryContext.Provider>
    )
}

// Undo/Redo Buttons
interface UndoRedoButtonsProps {
    size?: 'sm' | 'md' | 'lg'
    showLabels?: boolean
    showShortcuts?: boolean
    className?: string
}

export function UndoRedoButtons({
    size = 'md',
    showLabels = false,
    showShortcuts = false,
    className = ''
}: UndoRedoButtonsProps) {
    const { canUndo, canRedo, undo, redo } = useHistory()

    const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 20

    return (
        <div className={`undo-redo-buttons undo-redo-buttons--${size} ${className}`}>
            <button
                className="undo-redo-buttons__btn"
                onClick={undo}
                disabled={!canUndo}
                title={showShortcuts ? 'Undo (⌘Z)' : 'Undo'}
            >
                <Undo2 size={iconSize} />
                {showLabels && <span>Undo</span>}
                {showShortcuts && <kbd>⌘Z</kbd>}
            </button>
            <button
                className="undo-redo-buttons__btn"
                onClick={redo}
                disabled={!canRedo}
                title={showShortcuts ? 'Redo (⌘⇧Z)' : 'Redo'}
            >
                <Redo2 size={iconSize} />
                {showLabels && <span>Redo</span>}
                {showShortcuts && <kbd>⌘⇧Z</kbd>}
            </button>
        </div>
    )
}

// History Panel
interface HistoryPanelProps<T> {
    renderState?: (state: T, index: number) => ReactNode
    formatTimestamp?: (index: number) => string
    isOpen: boolean
    onClose: () => void
    className?: string
}

export function HistoryPanel<T>({
    renderState,
    formatTimestamp,
    isOpen,
    onClose,
    className = ''
}: HistoryPanelProps<T>) {
    const { history, set, reset } = useHistory<T>()

    const allStates = [...history.past, history.present]
    const currentIndex = history.past.length

    const handleRestore = (index: number) => {
        if (index === currentIndex) return
        set(allStates[index])
    }

    const defaultTimestamp = (index: number) => {
        if (index === currentIndex) return 'Current'
        return `Step ${index + 1}`
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className={`history-panel ${className}`}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
            >
                <div className="history-panel__header">
                    <History size={16} />
                    <span>History</span>
                    <button className="history-panel__close" onClick={onClose}>
                        <X size={14} />
                    </button>
                </div>

                <div className="history-panel__list">
                    {allStates.map((state, index) => (
                        <button
                            key={index}
                            className={`history-panel__item ${index === currentIndex ? 'history-panel__item--current' : ''}`}
                            onClick={() => handleRestore(index)}
                        >
                            <span className="history-panel__item-marker" />
                            <div className="history-panel__item-content">
                                {renderState ? renderState(state, index) : (
                                    <span className="history-panel__item-label">
                                        {formatTimestamp ? formatTimestamp(index) : defaultTimestamp(index)}
                                    </span>
                                )}
                            </div>
                            {index === currentIndex && (
                                <span className="history-panel__item-badge">Current</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="history-panel__footer">
                    <button
                        className="history-panel__clear"
                        onClick={() => reset(history.present)}
                    >
                        Clear History
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

// History Timeline (visual)
interface HistoryTimelineProps {
    maxVisible?: number
    className?: string
}

export function HistoryTimeline({ maxVisible = 10, className = '' }: HistoryTimelineProps) {
    const { history, set } = useHistory()

    const allStates = [...history.past, history.present, ...history.future]
    const currentIndex = history.past.length
    const start = Math.max(0, currentIndex - Math.floor(maxVisible / 2))
    const visibleStates = allStates.slice(start, start + maxVisible)

    return (
        <div className={`history-timeline ${className}`}>
            <div className="history-timeline__track">
                {visibleStates.map((state, i) => {
                    const actualIndex = start + i
                    const isCurrent = actualIndex === currentIndex
                    const isPast = actualIndex < currentIndex
                    const isFuture = actualIndex > currentIndex

                    return (
                        <button
                            key={actualIndex}
                            className={`history-timeline__point ${isCurrent ? 'history-timeline__point--current' : ''} ${isPast ? 'history-timeline__point--past' : ''} ${isFuture ? 'history-timeline__point--future' : ''}`}
                            onClick={() => set(state)}
                        >
                            <span className="history-timeline__dot" />
                        </button>
                    )
                })}
            </div>
            <div className="history-timeline__labels">
                <span>Past</span>
                <span>Current</span>
                <span>Future</span>
            </div>
        </div>
    )
}

export default { HistoryProvider, useHistory, UndoRedoButtons, HistoryPanel, HistoryTimeline }
