// ═══════════════════════════════════════════════════════
// Prior Authorization Types
// CMS-0057-F compliant
// ═══════════════════════════════════════════════════════

export type PriorAuthStatus =
  | 'submitted'
  | 'in_review'
  | 'pending_info'
  | 'approved'
  | 'partially_approved'
  | 'denied'
  | 'cancelled'
  | 'expired';

export type PriorAuthUrgency = 'standard' | 'urgent' | 'retrospective';
export type PriorAuthType = 'inpatient' | 'outpatient' | 'procedure' | 'medication' | 'dme' | 'imaging' | 'therapy';

export interface PriorAuthorization {
  id: string;
  organizationId: string;
  authNumber: string;
  status: PriorAuthStatus;
  urgency: PriorAuthUrgency;
  type: PriorAuthType;

  // Member
  memberId: string;
  memberName: string;
  memberDob: string;
  planId: string;

  // Requesting Provider
  requestingProviderId: string;
  requestingProviderNpi: string;
  requestingProviderName: string;
  requestingProviderSpecialty: string;

  // Service/Procedure
  servicingProviderId?: string;
  servicingProviderNpi?: string;
  servicingProviderName?: string;
  facilityId?: string;
  facilityName?: string;

  // Clinical
  primaryDiagnosisCode: string;
  primaryDiagnosisDescription: string;
  additionalDiagnosisCodes: Array<{ code: string; description: string }>;
  requestedProcedures: PriorAuthProcedure[];
  clinicalNotes: string;
  clinicalDocuments: string[];    // Document IDs

  // Review
  reviewerId?: string;
  reviewerName?: string;
  reviewDecision?: 'approved' | 'denied' | 'partially_approved' | 'pended';
  reviewNotes?: string;
  reviewDate?: string;
  denialReason?: string;
  denialReasonCode?: string;     // CMS denial reason
  approvedUnits?: number;
  approvedFromDate?: string;
  approvedToDate?: string;

  // AI Analysis
  aiRecommendation?: 'approve' | 'deny' | 'review';
  aiConfidenceScore?: number;
  aiClinicalRationale?: string;
  aiSimilarCases?: string[];

  // SLA Tracking (CMS-0057-F mandated)
  submittedAt: string;
  slaDeadline: string;          // 72hrs urgent, 7 days standard
  slaStatus: 'on_track' | 'at_risk' | 'overdue';
  daysInReview: number;

  // FHIR
  fhirClaimResponseId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface PriorAuthProcedure {
  procedureCode: string;
  procedureDescription: string;
  codeType: 'CPT' | 'HCPCS' | 'ICD10PCS';
  requestedUnits: number;
  approvedUnits?: number;
  fromDate: string;
  toDate: string;
  status: 'pending' | 'approved' | 'denied' | 'modified';
}

export interface PriorAuthSearchParams {
  query?: string;
  authNumber?: string;
  memberId?: string;
  providerId?: string;
  status?: PriorAuthStatus | PriorAuthStatus[];
  urgency?: PriorAuthUrgency;
  type?: PriorAuthType;
  dateFrom?: string;
  dateTo?: string;
  slaStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePriorAuthDto {
  urgency: PriorAuthUrgency;
  type: PriorAuthType;
  memberId: string;
  requestingProviderNpi: string;
  servicingProviderNpi?: string;
  facilityId?: string;
  primaryDiagnosisCode: string;
  additionalDiagnosisCodes?: string[];
  requestedProcedures: Array<{
    procedureCode: string;
    requestedUnits: number;
    fromDate: string;
    toDate: string;
  }>;
  clinicalNotes: string;
  clinicalDocumentIds?: string[];
}
