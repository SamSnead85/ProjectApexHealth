import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);
  app.useLogger(logger);

  // ─── Security ────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true },
  }));

  // ─── CORS ────────────────────────────────────────
  app.enableCors({
    origin: configService.get('WEB_URL', 'http://localhost:4200'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Organization-ID'],
    exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
  });

  // ─── Middleware ──────────────────────────────────
  app.use(compression());
  app.use(cookieParser());

  // ─── Global Exception Filter ────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ─── Global Validation ──────────────────────────
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // ─── API Versioning ─────────────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ─── Swagger / OpenAPI ──────────────────────────
  if (configService.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Apex Health Platform API')
      .setDescription(
        'Enterprise healthcare platform API. HIPAA-compliant, EDI/FHIR ready.\n\n' +
        '## Modules\n' +
        '- **Claims Intelligence** - Claims processing & adjudication\n' +
        '- **Eligibility Hub** - Real-time eligibility & enrollment\n' +
        '- **Prior Auth Center** - Prior authorization workflows\n' +
        '- **Provider Network** - Provider management & credentialing\n' +
        '- **Member Experience** - Member services & engagement\n' +
        '- **Revenue Cycle** - Billing & payments\n' +
        '- **Analytics Command** - Reporting & dashboards\n' +
        '- **Compliance Suite** - Audit & regulatory\n' +
        '- **AI Operations** - Workflow builder & agentic AI\n' +
        '- **Voice Center** - Voice agents & call center'
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication & authorization')
      .addTag('claims', 'Claims processing & adjudication')
      .addTag('eligibility', 'Eligibility verification & enrollment')
      .addTag('prior-auth', 'Prior authorization management')
      .addTag('providers', 'Provider network management')
      .addTag('members', 'Member services')
      .addTag('billing', 'Billing & payments')
      .addTag('documents', 'Document management')
      .addTag('edi', 'EDI X12 transactions')
      .addTag('fhir', 'FHIR R4 interoperability')
      .addTag('workflows', 'Workflow builder & execution')
      .addTag('analytics', 'Analytics & reporting')
      .addTag('audit', 'HIPAA audit trail')
      .addTag('admin', 'System administration')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  // ─── Start ──────────────────────────────────────
  const port = configService.get('API_PORT', 3000);
  await app.listen(port);

  logger.log(`Apex Health API running on http://localhost:${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
