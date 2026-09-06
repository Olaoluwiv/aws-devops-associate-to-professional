# 🤖 AI-Powered Serverless Chatbot with AWS Lex & Lambda

## 📌 Project Overview

This project demonstrates how to build an **AI-powered serverless chatbot** using Amazon Lex V2 and AWS Lambda.

The chatbot allows users to communicate using natural language. Amazon Lex handles **speech recognition and natural language understanding**, identifies the user's intent, collects required information, and invokes AWS Lambda to generate dynamic responses.

For this project, the chatbot provides basic customer support functionality, including:

* Greeting users
* Providing help
* Checking order status
* Handling unknown orders
* Ending conversations
* Handling unsupported requests through fallback behavior

The project also uses **Amazon CloudWatch** to monitor Lambda executions and troubleshoot problems.

---

# 🏗️ Architecture

```text
                         ┌──────────────────┐
                         │      User        │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Amazon Lex V2  │
                         │                  │
                         │ Intent Detection │
                         │ Slot Collection  │
                         └────────┬─────────┘
                                  │
                                  │ Fulfillment
                                  ▼
                    ┌──────────────────────────┐
                    │       AWS Lambda         │
                    │                          │
                    │ CustomerSupportBotHandler│
                    │                          │
                    │ Process Intent           │
                    │ Process OrderID          │
                    │ Generate Response        │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                       ┌────────────────────┐
                       │  Amazon CloudWatch │
                       │                    │
                       │ Logs & Metrics     │
                       └────────────────────┘
                                 │
                                 ▼
                         Response to User
```

---

# ☁️ AWS Services Used

| AWS Service       | Purpose                                               |
| ----------------- | ----------------------------------------------------- |
| Amazon Lex V2     | Natural language understanding and intent recognition |
| AWS Lambda        | Processes chatbot requests and generates responses    |
| Amazon CloudWatch | Logs, monitoring, metrics, and troubleshooting        |

---

# 🎯 Project Objectives

The main objectives are to learn how to:

1. Create an Amazon Lex V2 chatbot.
2. Create intents and sample utterances.
3. Configure slots.
4. Create an AWS Lambda function.
5. Connect Lambda to Amazon Lex.
6. Process Lex events in Lambda.
7. Generate dynamic responses.
8. Create and manage Lex bot versions.
9. Configure Lex aliases.
10. Test chatbot conversations.
11. Monitor Lambda with CloudWatch.
12. Troubleshoot serverless application issues.

---

# 🛠️ Technologies

* Amazon Lex V2
* AWS Lambda
* Amazon CloudWatch
* Node.js 22.x
* JavaScript
* AWS Management Console
* PowerShell
* Git / GitHub

---

# 🌎 AWS Region

The project was built in:

```text
us-east-1
```

---

# 🤖 Amazon Lex Configuration

## Bot

```text
Bot Name: CustomerSupportBot
Version: 2
Alias: Development
Locale: English (US)
```

The `Development` alias currently points to **Version 2**.

---

# 🧠 Intents

The chatbot contains the following intents.

## 1. GreetingIntent

Purpose:

Handles greetings from users.

Example utterances:

```text
Hello
Hi
Hey
Good morning
Good afternoon
Good evening
Hello there
```

Example response:

```text
Hello! Welcome to our customer support service. How can I help you today?
```

---

## 2. CheckOrderStatusIntent

Purpose:

Allows users to check the status of an order.

Example utterances:

```text
Where is my order?
Track my order
Check my order status
I want to know my order status
Can you track my order?
Where is my package?
Check order status
```

This intent contains the required slot:

```text
Slot Name: OrderID
Slot Type: AMAZON.AlphaNumeric
Required: Yes
```

Lex asks:

```text
Please provide your order ID.
```

The intent uses a Lambda fulfillment code hook.

---

## 3. HelpIntent

Purpose:

Explains what the chatbot can do.

Example utterances:

```text
Help
What can you do?
I need help
Can you help me?
What services do you provide?
I need assistance
How can you help me?
```

Example response:

```text
I can help you check your order status, track an order, and provide basic customer support.
```

---

## 4. GoodbyeIntent

Purpose:

Handles users ending the conversation.

Example utterances:

```text
Bye
Goodbye
See you later
Talk to you later
I am done
Thanks bye
Have a good day
```

Example response:

```text
Thank you for contacting customer support. Have a great day!
```

---

## 5. FallbackIntent

The fallback behavior handles requests that do not match the chatbot's supported intents.

This prevents unsupported requests from causing the conversation to fail.

---

# ⚡ AWS Lambda

Lambda function:

```text
CustomerSupportBotHandler
```

Configuration:

```text
Runtime: Node.js 22.x
Architecture: x86_64
Memory: 128 MB
Region: us-east-1
```

Source file:

```text
CustomerSupportBotHandler/index.mjs
```

---

# 📂 Project Structure

