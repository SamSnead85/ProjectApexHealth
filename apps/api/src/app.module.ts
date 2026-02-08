import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { LoggerModule } from 'nestjs-pino';

// Core Modules
import { AuthModule } from './modules/auth/auth.module';
import { AuditModule } from './modules/audit/audit.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { DocumentModule } from './modules/documents/document.module';

// Domain Modules
import { ClaimsModule } from './modules/claims/claims.module';
import { EligibilityModule } from './modules/eligibility/eligibility.module';
import { PriorAuthModule } from './modules/prior-auth/prior-auth.module';
import { ProviderModule } from './modules/providers/provider.module';
import { MemberModule } from './modules/members/member.module';
import { BillingModule } from './modules/billing/billing.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

// Integration Modules
import { EDIModule } from './modules/edi/edi.module';
import { FHIRModule } from './modules/fhir/fhir.module';

// AI & Workflow Modules
import { WorkflowModule } from './modules/workflow/workflow.module';

// Health Check
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // ─── Configuration ────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),

    // ─── Logging (HIPAA-grade structured logging) ──
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get('NODE_ENV') === 'production' ? 'info' : 'debug',
          transport: config.get('NODE_ENV') !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'res.headers["set-cookie"]',
              '*.ssn',
              '*.dateOfBirth',
              '*.password',
              '*.token',
            ],
            censor: '[REDACTED]',
          },
          serializers: {
            req: (req: any) => ({
              id: req.id,
              method: req.method,
              url: req.url,
              remoteAddress: req.remoteAddress,
            }),
          },
        },
      }),
    }),

    // ─── Database ─────────────────────────────────
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'apex_admin'),
        password: config.get('DB_PASSWORD', 'apex_dev_password_2024'),
        database: config.get('DB_DATABASE', 'apex_health'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production', // Only in dev
        logging: config.get('DB_LOGGING', 'false') === 'true',
        ssl: config.get('DB_SSL', 'false') === 'true'
          ? { rejectUnauthorized: false }
          : false,
        extra: {
          max: 20,
          connectionTimeoutMillis: 5000,
        },
      }),
    }),

    // ─── Redis / Job Queues ───────────────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD', 'apex_redis_dev'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 200,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      }),
    }),

    // ─── Scheduler ────────────────────────────────
    ScheduleModule.forRoot(),

    // ─── Core Modules ─────────────────────────────
    AuthModule,
    AuditModule,
    OrganizationModule,
    DocumentModule,

    // ─── Domain Modules ───────────────────────────
    ClaimsModule,
    EligibilityModule,
    PriorAuthModule,
    ProviderModule,
    MemberModule,
    BillingModule,
    AnalyticsModule,

    // ─── Integration Modules ──────────────────────
    EDIModule,
    FHIRModule,

    // ─── AI & Workflow ────────────────────────────
    WorkflowModule,

    // ─── Health Check ─────────────────────────────
    HealthModule,
  ],
})
export class AppModule {}
