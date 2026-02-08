import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SECURITY_HEADERS } from '../constants/compliance.constants';

/**
 * HIPAA Compliance Middleware
 *
 * Applied globally to enforce security headers, request traceability,
 * and cache-control policies required for HIPAA compliance.
 *
 * Headers set:
 *  - Strict-Transport-Security (HSTS)
 *  - X-Content-Type-Options: nosniff
 *  - X-Frame-Options: DENY
 *  - X-XSS-Protection: 1; mode=block
 *  - Referrer-Policy: strict-origin-when-cross-origin
 *  - X-Request-ID (UUID for traceability)
 *  - Cache-Control: no-store, no-cache, must-revalidate (for PHI routes)
 *  - Pragma: no-cache (for PHI routes)
 */

/** Route prefixes that serve PHI and must never be cached. */
const PHI_ROUTE_PREFIXES = [
  '/api/v1/members',
  '/api/v1/patients',
  '/api/v1/claims',
  '/api/v1/eligibility',
  '/api/v1/prior-auth',
  '/api/v1/medical-records',
  '/api/v1/prescriptions',
  '/api/v1/lab-results',
  '/api/v1/encounters',
  '/api/v1/documents',
];

@Injectable()
export class HipaaComplianceMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HipaaComplianceMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    // ── Request ID for traceability ────────────────
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);

    // ── Security headers ───────────────────────────
    res.setHeader('Strict-Transport-Security', SECURITY_HEADERS.HSTS);
    res.setHeader('X-Content-Type-Options', SECURITY_HEADERS.CONTENT_TYPE_OPTIONS);
    res.setHeader('X-Frame-Options', SECURITY_HEADERS.FRAME_OPTIONS);
    res.setHeader('X-XSS-Protection', SECURITY_HEADERS.XSS_PROTECTION);
    res.setHeader('Referrer-Policy', SECURITY_HEADERS.REFERRER_POLICY);

    // ── Cache-Control for PHI routes ───────────────
    const url = req.originalUrl || req.url;
    const isPHIRoute = PHI_ROUTE_PREFIXES.some((prefix) => url.startsWith(prefix));

    if (isPHIRoute) {
      res.setHeader('Cache-Control', SECURITY_HEADERS.CACHE_CONTROL_PHI);
      res.setHeader('Pragma', SECURITY_HEADERS.PRAGMA_PHI);
      res.setHeader('Expires', '0');
    }

    // ── Log request start for correlation ──────────
    this.logger.log({
      message: 'Incoming request',
      requestId,
      method: req.method,
      url,
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      isPHIRoute,
    });

    next();
  }
}
