# Testing

## Overview

The `CustomerSupportBot` was tested using the Amazon Lex V2 test console through the `Development` alias.

Testing covered:

* Intent recognition
* Slot collection
* Lambda fulfillment
* Successful order lookups
* Unknown order handling
* Greeting responses
* Help responses
* Goodbye responses
* CloudWatch Lambda execution logs

---

## Test Environment

| Setting | Value                       |
| ------- | --------------------------- |
| Bot     | `CustomerSupportBot`        |
| Alias   | `Development`               |
| Version | `2`                         |
| Locale  | English (US)                |
| Lambda  | `CustomerSupportBotHandler` |
| Region  | `us-east-1`                 |

---

# Order Status Tests

## Test 1 — Processing Order

### User input

```text
Where is my order?
```

### Lex response

```text
Please provide your order ID
```

### User input

```text
ORD12345
```

### Expected result

```text
Your order ORD12345 is currently being processed.
```

### Result

**PASS**

---

## Test 2 — Shipped Order

### User input

```text
Where is my order?
```

### Lex response

```text
Please provide your order ID
```

### User input

```text
ORD67890
```

### Expected result

```text
Your order ORD67890 has been shipped and is on its way.
```

### Result

**PASS**

---

## Test 3 — Delivered Order

### User input

```text
Where is my order?
```

### Lex response

```text
Please provide your order ID
```

### User input

```text
ORD99999
```

### Expected result

```text
Your order ORD99999 has been delivered.
```

### Result

**PASS**

---

## Test 4 — Unknown Order

### User input

```text
Where is my order?
```

### Lex response

```text
Please provide your order ID
```

### User input

```text
ORD11111
```

### Expected result

```text
We could not find an order with ID ORD11111. Please check the order ID and try again.
```

### Result

**PASS**

---

# Intent Tests

## Test 5 — GreetingIntent

### User input

```text
Hello
```

### Expected response

```text
Hello! Welcome to our customer support service. How can I help you today?
```

### Result

**PASS**

---

## Test 6 — HelpIntent

### User input

```text
What can you do?
```

### Expected response

```text
I can help you check your order status, track an order, and provide basic customer support.
```

### Result

**PASS**

---

## Test 7 — GoodbyeIntent

### User input

```text
Goodbye
```

### Expected response

```text
Thank you for contacting customer support. Have a great day!
```

### Result

**PASS**

---

# Lambda Integration Test

The Lambda integration was verified using Amazon CloudWatch Logs.

The Lambda received an event containing:

```text
Intent: CheckOrderStatusIntent
OrderID: ORD67890
Invocation Source: FulfillmentCodeHook
```

The CloudWatch log confirmed that the request was associated with:

```text
Bot: CustomerSupportBot
Version: 2
Alias: Development
Locale: en_US
```

The Lambda execution completed successfully.

### Result

**PASS**

---

# CloudWatch Execution Test

The successful Lambda invocation produced:

```text
END RequestId
REPORT RequestId
```

Observed execution information included:

```text
Duration: 82.40 ms
Billed Duration: 245 ms
Memory Size: 128 MB
Max Memory Used: 79 MB
Init Duration: 162.56 ms
```

### Result

**PASS**

---

# Case-Sensitivity Test

During testing, Amazon Lex interpreted:

```text
ORD12345
```

as:

```text
ord12345
```

The Lambda was updated to normalize the value using:

```javascript
.toUpperCase()
```

After the change, the same test successfully returned:

```text
Your order ORD12345 is currently being processed.
```

### Result

**PASS**

---

# Test Summary

| Test               | Result |
| ------------------ | ------ |
| Greeting           | PASS   |
| Help               | PASS   |
| Goodbye            | PASS   |
| Order — Processing | PASS   |
| Order — Shipped    | PASS   |
| Order — Delivered  | PASS   |
| Unknown Order      | PASS   |
| Lambda Fulfillment | PASS   |
| CloudWatch Logging | PASS   |
| Case Normalization | PASS   |

## Overall Result

**All planned functional tests passed successfully.**

The chatbot successfully recognizes user intents, collects the required order ID, invokes AWS Lambda for fulfillment, processes the request, and returns a dynamic response to the user.
