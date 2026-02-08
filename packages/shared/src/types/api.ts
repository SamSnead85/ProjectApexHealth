// ═══════════════════════════════════════════════════════
// API Response & Common Types
// ═══════════════════════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    stack?: string;  // Only in development
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// WebSocket Event Types
export interface WSEvent<T = any> {
  event: string;
  data: T;
  timestamp: string;
  organizationId?: string;
  userId?: string;
}

export type WSClaimEvent = WSEvent<{
  claimId: string;
  claimNumber: string;
  action: 'created' | 'updated' | 'adjudicated' | 'paid' | 'denied';
  status: string;
}>;

export type WSNotificationEvent = WSEvent<{
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  actionUrl?: string;
}>;

export type WSWorkflowEvent = WSEvent<{
  executionId: string;
  workflowId: string;
  action: 'started' | 'node_completed' | 'completed' | 'failed' | 'hitl_required';
  nodeId?: string;
  status: string;
}>;

// Health Check
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    elasticsearch: ServiceHealth;
    objectStorage: ServiceHealth;
    aiServices: ServiceHealth;
  };
  timestamp: string;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs?: number;
  message?: string;
}
