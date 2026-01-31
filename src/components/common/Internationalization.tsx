import { ReactNode, useState, useEffect, useMemo, useCallback, createContext, useContext, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Check, ChevronDown, Search, Calendar, Clock, MapPin, DollarSign } from 'lucide-react'
import './Internationalization.css'

// Locale Context
interface LocaleContextType {
    locale: string
    setLocale: (locale: string) => void
    t: (key: string, params?: Record<string, string | number>) => string
    formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string
    formatCurrency: (amount: number, currency?: string) => string
    formatRelativeTime: (date: Date) => string
}

const LocaleContext = createContext<LocaleContextType | null>(null)

export function useLocale() {
    const context = useContext(LocaleContext)
    if (!context) throw new Error('useLocale must be used within LocaleProvider')
    return context
}

interface Translations {
    [locale: string]: {
        [key: string]: string
    }
}

interface LocaleProviderProps {
    children: ReactNode
    defaultLocale?: string
    translations?: Translations
    supportedLocales?: string[]
}

export function LocaleProvider({
    children,
    defaultLocale = 'en-US',
    translations = {},
    supportedLocales = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN']
}: LocaleProviderProps) {
    const [locale, setLocale] = useState(defaultLocale)

    const t = useCallback((key: string, params?: Record<string, string | number>): string => {
        const translation = translations[locale]?.[key] || translations[defaultLocale]?.[key] || key

        if (!params) return translation

        return Object.entries(params).reduce((str, [key, value]) =>
            str.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
            , translation)
    }, [locale, defaultLocale, translations])

    const formatNumber = useCallback((num: number, options?: Intl.NumberFormatOptions): string => {
        return new Intl.NumberFormat(locale, options).format(num)
    }, [locale])

    const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions): string => {
        return new Intl.DateTimeFormat(locale, options).format(date)
    }, [locale])

    const formatCurrency = useCallback((amount: number, currency = 'USD'): string => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency
        }).format(amount)
    }, [locale])

    const formatRelativeTime = useCallback((date: Date): string => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

        if (days > 0) return rtf.format(-days, 'day')
        if (hours > 0) return rtf.format(-hours, 'hour')
        if (minutes > 0) return rtf.format(-minutes, 'minute')
        return rtf.format(-seconds, 'second')
    }, [locale])

    return (
        <LocaleContext.Provider value={{
            locale,
            setLocale,
            t,
            formatNumber,
            formatDate,
            formatCurrency,
            formatRelativeTime
        }}>
            {children}
        </LocaleContext.Provider>
    )
}

// Language Selector
interface Language {
    code: string
    name: string
    nativeName: string
    flag?: string
}

interface LanguageSelectorProps {
    languages?: Language[]
    showFlags?: boolean
    showNativeNames?: boolean
    variant?: 'dropdown' | 'grid' | 'inline'
    className?: string
}

