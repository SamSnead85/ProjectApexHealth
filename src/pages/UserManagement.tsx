import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    Search,
    Plus,
    Shield,
    Edit,
    Trash2,
    Mail,
    MoreHorizontal,
    Send,
    Clock,
    Key
} from 'lucide-react'
import './UserManagement.css'

interface User {
    id: string
    name: string
    email: string
    initials: string
    role: 'admin' | 'manager' | 'analyst' | 'user'
    status: 'active' | 'inactive' | 'pending'
    lastActive: string
    permissions: string[]
}

const users: User[] = [
    { id: '1', name: 'Sarah Mitchell', email: 'sarah.mitchell@healthplan.com', initials: 'SM', role: 'admin', status: 'active', lastActive: '2 min ago', permissions: ['All Access'] },
    { id: '2', name: 'James Chen', email: 'james.chen@healthplan.com', initials: 'JC', role: 'manager', status: 'active', lastActive: '15 min ago', permissions: ['Claims', 'Eligibility', 'Reports'] },
    { id: '3', name: 'Linda Thompson', email: 'linda.t@healthplan.com', initials: 'LT', role: 'analyst', status: 'active', lastActive: '1 hour ago', permissions: ['Claims', 'Reports'] },
    { id: '4', name: 'Robert Kim', email: 'robert.kim@healthplan.com', initials: 'RK', role: 'analyst', status: 'active', lastActive: '3 hours ago', permissions: ['Prior Auth', 'Claims'] },
    { id: '5', name: 'Emily Davis', email: 'emily.d@healthplan.com', initials: 'ED', role: 'user', status: 'active', lastActive: '1 day ago', permissions: ['View Only'] },
    { id: '6', name: 'Michael Brown', email: 'michael.b@contractor.com', initials: 'MB', role: 'user', status: 'pending', lastActive: 'Pending invite', permissions: ['Claims'] },
]

const roleLabels = {
    admin: { label: 'Administrator', icon: <Shield size={12} /> },
    manager: { label: 'Manager', icon: <Key size={12} /> },
    analyst: { label: 'Analyst', icon: <Search size={12} /> },
    user: { label: 'User', icon: <Users size={12} /> },
}

export default function UserManagement() {
    const [searchQuery, setSearchQuery] = useState('')
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState('user')

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

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

            {/* Action Bar */}
            <div className="user-actions">
                <div className="search-bar">
                    <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
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
                            <th>User</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Permissions</th>
                            <th>Last Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
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
                                    <span style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)' }}>
                                        {user.lastActive}
                                    </span>
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
