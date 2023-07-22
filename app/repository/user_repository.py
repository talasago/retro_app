from passlib.context import CryptContext
from sqlalchemy.orm import Session
from ..models.user_model import UserModel
from ..schema.user_schema import UserCreate


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_params: UserCreate) -> UserModel:
        hashed_password = self.__generate_hashed_password(
            plain_password=user_params.password)
        user_params = UserModel(name=user_params.name, email=user_params.email,
                                hashed_password=hashed_password)

        self.db.add(user_params)
        self.db.commit()
        self.db.refresh(user_params)
        return user_params  # TODO:何もリターンしなくていいと思う

    def get_user(self, user_id: int) -> UserModel:
        return self.db.query(UserModel).get(user_id)

    def __generate_hashed_password(self, plain_password) -> str:
        pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
        return pwd_context.hash(plain_password)
