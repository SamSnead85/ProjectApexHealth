import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowEntity } from './entities/workflow.entity';
import { WorkflowExecutionEntity, StepExecution } from './entities/workflow-execution.entity';
import {
  CreateWorkflowDto, UpdateWorkflowDto, ExecuteWorkflowDto,
  SearchWorkflowDto, SearchExecutionDto,
} from './dto/workflow.dto';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    @InjectRepository(WorkflowEntity)
    private readonly workflowRepository: Repository<WorkflowEntity>,
    @InjectRepository(WorkflowExecutionEntity)
    private readonly executionRepository: Repository<WorkflowExecutionEntity>,
  ) {}

  // ─── Workflow Definition CRUD ────────────────────────

  async create(
    dto: CreateWorkflowDto,
    userId: string,
    userName: string,
    organizationId: string,
  ): Promise<WorkflowEntity> {
    const workflow = this.workflowRepository.create({
      ...dto,
      organizationId,
      status: 'draft',
      version: 1,
      createdBy: userId,
      createdByName: userName,
      executionCount: 0,
      steps: dto.steps.map((step) => ({
        ...step,
        position: step.position || { x: 0, y: 0 },
      })),
    });

    const saved = await this.workflowRepository.save(workflow);
    this.logger.log(`Workflow created: ${saved.name} (${saved.id}) by ${userName}`);
    return saved;
  }

  async findById(id: string, organizationId: string): Promise<WorkflowEntity> {
    const workflow = await this.workflowRepository.findOne({
      where: { id, organizationId },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }

    return workflow;
  }

  async update(
    id: string,
    dto: UpdateWorkflowDto,
    userId: string,
    organizationId: string,
  ): Promise<WorkflowEntity> {
    const workflow = await this.findById(id, organizationId);

    if (workflow.status === 'archived') {
      throw new BadRequestException('Cannot update an archived workflow');
    }

    Object.assign(workflow, dto);
    workflow.updatedBy = userId;
    workflow.version += 1;

    const updated = await this.workflowRepository.save(workflow);
    this.logger.log(`Workflow updated: ${updated.id} -> v${updated.version}`);
    return updated;
  }

  async activate(id: string, organizationId: string): Promise<WorkflowEntity> {
    const workflow = await this.findById(id, organizationId);

    if (workflow.steps.length === 0) {
      throw new BadRequestException('Cannot activate a workflow with no steps');
    }

    workflow.status = 'active';
    return this.workflowRepository.save(workflow);
  }

  async deactivate(id: string, organizationId: string): Promise<WorkflowEntity> {
    const workflow = await this.findById(id, organizationId);
    workflow.status = 'inactive';
    return this.workflowRepository.save(workflow);
  }

  async searchWorkflows(params: SearchWorkflowDto, organizationId: string): Promise<{
    data: WorkflowEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 25;

    const qb = this.workflowRepository.createQueryBuilder('wf');
    qb.where('wf.organization_id = :organizationId', { organizationId });

    if (params.query) {
      qb.andWhere('(wf.name ILIKE :query OR wf.description ILIKE :query)', {
        query: `%${params.query}%`,
      });
    }

    if (params.status) {
      qb.andWhere('wf.status = :status', { status: params.status });
    }

    if (params.category) {
      qb.andWhere('wf.category = :category', { category: params.category });
    }

    qb.orderBy('wf.updated_at', 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Workflow Execution ──────────────────────────────

  async execute(
    workflowId: string,
    dto: ExecuteWorkflowDto,
    userId: string,
    userName: string,
    organizationId: string,
  ): Promise<WorkflowExecutionEntity> {
    const workflow = await this.findById(workflowId, organizationId);

    if (workflow.status !== 'active') {
      throw new BadRequestException(`Workflow is not active (status: ${workflow.status})`);
    }

    // Create execution record
    const execution = this.executionRepository.create({
      organizationId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      workflowVersion: workflow.version,
      status: 'pending',
      triggerType: 'manual',
      triggerData: dto.triggerData,
      input: dto.input || {},
      stepExecutions: workflow.steps.map((step) => ({
        stepId: step.id,
        stepName: step.name,
        status: 'pending' as const,
      })),
      initiatedBy: userId,
      initiatedByName: userName,
    });

    let saved = await this.executionRepository.save(execution);

    // Execute steps (simplified synchronous execution)
    saved.status = 'running';
    saved.startedAt = new Date();
    await this.executionRepository.save(saved);

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        const stepExec = saved.stepExecutions[i];

        stepExec.status = 'running';
        stepExec.startedAt = new Date().toISOString();
        saved.currentStepId = step.id;
        await this.executionRepository.save(saved);

        // Simulate step execution
        // In production, this would dispatch to the appropriate step handler
        await new Promise((resolve) => setTimeout(resolve, 10));

        stepExec.status = 'completed';
        stepExec.completedAt = new Date().toISOString();
        stepExec.duration = 10;
        stepExec.output = { result: 'success' };
        await this.executionRepository.save(saved);
      }

      saved.status = 'completed';
      saved.completedAt = new Date();
      saved.durationMs = saved.completedAt.getTime() - saved.startedAt.getTime();
      saved.output = { result: 'All steps completed successfully' };
    } catch (error) {
      saved.status = 'failed';
      saved.completedAt = new Date();
      saved.durationMs = saved.completedAt.getTime() - (saved.startedAt?.getTime() || 0);
      saved.error = error.message;
      this.logger.error(`Workflow execution failed: ${saved.id} - ${error.message}`);
    }

    // Update workflow stats
    workflow.executionCount += 1;
    workflow.lastExecutedAt = new Date();
    await this.workflowRepository.save(workflow);

    saved = await this.executionRepository.save(saved);
    this.logger.log(
      `Workflow executed: ${workflow.name} -> ${saved.status} (${saved.durationMs}ms)`,
    );

    return saved;
  }

  async getExecution(executionId: string, organizationId: string): Promise<WorkflowExecutionEntity> {
    const execution = await this.executionRepository.findOne({
      where: { id: executionId, organizationId },
    });

    if (!execution) {
      throw new NotFoundException(`Workflow execution ${executionId} not found`);
    }

    return execution;
  }

  async listExecutions(params: SearchExecutionDto, organizationId: string): Promise<{
    data: WorkflowExecutionEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 25;

    const qb = this.executionRepository.createQueryBuilder('exec');
    qb.where('exec.organization_id = :organizationId', { organizationId });

    if (params.workflowId) {
      qb.andWhere('exec.workflow_id = :workflowId', { workflowId: params.workflowId });
    }

    if (params.status) {
      qb.andWhere('exec.status = :status', { status: params.status });
    }

    qb.orderBy('exec.created_at', 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async cancelExecution(executionId: string, organizationId: string): Promise<WorkflowExecutionEntity> {
    const execution = await this.getExecution(executionId, organizationId);

    if (!['pending', 'running', 'paused'].includes(execution.status)) {
      throw new BadRequestException(`Cannot cancel execution in status: ${execution.status}`);
    }

    execution.status = 'cancelled';
    execution.completedAt = new Date();
    if (execution.startedAt) {
      execution.durationMs = execution.completedAt.getTime() - execution.startedAt.getTime();
    }

    return this.executionRepository.save(execution);
  }
}
