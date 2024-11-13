from typing import TYPE_CHECKING, TypedDict

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.models.retrospective_method.comment_model import CommentModel

if TYPE_CHECKING:
    from sqlalchemy.orm.query import Query
    from sqlalchemy.sql.expression import BinaryExpression
from app.errors.retro_app_error import (
    RetroAppRecordNotFoundError,
)


class CommentConditions(TypedDict, total=False):
    # コメントアウトしている列は、その列で検索するユースケースがないため
    id: int
    retrospective_method_id: int
    user_id: int
    # comment: str
    # created_at: "datetime"
    # updated_at: "datetime"


class CommentRepository:
    def __init__(self, db: Session):
        self.__db: Session = db

    def save(self, comment: CommentModel) -> None:
        self.__db.add(comment)

        try:
            self.__db.commit()
        except Exception as e:
            self.__db.rollback()
            raise e

        self.__db.refresh(comment)

    # def delete(self, comment: CommentModel) -> None:
    #     self.__db.delete(comment)

    #     try:
    #         self.__db.commit()
    #     except Exception as e:
    #         self.__db.rollback()
    #         raise e

    def find(self, conditions: CommentConditions = {}) -> list[CommentModel]:
        if not isinstance(conditions, dict):
            raise TypeError("conditions must be of type dict")

        if conditions == {}:
            return self.__db.query(CommentModel).all()

        # 動的にフィルタを追加
        filters: list["BinaryExpression"] = [
            getattr(CommentModel, key) == value for key, value in conditions.items()
        ]

        # MEMO: ここではまだクエリの発行ではない
        query: "Query" = self.__db.query(CommentModel).filter(and_(*filters))

        # ここでクエリ発行
        return query.all()

    def find_by(self, conditions: CommentConditions = {}, raise_exception=True) -> CommentModel | None:
        if not isinstance(conditions, dict):
            raise TypeError("conditions must be of type dict")

        if conditions == {} and raise_exception:
            raise ValueError("conditions must be set")

        filters: list["BinaryExpression"] = [
            getattr(CommentModel, key) == value for key, value in conditions.items()
        ]
        stmt = select(CommentModel).filter(*filters)
        comment = self.__db.execute(stmt).scalars().first()

        if raise_exception and comment is None:
            raise RetroAppRecordNotFoundError("Record not found")
        return comment
