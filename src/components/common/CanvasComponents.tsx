import { ReactNode, useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { Layers, Move, Square, Circle, Triangle, Type, Image, Minus, Plus, Grid, Lock, Unlock, Eye, EyeOff, Trash2, Copy, FlipHorizontal, FlipVertical, AlignLeft, AlignCenter, AlignRight, RotateCw } from 'lucide-react'
import './CanvasComponents.css'

// Canvas Layer
interface Layer { id: string; name: string; visible: boolean; locked: boolean; type: 'shape' | 'text' | 'image' }

interface LayersPanelProps { layers: Layer[]; selectedId?: string; onSelect?: (id: string) => void; onToggleVisibility?: (id: string) => void; onToggleLock?: (id: string) => void; onDelete?: (id: string) => void; onReorder?: (fromIndex: number, toIndex: number) => void; className?: string }

export function LayersPanel({ layers, selectedId, onSelect, onToggleVisibility, onToggleLock, onDelete, className = '' }: LayersPanelProps) {
    return (
        <div className={`layers-panel ${className}`}>
            <div className="layers-panel__header"><Layers size={16} /> <span>Layers</span></div>
            <div className="layers-panel__list">
                {layers.map(layer => (
                    <div key={layer.id} className={`layers-panel__layer ${selectedId === layer.id ? 'selected' : ''}`} onClick={() => onSelect?.(layer.id)}>
                        <button className="layers-panel__visibility" onClick={(e) => { e.stopPropagation(); onToggleVisibility?.(layer.id) }}>
                            {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <span className="layers-panel__icon">
                            {layer.type === 'shape' ? <Square size={14} /> : layer.type === 'text' ? <Type size={14} /> : <Image size={14} />}
                        </span>
                        <span className="layers-panel__name">{layer.name}</span>
                        <button className="layers-panel__lock" onClick={(e) => { e.stopPropagation(); onToggleLock?.(layer.id) }}>
                            {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>
                        <button className="layers-panel__delete" onClick={(e) => { e.stopPropagation(); onDelete?.(layer.id) }}><Trash2 size={12} /></button>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Shape Tools
interface ShapeToolsProps { selectedShape?: string; onSelect?: (shape: string) => void; className?: string }

export function ShapeTools({ selectedShape, onSelect, className = '' }: ShapeToolsProps) {
    const shapes = [
        { id: 'rectangle', icon: <Square size={18} />, label: 'Rectangle' },
        { id: 'circle', icon: <Circle size={18} />, label: 'Circle' },
        { id: 'triangle', icon: <Triangle size={18} />, label: 'Triangle' },
        { id: 'line', icon: <Minus size={18} />, label: 'Line' },
    ]

    return (
        <div className={`shape-tools ${className}`}>
            {shapes.map(shape => (
                <button key={shape.id} className={`shape-tools__btn ${selectedShape === shape.id ? 'active' : ''}`}
                    onClick={() => onSelect?.(shape.id)} title={shape.label}>
                    {shape.icon}
                </button>
            ))}
        </div>
    )
}

// Zoom Controls
interface ZoomControlsProps { zoom: number; onZoomIn?: () => void; onZoomOut?: () => void; onZoomReset?: () => void; onZoomChange?: (zoom: number) => void; min?: number; max?: number; className?: string }

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onZoomReset, onZoomChange, min = 10, max = 400, className = '' }: ZoomControlsProps) {
    return (
        <div className={`zoom-controls ${className}`}>
            <button onClick={onZoomOut} disabled={zoom <= min}><Minus size={14} /></button>
            <input type="range" min={min} max={max} value={zoom} onChange={(e) => onZoomChange?.(Number(e.target.value))} />
            <button onClick={onZoomIn} disabled={zoom >= max}><Plus size={14} /></button>
            <button className="zoom-controls__reset" onClick={onZoomReset}>{zoom}%</button>
        </div>
    )
}

// Transform Controls
interface TransformControlsProps { onFlipH?: () => void; onFlipV?: () => void; onRotate?: (degrees: number) => void; onAlignLeft?: () => void; onAlignCenter?: () => void; onAlignRight?: () => void; className?: string }

export function TransformControls({ onFlipH, onFlipV, onRotate, onAlignLeft, onAlignCenter, onAlignRight, className = '' }: TransformControlsProps) {
    return (
        <div className={`transform-controls ${className}`}>
            <div className="transform-controls__group">
                <span>Flip</span>
                <button onClick={onFlipH} title="Flip Horizontal"><FlipHorizontal size={16} /></button>
                <button onClick={onFlipV} title="Flip Vertical"><FlipVertical size={16} /></button>
            </div>
            <div className="transform-controls__group">
                <span>Rotate</span>
                <button onClick={() => onRotate?.(90)} title="Rotate 90°"><RotateCw size={16} /></button>
            </div>
            <div className="transform-controls__group">
                <span>Align</span>
                <button onClick={onAlignLeft} title="Align Left"><AlignLeft size={16} /></button>
                <button onClick={onAlignCenter} title="Align Center"><AlignCenter size={16} /></button>
                <button onClick={onAlignRight} title="Align Right"><AlignRight size={16} /></button>
            </div>
        </div>
    )
}

// Color Picker
interface ColorPickerProps { value: string; onChange?: (color: string) => void; presets?: string[]; label?: string; className?: string }

export function ColorPicker({ value, onChange, presets = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#000000', '#ffffff'], label, className = '' }: ColorPickerProps) {
    const [showPicker, setShowPicker] = useState(false)

    return (
        <div className={`color-picker ${className}`}>
            {label && <span className="color-picker__label">{label}</span>}
            <button className="color-picker__swatch" style={{ background: value }} onClick={() => setShowPicker(!showPicker)} />
            <AnimatePresence>
                {showPicker && (
                    <motion.div className="color-picker__dropdown" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <input type="color" value={value} onChange={(e) => onChange?.(e.target.value)} />
                        <div className="color-picker__presets">
                            {presets.map(color => (
                                <button key={color} className={`color-picker__preset ${value === color ? 'active' : ''}`}
                                    style={{ background: color }} onClick={() => { onChange?.(color); setShowPicker(false) }} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Draggable Element
interface DraggableElementProps { id: string; x: number; y: number; children: ReactNode; selected?: boolean; locked?: boolean; onSelect?: () => void; onDragEnd?: (x: number, y: number) => void; className?: string }

export function DraggableElement({ id, x, y, children, selected = false, locked = false, onSelect, onDragEnd, className = '' }: DraggableElementProps) {
    const controls = useDragControls()

    return (
        <motion.div
            className={`draggable-element ${selected ? 'selected' : ''} ${locked ? 'locked' : ''} ${className}`}
            style={{ left: x, top: y }}
            drag={!locked}
            dragControls={controls}
            dragMomentum={false}
            onDragEnd={(_, info) => onDragEnd?.(x + info.offset.x, y + info.offset.y)}
            onClick={(e) => { e.stopPropagation(); onSelect?.() }}
        >
            {children}
            {selected && !locked && (
                <>
                    <div className="draggable-element__handle draggable-element__handle--tl" />
                    <div className="draggable-element__handle draggable-element__handle--tr" />
                    <div className="draggable-element__handle draggable-element__handle--bl" />
                    <div className="draggable-element__handle draggable-element__handle--br" />
                </>
            )}
        </motion.div>
    )
}

// Grid Overlay
interface GridOverlayProps { size?: number; visible?: boolean; className?: string }

export function GridOverlay({ size = 20, visible = true, className = '' }: GridOverlayProps) {
    if (!visible) return null

    return (
        <div className={`grid-overlay ${className}`}
            style={{
                backgroundSize: `${size}px ${size}px`,
                backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`
            }}
        />
    )
}

export default { LayersPanel, ShapeTools, ZoomControls, TransformControls, ColorPicker, DraggableElement, GridOverlay }
