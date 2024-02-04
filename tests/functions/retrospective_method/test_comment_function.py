import pytest

from tests.test_helpers.functions.cors import assert_cors_headers


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
