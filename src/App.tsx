import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Shell } from './components/layout'
import { ThemeProvider } from './context/ThemeContext'
import { NavigationProvider } from './context/NavigationContext'
import { ToastProvider } from './components/common/Toast'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import WorkflowBuilder from './pages/WorkflowBuilder'
import Analytics from './pages/Analytics'
import Claims from './pages/Claims'
import MemberPortal from './pages/MemberPortal'
import FindCare from './pages/FindCare'
import BrokerPortal from './pages/BrokerPortal'
import EmployerPortal from './pages/EmployerPortal'
import AgencyPortal from './pages/AgencyPortal'
import AuditTrail from './pages/AuditTrail'
import Commissions from './pages/Commissions'
import Quoting from './pages/Quoting'
import Enrollment from './pages/Enrollment'
import Billing from './pages/Billing'
import Census from './pages/Census'
import Settings from './pages/Settings'
import PlanConfiguration from './pages/PlanConfiguration'
import Eligibility from './pages/Eligibility'
import ClaimsProcessing from './pages/ClaimsProcessing'
import PriorAuthorization from './pages/PriorAuthorization'
import ProviderDirectory from './pages/ProviderDirectory'
import CostEstimator from './pages/CostEstimator'
import EOBViewer from './pages/EOBViewer'
import MemberHome from './pages/MemberHome'
import HSAWallet from './pages/HSAWallet'
import MessageCenter from './pages/MessageCenter'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'
import Pharmacy from './pages/Pharmacy'
import Telehealth from './pages/Telehealth'
import Documents from './pages/Documents'
import CareTeam from './pages/CareTeam'
import Wellness from './pages/Wellness'
import Appointments from './pages/Appointments'
import BenefitsSummary from './pages/BenefitsSummary'
// Extended Feature Pages
import Appeals from './pages/Appeals'
import PaymentProcessing from './pages/PaymentProcessing'
import NetworkManagement from './pages/NetworkManagement'
import ProviderCredentialing from './pages/ProviderCredentialing'
import MemberIDCard from './pages/MemberIDCard'
import RiskAdjustment from './pages/RiskAdjustment'
import UtilizationManagement from './pages/UtilizationManagement'
import CareCoordination from './pages/CareCoordination'
import QualityMetrics from './pages/QualityMetrics'
import ComplianceDashboard from './pages/ComplianceDashboard'
import MemberOutreach from './pages/MemberOutreach'
import PremiumBilling from './pages/PremiumBilling'
import ActuarialTools from './pages/ActuarialTools'
import GroupEnrollment from './pages/GroupEnrollment'
import ProviderPortal from './pages/ProviderPortal'
// Phase 11-15 Pages
import PlanDocuments from './pages/PlanDocuments'
import CoverageComparison from './pages/CoverageComparison'
import NetworkSearch from './pages/NetworkSearch'
import PaymentHistory from './pages/PaymentHistory'
import AgingReports from './pages/AgingReports'
import RefundProcessing from './pages/RefundProcessing'
import BillingDisputes from './pages/BillingDisputes'
import SecureMessaging from './pages/SecureMessaging'
import SMSNotifications from './pages/SMSNotifications'
import EmailTemplates from './pages/EmailTemplates'
import PushNotifications from './pages/PushNotifications'
import MemberSurveys from './pages/MemberSurveys'
import CredentialingPortal from './pages/CredentialingPortal'
import ContractNegotiation from './pages/ContractNegotiation'
import NetworkAdequacy from './pages/NetworkAdequacy'
import FeeScheduleManagement from './pages/FeeScheduleManagement'
import ProviderEnrollment from './pages/ProviderEnrollment'
import CustomReportBuilder from './pages/CustomReportBuilder'
import ScheduledReports from './pages/ScheduledReports'
import ExecutiveDashboards from './pages/ExecutiveDashboards'
import DataExports from './pages/DataExports'
import KPITracking from './pages/KPITracking'
import SIRDashboard from './pages/SIRDashboard'
import IBNRActuarial from './pages/IBNRActuarial'
import PharmacyAnalytics from './pages/PharmacyAnalytics'
import PopulationHealth from './pages/PopulationHealth'
import EmployerAdmin from './pages/EmployerAdmin'
import NetworkAnalytics from './pages/NetworkAnalytics'
// Enhancement Modules - Phase 1-6
import DocumentIntelligence from './pages/DocumentIntelligence'
import Member360 from './pages/Member360'
import RegulatoryHub from './pages/RegulatoryHub'
import StopLossManagement from './pages/StopLossManagement'
import CarrierVendorPortal from './pages/CarrierVendorPortal'
import FiduciaryDashboard from './pages/FiduciaryDashboard'
// AI-Powered Features
import ClaimsPrediction from './pages/ClaimsPrediction'
import FraudDetection from './pages/FraudDetection'
import BenefitCalculator from './pages/BenefitCalculator'
// Analytics Modules
import ValueBasedCare from './pages/ValueBasedCare'
import ProviderPerformance from './pages/ProviderPerformance'
// Enterprise Modules
import SSOConfiguration from './pages/SSOConfiguration'
import BrandingSettings from './pages/BrandingSettings'
import ClinicalDecisionSupport from './pages/ClinicalDecisionSupport'
import APIManagement from './pages/APIManagement'
import AuditDashboard from './pages/AuditDashboard'
import CareManagement from './pages/CareManagement'
// Boardroom Ready Features
import ExecutiveDashboard from './pages/ExecutiveDashboard'
import BoardReportGenerator from './pages/BoardReportGenerator'
import CommandPalette from './components/ui/CommandPalette'
import AICopilot from './components/ai/AICopilot'
// Operational Completeness
import NotificationCenter from './pages/NotificationCenter'
import TaskQueue from './pages/TaskQueue'
import UserManagement from './pages/UserManagement'
// System Monitoring
import SystemHealth from './pages/SystemHealth'
import BatchDashboard from './pages/BatchDashboard'
import ActivityFeed from './pages/ActivityFeed'
// Data Integration & Member Experience
import EDIManager from './pages/EDIManager'
import DigitalIDCard from './pages/DigitalIDCard'
import WebhookConfig from './pages/WebhookConfig'
// Award-Winning UX Modules
import DataVisualizationStudio from './pages/DataVisualizationStudio'
import IntegrationMarketplace from './pages/IntegrationMarketplace'
import BenchmarkAnalytics from './pages/BenchmarkAnalytics'
// Compliance & Data Integration Modules
import ComplianceCenter from './pages/ComplianceCenter'
import DataIntegrationHub from './pages/DataIntegrationHub'
// Strategic Module Additions - Premium Implementation
import CareJourneyNavigator from './pages/CareJourneyNavigator'
import OONClaimsWizard from './pages/OONClaimsWizard'
import HealthConcierge from './pages/HealthConcierge'
import AgentAssistDashboard from './pages/AgentAssistDashboard'
import AdvancedAnalytics from './pages/AdvancedAnalytics'
import CommandCenter from './pages/CommandCenter'

type PortalType = 'admin' | 'broker' | 'employer' | 'member'
type AppState = 'landing' | 'authenticated'

function App() {
    const [appState, setAppState] = useState<AppState>('landing')
    const [activePortal, setActivePortal] = useState<PortalType>('admin')
    const [activePath, setActivePath] = useState('/admin')
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

    // Global keyboard shortcut for Command Palette (⌘+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setCommandPaletteOpen(prev => !prev)
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleLogin = (portal: PortalType) => {
        setActivePortal(portal)
        setActivePath(`/${portal}`)
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
        return <Landing onLogin={handleLogin} />
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
                        <AnimatePresence mode="wait">
                            {renderPage()}
                        </AnimatePresence>
                    </Shell>
                    <AICopilot />
                </NavigationProvider>
            </ToastProvider>
        </ThemeProvider>
    )
}

export default App

