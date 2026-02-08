// ═══════════════════════════════════════════════════════
// Eligibility & Enrollment Types
// EDI 270/271 compliant structures
// ═══════════════════════════════════════════════════════

export type EligibilityStatus = 'active' | 'inactive' | 'terminated' | 'pending' | 'cobra';
export type EnrollmentEventType =
  | 'new_hire'
  | 'open_enrollment'
  | 'qualifying_event'
  | 'cobra'
  | 'termination'
  | 'reinstatement'
  | 'plan_change'
  | 'dependent_add'
  | 'dependent_remove';

export interface EligibilityInquiry {
  // Maps to EDI 270 transaction
  inquiryId: string;
  organizationId: string;
  requestDate: string;
  memberId?: string;
  subscriberId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  memberIdNumber?: string;
  groupNumber?: string;
  serviceTypeCode?: string;     // EDI Service Type Code (30=Health Plan, 33=Chiro, etc.)
  procedureCode?: string;
  diagnosisCode?: string;
  providerNpi?: string;
  serviceDate?: string;
}

export interface EligibilityResponse {
  // Maps to EDI 271 transaction
  responseId: string;
  inquiryId: string;
  responseDate: string;
  status: EligibilityStatus;
  isEligible: boolean;

  // Subscriber Information
  subscriber: {
    memberId: string;
    subscriberId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    relationship: string;
  };

  // Plan Information
  plan: {
    planId: string;
    planName: string;
    groupId: string;
    groupName: string;
    planType: string;            // HMO, PPO, EPO, POS, HDHP
    effectiveDate: string;
    terminationDate?: string;
    payerName: string;
    payerId: string;
  };

  // Benefits
  benefits: EligibilityBenefit[];

  // Accumulators
  accumulators: {
    deductibleIndividualInNetwork: { used: number; remaining: number; limit: number };
    deductibleIndividualOutOfNetwork: { used: number; remaining: number; limit: number };
    deductibleFamilyInNetwork: { used: number; remaining: number; limit: number };
    deductibleFamilyOutOfNetwork: { used: number; remaining: number; limit: number };
    oopMaxIndividualInNetwork: { used: number; remaining: number; limit: number };
    oopMaxIndividualOutOfNetwork: { used: number; remaining: number; limit: number };
    oopMaxFamilyInNetwork: { used: number; remaining: number; limit: number };
    oopMaxFamilyOutOfNetwork: { used: number; remaining: number; limit: number };
  };

  // Authorization Requirements
  authorizationRequired?: boolean;
  authorizationNotes?: string;

  // EDI Reference
  ediTraceNumber?: string;
  ediResponseCode?: string;
}

export interface EligibilityBenefit {
  serviceTypeCode: string;
  serviceTypeDescription: string;
  coverageLevel: 'individual' | 'family' | 'employee_only' | 'employee_spouse' | 'employee_children';
  inNetwork: BenefitDetail;
  outOfNetwork: BenefitDetail;
  priorAuthRequired: boolean;
  referralRequired: boolean;
  limitations?: string[];
  exclusions?: string[];
}

export interface BenefitDetail {
  covered: boolean;
  copay?: number;
  coinsurancePercent?: number;
  deductibleApplies: boolean;
  visitLimit?: number;
  visitLimitPeriod?: 'year' | 'lifetime';
  dollarLimit?: number;
  dollarLimitPeriod?: 'year' | 'lifetime';
  waitingPeriodDays?: number;
}

export interface EnrollmentEvent {
  id: string;
  organizationId: string;
  type: EnrollmentEventType;
  memberId: string;
  subscriberId: string;
  groupId: string;
  planId: string;
  effectiveDate: string;
  receivedDate: string;
  processedDate?: string;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'rejected';
  errorMessages?: string[];
  ediTransactionId?: string;     // EDI 834 reference
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BenefitPlan {
  id: string;
  organizationId: string;
  planName: string;
  planId: string;
  planType: 'HMO' | 'PPO' | 'EPO' | 'POS' | 'HDHP' | 'Medicare' | 'Medicaid';
  effectiveDate: string;
  terminationDate?: string;
  isActive: boolean;
  metalLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
  benefits: EligibilityBenefit[];
  deductibles: {
    individualInNetwork: number;
    individualOutOfNetwork: number;
    familyInNetwork: number;
    familyOutOfNetwork: number;
  };
  oopMaximums: {
    individualInNetwork: number;
    individualOutOfNetwork: number;
    familyInNetwork: number;
    familyOutOfNetwork: number;
  };
  premiums?: {
    employeeOnly: number;
    employeeSpouse: number;
    employeeChildren: number;
    family: number;
  };
}
