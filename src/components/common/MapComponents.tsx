import { ReactNode, useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Compass, Layers as LayersIcon, ZoomIn, ZoomOut, Maximize, Search, Car, Footprints, Bike, Clock, Star, Phone, Globe, ChevronRight, Route, Locate } from 'lucide-react'
import './MapComponents.css'

// Location Card
interface Location { id: string; name: string; address: string; distance?: string; rating?: number; phone?: string; website?: string; hours?: string; category?: string; lat: number; lng: number }

interface LocationCardProps { location: Location; selected?: boolean; onSelect?: () => void; onNavigate?: () => void; onCall?: () => void; className?: string }

export function LocationCard({ location, selected = false, onSelect, onNavigate, onCall, className = '' }: LocationCardProps) {
    return (
        <div className={`location-card ${selected ? 'selected' : ''} ${className}`} onClick={onSelect}>
            <div className="location-card__icon"><MapPin size={20} /></div>
            <div className="location-card__content">
                <h4 className="location-card__name">{location.name}</h4>
                {location.category && <span className="location-card__category">{location.category}</span>}
                <p className="location-card__address">{location.address}</p>
                <div className="location-card__meta">
                    {location.distance && <span><Navigation size={12} /> {location.distance}</span>}
                    {location.rating && <span><Star size={12} fill="currentColor" /> {location.rating}</span>}
                </div>
                {location.hours && <span className="location-card__hours"><Clock size={12} /> {location.hours}</span>}
            </div>
            <div className="location-card__actions">
                {onNavigate && <button onClick={(e) => { e.stopPropagation(); onNavigate() }}><Route size={16} /></button>}
                {onCall && location.phone && <button onClick={(e) => { e.stopPropagation(); onCall() }}><Phone size={16} /></button>}
                <ChevronRight size={16} />
            </div>
        </div>
    )
}

// Map Search
interface MapSearchProps { onSearch?: (query: string) => void; onLocateMe?: () => void; placeholder?: string; className?: string }

export function MapSearch({ onSearch, onLocateMe, placeholder = 'Search locations...', className = '' }: MapSearchProps) {
    const [query, setQuery] = useState('')

    return (
        <div className={`map-search ${className}`}>
            <div className="map-search__input">
                <Search size={16} />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch?.(query)} />
            </div>
            {onLocateMe && <button className="map-search__locate" onClick={onLocateMe}><Locate size={18} /></button>}
        </div>
    )
}

// Map Controls
interface MapControlsProps { onZoomIn?: () => void; onZoomOut?: () => void; onFullscreen?: () => void; onLocate?: () => void; className?: string }

export function MapControls({ onZoomIn, onZoomOut, onFullscreen, onLocate, className = '' }: MapControlsProps) {
    return (
        <div className={`map-controls ${className}`}>
            <button onClick={onZoomIn}><ZoomIn size={18} /></button>
            <button onClick={onZoomOut}><ZoomOut size={18} /></button>
            <div className="map-controls__divider" />
            <button onClick={onFullscreen}><Maximize size={18} /></button>
            <button onClick={onLocate}><Locate size={18} /></button>
        </div>
    )
}

// Transport Mode Selector
interface TransportModeSelectorProps { mode: 'driving' | 'walking' | 'cycling'; onChange?: (mode: 'driving' | 'walking' | 'cycling') => void; className?: string }

export function TransportModeSelector({ mode, onChange, className = '' }: TransportModeSelectorProps) {
    const modes = [
        { id: 'driving' as const, icon: <Car size={18} />, label: 'Drive' },
        { id: 'walking' as const, icon: <Footprints size={18} />, label: 'Walk' },
        { id: 'cycling' as const, icon: <Bike size={18} />, label: 'Bike' },
    ]

    return (
        <div className={`transport-mode-selector ${className}`}>
            {modes.map(m => (
                <button key={m.id} className={`transport-mode-selector__btn ${mode === m.id ? 'active' : ''}`}
                    onClick={() => onChange?.(m.id)} title={m.label}>
                    {m.icon}
                </button>
            ))}
        </div>
    )
}

// Directions Panel
interface DirectionStep { instruction: string; distance: string; duration: string }

interface DirectionsPanelProps { origin: string; destination: string; steps: DirectionStep[]; totalDistance: string; totalDuration: string; onClose?: () => void; className?: string }

export function DirectionsPanel({ origin, destination, steps, totalDistance, totalDuration, onClose, className = '' }: DirectionsPanelProps) {
    return (
        <div className={`directions-panel ${className}`}>
            <div className="directions-panel__header">
                <div className="directions-panel__route">
                    <div className="directions-panel__endpoint">
                        <span className="directions-panel__dot directions-panel__dot--origin" />
                        <span>{origin}</span>
                    </div>
                    <div className="directions-panel__connector" />
                    <div className="directions-panel__endpoint">
                        <span className="directions-panel__dot directions-panel__dot--dest" />
                        <span>{destination}</span>
                    </div>
                </div>
                <div className="directions-panel__summary">
                    <span>{totalDistance}</span>
                    <span>•</span>
                    <span>{totalDuration}</span>
                </div>
            </div>
            <div className="directions-panel__steps">
                {steps.map((step, i) => (
                    <div key={i} className="directions-panel__step">
                        <span className="directions-panel__step-num">{i + 1}</span>
                        <div className="directions-panel__step-content">
                            <p>{step.instruction}</p>
                            <span>{step.distance} • {step.duration}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Map Legend
interface LegendItem { color: string; label: string }

interface MapLegendProps { items: LegendItem[]; title?: string; className?: string }

export function MapLegend({ items, title = 'Legend', className = '' }: MapLegendProps) {
    return (
        <div className={`map-legend ${className}`}>
            <h5 className="map-legend__title">{title}</h5>
            <div className="map-legend__items">
                {items.map((item, i) => (
                    <div key={i} className="map-legend__item">
                        <span className="map-legend__color" style={{ background: item.color }} />
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Map Marker
interface MapMarkerProps { label?: string; color?: string; size?: 'sm' | 'md' | 'lg'; pulse?: boolean; onClick?: () => void; className?: string }

export function MapMarker({ label, color = 'var(--apex-teal)', size = 'md', pulse = false, onClick, className = '' }: MapMarkerProps) {
    const sizes = { sm: 24, md: 32, lg: 40 }
    const s = sizes[size]

    return (
        <div className={`map-marker map-marker--${size} ${pulse ? 'pulse' : ''} ${className}`} onClick={onClick} style={{ '--marker-color': color } as React.CSSProperties}>
            <svg width={s} height={s * 1.5} viewBox="0 0 24 36">
                <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill={color} />
                <circle cx="12" cy="12" r="6" fill="rgba(0,0,0,0.2)" />
            </svg>
            {label && <span className="map-marker__label">{label}</span>}
        </div>
    )
}

export default { LocationCard, MapSearch, MapControls, TransportModeSelector, DirectionsPanel, MapLegend, MapMarker }
