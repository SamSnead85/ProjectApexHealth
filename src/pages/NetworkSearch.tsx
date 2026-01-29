import { useState } from 'react'
import { GlassCard, Badge, Button } from '../components/common'
import { Search, MapPin, Phone, Clock, Star, Filter } from 'lucide-react'

const providers = [
    { id: 1, name: 'Dr. Sarah Mitchell', specialty: 'Family Medicine', address: '123 Health Blvd, Suite 100', phone: '(555) 123-4567', distance: '1.2 mi', rating: 4.8, accepting: true },
    { id: 2, name: 'Metro Urgent Care', specialty: 'Urgent Care', address: '456 Medical Center Dr', phone: '(555) 234-5678', distance: '2.5 mi', rating: 4.5, accepting: true },
    { id: 3, name: 'Dr. James Chen', specialty: 'Cardiology', address: '789 Heart Center Way', phone: '(555) 345-6789', distance: '3.8 mi', rating: 4.9, accepting: true },
    { id: 4, name: 'Children\'s Health Pediatrics', specialty: 'Pediatrics', address: '321 Kids Lane', phone: '(555) 456-7890', distance: '4.1 mi', rating: 4.7, accepting: false }
]

export function NetworkSearch() {
    const [search, setSearch] = useState('')

    return (
        <div style={{ padding: 'var(--space-xl)', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--apex-white)', marginBottom: 'var(--space-xs)' }}>Network Search</h1>
                <p style={{ color: 'var(--apex-steel)' }}>Find in-network providers near you</p>
            </div>
            <GlassCard style={{ display: 'flex', gap: 'var(--space-md)', padding: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-sm)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                    <Search size={16} style={{ color: 'var(--apex-steel)' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, specialty, or location..." style={{ flex: 1, background: 'none', border: 'none', color: 'var(--apex-white)', outline: 'none' }} />
                </div>
                <Button variant="secondary" icon={<Filter size={14} />}>Filters</Button>
                <Button variant="primary" icon={<Search size={14} />}>Search</Button>
            </GlassCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {providers.map(provider => (
                    <GlassCard key={provider.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', padding: 'var(--space-lg)' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', background: 'var(--apex-teal-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--apex-teal)' }}>{provider.name.charAt(0)}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: 'var(--apex-white)', marginBottom: 2 }}>{provider.name}</div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--apex-teal)', marginBottom: 'var(--space-xs)' }}>{provider.specialty}</div>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', fontSize: 'var(--text-sm)', color: 'var(--apex-steel)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {provider.distance}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={12} style={{ color: 'var(--apex-warning)' }} /> {provider.rating}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            {provider.accepting ? <Badge variant="success">Accepting Patients</Badge> : <Badge variant="warning">Not Accepting</Badge>}
                            <div style={{ marginTop: 'var(--space-sm)' }}><Button variant="secondary" size="sm">View Profile</Button></div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    )
}

export default NetworkSearch
