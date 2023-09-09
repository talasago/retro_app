from sqlalchemy import Integer, String, DateTime
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from ..database import Base
import uuid
from datetime import datetime
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


class UserModel(Base):
    """SQLAlchemyのモデルクラス"""
    INDEXED_COLUMNS: tuple = ('id', 'uuid', 'email', 'name')

    __tablename__ = 'users'
    __id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    __uuid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),
                                              default=uuid.uuid4,
                                              nullable=False,
                                              unique=True)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    refresh_token: Mapped[str | None] = mapped_column(String, nullable=True)
    # TODO: 他のモデルが出た時のことを考えて、共通化したい気持ち。
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow(), onupdate=datetime.utcnow())

    @property
    def password(self) -> None:
        # NOTE: passwordを返さない理由：パスワードを返す必要が無い && セキュリティ的にも返したくない
        pass

    @password.setter
    def password(self, plain_password: str) -> None:
        self.hashed_password = pwd_context.hash(plain_password)

    # idは更新させたくないため、変更を許可しない。
    @hybrid_property
    def id(self):
        return self.__id

    # 現状uuidは変更する必要が無いため、変更を許可しない。
    # 今後ユーザー情報変更機能追加時は変更を許可した方が良い。
    @hybrid_property
    def uuid(self):
        return self.__uuid

    def is_password_matching(self, plain_password: str) -> bool:
        # TODO: self.hashed_passwordがNoneだったらfalseを返す。
        return pwd_context.verify(plain_password, self.hashed_password)

    # strにキャストされたときのformat定義、主にデバッグ用
    def __repr__(self):
        return (f'<User({self.id}, {self.uuid}, {self.email}, {self.name},'
                f'{self.created_at}, {self.updated_at})>')
