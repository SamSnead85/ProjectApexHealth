import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ACCESSES_PHI_KEY } from '../decorators/accesses-phi.decorator';
import { AuditService } from '../../modules/audit/audit.service';
import { HIPAA_AUDIT_ACTIONS } from '../constants/compliance.constants';

/**
 * PHI Access Guard
 *
 * Protects endpoints that access Protected Health Information (PHI).
 * Works in conjunction with the `@AccessesPHI(fields)` decorator.
 *
 * Responsibilities:
 *  1. Checks if the endpoint accesses PHI (based on `@AccessesPHI` decorator metadata)
 *  2. Verifies the authenticated user has the `members:view-phi` permission
 *  3. Logs every PHI access attempt to the HIPAA audit trail (success or denial)
 *
 * @example
 * ```ts
 * @Get(':id/details')
 * @UseGuards(JwtAuthGuard, PHIAccessGuard)
 * @AccessesPHI('ssn', 'dateOfBirth', 'medicalHistory')
 * getMemberDetails(@Param('id') id: string) { ... }
 * ```
 */
@Injectable()
export class PHIAccessGuard implements CanActivate {
  private readonly logger = new Logger(PHIAccessGuard.name);

  /** Permission required to view PHI data */
  private static readonly PHI_VIEW_PERMISSION = 'members:view-phi';

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ── Retrieve PHI field metadata from decorator ────────
    const phiFields = this.reflector.getAllAndOverride<string[]>(
      ACCESSES_PHI_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no @AccessesPHI decorator is present, the endpoint doesn't access PHI — allow through.
    if (!phiFields || phiFields.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    // ── Require an authenticated user ─────────────────────
    if (!user) {
      this.logger.warn(
        'PHI access attempted without authentication',
      );
      throw new ForbiddenException(
        'Authentication required to access Protected Health Information',
      );
    }

    const auditPayload = {
      userId: user.id,
      userEmail: user.email ?? 'unknown',
      userRole: user.role ?? 'unknown',
      organizationId: user.organizationId ?? 'unknown',
      action: HIPAA_AUDIT_ACTIONS.READ as any,
      resourceType: 'PHI',
      resourceId: request.params?.id ?? undefined,
      phiAccessed: true,
      phiFields,
      ipAddress: (request.ip || request.headers['x-forwarded-for'] || 'unknown') as string,
      userAgent: (request.headers['user-agent'] || 'unknown') as string,
      requestMethod: request.method,
      requestPath: request.originalUrl || request.url,
      responseStatus: 200,
      sessionId: (request.headers['x-request-id'] as string) || user.sessionId || 'unknown',
      details: {
        phiFields,
        accessType: 'guard-check',
      },
    };

    // ── Check user permission ─────────────────────────────
    const userPermissions: string[] = user.permissions ?? [];
    const hasPermission = userPermissions.includes(
      PHIAccessGuard.PHI_VIEW_PERMISSION,
    );

    if (!hasPermission) {
      this.logger.warn({
        message: 'PHI access denied — missing permission',
        userId: user.id,
        email: user.email,
        requiredPermission: PHIAccessGuard.PHI_VIEW_PERMISSION,
        phiFields,
        path: request.originalUrl,
      });

      // Log the denial to the audit trail
      await this.auditService
        .log({
          ...auditPayload,
          action: HIPAA_AUDIT_ACTIONS.PERMISSION_DENIED as any,
          responseStatus: 403,
          details: {
            phiFields,
            reason: 'Missing members:view-phi permission',
            accessType: 'phi-access-denied',
          },
        })
        .catch((err) => {
          this.logger.error(
            `Failed to write PHI denial audit log: ${err.message}`,
            err.stack,
          );
        });

      throw new ForbiddenException(
        'You do not have permission to access Protected Health Information. ' +
        `Required: ${PHIAccessGuard.PHI_VIEW_PERMISSION}`,
      );
    }

    // ── Log successful PHI access ─────────────────────────
    this.logger.log({
      message: 'PHI access granted',
      userId: user.id,
      email: user.email,
      phiFields,
      path: request.originalUrl,
    });

    await this.auditService
      .log(auditPayload)
      .catch((err) => {
        this.logger.error(
          `Failed to write PHI access audit log: ${err.message}`,
          err.stack,
        );
      });

    return true;
  }
}
