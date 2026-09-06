\# Day 22 — SNS \& SQS Asynchronous Microservices Communication



\## 📌 Project Overview



This project demonstrates how \*\*Amazon SNS (Simple Notification Service)\*\* and \*\*Amazon SQS (Simple Queue Service)\*\* can be used to build an event-driven, asynchronous microservices architecture.



The goal is to allow one producer microservice to publish an event once, while multiple independent consumer microservices receive and process that event through their own SQS queues.



The architecture demonstrates the \*\*SNS fan-out pattern\*\*.



\---



\## 🏗️ Architecture



```text

&#x20;                   Producer Microservice

&#x20;                        (Python)

&#x20;                           │

&#x20;                           │ Publish Event

&#x20;                           ▼

&#x20;                 SNS: order-events-topic

&#x20;                      │             │

&#x20;                      │             │

&#x20;                      ▼             ▼

&#x20;         order-processing-queue   inventory-update-queue

&#x20;                   (SQS)                (SQS)

&#x20;                      │                    │

&#x20;                      ▼                    ▼

&#x20;               Order Consumer       Inventory Consumer

&#x20;                 Microservice          Microservice

```



\### Message Flow



1\. The Producer Microservice creates an order event.

2\. The producer publishes the event to the SNS topic.

3\. SNS receives the event.

4\. SNS broadcasts the event to both subscribed SQS queues.

5\. The Order Consumer reads the message from `order-processing-queue`.

6\. The Inventory Consumer reads the message from `inventory-update-queue`.

7\. Each microservice processes the event independently.

8\. After successful processing, each consumer deletes the message from its queue.



\---



\# ☁️ AWS Services Used



| Service    | Purpose                            |

| ---------- | ---------------------------------- |

| Amazon SNS | Event broadcasting and fan-out     |

| Amazon SQS | Reliable message queuing           |

| AWS IAM    | Authentication and permissions     |

| CloudWatch | AWS service monitoring and logging |

| Python     | Microservice implementation        |

| Boto3      | Python SDK for AWS                 |



\---



\# 📡 SNS Configuration



\## SNS Topic



\*\*Topic name:\*\*



```text

order-events-topic

```



\*\*Topic type:\*\*



```text

Standard

```



\*\*Region:\*\*



```text

us-east-1

```



\*\*Topic ARN:\*\*



```text

arn:aws:sns:us-east-1:027174261562:order-events-topic

```



The SNS topic acts as the central event broadcaster.



The producer does not need to know which microservices are consuming the event.



\---



\# 📬 SQS Configuration



Two SQS queues were created.



\## 1. Order Processing Queue



```text

order-processing-queue

```



Purpose:



```text

Receives order events for the Order Consumer.

```



Queue URL:



```text

https://sqs.us-east-1.amazonaws.com/027174261562/order-processing-queue

```



\---



\## 2. Inventory Update Queue



```text

inventory-update-queue

```



Purpose:



```text

Receives order events for the Inventory Consumer.

```



Queue URL:



```text

https://sqs.us-east-1.amazonaws.com/027174261562/inventory-update-queue

```



Both queues are \*\*Standard SQS queues\*\*.



\---



\# 🔗 SNS → SQS Subscriptions



The following subscriptions were configured:



```text

order-events-topic

&#x20;       │

&#x20;       ├──► order-processing-queue

&#x20;       │

&#x20;       └──► inventory-update-queue

```



Both subscriptions were successfully confirmed.



This creates the SNS \*\*fan-out architecture\*\*.



A single event published to SNS can therefore be delivered independently to multiple consumers.



\---



\# 🐍 Project Structure



```text

sns-sqs-microservices/

│

├── producer/

│   └── producer.py

│

├── order-service/

│   └── consumer.py

│

├── inventory-service/

│   └── consumer.py

│

├── requirements.txt

└── .gitignore

```



\---



\# 🚀 Producer Microservice



The producer is responsible for publishing order events to SNS.



The producer uses:



```python

import boto3

```



and creates an SNS client:



```python

sns = boto3.client("sns", region\_name="us-east-1")

```



The order event is represented as JSON:



```python

message = {

&#x20;   "order\_id": "ORD99999",

&#x20;   "status": "created"

}

```



The event is then published to the SNS topic:



```python

response = sns.publish(

&#x20;   TopicArn=topic\_arn,

&#x20;   Message=json.dumps(message),

&#x20;   Subject="New Order Event"

)

```



\---



\# 📦 Example Event



Example order event:



```json

{

&#x20;   "order\_id": "ORD99999",

&#x20;   "status": "created"

}

```



