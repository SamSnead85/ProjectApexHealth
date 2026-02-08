import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export type DocumentStatus = 'uploading' | 'processing' | 'active' | 'archived' | 'deleted';
export type DocumentCategory =
  | 'claim_attachment'
  | 'prior_auth'
  | 'medical_record'
  | 'id_card'
  | 'eob'
  | 'correspondence'
  | 'contract'
  | 'credentialing'
  | 'compliance'
  | 'other';
export type AccessLevel = 'public' | 'internal' | 'confidential' | 'restricted';

@Entity({ schema: 'documents', name: 'documents' })
@Index(['organizationId', 'status'])
@Index(['organizationId', 'category'])
@Index(['memberId'])
@Index(['claimId'])
@Index(['priorAuthId'])
@Index(['providerId'])
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  // ─── Metadata ────────────────────────────────────────
  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 30, default: 'other' })
  category: DocumentCategory;

  @Column({ type: 'varchar', length: 20, default: 'uploading' })
  status: DocumentStatus;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @Column({ name: 'file_name', type: 'varchar', length: 500 })
  fileName: string;

  @Column({ name: 'storage_key', type: 'varchar', length: 1000 })
  storageKey: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  checksum?: string;

  // ─── PHI / Compliance ────────────────────────────────
  @Column({ name: 'contains_phi', type: 'boolean', default: false })
  containsPhi: boolean;

  @Column({ name: 'phi_categories', type: 'text', array: true, default: '{}' })
  phiCategories: string[];

  // ─── Linked Entities ─────────────────────────────────
  @Column({ name: 'member_id', type: 'uuid', nullable: true })
  memberId?: string;

  @Column({ name: 'claim_id', type: 'uuid', nullable: true })
  claimId?: string;

  @Column({ name: 'prior_auth_id', type: 'uuid', nullable: true })
  priorAuthId?: string;

  @Column({ name: 'provider_id', type: 'uuid', nullable: true })
  providerId?: string;

  // ─── AI / OCR ────────────────────────────────────────
  @Column({ name: 'ocr_processed', type: 'boolean', default: false })
  ocrProcessed: boolean;

  @Column({ name: 'ocr_text', type: 'text', nullable: true })
  ocrText?: string;

  @Column({ name: 'ai_classification', type: 'varchar', length: 100, nullable: true })
  aiClassification?: string;

  @Column({ name: 'ai_confidence', type: 'decimal', precision: 5, scale: 4, nullable: true })
  aiConfidence?: number;

  @Column({ name: 'extracted_data', type: 'jsonb', nullable: true })
  extractedData?: Record<string, any>;

  // ─── Access Control ──────────────────────────────────
  @Column({ name: 'access_level', type: 'varchar', length: 20, default: 'internal' })
  accessLevel: AccessLevel;

  @Column({ name: 'allowed_roles', type: 'text', array: true, default: '{}' })
  allowedRoles: string[];

  // ─── Upload / Audit ──────────────────────────────────
  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy: string;

  @Column({ name: 'uploaded_by_name', type: 'varchar', length: 200 })
  uploadedByName: string;

  @Column({ name: 'last_accessed_at', type: 'timestamptz', nullable: true })
  lastAccessedAt?: Date;

  @Column({ name: 'last_accessed_by', type: 'uuid', nullable: true })
  lastAccessedBy?: string;

  @Column({ name: 'access_count', type: 'integer', default: 0 })
  accessCount: number;

  // ─── Timestamps ──────────────────────────────────────
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
