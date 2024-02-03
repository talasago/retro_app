import pytest

from tests.test_helpers.functions.cors import assert_cors_headers


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
                response = add_comment_api(comment_data, res_body["access_token"])
                assert_cors_headers(response)

                # TODO:コメントが実際に追加されているかどうかのテストは、コメント取得APIの時で代替する
