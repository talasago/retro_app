from unittest.mock import patch

import pytest

from app.clients.line_api_client import LineApiClient


@pytest.fixture(scope="module")
def sut():
    return LineApiClient()


class TestSendTextMessage:
    def test_normal_pattern(self, sut):
        with patch("requests.Session.post") as mock_post:
            to = "test_user_id"
            message = "Hello, World!"
            notification_disabled = False

            sut.send_text_message(
                to=to, message=message, notification_disabled=notification_disabled
            )
            actual_headers = mock_post.call_args[1]["headers"]
            actual_json = mock_post.call_args[1]["json"]

            actual_headers.pop(
                "X-Line-Retry-Key", None
            )  # X-Line-Retry-Keyはランダムなので削除
            expected_headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer DAMMY_ACCESS_TOKEN",
            }
            assert actual_headers == expected_headers
            assert actual_json == {
                "to": to,
                "messages": [{"type": "text", "text": message}],
                "notificationDisabled": notification_disabled,
            }

    # 他のテスト観点：500, 502, 503, 504、409ステータスコードが返ってきた場合のリトライ処理のテスト
    # リトライ処理で同じuuidを使っているか
    # →Line側の仕様のテストな気がしてきたので一旦対応しない
