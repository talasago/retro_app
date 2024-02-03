"""依存性の設定をまとめたモジュール"""

# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
from typing import TYPE_CHECKING

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.errors.retro_app_error import (
    RetroAppAuthenticationError,
    RetroAppRecordNotFoundError,
    RetroAppTokenExpiredError,
)
from app.repository.retrospective_method.comment_repository import CommentRepository
from app.repository.user_repository import UserRepository
from app.services.auth_service import AuthService

if TYPE_CHECKING:
    from app.models.user_model import UserModel

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user_repo(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_comment_repo(db: Session = Depends(get_db)) -> CommentRepository:
    return CommentRepository(db)


def get_auth_service(user_repo: UserRepository = Depends(get_user_repo)) -> AuthService:
    return AuthService(user_repo)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    auth_service: AuthService = Depends(get_auth_service),
) -> "UserModel":
    try:
        user = auth_service.get_current_user(token)
    except RetroAppAuthenticationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str("Tokenが間違っています。"),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except RetroAppRecordNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザーが存在しません。",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except RetroAppTokenExpiredError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str("ログイン有効期間を過ぎています。再度ログインしてください。"),
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
