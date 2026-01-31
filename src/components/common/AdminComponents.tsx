import { ReactNode, useState, useEffect, useMemo, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, User, Users, Key, Lock, Unlock, Eye, EyeOff, Check, X, AlertTriangle, Settings, Trash2, Edit2, Plus, Search, ChevronRight, Crown, UserPlus, Ban, Activity, History, Copy, RefreshCw } from 'lucide-react'
import './AdminComponents.css'

// User Management Table
interface AdminUser {
    id: string
    name: string
    email: string
    role: 'admin' | 'moderator' | 'user'
    status: 'active' | 'inactive' | 'suspended'
    avatar?: string
    lastLogin?: Date
    createdAt: Date
}

interface UserManagementProps {
    users: AdminUser[]
    onEdit?: (user: AdminUser) => void
    onDelete?: (id: string) => void
    onStatusChange?: (id: string, status: AdminUser['status']) => void
    onRoleChange?: (id: string, role: AdminUser['role']) => void
    className?: string
}

export function UserManagement({
    users,
    onEdit,
    onDelete,
    onStatusChange,
    onRoleChange,
    className = ''
}: UserManagementProps) {
    const [search, setSearch] = useState('')
    const [filterRole, setFilterRole] = useState<string>('all')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    const filtered = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())
            const matchesRole = filterRole === 'all' || u.role === filterRole
            const matchesStatus = filterStatus === 'all' || u.status === filterStatus
            return matchesSearch && matchesRole && matchesStatus
        })
    }, [users, search, filterRole, filterStatus])

    const roleColors = {
        admin: '#f59e0b',
        moderator: '#8b5cf6',
        user: 'var(--apex-teal)'
    }

    const statusColors = {
        active: '#10b981',
        inactive: 'var(--apex-steel)',
        suspended: '#ef4444'
    }

    return (
        <div className={`user-management ${className}`}>
            <div className="user-management__header">
                <div className="user-management__search">
                    <Search size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                    />
                </div>

                <div className="user-management__filters">
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="user">User</option>
                    </select>

                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            <div className="user-management__table">
                <div className="user-management__row user-management__row--header">
                    <div className="user-management__cell">User</div>
                    <div className="user-management__cell">Role</div>
                    <div className="user-management__cell">Status</div>
                    <div className="user-management__cell">Last Login</div>
                    <div className="user-management__cell">Actions</div>
                </div>

                {filtered.map(user => (
                    <div key={user.id} className="user-management__row">
                        <div className="user-management__cell user-management__user">
                            <div className="user-management__avatar">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} />
                                ) : (
                                    <span>{user.name.charAt(0)}</span>
                                )}
                            </div>
                            <div>
                                <span className="user-management__name">{user.name}</span>
                                <span className="user-management__email">{user.email}</span>
                            </div>
                        </div>

                        <div className="user-management__cell">
                            <select
                                value={user.role}
                                onChange={(e) => onRoleChange?.(user.id, e.target.value as AdminUser['role'])}
                                style={{ color: roleColors[user.role] }}
                            >
                                <option value="admin">Admin</option>
                                <option value="moderator">Moderator</option>
                                <option value="user">User</option>
                            </select>
                        </div>

                        <div className="user-management__cell">
                            <select
                                value={user.status}
                                onChange={(e) => onStatusChange?.(user.id, e.target.value as AdminUser['status'])}
                                className={`user-management__status user-management__status--${user.status}`}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>

                        <div className="user-management__cell">
                            {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                        </div>

                        <div className="user-management__cell user-management__actions">
                            <button onClick={() => onEdit?.(user)} title="Edit">
                                <Edit2 size={14} />
                            </button>
                            <button onClick={() => onDelete?.(user.id)} title="Delete" className="danger">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="user-management__footer">
                Showing {filtered.length} of {users.length} users
            </div>
        </div>
    )
}

// Permission Matrix
interface Permission {
    id: string
    name: string
    description?: string
}

interface Role {
    id: string
    name: string
    permissions: string[]
}

interface PermissionMatrixProps {
    permissions: Permission[]
    roles: Role[]
    onPermissionToggle?: (roleId: string, permissionId: string) => void
    className?: string
}

