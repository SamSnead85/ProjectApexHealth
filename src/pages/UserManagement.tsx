import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    Search,
    Plus,
    Shield,
    Edit,
    Trash2,
    Mail,
    Send,
    Clock,
    Key,
    UserCheck,
    UserPlus,
    Activity,
    Ban,
    KeyRound,
    ChevronDown,
    ChevronUp,
    Eye
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import './UserManagement.css'

interface User {
    id: string
    name: string
    email: string
    initials: string
    role: 'admin' | 'manager' | 'analyst' | 'user'
    status: 'active' | 'inactive' | 'pending'
    lastActive: string
    lastActiveMinutes: number // minutes ago for sorting
    permissions: string[]
}

const users: User[] = [
    { id: '1', name: 'Sarah Mitchell', email: 'sarah.mitchell@healthplan.com', initials: 'SM', role: 'admin', status: 'active', lastActive: '2 min ago', lastActiveMinutes: 2, permissions: ['All Access'] },
    { id: '2', name: 'James Chen', email: 'james.chen@healthplan.com', initials: 'JC', role: 'manager', status: 'active', lastActive: '15 min ago', lastActiveMinutes: 15, permissions: ['Claims', 'Eligibility', 'Reports'] },
    { id: '3', name: 'Linda Thompson', email: 'linda.t@healthplan.com', initials: 'LT', role: 'analyst', status: 'active', lastActive: '1 hour ago', lastActiveMinutes: 60, permissions: ['Claims', 'Reports'] },
    { id: '4', name: 'Robert Kim', email: 'robert.kim@healthplan.com', initials: 'RK', role: 'analyst', status: 'active', lastActive: '3 hours ago', lastActiveMinutes: 180, permissions: ['Prior Auth', 'Claims'] },
    { id: '5', name: 'Emily Davis', email: 'emily.d@healthplan.com', initials: 'ED', role: 'user', status: 'active', lastActive: 'Yesterday', lastActiveMinutes: 1440, permissions: ['View Only'] },
    { id: '6', name: 'Michael Brown', email: 'michael.b@contractor.com', initials: 'MB', role: 'user', status: 'pending', lastActive: 'Pending invite', lastActiveMinutes: -1, permissions: ['Claims'] },
    { id: '7', name: 'Ana Rodriguez', email: 'ana.r@healthplan.com', initials: 'AR', role: 'manager', status: 'active', lastActive: '5 min ago', lastActiveMinutes: 5, permissions: ['Claims', 'Billing', 'Reports'] },
    { id: '8', name: 'David Park', email: 'david.p@healthplan.com', initials: 'DP', role: 'user', status: 'inactive', lastActive: '3 days ago', lastActiveMinutes: 4320, permissions: ['View Only'] },
]

const roleLabels = {
    admin: { label: 'Administrator', icon: <Shield size={12} /> },
    manager: { label: 'Manager', icon: <Key size={12} /> },
    analyst: { label: 'Analyst', icon: <Search size={12} /> },
    user: { label: 'User', icon: <Users size={12} /> },
}

const roleDistribution = [
    { name: 'Admin', value: 1, color: '#ef4444' },
    { name: 'Manager', value: 2, color: '#f59e0b' },
    { name: 'Analyst', value: 2, color: '#818cf8' },
    { name: 'Viewer', value: 3, color: '#22c55e' },
]

const statsData = [
    { label: 'Total Users', value: '8', change: '+2 this week', icon: <Users size={20} />, color: '#818cf8' },
    { label: 'Active Sessions', value: '5', change: 'Online now', icon: <Activity size={20} />, color: '#22c55e' },
    { label: 'New This Month', value: '3', change: '+12% vs last month', icon: <UserPlus size={20} />, color: '#06b6d4' },
    { label: 'Pending Invites', value: '1', change: 'Awaiting response', icon: <Mail size={20} />, color: '#f59e0b' },
]

function getLastActiveColor(minutes: number): string {
    if (minutes < 0) return '#f59e0b'  // pending
    if (minutes <= 5) return '#22c55e'  // online
    if (minutes <= 60) return '#06b6d4' // recent
    if (minutes <= 1440) return '#818cf8' // today
    return '#6b7280' // older
}

function getLastActiveIcon(minutes: number) {
    if (minutes < 0) return <Clock size={12} style={{ color: '#f59e0b' }} />
    if (minutes <= 5) return <span className="online-pulse" />
    return <Clock size={12} style={{ color: getLastActiveColor(minutes) }} />
}

