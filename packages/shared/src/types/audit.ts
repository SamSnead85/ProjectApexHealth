// ═══════════════════════════════════════════════════════
// HIPAA Audit Trail Types
// ═══════════════════════════════════════════════════════

export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'export' | 'print' | 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'break_glass';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userRole: string;
  organizationId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  phiAccessed: boolean;
  phiFields?: string[];
  ipAddress: string;
  userAgent: string;
  requestMethod: string;
  requestPath: string;
  responseStatus: number;
  details?: Record<string, any>;
  sessionId: string;
}

export interface AuditSearchParams {
  userId?: string;
  action?: AuditAction;
  resourceType?: string;
  resourceId?: string;
  phiAccessed?: boolean;
  dateFrom?: string;
  dateTo?: string;
  ipAddress?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditDashboardStats {
  totalEvents: number;
  phiAccessEvents: number;
  failedLogins: number;
  breakGlassEvents: number;
  topUsers: Array<{ userId: string; name: string; eventCount: number }>;
  topResources: Array<{ resourceType: string; accessCount: number }>;
  eventsByHour: Array<{ hour: number; count: number }>;
  unusualActivity: AuditAlert[];
}

export interface AuditAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'excessive_phi_access' | 'after_hours_access' | 'bulk_export' | 'failed_login_spike' | 'unusual_pattern';
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  detectedAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}
