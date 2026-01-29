import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Palette,
    Upload,
    Type,
    Eye,
    Monitor,
    Smartphone,
    Sun,
    Moon,
    Save,
    RotateCcw
} from 'lucide-react'
import './BrandingSettings.css'

interface BrandColors {
    primary: string
    secondary: string
    accent: string
    background: string
}

export default function BrandingSettings() {
    const [colors, setColors] = useState<BrandColors>({
        primary: '#14b8a6',
        secondary: '#0d9488',
        accent: '#06b6d4',
        background: '#0f172a'
    })
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
    const [font, setFont] = useState('Inter')

    const updateColor = (key: keyof BrandColors, value: string) => {
        setColors(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className="branding-settings">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <Palette size={28} />
                    Branding Settings
                </h1>
                <p className="page-subtitle">
                    Customize colors, logos, and typography for your white-label portal
                </p>
            </motion.div>

            <div className="branding-layout">
                {/* Settings Panel */}
                <div className="settings-panel">
                    {/* Colors */}
                    <motion.div
                        className="color-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2>
                            <Palette size={20} />
                            Brand Colors
                        </h2>
                        <div className="color-grid">
                            <div className="color-picker">
                                <label>Primary Color</label>
                                <div className="color-input-wrapper">
                                    <input
                                        type="color"
                                        className="color-swatch"
                                        value={colors.primary}
                                        onChange={(e) => updateColor('primary', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="color-value"
                                        value={colors.primary}
                                        onChange={(e) => updateColor('primary', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="color-picker">
                                <label>Secondary Color</label>
                                <div className="color-input-wrapper">
                                    <input
                                        type="color"
                                        className="color-swatch"
                                        value={colors.secondary}
                                        onChange={(e) => updateColor('secondary', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="color-value"
                                        value={colors.secondary}
                                        onChange={(e) => updateColor('secondary', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="color-picker">
                                <label>Accent Color</label>
                                <div className="color-input-wrapper">
                                    <input
                                        type="color"
                                        className="color-swatch"
                                        value={colors.accent}
                                        onChange={(e) => updateColor('accent', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="color-value"
                                        value={colors.accent}
                                        onChange={(e) => updateColor('accent', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="color-picker">
                                <label>Background Color</label>
                                <div className="color-input-wrapper">
                                    <input
                                        type="color"
                                        className="color-swatch"
                                        value={colors.background}
                                        onChange={(e) => updateColor('background', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="color-value"
                                        value={colors.background}
                                        onChange={(e) => updateColor('background', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Logo Upload */}
                    <motion.div
                        className="logo-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2>
                            <Upload size={20} />
                            Logo Assets
                        </h2>
                        <div className="logo-uploads">
                            <div className="logo-upload">
                                <div className="icon">
                                    <Sun size={24} />
                                </div>
                                <h4>Light Mode Logo</h4>
                                <span>PNG, SVG · Max 2MB</span>
                            </div>
                            <div className="logo-upload">
                                <div className="icon">
                                    <Moon size={24} />
                                </div>
                                <h4>Dark Mode Logo</h4>
                                <span>PNG, SVG · Max 2MB</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Typography */}
                    <motion.div
                        className="typography-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2>
                            <Type size={20} />
                            Typography
                        </h2>
                        <select
                            className="font-select"
                            value={font}
                            onChange={(e) => setFont(e.target.value)}
                        >
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                            <option value="Poppins">Poppins</option>
                        </select>
                        <div className="font-preview" style={{ fontFamily: font }}>
                            <h3>Preview Heading</h3>
                            <p>The quick brown fox jumps over the lazy dog. This text shows how your selected font will appear across the platform.</p>
                        </div>
                    </motion.div>

                    {/* Save Actions */}
                    <div className="save-bar">
                        <button className="save-btn">
                            <Save size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                            Save Changes
                        </button>
                        <button className="reset-btn">
                            <RotateCcw size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Preview Panel */}
                <motion.div
                    className="preview-panel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="preview-header">
                        <h3>
                            <Eye size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                            Live Preview
                        </h3>
                        <div className="preview-tabs">
                            <button
                                className={`preview-tab ${previewMode === 'desktop' ? 'active' : ''}`}
                                onClick={() => setPreviewMode('desktop')}
                            >
                                <Monitor size={14} />
                            </button>
                            <button
                                className={`preview-tab ${previewMode === 'mobile' ? 'active' : ''}`}
                                onClick={() => setPreviewMode('mobile')}
                            >
                                <Smartphone size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="preview-content" style={{ background: colors.background }}>
                        <div className="preview-navbar">
                            <div className="preview-logo" style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})` }} />
                            <div className="preview-nav-items">
                                <div className="preview-nav-item" />
                                <div className="preview-nav-item" />
                                <div className="preview-nav-item" />
                            </div>
                        </div>
                        <div className="preview-card">
                            <div className="preview-card-header">
                                <div className="preview-avatar" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }} />
                                <div className="preview-lines">
                                    <div className="preview-line" />
                                    <div className="preview-line short" />
                                </div>
                            </div>
                        </div>
                        <button className="preview-button" style={{ background: colors.primary }}>
                            Sample Button
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
