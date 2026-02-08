/**
 * Module Registry - Manages standalone module licensing and activation.
 * Each module can be independently licensed and deployed.
 * Organizations choose which modules to activate.
 */

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  dependencies: string[];          // Other modules this depends on
  requiredKernel: string[];        // Required kernel services
  apiPrefix: string;
  featureFlags: Record<string, boolean>;
  defaultRoles: string[];          // Roles that get access by default
}

export const APEX_MODULES: Record<string, ModuleDefinition> = {
  'claims-intelligence': {
    id: 'claims-intelligence',
    name: 'Claims Intelligence',
    description: 'Claims processing, auto-adjudication, EDI 837/835, AI-powered claims analysis',
    version: '1.0.0',
    dependencies: ['eligibility-hub'],
    requiredKernel: ['auth', 'audit', 'documents'],
    apiPrefix: '/api/v1/claims',
    featureFlags: {
      autoAdjudication: true,
      aiAnalysis: true,
      batchProcessing: true,
      ediIntegration: true,
    },
    defaultRoles: ['claims_processor', 'claims_supervisor', 'medical_director'],
  },

  'eligibility-hub': {
    id: 'eligibility-hub',
    name: 'Eligibility Hub',
    description: 'Real-time eligibility verification, enrollment management, EDI 270/271/834',
    version: '1.0.0',
    dependencies: [],
    requiredKernel: ['auth', 'audit'],
    apiPrefix: '/api/v1/eligibility',
    featureFlags: {
      realTimeVerification: true,
      batchEnrollment: true,
      ediIntegration: true,
      cobraManagement: true,
    },
    defaultRoles: ['claims_processor', 'care_manager', 'support'],
  },

  'prior-auth-center': {
    id: 'prior-auth-center',
    name: 'Prior Auth Center',
    description: 'CMS-compliant prior authorization, clinical review, FHIR PAS integration',
    version: '1.0.0',
    dependencies: ['eligibility-hub'],
    requiredKernel: ['auth', 'audit', 'documents'],
    apiPrefix: '/api/v1/prior-auth',
    featureFlags: {
      aiRecommendations: true,
      slaTracking: true,
      fhirPAS: true,
      clinicalCriteria: true,
    },
    defaultRoles: ['medical_director', 'care_manager', 'claims_supervisor'],
  },

  'provider-network': {
    id: 'provider-network',
    name: 'Provider Network',
    description: 'Provider credentialing, contract management, network adequacy analysis',
    version: '1.0.0',
    dependencies: [],
    requiredKernel: ['auth', 'audit'],
    apiPrefix: '/api/v1/providers',
    featureFlags: {
      credentialingWorkflow: true,
      feeScheduleManagement: true,
      networkAdequacy: true,
      caqhIntegration: true,
    },
    defaultRoles: ['org_admin'],
  },

  'member-experience': {
    id: 'member-experience',
    name: 'Member Experience',
    description: 'Member portal, digital ID cards, secure messaging, wellness programs',
    version: '1.0.0',
    dependencies: ['eligibility-hub'],
    requiredKernel: ['auth', 'audit', 'documents'],
    apiPrefix: '/api/v1/members',
    featureFlags: {
      digitalIdCard: true,
      secureMessaging: true,
      telehealth: true,
      wellnessPrograms: true,
      hsaManagement: true,
    },
    defaultRoles: ['member', 'care_manager', 'support'],
  },

  'revenue-cycle': {
    id: 'revenue-cycle',
    name: 'Revenue Cycle',
    description: 'Premium billing, payment processing, collections, EDI 820',
    version: '1.0.0',
    dependencies: ['eligibility-hub'],
    requiredKernel: ['auth', 'audit'],
    apiPrefix: '/api/v1/billing',
    featureFlags: {
      premiumBilling: true,
      paymentProcessing: true,
      collections: true,
      ediIntegration: true,
    },
    defaultRoles: ['org_admin'],
  },

  'analytics-command': {
    id: 'analytics-command',
    name: 'Analytics Command',
    description: 'Executive dashboards, custom reporting, population health, quality measures',
    version: '1.0.0',
    dependencies: [],
    requiredKernel: ['auth', 'audit'],
    apiPrefix: '/api/v1/analytics',
    featureFlags: {
      executiveDashboard: true,
      customReports: true,
      populationHealth: true,
      hedisTracking: true,
      starRatings: true,
    },
    defaultRoles: ['analyst', 'org_admin', 'medical_director'],
  },

  'compliance-suite': {
    id: 'compliance-suite',
    name: 'Compliance Suite',
    description: 'HIPAA audit trails, regulatory tracking, risk management, breach response',
    version: '1.0.0',
    dependencies: [],
    requiredKernel: ['auth', 'audit'],
    apiPrefix: '/api/v1/compliance',
    featureFlags: {
      auditDashboard: true,
      anomalyDetection: true,
      breachResponse: true,
      regulatoryTracking: true,
    },
    defaultRoles: ['auditor', 'org_admin'],
  },

  'ai-operations': {
    id: 'ai-operations',
    name: 'AI Operations',
    description: 'Visual workflow builder, agent orchestrator, document intelligence, ML models',
    version: '1.0.0',
    dependencies: [],
    requiredKernel: ['auth', 'audit'],
    apiPrefix: '/api/v1/workflows',
    featureFlags: {
      workflowBuilder: true,
      agentOrchestrator: true,
      documentIntelligence: true,
      fraudDetection: true,
      predictiveAnalytics: true,
    },
    defaultRoles: ['org_admin', 'analyst'],
  },

  'voice-center': {
    id: 'voice-center',
    name: 'Voice Center',
    description: 'AI voice agents, call center operations, outreach automation',
    version: '1.0.0',
    dependencies: ['ai-operations'],
    requiredKernel: ['auth', 'audit'],
    apiPrefix: '/api/v1/voice',
    featureFlags: {
      memberServiceAgent: true,
      providerServiceAgent: true,
      outreachAgent: true,
      callMonitoring: true,
      sentimentAnalysis: true,
    },
    defaultRoles: ['org_admin', 'support'],
  },
};

