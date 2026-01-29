import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ListTodo,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Timer,
    User,
    Calendar,
    FileText,
    ArrowRight,
    MoreHorizontal
} from 'lucide-react'
import './TaskQueue.css'

interface Task {
    id: string
    title: string
    type: string
    priority: 'urgent' | 'high' | 'normal' | 'low'
    assignee: { name: string; initials: string }
    dueDate: string
    age: string
    column: 'pending' | 'in-progress' | 'review' | 'completed'
}

const tasks: Task[] = [
    { id: 'CLM-28472', title: 'Review high-cost claim - $47,500 hospital stay', type: 'Claims', priority: 'urgent', assignee: { name: 'Sarah M.', initials: 'SM' }, dueDate: 'Today', age: '2h', column: 'pending' },
    { id: 'PA-9235', title: 'Prior auth request - MRI lumbar spine', type: 'Prior Auth', priority: 'high', assignee: { name: 'James C.', initials: 'JC' }, dueDate: 'Today', age: '4h', column: 'pending' },
    { id: 'ELG-1847', title: 'Dependent eligibility verification', type: 'Eligibility', priority: 'normal', assignee: { name: 'Linda T.', initials: 'LT' }, dueDate: 'Tomorrow', age: '1d', column: 'pending' },
    { id: 'CLM-28465', title: 'Claim reprocessing - duplicate payment', type: 'Claims', priority: 'high', assignee: { name: 'Sarah M.', initials: 'SM' }, dueDate: 'Today', age: '6h', column: 'in-progress' },
    { id: 'PA-9228', title: 'Surgery authorization - knee replacement', type: 'Prior Auth', priority: 'urgent', assignee: { name: 'James C.', initials: 'JC' }, dueDate: 'Today', age: '8h', column: 'in-progress' },
    { id: 'APL-0042', title: 'Member appeal review - denied claim', type: 'Appeals', priority: 'normal', assignee: { name: 'Robert K.', initials: 'RK' }, dueDate: 'Wed', age: '2d', column: 'review' },
    { id: 'CLM-28440', title: 'COB adjustment - primary payer update', type: 'Claims', priority: 'low', assignee: { name: 'Linda T.', initials: 'LT' }, dueDate: 'Thu', age: '3d', column: 'review' },
    { id: 'CLM-28412', title: 'Claim finalized - emergency room visit', type: 'Claims', priority: 'normal', assignee: { name: 'Sarah M.', initials: 'SM' }, dueDate: 'Completed', age: '-', column: 'completed' },
    { id: 'PA-9201', title: 'Prior auth approved - physical therapy', type: 'Prior Auth', priority: 'normal', assignee: { name: 'James C.', initials: 'JC' }, dueDate: 'Completed', age: '-', column: 'completed' },
]

const columns = [
    { id: 'pending', title: 'Pending', icon: <Clock size={14} /> },
    { id: 'in-progress', title: 'In Progress', icon: <Timer size={14} /> },
    { id: 'review', title: 'In Review', icon: <FileText size={14} /> },
    { id: 'completed', title: 'Completed', icon: <CheckCircle2 size={14} /> },
]

export default function TaskQueue() {
    const pendingCount = tasks.filter(t => t.column === 'pending').length
    const urgentCount = tasks.filter(t => t.priority === 'urgent').length
    const completedToday = tasks.filter(t => t.column === 'completed').length

    return (
        <div className="task-queue">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>
                    <ListTodo size={28} />
                    Task Queue
                </h1>
                <p className="page-subtitle">
                    Manage and track work items across claims, prior authorizations, and eligibility
                </p>
            </motion.div>

            {/* Stats */}
            <div className="queue-stats">
                <motion.div
                    className="queue-stat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-icon pending">
                        <Clock size={20} />
                    </div>
                    <div className="stat-info">
                        <h4>{pendingCount}</h4>
                        <span>Pending Tasks</span>
                    </div>
                </motion.div>

                <motion.div
                    className="queue-stat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="stat-icon urgent">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="stat-info">
                        <h4>{urgentCount}</h4>
                        <span>Urgent Items</span>
                    </div>
                </motion.div>

                <motion.div
                    className="queue-stat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon completed">
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="stat-info">
                        <h4>{completedToday}</h4>
                        <span>Completed Today</span>
                    </div>
                </motion.div>

                <motion.div
                    className="queue-stat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <div className="stat-icon avg">
                        <Timer size={20} />
                    </div>
                    <div className="stat-info">
                        <h4>4.2h</h4>
                        <span>Avg TAT</span>
                    </div>
                </motion.div>
            </div>

            {/* Kanban Board */}
            <motion.div
                className="queue-board"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                {columns.map((column) => {
                    const columnTasks = tasks.filter(t => t.column === column.id)
                    return (
                        <div key={column.id} className="queue-column">
                            <div className="column-header">
                                <div className="column-title">
                                    {column.icon}
                                    {column.title}
                                </div>
                                <span className="column-count">{columnTasks.length}</span>
                            </div>

                            {columnTasks.length === 0 ? (
                                <div className="empty-column">
                                    No tasks in this column
                                </div>
                            ) : (
                                columnTasks.map((task) => (
                                    <div key={task.id} className="task-card">
                                        <div className="task-header">
                                            <span className="task-id">{task.id}</span>
                                            <span className={`task-priority ${task.priority}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <div className="task-title">{task.title}</div>
                                        <div className="task-meta">
                                            <span><FileText size={10} /> {task.type}</span>
                                            <span><Calendar size={10} /> {task.dueDate}</span>
                                            {task.age !== '-' && <span><Clock size={10} /> {task.age}</span>}
                                        </div>
                                        <div className="task-assignee">
                                            <div className="assignee-avatar">{task.assignee.initials}</div>
                                            <span className="assignee-name">{task.assignee.name}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )
                })}
            </motion.div>
        </div>
    )
}
