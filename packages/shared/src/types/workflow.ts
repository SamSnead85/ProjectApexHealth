// ═══════════════════════════════════════════════════════
// Workflow & Agentic AI Types
// ═══════════════════════════════════════════════════════

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';
export type WorkflowExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'waiting_hitl';

export type WorkflowNodeType =
  // Triggers
  | 'claim_intake'
  | 'prior_auth_request'
  | 'scheduled_batch'
  | 'webhook'
  | 'manual_trigger'
  | 'edi_received'
  | 'fhir_event'
  // Processing
  | 'eligibility_check'
  | 'document_analyzer'
  | 'medical_coding'
  | 'policy_engine'
  | 'pricing_engine'
  | 'accumulator_update'
  // AI / Agentic
  | 'llm_decision'
  | 'gemini_analyzer'
  | 'fraud_detector'
  | 'clinical_reasoner'
  | 'document_extraction'
  | 'medical_coding_ai'
  | 'sentiment_analysis'
  // Communication
  | 'email_send'
  | 'sms_send'
  | 'voice_call'
  | 'fax_send'
  | 'push_notification'
  // Control Flow
  | 'decision_branch'
  | 'parallel_split'
  | 'loop_iterator'
  | 'wait_timer'
  | 'merge_gate'
  // Human-in-the-Loop
  | 'hitl_checkpoint'
  | 'quality_review'
  | 'exception_handler'
  | 'approval_chain'
  // Integration
  | 'fhir_query'
  | 'edi_generate'
  | 'api_call'
  | 'database_query'
  // Output
  | 'decision_output'
  | 'notification'
  | 'api_response'
  | 'audit_log';

export interface WorkflowDefinition {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  category: string;
  status: WorkflowStatus;
  version: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
  settings: WorkflowSettings;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  inputs: WorkflowPort[];
  outputs: WorkflowPort[];
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
  condition?: string;
  label?: string;
}

export interface WorkflowPort {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  required?: boolean;
  defaultValue?: any;
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue?: any;
  description?: string;
}

export interface WorkflowSettings {
  maxExecutionTimeSeconds: number;
  retryOnFailure: boolean;
  maxRetries: number;
  notifyOnFailure: boolean;
  notifyOnCompletion: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  version: number;
  status: WorkflowExecutionStatus;
  trigger: string;
  triggerData: Record<string, any>;
  currentNodeId?: string;
  completedNodes: string[];
  variables: Record<string, any>;
  logs: WorkflowExecutionLog[];
  error?: string;
  startedAt: string;
  completedAt?: string;
  executionTimeMs?: number;
}

export interface WorkflowExecutionLog {
  timestamp: string;
  nodeId: string;
  nodeType: WorkflowNodeType;
  nodeName: string;
  action: 'started' | 'completed' | 'failed' | 'skipped' | 'waiting';
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  durationMs?: number;
  aiMetrics?: {
    model: string;
    tokensUsed: number;
    confidenceScore: number;
    latencyMs: number;
  };
}

export interface HITLCheckpoint {
  id: string;
  executionId: string;
  workflowId: string;
  nodeId: string;
  nodeName: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'timed_out';
  assignedTo?: string;
  assignedToName?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
  aiRecommendation?: string;
  aiConfidence?: number;
  reviewerDecision?: string;
  reviewerNotes?: string;
  reviewedAt?: string;
  slaDeadline?: string;
  createdAt: string;
}
