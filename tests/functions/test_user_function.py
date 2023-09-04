import pytest
from fastapi.testclient import TestClient
from app.functions.user import app
from datetime import datetime, timedelta
from typing import TYPE_CHECKING
from app.schemas.token_schema import TokenType
from app.models.user_model import UserModel
from sqlalchemy import select
from tests.test_helpers.token import generate_test_token
from httpx import Response


# 型アノテーションだけのimport
if TYPE_CHECKING:
    from sqlalchemy.orm.session import Session


client = TestClient(app)


@pytest.fixture
def add_user_api():
    def _method(user_data) -> None:
        response = client.post('/api/v1/sign_up', json=user_data)
        assert response.status_code == 201

    return _method


# TODO:function用のhelperに移動する
@pytest.fixture
def login_api():
    def _method(login_param: dict,
                is_return_response=False) -> Response | tuple:
        response: 'Response' = client.post(
            '/token',
            headers={
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'},
            data=login_param
        )

        if is_return_response:
            return response

        res_body = response.json()
        return res_body['access_token'], res_body['refresh_token']

    return _method


@pytest.fixture(scope='session')
def refresh_token_api():
    def _method(refresh_token: str) -> 'Response':
        response: 'Response' = client.post(
            '/refresh_token',
            headers={
                'accept': 'application/json',
                'Authorization': f'Bearer {refresh_token}'},
        )
        return response
    return _method


@pytest.fixture(scope='session')
def logout_api():
    def _method(access_token: str) -> 'Response':
        response = client.post(
            '/api/v1/logout',
            headers={
                'accept': 'application/json',
                'Authorization': f'Bearer {access_token}'},
        )
        return response
    return _method


@pytest.mark.usefixtures('db')
class TestUserFunction:
    def test_register_user(self):
        user_data: dict = {
            'email': 'testuser@example.com',
            'name': 'Test User',
            'password': 'testpassword'
        }

        response = client.post('/api/v1/sign_up', json=user_data)

        assert response.status_code == 201
        assert response.json() == {
            'message': 'ユーザー登録が成功しました。'
        }
        # TODO:異常系のテストを追加する
        # DBに保存されているかの観点が必要。
        # パスワードのバリデーションがすり抜けている気がする...

    class TestLogin:
        # TODO:TestLogin用のユーザーを作りたいなあ。毎回テストの中で作るのをやめたい。fixture使えばいいのか
        class TestValidParam:
            def test_return_200(self, add_user_api, login_api):
                user_data: dict = {
                    'email': 'testuser1@example.com',
                    'name': 'Test User1',
                    'password': 'testpassword'
                }
                add_user_api(user_data)

                user_data: dict = {
                    'username': 'testuser@example.com',
                    'password': 'testpassword'
                }
                response = login_api(user_data, True)

                res_body = response.json()
                assert response.status_code == 200
                assert res_body['access_token'] is not None
                assert res_body['refresh_token'] is not None
                assert res_body['message'] == 'ログインしました'
                assert res_body['token_type'] == 'bearer'
                assert res_body['name'] == 'Test User'

        class TestWhenNotExistEmail:
            def test_return_401(self, login_api):
                """存在しないメアドを指定した場合、エラーとなること"""
                user_data: dict = {
                    'username': 'APITestWhenNotExistEmail@example.com',
                    'password': 'testpassword'
                }
                response = login_api(user_data, True)

                res_body = response.json()
                assert response.status_code == 401
                assert res_body['detail'] == 'メールアドレスまたはパスワードが間違っています。'
                assert response.headers['WWW-Authenticate'] == 'Bearer'

        class TestWhenUnmatchPassword:
            def test_return_401(self, add_user_api, login_api):
                """パスワードが一致しない場合、エラーとなること"""
                user_data: dict = {
                    'email': 'apiTestWhenUnmatchPassword@example.com',
                    'name': 'apiTestWhenUnmatchPassword',
                    'password': 'testpassword'
                }
                add_user_api(user_data)

                user_data: dict = {
                    'username': 'apiTestWhenUnmatchPassword@example.com',
                    'password': 'hogehoge'
                }
                response = login_api(user_data, True)

                res_body = response.json()
                assert response.status_code == 401
                assert res_body['detail'] == 'メールアドレスまたはパスワードが間違っています。'
                assert response.headers['WWW-Authenticate'] == 'Bearer'

    class TestLogout:
        class TestWhenValidParam:
            def test_logout_api_return_200_and_refresh_token_return_error(
                    self, db: 'Session', add_user_api, login_api, logout_api,
                    refresh_token_api):
                """
                有効なアクセストークンを渡すと、ログアウトが成功し、リフレッシュトークンがNullに更新されること。
                その状態で/refresh_tokenにアクセスするとエラーとなること
                """
                user_data: dict = {
                    'email': 'testuserlogout@example.com',
                    'name': 'Test Userlogout',
                    'password': 'testpassword'
                }
                add_user_api(user_data)

                login_param: dict = {
                    'username': user_data['email'],
                    'password': user_data['password'],
                }
                access_token, refresh_token = login_api(login_param)

                logout_response: 'Response' = logout_api(access_token)
                assert logout_response.status_code == 200
                assert logout_response.json() == {
                    'message': 'ログアウトしました'
                }

                stmt = select(UserModel).where(
                    UserModel.email == user_data['email'])
                user: UserModel = db.execute(stmt).scalars().first()
                assert user  # Noneではないことの確認
                assert user.refresh_token is None

                ref_token_res: 'Response' = refresh_token_api(refresh_token)
                assert ref_token_res.status_code == 401
                assert ref_token_res.json() == {'detail': 'Tokenが間違っています。'}
                assert ref_token_res.headers['www-authenticate'] == 'Bearer'

        class TestWhenInvalidToken:
            def test_return_401(self, logout_api):
                """access_tokenが無効な値の場合、401を返すこと"""
                token: str = generate_test_token(
                    'dummy', 'dummy')  # type: ignore

                response = logout_api(token)

                res_body = response.json()
                assert response.status_code == 401
                assert res_body['detail'] == 'Tokenが間違っています。'
                assert response.headers['www-authenticate'] == 'Bearer'

        class TestWhenExpiredToken:
            def test_return_401(self, logout_api):
                """トークンの有効期限が切れている場合、再ログインを促すメッセージを返すこと"""
                access_token: str = generate_test_token(
                    token_type=TokenType.ACCESS_TOKEN,
                    exp=datetime.utcnow() - timedelta(minutes=10)
                )

                response = logout_api(access_token)

                res_body = response.json()
                assert response.status_code == 401
                assert res_body['detail'] == 'ログイン有効期間を過ぎています。再度ログインしてください。'
                assert response.headers['www-authenticate'] == 'Bearer'

    # ログアウトのテスト観点
    # ・もう一度同じaccess_tokenでアクセスすると、エラーを返すこと(4xx)
    #   ・ログインしていない状態でアクセスするのと同義
    #   ・これは一旦実装しない。実装するならアクセストークンのブロックリストを使う必要があるため
    # uuidが存在しないユーザーの場合

    # TODO:アクセストークンのテストが必要

    # リフレッシュトークン取得のテスト観点
    # - アクセストークンは変わらないけど、リフレッシュトークンは変わること。（仕様として正しいのかも含めて確認）
    #   - やっぱアクセストークンもリフレッシュトークンも変わるのが正しそう。アクセストークンが切れている状態でこのAPIを呼び出すので。
    # 一方でアクセストークンが有効な時にこのAPIにアクセスしたら時はどうすれば？トークン再発行に倒そう。
    # リフレッシュトークンが異常な値の時

    class TestRefreshToken:
        class TestWhenValidParam:
            def test_return_200(self, add_user_api, login_api,
                                refresh_token_api):
                user_data: dict = {
                    'email': 'testrefresh_token@example.com',
                    'name': 'Test Userrefresh_token',
                    'password': 'QG+UJxEdf,T5'
                }
                add_user_api(user_data)

                login_param: dict = {
                    'username': user_data['email'],
                    'password': user_data['password'],
                }
                access_token, refresh_token = login_api(login_param)

                response = refresh_token_api(refresh_token)

                # トークンが再発行されていること
                res_body = response.json()
                assert response.status_code == 200
                assert res_body['access_token'] != access_token
                assert res_body['refresh_token'] != refresh_token

        class TestWhenCreateNewRefreshToken:
            def test_previous_refresh_token_is_disable(
                    self, add_user_api, login_api, refresh_token_api):
                """新しくリフレッシュトークンが発行されたら、
                それより前に発行されたリフレッシュトークンは無効になること"""
                user_data: dict = {
                    'email': 'testrefresh_token_invalid_param@example.com',
                    'name': 'Test testrefresh_token_invalid_param',
                    'password': 'QG+UJxEdf,T5'
                }
                add_user_api(user_data)

                login_param: dict = {
                    'username': user_data['email'],
                    'password': user_data['password'],
                }
                _, refresh_token_1st = login_api(login_param)

                # リフレッシュトークンAPI実行1回目
                response = refresh_token_api(refresh_token_1st)
                refresh_token_2nd = response.json()['refresh_token']
                assert response.status_code == 200
                assert refresh_token_2nd != refresh_token_1st

                # リフレッシュトークンAPI実行2回目
                response = response = refresh_token_api(refresh_token_1st)
                assert response.status_code == 401

                # リフレッシュトークンAPI実行3回目
                response = response = refresh_token_api(refresh_token_2nd)
                assert response.status_code == 200

        class TestWhenNotExistUser:
            def test_return_401(self, refresh_token_api):
                """トークンで指定したUUIDのユーザーが存在しない場合、エラーとなること"""
                refresh_token: str = \
                    generate_test_token(TokenType.REFRESH_TOKEN)

                response = response = refresh_token_api(refresh_token)

                assert response.status_code == 401
                assert response.json() == {'detail': '再度ログインしてください。'}
                assert response.headers['www-authenticate'] == 'Bearer'

        class TestWhenExpiredToken:
            def test_return_401(self, refresh_token_api):
                """トークンの有効期限が切れている場合、再ログインを促すメッセージを返すこと"""
                refresh_token: str = generate_test_token(
                    token_type=TokenType.REFRESH_TOKEN,
                    exp=datetime.utcnow() - timedelta(days=7)
                )

                response = refresh_token_api(refresh_token)

                res_body = response.json()
                assert response.status_code == 401
                assert res_body['detail'] == 'ログイン有効期間を過ぎています。再度ログインしてください。'
                assert response.headers['www-authenticate'] == 'Bearer'
