import { ReactNode, useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, Play, Pause, Square, Check, X, Clock, AlertCircle, ChevronRight, ChevronDown, Plus, Trash2, Settings, Copy, MoreVertical, Zap, Activity, ArrowRight, Circle } from 'lucide-react'
import './WorkflowComponents.css'

// Workflow Node
interface WorkflowNodeProps { id: string; type: 'trigger' | 'action' | 'condition' | 'delay' | 'end'; title: string; description?: string; status?: 'idle' | 'running' | 'success' | 'error'; isSelected?: boolean; onSelect?: () => void; onDelete?: () => void; onConfigure?: () => void; className?: string }

export function WorkflowNode({ id, type, title, description, status = 'idle', isSelected = false, onSelect, onDelete, onConfigure, className = '' }: WorkflowNodeProps) {
    const icons = { trigger: <Zap size={18} />, action: <Play size={18} />, condition: <GitBranch size={18} />, delay: <Clock size={18} />, end: <Square size={18} /> }

    return (
        <motion.div className={`workflow-node workflow-node--${type} workflow-node--${status} ${isSelected ? 'selected' : ''} ${className}`}
            onClick={onSelect} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <div className="workflow-node__icon">{icons[type]}</div>
            <div className="workflow-node__content">
                <span className="workflow-node__title">{title}</span>
                {description && <span className="workflow-node__description">{description}</span>}
            </div>
            <div className="workflow-node__status">
                {status === 'running' && <div className="workflow-node__spinner" />}
                {status === 'success' && <Check size={14} />}
                {status === 'error' && <AlertCircle size={14} />}
            </div>
            <div className="workflow-node__actions">
                <button onClick={(e) => { e.stopPropagation(); onConfigure?.() }}><Settings size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete?.() }}><Trash2 size={14} /></button>
            </div>
        </motion.div>
    )
}

// Workflow Connection
interface WorkflowConnectionProps { from: { x: number; y: number }; to: { x: number; y: number }; label?: string; isActive?: boolean; className?: string }