The producer sends this event only once to SNS.



SNS then distributes it to the subscribed queues.



\---



\# ⚙️ Order Consumer Microservice



The Order Consumer listens to:



```text

order-processing-queue

```



It continuously polls the SQS queue using:



```python

sqs.receive\_message()

```



When a message arrives, the service:



1\. Reads the SQS message.

2\. Parses the SNS notification.

3\. Extracts the original order event.

4\. Retrieves the `order\_id`.

5\. Retrieves the order `status`.

6\. Simulates order processing.

7\. Deletes the message after successful processing.



Example output:



```text

Order Consumer Service started...

Waiting for messages...



Received order event:

{'order\_id': 'ORD99999', 'status': 'created'}



Processing order ORD99999

Order status: created



Order ORD99999 processed successfully.

```



\---



\# 📦 Inventory Consumer Microservice



The Inventory Consumer listens to:



```text

inventory-update-queue

```



It performs similar message processing but represents a different microservice responsibility.



Example output:



```text

Inventory Consumer Service started...

Waiting for messages...



Received inventory event:

{'order\_id': 'ORD99999', 'status': 'created'}



Updating inventory for order ORD99999

Order status: created



Inventory updated for order ORD99999



Inventory event for ORD99999 processed successfully.

```



\---



\# 🔄 SNS Notification Envelope



Because \*\*Raw Message Delivery\*\* was disabled, the SQS queues receive an SNS notification envelope.



The actual order event is contained inside the `Message` field.



Example:



```json

{

&#x20;   "Type": "Notification",

&#x20;   "MessageId": "fdcc9d49-69f0-593d-8ca9-fe5ea672d5f8",

&#x20;   "TopicArn": "arn:aws:sns:us-east-1:027174261562:order-events-topic",

&#x20;   "Subject": "New Order Event",

&#x20;   "Message": "{\\"order\_id\\": \\"ORD99999\\", \\"status\\": \\"created\\"}"

}

```



The consumers therefore perform two JSON parsing operations:



```python

sns\_message = json.loads(message\["Body"])



order\_event = json.loads(sns\_message\["Message"])

```



This extracts the original application event.



\---



\# 🧪 Testing



Several order events were published during testing.



\## Test 1



```text

Order ID: ORD12345

Status: created

```



SNS successfully published the event.



\---



\## Test 2



```text

Order ID: ORD67890

Status: created

```



The event was successfully delivered to both SQS queues.



The Order Consumer processed:



```text

ORD67890

```



The Inventory Consumer also processed:



```text

ORD67890

```



\---



\## Test 3



```text

Order ID: ORD99999

Status: created

```



The event was successfully delivered to both queues.



The Order Consumer processed:



```text

Order ORD99999 processed successfully.

```



The Inventory Consumer processed:



```text

Inventory event for ORD99999 processed successfully.

```



\---



\# 🔀 Fan-Out Verification



The most important test was confirming that \*\*one SNS event reaches multiple SQS queues\*\*.



For example:



```text

Producer

&#x20;  │

&#x20;  │ ORD99999

&#x20;  ▼

SNS Topic

&#x20;  │

&#x20;  ├───────────────► Order Queue

&#x20;  │                     │

&#x20;  │                     ▼

&#x20;  │                Order Consumer

&#x20;  │

&#x20;  └───────────────► Inventory Queue

&#x20;                        │

&#x20;                        ▼

&#x20;                   Inventory Consumer

```



The same SNS `MessageId` was observed in both queues.



This confirmed that SNS successfully performed the fan-out operation.



\---



\# 🛠️ Troubleshooting



\## Python was not installed



Initially, running:



```powershell

python --version

```



returned a message indicating that Python was not available.



Python was subsequently installed manually.



The project was then able to use Python successfully.



\---



\## Installing Boto3



Boto3 was installed with:



```powershell

pip install boto3

```



The installed Boto3 package was verified with:



```powershell

pip show boto3

```



\---



\## SNS Subscription Error



While creating the second SNS subscription, the following error occurred:



```text

InvalidParameter - Invalid parameter: TopicArn

```



The subscription was retried using the correct SNS Topic ARN:



```text

arn:aws:sns:us-east-1:027174261562:order-events-topic

```



The subscription was then successfully confirmed.



\---



\## SNS Message Envelope



Initially, the SQS message contained the SNS notification wrapper rather than the original JSON event.



The consumer was updated to parse:



```text

SQS message

&#x20;     ↓

SNS notification

&#x20;     ↓

Message field

&#x20;     ↓

Original order event

```



This allowed the consumers to correctly process the event.



