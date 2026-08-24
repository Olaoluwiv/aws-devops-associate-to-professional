# Multi-Tenant SaaS Platform on AWS

A practical, end-to-end cloud engineering project demonstrating how to design, build, secure, test, monitor, and deploy a multi-tenant SaaS backend using Amazon Web Services.

This project is being built as a **learning-focused but production-minded AWS project**. The goal is not only to make the application work, but to document the entire engineering process so that another learner can reproduce the project from the beginning and understand **why each component exists and how the components work together**.

---

## 1. Project Overview

This project implements the backend foundation of a **multi-tenant Software-as-a-Service (SaaS) platform**.

The application is designed around the concept of multiple organizations, or **tenants**, sharing the same application infrastructure while keeping their data logically separated.

For example:

```text
Tenant A
└── Users
    ├── User A1
    ├── User A2
    └── User A3

Tenant B
└── Users
    ├── User B1
    ├── User B2
    └── User B3
```

The backend provides APIs for managing tenants and users while using AWS managed services for compute, networking, authentication, monitoring, security, and deployment.

The project is being developed incrementally, with each component tested before moving to the next stage.

---

# 2. Project Goals

The main goals of this project are to:

* Understand AWS serverless architecture.
* Understand multi-tenant application design.
* Build REST APIs using Amazon API Gateway.
* Build backend functions using AWS Lambda.
* Store application data in PostgreSQL on Amazon RDS.
* Integrate Lambda with PostgreSQL.
* Implement tenant and user management.
* Integrate Amazon Cognito for authentication.
* Apply IAM security principles.
* Configure security groups and network access.
* Monitor the application using Amazon CloudWatch.
* Use Amazon EventBridge for event-driven automation.
* Containerize components where appropriate with Docker.
* Build a CI/CD pipeline using AWS developer tools.
* Document real-world errors and their solutions.
* Create a repository that can be followed by a beginner.
* Develop a foundation that can eventually be extended toward production.

---

# 3. What Are We Building?

At a high level, the system contains:

```text
                    Users / Clients
                           |
                           v
                  Amazon API Gateway
                           |
                           v
                    AWS Lambda
                           |
                           v
                 PostgreSQL Database
                    Amazon RDS
                           |
             +-------------+-------------+
             |                           |
             v                           v
          Tenants                      Users
```

Authentication and authorization will be handled through Amazon Cognito.

Monitoring and operational visibility will be provided through Amazon CloudWatch.

Event-driven automation will be implemented with Amazon EventBridge where appropriate.

The CI/CD portion will use AWS developer and deployment services.

---

# 4. High-Level Architecture

The intended architecture is:

```text
                         CLIENT
                           |
                           v
                    API Gateway
                           |
              +------------+------------+
              |                         |
              v                         v
       Authentication              API Routes
        Amazon Cognito                  |
                                        v
                                  AWS Lambda
                                        |
                                        v
                                PostgreSQL / RDS
                                        |
                              +---------+---------+
                              |                   |
                              v                   v
                           Tenants              Users


        Monitoring
            |
            v
       CloudWatch


        Event-driven automation
            |
            v
       EventBridge
            |
            v
          Lambda


        CI/CD
            |
            v
   Source → Build → Deploy
```

The architecture will evolve as additional components are introduced.

An architecture diagram will be maintained in:

```text
architecture/architecture-diagram.png
```

and explained in:

```text
architecture/architecture.md
```

---

# 5. AWS Services Used

The project uses or is planned to use the following AWS services:

| AWS Service        | Purpose                        |
| ------------------ | ------------------------------ |
| AWS Lambda         | Serverless backend functions   |
| Amazon API Gateway | REST API interface             |
| Amazon RDS         | PostgreSQL database            |
| Amazon Cognito     | User authentication            |
| IAM                | Permissions and access control |
| Amazon VPC         | Network isolation              |
| Security Groups    | Network access control         |
| Amazon CloudWatch  | Logs, metrics and monitoring   |
| Amazon EventBridge | Event-driven automation        |
| AWS CodeBuild      | Application/build automation   |
| AWS CodePipeline   | CI/CD orchestration            |
| AWS CodeDeploy     | Deployment automation          |
| Amazon S3          | Artifact storage               |
| Docker             | Containerization               |
| Docker Hub         | Container image registry       |

Not every service is required for the minimum application to function. Some services are included to demonstrate how the application can evolve toward a more complete cloud architecture.

---

# 6. Multi-Tenant Architecture

The application follows a tenant-based data model.

A tenant represents an organization using the SaaS application.

For example:

```text
Acme Technologies
    |
    +-- User 1
    +-- User 2
    +-- User 3

Another Company
    |
    +-- User 4
    +-- User 5
```

