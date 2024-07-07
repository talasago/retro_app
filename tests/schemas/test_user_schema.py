import pytest
from pydantic import ValidationError

from app.schemas.translations.i18n_translate_wrapper import I18nTranslateWrapper
from app.schemas.user_schema import UserCreate, UserSchema


class TestUserSchema:
    def test_name_invalid_max_len(self):
        user_data: dict = {
            "name": "あ" * 51,
        }

        with pytest.raises(ValidationError) as e:
            UserSchema(**user_data)

        assert (
            I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
            == "50 文字以下で入力してください。"
        )

    def test_name_valid_max_len(self):
        user_data: dict = {
            "name": "  " + "あ" * 24 + " 　" + "あ" * 24 + "　　",
        }

        user_params = UserSchema(**user_data)

        assert user_params.name == "あ" * 24 + " 　" + "あ" * 24

    def test_name_null(self):
        user_data: dict = {
            "name": None,
        }

        with pytest.raises(ValidationError) as e1:
            UserSchema(**user_data)
        assert (
            I18nTranslateWrapper.trans(e1.value.errors())[0]["msg"]
            == "有効な文字を入力してください。"
        )

        del user_data["name"]

        with pytest.raises(ValidationError) as e2:
            UserSchema(**user_data)
        assert (
            I18nTranslateWrapper.trans(e2.value.errors())[0]["msg"] == "必須項目です。"
        )


class TestUserCreate:
    def test_password_null(self):
        user_data: dict = {
            "name": "John Doe",
            "password": None,
        }

        with pytest.raises(ValidationError) as e1:
            UserCreate(**user_data)
        assert (
            I18nTranslateWrapper.trans(e1.value.errors())[0]["msg"]
            == "有効な文字を入力してください。"
        )

        del user_data["name"]

        with pytest.raises(ValidationError) as e2:
            UserCreate(**user_data)
        assert (
            I18nTranslateWrapper.trans(e2.value.errors())[0]["msg"] == "必須項目です。"
        )

    def test_password_invalid_length(self):
        user_data: dict = {
            "name": "John Doe",
            "password": "a" * 7,
        }

        with pytest.raises(ValidationError) as e1:
            UserCreate(**user_data)
        assert (
            I18nTranslateWrapper.trans(e1.value.errors())[0]["msg"]
            == "パスワードには8文字以上の文字を入力してください。"
        )

        user_data["password"] = "a" * 51

        with pytest.raises(ValidationError) as e2:
            UserCreate(**user_data)
        assert (
            I18nTranslateWrapper.trans(e2.value.errors())[0]["msg"]
            == "パスワードには8文字以上の文字を入力してください。"
        )

    def test_password_valid_length(self):
        user_data: dict = {
            "name": "John Doe",
            "password": "a" * 8,
        }

        user_params = UserSchema(**user_data)

        assert user_params.name == "John Doe"

        user_data["password"] = "a" * 50
        user_params = UserSchema(**user_data)

        assert user_params.name == "John Doe"


    def test_password_valid_format(self):
        user_data: dict = {
            "name": "John Doe",
            "password": "1sA!?_+*'\"`#$%&-^\\@;:,./=~|[](){}<>",
        }
        user_params = UserSchema(**user_data)

        assert user_params.name == "John Doe"

    def test_password_invalid_format(self):
        user_data: dict = {
            "name": "John Doe",
            "password": "ＰＡＳＳＷＯＲＤ",
        }

        with pytest.raises(ValidationError) as e:
            UserCreate(**user_data)

        assert (
            I18nTranslateWrapper.trans(e.value.errors())[0]["msg"]
            == "パスワードには8文字以上の文字を入力してください。"
        )
