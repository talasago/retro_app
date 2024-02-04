import pytest

from tests.test_helpers.functions.cors import assert_cors_headers


# TODO : ユーザ作成~ログイン周りの共通関数
@pytest.mark.usefixtures("db")
class TestCommentFunction:
    class TestAddComment:
        # TODO:TestLogin用のユーザーを作りたいなあ。毎回テストの中で作るのをやめたい。fixture使えばいいのか
        class TestValidParam:
            def test_return_201(
                self, tokens_of_logged_in_api_common_user, add_comment_api
            ):
                comment_data: dict = {
                    "comment": "test comment",
                }

                response = add_comment_api(
                    comment_data=comment_data,
                    access_token=tokens_of_logged_in_api_common_user[0],
                )
                assert_cors_headers(response)

                # TODO:コメントが実際に追加されているかどうかのテストは、コメント取得APIの時で代替する
