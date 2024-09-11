from typing import Any

import pytest
from pydantic import ValidationError

from app.schemas.retrospective_method.comment_schema import CommentSchema
from app.schemas.translations.i18n_translate_wrapper import I18nTranslateWrapper


class TestCommentSchema:
    # 先にcomment_dataをfixtureで定義しててもいいかも。
    def test_valid_comment_data(self):
        comment_data: dict[str, Any] = {
            "comment": "This is a valid comment.",
            "retrospective_method_id": 1,
            "user_id": 1,
        }

        comment = CommentSchema(**comment_data)

        assert comment.comment == "This is a valid comment."
        assert comment.retrospective_method_id == 1
        assert comment.user_id == 1

    class TestComment:
        def test_invalid_comment_too_long(self):
            comment_data: dict[str, Any] = {
                "comment": "a" * 101,  # 101文字のコメント
                "retrospective_method_id": 1,
                "user_id": 1,
            }

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "100 文字以下で入力してください。"
            )

        def test_missing_comment(self):
            comment_data: dict[str, Any] = {
                "retrospective_method_id": 1,
                "user_id": 1,
            }

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "必須項目です。"
            )

    class TestRetrospectiveMethodId:
        def test_invalid_retrospective_method_id(self):
            comment_data: dict[str, Any] = {
                "comment": "This is a valid comment.",
                "retrospective_method_id": "invalid_id",  # 無効なID
                "user_id": 1,
            }

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "有効な整数を入力してください。"
            )

        def test_missing_retrospective_method_id(self):
            comment_data: dict[str, Any] = {
                "comment": "This is a valid comment.",
                "user_id": 1,
            }

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "必須項目です。"
            )

        def test_invalid_retrospective_method_id_too_low(self):
            comment_data: dict[str, Any] = {
                "comment": "This is a valid comment.",
                "retrospective_method_id": 0,
                "user_id": 1,
            }

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "1 以上の値を入力してください。"
            )

        def test_invalid_retrospective_method_id_too_high(self):
            comment_data: dict[str, Any] = {
                "comment": "This is a valid comment.",
                "retrospective_method_id": 73,
                "user_id": 1,
            }

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "72 以下の値を入力してください。"
            )

        def test_valid_retrospective_method_id_id_min_number(self):
            comment_data: dict[str, Any] = {
                "comment": "This is a valid comment.",
                "retrospective_method_id": 1,
                "user_id": 1,
            }

            comment = CommentSchema(**comment_data)

            assert comment.retrospective_method_id == 1

        def test_valid_retrospective_method_id_max_number(self):
            comment_data: dict[str, Any] = {
                "comment": "This is a valid comment.",
                "retrospective_method_id": 72,
                "user_id": 1,
            }

            comment = CommentSchema(**comment_data)

            assert comment.retrospective_method_id == 72

    class TestUserId:
        def test_invalid_user_id(self):
            comment_data: dict[str, Any] = {
                "comment": "This is a valid comment.",
                "retrospective_method_id": 1,
                "user_id": "invalid_id",
            }

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "有効な整数を入力してください。"
            )

        def test_missing_user_id(self):
            comment_data: dict[str, Any] = {
                "comment": "This is a valid comment.",
                "retrospective_method_id": 1,
            }

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "必須項目です。"
            )
