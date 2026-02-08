import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Database, Search, Code, FileText, Play, Copy, Download,
    ChevronRight, ChevronDown, Check, AlertTriangle, Shield,
    Users, Heart, CreditCard, Building2, Stethoscope, FileJson,
    RefreshCw, Settings, ExternalLink, Zap, Eye, BookOpen,
    CheckCircle2, XCircle, ArrowRight, Braces, Package, Server
} from 'lucide-react'
import { GlassCard, Badge, Button, MetricCard } from '../components/common'
import './FHIRExplorer.css'

// ============================================================================
// FHIR EXPLORER - FHIR R4 Resource Browser & Tester
// Browse, search, and test FHIR R4 APIs with Da Vinci IG compliance
// ============================================================================

type ResourceType = 'Patient' | 'Coverage' | 'Claim' | 'ExplanationOfBenefit' | 'Practitioner' | 'Organization'

interface FHIRResource {
    type: ResourceType
    icon: typeof Database
    color: string
    searchParams: string[]
    count: number
}

interface SearchResult {
    id: string
    resourceType: string
    lastUpdated: string
    summary: string
    status?: string
}

interface DaVinciIG {
    name: string
    version: string
    status: 'compliant' | 'partial' | 'non_compliant'
    profiles: number
    operationsSupported: number
}

const fhirResources: FHIRResource[] = [
    { type: 'Patient', icon: Users, color: '#14b8a6', searchParams: ['_id', 'identifier', 'name', 'birthdate', 'gender', 'address'], count: 47892 },
    { type: 'Coverage', icon: Shield, color: '#3b82f6', searchParams: ['_id', 'beneficiary', 'status', 'type', 'period', 'payor'], count: 52341 },
    { type: 'Claim', icon: CreditCard, color: '#8b5cf6', searchParams: ['_id', 'patient', 'provider', 'status', 'created', 'use'], count: 234567 },
    { type: 'ExplanationOfBenefit', icon: FileText, color: '#f59e0b', searchParams: ['_id', 'patient', 'status', 'created', 'type', 'provider'], count: 198432 },
    { type: 'Practitioner', icon: Stethoscope, color: '#06b6d4', searchParams: ['_id', 'identifier', 'name', 'specialty', 'active'], count: 12456 },
    { type: 'Organization', icon: Building2, color: '#22c55e', searchParams: ['_id', 'identifier', 'name', 'type', 'address', 'active'], count: 3892 },
]

const sampleResults: Record<ResourceType, SearchResult[]> = {
    Patient: [
        { id: 'pat-847291', resourceType: 'Patient', lastUpdated: '2026-02-07T14:23:00Z', summary: 'Sarah Mitchell, F, DOB: 1985-03-15', status: 'active' },
        { id: 'pat-293847', resourceType: 'Patient', lastUpdated: '2026-02-07T12:45:00Z', summary: 'James Wilson, M, DOB: 1972-11-28', status: 'active' },
        { id: 'pat-558102', resourceType: 'Patient', lastUpdated: '2026-02-06T09:12:00Z', summary: 'Maria Rodriguez, F, DOB: 1990-07-04', status: 'active' },
    ],
    Coverage: [
        { id: 'cov-1001', resourceType: 'Coverage', lastUpdated: '2026-02-07T10:00:00Z', summary: 'Gold PPO - Sarah Mitchell', status: 'active' },
        { id: 'cov-1002', resourceType: 'Coverage', lastUpdated: '2026-02-06T16:30:00Z', summary: 'Silver HMO - James Wilson', status: 'active' },
    ],
    Claim: [
        { id: 'clm-98765', resourceType: 'Claim', lastUpdated: '2026-02-07T15:00:00Z', summary: 'Professional - $1,250.00 - Dr. Chen', status: 'active' },
        { id: 'clm-98764', resourceType: 'Claim', lastUpdated: '2026-02-07T14:30:00Z', summary: 'Institutional - $4,800.00 - City Hospital', status: 'active' },
    ],
    ExplanationOfBenefit: [
        { id: 'eob-44321', resourceType: 'ExplanationOfBenefit', lastUpdated: '2026-02-07T11:00:00Z', summary: 'EOB for Claim clm-98765 - Paid $987.50', status: 'active' },
    ],
    Practitioner: [
        { id: 'prc-112034', resourceType: 'Practitioner', lastUpdated: '2026-02-05T08:00:00Z', summary: 'Dr. Robert Chen, Orthopedics', status: 'active' },
        { id: 'prc-334521', resourceType: 'Practitioner', lastUpdated: '2026-02-04T09:00:00Z', summary: 'Dr. Emily Park, Cardiology', status: 'active' },
    ],
    Organization: [
        { id: 'org-5001', resourceType: 'Organization', lastUpdated: '2026-02-03T12:00:00Z', summary: 'City General Hospital', status: 'active' },
        { id: 'org-5002', resourceType: 'Organization', lastUpdated: '2026-02-03T12:00:00Z', summary: 'Apex Health Insurance Co.', status: 'active' },
    ],
}

