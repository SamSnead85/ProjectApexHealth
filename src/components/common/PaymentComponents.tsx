import { ReactNode, useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Lock, Check, AlertCircle, Trash2, Plus, Shield, Calendar, Hash } from 'lucide-react'
import './PaymentComponents.css'

// Payment Card Input
interface CardData {
    number: string
    expiry: string
    cvv: string
    name: string
}

interface PaymentCardInputProps {
    onSubmit?: (cardData: CardData) => void
    loading?: boolean
    error?: string
    className?: string
}

export function PaymentCardInput({
    onSubmit,
    loading = false,
    error,
    className = ''
}: PaymentCardInputProps) {
    const [cardData, setCardData] = useState<CardData>({ number: '', expiry: '', cvv: '', name: '' })
    const [focused, setFocused] = useState<string | null>(null)

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 16)
        return cleaned.match(/.{1,4}/g)?.join(' ') || ''
    }

    const formatExpiry = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 4)
        return cleaned.length >= 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2)}` : cleaned
    }

    const getCardType = (number: string) => {
        const cleaned = number.replace(/\D/g, '')
        if (cleaned.startsWith('4')) return 'visa'
        if (/^5[1-5]/.test(cleaned)) return 'mastercard'
        return 'unknown'
    }

    return (
        <form className={`payment-card-input ${className}`} onSubmit={(e) => { e.preventDefault(); onSubmit?.(cardData) }}>
            <div className={`payment-card-input__preview payment-card-input__preview--${getCardType(cardData.number)}`}>
                <div className="payment-card-input__chip" />
                <div className="payment-card-input__number">{cardData.number || '•••• •••• •••• ••••'}</div>
                <div className="payment-card-input__details">
                    <div><span>Card Holder</span><p>{cardData.name || 'YOUR NAME'}</p></div>
                    <div><span>Expires</span><p>{cardData.expiry || 'MM/YY'}</p></div>
                </div>
            </div>

            <div className="payment-card-input__fields">
                <div className={`payment-card-input__field ${focused === 'number' ? 'focused' : ''}`}>
                    <CreditCard size={16} />
                    <input type="text" placeholder="Card Number" value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                        onFocus={() => setFocused('number')} onBlur={() => setFocused(null)} />
                </div>
                <div className="payment-card-input__row">
                    <div className={`payment-card-input__field ${focused === 'expiry' ? 'focused' : ''}`}>
                        <Calendar size={16} />
                        <input type="text" placeholder="MM/YY" value={cardData.expiry}
                            onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                            onFocus={() => setFocused('expiry')} onBlur={() => setFocused(null)} />
                    </div>
                    <div className={`payment-card-input__field ${focused === 'cvv' ? 'focused' : ''}`}>
                        <Hash size={16} />
                        <input type="text" placeholder="CVV" value={cardData.cvv}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                            onFocus={() => setFocused('cvv')} onBlur={() => setFocused(null)} />
                    </div>
                </div>
                <div className={`payment-card-input__field ${focused === 'name' ? 'focused' : ''}`}>
                    <input type="text" placeholder="Cardholder Name" value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                        onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
                </div>
            </div>

            {error && <div className="payment-card-input__error"><AlertCircle size={14} /> {error}</div>}
            <button type="submit" className="payment-card-input__submit" disabled={loading}>
                <Lock size={16} /> {loading ? 'Processing...' : 'Pay Securely'}
            </button>
            <div className="payment-card-input__security"><Shield size={12} /><span>Secure and encrypted</span></div>
        </form>
    )
}

// Saved Payment Methods
interface SavedCard { id: string; last4: string; brand: string; expiryMonth: number; expiryYear: number; isDefault?: boolean }

interface SavedPaymentMethodsProps {
    cards: SavedCard[]
    selectedId?: string
    onSelect?: (id: string) => void
    onDelete?: (id: string) => void
    onAddNew?: () => void
    className?: string
}

export function SavedPaymentMethods({ cards, selectedId, onSelect, onDelete, onAddNew, className = '' }: SavedPaymentMethodsProps) {
    return (
        <div className={`saved-payment-methods ${className}`}>
            {cards.map(card => (
                <div key={card.id} className={`saved-payment-methods__card ${selectedId === card.id ? 'selected' : ''}`}
                    onClick={() => onSelect?.(card.id)}>
                    <div className="saved-payment-methods__radio">{selectedId === card.id && <Check size={12} />}</div>
                    <div className="saved-payment-methods__info">
                        <span>•••• {card.last4}</span>
                        <span>Exp {card.expiryMonth}/{card.expiryYear}</span>
                    </div>
                    {card.isDefault && <span className="saved-payment-methods__default">Default</span>}
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(card.id) }}><Trash2 size={14} /></button>
                </div>
            ))}
            {onAddNew && <button className="saved-payment-methods__add" onClick={onAddNew}><Plus size={16} /> Add New Card</button>}
        </div>
    )
}

// Pricing Table
interface PricingTier { id: string; name: string; price: number; features: string[]; highlighted?: boolean; badge?: string }

interface PricingTableProps { tiers: PricingTier[]; onSelect?: (tier: PricingTier) => void; className?: string }

export function PricingTable({ tiers, onSelect, className = '' }: PricingTableProps) {
    return (
        <div className={`pricing-table ${className}`}>
            {tiers.map(tier => (
                <div key={tier.id} className={`pricing-table__tier ${tier.highlighted ? 'pricing-table__tier--highlighted' : ''}`}>
                    {tier.badge && <span className="pricing-table__badge">{tier.badge}</span>}
                    <h3>{tier.name}</h3>
                    <div className="pricing-table__price"><span>$</span><span>{tier.price}</span><span>/mo</span></div>
                    <ul>{tier.features.map((f, i) => <li key={i}><Check size={14} /> {f}</li>)}</ul>
                    <button onClick={() => onSelect?.(tier)}>Get Started</button>
                </div>
            ))}
        </div>
    )
}

export default { PaymentCardInput, SavedPaymentMethods, PricingTable }
