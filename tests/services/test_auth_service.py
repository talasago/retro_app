import pytest
from unittest.mock import Mock
from app.repository.user_repository import UserRepository
from app.services.auth_service import AuthService
from uuid import UUID


@pytest.fixture()
def auth_service() -> AuthService:
    return AuthService(Mock(spec=UserRepository))


@pytest.mark.usefixtures('auth_service')
class TestAuthService:
    class TestGetCurrentUser:
        # テスト観点
        # expect_token_typeが規定の値ではない
        # expect_token_typeとPayloadのtypeが一致しない
        # uuidで検索してユーザーが存在しない
        @pytest.mark.skip
        def test_hoge(self):
            # tokenを準備する
            # - どのようなトークン？generate_tokenを呼び出す
            # UserRepositoryをモック化するfind_by()
            pass

    class TestGenerateToken:
        # テスト観点
        # Noneを渡したとき
        # encodeが失敗したとき(?)
        def test_valid(self, auth_service: AuthService):
            test_uuid: UUID = UUID('a49b19ec-ed16-4416-81ea-b6a9d029baef')
            tokens = auth_service.generate_tokens(test_uuid)

            assert tokens['access_token']
            assert tokens['refresh_token']
            assert tokens['token_type'] == 'bearer'