const sampleJSON = `{
  "resourceType": "Patient",
  "id": "pat-847291",
  "meta": {
    "versionId": "3",
    "lastUpdated": "2026-02-07T14:23:00Z",
    "profile": [
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"
    ]
  },
  "identifier": [{
    "system": "https://apexhealth.com/member-id",
    "value": "AXP-847291"
  }],
  "active": true,
  "name": [{
    "use": "official",
    "family": "Mitchell",
    "given": ["Sarah", "J"]
  }],
  "gender": "female",
  "birthDate": "1985-03-15",
  "address": [{
    "use": "home",
    "line": ["123 Oak Street"],
    "city": "Austin",
    "state": "TX",
    "postalCode": "78701"
  }],
  "telecom": [{
    "system": "phone",
    "value": "512-555-0147",
    "use": "mobile"
  }]
}`

const daVinciIGs: DaVinciIG[] = [
    { name: 'PDex (Payer Data Exchange)', version: '2.0.0', status: 'compliant', profiles: 12, operationsSupported: 8 },
    { name: 'PCDE (Payer Coverage Decision Exchange)', version: '1.0.0', status: 'compliant', profiles: 6, operationsSupported: 4 },
    { name: 'HRex (Health Record Exchange)', version: '1.1.0', status: 'compliant', profiles: 8, operationsSupported: 5 },
    { name: 'PAS (Prior Auth Support)', version: '2.0.1', status: 'partial', profiles: 10, operationsSupported: 6 },
    { name: 'CDex (Clinical Data Exchange)', version: '2.0.0', status: 'partial', profiles: 7, operationsSupported: 4 },
    { name: 'DTR (Documentation Templates & Rules)', version: '1.1.0', status: 'non_compliant', profiles: 5, operationsSupported: 2 },
]

const conformanceInfo = {
    fhirVersion: '4.0.1',
    publisher: 'Apex Health Platform',
    date: '2026-02-01',
    resourceTypes: 42,
    interactions: ['read', 'vread', 'search', 'create', 'update', 'patch', 'delete'],
    formats: ['json', 'xml'],
    security: 'SMART on FHIR (OAuth 2.0)',
}

