import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial Schema Migration
 *
 * Creates all core tables, schemas, extensions, RLS policies, and indexes
 * required by the Apex Health Platform.
 *
 * This migration matches the init SQL in docker/postgres/init/01-init-databases.sql
 * and adds full table definitions for all TypeORM entities.
 */
export class InitialSchema1706900000000 implements MigrationInterface {
  name = 'InitialSchema1706900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ═══════════════════════════════════════
    // Extensions
    // ═══════════════════════════════════════
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "vector"`);

    // ═══════════════════════════════════════
    // Schemas
    // ═══════════════════════════════════════
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS auth`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS org`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS member`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS claims`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS provider`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS billing`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS documents`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS integration`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS workflow`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS audit`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS analytics`);

    // ═══════════════════════════════════════
    // Trigger Function
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // ═══════════════════════════════════════
    // auth.users
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS auth.users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'member',
        organization_id UUID NOT NULL,
        department VARCHAR(100),
        title VARCHAR(200),
        password_hash VARCHAR(255) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        mfa_enabled BOOLEAN NOT NULL DEFAULT false,
        mfa_secret VARCHAR(255),
        failed_login_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until TIMESTAMPTZ,
        last_login_at TIMESTAMPTZ,
        password_changed_at TIMESTAMPTZ,
        permissions JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // org.organizations
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS org.organizations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'payer',
        tax_id VARCHAR(20),
        npi VARCHAR(10),
        cms_id VARCHAR(20),
        address_line1 VARCHAR(255),
        address_line2 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(2),
        zip VARCHAR(10),
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        licensed_modules TEXT[] DEFAULT ARRAY[]::TEXT[],
        settings JSONB DEFAULT '{}'::jsonb,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // audit.hipaa_audit_log
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit.hipaa_audit_log (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID,
        user_id UUID,
        user_email VARCHAR(255),
        user_role VARCHAR(50),
        action VARCHAR(50) NOT NULL,
        resource_type VARCHAR(100) NOT NULL,
        resource_id VARCHAR(255),
        description TEXT,
        phi_accessed BOOLEAN NOT NULL DEFAULT false,
        phi_fields TEXT[],
        ip_address VARCHAR(45),
        user_agent TEXT,
        request_id VARCHAR(100),
        request_method VARCHAR(10),
        request_path TEXT,
        response_status INTEGER,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // claims.claims
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS claims.claims (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL,
        claim_number VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(30) NOT NULL DEFAULT 'professional',
        status VARCHAR(30) NOT NULL DEFAULT 'received',
        source VARCHAR(30) NOT NULL DEFAULT 'portal',
        member_id VARCHAR(50) NOT NULL,
        subscriber_id VARCHAR(50),
        patient_first_name VARCHAR(100),
        patient_last_name VARCHAR(100),
        patient_dob DATE,
        patient_gender VARCHAR(10),
        member_plan_id VARCHAR(50),
        rendering_provider_id UUID,
        rendering_provider_npi VARCHAR(10),
        rendering_provider_name VARCHAR(200),
        billing_provider_id UUID,
        billing_provider_npi VARCHAR(10),
        billing_provider_name VARCHAR(200),
        facility_id UUID,
        facility_npi VARCHAR(10),
        facility_name VARCHAR(200),
        place_of_service_code VARCHAR(5),
        service_from_date DATE,
        service_to_date DATE,
        received_date DATE,
        processed_date DATE,
        paid_date DATE,
        primary_diagnosis_code VARCHAR(10),
        primary_diagnosis_description VARCHAR(500),
        additional_diagnosis_codes JSONB DEFAULT '[]'::jsonb,
        total_charged_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        total_allowed_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        total_paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        total_member_responsibility DECIMAL(12,2) NOT NULL DEFAULT 0,
        total_deductible DECIMAL(12,2) NOT NULL DEFAULT 0,
        total_copay DECIMAL(12,2) NOT NULL DEFAULT 0,
        total_coinsurance DECIMAL(12,2) NOT NULL DEFAULT 0,
        ai_confidence_score DECIMAL(5,2),
        ai_recommendation VARCHAR(20),
        ai_flags JSONB DEFAULT '[]'::jsonb,
        notes JSONB DEFAULT '[]'::jsonb,
        adjustment_codes JSONB DEFAULT '[]'::jsonb,
        assigned_processor_id UUID,
        reviewed_by_id UUID,
        denial_reason_code VARCHAR(20),
        denial_reason_description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // claims.claim_service_lines
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS claims.claim_service_lines (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        claim_id UUID NOT NULL REFERENCES claims.claims(id) ON DELETE CASCADE,
        line_number INTEGER NOT NULL,
        procedure_code VARCHAR(10) NOT NULL,
        procedure_description VARCHAR(500),
        modifier_codes VARCHAR(10)[] DEFAULT ARRAY[]::VARCHAR[],
        diagnosis_pointer INTEGER[] DEFAULT ARRAY[]::INTEGER[],
        service_date DATE,
        units DECIMAL(10,2) NOT NULL DEFAULT 1,
        charged_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        allowed_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        adjustment_reason_code VARCHAR(10),
        remark_code VARCHAR(10),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // claims.prior_authorizations
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS claims.prior_authorizations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL,
        auth_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'submitted',
        urgency VARCHAR(20) NOT NULL DEFAULT 'standard',
        type VARCHAR(30) NOT NULL DEFAULT 'procedure',
        member_id VARCHAR(50) NOT NULL,
        member_name VARCHAR(200),
        member_dob DATE,
        plan_id VARCHAR(50),
        requesting_provider_id UUID,
        requesting_provider_npi VARCHAR(10),
        requesting_provider_name VARCHAR(200),
        requesting_provider_specialty VARCHAR(100),
        servicing_provider_id UUID,
        servicing_provider_npi VARCHAR(10),
        servicing_provider_name VARCHAR(200),
        facility_id UUID,
        facility_name VARCHAR(200),
        primary_diagnosis_code VARCHAR(10),
        primary_diagnosis_description VARCHAR(500),
        additional_diagnosis_codes JSONB DEFAULT '[]'::jsonb,
        requested_procedures JSONB DEFAULT '[]'::jsonb,
        clinical_notes TEXT,
        clinical_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
        submitted_at TIMESTAMPTZ,
        decision_at TIMESTAMPTZ,
        expiration_date DATE,
        sla_deadline TIMESTAMPTZ,
        sla_status VARCHAR(20) DEFAULT 'on_track',
        days_in_review INTEGER DEFAULT 0,
        reviewer_id UUID,
        reviewer_notes TEXT,
        denial_reason_code VARCHAR(20),
        denial_reason TEXT,
        ai_recommendation VARCHAR(20),
        ai_confidence_score DECIMAL(5,2),
        ai_analysis JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // member.members
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS member.members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL,
        member_id VARCHAR(50) NOT NULL,
        subscriber_id VARCHAR(50),
        relationship VARCHAR(20) NOT NULL DEFAULT 'self',
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        middle_name VARCHAR(100),
        date_of_birth DATE NOT NULL,
        gender VARCHAR(10),
        ssn_encrypted TEXT,
        ssn_hash VARCHAR(64),
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        effective_date DATE NOT NULL,
        termination_date DATE,
        plan_id VARCHAR(50),
        plan_name VARCHAR(200),
        group_id VARCHAR(50),
        group_name VARCHAR(200),
        pcp_provider_id UUID,
        pcp_provider_name VARCHAR(200),
        email VARCHAR(255),
        phone VARCHAR(20),
        address JSONB,
        risk_score DECIMAL(5,2),
        hcc_codes TEXT[],
        chronic_conditions TEXT[],
        care_gaps JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (organization_id, member_id)
      );
    `);

    // ═══════════════════════════════════════
    // member.benefit_plans
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS member.benefit_plans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL,
        plan_name VARCHAR(200) NOT NULL,
        plan_id VARCHAR(50) NOT NULL,
        plan_type VARCHAR(30) NOT NULL,
        effective_date DATE NOT NULL,
        termination_date DATE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        metal_level VARCHAR(20),
        deductibles JSONB DEFAULT '{}'::jsonb,
        oop_maximums JSONB DEFAULT '{}'::jsonb,
        premiums JSONB DEFAULT '{}'::jsonb,
        benefits JSONB DEFAULT '[]'::jsonb,
        exclusions TEXT[],
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // member.member_eligibility
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS member.member_eligibility (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL,
        member_id VARCHAR(50) NOT NULL,
        plan_id VARCHAR(50) NOT NULL,
        coverage_type VARCHAR(30) NOT NULL DEFAULT 'medical',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        effective_date DATE NOT NULL,
        termination_date DATE,
        benefits JSONB DEFAULT '{}'::jsonb,
        deductible_met DECIMAL(12,2) DEFAULT 0,
        oop_met DECIMAL(12,2) DEFAULT 0,
        last_verified_at TIMESTAMPTZ,
        verification_source VARCHAR(50),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // member.enrollment_events
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS member.enrollment_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL,
        member_id VARCHAR(50) NOT NULL,
        event_type VARCHAR(30) NOT NULL,
        effective_date DATE NOT NULL,
        plan_id VARCHAR(50),
        previous_plan_id VARCHAR(50),
        reason VARCHAR(100),
        source VARCHAR(50) DEFAULT 'portal',
        processed_at TIMESTAMPTZ,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        edi_transaction_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // provider.providers
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS provider.providers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL,
        npi VARCHAR(10) UNIQUE NOT NULL,
        type VARCHAR(30) NOT NULL DEFAULT 'individual',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        network_tier VARCHAR(30),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        display_name VARCHAR(300),
        credentials VARCHAR(50),
        specialty VARCHAR(200),
        taxonomy_code VARCHAR(20),
        phone VARCHAR(20),
        email VARCHAR(255),
        accepting_new_patients BOOLEAN DEFAULT true,
        credentialing_status VARCHAR(30) DEFAULT 'pending',
        credentialing_date DATE,
        license_number VARCHAR(50),
        license_state VARCHAR(2),
        license_expiration_date DATE,
        board_certified BOOLEAN DEFAULT false,
        group_affiliations TEXT[],
        hospital_affiliations TEXT[],
        languages TEXT[],
        address JSONB DEFAULT '{}'::jsonb,
        quality_score DECIMAL(5,1),
        patient_satisfaction_score DECIMAL(4,1),
        contract_id UUID,
        fee_schedule_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // billing.invoices
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS billing.invoices (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        entity_type VARCHAR(30) NOT NULL,
        entity_id UUID NOT NULL,
        entity_name VARCHAR(200),
        subtotal_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        adjustment_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        balance_due DECIMAL(12,2) NOT NULL DEFAULT 0,
        invoice_date DATE NOT NULL,
        due_date DATE NOT NULL,
        period_start_date DATE,
        period_end_date DATE,
        line_items JSONB DEFAULT '[]'::jsonb,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // billing.payments
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS billing.payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL,
        invoice_id UUID REFERENCES billing.invoices(id),
        payment_number VARCHAR(50) UNIQUE NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        method VARCHAR(30) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        payer_name VARCHAR(200),
        payer_type VARCHAR(30),
        reference_number VARCHAR(100),
        payment_date DATE NOT NULL,
        posted_date DATE,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // documents.documents
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS documents.documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL,
        uploaded_by UUID,
        file_name VARCHAR(500) NOT NULL,
        original_name VARCHAR(500) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size_bytes BIGINT NOT NULL,
        storage_path TEXT NOT NULL,
        storage_bucket VARCHAR(100) NOT NULL DEFAULT 'apex-documents',
        category VARCHAR(50),
        entity_type VARCHAR(50),
        entity_id UUID,
        tags TEXT[],
        metadata JSONB DEFAULT '{}'::jsonb,
        ocr_text TEXT,
        ocr_status VARCHAR(20) DEFAULT 'pending',
        ai_classification VARCHAR(100),
        ai_confidence DECIMAL(5,2),
        ai_extracted_data JSONB,
        is_phi BOOLEAN NOT NULL DEFAULT false,
        retention_date DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // integration.edi_transactions
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS integration.edi_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL,
        transaction_type VARCHAR(10) NOT NULL,
        direction VARCHAR(10) NOT NULL DEFAULT 'outbound',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        sender_id VARCHAR(50),
        receiver_id VARCHAR(50),
        control_number VARCHAR(20),
        raw_content TEXT,
        parsed_content JSONB,
        validation_errors JSONB DEFAULT '[]'::jsonb,
        related_entity_type VARCHAR(50),
        related_entity_id UUID,
        file_name VARCHAR(255),
        processed_at TIMESTAMPTZ,
        acknowledged_at TIMESTAMPTZ,
        error_message TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // workflow.workflows
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS workflow.workflows (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        trigger_type VARCHAR(30) NOT NULL DEFAULT 'manual',
        trigger_config JSONB DEFAULT '{}'::jsonb,
        nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
        edges JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_active BOOLEAN NOT NULL DEFAULT false,
        version INTEGER NOT NULL DEFAULT 1,
        created_by UUID,
        updated_by UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // workflow.workflow_executions
    // ═══════════════════════════════════════
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS workflow.workflow_executions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        workflow_id UUID NOT NULL REFERENCES workflow.workflows(id),
        organization_id UUID NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'running',
        trigger_data JSONB DEFAULT '{}'::jsonb,
        current_node VARCHAR(100),
        execution_log JSONB DEFAULT '[]'::jsonb,
        result JSONB,
        error TEXT,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ═══════════════════════════════════════
    // Indexes
    // ═══════════════════════════════════════
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_org ON auth.users(organization_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_audit_org ON audit.hipaa_audit_log(organization_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_audit_user ON audit.hipaa_audit_log(user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_audit_created ON audit.hipaa_audit_log(created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_claims_org ON claims.claims(organization_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_claims_member ON claims.claims(member_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_claims_status ON claims.claims(status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_claims_received ON claims.claims(received_date)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_claims_number ON claims.claims(claim_number)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_pa_org ON claims.prior_authorizations(organization_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_pa_member ON claims.prior_authorizations(member_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_pa_status ON claims.prior_authorizations(status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_members_org ON member.members(organization_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_members_mid ON member.members(member_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_members_status ON member.members(status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_providers_org ON provider.providers(organization_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_providers_npi ON provider.providers(npi)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_providers_spec ON provider.providers(specialty)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_invoices_org ON billing.invoices(organization_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_invoices_status ON billing.invoices(status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_documents_org ON documents.documents(organization_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents.documents(entity_type, entity_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_edi_org ON integration.edi_transactions(organization_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_edi_type ON integration.edi_transactions(transaction_type)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_workflows_org ON workflow.workflows(organization_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_workflow_exec_wf ON workflow.workflow_executions(workflow_id)`);

    // ═══════════════════════════════════════
    // Triggers (updated_at)
    // ═══════════════════════════════════════
    const tablesWithUpdatedAt = [
      'auth.users', 'org.organizations', 'claims.claims', 'claims.claim_service_lines',
      'claims.prior_authorizations', 'member.members', 'member.benefit_plans',
      'member.member_eligibility', 'member.enrollment_events', 'provider.providers',
      'billing.invoices', 'billing.payments', 'documents.documents',
      'integration.edi_transactions', 'workflow.workflows', 'workflow.workflow_executions',
    ];

    for (const table of tablesWithUpdatedAt) {
      const triggerName = `trigger_${table.replace('.', '_')}_updated_at`;
      await queryRunner.query(`
        CREATE OR REPLACE TRIGGER ${triggerName}
        BEFORE UPDATE ON ${table}
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
      `);
    }

    // ═══════════════════════════════════════
    // Row-Level Security (multi-tenancy)
    // ═══════════════════════════════════════
    const rlsTables = [
      'claims.claims', 'claims.prior_authorizations', 'member.members',
      'provider.providers', 'billing.invoices', 'documents.documents',
      'workflow.workflows',
    ];

    for (const table of rlsTables) {
      await queryRunner.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
      const policyName = `rls_${table.replace('.', '_')}_org`;
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE POLICY ${policyName} ON ${table}
            USING (organization_id = current_setting('app.current_organization_id')::uuid);
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse order to respect foreign keys
    await queryRunner.query(`DROP TABLE IF EXISTS workflow.workflow_executions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS workflow.workflows CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS integration.edi_transactions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS documents.documents CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS billing.payments CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS billing.invoices CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS provider.providers CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS member.enrollment_events CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS member.member_eligibility CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS member.benefit_plans CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS member.members CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS claims.prior_authorizations CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS claims.claim_service_lines CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS claims.claims CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS audit.hipaa_audit_log CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS org.organizations CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS auth.users CASCADE`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at() CASCADE`);
  }
}
