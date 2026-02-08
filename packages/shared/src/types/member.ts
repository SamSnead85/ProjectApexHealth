// ═══════════════════════════════════════════════════════
// Member / Patient Types
// ═══════════════════════════════════════════════════════

import { Address } from './organization';

export type MemberStatus = 'active' | 'inactive' | 'terminated' | 'cobra' | 'pending';
export type Gender = 'male' | 'female' | 'other' | 'unknown';
export type RelationshipCode = 'self' | 'spouse' | 'child' | 'domestic_partner' | 'other';

export interface Member {
  id: string;
  organizationId: string;
  memberId: string;           // Plan-assigned member ID
  subscriberId: string;       // Subscriber ID (for dependents, this is the primary's ID)
  relationship: RelationshipCode;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: Gender;
  ssn?: string;              // Encrypted at rest (PHI)
  email?: string;
  phone?: string;
  address: Address;
  status: MemberStatus;
  effectiveDate: string;
  terminationDate?: string;
  planId: string;
  planName: string;
  groupId: string;
  groupName: string;
  pcpProviderId?: string;
  pcpProviderName?: string;
  riskScore?: number;
  hccCodes?: string[];
  accumulator: MemberAccumulator;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MemberAccumulator {
  deductibleIndividual: { used: number; limit: number };
  deductibleFamily: { used: number; limit: number };
  oopMaxIndividual: { used: number; limit: number };
  oopMaxFamily: { used: number; limit: number };
  planYear: string;
}

export interface MemberSearchParams {
  query?: string;
  memberId?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  groupId?: string;
  planId?: string;
  status?: MemberStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Member360View {
  member: Member;
  recentClaims: any[];       // ClaimSummary[]
  activePriorAuths: any[];   // PriorAuthSummary[]
  careTeam: CareTeamMember[];
  recentDocuments: any[];
  alerts: MemberAlert[];
  riskFactors: RiskFactor[];
}

export interface CareTeamMember {
  id: string;
  providerId: string;
  providerName: string;
  specialty: string;
  role: string;
  phone?: string;
  email?: string;
  lastVisitDate?: string;
  nextAppointmentDate?: string;
}

export interface MemberAlert {
  id: string;
  type: 'care_gap' | 'medication' | 'authorization' | 'billing' | 'wellness';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionRequired: boolean;
  createdAt: string;
}

export interface RiskFactor {
  category: string;
  description: string;
  score: number;
  trend: 'improving' | 'stable' | 'worsening';
}
