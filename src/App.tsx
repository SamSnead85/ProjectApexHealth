import { useState, useEffect, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Shell } from './components/layout'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { ThemeProvider } from './context/ThemeContext'
import { NavigationProvider } from './context/NavigationContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/common/Toast'
import { lazyWithSkeleton } from './utils/performance'
// Non-page components loaded eagerly (always visible in shell)
import CommandPalette from './components/ui/CommandPalette'
import AICopilot from './components/ai/AICopilot'
import { DemoTour } from './components/common/DemoTour'
import { OnboardingWelcome } from './components/common/OnboardingWelcome'
import { CollaborationBar } from './components/common/CollaborationBar'
import { KeyboardShortcuts } from './components/common/KeyboardShortcuts'

// ═══════════════════════════════════════════════════════════════
// Lazy-loaded page components - only loaded when navigated to.
// Reduces initial bundle from ~1.8MB to under 500KB.
// ═══════════════════════════════════════════════════════════════

// Core Pages
const Landing = lazyWithSkeleton(() => import('./pages/Landing'))
const Dashboard = lazyWithSkeleton(() => import('./pages/Dashboard'))
const WorkflowBuilder = lazyWithSkeleton(() => import('./pages/WorkflowBuilder'))
const Analytics = lazyWithSkeleton(() => import('./pages/Analytics'))
const Claims = lazyWithSkeleton(() => import('./pages/Claims'))
const MemberPortal = lazyWithSkeleton(() => import('./pages/MemberPortal'))
const FindCare = lazyWithSkeleton(() => import('./pages/FindCare'))
const BrokerPortal = lazyWithSkeleton(() => import('./pages/BrokerPortal'))
const EmployerPortal = lazyWithSkeleton(() => import('./pages/EmployerPortal'))
const AgencyPortal = lazyWithSkeleton(() => import('./pages/AgencyPortal'))
const AuditTrail = lazyWithSkeleton(() => import('./pages/AuditTrail'))
const Commissions = lazyWithSkeleton(() => import('./pages/Commissions'))
const Quoting = lazyWithSkeleton(() => import('./pages/Quoting'))
const Enrollment = lazyWithSkeleton(() => import('./pages/Enrollment'))
const Billing = lazyWithSkeleton(() => import('./pages/Billing'))
const Census = lazyWithSkeleton(() => import('./pages/Census'))
const Settings = lazyWithSkeleton(() => import('./pages/Settings'))
const PlanConfiguration = lazyWithSkeleton(() => import('./pages/PlanConfiguration'))
const Eligibility = lazyWithSkeleton(() => import('./pages/Eligibility'))
const ClaimsProcessing = lazyWithSkeleton(() => import('./pages/ClaimsProcessing'))
const PriorAuthorization = lazyWithSkeleton(() => import('./pages/PriorAuthorization'))
const ProviderDirectory = lazyWithSkeleton(() => import('./pages/ProviderDirectory'))
const CostEstimator = lazyWithSkeleton(() => import('./pages/CostEstimator'))
const EOBViewer = lazyWithSkeleton(() => import('./pages/EOBViewer'))
const MemberHome = lazyWithSkeleton(() => import('./pages/MemberHome'))
const HSAWallet = lazyWithSkeleton(() => import('./pages/HSAWallet'))
const MessageCenter = lazyWithSkeleton(() => import('./pages/MessageCenter'))
const Notifications = lazyWithSkeleton(() => import('./pages/Notifications'))
const Reports = lazyWithSkeleton(() => import('./pages/Reports'))
const Pharmacy = lazyWithSkeleton(() => import('./pages/Pharmacy'))
const Telehealth = lazyWithSkeleton(() => import('./pages/Telehealth'))
const Documents = lazyWithSkeleton(() => import('./pages/Documents'))
const CareTeam = lazyWithSkeleton(() => import('./pages/CareTeam'))
const Wellness = lazyWithSkeleton(() => import('./pages/Wellness'))
const Appointments = lazyWithSkeleton(() => import('./pages/Appointments'))
const BenefitsSummary = lazyWithSkeleton(() => import('./pages/BenefitsSummary'))
// Extended Feature Pages
const Appeals = lazyWithSkeleton(() => import('./pages/Appeals'))
const PaymentProcessing = lazyWithSkeleton(() => import('./pages/PaymentProcessing'))
const NetworkManagement = lazyWithSkeleton(() => import('./pages/NetworkManagement'))
const ProviderCredentialing = lazyWithSkeleton(() => import('./pages/ProviderCredentialing'))
const MemberIDCard = lazyWithSkeleton(() => import('./pages/MemberIDCard'))
const RiskAdjustment = lazyWithSkeleton(() => import('./pages/RiskAdjustment'))
const UtilizationManagement = lazyWithSkeleton(() => import('./pages/UtilizationManagement'))
const CareCoordination = lazyWithSkeleton(() => import('./pages/CareCoordination'))
const QualityMetrics = lazyWithSkeleton(() => import('./pages/QualityMetrics'))
const ComplianceDashboard = lazyWithSkeleton(() => import('./pages/ComplianceDashboard'))
const MemberOutreach = lazyWithSkeleton(() => import('./pages/MemberOutreach'))
const PremiumBilling = lazyWithSkeleton(() => import('./pages/PremiumBilling'))
const ActuarialTools = lazyWithSkeleton(() => import('./pages/ActuarialTools'))
const GroupEnrollment = lazyWithSkeleton(() => import('./pages/GroupEnrollment'))
const ProviderPortal = lazyWithSkeleton(() => import('./pages/ProviderPortal'))
// Phase 11-15 Pages
const PlanDocuments = lazyWithSkeleton(() => import('./pages/PlanDocuments'))
const CoverageComparison = lazyWithSkeleton(() => import('./pages/CoverageComparison'))
const NetworkSearch = lazyWithSkeleton(() => import('./pages/NetworkSearch'))
const PaymentHistory = lazyWithSkeleton(() => import('./pages/PaymentHistory'))
const AgingReports = lazyWithSkeleton(() => import('./pages/AgingReports'))
const RefundProcessing = lazyWithSkeleton(() => import('./pages/RefundProcessing'))
const BillingDisputes = lazyWithSkeleton(() => import('./pages/BillingDisputes'))
const SecureMessaging = lazyWithSkeleton(() => import('./pages/SecureMessaging'))
const SMSNotifications = lazyWithSkeleton(() => import('./pages/SMSNotifications'))
const EmailTemplates = lazyWithSkeleton(() => import('./pages/EmailTemplates'))
const PushNotifications = lazyWithSkeleton(() => import('./pages/PushNotifications'))
const MemberSurveys = lazyWithSkeleton(() => import('./pages/MemberSurveys'))
const CredentialingPortal = lazyWithSkeleton(() => import('./pages/CredentialingPortal'))
const ContractNegotiation = lazyWithSkeleton(() => import('./pages/ContractNegotiation'))
const NetworkAdequacy = lazyWithSkeleton(() => import('./pages/NetworkAdequacy'))
const FeeScheduleManagement = lazyWithSkeleton(() => import('./pages/FeeScheduleManagement'))
const ProviderEnrollment = lazyWithSkeleton(() => import('./pages/ProviderEnrollment'))
const CustomReportBuilder = lazyWithSkeleton(() => import('./pages/CustomReportBuilder'))
const ScheduledReports = lazyWithSkeleton(() => import('./pages/ScheduledReports'))
const ExecutiveDashboards = lazyWithSkeleton(() => import('./pages/ExecutiveDashboards'))
const DataExports = lazyWithSkeleton(() => import('./pages/DataExports'))
const KPITracking = lazyWithSkeleton(() => import('./pages/KPITracking'))
const SIRDashboard = lazyWithSkeleton(() => import('./pages/SIRDashboard'))
const IBNRActuarial = lazyWithSkeleton(() => import('./pages/IBNRActuarial'))
const PharmacyAnalytics = lazyWithSkeleton(() => import('./pages/PharmacyAnalytics'))
const PopulationHealth = lazyWithSkeleton(() => import('./pages/PopulationHealth'))
const EmployerAdmin = lazyWithSkeleton(() => import('./pages/EmployerAdmin'))
const NetworkAnalytics = lazyWithSkeleton(() => import('./pages/NetworkAnalytics'))
// Enhancement Modules
const DocumentIntelligence = lazyWithSkeleton(() => import('./pages/DocumentIntelligence'))
const Member360 = lazyWithSkeleton(() => import('./pages/Member360'))
const RegulatoryHub = lazyWithSkeleton(() => import('./pages/RegulatoryHub'))
const StopLossManagement = lazyWithSkeleton(() => import('./pages/StopLossManagement'))
const CarrierVendorPortal = lazyWithSkeleton(() => import('./pages/CarrierVendorPortal'))
const FiduciaryDashboard = lazyWithSkeleton(() => import('./pages/FiduciaryDashboard'))
// AI-Powered Features
const ClaimsPrediction = lazyWithSkeleton(() => import('./pages/ClaimsPrediction'))
const FraudDetection = lazyWithSkeleton(() => import('./pages/FraudDetection'))
const BenefitCalculator = lazyWithSkeleton(() => import('./pages/BenefitCalculator'))
// Analytics Modules
const ValueBasedCare = lazyWithSkeleton(() => import('./pages/ValueBasedCare'))
const ProviderPerformance = lazyWithSkeleton(() => import('./pages/ProviderPerformance'))
// Enterprise Modules
const SSOConfiguration = lazyWithSkeleton(() => import('./pages/SSOConfiguration'))
const BrandingSettings = lazyWithSkeleton(() => import('./pages/BrandingSettings'))
const ClinicalDecisionSupport = lazyWithSkeleton(() => import('./pages/ClinicalDecisionSupport'))
const APIManagement = lazyWithSkeleton(() => import('./pages/APIManagement'))
const AuditDashboard = lazyWithSkeleton(() => import('./pages/AuditDashboard'))
const CareManagement = lazyWithSkeleton(() => import('./pages/CareManagement'))
// Boardroom Ready Features
const ExecutiveDashboard = lazyWithSkeleton(() => import('./pages/ExecutiveDashboard'))
const BoardReportGenerator = lazyWithSkeleton(() => import('./pages/BoardReportGenerator'))
// Operational Completeness
const NotificationCenter = lazyWithSkeleton(() => import('./pages/NotificationCenter'))
const TaskQueue = lazyWithSkeleton(() => import('./pages/TaskQueue'))
const UserManagement = lazyWithSkeleton(() => import('./pages/UserManagement'))
// System Monitoring
const SystemHealth = lazyWithSkeleton(() => import('./pages/SystemHealth'))
const BatchDashboard = lazyWithSkeleton(() => import('./pages/BatchDashboard'))
const ActivityFeed = lazyWithSkeleton(() => import('./pages/ActivityFeed'))
// Data Integration & Member Experience
const EDIManager = lazyWithSkeleton(() => import('./pages/EDIManager'))
const DigitalIDCard = lazyWithSkeleton(() => import('./pages/DigitalIDCard'))
const WebhookConfig = lazyWithSkeleton(() => import('./pages/WebhookConfig'))
// Award-Winning UX Modules
const DataVisualizationStudio = lazyWithSkeleton(() => import('./pages/DataVisualizationStudio'))
const IntegrationMarketplace = lazyWithSkeleton(() => import('./pages/IntegrationMarketplace'))
const BenchmarkAnalytics = lazyWithSkeleton(() => import('./pages/BenchmarkAnalytics'))
// Compliance & Data Integration
const ComplianceCenter = lazyWithSkeleton(() => import('./pages/ComplianceCenter'))
const DataIntegrationHub = lazyWithSkeleton(() => import('./pages/DataIntegrationHub'))
// Strategic Module Additions
const CareJourneyNavigator = lazyWithSkeleton(() => import('./pages/CareJourneyNavigator'))
const OONClaimsWizard = lazyWithSkeleton(() => import('./pages/OONClaimsWizard'))
const HealthConcierge = lazyWithSkeleton(() => import('./pages/HealthConcierge'))
const AgentAssistDashboard = lazyWithSkeleton(() => import('./pages/AgentAssistDashboard'))
const AdvancedAnalytics = lazyWithSkeleton(() => import('./pages/AdvancedAnalytics'))
const CommandCenter = lazyWithSkeleton(() => import('./pages/CommandCenter'))
// Enterprise Modules - Voice, FHIR, Compliance, Module Management
const VoiceAgentBuilder = lazyWithSkeleton(() => import('./pages/VoiceAgentBuilder'))
const VoiceAgentMonitor = lazyWithSkeleton(() => import('./pages/VoiceAgentMonitor'))
const CallCenterDashboard = lazyWithSkeleton(() => import('./pages/CallCenterDashboard'))
const FHIRExplorer = lazyWithSkeleton(() => import('./pages/FHIRExplorer'))
const ModuleLicensing = lazyWithSkeleton(() => import('./pages/ModuleLicensing'))
const BreachResponse = lazyWithSkeleton(() => import('./pages/BreachResponse'))
const DataRetention = lazyWithSkeleton(() => import('./pages/DataRetention'))
// Premium Enhancement Modules
const StarRatings = lazyWithSkeleton(() => import('./pages/StarRatings'))
const DenialManagement = lazyWithSkeleton(() => import('./pages/DenialManagement'))
const SocialDeterminants = lazyWithSkeleton(() => import('./pages/SocialDeterminants'))
// Missing pages - now registered
const CertificationHub = lazyWithSkeleton(() => import('./pages/CertificationHub'))
const ROIDashboard = lazyWithSkeleton(() => import('./pages/ROIDashboard'))
const RevenueAnalytics = lazyWithSkeleton(() => import('./pages/RevenueAnalytics'))
const PayerContracts = lazyWithSkeleton(() => import('./pages/PayerContracts'))
const ImagingResults = lazyWithSkeleton(() => import('./pages/ImagingResults'))
const LabOrders = lazyWithSkeleton(() => import('./pages/LabOrders'))
const ConsentManagement = lazyWithSkeleton(() => import('./pages/ConsentManagement'))
const MedicalRecords = lazyWithSkeleton(() => import('./pages/MedicalRecords'))
const DocumentUpload = lazyWithSkeleton(() => import('./pages/DocumentUpload'))
const ScheduledReportsConfig = lazyWithSkeleton(() => import('./pages/ScheduledReportsConfig'))

