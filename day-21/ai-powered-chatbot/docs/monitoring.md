# CloudWatch Monitoring

## Overview

Amazon CloudWatch is used to monitor the `CustomerSupportBotHandler` Lambda function.

CloudWatch provides:

* Lambda execution logs
* Invocation information
* Error monitoring
* Execution duration
* Memory usage
* Troubleshooting information

The monitoring flow is:

```text
Amazon Lex
    │
    ▼
AWS Lambda
CustomerSupportBotHandler
    │
    ▼
Amazon CloudWatch Logs
    │
    ├── Invocation logs
    ├── Intent information
    ├── OrderID information
    ├── Execution status
    └── Performance information
```

---

## CloudWatch Log Group

The Lambda function automatically sends its execution logs to:

```text
/aws/lambda/CustomerSupportBotHandler
```

### How to access the logs

1. Open the AWS Management Console.
2. Open **CloudWatch**.
3. Select **Logs**.
4. Select **Log groups**.
5. Open:

```text
/aws/lambda/CustomerSupportBotHandler
```

6. Open the latest log stream.

---

## Lambda Execution Logs

The Lambda function logs the Lex event:

```javascript
console.log("Lex Event:", JSON.stringify(event));
```

This allows us to inspect information sent by Amazon Lex.

The logged event contains information such as:

* User input
* Detected intent
* Slot values
* Bot name
* Bot version
* Lex alias
* Invocation source
* Session state

For example, a successful order request contained:

```text
inputTranscript: "ORD67890"
```

Lex identified:

```text
CheckOrderStatusIntent
```

The OrderID was interpreted by Lex as:

```text
ord67890
```

The request was processed through:

```text
FulfillmentCodeHook
```

The bot information showed:

```text
Bot: CustomerSupportBot
Version: 2
Locale: en_US
Alias: Development
```

This confirms that Amazon Lex successfully invoked the Lambda function associated with the `Development` alias and Version 2.

---

## Successful Lambda Execution

A successful Lambda execution produces:

```text
END RequestId
REPORT RequestId
```

The `REPORT` information provides useful performance data.

One successful invocation produced:

```text
Duration: 82.40 ms
Billed Duration: 245 ms
Memory Size: 128 MB
Max Memory Used: 79 MB
Init Duration: 162.56 ms
```

### What these values mean

| Metric          | Meaning                                                  |
| --------------- | -------------------------------------------------------- |
| Duration        | How long the Lambda function executed                    |
| Billed Duration | Duration used for Lambda billing                         |
| Memory Size     | Memory allocated to the function                         |
| Max Memory Used | Maximum memory used during execution                     |
| Init Duration   | Time used to initialize the Lambda execution environment |

---

## CloudWatch Lambda Metrics

Lambda automatically publishes metrics to CloudWatch.

The function can be monitored from:

```text
CloudWatch
→ Metrics
→ All metrics
→ Lambda
→ By Function Name
→ CustomerSupportBotHandler
```

Important metrics include:

### Invocations

Shows how many times the Lambda function was invoked.

This helps determine whether the chatbot is actively calling Lambda.

### Errors

Shows the number of Lambda invocations that resulted in errors.

A healthy deployment should have no unexpected Lambda errors.

### Duration

Shows how long the Lambda function takes to execute.

Lower execution time generally means faster responses to users.

### Throttles

Shows whether Lambda requests were throttled because the function reached its concurrency limits.

---

## Monitoring the Chatbot Request Flow

A typical successful request can be traced through the following services:

```text
User
 │
 ▼
Amazon Lex
 │
 │ Detects intent
 │ Collects OrderID
 ▼
AWS Lambda
 │
 │ Processes request
 │
 ▼
CloudWatch Logs
 │
 │ Records execution
 ▼
Successful response
 │
 ▼
Amazon Lex
 │
 ▼
User
```

---

## Example Monitoring Scenario

User enters:

```text
Where is my order?
```

Amazon Lex identifies:

```text
CheckOrderStatusIntent
```

Lex asks:

```text
Please provide your order ID.
```

User enters:

```text
ORD67890
```

Lex invokes:

```text
CustomerSupportBotHandler
```

Lambda receives the request and processes the OrderID.

Lambda returns:

```text
Your order ORD67890 has been shipped and is on its way.
```

CloudWatch records the Lambda execution.

---

## Troubleshooting with CloudWatch

CloudWatch Logs can be used to investigate problems such as:

* Lambda invocation failures
* Incorrect intent names
* Missing slot values
* Unexpected OrderID values
* Lambda exceptions
* Timeout problems
* Incorrect Lex configuration
* Incorrect Lambda integration

For example, during development Lex interpreted:

```text
ORD12345
```

as:

```text
ord12345
```

The Lambda function initially could not find the lowercase value in the simulated order database.

The issue was fixed by converting the OrderID to uppercase:

```javascript
const orderId =
    event.sessionState.intent.slots.OrderID.value.interpretedValue.toUpperCase();
```

CloudWatch logs helped confirm the value received from Lex and made the issue easier to diagnose.

---

## Current Monitoring Status

The following monitoring components have been completed:

* [x] Lambda CloudWatch log group created automatically
* [x] Lambda execution logs verified
* [x] Lex event information verified in CloudWatch
* [x] Intent information verified
* [x] OrderID information verified
* [x] Lambda execution status verified
* [x] Lambda performance information verified
* [x] Lambda metrics accessed through CloudWatch

---

## Future Improvements

The project can be extended with additional CloudWatch features:

* CloudWatch alarms for Lambda errors
* Alarms for high Lambda duration
* Monitoring dashboards
* Log retention configuration
* Additional application metrics
* Notifications through Amazon SNS

These are future improvements and are not currently part of the completed implementation.

---

## Conclusion

Amazon CloudWatch provides visibility into the `CustomerSupportBotHandler` Lambda function.

The combination of Lambda logs and CloudWatch metrics makes it possible to monitor chatbot requests, investigate errors, and understand Lambda performance.

This completes the monitoring component of the AI-powered serverless chatbot project.
