import json

import pytest
from fastapi import status
from fastapi.exceptions import RequestValidationError
from pydantic.fields import Field
from pydantic_core import ValidationError

from app.functions.handlers import exception_handler_validation_error
from app.schemas.retrospective_method.comment_schema import CommentSchema


class TestExeptionHandler:
    # テスト観点
    # - errorの各項目が変更されている/されていないこと
    # - i18nのファイルにあるものは日本語で返ってきていること

    class TestWhenValidationError:
        @pytest.mark.asyncio
        async def test_exception_handler_validation_error(
            self,
        ):
            # MEMO:引数requestは使用してないのでテストしない。
            request = None
            exc = ValidationError.from_exception_data(
                title="CommentSchema",
                line_errors=[
                    # カスタムバリデーションのとき
                    {
                        "type": "value_error",
                        "loc": ("comment",),
                        "msg": "Value error, 必須項目です。",
                        "input": "",
                        "ctx": {"error": ValueError("必須項目です。")},
                        "url": "https://errors.pydantic.dev/2.9/v/value_error",
                    },  # type: ignore
                    # とくにerrorsを変更してない時
                    {
                        "type": "greater_than_equal",
                        "loc": ("retrospective_method_id",),
                        "msg": "Input should be greater than or equal to 1",
                        "input": 0,
                        "ctx": {"ge": 1},
                        "url": "https://errors.pydantic.dev/2.9/v/greater_than_equal",
                    },  # type: ignore
                ],
            )

            response = await exception_handler_validation_error(request, exc)  # type: ignore

            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
            res_body: dict = json.loads(response.body)

            assert res_body["detail"][0]["msg"] == "必須項目です。"
            assert res_body["detail"][0]["ctx"]["error"] == "必須項目です。"
            assert res_body["detail"][0]["input"] == ""
            assert res_body["detail"][1]["msg"] == "1 以上の値を入力してください。"
            assert res_body["detail"][1]["ctx"]["ge"] == 1
            assert res_body["detail"][1]["input"] == "0"

    class TestWhenRequestValidationError:
        @pytest.mark.asyncio
        async def test_exception_handler_validation_error(
            self,
        ):
            # MEMO:引数requestは使用してないのでテストしない。
            request = None
            # {}をAPIで渡すとき、passwordのとき
            exc = RequestValidationError(
                # bodyはテストに関係ないので指定しない。
                errors=[
                    {
                        "type": "string_type",
                        "loc": ("comment",),
                        "msg": "Input should be a valid string",
                        "input": Field(CommentSchema.model_fields["comment"]).default,
                        "url": "https://errors.pydantic.dev/2.9/v/string_type",
                    },
                    {
                        "type": "value_error",
                        "loc": ("body", "password"),
                        "msg": "Value error, パスワードには8文字以上の文字を入力してください。",
                        "input": "1234",
                        "ctx": {
                            "error": ValueError(
                                "パスワードには8文字以上の文字を入力してください。"
                            )
                        },
                    },
                ]
            )

            response = await exception_handler_validation_error(request, exc)  # type: ignore
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
            res_body: dict = json.loads(response.body)

            assert res_body["detail"][0]["msg"] == "有効な文字を入力してください。"
            # これ辞めたい
            assert (
                res_body["detail"][0]["input"]
                == "annotation=str required=True description='コメントの内容' examples=['テストコメント'] metadata=[MaxLen(max_length=100)]"
            )
            assert (
                res_body["detail"][1]["msg"]
                == "パスワードには8文字以上の文字を入力してください。"
            )
            assert (
                res_body["detail"][1]["ctx"]["error"]
                == "パスワードには8文字以上の文字を入力してください。"
            )
            assert res_body["detail"][1]["input"] == "[MASKED]"
