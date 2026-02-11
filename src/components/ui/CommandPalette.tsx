import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Home,
    Users,
    FileText,
    Activity,
    Shield,
    Brain,
    BarChart3,
    DollarSign,
    Crown,
    Key,
    Palette,
    Stethoscope,
    HeartPulse,
    Code2,
    AlertTriangle,
    Calculator,
    Sparkles,
    Zap,
    ArrowRight,
    Clock,
    UserCheck,
    Receipt,
    Clipboard,
    FilePlus,
    Play,
    CheckCircle2,
    CreditCard,
    Network,
    Pill,
    MapPin,
    CalendarDays,
    Video,
    Wallet,
    Star,
    Globe,
    Workflow,
    BookOpen,
    Send,
    Download,
    RefreshCw,
    Eye,
    PlusCircle
} from 'lucide-react'
import './CommandPalette.css'

// ─── Types ──────────────────────────────────────────────────────────────

type SearchCategory = 'Pages' | 'Members' | 'Claims' | 'Providers' | 'Actions'

interface SearchResultItem {
    id: string
    title: string
    subtitle: string
    icon: React.ReactNode
    category: SearchCategory
    path?: string
    action?: () => void
    shortcut?: string[]
    badge?: string
    badgeType?: 'new' | 'ai' | 'urgent' | 'pending' | 'info'
}

// ─── Category Icons (for group headers) ─────────────────────────────────

const categoryMeta: Record<SearchCategory, { icon: React.ReactNode; color: string }> = {
    Pages:     { icon: <Globe size={14} />,      color: '#14b8a6' },
    Members:   { icon: <Users size={14} />,       color: '#818cf8' },
    Claims:    { icon: <Receipt size={14} />,     color: '#f59e0b' },
    Providers: { icon: <Stethoscope size={14} />, color: '#ec4899' },
    Actions:   { icon: <Zap size={14} />,         color: '#22c55e' },
}

// ─── Data: Pages ────────────────────────────────────────────────────────

