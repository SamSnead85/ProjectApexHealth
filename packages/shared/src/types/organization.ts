// ═══════════════════════════════════════════════════════
// Organization & Multi-Tenancy Types
// ═══════════════════════════════════════════════════════

export type OrganizationType = 'payer' | 'provider' | 'employer' | 'broker' | 'tpa';

export type LicensedModule =
  | 'claims-intelligence'
  | 'eligibility-hub'
  | 'prior-auth-center'
  | 'provider-network'
  | 'member-experience'
  | 'revenue-cycle'
  | 'analytics-command'
  | 'compliance-suite'
  | 'ai-operations'
  | 'voice-center';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  taxId?: string;
  npi?: string;
  cmsId?: string;
  address: Address;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  settings: OrganizationSettings;
  licensedModules: LicensedModule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface OrganizationSettings {
  timezone: string;
  dateFormat: string;
  currency: string;
  claimsAutoAdjudicationEnabled: boolean;
  claimsAutoAdjudicationThreshold: number;
  mfaRequired: boolean;
  sessionTimeoutMinutes: number;
  passwordExpirationDays: number;
  ipAllowlist?: string[];
  customBranding?: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    faviconUrl: string;
  };
}

export interface CreateOrganizationDto {
  name: string;
  type: OrganizationType;
  taxId?: string;
  npi?: string;
  address: Address;
  phone?: string;
  email: string;
  licensedModules: LicensedModule[];
}

export interface UpdateOrganizationDto {
  name?: string;
  address?: Partial<Address>;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  settings?: Partial<OrganizationSettings>;
  licensedModules?: LicensedModule[];
}
