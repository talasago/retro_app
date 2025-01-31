import base64
import gzip
import json


def lambda_handler(event, context):
    print(event)
    decoded_data = base64.b64decode(event["awslogs"]["data"])
    print(decoded_data)
    json_data = json.loads(gzip.decompress(decoded_data))
    print(json_data)
    print(json_data["logEvents"][0]["message"])
