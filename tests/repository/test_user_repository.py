import pytest
from passlib.context import CryptContext
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.errors.retro_app_error import (
    RetroAppColmunUniqueError,
    RetroAppRecordNotFoundError,
)
from app.models.user_model import UserModel
from app.repository.user_repository import UserRepository
from tests.test_helpers.create_test_user import create_test_user

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@pytest.fixture
def create_user():
    def _method(db: Session, **user_params) -> None:
        user_repo = UserRepository(db)
        user = UserModel(**user_params)
        user_repo.save(user)

    return _method


@pytest.mark.usefixtures("db")
class TestUserRepository:
    class TestSave:
        def test_create_user(self, db: Session, create_user):
            create_user(db=db, name="John Doe", password="password")

            # ユーザーが正しく作成されたか検証
            # TODO:日付のassertが欲しい。日本時間かどうか。
            created_user: UserModel = db.query(UserModel).filter_by(name="John Doe").first()  # type: ignore

            assert created_user is not None
            assert str(created_user.name) == "John Doe"
            assert pwd_context.verify("password", str(created_user.hashed_password))

        def test_name_uniqueness(self, db: Session, create_user):
            # 予め新規ユーザーを作っておく。
            user_data: dict = {
                "name": "resisted name",
                "password": "password",
            }
            create_user(db=db, **user_data)

            with pytest.raises(RetroAppColmunUniqueError) as e:
                create_user(db=db, **user_data)

            assert str(e.value) == "指定された名前はすでに登録されています。"

        def test_update(self, db: Session, create_user):
            # 予めユーザーを作っておく。
            user_data: dict = {
                "name": "for update name1",
                "password": "password",
            }
            create_user(db=db, **user_data)

            user_repo = UserRepository(db)
            user: UserModel = user_repo.find_by("name", user_data["name"])  # type: ignore
            assert user  # userがNoneではないことの確認
            user.name = "after updatename"
            user.hashed_password = "hashed_password"
            user.refresh_token = "refresh_token"

            user_repo.save(user)

            # expireしないと、コミットしてなくても、新しい値を取得してしまうため
            db.expire(user)

            user_after_update: UserModel = user_repo.find_by("id", user.id)  # type: ignore
            assert user_after_update  # userがNoneではないことの確認
            assert user_after_update.name == "after updatename"
            assert user_after_update.hashed_password == "hashed_password"
            assert user_after_update.refresh_token == "refresh_token"
            assert user_after_update.updated_at > user_after_update.created_at

        class TestWhenCommitError:
            def test_expect_rollback(self, db: Session, mocker):
                """commit時にエラーが発生した場合、rollbackされることを確認する"""

                # commit時に強制的にエラーを発生させる
                mocker.patch.object(
                    db,
                    "commit",
                    side_effect=OperationalError(
                        "Simulated OperationalError", None, None  # type: ignore
                    ),
                )
                mocker.patch.object(
                    db, "rollback"
                )  # rollbackメソッドを呼び出されたか確認したいためモック

                user_data: dict = {
                    "name": "commit error",
                    "password": "password",
                }
                user = UserModel(**user_data)
                user_repo = UserRepository(db)

                with pytest.raises(OperationalError):
                    user_repo.save(user)

                assert db.rollback.call_count == 1  # type: ignore

    class TestFindBy:
        def test_valid_search(self, user_repo: "UserRepository"):
            test_users = [create_test_user(user_repo) for _ in range(5)]

            searched_user_by_id: UserModel = user_repo.find_by("id", test_users[1].id)  # type: ignore
            assert searched_user_by_id == test_users[1]

            searched_user_by_uuid: UserModel = user_repo.find_by(  # type: ignore
                "uuid", test_users[2].uuid
            )
            assert searched_user_by_uuid == test_users[2]

        class TestWhenRecordIsNone:
            class TestWhenRaiseOptionIsTrue:
                def test_raise_error(self, user_repo: "UserRepository"):
                    with pytest.raises(RetroAppRecordNotFoundError):
                        user_repo.find_by(column="name", value="not_exsist_user")

            class TestWhenRaiseOptionIsFalse:
                def test_raise_error(self, user_repo: "UserRepository"):
                    result = user_repo.find_by(
                        column="name", value="not_exsist_user", raise_exception=False
                    )
                    assert result is None

            class TestWhenRaiseOptionIsNone:
                def test_raise_error(self, user_repo: "UserRepository"):
                    with pytest.raises(TypeError) as e:
                        user_repo.find_by(column="name", value="not_exsist_user", raise_exception=None)  # type: ignore

                    assert str(e.value) == "raise_exception must be True or False"
