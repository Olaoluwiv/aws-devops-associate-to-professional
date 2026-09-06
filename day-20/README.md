# Serverless Image Resizer

## Project Overview

This project demonstrates how to build an event-driven serverless image processing application using AWS.

When an image is uploaded to an Amazon S3 source bucket, Amazon S3 automatically triggers an AWS Lambda function. The Lambda function processes the image using the Jimp library, resizes it to 200 × 200 pixels, and stores the processed image in a separate Amazon S3 destination bucket.

The Lambda function is packaged and deployed as a Docker container image using Amazon Elastic Container Registry (Amazon ECR).

---

# Architecture

```text
                Upload Image
                     │
                     ▼
┌─────────────────────────────────────────┐
│          Amazon S3 Source Bucket        │
│                                         │
│ olaoluwiv-image-resizer-source-2026     │
└────────────────────┬────────────────────┘
                     │
                     │ S3 ObjectCreated Event
                     ▼
┌─────────────────────────────────────────┐
│               AWS Lambda                │
│                                         │
│       serverless-image-resizer-12       │
│                                         │
│  • Retrieves uploaded image             │
│  • Processes image with Jimp            │
│  • Resizes image to 200 × 200           │
└────────────────────┬────────────────────┘
                     │
                     │ PutObject
                     ▼
┌─────────────────────────────────────────┐
│       Amazon S3 Destination Bucket      │
│                                         │
│ olaoluwiv-image-resizer-destination-2026│
└─────────────────────────────────────────┘
```

---

# Technologies Used

| Technology             | Purpose                                 |
| ---------------------- | --------------------------------------- |
| Amazon S3              | Stores source and resized images        |
| AWS Lambda             | Processes uploaded images               |
| Amazon ECR             | Stores the Lambda container image       |
| AWS IAM                | Manages permissions for Lambda          |
| Amazon CloudWatch      | Stores Lambda logs and monitoring data  |
| Docker                 | Packages the application as a container |
| Node.js                | Application runtime                     |
| Jimp                   | Image processing and resizing           |
| AWS SDK for JavaScript | Communicates with Amazon S3             |

---

# Project Workflow

The application follows this workflow:

1. A user uploads an image to the source S3 bucket.
2. Amazon S3 detects the `ObjectCreated` event.
3. Amazon S3 automatically invokes the Lambda function.
4. Lambda downloads the uploaded image.
5. Jimp processes the image.
6. The image is resized to 200 × 200 pixels.
7. Lambda uploads the resized image to the destination S3 bucket.

```text
User
 │
 │ Upload Image
 ▼
Amazon S3
 │
 │ ObjectCreated Event
 ▼
AWS Lambda
 │
 │ Resize Image
 ▼
Amazon S3 Destination Bucket
```

---

# Project Structure

```text
serverless-image-resizer/
│
├── index.mjs
├── package.json
├── Dockerfile
└── README.md
```

---

# Prerequisites

Before starting this project, install the following:

* AWS Account
* AWS CLI
* Docker Desktop
* Node.js
* npm

Verify the installations:

```powershell
aws --version
docker --version
node --version
npm --version
```

---

# Step 1: Create the Project Directory

Create a project directory:

```powershell
mkdir serverless-image-resizer
cd serverless-image-resizer
```

---

# Step 2: Initialize the Node.js Project

Initialize the project:

```powershell
npm init -y
```

Install the required dependencies:

```powershell
npm install jimp @aws-sdk/client-s3
```

---

# Step 3: Create the Lambda Application

Create a file named:

```text
index.mjs
```

Add the following code:

