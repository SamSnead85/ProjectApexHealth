// ═══════════════════════════════════════════════════════
// Provider Network & Credentialing Types
// ═══════════════════════════════════════════════════════

export type ProviderStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'terminated';
export type ProviderType = 'individual' | 'organization' | 'facility';
export type NetworkTier = 'preferred' | 'standard' | 'basic' | 'out_of_network';
export type CredentialingStatus = 'application_received' | 'in_review' | 'committee_review' | 'approved' | 'denied' | 'expired';

export interface Provider {
  id: string;
  organizationId: string;
  npi: string;
  type: ProviderType;
  status: ProviderStatus;
  networkTier: NetworkTier;

  // Demographics
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  displayName: string;
  credentials: string;          // MD, DO, NP, PA, etc.
  specialty: string;
  subspecialties: string[];
  taxonomyCode: string;

  // Contact
  phone: string;
  fax?: string;
  email?: string;
  website?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    latitude?: number;
    longitude?: number;
  };

  // Network
  contractId?: string;
  contractEffectiveDate?: string;
  contractTermDate?: string;
  feeScheduleId?: string;
  acceptingNewPatients: boolean;
  panelSize?: number;
  panelCapacity?: number;

  // Credentialing
  credentialingStatus: CredentialingStatus;
  credentialingDate?: string;
  recredentialingDate?: string;
  licenseNumber: string;
  licenseState: string;
  licenseExpirationDate: string;
  deaNumber?: string;
  deaExpirationDate?: string;
  boardCertified: boolean;
  boardCertifications: BoardCertification[];
  malpracticeInsurance: {
    carrier: string;
    policyNumber: string;
    expirationDate: string;
    coverageAmount: number;
  };

  // Performance
  qualityScore?: number;
  patientSatisfactionScore?: number;
  costEfficiencyScore?: number;

  // Metadata
  languages: string[];
  hospitalAffiliations: string[];
  groupAffiliations: string[];
  tags: string[];

  createdAt: string;
  updatedAt: string;
}

export interface BoardCertification {
  board: string;
  specialty: string;
  certificationDate: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'pending';
}

export interface FeeSchedule {
  id: string;
  organizationId: string;
  name: string;
  effectiveDate: string;
  terminationDate?: string;
  isActive: boolean;
  entries: FeeScheduleEntry[];
}

export interface FeeScheduleEntry {
  procedureCode: string;
  procedureDescription: string;
  modifiers?: string[];
  placeOfServiceCode?: string;
  allowedAmount: number;
  effectiveDate: string;
  terminationDate?: string;
}

export interface ProviderSearchParams {
  query?: string;
  name?: string;
  npi?: string;
  specialty?: string;
  city?: string;
  state?: string;
  zip?: string;
  radiusMiles?: number;
  networkTier?: NetworkTier;
  acceptingNewPatients?: boolean;
  status?: ProviderStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
