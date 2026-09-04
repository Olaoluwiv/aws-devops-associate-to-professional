import pg from "pg";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const { Client } = pg;

const secretsManager = new SecretsManagerClient({
  region: process.env.AWS_REGION,
});

let cachedSecret;

async function getDatabaseSecret() {
  if (cachedSecret) {
    return cachedSecret;
  }

  const command = new GetSecretValueCommand({
    SecretId: process.env.DB_SECRET_ARN,
  });

  const response = await secretsManager.send(command);

  cachedSecret = JSON.parse(response.SecretString);

  return cachedSecret;
}

export const handler = async () => {
  let client;

  try {
    console.log("Starting comprehensive RLS diagnostic...");

    const secret = await getDatabaseSecret();

    client = new Client({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || "postgres",
      user: secret.username,
      password: secret.password,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await client.connect();

    console.log("Connected to PostgreSQL");

    // 1. Current database/session information
    const sessionResult = await client.query(`
      SELECT
        current_database() AS database_name,
        current_user,
        session_user,
        current_setting('row_security') AS row_security;
    `);

    console.log("Session information:", sessionResult.rows);

    // 2. Current role privileges
    const roleResult = await client.query(`
      SELECT
        rolname,
        rolsuper,
        rolbypassrls,
        rolcreaterole,
        rolcreatedb
      FROM pg_roles
      WHERE rolname = current_user;
    `);

    console.log("Current role:", roleResult.rows);

    // 3. Role memberships
    const membershipResult = await client.query(`
      SELECT
        member.rolname AS member_role,
        parent.rolname AS member_of
      FROM pg_auth_members m
      JOIN pg_roles parent
        ON parent.oid = m.roleid
      JOIN pg_roles member
        ON member.oid = m.member
      WHERE member.rolname = current_user;
    `);

    console.log("Role memberships:", membershipResult.rows);

    // 4. Table ownership
    const ownershipResult = await client.query(`
      SELECT
        n.nspname AS schema_name,
        c.relname AS table_name,
        r.rolname AS table_owner,
        c.relrowsecurity AS rls_enabled,
        c.relforcerowsecurity AS rls_forced
      FROM pg_class c
      JOIN pg_namespace n
        ON n.oid = c.relnamespace
      JOIN pg_roles r
        ON r.oid = c.relowner
      WHERE n.nspname = 'public'
        AND c.relname IN ('tenants', 'users', 'projects')
      ORDER BY c.relname;
    `);

    console.log("Table ownership/RLS:", ownershipResult.rows);

    // 5. RLS policies
    const policyResult = await client.query(`
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename IN ('users', 'projects')
      ORDER BY tablename, policyname;
    `);

    console.log("RLS policies:", policyResult.rows);

    // 6. Explicit privileges
    const privilegesResult = await client.query(`
      SELECT
        table_name,
        privilege_type,
        grantee
      FROM information_schema.role_table_grants
      WHERE table_schema = 'public'
        AND table_name IN ('users', 'projects')
        AND grantee = current_user
      ORDER BY table_name, privilege_type;
    `);

    console.log("Table privileges:", privilegesResult.rows);

    // 7. Check tenant context
    await client.query(
      "SELECT set_config('app.tenant_id', $1, false)",
      ["00000000-0000-0000-0000-000000000000"]
    );

    const contextResult = await client.query(`
      SELECT
        current_user,
        current_setting('app.tenant_id', true) AS tenant_id;
    `);

    console.log("Tenant context:", contextResult.rows);

    // 8. Test actual RLS filtering
    const projectResult = await client.query(`
      SELECT
        id,
        tenant_id,
        name
      FROM projects
      ORDER BY name;
    `);

    console.log("Projects visible with test tenant:", projectResult.rows);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Comprehensive RLS diagnostic completed",
        session: sessionResult.rows,
        role: roleResult.rows,
        memberships: membershipResult.rows,
        ownership: ownershipResult.rows,
        policies: policyResult.rows,
        privileges: privilegesResult.rows,
        tenantContext: contextResult.rows,
        visibleProjects: projectResult.rows,
      }),
    };

  } catch (error) {
    console.error("RLS diagnostic failed:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "RLS diagnostic failed",
        error: error.message,
      }),
    };

  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
};