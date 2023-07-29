import pytest
from sqlalchemy.orm import Session
from app.repository.user_repository import UserRepository
from app.schemas.user_schema import UserCreate
from passlib.context import CryptContext
from app.models.user_model import UserModel

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


@pytest.fixture
def create_user():
    def _method(db: Session, name: str, email: str,
                password: str) -> None:
        user_data = UserCreate(name=name, email=email,
                               password=password)  # type: ignore
        user_repo = UserRepository(db)
        user_repo.create_user(user_data)

    return _method


@pytest.mark.usefixtures('db')
class TestUserRepository:
    def test_create_user(self, db: Session, create_user):
        create_user(db=db, name='John Doe',
                    email='johndoe@example.com',
                    password='password')

        # ユーザーが正しく作成されたか検証
        # TODO:日付のassertが欲しい。日本時間かどうか。
        created_user: UserModel = db.query(UserModel) \
            .filter_by(email='johndoe@example.com').first()  # type: ignore

        assert created_user is not None
        assert str(created_user.name) == 'John Doe'
        assert str(created_user.email) == 'johndoe@example.com'
        assert pwd_context.verify(
            'password', str(created_user.hashed_password))

    def test_email_uniqueness(self, db: Session, create_user):
        # 予めユーザーを作っておく。
        user_data: dict = {
            'name': 'resisted user',
            'email': 'resisted_user@example.com',
            'password': 'password'
        }
        create_user(db=db, **user_data)
        # emailだけが重複になるようにパラメタ修正
        user_data['name'] = 'resisted user1'

        with pytest.raises(ValueError) as e:
            create_user(db=db, **user_data)

        assert str(e.value) == '指定されたメールアドレスはすでに登録されています。'
