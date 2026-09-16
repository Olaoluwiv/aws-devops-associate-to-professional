# Day 26 — GitHub Actions + Amazon ECS Deployment

## 🚀 Project Overview

This project demonstrates how to deploy a containerized Python application to **Amazon ECS using AWS Fargate** and automate the deployment process with **GitHub Actions**.

The project brings together several AWS and DevOps technologies:

* Docker
* Amazon ECR
* Amazon ECS
* AWS Fargate
* AWS IAM
* AWS STS
* GitHub Actions
* GitHub OIDC

The completed deployment workflow is:

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
AWS IAM / STS
    │
    ▼
Docker Build
    │
    ▼
Amazon ECR
    │
    │ Container Image
    ▼
ECS Task Definition
    │
    ▼
ECS Service
    │
    ▼
AWS Fargate
    │
    ▼
Running Application
```

The purpose of this project was not simply to deploy an application, but to understand how source control, CI/CD automation, containerization, AWS identity management, container registries, and container orchestration work together.

---

# 🎯 Project Objectives

The project objectives were to:

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
11. Authenticate GitHub Actions with AWS IAM.
12. Automatically build new Docker images.
13. Push new images to Amazon ECR.
14. Automatically update the ECS task definition.
15. Automatically deploy the updated application to ECS.

All core objectives have been completed.

---

# 🧠 What This Project Demonstrates

This project demonstrates practical knowledge of several important DevOps concepts.

## Containerization

The Python application is packaged into a Docker container so that the application and its dependencies can be deployed consistently.

## Container Registry

Amazon ECR provides a managed registry for storing the Docker images used by ECS.

## Container Orchestration

Amazon ECS manages the deployment and lifecycle of the application container.

## Serverless Containers

AWS Fargate runs the ECS workload without requiring the management of EC2 servers for the container infrastructure.

## CI/CD

GitHub Actions automates the process of building, pushing, and deploying new versions of the application.

## Secure AWS Authentication

GitHub OIDC allows GitHub Actions to obtain temporary AWS credentials through an IAM role instead of storing permanent AWS access keys in GitHub.

## Deployment Automation

A code push to the `master` branch can trigger the complete deployment workflow automatically.

---

# 🏗️ Architecture

The completed architecture is:

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
                    │  Checkout            │
                    │  Docker Build        │
                    │  ECR Push            │
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
                               ▼
                    ┌──────────────────────┐
                    │     Amazon ECR       │
                    │                      │
                    │   Docker Image       │
                    └──────────┬───────────┘
                               │
                               │ New Image
                               ▼
                    ┌──────────────────────┐
                    │     Amazon ECS       │
                    │                      │
                    │ Task Definition      │
                    │        ↓             │
                    │ ECS Service          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     AWS Fargate      │
                    │                      │
                    │ Running Container    │
                    └──────────────────────┘
```

---

# ☁️ AWS Services Used

| Service        | Purpose                                                  |
| -------------- | -------------------------------------------------------- |
| Amazon ECR     | Stores Docker container images                           |
| Amazon ECS     | Runs and manages containers                              |
| AWS Fargate    | Provides serverless container compute                    |
| AWS IAM        | Controls permissions and authentication                  |
| AWS STS        | Provides temporary credentials through role assumption   |
| GitHub OIDC    | Provides federated authentication between GitHub and AWS |
| GitHub Actions | Automates the CI/CD workflow                             |

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

The application listens on:

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

## Test the Container Locally

Run the container:

```powershell
docker run -d -p 5000:5000 github-actions-ecs-app:latest
```

Check running containers:

```powershell
docker ps
```

The application can be tested locally through:

```text
http://localhost:5000
```

Stop the container after testing:

```powershell
docker stop <container-id>
```

---

# 📦 Amazon ECR

Amazon Elastic Container Registry (ECR) stores the Docker image used by the ECS deployment.

Repository:

```text
github-actions-ecs-app
```

AWS Region:

```text
us-east-1
```

Repository URI:

```text
027174261562.dkr.ecr.us-east-1.amazonaws.com/github-actions-ecs-app
```