const pageItems: SearchResultItem[] = [
    { id: 'p-exec',       title: 'Executive Dashboard',    subtitle: 'C-suite KPIs and strategic insights',         icon: <Crown size={18} />,         category: 'Pages', path: '/executive',             badge: 'New',  badgeType: 'new' },
    { id: 'p-cmd-center', title: 'Command Center',         subtitle: 'Real-time operational monitoring',            icon: <Activity size={18} />,      category: 'Pages', path: '/command-center' },
    { id: 'p-dashboard',  title: 'Dashboard',              subtitle: 'Overview and key metrics',                    icon: <Home size={18} />,          category: 'Pages', path: '/dashboard' },
    { id: 'p-claims',     title: 'Claims Processing',      subtitle: 'Submit, track, and manage claims',            icon: <Receipt size={18} />,       category: 'Pages', path: '/claims' },
    { id: 'p-prior-auth', title: 'Prior Authorization',    subtitle: 'Authorization requests and status',           icon: <Clipboard size={18} />,     category: 'Pages', path: '/prior-auth' },
    { id: 'p-denial',     title: 'Denial Management',      subtitle: 'Appeal tracking and analytics',               icon: <AlertTriangle size={18} />, category: 'Pages', path: '/denial-management' },
    { id: 'p-billing',    title: 'Billing & Disputes',     subtitle: 'Payment disputes and resolution',             icon: <DollarSign size={18} />,    category: 'Pages', path: '/billing-disputes' },
    { id: 'p-payment',    title: 'Payment History',        subtitle: 'Transaction records and receipts',            icon: <CreditCard size={18} />,    category: 'Pages', path: '/payment-history' },
    { id: 'p-eob',        title: 'EOB Viewer',             subtitle: 'Explanation of Benefits documents',           icon: <FileText size={18} />,      category: 'Pages', path: '/eob' },
    { id: 'p-cost',       title: 'Cost Estimator',         subtitle: 'Estimate procedure and treatment costs',      icon: <Calculator size={18} />,    category: 'Pages', path: '/cost-estimator' },
    { id: 'p-network',    title: 'Network Search',         subtitle: 'Find in-network providers',                   icon: <Network size={18} />,       category: 'Pages', path: '/network-search' },
    { id: 'p-findcare',   title: 'Find Care',              subtitle: 'Locate facilities and specialists',           icon: <MapPin size={18} />,        category: 'Pages', path: '/find-care' },
    { id: 'p-telehealth', title: 'Telehealth',             subtitle: 'Virtual visits and consultations',            icon: <Video size={18} />,         category: 'Pages', path: '/telehealth' },
    { id: 'p-pharmacy',   title: 'Pharmacy',               subtitle: 'Prescription management and pricing',         icon: <Pill size={18} />,          category: 'Pages', path: '/pharmacy' },
    { id: 'p-appts',      title: 'Appointments',           subtitle: 'Schedule and manage appointments',            icon: <CalendarDays size={18} />,  category: 'Pages', path: '/appointments' },
    { id: 'p-wellness',   title: 'Wellness Center',        subtitle: 'Health programs and activity tracking',       icon: <HeartPulse size={18} />,    category: 'Pages', path: '/wellness' },
    { id: 'p-care-team',  title: 'Care Team',              subtitle: 'Your assigned care providers',                icon: <UserCheck size={18} />,     category: 'Pages', path: '/care-team' },
    { id: 'p-hsa',        title: 'HSA Wallet',             subtitle: 'Health savings account management',           icon: <Wallet size={18} />,        category: 'Pages', path: '/hsa-wallet' },
    { id: 'p-digital-id', title: 'Digital ID Card',        subtitle: 'View and share your insurance card',          icon: <CreditCard size={18} />,    category: 'Pages', path: '/digital-id' },
    { id: 'p-plan-docs',  title: 'Plan Documents',         subtitle: 'Benefits booklets and plan details',          icon: <BookOpen size={18} />,      category: 'Pages', path: '/plan-documents' },
    { id: 'p-coverage',   title: 'Coverage Comparison',    subtitle: 'Compare plan options side by side',           icon: <BarChart3 size={18} />,     category: 'Pages', path: '/coverage-comparison' },
    { id: 'p-member',     title: 'Member Portal',          subtitle: 'Personalized member services',                icon: <Users size={18} />,         category: 'Pages', path: '/member-portal' },
    { id: 'p-sir',        title: 'Performance Intelligence', subtitle: 'Healthcare analytics command center',       icon: <BarChart3 size={18} />,     category: 'Pages', path: '/sir',                  badge: 'New',  badgeType: 'new' },
    { id: 'p-star',       title: 'Star Ratings',           subtitle: 'CMS quality star rating tracking',            icon: <Star size={18} />,          category: 'Pages', path: '/star-ratings' },
    { id: 'p-reports',    title: 'Custom Report Builder',  subtitle: 'Build and schedule custom reports',           icon: <BarChart3 size={18} />,     category: 'Pages', path: '/reports' },
    { id: 'p-edi',        title: 'EDI Manager',            subtitle: 'Electronic data interchange management',      icon: <Send size={18} />,          category: 'Pages', path: '/edi' },
    { id: 'p-fhir',       title: 'FHIR Explorer',          subtitle: 'Healthcare interoperability resources',       icon: <Code2 size={18} />,         category: 'Pages', path: '/fhir',                 badge: 'API',  badgeType: 'info' },
    { id: 'p-workflow',   title: 'Workflow Builder',        subtitle: 'Automate operational workflows',              icon: <Workflow size={18} />,      category: 'Pages', path: '/workflow-builder' },
    { id: 'p-doc-intel',  title: 'Document Intelligence',  subtitle: 'AI-powered document processing',              icon: <FileText size={18} />,      category: 'Pages', path: '/document-intelligence', badge: 'AI', badgeType: 'ai' },
    { id: 'p-claims-pred',title: 'Claims Prediction',      subtitle: 'AI forecasting and risk analysis',            icon: <Brain size={18} />,         category: 'Pages', path: '/claims-prediction',     badge: 'AI', badgeType: 'ai' },
    { id: 'p-fraud',      title: 'Fraud Detection',        subtitle: 'Anomaly detection and case management',       icon: <AlertTriangle size={18} />, category: 'Pages', path: '/fraud-detection',       badge: 'AI', badgeType: 'ai' },
    { id: 'p-social',     title: 'Social Determinants',    subtitle: 'SDOH screening and community resources',      icon: <Globe size={18} />,         category: 'Pages', path: '/social-determinants' },
    { id: 'p-sso',        title: 'SSO Configuration',      subtitle: 'Identity and authentication setup',           icon: <Key size={18} />,           category: 'Pages', path: '/sso',                  shortcut: ['⌘', 'S', 'S'] },
    { id: 'p-brand',      title: 'Branding Settings',      subtitle: 'White-label customization options',           icon: <Palette size={18} />,       category: 'Pages', path: '/branding' },
    { id: 'p-audit',      title: 'Audit Dashboard',        subtitle: 'Security and compliance logs',                icon: <Shield size={18} />,        category: 'Pages', path: '/audit' },
]

