/**
 * Healthcare Compliance Constants
 *
 * Centralized reference for HIPAA, CMS, claims, quality measures,
 * and EDI validation constants used across the Apex Health Platform.
 */

// ─────────────────────────────────────────────────
//  HIPAA Required Audit Actions
// ─────────────────────────────────────────────────

export const HIPAA_AUDIT_ACTIONS = {
  /** User authenticated successfully */
  LOGIN: 'LOGIN',
  /** User ended session */
  LOGOUT: 'LOGOUT',
  /** Authentication attempt failed */
  FAILED_LOGIN: 'FAILED_LOGIN',
  /** Record created */
  CREATE: 'CREATE',
  /** Record viewed/read */
  READ: 'READ',
  /** Record modified */
  UPDATE: 'UPDATE',
  /** Record deleted or deactivated */
  DELETE: 'DELETE',
  /** Data exported (CSV, PDF, HL7, etc.) */
  EXPORT: 'EXPORT',
  /** Data printed */
  PRINT: 'PRINT',
  /** Fax sent containing PHI */
  FAX: 'FAX',
  /** Access denied due to insufficient permissions */
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  /** Emergency override ("break the glass") for PHI access */
  BREAK_GLASS: 'BREAK_GLASS',
  /** User account created or modified */
  USER_MANAGEMENT: 'USER_MANAGEMENT',
  /** Role or permission change */
  PERMISSION_CHANGE: 'PERMISSION_CHANGE',
  /** System configuration change */
  CONFIGURATION_CHANGE: 'CONFIGURATION_CHANGE',
  /** PHI disclosed to an external party */
  PHI_DISCLOSURE: 'PHI_DISCLOSURE',
  /** Encryption key rotated */
  KEY_ROTATION: 'KEY_ROTATION',
  /** Backup or restore operation */
  BACKUP_RESTORE: 'BACKUP_RESTORE',
} as const;

export type HipaaAuditAction = typeof HIPAA_AUDIT_ACTIONS[keyof typeof HIPAA_AUDIT_ACTIONS];

// ─────────────────────────────────────────────────
//  CMS Prior Authorization Decision Timeframes
// ─────────────────────────────────────────────────

export const CMS_PRIOR_AUTH_TIMEFRAMES = {
  /** Urgent/expedited: 72 hours */
  URGENT: {
    label: 'Urgent / Expedited',
    hours: 72,
    description: 'Life-threatening or urgent clinical situations',
  },
  /** Standard: 7 calendar days */
  STANDARD: {
    label: 'Standard',
    hours: 168, // 7 × 24
    description: 'Routine prior authorization requests',
  },
  /** Extension: 14 calendar days */
  EXTENSION: {
    label: 'Extension',
    hours: 336, // 14 × 24
    description: 'Extension of previously authorized services',
  },
  /** Post-stabilization: 1 hour (for emergency services) */
  POST_STABILIZATION: {
    label: 'Post-Stabilization',
    hours: 1,
    description: 'Post-stabilization care following emergency admission',
  },
  /** Concurrent review: 24 hours */
  CONCURRENT_REVIEW: {
    label: 'Concurrent Review',
    hours: 24,
    description: 'Ongoing review for continued inpatient stay',
  },
} as const;

// ─────────────────────────────────────────────────
//  Claims Filing Deadlines by Payer Type
// ─────────────────────────────────────────────────

export const CLAIMS_FILING_DEADLINES = {
  MEDICARE: {
    label: 'Medicare',
    deadlineDays: 365,
    description: 'One calendar year from date of service',
  },
  MEDICAID: {
    label: 'Medicaid',
    deadlineDays: 365,
    description: 'One year; varies by state (180-365 days)',
  },
  COMMERCIAL: {
    label: 'Commercial',
    deadlineDays: 90,
    description: 'Typically 90 days; varies by contract (60-180 days)',
  },
  TRICARE: {
    label: 'TRICARE',
    deadlineDays: 365,
    description: 'One year from date of service',
  },
  WORKERS_COMP: {
    label: "Workers' Compensation",
    deadlineDays: 180,
    description: 'Typically 180 days; varies by state jurisdiction',
  },
  VA: {
    label: 'Veterans Affairs',
    deadlineDays: 365,
    description: 'One year from date of service',
  },
  CHAMPVA: {
    label: 'CHAMPVA',
    deadlineDays: 365,
    description: 'One year from date of service',
  },
} as const;