The repository is used by GitHub Actions during the automated deployment.

---

# 🔐 Authenticate Docker with ECR

For manual ECR authentication, the AWS CLI can be used:

```powershell
aws ecr get-login-password --region us-east-1 |
docker login --username AWS --password-stdin 027174261562.dkr.ecr.us-east-1.amazonaws.com
```

---

# 🏷️ Tag the Docker Image

Example:

```powershell
docker tag github-actions-ecs-app:latest `
027174261562.dkr.ecr.us-east-1.amazonaws.com/github-actions-ecs-app:latest
```

---

# ⬆️ Push the Image to ECR

Example:

```powershell
docker push `
027174261562.dkr.ecr.us-east-1.amazonaws.com/github-actions-ecs-app:latest
```

The automated GitHub Actions workflow uses the Git commit SHA instead of relying only on `latest`.

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

The task definition references an Amazon ECR image.

When GitHub Actions deploys a new image, the workflow creates a new task definition revision containing the new image.

---

# 🔄 ECS Deployment Process

The automated deployment process is:

```text
Docker Image
      │
      ▼
Amazon ECR
      │
      ▼
Current ECS Task Definition
      │
      ▼
Replace Container Image
      │
      ▼
New Task Definition Revision
      │
      ▼
ECS Service Update
      │
      ▼
New Running Task
```

ECS then replaces the previous task with the updated version according to the service deployment configuration.

---

# ⚙️ GitHub Actions

The GitHub Actions workflow is located at:

```text
.github/workflows/deploy.yml
```

The workflow is triggered when code is pushed to the `master` branch:

```yaml
on:
  push:
    branches:
      - master
```

The workflow performs the complete deployment automatically.

---

# 🔑 GitHub OIDC Authentication

A major security goal of this project was to avoid storing permanent AWS credentials inside GitHub.

GitHub Actions uses **OpenID Connect (OIDC)** to request an identity token.

The authentication flow is:

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

This means the workflow does not require permanent:

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

The role provides the permissions required for the CI/CD deployment.

The ECS-related permissions include:

```text
ecs:DescribeServices
ecs:DescribeTaskDefinition
ecs:RegisterTaskDefinition
ecs:UpdateService
```

The role also requires:

```text
iam:PassRole
```

for the ECS task execution role and permissions required to interact with Amazon ECR.

---

# 🛡️ IAM PassRole

The ECS task execution role used by the project is:

```text
task-manager-ecs-execution-role
```

The GitHub Actions deployment role must be allowed to pass this role when registering the ECS task definition.

This demonstrates an important AWS IAM concept:

> An identity may need explicit `iam:PassRole` permission when asking an AWS service to use another IAM role.

The permission is restricted to the specific ECS execution role rather than granting unrestricted role-passing permissions.

---

# 🔄 Complete CI/CD Workflow

The completed workflow is:

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
5. GitHub OIDC requests an identity token
             │
             ▼
6. AWS STS validates the token
             │
             ▼
7. GitHub Actions assumes the AWS IAM role
             │
             ▼
8. Docker image is built
             │
             ▼
9. Image is pushed to Amazon ECR
             │
             ▼
10. Current ECS task definition is retrieved
             │
             ▼
11. Container image is replaced with the
    new Git commit image
             │
             ▼
12. New ECS task definition revision is registered
             │
             ▼
13. ECS service is updated
             │
             ▼
14. ECS deploys the new task
             │
             ▼
15. Service waits for deployment stability
             │
             ▼
16. New application version is running
```

---

# 🏷️ Image Tagging

The GitHub Actions workflow uses the Git commit SHA as the Docker image tag.

For example:

```text
github-actions-ecs-app:<commit-sha>
```

During the successful deployment, the image was tagged using the commit associated with the deployment.

This approach provides traceability between:

```text
Git Commit
     ↓
Docker Image
     ↓
ECS Task Definition
     ↓
