# AWS Highly Available Web Application Architecture

## Overview

This project demonstrates how to design and deploy a **highly available, secure, and scalable web application** on AWS using a multi-tier architecture.

The infrastructure is built across **two Availability Zones (AZs)** to improve fault tolerance and application availability. It includes public and private subnets, a Bastion Host for secure administration, an Auto Scaling Group for dynamic scaling, and an Application Load Balancer (ALB) to distribute incoming traffic.

---

## Architecture

The solution consists of:

- Amazon VPC
- Internet Gateway
- Two Availability Zones
- Two Public Subnets
- Two Private Subnets
- NAT Gateway (One per AZ)
- Bastion Host
- Amazon EC2 Launch Template
- Auto Scaling Group
- Target Group
- Application Load Balancer (ALB)

---

# Architecture Diagram

```text
                              Internet
                                  │
                           Internet Gateway
                                  │
               ┌─────────────────────────────────┐
               │              VPC                │
               └─────────────────────────────────┘
                     │                      │
              Public Subnet           Public Subnet
                 (AZ-1)                  (AZ-2)
                     │                      │
              Bastion Host        Application Load Balancer
                     │                      │
                SSH Access          Target Group
                     │                │
          ┌──────────┴────────────────┴──────────┐
          │                                      │
     Private Subnet                        Private Subnet
         (AZ-1)                                (AZ-2)
            │                                      │
      EC2 Instance                           EC2 Instance
            └──────────────┬───────────────────────┘
                           │
                  Auto Scaling Group
```

---

# Prerequisites

Before starting, ensure you have:

- An AWS Account
- IAM permissions to create networking and compute resources
- AWS Management Console access
- A key pair for SSH access
- A simple web application (HTML or Python)

---

# Step 1: Create the VPC

Navigate to the **Amazon VPC Console**.

Choose:

**Create VPC → VPC and more**

Configure the following:

| Setting | Value |
|---------|-------|
| Availability Zones | 2 |
| Public Subnets | 2 |
| Private Subnets | 2 |
| NAT Gateway | 1 per AZ |
| Internet Gateway | Enabled |
| IPv4 CIDR | Default or Custom |

AWS automatically creates:

- VPC
- Internet Gateway
- Route Tables
- Public Subnets
- Private Subnets
- NAT Gateways
- Network ACLs

---

# Step 2: Create the Bastion Host

Launch an EC2 instance in one of the **public subnets**.

The Bastion Host serves as a secure entry point for administrators to access EC2 instances located in the private subnets.

### Bastion Host Responsibilities

- Accept SSH connections from trusted IP addresses
- Securely access private EC2 instances
- Prevent direct SSH access to private instances from the internet

Traffic Flow:

```text
Administrator
      │
      ▼
Bastion Host (Public IP)
      │
Private IP
      │
Private EC2 Instance
```

---

# Step 3: Create a Launch Template

Create an EC2 Launch Template containing:

- Amazon Machine Image (AMI)
- Instance Type
- Key Pair
- Security Group
- IAM Role
- Storage Configuration
- User Data Script (Optional)

This template defines how Auto Scaling launches new EC2 instances.

---

# Step 4: Create the Auto Scaling Group

Create an Auto Scaling Group using the Launch Template.

Configure:

| Setting | Example |
|---------|---------|
| Minimum Capacity | 2 |
| Desired Capacity | 2 |
| Maximum Capacity | 4 |
| Availability Zones | 2 |
| Subnets | Private Subnets |

Benefits:

- Automatic scaling
- High availability
- Automatic recovery from instance failure
- Multi-AZ deployment

---

# Step 5: Test the Private EC2 Instances

Before exposing the application to the internet, verify that the private EC2 instances are functioning correctly.

## Connect to the Bastion Host

```bash
ssh -i mykey.pem ec2-user(or ubuntu)@<Bastion-Public-IP>
```

## Connect to a Private EC2 Instance

```bash
ssh -i mykey.pem ec2-user@<Private-IP>
```

---

## Create a Simple Web Page

```html
<h1>Hello from my Private EC2 Instance!</h1>
```

Save it as:

```
index.html
```

---

## Start a Simple Python Web Server

```bash
python3 -m http.server 80
```

Verify the application is running by testing it from within the VPC (for example, using the Bastion Host).

> **Note:** Private EC2 instances cannot be accessed directly from the internet because they do not have public IP addresses.

---

# Step 6: Create a Target Group

Create a Target Group for the Application Load Balancer.

The Target Group:

- Registers EC2 instances
- Performs health checks
- Routes traffic only to healthy instances

Health checks help ensure that only available instances receive requests.

---

# Step 7: Create the Application Load Balancer (ALB)

Create an Application Load Balancer in the **public subnets**.

Configure:

- Internet-facing
- HTTP (Port 80) or HTTPS (Port 443)
- Two Availability Zones
- Attach the Target Group

The ALB distributes incoming traffic across healthy EC2 instances.

Traffic Flow:

```text
Internet
      │
Application Load Balancer
      │
Target Group
      │
Auto Scaling Group
      │
Private EC2 Instances
```

---

# AWS Services Used

- Amazon VPC
- Amazon EC2
- Amazon EC2 Auto Scaling
- Application Load Balancer (ALB)
- Target Group
- Launch Template
- NAT Gateway
- Internet Gateway
- Route Tables
- Security Groups
- Bastion Host
- Amazon VPC Endpoint (Optional)

---

# Project Workflow

1. Create the VPC.
2. Create public and private subnets across two Availability Zones.
3. Configure Internet Gateway and NAT Gateways.
4. Launch a Bastion Host in a public subnet.
5. Create a Launch Template.
6. Create an Auto Scaling Group in the private subnets.
7. Connect to the private EC2 instances through the Bastion Host.
8. Deploy and test a simple Python web application.
9. Create a Target Group.
10. Create an Application Load Balancer.
11. Verify that the ALB distributes traffic only to healthy EC2 instances.

---

# Key Benefits

- High Availability
- Fault Tolerance
- Multi-AZ Deployment
- Automatic Scaling
- Secure Private Network
- Controlled Administrative Access
- Load-Balanced Traffic
- Health Monitoring
- Improved Application Resilience

---

# Future Enhancements

- Configure HTTPS using AWS Certificate Manager (ACM)
- Implement Amazon CloudWatch for monitoring and alarms
- Enable AWS WAF for enhanced security
- Automate infrastructure deployment using Terraform or AWS CloudFormation
- Integrate a CI/CD pipeline using AWS CodePipeline or GitHub Actions

---

# Architecture Diagram

<img width="611" height="481" alt="image" src="https://github.com/user-attachments/assets/3e53e631-875a-44bf-a81f-26b856139f9a" />


# Conclusion

This project demonstrates AWS best practices for deploying a secure, highly available, and scalable web application. By combining Amazon VPC, Bastion Host, Auto Scaling, Target Groups, and an Application Load Balancer, the architecture ensures reliable application delivery while maintaining security and fault tolerance.