export default function FHIRExplorer() {
    const [selectedResource, setSelectedResource] = useState<ResourceType>('Patient')
    const [searchParams, setSearchParams] = useState<Record<string, string>>({})
    const [results, setResults] = useState<SearchResult[]>([])
    const [selectedResult, setSelectedResult] = useState<string | null>(null)
    const [showJSON, setShowJSON] = useState(false)
    const [customQuery, setCustomQuery] = useState('GET /fhir/Patient?name=Mitchell&_count=10')
    const [queryResult, setQueryResult] = useState('')
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showConformance, setShowConformance] = useState(false)
    const [bulkExporting, setBulkExporting] = useState(false)

    const handleSearch = useCallback(() => {
        setLoading(true)
        setTimeout(() => {
            setResults(sampleResults[selectedResource] || [])
            setLoading(false)
        }, 800)
    }, [selectedResource])

    const handleCustomQuery = useCallback(() => {
        setLoading(true)
        setTimeout(() => {
            setQueryResult(sampleJSON)
            setLoading(false)
        }, 1000)
    }, [])

    const handleCopy = useCallback((text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }, [])

    const handleBulkExport = useCallback(() => {
        setBulkExporting(true)
        setTimeout(() => setBulkExporting(false), 3000)
    }, [])

    const currentResource = fhirResources.find(r => r.type === selectedResource)!

    return (
        <div className="fhir-explorer">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="fe-header">
                    <div>
                        <h1 className="fe-title">
                            <Braces size={28} />
                            FHIR Explorer
                            <Badge variant="teal" icon={<Zap size={10} />}>R4 v4.0.1</Badge>
                        </h1>
                        <p className="fe-subtitle">Browse, search, and test FHIR R4 resources with Da Vinci IG compliance</p>
                    </div>
                    <div className="fe-header-actions">
                        <Button
                            variant="secondary"
                            icon={<Package size={16} />}
                            loading={bulkExporting}
                            onClick={handleBulkExport}
                        >
                            Bulk Export ($export)
                        </Button>
                        <Button
                            variant="ghost"
                            icon={<Server size={16} />}
                            onClick={() => setShowConformance(!showConformance)}
                        >
                            Conformance
                        </Button>
                    </div>
                </div>

                {/* Conformance Statement (collapsible) */}
                <AnimatePresence>
                    {showConformance && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <GlassCard className="fe-conformance">
                                <h3 className="fe-section-title">
                                    <Server size={18} />
                                    CapabilityStatement
                                </h3>
                                <div className="fe-conf-grid">
                                    <div className="fe-conf-item">
                                        <span className="fe-conf-label">FHIR Version</span>
                                        <span className="fe-conf-value">{conformanceInfo.fhirVersion}</span>
                                    </div>
                                    <div className="fe-conf-item">
                                        <span className="fe-conf-label">Publisher</span>
                                        <span className="fe-conf-value">{conformanceInfo.publisher}</span>
                                    </div>
                                    <div className="fe-conf-item">
                                        <span className="fe-conf-label">Resource Types</span>
                                        <span className="fe-conf-value">{conformanceInfo.resourceTypes}</span>
                                    </div>
                                    <div className="fe-conf-item">
                                        <span className="fe-conf-label">Security</span>
                                        <span className="fe-conf-value">{conformanceInfo.security}</span>
                                    </div>
                                    <div className="fe-conf-item">
                                        <span className="fe-conf-label">Supported Formats</span>
                                        <span className="fe-conf-value">{conformanceInfo.formats.join(', ')}</span>
                                    </div>
                                    <div className="fe-conf-item">
                                        <span className="fe-conf-label">Interactions</span>
                                        <span className="fe-conf-value">{conformanceInfo.interactions.join(', ')}</span>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Resource Type Selector */}
                <div className="fe-resource-selector">
                    {fhirResources.map((resource) => {
                        const Icon = resource.icon
                        return (
                            <motion.div
                                key={resource.type}
                                className={`fe-resource-card ${selectedResource === resource.type ? 'active' : ''}`}
                                onClick={() => { setSelectedResource(resource.type); setResults([]); setSelectedResult(null) }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{ '--resource-color': resource.color } as React.CSSProperties}
                            >
                                <div className="fe-resource-icon" style={{ background: `${resource.color}20`, color: resource.color }}>
                                    <Icon size={20} />
                                </div>
                                <span className="fe-resource-name">{resource.type}</span>
                                <span className="fe-resource-count">{resource.count.toLocaleString()}</span>
                            </motion.div>
                        )
                    })}
                </div>

                <div className="fe-layout">
                    {/* Search Panel */}
                    <div className="fe-search-panel">
                        <GlassCard className="fe-search-form">
                            <h3 className="fe-section-title">
                                <Search size={18} />
                                Search {selectedResource}
                            </h3>
                            <div className="fe-search-fields">
                                {currentResource.searchParams.map((param) => (
                                    <div key={param} className="fe-search-field">
                                        <label>{param}</label>
                                        <input
                                            type="text"
                                            placeholder={`Search by ${param}...`}
                                            value={searchParams[param] || ''}
                                            onChange={(e) => setSearchParams(prev => ({ ...prev, [param]: e.target.value }))}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="fe-search-actions">
                                <Button variant="primary" icon={<Search size={16} />} onClick={handleSearch} loading={loading && !queryResult}>
                                    Search
                                </Button>
                                <Button variant="ghost" icon={<RefreshCw size={16} />} onClick={() => { setSearchParams({}); setResults([]) }}>
                                    Clear
                                </Button>
                            </div>
                        </GlassCard>

                        {/* Search Results */}
                        <GlassCard className="fe-results">
                            <div className="fe-results-header">
                                <h3 className="fe-section-title">
                                    <FileJson size={18} />
                                    Results ({results.length})
                                </h3>
                            </div>
                            <div className="fe-results-list">
                                {results.length === 0 && !loading && (
                                    <div className="fe-empty">
                                        <Database size={32} />
                                        <p>Enter search parameters and click Search to find FHIR resources</p>
                                    </div>
                                )}
                                {results.map((result, index) => (
                                    <motion.div
                                        key={result.id}
                                        className={`fe-result-item ${selectedResult === result.id ? 'selected' : ''}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => { setSelectedResult(result.id); setShowJSON(true) }}
                                    >
                                        <div className="fe-result-main">
                                            <span className="fe-result-type">{result.resourceType}</span>
                                            <span className="fe-result-id">{result.id}</span>
                                        </div>
                                        <p className="fe-result-summary">{result.summary}</p>
                                        <div className="fe-result-meta">
                                            <span className="fe-result-updated">Updated: {new Date(result.lastUpdated).toLocaleString()}</span>
                                            {result.status && <Badge variant="success" size="sm">{result.status}</Badge>}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Right Panel */}
                    <div className="fe-detail-panel">
                        {/* JSON Viewer */}
                        <GlassCard className="fe-json-viewer">
                            <div className="fe-json-header">
                                <h3 className="fe-section-title">
                                    <Code size={18} />
                                    Resource Detail
                                </h3>
                                <div className="fe-json-actions">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={copied ? <Check size={14} /> : <Copy size={14} />}
                                        onClick={() => handleCopy(sampleJSON)}
                                    >
                                        {copied ? 'Copied' : 'Copy'}
                                    </Button>
                                    <Button variant="ghost" size="sm" icon={<Download size={14} />}>
                                        Download
                                    </Button>
                                </div>
                            </div>
                            <div className="fe-json-content">
                                <pre className="fe-json-code">
                                    <code>{showJSON ? sampleJSON : '// Select a resource from search results to view JSON'}</code>
                                </pre>
                            </div>
                        </GlassCard>

                        {/* Custom Query Panel */}
                        <GlassCard className="fe-custom-query">
                            <h3 className="fe-section-title">
                                <Play size={18} />
                                Test API
                            </h3>
                            <div className="fe-query-input">
                                <div className="fe-query-method">GET</div>
                                <input
                                    type="text"
                                    value={customQuery}
                                    onChange={(e) => setCustomQuery(e.target.value)}
                                    placeholder="GET /fhir/Patient?name=..."
                                />
                                <Button variant="primary" size="sm" icon={<Play size={14} />} onClick={handleCustomQuery} loading={loading && !!queryResult}>
                                    Run
                                </Button>
                            </div>
                            {queryResult && (
                                <div className="fe-query-result">
                                    <div className="fe-query-status">
                                        <Badge variant="success" size="sm">200 OK</Badge>
                                        <span className="fe-query-time">142ms</span>
                                    </div>
                                    <pre className="fe-json-code compact">
                                        <code>{queryResult.substring(0, 300)}...</code>
                                    </pre>
                                </div>
                            )}
                        </GlassCard>
                    </div>
                </div>

                {/* Da Vinci IG Compliance */}
                <GlassCard className="fe-davinci">
                    <div className="fe-section-header">
                        <h3 className="fe-section-title">
                            <BookOpen size={18} />
                            Da Vinci Implementation Guide Compliance
                        </h3>
                    </div>
                    <div className="fe-davinci-grid">
                        {daVinciIGs.map((ig, index) => (
                            <motion.div
                                key={ig.name}
                                className="fe-davinci-card"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="fe-davinci-header">
                                    <span className="fe-davinci-name">{ig.name}</span>
                                    <Badge
                                        variant={ig.status === 'compliant' ? 'success' : ig.status === 'partial' ? 'warning' : 'critical'}
                                        size="sm"
                                        icon={ig.status === 'compliant' ? <CheckCircle2 size={10} /> : ig.status === 'partial' ? <AlertTriangle size={10} /> : <XCircle size={10} />}
                                    >
                                        {ig.status === 'compliant' ? 'Compliant' : ig.status === 'partial' ? 'Partial' : 'Non-Compliant'}
                                    </Badge>
                                </div>
                                <div className="fe-davinci-meta">
                                    <span>v{ig.version}</span>
                                    <span>{ig.profiles} profiles</span>
                                    <span>{ig.operationsSupported} operations</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    )
}
