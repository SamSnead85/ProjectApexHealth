// ═══════════════════════════════════════════════════════
// Document Management Types (HIPAA-compliant)
// ═══════════════════════════════════════════════════════

export type DocumentCategory =
  | 'claim_form'
  | 'medical_record'
  | 'lab_result'
  | 'imaging'
  | 'clinical_note'
  | 'prior_auth'
  | 'appeal'
  | 'eob'
  | 'consent_form'
  | 'id_card'
  | 'correspondence'
  | 'contract'
  | 'credentialing'
  | 'enrollment'
  | 'invoice'
  | 'other';

export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'archived' | 'deleted';

export interface Document {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  status: DocumentStatus;
  mimeType: string;
  fileSize: number;
  fileName: string;
  storageKey: string;           // S3/MinIO object key (encrypted)
  checksum: string;             // SHA-256 for integrity verification

  // PHI Classification
  containsPhi: boolean;
  phiCategories?: string[];     // e.g., ['patient_name', 'dob', 'ssn', 'medical_record']

  // Associations
  memberId?: string;
  claimId?: string;
  priorAuthId?: string;
  providerId?: string;
  appealId?: string;

  // AI Processing
  ocrProcessed: boolean;
  ocrText?: string;
  aiClassification?: string;
  aiConfidence?: number;
  extractedData?: Record<string, any>;

  // Access Control
  accessLevel: 'public' | 'organization' | 'department' | 'restricted';
  allowedRoles?: string[];

  // Audit
  uploadedBy: string;
  uploadedByName: string;
  lastAccessedAt?: string;
  lastAccessedBy?: string;
  accessCount: number;

  createdAt: string;
  updatedAt: string;
}

export interface DocumentUploadDto {
  title: string;
  category: DocumentCategory;
  description?: string;
  containsPhi: boolean;
  memberId?: string;
  claimId?: string;
  priorAuthId?: string;
  providerId?: string;
  accessLevel?: 'public' | 'organization' | 'department' | 'restricted';
}

export interface DocumentSearchParams {
  query?: string;
  category?: DocumentCategory;
  memberId?: string;
  claimId?: string;
  status?: DocumentStatus;
  containsPhi?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
