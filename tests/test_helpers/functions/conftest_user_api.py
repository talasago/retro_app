import pytest
from factories.user_factory import ApiCommonUserFactory
from fastapi.testclient import TestClient
from httpx import Response

from app.functions.user import app as app_user
from app.schemas.token_schema import TokenType

# MEMO:clientもどこかで共通化した方が良いかもしれない
client_user = TestClient(app_user)


@pytest.fixture(scope="session")
def add_user_api():
    def _method(
        user_data: dict, is_assert_response_code_2xx: bool = True, option: dict = {}
    ) -> Response:
        # TODO:user_dataが無ければこのメソッドで適当に作るようにしたい→呼び出し元で毎回dictを作りたくない。
        response = client_user.post("/api/v1/sign_up", json=user_data, **option)

        if is_assert_response_code_2xx:
            assert response.status_code == 201
        return response

    return _method


@pytest.fixture(scope="session")
def login_api():
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
        response: Response = client_user.post(
            "/token",
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
def refresh_token_api():
    def _method(refresh_token: str) -> Response:
        response: Response = client_user.post(
            "/refresh_token",
            headers={
                "accept": "application/json",
                "Authorization": f"Bearer {refresh_token}",
            },
        )
        return response

    return _method


@pytest.fixture(scope="session")
def logout_api():
    def _method(access_token: str) -> Response:
        response = client_user.post(
            "/api/v1/logout",
            headers={
                "accept": "application/json",
                "Authorization": f"Bearer {access_token}",
            },
        )
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
