from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base
import uuid
from datetime import datetime


class User(Base):
    """SQLAlchemyのモデルクラス"""

    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(UUID(as_uuid=True), default=uuid.uuid4,
                  nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False, unique=True)
    hashed_password = Column(String, nullable=False)
    # TODO: 他のモデルが出た時のことを考えて、共通化したい気持ち。
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow())
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow())

    # strにキャストされたときのformat定義、主にデバッグ用
    def __repr__(self):
        return (f'<User({self.id}, {self.uuid}, {self.email}, {self.name},'
                f'{self.created_at}, {self.updated_at})>')
