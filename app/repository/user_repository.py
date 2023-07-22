from passlib.context import CryptContext
from sqlalchemy.orm import Session
from ..models.user import User
from ..schema.user import UserCreate


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_params: UserCreate) -> User:
        hashed_password = self.__generate_hashed_password(
            plain_password=user_params.password)
        user_params = User(name=user_params.name, email=user_params.email,
                           hashed_password=hashed_password)

        self.db.add(user_params)
        self.db.commit()
        self.db.refresh(user_params)
        return user_params  # TODO:何もリターンしなくていいと思う

    def get_user(self, user_id: int) -> User:
        return self.db.query(User).get(user_id)

    def __generate_hashed_password(self, plain_password) -> str:
        pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
        return pwd_context.hash(plain_password)