Each user is associated with a tenant through:

```text
tenant_id
```

This allows the application to determine which organization a user belongs to.

The fundamental relationship is:

```text
tenants
   |
   | 1
   |
   | 
   | many
   v
users
```

This relationship is enforced in PostgreSQL.

---

# 7. Database Design

The project currently uses PostgreSQL on Amazon RDS.

The core database tables are:

## Tenants

```text
tenants
├── tenant_id
├── tenant_name
└── created_at
```

## Users

```text
users
├── user_id
├── tenant_id
├── cognito_sub
├── email
├── role
└── created_at
```

The `tenant_id` in the `users` table establishes the relationship between users and tenants.

The database documentation will be maintained under:

```text
database/
```

---

# 8. Tenant Management

The project implements tenant management through Lambda functions.

Current tenant operations include:

```text
Create Tenant
Get Tenant
Delete Tenant
```

Each operation has its own Lambda function.

The corresponding project folders are:

```text
lambdas/
├── create-tenant/
├── get-tenant/
└── delete-tenant/
```

Tenant deletion also demonstrates an important database integrity rule.

A tenant cannot be deleted while users are associated with it.

For example:

```text
DELETE TENANT
      |
      v
Are users associated?
      |
   +--+--+
   |     |
  YES    NO
   |      |
   v      v
409     DELETE
Conflict
```

This protects related application data.

---

# 9. User Management

The project implements CRUD operations for users.

Current operations include:

```text
Create User
Get User
Update User
Delete User
```

The Lambda functions are organized as:

```text
lambdas/
├── create-user/
├── get-user/
├── update-user/
└── delete-user/
```

Each function connects to PostgreSQL using the Node.js PostgreSQL driver:

```text
pg
```

Database credentials are supplied through environment configuration rather than being hard-coded into the source code.

---

# 10. Lambda Functions

AWS Lambda provides the serverless compute layer.

Each Lambda performs one focused operation.

For example:

```text
create-user
    |
    +-- Validate input
    +-- Connect to PostgreSQL
    +-- Validate tenant
    +-- Insert user
    +-- Return response
```

The Lambda functions use Node.js and ECMAScript modules.

Example:

```javascript
import pg from "pg";

const { Client } = pg;
```

Each Lambda project contains its own dependency information.

Example structure:

```text
create-user/
├── index.mjs
├── package.json
├── package-lock.json
└── README.md
```

This makes every function independently understandable and deployable.

---

# 11. API Gateway

Amazon API Gateway exposes the Lambda functions as HTTP endpoints.

The API currently includes a `/users` resource.

For example:

```text
GET /users
```

and a user-specific route:

```text
GET /users/{user_id}
```

A user-specific request can therefore look like:

```text
GET /users/14f95e62-965d-403c-97e0-def11bdf6993
```

API Gateway passes the path parameter to Lambda through:

```javascript
event.pathParameters.user_id
```

This distinction is important.

A query parameter looks like:

```text
/users?user_id=123
```

while a path parameter looks like:

```text
/users/123
```

The project has already been tested using both approaches during development, and the implementation has been moved toward the RESTful path-parameter design.

API Gateway documentation is maintained under:

```text
api-gateway/
```

---

# 12. Amazon Cognito

Amazon Cognito will provide the authentication layer.

The user identity can be associated with the application database through:

```text
cognito_sub
```

The intended relationship is:

```text
Cognito User
     |
     | sub
     v
Application User
     |
     v
tenant_id
     |
     v
Tenant
```

This allows the authentication identity to be associated with the correct application tenant.

Cognito documentation will be maintained under:

```text
cognito/
```

---

# 13. Security

Security is a major part of this project.

The application should follow the principle of:

> Give every component only the permissions it actually needs.

Security considerations include:

* IAM roles
* IAM policies
* Lambda permissions
* RDS security groups
* VPC configuration
* Database credentials
* Parameter Store / secrets management
* API authorization
* Cognito authentication
* Least-privilege access

Sensitive information must never be committed to GitHub.

The following must never be stored in the repository:

```text
AWS access keys
AWS secret keys
Database passwords
Docker Hub passwords
Docker Hub access tokens
Cognito secrets
API secrets
Private keys
```

The security documentation is maintained under:

```text
security/
```

---

# 14. Amazon CloudWatch

Amazon CloudWatch provides observability for the application.

CloudWatch is used for:

* Lambda logs
* Application logs
* Metrics
* Alarms
* Operational monitoring
* Troubleshooting

For example, Lambda execution information can be inspected through CloudWatch Logs.

The project will also demonstrate how CloudWatch can be used to monitor AWS resources and trigger automated actions.

Documentation:

```text
cloudwatch/
├── README.md
├── logs.md
├── metrics.md
└── alarms.md
```

