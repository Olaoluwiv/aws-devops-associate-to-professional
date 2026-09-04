CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- MULTI-TENANT SAAS DATABASE SCHEMA
-- ============================================

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    cognito_user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, cognito_user_id),
    UNIQUE (tenant_id, email)
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_tenant_id
ON users(tenant_id);

CREATE INDEX IF NOT EXISTS idx_projects_tenant_id
ON projects(tenant_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;

-- ============================================
-- TENANT ISOLATION POLICIES
-- ============================================

CREATE POLICY users_tenant_isolation
ON users
USING (
    tenant_id = current_setting('app.tenant_id', true)::UUID
)
WITH CHECK (
    tenant_id = current_setting('app.tenant_id', true)::UUID
);

CREATE POLICY projects_tenant_isolation
ON projects
USING (
    tenant_id = current_setting('app.tenant_id', true)::UUID
)
WITH CHECK (
    tenant_id = current_setting('app.tenant_id', true)::UUID
);