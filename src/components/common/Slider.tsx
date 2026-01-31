import { useState, useRef, useEffect, forwardRef } from 'react'
import { motion } from 'framer-motion'
import './Slider.css'

interface SliderProps {
    value: number
    min?: number
    max?: number
    step?: number
    onChange: (value: number) => void
    label?: string
    showValue?: boolean
    valueFormatter?: (value: number) => string
    disabled?: boolean
    marks?: { value: number; label?: string }[]
    variant?: 'default' | 'range' | 'gradient'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(({
    value,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    label,
    showValue = true,
    valueFormatter = (v) => String(v),
    disabled = false,
    marks,
    variant = 'default',
    size = 'md',
    className = ''
}, ref) => {
    const percentage = ((value - min) / (max - min)) * 100

    return (
        <div className={`slider slider--${variant} slider--${size} ${disabled ? 'slider--disabled' : ''} ${className}`}>
            {(label || showValue) && (
                <div className="slider__header">
                    {label && <span className="slider__label">{label}</span>}
                    {showValue && <span className="slider__value">{valueFormatter(value)}</span>}
                </div>
            )}

            <div className="slider__track-wrapper">
                <input
                    ref={ref}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    disabled={disabled}
                    className="slider__input"
                    style={{
                        '--slider-percentage': `${percentage}%`
                    } as React.CSSProperties}
                />
                <div className="slider__track" />
                <div className="slider__fill" style={{ width: `${percentage}%` }} />
            </div>

            {marks && marks.length > 0 && (
                <div className="slider__marks">
                    {marks.map(mark => {
                        const markPos = ((mark.value - min) / (max - min)) * 100
                        return (
                            <div
                                key={mark.value}
                                className={`slider__mark ${mark.value <= value ? 'slider__mark--active' : ''}`}
                                style={{ left: `${markPos}%` }}
                            >
                                {mark.label && <span className="slider__mark-label">{mark.label}</span>}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
})

Slider.displayName = 'Slider'

// Range Slider (two handles)
interface RangeSliderProps {
    value: [number, number]
    min?: number
    max?: number
    step?: number
    onChange: (value: [number, number]) => void
    label?: string
    showValue?: boolean
    valueFormatter?: (value: number) => string
    disabled?: boolean
    className?: string
}

export function RangeSlider({
    value,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    label,
    showValue = true,
    valueFormatter = (v) => String(v),
    disabled = false,
    className = ''
}: RangeSliderProps) {
    const [start, end] = value
    const startPercentage = ((start - min) / (max - min)) * 100
    const endPercentage = ((end - min) / (max - min)) * 100

    const handleStartChange = (newValue: number) => {
        onChange([Math.min(newValue, end - step), end])
    }

    const handleEndChange = (newValue: number) => {
        onChange([start, Math.max(newValue, start + step)])
    }

    return (
        <div className={`slider slider--range ${disabled ? 'slider--disabled' : ''} ${className}`}>
            {(label || showValue) && (
                <div className="slider__header">
                    {label && <span className="slider__label">{label}</span>}
                    {showValue && (
                        <span className="slider__value">
                            {valueFormatter(start)} — {valueFormatter(end)}
                        </span>
                    )}
                </div>
            )}

            <div className="slider__track-wrapper slider__track-wrapper--range">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={start}
                    onChange={e => handleStartChange(Number(e.target.value))}
                    disabled={disabled}
                    className="slider__input slider__input--start"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={end}
                    onChange={e => handleEndChange(Number(e.target.value))}
                    disabled={disabled}
                    className="slider__input slider__input--end"
                />
                <div className="slider__track" />
                <div
                    className="slider__fill"
                    style={{
                        left: `${startPercentage}%`,
                        width: `${endPercentage - startPercentage}%`
                    }}
                />
            </div>
        </div>
    )
}

export default Slider
