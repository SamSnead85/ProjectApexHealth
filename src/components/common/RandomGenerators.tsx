import { ReactNode, useState, useRef, useCallback, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, Repeat, ChevronUp, ChevronDown, Hash, Sparkles, RefreshCw, Copy, Check, X } from 'lucide-react'
import './RandomGenerators.css'

// Random Number Generator
interface RandomNumberProps {
    min?: number
    max?: number
    decimals?: number
    onGenerate?: (value: number) => void
    className?: string
}

export function RandomNumber({
    min = 1,
    max = 100,
    decimals = 0,
    onGenerate,
    className = ''
}: RandomNumberProps) {
    const [value, setValue] = useState<number | null>(null)
    const [isSpinning, setIsSpinning] = useState(false)

    const generate = () => {
        setIsSpinning(true)

        // Animation effect
        let count = 0
        const interval = setInterval(() => {
            const random = min + Math.random() * (max - min)
            setValue(Number(random.toFixed(decimals)))
            count++
            if (count >= 10) {
                clearInterval(interval)
                const finalValue = min + Math.random() * (max - min)
                const result = Number(finalValue.toFixed(decimals))
                setValue(result)
                onGenerate?.(result)
                setIsSpinning(false)
            }
        }, 50)
    }

    return (
        <div className={`random-number ${className}`}>
            <div className="random-number__display">
                <AnimatePresence mode="wait">
                    {value !== null ? (
                        <motion.span
                            key={value}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className={isSpinning ? 'spinning' : ''}
                        >
                            {value}
                        </motion.span>
                    ) : (
                        <span className="random-number__placeholder">?</span>
                    )}
                </AnimatePresence>
            </div>
            <div className="random-number__range">
                <span>{min}</span>
                <span>to</span>
                <span>{max}</span>
            </div>
            <button className="random-number__btn" onClick={generate} disabled={isSpinning}>
                <Shuffle size={16} />
                Generate
            </button>
        </div>
    )
}

// UUID Generator
interface UUIDGeneratorProps {
    format?: 'v4' | 'short' | 'nano'
    onGenerate?: (value: string) => void
    className?: string
}

export function UUIDGenerator({ format = 'v4', onGenerate, className = '' }: UUIDGeneratorProps) {
    const [uuid, setUuid] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const generateV4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0
            const v = c === 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })
    }

    const generateShort = () => {
        return Math.random().toString(36).substr(2, 9)
    }

    const generateNano = () => {
        return Math.random().toString(36).substr(2, 21)
    }

    const generate = () => {
        let result: string
        switch (format) {
            case 'short': result = generateShort(); break
            case 'nano': result = generateNano(); break
            default: result = generateV4(); break
        }
        setUuid(result)
        onGenerate?.(result)
    }

    const copy = async () => {
        if (uuid) {
            await navigator.clipboard.writeText(uuid)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className={`uuid-generator ${className}`}>
            <div className="uuid-generator__display">
                {uuid || <span className="uuid-generator__placeholder">Generate a unique ID</span>}
            </div>
            <div className="uuid-generator__actions">
                <button className="uuid-generator__btn uuid-generator__btn--primary" onClick={generate}>
                    <RefreshCw size={14} />
                    Generate
                </button>
                {uuid && (
                    <button className="uuid-generator__btn" onClick={copy}>
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                )}
            </div>
        </div>
    )
}

// Password Generator
interface PasswordGeneratorProps {
    length?: number
    includeNumbers?: boolean
    includeSymbols?: boolean
    includeUppercase?: boolean
    includeLowercase?: boolean
    onGenerate?: (value: string) => void
    className?: string
}

