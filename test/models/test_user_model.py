import pytest
from uuid import uuid4
from app.models.user_model import UserModel


class TestUserModel:
    def test_hashed_password_and_plain_password_do_not_match(self):
        user_data: dict = {
            'name': 'John Doe',
            'email': 'invalid_email',
            'password': 'Passw0rd#123'
        }
        user = UserModel(**user_data)

        assert user.hashed_password != user_data['password']

    def test_hashed_password_must_be_verified_and_match_plain_password(self):
        user_data: dict = {
            'name': 'John Doe',
            'email': 'invalid_email',
            'password': 'Passw0rd#123'
        }
        user = UserModel(**user_data)

        assert user.is_password_matching(plain_password=user_data['password'])

    def test_hashed_password_must_be_verified_and_not_matched__when_wrong_plain_password_is_used(self):
        user_data: dict = {
            'name': 'John Doe',
            'email': 'invalid_email',
            'password': 'Passw0rd#123'
        }
        user = UserModel(**user_data)

        assert user.is_password_matching(plain_password='invalid_password') is False

    # TODO:引数がstrじゃない時のテストを追加したい。その時はエラーにしたい。passlib側で実装されてるかもだが。
    # TestPasswordHelperのバリデーションはpydantic使った方が楽なのだろうか？

    def test_set_uuid_expect_error(self):
        user_data: dict = {
            'name': 'John Doe',
            'email': 'invalid_email',
            'password': 'Passw0rd#123',
        }
        user = UserModel(**user_data)

        with pytest.raises(AttributeError):
            user.uuid = uuid4()  # type: ignore

    def test_init_uuid_expect_error(self):
        user_data: dict = {'uuid': uuid4()}

        with pytest.raises(AttributeError):
            UserModel(**user_data)