```javascript
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand
} from "@aws-sdk/client-s3";

import { Jimp } from "jimp";

const s3 = new S3Client({});

const DEST_BUCKET = process.env.DEST_BUCKET;

export const handler = async (event) => {
  try {
    const record = event.Records[0];

    const sourceBucket = record.s3.bucket.name;

    const objectKey = decodeURIComponent(
      record.s3.object.key.replace(/\+/g, " ")
    );

    console.log(`Processing ${objectKey} from ${sourceBucket}`);

    // Retrieve image from S3
    const getObjectResponse = await s3.send(
      new GetObjectCommand({
        Bucket: sourceBucket,
        Key: objectKey
      })
    );

    const imageBuffer = Buffer.from(
      await getObjectResponse.Body.transformToByteArray()
    );

    // Read image using Jimp
    const image = await Jimp.read(imageBuffer);

    // Resize image
    image.resize({
      w: 200,
      h: 200
    });

    // Convert image to JPEG
    const resizedBuffer = await image.getBuffer("image/jpeg");

    // Upload resized image
    await s3.send(
      new PutObjectCommand({
        Bucket: DEST_BUCKET,
        Key: objectKey,
        Body: resizedBuffer,
        ContentType: "image/jpeg"
      })
    );

    console.log(
      `Successfully resized ${objectKey} and uploaded it to ${DEST_BUCKET}`
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Image resized successfully",
        sourceBucket,
        destinationBucket: DEST_BUCKET,
        objectKey
      })
    };

  } catch (error) {
    console.error("Image resizing failed:", error);
    throw error;
  }
};
```

---

# Understanding the Lambda Function

The Lambda function performs four major tasks.

## 1. Reads the S3 Event

When a file is uploaded to S3, the event contains information about:

* Source bucket
* Uploaded file name
* Object key

The code retrieves this information:

```javascript
const record = event.Records[0];

const sourceBucket = record.s3.bucket.name;

const objectKey = decodeURIComponent(
  record.s3.object.key.replace(/\+/g, " ")
);
```

---

## 2. Downloads the Image

The Lambda function retrieves the image from the source bucket:

```javascript
const getObjectResponse = await s3.send(
  new GetObjectCommand({
    Bucket: sourceBucket,
    Key: objectKey
  })
);
```

---

## 3. Resizes the Image

Jimp reads and resizes the image:

```javascript
const image = await Jimp.read(imageBuffer);

image.resize({
  w: 200,
  h: 200
});
```

---

## 4. Uploads the Processed Image

The resized image is uploaded to the destination bucket:

```javascript
await s3.send(
  new PutObjectCommand({
    Bucket: DEST_BUCKET,
    Key: objectKey,
    Body: resizedBuffer,
    ContentType: "image/jpeg"
  })
);
```

---

# Step 4: Create the Dockerfile

Create a file named:

```text
Dockerfile
```

Add:

```dockerfile
FROM public.ecr.aws/lambda/nodejs:24

COPY package.json ${LAMBDA_TASK_ROOT}/

RUN npm install --no-audit --no-fund && rm -rf node_modules/.bin

COPY index.mjs ${LAMBDA_TASK_ROOT}/

CMD [ "index.handler" ]
```

---

# Understanding the Dockerfile

## Lambda Base Image

```dockerfile
FROM public.ecr.aws/lambda/nodejs:24
```

This uses the official AWS Lambda Node.js 24 container base image.

---

## Copy Package Configuration

```dockerfile
COPY package.json ${LAMBDA_TASK_ROOT}/
```

Copies the Node.js dependency configuration into the Lambda task directory.

---

## Install Dependencies

```dockerfile
RUN npm install --no-audit --no-fund && rm -rf node_modules/.bin
```

Installs:

* Jimp
* AWS SDK S3 client

---

## Copy Lambda Code

```dockerfile
COPY index.mjs ${LAMBDA_TASK_ROOT}/
```

Copies the Lambda function code into the container.

---

## Define the Lambda Handler

```dockerfile
CMD [ "index.handler" ]
```

This tells Lambda to execute:

```text
index.mjs → handler
```

---

# Step 5: Build the Docker Image

Build the Lambda-compatible container image:

```powershell
docker build --platform linux/amd64 --provenance=false -t serverless-image-resizer:lambda .
```

Verify the image:

```powershell
docker images serverless-image-resizer
```

---

# Why Linux AMD64?

AWS Lambda container images require supported Linux container architectures.

The image was built specifically using:

```text
linux/amd64
```

The `--provenance=false` option was also used to avoid container image manifest compatibility issues when deploying to AWS Lambda.

---

# Step 6: Create an Amazon ECR Repository

Create a private repository in Amazon ECR.

Example repository:

```text
serverless-image-resizer-12
```

The repository URI:

```text
027174261562.dkr.ecr.us-east-1.amazonaws.com/serverless-image-resizer-12
```

> Note: Your AWS account ID and repository URI will be different.

---

# Step 7: Authenticate Docker with Amazon ECR

Authenticate Docker:

```powershell
aws ecr get-login-password --region us-east-1 `
| docker login --username AWS --password-stdin 027174261562.dkr.ecr.us-east-1.amazonaws.com
```

---

# Step 8: Tag the Docker Image

Tag the image:

```powershell
docker tag serverless-image-resizer:lambda `
027174261562.dkr.ecr.us-east-1.amazonaws.com/serverless-image-resizer-12:lambda-compatible
```

---

# Step 9: Push the Image to Amazon ECR

Push the container image:

```powershell
docker push 027174261562.dkr.ecr.us-east-1.amazonaws.com/serverless-image-resizer-12:lambda-compatible
```

The workflow is:

```text
Local Docker Image
       │
       ▼
Docker Tag
       │
       ▼
Amazon ECR Repository
       │
       ▼
AWS Lambda
```

---

# Step 10: Create the Lambda Function

In the AWS Lambda Console:

1. Click **Create Function**.
2. Select **Container image**.
3. Enter a function name:

```text
serverless-image-resizer-12
```

4. Select the container image from Amazon ECR.
5. Create the function.

---

# Step 11: Configure Environment Variables

Go to:

```text
Lambda
→ Configuration
→ Environment Variables
```

Add:

| Key         | Value                                    |
| ----------- | ---------------------------------------- |
| DEST_BUCKET | olaoluwiv-image-resizer-destination-2026 |

This allows the Lambda function to dynamically identify the destination bucket.

---

# Step 12: Create the S3 Buckets

Create two S3 buckets.

## Source Bucket

```text
olaoluwiv-image-resizer-source-2026
```

This bucket receives the original uploaded images.

## Destination Bucket

```text
olaoluwiv-image-resizer-destination-2026
```

This bucket stores the resized images.

---

# Step 13: Configure Lambda IAM Permissions

The Lambda execution role requires permission to:

* Read images from the source bucket.
* Write resized images to the destination bucket.
* Write logs to CloudWatch.