---

# 15. Amazon EventBridge

EventBridge will be used for event-driven automation.

The basic concept is:

```text
AWS Event
    |
    v
EventBridge Rule
    |
    v
Lambda
    |
    v
Automated Action
```

This project has also explored using EventBridge to detect AWS resource events and trigger Lambda-based automation.

The EventBridge documentation is maintained under:

```text
eventbridge/
```

---

# 16. Docker

Docker is used to demonstrate containerization and application packaging.

The project also explores pushing images to Docker Hub.

Example image:

```text
docker.io/olaoluwiv/simple-python-flask-app:latest
```

Docker documentation will be maintained under:

```text
docker/
```

---

# 17. CI/CD

The project includes an AWS CI/CD component.

The intended workflow is:

```text
Developer
    |
    v
GitHub
    |
    v
CodePipeline
    |
    v
CodeBuild
    |
    v
Artifact
    |
    v
Deployment
    |
    v
AWS Environment
```

The project has already involved practical work with:

* AWS CodeBuild
* AWS CodePipeline
* AWS CodeDeploy
* IAM service roles
* S3 artifacts
* CloudWatch build logs

The CI/CD documentation will be maintained under:

```text
cicd/
```

---

# 18. Testing Strategy

Testing is performed at multiple levels.

## Lambda testing

Each Lambda is tested directly using AWS Lambda test events.

Examples include:

```text
create_user_test
get-user
update-user
delete-user
get-tenant
delete-tenant
```

## API testing

API Gateway endpoints are tested using PowerShell and HTTP requests.

Example:

```powershell
Invoke-RestMethod "https://API_ID.execute-api.us-east-1.amazonaws.com/dev/users/USER_ID"
```

## Database validation

Database results are verified to ensure that API operations actually modify or retrieve the expected records.

Testing documentation is maintained under:

```text
testing/
```

---

# 19. Real Problems Encountered

One of the most important goals of this repository is to document the actual problems encountered during development.

This is not intended to be a project where only the final successful commands are shown.

The troubleshooting documentation will preserve real errors such as:

### Lambda package error

```text
Cannot find package 'pg' imported from /var/task/index.mjs
```

Cause:

The `pg` dependency was not included correctly in the Lambda deployment package.

Resolution:

Install the dependency and ensure `node_modules` is included in the deployment ZIP.

---

### Database DNS error

```text
getaddrinfo ENOTFOUND create-user
```

Cause:

The database host environment variable was incorrectly configured.

Resolution:

Use the correct Amazon RDS endpoint.

---

### Lambda timeout

```text
Task timed out after 10.00 seconds
```

Cause:

The Lambda could not establish the required database connection.

Resolution:

Investigate networking and security-group configuration.

---

### API Gateway authorization error

```text
{"message":"Unauthorized"}
```

Cause:

API Gateway configuration/deployment did not match the expected authorization state.

Resolution:

Verify method authorization and redeploy the API.

---

### User not found

```text
{"message":"User not found"}
```

Cause:

The requested `user_id` did not exist in the database.

Resolution:

Create or identify a valid user ID before testing the GET endpoint.

---

### Tenant deletion conflict

```text
Cannot delete tenant because users are associated with it
```

This is an intentional application-level protection rather than an infrastructure failure.

The application prevents deletion of a tenant while users are still associated with it.

---

# 20. Current Project Status

## Completed

The following components have been successfully implemented and tested:

```text
Tenant creation             ✅
Tenant retrieval            ✅
Tenant deletion protection  ✅

User creation               ✅
User retrieval              ✅
User update                 ✅
User deletion               ✅

PostgreSQL/RDS integration  ✅
Lambda → PostgreSQL         ✅
API Gateway integration     ✅
API testing                 ✅

CloudWatch monitoring       ✅
IAM configuration           ✅
Security groups             ✅
Docker/CI/CD learning       ✅
```

## In Progress

The remaining work will include completing and refining:

```text
Cognito authentication
API authorization
Complete API resource design
Production-grade security
Full CI/CD workflow
Infrastructure automation
Comprehensive testing
Architecture documentation
Repository cleanup
Final deployment workflow
```

The status will be updated as the project progresses.

---

# 21. Project Repository Structure

The repository is organized by responsibility rather than by development day.

```text
multi-tenant-saas-aws/
│
├── README.md
│
├── architecture/
├── database/
├── lambdas/
│   ├── create-tenant/
│   ├── get-tenant/
│   ├── delete-tenant/
│   ├── create-user/
│   ├── get-user/
│   ├── update-user/
│   └── delete-user/
│
├── api-gateway/
├── security/
├── cognito/
├── cloudwatch/
├── eventbridge/
├── cicd/
├── docker/
├── testing/
├── troubleshooting/
├── screenshots/
└── scripts/
```

