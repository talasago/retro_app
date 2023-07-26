import pytest
from sqlalchemy.orm import Session
from app.repository.user_repository import UserRepository
from app.schemas.user_schema import UserCreate
from passlib.context import CryptContext
from app.models.user_model import UserModel

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

        assert created_user is not None
        assert str(created_user.name) == user_data.name
        assert str(created_user.email) == user_data.email
        assert pwd_context.verify(
            'password', str(created_user.hashed_password))

    @pytest.mark.skipif(True,
                        reason=('emailが重複していた時、エラーメッセージがFastAPI側で'
                                'コントロールされていれば、このクラスで考慮する必要がないため'))
    def test_create_user_duplicate_email(self, db: Session):
        user_data = UserCreate(
            name='hogee', email='johndoe@example.com', password='password')
        sut = UserRepository(db)

        sut.create_user(user_data)

    def test_is_email_exist_true(self, db: Session):
        user_data = UserCreate(
            name='email_exist', email='email_exist@example.com',
            password='password')
        user_repo = UserRepository(db)
        user_repo.create_user(user_data)

        sut = user_repo.is_email_exist(email='email_exist@example.com')

        assert sut

    def test_is_email_exist_false(self, db: Session):
        user_repo = UserRepository(db)

        sut = user_repo.is_email_exist(email='email_exist@example.com')

        assert sut
