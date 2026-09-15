import json
import boto3
import string
import random
import os

dynamodb = boto3.resource("dynamodb")

TABLE_NAME = os.environ.get("TABLE_NAME", "URLShortener")
table = dynamodb.Table(TABLE_NAME)


def generate_short_code(length=6):
    """Generate a random alphanumeric short code."""
    characters = string.ascii_letters + string.digits
    return "".join(random.choice(characters) for _ in range(length))


def lambda_handler(event, context):

    print("Received event:", json.dumps(event))

    http_method = event.get("httpMethod")

    # Handle POST request - Create short URL
    if http_method == "POST":

        try:
            body = json.loads(event.get("body", "{}"))
            long_url = body.get("long_url")

            if not long_url:
                return {
                    "statusCode": 400,
                    "body": json.dumps({
                        "error": "long_url is required"
                    })
                }

            short_code = generate_short_code()

            table.put_item(
                Item={
                    "short_code": short_code,
                    "long_url": long_url
                }
            )

            return {
                "statusCode": 201,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": json.dumps({
                    "message": "Short URL created successfully",
                    "short_code": short_code
                })
            }

        except Exception as error:

            print("Error:", str(error))

            return {
                "statusCode": 500,
                "body": json.dumps({
                    "error": "Internal server error"
                })
            }

    # Handle GET request - Redirect to original URL
    elif http_method == "GET":

        try:
            parameters = event.get("queryStringParameters") or {}
            short_code = parameters.get("short_code")

            if not short_code:
                return {
                    "statusCode": 400,
                    "body": json.dumps({
                        "error": "short_code is required"
                    })
                }

            response = table.get_item(
                Key={
                    "short_code": short_code
                }
            )

            if "Item" in response:

                long_url = response["Item"]["long_url"]

                return {
                    "statusCode": 301,
                    "headers": {
                        "Location": long_url
                    },
                    "body": ""
                }

            return {
                "statusCode": 404,
                "body": json.dumps({
                    "error": "Short URL not found"
                })
            }

        except Exception as error:

            print("Error:", str(error))

            return {
                "statusCode": 500,
                "body": json.dumps({
                    "error": "Internal server error"
                })
            }

    # Unsupported HTTP method
    return {
        "statusCode": 405,
        "body": json.dumps({
            "error": "Method not allowed"
        })
    }