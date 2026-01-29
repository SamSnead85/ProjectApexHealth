import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Mail,
    Settings,
    BarChart3,
    Send,
    Download
} from 'lucide-react'
import { GlassCard, Button, Badge, MetricCard } from '../components/common'

// Mock enrollment data
const enrollmentStats = {
    total: 1250,
    completed: 975,
    inProgress: 180,
    notStarted: 95,
    deadline: 'February 15, 2024',
    daysRemaining: 12
}

const recentActivity = [
    { employee: 'John Martinez', action: 'Completed enrollment', time: '2 hours ago', status: 'complete' },
    { employee: 'Sarah Chen', action: 'Updated dependents', time: '4 hours ago', status: 'update' },
    { employee: 'Mike Johnson', action: 'Started enrollment', time: '5 hours ago', status: 'started' },
    { employee: 'Emily Davis', action: 'Completed enrollment', time: '1 day ago', status: 'complete' },
]

export function Enrollment() {
    const progressPercent = Math.round((enrollmentStats.completed / enrollmentStats.total) * 100)

    return (
        <div style={{ padding: 'var(--space-2xl)', background: 'var(--apex-obsidian)', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2xl)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--apex-white)', margin: 0 }}>Enrollment Management</h1>
                    <p style={{ fontSize: 'var(--text-base)', color: 'var(--apex-steel)' }}>
                        Open Enrollment 2024 - {enrollmentStats.daysRemaining} days remaining
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <Button variant="ghost" size="sm">
                        <Mail size={16} />
                        Send Reminders
                    </Button>
                    <Button variant="primary" size="sm">
                        <Settings size={16} />
                        Configure OE
                    </Button>
                </div>
            </div>

            {/* Progress Banner */}
            <GlassCard style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-xl)', background: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(16,185,129,0.1) 100%)', border: '1px solid rgba(6,182,212,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                    <div>
                        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--apex-white)', margin: 0 }}>Enrollment Progress</h2>
                        <p style={{ color: 'var(--apex-silver)', fontSize: 'var(--text-sm)', margin: 0 }}>Deadline: {enrollmentStats.deadline}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--apex-white)' }}>{progressPercent}%</div>
                        <div style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-sm)' }}>{enrollmentStats.completed} of {enrollmentStats.total} employees</div>
                    </div>
                </div>
                <div style={{ height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, var(--apex-teal), #10B981)', borderRadius: 'var(--radius-full)' }}
                    />
                </div>
            </GlassCard>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                <MetricCard label="Completed" value={enrollmentStats.completed.toString()} icon={<CheckCircle2 size={20} />} iconColor="#10B981" />
                <MetricCard label="In Progress" value={enrollmentStats.inProgress.toString()} icon={<Clock size={20} />} iconColor="#F59E0B" />
                <MetricCard label="Not Started" value={enrollmentStats.notStarted.toString()} icon={<AlertCircle size={20} />} iconColor="#EF4444" />
                <MetricCard label="Days Left" value={enrollmentStats.daysRemaining.toString()} icon={<Calendar size={20} />} iconColor="var(--apex-teal)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)' }}>
                {/* Recent Activity */}
                <GlassCard>
                    <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--apex-white)', margin: 0 }}>Recent Activity</h2>
                        <Button variant="ghost" size="sm">View All</Button>
                    </div>
                    <div>
                        {recentActivity.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-md)',
                                    padding: 'var(--space-md) var(--space-lg)',
                                    borderBottom: '1px solid rgba(255,255,255,0.04)'
                                }}
                            >
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: item.status === 'complete' ? 'rgba(16,185,129,0.15)' : 'rgba(6,182,212,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: item.status === 'complete' ? '#10B981' : 'var(--apex-teal)'
                                }}>
                                    {item.status === 'complete' ? <CheckCircle2 size={16} /> : <Users size={16} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: 'var(--apex-white)', fontWeight: 500, fontSize: 'var(--text-sm)' }}>{item.employee}</div>
                                    <div style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-xs)' }}>{item.action}</div>
                                </div>
                                <span style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-xs)' }}>{item.time}</span>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <GlassCard style={{ padding: 'var(--space-lg)' }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--apex-white)', margin: '0 0 var(--space-lg) 0' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            <Button variant="ghost" size="sm" style={{ justifyContent: 'flex-start' }}>
                                <Send size={16} /> Send Reminder to Pending
                            </Button>
                            <Button variant="ghost" size="sm" style={{ justifyContent: 'flex-start' }}>
                                <Download size={16} /> Export Enrollment Report
                            </Button>
                            <Button variant="ghost" size="sm" style={{ justifyContent: 'flex-start' }}>
                                <BarChart3 size={16} /> View Analytics
                            </Button>
                        </div>
                    </GlassCard>

                    <GlassCard style={{ padding: 'var(--space-lg)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                            <AlertCircle size={18} style={{ color: '#F59E0B' }} />
                            <span style={{ color: '#F59E0B', fontWeight: 600 }}>Action Required</span>
                        </div>
                        <p style={{ color: 'var(--apex-silver)', fontSize: 'var(--text-sm)', margin: 0 }}>
                            {enrollmentStats.notStarted} employees haven't started enrollment yet. Consider sending a reminder.
                        </p>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}

export default Enrollment
