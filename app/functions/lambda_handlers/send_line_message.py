import base64
import gzip
import json

from app.services.notification_service import NotificationService


def lambda_handler(event, context):
    decoded_data = base64.b64decode(event["awslogs"]["data"])
    json_data = json.loads(gzip.decompress(decoded_data))

    # 2回以上同じログの入力があるかわかっていない。一応配列なのでforで回す
    for log in json_data["logEvents"]:
        message = log["message"]["comment_data"]

        NotificationService.send_message_admin(message)