export function WorkflowConnection({ from, to, label, isActive = false, className = '' }: WorkflowConnectionProps) {
    const midX = (from.x + to.x) / 2
    const midY = (from.y + to.y) / 2
    const path = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`

    return (
        <g className={`workflow-connection ${isActive ? 'active' : ''} ${className}`}>
            <path d={path} className="workflow-connection__line" />
            {isActive && <path d={path} className="workflow-connection__flow" />}
            {label && (
                <text x={midX} y={midY - 10} className="workflow-connection__label">{label}</text>
            )}
            <polygon points={`${to.x - 5},${to.y - 5} ${to.x},${to.y} ${to.x - 5},${to.y + 5}`} className="workflow-connection__arrow" />
        </g>
    )
}

// Workflow Status Bar
interface WorkflowStatusBarProps { status: 'idle' | 'running' | 'paused' | 'completed' | 'failed'; currentStep?: string; progress?: number; startTime?: Date; onPlay?: () => void; onPause?: () => void; onStop?: () => void; className?: string }

export function WorkflowStatusBar({ status, currentStep, progress, startTime, onPlay, onPause, onStop, className = '' }: WorkflowStatusBarProps) {
    const [elapsed, setElapsed] = useState(0)

    useEffect(() => {
        if (status === 'running' && startTime) {
            const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000)), 1000)
            return () => clearInterval(interval)
        }
    }, [status, startTime])

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

    return (
        <div className={`workflow-status-bar workflow-status-bar--${status} ${className}`}>
            <div className="workflow-status-bar__controls">
                {status === 'running' ? (
                    <button onClick={onPause}><Pause size={18} /></button>
                ) : (
                    <button onClick={onPlay}><Play size={18} /></button>
                )}
                <button onClick={onStop} disabled={status === 'idle'}><Square size={18} /></button>
            </div>
            <div className="workflow-status-bar__info">
                <span className="workflow-status-bar__status">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                {currentStep && <span className="workflow-status-bar__step">{currentStep}</span>}
            </div>
            {progress !== undefined && (
                <div className="workflow-status-bar__progress">
                    <div className="workflow-status-bar__progress-bar" style={{ width: `${progress}%` }} />
                    <span>{progress}%</span>
                </div>
            )}
            {startTime && <span className="workflow-status-bar__time">{formatTime(elapsed)}</span>}
        </div>
    )
}

// Step List
interface Step { id: string; title: string; status: 'pending' | 'current' | 'completed' | 'error'; duration?: number }

interface StepListProps { steps: Step[]; orientation?: 'horizontal' | 'vertical'; onStepClick?: (id: string) => void; className?: string }

export function StepList({ steps, orientation = 'horizontal', onStepClick, className = '' }: StepListProps) {
    return (
        <div className={`step-list step-list--${orientation} ${className}`}>
            {steps.map((step, i) => (
                <div key={step.id} className={`step-list__item step-list__item--${step.status}`} onClick={() => onStepClick?.(step.id)}>
                    <div className="step-list__indicator">
                        {step.status === 'completed' ? <Check size={12} /> : step.status === 'error' ? <X size={12} /> : i + 1}
                    </div>
                    <div className="step-list__content">
                        <span className="step-list__title">{step.title}</span>
                        {step.duration && <span className="step-list__duration">{step.duration}ms</span>}
                    </div>
                    {i < steps.length - 1 && <div className="step-list__connector" />}
                </div>
            ))}
        </div>
    )
}

// Execution Log
interface LogEntry { id: string; timestamp: Date; level: 'info' | 'warn' | 'error' | 'debug'; message: string; data?: any }

interface ExecutionLogProps { entries: LogEntry[]; maxHeight?: number; onClear?: () => void; className?: string }

export function ExecutionLog({ entries, maxHeight = 300, onClear, className = '' }: ExecutionLogProps) {
    const [expanded, setExpanded] = useState<Set<string>>(new Set())

    const toggle = (id: string) => {
        const newExpanded = new Set(expanded)
        if (newExpanded.has(id)) newExpanded.delete(id)
        else newExpanded.add(id)
        setExpanded(newExpanded)
    }

    return (
        <div className={`execution-log ${className}`} style={{ maxHeight }}>
            <div className="execution-log__header">
                <Activity size={14} /> <span>Execution Log</span>
                {onClear && <button onClick={onClear}><Trash2 size={12} /> Clear</button>}
            </div>
            <div className="execution-log__entries">
                {entries.map(entry => (
                    <div key={entry.id} className={`execution-log__entry execution-log__entry--${entry.level}`}>
                        <span className="execution-log__time">{entry.timestamp.toLocaleTimeString()}</span>
                        <span className={`execution-log__level`}>{entry.level.toUpperCase()}</span>
                        <span className="execution-log__message">{entry.message}</span>
                        {entry.data && (
                            <button className="execution-log__expand" onClick={() => toggle(entry.id)}>
                                {expanded.has(entry.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </button>
                        )}
                        {expanded.has(entry.id) && entry.data && (
                            <pre className="execution-log__data">{JSON.stringify(entry.data, null, 2)}</pre>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Action Palette
interface Action { id: string; name: string; icon: ReactNode; category: string; description?: string }

interface ActionPaletteProps { actions: Action[]; onSelect?: (action: Action) => void; searchable?: boolean; className?: string }

export function ActionPalette({ actions, onSelect, searchable = true, className = '' }: ActionPaletteProps) {
    const [search, setSearch] = useState('')
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

    const filtered = useMemo(() => {
        if (!search) return actions
        return actions.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()))
    }, [actions, search])

    const categories = useMemo(() => {
        const cats: Record<string, Action[]> = {}
        filtered.forEach(a => {
            if (!cats[a.category]) cats[a.category] = []
            cats[a.category].push(a)
        })
        return cats
    }, [filtered])

    const toggleCategory = (cat: string) => {
        const newExpanded = new Set(expandedCategories)
        if (newExpanded.has(cat)) newExpanded.delete(cat)
        else newExpanded.add(cat)
        setExpandedCategories(newExpanded)
    }

    return (
        <div className={`action-palette ${className}`}>
            {searchable && (
                <input className="action-palette__search" type="text" placeholder="Search actions..."
                    value={search} onChange={(e) => setSearch(e.target.value)} />
            )}
            <div className="action-palette__categories">
                {Object.entries(categories).map(([cat, acts]) => (
                    <div key={cat} className="action-palette__category">
                        <button className="action-palette__category-header" onClick={() => toggleCategory(cat)}>
                            {expandedCategories.has(cat) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <span>{cat}</span>
                            <span className="action-palette__count">{acts.length}</span>
                        </button>
                        {expandedCategories.has(cat) && (
                            <div className="action-palette__actions">
                                {acts.map(a => (
                                    <button key={a.id} className="action-palette__action" onClick={() => onSelect?.(a)}>
                                        <div className="action-palette__action-icon">{a.icon}</div>
                                        <div className="action-palette__action-info">
                                            <span>{a.name}</span>
                                            {a.description && <span className="action-palette__action-desc">{a.description}</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default { WorkflowNode, WorkflowConnection, WorkflowStatusBar, StepList, ExecutionLog, ActionPalette }
