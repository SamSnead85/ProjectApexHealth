import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { SESSION_TIMEOUT_DEFAULTS } from '../constants/compliance.constants';

/**
 * Authenticated user shape expected on `request.user`.
 * Extend as needed to match your JWT payload.
 */
interface SessionUser {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  /** ISO-8601 timestamp of the last user-initiated activity */
  lastActivity?: string;
  /** ISO-8601 timestamp of when the session (JWT) was issued */
  iat?: number;
  /** Organization-level settings that may include custom timeouts */
  orgSettings?: {
    sessionTimeoutMinutes?: number;
    adminSessionTimeoutMinutes?: number;
  };
}

/** Roles considered "admin" for the purpose of timeout configuration. */
const ADMIN_ROLES = new Set([
  'system_admin',
  'org_admin',
  'claims_supervisor',
  'medical_director',
]);

/**
 * Session Timeout Interceptor
 *
 * Enforces HIPAA-compliant session timeouts by checking if the user's session
 * is still within the configured inactivity window before allowing the request
 * to proceed.
 *
 * Timeout resolution order:
 *  1. Organization-level setting (`orgSettings.sessionTimeoutMinutes` / `adminSessionTimeoutMinutes`)
 *  2. Role-based default: 30 min for admin roles, 15 min for members/regular users
 *  3. Absolute maximum session duration (8 hours) regardless of activity
 *
 * If the session has expired, a 401 Unauthorized response is returned so the
 * client can redirect the user to re-authenticate.
 *
 * @example
 * ```ts
 * // Apply globally in main.ts
 * app.useGlobalInterceptors(new SessionTimeoutInterceptor());
 *
 * // Or per-controller
 * @UseInterceptors(SessionTimeoutInterceptor)
 * @Controller('members')
 * export class MemberController { ... }
 * ```
 */
@Injectable()
export class SessionTimeoutInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SessionTimeoutInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user as SessionUser | undefined;

    // Skip timeout check for unauthenticated requests (handled by auth guard).
    if (!user) {
      return next.handle();
    }

    const now = Date.now();

    // ── 1. Absolute session duration check ────────────────
    if (user.iat) {
      const sessionStartMs = user.iat * 1000; // JWT `iat` is in seconds
      const maxDurationMs =
        SESSION_TIMEOUT_DEFAULTS.MAX_SESSION_DURATION_MINUTES * 60 * 1000;

      if (now - sessionStartMs > maxDurationMs) {
        this.logger.warn({
          message: 'Session exceeded maximum duration',
          userId: user.id,
          email: user.email,
          sessionAgeMinutes: Math.round((now - sessionStartMs) / 60_000),
          maxMinutes: SESSION_TIMEOUT_DEFAULTS.MAX_SESSION_DURATION_MINUTES,
        });

        throw new UnauthorizedException(
          'Session has exceeded the maximum allowed duration. Please re-authenticate.',
        );
      }
    }

    // ── 2. Inactivity timeout check ──────────────────────
    if (user.lastActivity) {
      const lastActivityMs = new Date(user.lastActivity).getTime();
      const timeoutMinutes = this.resolveTimeoutMinutes(user);
      const timeoutMs = timeoutMinutes * 60 * 1000;
      const inactiveMs = now - lastActivityMs;

      if (inactiveMs > timeoutMs) {
        this.logger.warn({
          message: 'Session timed out due to inactivity',
          userId: user.id,
          email: user.email,
          inactiveMinutes: Math.round(inactiveMs / 60_000),
          timeoutMinutes,
        });

        throw new UnauthorizedException(
          `Session expired due to ${timeoutMinutes} minutes of inactivity. Please re-authenticate.`,
        );
      }
    }

    return next.handle();
  }

  /**
   * Resolve the applicable inactivity timeout for the user.
   *
   * Priority:
   *  1. Organization custom timeout (role-aware)
   *  2. Role-based default from compliance constants
   */
  private resolveTimeoutMinutes(user: SessionUser): number {
    const isAdmin = ADMIN_ROLES.has(user.role);

    // Organization-level override
    if (user.orgSettings) {
      if (isAdmin && user.orgSettings.adminSessionTimeoutMinutes) {
        return user.orgSettings.adminSessionTimeoutMinutes;
      }
      if (user.orgSettings.sessionTimeoutMinutes) {
        return user.orgSettings.sessionTimeoutMinutes;
      }
    }

    // Fall back to compliance constant defaults
    return isAdmin
      ? SESSION_TIMEOUT_DEFAULTS.ADMIN_TIMEOUT_MINUTES
      : SESSION_TIMEOUT_DEFAULTS.MEMBER_TIMEOUT_MINUTES;
  }
}
