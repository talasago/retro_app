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
                    is_assert_response_code_2xx=True,
                )
                assert_cors_headers(response)
                assert response.json() == {"message": "コメントを登録しました。"}

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

    class TestGetComment:
        @pytest.fixture(scope="class")
        def sut(self, get_comment_api):
            return get_comment_api

        @pytest.fixture(scope="class", autouse=True)
        def create_comment(self, add_comment_api, tokens_of_logged_in_api_common_user):
            comments = [
                {"comment": "test comment"},
                {"comment": "test comment2"},
                {"comment": "test comment3"},
            ]

            for comment_data in comments:
                add_comment_api(
                    comment_data=comment_data,
                    retrospective_method_id=5,
                    access_token=tokens_of_logged_in_api_common_user[0],
                    is_assert_response_code_2xx=True,
                )

        class WhenDuringLogin:
            def test_return_200(self, sut):
                response = sut(
                    retrospective_method_id=5, is_assert_response_code_2xx=False
                )

                assert_cors_headers(response)
                comments = response.json()["comments"]
                assert response.status_code == 200
                assert comments["comment"] == "test comment"
                assert comments["comment"] == "test comment2"
                assert comments["comment"] == "test comment3"
                for comment in response.json():
                    assert "user" not in comment
                    assert comment["retrospective_method_id"] == 5

        class WhenNotLogin:
            def test_return_200(self, sut, tokens_of_logged_in_api_common_user):
                response = sut(
                    access_token=tokens_of_logged_in_api_common_user[0],
                    retrospective_method_id=5,
                    is_assert_response_code_2xx=False,
                )

                assert_cors_headers(response)
                comments = response.json()["comments"]
                assert response.status_code == 200
                assert comments["comment"] == "test comment"
                assert comments["comment"] == "test comment2"
                assert comments["comment"] == "test comment3"
                for comment in response.json():
                    assert "user" not in comment
                    assert comment["retrospective_method_id"] == 5

        class WhenNotMatchRetrospectiveMethodId:
            def test_return_200(self, sut):
                response = sut(
                    retrospective_method_id=999, is_assert_response_code_2xx=False
                )

                assert_cors_headers(response)
                comments = response.json()["comments"]
                assert response.status_code == 200
                assert comments == []

        # パラメータが数値以外の時。
