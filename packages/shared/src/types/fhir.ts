// ═══════════════════════════════════════════════════════
// FHIR R4 Types (Subset for Apex Platform)
// CMS Interoperability Rule compliant
// ═══════════════════════════════════════════════════════

export interface FHIRBundle {
  resourceType: 'Bundle';
  type: 'searchset' | 'collection' | 'transaction' | 'batch';
  total?: number;
  link?: Array<{ relation: string; url: string }>;
  entry?: FHIRBundleEntry[];
}

export interface FHIRBundleEntry {
  fullUrl?: string;
  resource: FHIRResource;
  search?: { mode: 'match' | 'include' | 'outcome' };
}

export type FHIRResource =
  | FHIRPatient
  | FHIRCoverage
  | FHIRClaim
  | FHIRExplanationOfBenefit
  | FHIRPractitioner
  | FHIROrganization;

// FHIR Patient Resource
export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  meta?: { lastUpdated: string; versionId: string };
  identifier: Array<{
    system: string;
    value: string;
    type?: { coding: Array<{ system: string; code: string }> };
  }>;
  name: Array<{
    use: 'official' | 'usual' | 'temp';
    family: string;
    given: string[];
    prefix?: string[];
    suffix?: string[];
  }>;
  telecom?: Array<{
    system: 'phone' | 'email' | 'fax';
    value: string;
    use?: 'home' | 'work' | 'mobile';
  }>;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
  address?: Array<{
    use?: 'home' | 'work' | 'temp';
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  maritalStatus?: { coding: Array<{ system: string; code: string; display: string }> };
  communication?: Array<{
    language: { coding: Array<{ system: string; code: string; display: string }> };
    preferred?: boolean;
  }>;
}

// FHIR Coverage Resource
export interface FHIRCoverage {
  resourceType: 'Coverage';
  id: string;
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  type?: { coding: Array<{ system: string; code: string; display: string }> };
  subscriber?: { reference: string };
  beneficiary: { reference: string };
  relationship?: { coding: Array<{ system: string; code: string; display: string }> };
  period?: { start: string; end?: string };
  payor: Array<{ reference: string; display?: string }>;
  class?: Array<{
    type: { coding: Array<{ system: string; code: string }> };
    value: string;
    name?: string;
  }>;
}

// FHIR Claim Resource
export interface FHIRClaim {
  resourceType: 'Claim';
  id: string;
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  type: { coding: Array<{ system: string; code: string; display: string }> };
  use: 'claim' | 'preauthorization' | 'predetermination';
  patient: { reference: string };
  created: string;
  provider: { reference: string };
  priority: { coding: Array<{ system: string; code: string }> };
  insurance: Array<{
    sequence: number;
    focal: boolean;
    coverage: { reference: string };
  }>;
  diagnosis?: Array<{
    sequence: number;
    diagnosisCodeableConcept: { coding: Array<{ system: string; code: string; display: string }> };
    type?: Array<{ coding: Array<{ system: string; code: string }> }>;
  }>;
  item?: Array<{
    sequence: number;
    productOrService: { coding: Array<{ system: string; code: string; display: string }> };
    servicedDate?: string;
    servicedPeriod?: { start: string; end: string };
    quantity?: { value: number };
    unitPrice?: { value: number; currency: string };
    net?: { value: number; currency: string };
  }>;
  total?: { value: number; currency: string };
}

// FHIR ExplanationOfBenefit Resource (EOB)
export interface FHIRExplanationOfBenefit {
  resourceType: 'ExplanationOfBenefit';
  id: string;
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  type: { coding: Array<{ system: string; code: string; display: string }> };
  use: 'claim' | 'preauthorization' | 'predetermination';
  patient: { reference: string };
  created: string;
  insurer: { reference: string };
  provider: { reference: string };
  outcome: 'queued' | 'complete' | 'error' | 'partial';
  disposition?: string;
  insurance: Array<{
    focal: boolean;
    coverage: { reference: string };
  }>;
  total?: Array<{
    category: { coding: Array<{ system: string; code: string; display: string }> };
    amount: { value: number; currency: string };
  }>;
  payment?: {
    type?: { coding: Array<{ system: string; code: string }> };
    date?: string;
    amount?: { value: number; currency: string };
  };
}

// FHIR Practitioner Resource
export interface FHIRPractitioner {
  resourceType: 'Practitioner';
  id: string;
  identifier: Array<{ system: string; value: string }>;
  name: Array<{ family: string; given: string[]; prefix?: string[]; suffix?: string[] }>;
  telecom?: Array<{ system: string; value: string; use?: string }>;
  address?: Array<{ line?: string[]; city?: string; state?: string; postalCode?: string }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  qualification?: Array<{
    code: { coding: Array<{ system: string; code: string; display: string }> };
    period?: { start: string; end?: string };
    issuer?: { display: string };
  }>;
}

// FHIR Organization Resource
export interface FHIROrganization {
  resourceType: 'Organization';
  id: string;
  identifier: Array<{ system: string; value: string }>;
  active: boolean;
  type?: Array<{ coding: Array<{ system: string; code: string; display: string }> }>;
  name: string;
  telecom?: Array<{ system: string; value: string; use?: string }>;
  address?: Array<{ line?: string[]; city?: string; state?: string; postalCode?: string }>;
}
