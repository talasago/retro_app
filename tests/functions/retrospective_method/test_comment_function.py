import pytest
from fastapi.testclient import TestClient
from httpx import Response

from app.functions.retrospective_method.comment import app as app_comment
from app.functions.user import app as app_user
from tests.test_helpers.functions.cors import assert_cors_headers

client_user = TestClient(app_user)
client_comment = TestClient(app_comment)


@pytest.fixture
def login_api():
    def _method(login_param: dict, is_return_response=False) -> Response | tuple:
        response: "Response" = client_user.post(
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


@pytest.fixture
def add_comment_api():
    def _method(
        comment_data: dict,
        access_token: str,
        retrospective_method_id=1,
        option: dict = {},
    ) -> Response:
        response = client_comment.post(
            f"/api/v1/retrospective_method/{retrospective_method_id}/comment",
            json=comment_data,
            headers={
                "accept": "application/json",
                "Authorization": f"Bearer {access_token}",
                "Origin": "http://localhost",
            },
        )
        assert response.status_code == 201
        assert_cors_headers(response)
        return response

    return _method


# TODO : ユーザ作成~ログイン周りの共通関数
@pytest.mark.usefixtures("db")
class TestCommentFunction:
    class TestAddComment:
        # TODO:TestLogin用のユーザーを作りたいなあ。毎回テストの中で作るのをやめたい。fixture使えばいいのか
        class TestValidParam:
            def test_return_201(self, add_user_api, login_api, add_comment_api):
                # 前処理
                user_data: dict = {
                    "email": "testcomment1@example.com",
                    "name": "Test Comment1",
                    "password": "testpassword",
                }
                add_user_api(user_data)

                login_user_data: dict = {
                    "username": user_data["email"],
                    "password": user_data["password"],
                }
                response = login_api(login_user_data, True)

                res_body = response.json()
                assert response.status_code == 200

                # 実行/検証
                comment_data: dict = {
                    "comment": "test comment",
                }
                add_comment_api(comment_data, res_body["access_token"])

                # TODO:コメントが実際に追加されているかどうかのテストは、コメント取得APIの時で代替する