/**
 * Check if an organization has access to a specific module.
 */
export function isModuleEnabled(
  licensedModules: string[],
  moduleId: string,
): boolean {
  return licensedModules.includes(moduleId);
}

/**
 * Get all modules an organization has access to, including dependencies.
 */
export function getEnabledModules(licensedModules: string[]): ModuleDefinition[] {
  return licensedModules
    .filter(id => APEX_MODULES[id])
    .map(id => APEX_MODULES[id]);
}

/**
 * Validate module dependencies are satisfied.
 */
export function validateModuleDependencies(licensedModules: string[]): string[] {
  const errors: string[] = [];
  for (const moduleId of licensedModules) {
    const moduleDef = APEX_MODULES[moduleId];
    if (!moduleDef) continue;

    for (const dep of moduleDef.dependencies) {
      if (!licensedModules.includes(dep)) {
        errors.push(
          `Module "${moduleDef.name}" requires "${APEX_MODULES[dep]?.name || dep}" which is not licensed.`,
        );
      }
    }
  }
  return errors;
}

/**
 * Get navigation items for a given set of licensed modules.
 */
export function getModuleNavigation(licensedModules: string[]): Array<{
  moduleId: string;
  name: string;
  icon: string;
  path: string;
}> {
  const navItems: Array<{ moduleId: string; name: string; icon: string; path: string }> = [];
  const moduleNavMap: Record<string, { icon: string; path: string }> = {
    'claims-intelligence': { icon: 'FileCheck', path: '/claims' },
    'eligibility-hub': { icon: 'Shield', path: '/eligibility' },
    'prior-auth-center': { icon: 'ClipboardCheck', path: '/prior-auth' },
    'provider-network': { icon: 'Network', path: '/providers' },
    'member-experience': { icon: 'Users', path: '/members' },
    'revenue-cycle': { icon: 'DollarSign', path: '/billing' },
    'analytics-command': { icon: 'BarChart3', path: '/analytics' },
    'compliance-suite': { icon: 'ShieldCheck', path: '/compliance' },
    'ai-operations': { icon: 'Brain', path: '/workflows' },
    'voice-center': { icon: 'Phone', path: '/voice-center' },
  };

  for (const moduleId of licensedModules) {
    const moduleDef = APEX_MODULES[moduleId];
    const nav = moduleNavMap[moduleId];
    if (moduleDef && nav) {
      navItems.push({
        moduleId,
        name: moduleDef.name,
        ...nav,
      });
    }
  }

  return navItems;
}
