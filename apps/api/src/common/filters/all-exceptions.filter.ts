import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * PHI-aware terms that must be redacted from error messages before
 * they are returned to clients. Patterns matched case-insensitively.
 */
const PHI_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/g,        // SSN
  /\b\d{9}\b/g,                      // SSN without dashes (9 consecutive digits)
  /\b\d{2}\/\d{2}\/\d{4}\b/g,       // DOB MM/DD/YYYY
  /\b\d{4}-\d{2}-\d{2}\b/g,         // DOB YYYY-MM-DD (avoid false positives with short strings)
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Email
];

function redactPHI(message: string): string {
  let redacted = message;
  for (const pattern of PHI_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED]');
  }
  return redacted;
}

/**
 * Global exception filter that provides:
 * - Consistent JSON error responses across all endpoints
 * - Correlation via X-Request-ID
 * - PHI redaction from client-facing error messages
 * - Structured logging for observability
 * - Proper HTTP status code mapping
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const requestId =
      (request.headers['x-request-id'] as string) || 'unknown';

    let status: number;
    let code: string;
    let message: string;
    let details: any = undefined;

    // ─── HttpException (NestJS-thrown) ────────────
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = `HTTP_${status}`;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, any>;
        message = resp.message || exception.message;
        code = resp.error || `HTTP_${status}`;

        // Validation errors come as an array of messages
        if (Array.isArray(resp.message)) {
          message = 'Validation failed';
          details = resp.message;
        }
      } else {
        message = exception.message;
        code = `HTTP_${status}`;
      }

    // ─── TypeORM QueryFailedError ────────────────
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'DATABASE_ERROR';
      // Never expose raw SQL errors to clients
      message = 'A database operation failed. Please try again.';

      // Log the real error server-side
      this.logger.error(
        `[${requestId}] Database error: ${exception.message}`,
        exception.stack,
      );

    // ─── Unknown / Internal errors ───────────────
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_ERROR';
      message = 'An unexpected error occurred. Please try again later.';

      // Log full details server-side
      this.logger.error(
        `[${requestId}] Unhandled error: ${exception.message}`,
        exception.stack,
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'UNKNOWN_ERROR';
      message = 'An unexpected error occurred.';

      this.logger.error(
        `[${requestId}] Unknown exception type: ${JSON.stringify(exception)}`,
      );
    }

    // Redact any PHI that may have leaked into messages
    const safeMessage = redactPHI(message);
    const safeDetails = details
      ? Array.isArray(details)
        ? details.map((d: string) => redactPHI(String(d)))
        : redactPHI(String(details))
      : undefined;

    // Structured log for every error (for Elasticsearch / CloudWatch)
    this.logger.warn({
      requestId,
      method: request.method,
      path: request.url,
      status,
      code,
      message: safeMessage,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    });

    // Return consistent error shape
    response.status(status).json({
      success: false,
      error: {
        code,
        message: safeMessage,
        ...(safeDetails ? { details: safeDetails } : {}),
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
