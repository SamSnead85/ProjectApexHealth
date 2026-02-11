import { useState } from 'react'
import { useNavigation } from '../context/NavigationContext'
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
    Clock,
    ArrowUpRight,
    Building2
} from 'lucide-react'
import { GlassCard, Button, Badge } from '../components/common'
import { useToast } from '../components/common/Toast'
import { exportToCSV } from '../utils/exportData'
import './Census.css'

// Mock census data
const employees = [
    { id: 1, name: 'John Martinez', email: 'john.m@company.com', department: 'Engineering', dependents: 3, hireDate: '2022-03-15', status: 'active', enrolled: true },
    { id: 2, name: 'Sarah Chen', email: 'sarah.c@company.com', department: 'Marketing', dependents: 2, hireDate: '2023-01-10', status: 'active', enrolled: true },
    { id: 3, name: 'Mike Johnson', email: 'mike.j@company.com', department: 'Sales', dependents: 4, hireDate: '2021-08-22', status: 'active', enrolled: false },
    { id: 4, name: 'Emily Davis', email: 'emily.d@company.com', department: 'HR', dependents: 1, hireDate: '2023-06-01', status: 'active', enrolled: true },
    { id: 5, name: 'Robert Williams', email: 'robert.w@company.com', department: 'Finance', dependents: 2, hireDate: '2020-11-15', status: 'terminated', enrolled: false },
    { id: 6, name: 'Lisa Anderson', email: 'lisa.a@company.com', department: 'Engineering', dependents: 0, hireDate: '2024-01-08', status: 'pending', enrolled: false },
]

export function Census() {
    const { navigate } = useNavigation()
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="census-management">
            {/* Header */}
            <motion.header
                className="cs__header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="cs__header-left">
                    <div className="cs__icon-container">
                        <Users size={28} />
                        <div className="cs__icon-pulse" />
                    </div>
                    <div>
                        <h1 className="cs__title">Employee Census</h1>
                        <p className="cs__subtitle">Manage employees and dependents</p>
                    </div>
                </div>
                <div className="cs__header-actions">
                    <Button variant="ghost" size="sm">
                        <Upload size={16} />
                        Import CSV
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                        exportToCSV(employees.map(e => ({
                            'Name': e.name,
                            'Email': e.email,
                            'Department': e.department,
                            'Dependents': e.dependents,
                            'Hire Date': e.hireDate,
                            'Status': e.status,
                            'Enrolled': e.enrolled ? 'Yes' : 'No',
                        })), 'census_export')
                        addToast({ type: 'success', title: 'Export Complete', message: 'Census data exported to CSV', duration: 3000 })
                    }}>
                        <Download size={16} />
                        Export
                    </Button>
                    <Button variant="primary" size="sm">
                        <UserPlus size={16} />
                        Add Employee
                    </Button>
                </div>
            </motion.header>

            {/* Metrics */}
            <div className="cs__metrics">
                {[
                    { label: 'Total Employees', value: '1,250', icon: Users, color: '#3b82f6' },
                    { label: 'Active', value: '1,245', icon: CheckCircle2, color: '#10b981' },
                    { label: 'Dependents', value: '2,170', icon: Users, color: '#8b5cf6' },
                    { label: 'Pending Changes', value: '12', icon: Clock, color: '#f59e0b' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="cs__stat-card"
                        style={{ '--stat-color': stat.color } as any}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                    >
                        <div className="cs__stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={20} />
                        </div>
                        <div className="cs__stat-content">
                            <div className="cs__stat-value">{stat.value}</div>
                            <div className="cs__stat-label">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Employee Table */}
            <motion.div
                className="cs__section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="cs__section-header">
                    <h2 className="cs__section-title">
                        <Users size={20} />
                        Employee Roster
                    </h2>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--apex-steel)' }} />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    padding: '8px 12px 8px 36px',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--apex-white)',
                                    fontSize: 'var(--text-sm)',
                                    width: 220
                                }}
                            />
                        </div>
                        <Button variant="ghost" size="sm"><Filter size={16} /></Button>
                    </div>
                </div>

                {/* Table Header */}
                <div className="cs__table-header">
                    <span>Employee</span>
                    <span>Department</span>
                    <span>Hire Date</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                {/* Employee Rows */}
                <div>
                    {filteredEmployees.map((emp, i) => (
                        <motion.div
                            key={emp.id}
                            className="cs__employee-row"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 + i * 0.03 }}
                        >
                            <div className="cs__employee-info">
                                <span className="cs__employee-name">{emp.name}</span>
                                <span className="cs__employee-id">{emp.email}</span>
                            </div>
                            <span className="cs__employee-dept">{emp.department}</span>
                            <span className="cs__employee-date">{emp.hireDate}</span>
                            <div>
                                <Badge variant={emp.status === 'active' ? 'success' : emp.status === 'pending' ? 'warning' : 'error'}>
                                    {emp.status}
                                </Badge>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                                <Button variant="ghost" size="sm"><Eye size={14} /></Button>
                                <Button variant="ghost" size="sm"><Edit2 size={14} /></Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}

export default Census
