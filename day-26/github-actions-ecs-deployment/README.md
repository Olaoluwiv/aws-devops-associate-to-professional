# Day 26 — GitHub Actions + Amazon ECS Deployment

## 🚀 Project Overview

This project demonstrates how to deploy a containerized application to **Amazon ECS** and build toward a fully automated CI/CD pipeline using **GitHub Actions**.

The project combines several AWS and DevOps technologies:

* Docker
* Amazon ECR
* Amazon ECS
* AWS IAM
* GitHub Actions
* GitHub OIDC
* AWS Fargate

The long-term deployment workflow is:

```text
Developer
    │
    │ git push
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
    │
    │ OIDC authentication
    ▼
AWS IAM
    │
    ▼
Docker Build
    │
    ▼
Amazon ECR
    │
    │ Container Image
    ▼
Amazon ECS
    │
    ▼
ECS Task Definition
    │
    ▼
ECS Service
    │
    ▼
Running Application
```

The purpose of this project is not only to deploy an application, but to understand how these services work together to create a practical cloud-based CI/CD workflow.

---

# 🎯 Project Objectives

The main objectives of this project are to:

1. Containerize a Python application using Docker.
2. Build and test the Docker image locally.
3. Create an Amazon ECR repository.
4. Push the Docker image to Amazon ECR.
5. Create an Amazon ECS cluster.
6. Create an ECS task definition.
7. Create an ECS service.
8. Run the application on ECS using AWS Fargate.
9. Configure GitHub Actions for automated deployment.
10. Use GitHub OIDC instead of storing long-lived AWS access keys.
11. Automatically build and push new Docker images.
12. Automatically update the ECS task definition.
13. Automatically deploy the updated application to ECS.

---

# 🧠 What This Project Demonstrates

This project demonstrates practical knowledge of:

### Containerization

The application is packaged into a Docker container so that it can run consistently across environments.

### Container Registry

Amazon ECR stores the Docker images used by ECS.

### Container Orchestration

Amazon ECS manages the running container.

### Serverless Containers

AWS Fargate allows the container to run without managing EC2 servers directly.

### CI/CD

GitHub Actions is used to automate the process of building and deploying the application.

### Secure AWS Authentication

GitHub OIDC allows GitHub Actions to assume an AWS IAM role without storing permanent AWS access keys in GitHub.

### Infrastructure Integration

The project demonstrates how multiple AWS services can be connected into one deployment workflow.

---

# 🏗️ Architecture

The architecture for this project is:

```text
                    ┌──────────────────────┐
                    │      Developer       │
                    │                      │
                    │      git push        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       GitHub         │
                    │     Repository       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   GitHub Actions     │
                    │                      │
                    │  Docker Build        │
                    │  Docker Push         │
                    │  ECS Deployment      │
                    └──────────┬───────────┘
                               │
                        OIDC Authentication
                               │
                               ▼
                    ┌──────────────────────┐
                    │       AWS IAM        │
                    │ GitHub Actions Role  │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │   Amazon ECR    │        │   Amazon ECS    │
        │                 │        │                 │
        │ Docker Images   │───────▶│ Task Definition │
        └─────────────────┘        │                 │
                                   │ ECS Service     │
                                   │                 │
                                   └────────┬────────┘
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │ Running Docker  │
                                   │   Application   │
                                   └─────────────────┘
```

---

# ☁️ AWS Services Used

| Service        | Purpose                                     |
| -------------- | ------------------------------------------- |
| Amazon ECR     | Stores Docker container images              |
| Amazon ECS     | Runs and manages containers                 |
| AWS Fargate    | Provides serverless container compute       |
| AWS IAM        | Controls permissions and authentication     |
| AWS STS        | Allows GitHub Actions to assume an IAM role |
| GitHub OIDC    | Provides temporary AWS authentication       |
| GitHub Actions | Automates the CI/CD workflow                |

---

# 📁 Project Structure

```text
day-26/
└── github-actions-ecs-deployment/
    │
    ├── app/
    │   ├── app.py
    │   ├── requirements.txt
    │   └── Dockerfile
    │
    ├── .github/
    │   └── workflows/
    │       └── deploy.yml
    │
    └── README.md
```

---

# 🐍 Application

The application is a Python web application.

The main application file is:

```text
app/app.py
```

Dependencies are defined in:

