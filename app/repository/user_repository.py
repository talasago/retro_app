from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from psycopg2 import errors as psycopg2_errors
from typing import Union
from ..models.user_model import UserModel
from ..errors.retro_app_error import RetroAppColmunUniqueError

# 型アノテーションだけのimport。これで本番実行時は無駄なimportが発生しないはず。
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from uuid import UUID


class UserRepository:
    def __init__(self, db: Session):
        self.__db: Session = db

    # TODO:insertとupdateはsave()とかに変更する
    def update_user(self, user: UserModel) -> None:
        # TODO:エラーハンドリング
        self.__db.merge(user)
        self.__db.commit()
        return

    def save(self, user: UserModel) -> None:
        # idがあるかどうかで既存のレコードかどうか判断する
        self.__db.merge(user) if user.id else self.__db.add(user)

        try:
            self.__db.commit()
        except IntegrityError as e:
            self.__db.rollback()

            col_name = self.__get_column_name_of_unique_error(e)
            # NOTE:重複エラーだけはバリデーションをかけずに登録時のエラーで判断とした。
            # バリデーションにするなら、INSERT前にSELECTを投げることになり、SQLを2回実行するコストを考えると
            # 登録時のエラーで良いと判断したため。
            if isinstance(e.orig, psycopg2_errors.UniqueViolation) \
               and col_name is not None:
                raise RetroAppColmunUniqueError(col_name)
            raise e
        self.__db.refresh(user)

    def find_by(self, column: str,
                value: Union[str, 'UUID', int]) -> UserModel | None:
        """条件に合致するレコードを検索して返す"""
        # FIXME:現状複数条件に対応できていない。今後対応するなら、引数はdictの方が良さそう。
        # NOTE:コストがかかるので、ユニーク以外の列は検索を不許可とする
        if column not in UserModel.INDEXED_COLUMNS:
            # TODO: カスタムエラークラス
            raise ValueError('Invalid column for search')

        return self.__db.execute(
            select(UserModel).where(getattr(UserModel, column) == value)
        ).scalars().first()

    def __get_column_name_of_unique_error(
            self, error: IntegrityError) -> str | None:
        col_name = None
        if 'users_email_key' in str(error._message):
            col_name = 'メールアドレス'
        elif 'users_name_key' in str(error._message):
            col_name = '名前'
        return col_name
