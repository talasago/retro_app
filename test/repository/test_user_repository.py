# appディレクトリの実行パスを追加
# TODO:テストコードのファイル毎に書くのはめんどいので共通化したい気持ち
import sys
import os
app_path = os.path.join(os.path.dirname(__file__), '../..')
sys.path.append(app_path)

import pytest  # noqa: E402
from sqlalchemy.orm import Session   # noqa: E402
from app.repository.user_repository import UserRepository  # noqa: E402
from app.schema.user_schema import UserCreate  # noqa: E402
from passlib.context import CryptContext  # noqa: E402
from app.models.user_model import UserModel  # noqa: E402

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


@pytest.mark.usefixtures('db')
class TestUserRepository:
    def test_create_user(self, db: Session):
        user_data = UserCreate(
            name='John Doe', email='johndoe@example.com', password='password')
        sut = UserRepository(db)

        sut.create_user(user_data)

        # ユーザーが正しく作成されたか検証
        # TODO:日付のassertが欲しい。日本時間かどうか。
        created_user: UserModel = db.query(UserModel) \
            .filter_by(email='johndoe@example.com').first()

        assert created_user.name == user_data.name
        assert created_user.email == user_data.email
        assert pwd_context.verify('password', created_user.hashed_password)
