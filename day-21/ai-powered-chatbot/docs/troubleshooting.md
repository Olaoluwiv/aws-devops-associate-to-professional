# Troubleshooting Guide

## Overview

This document records the problems encountered while building and testing the AI-powered serverless chatbot using Amazon Lex V2 and AWS Lambda.

Documenting these issues is important because troubleshooting is a normal part of AWS development.

---

# 1. Lambda Returned "Order Not Found"

## Problem

When testing the order status intent, the user entered:

```text
ORD12345
```

The Lambda function returned:

```text
We could not find an order with ID ord12345.
```

The order existed in the simulated database as:

```text
ORD12345
```

## Cause

Amazon Lex interpreted the OrderID as lowercase:

```text
ord12345
```

The Lambda code was looking for an exact match.

Therefore:

```text
ord12345 != ORD12345
```

## Solution

The Lambda function was updated to convert the interpreted OrderID to uppercase.

The original code was:

```javascript
const orderId =
    event.sessionState.intent.slots.OrderID.value.interpretedValue;
```

It was changed to:

```javascript
const orderId =
    event.sessionState.intent.slots.OrderID.value.interpretedValue.toUpperCase();
```

## Result

The chatbot successfully returned:

```text
Your order ORD12345 is currently being processed.
```

The same solution allowed the following test orders to work correctly:

```text
ORD12345
ORD67890
ORD99999
```

---

# 2. Checking Lambda Logs

## Problem

When a chatbot request does not behave as expected, it can be difficult to determine whether the problem is coming from Lex or Lambda.

## Solution

CloudWatch Logs was used to inspect the event received by Lambda.

The Lambda function logs the complete Lex event:

```javascript
console.log("Lex Event:", JSON.stringify(event));
```

This makes it possible to inspect:

* User input
* Intent name
* Slot values
* Bot version
* Alias
* Invocation source
* Session state

The CloudWatch log group is:

```text
/aws/lambda/CustomerSupportBotHandler
```

---

# 3. Verifying the Correct Lex Version

## Problem

Amazon Lex supports bot versions and aliases.

Testing the wrong version can cause changes made in Draft to appear not to work.

## Solution

The project uses the `Development` alias.

The current configuration is:

```text
CustomerSupportBot
        │
        ▼
Development Alias
        │
        ▼
Version 2
        │
        ▼
CustomerSupportBotHandler
```

Before testing, verify that:

* The latest Draft changes were built.
* A new bot version was created.
* The `Development` alias points to the intended version.
* The Lambda function is connected to the correct locale.

Current configuration:

```text
Bot: CustomerSupportBot
Alias: Development
Version: 2
Locale: en_US
Lambda: CustomerSupportBotHandler
```

---

# 4. Lambda Fulfillment Hook Not Executing

## Problem

If Lex recognizes the intent but Lambda does not generate the expected response, the Lambda fulfillment hook may not be configured correctly.

## Checks

Open the Lex bot and check:

```text
CustomerSupportBot
→ Intents
→ CheckOrderStatusIntent
```

Verify that the fulfillment code hook is enabled.

The intended configuration is:

```text
CheckOrderStatusIntent
        │
        ▼
Fulfillment Code Hook
        │
        ▼
CustomerSupportBotHandler
```

Also verify that the Lambda function is associated with the correct Lex alias and locale.

---

# 5. OrderID Slot Not Being Collected

## Problem

The chatbot must collect an OrderID before Lambda can process the order.

For example:

```text
User:
Where is my order?

Lex:
Please provide your order ID.
```

## Checks

Verify that the `OrderID` slot is:

```text
Slot name: OrderID
Slot type: AMAZON.AlphaNumeric
Required: Yes
```

The slot prompt is:

```text
Please provide your order ID.
```

If the slot is not required, Lex may attempt to continue without collecting the OrderID.

---

# 6. Unknown OrderID

## Problem

A user may enter an OrderID that does not exist in the simulated order database.

For example:

```text
ORD11111
```

## Expected Behavior

Lambda should return:

```text
We could not find an order with ID ORD11111. Please check the order ID and try again.
```

This is expected behavior and is not considered a Lambda error.

The simulated database currently contains:

