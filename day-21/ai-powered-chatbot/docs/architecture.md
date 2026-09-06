# Architecture

## Overview

This project uses a serverless architecture built with Amazon Lex, AWS Lambda, and Amazon CloudWatch.

The chatbot allows users to interact using natural language and check the status of simulated customer orders.

## Architecture Flow

```text
User
  │
  ▼
Amazon Lex V2
  │
  ├── Identifies user intent
  ├── Collects required slot information
  │
  ▼
AWS Lambda
(CustomerSupportBotHandler)
  │
  ├── Processes the intent
  ├── Checks the OrderID
  ├── Generates a dynamic response
  │
  ▼
Amazon Lex
  │
  ▼
User
```

## AWS Services Used

### Amazon Lex V2

Amazon Lex provides the conversational interface for the chatbot.

It is responsible for:

* Understanding user messages.
* Identifying user intents.
* Collecting required information using slots.
* Sending fulfillment requests to AWS Lambda.
* Returning responses to the user.

### AWS Lambda

The `CustomerSupportBotHandler` Lambda function contains the chatbot business logic.

The function:

* Receives events from Amazon Lex.
* Identifies the requested intent.
* Retrieves the OrderID slot.
* Checks the simulated order database.
* Returns a response to the chatbot.

### Amazon CloudWatch

Amazon CloudWatch provides monitoring and logging for the Lambda function.

CloudWatch was used to:

* View Lambda execution logs.
* Inspect Lex events sent to Lambda.
* Monitor function duration.
* Monitor memory usage.
* Verify successful function execution.
* Investigate errors.

## Request Flow Example

A user enters:

```text
Where is my order?
```

Amazon Lex identifies:

```text
Intent: CheckOrderStatusIntent
```

Lex asks the user for the required OrderID:

```text
Please provide your order ID.
```

The user enters:

```text
ORD67890
```

Lex invokes the Lambda fulfillment code hook.

The Lambda processes the request and checks the simulated order data.

The response is returned:

```text
Your order ORD67890 has been shipped and is on its way.
```

## Deployment Architecture

```text
CustomerSupportBot
        │
        ├── Draft Version
        │
        ├── Version 1
        │
        ├── Version 2
        │
        ▼
Development Alias
        │
        ▼
English (US)
        │
        ▼
CustomerSupportBotHandler
        │
        ▼
Amazon CloudWatch Logs
```

## Benefits of This Architecture

* Serverless infrastructure.
* No servers to manage.
* Automatic scaling.
* Pay for usage.
* Natural language interaction.
* Easy integration with other AWS services.
* Built-in monitoring through CloudWatch.
