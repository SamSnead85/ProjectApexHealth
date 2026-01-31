import { ReactNode, useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, Volume2, VolumeX, Moon, Sun, Palette, Monitor, Smartphone, Lock, Shield, Key, Eye, EyeOff, Globe, Save, RotateCcw, CheckCircle } from 'lucide-react'
import './PreferencesSettings.css'

// Preferences Context
interface PreferencesContextType {
    preferences: Record<string, any>
    updatePreference: (key: string, value: any) => void
    resetPreferences: () => void
    savePreferences: () => Promise<void>
}

const PreferencesContext = createContext<PreferencesContextType | null>(null)

export function usePreferences() {
    const context = useContext(PreferencesContext)
    if (!context) throw new Error('usePreferences must be used within PreferencesProvider')
    return context
}

interface PreferencesProviderProps {
    children: ReactNode
    defaultPreferences?: Record<string, any>
    onSave?: (preferences: Record<string, any>) => Promise<void>
    storageKey?: string
}

export function PreferencesProvider({
    children,
    defaultPreferences = {},
    onSave,
    storageKey = 'app_preferences'
}: PreferencesProviderProps) {
    const [preferences, setPreferences] = useState<Record<string, any>>(() => {
        const stored = localStorage.getItem(storageKey)
        return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences
    })

    const updatePreference = useCallback((key: string, value: any) => {
        setPreferences(prev => {
            const updated = { ...prev, [key]: value }
            localStorage.setItem(storageKey, JSON.stringify(updated))
            return updated
        })
    }, [storageKey])

    const resetPreferences = useCallback(() => {
        setPreferences(defaultPreferences)
        localStorage.setItem(storageKey, JSON.stringify(defaultPreferences))
    }, [defaultPreferences, storageKey])

    const savePreferences = useCallback(async () => {
        await onSave?.(preferences)
    }, [preferences, onSave])

    return (
        <PreferencesContext.Provider value={{ preferences, updatePreference, resetPreferences, savePreferences }}>
            {children}
        </PreferencesContext.Provider>
    )
}

// Notification Settings
interface NotificationSettingsProps {
    settings?: {
        email?: boolean
        push?: boolean
        sound?: boolean
        desktop?: boolean
    }
    onChange?: (settings: Record<string, boolean>) => void
    className?: string
}

export function NotificationSettings({
    settings = { email: true, push: true, sound: true, desktop: false },
    onChange,
    className = ''
}: NotificationSettingsProps) {
    const [localSettings, setLocalSettings] = useState(settings)

    const handleToggle = (key: string) => {
        const updated = { ...localSettings, [key]: !localSettings[key as keyof typeof localSettings] }
        setLocalSettings(updated)
        onChange?.(updated)
    }

    return (
        <div className={`notification-settings ${className}`}>
            <h4 className="notification-settings__title">
                <Bell size={18} /> Notifications
            </h4>

            <div className="notification-settings__list">
                <div className="notification-settings__item">
                    <div className="notification-settings__info">
                        <span>Email Notifications</span>
                        <p>Receive updates via email</p>
                    </div>
                    <button
                        className={`notification-settings__toggle ${localSettings.email ? 'active' : ''}`}
                        onClick={() => handleToggle('email')}
                    >
                        <span />
                    </button>
                </div>

                <div className="notification-settings__item">
                    <div className="notification-settings__info">
                        <span>Push Notifications</span>
                        <p>Receive push notifications on mobile</p>
                    </div>
                    <button
                        className={`notification-settings__toggle ${localSettings.push ? 'active' : ''}`}
                        onClick={() => handleToggle('push')}
                    >
                        <span />
                    </button>
                </div>

                <div className="notification-settings__item">
                    <div className="notification-settings__info">
                        <span>Sound</span>
                        <p>Play sounds for notifications</p>
                    </div>
                    <button
                        className={`notification-settings__toggle ${localSettings.sound ? 'active' : ''}`}
                        onClick={() => handleToggle('sound')}
                    >
                        <span />
                    </button>
                </div>

                <div className="notification-settings__item">
                    <div className="notification-settings__info">
                        <span>Desktop Notifications</span>
                        <p>Show desktop alerts</p>
                    </div>
                    <button
                        className={`notification-settings__toggle ${localSettings.desktop ? 'active' : ''}`}
                        onClick={() => handleToggle('desktop')}
                    >
                        <span />
                    </button>
                </div>
            </div>
        </div>
    )
}

// Theme Selector
interface ThemeSelectorProps {
    value?: 'light' | 'dark' | 'system'
    onChange?: (theme: string) => void
    showPreview?: boolean
    className?: string
}

