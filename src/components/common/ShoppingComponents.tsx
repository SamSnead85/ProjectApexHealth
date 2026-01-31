import { ReactNode, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Trash2, Plus, Minus, Heart, Share2, Star, Package, Truck, Check, X, CreditCard, Gift, Tag, ArrowRight, ChevronDown } from 'lucide-react'
import './ShoppingComponents.css'

// Product Card
interface Product {
    id: string
    name: string
    price: number
    originalPrice?: number
    image: string
    rating?: number
    reviews?: number
    inStock?: boolean
    badge?: string
}

interface ProductCardProps {
    product: Product
    onAddToCart?: (product: Product) => void
    onWishlist?: (product: Product) => void
    onShare?: (product: Product) => void
    className?: string
}

export function ProductCard({
    product,
    onAddToCart,
    onWishlist,
    onShare,
    className = ''
}: ProductCardProps) {
    const [isWishlisted, setIsWishlisted] = useState(false)
    const discount = product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0

    return (
        <div className={`product-card ${className}`}>
            {product.badge && (
                <span className="product-card__badge">{product.badge}</span>
            )}

            <div className="product-card__image">
                <img src={product.image} alt={product.name} />
                <div className="product-card__actions">
                    <button
                        className={`product-card__action ${isWishlisted ? 'active' : ''}`}
                        onClick={() => { setIsWishlisted(!isWishlisted); onWishlist?.(product) }}
                    >
                        <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                    </button>
                    <button className="product-card__action" onClick={() => onShare?.(product)}>
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            <div className="product-card__content">
                <h3 className="product-card__name">{product.name}</h3>

                {product.rating && (
                    <div className="product-card__rating">
                        <Star size={14} fill="currentColor" />
                        <span>{product.rating.toFixed(1)}</span>
                        {product.reviews && <span className="product-card__reviews">({product.reviews})</span>}
                    </div>
                )}

                <div className="product-card__price">
                    <span className="product-card__current">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                        <>
                            <span className="product-card__original">${product.originalPrice.toFixed(2)}</span>
                            <span className="product-card__discount">-{discount}%</span>
                        </>
                    )}
                </div>

                <button
                    className={`product-card__add ${!product.inStock ? 'product-card__add--disabled' : ''}`}
                    onClick={() => product.inStock && onAddToCart?.(product)}
                    disabled={!product.inStock}
                >
                    {product.inStock ? (
                        <><ShoppingCart size={16} /> Add to Cart</>
                    ) : (
                        'Out of Stock'
                    )}
                </button>
            </div>
        </div>
    )
}

// Cart Item
interface CartItem extends Product {
    quantity: number
}

interface CartItemRowProps {
    item: CartItem
    onIncrease?: (id: string) => void
    onDecrease?: (id: string) => void
    onRemove?: (id: string) => void
    className?: string
}

