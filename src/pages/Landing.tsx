import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Lock,
    User,
    ArrowRight,
    Shield,
    Zap,
    BarChart3,
    Brain,
    Activity,
    Globe,
    Play,
    Sparkles,
    CheckCircle,
    TrendingUp,
    Award,
    Clock,
    DollarSign,
    Heart,
    Building2
} from 'lucide-react'
import { Button, Input } from '../components/common'
import './Landing.css'

// Enterprise client logos for marquee
const enterpriseClients = [
    { name: 'Blue Shield', industry: 'Healthcare' },
    { name: 'Aetna', industry: 'Insurance' },
    { name: 'Kaiser Permanente', industry: 'Healthcare' },
    { name: 'UnitedHealth', industry: 'Healthcare' },
    { name: 'Cigna', industry: 'Insurance' },
    { name: 'Humana', industry: 'Healthcare' },
    { name: 'Anthem', industry: 'Insurance' },
    { name: 'Centene', industry: 'Healthcare' },
]

// Value proposition ticker items
const valuePropositions = [
    { metric: '$2.3M', label: 'Avg. Annual Savings', icon: DollarSign },
    { metric: '94%', label: 'Claims Auto-Adjudication', icon: Zap },
    { metric: '45%', label: 'Faster Enrollment', icon: Clock },
    { metric: '99.99%', label: 'Platform Uptime', icon: Shield },
    { metric: '4.9/5', label: 'Customer Satisfaction', icon: Heart },
]

// Testimonials for social proof
const testimonials = [
    {
        quote: "Project Apex transformed our benefits administration. We've cut processing time by 60% and our members love the experience.",
        author: "Sarah Chen",
        role: "VP of Benefits",
        company: "Fortune 100 Healthcare Co."
    },
    {
        quote: "The AI-powered insights have helped us identify $4M in cost savings opportunities we never knew existed.",
        author: "Michael Torres",
        role: "Chief Technology Officer",
        company: "National Insurance Group"
    },
    {
        quote: "Best-in-class platform. The ROI was evident within the first quarter of implementation.",
        author: "Jennifer Walsh",
        role: "Director of Operations",
        company: "Regional Health System"
    }
]

interface LandingProps {
    onLogin: (portal: 'admin' | 'broker' | 'employer' | 'member') => void
}

// Animated counter for stats
const AnimatedCounter = ({ value, suffix, label }: { value: number, suffix: string, label: string }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const duration = 2000
        const steps = 60
        const increment = value / steps
        let current = 0
        const timer = setInterval(() => {
            current += increment
            if (current >= value) {
                setCount(value)
                clearInterval(timer)
            } else {
                setCount(Math.floor(current))
            }
        }, duration / steps)
        return () => clearInterval(timer)
    }, [value])

    return (
        <div className="landing__stat">
            <span className="landing__stat-value">{count.toLocaleString()}{suffix}</span>
            <span className="landing__stat-label">{label}</span>
        </div>
    )
}