```text
ai-powered-chatbot/
│
├── README.md
├── .gitignore
│
├── CustomerSupportBotHandler/
│   └── index.mjs
│
├── docs/
│   ├── architecture.md
│   ├── lex-configuration.md
│   ├── lambda-configuration.md
│   ├── testing.md
│   ├── monitoring.md
│   └── troubleshooting.md
│
└── screenshots/
    └── .gitkeep
```

---

# 🔄 How the Application Works

A typical order-status conversation works like this:

### Step 1 — User asks about an order

```text
Where is my order?
```

### Step 2 — Lex identifies the intent

```text
CheckOrderStatusIntent
```

### Step 3 — Lex requests the required slot

```text
Please provide your order ID.
```

### Step 4 — User provides the OrderID

```text
ORD67890
```

### Step 5 — Lex invokes Lambda

```text
CustomerSupportBotHandler
```

### Step 6 — Lambda processes the order

The project currently uses a simulated in-memory order database.

### Step 7 — Lambda returns a response

```text
Your order ORD67890 has been shipped and is on its way.
```

### Step 8 — Lex returns the response to the user

```text
User ← Amazon Lex ← AWS Lambda
```

---

# 🗄️ Simulated Order Database

This project does not currently use a real database.

Instead, Lambda uses an in-memory JavaScript object:

```javascript
const orders = {
    "ORD12345": "Your order ORD12345 is currently being processed.",
    "ORD67890": "Your order ORD67890 has been shipped and is on its way.",
    "ORD99999": "Your order ORD99999 has been delivered."
};
```

Supported test orders:

| Order ID   | Status     |
| ---------- | ---------- |
| `ORD12345` | Processing |
| `ORD67890` | Shipped    |
| `ORD99999` | Delivered  |

Any other OrderID returns a not-found message.

Example:

```text
ORD11111
```

Response:

```text
We could not find an order with ID ORD11111. Please check the order ID and try again.
```

---

# 🔗 Lex and Lambda Integration

The chatbot uses a Lambda **Fulfillment Code Hook**.

```text
CheckOrderStatusIntent
          │
          ▼
Fulfillment Code Hook
          │
          ▼
CustomerSupportBotHandler
          │
          ▼
Dynamic Response
          │
          ▼
Amazon Lex
```

The Lambda function reads the intent from the Lex event:

```javascript
const intentName = event.sessionState.intent.name;
```

It then processes the intent using a `switch` statement.

---

# 🔤 Important Troubleshooting Lesson

During testing, Amazon Lex interpreted:

```text
ORD12345
```

as:

```text
ord12345
```

The Lambda database contained uppercase keys:

```text
ORD12345
ORD67890
ORD99999
```

Therefore the first test failed to find the order.

The problem was fixed by converting the interpreted OrderID to uppercase:

```javascript
const orderId =
    event.sessionState.intent.slots.OrderID.value.interpretedValue.toUpperCase();
```

This made the application more tolerant of Lex's normalized slot value.

---

# 🧪 Testing

The chatbot was tested with the following conversations.

| Test             | Input              | Expected Result     | Status |
| ---------------- | ------------------ | ------------------- | ------ |
| Greeting         | `Hello`            | Greeting response   | ✅ PASS |
| Help             | `What can you do?` | Help response       | ✅ PASS |
| Processing order | `ORD12345`         | Processing response | ✅ PASS |
| Shipped order    | `ORD67890`         | Shipped response    | ✅ PASS |
| Delivered order  | `ORD99999`         | Delivered response  | ✅ PASS |
| Unknown order    | `ORD11111`         | Not-found response  | ✅ PASS |
| Goodbye          | `Goodbye`          | Goodbye response    | ✅ PASS |
| Unknown request  | Unsupported input  | Fallback behavior   | ✅ PASS |

---

# 📊 CloudWatch Monitoring

Lambda automatically sends logs to:

```text
/aws/lambda/CustomerSupportBotHandler
```

CloudWatch was used to verify:

* Lambda invocations
* Lex events
* Intent names
* Slot values
* Bot version
* Alias
* Invocation source
* Execution status
* Lambda performance

A successful invocation produced:

```text
Duration: 82.40 ms
Billed Duration: 245 ms
Memory Size: 128 MB
Max Memory Used: 79 MB
Init Duration: 162.56 ms
```

Important CloudWatch metrics include:

* Invocations
* Errors
* Duration
* Throttles

---

# 🔍 Troubleshooting Approach

When something goes wrong, troubleshoot the architecture from left to right:

```text
User
 │
 ▼
Amazon Lex
 │
 ├── Intent recognized?
 ├── Slot collected?
 ├── Correct version?
 └── Correct alias?
 │
 ▼
AWS Lambda
 │
 ├── Function invoked?
 ├── Correct event?
 ├── Correct slot value?
 └── Any errors?
 │
 ▼
Amazon CloudWatch
 │
 ├── Logs
 ├── Errors
 └── Performance metrics
```

