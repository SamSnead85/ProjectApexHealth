import { ReactNode, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Star, Heart, Plus, Minus, ShoppingBag, Truck, Timer, ChefHat, Leaf, Flame, AlertTriangle, Check, X, Utensils, Coffee, Pizza } from 'lucide-react'
import './FoodDeliveryComponents.css'

// Restaurant Card
interface Restaurant { id: string; name: string; image: string; cuisine: string[]; rating: number; reviewCount: number; deliveryTime: string; deliveryFee: number; distance: string; promo?: string; isFavorite?: boolean }

interface RestaurantCardProps { restaurant: Restaurant; onSelect?: () => void; onFavorite?: () => void; className?: string }

export function RestaurantCard({ restaurant, onSelect, onFavorite, className = '' }: RestaurantCardProps) {
    return (
        <div className={`restaurant-card ${className}`} onClick={onSelect}>
            <div className="restaurant-card__image">
                <img src={restaurant.image} alt="" />
                {restaurant.promo && <span className="restaurant-card__promo">{restaurant.promo}</span>}
                <button className={`restaurant-card__favorite ${restaurant.isFavorite ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); onFavorite?.() }}>
                    <Heart size={18} fill={restaurant.isFavorite ? 'currentColor' : 'none'} />
                </button>
            </div>
            <div className="restaurant-card__content">
                <h3 className="restaurant-card__name">{restaurant.name}</h3>
                <div className="restaurant-card__cuisine">{restaurant.cuisine.join(' • ')}</div>
                <div className="restaurant-card__meta">
                    <span className="restaurant-card__rating"><Star size={14} fill="currentColor" /> {restaurant.rating} ({restaurant.reviewCount})</span>
                    <span className="restaurant-card__delivery"><Clock size={14} /> {restaurant.deliveryTime}</span>
                    <span className="restaurant-card__distance">{restaurant.distance}</span>
                </div>
                <div className="restaurant-card__fee">{restaurant.deliveryFee === 0 ? 'Free delivery' : `$${restaurant.deliveryFee.toFixed(2)} delivery`}</div>
            </div>
        </div>
    )
}

// Menu Item Card
interface MenuItem { id: string; name: string; description: string; price: number; image?: string; calories?: number; tags?: ('vegetarian' | 'vegan' | 'spicy' | 'popular' | 'new')[]; customizable?: boolean }

interface MenuItemCardProps { item: MenuItem; currency?: string; onAdd?: () => void; onCustomize?: () => void; className?: string }

export function MenuItemCard({ item, currency = 'USD', onAdd, onCustomize, className = '' }: MenuItemCardProps) {
    const formatPrice = (p: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(p)

    const tagIcons: Record<string, ReactNode> = {
        vegetarian: <Leaf size={12} />,
        vegan: <Leaf size={12} />,
        spicy: <Flame size={12} />,
        popular: <Star size={12} />,
        new: <span className="menu-item-card__new-badge">NEW</span>
    }

    return (
        <div className={`menu-item-card ${className}`}>
            {item.image && (
                <div className="menu-item-card__image">
                    <img src={item.image} alt="" />
                </div>
            )}
            <div className="menu-item-card__content">
                <div className="menu-item-card__header">
                    <h4 className="menu-item-card__name">{item.name}</h4>
                    {item.tags && (
                        <div className="menu-item-card__tags">
                            {item.tags.map(t => <span key={t} className={`menu-item-card__tag menu-item-card__tag--${t}`}>{tagIcons[t]}</span>)}
                        </div>
                    )}
                </div>
                <p className="menu-item-card__description">{item.description}</p>
                <div className="menu-item-card__footer">
                    <span className="menu-item-card__price">{formatPrice(item.price)}</span>
                    {item.calories && <span className="menu-item-card__calories">{item.calories} cal</span>}
                    <button className="menu-item-card__add" onClick={item.customizable ? onCustomize : onAdd}>
                        <Plus size={16} /> {item.customizable ? 'Customize' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Cart Item
interface CartItem { id: string; name: string; price: number; quantity: number; customizations?: string[]; image?: string }

interface FoodCartItemProps { item: CartItem; currency?: string; onIncrease?: () => void; onDecrease?: () => void; onRemove?: () => void; className?: string }

export function FoodCartItem({ item, currency = 'USD', onIncrease, onDecrease, onRemove, className = '' }: FoodCartItemProps) {
    const formatPrice = (p: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(p)

    return (
        <div className={`cart-item-row ${className}`}>
            {item.image && <img className="cart-item-row__image" src={item.image} alt="" />}
            <div className="cart-item-row__content">
                <span className="cart-item-row__name">{item.name}</span>
                {item.customizations && item.customizations.length > 0 && (
                    <span className="cart-item-row__customizations">{item.customizations.join(', ')}</span>
                )}
                <span className="cart-item-row__price">{formatPrice(item.price * item.quantity)}</span>
            </div>
            <div className="cart-item-row__quantity">
                <button onClick={onDecrease}><Minus size={14} /></button>
                <span>{item.quantity}</span>
                <button onClick={onIncrease}><Plus size={14} /></button>
            </div>
            <button className="cart-item-row__remove" onClick={onRemove}><X size={14} /></button>
        </div>
    )
}

// Order Summary
interface OrderSummaryProps { subtotal: number; deliveryFee: number; serviceFee?: number; tip?: number; discount?: number; currency?: string; onCheckout?: () => void; className?: string }

export function OrderSummary({ subtotal, deliveryFee, serviceFee = 0, tip = 0, discount = 0, currency = 'USD', onCheckout, className = '' }: OrderSummaryProps) {
    const formatPrice = (p: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(p)
    const total = subtotal + deliveryFee + serviceFee + tip - discount

    return (
        <div className={`order-summary ${className}`}>
            <h4 className="order-summary__title">Order Summary</h4>
            <div className="order-summary__rows">
                <div className="order-summary__row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="order-summary__row"><span>Delivery Fee</span><span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span></div>
                {serviceFee > 0 && <div className="order-summary__row"><span>Service Fee</span><span>{formatPrice(serviceFee)}</span></div>}
                {tip > 0 && <div className="order-summary__row"><span>Tip</span><span>{formatPrice(tip)}</span></div>}
                {discount > 0 && <div className="order-summary__row order-summary__row--discount"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
            </div>
            <div className="order-summary__total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
            </div>
            <button className="order-summary__checkout" onClick={onCheckout}>Place Order • {formatPrice(total)}</button>
        </div>
    )
}

// Delivery Tracker
interface DeliveryStep { id: string; title: string; description?: string; time?: string; status: 'completed' | 'current' | 'pending' }

interface DeliveryTrackerProps { steps: DeliveryStep[]; estimatedTime?: string; driverName?: string; driverPhoto?: string; className?: string }

export function DeliveryTracker({ steps, estimatedTime, driverName, driverPhoto, className = '' }: DeliveryTrackerProps) {
    return (
        <div className={`delivery-tracker ${className}`}>
            <div className="delivery-tracker__header">
                <div className="delivery-tracker__status">
                    <Truck size={24} />
                    <div className="delivery-tracker__info">
                        <span className="delivery-tracker__label">Estimated Delivery</span>
                        <span className="delivery-tracker__time">{estimatedTime}</span>
                    </div>
                </div>
                {driverName && (
                    <div className="delivery-tracker__driver">
                        <div className="delivery-tracker__driver-photo">{driverPhoto ? <img src={driverPhoto} alt="" /> : driverName.charAt(0)}</div>
                        <span>{driverName}</span>
                    </div>
                )}
            </div>
            <div className="delivery-tracker__steps">
                {steps.map((step, i) => (
                    <div key={step.id} className={`delivery-tracker__step delivery-tracker__step--${step.status}`}>
                        <div className="delivery-tracker__step-indicator">
                            {step.status === 'completed' ? <Check size={12} /> : <span>{i + 1}</span>}
                        </div>
                        <div className="delivery-tracker__step-content">
                            <span className="delivery-tracker__step-title">{step.title}</span>
                            {step.description && <span className="delivery-tracker__step-desc">{step.description}</span>}
                            {step.time && <span className="delivery-tracker__step-time">{step.time}</span>}
                        </div>
                        {i < steps.length - 1 && <div className="delivery-tracker__connector" />}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Tip Selector
interface TipSelectorProps { orderTotal: number; currency?: string; presets?: number[]; onSelect?: (amount: number) => void; className?: string }

export function TipSelector({ orderTotal, currency = 'USD', presets = [15, 18, 20, 25], onSelect, className = '' }: TipSelectorProps) {
    const [selectedPercent, setSelectedPercent] = useState<number | null>(null)
    const [customAmount, setCustomAmount] = useState('')

    const formatPrice = (p: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(p)

    const handlePreset = (percent: number) => {
        setSelectedPercent(percent)
        setCustomAmount('')
        onSelect?.(orderTotal * percent / 100)
    }

    const handleCustom = (value: string) => {
        setCustomAmount(value)
        setSelectedPercent(null)
        onSelect?.(parseFloat(value) || 0)
    }

    return (
        <div className={`tip-selector ${className}`}>
            <h4 className="tip-selector__title">Add a tip</h4>
            <div className="tip-selector__presets">
                {presets.map(p => (
                    <button key={p} className={`tip-selector__preset ${selectedPercent === p ? 'active' : ''}`} onClick={() => handlePreset(p)}>
                        <span className="tip-selector__percent">{p}%</span>
                        <span className="tip-selector__amount">{formatPrice(orderTotal * p / 100)}</span>
                    </button>
                ))}
            </div>
            <div className="tip-selector__custom">
                <span>Custom</span>
                <input type="number" placeholder="$0.00" value={customAmount} onChange={(e) => handleCustom(e.target.value)} />
            </div>
        </div>
    )
}

export default { RestaurantCard, MenuItemCard, FoodCartItem, OrderSummary, DeliveryTracker, TipSelector }
