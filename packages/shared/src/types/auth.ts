// ═══════════════════════════════════════════════════════
// Authentication & Authorization Types
// ═══════════════════════════════════════════════════════

export type UserRole =
  | 'system_admin'
  | 'org_admin'
  | 'claims_processor'
  | 'claims_supervisor'
  | 'medical_director'
  | 'care_manager'
  | 'member'
  | 'broker'
  | 'employer_admin'
  | 'provider'
  | 'auditor'
  | 'analyst'
  | 'support';

export type PortalType = 'admin' | 'member' | 'broker' | 'employer' | 'provider';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  portal: PortalType;
  permissions: string[];
  mfaEnabled: boolean;
  avatarUrl?: string;
  department?: string;
  title?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  organizationId: string;
  permissions: string[];
  iat: number;
  exp: number;
}

// RBAC Permission Definitions
export const PERMISSIONS = {
  // Claims
  CLAIMS_VIEW: 'claims:view',
  CLAIMS_CREATE: 'claims:create',
  CLAIMS_ADJUDICATE: 'claims:adjudicate',
  CLAIMS_APPROVE: 'claims:approve',
  CLAIMS_VOID: 'claims:void',
  CLAIMS_EXPORT: 'claims:export',

  // Eligibility
  ELIGIBILITY_VIEW: 'eligibility:view',
  ELIGIBILITY_VERIFY: 'eligibility:verify',
  ELIGIBILITY_ENROLL: 'eligibility:enroll',
  ELIGIBILITY_TERMINATE: 'eligibility:terminate',

  // Prior Auth
  PRIOR_AUTH_VIEW: 'prior-auth:view',
  PRIOR_AUTH_CREATE: 'prior-auth:create',
  PRIOR_AUTH_REVIEW: 'prior-auth:review',
  PRIOR_AUTH_APPROVE: 'prior-auth:approve',
  PRIOR_AUTH_DENY: 'prior-auth:deny',

  // Members
  MEMBERS_VIEW: 'members:view',
  MEMBERS_VIEW_PHI: 'members:view-phi',
  MEMBERS_EDIT: 'members:edit',
  MEMBERS_EXPORT: 'members:export',

  // Providers
  PROVIDERS_VIEW: 'providers:view',
  PROVIDERS_MANAGE: 'providers:manage',
  PROVIDERS_CREDENTIAL: 'providers:credential',
  PROVIDERS_CONTRACT: 'providers:contract',

  // Billing
  BILLING_VIEW: 'billing:view',
  BILLING_CREATE: 'billing:create',
  BILLING_PROCESS_PAYMENT: 'billing:process-payment',

  // Analytics
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  ANALYTICS_CREATE_REPORT: 'analytics:create-report',

  // Admin
  ADMIN_USERS: 'admin:users',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_AUDIT: 'admin:audit',
  ADMIN_MODULES: 'admin:modules',

  // Workflow
  WORKFLOW_VIEW: 'workflow:view',
  WORKFLOW_CREATE: 'workflow:create',
  WORKFLOW_EXECUTE: 'workflow:execute',
  WORKFLOW_ADMIN: 'workflow:admin',

  // Documents
  DOCUMENTS_VIEW: 'documents:view',
  DOCUMENTS_UPLOAD: 'documents:upload',
  DOCUMENTS_DELETE: 'documents:delete',

  // Compliance
  COMPLIANCE_VIEW: 'compliance:view',
  COMPLIANCE_MANAGE: 'compliance:manage',
} as const;

