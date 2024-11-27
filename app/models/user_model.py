import uuid as _uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List

from passlib.context import CryptContext
from sqlalchemy import DateTime, Integer, String, event
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.retrospective_method.comment_model import CommentModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserModel(Base):
    """SQLAlchemyのモデルクラス"""

    INDEXED_COLUMNS: tuple = ("id", "uuid", "name")

    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[_uuid.UUID] = mapped_column(
        UUID(as_uuid=True), default=_uuid.uuid4, nullable=False, unique=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    refresh_token: Mapped[str | None] = mapped_column(String, nullable=True)
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

    # 外部キーの設定
    # MEMO: N+1が発生するかは未確認
    comments: Mapped[List["CommentModel"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    @property
    def password(self) -> None:
        # NOTE: passwordを返さない理由：パスワードを返す必要が無い && セキュリティ的にも返したくない
        pass

    @password.setter
    def password(self, plain_password: str) -> None:
        self.hashed_password = pwd_context.hash(plain_password)

    def is_password_matching(self, plain_password: str) -> bool:
        # TODO: self.hashed_passwordがNoneだったらfalseを返す。
        return pwd_context.verify(plain_password, self.hashed_password)

    # strにキャストされたときのformat定義、主にデバッグ用
    def __repr__(self):
        return (
            f"<User({self.id}, {self.uuid}, {self.name},"
            f"{self.created_at}, {self.updated_at})>"
        )


@event.listens_for(UserModel.uuid, "set")
def disable_uuid_column_update(target, value, oldvalue, initiator):
    """
    現状uuidは変更する必要が無いため、変更を許可しない。
    今後ユーザー情報変更機能追加時は変更を許可した方が良い。
    """

    if value != oldvalue:
        raise AttributeError("UserModel.uuid の変更は許可していません")


@event.listens_for(UserModel.id, "set")
def disable_id_column_update(target, value, oldvalue, initiator):
    """
    idは変更する必要が無いため、変更を許可しない。
    """

    if value != oldvalue:
        raise AttributeError("UserModel.idの変更は許可していません")
