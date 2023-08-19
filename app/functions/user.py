"""WebAPIのエントリポイント。プレゼンテーション層。"""
from typing import TYPE_CHECKING
from fastapi import FastAPI, Depends, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from mangum import Mangum
from sqlalchemy.orm import Session
from ..schemas.user_schema import UserCreate
from ..repository.user_repository import UserRepository
from .dependencies import (get_current_user, get_db, get_auth_service,
                           oauth2_scheme)


# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
if TYPE_CHECKING:
    from ..models.user_model import UserModel
    from ..services.auth_service import AuthService

app = FastAPI()


# ユーザー登録のエンドポイント
# FIXME:response_modelが間違ってる
@app.post('/api/v1/sign_up', response_model=UserCreate)
def signup_user(user: UserCreate, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    user_repo.create_user(user_params=user)

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={'message': 'ユーザー登録が成功しました。'}
    )


# ログインのエンドポイント
# FIXME:response_model追加
# NOTE:OpenAPIのAuthorizeボタンが、/tokenにアクセスするため、/api/v1を付けていない。変える方法は調べていない
@app.post('/token')
def sign_in(form_data: OAuth2PasswordRequestForm = Depends(),
            auth_service: 'AuthService' = Depends(get_auth_service)):
    """ログインして、トークンを発行する"""
    # NOTE:usernameとあるが、実際はemailを使用する。OAuthの仕様によりusernameという名前になっているらしい。
    user = auth_service.authenticate(
        email=form_data.username, password=form_data.password)
    tokens = auth_service.generate_tokens(user_uuid=user.uuid)
    auth_service.save_refresh_token(user, tokens['refresh_token'])

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={'message': 'ログインしました', 'name': user.name, **tokens}
    )


# FIXME:response_model追加
@app.post('/refresh_token')
def refresh_token(auth_service: 'AuthService' = Depends(get_auth_service),
                  token: str = Depends(oauth2_scheme)):
    """リフレッシュトークンでトークンを再取得"""
    current_user: 'UserModel' = \
        auth_service.get_current_user_from_refresh_token(refresh_token=token)
    tokens = auth_service.generate_tokens(user_uuid=current_user.uuid)
    auth_service.save_refresh_token(current_user, tokens['refresh_token'])

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={**tokens}
    )


# ログアウトのエンドポイント
# TODO:非同期処理でも良いかもしれない
# FIXME:response_model追加
@app.post('/api/v1/logout')
def logout(current_user: 'UserModel' = Depends(get_current_user)):
    # TODO:リフレッシュトークンを無効化

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={'message': 'ログアウトしました'}
    )


handler = Mangum(app)
