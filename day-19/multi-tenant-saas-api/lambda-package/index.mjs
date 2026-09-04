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

export const handler = async (event) => {
  let client;

  try {
    console.log("Starting database connection...");

    const secret = await getDatabaseSecret();

    console.log("Successfully retrieved database secret");

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

    console.log("Connecting to PostgreSQL...");

    await client.connect();

    console.log("Successfully connected to PostgreSQL");

    const result = await client.query(
      "SELECT NOW() AS current_time"
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successfully connected to PostgreSQL",
        database: process.env.DB_NAME || "postgres",
        currentTime: result.rows[0].current_time,
      }),
    };
  } catch (error) {
    console.error("Database connection error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Database connection failed",
        error: error.message,
      }),
    };
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
};