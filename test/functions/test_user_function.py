import pytest
from fastapi.testclient import TestClient
from app.functions.user import app

client = TestClient(app)


@pytest.mark.usefixtures('db')
class TestUserFunction:
    def test_register_user(self):
        user_data: dict = {
            'email': 'testuser@example.com',
            'name': 'Test User',
            'password': 'testpassword'
        }

        response = client.post('/api/v1/sign_up/', json=user_data)

        assert response.status_code == 201
        assert response.json() == {
            'message': 'ユーザー登録が成功しました。'
        }
        # TODO:異常系のテストを追加する

    def test_sign_in(self):
        user_data: dict = {
            'username': 'testuser@example.com',
            'password': 'testpassword'
        }

        # XXX: なぜdataなのかわかってない。jsonじゃなくていいのか？
        response = client.post('/api/v1/token/', data=user_data)
        res_body = response.json()

        assert response.status_code == 200
        assert res_body['access_token'] is not None
        assert res_body['refresh_token'] is not None
        assert res_body['message'] == 'ログインしました'
        assert res_body['token_type'] == 'bearer'

        # uidは多分必要なさそう
        # assert response.json()['name'] is not None

    # リフレッシュトークン取得のテスト観点
    # - アクセストークンは変わらないけど、リフレッシュトークンは変わること。（仕様として正しいのかも含めて確認）
