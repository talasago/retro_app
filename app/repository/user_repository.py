from sqlalchemy.orm import Session
from ..models.user import User
from ..schema.user import UserCreate
import datetime


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_params: UserCreate) -> User:
        # TODO:パスワードの暗号化が必要
        hashed_password = user_params.password + "notreallyhashed"
        user_params = User(name=user_params.name, email=user_params.email,
                           hashed_password=hashed_password, uuid='uuid_dummy',
                           created_at=datetime.datetime.now(),
                           updated_at=datetime.datetime.now())
        self.db.add(user_params)
        self.db.commit()
        self.db.refresh(user_params)
        return user_params  # TODO:何もリターンしなくていいと思う

    def get_user(self, user_id: int) -> User:
        return self.db.query(User).get(user_id)
