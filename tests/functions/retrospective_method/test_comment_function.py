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

        class TestInvalidParam:
            def test_return_401_when_invalid_access_token(
                self,
                call_api_with_invalid_access_token_assert_401,
                add_comment_api,
            ):
                call_api_with_invalid_access_token_assert_401(add_comment_api)

            @pytest.mark.parametrize(
                # expected_dataに直接書いてないテスト観点
                # i18nに沿った日本語に変換されていること
                ["input_param", "expected_data"],
                [
                    pytest.param(
                        {"comment": "", "retrospective_method_id": 1},
                        [422, "必須項目です。"],
                        id="When CreateSchema error",
                    ),
                    pytest.param(
                        {"comment": "comment", "retrospective_method_id": None},
                        [
                            422,
                            "有効な整数を入力してください。",
                        ],  # このパターンは実際にはフロントエンド側で発生しない想定
                        id="When CommentSchemaError error and retrospective_method_id is None",
                    ),
                ],
            )
            def test_return_422_by_validation_error(
                self,
                tokens_of_logged_in_api_common_user,
                add_comment_api,
                input_param,
                expected_data,
            ):

                response = add_comment_api(
                    comment_data={"comment": input_param["comment"]},
                    retrospective_method_id=input_param["retrospective_method_id"],
                    access_token=tokens_of_logged_in_api_common_user[0],
                    is_assert_response_code_2xx=False,
                )
                assert response.status_code == expected_data[0]
                assert response.json()["detail"][0]["msg"] == expected_data[1]

            class TestWhenRequiredParamIsNone:
                def test_return_422(
                    self,
                    tokens_of_logged_in_api_common_user,
                    add_comment_api,
                ):

                    response = add_comment_api(
                        comment_data=None,
                        access_token=tokens_of_logged_in_api_common_user[0],
                        is_assert_response_code_2xx=False,
                    )

                    assert response.status_code == 422
                    assert response.json()["detail"][0]["msg"] == "必須項目です。"