Example S3 IAM policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadSourceBucket",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::olaoluwiv-image-resizer-source-2026/*"
    },
    {
      "Sid": "WriteDestinationBucket",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::olaoluwiv-image-resizer-destination-2026/*"
    }
  ]
}
```

---

# Step 14: Configure the S3 Trigger

Go to:

```text
Lambda
→ serverless-image-resizer-12
→ Add Trigger
```

Configure:

| Setting    | Value                                    |
| ---------- | ---------------------------------------- |
| Trigger    | S3                                       |
| Bucket     | olaoluwiv-image-resizer-source-2026      |
| Event Type | ObjectCreated (All object create events) |

The trigger event:

```text
s3:ObjectCreated:*
```

Now, every new object uploaded to the source bucket automatically invokes Lambda.

---

# Testing the Application

## Automatic Test

1. Upload an image to:

```text
olaoluwiv-image-resizer-source-2026
```

2. Amazon S3 automatically triggers Lambda.

3. Lambda processes the image.

4. Check:

```text
olaoluwiv-image-resizer-destination-2026
```

The resized image should appear automatically.

---

# Manual Lambda Test

A manual S3 event can also be used to test the Lambda function.

Example test event:

```json
{
  "Records": [
    {
      "s3": {
        "bucket": {
          "name": "olaoluwiv-image-resizer-source-2026"
        },
        "object": {
          "key": "example-image.png"
        }
      }
    }
  ]
}
```

This allows testing of:

* Lambda container
* S3 permissions
* Image processing
* Destination bucket permissions

---

# Verifying the Resized Image

To verify the application:

1. Download the original image from the source bucket.
2. Download the processed image from the destination bucket.
3. Right-click each image on Windows.
4. Select:

```text
Properties → Details
```

The destination image should have dimensions:

```text
200 × 200 pixels
```

---

# Challenges and Troubleshooting

## 1. AWS CLI Not Recognized

After installing the AWS CLI, PowerShell initially returned:

```text
aws : The term 'aws' is not recognized
```

### Solution

Restart PowerShell after installation so the updated PATH environment variable is loaded.

Verify:

```powershell
aws --version
```

---

# 2. AWS CLI Credentials Not Found

Error:

```text
Unable to locate credentials
```

### Solution

Configure AWS authentication:

```powershell
aws login
```

Verify the authenticated account:

```powershell
aws sts get-caller-identity
```

---

# 3. Lambda Container Image Manifest Not Supported

AWS Lambda returned:

```text
The image manifest, config or layer media type is not supported.
```

### Cause

The original Docker image was pushed with an image index or manifest format that Lambda did not accept.

### Solution

Rebuild the image specifically for Lambda:

```powershell
docker build --platform linux/amd64 --provenance=false -t serverless-image-resizer:lambda .
```

Then tag and push the rebuilt image to Amazon ECR.

---

# 4. Jimp Dependencies and Windows File Path Issues

While attempting to manually copy container dependencies to Windows, long file paths and package files caused deletion and copy problems.

### Solution

Instead of manually packaging `node_modules`, dependencies were installed directly inside the Docker image.

This simplified the deployment process:

```dockerfile
RUN npm install --no-audit --no-fund
```

---

# 5. Destination Bucket Was Initially Empty

After uploading the first test image, the destination bucket remained empty.

### Troubleshooting Steps

The Lambda function was tested manually using an S3 event.

The manual test confirmed:

* Lambda was working.
* Jimp was working.
* The Lambda role had correct S3 permissions.
* The destination bucket configuration was correct.

A second automatic S3 upload successfully triggered Lambda and processed the image.

---

# Final Project Result

The project successfully implements an event-driven serverless image processing workflow.

```text
Image Upload
     │
     ▼
Amazon S3 Source Bucket
     │
     ▼
S3 Event Notification
     │
     ▼
AWS Lambda
     │
     ▼
Jimp Image Processing
     │
     ▼
Amazon S3 Destination Bucket
```

The system automatically resizes uploaded images to:

```text
200 × 200 pixels
```

and stores them in the destination bucket.

---

# Key Skills Demonstrated

This project demonstrates practical experience with:

* Serverless Architecture
* Event-Driven Systems
* AWS Lambda Container Images
* Amazon S3 Event Notifications
* Amazon ECR
* Docker
* IAM Permissions
* Node.js
* Image Processing
* AWS SDK for JavaScript
* CloudWatch Monitoring
* Troubleshooting Cloud Deployments

---

# Lessons Learned

This project reinforced that cloud engineering involves more than simply deploying an application.

Important lessons included:

* Understanding how AWS services communicate.
* Configuring IAM permissions correctly.
* Troubleshooting container compatibility.
* Working with Docker image architectures.
* Using event-driven architecture.
* Debugging S3 and Lambda integrations.
* Testing individual components before testing the complete workflow.

---

# Future Improvements

Possible improvements for this project include:

* Supporting multiple image sizes.
* Preserving image aspect ratios.
* Adding image compression.
* Supporting WebP image output.
* Adding SQS for asynchronous processing.
* Adding DynamoDB to track processed images.
* Adding API Gateway for image processing requests.
* Implementing CI/CD using AWS CodePipeline and CodeBuild.
* Adding infrastructure as code using AWS CloudFormation or Terraform.

---

# Author

**Olaoluwa Ayidina**

AWS and DevOps Engineer | Cloud Enthusiast

---

# Project Status

✅ Completed

The Serverless Image Resizer successfully processes images using an event-driven AWS serverless architecture.
