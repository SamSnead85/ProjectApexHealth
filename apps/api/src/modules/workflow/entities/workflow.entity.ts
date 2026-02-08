import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export type WorkflowStatus = 'draft' | 'active' | 'inactive' | 'archived';
export type WorkflowTrigger = 'manual' | 'schedule' | 'event' | 'api';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'delay' | 'notification' | 'api_call' | 'transform';
  config: Record<string, any>;
  nextStepId?: string;
  onSuccessStepId?: string;
  onFailureStepId?: string;
  position: { x: number; y: number };
}

@Entity({ schema: 'workflow', name: 'definitions' })
@Index(['organizationId', 'status'])
@Index(['organizationId', 'name'])
export class WorkflowEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: WorkflowStatus;

  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string;

  // ─── Trigger ─────────────────────────────────────────
  @Column({ name: 'trigger_type', type: 'varchar', length: 20, default: 'manual' })
  triggerType: WorkflowTrigger;

  @Column({ name: 'trigger_config', type: 'jsonb', default: '{}' })
  triggerConfig: Record<string, any>;

  // ─── Steps ───────────────────────────────────────────
  @Column({ type: 'jsonb', default: '[]' })
  steps: WorkflowStep[];

  // ─── Metadata ────────────────────────────────────────
  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'created_by_name', type: 'varchar', length: 200 })
  createdByName: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  @Column({ name: 'execution_count', type: 'integer', default: 0 })
  executionCount: number;

  @Column({ name: 'last_executed_at', type: 'timestamptz', nullable: true })
  lastExecutedAt?: Date;

  // ─── Timestamps ──────────────────────────────────────
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
