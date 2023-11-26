from datetime import datetime

from passlib.context import CryptContext
from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class CommentModel(Base):
    """SQLAlchemyのモデルクラス"""

    # INDEXED_COLUMNS: tuple = ("id", "uuid", "email", "name")

    __tablename__ = "comments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # uuid: Mapped[_uuid.UUID] = mapped_column(
    #     UUID(as_uuid=True), default=_uuid.uuid4, nullable=False, unique=True
    # )

    # TODO : foreign_keyは後で指定する (retrospective_method_id & user_id)
    retrospective_method_id: Mapped[int] = mapped_column(
        Integer, primary_key=False, nullable=False
    )
    user_id: Mapped[int] = mapped_column(Integer, primary_key=False, nullable=False)
    comment: Mapped[str] = mapped_column(String, nullable=False)

    # TODO: 他のモデルが出た時のことを考えて、共通化したい気持ち。
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow(), onupdate=datetime.utcnow()
    )


# @event.listens_for(CommentModel.uuid, "set")
# def disable_uuid_column_update(target, value, oldvalue, initiator):
#     """
#     現状uuidは変更する必要が無いため、変更を許可しない。
#     今後ユーザー情報変更機能追加時は変更を許可した方が良い。
#     """

#     if value != oldvalue:
#         raise AttributeError("CommentModel.uuid の変更は許可していません")
