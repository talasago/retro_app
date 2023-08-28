import pytest
from fastapi.testclient import TestClient
from app.functions.user import app
from jose import jwt
from datetime import datetime, timedelta
from typing import TYPE_CHECKING
from app.schemas.token_schema import TokenPayload
from app.models.user_model import UserModel
from sqlalchemy import select

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
    def _method(login_param: dict) -> tuple:
        response = client.post(
            '/token',
            headers={
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'},
            data=login_param
        )
        assert response.status_code == 200
        res_body = response.json()
        return res_body['access_token'], res_body['refresh_token']

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
        # TODO:このクラス用のユーザーを作りたいなあ。毎回テストの中で作るのをやめたい。fixture使えばいいのか
        def test_login_200(self, add_user_api):
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

            response = client.post('token',
                                   headers={
                                       'accept': 'application/json',
                                       'Content-Type': 'application/x-www-form-urlencoded'},  # noqa: E501
                                   data=user_data)

            res_body = response.json()
            assert response.status_code == 200
            assert res_body['access_token'] is not None
            assert res_body['refresh_token'] is not None
            assert res_body['message'] == 'ログインしました'
            assert res_body['token_type'] == 'bearer'
            assert res_body['name'] == 'Test User'

        class TestWhenNotExistEmail:
            def test_401(self):
                user_data: dict = {
                    'username': 'APITestWhenNotExistEmail@example.com',
                    'password': 'testpassword'
                }

                response = client.post('token',
                                       headers={
                                           'accept': 'application/json',
                                           'Content-Type': 'application/x-www-form-urlencoded'},  # noqa: E501
                                       data=user_data)

                res_body = response.json()
                assert response.status_code == 401
                assert res_body['detail'] == 'メールアドレスまたはパスワードが間違っています。'
                assert response.headers['WWW-Authenticate'] == 'Bearer'

        class TestWhenUnmatchPassword:
            def test_401(self, add_user_api):
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

                response = client.post('token',
                                       headers={
                                           'accept': 'application/json',
                                           'Content-Type': 'application/x-www-form-urlencoded'},  # noqa: E501
                                       data=user_data)

                res_body = response.json()
                assert response.status_code == 401
                assert res_body['detail'] == 'メールアドレスまたはパスワードが間違っています。'
                assert response.headers['WWW-Authenticate'] == 'Bearer'

    class TestLogout:
        def test_logout_200(self, db: 'Session', add_user_api, login_api):
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
            access_token, _ = login_api(login_param)

            response = client.post(
                '/api/v1/logout',
                headers={
                    'accept': 'application/json',
                    'Authorization': f'Bearer {access_token}'},
            )
            assert response.status_code == 200
            assert response.json() == {
                'message': 'ログアウトしました'
            }

            user: UserModel = db.execute(
                select(UserModel).where(UserModel.email == user_data['email'])
            ).scalars().first()
            assert user  # Noneではないことの確認
            assert user.refresh_token is None

        def test_logout_invalid_token(self):
            payload = TokenPayload(
                token_type='dummy',
                exp=datetime.utcnow() + timedelta(days=1),
                uid='dummy',
                jti='dummy'
            )
            # FIXME:SECRET_KEYを環境変数化
            access_token = jwt.encode(claims=payload.model_dump(),
                                      key='secret_key', algorithm='HS256')

            response = client.post(
                '/api/v1/logout',
                headers={
                    'accept': 'application/json',
                    'Authorization': f'Bearer {access_token}'},
            )
            res_body = response.json()
            assert response.status_code == 401
            assert res_body['detail'] == 'トークンタイプ不一致'

    # ログアウトのテスト観点
    # ・ログイン状態じゃないと(access_tokenが有効である状態)エラーを返すこと(4XX)
    # ・ログイン状態で実施すると、処理が成功すること
    #     内部的にはトークンを無効化する。revoke_token
    # ・もう一度同じaccess_tokenでアクセスすると、エラーを返すこと(4xx)

    # TODO:アクセストークンのテストが必要
    # - 10分後にアクセスするとエラーとなること

    # リフレッシュトークン取得のテスト観点
    # - アクセストークンは変わらないけど、リフレッシュトークンは変わること。（仕様として正しいのかも含めて確認）
    #   - やっぱアクセストークンもリフレッシュトークンも変わるのが正しそう。アクセストークンが切れている状態でこのAPIを呼び出すので。
    # 一方でアクセストークンが有効な時にこのAPIにアクセスしたら時はどうすれば？トークン再発行に倒そう。
    # 1週間後にアクセスするとエラーとなること
    # リフレッシュトークンが異常な値の時

    class TestRefreshToken:
        def test_refresh_token_200(self, add_user_api, login_api):
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

            response = client.post(
                '/refresh_token',
                headers={
                    'accept': 'application/json',
                    'Authorization': f'Bearer {refresh_token}'},
            )

            # トークンが再発行されていること
            res_body = response.json()
            assert response.status_code == 200
            assert res_body['access_token'] != access_token
            assert res_body['refresh_token'] != refresh_token

        # TODO:メソッド名変更
        def test_refresh_token_invalid_param(self, add_user_api, login_api):
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
            response = client.post(
                '/refresh_token',
                headers={
                    'accept': 'application/json',
                    'Authorization': f'Bearer {refresh_token_1st}'},
            )
            refresh_token_2nd = response.json()['refresh_token']
            assert response.status_code == 200
            assert refresh_token_2nd != refresh_token_1st

            # リフレッシュトークンAPI実行2回目
            response = client.post(
                '/refresh_token',
                headers={
                    'accept': 'application/json',
                    'Authorization': f'Bearer {refresh_token_1st}'},
            )
            assert response.status_code == 401

            # リフレッシュトークンAPI実行3回目
            response = client.post(
                '/refresh_token',
                headers={
                    'accept': 'application/json',
                    'Authorization': f'Bearer {refresh_token_2nd}'},
            )
            assert response.status_code == 200