// ─── Data: Members ──────────────────────────────────────────────────────

const memberItems: SearchResultItem[] = [
    { id: 'm-001', title: 'John Smith',         subtitle: 'ID: MBR-001 · PPO Gold · Active',            icon: <Users size={18} />,    category: 'Members', path: '/member-360?id=MBR-001' },
    { id: 'm-002', title: 'Maria Garcia',       subtitle: 'ID: MBR-002 · HMO Silver · Active',          icon: <Users size={18} />,    category: 'Members', path: '/member-360?id=MBR-002' },
    { id: 'm-003', title: 'David Chen',         subtitle: 'ID: MBR-003 · PPO Platinum · Active',        icon: <Users size={18} />,    category: 'Members', path: '/member-360?id=MBR-003' },
    { id: 'm-004', title: 'Sarah Johnson',      subtitle: 'ID: MBR-004 · EPO Bronze · Active',          icon: <Users size={18} />,    category: 'Members', path: '/member-360?id=MBR-004' },
    { id: 'm-005', title: 'James Wilson',       subtitle: 'ID: MBR-005 · PPO Gold · Inactive',          icon: <Users size={18} />,    category: 'Members', path: '/member-360?id=MBR-005',   badge: 'Inactive', badgeType: 'pending' },
    { id: 'm-006', title: 'Emily Davis',        subtitle: 'ID: MBR-006 · HMO Gold · Active',            icon: <Users size={18} />,    category: 'Members', path: '/member-360?id=MBR-006' },
    { id: 'm-007', title: 'Robert Martinez',    subtitle: 'ID: MBR-007 · POS Standard · Active',        icon: <Users size={18} />,    category: 'Members', path: '/member-360?id=MBR-007' },
    { id: 'm-008', title: 'Lisa Thompson',      subtitle: 'ID: MBR-008 · PPO Gold · Active',            icon: <Users size={18} />,    category: 'Members', path: '/member-360?id=MBR-008' },
    { id: 'm-009', title: 'Michael Brown',      subtitle: 'ID: MBR-009 · HMO Silver · Active',          icon: <Users size={18} />,    category: 'Members', path: '/member-360?id=MBR-009' },
    { id: 'm-010', title: 'Jennifer Lee',       subtitle: 'ID: MBR-010 · EPO Platinum · Active',        icon: <Users size={18} />,    category: 'Members', path: '/member-360?id=MBR-010' },
]

// ─── Data: Claims ───────────────────────────────────────────────────────