export function PasswordGenerator({
    length = 16,
    includeNumbers = true,
    includeSymbols = true,
    includeUppercase = true,
    includeLowercase = true,
    onGenerate,
    className = ''
}: PasswordGeneratorProps) {
    const [password, setPassword] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [settings, setSettings] = useState({
        length,
        numbers: includeNumbers,
        symbols: includeSymbols,
        uppercase: includeUppercase,
        lowercase: includeLowercase
    })

    const generate = () => {
        let chars = ''
        if (settings.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
        if (settings.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        if (settings.numbers) chars += '0123456789'
        if (settings.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

        if (!chars) {
            chars = 'abcdefghijklmnopqrstuvwxyz'
        }

        let result = ''
        for (let i = 0; i < settings.length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setPassword(result)
        onGenerate?.(result)
    }

    const copy = async () => {
        if (password) {
            await navigator.clipboard.writeText(password)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const getStrength = () => {
        if (!password) return 0
        let score = 0
        if (password.length >= 8) score++
        if (password.length >= 12) score++
        if (password.length >= 16) score++
        if (/[a-z]/.test(password)) score++
        if (/[A-Z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[^a-zA-Z0-9]/.test(password)) score++
        return Math.min(score, 4)
    }

    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']

    return (
        <div className={`password-generator ${className}`}>
            <div className="password-generator__display">
                <span className={password ? '' : 'password-generator__placeholder'}>
                    {password || 'Click generate'}
                </span>
                {password && (
                    <button className="password-generator__copy" onClick={copy}>
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                )}
            </div>

            {password && (
                <div className="password-generator__strength">
                    <div className="password-generator__strength-bars">
                        {[1, 2, 3, 4].map(i => (
                            <span
                                key={i}
                                className={`password-generator__strength-bar ${i <= getStrength() ? `password-generator__strength-bar--${getStrength()}` : ''}`}
                            />
                        ))}
                    </div>
                    <span>{strengthLabels[getStrength()]}</span>
                </div>
            )}

            <div className="password-generator__settings">
                <div className="password-generator__setting">
                    <label>Length: {settings.length}</label>
                    <input
                        type="range"
                        min="6"
                        max="32"
                        value={settings.length}
                        onChange={(e) => setSettings({ ...settings, length: parseInt(e.target.value) })}
                    />
                </div>
                <div className="password-generator__toggles">
                    <label>
                        <input type="checkbox" checked={settings.lowercase} onChange={(e) => setSettings({ ...settings, lowercase: e.target.checked })} />
                        a-z
                    </label>
                    <label>
                        <input type="checkbox" checked={settings.uppercase} onChange={(e) => setSettings({ ...settings, uppercase: e.target.checked })} />
                        A-Z
                    </label>
                    <label>
                        <input type="checkbox" checked={settings.numbers} onChange={(e) => setSettings({ ...settings, numbers: e.target.checked })} />
                        0-9
                    </label>
                    <label>
                        <input type="checkbox" checked={settings.symbols} onChange={(e) => setSettings({ ...settings, symbols: e.target.checked })} />
                        !@#
                    </label>
                </div>
            </div>

            <button className="password-generator__btn" onClick={generate}>
                <Sparkles size={14} />
                Generate Password
            </button>
        </div>
    )
}

// Random Picker (from list)
interface RandomPickerProps<T> {
    items: T[]
    renderItem?: (item: T) => ReactNode
    onPick?: (item: T) => void
    className?: string
}

export function RandomPicker<T extends { id: string; label: string }>({
    items,
    renderItem,
    onPick,
    className = ''
}: RandomPickerProps<T>) {
    const [picked, setPicked] = useState<T | null>(null)
    const [isSpinning, setIsSpinning] = useState(false)

    const pick = () => {
        if (items.length === 0) return

        setIsSpinning(true)

        let count = 0
        const interval = setInterval(() => {
            const random = items[Math.floor(Math.random() * items.length)]
            setPicked(random)
            count++
            if (count >= 15) {
                clearInterval(interval)
                const final = items[Math.floor(Math.random() * items.length)]
                setPicked(final)
                onPick?.(final)
                setIsSpinning(false)
            }
        }, 80)
    }

    return (
        <div className={`random-picker ${className}`}>
            <div className={`random-picker__display ${isSpinning ? 'random-picker__display--spinning' : ''}`}>
                {picked ? (
                    renderItem ? renderItem(picked) : <span>{picked.label}</span>
                ) : (
                    <span className="random-picker__placeholder">Pick from {items.length} items</span>
                )}
            </div>
            <button className="random-picker__btn" onClick={pick} disabled={isSpinning || items.length === 0}>
                <Shuffle size={14} />
                Pick Random
            </button>
        </div>
    )
}

export default { RandomNumber, UUIDGenerator, PasswordGenerator, RandomPicker }
