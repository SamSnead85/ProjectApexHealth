import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index, ManyToOne, JoinColumn,
} from 'typeorm';
import { WorkflowEntity } from './workflow.entity';

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';

export interface StepExecution {
  stepId: string;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
}

@Entity({ schema: 'workflow', name: 'executions' })
@Index(['organizationId', 'status'])
@Index(['workflowId', 'status'])
@Index(['organizationId', 'createdAt'])
export class WorkflowExecutionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ name: 'workflow_id', type: 'uuid' })
  @Index()
  workflowId: string;

  @Column({ name: 'workflow_name', type: 'varchar', length: 200 })
  workflowName: string;

  @Column({ name: 'workflow_version', type: 'integer' })
  workflowVersion: number;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: ExecutionStatus;

  // ─── Execution Data ──────────────────────────────────
  @Column({ name: 'trigger_type', type: 'varchar', length: 20 })
  triggerType: string;

  @Column({ name: 'trigger_data', type: 'jsonb', nullable: true })
  triggerData?: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  input: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  output?: Record<string, any>;

  @Column({ name: 'step_executions', type: 'jsonb', default: '[]' })
  stepExecutions: StepExecution[];

  @Column({ name: 'current_step_id', type: 'varchar', length: 100, nullable: true })
  currentStepId?: string;

  // ─── Timing ──────────────────────────────────────────
  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @Column({ name: 'duration_ms', type: 'integer', nullable: true })
  durationMs?: number;

  // ─── Error Handling ──────────────────────────────────
  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retryCount: number;

  // ─── Metadata ────────────────────────────────────────
  @Column({ name: 'initiated_by', type: 'uuid', nullable: true })
  initiatedBy?: string;

  @Column({ name: 'initiated_by_name', type: 'varchar', length: 200, nullable: true })
  initiatedByName?: string;

  // ─── Timestamps ──────────────────────────────────────
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // ─── Relations ───────────────────────────────────────
  @ManyToOne(() => WorkflowEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'workflow_id' })
  workflow?: WorkflowEntity;
}