export function CartItemRow({
    item,
    onIncrease,
    onDecrease,
    onRemove,
    className = ''
}: CartItemRowProps) {
    return (
        <motion.div
            layout
            className={`cart-item-row ${className}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
        >
            <div className="cart-item-row__image">
                <img src={item.image} alt={item.name} />
            </div>

            <div className="cart-item-row__details">
                <h4 className="cart-item-row__name">{item.name}</h4>
                <span className="cart-item-row__price">${item.price.toFixed(2)}</span>
            </div>

            <div className="cart-item-row__quantity">
                <button onClick={() => onDecrease?.(item.id)} disabled={item.quantity <= 1}>
                    <Minus size={14} />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => onIncrease?.(item.id)}>
                    <Plus size={14} />
                </button>
            </div>

            <div className="cart-item-row__total">
                ${(item.price * item.quantity).toFixed(2)}
            </div>

            <button className="cart-item-row__remove" onClick={() => onRemove?.(item.id)}>
                <Trash2 size={16} />
            </button>
        </motion.div>
    )
}

// Cart Summary
interface CartSummaryProps {
    subtotal: number
    shipping?: number
    discount?: number
    tax?: number
    total: number
    promoCode?: string
    onApplyPromo?: (code: string) => void
    onCheckout?: () => void
    className?: string
}

export function CartSummary({
    subtotal,
    shipping = 0,
    discount = 0,
    tax = 0,
    total,
    promoCode,
    onApplyPromo,
    onCheckout,
    className = ''
}: CartSummaryProps) {
    const [code, setCode] = useState('')
    const [showPromo, setShowPromo] = useState(false)

    return (
        <div className={`cart-summary ${className}`}>
            <h3 className="cart-summary__title">Order Summary</h3>

            <div className="cart-summary__rows">
                <div className="cart-summary__row">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="cart-summary__row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>

                {tax > 0 && (
                    <div className="cart-summary__row">
                        <span>Tax</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                )}

                {discount > 0 && (
                    <div className="cart-summary__row cart-summary__row--discount">
                        <span>Discount</span>
                        <span>-${discount.toFixed(2)}</span>
                    </div>
                )}
            </div>

            <div className="cart-summary__promo">
                <button onClick={() => setShowPromo(!showPromo)}>
                    <Gift size={14} /> Apply Promo Code <ChevronDown size={14} />
                </button>
                <AnimatePresence>
                    {showPromo && (
                        <motion.div
                            className="cart-summary__promo-input"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Enter code"
                            />
                            <button onClick={() => onApplyPromo?.(code)}>Apply</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="cart-summary__total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
            </div>

            <button className="cart-summary__checkout" onClick={onCheckout}>
                Proceed to Checkout <ArrowRight size={16} />
            </button>
        </div>
    )
}

// Shipping Status
interface ShippingStep {
    label: string
    completed: boolean
    date?: string
    current?: boolean
}

interface ShippingStatusProps {
    status: 'processing' | 'shipped' | 'in-transit' | 'delivered'
    steps: ShippingStep[]
    trackingNumber?: string
    estimatedDelivery?: Date
    className?: string
}

export function ShippingStatus({
    status,
    steps,
    trackingNumber,
    estimatedDelivery,
    className = ''
}: ShippingStatusProps) {
    return (
        <div className={`shipping-status ${className}`}>
            <div className="shipping-status__header">
                <div className="shipping-status__icon">
                    <Package size={24} />
                </div>
                <div>
                    <h4 className="shipping-status__title">
                        {status === 'delivered' ? 'Delivered' :
                            status === 'in-transit' ? 'In Transit' :
                                status === 'shipped' ? 'Shipped' : 'Processing'}
                    </h4>
                    {trackingNumber && (
                        <span className="shipping-status__tracking">
                            Tracking: {trackingNumber}
                        </span>
                    )}
                </div>
            </div>

            <div className="shipping-status__steps">
                {steps.map((step, i) => (
                    <div
                        key={i}
                        className={`shipping-status__step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}`}
                    >
                        <div className="shipping-status__step-dot">
                            {step.completed && <Check size={10} />}
                        </div>
                        <div className="shipping-status__step-content">
                            <span className="shipping-status__step-label">{step.label}</span>
                            {step.date && (
                                <span className="shipping-status__step-date">{step.date}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {estimatedDelivery && status !== 'delivered' && (
                <div className="shipping-status__eta">
                    <Truck size={16} />
                    <span>Estimated delivery: {estimatedDelivery.toLocaleDateString()}</span>
                </div>
            )}
        </div>
    )
}

// Price Tag
interface PriceTagProps {
    price: number
    originalPrice?: number
    currency?: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function PriceTag({
    price,
    originalPrice,
    currency = '$',
    size = 'md',
    className = ''
}: PriceTagProps) {
    const discount = originalPrice
        ? Math.round((1 - price / originalPrice) * 100)
        : 0

    return (
        <div className={`price-tag price-tag--${size} ${className}`}>
            <span className="price-tag__current">
                {currency}{price.toFixed(2)}
            </span>
            {originalPrice && (
                <>
                    <span className="price-tag__original">
                        {currency}{originalPrice.toFixed(2)}
                    </span>
                    <span className="price-tag__discount">
                        -{discount}%
                    </span>
                </>
            )}
        </div>
    )
}

// Quick View Modal
interface QuickViewProps {
    product: Product | null
    isOpen: boolean
    onClose: () => void
    onAddToCart?: (product: Product, quantity: number) => void
    className?: string
}

export function QuickView({
    product,
    isOpen,
    onClose,
    onAddToCart,
    className = ''
}: QuickViewProps) {
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        if (isOpen) setQuantity(1)
    }, [isOpen])

    if (!product) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={`quick-view ${className}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="quick-view__backdrop"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                    <motion.div
                        className="quick-view__content"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <button className="quick-view__close" onClick={onClose}>
                            <X size={20} />
                        </button>

                        <div className="quick-view__image">
                            <img src={product.image} alt={product.name} />
                        </div>

                        <div className="quick-view__details">
                            <h2>{product.name}</h2>

                            <PriceTag
                                price={product.price}
                                originalPrice={product.originalPrice}
                                size="lg"
                            />

                            {product.rating && (
                                <div className="quick-view__rating">
                                    <Star size={18} fill="currentColor" />
                                    <span>{product.rating.toFixed(1)}</span>
                                    {product.reviews && <span>({product.reviews} reviews)</span>}
                                </div>
                            )}

                            <div className="quick-view__quantity">
                                <span>Quantity:</span>
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                    <Minus size={14} />
                                </button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)}>
                                    <Plus size={14} />
                                </button>
                            </div>

                            <button
                                className="quick-view__add"
                                onClick={() => onAddToCart?.(product, quantity)}
                                disabled={!product.inStock}
                            >
                                <ShoppingCart size={18} />
                                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default { ProductCard, CartItemRow, CartSummary, ShippingStatus, PriceTag, QuickView }
