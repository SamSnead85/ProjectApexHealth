import { ReactNode, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, Hotel, Car, Calendar, MapPin, Clock, Users, Star, Heart, ArrowRight, ChevronDown, ChevronRight, Luggage, Wifi, Coffee, Tv, Utensils, DoorOpen, X, Check, AlertCircle } from 'lucide-react'
import './TravelComponents.css'

// Flight Card
interface Flight { id: string; airline: string; airlineLogo?: string; flightNumber: string; departure: { time: string; airport: string; city: string }; arrival: { time: string; airport: string; city: string }; duration: string; stops: number; price: number; class: 'economy' | 'business' | 'first' }

interface FlightCardProps { flight: Flight; currency?: string; onSelect?: () => void; isSelected?: boolean; className?: string }

export function FlightCard({ flight, currency = 'USD', onSelect, isSelected = false, className = '' }: FlightCardProps) {
    const formatPrice = (p: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(p)

    return (
        <div className={`flight-card ${isSelected ? 'selected' : ''} ${className}`} onClick={onSelect}>
            <div className="flight-card__airline">
                {flight.airlineLogo ? <img src={flight.airlineLogo} alt="" /> : <Plane size={20} />}
                <div className="flight-card__airline-info">
                    <span className="flight-card__airline-name">{flight.airline}</span>
                    <span className="flight-card__flight-number">{flight.flightNumber}</span>
                </div>
            </div>
            <div className="flight-card__route">
                <div className="flight-card__point">
                    <span className="flight-card__time">{flight.departure.time}</span>
                    <span className="flight-card__airport">{flight.departure.airport}</span>
                    <span className="flight-card__city">{flight.departure.city}</span>
                </div>
                <div className="flight-card__path">
                    <span className="flight-card__duration">{flight.duration}</span>
                    <div className="flight-card__line"><Plane size={14} /></div>
                    <span className="flight-card__stops">{flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
                </div>
                <div className="flight-card__point">
                    <span className="flight-card__time">{flight.arrival.time}</span>
                    <span className="flight-card__airport">{flight.arrival.airport}</span>
                    <span className="flight-card__city">{flight.arrival.city}</span>
                </div>
            </div>
            <div className="flight-card__price">
                <span className="flight-card__amount">{formatPrice(flight.price)}</span>
                <span className="flight-card__class">{flight.class}</span>
            </div>
            {isSelected && <div className="flight-card__selected"><Check size={16} /></div>}
        </div>
    )
}

// Hotel Card
interface HotelAmenity { icon: ReactNode; label: string }
interface Hotel { id: string; name: string; image: string; location: string; rating: number; reviewCount: number; pricePerNight: number; amenities: string[]; isFavorite?: boolean }

interface HotelCardProps { hotel: Hotel; currency?: string; nights?: number; onSelect?: () => void; onFavorite?: () => void; className?: string }

export function HotelCard({ hotel, currency = 'USD', nights = 1, onSelect, onFavorite, className = '' }: HotelCardProps) {
    const formatPrice = (p: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(p)
    const stars = Array(5).fill(0).map((_, i) => i < hotel.rating)

    const amenityIcons: Record<string, ReactNode> = {
        'wifi': <Wifi size={14} />,
        'breakfast': <Coffee size={14} />,
        'tv': <Tv size={14} />,
        'restaurant': <Utensils size={14} />,
        'pool': <DoorOpen size={14} />,
    }

    return (
        <div className={`hotel-card ${className}`}>
            <div className="hotel-card__image">
                <img src={hotel.image} alt="" />
                <button className={`hotel-card__favorite ${hotel.isFavorite ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); onFavorite?.() }}>
                    <Heart size={18} fill={hotel.isFavorite ? 'currentColor' : 'none'} />
                </button>
            </div>
            <div className="hotel-card__content">
                <h3 className="hotel-card__name">{hotel.name}</h3>
                <div className="hotel-card__location"><MapPin size={14} /> {hotel.location}</div>
                <div className="hotel-card__rating">
                    <div className="hotel-card__stars">{stars.map((filled, i) => <Star key={i} size={14} fill={filled ? 'currentColor' : 'none'} />)}</div>
                    <span>{hotel.reviewCount} reviews</span>
                </div>
                <div className="hotel-card__amenities">
                    {hotel.amenities.slice(0, 4).map(a => (
                        <span key={a} className="hotel-card__amenity">{amenityIcons[a] || null} {a}</span>
                    ))}
                </div>
                <div className="hotel-card__footer">
                    <div className="hotel-card__price">
                        <span className="hotel-card__per-night">{formatPrice(hotel.pricePerNight)}<small>/night</small></span>
                        {nights > 1 && <span className="hotel-card__total">{formatPrice(hotel.pricePerNight * nights)} for {nights} nights</span>}
                    </div>
                    <button className="hotel-card__book" onClick={onSelect}>Book Now</button>
                </div>
            </div>
        </div>
    )
}

// Trip Summary
interface TripSegment { type: 'flight' | 'hotel' | 'car'; title: string; subtitle: string; date: string; price: number }

interface TripSummaryProps { segments: TripSegment[]; currency?: string; taxes?: number; className?: string }

export function TripSummary({ segments, currency = 'USD', taxes = 0, className = '' }: TripSummaryProps) {
    const formatPrice = (p: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(p)
    const subtotal = segments.reduce((sum, s) => sum + s.price, 0)
    const total = subtotal + taxes

    const icons = { flight: <Plane size={16} />, hotel: <Hotel size={16} />, car: <Car size={16} /> }

    return (
        <div className={`trip-summary ${className}`}>
            <h4 className="trip-summary__title">Trip Summary</h4>
            <div className="trip-summary__segments">
                {segments.map((s, i) => (
                    <div key={i} className="trip-summary__segment">
                        <div className="trip-summary__segment-icon">{icons[s.type]}</div>
                        <div className="trip-summary__segment-info">
                            <span className="trip-summary__segment-title">{s.title}</span>
                            <span className="trip-summary__segment-subtitle">{s.subtitle}</span>
                            <span className="trip-summary__segment-date">{s.date}</span>
                        </div>
                        <span className="trip-summary__segment-price">{formatPrice(s.price)}</span>
                    </div>
                ))}
            </div>
            <div className="trip-summary__totals">
                <div className="trip-summary__row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="trip-summary__row"><span>Taxes & Fees</span><span>{formatPrice(taxes)}</span></div>
                <div className="trip-summary__row trip-summary__row--total"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
        </div>
    )
}

// Passenger Form
interface PassengerFormProps { passengerNumber: number; onSave?: (data: any) => void; className?: string }

export function PassengerForm({ passengerNumber, onSave, className = '' }: PassengerFormProps) {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', dob: '', gender: '', passportNumber: '', nationality: '' })

    const handleChange = (field: string, value: string) => setFormData({ ...formData, [field]: value })

    return (
        <div className={`passenger-form ${className}`}>
            <h4 className="passenger-form__title">Passenger {passengerNumber}</h4>
            <div className="passenger-form__grid">
                <div className="passenger-form__field">
                    <label>First Name</label>
                    <input type="text" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} placeholder="As on passport" />
                </div>
                <div className="passenger-form__field">
                    <label>Last Name</label>
                    <input type="text" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} placeholder="As on passport" />
                </div>
                <div className="passenger-form__field">
                    <label>Date of Birth</label>
                    <input type="date" value={formData.dob} onChange={(e) => handleChange('dob', e.target.value)} />
                </div>
                <div className="passenger-form__field">
                    <label>Gender</label>
                    <select value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div className="passenger-form__field">
                    <label>Passport Number</label>
                    <input type="text" value={formData.passportNumber} onChange={(e) => handleChange('passportNumber', e.target.value)} />
                </div>
                <div className="passenger-form__field">
                    <label>Nationality</label>
                    <input type="text" value={formData.nationality} onChange={(e) => handleChange('nationality', e.target.value)} />
                </div>
            </div>
        </div>
    )
}

// Itinerary Day
interface ItineraryEvent { time: string; title: string; description?: string; type: 'flight' | 'hotel' | 'activity' | 'transfer' }

interface ItineraryDayProps { date: Date; dayNumber: number; events: ItineraryEvent[]; className?: string }

export function ItineraryDay({ date, dayNumber, events, className = '' }: ItineraryDayProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const icons = { flight: <Plane size={14} />, hotel: <Hotel size={14} />, activity: <MapPin size={14} />, transfer: <Car size={14} /> }

    return (
        <div className={`itinerary-day ${className}`}>
            <button className="itinerary-day__header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="itinerary-day__date">
                    <span className="itinerary-day__number">Day {dayNumber}</span>
                    <span className="itinerary-day__full">{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            {isExpanded && (
                <div className="itinerary-day__events">
                    {events.map((e, i) => (
                        <div key={i} className={`itinerary-day__event itinerary-day__event--${e.type}`}>
                            <span className="itinerary-day__event-time">{e.time}</span>
                            <div className="itinerary-day__event-icon">{icons[e.type]}</div>
                            <div className="itinerary-day__event-info">
                                <span className="itinerary-day__event-title">{e.title}</span>
                                {e.description && <span className="itinerary-day__event-desc">{e.description}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default { FlightCard, HotelCard, TripSummary, PassengerForm, ItineraryDay }