const claimItems: SearchResultItem[] = [
    { id: 'c-001', title: 'Claim #CLM-2024-001', subtitle: '$2,450.00 · Cardiology Consult · Approved',           icon: <Receipt size={18} />, category: 'Claims', path: '/claims?id=CLM-2024-001',   badge: 'Approved',  badgeType: 'new' },
    { id: 'c-002', title: 'Claim #CLM-2024-002', subtitle: '$8,750.00 · Knee Replacement · In Review',            icon: <Receipt size={18} />, category: 'Claims', path: '/claims?id=CLM-2024-002',   badge: 'In Review', badgeType: 'pending' },
    { id: 'c-003', title: 'Claim #CLM-2024-003', subtitle: '$320.00 · Lab Work Panel · Approved',                 icon: <Receipt size={18} />, category: 'Claims', path: '/claims?id=CLM-2024-003',   badge: 'Approved',  badgeType: 'new' },
    { id: 'c-004', title: 'Claim #CLM-2024-004', subtitle: '$1,200.00 · MRI Scan · Denied',                       icon: <Receipt size={18} />, category: 'Claims', path: '/claims?id=CLM-2024-004',   badge: 'Denied',    badgeType: 'urgent' },
    { id: 'c-005', title: 'Claim #CLM-2024-005', subtitle: '$5,600.00 · Emergency Room Visit · Approved',         icon: <Receipt size={18} />, category: 'Claims', path: '/claims?id=CLM-2024-005',   badge: 'Approved',  badgeType: 'new' },
    { id: 'c-006', title: 'Claim #CLM-2024-006', subtitle: '$450.00 · Physical Therapy (x6) · In Review',         icon: <Receipt size={18} />, category: 'Claims', path: '/claims?id=CLM-2024-006',   badge: 'In Review', badgeType: 'pending' },
    { id: 'c-007', title: 'Claim #CLM-2024-007', subtitle: '$175.00 · Dermatology Visit · Approved',              icon: <Receipt size={18} />, category: 'Claims', path: '/claims?id=CLM-2024-007',   badge: 'Approved',  badgeType: 'new' },
    { id: 'c-008', title: 'Claim #CLM-2024-008', subtitle: '$3,200.00 · Outpatient Surgery · Pending',            icon: <Receipt size={18} />, category: 'Claims', path: '/claims?id=CLM-2024-008',   badge: 'Pending',   badgeType: 'pending' },
]

// ─── Data: Providers ────────────────────────────────────────────────────

const providerItems: SearchResultItem[] = [
    { id: 'pr-001', title: 'Dr. Sarah Chen',          subtitle: 'Cardiology · Cedar Valley Medical · In-Network',           icon: <Stethoscope size={18} />, category: 'Providers', path: '/network-search?id=PR-001' },
    { id: 'pr-002', title: 'Dr. James Rodriguez',     subtitle: 'Orthopedic Surgery · Summit Ortho · In-Network',           icon: <Stethoscope size={18} />, category: 'Providers', path: '/network-search?id=PR-002' },
    { id: 'pr-003', title: 'Dr. Emily Watson',        subtitle: 'Primary Care · Greenfield Clinic · In-Network',            icon: <Stethoscope size={18} />, category: 'Providers', path: '/network-search?id=PR-003' },
    { id: 'pr-004', title: 'Dr. Michael Park',        subtitle: 'Dermatology · Skin Health Center · In-Network',            icon: <Stethoscope size={18} />, category: 'Providers', path: '/network-search?id=PR-004' },
    { id: 'pr-005', title: 'Dr. Rachel Green',        subtitle: 'Psychiatry · Mindful Health · In-Network',                 icon: <Stethoscope size={18} />, category: 'Providers', path: '/network-search?id=PR-005' },
    { id: 'pr-006', title: 'Dr. David Kim',           subtitle: 'Neurology · BrainCare Institute · In-Network',             icon: <Stethoscope size={18} />, category: 'Providers', path: '/network-search?id=PR-006' },
    { id: 'pr-007', title: 'Dr. Amanda Foster',       subtitle: 'Pediatrics · Kids First Medical · In-Network',             icon: <Stethoscope size={18} />, category: 'Providers', path: '/network-search?id=PR-007' },
    { id: 'pr-008', title: 'Dr. Robert Chang',        subtitle: 'Oncology · Regional Cancer Center · Out-of-Network',       icon: <Stethoscope size={18} />, category: 'Providers', path: '/network-search?id=PR-008', badge: 'OON', badgeType: 'urgent' },
]