Running Application
```

Using commit-based image tags also avoids depending exclusively on the mutable `latest` tag.

---

# 📝 GitHub Actions Workflow Steps

The deployment workflow performs the following operations.

## 1. Checkout Source Code

```yaml
uses: actions/checkout@v4
```

Downloads the repository code into the GitHub Actions runner.

## 2. Debug GitHub OIDC Claims

The workflow includes an OIDC debugging step that can display claims such as:

```text
issuer
audience
subject
repository
ref
```

This was useful while configuring and validating the IAM trust relationship.

## 3. Configure AWS Credentials

```yaml
uses: aws-actions/configure-aws-credentials@v4
```

Uses GitHub OIDC to obtain temporary AWS credentials.

## 4. Login to Amazon ECR

```yaml
uses: aws-actions/amazon-ecr-login@v2
```

Authenticates Docker with Amazon ECR.

## 5. Build Docker Image

The workflow runs:

```text
docker build
```

against:

```text
./day-26/github-actions-ecs-deployment/app
```

## 6. Push Image to ECR

The workflow runs:

```text
docker push
```

and stores the image in:

```text
github-actions-ecs-app
```

## 7. Retrieve ECS Task Definition

The current task definition is downloaded so that the workflow can update its container image.

## 8. Render the New Task Definition

```yaml
uses: aws-actions/amazon-ecs-render-task-definition@v1
```

This updates the container image reference in the task definition.

## 9. Deploy to ECS

```yaml
uses: aws-actions/amazon-ecs-deploy-task-definition@v2
```

The new task definition is deployed to:

```text
task-manager-service
```

The workflow waits for the ECS service to reach a stable state.

---

# 🧪 Deployment Verification

After a successful GitHub Actions run, the ECS service can be checked through:

```text
Amazon ECS
    ↓
Clusters
    ↓
task-manager-cluster
    ↓
task-manager-service
```

Important items to verify include:

* Desired task count
* Running task count
* Task status
* Task definition revision
* Container status
* ECS service events
* Network configuration
* Application accessibility

The project successfully reached the stage where the GitHub Actions deployment completed with all deployment steps green.

---

# 🔍 Troubleshooting and Lessons From Real Errors

The project included several real troubleshooting situations. These were useful because they demonstrated that a CI/CD pipeline can fail at different layers.

---

## 1. GitHub Actions YAML Syntax Error

Initially, the workflow failed before executing because Markdown code fences had accidentally been included inside the YAML workflow.

The file contained Markdown formatting similar to:

````text
```yaml
````

and:

```text
```

````

Those code fences are appropriate when displaying YAML inside documentation, but they must **not** be placed inside the actual `.github/workflows/deploy.yml` file.

The workflow was corrected so that the first line was:

```yaml
name: Deploy to Amazon ECS
````

and the file contained only valid YAML.

### Lesson

A code block shown in documentation is not the same thing as the actual configuration file.

---

# 🌐 2. Temporary GitHub Network Connectivity Problem

While pushing the workflow changes, Git initially returned:

```text
Failed to connect to github.com:443
```

Connectivity testing showed:

```text
google.com:443 → True
github.com:443 → False
```

A later connectivity test showed:

```text
github.com:443 → True
```

The push then succeeded.

### Lesson

Before changing Git configuration, test network connectivity. A temporary connection failure does not necessarily indicate a repository or Git configuration problem.

---

# 📦 3. ECR Repository Not Found

After the GitHub Actions workflow successfully authenticated with AWS and built the Docker image, the ECR push initially failed with:

```text
The repository with name 'github-actions-ecs-app'
does not exist in the registry
```

The repository was verified using:

```powershell
aws ecr describe-repositories `
  --repository-names github-actions-ecs-app `
  --region us-east-1
```

The repository was then created:

```powershell
aws ecr create-repository `
  --repository-name github-actions-ecs-app `
  --region us-east-1
```

After the repository existed, the GitHub Actions workflow was rerun.

The Docker image successfully pushed to ECR.

### Lesson

AWS authentication can succeed while a deployment still fails because the target AWS resource does not exist.

This is an important distinction:

```text
Authentication successful
        ≠
