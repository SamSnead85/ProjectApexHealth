import { ReactNode, useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Timer, Play, Pause, RotateCcw, Check, ChevronDown } from 'lucide-react'
import './TimeComponents.css'

// Clock Display
interface ClockDisplayProps {
    format?: '12h' | '24h'
    showSeconds?: boolean
    showDate?: boolean
    timezone?: string
    className?: string
}

export function ClockDisplay({
    format = '12h',
    showSeconds = true,
    showDate = false,
    timezone,
    className = ''
}: ClockDisplayProps) {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    const formatTime = () => {
        const options: Intl.DateTimeFormatOptions = {
            hour: 'numeric',
            minute: '2-digit',
            hour12: format === '12h',
            ...(showSeconds && { second: '2-digit' }),
            ...(timezone && { timeZone: timezone })
        }
        return time.toLocaleTimeString('en-US', options)
    }

    const formatDate = () => {
        return time.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            ...(timezone && { timeZone: timezone })
        })
    }

    return (
        <div className={`clock-display ${className}`}>
            <div className="clock-display__time">{formatTime()}</div>
            {showDate && <div className="clock-display__date">{formatDate()}</div>}
        </div>
    )
}

// Countdown Timer
interface CountdownTimerProps {
    targetDate: Date
    onComplete?: () => void
    showDays?: boolean
    showHours?: boolean
    showMinutes?: boolean
    showSeconds?: boolean
    labels?: { days?: string; hours?: string; minutes?: string; seconds?: string }
    className?: string
}

export function CountdownTimer({
    targetDate,
    onComplete,
    showDays = true,
    showHours = true,
    showMinutes = true,
    showSeconds = true,
    labels = { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' },
    className = ''
}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        const calculateTimeLeft = () => {
            const diff = targetDate.getTime() - Date.now()
            if (diff <= 0) {
                setIsComplete(true)
                onComplete?.()
                return { days: 0, hours: 0, minutes: 0, seconds: 0 }
            }

            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60)
            }
        }

        setTimeLeft(calculateTimeLeft())
        const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
        return () => clearInterval(interval)
    }, [targetDate, onComplete])

    const pad = (n: number) => n.toString().padStart(2, '0')

    if (isComplete) {
        return (
            <div className={`countdown-timer countdown-timer--complete ${className}`}>
                <Check size={24} />
                <span>Complete!</span>
            </div>
        )
    }

    return (
        <div className={`countdown-timer ${className}`}>
            {showDays && (
                <div className="countdown-timer__unit">
                    <span className="countdown-timer__value">{pad(timeLeft.days)}</span>
                    <span className="countdown-timer__label">{labels.days}</span>
                </div>
            )}
            {showHours && (
                <div className="countdown-timer__unit">
                    <span className="countdown-timer__value">{pad(timeLeft.hours)}</span>
                    <span className="countdown-timer__label">{labels.hours}</span>
                </div>
            )}
            {showMinutes && (
                <div className="countdown-timer__unit">
                    <span className="countdown-timer__value">{pad(timeLeft.minutes)}</span>
                    <span className="countdown-timer__label">{labels.minutes}</span>
                </div>
            )}
            {showSeconds && (
                <div className="countdown-timer__unit">
                    <span className="countdown-timer__value">{pad(timeLeft.seconds)}</span>
                    <span className="countdown-timer__label">{labels.seconds}</span>
                </div>
            )}
        </div>
    )
}

// Stopwatch
interface StopwatchProps {
    autoStart?: boolean
    onStop?: (time: number) => void
    className?: string
}

export function Stopwatch({ autoStart = false, onStop, className = '' }: StopwatchProps) {
    const [time, setTime] = useState(0)
    const [isRunning, setIsRunning] = useState(autoStart)
    const intervalRef = useRef<ReturnType<typeof setInterval>>()

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime(prev => prev + 10)
            }, 10)
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isRunning])

    const formatTime = () => {
        const ms = time % 1000
        const seconds = Math.floor((time / 1000) % 60)
        const minutes = Math.floor((time / 60000) % 60)
        const hours = Math.floor(time / 3600000)

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${Math.floor(ms / 10).toString().padStart(2, '0')}`
    }

    const handleStop = () => {
        setIsRunning(false)
        onStop?.(time)
    }

    const handleReset = () => {
        setIsRunning(false)
        setTime(0)
    }

    return (
        <div className={`stopwatch ${className}`}>
            <div className="stopwatch__display">{formatTime()}</div>
            <div className="stopwatch__controls">
                {isRunning ? (
                    <button className="stopwatch__btn stopwatch__btn--pause" onClick={handleStop}>
                        <Pause size={16} />
                    </button>
                ) : (
                    <button className="stopwatch__btn stopwatch__btn--start" onClick={() => setIsRunning(true)}>
                        <Play size={16} />
                    </button>
                )}
                <button className="stopwatch__btn stopwatch__btn--reset" onClick={handleReset}>
                    <RotateCcw size={16} />
                </button>
            </div>
        </div>
    )
}

// Timer (countdown from set time)
interface TimerInputProps {
    initialSeconds?: number
    onComplete?: () => void
    className?: string
}

export function TimerInput({ initialSeconds = 300, onComplete, className = '' }: TimerInputProps) {
    const [seconds, setSeconds] = useState(initialSeconds)
    const [isRunning, setIsRunning] = useState(false)
    const [editMode, setEditMode] = useState(true)
    const intervalRef = useRef<ReturnType<typeof setInterval>>()

    useEffect(() => {
        if (isRunning && seconds > 0) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => {
                    if (prev <= 1) {
                        setIsRunning(false)
                        onComplete?.()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isRunning, onComplete])

    const formatTime = () => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const presets = [60, 300, 600, 900, 1800]

    return (
        <div className={`timer-input ${className}`}>
            <div className="timer-input__display">{formatTime()}</div>

            {editMode && !isRunning && (
                <div className="timer-input__presets">
                    {presets.map(preset => (
                        <button
                            key={preset}
                            className={`timer-input__preset ${seconds === preset ? 'timer-input__preset--active' : ''}`}
                            onClick={() => setSeconds(preset)}
                        >
                            {preset < 60 ? `${preset}s` : `${preset / 60}m`}
                        </button>
                    ))}
                </div>
            )}

            <div className="timer-input__controls">
                {isRunning ? (
                    <button className="timer-input__btn timer-input__btn--pause" onClick={() => setIsRunning(false)}>
                        <Pause size={16} />
                        Pause
                    </button>
                ) : (
                    <button
                        className="timer-input__btn timer-input__btn--start"
                        onClick={() => { setIsRunning(true); setEditMode(false) }}
                        disabled={seconds === 0}
                    >
                        <Play size={16} />
                        Start
                    </button>
                )}
                <button
                    className="timer-input__btn timer-input__btn--reset"
                    onClick={() => { setIsRunning(false); setSeconds(initialSeconds); setEditMode(true) }}
                >
                    <RotateCcw size={16} />
                    Reset
                </button>
            </div>
        </div>
    )
}

export default { ClockDisplay, CountdownTimer, Stopwatch, TimerInput }
