from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from psycopg2 import errors as psycopg2_errors
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

            error_massage = self.__generate_unique_error_message_for_user(e)
            if isinstance(e.orig, psycopg2_errors.UniqueViolation) \
               and error_massage is not None:
                # TODO:独自のエラークラスにしたい
                raise ValueError(error_massage)
            raise e
        self.db.refresh(user_params)

        # NOTE:ユーザー登録APIを作る時に何を返すか考える

    def __generate_unique_error_message_for_user(
            self, error: IntegrityError) -> str | None:
        message = None
        if 'email' in str(error):
            message = '指定されたメールアドレスはすでに登録されています。'
        return message
