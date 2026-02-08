import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

@Entity({ schema: 'audit', name: 'hipaa_audit_log' })
@Index(['userId', 'timestamp'])
@Index(['organizationId', 'timestamp'])
@Index(['action', 'timestamp'])
@Index(['resourceType', 'resourceId'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  timestamp: Date;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @Column({ name: 'user_email', type: 'varchar', length: 255 })
  userEmail: string;

  @Column({ name: 'user_role', type: 'varchar', length: 100 })
  userRole: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 100 })
  resourceType: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 255, nullable: true })
  resourceId?: string;

  @Column({ name: 'phi_accessed', type: 'boolean', default: false })
  @Index()
  phiAccessed: boolean;

  @Column({ name: 'phi_fields', type: 'text', array: true, nullable: true })
  phiFields?: string[];

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text' })
  userAgent: string;

  @Column({ name: 'request_method', type: 'varchar', length: 10 })
  requestMethod: string;

  @Column({ name: 'request_path', type: 'text' })
  requestPath: string;

  @Column({ name: 'response_status', type: 'integer' })
  responseStatus: number;

  @Column({ type: 'jsonb', nullable: true })
  details?: Record<string, any>;

  @Column({ name: 'session_id', type: 'varchar', length: 255 })
  sessionId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