\---



\# 🔐 Security Considerations



No AWS credentials were hard-coded into the Python source code.



Boto3 uses the configured AWS credential environment/profile.



The project should follow the principle of least privilege when IAM permissions are configured.



For production systems, credentials should never be stored directly inside application source code.



\---



\# 📄 Requirements



The project requires Boto3.



`requirements.txt` contains:



```text

boto3

```



Install dependencies with:



```powershell

pip install -r requirements.txt

```



\---



\# ▶️ Running the Project



\## Start the Order Consumer



Open a PowerShell window:



```powershell

cd D:\\aws-devops-associate-to-professional\\day-22\\sns-sqs-microservices\\order-service

```



Run:



```powershell

python consumer.py

```



The service will display:



```text

Order Consumer Service started...

Waiting for messages...

```



\---



\## Start the Inventory Consumer



Open another PowerShell window:



```powershell

cd D:\\aws-devops-associate-to-professional\\day-22\\sns-sqs-microservices\\inventory-service

```



Run:



```powershell

python consumer.py

```



The service will display:



```text

Inventory Consumer Service started...

Waiting for messages...

```



\---



\## Run the Producer



Open another PowerShell window:



```powershell

cd D:\\aws-devops-associate-to-professional\\day-22\\sns-sqs-microservices\\producer

```



Run:



```powershell

python producer.py

```



Example:



```text

Message published successfully!

Message ID: fdcc9d49-69f0-593d-8ca9-fe5ea672d5f8

```



The event should then be delivered to both SQS queues.



\---



\# 📚 What I Learned



Through this project, I learned how to:



\* Create and configure an SNS topic.

\* Create Standard SQS queues.

\* Subscribe SQS queues to an SNS topic.

\* Implement an SNS publisher using Python and Boto3.

\* Implement SQS consumer microservices using Python and Boto3.

\* Understand asynchronous communication.

\* Understand the SNS fan-out pattern.

\* Process SNS notification envelopes.

\* Poll messages from SQS.

\* Delete SQS messages after successful processing.

\* Build loosely coupled microservices.

\* Troubleshoot AWS SNS and SQS configuration issues.

\* Verify asynchronous event delivery.



\---



\# 🧠 Key Concepts



\### Synchronous Communication



A service directly waits for another service to respond.



```text

Service A ─────► Service B

&#x20;       waits for response

```



\### Asynchronous Communication



A service sends an event and does not need to wait for every consumer.



```text

Producer

&#x20;  │

&#x20;  ▼

SNS

&#x20;  │

&#x20;  ├──► Queue A ──► Consumer A

&#x20;  │

&#x20;  └──► Queue B ──► Consumer B

```



This improves decoupling and allows services to process events independently.



\---



\# 🚀 Future Improvements



Possible improvements for a production-style version include:



\* Deploy consumers as AWS Lambda functions.

\* Add Amazon API Gateway.

\* Add Amazon DynamoDB or RDS for persistent data.

\* Add Dead Letter Queues (DLQs).

\* Configure CloudWatch monitoring and alarms.

\* Add message attributes for event filtering.

\* Enable SNS raw message delivery where appropriate.

\* Add structured application logging.

\* Add retry and failure-handling strategies.

\* Containerize the microservices with Docker.

\* Deploy the architecture using AWS CloudFormation or Terraform.

\* Build a CI/CD pipeline using AWS CodePipeline and CodeBuild.



\---



\# 🎯 Project Outcome



The project successfully demonstrates an \*\*event-driven microservices architecture using Amazon SNS and Amazon SQS\*\*.



A producer publishes an order event to SNS, and SNS distributes that event to multiple independent SQS queues.



Each consumer processes the event independently.



```text

&#x20;                   Order Event

&#x20;                        │

&#x20;                        ▼

&#x20;                 SNS Topic

&#x20;                 order-events

&#x20;                        │

&#x20;            ┌───────────┴───────────┐

&#x20;            ▼                       ▼

&#x20;      Order Queue             Inventory Queue

&#x20;            │                       │

&#x20;            ▼                       ▼

&#x20;     Order Consumer          Inventory Consumer

&#x20;            │                       │

&#x20;            ▼                       ▼

&#x20;     Order Processing        Inventory Update

```



This demonstrates how AWS messaging services can be used to create \*\*loosely coupled, scalable, and asynchronous microservices architectures\*\*.



\---



\## 👩‍💻 Author



\*\*Olaoluwiv\*\*



AWS DevOps Learning Journey



\*\*Day 22 — SNS \& SQS Asynchronous Microservices Communication\*\*



