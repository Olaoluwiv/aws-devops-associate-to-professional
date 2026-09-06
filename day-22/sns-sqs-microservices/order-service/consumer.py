import boto3
import json

# Create SQS client
sqs = boto3.client("sqs", region_name="us-east-1")

# Order processing queue
queue_url = "https://sqs.us-east-1.amazonaws.com/027174261562/order-processing-queue"


def process_messages():
    print("Order Consumer Service started...")
    print("Waiting for messages...")

    while True:

        response = sqs.receive_message(
            QueueUrl=queue_url,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=10
        )

        if "Messages" in response:

            for message in response["Messages"]:

                try:
                    # Parse the SNS notification
                    sns_message = json.loads(message["Body"])

                    # Extract the actual order event
                    order_event = json.loads(sns_message["Message"])

                    print("\nReceived order event:")
                    print(order_event)

                    order_id = order_event["order_id"]
                    status = order_event["status"]

                    print(f"Processing order {order_id}")
                    print(f"Order status: {status}")

                    # Delete message after successful processing
                    sqs.delete_message(
                        QueueUrl=queue_url,
                        ReceiptHandle=message["ReceiptHandle"]
                    )

                    print(f"Order {order_id} processed successfully.")

                except Exception as error:
                    print(f"Error processing message: {error}")


if __name__ == "__main__":
    process_messages()