// ═══════════════════════════════════════════════════════
// Apex Health Platform - Workflow API Service
// Workflow orchestration, execution, and HITL management
// ═══════════════════════════════════════════════════════

import { apiClient } from './api-client';
import type {
  WorkflowDefinition,
  WorkflowExecution,
  HITLCheckpoint,
} from '../../packages/shared/src/types/workflow';
import type { PaginatedResponse } from '../../packages/shared/src/types/api';

const WORKFLOWS_BASE = '/api/v1/workflows';
const EXECUTIONS_BASE = '/api/v1/workflows/executions';
const HITL_BASE = '/api/v1/workflows/hitl';

// ─── Search Params ───────────────────────────────────────

export interface WorkflowSearchParams {
  query?: string;
  category?: string;
  status?: 'draft' | 'active' | 'paused' | 'archived';
  createdBy?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ExecutionSearchParams {
  workflowId?: string;
  status?: string;
  trigger?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Workflow API ────────────────────────────────────────

export const workflowApi = {
  // ── Workflow Definitions ──────────────────────────

  /**
   * List all workflow definitions with optional filtering.
   */
  async listWorkflows(params?: WorkflowSearchParams): Promise<WorkflowDefinition[]> {
    const response = await apiClient.get<PaginatedResponse<WorkflowDefinition>>(
      WORKFLOWS_BASE,
      params as Record<string, unknown>,
    );
    // If the response comes back as a paginated list, unwrap data;
    // otherwise return the raw array.
    if (Array.isArray(response)) {
      return response;
    }
    return (response as PaginatedResponse<WorkflowDefinition>).data;
  },

  /**
   * Get a single workflow definition by ID.
   */
  async getWorkflow(id: string): Promise<WorkflowDefinition> {
    return apiClient.get<WorkflowDefinition>(`${WORKFLOWS_BASE}/${id}`);
  },

  /**
   * Create a new workflow definition.
   */
  async createWorkflow(data: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    return apiClient.post<WorkflowDefinition>(WORKFLOWS_BASE, data);
  },

  /**
   * Update (save) an existing workflow definition.
   */
  async saveWorkflow(data: Partial<WorkflowDefinition> & { id: string }): Promise<WorkflowDefinition> {
    return apiClient.put<WorkflowDefinition>(`${WORKFLOWS_BASE}/${data.id}`, data);
  },

  /**
   * Delete a workflow definition (draft only).
   */
  async deleteWorkflow(id: string): Promise<void> {
    await apiClient.delete(`${WORKFLOWS_BASE}/${id}`);
  },

  /**
   * Publish a draft workflow to make it active.
   */
  async publishWorkflow(id: string): Promise<WorkflowDefinition> {
    return apiClient.post<WorkflowDefinition>(`${WORKFLOWS_BASE}/${id}/publish`);
  },

  /**
   * Archive an active workflow.
   */
  async archiveWorkflow(id: string): Promise<WorkflowDefinition> {
    return apiClient.post<WorkflowDefinition>(`${WORKFLOWS_BASE}/${id}/archive`);
  },

  /**
   * Clone an existing workflow into a new draft.
   */
  async cloneWorkflow(id: string, name?: string): Promise<WorkflowDefinition> {
    return apiClient.post<WorkflowDefinition>(`${WORKFLOWS_BASE}/${id}/clone`, { name });
  },

  // ── Executions ────────────────────────────────────

  /**
   * Execute (trigger) a workflow.
   */
  async executeWorkflow(
    id: string,
    triggerData?: Record<string, unknown>,
  ): Promise<WorkflowExecution> {
    return apiClient.post<WorkflowExecution>(`${WORKFLOWS_BASE}/${id}/execute`, { triggerData });
  },

  /**
   * List workflow executions with optional filtering.
   */
  async listExecutions(params?: ExecutionSearchParams): Promise<PaginatedResponse<WorkflowExecution>> {
    return apiClient.get<PaginatedResponse<WorkflowExecution>>(
      EXECUTIONS_BASE,
      params as Record<string, unknown>,
    );
  },

  /**
   * Get a single execution by ID.
   */
  async getExecution(executionId: string): Promise<WorkflowExecution> {
    return apiClient.get<WorkflowExecution>(`${EXECUTIONS_BASE}/${executionId}`);
  },

  /**
   * Cancel a running execution.
   */
  async cancelExecution(executionId: string, reason?: string): Promise<WorkflowExecution> {
    return apiClient.post<WorkflowExecution>(`${EXECUTIONS_BASE}/${executionId}/cancel`, { reason });
  },

  /**
   * Retry a failed execution from the last failed node.
   */
  async retryExecution(executionId: string): Promise<WorkflowExecution> {
    return apiClient.post<WorkflowExecution>(`${EXECUTIONS_BASE}/${executionId}/retry`);
  },

  // ── HITL (Human-in-the-Loop) ──────────────────────

  /**
   * List pending HITL checkpoints (for the current user or team).
   */
  async listPendingCheckpoints(params?: {
    assignedTo?: string;
    priority?: string;
    workflowId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<HITLCheckpoint>> {
    return apiClient.get<PaginatedResponse<HITLCheckpoint>>(HITL_BASE, params as Record<string, unknown>);
  },

  /**
   * Get a single HITL checkpoint.
   */
  async getCheckpoint(checkpointId: string): Promise<HITLCheckpoint> {
    return apiClient.get<HITLCheckpoint>(`${HITL_BASE}/${checkpointId}`);
  },

  /**
   * Resolve a HITL checkpoint (approve, reject, escalate).
   */
  async resolveCheckpoint(
    checkpointId: string,
    decision: {
      status: 'approved' | 'rejected' | 'escalated';
      reviewerNotes?: string;
      reviewerDecision?: string;
    },
  ): Promise<HITLCheckpoint> {
    return apiClient.post<HITLCheckpoint>(`${HITL_BASE}/${checkpointId}/resolve`, decision);
  },

  /**
   * Reassign a HITL checkpoint to a different user or team.
   */
  async reassignCheckpoint(checkpointId: string, assignedTo: string): Promise<HITLCheckpoint> {
    return apiClient.post<HITLCheckpoint>(`${HITL_BASE}/${checkpointId}/reassign`, { assignedTo });
  },
};

export default workflowApi;