const defaultLanguages: Language[] = [
    { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'zh-CN', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' }
]

export function LanguageSelector({
    languages = defaultLanguages,
    showFlags = true,
    showNativeNames = true,
    variant = 'dropdown',
    className = ''
}: LanguageSelectorProps) {
    const { locale, setLocale } = useLocale()
    const [isOpen, setIsOpen] = useState(false)

    const currentLanguage = languages.find(l => l.code === locale) || languages[0]

    if (variant === 'inline') {
        return (
            <div className={`language-selector language-selector--inline ${className}`}>
                {languages.map(lang => (
                    <button
                        key={lang.code}
                        className={`language-selector__inline-btn ${locale === lang.code ? 'language-selector__inline-btn--active' : ''}`}
                        onClick={() => setLocale(lang.code)}
                    >
                        {showFlags && lang.flag && <span>{lang.flag}</span>}
                        {showNativeNames ? lang.nativeName : lang.name}
                    </button>
                ))}
            </div>
        )
    }

    if (variant === 'grid') {
        return (
            <div className={`language-selector language-selector--grid ${className}`}>
                {languages.map(lang => (
                    <button
                        key={lang.code}
                        className={`language-selector__grid-item ${locale === lang.code ? 'language-selector__grid-item--active' : ''}`}
                        onClick={() => setLocale(lang.code)}
                    >
                        {showFlags && lang.flag && <span className="language-selector__flag">{lang.flag}</span>}
                        <span className="language-selector__name">{showNativeNames ? lang.nativeName : lang.name}</span>
                        {locale === lang.code && <Check size={14} />}
                    </button>
                ))}
            </div>
        )
    }

    return (
        <div className={`language-selector ${className}`}>
            <button
                className="language-selector__trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                {showFlags && currentLanguage.flag && <span>{currentLanguage.flag}</span>}
                {showNativeNames ? currentLanguage.nativeName : currentLanguage.name}
                <ChevronDown size={14} className={isOpen ? 'rotated' : ''} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="language-selector__dropdown"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                className={`language-selector__option ${locale === lang.code ? 'language-selector__option--active' : ''}`}
                                onClick={() => { setLocale(lang.code); setIsOpen(false) }}
                            >
                                {showFlags && lang.flag && <span>{lang.flag}</span>}
                                <span>{showNativeNames ? lang.nativeName : lang.name}</span>
                                {locale === lang.code && <Check size={14} />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Timezone Selector
interface TimezoneOption {
    value: string
    label: string
    offset: string
}

interface TimezoneSelectorProps {
    value?: string
    onChange?: (timezone: string) => void
    className?: string
}

const timezones: TimezoneOption[] = [
    { value: 'America/New_York', label: 'Eastern Time', offset: 'GMT-5' },
    { value: 'America/Chicago', label: 'Central Time', offset: 'GMT-6' },
    { value: 'America/Denver', label: 'Mountain Time', offset: 'GMT-7' },
    { value: 'America/Los_Angeles', label: 'Pacific Time', offset: 'GMT-8' },
    { value: 'Europe/London', label: 'London', offset: 'GMT+0' },
    { value: 'Europe/Paris', label: 'Paris', offset: 'GMT+1' },
    { value: 'Asia/Tokyo', label: 'Tokyo', offset: 'GMT+9' },
    { value: 'Asia/Shanghai', label: 'Shanghai', offset: 'GMT+8' },
    { value: 'Australia/Sydney', label: 'Sydney', offset: 'GMT+11' }
]

export function TimezoneSelector({ value, onChange, className = '' }: TimezoneSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')

    const current = timezones.find(tz => tz.value === value) || timezones[0]

    const filtered = useMemo(() =>
        timezones.filter(tz =>
            tz.label.toLowerCase().includes(search.toLowerCase()) ||
            tz.value.toLowerCase().includes(search.toLowerCase())
        ),
        [search]
    )

    return (
        <div className={`timezone-selector ${className}`}>
            <button
                className="timezone-selector__trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Clock size={14} />
                <span>{current.label}</span>
                <span className="timezone-selector__offset">{current.offset}</span>
                <ChevronDown size={14} className={isOpen ? 'rotated' : ''} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="timezone-selector__dropdown"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="timezone-selector__search">
                            <Search size={14} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search timezone..."
                            />
                        </div>
                        <div className="timezone-selector__list">
                            {filtered.map(tz => (
                                <button
                                    key={tz.value}
                                    className={`timezone-selector__option ${value === tz.value ? 'timezone-selector__option--active' : ''}`}
                                    onClick={() => { onChange?.(tz.value); setIsOpen(false) }}
                                >
                                    <span>{tz.label}</span>
                                    <span className="timezone-selector__offset">{tz.offset}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Currency Display
interface CurrencyDisplayProps {
    amount: number
    currency?: string
    locale?: string
    showSymbol?: boolean
    showCode?: boolean
    className?: string
}

export function CurrencyDisplay({
    amount,
    currency = 'USD',
    locale = 'en-US',
    showSymbol = true,
    showCode = false,
    className = ''
}: CurrencyDisplayProps) {
    const formatted = useMemo(() => {
        return new Intl.NumberFormat(locale, {
            style: showSymbol ? 'currency' : 'decimal',
            currency,
            currencyDisplay: showCode ? 'code' : 'symbol'
        }).format(amount)
    }, [amount, currency, locale, showSymbol, showCode])

    return <span className={`currency-display ${className}`}>{formatted}</span>
}

export default { LocaleProvider, useLocale, LanguageSelector, TimezoneSelector, CurrencyDisplay }
