import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import './ThemeToggle.css'

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <span className="theme-toggle__icon">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </span>
            <span className="theme-toggle__label">
                {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
        </button>
    )
}

export function ThemeToggleCompact() {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            className="theme-toggle-compact"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <span className="theme-toggle-compact__track">
                <span className={`theme-toggle-compact__thumb ${theme}`}>
                    {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                </span>
            </span>
        </button>
    )
}

export default ThemeToggle