Resource configuration complete
```

---

# 🐳 4. Docker Build Successfully Completed

The workflow successfully built the application image from:

```text
./day-26/github-actions-ecs-deployment/app
```

The image was tagged using the Git commit SHA.

This confirmed that the GitHub Actions runner could:

* Access the application source code.
* Read the Dockerfile.
* Install Python dependencies.
* Build the Docker image.
* Tag the image correctly.

---

# 🚢 5. ECS Deployment Successfully Completed

After the ECR repository was available, the workflow successfully completed:

```text
Download current ECS task definition
        ↓
Update ECS task definition
        ↓
Deploy updated task definition
        ↓
Wait for ECS service stability
```

All GitHub Actions deployment steps completed successfully.

This confirmed that the complete automated deployment path was functioning.

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
* Restrict `iam:PassRole` to the intended ECS execution role.

---

# 📊 Current Project Status

## Completed

* [x] Python application created
* [x] Dockerfile created
* [x] Application tested locally
* [x] Docker image built locally
* [x] Amazon ECR repository created
* [x] Docker image pushed to ECR
* [x] Amazon ECS cluster created
* [x] ECS task definition created
* [x] ECS service created
* [x] ECS application deployed and tested
* [x] GitHub Actions workflow created
* [x] GitHub OIDC provider configured
* [x] GitHub Actions IAM deployment role created
* [x] OIDC trust relationship configured
* [x] OIDC claims debugging added
* [x] GitHub Actions authenticated with AWS
* [x] Docker image built automatically
* [x] Docker image pushed automatically to ECR
* [x] ECS task definition updated automatically
* [x] ECS service updated automatically
* [x] ECS deployment completed successfully
* [x] ECS service reached deployment stability

## Current State

**Day 26 core CI/CD implementation is complete.**

A push to the configured `master` branch can trigger the automated workflow:

```text
Git Push
    ↓
GitHub Actions
    ↓
AWS OIDC
    ↓
IAM
    ↓
Docker Build
    ↓
Amazon ECR
    ↓
ECS Task Definition
    ↓
ECS Service
    ↓
Running Application
```

---

# 📚 What I Learned

This project reinforced that a production-style CI/CD pipeline is made up of multiple connected layers.

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

Each layer has a different responsibility.

### Git

Provides source control and triggers the deployment process.

### GitHub Actions

Provides the automation engine.

### OIDC

Provides a secure identity mechanism between GitHub and AWS.

### IAM

Controls what the GitHub Actions workflow is allowed to do.

### ECR

Stores the container image.

### ECS

Manages the application container.

### Fargate

Provides the compute environment for the container.

The troubleshooting process also reinforced an important DevOps principle:

> When an automated deployment fails, isolate the failure by layer instead of changing multiple components at once.

---

# 🚀 Future Improvements

Although the core Day 26 deployment is complete, the pipeline can be extended further.

Possible improvements include:

* Add automated application tests.
* Add Docker image vulnerability scanning.
* Add CloudWatch logging and monitoring.
* Add ECS health checks.
* Add deployment notifications.
* Add environment-specific deployments.
* Add staging and production environments.
* Implement ECS blue/green deployments.
* Add automated rollback strategies.
* Add infrastructure as code using Terraform or AWS CloudFormation.
* Add deployment approval gates.
* Add pull-request validation workflows.
* Add branch protection rules.
* Add automated cleanup of old ECR images.

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

# 🎓 Project Outcome

The original goal of this project was to move from manual container deployment toward automated CI/CD.

That goal has now been achieved.

A developer can make an application change and run:

```powershell
git add .
git commit -m "Update application"
git push origin master
```

The deployment process can then proceed automatically:

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

This project demonstrates the practical transition from:

```text
Manual Deployment
```

to:

```text
Automated CI/CD
```

using GitHub Actions, AWS OIDC, Amazon ECR, Amazon ECS, and AWS Fargate.

---

# 👩🏽‍💻 Author

**Olaoluwiv**

AWS DevOps learning project.

**Day 26 — GitHub Actions + Amazon ECS Deployment**

> Building practical AWS DevOps skills one project at a time.
