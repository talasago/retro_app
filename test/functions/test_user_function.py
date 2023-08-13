import pytest
from fastapi.testclient import TestClient
from app.functions.user import app
from jose import jwt
from datetime import datetime

client = TestClient(app)


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

    # FIXME:テストの順番に依存がある
    def test_login(self):
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

    # FIXME:テストの順番に依存がある
    def test_logout(self):
        user_data: dict = {
            'username': 'testuser@example.com',
            'password': 'testpassword'
        }

        response = client.post(
            '/token',
            headers={
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'},
            data=user_data
        )
        access_token = response.json()['access_token']
        # TODO:ここまで前処理。前処理はhelperに共通化する

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

    def test_logout_invalid_token(self):
        payload = {
            'token_type': 'dummy',
            'exp': datetime.utcnow(),
            'uid': 'dummy',
        }

        # FIXME:SECRET_KEYを環境変数化
        access_token = jwt.encode(claims=payload,
                                  key='secret_key', algorithm='HS256')

        response = client.post(
            '/api/v1/logout',
            headers={
                'accept': 'application/json',
                'Authorization': f'Bearer {access_token}'},
        )
        assert response.status_code == 401

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
    def test_refresh_token(self):
        user_data: dict = {
            'username': 'testuser@example.com',
            'password': 'testpassword'
        }

        response = client.post(
            '/token',
            headers={
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'},
            data=user_data
        )
        access_token = response.json()['access_token']
        refresh_token = response.json()['refresh_token']
        # ここまで前処理。前処理はhelperに共通化する

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

    def test_refresh_token_invalid_param(self):
        """1回目のリフレッシュトークンは無効になること"""
        user_data: dict = {
            'username': 'testuser@example.com',
            'password': 'testpassword'
        }

        response = client.post(
            '/token',
            headers={
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'},
            data=user_data
        )
        assert response.status_code == 200
        refresh_token_1st = response.json()['refresh_token']

        response = client.post(
            '/refresh_token',
            headers={
                'accept': 'application/json',
                'Authorization': f'Bearer {refresh_token_1st}'},
        )
        refresh_token_2nd = response.json()['refresh_token']
        assert response.status_code == 200
        assert refresh_token_2nd != refresh_token_1st

        response = client.post(
            '/refresh_token',
            headers={
                'accept': 'application/json',
                'Authorization': f'Bearer {refresh_token_1st}'},
        )
        assert response.status_code == 401
