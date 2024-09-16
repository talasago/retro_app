from typing import TYPE_CHECKING, TypedDict

from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.models.retrospective_method.comment_model import CommentModel

if TYPE_CHECKING:
    from sqlalchemy.orm.query import Query
    from sqlalchemy.sql.expression import BinaryExpression


class CommentConditions(TypedDict, total=False):
    # コメントアウトしている列は、その列で検索するユースケースがないため
    # id: int
    retrospective_method_id: int
    # user_id: int
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

    def find(self, conditions: CommentConditions = {}) -> list[CommentModel]:
        # これいらないかも
        if conditions is None:
            conditions = {}
            #  self.__db.query(CommentModel).all()でもいいかもしれない

        # MEMO: ここではまだクエリの発行ではない
        query: "Query" = self.__db.query(CommentModel)

        # 動的にフィルタを追加
        filters: list["BinaryExpression"] = [
            getattr(CommentModel, key) == value for key, value in conditions.items()
        ]

        # ifいるのか？
        if filters:
            query = query.filter(and_(*filters))

        # ここでクエリ発行
        return query.all()
