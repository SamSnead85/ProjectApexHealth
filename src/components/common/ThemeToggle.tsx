import { motion } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import './ThemeToggle.css'

interface ThemeToggleProps {
    showLabel?: boolean
    className?: string
}

export function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme()

    const themes = [
        { value: 'light' as const, icon: Sun, label: 'Light' },
        { value: 'dark' as const, icon: Moon, label: 'Dark' },
        { value: 'system' as const, icon: Monitor, label: 'System' }
    ]

    const currentIndex = themes.findIndex(t => t.value === theme)

    const cycleTheme = () => {
        const nextIndex = (currentIndex + 1) % themes.length
        setTheme(themes[nextIndex].value)
    }

    const CurrentIcon = themes[currentIndex]?.icon || Moon

    return (
        <div className={`theme-toggle ${className}`}>
            <motion.button
                className="theme-toggle__button"
                onClick={cycleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={`Current: ${themes[currentIndex]?.label}. Click to change.`}
            >
                <motion.div
                    key={theme}
                    initial={{ rotate: -30, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 30, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <CurrentIcon size={18} />
                </motion.div>
            </motion.button>
            {showLabel && (
                <span className="theme-toggle__label">{themes[currentIndex]?.label}</span>
            )}
        </div>
    )
}

// Full theme selector for Settings page
export function ThemeSelector({ className = '' }: { className?: string }) {
    const { theme, setTheme } = useTheme()

    const themes = [
        { value: 'light' as const, icon: Sun, label: 'Light', description: 'Clean bright interface' },
        { value: 'dark' as const, icon: Moon, label: 'Dark', description: 'Easy on the eyes' },
        { value: 'system' as const, icon: Monitor, label: 'System', description: 'Match device settings' }
    ]

    return (
        <div className={`theme-selector ${className}`}>
            {themes.map(({ value, icon: Icon, label, description }) => (
                <motion.button
                    key={value}
                    className={`theme-selector__option ${theme === value ? 'theme-selector__option--active' : ''}`}
                    onClick={() => setTheme(value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="theme-selector__icon">
                        <Icon size={24} />
                    </div>
                    <div className="theme-selector__content">
                        <span className="theme-selector__label">{label}</span>
                        <span className="theme-selector__description">{description}</span>
                    </div>
                    {theme === value && (
                        <motion.div
                            className="theme-selector__indicator"
                            layoutId="theme-indicator"
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    )}
                </motion.button>
            ))}
        </div>
    )
}

export default ThemeToggle