export function Landing({ onLogin }: LandingProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setTimeout(() => {
            onLogin('admin')
            setIsLoading(false)
        }, 1000)
    }

    return (
        <div className="landing">
            {/* Elegant Layered Background */}
            <div className="landing__bg">
                {/* Base gradient */}
                <div className="landing__bg-base" />

                {/* Subtle radial glow */}
                <div className="landing__bg-glow" />

                {/* Animated mesh grid */}
                <div className="landing__bg-grid" />

                {/* Vignette */}
                <div className="landing__bg-vignette" />

                {/* Subtle noise texture */}
                <div className="landing__bg-noise" />
            </div>

            {/* Content */}
            <div className="landing__container">
                {/* Header */}
                <motion.header
                    className="landing__header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="landing__logo">
                        <div className="landing__logo-mark">
                            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 2L28 8V24L16 30L4 24V8L16 2Z" fill="url(#logo-gradient)" fillOpacity="0.1" />
                                <path d="M16 2L28 8V24L16 30L4 24V8L16 2Z" stroke="url(#logo-gradient)" strokeWidth="1.5" />
                                <path d="M16 8L22 11V21L16 24L10 21V11L16 8Z" fill="url(#logo-gradient)" />
                                <defs>
                                    <linearGradient id="logo-gradient" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#0D9488" />
                                        <stop offset="1" stopColor="#06B6D4" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div className="landing__logo-text">
                            <span className="landing__logo-name">Project Apex</span>
                            <span className="landing__logo-tag">Healthcare Intelligence</span>
                        </div>
                    </div>
                    <nav className="landing__nav">
                        <a href="#platform">Platform</a>
                        <a href="#solutions">Solutions</a>
                        <a href="#enterprise">Enterprise</a>
                        <a href="#about">About</a>
                        <Button variant="ghost" size="sm">Contact Sales</Button>
                    </nav>
                </motion.header>

                {/* Hero Section */}
                <main className="landing__hero">
                    {/* Left: Content */}
                    <motion.div
                        className="landing__content"
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        {/* Badge */}
                        <div className="landing__badge">
                            <Sparkles size={14} />
                            <span>AI-Powered Healthcare Administration</span>
                        </div>

                        {/* Headline */}
                        <h1 className="landing__headline">
                            Transform How You
                            <br />
                            <span className="landing__headline-em">Manage Healthcare</span>
                        </h1>

                        {/* Description */}
                        <p className="landing__description">
                            Enterprise-grade platform that streamlines benefits administration,
                            claims processing, and care coordination. Trusted by leading
                            organizations to deliver exceptional healthcare experiences.
                        </p>

                        {/* CTAs */}
                        <div className="landing__ctas">
                            <Button
                                size="lg"
                                icon={<ArrowRight size={18} />}
                                iconPosition="right"
                                onClick={() => onLogin('admin')}
                            >
                                Start Free Trial
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                icon={<Play size={16} />}
                            >
                                Watch Demo
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="landing__stats">
                            <AnimatedCounter value={500} suffix="M+" label="Claims Processed" />
                            <div className="landing__stats-divider" />
                            <AnimatedCounter value={99} suffix=".9%" label="Uptime SLA" />
                            <div className="landing__stats-divider" />
                            <AnimatedCounter value={4} suffix=".8" label="Customer Rating" />
                        </div>
                    </motion.div>

                    {/* Right: Login Card */}
                    <motion.div
                        className="landing__card-wrapper"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                    >
                        <div className="landing__card">
                            {/* Card Header */}
                            <div className="landing__card-header">
                                <div className="landing__card-icon">
                                    <Shield size={20} />
                                </div>
                                <h2 className="landing__card-title">Secure Access</h2>
                                <p className="landing__card-subtitle">Sign in to your enterprise portal</p>
                            </div>

                            {/* Login Form */}
                            <form onSubmit={handleLogin} className="landing__form">
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    icon={<User size={18} />}
                                    fullWidth
                                />

                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    icon={<Lock size={18} />}
                                    fullWidth
                                />

                                <div className="landing__form-options">
                                    <label className="landing__checkbox">
                                        <input type="checkbox" />
                                        <span>Remember me</span>
                                    </label>
                                    <a href="#" className="landing__link">Forgot password?</a>
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    loading={isLoading}
                                    icon={<ArrowRight size={18} />}
                                    iconPosition="right"
                                >
                                    Sign In
                                </Button>
                            </form>

                            {/* SSO */}
                            <div className="landing__sso">
                                <div className="landing__sso-divider">
                                    <span>or</span>
                                </div>
                                <Button
                                    variant="secondary"
                                    fullWidth
                                    onClick={() => onLogin('admin')}
                                >
                                    Continue with SSO
                                </Button>
                            </div>

                            {/* Portal Shortcuts */}
                            <div className="landing__portals">
                                <span className="landing__portals-label">Quick Access</span>
                                <div className="landing__portals-row">
                                    <button
                                        className="landing__portal"
                                        onClick={() => onLogin('admin')}
                                    >
                                        <Shield size={14} />
                                        Admin
                                    </button>
                                    <button
                                        className="landing__portal"
                                        onClick={() => onLogin('broker')}
                                    >
                                        <BarChart3 size={14} />
                                        Broker
                                    </button>
                                    <button
                                        className="landing__portal"
                                        onClick={() => onLogin('employer')}
                                    >
                                        <Globe size={14} />
                                        Employer
                                    </button>
                                    <button
                                        className="landing__portal"
                                        onClick={() => onLogin('member')}
                                    >
                                        <User size={14} />
                                        Member
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </main>

                {/* Value Proposition Ticker */}
                <motion.section
                    className="landing__value-ticker"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <div className="landing__ticker-track">
                        {[...valuePropositions, ...valuePropositions].map((prop, idx) => (
                            <div key={idx} className="landing__ticker-item">
                                <prop.icon size={18} />
                                <span className="landing__ticker-metric">{prop.metric}</span>
                                <span className="landing__ticker-label">{prop.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Features Strip */}
                <motion.section
                    className="landing__features"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    {[
                        { icon: <Brain size={20} />, title: 'AI-First', desc: 'Gemini-powered intelligence' },
                        { icon: <Zap size={20} />, title: 'Real-Time', desc: 'Instant claims processing' },
                        { icon: <Shield size={20} />, title: 'Secure', desc: 'HIPAA & SOC 2 certified' },
                        { icon: <Activity size={20} />, title: 'Analytics', desc: 'Predictive insights' },
                    ].map((feature) => (
                        <div key={feature.title} className="landing__feature">
                            <div className="landing__feature-icon">{feature.icon}</div>
                            <div className="landing__feature-text">
                                <span className="landing__feature-title">{feature.title}</span>
                                <span className="landing__feature-desc">{feature.desc}</span>
                            </div>
                        </div>
                    ))}
                </motion.section>

                {/* Enterprise Logo Marquee */}
                <motion.section
                    className="landing__enterprise"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <span className="landing__enterprise-label">
                        <Building2 size={14} />
                        Trusted by leading healthcare organizations
                    </span>
                    <div className="landing__enterprise-marquee">
                        <div className="landing__enterprise-track">
                            {[...enterpriseClients, ...enterpriseClients].map((client, idx) => (
                                <div key={idx} className="landing__enterprise-logo">
                                    <span className="landing__enterprise-name">{client.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Testimonials Section */}
                <motion.section
                    className="landing__testimonials"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                >
                    <h2 className="landing__testimonials-title">
                        <Award size={20} />
                        What Our Clients Say
                    </h2>
                    <div className="landing__testimonials-grid">
                        {testimonials.map((testimonial, idx) => (
                            <motion.div
                                key={idx}
                                className="landing__testimonial-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.8 + idx * 0.1 }}
                            >
                                <div className="landing__testimonial-quote">
                                    <CheckCircle size={16} className="landing__testimonial-check" />
                                    "{testimonial.quote}"
                                </div>
                                <div className="landing__testimonial-author">
                                    <div className="landing__testimonial-avatar">
                                        {testimonial.author.charAt(0)}
                                    </div>
                                    <div className="landing__testimonial-info">
                                        <span className="landing__testimonial-name">{testimonial.author}</span>
                                        <span className="landing__testimonial-role">{testimonial.role}</span>
                                        <span className="landing__testimonial-company">{testimonial.company}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ROI Calculator Teaser */}
                <motion.section
                    className="landing__roi-teaser"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                >
                    <div className="landing__roi-content">
                        <div className="landing__roi-text">
                            <TrendingUp size={24} />
                            <h3>Calculate Your ROI</h3>
                            <p>See how much you could save with Project Apex's AI-powered automation</p>
                        </div>
                        <div className="landing__roi-metrics">
                            <div className="landing__roi-metric">
                                <span className="landing__roi-value">$2.3M</span>
                                <span className="landing__roi-label">Avg. Annual Savings</span>
                            </div>
                            <div className="landing__roi-metric">
                                <span className="landing__roi-value">127%</span>
                                <span className="landing__roi-label">Avg. First Year ROI</span>
                            </div>
                            <div className="landing__roi-metric">
                                <span className="landing__roi-value">6mo</span>
                                <span className="landing__roi-label">Time to Value</span>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            size="lg"
                            icon={<ArrowRight size={18} />}
                            iconPosition="right"
                        >
                            Get Your Custom ROI Analysis
                        </Button>
                    </div>
                </motion.section>

                {/* Compliance Badges */}
                <motion.section
                    className="landing__compliance"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1 }}
                >
                    <div className="landing__compliance-badges">
                        {[
                            { name: 'HIPAA', desc: 'Compliant' },
                            { name: 'SOC 2', desc: 'Type II' },
                            { name: 'HITRUST', desc: 'Certified' },
                            { name: 'CMS', desc: 'Approved' },
                        ].map((badge) => (
                            <div key={badge.name} className="landing__compliance-badge">
                                <Shield size={16} />
                                <span className="landing__badge-name">{badge.name}</span>
                                <span className="landing__badge-desc">{badge.desc}</span>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Footer */}
                <footer className="landing__footer">
                    <div className="landing__footer-main">
                        <div className="landing__footer-brand">
                            <div className="landing__logo">
                                <div className="landing__logo-mark">
                                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16 2L28 8V24L16 30L4 24V8L16 2Z" fill="url(#footer-logo-gradient)" fillOpacity="0.1" />
                                        <path d="M16 2L28 8V24L16 30L4 24V8L16 2Z" stroke="url(#footer-logo-gradient)" strokeWidth="1.5" />
                                        <path d="M16 8L22 11V21L16 24L10 21V11L16 8Z" fill="url(#footer-logo-gradient)" />
                                        <defs>
                                            <linearGradient id="footer-logo-gradient" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                                                <stop stopColor="#0D9488" />
                                                <stop offset="1" stopColor="#06B6D4" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <span className="landing__footer-name">Project Apex</span>
                            </div>
                            <p className="landing__footer-desc">
                                The future of healthcare benefits administration. AI-powered. Enterprise-ready.
                            </p>
                        </div>
                        <div className="landing__footer-links-grid">
                            <div className="landing__footer-col">
                                <h4>Platform</h4>
                                <a href="#">Features</a>
                                <a href="#">Integrations</a>
                                <a href="#">API</a>
                                <a href="#">Pricing</a>
                            </div>
                            <div className="landing__footer-col">
                                <h4>Solutions</h4>
                                <a href="#">For Brokers</a>
                                <a href="#">For Employers</a>
                                <a href="#">For Carriers</a>
                                <a href="#">For TPAs</a>
                            </div>
                            <div className="landing__footer-col">
                                <h4>Company</h4>
                                <a href="#">About</a>
                                <a href="#">Careers</a>
                                <a href="#">Blog</a>
                                <a href="#">Contact</a>
                            </div>
                        </div>
                    </div>
                    <div className="landing__footer-bottom">
                        <span>© 2026 Project Apex. All rights reserved.</span>
                        <div className="landing__footer-legal">
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                            <a href="#">Security</a>
                            <a href="#">Support</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default Landing
