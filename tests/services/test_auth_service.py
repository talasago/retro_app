import pytest
from app.repository.user_repository import UserRepository
from app.services.auth_service import AuthService
from uuid import UUID
from tests.test_helpers.create_test_user import create_test_user

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from sqlalchemy.orm import Session
    from app.models.user_model import UserModel


@pytest.fixture()
def auth_service(db: 'Session') -> AuthService:
    return AuthService(UserRepository(db))


class TestAuthService():
    class TestGetCurrentUser:
        # テスト観点
        # expect_token_typeが規定の値ではない
        # expect_token_typeとPayloadのtypeが一致しない
        # uuidで検索してユーザーが存在しない
        def test_valid(self, auth_service: AuthService, user_repo):
            test_user: 'UserModel' = create_test_user(user_repo)
            tokens = auth_service.generate_tokens(test_user.uuid)

            current_user: 'UserModel' = auth_service.get_current_user(tokens['access_token'])

            assert current_user.id == test_user.id

    class TestGenerateToken:
        # テスト観点
        # encodeが失敗したとき(?)
        def test_valid(self, auth_service: AuthService):
            test_uuid: UUID = UUID('a49b19ec-ed16-4416-81ea-b6a9d029baef')
            tokens = auth_service.generate_tokens(test_uuid)

            assert tokens['access_token']
            assert tokens['refresh_token']
            assert tokens['token_type'] == 'bearer'

        class TestWhenUUIDIsNone:
            def test_raise_error(self, auth_service: AuthService):
                """uuidがNoneの場合は例外を返す"""
                with pytest.raises(TypeError) as e:
                    auth_service.generate_tokens(None)  # type: ignore

                assert str(e.value) == 'user_uuid must be other than None'
