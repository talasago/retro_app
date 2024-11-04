import os
import uuid

import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry


class LineApiClient:
    ACCSESS_TOKEN = os.environ["LINE_ACCESS_TOKEN"]

    def __init__(self) -> None:
        self.session = requests.Session()
        retries = Retry(
            total=3,
            backoff_factor=1,  # sleep時間
            # timeout以外でリトライするステータスコード
            status_forcelist=[500, 502, 503, 504],
        )
        self.session.mount("https://", HTTPAdapter(max_retries=retries))

    def send_text_message(
        self,
        to: str,
        message: str,
        notification_disabled=False,
        custom_aggregation_units: list[str] = [],
    ):
        URL = "https://api.line.me/v2/bot/message/push"  # noqa: N806

        # FIXME:ここからprivateメソッドにする
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.ACCSESS_TOKEN}",
            "X-Line-Retry-Key": str(uuid.uuid4()),
        }

        hoge = self.LineTextMessage(text=message)
        ffmessage = hoge.message
        payload = {
            "to": to,
            "messages": [ffmessage],
            "notificationDisabled": notification_disabled,
        }
        if custom_aggregation_units != []:
            payload["customAggregationUnits"] = custom_aggregation_units

        response = self.session.post(URL, headers=headers, json=payload,)
        res_json = response.json()
        print("response", res_json)
        response.raise_for_status()
        return res_json

    @staticmethod
    def get_admin_userid() -> str:
        return os.environ["LINE_ADMIN_USER_ID"]

    # FIXME:dataclassを使ってもいいかも??それかpydentic。
    # apischemaを定義したいかも
    class LineTextMessage:
        def __init__(self, text: str) -> None:
            self.message = {"type": "text", "text": text}
