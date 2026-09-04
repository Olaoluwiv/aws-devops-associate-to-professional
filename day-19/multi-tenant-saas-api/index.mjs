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
    console.log("Starting tenant isolation test...");

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

    // Create two test tenants
    const tenantResult = await client.query(`
      INSERT INTO tenants (name)
      VALUES ('Tenant A'), ('Tenant B')
      RETURNING id, name
    `);

    const tenantA = tenantResult.rows.find(
      (tenant) => tenant.name === "Tenant A"
    );

    const tenantB = tenantResult.rows.find(
      (tenant) => tenant.name === "Tenant B"
    );

    console.log("Created test tenants");

    // Create one project for each tenant
    await client.query(
      `
      INSERT INTO projects (tenant_id, name, description)
      VALUES ($1, 'Tenant A Project', 'Project belonging to Tenant A')
      `,
      [tenantA.id]
    );

    await client.query(
      `
      INSERT INTO projects (tenant_id, name, description)
      VALUES ($1, 'Tenant B Project', 'Project belonging to Tenant B')
      `,
      [tenantB.id]
    );

    console.log("Created test projects");

    // Test Tenant A
    await client.query(
      "SELECT set_config('app.tenant_id', $1, false)",
      [tenantA.id]
    );
    const tenantContextA = await client.query(`
  SELECT
    current_user,
    current_setting('app.tenant_id', true) AS tenant_id
`);

console.log("Tenant A database context:", tenantContextA.rows);

    const tenantAProjects = await client.query(`
      SELECT id, tenant_id, name
      FROM projects
      ORDER BY name
    `);

    console.log("Tenant A can see:", tenantAProjects.rows);
    const tenantADirectTest = await client.query(`
  SELECT
    id,
    tenant_id,
    name,
    tenant_id = current_setting('app.tenant_id', true)::UUID AS matches_tenant
  FROM projects
  ORDER BY name
`);

console.log("Tenant A direct RLS test:", tenantADirectTest.rows);

    // Test Tenant B
    await client.query(
      "SELECT set_config('app.tenant_id', $1, false)",
      [tenantB.id]
    );
    const tenantContextB = await client.query(`
  SELECT
    current_user,
    current_setting('app.tenant_id', true) AS tenant_id
`);

console.log("Tenant B database context:", tenantContextB.rows);

    const tenantBProjects = await client.query(`
      SELECT id, tenant_id, name
      FROM projects
      ORDER BY name
    `);

    console.log("Tenant B can see:", tenantBProjects.rows);
    const tenantBDirectTest = await client.query(`
  SELECT
    id,
    tenant_id,
    name,
    tenant_id = current_setting('app.tenant_id', true)::UUID AS matches_tenant
  FROM projects
  ORDER BY name
`);

console.log("Tenant B direct RLS test:", tenantBDirectTest.rows);

    return {
  statusCode: 200,
  body: JSON.stringify({
    message: "Tenant isolation test completed",

    tenantA: {
      id: tenantA.id,
      databaseContext: tenantContextA.rows,
      visibleProjects: tenantAProjects.rows,
      directTest: tenantADirectTest.rows,
    },

    tenantB: {
      id: tenantB.id,
      databaseContext: tenantContextB.rows,
      visibleProjects: tenantBProjects.rows,
      directTest: tenantBDirectTest.rows,
    },
  }),
};

  } catch (error) {
    console.error("Tenant isolation test failed:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Tenant isolation test failed",
        error: error.message,
      }),
    };

  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
};