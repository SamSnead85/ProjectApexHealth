import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used to store rate-limit configuration for an endpoint.
 */
export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  requests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

/**
 * Decorator that applies rate limiting to a controller method.
 *
 * When applied, the `RateLimitGuard` will track requests by user ID
 * (or IP address for unauthenticated endpoints) and return HTTP 429
 * when the limit is exceeded.
 *
 * @param requests      Maximum requests allowed within the window
 * @param windowSeconds Duration of the rate-limit window in seconds
 *
 * @example
 * ```ts
 * @Post('verify')
 * @RateLimit(10, 60)  // 10 requests per 60 seconds
 * verifyEligibility(@Body() dto: VerifyDto) { ... }
 * ```
 */
export const RateLimit = (requests: number, windowSeconds: number) =>
  SetMetadata(RATE_LIMIT_KEY, { requests, windowSeconds } as RateLimitOptions);