// ─────────────────────────────────────────────────
//  CARC / RARC Reason Code Categories
// ─────────────────────────────────────────────────

export const CARC_CATEGORIES = {
  /** Contractual obligation adjustments */
  CONTRACTUAL_OBLIGATION: {
    prefix: 'CO',
    description: 'Contractual Obligation — adjustment per contract terms',
    codeRange: '1-299',
  },
  /** Patient responsibility */
  PATIENT_RESPONSIBILITY: {
    prefix: 'PR',
    description: 'Patient Responsibility — amount owed by the patient',
    codeRange: '1-299',
  },
  /** Other adjustments */
  OTHER_ADJUSTMENT: {
    prefix: 'OA',
    description: 'Other Adjustment — not covered by other groups',
    codeRange: '1-299',
  },
  /** Payer-initiated reductions */
  PAYER_INITIATED: {
    prefix: 'PI',
    description: 'Payer-Initiated Reduction — payer adjustment not contractual',
    codeRange: '1-299',
  },
} as const;

export const COMMON_CARC_CODES: Record<string, { code: string; description: string }> = {
  /** Deductible amount */
  DEDUCTIBLE: { code: '1', description: 'Deductible Amount' },
  /** Coinsurance amount */
  COINSURANCE: { code: '2', description: 'Coinsurance Amount' },
  /** Copayment amount */
  COPAYMENT: { code: '3', description: 'Co-payment Amount' },
  /** Service not covered by plan */
  NOT_COVERED: { code: '50', description: 'These are non-covered services because this is not deemed a medical necessity by the payer' },
  /** Exceeds fee schedule */
  EXCEEDS_FEE_SCHEDULE: { code: '45', description: 'Charge exceeds fee schedule/maximum allowable' },
  /** Service bundled */
  BUNDLED: { code: '97', description: 'The benefit for this service is included in the payment/allowance for another service' },
  /** Duplicate claim */
  DUPLICATE: { code: '18', description: 'Exact duplicate claim/service' },
  /** Authorization missing */
  AUTH_MISSING: { code: '27', description: 'Expenses incurred after coverage terminated' },
  /** Timely filing */
  TIMELY_FILING: { code: '29', description: 'The time limit for filing has expired' },
};

export const RARC_CATEGORIES = {
  ALERTS: {
    prefix: 'N',
    description: 'Alert — informational notification to the provider',
  },
  REMITTANCE_ADVICE: {
    prefix: 'M',
    description: 'Remittance Advice Remark — supplemental explanation',
  },
  MEDICARE_SPECIFIC: {
    prefix: 'MA',
    description: 'Medicare-specific remittance advice remark',
  },
} as const;

// ─────────────────────────────────────────────────
//  HEDIS Measure IDs and Descriptions
// ─────────────────────────────────────────────────

export interface HedisMeasure {
  id: string;
  abbreviation: string;
  name: string;
  description: string;
  domain: string;
  ageRange?: string;
}

