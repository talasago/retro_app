from typing import Any

import pytest
from pydantic import Field, ValidationError
from pydantic.fields import FieldInfo

from app.schemas.retrospective_method.comment_schema import CommentSchema
from app.schemas.translations.i18n_translate_wrapper import I18nTranslateWrapper
from tests.factories.retrospective_method.comment_factory import CommentFactory


class TestCommentSchema:
    @pytest.fixture(scope="function")
    def comment_data(self) -> dict[str, Any]:
        return CommentFactory().__dict__

    def test_valid_comment_data(self, comment_data):
        comment = CommentSchema(**comment_data)

        assert comment.comment == "This is a valid comment."
        assert comment.retrospective_method_id == 1
        assert comment.user_id == 1

    class TestComment:
        def test_invalid_comment_too_long(self, comment_data):
            comment_data["comment"] = "a" * 101  # 101文字のコメント

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "100 文字以下で入力してください。"
            )

        def test_missing_comment(self, comment_data):
            comment_data["comment"] = None

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "有効な文字を入力してください。"
            )

            comment_data.pop("comment")

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "必須項目です。"
            )

        def test_space_only(self, comment_data):
            comment_data["comment"] = " "
            with pytest.raises(ValidationError) as e1:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e1.value.errors())[0]["msg"]
                == "必須項目です。"
            )

            comment_data["comment"] = "　"
            with pytest.raises(ValidationError) as e2:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e2.value.errors())[0]["msg"]
                == "必須項目です。"
            )

        def test_not_str_class(self, comment_data):
            # {}をAPIで渡すとなぜかFieldがcommentデータに入っているのでその対応
            # pydanticの問題だと思うが...
            f_info: FieldInfo = Field(CommentSchema.model_fields["comment"]).default
            comment_data["comment"] = f_info

            with pytest.raises(ValidationError) as e2:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e2.value.errors())[0]["msg"]
                == "有効な文字を入力してください。"
            )

    class TestRetrospectiveMethodId:
        def test_invalid_retrospective_method_id(self, comment_data):
            comment_data["retrospective_method_id"] = "invalid_id"

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "有効な整数を入力してください。"
            )

        def test_missing_retrospective_method_id(self, comment_data):
            comment_data["retrospective_method_id"] = None

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "有効な整数を入力してください。"
            )

            comment_data.pop("retrospective_method_id")

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "必須項目です。"
            )

        def test_invalid_retrospective_method_id_too_low(self, comment_data):
            comment_data["retrospective_method_id"] = 0

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "1 以上の値を入力してください。"
            )

        def test_invalid_retrospective_method_id_too_high(self, comment_data):
            comment_data["retrospective_method_id"] = 73

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "72 以下の値を入力してください。"
            )

        def test_valid_retrospective_method_id_id_min_number(self, comment_data):
            comment_data["retrospective_method_id"] = 1

            comment = CommentSchema(**comment_data)

            assert comment.retrospective_method_id == 1

        def test_valid_retrospective_method_id_max_number(self, comment_data):
            comment_data["retrospective_method_id"] = 72

            comment = CommentSchema(**comment_data)

            assert comment.retrospective_method_id == 72

    class TestUserId:
        def test_invalid_user_id(self, comment_data):
            comment_data["user_id"] = "invalid_id"

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "有効な整数を入力してください。"
            )

        def test_missing_user_id(self, comment_data):
            comment_data["user_id"] = None

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "有効な整数を入力してください。"
            )

            comment_data.pop("user_id")

            with pytest.raises(ValidationError) as e:
                CommentSchema(**comment_data)

            assert (
                I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
                == "必須項目です。"
            )
