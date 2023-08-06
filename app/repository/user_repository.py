from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from psycopg2 import errors as psycopg2_errors
from ..models.user_model import UserModel
from ..schemas.user_schema import UserCreate
from ..helpers.password_helper import PasswordHelper
from ..errors.retro_app_error import RetroAppColmunUniqueError

# 型アノテーションだけのimport。こいつが無いと循環インポートで怒られてしまう。
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from ..schemas.user_schema import UserCreate


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_params: 'UserCreate') -> None:
        # ここで重複チェックしてもいいかも

        # REVIEW:user_params.passwordだと、マスクされたパスワードな気がする。。。
        hashed_password = PasswordHelper.generate_hashed_password(
            plain_pw=user_params.password)  # type: ignore
        user_params = UserModel(name=user_params.name, email=user_params.email,
                                hashed_password=hashed_password)

        self.db.add(user_params)
        try:
            self.db.commit()
        except IntegrityError as e:
            self.db.rollback()

            col_name = self.__get_column_name_of_unique_error(e)
            if isinstance(e.orig, psycopg2_errors.UniqueViolation) \
               and col_name is not None:
                raise RetroAppColmunUniqueError(col_name)
            raise e
        self.db.refresh(user_params)

        # NOTE:ユーザー登録APIを作る時に何を返すか考える

    def __get_column_name_of_unique_error(
            self, error: IntegrityError) -> str | None:
        col_name = None
        if 'users_email_key' in str(error._message):
            col_name = 'メールアドレス'
        elif 'users_name_key' in str(error._message):
            col_name = '名前'
        return col_name
