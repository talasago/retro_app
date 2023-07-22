from sqlalchemy.orm import Session
from ..models.user_model import UserModel
from ..schema.user_schema import UserCreate
from ..helpers.password_helper import PasswordHelper


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_params: UserCreate) -> UserModel:
        hashed_password = PasswordHelper.generate_hashed_password(
            plain_pw=user_params.password)
        user_params = UserModel(name=user_params.name, email=user_params.email,
                                hashed_password=hashed_password)

        self.db.add(user_params)
        self.db.commit()
        self.db.refresh(user_params)
        return user_params  # TODO:何もリターンしなくていいと思う

    # TODO:まだ使用していない関数
    def get_user(self, user_id: int) -> UserModel:
        return self.db.query(UserModel).get(user_id)
