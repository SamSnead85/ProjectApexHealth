// ═══════════════════════════════════════════════════════
// EDI X12 Transaction Types
// HIPAA-compliant EDI transaction processing
// ═══════════════════════════════════════════════════════

export type EDITransactionType =
  | '270'   // Eligibility Inquiry
  | '271'   // Eligibility Response
  | '276'   // Claim Status Inquiry
  | '277'   // Claim Status Response
  | '837P'  // Professional Claim
  | '837I'  // Institutional Claim
  | '835'   // Payment/Remittance
  | '834'   // Enrollment/Disenrollment
  | '820'   // Premium Payment
  | '999'   // Acknowledgment
  | '277CA'; // Claim Acknowledgment

export type EDIDirection = 'inbound' | 'outbound';
export type EDIStatus = 'received' | 'validating' | 'valid' | 'invalid' | 'processing' | 'processed' | 'error' | 'acknowledged';

export interface EDITransaction {
  id: string;
  organizationId: string;
  transactionType: EDITransactionType;
  direction: EDIDirection;
  status: EDIStatus;

  // Interchange Control
  isaControlNumber: string;
  senderId: string;
  senderQualifier: string;
  receiverId: string;
  receiverQualifier: string;

  // Functional Group
  gsControlNumber: string;
  functionalIdentifierCode: string;

  // Transaction Set
  stControlNumber: string;
  transactionSetCount: number;

  // Content
  rawContent: string;           // Original EDI content
  parsedContent: Record<string, any>;  // Parsed JSON representation
  validationErrors: EDIValidationError[];

  // File Info
  fileName?: string;
  fileSize?: number;

  // Processing
  processedRecords?: number;
  errorRecords?: number;
  relatedEntityIds?: string[];   // Claim IDs, member IDs, etc.

  // Clearinghouse
  clearinghouseName?: string;
  clearinghouseReferenceId?: string;

  receivedAt: string;
  processedAt?: string;
  acknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EDIValidationError {
  level: 'error' | 'warning' | 'info';
  snipLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7;  // WEDI SNIP levels
  segmentId: string;
  elementId: string;
  loopId?: string;
  errorCode: string;
  description: string;
  position?: number;
}

// EDI 837 Professional Claim Structure
export interface EDI837PClaim {
  patientInfo: {
    memberId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    address: {
      line1: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  subscriberInfo: {
    subscriberId: string;
    firstName: string;
    lastName: string;
    relationship: string;
    groupNumber: string;
    payerId: string;
  };
  billingProvider: {
    npi: string;
    taxId: string;
    name: string;
    address: {
      line1: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  renderingProvider: {
    npi: string;
    firstName: string;
    lastName: string;
    taxonomy: string;
  };
  claimInfo: {
    claimId: string;
    totalCharge: number;
    placeOfServiceCode: string;
    frequencyCode: string;
    signatureIndicator: string;
    assignmentOfBenefits: string;
    releaseOfInfo: string;
    patientSignatureSource: string;
  };
  diagnosisCodes: Array<{
    code: string;
    qualifier: 'ABK' | 'ABF' | 'ABJ'; // ICD-10, ICD-9, ICD-10-PCS
    pointer: number;
  }>;
  serviceLines: Array<{
    procedureCode: string;
    modifiers: string[];
    diagnosisPointers: number[];
    chargeAmount: number;
    units: number;
    placeOfServiceCode: string;
    serviceDate: string;
    serviceDateEnd?: string;
    renderingProviderNpi?: string;
  }>;
}

// EDI 835 Remittance Structure
export interface EDI835Remittance {
  payerInfo: {
    payerName: string;
    payerId: string;
    address: {
      line1: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  payeeInfo: {
    payeeName: string;
    npi: string;
    taxId: string;
  };
  paymentInfo: {
    checkNumber: string;
    paymentMethod: 'CHK' | 'ACH' | 'FWT' | 'NON';
    paymentAmount: number;
    paymentDate: string;
    traceNumber: string;
  };
  claims: Array<{
    claimId: string;
    patientName: string;
    memberId: string;
    chargedAmount: number;
    paidAmount: number;
    patientResponsibility: number;
    serviceLines: Array<{
      procedureCode: string;
      chargedAmount: number;
      allowedAmount: number;
      paidAmount: number;
      adjustments: Array<{
        groupCode: string;
        reasonCode: string;
        amount: number;
      }>;
    }>;
  }>;
}

export interface EDISearchParams {
  transactionType?: EDITransactionType;
  direction?: EDIDirection;
  status?: EDIStatus;
  senderId?: string;
  receiverId?: string;
  dateFrom?: string;
  dateTo?: string;
  hasErrors?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
