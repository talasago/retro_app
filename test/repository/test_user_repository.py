import pytest
from sqlalchemy.orm import Session
from app.repository.user_repository import UserRepository
from app.schemas.user_schema import UserCreate
from passlib.context import CryptContext
from app.models.user_model import UserModel
from app.errors.retro_app_error import RetroAppColmunUniqueError

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
            'name': 'resisted email',
            'email': 'resisted_email@example.com',
            'password': 'password'
        }
        create_user(db=db, **user_data)
        # emailだけが重複になるようにパラメタ修正
        user_data['name'] = 'resisted email1'

        with pytest.raises(RetroAppColmunUniqueError) as e:
            create_user(db=db, **user_data)

        assert str(e.value) == '指定されたメールアドレスはすでに登録されています。'

    def test_name_uniqueness(self, db: Session, create_user):
        # 予めユーザーを作っておく。
        user_data: dict = {
            'name': 'resisted name',
            'email': 'resisted_name@example.com',
            'password': 'password'
        }
        create_user(db=db, **user_data)
        # nameだけが重複になるようにパラメタ修正
        user_data['email'] = 'resisted_name1@example.com'

        with pytest.raises(RetroAppColmunUniqueError) as e:
            create_user(db=db, **user_data)

        assert str(e.value) == '指定された名前はすでに登録されています。'

    def test_update(self, db: Session, create_user):
        # 予めユーザーを作っておく。
        user_data: dict = {
            'name': 'for update name1',
            'email': 'for_update2@example.com',
            'password': 'password'
        }
        create_user(db=db, **user_data)

        user_repo = UserRepository(db)
        user: UserModel = user_repo.find_by('email', user_data['email'])
        user.name = 'after updatename'
        user.email = 'afterupdate@email'
        user.hashed_password = 'hashed_password'
        user.refresh_token = 'refresh_token'

        user_repo.update_user(user)

        # expireしないと、コミットしてなくても、新しい値を取得してしまうため
        db.expire(user)

        user_after_update: UserModel = user_repo.find_by('id', user.id)
        assert user_after_update.name == 'after updatename'
        assert user_after_update.email == 'afterupdate@email'
        assert user_after_update.hashed_password == 'hashed_password'
        assert user_after_update.refresh_token == 'refresh_token'
