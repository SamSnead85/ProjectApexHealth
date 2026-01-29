import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FlaskRound,
    Plus,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Truck,
    MapPin,
    Calendar,
    User,
    FileText,
    Search,
    Filter
} from 'lucide-react'
import { GlassCard, Badge, Button } from '../components/common'
import './LabOrders.css'

interface LabOrder {
    id: string
    testName: string
    testCode: string
    status: 'ordered' | 'collected' | 'processing' | 'completed' | 'cancelled'
    orderedBy: string
    orderedDate: string
    collectionDate: string | null
    resultDate: string | null
    facility: string
    priority: 'routine' | 'stat' | 'urgent'
}

const labOrders: LabOrder[] = [
    { id: 'LAB-001', testName: 'Comprehensive Metabolic Panel', testCode: '80053', status: 'completed', orderedBy: 'Dr. Sarah Mitchell', orderedDate: '2024-01-20', collectionDate: '2024-01-21', resultDate: '2024-01-22', facility: 'Quest Diagnostics', priority: 'routine' },
    { id: 'LAB-002', testName: 'Complete Blood Count', testCode: '85025', status: 'processing', orderedBy: 'Dr. Sarah Mitchell', orderedDate: '2024-01-25', collectionDate: '2024-01-25', resultDate: null, facility: 'LabCorp', priority: 'routine' },
    { id: 'LAB-003', testName: 'Lipid Panel', testCode: '80061', status: 'collected', orderedBy: 'Dr. James Chen', orderedDate: '2024-01-24', collectionDate: '2024-01-26', resultDate: null, facility: 'Quest Diagnostics', priority: 'routine' },
    { id: 'LAB-004', testName: 'Hemoglobin A1C', testCode: '83036', status: 'ordered', orderedBy: 'Dr. Sarah Mitchell', orderedDate: '2024-01-26', collectionDate: null, resultDate: null, facility: 'Quest Diagnostics', priority: 'urgent' },
    { id: 'LAB-005', testName: 'Thyroid Panel', testCode: '84436', status: 'ordered', orderedBy: 'Dr. Emily Roberts', orderedDate: '2024-01-26', collectionDate: null, resultDate: null, facility: 'LabCorp', priority: 'stat' }
]

export function LabOrders() {
    const [orders] = useState<LabOrder[]>(labOrders)
    const [filterStatus, setFilterStatus] = useState<string>('all')

    const getStatusBadge = (status: LabOrder['status']) => {
        switch (status) {
            case 'ordered': return <Badge variant="info" icon={<Clock size={10} />}>Ordered</Badge>
            case 'collected': return <Badge variant="teal">Collected</Badge>
            case 'processing': return <Badge variant="warning" icon={<Clock size={10} />}>Processing</Badge>
            case 'completed': return <Badge variant="success" icon={<CheckCircle2 size={10} />}>Completed</Badge>
            case 'cancelled': return <Badge variant="critical">Cancelled</Badge>
        }
    }

    const getPriorityBadge = (priority: LabOrder['priority']) => {
        switch (priority) {
            case 'stat': return <Badge variant="critical" size="sm">STAT</Badge>
            case 'urgent': return <Badge variant="warning" size="sm">Urgent</Badge>
            default: return null
        }
    }

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus)

    return (
        <div className="lab-orders-page">
            {/* Header */}
            <div className="lab-orders__header">
                <div>
                    <h1 className="lab-orders__title">Lab Orders</h1>
                    <p className="lab-orders__subtitle">
                        Order and track laboratory tests
                    </p>
                </div>
                <Button variant="primary" icon={<Plus size={16} />}>
                    New Lab Order
                </Button>
            </div>

            {/* Stats */}
            <div className="lab-orders__stats">
                <GlassCard className="stat-card">
                    <FlaskRound size={20} />
                    <div>
                        <span className="stat-value">{orders.filter(o => o.status === 'ordered').length}</span>
                        <span className="stat-label">Pending Collection</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <Truck size={20} />
                    <div>
                        <span className="stat-value">{orders.filter(o => o.status === 'collected' || o.status === 'processing').length}</span>
                        <span className="stat-label">In Progress</span>
                    </div>
                </GlassCard>
                <GlassCard className="stat-card">
                    <CheckCircle2 size={20} />
                    <div>
                        <span className="stat-value">{orders.filter(o => o.status === 'completed').length}</span>
                        <span className="stat-label">Results Ready</span>
                    </div>
                </GlassCard>
            </div>

            {/* Filters */}
            <div className="lab-orders__filters">
                <div className="status-filters">
                    {['all', 'ordered', 'processing', 'completed'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="search-box">
                    <Search size={16} />
                    <input type="text" placeholder="Search orders..." />
                </div>
            </div>

            {/* Orders List */}
            <GlassCard className="orders-list">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Test</th>
                            <th>Priority</th>
                            <th>Ordered By</th>
                            <th>Facility</th>
                            <th>Ordered</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order, index) => (
                            <motion.tr
                                key={order.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <td className="order-id">{order.id}</td>
                                <td>
                                    <div className="test-info">
                                        <span className="test-name">{order.testName}</span>
                                        <span className="test-code">CPT: {order.testCode}</span>
                                    </div>
                                </td>
                                <td>{getPriorityBadge(order.priority)}</td>
                                <td>
                                    <div className="provider-info">
                                        <User size={12} />
                                        {order.orderedBy}
                                    </div>
                                </td>
                                <td>
                                    <div className="facility-info">
                                        <MapPin size={12} />
                                        {order.facility}
                                    </div>
                                </td>
                                <td>{new Date(order.orderedDate).toLocaleDateString()}</td>
                                <td>{getStatusBadge(order.status)}</td>
                                <td>
                                    <div className="order-actions">
                                        {order.status === 'completed' && (
                                            <Button variant="ghost" size="sm" icon={<FileText size={14} />}>
                                                View Results
                                            </Button>
                                        )}
                                        {order.status === 'ordered' && (
                                            <Button variant="secondary" size="sm">
                                                Schedule Collection
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    )
}

export default LabOrders
