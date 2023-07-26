from sqlalchemy.orm import Session
from ..models.user_model import UserModel
from ..schemas.user_schema import UserCreate
from ..helpers.password_helper import PasswordHelper


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_params: UserCreate) -> None:
        hashed_password = PasswordHelper.generate_hashed_password(
            plain_pw=user_params.password)
        user_params = UserModel(name=user_params.name, email=user_params.email,
                                hashed_password=hashed_password)

        self.db.add(user_params)
        self.db.commit()
        self.db.refresh(user_params)

        # NOTE:ユーザー登録APIを作る時に何を返すか考える

    def is_email_exist(self, email: str):
        return self.db.query(UserModel) \
                      .filter(UserModel.email == email).count() > 0