export function PermissionMatrix({
    permissions,
    roles,
    onPermissionToggle,
    className = ''
}: PermissionMatrixProps) {
    return (
        <div className={`permission-matrix ${className}`}>
            <div className="permission-matrix__table">
                <div className="permission-matrix__row permission-matrix__row--header">
                    <div className="permission-matrix__cell permission-matrix__cell--permission">Permission</div>
                    {roles.map(role => (
                        <div key={role.id} className="permission-matrix__cell permission-matrix__cell--role">
                            {role.name}
                        </div>
                    ))}
                </div>

                {permissions.map(permission => (
                    <div key={permission.id} className="permission-matrix__row">
                        <div className="permission-matrix__cell permission-matrix__cell--permission">
                            <span className="permission-matrix__permission-name">{permission.name}</span>
                            {permission.description && (
                                <span className="permission-matrix__permission-desc">{permission.description}</span>
                            )}
                        </div>
                        {roles.map(role => (
                            <div key={role.id} className="permission-matrix__cell permission-matrix__cell--toggle">
                                <button
                                    className={`permission-matrix__toggle ${role.permissions.includes(permission.id) ? 'active' : ''}`}
                                    onClick={() => onPermissionToggle?.(role.id, permission.id)}
                                >
                                    {role.permissions.includes(permission.id) ? (
                                        <Check size={14} />
                                    ) : (
                                        <X size={14} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

// API Key Manager
interface APIKey {
    id: string
    name: string
    key: string
    prefix: string
    scopes: string[]
    lastUsed?: Date
    expiresAt?: Date
    createdAt: Date
}

interface APIKeyManagerProps {
    keys: APIKey[]
    onRevoke?: (id: string) => void
    onRefresh?: (id: string) => void
    onCreate?: () => void
    className?: string
}

export function APIKeyManager({
    keys,
    onRevoke,
    onRefresh,
    onCreate,
    className = ''
}: APIKeyManagerProps) {
    const [showKey, setShowKey] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const copyKey = async (key: APIKey) => {
        await navigator.clipboard.writeText(key.key)
        setCopiedId(key.id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const maskKey = (key: string) => {
        return key.slice(0, 8) + '•'.repeat(24) + key.slice(-4)
    }

    return (
        <div className={`api-key-manager ${className}`}>
            <div className="api-key-manager__header">
                <h4><Key size={18} /> API Keys</h4>
                {onCreate && (
                    <button className="api-key-manager__create" onClick={onCreate}>
                        <Plus size={14} /> Create Key
                    </button>
                )}
            </div>

            <div className="api-key-manager__list">
                {keys.map(key => (
                    <div key={key.id} className="api-key-manager__item">
                        <div className="api-key-manager__item-header">
                            <span className="api-key-manager__item-name">{key.name}</span>
                            <span className="api-key-manager__item-prefix">{key.prefix}</span>
                        </div>

                        <div className="api-key-manager__item-key">
                            <code>{showKey === key.id ? key.key : maskKey(key.key)}</code>
                            <button onClick={() => setShowKey(showKey === key.id ? null : key.id)}>
                                {showKey === key.id ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button onClick={() => copyKey(key)}>
                                {copiedId === key.id ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>

                        <div className="api-key-manager__item-meta">
                            <span>Scopes: {key.scopes.join(', ')}</span>
                            {key.lastUsed && <span>Last used: {key.lastUsed.toLocaleDateString()}</span>}
                            {key.expiresAt && <span>Expires: {key.expiresAt.toLocaleDateString()}</span>}
                        </div>

                        <div className="api-key-manager__item-actions">
                            {onRefresh && (
                                <button onClick={() => onRefresh(key.id)}>
                                    <RefreshCw size={14} /> Regenerate
                                </button>
                            )}
                            {onRevoke && (
                                <button className="danger" onClick={() => onRevoke(key.id)}>
                                    <Ban size={14} /> Revoke
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Audit Log
interface AuditEntry {
    id: string
    action: string
    user: string
    target?: string
    details?: string
    ip?: string
    timestamp: Date
    severity?: 'info' | 'warning' | 'error'
}

interface AuditLogProps {
    entries: AuditEntry[]
    onEntryClick?: (entry: AuditEntry) => void
    className?: string
}

export function AuditLog({ entries, onEntryClick, className = '' }: AuditLogProps) {
    const severityIcons = {
        info: Activity,
        warning: AlertTriangle,
        error: X
    }

    return (
        <div className={`audit-log ${className}`}>
            <div className="audit-log__header">
                <h4><History size={18} /> Audit Log</h4>
            </div>

            <div className="audit-log__list">
                {entries.map(entry => {
                    const Icon = severityIcons[entry.severity || 'info']
                    return (
                        <div
                            key={entry.id}
                            className={`audit-log__entry audit-log__entry--${entry.severity || 'info'}`}
                            onClick={() => onEntryClick?.(entry)}
                        >
                            <div className="audit-log__entry-icon">
                                <Icon size={14} />
                            </div>
                            <div className="audit-log__entry-content">
                                <div className="audit-log__entry-header">
                                    <span className="audit-log__entry-action">{entry.action}</span>
                                    <span className="audit-log__entry-time">
                                        {entry.timestamp.toLocaleString()}
                                    </span>
                                </div>
                                <div className="audit-log__entry-details">
                                    <span className="audit-log__entry-user">{entry.user}</span>
                                    {entry.target && (
                                        <span className="audit-log__entry-target">→ {entry.target}</span>
                                    )}
                                </div>
                                {entry.details && (
                                    <p className="audit-log__entry-desc">{entry.details}</p>
                                )}
                                {entry.ip && (
                                    <span className="audit-log__entry-ip">IP: {entry.ip}</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default { UserManagement, PermissionMatrix, APIKeyManager, AuditLog }
