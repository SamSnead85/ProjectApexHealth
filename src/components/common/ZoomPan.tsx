import { ReactNode, useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Move, Download, Layers } from 'lucide-react'
import './ZoomPan.css'

interface ZoomPanProps {
    children: ReactNode
    minZoom?: number
    maxZoom?: number
    zoomStep?: number
    initialZoom?: number
    showControls?: boolean
    enablePan?: boolean
    enableWheel?: boolean
    enablePinch?: boolean
    onZoomChange?: (zoom: number) => void
    className?: string
}

export function ZoomPan({
    children,
    minZoom = 0.5,
    maxZoom = 3,
    zoomStep = 0.1,
    initialZoom = 1,
    showControls = true,
    enablePan = true,
    enableWheel = true,
    enablePinch = true,
    onZoomChange,
    className = ''
}: ZoomPanProps) {
    const [zoom, setZoom] = useState(initialZoom)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const startPos = useRef({ x: 0, y: 0 })
    const startPan = useRef({ x: 0, y: 0 })

    const handleZoom = useCallback((newZoom: number) => {
        const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom))
        setZoom(clampedZoom)
        onZoomChange?.(clampedZoom)
    }, [minZoom, maxZoom, onZoomChange])

    const zoomIn = () => handleZoom(zoom + zoomStep)
    const zoomOut = () => handleZoom(zoom - zoomStep)
    const resetZoom = () => {
        handleZoom(1)
        setPosition({ x: 0, y: 0 })
    }

    const handleWheel = useCallback((e: WheelEvent) => {
        if (!enableWheel) return
        e.preventDefault()
        const delta = -e.deltaY * 0.001
        handleZoom(zoom + delta)
    }, [zoom, enableWheel, handleZoom])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!enablePan) return
        setIsPanning(true)
        startPos.current = { x: e.clientX, y: e.clientY }
        startPan.current = position
    }, [enablePan, position])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isPanning) return
        const dx = e.clientX - startPos.current.x
        const dy = e.clientY - startPos.current.y
        setPosition({
            x: startPan.current.x + dx,
            y: startPan.current.y + dy
        })
    }, [isPanning])

    const handleMouseUp = () => setIsPanning(false)

    const toggleFullscreen = () => {
        if (!containerRef.current) return
        if (document.fullscreenElement) {
            document.exitFullscreen()
            setIsFullscreen(false)
        } else {
            containerRef.current.requestFullscreen()
            setIsFullscreen(true)
        }
    }

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        container.addEventListener('wheel', handleWheel, { passive: false })
        return () => container.removeEventListener('wheel', handleWheel)
    }, [handleWheel])

    return (
        <div
            ref={containerRef}
            className={`zoom-pan ${isPanning ? 'zoom-pan--panning' : ''} ${className}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <motion.div
                className="zoom-pan__content"
                style={{
                    scale: zoom,
                    x: position.x,
                    y: position.y
                }}
            >
                {children}
            </motion.div>

            {showControls && (
                <div className="zoom-pan__controls">
                    <button onClick={zoomIn} title="Zoom In" disabled={zoom >= maxZoom}>
                        <ZoomIn size={16} />
                    </button>
                    <span className="zoom-pan__level">{Math.round(zoom * 100)}%</span>
                    <button onClick={zoomOut} title="Zoom Out" disabled={zoom <= minZoom}>
                        <ZoomOut size={16} />
                    </button>
                    <button onClick={resetZoom} title="Reset">
                        <RotateCcw size={16} />
                    </button>
                    <button onClick={toggleFullscreen} title="Fullscreen">
                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>
            )}
        </div>
    )
}

// Image Viewer with zoom
interface ImageViewerProps {
    src: string
    alt?: string
    className?: string
}

export function ImageViewer({ src, alt = 'Image', className = '' }: ImageViewerProps) {
    return (
        <ZoomPan className={`image-viewer ${className}`}>
            <img src={src} alt={alt} draggable={false} />
        </ZoomPan>
    )
}

// Canvas with layers
interface CanvasLayerProps {
    layers: {
        id: string
        content: ReactNode
        visible?: boolean
        opacity?: number
    }[]
    className?: string
}

export function LayeredCanvas({ layers, className = '' }: CanvasLayerProps) {
    const [visibleLayers, setVisibleLayers] = useState<Set<string>>(
        new Set(layers.filter(l => l.visible !== false).map(l => l.id))
    )
    const [showLayerPanel, setShowLayerPanel] = useState(false)

    const toggleLayer = (id: string) => {
        setVisibleLayers(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    return (
        <div className={`layered-canvas ${className}`}>
            <ZoomPan>
                <div className="layered-canvas__layers">
                    {layers.map(layer => (
                        <div
                            key={layer.id}
                            className={`layered-canvas__layer ${visibleLayers.has(layer.id) ? '' : 'layered-canvas__layer--hidden'}`}
                            style={{ opacity: layer.opacity ?? 1 }}
                        >
                            {layer.content}
                        </div>
                    ))}
                </div>
            </ZoomPan>

            <button
                className="layered-canvas__toggle"
                onClick={() => setShowLayerPanel(!showLayerPanel)}
            >
                <Layers size={16} />
            </button>

            <AnimatePresence>
                {showLayerPanel && (
                    <motion.div
                        className="layered-canvas__panel"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <h4>Layers</h4>
                        {layers.map(layer => (
                            <label key={layer.id} className="layered-canvas__layer-item">
                                <input
                                    type="checkbox"
                                    checked={visibleLayers.has(layer.id)}
                                    onChange={() => toggleLayer(layer.id)}
                                />
                                <span>{layer.id}</span>
                            </label>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ZoomPan
