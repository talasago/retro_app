from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING

import pytest

from app.errors.retro_app_error import (
    RetroAppAuthenticationError,
    RetroAppRecordNotFoundError,
    RetroAppTokenExpiredError,
)
from app.repository.user_repository import UserRepository
from app.schemas.token_schema import TokenType
from app.services.auth_service import AuthService
from tests.test_helpers.create_test_user import create_test_user
from tests.test_helpers.token import generate_test_token

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

    from app.models.user_model import UserModel


@pytest.fixture()
def auth_service(db: "Session") -> AuthService:
    return AuthService(UserRepository(db))


class TestAuthService:
    class TestGetCurrentUser:
        @pytest.mark.smoke
        def test_valid(self, auth_service: AuthService, user_repo):
            """access_tokenをデコードしたuuidがユーザーと一致した場合、そのユーザーを返す"""
            test_user: "UserModel" = create_test_user(user_repo)
            tokens = auth_service.create_tokens(user=test_user)

            current_user: "UserModel" = auth_service.get_current_user(
                tokens["access_token"]
            )

            assert current_user.id == test_user.id

        class TestWhenInvalidTokenType:
            def test_raise_error(self, auth_service: AuthService, user_repo):
                """expect_token_typeが既定の値ではない場合例外を返す"""
                test_user: "UserModel" = create_test_user(user_repo)

                tokens = auth_service.create_tokens(user=test_user)

                with pytest.raises(ValueError) as e:
                    auth_service.get_current_user(
                        token=tokens["access_token"], expect_token_type="hoge"
                    )
                assert str(e.value) == "Invalid expect_token_type: hoge"

        class TestWhenInvalidTokenInPayloadToken:
            def test_raise_error(self, auth_service: AuthService, user_repo):
                """デコードしたペイロードのTokenTypeとexpect_token_typeが一致していない場合、例外を返す"""
                test_user: "UserModel" = create_test_user(user_repo)
                refresh_token = generate_test_token(
                    token_type=TokenType.REFRESH_TOKEN, user_uuid=test_user.uuid
                )

                with pytest.raises(RetroAppAuthenticationError) as e:
                    auth_service.get_current_user(token=refresh_token)
                assert str(e.value) == "TokenTypeが一致しません。"

        class TestWhenInvalidTokenWithNotUuid:
            def test_raise_error(self, auth_service: AuthService):
                """デコードしたペイロードのuuidがuuidの形式でない場合、例外を返す"""
                invalid_token = generate_test_token(
                    token_type=TokenType.ACCESS_TOKEN, user_uuid="hoge"
                )

                with pytest.raises(RetroAppAuthenticationError) as e:
                    auth_service.get_current_user(token=invalid_token)
                assert str(e.value) == "uuidの形式が正しくありません。"

        class TestWhenNotExistUserUUID:
            def test_raise_error(self, auth_service: AuthService):
                """デコードしたペイロードのuuidで検索した結果、レコードが無い場合は例外を返す"""
                access_token = generate_test_token(token_type=TokenType.ACCESS_TOKEN)

                with pytest.raises(RetroAppRecordNotFoundError) as e:
                    auth_service.get_current_user(token=access_token)
                assert str(e.value) == "条件に合致するレコードは存在しません。"

        class TestWhenExpiredToken:
            # リフレッシュトークンの場合もテストする
            def test_raise_error(self, auth_service: AuthService):
                """有効期限切れの場合エラーとなること"""

                expired_access_token = generate_test_token(
                    token_type=TokenType.ACCESS_TOKEN,
                    exp=datetime.now(timezone.utc) - timedelta(minutes=100),
                )

                with pytest.raises(RetroAppTokenExpiredError) as e:
                    auth_service.get_current_user(token=expired_access_token)
                # assert str(e.value) == 'ログイン有効期間を過ぎています。再度ログインしてください。'
                assert str(e.value) == "Signature has expired"

    class TestGetCurrentUserFromRefreshToken:
        class TestWhenValidParam:
            @pytest.mark.smoke
            def test_return_current_user(self, auth_service: AuthService, user_repo):
                test_user: "UserModel" = create_test_user(user_repo)
                refresh_token: str = generate_test_token(
                    token_type=TokenType.REFRESH_TOKEN, user_uuid=test_user.uuid
                )
                test_user.refresh_token = refresh_token
                user_repo.save(test_user)

                current_user: "UserModel" = (
                    auth_service.get_current_user_from_refresh_token(
                        refresh_token=refresh_token
                    )
                )

                assert current_user.id == test_user.id
                assert current_user.refresh_token == refresh_token

        class TestWhenNotExistUserUUID:
            def test_raise_exception(self, auth_service: AuthService):
                refresh_token = generate_test_token(token_type=TokenType.REFRESH_TOKEN)

                with pytest.raises(RetroAppRecordNotFoundError) as e:
                    auth_service.get_current_user_from_refresh_token(
                        refresh_token=refresh_token
                    )
                assert str(e.value) == "条件に合致するレコードは存在しません。"

        class TestWhenUnmatchRefreshToken:
            def test_raise_exception(self, auth_service: AuthService, user_repo):
                """渡したRefreshTokenとUsersテーブルのRefreshTokenが一致しない場合、エラーを返す"""
                test_user: "UserModel" = create_test_user(user_repo)
                refresh_token: str = generate_test_token(
                    token_type=TokenType.REFRESH_TOKEN, user_uuid=test_user.uuid
                )

                assert test_user.refresh_token is None
                with pytest.raises(RetroAppAuthenticationError) as e:
                    auth_service.get_current_user_from_refresh_token(
                        refresh_token=refresh_token
                    )
                assert str(e.value) == "リフレッシュトークンが間違っています。"

        class TestWhenAcessTokenInParameter:
            def test_raise_exception(self, auth_service: AuthService, user_repo):
                """AccessTokenを渡した場合はエラーになる"""
                test_user: "UserModel" = create_test_user(user_repo)
                tokens = auth_service.create_tokens(user=test_user)

                with pytest.raises(RetroAppAuthenticationError) as e:
                    auth_service.get_current_user_from_refresh_token(
                        tokens["access_token"]
                    )
                assert str(e.value) == "TokenTypeが一致しません。"

        class TestWhenParamIsNone:
            def test_raise_exception(self, auth_service: AuthService):
                """引数がNoneの場合エラーとなる"""

                with pytest.raises(TypeError) as e:
                    auth_service.get_current_user_from_refresh_token(refresh_token=None)  # type: ignore
                assert str(e.value) == "refresh_token must be other than None"

    class TestCreateToken:
        @pytest.mark.smoke
        def test_valid(self, auth_service: AuthService, user_repo: UserRepository):
            """Userが有効な値の場合、access_tokenとrefresh_tokenを返す"""
            test_user: "UserModel" = create_test_user(user_repo)
            tokens = auth_service.create_tokens(user=test_user)

            assert tokens["access_token"]
            assert tokens["refresh_token"]
            assert tokens["token_type"] == "bearer"

        class TestWhenUserIsNone:
            def test_raise_error(self, auth_service: AuthService):
                """userがNoneの場合は例外を返す"""
                with pytest.raises(TypeError) as e:
                    auth_service.create_tokens(None)  # type: ignore

                assert str(e.value) == "user must be other than None"

    class TestAuthenticate:
        class TestWhenValidParam:
            @pytest.mark.smoke
            def test_return_authenticated_user(
                self, auth_service: AuthService, user_repo
            ):
                """usernameとパスワードが一致している場合、そのユーザーを返すこと"""
                user_params = {
                    "name": "authenticate_user",
                    "password": "qwsedfrtgyhujikolp;@:!234",
                }
                test_user: "UserModel" = create_test_user(user_repo, **user_params)
                authenticated_user = auth_service.authenticate(
                    username=user_params["name"], password=user_params["password"]
                )

                assert authenticated_user == test_user
                assert authenticated_user.name == user_params["name"]

        class TestWhenNotExistEmail:
            def test_raise_exception(self, auth_service: AuthService):
                """usernameが存在しない場合、エラーを返す"""
                user_params = {
                    "username": "not_exsist_mail",
                    "password": "qwsedfrtgyhujikolp;@:!234",
                }

                with pytest.raises(RetroAppRecordNotFoundError) as e:
                    auth_service.authenticate(**user_params)

                assert str(e.value) == "条件に合致するレコードは存在しません。"

        class TestWhenUnmatchPassword:
            def test_raise_exception(self, auth_service: AuthService, user_repo):
                """パスワードが一致しない場合、エラーを返す"""
                test_user: "UserModel" = create_test_user(user_repo)

                with pytest.raises(RetroAppAuthenticationError) as e:
                    auth_service.authenticate(
                        username=test_user.name, password="hoge"
                    )

                assert str(e.value) == "パスワードが一致しません。"

        class TestWhenParamIsNone:
            def test_raise_exeption(self, auth_service: AuthService):
                """username、passwordどちらがNondでもエラーとする"""
                # あまり重要度が高い処理ではないので、1test1assertとはしない

                with pytest.raises(TypeError) as e:
                    auth_service.authenticate(username=None, password=None)  # type: ignore

                # fmt: off
                assert str(e.value) == "username and password must be other than None"
                # fmt: on

                with pytest.raises(TypeError) as e:
                    auth_service.authenticate(username="hoge", password=None)  # type: ignore

                # fmt: off
                assert str(e.value) == "username and password must be other than None"
                # fmt: on
                with pytest.raises(TypeError) as e:
                    auth_service.authenticate(username=None, password="hoge")  # type: ignore

                # fmt: off
                assert str(e.value) == "username and password must be other than None"
                # fmt: off