// Role -> Permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  system_admin: Object.values(PERMISSIONS),
  org_admin: Object.values(PERMISSIONS).filter(p => !p.startsWith('admin:modules')),
  claims_processor: [
    PERMISSIONS.CLAIMS_VIEW, PERMISSIONS.CLAIMS_CREATE, PERMISSIONS.CLAIMS_ADJUDICATE,
    PERMISSIONS.ELIGIBILITY_VIEW, PERMISSIONS.ELIGIBILITY_VERIFY,
    PERMISSIONS.MEMBERS_VIEW, PERMISSIONS.DOCUMENTS_VIEW, PERMISSIONS.DOCUMENTS_UPLOAD,
  ],
  claims_supervisor: [
    PERMISSIONS.CLAIMS_VIEW, PERMISSIONS.CLAIMS_CREATE, PERMISSIONS.CLAIMS_ADJUDICATE,
    PERMISSIONS.CLAIMS_APPROVE, PERMISSIONS.CLAIMS_VOID, PERMISSIONS.CLAIMS_EXPORT,
    PERMISSIONS.ELIGIBILITY_VIEW, PERMISSIONS.ELIGIBILITY_VERIFY,
    PERMISSIONS.MEMBERS_VIEW, PERMISSIONS.MEMBERS_VIEW_PHI,
    PERMISSIONS.DOCUMENTS_VIEW, PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  medical_director: [
    PERMISSIONS.CLAIMS_VIEW, PERMISSIONS.CLAIMS_APPROVE,
    PERMISSIONS.PRIOR_AUTH_VIEW, PERMISSIONS.PRIOR_AUTH_REVIEW,
    PERMISSIONS.PRIOR_AUTH_APPROVE, PERMISSIONS.PRIOR_AUTH_DENY,
    PERMISSIONS.MEMBERS_VIEW, PERMISSIONS.MEMBERS_VIEW_PHI,
    PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.DOCUMENTS_VIEW,
  ],
  care_manager: [
    PERMISSIONS.MEMBERS_VIEW, PERMISSIONS.MEMBERS_VIEW_PHI, PERMISSIONS.MEMBERS_EDIT,
    PERMISSIONS.PRIOR_AUTH_VIEW, PERMISSIONS.PRIOR_AUTH_CREATE,
    PERMISSIONS.ELIGIBILITY_VIEW, PERMISSIONS.ELIGIBILITY_VERIFY,
    PERMISSIONS.DOCUMENTS_VIEW, PERMISSIONS.DOCUMENTS_UPLOAD,
  ],
  member: [
    PERMISSIONS.CLAIMS_VIEW, PERMISSIONS.ELIGIBILITY_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW, PERMISSIONS.DOCUMENTS_UPLOAD,
  ],
  broker: [
    PERMISSIONS.ELIGIBILITY_VIEW, PERMISSIONS.ELIGIBILITY_ENROLL,
    PERMISSIONS.MEMBERS_VIEW, PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.DOCUMENTS_VIEW,
  ],
  employer_admin: [
    PERMISSIONS.ELIGIBILITY_VIEW, PERMISSIONS.ELIGIBILITY_ENROLL, PERMISSIONS.ELIGIBILITY_TERMINATE,
    PERMISSIONS.MEMBERS_VIEW, PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.DOCUMENTS_VIEW,
  ],
  provider: [
    PERMISSIONS.CLAIMS_VIEW, PERMISSIONS.CLAIMS_CREATE,
    PERMISSIONS.ELIGIBILITY_VIEW, PERMISSIONS.ELIGIBILITY_VERIFY,
    PERMISSIONS.PRIOR_AUTH_VIEW, PERMISSIONS.PRIOR_AUTH_CREATE,
    PERMISSIONS.MEMBERS_VIEW, PERMISSIONS.DOCUMENTS_VIEW, PERMISSIONS.DOCUMENTS_UPLOAD,
  ],
  auditor: [
    PERMISSIONS.CLAIMS_VIEW, PERMISSIONS.CLAIMS_EXPORT,
    PERMISSIONS.MEMBERS_VIEW, PERMISSIONS.ELIGIBILITY_VIEW,
    PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.COMPLIANCE_VIEW, PERMISSIONS.ADMIN_AUDIT,
    PERMISSIONS.DOCUMENTS_VIEW,
  ],
  analyst: [
    PERMISSIONS.CLAIMS_VIEW, PERMISSIONS.CLAIMS_EXPORT,
    PERMISSIONS.ELIGIBILITY_VIEW, PERMISSIONS.MEMBERS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.ANALYTICS_EXPORT, PERMISSIONS.ANALYTICS_CREATE_REPORT,
    PERMISSIONS.PROVIDERS_VIEW,
  ],
  support: [
    PERMISSIONS.CLAIMS_VIEW, PERMISSIONS.ELIGIBILITY_VIEW, PERMISSIONS.ELIGIBILITY_VERIFY,
    PERMISSIONS.MEMBERS_VIEW, PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.PRIOR_AUTH_VIEW,
  ],
};
