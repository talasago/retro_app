import pytest
from app.schemas.user_schema import UserSchema as sut
from pydantic import ValidationError


class TestUserSchema:
    def test_email_format_valid(self):
        user_data: dict = {
            'name': 'John Doe',
            'email': 'johndoe1@example.com',
        }

        user_params = sut(**user_data)

        assert user_params.name == 'John Doe'
        assert user_params.email == 'johndoe1@example.com'

    def test_email_format_invalid(self):
        user_data: dict = {
            'name': 'John Doe',
            'email': 'invalid_email',
        }

        with pytest.raises(ValidationError):
            user_params = sut(**user_data)

            assert user_params is None

    def test_email_null(self):
        user_data: dict = {
            'name': 'email null',
        }

        with pytest.raises(ValidationError):
            user_params = sut(**user_data)

            assert user_params is None

        user_data: dict = {
            'name': 'email null',
            'email': None
        }

        with pytest.raises(ValidationError):
            user_params = sut(**user_data)

            assert user_params is None
