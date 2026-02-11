import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    User,
    Bell,
    Lock,
    Palette,
    Globe,
    CreditCard,
    Link2,
    Shield,
    ChevronRight,
    Save,
    LogOut
} from 'lucide-react'
import { GlassCard, Button, Badge } from '../components/common'
import { useToast } from '../components/common/Toast'

const settingsSections = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Manage your account details' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and push notification preferences' },
    { id: 'security', label: 'Security', icon: Lock, description: 'Password and two-factor authentication' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display preferences' },
    { id: 'integrations', label: 'Integrations', icon: Link2, description: 'Connected apps and API keys' },
    { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Payment methods and invoices' },
]

export function Settings() {
    const { addToast } = useToast()
    const [activeSection, setActiveSection] = useState('profile')
    const [saving, setSaving] = useState(false)

    return (
        <div style={{ padding: 'var(--space-2xl)', background: 'var(--apex-obsidian)', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--apex-white)', margin: 0 }}>Settings</h1>
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--apex-steel)' }}>
                    Manage your account and preferences
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-xl)' }}>
                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    {settingsSections.map((section) => (
                        <motion.button
                            key={section.id}
                            whileHover={{ x: 4 }}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-md)',
                                padding: 'var(--space-md)',
                                background: activeSection === section.id ? 'rgba(6,182,212,0.1)' : 'transparent',
                                border: '1px solid',
                                borderColor: activeSection === section.id ? 'rgba(6,182,212,0.3)' : 'transparent',
                                borderRadius: 'var(--radius-lg)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: 40, height: 40,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: activeSection === section.id ? 'rgba(6,182,212,0.15)' : 'rgba(0,0,0,0.04)',
                                borderRadius: 'var(--radius-md)',
                                color: activeSection === section.id ? 'var(--apex-teal)' : 'var(--apex-steel)'
                            }}>
                                <section.icon size={18} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: activeSection === section.id ? 'var(--apex-white)' : 'var(--apex-silver)', fontWeight: 500, fontSize: 'var(--text-sm)' }}>{section.label}</div>
                            </div>
                            <ChevronRight size={16} style={{ color: 'var(--apex-steel)' }} />
                        </motion.button>
                    ))}

                    <div style={{ marginTop: 'auto', paddingTop: 'var(--space-xl)' }}>
                        <Button variant="ghost" size="sm" style={{ width: '100%', justifyContent: 'flex-start', color: '#EF4444' }}>
                            <LogOut size={16} />
                            Sign Out
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <GlassCard style={{ padding: 'var(--space-xl)' }}>
                    {activeSection === 'profile' && (
                        <div>
                            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--apex-white)', margin: '0 0 var(--space-xl) 0' }}>Profile Settings</h2>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)', padding: 'var(--space-lg)', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-lg)' }}>
                                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--apex-teal), #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: 'white' }}>
                                    MJ
                                </div>
                                <div>
                                    <div style={{ color: 'var(--apex-white)', fontWeight: 600, fontSize: 'var(--text-lg)' }}>Marcus Johnson</div>
                                    <div style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-sm)' }}>Senior Broker</div>
                                    <Button variant="ghost" size="sm" style={{ marginTop: 'var(--space-sm)' }}>Change Photo</Button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-lg)' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase', marginBottom: 'var(--space-xs)' }}>First Name</label>
                                    <input type="text" defaultValue="Marcus" style={{ width: '100%', padding: '10px 12px', background: 'var(--apex-obsidian)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--apex-white)', fontSize: 'var(--text-sm)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase', marginBottom: 'var(--space-xs)' }}>Last Name</label>
                                    <input type="text" defaultValue="Johnson" style={{ width: '100%', padding: '10px 12px', background: 'var(--apex-obsidian)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--apex-white)', fontSize: 'var(--text-sm)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase', marginBottom: 'var(--space-xs)' }}>Email</label>
                                    <input type="email" defaultValue="marcus.j@apexhealth.com" style={{ width: '100%', padding: '10px 12px', background: 'var(--apex-obsidian)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--apex-white)', fontSize: 'var(--text-sm)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase', marginBottom: 'var(--space-xs)' }}>Phone</label>
                                    <input type="tel" defaultValue="+1 (555) 123-4567" style={{ width: '100%', padding: '10px 12px', background: 'var(--apex-obsidian)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--apex-white)', fontSize: 'var(--text-sm)' }} />
                                </div>
                            </div>

                            <div style={{ marginTop: 'var(--space-xl)', display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="primary" size="sm" disabled={saving} onClick={() => {
                                    setSaving(true)
                                    setTimeout(() => {
                                        setSaving(false)
                                        addToast({ type: 'success', title: 'Settings Saved', message: 'Your profile settings have been updated successfully.', duration: 3000 })
                                    }, 800)
                                }}>
                                    <Save size={16} />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div>
                            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--apex-white)', margin: '0 0 var(--space-xl) 0' }}>Notification Preferences</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                {['Email notifications for new quotes', 'Push notifications for claim updates', 'Weekly summary reports', 'Renewal reminders'].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-md)', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)' }}>
                                        <span style={{ color: 'var(--apex-silver)' }}>{item}</span>
                                        <input type="checkbox" defaultChecked={i < 3} style={{ width: 20, height: 20 }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'security' && (
                        <div>
                            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--apex-white)', margin: '0 0 var(--space-xl) 0' }}>Security Settings</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                                <div style={{ padding: 'var(--space-lg)', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ color: 'var(--apex-white)', fontWeight: 500 }}>Password</div>
                                        <div style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-sm)' }}>Last changed 30 days ago</div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => addToast({ type: 'info', title: 'Password Reset', message: 'A password reset link has been sent to your email.', duration: 4000 })}>Change</Button>
                                </div>
                                <div style={{ padding: 'var(--space-lg)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                        <Shield size={20} style={{ color: '#10B981' }} />
                                        <div>
                                            <div style={{ color: 'var(--apex-white)', fontWeight: 500 }}>Two-Factor Authentication</div>
                                            <div style={{ color: '#10B981', fontSize: 'var(--text-sm)' }}>Enabled</div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => addToast({ type: 'info', title: '2FA Settings', message: 'Two-factor authentication management panel opening...', duration: 3000 })}>Manage</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {['appearance', 'integrations', 'billing'].includes(activeSection) && (
                        <div style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
                            <div style={{ width: 64, height: 64, margin: '0 auto var(--space-lg)', borderRadius: '50%', background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--apex-steel)' }}>
                                {activeSection === 'appearance' && <Palette size={24} />}
                                {activeSection === 'integrations' && <Link2 size={24} />}
                                {activeSection === 'billing' && <CreditCard size={24} />}
                            </div>
                            <div style={{ color: 'var(--apex-white)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                                {settingsSections.find(s => s.id === activeSection)?.label} Settings
                            </div>
                            <div style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-sm)' }}>
                                {settingsSections.find(s => s.id === activeSection)?.description}
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    )
}

export default Settings
