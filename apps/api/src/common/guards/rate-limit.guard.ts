import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from '../decorators/rate-limit.decorator';

/**
 * Sliding-window bucket for tracking request counts per key.
 */
interface RateLimitBucket {
  /** Timestamps (ms) of each request within the current window */
  timestamps: number[];
}

/**
 * Rate Limit Guard
 *
 * A simple in-memory sliding-window rate limiter that works with the
 * `@RateLimit(requests, windowSeconds)` decorator.
 *
 * Tracking key:
 *  - Authenticated requests: `userId:routeKey`
 *  - Unauthenticated requests: `ip:routeKey`
 *
 * When the limit is exceeded, returns HTTP 429 Too Many Requests with
 * standard `Retry-After` and `X-RateLimit-*` response headers.
 *
 * NOTE: This implementation uses in-memory storage and is suitable for
 * single-instance deployments or development. For horizontally-scaled
 * production deployments, replace the in-memory store with a Redis-backed
 * implementation (e.g., using the existing Bull/IORedis connection).
 *
 * @example
 * ```ts
 * @Post('verify')
 * @UseGuards(JwtAuthGuard, RateLimitGuard)
 * @RateLimit(10, 60)  // max 10 requests per 60-second window
 * verifyEligibility(@Body() dto: VerifyDto) { ... }
 * ```
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  /**
   * In-memory store: `key` -> bucket of request timestamps.
   * Keys are evicted lazily when their window expires.
   */
  private readonly store = new Map<string, RateLimitBucket>();

  /** Run cleanup every 5 minutes to prevent unbounded memory growth. */
  private readonly CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
  private lastCleanup = Date.now();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ── Retrieve rate-limit options from decorator metadata ──
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @RateLimit decorator → no rate limiting on this route
    if (!options) {
      return true;
    }

    const { requests: maxRequests, windowSeconds } = options;
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    // ── Build the tracking key ──────────────────────────────
    const user = (request as any).user;
    const identity = user?.id ?? this.extractIp(request);
    const routeKey = `${request.method}:${request.route?.path ?? request.url}`;
    const key = `${identity}:${routeKey}`;

    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    // ── Periodic cleanup ────────────────────────────────────
    if (now - this.lastCleanup > this.CLEANUP_INTERVAL_MS) {
      this.cleanup(now);
      this.lastCleanup = now;
    }

    // ── Get or create bucket ────────────────────────────────
    let bucket = this.store.get(key);
    if (!bucket) {
      bucket = { timestamps: [] };
      this.store.set(key, bucket);
    }

    // Prune timestamps outside the current window
    bucket.timestamps = bucket.timestamps.filter(
      (ts) => now - ts < windowMs,
    );

    // ── Set rate-limit response headers ─────────────────────
    const remaining = Math.max(0, maxRequests - bucket.timestamps.length);
    const resetTimestamp = bucket.timestamps.length > 0
      ? Math.ceil((bucket.timestamps[0] + windowMs) / 1000)
      : Math.ceil((now + windowMs) / 1000);

    response.setHeader('X-RateLimit-Limit', maxRequests);
    response.setHeader('X-RateLimit-Remaining', remaining);
    response.setHeader('X-RateLimit-Reset', resetTimestamp);

    // ── Check limit ─────────────────────────────────────────
    if (bucket.timestamps.length >= maxRequests) {
      const retryAfterSeconds = Math.ceil(
        (bucket.timestamps[0] + windowMs - now) / 1000,
      );

      this.logger.warn({
        message: 'Rate limit exceeded',
        key,
        maxRequests,
        windowSeconds,
        currentRequests: bucket.timestamps.length,
        retryAfterSeconds,
      });

      response.setHeader('Retry-After', retryAfterSeconds);
      response.setHeader('X-RateLimit-Remaining', 0);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowSeconds} seconds. Retry after ${retryAfterSeconds} seconds.`,
          retryAfter: retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // ── Record this request ─────────────────────────────────
    bucket.timestamps.push(now);

    return true;
  }

  /**
   * Extract the client IP address from the request.
   * Falls back through proxy headers before using `req.ip`.
   */
  private extractIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.ip || 'unknown';
  }

  /**
   * Remove stale buckets to prevent memory leaks.
   * A bucket is considered stale if all its timestamps are older than
   * the largest possible window (we use a conservative 10-minute ceiling).
   */
  private cleanup(now: number): void {
    const staleThreshold = 10 * 60 * 1000; // 10 minutes
    let evicted = 0;

    for (const [key, bucket] of this.store.entries()) {
      const latest = bucket.timestamps[bucket.timestamps.length - 1];
      if (!latest || now - latest > staleThreshold) {
        this.store.delete(key);
        evicted++;
      }
    }

    if (evicted > 0) {
      this.logger.debug(`Rate-limit cleanup: evicted ${evicted} stale buckets`);
    }
  }
}
