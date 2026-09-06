# AWS Lambda Configuration

## Overview

AWS Lambda provides the backend logic for the `CustomerSupportBot` Amazon Lex chatbot.

The Lambda function receives requests from Amazon Lex, determines the user's intent, processes the request, and returns a response.

## Lambda Function

| Setting       | Value                       |
| ------------- | --------------------------- |
| Function name | `CustomerSupportBotHandler` |
| Runtime       | Node.js 22.x                |
| Architecture  | x86_64                      |
| Memory        | 128 MB                      |
| Region        | `us-east-1`                 |
| Handler file  | `index.mjs`                 |

## Lambda Source Code

The function is stored in:

```text
CustomerSupportBotHandler/
└── index.mjs
```

The Lambda uses JavaScript ES modules.

```javascript
export const handler = async (event) => {
    console.log("Lex Event:", JSON.stringify(event));

    const intentName = event.sessionState.intent.name;

    let message;

    switch (intentName) {

        case "GreetingIntent":
            message = "Hello! Welcome to our customer support service. How can I help you today?";
            break;

        case "HelpIntent":
            message = "I can help you check your order status, track an order, and provide basic customer support.";
            break;

        case "CheckOrderStatusIntent":

            const orderId =
                event.sessionState.intent.slots.OrderID.value.interpretedValue.toUpperCase();

            const orders = {
                "ORD12345": "Your order ORD12345 is currently being processed.",
                "ORD67890": "Your order ORD67890 has been shipped and is on its way.",
                "ORD99999": "Your order ORD99999 has been delivered."
            };

            message =
                orders[orderId] ||
                `We could not find an order with ID ${orderId}. Please check the order ID and try again.`;

            break;

        case "GoodbyeIntent":
            message = "Thank you for contacting customer support. Have a great day!";
            break;

        default:
            message = "Sorry, I didn't understand your request. Please try again.";
    }

    return {
        sessionState: {
            dialogAction: {
                type: "Close"
            },
            intent: {
                name: intentName,
                state: "Fulfilled"
            }
        },

        messages: [
            {
                contentType: "PlainText",
                content: message
            }
        ]
    };
};
```

## How the Lambda Works

### 1. Receive the Lex event

The Lambda receives an event containing information about the conversation.

The event includes:

* Bot information.
* Alias information.
* Intent name.
* Slot values.
* User input.
* Session information.

The application logs the event to CloudWatch:

```javascript
console.log("Lex Event:", JSON.stringify(event));
```

### 2. Identify the intent

The function retrieves the intent name:

```javascript
const intentName = event.sessionState.intent.name;
```

The intent determines what action the Lambda should perform.

### 3. Process the order request

For `CheckOrderStatusIntent`, Lambda retrieves the `OrderID` slot:

```javascript
const orderId =
    event.sessionState.intent.slots.OrderID.value.interpretedValue.toUpperCase();
```

The `.toUpperCase()` method is important because Amazon Lex may normalize an alphanumeric slot value to lowercase.

### 4. Simulated Order Database

This project uses an in-memory JavaScript object instead of a real database:

```javascript
const orders = {
    "ORD12345": "Your order ORD12345 is currently being processed.",
    "ORD67890": "Your order ORD67890 has been shipped and is on its way.",
    "ORD99999": "Your order ORD99999 has been delivered."
};
```

This keeps the project simple while demonstrating how Lambda can process customer data.

In a production application, this could be replaced with a database such as Amazon DynamoDB or Amazon RDS.

### 5. Handle unknown orders

If an order ID is not found, Lambda returns:

```text
We could not find an order with ID ORD11111. Please check the order ID and try again.
```

### 6. Return the response to Lex

Lambda returns a Lex-compatible response containing:

* The intent name.
* Fulfillment state.
* Dialog action.
* Response message.

The intent is marked:

```text
Fulfilled
```

---

# Lambda and Lex Integration

The Lambda function is connected to the Amazon Lex bot through the `Development` alias.

The Lex fulfillment configuration uses:

```text
FulfillmentCodeHook
```

The flow is:

```text
Amazon Lex
    │
    │ Fulfillment request
    ▼
CustomerSupportBotHandler
    │
    │ Process request
    ▼
Dynamic response
    │
    ▼
Amazon Lex
```

---

# CloudWatch Logging

The Lambda function writes execution information to Amazon CloudWatch Logs.

Log group:

```text
/aws/lambda/CustomerSupportBotHandler
```

Example:

```text
Lex Event: {...}
```

CloudWatch was used to verify that Lex correctly sent:

```text
Intent: CheckOrderStatusIntent
OrderID: ORD67890
Invocation Source: FulfillmentCodeHook
```

A successful execution also produced:

```text
END RequestId
REPORT RequestId
```

Example execution metrics observed during testing:

```text
Duration: 82.40 ms
Billed Duration: 245 ms
Memory Size: 128 MB
Max Memory Used: 79 MB
Init Duration: 162.56 ms
```

---

# Troubleshooting: Order ID Case Sensitivity

During testing, the user entered:

```text
ORD12345
```

Amazon Lex passed the interpreted slot value to Lambda as:

```text
ord12345
```

The original simulated database used uppercase keys:

```text
ORD12345
ORD67890
ORD99999
```

As a result, the Lambda initially returned:

```text
We could not find an order with ID ord12345.
```

## Solution

The Lambda was updated to normalize the order ID:

```javascript
.toUpperCase()
```

The corrected lookup now converts:

```text
ord12345
```

into:

```text
ORD12345
```

The test then successfully returned:

```text
Your order ORD12345 is currently being processed.
```

This demonstrates an important real-world development practice: **normalize user input before performing lookups when the underlying data has a consistent format.**
