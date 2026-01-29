import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import {
    Quote,
    ChevronLeft,
    ChevronRight,
    Star,
    Play,
    Building2,
    Users,
    TrendingUp,
    Award,
    Shield,
    Clock
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../../components/common'
import './TestimonialCarousel.css'

// Testimonial data
interface Testimonial {
    id: string
    quote: string
    author: string
    title: string
    company: string
    industry: string
    logo?: string
    avatar?: string
    metrics?: {
        label: string
        value: string
        improvement: string
    }[]
    videoUrl?: string
    rating: number
}

const testimonials: Testimonial[] = [
    {
        id: 'test-1',
        quote: "Apex Health transformed our benefits administration. What used to take our HR team 40 hours per week now takes just 8. The AI-powered automation is game-changing.",
        author: "Sarah Mitchell",
        title: "VP of Human Resources",
        company: "TechFlow Dynamics",
        industry: "Technology",
        rating: 5,
        metrics: [
            { label: "Time Saved", value: "80%", improvement: "reduction" },
            { label: "Error Rate", value: "99.2%", improvement: "accuracy" },
            { label: "ROI", value: "340%", improvement: "first year" }
        ]
    },
    {
        id: 'test-2',
        quote: "The compliance automation alone paid for itself in the first quarter. We went from constant audit anxiety to complete confidence in our regulatory standing.",
        author: "Michael Chen",
        title: "Chief Compliance Officer",
        company: "Summit Financial Group",
        industry: "Financial Services",
        rating: 5,
        metrics: [
            { label: "Compliance Score", value: "98%", improvement: "maintained" },
            { label: "Audit Prep Time", value: "90%", improvement: "reduction" },
            { label: "Penalties Avoided", value: "$2.1M", improvement: "annually" }
        ]
    },
    {
        id: 'test-3',
        quote: "Our employees love the member portal. The digital ID cards and instant eligibility checks have completely eliminated support tickets about basic coverage questions.",
        author: "Jennifer Walsh",
        title: "Benefits Director",
        company: "Coastal Healthcare Systems",
        industry: "Healthcare",
        rating: 5,
        metrics: [
            { label: "Support Tickets", value: "75%", improvement: "reduction" },
            { label: "Employee Satisfaction", value: "94%", improvement: "rating" },
            { label: "Enrollment Time", value: "5 min", improvement: "average" }
        ]
    },
    {
        id: 'test-4',
        quote: "As a broker, Apex Health gives me a competitive edge. The quoting engine and commission tracking are light years ahead of anything else in the market.",
        author: "David Rodriguez",
        title: "Principal Broker",
        company: "Premier Benefits Advisors",
        industry: "Insurance",
        rating: 5,
        metrics: [
            { label: "Quote Turnaround", value: "2 hrs", improvement: "vs 2 days" },
            { label: "Client Retention", value: "96%", improvement: "rate" },
            { label: "Revenue Growth", value: "45%", improvement: "YoY" }
        ]
    }
]

// Client logos data
const clientLogos = [
    { name: "TechFlow", industry: "Technology" },
    { name: "Summit Financial", industry: "Finance" },
    { name: "Coastal Health", industry: "Healthcare" },
    { name: "Metro Manufacturing", industry: "Manufacturing" },
    { name: "Innovate Corp", industry: "Technology" },
    { name: "Premier Insurance", industry: "Insurance" },
    { name: "Global Logistics", industry: "Logistics" },
    { name: "Apex Enterprises", industry: "Enterprise" }
]

// Case study data
interface CaseStudy {
    id: string
    title: string
    company: string
    industry: string
    challenge: string
    solution: string
    results: { metric: string; value: string }[]
    image?: string
}

const caseStudies: CaseStudy[] = [
    {
        id: 'case-1',
        title: "Digital Transformation Success",
        company: "TechFlow Dynamics",
        industry: "Technology",
        challenge: "Legacy paper-based enrollment taking 3+ weeks",
        solution: "Implemented AI-powered digital enrollment workflow",
        results: [
            { metric: "Enrollment Time", value: "3 weeks → 2 days" },
            { metric: "Error Rate", value: "12% → 0.8%" },
            { metric: "HR Hours Saved", value: "32/week" }
        ]
    },
    {
        id: 'case-2',
        title: "Compliance Automation Journey",
        company: "Summit Financial Group",
        industry: "Financial Services",
        challenge: "Multiple regulatory frameworks, manual compliance tracking",
        solution: "Deployed real-time compliance monitoring with AI alerts",
        results: [
            { metric: "Audit Prep", value: "6 weeks → 3 days" },
            { metric: "Compliance Score", value: "78% → 98%" },
            { metric: "Penalty Risk", value: "$2.1M eliminated" }
        ]
    },
    {
        id: 'case-3',
        title: "Member Experience Revolution",
        company: "Coastal Healthcare",
        industry: "Healthcare",
        challenge: "High call volume, slow claims processing",
        solution: "Self-service portal with instant eligibility verification",
        results: [
            { metric: "Call Volume", value: "-65%" },
            { metric: "Member Satisfaction", value: "71% → 94%" },
            { metric: "Claims Processing", value: "14 days → 48 hrs" }
        ]
    }
]

export function TestimonialCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const currentTestimonial = testimonials[currentIndex]

    // Auto-play functionality
    useEffect(() => {
        if (isAutoPlaying) {
            intervalRef.current = setInterval(() => {
                setDirection(1)
                setCurrentIndex((prev) => (prev + 1) % testimonials.length)
            }, 6000)
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isAutoPlaying])

    const handlePrev = () => {
        setIsAutoPlaying(false)
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

    const handleNext = () => {
        setIsAutoPlaying(false)
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -300 : 300,
            opacity: 0
        })
    }

    return (
        <div className="testimonial-section">
            {/* Section Header */}
            <div className="testimonial-section__header">
                <Badge variant="success" icon={<Award size={12} />}>Success Stories</Badge>
                <h2 className="testimonial-section__title">
                    Trusted by Leading Organizations
                </h2>
                <p className="testimonial-section__subtitle">
                    See how companies are transforming their benefits administration with Apex Health
                </p>
            </div>

            {/* Animated Client Logos */}
            <div className="client-logos">
                <div className="client-logos__track">
                    {[...clientLogos, ...clientLogos].map((logo, index) => (
                        <div key={`${logo.name}-${index}`} className="client-logo">
                            <Building2 size={24} />
                            <span>{logo.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Testimonial Carousel */}
            <div className="testimonial-carousel">
                <button className="carousel-nav carousel-nav--prev" onClick={handlePrev}>
                    <ChevronLeft size={24} />
                </button>

                <div className="carousel-content">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentTestimonial.id}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="testimonial-card"
                        >
                            <GlassCard className="testimonial-card__inner">
                                {/* Quote Icon */}
                                <div className="testimonial-card__quote-icon">
                                    <Quote size={32} />
                                </div>

                                {/* Quote Text */}
                                <blockquote className="testimonial-card__quote">
                                    "{currentTestimonial.quote}"
                                </blockquote>

                                {/* Rating */}
                                <div className="testimonial-card__rating">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            fill={i < currentTestimonial.rating ? '#fbbf24' : 'transparent'}
                                            stroke={i < currentTestimonial.rating ? '#fbbf24' : 'rgba(255,255,255,0.2)'}
                                        />
                                    ))}
                                </div>

                                {/* Author Info */}
                                <div className="testimonial-card__author">
                                    <div className="testimonial-card__avatar">
                                        <Users size={20} />
                                    </div>
                                    <div className="testimonial-card__author-info">
                                        <span className="testimonial-card__name">{currentTestimonial.author}</span>
                                        <span className="testimonial-card__title">{currentTestimonial.title}</span>
                                        <span className="testimonial-card__company">
                                            {currentTestimonial.company} • {currentTestimonial.industry}
                                        </span>
                                    </div>
                                </div>

                                {/* Metrics */}
                                {currentTestimonial.metrics && (
                                    <div className="testimonial-card__metrics">
                                        {currentTestimonial.metrics.map((metric, idx) => (
                                            <div key={idx} className="testimonial-metric">
                                                <span className="testimonial-metric__value">{metric.value}</span>
                                                <span className="testimonial-metric__label">{metric.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <button className="carousel-nav carousel-nav--next" onClick={handleNext}>
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Carousel Dots */}
            <div className="carousel-dots">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => {
                            setIsAutoPlaying(false)
                            setDirection(index > currentIndex ? 1 : -1)
                            setCurrentIndex(index)
                        }}
                    />
                ))}
            </div>

            {/* Case Study Cards */}
            <div className="case-studies">
                <h3 className="case-studies__title">Featured Case Studies</h3>
                <div className="case-studies__grid">
                    {caseStudies.map((study, index) => (
                        <motion.div
                            key={study.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className="case-study-card">
                                <div className="case-study-card__header">
                                    <Badge variant="info" size="sm">{study.industry}</Badge>
                                    <span className="case-study-card__company">{study.company}</span>
                                </div>
                                <h4 className="case-study-card__title">{study.title}</h4>
                                <div className="case-study-card__content">
                                    <div className="case-study-card__section">
                                        <span className="case-study-card__label">Challenge</span>
                                        <p>{study.challenge}</p>
                                    </div>
                                    <div className="case-study-card__section">
                                        <span className="case-study-card__label">Solution</span>
                                        <p>{study.solution}</p>
                                    </div>
                                </div>
                                <div className="case-study-card__results">
                                    {study.results.map((result, idx) => (
                                        <div key={idx} className="case-study-result">
                                            <TrendingUp size={14} />
                                            <span className="case-study-result__metric">{result.metric}:</span>
                                            <span className="case-study-result__value">{result.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="ghost" size="sm" className="case-study-card__cta">
                                    Read Full Case Study
                                </Button>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Trust Indicators */}
            <div className="trust-indicators">
                <div className="trust-indicator">
                    <Shield size={28} />
                    <div className="trust-indicator__content">
                        <span className="trust-indicator__value">SOC 2 Type II</span>
                        <span className="trust-indicator__label">Certified</span>
                    </div>
                </div>
                <div className="trust-indicator">
                    <Clock size={28} />
                    <div className="trust-indicator__content">
                        <span className="trust-indicator__value">99.99%</span>
                        <span className="trust-indicator__label">Uptime SLA</span>
                    </div>
                </div>
                <div className="trust-indicator">
                    <Users size={28} />
                    <div className="trust-indicator__content">
                        <span className="trust-indicator__value">2M+</span>
                        <span className="trust-indicator__label">Members Served</span>
                    </div>
                </div>
                <div className="trust-indicator">
                    <Award size={28} />
                    <div className="trust-indicator__content">
                        <span className="trust-indicator__value">4.9/5</span>
                        <span className="trust-indicator__label">Customer Rating</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TestimonialCarousel
