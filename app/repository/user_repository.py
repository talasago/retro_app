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
            # HACK: 条件が複雑なんよ。そしてネストが多い。
            if isinstance(e.orig, psycopg2_errors.UniqueViolation):
                error_massage = self.__generate_error_message(e)
                if error_massage is None:
                    raise e
                # TODO:独自のエラークラスにしたい
                raise ValueError(error_massage)
            else:
                raise e

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

    def __generate_error_message(self, error: IntegrityError) -> str | None:
        message = None
        if 'email' in str(error):
            message = '指定されたメールアドレスはすでに登録されています。'
        return message
