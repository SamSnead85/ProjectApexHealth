// ═══════════════════════════════════════════════════════
// Claims Processing Types
// ═══════════════════════════════════════════════════════

export type ClaimType = 'professional' | 'institutional' | 'dental' | 'pharmacy' | 'vision';
export type ClaimStatus =
  | 'received'
  | 'validated'
  | 'pending_info'
  | 'in_review'
  | 'priced'
  | 'adjudicated'
  | 'approved'
  | 'denied'
  | 'partially_approved'
  | 'appealed'
  | 'paid'
  | 'voided'
  | 'suspended';

export type ClaimSource = 'edi_837' | 'portal' | 'fhir' | 'paper' | 'api';

export interface Claim {
  id: string;
  organizationId: string;
  claimNumber: string;
  type: ClaimType;
  status: ClaimStatus;
  source: ClaimSource;

  // Subscriber / Patient
  memberId: string;
  subscriberId: string;
  patientFirstName: string;
  patientLastName: string;
  patientDob: string;
  patientGender: string;
  memberPlanId: string;

  // Provider
  renderingProviderId: string;
  renderingProviderNpi: string;
  renderingProviderName: string;
  billingProviderId?: string;
  billingProviderNpi?: string;
  billingProviderName?: string;
  facilityId?: string;
  facilityName?: string;
  placeOfServiceCode: string;

  // Dates
  serviceFromDate: string;
  serviceToDate: string;
  receivedDate: string;
  processedDate?: string;
  paidDate?: string;

  // Diagnosis
  primaryDiagnosisCode: string;
  primaryDiagnosisDescription: string;
  additionalDiagnosisCodes: DiagnosisCode[];

  // Service Lines
  serviceLines: ClaimServiceLine[];

  // Financial
  totalChargedAmount: number;
  totalAllowedAmount: number;
  totalPaidAmount: number;
  totalMemberResponsibility: number;
  totalDeductible: number;
  totalCopay: number;
  totalCoinsurance: number;

  // Processing
  adjudicationRules?: AdjudicationResult[];
  aiConfidenceScore?: number;
  aiRecommendation?: 'approve' | 'deny' | 'review' | 'pend';
  aiAnalysis?: ClaimAIAnalysis;
  assignedProcessorId?: string;
  assignedProcessorName?: string;

  // Audit
  notes: ClaimNote[];
  adjustmentCodes: AdjustmentCode[];
  ediReferenceNumber?: string;
  checkNumber?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ClaimServiceLine {
  lineNumber: number;
  procedureCode: string;
  procedureDescription: string;
  modifiers: string[];
  revenueCode?: string;
  placeOfServiceCode: string;
  serviceDate: string;
  units: number;
  chargedAmount: number;
  allowedAmount: number;
  paidAmount: number;
  deductibleAmount: number;
  copayAmount: number;
  coinsuranceAmount: number;
  adjustmentCodes: AdjustmentCode[];
  status: 'approved' | 'denied' | 'adjusted' | 'pending';
  denialReasonCode?: string;
  denialReasonDescription?: string;
}

export interface DiagnosisCode {
  code: string;
  description: string;
  type: 'ICD10' | 'ICD9';
  qualifier: 'principal' | 'admitting' | 'other';
}

export interface AdjustmentCode {
  groupCode: 'CO' | 'PR' | 'OA' | 'PI' | 'CR';  // CARC Group Codes
  reasonCode: string;                               // CARC/RARC codes
  description: string;
  amount: number;
}

export interface AdjudicationResult {
  ruleId: string;
  ruleName: string;
  category: string;
  result: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  autoAction?: 'approve' | 'deny' | 'pend' | 'review';
  confidence?: number;
}

export interface ClaimAIAnalysis {
  overallRisk: 'low' | 'medium' | 'high';
  fraudScore: number;
  codingAccuracy: number;
  priceReasonableness: number;
  recommendations: string[];
  flags: string[];
}

export interface ClaimNote {
  id: string;
  claimId: string;
  userId: string;
  userName: string;
  noteType: 'internal' | 'system' | 'adjudication' | 'appeal';
  content: string;
  createdAt: string;
}

export interface ClaimSearchParams {
  query?: string;
  claimNumber?: string;
  memberId?: string;
  providerId?: string;
  status?: ClaimStatus | ClaimStatus[];
  type?: ClaimType;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  aiRecommendation?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClaimsSummaryStats {
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  deniedClaims: number;
  totalChargedAmount: number;
  totalPaidAmount: number;
  averageProcessingDays: number;
  autoAdjudicationRate: number;
  aiAccuracy: number;
}

// Auto-adjudication rule definition
export interface AdjudicationRule {
  id: string;
  name: string;
  description: string;
  category: 'eligibility' | 'authorization' | 'coding' | 'pricing' | 'duplicate' | 'timely_filing' | 'fraud';
  priority: number;
  isActive: boolean;
  conditions: RuleCondition[];
  action: 'approve' | 'deny' | 'pend' | 'review';
  denialReasonCode?: string;
  version: number;
  effectiveDate: string;
  terminationDate?: string;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in' | 'between' | 'regex';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}
