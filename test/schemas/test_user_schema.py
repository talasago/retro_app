import pytest
from app.schemas.user_schema import UserSchema as sut
from pydantic import ValidationError


class TestUserSchema:
    def test_valid_email(self):
        user_data: dict = {
            'name': 'John Doe',
            'email': 'johndoe@example.com',
        }

        user_params = sut(**user_data)

        assert user_params.name == 'John Doe'
        assert user_params.email == 'johndoe@example.com'

    def test_invalid_email(self):
        user_data: dict = {
            'name': 'John Doe',
            'email': 'invalid_email',
        }

        with pytest.raises(ValidationError):
            user_params = sut(**user_data)

            assert user_params is None
