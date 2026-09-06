# Amazon Lex Configuration

## Bot

**Bot Name:** `CustomerSupportBot`

**Service:** Amazon Lex V2

**Region:** `us-east-1`

**Locale:** English (US)

The bot provides a simple customer support conversational interface.

---

## Intents

### 1. GreetingIntent

**Purpose:** Handles greetings from users.

**Sample utterances:**

* Hello
* Hi
* Hey
* Good morning
* Good afternoon
* Good evening
* Hello there

**Response:**

> Hello! Welcome to our customer support service. How can I help you today?

---

### 2. CheckOrderStatusIntent

**Purpose:** Handles requests to check or track an order.

**Sample utterances:**

* Where is my order?
* Track my order
* Check my order status
* I want to know my order status
* Can you track my order?
* Where is my package?
* Check order status

### OrderID Slot

The intent uses a required slot:

| Setting   | Value                           |
| --------- | ------------------------------- |
| Slot name | `OrderID`                       |
| Slot type | `AMAZON.AlphaNumeric`           |
| Required  | Yes                             |
| Prompt    | `Please provide your order ID.` |

Example:

```text
User: Where is my order?

Lex: Please provide your order ID.

User: ORD12345
```

The collected OrderID is then passed to Lambda for fulfillment.

---

### 3. HelpIntent

**Purpose:** Provides information about what the chatbot can do.

**Sample utterances:**

* Help
* What can you do?
* I need help
* Can you help me?
* What services do you provide?
* I need assistance
* How can you help me?

**Response:**

> I can help you check your order status, track an order, and provide basic customer support.

---

### 4. GoodbyeIntent

**Purpose:** Handles users ending the conversation.

**Sample utterances:**

* Bye
* Goodbye
* See you later
* Talk to you later
* I am done
* Thanks bye
* Have a good day

**Response:**

> Thank you for contacting customer support. Have a great day!

---

### 5. FallbackIntent

Amazon Lex uses the fallback intent when it cannot confidently match a user's input to the configured intents.

Example:

```text
User: Tell me something completely unrelated.
```

Lex can route the request to the fallback behavior.

---

# Lambda Integration

The Lex bot uses the Lambda function:

```text
CustomerSupportBotHandler
```

Lambda is configured for the **English (US)** locale of the `Development` alias.

The Lambda is invoked through the:

```text
FulfillmentCodeHook
```

For `CheckOrderStatusIntent`, Lambda receives the collected `OrderID` and generates the order status response.

---

# Bot Versions and Alias

The project uses Lex bot versions and aliases to separate development configuration from a deployed version.

Current configuration:

```text
CustomerSupportBot
│
├── Draft
│
├── Version 1
│
├── Version 2
│
├── TestBotAlias
│
└── Development
      └── Version 2
```

The `Development` alias currently points to **Version 2**.

This version contains the Lambda fulfillment configuration.

---

# Example Conversation

```text
User:
Where is my order?

Lex:
Please provide your order ID.

User:
ORD12345

Lambda:
Your order ORD12345 is currently being processed.

Lex:
Your order ORD12345 is currently being processed.
```

---

# Supported Test Orders

The Lambda currently uses simulated order data:

| Order ID   | Status     |
| ---------- | ---------- |
| `ORD12345` | Processing |
| `ORD67890` | Shipped    |
| `ORD99999` | Delivered  |

An unknown order ID produces a not-found response.