export const HEDIS_MEASURES: HedisMeasure[] = [
  // ── Effectiveness of Care ──────────────
  {
    id: 'HEDIS-BCS',
    abbreviation: 'BCS',
    name: 'Breast Cancer Screening',
    description: 'Percentage of women 50-74 who had a mammogram in the past two years',
    domain: 'Effectiveness of Care',
    ageRange: '50-74',
  },
  {
    id: 'HEDIS-CCS',
    abbreviation: 'CCS',
    name: 'Cervical Cancer Screening',
    description: 'Percentage of women 21-64 who were appropriately screened for cervical cancer',
    domain: 'Effectiveness of Care',
    ageRange: '21-64',
  },
  {
    id: 'HEDIS-COL',
    abbreviation: 'COL',
    name: 'Colorectal Cancer Screening',
    description: 'Percentage of adults 45-75 who are up to date with colorectal cancer screening',
    domain: 'Effectiveness of Care',
    ageRange: '45-75',
  },
  {
    id: 'HEDIS-CDC-HBA1C',
    abbreviation: 'CDC-HbA1c',
    name: 'Comprehensive Diabetes Care — HbA1c Testing',
    description: 'Percentage of diabetic members 18-75 who had an HbA1c test during the year',
    domain: 'Effectiveness of Care',
    ageRange: '18-75',
  },
  {
    id: 'HEDIS-CDC-EYE',
    abbreviation: 'CDC-Eye',
    name: 'Comprehensive Diabetes Care — Eye Exam',
    description: 'Percentage of diabetic members 18-75 who had a retinal eye exam',
    domain: 'Effectiveness of Care',
    ageRange: '18-75',
  },
  {
    id: 'HEDIS-CBP',
    abbreviation: 'CBP',
    name: 'Controlling High Blood Pressure',
    description: 'Percentage of members 18-85 with hypertension whose BP was adequately controlled',
    domain: 'Effectiveness of Care',
    ageRange: '18-85',
  },
  {
    id: 'HEDIS-SPR',
    abbreviation: 'SPR',
    name: 'Statin Therapy for Patients with Cardiovascular Disease',
    description: 'Percentage of males 21-75 and females 40-75 with CVD on statin therapy',
    domain: 'Effectiveness of Care',
  },

  // ── Access / Availability ──────────────
  {
    id: 'HEDIS-AAP',
    abbreviation: 'AAP',
    name: "Adults' Access to Preventive/Ambulatory Health Services",
    description: 'Percentage of adults 20+ who had an ambulatory or preventive care visit',
    domain: 'Access/Availability of Care',
    ageRange: '20+',
  },
  {
    id: 'HEDIS-IET',
    abbreviation: 'IET',
    name: 'Initiation and Engagement of SUD Treatment',
    description: 'Percentage of members with a new SUD episode who initiated and engaged in treatment',
    domain: 'Access/Availability of Care',
    ageRange: '13+',
  },

  // ── Utilization ────────────────────────
  {
    id: 'HEDIS-PCR',
    abbreviation: 'PCR',
    name: 'Plan All-Cause Readmissions',
    description: 'Rate of acute inpatient and observation stays followed by an unplanned readmission within 30 days',
    domain: 'Utilization',
    ageRange: '18+',
  },
  {
    id: 'HEDIS-AMB',
    abbreviation: 'AMB',
    name: 'Ambulatory Care',
    description: 'Utilization of ambulatory care — ED visits and outpatient visits per 1,000 members',
    domain: 'Utilization',
  },

  // ── Experience of Care ─────────────────
  {
    id: 'HEDIS-FMC',
    abbreviation: 'FMC',
    name: 'Follow-Up After Hospitalization for Mental Illness',
    description: 'Percentage of discharges for mental illness with a follow-up visit within 7 and 30 days',
    domain: 'Experience of Care',
    ageRange: '6+',
  },
];

// ─────────────────────────────────────────────────
//  Star Rating Weight Categories (CMS 5-Star)
// ─────────────────────────────────────────────────

export interface StarRatingCategory {
  id: string;
  name: string;
  weight: number;
  description: string;
}

export const STAR_RATING_CATEGORIES: StarRatingCategory[] = [
  {
    id: 'STAR-C01',
    name: 'Staying Healthy: Screenings, Tests and Vaccines',
    weight: 3,
    description: 'Measures related to preventive health services and screenings',
  },
  {
    id: 'STAR-C02',
    name: 'Managing Chronic (Long-Term) Conditions',
    weight: 3,
    description: 'Measures for management of chronic conditions like diabetes and hypertension',
  },
  {
    id: 'STAR-C03',
    name: 'Member Experience with the Health Plan',
    weight: 1.5,
    description: 'CAHPS survey results on overall plan experience',
  },
  {
    id: 'STAR-C04',
    name: 'Member Complaints and Changes in Performance',
    weight: 1.5,
    description: 'Complaints, appeals, and CMS audit/performance measures',
  },
  {
    id: 'STAR-C05',
    name: 'Health Plan Customer Service',
    weight: 1.5,
    description: 'Call center performance and TTY availability',
  },
  {
    id: 'STAR-C06',
    name: 'Drug Plan Customer Service',
    weight: 1.5,
    description: 'Pharmacy customer service and appeals timeliness',
  },
  {
    id: 'STAR-C07',
    name: 'Member Experience with Drug Plan',
    weight: 1,
    description: 'CAHPS survey results for Part D experience',
  },
  {
    id: 'STAR-C08',
    name: 'Drug Safety and Accuracy of Pricing',
    weight: 1,
    description: 'Medication safety practices and pricing transparency',
  },
  {
    id: 'STAR-C09',
    name: 'Drug Plan Improvement',
    weight: 5,
    description: 'Improvement measures for Part D plan performance year-over-year',
  },
];

