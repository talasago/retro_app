from datetime import datetime, timedelta
from typing import TYPE_CHECKING

import pytest
from factories.user_factory import ApiCommonUserFactory
from httpx import Response
from sqlalchemy import select

from app.models.user_model import UserModel
from app.schemas.token_schema import TokenType
from tests.test_helpers.functions.cors import assert_cors_headers
from tests.test_helpers.token import generate_test_token

# 型アノテーションだけのimport
if TYPE_CHECKING:
    from sqlalchemy.orm.session import Session


@pytest.mark.usefixtures("db")
class TestUserFunction:
    class TestSignUp:
        def test_register_user(self, add_user_api):
            """
            テスト観点
            1.ユーザーが登録できること
            2.同じメールアドレスで登録できないこと
            3.CORS設定が正しいこと(最低限の確認)
            """
            user_data: dict = {
                "email": "testuser@example.com",
                "name": "Test User",
                "password": "testpassword",
            }
            option = {"headers": {"Origin": "http://127.0.0.1"}}

            response_1st = add_user_api(user_data=user_data, option=option)
            assert response_1st.json() == {"message": "ユーザー登録が成功しました。"}
            assert_cors_headers(response_1st)

            response_2nd = add_user_api(
                user_data=user_data, is_assert_response_code_2xx=False, option=option
            )
            assert response_2nd.status_code == 409
            assert response_2nd.json() == {
                "detail": "指定されたメールアドレスはすでに登録されています。"
            }
            assert_cors_headers(response_2nd)

            # TODO:異常系のテストを追加する
            # DBに保存されているかの観点が必要。
            # パスワードのバリデーションがすり抜けている気がする...

        def test_422_be_translated_into_japanese(self, add_user_api):
            """pydenticのエラーメッセージが日本語化されていること"""
            user_data: dict = ApiCommonUserFactory(name="芳" * 51)

            response = add_user_api(user_data, is_assert_response_code_2xx=False)

            assert response.status_code == 422
            assert (
                response.json()["detail"][0]["msg"] == "50 文字以下で入力してください。"
            )

    class TestLogin:
        @pytest.fixture(scope="module", autouse=True)
        def add_user_for_login(self, add_user_api, user_data_for_login) -> None:
            add_user_api(user_data_for_login)

        @pytest.fixture(scope="module")
        def user_data_for_login(self) -> dict:
            return {
                "email": "user_data_for_login@example.com",
                "name": "user_data_for_login",
                "username": "user_data_for_login@example.com",
                "password": "testpassword!1",
            }

        class TestValidParam:
            def test_return_200(self, login_api, user_data_for_login):
                response = login_api(user_data_for_login, True)

                res_body = response.json()
                assert res_body["access_token"] is not None
                assert res_body["refresh_token"] is not None
                assert res_body["message"] == "ログインしました"
                assert res_body["token_type"] == "bearer"
                assert res_body["name"] == "user_data_for_login"

        class TestWhenNotExistEmail:
            def test_return_401(self, login_api):
                """存在しないメアドを指定した場合、エラーとなること"""
                user_data: dict = ApiCommonUserFactory(
                    username="APITestWhenNotExistEmail@example.com"
                )

                response = login_api(user_data, True, is_assert_response_code_2xx=False)

                res_body = response.json()
                assert response.status_code == 401
                assert (
                    res_body["detail"]
                    == "メールアドレスまたはパスワードが間違っています。"
                )
                assert response.headers["WWW-Authenticate"] == "Bearer"

        class TestWhenUnmatchPassword:

            def test_return_401(self, login_api, user_data_for_login):
                """パスワードが一致しない場合、エラーとなること"""
                login_user_data = dict(user_data_for_login)
                login_user_data["password"] = "hogehoge"

                response = login_api(
                    login_user_data, True, is_assert_response_code_2xx=False
                )

                res_body = response.json()
                assert response.status_code == 401
                assert (
                    res_body["detail"]
                    == "メールアドレスまたはパスワードが間違っています。"
                )
                assert response.headers["WWW-Authenticate"] == "Bearer"

    class TestLogout:
        class TestWhenValidParam:
            def test_logout_api_return_200_and_refresh_token_return_error(
                self,
                db: "Session",
                add_user_api,
                login_api,
                logout_api,
                refresh_token_api,
            ):
                """
                有効なアクセストークンを渡すと、ログアウトが成功し、リフレッシュトークンがNullに更新されること。
                その状態で/refresh_tokenにアクセスするとエラーとなること
                """
                user_data: dict = {
                    "email": "testuserlogout@example.com",
                    "name": "Test Userlogout",
                    "password": "testpassword",
                }
                add_user_api(user_data)

                login_param: dict = {
                    "username": user_data["email"],
                    "password": user_data["password"],
                }
                access_token, refresh_token = login_api(login_param)

                logout_response: "Response" = logout_api(access_token, False)
                assert logout_response.json() == {"message": "ログアウトしました"}

                stmt = select(UserModel).where(UserModel.email == user_data["email"])
                user: UserModel = db.execute(stmt).scalars().first()  # type: ignore
                assert user  # Noneではないことの確認
                assert user.refresh_token is None

                ref_token_res: "Response" = refresh_token_api(refresh_token)
                assert ref_token_res.status_code == 401
                assert ref_token_res.json() == {"detail": "Tokenが間違っています。"}
                assert ref_token_res.headers["www-authenticate"] == "Bearer"

        class TestWhenInvalidToken:
            def test_return_401(self, logout_api):
                """access_tokenが無効な値の場合、401を返すこと"""
                token: str = generate_test_token("dummy", "dummy")  # type: ignore

                response = logout_api(token, False)

                res_body = response.json()
                assert response.status_code == 401
                assert res_body["detail"] == "Tokenが間違っています。"
                assert response.headers["www-authenticate"] == "Bearer"

        class TestWhenInvalidTokenWithNotUuid:
            def test_return_401(
                self, logout_api, call_api_with_invalid_access_token_assert_401
            ):
                call_api_with_invalid_access_token_assert_401(logout_api)

        class TestWhenNotExistUser:
            def test_return_401(self, logout_api):
                """トークンで指定したUUIDのユーザーが存在しない場合、エラーとなること"""
                access_token: str = generate_test_token(TokenType.ACCESS_TOKEN)

                response = response = logout_api(access_token, False)

                assert response.status_code == 401
                assert response.json() == {"detail": "ユーザーが存在しません。"}
                assert response.headers["www-authenticate"] == "Bearer"

        class TestWhenExpiredToken:
            def test_return_401(self, logout_api):
                """トークンの有効期限が切れている場合、再ログインを促すメッセージを返すこと"""
                access_token: str = generate_test_token(
                    token_type=TokenType.ACCESS_TOKEN,
                    exp=datetime.utcnow() - timedelta(minutes=10),
                )

                response = logout_api(access_token, False)

                res_body = response.json()
                assert response.status_code == 401
                assert (
                    res_body["detail"]
                    == "ログイン有効期間を過ぎています。再度ログインしてください。"
                )
                assert response.headers["www-authenticate"] == "Bearer"

        class TestWhenInvalidParam:
            def test_return_401(self, logout_api):
                """トークンが不正な値の場合401を返す"""
                response = logout_api("hoge", False)

                res_body = response.json()
                assert response.status_code == 401
                assert res_body["detail"] == "Tokenが間違っています。"
                assert response.headers["www-authenticate"] == "Bearer"

    # ログアウトのテスト観点(未対応分)
    # ・もう一度同じaccess_tokenでアクセスすると、エラーを返すこと(4xx)
    #   ・ログインしていない状態でアクセスするのと同義
    #   ・これは一旦実装しない。実装するならアクセストークンのブロックリストを使う必要があるため

    # 各リクエストボディが空の場合(pydanticのバリデーションエラーの場合)
    # ヘッダーが無い場合

    class TestRefreshToken:
        class TestWhenValidParam:
            def test_return_200(self, add_user_api, login_api, refresh_token_api):
                user_data: dict = {
                    "email": "testrefresh_token@example.com",
                    "name": "Test Userrefresh_token",
                    "password": "QG+UJxEdf,T5",
                }
                add_user_api(user_data)

                login_param: dict = {
                    "username": user_data["email"],
                    "password": user_data["password"],
                }
                access_token, refresh_token = login_api(login_param)

                response = refresh_token_api(refresh_token)

                # トークンが再発行されていること
                res_body = response.json()
                assert response.status_code == 200
                assert res_body["access_token"] != access_token
                assert res_body["refresh_token"] != refresh_token

        class TestWhenCreateNewRefreshToken:
            def test_previous_refresh_token_is_disable(
                self, add_user_api, login_api, refresh_token_api
            ):
                """新しくリフレッシュトークンが発行されたら、
                それより前に発行されたリフレッシュトークンは無効になること。
                また、アクセストークンが再発行されること"""
                user_data: dict = {
                    "email": "testrefresh_token_invalid_param@example.com",
                    "name": "Test testrefresh_token_invalid_param",
                    "password": "QG+UJxEdf,T5",
                }
                add_user_api(user_data)

                login_param: dict = {
                    "username": user_data["email"],
                    "password": user_data["password"],
                }
                access_token_1st, refresh_token_1st = login_api(login_param)

                # リフレッシュトークンAPI実行1回目
                response = refresh_token_api(refresh_token_1st)
                refresh_token_2nd = response.json()["refresh_token"]
                access_token_2nd = response.json()["access_token"]
                assert response.status_code == 200
                assert refresh_token_2nd != refresh_token_1st
                assert access_token_2nd != access_token_1st

                # リフレッシュトークンAPI実行2回目
                response = refresh_token_api(refresh_token_1st)
                assert response.status_code == 401

                # リフレッシュトークンAPI実行3回目
                response = refresh_token_api(refresh_token_2nd)
                assert response.status_code == 200

        class TestWhenNotExistUser:
            def test_return_401(self, refresh_token_api):
                """トークンで指定したUUIDのユーザーが存在しない場合、エラーとなること"""
                refresh_token: str = generate_test_token(TokenType.REFRESH_TOKEN)

                response = response = refresh_token_api(refresh_token)

                assert response.status_code == 401
                assert response.json() == {"detail": "ユーザーが存在しません。"}
                assert response.headers["www-authenticate"] == "Bearer"

        class TestWhenExpiredToken:
            def test_return_401(self, refresh_token_api):
                """トークンの有効期限が切れている場合、再ログインを促すメッセージを返すこと"""
                refresh_token: str = generate_test_token(
                    token_type=TokenType.REFRESH_TOKEN,
                    exp=datetime.utcnow() - timedelta(days=7),
                )

                response = refresh_token_api(refresh_token)

                res_body = response.json()
                assert response.status_code == 401
                assert (
                    res_body["detail"]
                    == "ログイン有効期間を過ぎています。再度ログインしてください。"
                )
                assert response.headers["www-authenticate"] == "Bearer"

        class TestWhenInvalidParam:
            def test_return_401(self, refresh_token_api):
                """トークンが不正な値の場合401を返す"""
                response = refresh_token_api("hoge")

                res_body = response.json()
                assert response.status_code == 401
                assert res_body["detail"] == "Tokenが間違っています。"
                assert response.headers["www-authenticate"] == "Bearer"
