import { ReactNode, useState, createContext, useContext, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, User, Bell, Shield, Palette, Globe, Moon, Sun, Monitor, Save, RefreshCw } from 'lucide-react'
import './SettingsPanel.css'

interface SettingsSection {
    id: string
    label: string
    icon: ReactNode
    content: ReactNode
}

interface SettingsPanelProps {
    sections: SettingsSection[]
    isOpen: boolean
    onClose: () => void
    onSave?: () => void
    className?: string
}

export function SettingsPanel({
    sections,
    isOpen,
    onClose,
    onSave,
    className = ''
}: SettingsPanelProps) {
    const [activeSection, setActiveSection] = useState(sections[0]?.id)
    const [hasChanges, setHasChanges] = useState(false)

    if (!isOpen) return null

    return (
        <>
            <div className="settings-panel__overlay" onClick={onClose} />

            <motion.div
                className={`settings-panel ${className}`}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
            >
                <div className="settings-panel__header">
                    <h2>Settings</h2>
                    <button className="settings-panel__close" onClick={onClose}>×</button>
                </div>

                <div className="settings-panel__layout">
                    <nav className="settings-panel__nav">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                className={`settings-panel__nav-item ${activeSection === section.id ? 'settings-panel__nav-item--active' : ''}`}
                                onClick={() => setActiveSection(section.id)}
                            >
                                {section.icon}
                                <span>{section.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="settings-panel__content">
                        <AnimatePresence mode="wait">
                            {sections.map(section => (
                                activeSection === section.id && (
                                    <motion.div
                                        key={section.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        {section.content}
                                    </motion.div>
                                )
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {onSave && (
                    <div className="settings-panel__footer">
                        <button className="settings-panel__btn settings-panel__btn--secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className="settings-panel__btn settings-panel__btn--primary"
                            onClick={() => { onSave(); setHasChanges(false) }}
                        >
                            <Save size={14} />
                            Save Changes
                        </button>
                    </div>
                )}
            </motion.div>
        </>
    )
}

// Settings Group
interface SettingsGroupProps {
    title: string
    description?: string
    children: ReactNode
}

export function SettingsGroup({ title, description, children }: SettingsGroupProps) {
    return (
        <div className="settings-group">
            <div className="settings-group__header">
                <h3 className="settings-group__title">{title}</h3>
                {description && <p className="settings-group__desc">{description}</p>}
            </div>
            <div className="settings-group__content">{children}</div>
        </div>
    )
}

// Settings Item
interface SettingsItemProps {
    label: string
    description?: string
    children: ReactNode
}

export function SettingsItem({ label, description, children }: SettingsItemProps) {
    return (
        <div className="settings-item">
            <div className="settings-item__info">
                <span className="settings-item__label">{label}</span>
                {description && <span className="settings-item__desc">{description}</span>}
            </div>
            <div className="settings-item__control">{children}</div>
        </div>
    )
}

// Theme Picker
type Theme = 'light' | 'dark' | 'system'

interface ThemePickerProps {
    value: Theme
    onChange: (theme: Theme) => void
}

export function ThemePicker({ value, onChange }: ThemePickerProps) {
    const themes: { id: Theme; label: string; icon: ReactNode }[] = [
        { id: 'light', label: 'Light', icon: <Sun size={16} /> },
        { id: 'dark', label: 'Dark', icon: <Moon size={16} /> },
        { id: 'system', label: 'System', icon: <Monitor size={16} /> }
    ]

    return (
        <div className="theme-picker">
            {themes.map(theme => (
                <button
                    key={theme.id}
                    className={`theme-picker__option ${value === theme.id ? 'theme-picker__option--active' : ''}`}
                    onClick={() => onChange(theme.id)}
                >
                    {theme.icon}
                    <span>{theme.label}</span>
                </button>
            ))}
        </div>
    )
}

// Color Picker
interface AccentColorPickerProps {
    value: string
    onChange: (color: string) => void
    colors?: string[]
}

export function AccentColorPicker({
    value,
    onChange,
    colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']
}: AccentColorPickerProps) {
    return (
        <div className="accent-color-picker">
            {colors.map(color => (
                <button
                    key={color}
                    className={`accent-color-picker__swatch ${value === color ? 'accent-color-picker__swatch--active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => onChange(color)}
                />
            ))}
        </div>
    )
}

// Language Selector
interface LanguageSelectorProps {
    value: string
    onChange: (lang: string) => void
    languages?: { code: string; label: string }[]
}

export function LanguageSelector({
    value,
    onChange,
    languages = [
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Español' },
        { code: 'fr', label: 'Français' },
        { code: 'de', label: 'Deutsch' },
        { code: 'zh', label: '中文' },
        { code: 'ja', label: '日本語' }
    ]
}: LanguageSelectorProps) {
    return (
        <select
            className="language-selector"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                    {lang.label}
                </option>
            ))}
        </select>
    )
}

// Toggle Switch
interface ToggleSwitchProps {
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg'
}

export function ToggleSwitch({ checked, onChange, disabled = false, size = 'md' }: ToggleSwitchProps) {
    return (
        <button
            className={`toggle-switch toggle-switch--${size} ${checked ? 'toggle-switch--checked' : ''} ${disabled ? 'toggle-switch--disabled' : ''}`}
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
        >
            <span className="toggle-switch__thumb" />
        </button>
    )
}

export default SettingsPanel
