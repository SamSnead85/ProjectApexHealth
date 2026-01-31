import { ReactNode, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import './Carousel.css'

interface CarouselSlide {
    id: string
    content: ReactNode
}

interface CarouselProps {
    slides: CarouselSlide[]
    autoPlay?: boolean
    autoPlayInterval?: number
    showArrows?: boolean
    showDots?: boolean
    showProgress?: boolean
    loop?: boolean
    slidesToShow?: number
    gap?: number
    className?: string
}

export function Carousel({
    slides,
    autoPlay = false,
    autoPlayInterval = 5000,
    showArrows = true,
    showDots = true,
    showProgress = false,
    loop = true,
    slidesToShow = 1,
    gap = 16,
    className = ''
}: CarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const autoPlayRef = useRef<NodeJS.Timeout>()

    const totalSlides = slides.length
    const maxIndex = Math.max(0, totalSlides - slidesToShow)

    useEffect(() => {
        if (autoPlay && !isDragging) {
            autoPlayRef.current = setInterval(() => {
                goToNext()
            }, autoPlayInterval)

            return () => {
                if (autoPlayRef.current) clearInterval(autoPlayRef.current)
            }
        }
    }, [autoPlay, autoPlayInterval, isDragging, currentIndex])

    const goToSlide = (index: number) => {
        if (loop) {
            if (index < 0) {
                setCurrentIndex(maxIndex)
            } else if (index > maxIndex) {
                setCurrentIndex(0)
            } else {
                setCurrentIndex(index)
            }
        } else {
            setCurrentIndex(Math.max(0, Math.min(index, maxIndex)))
        }
    }

    const goToPrev = () => goToSlide(currentIndex - 1)
    const goToNext = () => goToSlide(currentIndex + 1)

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false)
        const threshold = 50
        if (info.offset.x > threshold) {
            goToPrev()
        } else if (info.offset.x < -threshold) {
            goToNext()
        }
    }

    const progress = ((currentIndex + 1) / totalSlides) * 100

    return (
        <div className={`carousel ${className}`}>
            <div className="carousel__viewport" ref={containerRef}>
                <motion.div
                    className="carousel__track"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={handleDragEnd}
                    animate={{ x: `-${currentIndex * (100 / slidesToShow)}%` }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{ gap }}
                >
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className="carousel__slide"
                            style={{ minWidth: `calc(${100 / slidesToShow}% - ${gap * (slidesToShow - 1) / slidesToShow}px)` }}
                        >
                            {slide.content}
                        </div>
                    ))}
                </motion.div>
            </div>

            {showArrows && totalSlides > slidesToShow && (
                <>
                    <button
                        className="carousel__arrow carousel__arrow--prev"
                        onClick={goToPrev}
                        disabled={!loop && currentIndex === 0}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        className="carousel__arrow carousel__arrow--next"
                        onClick={goToNext}
                        disabled={!loop && currentIndex === maxIndex}
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {showDots && totalSlides > 1 && (
                <div className="carousel__dots">
                    {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                        <button
                            key={index}
                            className={`carousel__dot ${index === currentIndex ? 'carousel__dot--active' : ''}`}
                            onClick={() => goToSlide(index)}
                        />
                    ))}
                </div>
            )}

            {showProgress && (
                <div className="carousel__progress">
                    <motion.div
                        className="carousel__progress-fill"
                        animate={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    )
}

// Card Carousel variant
interface CardCarouselProps {
    children: ReactNode[]
    autoPlay?: boolean
    showArrows?: boolean
    className?: string
}

export function CardCarousel({ children, autoPlay = false, showArrows = true, className = '' }: CardCarouselProps) {
    const slides = children.map((child, index) => ({
        id: `slide-${index}`,
        content: child
    }))

    return (
        <Carousel
            slides={slides}
            autoPlay={autoPlay}
            showArrows={showArrows}
            showDots={true}
            slidesToShow={1}
            className={`card-carousel ${className}`}
        />
    )
}

// Testimonial Carousel
interface TestimonialSlide {
    quote: string
    author: string
    role?: string
    avatar?: string
}

interface TestimonialCarouselProps {
    testimonials: TestimonialSlide[]
    autoPlay?: boolean
    className?: string
}

export function TestimonialCarousel({ testimonials, autoPlay = true, className = '' }: TestimonialCarouselProps) {
    const slides = testimonials.map((t, index) => ({
        id: `testimonial-${index}`,
        content: (
            <div className="testimonial-slide">
                <blockquote className="testimonial-slide__quote">"{t.quote}"</blockquote>
                <div className="testimonial-slide__author">
                    {t.avatar && <img src={t.avatar} alt={t.author} className="testimonial-slide__avatar" />}
                    <div>
                        <div className="testimonial-slide__name">{t.author}</div>
                        {t.role && <div className="testimonial-slide__role">{t.role}</div>}
                    </div>
                </div>
            </div>
        )
    }))

    return (
        <Carousel
            slides={slides}
            autoPlay={autoPlay}
            autoPlayInterval={6000}
            showArrows={false}
            showDots={true}
            className={`testimonial-carousel ${className}`}
        />
    )
}

export default Carousel
