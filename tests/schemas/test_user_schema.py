import pytest
from pydantic import ValidationError

from app.schemas.translations.I18nTranslateWrapper import I18nTranslateWrapper
from app.schemas.user_schema import UserCreate, UserSchema

# FIXME:バリデーションのエラーメッセージも確認した方が良い
# ValidationErrorが返ってきているのはわかるが、なぜそうなったかの確認が足りない


class TestUserSchema:
    def test_email_format_valid(self):
        user_data: dict = {
            "name": "John Doe",
            "email": "johndoe1@example.com",
        }

        user_params = UserSchema(**user_data)

        assert user_params.name == "John Doe"
        assert user_params.email == "johndoe1@example.com"

    def test_email_format_invalid(self):
        user_data: dict = {
            "name": "John Doe",
            "email": "invalid_email",
        }

        with pytest.raises(ValidationError) as e:
            UserSchema(**user_data)

        # TODO:後で変更
        assert (
            e.value.errors()[0]["msg"]
            == "value is not a valid email address: The email address is not valid. It must have exactly one @-sign."
        )

    def test_email_null(self):
        user_data: dict = {
            "name": "email null",
        }

        with pytest.raises(ValidationError):
            UserSchema(**user_data)

        user_data_email_null: dict = {"name": "email null", "email": None}

        with pytest.raises(ValidationError):
            UserSchema(**user_data_email_null)

    def test_name_invalid_max_len(self):
        user_data: dict = {
            "name": "あ" * 51,
            "email": "johndoe1@example.com",
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
            "email": "johndoe1@example.com",
        }

        user_params = UserSchema(**user_data)

        assert user_params.name == "あ" * 24 + " 　" + "あ" * 24
        assert user_params.email == "johndoe1@example.com"

    def test_name_null(self):
        user_data: dict = {
            "name": None,
            "email": "johndoe1@example.com",
        }

        with pytest.raises(ValidationError):
            UserSchema(**user_data)

        del user_data["name"]

        with pytest.raises(ValidationError):
            UserSchema(**user_data)


class TestUserCreate:
    def test_password_null(self):
        user_data: dict = {
            "name": "John Doe",
            "email": "johndoe1@example.com",
        }

        with pytest.raises(ValidationError):
            UserCreate(**user_data)

        user_data["password"] = None

        with pytest.raises(ValidationError):
            UserCreate(**user_data)

    def test_password_invalid_length(self):
        user_data: dict = {
            "name": "John Doe",
            "email": "johndoe1@example.com",
            "password": "a" * 7,
        }

        with pytest.raises(ValidationError):
            UserCreate(**user_data)

        user_data["password"] = "a" * 51

        with pytest.raises(ValidationError):
            UserCreate(**user_data)

    def test_password_valid_length(self):
        user_data: dict = {
            "name": "John Doe",
            "email": "johndoe1@example.com",
            "password": "a" * 8,
        }

        user_params = UserSchema(**user_data)

        assert user_params.name == "John Doe"
        assert user_params.email == "johndoe1@example.com"

        user_data["password"] = "a" * 50

        user_params = UserSchema(**user_data)

        assert user_params.name == "John Doe"
        assert user_params.email == "johndoe1@example.com"

    def test_password_valid_format(self):
        user_data: dict = {
            "name": "John Doe",
            "email": "johndoe1@example.com",
            "password": "1sA!?_+*'\"`#$%&-^\\@;:,./=~|[](){}<>",
        }
        user_params = UserSchema(**user_data)

        assert user_params.name == "John Doe"
        assert user_params.email == "johndoe1@example.com"

    def test_password_invalid_format(self):
        user_data: dict = {
            "name": "John Doe",
            "email": "johndoe1@example.com",
            "password": "ＰＡＳＳＷＯＲＤ",
        }

        with pytest.raises(ValidationError):
            UserCreate(**user_data)
