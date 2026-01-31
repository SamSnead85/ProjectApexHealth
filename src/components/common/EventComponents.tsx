import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, Users, Ticket, Star, Heart, Share2, ChevronLeft, ChevronRight, Check, X, Plus, Minus, CreditCard, Download, QrCode, Info } from 'lucide-react'
import './EventComponents.css'

// Event Card
interface Event { id: string; title: string; image: string; date: Date; venue: string; location: string; price: number; priceRange?: { min: number; max: number }; category: string; isFavorite?: boolean; soldOut?: boolean }

interface EventCardProps { event: Event; currency?: string; onSelect?: () => void; onFavorite?: () => void; className?: string }

export function EventCard({ event, currency = 'USD', onSelect, onFavorite, className = '' }: EventCardProps) {
    const formatPrice = (p: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(p)
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    return (
        <div className={`event-card ${event.soldOut ? 'sold-out' : ''} ${className}`} onClick={onSelect}>
            <div className="event-card__image">
                <img src={event.image} alt="" />
                <span className="event-card__category">{event.category}</span>
                {event.soldOut && <div className="event-card__sold-out">Sold Out</div>}
                <button className={`event-card__favorite ${event.isFavorite ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); onFavorite?.() }}>
                    <Heart size={18} fill={event.isFavorite ? 'currentColor' : 'none'} />
                </button>
            </div>
            <div className="event-card__content">
                <div className="event-card__date"><Calendar size={14} /> {formatDate(event.date)}</div>
                <h3 className="event-card__title">{event.title}</h3>
                <div className="event-card__venue"><MapPin size={14} /> {event.venue}</div>
                <div className="event-card__footer">
                    <span className="event-card__location">{event.location}</span>
                    <span className="event-card__price">
                        {event.priceRange ? `${formatPrice(event.priceRange.min)} - ${formatPrice(event.priceRange.max)}` : `From ${formatPrice(event.price)}`}
                    </span>
                </div>
            </div>
        </div>
    )
}

// Seat Selector
interface Seat { id: string; row: string; number: number; price: number; category: string; isAvailable: boolean }

interface SeatSelectorProps { seats: Seat[][]; selectedSeats: string[]; onSelect?: (seatId: string) => void; categories: { name: string; color: string; price: number }[]; className?: string }

export function SeatSelector({ seats, selectedSeats, onSelect, categories, className = '' }: SeatSelectorProps) {
    return (
        <div className={`seat-selector ${className}`}>
            <div className="seat-selector__stage">STAGE</div>
            <div className="seat-selector__map">
                {seats.map((row, ri) => (
                    <div key={ri} className="seat-selector__row">
                        <span className="seat-selector__row-label">{row[0]?.row}</span>
                        {row.map(seat => (
                            <button key={seat.id}
                                className={`seat-selector__seat ${!seat.isAvailable ? 'unavailable' : ''} ${selectedSeats.includes(seat.id) ? 'selected' : ''}`}
                                style={{ '--seat-color': categories.find(c => c.name === seat.category)?.color } as any}
                                disabled={!seat.isAvailable}
                                onClick={() => onSelect?.(seat.id)}>
                                {selectedSeats.includes(seat.id) ? <Check size={10} /> : seat.number}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
            <div className="seat-selector__legend">
                {categories.map(c => (
                    <div key={c.name} className="seat-selector__legend-item">
                        <span className="seat-selector__legend-color" style={{ background: c.color }} />
                        <span>{c.name} - ${c.price}</span>
                    </div>
                ))}
                <div className="seat-selector__legend-item"><span className="seat-selector__legend-color unavailable" /> Unavailable</div>
                <div className="seat-selector__legend-item"><span className="seat-selector__legend-color selected" /> Selected</div>
            </div>
        </div>
    )
}

// Ticket Quantity Selector
interface TicketType { id: string; name: string; description?: string; price: number; available: number; max: number }

interface TicketQuantitySelectorProps { tickets: TicketType[]; quantities: Record<string, number>; onChange?: (ticketId: string, quantity: number) => void; currency?: string; className?: string }

export function TicketQuantitySelector({ tickets, quantities, onChange, currency = 'USD', className = '' }: TicketQuantitySelectorProps) {
    const formatPrice = (p: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(p)

    return (
        <div className={`ticket-quantity-selector ${className}`}>
            {tickets.map(t => {
                const qty = quantities[t.id] || 0
                return (
                    <div key={t.id} className="ticket-quantity-selector__item">
                        <div className="ticket-quantity-selector__info">
                            <span className="ticket-quantity-selector__name">{t.name}</span>
                            {t.description && <span className="ticket-quantity-selector__desc">{t.description}</span>}
                            <span className="ticket-quantity-selector__price">{formatPrice(t.price)}</span>
                        </div>
                        <div className="ticket-quantity-selector__controls">
                            <button onClick={() => onChange?.(t.id, Math.max(0, qty - 1))} disabled={qty === 0}><Minus size={16} /></button>
                            <span>{qty}</span>
                            <button onClick={() => onChange?.(t.id, Math.min(t.max, qty + 1))} disabled={qty >= t.max || qty >= t.available}><Plus size={16} /></button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// Digital Ticket
interface DigitalTicketProps { eventName: string; date: Date; time: string; venue: string; section?: string; row?: string; seat?: string; ticketHolder: string; barcode: string; className?: string }

export function DigitalTicket({ eventName, date, time, venue, section, row, seat, ticketHolder, barcode, className = '' }: DigitalTicketProps) {
    return (
        <div className={`digital-ticket ${className}`}>
            <div className="digital-ticket__header">
                <Ticket size={24} />
                <span>ADMIT ONE</span>
            </div>
            <div className="digital-ticket__content">
                <h3 className="digital-ticket__event">{eventName}</h3>
                <div className="digital-ticket__details">
                    <div className="digital-ticket__detail"><Calendar size={14} /> {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    <div className="digital-ticket__detail"><Clock size={14} /> {time}</div>
                    <div className="digital-ticket__detail"><MapPin size={14} /> {venue}</div>
                </div>
                {(section || row || seat) && (
                    <div className="digital-ticket__seating">
                        {section && <div className="digital-ticket__seat-info"><span>Section</span><strong>{section}</strong></div>}
                        {row && <div className="digital-ticket__seat-info"><span>Row</span><strong>{row}</strong></div>}
                        {seat && <div className="digital-ticket__seat-info"><span>Seat</span><strong>{seat}</strong></div>}
                    </div>
                )}
            </div>
            <div className="digital-ticket__barcode">
                <QrCode size={80} strokeWidth={1} />
                <span className="digital-ticket__code">{barcode}</span>
            </div>
            <div className="digital-ticket__footer">
                <span className="digital-ticket__holder">{ticketHolder}</span>
                <button className="digital-ticket__download"><Download size={16} /> Save</button>
            </div>
        </div>
    )
}

// Event Schedule
interface ScheduleItem { id: string; time: string; title: string; stage?: string; artist?: string; description?: string }

interface EventScheduleProps { items: ScheduleItem[]; currentTime?: string; onItemClick?: (id: string) => void; className?: string }

export function EventSchedule({ items, currentTime, onItemClick, className = '' }: EventScheduleProps) {
    return (
        <div className={`event-schedule ${className}`}>
            {items.map((item, i) => {
                const isCurrent = currentTime && item.time === currentTime
                const isPast = currentTime && item.time < currentTime
                return (
                    <div key={item.id} className={`event-schedule__item ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`} onClick={() => onItemClick?.(item.id)}>
                        <span className="event-schedule__time">{item.time}</span>
                        <div className="event-schedule__marker"><span /></div>
                        <div className="event-schedule__content">
                            <span className="event-schedule__title">{item.title}</span>
                            {item.artist && <span className="event-schedule__artist">{item.artist}</span>}
                            {item.stage && <span className="event-schedule__stage"><MapPin size={12} /> {item.stage}</span>}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// RSVP Card
interface RSVPCardProps { eventName: string; date: Date; hostName: string; hostPhoto?: string; deadline?: Date; onRespond?: (response: 'yes' | 'no' | 'maybe') => void; currentResponse?: 'yes' | 'no' | 'maybe'; className?: string }

export function RSVPCard({ eventName, date, hostName, hostPhoto, deadline, onRespond, currentResponse, className = '' }: RSVPCardProps) {
    const daysUntilDeadline = deadline ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

    return (
        <div className={`rsvp-card ${className}`}>
            <div className="rsvp-card__header">
                <div className="rsvp-card__host">
                    <div className="rsvp-card__host-photo">{hostPhoto ? <img src={hostPhoto} alt="" /> : hostName.charAt(0)}</div>
                    <span>{hostName} invited you</span>
                </div>
                {deadline && daysUntilDeadline && daysUntilDeadline > 0 && (
                    <span className="rsvp-card__deadline">Respond by {deadline.toLocaleDateString()} ({daysUntilDeadline} days)</span>
                )}
            </div>
            <h3 className="rsvp-card__event">{eventName}</h3>
            <div className="rsvp-card__date"><Calendar size={16} /> {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            <div className="rsvp-card__actions">
                <button className={`rsvp-card__action rsvp-card__action--yes ${currentResponse === 'yes' ? 'active' : ''}`} onClick={() => onRespond?.('yes')}>
                    <Check size={16} /> Yes
                </button>
                <button className={`rsvp-card__action rsvp-card__action--no ${currentResponse === 'no' ? 'active' : ''}`} onClick={() => onRespond?.('no')}>
                    <X size={16} /> No
                </button>
                <button className={`rsvp-card__action rsvp-card__action--maybe ${currentResponse === 'maybe' ? 'active' : ''}`} onClick={() => onRespond?.('maybe')}>
                    <Info size={16} /> Maybe
                </button>
            </div>
        </div>
    )
}

export default { EventCard, SeatSelector, TicketQuantitySelector, DigitalTicket, EventSchedule, RSVPCard }
