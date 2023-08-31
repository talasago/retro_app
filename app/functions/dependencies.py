"""依存性の設定をまとめたモジュール"""
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from ..database import SessionLocal
from ..repository.user_repository import UserRepository
from ..services.auth_service import AuthService
from ..errors.retro_app_error import RetroAppAuthenticationError


# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from ..models.user_model import UserModel

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user_repo(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_auth_service(
        user_repo: UserRepository = Depends(get_user_repo)) -> AuthService:
    return AuthService(user_repo)


def get_current_user(token: str = Depends(oauth2_scheme),
                     auth_service: AuthService =
                     Depends(get_auth_service)) -> 'UserModel':
    try:
        user = auth_service.get_current_user(token)
    except RetroAppAuthenticationError as e:
        raise HTTPException(status_code=401, detail=str(e.message))

    return user