type PortalType = 'admin' | 'broker' | 'employer' | 'member'
type AppState = 'landing' | 'authenticated'

function App() {
    const [appState, setAppState] = useState<AppState>('landing')
    const [activePortal, setActivePortal] = useState<PortalType>('admin')
    const [activePath, setActivePath] = useState('/admin')
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
    const [demoTourOpen, setDemoTourOpen] = useState(false)
    const [shortcutsOpen, setShortcutsOpen] = useState(false)
    const [onboardingOpen, setOnboardingOpen] = useState(() => {
        return !localStorage.getItem('apex_onboarding_dismissed')
    })

    // Global keyboard shortcut for Command Palette (⌘+K) and Shortcuts (?)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setCommandPaletteOpen(prev => !prev)
            }
            // '?' opens keyboard shortcuts dialog (only when not typing in an input)
            const tag = (e.target as HTMLElement)?.tagName
            if (e.key === '?' && !e.metaKey && !e.ctrlKey && tag !== 'INPUT' && tag !== 'TEXTAREA' && !(e.target as HTMLElement)?.isContentEditable) {
                e.preventDefault()
                setShortcutsOpen(prev => !prev)
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleLogin = (portal: PortalType) => {
        setActivePortal(portal)
        // Check if there's a stored path from module navigation
        const storedPath = sessionStorage.getItem('apex_initial_path')
        if (storedPath) {
            setActivePath(storedPath)
            sessionStorage.removeItem('apex_initial_path')
        } else {
            setActivePath(`/${portal}`)
        }
        setAppState('authenticated')
    }

    const handleNavigate = (path: string) => {
        setActivePath(path)
    }

    // Switch portal in demo mode - updates sidebar and navigates to portal home
    const handleSwitchPortal = (portal: PortalType) => {
        setActivePortal(portal)
        setActivePath(`/${portal}`)
    }

    const handleLogout = () => {
        setAppState('landing')
        setActivePortal('admin')
        setActivePath('/admin')
    }

    // Landing Page
    if (appState === 'landing') {
        return (
            <ToastProvider>
                <Landing onLogin={handleLogin} />
            </ToastProvider>
        )
    }

    // ============================================================
    // ROLE-BASED DIRECT PORTAL ROUTING
    // Single-portal users get focused experience without sidebar
    // ============================================================

    // Member Portal - Direct focused experience (no Shell/sidebar)
    if (activePortal === 'member') {
        return (
            <ThemeProvider>
                <ToastProvider>
                    <MemberPortal onLogout={handleLogout} />
                </ToastProvider>
            </ThemeProvider>
        )
    }

    // Broker Portal - Direct agency dashboard (no Shell/sidebar)
    if (activePortal === 'broker') {
        return (
            <ThemeProvider>
                <ToastProvider>
                    <BrokerPortal onLogout={handleLogout} />
                </ToastProvider>
            </ThemeProvider>
        )
    }


    // Determine which page to render based on path
    const renderPage = () => {
        // Premium Enhancement Modules
        if (activePath.includes('/star-ratings') || activePath.includes('/hedis-dashboard')) {
            return <StarRatings />
        }
        if (activePath.includes('/denial-management') || activePath.includes('/denials') || activePath.includes('/denial-center')) {
            return <DenialManagement />
        }
        if (activePath.includes('/social-determinants') || activePath.includes('/sdoh') || activePath.includes('/social-risk')) {
            return <SocialDeterminants />
        }
        // Strategic Module Additions - Premium Implementation
        if (activePath.includes('/care-journey') || activePath.includes('/care-timeline') || activePath.includes('/journey')) {
            return <CareJourneyNavigator />
        }
        if (activePath.includes('/oon-claims') || activePath.includes('/out-of-network') || activePath.includes('/submit-claim')) {
            return <OONClaimsWizard />
        }
        if (activePath.includes('/health-concierge') || activePath.includes('/ai-concierge') || activePath.includes('/concierge')) {
            return <HealthConcierge />
        }
        if (activePath.includes('/agent-assist') || activePath.includes('/advocate') || activePath.includes('/csr-dashboard')) {
            return <AgentAssistDashboard />
        }
        // Command Center - Modular Dashboard
        if (activePath.includes('/command-center') || activePath.includes('/module-hub') || activePath.includes('/dashboard-home')) {
            return <CommandCenter portal={activePortal} onLogout={handleLogout} />
        }
        // Compliance & Data Integration Modules
        if (activePath.includes('/compliance-center') || activePath.includes('/compliance/center') || activePath.includes('/aca-compliance')) {
            return <ComplianceCenter />
        }

        if (activePath.includes('/data-integration') || activePath.includes('/integration-hub') || activePath.includes('/data/integration')) {
            return <DataIntegrationHub />
        }
        // Enhancement Modules - Phase 1-6
        if (activePath.includes('/document-intelligence') || activePath.includes('/ai-documents') || activePath.includes('/ocr')) {
            return <DocumentIntelligence />
        }
        if (activePath.includes('/member-360') || activePath.includes('/member-view') || activePath.includes('/unified-member')) {
            return <Member360 />
        }
        if (activePath.includes('/regulatory-hub') || activePath.includes('/regulatory-command') || activePath.includes('/reg-feed')) {
            return <RegulatoryHub />
        }
        if (activePath.includes('/stop-loss') || activePath.includes('/stoploss') || activePath.includes('/attachment')) {
            return <StopLossManagement />
        }
        if (activePath.includes('/carrier-portal') || activePath.includes('/vendor-portal') || activePath.includes('/edi-monitor')) {
            return <CarrierVendorPortal />
        }
        if (activePath.includes('/fiduciary') || activePath.includes('/erisa') || activePath.includes('/fee-benchmark')) {
            return <FiduciaryDashboard />
        }
        // AI-Powered Features
        if (activePath.includes('/claims-prediction') || activePath.includes('/ai-claims') || activePath.includes('/forecast')) {
            return <ClaimsPrediction />
        }
        if (activePath.includes('/fraud-detection') || activePath.includes('/fraud') || activePath.includes('/anomaly')) {
            return <FraudDetection />
        }
        if (activePath.includes('/benefit-calculator') || activePath.includes('/cost-calc') || activePath.includes('/estimator')) {
            return <BenefitCalculator />
        }
        // Analytics Modules
        if (activePath.includes('/value-based-care') || activePath.includes('/vbc') || activePath.includes('/quality-measures')) {
            return <ValueBasedCare />
        }
        if (activePath.includes('/provider-performance') || activePath.includes('/provider-scorecard') || activePath.includes('/provider-analytics')) {
            return <ProviderPerformance />
        }
        // Enterprise Modules
        if (activePath.includes('/sso') || activePath.includes('/identity') || activePath.includes('/authentication')) {
            return <SSOConfiguration />
        }
        if (activePath.includes('/branding') || activePath.includes('/white-label') || activePath.includes('/theming')) {
            return <BrandingSettings />
        }
        if (activePath.includes('/clinical-decision') || activePath.includes('/cds') || activePath.includes('/care-gaps')) {
            return <ClinicalDecisionSupport />
        }
        if (activePath.includes('/api-management') || activePath.includes('/developer') || activePath.includes('/api-keys')) {
            return <APIManagement />
        }
        if (activePath.includes('/audit') || activePath.includes('/security-log') || activePath.includes('/activity-log')) {
            return <AuditDashboard />
        }
        if (activePath.includes('/care-management') || activePath.includes('/care-coordination') || activePath.includes('/patient-care')) {
            return <CareManagement />
        }
        // Boardroom Ready Features
        if (activePath.includes('/executive') || activePath.includes('/c-suite') || activePath.includes('/exec-dashboard')) {
            return <ExecutiveDashboard />
        }
        if (activePath.includes('/board-report') || activePath.includes('/report-generator') || activePath.includes('/reports')) {
            return <BoardReportGenerator />
        }
        // Operational Completeness
        if (activePath.includes('/notifications') || activePath.includes('/alerts') || activePath.includes('/notification-center')) {
            return <NotificationCenter />
        }
        if (activePath.includes('/task-queue') || activePath.includes('/work-queue') || activePath.includes('/tasks')) {
            return <TaskQueue />
        }
        if (activePath.includes('/user-management') || activePath.includes('/users') || activePath.includes('/roles')) {
            return <UserManagement />
        }
        // System Monitoring
        if (activePath.includes('/system-health') || activePath.includes('/status') || activePath.includes('/health')) {
            return <SystemHealth />
        }
        if (activePath.includes('/batch') || activePath.includes('/jobs') || activePath.includes('/processing')) {
            return <BatchDashboard />
        }
        if (activePath.includes('/activity-feed') || activePath.includes('/activity') || activePath.includes('/feed')) {
            return <ActivityFeed />
        }
        // Data Integration & Member Experience
        if (activePath.includes('/edi') || activePath.includes('/x12') || activePath.includes('/edi-manager')) {
            return <EDIManager />
        }
        if (activePath.includes('/digital-id') || activePath.includes('/wallet-card') || activePath.includes('/member-card')) {
            return <DigitalIDCard />
        }
        if (activePath.includes('/webhooks') || activePath.includes('/webhook-config')) {
            return <WebhookConfig />
        }
        // Award-Winning UX Modules
        if (activePath.includes('/viz-studio') || activePath.includes('/visualization') || activePath.includes('/chart-builder')) {
            return <DataVisualizationStudio />
        }
        if (activePath.includes('/marketplace') || activePath.includes('/integrations') || activePath.includes('/connectors')) {
            return <IntegrationMarketplace />
        }
        if (activePath.includes('/benchmarks') || activePath.includes('/benchmark-analytics') || activePath.includes('/industry-compare')) {
            return <BenchmarkAnalytics />
        }
        // SIR Analytics Command Center
        if (activePath.includes('/sir') || activePath.includes('/self-insured') || activePath.includes('/sir-analytics')) {
            return <SIRDashboard />
        }
        // IBNR & Actuarial Engine
        if (activePath.includes('/ibnr') || activePath.includes('/actuarial') || activePath.includes('/reserves')) {
            return <IBNRActuarial />
        }
        // Pharmacy & PBM Analytics
        if (activePath.includes('/pharmacy-analytics') || activePath.includes('/pbm') || activePath.includes('/drug-spend')) {
            return <PharmacyAnalytics />
        }
        // Population Health & Quality
        if (activePath.includes('/population-health') || activePath.includes('/hedis') || activePath.includes('/quality')) {
            return <PopulationHealth />
        }
        // Advanced Analytics - Premium Executive Dashboard
        if (activePath.includes('/advanced-analytics') || activePath.includes('/exec-analytics')) {
            return <AdvancedAnalytics />
        }
        // Workflow builder paths
        if (activePath.includes('/workflows')) {
            return <WorkflowBuilder />
        }
        // Analytics
        if (activePath.includes('/analytics') || activePath.includes('/insights')) {
            return <Analytics />
        }
        // Claims
        if (activePath.includes('/claims')) {
            return <ClaimsProcessing />
        }
        // Plan Configuration
        if (activePath.includes('/plans') || activePath.includes('/plan-config')) {
            return <PlanConfiguration />
        }
        // Audit Trail
        if (activePath.includes('/audit')) {
            return <AuditTrail />
        }
        // Find Care / Provider Directory
        if (activePath.includes('/providers') || activePath.includes('/find-care') || activePath.includes('/findcare')) {
            return <ProviderDirectory />
        }
        // Network Analytics & Optimization
        if (activePath.includes('/network-analytics') || activePath.includes('/network-optimization') || activePath.includes('/network-adequacy')) {
            return <NetworkAnalytics />
        }
        // Cost Estimator
        if (activePath.includes('/cost-estimator') || activePath.includes('/pricing')) {
            return <CostEstimator />
        }
        // EOB Viewer
        if (activePath.includes('/eob') || activePath.includes('/explanation-of-benefits')) {
            return <EOBViewer />
        }
        // Commissions (Broker)
        if (activePath.includes('/commissions')) {
            return <Commissions />
        }
        // Quoting (Broker)
        if (activePath.includes('/quoting') || activePath.includes('/quotes')) {
            return <Quoting />
        }
        // Agency Portal
        if (activePath.includes('/agency')) {
            return <AgencyPortal />
        }
        // Eligibility
        if (activePath.includes('/eligibility')) {
            return <Eligibility />
        }
        // Prior Authorization
        if (activePath.includes('/prior-auth') || activePath.includes('/authorizations')) {
            return <PriorAuthorization />
        }
        // Enrollment (Employer)
        if (activePath.includes('/enrollment')) {
            return <Enrollment />
        }
        // Employer Benefits Administration
        if (activePath === '/employer' || activePath.includes('/employer-admin') || activePath.includes('/benefits-admin')) {
            return <EmployerAdmin />
        }
        // Billing (Employer)
        if (activePath.includes('/billing')) {
            return <Billing />
        }
        // Census (Employer)
        if (activePath.includes('/census')) {
            return <Census />
        }
        // Settings (All)
        if (activePath.includes('/settings')) {
            return <Settings />
        }
        // Messages (All portals)
        if (activePath.includes('/messages')) {
            return <MessageCenter />
        }
        // Notifications (All portals)
        if (activePath.includes('/notifications')) {
            return <Notifications />
        }
        // Reports (All portals)
        if (activePath.includes('/reports')) {
            return <Reports />
        }
        // HSA Wallet (Member)
        if (activePath.includes('/hsa') || activePath.includes('/fsa') || activePath.includes('/wallet')) {
            return <HSAWallet />
        }
        // Pharmacy
        if (activePath.includes('/pharmacy') || activePath.includes('/rx') || activePath.includes('/prescriptions')) {
            return <Pharmacy />
        }
        // Telehealth
        if (activePath.includes('/telehealth') || activePath.includes('/virtual-care') || activePath.includes('/video-visit')) {
            return <Telehealth />
        }
        // Documents
        if (activePath.includes('/documents') || activePath.includes('/files')) {
            return <Documents />
        }
        // Care Team
        if (activePath.includes('/care-team') || activePath.includes('/my-doctors') || activePath.includes('/providers')) {
            return <CareTeam />
        }
        // Wellness
        if (activePath.includes('/wellness') || activePath.includes('/health-score') || activePath.includes('/goals')) {
            return <Wellness />
        }
        // Appointments
        if (activePath.includes('/appointments') || activePath.includes('/schedule')) {
            return <Appointments />
        }
        // Benefits Summary
        if (activePath.includes('/benefits') || activePath.includes('/coverage') || activePath.includes('/plan-details')) {
            return <BenefitsSummary />
        }
        // Appeals & Grievances
        if (activePath.includes('/appeals') || activePath.includes('/grievances')) {
            return <Appeals />
        }
        // Payment Processing
        if (activePath.includes('/payment-processing') || activePath.includes('/payments')) {
            return <PaymentProcessing />
        }
        // Network Management
        if (activePath.includes('/network') || activePath.includes('/network-management')) {
            return <NetworkManagement />
        }
        // Provider Credentialing
        if (activePath.includes('/credentialing')) {
            return <ProviderCredentialing />
        }
        // Member ID Card
        if (activePath.includes('/id-card') || activePath.includes('/member-id')) {
            return <MemberIDCard />
        }
        // Risk Adjustment
        if (activePath.includes('/risk-adjustment') || activePath.includes('/raf') || activePath.includes('/hcc')) {
            return <RiskAdjustment />
        }
        // Utilization Management
        if (activePath.includes('/utilization') || activePath.includes('/um')) {
            return <UtilizationManagement />
        }
        // Care Coordination
        if (activePath.includes('/care-coordination') || activePath.includes('/care-gaps')) {
            return <CareCoordination />
        }
        // Quality Metrics
        if (activePath.includes('/quality') || activePath.includes('/hedis') || activePath.includes('/star-ratings')) {
            return <QualityMetrics />
        }
        // Compliance Dashboard
        if (activePath.includes('/compliance') || activePath.includes('/hipaa') || activePath.includes('/regulatory')) {
            return <ComplianceDashboard />
        }
        // Member Outreach
        if (activePath.includes('/outreach') || activePath.includes('/campaigns')) {
            return <MemberOutreach />
        }
        // Premium Billing
        if (activePath.includes('/premium-billing') || activePath.includes('/invoices')) {
            return <PremiumBilling />
        }
        // Actuarial Tools
        if (activePath.includes('/actuarial') || activePath.includes('/mlr') || activePath.includes('/reserves')) {
            return <ActuarialTools />
        }
        // Group Enrollment
        if (activePath.includes('/group-enrollment') || activePath.includes('/groups')) {
            return <GroupEnrollment />
        }
        // Provider Portal
        if (activePath.includes('/provider-portal') || activePath.includes('/provider/')) {
            return <ProviderPortal />
        }
        // Phase 11: Member Self-Service Enhancements
        if (activePath.includes('/plan-documents')) {
            return <PlanDocuments />
        }
        if (activePath.includes('/coverage-comparison') || activePath.includes('/compare-plans')) {
            return <CoverageComparison />
        }
        if (activePath.includes('/network-search') || activePath.includes('/find-provider')) {
            return <NetworkSearch />
        }
        // Phase 12: Billing & Payments
        if (activePath.includes('/payment-history') || activePath.includes('/transactions')) {
            return <PaymentHistory />
        }
        if (activePath.includes('/aging-reports') || activePath.includes('/ar-aging')) {
            return <AgingReports />
        }
        if (activePath.includes('/refund') || activePath.includes('/refunds')) {
            return <RefundProcessing />
        }
        if (activePath.includes('/disputes') || activePath.includes('/billing-disputes')) {
            return <BillingDisputes />
        }
        // Phase 13: Communications
        if (activePath.includes('/secure-messaging') || activePath.includes('/inbox')) {
            return <SecureMessaging />
        }
        if (activePath.includes('/sms') || activePath.includes('/text-notifications')) {
            return <SMSNotifications />
        }
        if (activePath.includes('/email-templates') || activePath.includes('/email-config')) {
            return <EmailTemplates />
        }
        if (activePath.includes('/push-notifications') || activePath.includes('/app-notifications')) {
            return <PushNotifications />
        }
        if (activePath.includes('/surveys') || activePath.includes('/feedback')) {
            return <MemberSurveys />
        }
        // Phase 14: Provider Onboarding
        if (activePath.includes('/credentialing-portal') || activePath.includes('/provider-credentialing')) {
            return <CredentialingPortal />
        }
        if (activePath.includes('/contracts') || activePath.includes('/contract-negotiation')) {
            return <ContractNegotiation />
        }
        if (activePath.includes('/network-adequacy') || activePath.includes('/adequacy')) {
            return <NetworkAdequacy />
        }
        if (activePath.includes('/fee-schedule') || activePath.includes('/fee-management')) {
            return <FeeScheduleManagement />
        }
        if (activePath.includes('/provider-enrollment')) {
            return <ProviderEnrollment />
        }
        // Phase 15: Reporting & Analytics
        if (activePath.includes('/report-builder') || activePath.includes('/custom-reports')) {
            return <CustomReportBuilder />
        }
        if (activePath.includes('/scheduled-reports') || activePath.includes('/report-automation')) {
            return <ScheduledReports />
        }
        if (activePath.includes('/executive-dashboard') || activePath.includes('/exec-dashboard')) {
            return <ExecutiveDashboards />
        }
        if (activePath.includes('/data-exports') || activePath.includes('/exports')) {
            return <DataExports />
        }
        if (activePath.includes('/kpi') || activePath.includes('/kpi-tracking')) {
            return <KPITracking />
        }
        // Voice Center
        if (activePath.includes('/voice-agent-builder') || activePath.includes('/voice-builder')) {
            return <VoiceAgentBuilder />
        }
        if (activePath.includes('/voice-monitor') || activePath.includes('/voice-agent-monitor')) {
            return <VoiceAgentMonitor />
        }
        if (activePath.includes('/call-center') || activePath.includes('/call-dashboard')) {
            return <CallCenterDashboard />
        }
        // FHIR & Interoperability
        if (activePath.includes('/fhir-explorer') || activePath.includes('/fhir')) {
            return <FHIRExplorer />
        }
        // Module Management
        if (activePath.includes('/module-licensing') || activePath.includes('/modules')) {
            return <ModuleLicensing />
        }
        // HIPAA Compliance
        if (activePath.includes('/breach-response') || activePath.includes('/incident-response')) {
            return <BreachResponse />
        }
        if (activePath.includes('/data-retention') || activePath.includes('/retention-policies')) {
            return <DataRetention />
        }
        // Previously missing routes
        if (activePath.includes('/certification') || activePath.includes('/certifications')) {
            return <CertificationHub />
        }
        if (activePath.includes('/roi-dashboard') || activePath.includes('/roi')) {
            return <ROIDashboard />
        }
        if (activePath.includes('/revenue-analytics') || activePath.includes('/revenue')) {
            return <RevenueAnalytics />
        }
        if (activePath.includes('/payer-contracts') || activePath.includes('/payer')) {
            return <PayerContracts />
        }
        if (activePath.includes('/imaging') || activePath.includes('/radiology')) {
            return <ImagingResults />
        }
        if (activePath.includes('/lab-orders') || activePath.includes('/lab-results') || activePath.includes('/labs')) {
            return <LabOrders />
        }
        if (activePath.includes('/consent') || activePath.includes('/consent-management')) {
            return <ConsentManagement />
        }
        if (activePath.includes('/medical-records') || activePath.includes('/patient-records')) {
            return <MedicalRecords />
        }
        if (activePath.includes('/document-upload') || activePath.includes('/upload')) {
            return <DocumentUpload />
        }
        if (activePath.includes('/scheduled-reports-config') || activePath.includes('/report-schedule')) {
            return <ScheduledReportsConfig />
        }
        // Employer Portal Dashboard
        if (activePortal === 'employer' && (activePath === '/employer' || activePath.includes('/employer/dashboard'))) {
            return <EmployerAdmin />
        }
        // Default to dashboard
        return <Dashboard portalType={activePortal} />

    }

    // Authenticated App with Shell - always show portal switcher for demo mode
    return (
        <ThemeProvider>
            <AuthProvider>
                <ToastProvider>
                    <CommandPalette
                        isOpen={commandPaletteOpen}
                        onClose={() => setCommandPaletteOpen(false)}
                        onNavigate={(path) => {
                            handleNavigate(path)
                            setCommandPaletteOpen(false)
                        }}
                    />
                    <NavigationProvider onNavigate={handleNavigate}>
                        <Shell
                            activePortal={activePortal}
                            activePath={activePath}
                            onNavigate={handleNavigate}
                            onSwitchPortal={handleSwitchPortal}
                        >
                            <ErrorBoundary level="page" onReset={() => setActivePath(`/${activePortal}`)}>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activePath}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {renderPage()}
                                    </motion.div>
                                </AnimatePresence>
                            </ErrorBoundary>
                        </Shell>
                        <AICopilot />
                        <CollaborationBar />
                        <DemoTour
                            isOpen={demoTourOpen}
                            onClose={() => setDemoTourOpen(false)}
                            onNavigate={(path) => { handleNavigate(path); setDemoTourOpen(false) }}
                        />
                        <OnboardingWelcome
                            isOpen={onboardingOpen}
                            onClose={() => setOnboardingOpen(false)}
                            onNavigate={handleNavigate}
                            userRole={activePortal}
                        />
                        <KeyboardShortcuts
                            isOpen={shortcutsOpen}
                            onClose={() => setShortcutsOpen(false)}
                        />
                    </NavigationProvider>
                </ToastProvider>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App

