import os
import uuid
from dataclasses import dataclass

import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry


class LineApiClient:
    ACCSESS_TOKEN = os.environ["LINE_ACCESS_TOKEN"]
    API_BASE_URL = "https://api.line.me"
    API_SEND_PUSH_MESSAGE_URL = f"{API_BASE_URL}/v2/bot/message/push"

    def __init__(self) -> None:
        self.session = requests.Session()
        retries = Retry(
            total=3,
            backoff_factor=1,  # sleep時間
            # timeout以外でリトライするステータスコード
            status_forcelist=[500, 502, 503, 504],
        )
        self.session.mount("https://", HTTPAdapter(max_retries=retries))

    # NOTE:一旦単数メッセージのみ対応
    def send_text_message(
        self,
        to: str,
        message: str,
        notification_disabled=False,
    ):
        payload = self.__generate_payload(
            to, message, notification_disabled
        )

        return self.__send_request(
            url=self.API_SEND_PUSH_MESSAGE_URL,
            headers=self.__generate_headers(),
            payload=payload,
        )

    @staticmethod
    def get_admin_userid() -> str:
        return os.environ["LINE_ADMIN_USER_ID"]

    def __generate_headers(self) -> dict[str, str]:
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.ACCSESS_TOKEN}",
            "X-Line-Retry-Key": str(uuid.uuid4()),
        }

    def __generate_payload(
        self,
        to: str,
        message: str,
        notification_disabled: bool,
    ) -> dict:
        line_message = LineTextMessage(text=message)
        payload = LineSendPushMessage(
            to=to,
            messages=[line_message],
            notification_disabled=notification_disabled,
        )
        return payload.to_dict()

    def __send_request(self, url: str, headers: dict[str, str], payload: dict):
        response = self.session.post(
            url,
            headers=headers,
            json=payload,
        )
        res_json = response.json()
        print("response", res_json)
        response.raise_for_status()
        return res_json


@dataclass
class LineTextMessage:
    text: str
    type: str = "text"

    def to_dict(self) -> dict[str, str]:
        return {
            "type": self.type,
            "text": self.text,
        }


@dataclass
class LineSendPushMessage:
    to: str
    messages: list[LineTextMessage]
    notification_disabled: bool = False

    def to_dict(self) -> dict:
        return {
            "to": self.to,
            "messages": [message.to_dict() for message in self.messages],
            "notificationDisabled": self.notification_disabled,
        }