export function ThemeSelector({
    value = 'system',
    onChange,
    showPreview = true,
    className = ''
}: ThemeSelectorProps) {
    const themes = [
        { id: 'light', label: 'Light', icon: Sun },
        { id: 'dark', label: 'Dark', icon: Moon },
        { id: 'system', label: 'System', icon: Monitor }
    ]

    return (
        <div className={`theme-selector ${className}`}>
            <h4 className="theme-selector__title">
                <Palette size={18} /> Appearance
            </h4>

            <div className="theme-selector__options">
                {themes.map(theme => {
                    const Icon = theme.icon
                    return (
                        <button
                            key={theme.id}
                            className={`theme-selector__option ${value === theme.id ? 'active' : ''}`}
                            onClick={() => onChange?.(theme.id)}
                        >
                            {showPreview && (
                                <div className={`theme-selector__preview theme-selector__preview--${theme.id}`}>
                                    <div className="theme-selector__preview-header" />
                                    <div className="theme-selector__preview-content">
                                        <div className="theme-selector__preview-sidebar" />
                                        <div className="theme-selector__preview-main" />
                                    </div>
                                </div>
                            )}
                            <div className="theme-selector__label">
                                <Icon size={14} />
                                <span>{theme.label}</span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// Privacy Settings
interface PrivacySettingsProps {
    settings?: {
        profileVisibility?: 'public' | 'private' | 'friends'
        activityStatus?: boolean
        dataCollection?: boolean
        twoFactor?: boolean
    }
    onChange?: (settings: Record<string, any>) => void
    className?: string
}

export function PrivacySettings({
    settings = { profileVisibility: 'public', activityStatus: true, dataCollection: true, twoFactor: false },
    onChange,
    className = ''
}: PrivacySettingsProps) {
    const [localSettings, setLocalSettings] = useState(settings)

    const handleChange = (key: string, value: any) => {
        const updated = { ...localSettings, [key]: value }
        setLocalSettings(updated)
        onChange?.(updated)
    }

    return (
        <div className={`privacy-settings ${className}`}>
            <h4 className="privacy-settings__title">
                <Shield size={18} /> Privacy & Security
            </h4>

            <div className="privacy-settings__list">
                <div className="privacy-settings__item">
                    <div className="privacy-settings__info">
                        <span>Profile Visibility</span>
                        <p>Control who can see your profile</p>
                    </div>
                    <select
                        value={localSettings.profileVisibility}
                        onChange={(e) => handleChange('profileVisibility', e.target.value)}
                    >
                        <option value="public">Public</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Private</option>
                    </select>
                </div>

                <div className="privacy-settings__item">
                    <div className="privacy-settings__info">
                        <span>Activity Status</span>
                        <p>Show when you're online</p>
                    </div>
                    <button
                        className={`privacy-settings__toggle ${localSettings.activityStatus ? 'active' : ''}`}
                        onClick={() => handleChange('activityStatus', !localSettings.activityStatus)}
                    >
                        <span />
                    </button>
                </div>

                <div className="privacy-settings__item">
                    <div className="privacy-settings__info">
                        <span>Data Collection</span>
                        <p>Help improve our services</p>
                    </div>
                    <button
                        className={`privacy-settings__toggle ${localSettings.dataCollection ? 'active' : ''}`}
                        onClick={() => handleChange('dataCollection', !localSettings.dataCollection)}
                    >
                        <span />
                    </button>
                </div>

                <div className="privacy-settings__item privacy-settings__item--highlight">
                    <div className="privacy-settings__info">
                        <span><Key size={14} /> Two-Factor Authentication</span>
                        <p>Add an extra layer of security</p>
                    </div>
                    <button
                        className={`privacy-settings__toggle ${localSettings.twoFactor ? 'active' : ''}`}
                        onClick={() => handleChange('twoFactor', !localSettings.twoFactor)}
                    >
                        <span />
                    </button>
                </div>
            </div>
        </div>
    )
}

// Settings Action Bar
interface SettingsActionBarProps {
    onSave?: () => void
    onReset?: () => void
    onCancel?: () => void
    saving?: boolean
    hasChanges?: boolean
    className?: string
}

export function SettingsActionBar({
    onSave,
    onReset,
    onCancel,
    saving = false,
    hasChanges = false,
    className = ''
}: SettingsActionBarProps) {
    return (
        <div className={`settings-action-bar ${hasChanges ? 'settings-action-bar--visible' : ''} ${className}`}>
            <div className="settings-action-bar__content">
                <span className="settings-action-bar__message">
                    You have unsaved changes
                </span>
                <div className="settings-action-bar__actions">
                    {onReset && (
                        <button className="settings-action-bar__btn settings-action-bar__btn--reset" onClick={onReset}>
                            <RotateCcw size={14} /> Reset
                        </button>
                    )}
                    {onCancel && (
                        <button className="settings-action-bar__btn settings-action-bar__btn--cancel" onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                    <button
                        className="settings-action-bar__btn settings-action-bar__btn--save"
                        onClick={onSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : <><Save size={14} /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Success Toast
interface SaveSuccessToastProps {
    show: boolean
    message?: string
    onClose?: () => void
    duration?: number
    className?: string
}

export function SaveSuccessToast({
    show,
    message = 'Settings saved successfully',
    onClose,
    duration = 3000,
    className = ''
}: SaveSuccessToastProps) {
    useEffect(() => {
        if (show && duration > 0) {
            const timer = setTimeout(() => onClose?.(), duration)
            return () => clearTimeout(timer)
        }
    }, [show, duration, onClose])

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className={`save-success-toast ${className}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                >
                    <CheckCircle size={18} />
                    <span>{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default { PreferencesProvider, usePreferences, NotificationSettings, ThemeSelector, PrivacySettings, SettingsActionBar, SaveSuccessToast }
