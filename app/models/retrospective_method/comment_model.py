from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user_model import UserModel


class CommentModel(Base):
    """SQLAlchemyのモデルクラス"""

    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    retrospective_method_id: Mapped[int] = mapped_column(
        Integer, primary_key=False, nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    comment: Mapped[str] = mapped_column(String, nullable=False)

    # TODO: 他のモデルが出た時のことを考えて、共通化したい気持ち。
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc),
    )

    # 外部キー
    user: Mapped["UserModel"] = relationship(back_populates="comments")
    # 外部キーのデータ
    # 遅延読み込みにしたいが...
    # 遅延読み込みしているので、CommentModelのuserをアクセスしない限り
    # user情報を取得するクエリは実行されない
    # user: Mapped["UserModel"] = relationship(
    #    "UserModel", backref=backref("comments", lazy="dynamic"), lazy="noload"
    # )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "retrospective_method_id": self.retrospective_method_id,
            "user_id": self.user_id,
            "comment": self.comment,
            "created_at": str(self.created_at),
            "updated_at": str(self.updated_at),
        }

# @event.listens_for(CommentModel.uuid, "set")
# def disable_uuid_column_update(target, value, oldvalue, initiator):
#     """
#     現状uuidは変更する必要が無いため、変更を許可しない。
#     今後ユーザー情報変更機能追加時は変更を許可した方が良い。
#     """

#     if value != oldvalue:
#         raise AttributeError("CommentModel.uuid の変更は許可していません")