// ─── Data: Actions ──────────────────────────────────────────────────────

const actionItems: SearchResultItem[] = [
    { id: 'a-001', title: 'File New Claim',             subtitle: 'Submit a new insurance claim',                icon: <FilePlus size={18} />,     category: 'Actions', path: '/claims?action=new',         shortcut: ['⌘', 'N'] },
    { id: 'a-002', title: 'Run Report',                 subtitle: 'Generate a custom analytics report',          icon: <Play size={18} />,         category: 'Actions', path: '/reports?action=new' },
    { id: 'a-003', title: 'Check Eligibility',          subtitle: 'Verify member benefit eligibility',           icon: <CheckCircle2 size={18} />, category: 'Actions', path: '/claims?action=eligibility', shortcut: ['⌘', 'E'] },
    { id: 'a-004', title: 'Schedule Appointment',       subtitle: 'Book a new appointment',                      icon: <CalendarDays size={18} />, category: 'Actions', path: '/appointments?action=new' },
    { id: 'a-005', title: 'Start Telehealth Visit',     subtitle: 'Launch a virtual consultation',                icon: <Video size={18} />,        category: 'Actions', path: '/telehealth?action=start' },
    { id: 'a-006', title: 'Request Prior Authorization', subtitle: 'Submit a new prior auth request',             icon: <Clipboard size={18} />,    category: 'Actions', path: '/prior-auth?action=new' },
    { id: 'a-007', title: 'Appeal Denied Claim',        subtitle: 'Start a claim appeal process',                icon: <AlertTriangle size={18} />,category: 'Actions', path: '/denial-management?action=appeal' },
    { id: 'a-008', title: 'Export Data',                 subtitle: 'Download reports and data extracts',          icon: <Download size={18} />,     category: 'Actions', path: '/reports?action=export',      shortcut: ['⌘', 'D'] },
    { id: 'a-009', title: 'Refresh Dashboard',          subtitle: 'Reload dashboard data and metrics',           icon: <RefreshCw size={18} />,    category: 'Actions', path: '/dashboard',                  shortcut: ['⌘', 'R'] },
    { id: 'a-010', title: 'View Notifications',         subtitle: 'Check alerts and system notifications',       icon: <Eye size={18} />,          category: 'Actions', path: '/notifications' },
    { id: 'a-011', title: 'Add New Member',             subtitle: 'Enroll a new member in a plan',               icon: <PlusCircle size={18} />,   category: 'Actions', path: '/member-portal?action=enroll' },
    { id: 'a-012', title: 'Send Secure Message',        subtitle: 'Message a provider or care team',             icon: <Send size={18} />,         category: 'Actions', path: '/care-team?action=message' },
]

// ─── Combine All Items ──────────────────────────────────────────────────

const allSearchItems: SearchResultItem[] = [
    ...pageItems,
    ...memberItems,
    ...claimItems,
    ...providerItems,
    ...actionItems,
]

// ─── Recent Searches (persisted) ────────────────────────────────────────

const RECENT_SEARCHES_KEY = 'apex-command-palette-recent'
const MAX_RECENT = 4