```text
app/requirements.txt
```

The application is packaged using:

```text
app/Dockerfile
```

The application listens on port:

```text
5000
```

---

# 🐳 Docker

## Build the Docker Image

From the repository root:

```powershell
docker build -t github-actions-ecs-app:latest ./day-26/github-actions-ecs-deployment/app
```

Verify the image:

```powershell
docker images
```

---

# 🧪 Test the Container Locally

Run the container:

```powershell
docker run -d -p 5000:5000 github-actions-ecs-app:latest
```

Check running containers:

```powershell
docker ps
```

The application can then be tested locally through:

```text
http://localhost:5000
```

After testing, stop the container:

```powershell
docker stop <container-id>
```

---

# 📦 Amazon ECR

Amazon Elastic Container Registry (ECR) is used to store the Docker image.

The ECR repository used by this project is:

```text
github-actions-ecs-app
```

AWS Region:

```text
us-east-1
```

The repository URI is:

```text
027174261562.dkr.ecr.us-east-1.amazonaws.com/github-actions-ecs-app
```

---

# 🔐 Authenticate Docker with ECR

The AWS CLI can be used to authenticate Docker with ECR:

```powershell
aws ecr get-login-password --region us-east-1 |
docker login --username AWS --password-stdin 027174261562.dkr.ecr.us-east-1.amazonaws.com
```

---

# 🏷️ Tag the Docker Image

```powershell
docker tag github-actions-ecs-app:latest `
027174261562.dkr.ecr.us-east-1.amazonaws.com/github-actions-ecs-app:latest
```

---

# ⬆️ Push the Image to ECR

```powershell
docker push `
027174261562.dkr.ecr.us-east-1.amazonaws.com/github-actions-ecs-app:latest
```

The image can then be viewed from the Amazon ECR console.

---

# 🚢 Amazon ECS

The ECS resources used by this project are:

```text
Cluster:
task-manager-cluster

Service:
task-manager-service

Task Definition:
task-manager-task

Container:
task-manager-container
```

The ECS service runs the application using AWS Fargate.

---

# 📋 ECS Task Definition

The task definition describes how ECS should run the container.

Important configuration includes:

```text
CPU: 256
Memory: 512 MiB
Launch Type: Fargate
Network Mode: awsvpc
Container Port: 5000
```

The task definition uses an ECR image as the container image.

---

# 🔄 ECS Deployment Process

When the application is deployed manually, the process is:

```text
Docker Image
      │
      ▼
Amazon ECR
      │
      ▼
ECS Task Definition
      │
      ▼
New Task Definition Revision
      │
      ▼
ECS Service
      │
      ▼
Running Task
```

Each updated container image can be associated with a new ECS task definition revision.

---

# ⚙️ GitHub Actions

The GitHub Actions workflow is located at:

```text
.github/workflows/deploy.yml
```

The workflow is triggered when changes are pushed to the `master` branch.

```yaml
on:
  push:
    branches:
      - master
```

---

# 🔑 GitHub OIDC Authentication

One of the important security goals of this project is to avoid storing permanent AWS access keys inside GitHub.

Instead, GitHub Actions uses **OpenID Connect (OIDC)** to request a temporary identity token.

The flow is:

```text
GitHub Actions
      │
      │ OIDC Token
      ▼
GitHub OIDC Provider
      │
      ▼
AWS STS
      │
      │ AssumeRoleWithWebIdentity
      ▼
AWS IAM Role
      │
      ▼
Temporary AWS Credentials
```

This allows GitHub Actions to interact with AWS without requiring long-lived:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

to be stored as GitHub secrets.

---

# 👤 GitHub Actions IAM Role

The IAM role created for the deployment workflow is:

```text
github-actions-ecs-deployment-role
```

The role allows GitHub Actions to interact with the AWS resources required for deployment.

The role includes permissions for operations such as:

```text
ecs:DescribeServices
ecs:DescribeTaskDefinition
ecs:RegisterTaskDefinition
ecs:UpdateService
iam:PassRole
```

The deployment role also has permissions required to interact with Amazon ECR.

---

# 🛡️ IAM PassRole

The GitHub Actions role needs permission to pass the ECS task execution role when registering the task definition.

The ECS execution role used by the project is:

```text
task-manager-ecs-execution-role
```

The GitHub Actions role therefore requires:

```text
iam:PassRole
```