// ─────────────────────────────────────────────────
//  SNIP (Strategic National Implementation Process)
//  Validation Levels for EDI Transactions
// ─────────────────────────────────────────────────

export interface SnipLevel {
  level: number;
  name: string;
  description: string;
  validations: string[];
}

export const SNIP_VALIDATION_LEVELS: SnipLevel[] = [
  {
    level: 1,
    name: 'Integrity Testing',
    description: 'Basic EDI envelope and syntax validation',
    validations: [
      'Valid ISA/IEA envelope structure',
      'Valid GS/GE functional group structure',
      'Valid ST/SE transaction set structure',
      'Segment terminator consistency',
      'Element separator consistency',
      'Control number matching (ISA13↔IEA02, GS06↔GE02, ST02↔SE02)',
    ],
  },
  {
    level: 2,
    name: 'Requirement Testing',
    description: 'Implementation guide requirement compliance',
    validations: [
      'Required segments are present',
      'Required elements within segments are present',
      'Correct element data types (AN, N, DT, TM, ID, R)',
      'Element minimum/maximum length compliance',
      'Valid code values from implementation guide code sets',
      'Segment repeat count within allowed limits',
    ],
  },
  {
    level: 3,
    name: 'Balancing Testing',
    description: 'Data integrity and mathematical balancing',
    validations: [
      'Monetary totals balance (e.g., claim total = sum of service lines)',
      'Quantity totals balance',
      'Control counts match actual counts',
      'Cross-segment reference integrity',
    ],
  },
  {
    level: 4,
    name: 'Situational Testing',
    description: 'Situational rule validation based on business context',
    validations: [
      'Situational segments present when conditions are met',
      'Situational elements populated when conditions are met',
      'Conditional element relationships enforced (P, R, E, C, L rules)',
      'Situational segments absent when conditions are not met',
    ],
  },
  {
    level: 5,
    name: 'External Code Set Testing',
    description: 'Validation against external reference code sets',
    validations: [
      'Valid ICD-10-CM/PCS diagnosis and procedure codes',
      'Valid CPT/HCPCS procedure codes',
      'Valid NDC (National Drug Code) numbers',
      'Valid NPI (National Provider Identifier) format and checksum',
      'Valid state and ZIP code combinations',
      'Valid taxonomy codes',
    ],
  },
  {
    level: 6,
    name: 'Trading Partner Testing',
    description: 'Trading-partner-specific business rules and agreements',
    validations: [
      'Trading partner ID validation',
      'Sender/receiver qualifier matching',
      'Trading partner-specific code set restrictions',
      'Companion guide requirement compliance',
      'Custom business rule validation per agreement',
    ],
  },
  {
    level: 7,
    name: 'Real-World Testing',
    description: 'End-to-end production-like testing with actual trading partners',
    validations: [
      'Acknowledgment (999/TA1) receipt and validation',
      'Response transaction processing (e.g., 277CA, 835)',
      'Round-trip timing compliance',
      'Error handling and resubmission workflows',
      'Volume and performance testing',
    ],
  },
];

// ─────────────────────────────────────────────────
//  Session & Security Defaults
// ─────────────────────────────────────────────────

export const SESSION_TIMEOUT_DEFAULTS = {
  /** Admin role session timeout in minutes */
  ADMIN_TIMEOUT_MINUTES: 30,
  /** Regular member/user session timeout in minutes */
  MEMBER_TIMEOUT_MINUTES: 15,
  /** Maximum session duration regardless of activity (8 hours) */
  MAX_SESSION_DURATION_MINUTES: 480,
} as const;

export const SECURITY_HEADERS = {
  HSTS: 'max-age=31536000; includeSubDomains; preload',
  CONTENT_TYPE_OPTIONS: 'nosniff',
  FRAME_OPTIONS: 'DENY',
  XSS_PROTECTION: '1; mode=block',
  REFERRER_POLICY: 'strict-origin-when-cross-origin',
  CACHE_CONTROL_PHI: 'no-store, no-cache, must-revalidate',
  PRAGMA_PHI: 'no-cache',
} as const;
