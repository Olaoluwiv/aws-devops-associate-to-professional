import boto3
import json

# Create SNS client
sns = boto3.client("sns", region_name="us-east-1")

# Your SNS topic
topic_arn = "arn:aws:sns:us-east-1:027174261562:order-events-topic"

# Order event
message = {
    "order_id": "ORD99999",
    "status": "created"
}

# Publish event to SNS
response = sns.publish(
    TopicArn=topic_arn,
    Message=json.dumps(message),
    Subject="New Order Event"
)

print("Message published successfully!")
print("Message ID:", response["MessageId"])