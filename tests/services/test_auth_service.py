import pytest
from app.repository.user_repository import UserRepository
from app.services.auth_service import AuthService
from uuid import UUID, uuid4
from jose import jwt
from datetime import datetime, timedelta
from tests.test_helpers.create_test_user import create_test_user
from app.errors.retro_app_error import RetroAppValueError
from app.schemas.token_schema import TokenPayload

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
        # expect_token_typeとPayloadのtypeが一致しない
        # uuidで検索してユーザーが存在しない
        def test_valid(self, auth_service: AuthService, user_repo):
            """access_tokenをデコードしたuuidがユーザーと一致した場合、そのユーザーを返す"""
            test_user: 'UserModel' = create_test_user(user_repo)
            tokens = auth_service.generate_tokens(test_user.uuid)

            current_user: 'UserModel' = auth_service.get_current_user(tokens['access_token'])

            assert current_user.id == test_user.id

        class TestWhenInvalidTokenType:
            def test_raise_error(self, auth_service: AuthService, user_repo):
                """expect_token_typeが既定の値ではない場合例外を返す"""
                test_user: 'UserModel' = create_test_user(user_repo)

                tokens = auth_service.generate_tokens(test_user.uuid)

                with pytest.raises(ValueError) as e:
                    auth_service.get_current_user(token=tokens['access_token'],
                                                  expect_token_type='hoge')
                assert str(e.value) == 'Invalid expect_token_type: hoge'

        class TestWhenInvalidTokenInPayloadToken:
            def test_raise_error(self, auth_service: AuthService, user_repo):
                """デコードしたペイロードのTokenTypeとexpect_token_typeが一致していない場合、例外を返す"""
                test_user: 'UserModel' = create_test_user(user_repo)

                access_payload = TokenPayload(
                    token_type='refresh_token',
                    exp=datetime.utcnow() + timedelta(minutes=100),
                    uid=str(test_user.uuid),
                    jti=str(uuid4())
                )
                access_token: str = jwt.encode(claims=access_payload.model_dump(),
                                               key='secret_key', algorithm='HS256')

                with pytest.raises(RetroAppValueError) as e:
                    auth_service.get_current_user(token=access_token)
                assert str(e.value) == 'トークンタイプ不一致'

    class TestGenerateToken:
        # テスト観点
        # encodeが失敗したとき(?)
        def test_valid(self, auth_service: AuthService):
            """uuidが有効な値の場合、access_tokenとrefresh_tokenを返す"""
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

    class TestAuthenticate:
        # テスト観点
        # ユーザーが存在しない
        # パスワードが一致しない
        # どちらもフロントには同じエラー内容を返すこと。セキュリティのため
        class TestWhenValidParam:
            def test_return_authenticated_user(self, auth_service: AuthService, user_repo):
                """メールアドレスとパスワードが一致している場合、そのユーザーを返すこと"""
                user_params = {
                    'email': 'authenticate_user@example.com',
                    'password': 'qwsedfrtgyhujikolp;@:!234'
                }
                test_user: 'UserModel' = create_test_user(user_repo, **user_params)
                authenticated_user = auth_service.authenticate(**user_params)

                assert authenticated_user == test_user
                assert authenticated_user.email == user_params['email']
