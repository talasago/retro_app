from sqlalchemy import Column, Integer, String, DateTime
from ..database import Base


class User(Base):
    """SQLAlchemyのモデルクラス"""

    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    # TODO:uuidタイプと、デフォルト値を指定した方が良いかも
    uuid = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False, unique=True)
    hashed_password = Column(String, nullable=False)
    # TODO: 他のモデルが出た時のことを考えて、共通化したい気持ち。
    # デフォルト値も指定した方が良いかも
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

    # strにキャストされたときのformat定義、主にデバッグ用
    def __repr__(self):
        # TODO:変更せねば
        return f'<User({self.id}, {self.name})>'
