-- ═══════════════════════════════════════════════════════
-- Project Apex - PostgreSQL Initialization
-- Creates schemas, extensions, and base roles
-- ═══════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";        -- pgvector for AI embeddings
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Trigram similarity for fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gist";    -- GiST index support

-- ─── Create Schemas ──────────────────────────────────
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS org;
CREATE SCHEMA IF NOT EXISTS member;
CREATE SCHEMA IF NOT EXISTS provider;
CREATE SCHEMA IF NOT EXISTS claims;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS documents;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS workflow;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS edi;
CREATE SCHEMA IF NOT EXISTS fhir;
CREATE SCHEMA IF NOT EXISTS ai;

-- ─── HIPAA Audit Log Table (created early, used by all modules) ──
CREATE TABLE IF NOT EXISTS audit.hipaa_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID,
    user_email VARCHAR(255),
    user_role VARCHAR(100),
    organization_id UUID,
    action VARCHAR(50) NOT NULL,          -- CREATE, READ, UPDATE, DELETE, EXPORT, PRINT
    resource_type VARCHAR(100) NOT NULL,   -- Patient, Claim, Document, etc.
    resource_id VARCHAR(255),
    phi_accessed BOOLEAN DEFAULT FALSE,
    phi_fields TEXT[],                     -- Which PHI fields were accessed
    ip_address INET,
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path TEXT,
    response_status INTEGER,
    details JSONB,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX idx_audit_timestamp ON audit.hipaa_audit_log (timestamp DESC);
CREATE INDEX idx_audit_user ON audit.hipaa_audit_log (user_id, timestamp DESC);
CREATE INDEX idx_audit_resource ON audit.hipaa_audit_log (resource_type, resource_id);
CREATE INDEX idx_audit_org ON audit.hipaa_audit_log (organization_id, timestamp DESC);
CREATE INDEX idx_audit_phi ON audit.hipaa_audit_log (phi_accessed) WHERE phi_accessed = TRUE;

-- ─── Organizations Table (Multi-tenant root) ────────
CREATE TABLE IF NOT EXISTS org.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('payer', 'provider', 'employer', 'broker', 'tpa')),
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
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    licensed_modules TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Users Table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keycloak_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    organization_id UUID REFERENCES org.organizations(id),
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'system_admin', 'org_admin', 'claims_processor', 'claims_supervisor',
        'medical_director', 'care_manager', 'member', 'broker', 
        'employer_admin', 'provider', 'auditor', 'analyst', 'support'
    )),
    department VARCHAR(100),
    title VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email_org ON auth.users (email, organization_id);
CREATE INDEX idx_users_org ON auth.users (organization_id);
CREATE INDEX idx_users_role ON auth.users (role);

-- ─── Row-Level Security Policies ─────────────────────
-- These ensure multi-tenant data isolation
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.hipaa_audit_log ENABLE ROW LEVEL SECURITY;

-- ─── Base Helper Functions ────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to organizations
CREATE TRIGGER trg_org_updated_at
    BEFORE UPDATE ON org.organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Apply to users
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Notify on audit events (for real-time monitoring) ──
CREATE OR REPLACE FUNCTION audit.notify_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('audit_events', json_build_object(
        'id', NEW.id,
        'action', NEW.action,
        'resource_type', NEW.resource_type,
        'user_id', NEW.user_id,
        'phi_accessed', NEW.phi_accessed,
        'timestamp', NEW.timestamp
    )::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_notify
    AFTER INSERT ON audit.hipaa_audit_log
    FOR EACH ROW EXECUTE FUNCTION audit.notify_audit_event();

COMMENT ON SCHEMA auth IS 'Authentication and authorization';
COMMENT ON SCHEMA org IS 'Organization and tenant management';
COMMENT ON SCHEMA member IS 'Member/patient data and services';
COMMENT ON SCHEMA provider IS 'Provider network and credentialing';
COMMENT ON SCHEMA claims IS 'Claims processing and adjudication';
COMMENT ON SCHEMA billing IS 'Premium billing and payments';
COMMENT ON SCHEMA documents IS 'Document management and storage';
COMMENT ON SCHEMA audit IS 'HIPAA audit trails and compliance logging';
COMMENT ON SCHEMA workflow IS 'Workflow definitions and execution';
COMMENT ON SCHEMA analytics IS 'Analytics, reporting, and KPIs';
COMMENT ON SCHEMA edi IS 'EDI X12 transaction processing';
COMMENT ON SCHEMA fhir IS 'FHIR R4 resource storage';
COMMENT ON SCHEMA ai IS 'AI agent state, embeddings, and model registry';
