from sqlalchemy import Integer, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from ..database import Base
import uuid as _uuid
from datetime import datetime


class UserModel(Base):
    """SQLAlchemyのモデルクラス"""

    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[_uuid.UUID] = mapped_column(UUID(as_uuid=True),
                                             default=_uuid.uuid4,
                                             nullable=False,
                                             unique=True)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    # TODO: 他のモデルが出た時のことを考えて、共通化したい気持ち。
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow())

    # strにキャストされたときのformat定義、主にデバッグ用
    def __repr__(self):
        return (f'<User({self.id}, {self.uuid}, {self.email}, {self.name},'
                f'{self.created_at}, {self.updated_at})>')
