import pytest
from factories.user_factory import ApiCommonUserFactory
from httpx import Response

from app.schemas.token_schema import TokenType


@pytest.fixture(scope="session")
def add_user_api(test_client):
    def _method(
        user_data: dict, is_assert_response_code_2xx: bool = True, option: dict = {}
    ) -> Response:
        response = test_client.post("/api/v1/sign_up", json=user_data, **option)

        if is_assert_response_code_2xx:
            assert response.status_code == 201
        return response

    return _method


@pytest.fixture(scope="session")
def login_api(test_client):
    """
    ログインパラメータを使用して '/token' エンドポイントに対して POST リクエストを実行します。

    Args:
        login_param (dict): リクエストで送信するログインパラメータ。
        is_return_response (bool, optional): レスポンスオブジェクトを返すかどうか。デフォルトは False です。
        is_assert_response_code_2xx (bool, optional): レスポンスのステータスコードが 2xx であることをassertするかどうか。デフォルトは True です。

    Returns:
        Response | tuple[str, str]: 'is_return_response' が True の場合はレスポンスオブジェクト、それ以外の場合はアクセストークンとリフレッシュトークンを含むタプルを返します。
    """

    def _method(
        login_param: dict, is_return_response=False, is_assert_response_code_2xx=True
    ) -> Response | tuple[str, str]:
        response: Response = test_client.post(
            "/api/v1/token",
            headers={
                "accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data=login_param,
        )
        res_body = response.json()
        if is_assert_response_code_2xx:
            assert response.status_code == 200

        if is_return_response:
            return response
        else:
            return (
                res_body[TokenType.ACCESS_TOKEN.value],
                res_body[TokenType.REFRESH_TOKEN.value],
            )

    return _method


@pytest.fixture(scope="session")
def refresh_token_api(test_client):
    def _method(refresh_token: str, is_include_headers=True) -> Response:
        headers = (
            {
                "accept": "application/json",
                "Authorization": f"Bearer {refresh_token}",
            }
            if is_include_headers
            else {}
        )
        response: Response = test_client.post(
            "/api/v1/refresh_token",
            headers=headers,
        )
        return response

    return _method


@pytest.fixture(scope="session")
def logout_api(test_client):
    def _method(
        access_token: str,
        is_assert_response_code_2xx: bool = True,
    ) -> Response:
        response = test_client.post(
            "/api/v1/logout",
            headers={
                "accept": "application/json",
                "Authorization": f"Bearer {access_token}",
            },
        )
        if is_assert_response_code_2xx:
            assert response.status_code == 200
        return response

    return _method


@pytest.fixture(scope="session")
def tokens_of_logged_in_api_common_user(add_user_api, login_api) -> tuple[str, str]:
    """
    ログイン済みのAPI共通ユーザーのアクセストークンとリフレッシュトークンを返します。
    """
    api_common_user: dict = ApiCommonUserFactory()
    add_user_api(user_data=api_common_user)
    access_token, refresh_token = login_api(login_param=api_common_user)
    return (access_token, refresh_token)
