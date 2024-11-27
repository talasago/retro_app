from typing import Callable

import pytest
from httpx import Response

from app.schemas.token_schema import TokenType
from tests.test_helpers.token import generate_test_token


@pytest.fixture(scope="session")
def call_api_with_invalid_access_token_assert_401():
    """
    テスト用の無効なアクセストークンを生成し、API呼び出しのためのメソッドを実行し、401エラーが返ってくることを確認する。

    Args:
        method_for_calling_api (Callable): API呼び出しのためのメソッド

    Returns:
        None
    """

    def _method(method_for_calling_api: Callable, **kwargs) -> None:
        """デコードしたペイロードのuuidがuuidの形式でない場合、エラーを返す"""
        token: str = generate_test_token(TokenType.ACCESS_TOKEN, "dummy")
        response: Response = method_for_calling_api(
            access_token=token, is_assert_response_code_2xx=False, **kwargs
        )

        assert response.status_code == 401
        assert response.json() == {"detail": "Tokenが間違っています。"}
        assert response.headers["www-authenticate"] == "Bearer"

    return _method
