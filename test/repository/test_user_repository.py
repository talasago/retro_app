# appディレクトリの実行パスを追加
# TODO:テストコードのファイル毎に書くのはめんどいので共通化したい気持ち
import sys
import os
app_path = os.path.join(os.path.dirname(__file__), '../..')
sys.path.append(app_path)
print(app_path)


import pytest  # noqa: E402
from sqlalchemy.orm import Session   # noqa: E402
from app.repository.user_repository import UserRepository  # noqa: E402
# from app.models.user import User # noqa: E402
from app.schema.user import UserCreate  # noqa: E402


@pytest.mark.usefixtures("db")
class TestUserRepository:
    def test_create_user(self, db: Session):
        # テストデータの作成
        user_data = UserCreate(name="John Doe", email="johndoe@example.com", password="password")

        # UserRepositoryのインスタンスを作成
        user_repo = UserRepository(db)

        # create_userメソッドを呼び出してユーザーを作成
        created_user = user_repo.create_user(user_data)

        # ユーザーが正しく作成されたかを検証
        assert created_user.name == user_data.name
        assert created_user.email == user_data.email
