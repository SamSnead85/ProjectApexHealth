/**
 * TypeORM DataSource configuration for CLI usage (migrations, seeding).
 *
 * This file is referenced by the migration scripts in package.json:
 *   typeorm migration:run -d src/database/data-source.ts
 *   typeorm migration:generate -d src/database/data-source.ts
 *
 * It mirrors the configuration in app.module.ts but can be used outside NestJS.
 */

import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from both local and root .env files
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

// Entity imports
import { User } from '../modules/auth/entities/user.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { Organization } from '../modules/organization/entities/organization.entity';
import { Claim } from '../modules/claims/entities/claim.entity';
import { ClaimServiceLine } from '../modules/claims/entities/claim-service-line.entity';
import { MemberEligibility } from '../modules/eligibility/entities/member-eligibility.entity';
import { BenefitPlan } from '../modules/eligibility/entities/benefit-plan.entity';
import { EnrollmentEvent } from '../modules/eligibility/entities/enrollment-event.entity';
import { PriorAuthorization } from '../modules/prior-auth/entities/prior-auth.entity';
import { Provider } from '../modules/providers/entities/provider.entity';
import { Member } from '../modules/members/entities/member.entity';
import { Invoice } from '../modules/billing/entities/invoice.entity';
import { Payment } from '../modules/billing/entities/payment.entity';
import { Document } from '../modules/documents/entities/document.entity';
import { EDITransaction } from '../modules/edi/entities/edi-transaction.entity';
import { Workflow } from '../modules/workflow/entities/workflow.entity';
import { WorkflowExecution } from '../modules/workflow/entities/workflow-execution.entity';

const entities = [
  User,
  AuditLog,
  Organization,
  Claim,
  ClaimServiceLine,
  MemberEligibility,
  BenefitPlan,
  EnrollmentEvent,
  PriorAuthorization,
  Provider,
  Member,
  Invoice,
  Payment,
  Document,
  EDITransaction,
  Workflow,
  WorkflowExecution,
];

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'apex_admin',
  password: process.env.DB_PASSWORD || 'apex_dev_password_2024',
  database: process.env.DB_DATABASE || 'apex_health',
  entities,
  migrations: [path.join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false, // Always false for migrations
  logging: process.env.DB_LOGGING === 'true',
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false,
  extra: {
    max: 20,
    connectionTimeoutMillis: 5000,
  },
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
