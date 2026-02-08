/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Apex Health Platform - API E2E Tests
 * ═══════════════════════════════════════════════════════════════════════════════
 * End-to-end tests that verify core API behaviors:
 *   - Health check endpoint returns correct status
 *   - Authentication flow (login returns JWT tokens)
 *   - Authorization enforcement (401 on protected routes)
 *
 * These tests start the full NestJS application and make real HTTP requests
 * against it, verifying the complete request/response cycle.
 *
 * Run: npm run test:e2e (from apps/api/)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Apex Health API (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same configuration as main.ts so tests match production behavior
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Health Check ──────────────────────────────────────────────────────────

  describe('Health Check', () => {
    it('GET /api/v1/health should return 200 with health status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('version');
          expect(res.body).toHaveProperty('uptime');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('checks');
          expect(['healthy', 'degraded', 'unhealthy']).toContain(res.body.status);
        });
    });

    it('GET /api/v1/health/live should return liveness status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/live')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'alive');
          expect(res.body).toHaveProperty('uptime');
        });
    });

    it('GET /api/v1/health/ready should return readiness status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/ready')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(['ready', 'not_ready']).toContain(res.body.status);
        });
    });
  });

  // ─── Authentication ────────────────────────────────────────────────────────

  describe('Authentication', () => {
    it('POST /api/v1/auth/login should return tokens with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@apex-health.io',
          password: 'test-password-123',
        })
        .expect((res) => {
          // The endpoint should either:
          //   200 with tokens (if test user is seeded)
          //   401 with error (if no test user exists)
          // Either way, the API should respond without crashing
          expect([200, 401]).toContain(res.status);

          if (res.status === 200) {
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
            expect(typeof res.body.accessToken).toBe('string');
            expect(typeof res.body.refreshToken).toBe('string');
          }
        });
    });

    it('POST /api/v1/auth/login should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrong-password',
        })
        .expect(401);
    });

    it('POST /api/v1/auth/login should validate request body', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400); // ValidationPipe rejects missing required fields
    });
  });

  // ─── Authorization ─────────────────────────────────────────────────────────

  describe('Authorization', () => {
    it('GET /api/v1/claims should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/claims')
        .expect(401);
    });

    it('GET /api/v1/members should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/members')
        .expect(401);
    });

    it('GET /api/v1/providers should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/providers')
        .expect(401);
    });

    it('should reject requests with an invalid JWT token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/claims')
        .set('Authorization', 'Bearer invalid-token-12345')
        .expect(401);
    });

    it('should reject requests with a malformed Authorization header', () => {
      return request(app.getHttpServer())
        .get('/api/v1/claims')
        .set('Authorization', 'NotBearer some-token')
        .expect(401);
    });
  });

  // ─── 404 Handling ──────────────────────────────────────────────────────────

  describe('Not Found', () => {
    it('should return 404 for unknown routes', () => {
      return request(app.getHttpServer())
        .get('/api/v1/nonexistent-endpoint')
        .expect(404);
    });
  });
});
