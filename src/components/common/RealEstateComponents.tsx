import { ReactNode, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Building2, MapPin, Bed, Bath, Square, Heart, Share2, Calendar, Phone, Mail, ChevronLeft, ChevronRight, X, Check, Tag, Clock, Car, Trees, Wifi, Dumbbell, Shield, Star, Camera, Video, ThumbsUp } from 'lucide-react'
import './RealEstateComponents.css'

// Property Card
interface Property { id: string; title: string; address: string; price: number; type: 'sale' | 'rent'; propertyType: 'house' | 'apartment' | 'condo' | 'land'; bedrooms?: number; bathrooms?: number; sqft?: number; images: string[]; isFavorite?: boolean; isNew?: boolean }

interface PropertyCardProps { property: Property; onFavorite?: () => void; onShare?: () => void; onClick?: () => void; className?: string }

export function PropertyCard({ property, onFavorite, onShare, onClick, className = '' }: PropertyCardProps) {
    const [imageIndex, setImageIndex] = useState(0)
    const formatPrice = (p: number) => property.type === 'rent' ? `$${p.toLocaleString()}/mo` : `$${p.toLocaleString()}`

    return (
        <div className={`property-card ${className}`} onClick={onClick}>
            <div className="property-card__gallery">
                <img src={property.images[imageIndex]} alt="" />
                {property.images.length > 1 && (
                    <>
                        <button className="property-card__nav property-card__nav--prev" onClick={(e) => { e.stopPropagation(); setImageIndex((imageIndex - 1 + property.images.length) % property.images.length) }}><ChevronLeft size={18} /></button>
                        <button className="property-card__nav property-card__nav--next" onClick={(e) => { e.stopPropagation(); setImageIndex((imageIndex + 1) % property.images.length) }}><ChevronRight size={18} /></button>
                        <div className="property-card__dots">
                            {property.images.map((_, i) => <span key={i} className={i === imageIndex ? 'active' : ''} />)}
                        </div>
                    </>
                )}
                <div className="property-card__badges">
                    {property.isNew && <span className="property-card__badge property-card__badge--new">New</span>}
                    <span className={`property-card__badge property-card__badge--${property.type}`}>{property.type === 'rent' ? 'For Rent' : 'For Sale'}</span>
                </div>
                <div className="property-card__actions">
                    <button className={property.isFavorite ? 'active' : ''} onClick={(e) => { e.stopPropagation(); onFavorite?.() }}><Heart size={18} fill={property.isFavorite ? 'currentColor' : 'none'} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onShare?.() }}><Share2 size={18} /></button>
                </div>
            </div>
            <div className="property-card__content">
                <div className="property-card__price">{formatPrice(property.price)}</div>
                <h3 className="property-card__title">{property.title}</h3>
                <div className="property-card__address"><MapPin size={14} /> {property.address}</div>
                <div className="property-card__features">
                    {property.bedrooms !== undefined && <span><Bed size={14} /> {property.bedrooms} bed</span>}
                    {property.bathrooms !== undefined && <span><Bath size={14} /> {property.bathrooms} bath</span>}
                    {property.sqft !== undefined && <span><Square size={14} /> {property.sqft.toLocaleString()} sqft</span>}
                </div>
            </div>
        </div>
    )
}

// Agent Card
interface Agent { id: string; name: string; title: string; photo?: string; phone: string; email: string; rating: number; reviewCount: number; listingsCount: number }

interface AgentCardProps { agent: Agent; onContact?: () => void; onMessage?: () => void; className?: string }

export function AgentCard({ agent, onContact, onMessage, className = '' }: AgentCardProps) {
    return (
        <div className={`agent-card ${className}`}>
            <div className="agent-card__photo">
                {agent.photo ? <img src={agent.photo} alt="" /> : agent.name.charAt(0)}
            </div>
            <div className="agent-card__info">
                <h4 className="agent-card__name">{agent.name}</h4>
                <span className="agent-card__title">{agent.title}</span>
                <div className="agent-card__rating">
                    <Star size={14} fill="currentColor" />
                    <span>{agent.rating}</span>
                    <span className="agent-card__reviews">({agent.reviewCount} reviews)</span>
                </div>
                <span className="agent-card__listings">{agent.listingsCount} active listings</span>
            </div>
            <div className="agent-card__actions">
                <button onClick={onContact}><Phone size={16} /> Call</button>
                <button onClick={onMessage}><Mail size={16} /> Email</button>
            </div>
        </div>
    )
}

// Property Feature List
interface PropertyFeature { icon: ReactNode; label: string; value: string }

interface PropertyFeaturesProps { features: PropertyFeature[]; columns?: 2 | 3 | 4; className?: string }