This makes it easier to identify which component is causing the problem.

---

# 📚 Documentation

Detailed project documentation is available in the `docs` directory.

| Document                  | Description                               |
| ------------------------- | ----------------------------------------- |
| `architecture.md`         | Application architecture and request flow |
| `lex-configuration.md`    | Amazon Lex bot configuration              |
| `lambda-configuration.md` | Lambda configuration and source code      |
| `testing.md`              | Chatbot testing and test results          |
| `monitoring.md`           | CloudWatch monitoring                     |
| `troubleshooting.md`      | Problems encountered and solutions        |

---

# 🔐 Security Considerations

This project is a learning implementation.

The current version does not use a production database or authentication system.

For a production chatbot, additional security controls should be considered, including:

* IAM least-privilege permissions
* Authentication and authorization
* Secure database access
* Encryption
* Secrets management
* Input validation
* CloudWatch log protection
* Data privacy controls

---

# 🚀 Future Improvements

The current project can be extended significantly.

Possible improvements include:

### Real Database

Replace the simulated order database with:

* Amazon DynamoDB
* Amazon RDS
* Amazon Aurora

### Authentication

Add Amazon Cognito to authenticate customers.

### API Integration

Expose chatbot functionality through Amazon API Gateway.

### Website Integration

Integrate the chatbot into a web application.

### Voice Interaction

Use Lex's speech capabilities for voice-based conversations.

### Better Order Management

Connect the chatbot to a real order-management system.

### Monitoring

Add:

* CloudWatch dashboards
* CloudWatch alarms
* Amazon SNS notifications
* Custom application metrics

### CI/CD

Automate Lambda deployment using:

* AWS CodeBuild
* AWS CodePipeline
* AWS SAM
* AWS CDK

---

# 💰 Cost Considerations

This project uses serverless AWS services.

The main services used are:

```text
Amazon Lex
AWS Lambda
Amazon CloudWatch
```

AWS charges for usage of these services according to their respective pricing models.

For learning projects, monitor AWS usage and clean up resources that are no longer required.

---

# 🧹 Cleanup

When the project is no longer needed, review and remove AWS resources that were created specifically for this project.

Important resources to review:

```text
CustomerSupportBot
CustomerSupportBotHandler
CloudWatch Log Group
```

Do not delete resources that are being used by other projects.

---

# 📈 Project Status

## Completed

* [x] Created Amazon Lex V2 bot
* [x] Created `GreetingIntent`
* [x] Created `CheckOrderStatusIntent`
* [x] Created `HelpIntent`
* [x] Created `GoodbyeIntent`
* [x] Configured `OrderID` slot
* [x] Created AWS Lambda function
* [x] Developed Lambda handler
* [x] Connected Lambda to Lex
* [x] Enabled fulfillment code hook
* [x] Created Lex Version 1
* [x] Created Lex Version 2
* [x] Configured `Development` alias
* [x] Pointed `Development` to Version 2
* [x] Tested chatbot conversations
* [x] Tested multiple order statuses
* [x] Tested unknown OrderID
* [x] Verified Lambda CloudWatch logs
* [x] Verified Lambda metrics
* [x] Documented troubleshooting
* [x] Created project documentation

## Future Work

* [ ] Connect a real order database
* [ ] Add authentication
* [ ] Integrate API Gateway
* [ ] Build a web interface
* [ ] Add CloudWatch alarms
* [ ] Add CI/CD deployment
* [ ] Deploy the chatbot as a production-style application

---

# 🎓 What I Learned

This project provided practical experience with:

* Amazon Lex V2
* Natural language understanding
* Intent recognition
* Slot management
* AWS Lambda
* Lambda event handling
* Serverless architecture
* Lex fulfillment code hooks
* Lambda versions and aliases
* CloudWatch Logs
* CloudWatch metrics
* Debugging AWS applications
* Handling normalized user input
* AWS serverless application design

One of the most important lessons was understanding how AWS services interact rather than treating each service as an isolated component.

---

# 🏁 Conclusion

This project demonstrates a complete basic serverless chatbot workflow:

```text
User
  ↓
Amazon Lex V2
  ↓
Intent + Slot Recognition
  ↓
AWS Lambda
  ↓
Dynamic Processing
  ↓
Amazon CloudWatch
  ↓
Response
```

The chatbot successfully recognizes customer-support requests, collects order information, invokes Lambda, processes the request, and returns a dynamic response.

The project provides a foundation that can later be extended into a more realistic production-style customer support platform using databases, authentication, APIs, CI/CD, monitoring, and web integration.

---

## 👩‍💻 Project

**Project:** AI-Powered Serverless Chatbot with AWS Lex & Lambda

**AWS Region:** `us-east-1`

**Bot:** `CustomerSupportBot`

**Lambda:** `CustomerSupportBotHandler`

**Runtime:** Node.js 22.x
