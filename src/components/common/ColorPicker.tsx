import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ColorPicker.css'

interface ColorPickerProps {
    value: string
    onChange: (color: string) => void
    label?: string
    presets?: string[]
    showInput?: boolean
    disabled?: boolean
    className?: string
}

const DEFAULT_PRESETS = [
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
    '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#64748b'
]

export function ColorPicker({
    value,
    onChange,
    label,
    presets = DEFAULT_PRESETS,
    showInput = true,
    disabled = false,
    className = ''
}: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState(value)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setInputValue(value)
    }, [value])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)
        if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(newValue)) {
            onChange(newValue)
        }
    }

    const handleInputBlur = () => {
        if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(inputValue)) {
            setInputValue(value)
        }
    }

    return (
        <div ref={containerRef} className={`color-picker ${disabled ? 'color-picker--disabled' : ''} ${className}`}>
            {label && <label className="color-picker__label">{label}</label>}

            <div className="color-picker__control">
                <button
                    type="button"
                    className="color-picker__trigger"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                >
                    <span className="color-picker__swatch" style={{ backgroundColor: value }} />
                </button>

                {showInput && (
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className="color-picker__input"
                        disabled={disabled}
                        maxLength={7}
                    />
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="color-picker__dropdown"
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    >
                        <div className="color-picker__presets">
                            {presets.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`color-picker__preset ${color === value ? 'color-picker__preset--selected' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => {
                                        onChange(color)
                                        setIsOpen(false)
                                    }}
                                />
                            ))}
                        </div>

                        <div className="color-picker__native-wrapper">
                            <input
                                type="color"
                                value={value}
                                onChange={e => onChange(e.target.value)}
                                className="color-picker__native"
                            />
                            <span className="color-picker__native-label">Custom color</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Color swatch display
interface ColorSwatchProps {
    color: string
    size?: 'sm' | 'md' | 'lg'
    label?: string
    onClick?: () => void
}

export function ColorSwatch({ color, size = 'md', label, onClick }: ColorSwatchProps) {
    return (
        <motion.div
            className={`color-swatch color-swatch--${size} ${onClick ? 'color-swatch--clickable' : ''}`}
            onClick={onClick}
            whileHover={onClick ? { scale: 1.05 } : undefined}
            whileTap={onClick ? { scale: 0.95 } : undefined}
        >
            <span className="color-swatch__color" style={{ backgroundColor: color }} />
            {label && <span className="color-swatch__label">{label}</span>}
        </motion.div>
    )
}

export default ColorPicker