Each major component will contain its own documentation.

---

# 22. Learning Path for Beginners

A learner should not need previous knowledge of the entire AWS ecosystem to understand this project.

The recommended learning order is:

```text
1. AWS fundamentals
       |
       v
2. IAM
       |
       v
3. VPC and Security Groups
       |
       v
4. PostgreSQL / RDS
       |
       v
5. Lambda
       |
       v
6. Node.js + pg
       |
       v
7. API Gateway
       |
       v
8. Cognito
       |
       v
9. CloudWatch
       |
       v
10. EventBridge
       |
       v
11. Docker
       |
       v
12. CI/CD
       |
       v
13. Production architecture
```

The learner should understand each layer before moving to the next.

---

# 23. Why This Project Matters

This project demonstrates more than the ability to create an AWS Lambda function.

It demonstrates the ability to think about an application as a complete system.

The project combines:

```text
Application Development
        +
Database Design
        +
Cloud Architecture
        +
Networking
        +
Security
        +
Authentication
        +
Monitoring
        +
Automation
        +
CI/CD
```

This makes the repository useful as both a learning resource and a practical cloud engineering portfolio project.

---

# 24. Production Considerations

The current implementation is primarily designed for learning and portfolio development.

Before production use, additional engineering work would be required.

Potential improvements include:

* AWS Secrets Manager
* Private RDS deployment
* Lambda inside the appropriate VPC configuration
* NAT/VPC endpoints where required
* Strict security-group rules
* Least-privilege IAM policies
* Cognito authorization
* API throttling
* WAF
* Structured logging
* Distributed tracing
* Automated testing
* Infrastructure as Code
* Terraform or AWS CDK
* Automated CI/CD
* Database migrations
* Connection pooling strategy
* Retry and failure handling
* Dead-letter queues
* Backup and disaster recovery
* Multi-AZ architecture
* Custom domain
* HTTPS enforcement
* Cost monitoring

These improvements will be considered as the project evolves.

---

# 25. Documentation Philosophy

This repository intentionally documents both **successes and failures**.

A real engineer does not learn only from successful commands.

Therefore, the repository will document:

```text
What we attempted
        |
        v
What happened
        |
        v
The error
        |
        v
Why it happened
        |
        v
How we diagnosed it
        |
        v
How we fixed it
        |
        v
What we learned
```

This makes the repository more useful to future learners.

---

# 26. Project Roadmap

The project will continue through the following major phases:

### Phase 1 — Foundation

* AWS account preparation
* IAM
* VPC
* RDS
* PostgreSQL schema

### Phase 2 — Backend

* Lambda
* Node.js
* PostgreSQL integration
* Tenant CRUD
* User CRUD

### Phase 3 — API

* API Gateway
* REST resources
* Path parameters
* Request handling
* API testing

### Phase 4 — Authentication

* Cognito
* User authentication
* Identity mapping
* Authorization

### Phase 5 — Observability

* CloudWatch Logs
* CloudWatch Metrics
* CloudWatch Alarms
* EventBridge

### Phase 6 — Containers

* Docker
* Docker image creation
* Docker Hub
* Container deployment

### Phase 7 — CI/CD

* GitHub
* CodeBuild
* CodePipeline
* CodeDeploy
* IAM service roles
* Automated deployment

### Phase 8 — Production Hardening

* Security improvements
* Secrets management
* Infrastructure as Code
* Testing automation
* Monitoring
* Cost optimization
* Disaster recovery

---

# 27. Final Objective

The final objective is to produce a complete, understandable, and reproducible AWS SaaS project.

A new learner should be able to clone the repository, read the documentation, understand the architecture, follow the setup instructions, deploy the components, test the APIs, and understand the reasoning behind the design.

At the same time, an experienced engineer or potential employer should be able to inspect the repository and see evidence of practical experience with:

```text
AWS
Lambda
API Gateway
RDS
PostgreSQL
Cognito
IAM
VPC
Security Groups
CloudWatch
EventBridge
Docker
CodeBuild
CodePipeline
CodeDeploy
CI/CD
REST APIs
Database Design
Troubleshooting
Cloud Architecture
```

The project is intentionally being built as a **living learning project**.

The documentation will evolve alongside the infrastructure, and completed work will remain documented rather than being replaced by later stages.

---

## Project Status

**Status: In Progress 🚧**

The core tenant and user backend functionality is working.

The next stages are focused on completing the API architecture, authentication, security, monitoring, automation, CI/CD, documentation, and production hardening.

---

## Author

Built as a practical AWS cloud engineering and learning project.

The purpose is to learn by building, troubleshooting, documenting, and improving a real-world cloud architecture.
