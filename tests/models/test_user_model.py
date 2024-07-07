from uuid import uuid4

import pytest

from app.models.user_model import UserModel


class TestUserModel:
    class TestPassword:
        class TestWhenValidParam:
            def test_hashed_password_and_plain_password_do_not_match(self):
                user_data: dict = {
                    "name": "John Doe",
                    "password": "Passw0rd#123",
                }
                user = UserModel(**user_data)

                assert user.hashed_password != user_data["password"]

            # fmt: off
            def test_hashed_password_must_be_verified_and_match_plain_password(self):
            # fmt: on
                user_data: dict = {
                    "name": "John Doe",
                    "password": "Passw0rd#123",
                }
                user = UserModel(**user_data)

                assert user.is_password_matching(plain_password=user_data["password"])

        class TestWhenInvalidParam:
            def test_hashed_password_must_be_verified_and_not_match(self):
                user_data: dict = {
                    "name": "John Doe",
                    "password": "Passw0rd#123",
                }
                user = UserModel(**user_data)

                assert (
                    user.is_password_matching(plain_password="invalid_password")
                    is False
                )

            # fmt: off
            def test_return_false_when_hashed_password_and_param_are_none(self):
            # fmt: on
                user_data: dict = {
                    "name": "John Doe",
                }
                user = UserModel(**user_data)

                assert user.is_password_matching(plain_password=None) is False  # type: ignore

            def test_raise_error_when_password_is_none(self):
                user_data: dict = {
                    "name": "John Doe",
                    "password": None,
                }

                # 自前実装せずともエラーとなる。Noneになる可能性はユースケース的にありえない &&
                # Noneになって処理が続くのはまずいので、エラーになるでヨシ！
                with pytest.raises(TypeError):
                    UserModel(**user_data)

    class TestPropertyExceptPassword:
        def test_set_uuid_expect_error(self):
            user_data: dict = {
                "name": "John Doe",
                "password": "Passw0rd#123",
            }
            user = UserModel(**user_data)

            with pytest.raises(AttributeError):
                user.uuid = uuid4()  # type: ignore

        def test_init_uuid_expect_error(self):
            user_data: dict = {"uuid": uuid4()}

            with pytest.raises(AttributeError):
                UserModel(**user_data)

        def test_set_id_expect_error(self):
            user_data: dict = {
                "name": "John Doe",
                "password": "Passw0rd#123",
            }
            user = UserModel(**user_data)

            with pytest.raises(AttributeError):
                user.id = 100  # type: ignore

        def test_init_id_expect_error(self):
            user_data: dict = {"id": 10}

            with pytest.raises(AttributeError):
                UserModel(**user_data)