export default function UserManagement() {
    const [searchQuery, setSearchQuery] = useState('')
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState('user')
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [sortField, setSortField] = useState<'name' | 'lastActive'>('name')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

    const filteredUsers = users
        .filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortField === 'lastActive') {
                return sortDir === 'asc'
                    ? a.lastActiveMinutes - b.lastActiveMinutes
                    : b.lastActiveMinutes - a.lastActiveMinutes
            }
            return sortDir === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name)
        })

    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(filteredUsers.map(u => u.id))
        }
    }

    const toggleSelectUser = (id: string) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        )
    }

    const handleSort = (field: 'name' | 'lastActive') => {
        if (sortField === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDir('asc')
        }
    }

    const SortIcon = ({ field }: { field: 'name' | 'lastActive' }) => {
        if (sortField !== field) return null
        return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
    }

    return (
        <div className="user-management">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <Users size={28} />
                    User Management
                </h1>
                <p className="page-subtitle">
                    Manage users, roles, and permissions for your organization
                </p>
            </motion.div>

            {/* Stats Row */}
            <div className="um-stats-row">
                {statsData.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        className="um-stat-card"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + index * 0.05 }}
                    >
                        <div className="um-stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="um-stat-content">
                            <div className="um-stat-value">{stat.value}</div>
                            <div className="um-stat-label">{stat.label}</div>
                            <div className="um-stat-change" style={{ color: stat.color }}>{stat.change}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Role Distribution & Actions Row */}
            <div className="um-mid-row">
                {/* Role Distribution Chart */}
                <motion.div
                    className="um-role-chart-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <h3>Role Distribution</h3>
                    <div className="um-role-chart-content">
                        <div className="um-role-donut">
                            <ResponsiveContainer width={140} height={140}>
                                <PieChart>
                                    <Pie
                                        data={roleDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={62}
                                        paddingAngle={4}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {roleDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: '#FFFFFF',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            color: '#111827'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="um-role-legend">
                            {roleDistribution.map(role => (
                                <div key={role.name} className="um-role-legend-item">
                                    <span className="um-role-dot" style={{ background: role.color }} />
                                    <span className="um-role-name">{role.name}</span>
                                    <span className="um-role-count">{role.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    className="um-quick-actions-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3>Quick Actions</h3>
                    <div className="um-quick-actions-grid">
                        <button className="um-quick-action">
                            <UserPlus size={18} />
                            <span>Add User</span>
                        </button>
                        <button className="um-quick-action">
                            <Shield size={18} />
                            <span>Manage Roles</span>
                        </button>
                        <button className="um-quick-action">
                            <Eye size={18} />
                            <span>Audit Log</span>
                        </button>
                        <button className="um-quick-action">
                            <UserCheck size={18} />
                            <span>Sync Directory</span>
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Action Bar */}
            <div className="user-actions">
                <div className="um-action-left">
                    <div className="search-bar">
                        <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <AnimatePresence>
                        {selectedUsers.length > 0 && (
                            <motion.div
                                className="um-bulk-actions"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                            >
                                <span className="um-selected-count">{selectedUsers.length} selected</span>
                                <button className="um-bulk-btn danger">
                                    <Ban size={14} />
                                    Disable Selected
                                </button>
                                <button className="um-bulk-btn warning">
                                    <KeyRound size={14} />
                                    Reset Passwords
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <button className="add-user-btn">
                    <Plus size={18} />
                    Add User
                </button>
            </div>

            {/* User Table */}
            <motion.div
                className="user-table-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <table className="user-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    className="um-checkbox"
                                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="sortable-th" onClick={() => handleSort('name')}>
                                User <SortIcon field="name" />
                            </th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Permissions</th>
                            <th className="sortable-th" onClick={() => handleSort('lastActive')}>
                                Last Active <SortIcon field="lastActive" />
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className={selectedUsers.includes(user.id) ? 'selected-row' : ''}>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="um-checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => toggleSelectUser(user.id)}
                                    />
                                </td>
                                <td>
                                    <div className="user-info">
                                        <div className="user-avatar">{user.initials}</div>
                                        <div className="user-details">
                                            <h4>{user.name}</h4>
                                            <span>{user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`role-badge ${user.role}`}>
                                        {roleLabels[user.role].icon}
                                        {roleLabels[user.role].label}
                                    </span>
                                </td>
                                <td>
                                    <div className="status-indicator">
                                        <span className={`status-dot ${user.status}`} />
                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                    </div>
                                </td>
                                <td>
                                    <div className="permissions-summary">
                                        {user.permissions.slice(0, 3).map((perm, i) => (
                                            <span key={i} className="permission-tag">{perm}</span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <div className="um-last-active" style={{ color: getLastActiveColor(user.lastActiveMinutes) }}>
                                        {getLastActiveIcon(user.lastActiveMinutes)}
                                        <span>{user.lastActive}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="table-actions">
                                        <button className="action-btn">
                                            <Edit size={14} />
                                        </button>
                                        <button className="action-btn">
                                            <Mail size={14} />
                                        </button>
                                        <button className="action-btn delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Invite Panel */}
            <motion.div
                className="invite-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3>
                    <Send size={18} />
                    Invite New User
                </h3>
                <div className="invite-form">
                    <input
                        type="email"
                        className="invite-input"
                        placeholder="Enter email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <select
                        className="role-select"
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                    >
                        <option value="user">User</option>
                        <option value="analyst">Analyst</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Administrator</option>
                    </select>
                    <button className="invite-btn">
                        <Send size={16} />
                        Send Invite
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
