from sqlalchemy.orm import Session
from ..models.user_model import UserModel
from ..helpers.password_helper import PasswordHelper

# 型アノテーションだけのimport。こいつが無いと循環インポートで怒られてしまう。
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from ..schemas.user_schema import UserCreate


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_params: 'UserCreate') -> None:
        # ここで重複チェックしてもいいかも

        hashed_password = PasswordHelper.generate_hashed_password(
            plain_pw=user_params.password)  # type: ignore
        user_params = UserModel(name=user_params.name, email=user_params.email,
                                hashed_password=hashed_password)

        self.db.add(user_params)
        self.db.commit()
        # ここで重複チェックしてもいいかも。こんな感じ
        # except exc.IntegrityError as e:
        #    assert isinstance(e.orig, UniqueViolation) # これでいいのか？UniqueViolationじゃない時にAssertionErrorになる
        #    self.db.rollback()
        #    if "email" in str(e):
        #        message = "指定されたメールアドレスはすでに登録されています"
        #    else
        #        message = "指定された名前はすでに登録されています"
        #        raise ValueError(message)
        # https://qiita.com/tamaki_tech/items/e5bd41079413c0b21dec
        # https://stackoverflow.com/questions/58740043/how-do-i-catch-a-psycopg2-errors-uniqueviolation-error-in-a-python-flask-app
        self.db.refresh(user_params)

        # NOTE:ユーザー登録APIを作る時に何を返すか考える

    def is_email_exist(self, email: str):
        return self.db.query(UserModel) \
                      .filter(UserModel.email == email).count() > 0
