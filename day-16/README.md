# AWS S3, CloudFront & Lambda@Edge

## 📌 Project Overview

This project demonstrates how to deploy a static website with **Amazon S3**, distribute it globally using **Amazon CloudFront**, and dynamically modify responses using **AWS Lambda@Edge**.

**Architecture:** `User → HTTPS → CloudFront → Lambda@Edge → OAC → S3`

**AWS Services:** `S3 | CloudFront | Lambda@Edge | IAM | ACM | Route 53`

---

## 🛠️ Prerequisites

**Requirements:** AWS Account | Basic AWS knowledge | Static website files | IAM permissions

**Website structure:**

```text
day-17-cloudfront/
├── index.html
├── css/style.css
└── image/image.png
```

---

# ☁️ Step 1 — Create S3 Bucket

1. Open **AWS Console → S3 → Create bucket**.
2. Create a unique bucket, e.g. `olaoluwiv`.
3. Select your preferred region, e.g. `us-east-1`.
4. Upload your website files.

Your bucket should contain:

```text
olaoluwiv/
├── index.html
├── css/
└── image/
```

⚠️ Keep `index.html` at the **root of the bucket**.

---

# 🌐 Step 2 — Create CloudFront Distribution

Go to **CloudFront → Create distribution**.

| Setting             | Configuration                   |
| ------------------- | ------------------------------- |
| Origin              | S3 bucket itself                |
| Origin Path         | **Empty**                       |
| Origin Access       | **Origin Access Control (OAC)** |
| Default Root Object | `index.html`                    |
| Viewer Protocol     | `Redirect HTTP to HTTPS`        |
| Cache Policy        | `CachingOptimized`              |

⚠️ Do **not** select the S3 website endpoint. Select the S3 bucket origin, e.g.:

```text
olaoluwiv.s3.us-east-1.amazonaws.com
```

Create the distribution and wait for deployment.

---

# 🧪 Step 3 — Test CloudFront

Copy the CloudFront domain:

```text
https://dxxxxxxxxxxxx.cloudfront.net/
```

Verify:

`HTML ✓ | CSS ✓ | Images ✓ | HTTPS ✓`

If everything works, continue to Lambda@Edge.

---

# 🔧 Step 4 — Troubleshoot 404 NoSuchKey

If you receive:

```text
404 NoSuchKey
Key: path/index.html
```

CloudFront is looking for:

```text
path/index.html
```

instead of:

```text
index.html
```

### Fix

**CloudFront → Distribution → Origins → Edit**

Set:

```text
Origin Path: EMPTY
```

Then:

**CloudFront → Settings → Edit**

Set:

```text
Default Root Object: index.html
```

Save and wait for deployment.

---

# ⚡ Step 5 — Create Lambda@Edge

Go to **Lambda** and switch to:

```text
US East (N. Virginia) — us-east-1
```

Create a function:

```text
Name: olaoluwiv
```

Choose a Node.js runtime.

Replace the default code with:

```javascript
exports.handler = async (event) => {
    const response = event.Records[0].cf.response;

    response.headers['x-custom-header'] = [
        {
            key: 'X-Custom-Header',
            value: 'MyServerlessSite'
        }
    ];

    return response;
};
```

Click **Deploy**.

---

# 🔐 Step 6 — Configure Lambda IAM Trust Policy

Open:

**IAM → Roles → Lambda execution role → Trust relationships**

The role must allow both Lambda services:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "lambda.amazonaws.com",
          "edgelambda.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Save the policy.

---

# 📌 Step 7 — Publish Lambda Version

Go to:

**Lambda → Functions → `olaoluwiv` → Versions**

Publish a new version.

Example:

```text
$LATEST
1
```

Use the **numbered version** for Lambda@Edge.

Example ARN:

```text
arn:aws:lambda:us-east-1:ACCOUNT_ID:function:olaoluwiv:1
```

⚠️ Do not use `$LATEST`.

---

# 🌍 Step 8 — Associate Lambda@Edge with CloudFront

Go to:

**CloudFront → Distribution → Behaviors → `/*` → Edit**

Under **Function associations**:

| Event               | Configuration                   |
| ------------------- | ------------------------------- |
| Viewer request      | No association                  |
| **Viewer response** | **Lambda@Edge → `olaoluwiv:1`** |
| Origin request      | No association                  |
| Origin response     | No association                  |

**Include body:** `No`

Save changes and wait for CloudFront deployment.

---

# 🧪 Step 9 — Test Lambda@Edge

Open:

```text
https://dxxxxxxxxxxxx.cloudfront.net/
```

Open browser developer tools:

**F12 → Network → index.html → Headers**

Under **Response Headers**, look for:

```text
X-Custom-Header: MyServerlessSite
```

If present, Lambda@Edge is working. ✅

---

# ⚠️ Step 10 — Troubleshoot Lambda@Edge 503

If CloudFront returns:

```text
503 ERROR
The Lambda function associated with the CloudFront distribution is invalid...
```

Temporarily remove the Lambda association:

**CloudFront → Behaviors → Edit → Viewer response → No association**

Save and wait for deployment.

If the website works again, S3 and CloudFront are fine, and the problem is with Lambda@Edge.

Check:

`Region = us-east-1 | Published version = Yes | `$LATEST` not used | IAM trust policy correct | CloudFront association correct`

---