for that specific ECS execution role.

This is an important AWS security concept because IAM controls which identities are allowed to pass roles to AWS services.

---

# 🔄 CI/CD Workflow

The intended automated workflow is:

```text
1. Developer changes application
             │
             ▼
2. git add / git commit
             │
             ▼
3. git push origin master
             │
             ▼
4. GitHub Actions starts
             │
             ▼
5. GitHub OIDC authenticates with AWS
             │
             ▼
6. AWS IAM role is assumed
             │
             ▼
7. Docker image is built
             │
             ▼
8. Image is pushed to Amazon ECR
             │
             ▼
9. Current ECS task definition is retrieved
             │
             ▼
10. Container image is replaced with
    the new Git commit image
             │
             ▼
11. New ECS task definition revision
    is registered
             │
             ▼
12. ECS service is updated
             │
             ▼
13. ECS deploys the new task
             │
             ▼
14. Application becomes available
```

---

# 🏷️ Image Tagging

The GitHub Actions workflow uses the Git commit SHA as the Docker image tag.

Example:

```text
github-actions-ecs-app:<commit-sha>
```

This is useful because every deployed image can be traced back to a specific Git commit.

Instead of relying only on:

```text
latest
```

the deployment can identify exactly which version of the application is running.

---

# 📝 GitHub Actions Workflow

The deployment workflow performs these major operations:

### 1. Checkout

```yaml
uses: actions/checkout@v4
```

Downloads the repository code into the GitHub Actions runner.

### 2. Authenticate with AWS

```yaml
uses: aws-actions/configure-aws-credentials@v4
```

Uses GitHub OIDC to obtain temporary AWS credentials.

### 3. Login to ECR

```yaml
uses: aws-actions/amazon-ecr-login@v2
```

Authenticates Docker with Amazon ECR.

### 4. Build Docker Image

```text
docker build
```

Builds the application image.

### 5. Push Image to ECR

```text
docker push
```

Uploads the image to the ECR repository.

### 6. Render ECS Task Definition

```yaml
uses: aws-actions/amazon-ecs-render-task-definition@v1
```

Updates the container image in the ECS task definition.

### 7. Deploy to ECS

```yaml
uses: aws-actions/amazon-ecs-deploy-task-definition@v2
```

Registers the new task definition and updates the ECS service.

---

# 🧪 Testing the Deployment

After deployment, check the ECS service:

```text
Amazon ECS
    ↓
Clusters
    ↓
task-manager-cluster
    ↓
task-manager-service
```

Check:

* Desired tasks
* Running tasks
* Task health
* Task definition revision
* Container status
* Public IP / networking configuration

The application can then be accessed through the address assigned to the running ECS task when the network configuration allows public access.

---

# 🔍 Troubleshooting

## GitHub Actions Cannot Assume AWS Role

If GitHub Actions returns:

```text
Could not assume role with OIDC:
Not authorized to perform sts:AssumeRoleWithWebIdentity
```

check the following:

### OIDC provider

Confirm that the AWS account contains:

```text
token.actions.githubusercontent.com
```

with the expected audience:

```text
sts.amazonaws.com
```

### IAM trust policy

The IAM role trust relationship must allow:

```text
sts:AssumeRoleWithWebIdentity
```

from the GitHub OIDC provider.

The trust policy must also match the GitHub OIDC token claims.

The workflow includes a debugging step that can display claims such as:

```text
issuer
audience
subject
repository
ref
```

These values are useful when troubleshooting IAM trust relationships.

---

# 🐳 Docker Build Problems

If Docker cannot find the application directory, verify that the workflow is being executed from the repository root.

The application path is:

```text
./day-26/github-actions-ecs-deployment/app
```

Example:

```powershell
docker build -t github-actions-ecs-app:latest ./day-26/github-actions-ecs-deployment/app
```

---

# 📦 ECR Push Problems

If Docker cannot push to ECR, check:

* AWS authentication
* ECR repository name
* AWS region
* IAM permissions
* Docker ECR login

Verify the AWS account:

```powershell
aws sts get-caller-identity
```

---

# 🚢 ECS Deployment Problems

If ECS deployment fails, check:

```text
ECS Cluster
    ↓
ECS Service
    ↓
Task Definition
    ↓
Task
    ↓
Container
```

Also check:

* ECS task status
* ECS service events
* CloudWatch logs
* Security groups
* Subnets
* IAM task execution role
* Container port
* ECR image URI

---

# 🔐 Security Considerations

This project uses GitHub OIDC rather than storing permanent AWS credentials in GitHub.

Important security practices include:

* Do not commit AWS access keys.
* Do not commit AWS secret keys.
* Do not commit passwords.
* Do not commit `.env` files containing credentials.
* Use IAM roles instead of long-lived credentials whenever possible.
* Grant only the permissions required by the deployment workflow.
* Restrict the GitHub OIDC trust policy to the intended repository and branch where appropriate.
* Use unique image tags such as Git commit SHAs.
* Avoid giving GitHub Actions unnecessary administrative permissions.

---

# 📊 Current Project Status

## Completed

* [x] Python application created
* [x] Dockerfile created
* [x] Application tested locally
* [x] Docker image built
* [x] Amazon ECR repository created
* [x] Docker image pushed to ECR
* [x] Amazon ECS cluster created
* [x] ECS task definition created
* [x] ECS service created
* [x] ECS application deployed and tested
* [x] GitHub Actions workflow created
* [x] GitHub OIDC provider configured
* [x] GitHub Actions IAM deployment role created
* [x] GitHub OIDC debugging added to workflow

## In Progress

* [ ] Complete GitHub Actions OIDC role-assumption troubleshooting
* [ ] Successfully authenticate GitHub Actions with AWS
* [ ] Complete automated ECR deployment
* [ ] Verify automatic ECS deployment after `git push`

---

# 📚 What I Learned

This project helped demonstrate that a CI/CD pipeline is more than simply running a GitHub Actions workflow.

The deployment requires several layers to work together:

```text
Git
 ↓
GitHub
 ↓
GitHub Actions
 ↓
OIDC
 ↓
AWS STS
 ↓
IAM
 ↓
ECR
 ↓
ECS
 ↓
Fargate
 ↓
Application
```

A failure at any layer can prevent the deployment from completing.

The troubleshooting process is therefore an important part of the learning experience.

---

# 🚀 Future Improvements

After completing the automated deployment, possible improvements include:

* Add automated application tests.
* Add Docker image vulnerability scanning.
* Add CloudWatch logging and monitoring.
* Add ECS health checks.
* Add deployment notifications.
* Add environment-specific deployments.
* Add staging and production environments.
* Implement ECS blue/green deployment.
* Add rollback strategies.
* Add infrastructure as code using Terraform or AWS CloudFormation.
* Add deployment approval gates.

---

# 🧹 Useful Git Commands

Check repository status:

```powershell
git status
```

Add changes:

```powershell
git add .
```

Commit changes:

```powershell
git commit -m "Update GitHub Actions ECS deployment"
```

Push changes:

```powershell
git push origin master
```

Pull the latest changes:

```powershell
git pull --ff-only origin master
```

View recent commits:

```powershell
git log --oneline --max-count=10
```

---

# 🧰 Useful AWS Commands

Check AWS identity:

```powershell
aws sts get-caller-identity
```

List ECR repositories:

```powershell
aws ecr describe-repositories --region us-east-1
```

List ECS clusters:

```powershell
aws ecs list-clusters --region us-east-1
```

Describe the ECS service:

```powershell
aws ecs describe-services `
  --cluster task-manager-cluster `
  --services task-manager-service `
  --region us-east-1
```

Describe the task definition:

```powershell
aws ecs describe-task-definition `
  --task-definition task-manager-task `
  --region us-east-1
```

---

# 🎓 Project Goal

The final goal of this Day 26 project is to reach a point where a developer can make a code change and run:

```powershell
git add .
git commit -m "Update application"
git push origin master
```

and the rest of the deployment happens automatically:

```text
Git Push
   ↓
GitHub Actions
   ↓
OIDC Authentication
   ↓
AWS IAM
   ↓
Docker Build
   ↓
Amazon ECR
   ↓
ECS Task Definition
   ↓
ECS Service
   ↓
New Application Version
```

This represents the transition from **manual cloud deployment** toward an automated **CI/CD deployment workflow**.

---

# 👩🏽‍💻 Author

**Olaoluwiv**

AWS DevOps learning project.

**Day 26 — GitHub Actions + Amazon ECS Deployment**

> Building practical AWS DevOps skills one project at a time.