function getRecentSearches(): string[] {
    try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

function saveRecentSearch(term: string) {
    try {
        const recent = getRecentSearches().filter(s => s !== term)
        recent.unshift(term)
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
    } catch { /* ignore */ }
}

// ─── Quick Actions (always visible at bottom) ───────────────────────────

const quickActions = [
    { id: 'qa-1', label: 'File Claim',   icon: <FilePlus size={14} />,     path: '/claims?action=new' },
    { id: 'qa-2', label: 'Find Care',    icon: <MapPin size={14} />,       path: '/find-care' },
    { id: 'qa-3', label: 'Run Report',   icon: <BarChart3 size={14} />,    path: '/reports?action=new' },
    { id: 'qa-4', label: 'Telehealth',   icon: <Video size={14} />,        path: '/telehealth?action=start' },
    { id: 'qa-5', label: 'Check Eligibility', icon: <CheckCircle2 size={14} />, path: '/claims?action=eligibility' },
]

// ─── Search Logic ───────────────────────────────────────────────────────

const CATEGORY_ORDER: SearchCategory[] = ['Pages', 'Members', 'Claims', 'Providers', 'Actions']
const MAX_PER_CATEGORY = 5

function searchItems(query: string): SearchResultItem[] {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return allSearchItems.filter(
        item =>
            item.title.toLowerCase().includes(q) ||
            item.subtitle.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
    )
}

function groupByCategory(items: SearchResultItem[]): Record<SearchCategory, SearchResultItem[]> {
    const grouped: Record<string, SearchResultItem[]> = {}
    for (const cat of CATEGORY_ORDER) grouped[cat] = []
    for (const item of items) {
        if (grouped[item.category]) {
            grouped[item.category].push(item)
        }
    }
    return grouped as Record<SearchCategory, SearchResultItem[]>
}

// ─── Memoized Search Result Item ─────────────────────────────────────

interface SearchResultRowProps {
    item: SearchResultItem
    idx: number
    isSelected: boolean
    metaColor: string
    query: string
    onSelect: (item: SearchResultItem) => void
    onHover: (idx: number) => void
}

const SearchResultRow = memo(function SearchResultRow({
    item, idx, isSelected, metaColor, query, onSelect, onHover,
}: SearchResultRowProps) {
    return (
        <div
            key={item.id}
            className={`cp-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(item)}
            onMouseEnter={() => onHover(idx)}
        >
            <div className="cp-item-icon" style={{ color: metaColor }}>
                {item.icon}
            </div>
            <div className="cp-item-content">
                <div className="cp-item-title">{highlightMatch(item.title, query)}</div>
                <div className="cp-item-subtitle">{highlightMatch(item.subtitle, query)}</div>
            </div>
            <div className="cp-item-right">
                {item.badge && (
                    <span className={`cp-badge ${item.badgeType || ''}`}>
                        {item.badgeType === 'ai' && <Brain size={10} />}
                        {item.badge}
                    </span>
                )}
                {item.shortcut ? (
                    <div className="cp-shortcut">
                        {item.shortcut.map((key, i) => (
                            <kbd key={i}>{key}</kbd>
                        ))}
                    </div>
                ) : (
                    isSelected && (
                        <span className="cp-enter-hint">
                            <kbd>↵</kbd>
                        </span>
                    )
                )}
            </div>
        </div>
    )
})

function highlightMatch(text: string, q: string): React.ReactNode {
    if (!q.trim()) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
        <>
            {text.slice(0, idx)}
            <mark className="cp-highlight">{text.slice(idx, idx + q.length)}</mark>
            {text.slice(idx + q.length)}
        </>
    )
}

// ─── Component ──────────────────────────────────────────────────────────

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
    onNavigate: (path: string) => void
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const resultsRef = useRef<HTMLDivElement>(null)

    // ─── Derived state (memoized to avoid recomputation) ─────────────

    const hasQuery = query.trim().length > 0
    const searchResults = useMemo(() => searchItems(query), [query])
    const grouped = useMemo(() => groupByCategory(searchResults), [searchResults])

    // Build flat list (capped per category for readability)
    const flatResults = useMemo(() => {
        const results: SearchResultItem[] = []
        for (const cat of CATEGORY_ORDER) {
            const items = grouped[cat]
            if (items.length > 0) {
                results.push(...items.slice(0, MAX_PER_CATEGORY))
            }
        }
        return results
    }, [grouped])

    const totalResults = flatResults.length

    // ─── Keyboard navigation ────────────────────────────────────────────

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose()
            return
        }

        if (!hasQuery && e.key === 'Enter') return

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => (prev + 1) % (totalResults || 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => (prev - 1 + (totalResults || 1)) % (totalResults || 1))
        } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
            const item = flatResults[selectedIndex]
            saveRecentSearch(query.trim())
            if (item.path) {
                onNavigate(item.path)
            }
            onClose()
        }
    }, [flatResults, selectedIndex, totalResults, hasQuery, query, onClose, onNavigate])

    // ─── Effects ────────────────────────────────────────────────────────

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus()
            setQuery('')
            setSelectedIndex(0)
            setRecentSearches(getRecentSearches())
            document.addEventListener('keydown', handleKeyDown)
        }
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, handleKeyDown])

    useEffect(() => {
        setSelectedIndex(0)
    }, [query])

    // Scroll selected item into view
    useEffect(() => {
        if (!resultsRef.current) return
        const selected = resultsRef.current.querySelector('.cp-item.selected')
        if (selected) {
            selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
    }, [selectedIndex])

    // ─── Handlers ───────────────────────────────────────────────────────

    const handleSelect = (item: SearchResultItem) => {
        if (hasQuery) saveRecentSearch(query.trim())
        if (item.path) onNavigate(item.path)
        onClose()
    }

    const handleRecentClick = (term: string) => {
        setQuery(term)
    }

    const handleQuickAction = (path: string) => {
        onNavigate(path)
        onClose()
    }

    // ─── Render helpers ─────────────────────────────────────────────────

    // Precompute category offsets for flat index mapping
    const categoryOffsets = useMemo(() => {
        const offsets: Record<string, number> = {}
        let offset = 0
        for (const cat of CATEGORY_ORDER) {
            offsets[cat] = offset
            const items = grouped[cat]
            if (items.length > 0) {
                offset += Math.min(items.length, MAX_PER_CATEGORY)
            }
        }
        return offsets
    }, [grouped])

    function renderCategoryGroup(cat: SearchCategory, items: SearchResultItem[]) {
        if (items.length === 0) return null
        const capped = items.slice(0, MAX_PER_CATEGORY)
        const meta = categoryMeta[cat]
        const remaining = items.length - MAX_PER_CATEGORY
        const baseIndex = categoryOffsets[cat]

        return (
            <div key={cat} className="cp-group">
                <div className="cp-group-header">
                    <span className="cp-group-icon" style={{ color: meta.color }}>{meta.icon}</span>
                    <span className="cp-group-label">{cat}</span>
                    <span className="cp-group-count">{items.length} result{items.length !== 1 ? 's' : ''}</span>
                </div>
                {capped.map((item, i) => (
                    <SearchResultRow
                        key={item.id}
                        item={item}
                        idx={baseIndex + i}
                        isSelected={baseIndex + i === selectedIndex}
                        metaColor={meta.color}
                        query={query}
                        onSelect={handleSelect}
                        onHover={setSelectedIndex}
                    />
                ))}
                {remaining > 0 && (
                    <div className="cp-more-results">
                        +{remaining} more in {cat}
                    </div>
                )}
            </div>
        )
    }

    // ─── Render ─────────────────────────────────────────────────────────

    if (!isOpen) return null

    return createPortal(
        <div className="command-palette-overlay" onClick={onClose}>
            <motion.div
                className="command-palette"
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.15 }}
            >
                {/* Search Input */}
                <div className="command-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="command-input"
                        placeholder="Search pages, members, claims, providers..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <div className="command-shortcut">
                        <kbd>esc</kbd>
                    </div>
                </div>

                {/* AI Search Hint */}
                {query.length > 2 && (
                    <div className="ai-search-hint">
                        <Sparkles size={16} className="ai-icon" />
                        Press <kbd>Tab</kbd> to ask AI about "{query}"
                    </div>
                )}

                {/* Results Area */}
                <div className="command-results" ref={resultsRef}>

                    {/* ── Empty query: show recent searches ── */}
                    {!hasQuery && (
                        <>
                            {recentSearches.length > 0 && (
                                <div className="cp-group cp-recent-group">
                                    <div className="cp-group-header">
                                        <span className="cp-group-icon" style={{ color: '#94a3b8' }}><Clock size={14} /></span>
                                        <span className="cp-group-label">Recent Searches</span>
                                    </div>
                                    {recentSearches.map((term, i) => (
                                        <div
                                            key={`recent-${i}`}
                                            className="cp-item cp-recent-item"
                                            onClick={() => handleRecentClick(term)}
                                        >
                                            <div className="cp-item-icon" style={{ color: '#94a3b8' }}>
                                                <Clock size={18} />
                                            </div>
                                            <div className="cp-item-content">
                                                <div className="cp-item-title">{term}</div>
                                            </div>
                                            <div className="cp-item-right">
                                                <ArrowRight size={14} className="cp-arrow" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Suggested categories when empty */}
                            <div className="cp-group">
                                <div className="cp-group-header">
                                    <span className="cp-group-icon" style={{ color: '#14b8a6' }}><Sparkles size={14} /></span>
                                    <span className="cp-group-label">Suggested</span>
                                </div>
                                {pageItems.slice(0, 6).map((item) => (
                                    <div
                                        key={item.id}
                                        className="cp-item"
                                        onClick={() => handleSelect(item)}
                                    >
                                        <div className="cp-item-icon" style={{ color: categoryMeta.Pages.color }}>
                                            {item.icon}
                                        </div>
                                        <div className="cp-item-content">
                                            <div className="cp-item-title">{item.title}</div>
                                            <div className="cp-item-subtitle">{item.subtitle}</div>
                                        </div>
                                        {item.badge && (
                                            <span className={`cp-badge ${item.badgeType || ''}`}>
                                                {item.badgeType === 'ai' && <Brain size={10} />}
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ── Query with no results ── */}
                    {hasQuery && totalResults === 0 && (
                        <div className="command-empty">
                            <div className="command-empty-icon">
                                <Search size={24} />
                            </div>
                            <h4>No results for "{query}"</h4>
                            <p>Try searching for a page name, member, claim, or provider</p>
                        </div>
                    )}

                    {/* ── Query with results ── */}
                    {hasQuery && totalResults > 0 && (
                        <>
                            <div className="cp-results-summary">
                                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} across {CATEGORY_ORDER.filter(c => grouped[c].length > 0).length} categories
                            </div>
                            {CATEGORY_ORDER.map(cat => renderCategoryGroup(cat, grouped[cat]))}
                        </>
                    )}
                </div>

                {/* Quick Actions Bar */}
                <div className="cp-quick-actions">
                    <span className="cp-quick-label">Quick Actions</span>
                    <div className="cp-quick-list">
                        {quickActions.map(qa => (
                            <button
                                key={qa.id}
                                className="cp-quick-btn"
                                onClick={() => handleQuickAction(qa.path)}
                            >
                                {qa.icon}
                                <span>{qa.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="command-footer">
                    <div className="footer-hints">
                        <span className="footer-hint">
                            <kbd>↑</kbd><kbd>↓</kbd> Navigate
                        </span>
                        <span className="footer-hint">
                            <kbd>↵</kbd> Select
                        </span>
                        <span className="footer-hint">
                            <kbd>esc</kbd> Close
                        </span>
                    </div>
                    <div className="footer-branding">
                        <Zap size={12} />
                        Powered by Apex AI
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    )
}
