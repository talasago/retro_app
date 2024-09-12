import pytest

from tests.test_helpers.functions.cors import assert_cors_headers

# functionで追加するテスト
# - 日本語になっているか？
# - カスタムバリデーションの場合とそうじゃない時
# キーが無い時（コメントが無い時）
# createSchemaでエラーの時
# Noneの時
# それぞれでWhenで分ける


@pytest.mark.usefixtures("db")
class TestCommentFunction:
    class TestAddComment:
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

        class TestInvalidParam:
            def test_return_401_when_invalid_access_token(
                self,
                call_api_with_invalid_access_token_assert_401,
                add_comment_api,
            ):
                call_api_with_invalid_access_token_assert_401(add_comment_api)

            def test_return_422_when_comment_is_empty(
                self, tokens_of_logged_in_api_common_user, add_comment_api
            ):
                comment_data: dict = {
                    "comment": "",
                }

                response = add_comment_api(
                    comment_data=comment_data,
                    access_token=tokens_of_logged_in_api_common_user[0],
                    is_assert_response_code_2xx=False,
                )
                assert response.status_code == 422
                assert response.json()["detail"][0]["msg"] == "必須項目です。"
