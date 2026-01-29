import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    UserPlus,
    Upload,
    Download,
    Search,
    Filter,
    MoreHorizontal,
    Edit2,
    Trash2,
    Eye,
    CheckCircle2,
    Clock
} from 'lucide-react'
import { GlassCard, Button, Badge, MetricCard } from '../components/common'

// Mock census data
const employees = [
    { id: 1, name: 'John Martinez', email: 'john.m@company.com', department: 'Engineering', dependents: 3, status: 'active', enrolled: true },
    { id: 2, name: 'Sarah Chen', email: 'sarah.c@company.com', department: 'Marketing', dependents: 2, status: 'active', enrolled: true },
    { id: 3, name: 'Mike Johnson', email: 'mike.j@company.com', department: 'Sales', dependents: 4, status: 'active', enrolled: false },
    { id: 4, name: 'Emily Davis', email: 'emily.d@company.com', department: 'HR', dependents: 1, status: 'active', enrolled: true },
    { id: 5, name: 'Robert Williams', email: 'robert.w@company.com', department: 'Finance', dependents: 2, status: 'terminated', enrolled: false },
]

export function Census() {
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div style={{ padding: 'var(--space-2xl)', background: 'var(--apex-obsidian)', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2xl)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--apex-white)', margin: 0 }}>Employee Census</h1>
                    <p style={{ fontSize: 'var(--text-base)', color: 'var(--apex-steel)' }}>
                        Manage employees and dependents
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <Button variant="ghost" size="sm">
                        <Upload size={16} />
                        Import CSV
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Download size={16} />
                        Export
                    </Button>
                    <Button variant="primary" size="sm">
                        <UserPlus size={16} />
                        Add Employee
                    </Button>
                </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                <MetricCard label="Total Employees" value="1,250" change={3.2} trend="up" icon={<Users size={20} />} />
                <MetricCard label="Active" value="1,245" icon={<CheckCircle2 size={20} />} iconColor="#10B981" />
                <MetricCard label="Dependents" value="2,170" icon={<Users size={20} />} />
                <MetricCard label="Pending Changes" value="12" icon={<Clock size={20} />} iconColor="#F59E0B" />
            </div>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--apex-steel)' }} />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            background: 'var(--apex-obsidian-elevated)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--apex-white)',
                            fontSize: 'var(--text-sm)'
                        }}
                    />
                </div>
                <Button variant="ghost" size="sm"><Filter size={16} /> Filter</Button>
            </div>

            {/* Employee Table */}
            <GlassCard>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase' }}>Employee</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase' }}>Department</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase' }}>Dependents</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--apex-steel)', textTransform: 'uppercase' }}>Enrolled</th>
                                <th style={{ padding: 'var(--space-md)', width: 100 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, i) => (
                                <motion.tr
                                    key={emp.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                >
                                    <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                                        <div>
                                            <div style={{ color: 'var(--apex-white)', fontWeight: 500 }}>{emp.name}</div>
                                            <div style={{ color: 'var(--apex-steel)', fontSize: 'var(--text-xs)' }}>{emp.email}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--apex-silver)' }}>{emp.department}</td>
                                    <td style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--apex-silver)' }}>{emp.dependents}</td>
                                    <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                                        <Badge variant={emp.status === 'active' ? 'success' : 'critical'}>
                                            {emp.status}
                                        </Badge>
                                    </td>
                                    <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                                        {emp.enrolled ? (
                                            <CheckCircle2 size={18} style={{ color: '#10B981' }} />
                                        ) : (
                                            <Clock size={18} style={{ color: '#F59E0B' }} />
                                        )}
                                    </td>
                                    <td style={{ padding: 'var(--space-md)' }}>
                                        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                                            <button style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid transparent', borderRadius: 'var(--radius-md)', color: 'var(--apex-steel)', cursor: 'pointer' }}>
                                                <Eye size={16} />
                                            </button>
                                            <button style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid transparent', borderRadius: 'var(--radius-md)', color: 'var(--apex-steel)', cursor: 'pointer' }}>
                                                <Edit2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    )
}

export default Census
