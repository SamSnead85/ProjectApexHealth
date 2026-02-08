import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AuditAction, CreateAuditLogDto } from './dto/audit.dto';

/** Resource types that contain PHI when accessed. */
const PHI_RESOURCE_TYPES = new Set([
  'members',
  'patients',
  'claims',
  'eligibility',
  'prior-auth',
  'medical-records',
  'prescriptions',
  'lab-results',
  'encounters',
]);

/** PHI field names commonly found in healthcare responses. */
const PHI_FIELDS_BY_RESOURCE: Record<string, string[]> = {
  members: ['ssn', 'dateOfBirth', 'address', 'phone', 'medicalHistory', 'diagnosis'],
  patients: ['ssn', 'dateOfBirth', 'address', 'phone', 'medicalHistory'],
  claims: ['memberId', 'diagnosis', 'procedures', 'providerNotes'],
  eligibility: ['memberId', 'dateOfBirth', 'ssn'],
  'prior-auth': ['memberId', 'diagnosis', 'clinicalNotes'],
  'medical-records': ['diagnosis', 'treatment', 'medications', 'labResults'],
  prescriptions: ['memberId', 'medications', 'prescriber'],
  'lab-results': ['memberId', 'results', 'diagnosis'],
  encounters: ['memberId', 'diagnosis', 'notes', 'vitals'],
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          // Fire-and-forget: log asynchronously so we don't block the response
          this.logRequest(request, response.statusCode).catch((err) =>
            this.logger.error(`Audit logging failed: ${err.message}`, err.stack),
          );
        },
        error: (err) => {
          const status = err.status || err.statusCode || 500;
          this.logRequest(request, status).catch((logErr) =>
            this.logger.error(`Audit logging failed: ${logErr.message}`, logErr.stack),
          );
        },
      }),
    );
  }

  private async logRequest(request: any, statusCode: number): Promise<void> {
    const user = request.user;
    const path: string = request.route?.path || request.url || '';
    const method: string = request.method;

    // Skip health checks and static assets
    if (path.startsWith('/health') || path.startsWith('/api/health')) {
      return;
    }

    const resourceType = this.extractResourceType(path);
    const resourceId = this.extractResourceId(path);
    const action = this.mapHttpMethodToAction(method, statusCode, path);
    const phiAccessed = PHI_RESOURCE_TYPES.has(resourceType);
    const phiFields = phiAccessed ? PHI_FIELDS_BY_RESOURCE[resourceType] || [] : undefined;

    const entry: CreateAuditLogDto = {
      userId: user?.sub || user?.id,
      userEmail: user?.email || 'anonymous',
      userRole: user?.role || 'unauthenticated',
      organizationId: user?.organizationId || '00000000-0000-0000-0000-000000000000',
      action,
      resourceType,
      resourceId,
      phiAccessed,
      phiFields: phiFields?.length ? phiFields : undefined,
      ipAddress: this.extractIpAddress(request),
      userAgent: request.headers?.['user-agent'] || 'unknown',
      requestMethod: method,
      requestPath: path,
      responseStatus: statusCode,
      sessionId: request.headers?.['x-session-id'] || user?.sessionId || 'unknown',
      details: {
        query: request.query,
        duration: Date.now() - (request._startTime || Date.now()),
      },
    };

    await this.auditService.log(entry);
  }

  private extractResourceType(path: string): string {
    // Normalize: remove /api prefix and version segments
    const cleaned = path
      .replace(/^\/api/, '')
      .replace(/^\/v\d+/, '')
      .replace(/^\//, '');

    // First segment is the resource type
    const segments = cleaned.split('/');
    return segments[0] || 'unknown';
  }

  private extractResourceId(path: string): string | undefined {
    const segments = path.split('/').filter(Boolean);
    // Look for a UUID pattern in the path
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const segment of segments) {
      if (uuidPattern.test(segment)) {
        return segment;
      }
    }
    return undefined;
  }

  private mapHttpMethodToAction(method: string, statusCode: number, path: string): AuditAction {
    // Special cases
    if (path.includes('/login') && method === 'POST') {
      return statusCode < 400 ? AuditAction.LOGIN : AuditAction.FAILED_LOGIN;
    }
    if (path.includes('/logout')) {
      return AuditAction.LOGOUT;
    }
    if (path.includes('/export')) {
      return AuditAction.EXPORT;
    }
    if (path.includes('/print')) {
      return AuditAction.PRINT;
    }
    if (statusCode === 403) {
      return AuditAction.PERMISSION_DENIED;
    }

    // Map HTTP methods to CRUD actions
    switch (method.toUpperCase()) {
      case 'POST':
        return AuditAction.CREATE;
      case 'GET':
        return AuditAction.READ;
      case 'PUT':
      case 'PATCH':
        return AuditAction.UPDATE;
      case 'DELETE':
        return AuditAction.DELETE;
      default:
        return AuditAction.READ;
    }
  }

  private extractIpAddress(request: any): string {
    return (
      request.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers?.['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }
}