export function PropertyFeatures({ features, columns = 3, className = '' }: PropertyFeaturesProps) {
    return (
        <div className={`property-features property-features--cols-${columns} ${className}`}>
            {features.map((f, i) => (
                <div key={i} className="property-features__item">
                    <div className="property-features__icon">{f.icon}</div>
                    <div className="property-features__content">
                        <span className="property-features__value">{f.value}</span>
                        <span className="property-features__label">{f.label}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

// Mortgage Calculator
interface MortgageCalculatorProps { defaultPrice?: number; defaultDownPayment?: number; defaultRate?: number; defaultTerm?: number; className?: string }

export function MortgageCalculator({ defaultPrice = 500000, defaultDownPayment = 100000, defaultRate = 6.5, defaultTerm = 30, className = '' }: MortgageCalculatorProps) {
    const [price, setPrice] = useState(defaultPrice)
    const [downPayment, setDownPayment] = useState(defaultDownPayment)
    const [rate, setRate] = useState(defaultRate)
    const [term, setTerm] = useState(defaultTerm)

    const monthlyPayment = useMemo(() => {
        const principal = price - downPayment
        const monthlyRate = rate / 100 / 12
        const payments = term * 12
        if (monthlyRate === 0) return principal / payments
        return (principal * monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1)
    }, [price, downPayment, rate, term])

    const totalPayment = monthlyPayment * term * 12
    const totalInterest = totalPayment - (price - downPayment)

    return (
        <div className={`mortgage-calculator ${className}`}>
            <h4 className="mortgage-calculator__title">Mortgage Calculator</h4>
            <div className="mortgage-calculator__form">
                <div className="mortgage-calculator__field">
                    <label>Home Price</label>
                    <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                </div>
                <div className="mortgage-calculator__field">
                    <label>Down Payment</label>
                    <input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} />
                </div>
                <div className="mortgage-calculator__field">
                    <label>Interest Rate (%)</label>
                    <input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                </div>
                <div className="mortgage-calculator__field">
                    <label>Loan Term (years)</label>
                    <select value={term} onChange={(e) => setTerm(Number(e.target.value))}>
                        <option value={15}>15 years</option>
                        <option value={20}>20 years</option>
                        <option value={30}>30 years</option>
                    </select>
                </div>
            </div>
            <div className="mortgage-calculator__result">
                <div className="mortgage-calculator__monthly">
                    <span className="mortgage-calculator__label">Monthly Payment</span>
                    <span className="mortgage-calculator__amount">${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="mortgage-calculator__breakdown">
                    <div className="mortgage-calculator__stat">
                        <span>Loan Amount</span>
                        <span>${(price - downPayment).toLocaleString()}</span>
                    </div>
                    <div className="mortgage-calculator__stat">
                        <span>Total Interest</span>
                        <span>${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="mortgage-calculator__stat">
                        <span>Total Payment</span>
                        <span>${totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Property Comparison
interface ComparisonProperty { id: string; title: string; image: string; price: number; bedrooms: number; bathrooms: number; sqft: number; yearBuilt: number; pricePerSqft: number }

interface PropertyComparisonProps { properties: ComparisonProperty[]; onRemove?: (id: string) => void; className?: string }

export function PropertyComparison({ properties, onRemove, className = '' }: PropertyComparisonProps) {
    if (properties.length === 0) return null

    const fields = [
        { key: 'price', label: 'Price', format: (v: number) => `$${v.toLocaleString()}` },
        { key: 'bedrooms', label: 'Bedrooms', format: (v: number) => v.toString() },
        { key: 'bathrooms', label: 'Bathrooms', format: (v: number) => v.toString() },
        { key: 'sqft', label: 'Square Feet', format: (v: number) => v.toLocaleString() },
        { key: 'yearBuilt', label: 'Year Built', format: (v: number) => v.toString() },
        { key: 'pricePerSqft', label: 'Price/Sqft', format: (v: number) => `$${v.toFixed(0)}` },
    ]

    return (
        <div className={`property-comparison ${className}`}>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        {properties.map(p => (
                            <th key={p.id}>
                                <div className="property-comparison__header">
                                    <img src={p.image} alt="" />
                                    <span>{p.title}</span>
                                    {onRemove && <button onClick={() => onRemove(p.id)}><X size={14} /></button>}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {fields.map(f => (
                        <tr key={f.key}>
                            <td className="property-comparison__label">{f.label}</td>
                            {properties.map(p => (
                                <td key={p.id}>{f.format((p as any)[f.key])}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// Schedule Tour
interface ScheduleTourProps { propertyId: string; availableTimes?: string[]; onSchedule?: (date: Date, time: string, type: 'in-person' | 'virtual') => void; className?: string }

export function ScheduleTour({ propertyId, availableTimes = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'], onSchedule, className = '' }: ScheduleTourProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState('')
    const [tourType, setTourType] = useState<'in-person' | 'virtual'>('in-person')

    const dates = useMemo(() => {
        const d = []
        for (let i = 0; i < 7; i++) {
            const date = new Date()
            date.setDate(date.getDate() + i)
            d.push(date)
        }
        return d
    }, [])

    return (
        <div className={`schedule-tour ${className}`}>
            <h4 className="schedule-tour__title">Schedule a Tour</h4>
            <div className="schedule-tour__types">
                <button className={tourType === 'in-person' ? 'active' : ''} onClick={() => setTourType('in-person')}><Home size={16} /> In-Person</button>
                <button className={tourType === 'virtual' ? 'active' : ''} onClick={() => setTourType('virtual')}><Video size={16} /> Virtual</button>
            </div>
            <div className="schedule-tour__dates">
                {dates.map(d => (
                    <button key={d.toISOString()} className={selectedDate?.toDateString() === d.toDateString() ? 'active' : ''}
                        onClick={() => setSelectedDate(d)}>
                        <span className="schedule-tour__day">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="schedule-tour__date">{d.getDate()}</span>
                    </button>
                ))}
            </div>
            {selectedDate && (
                <div className="schedule-tour__times">
                    {availableTimes.map(t => (
                        <button key={t} className={selectedTime === t ? 'active' : ''} onClick={() => setSelectedTime(t)}>{t}</button>
                    ))}
                </div>
            )}
            <button className="schedule-tour__submit" disabled={!selectedDate || !selectedTime}
                onClick={() => selectedDate && onSchedule?.(selectedDate, selectedTime, tourType)}>
                Schedule Tour
            </button>
        </div>
    )
}

export default { PropertyCard, AgentCard, PropertyFeatures, MortgageCalculator, PropertyComparison, ScheduleTour }
