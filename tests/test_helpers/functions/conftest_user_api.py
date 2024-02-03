import pytest
from fastapi.testclient import TestClient
from httpx import Response

from app.functions.user import app as app_user

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

# responseが200系であることの検証を追加する

@pytest.fixture(scope="session")
def login_api():
    # MEMO: is_return_responseは削除してもいいんじゃないか感
    # responseが欲しいのか、それともtokenが欲しいかで関心ごとが違うのか
    # MEMO: tupleで返すときは何を返すかの型ヒントが良いかもしれない。TokenType
    # FIXME:is_return_responseの引数名とデフォルト引数を考える。他のapi()に合わせて、通常はresponseを返すようにする
    def _method(login_param: dict, is_return_response=False) -> Response | tuple:
        response: Response = client_user.post(
            "/token",
            headers={
                "accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data=login_param,
        )

        if is_return_response:
            return response

        res_body = response.json()
        return res_body["access_token"], res_body["refresh_token"]

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
