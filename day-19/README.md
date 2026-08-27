# Day 19 – Multi-Tenant SaaS Application on AWS

## Project Overview

This project demonstrates how to build a secure and scalable
multi-tenant SaaS application using AWS services.

The application will allow multiple tenants to use the same
application while keeping their data isolated and secure.

## AWS Services

- Amazon Cognito – User authentication
- Amazon API Gateway – API management
- AWS Lambda – Serverless application logic
- Amazon RDS PostgreSQL – Relational database
- Amazon CloudWatch – Monitoring and logging
- AWS IAM – Permissions and security
- AWS Secrets Manager – Secure database credentials

## Architecture

Users
  |
  v
Amazon Cognito
  |
  | JWT
  v
API Gateway
  |
  v
AWS Lambda
  |
  v
Amazon RDS PostgreSQL

CloudWatch monitors the application.

## Multi-Tenant Design

The initial design will use a shared database and shared schema.

Each tenant will have a unique `tenant_id`.

Example:

| Tenant | tenant_id |
|---|---|
| Company A | tenant-a |
| Company B | tenant-b |

Application data will contain the tenant ID so that users
can only access data belonging to their own tenant.

## Project Goals

1. Configure Cognito authentication.
2. Create tenants and users.
3. Create an RDS PostgreSQL database.
4. Create Lambda functions.
5. Create REST APIs using API Gateway.
6. Implement tenant isolation.
7. Secure the database credentials.
8. Configure CloudWatch monitoring.
9. Test the application.
10. Document the deployment and troubleshooting process.

## Status

🚧 Project in progress.