```javascript
const orders = {
    "ORD12345": "Your order ORD12345 is currently being processed.",
    "ORD67890": "Your order ORD67890 has been shipped and is on its way.",
    "ORD99999": "Your order ORD99999 has been delivered."
};
```

---

# 7. Lambda Errors

## Problem

If Lambda produces an error, the chatbot may fail to return the expected response.

## Troubleshooting Steps

Open:

```text
CloudWatch
→ Logs
→ Log groups
→ /aws/lambda/CustomerSupportBotHandler
```

Open the latest log stream.

Look for:

```text
ERROR
Exception
Task timed out
```

Also inspect:

```text
END RequestId
REPORT RequestId
```

The `REPORT` entry provides information about the execution.

---

# 8. Lambda Timeout

## Problem

A Lambda function can time out if it takes longer than its configured timeout.

## Checks

Open:

```text
Lambda
→ CustomerSupportBotHandler
→ Configuration
→ General configuration
```

Check the configured timeout.

For this project, the Lambda function performs only lightweight in-memory processing, so it should normally complete very quickly.

A successful invocation was observed with:

```text
Duration: 82.40 ms
```

---

# 9. Lex Does Not Recognize an Utterance

## Problem

The chatbot may fail to recognize a user's request if the utterance does not sufficiently match the configured intent examples.

## Solution

Add additional sample utterances to the appropriate intent.

For example, `CheckOrderStatusIntent` contains examples such as:

```text
Where is my order?
Track my order
Check my order status
I want to know my order status
Can you track my order?
Where is my package?
Check order status
```

Additional variations can be added as the chatbot is tested.

After changing the bot configuration:

1. Build the bot.
2. Create/update the version if required.
3. Ensure the `Development` alias points to the intended version.
4. Test again.

---

# 10. Fallback Intent

## Problem

A user may enter something that does not match the configured intents.

For example:

```text
Tell me a joke.
```

## Expected Behavior

Lex should use its fallback behavior and return an appropriate fallback response.

The fallback mechanism prevents unsupported requests from causing the chatbot to fail.

---

# 11. Lambda Code Changes Not Appearing

## Problem

A change made to the local Lambda code does not automatically update the AWS Lambda function.

## Solution

After modifying:

```text
CustomerSupportBotHandler/index.mjs
```

the updated code must be deployed to the Lambda function.

For this project, the Lambda source was updated and deployed after the OrderID case-sensitivity issue was discovered.

Always verify the deployed Lambda code before testing.

---

# 12. Recommended Troubleshooting Order

When something does not work, troubleshoot from left to right:

```text
User Input
    │
    ▼
Amazon Lex
    │
    ├── Intent recognized?
    │
    ├── Required slot collected?
    │
    ├── Correct bot version?
    │
    ├── Correct alias?
    │
    ▼
Lambda
    │
    ├── Function invoked?
    │
    ├── Correct event received?
    │
    ├── Correct OrderID?
    │
    ├── Any code errors?
    │
    ▼
CloudWatch
    │
    ├── Logs
    ├── Errors
    └── Duration
```

This approach helps identify which AWS component is causing the problem.

---

# 13. Troubleshooting Checklist

Use this checklist when testing the chatbot:

* [ ] Is the Lex bot built?
* [ ] Is the correct bot version being used?
* [ ] Does `Development` point to the correct version?
* [ ] Is the English (US) locale enabled?
* [ ] Is the Lambda function associated with Lex?
* [ ] Is the fulfillment code hook enabled?
* [ ] Is the `OrderID` slot required?
* [ ] Is the Lambda function deployed with the latest code?
* [ ] Is Lambda being invoked?
* [ ] Does CloudWatch contain the expected event?
* [ ] Is the OrderID value correct?
* [ ] Are there Lambda errors?
* [ ] Is Lambda completing within the timeout?

---

# Conclusion

The most important troubleshooting lesson from this project was that AWS services may transform or interpret user input before it reaches application code.

In this project, Amazon Lex interpreted an uppercase OrderID as lowercase. CloudWatch logs exposed the actual value received by Lambda, allowing the problem to be identified and fixed with:

```javascript
.toUpperCase()
```

CloudWatch Logs, Lex testing, Lambda logs, and careful version/alias verification provide a reliable troubleshooting process for this serverless chatbot.
