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
