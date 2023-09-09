"""WebAPIのエントリポイント。プレゼンテーション層。"""
from typing import TYPE_CHECKING
from fastapi import FastAPI, Depends, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from mangum import Mangum
from ..schemas.user_schema import UserCreate
from ..schemas.http_response_body_user_schema import SignInApiResponseBody
from ..models.user_model import UserModel
from ..errors.retro_app_error import (RetroAppAuthenticationError,
                                      RetroAppRecordNotFoundError,
                                      RetroAppTokenExpiredError)
from .dependencies import (get_current_user, get_user_repo, get_auth_service,
                           oauth2_scheme)


# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
if TYPE_CHECKING:
    from ..services.auth_service import AuthService
    from ..repository.user_repository import UserRepository

app = FastAPI()


@app.post('/api/v1/sign_up', summary='ユーザーを登録します。',
          response_model=SignInApiResponseBody)
def signup_user(user_params: UserCreate,
                user_repo: 'UserRepository' = Depends(get_user_repo)):
    """ユーザー登録のAPIエンドポイント"""
    user: UserModel = UserModel(name=user_params.name, email=user_params.email,
                                password=user_params.password)
    user_repo.save(user=user)

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content=SignInApiResponseBody().model_dump()
    )


# FIXME:response_model追加
# NOTE:OpenAPIのAuthorizeボタンが、/tokenにアクセスするため、/api/v1を付けていない。変える方法は調べていない
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/prefix/token")かなあ
@app.post('/token')
def sign_in(form_data: OAuth2PasswordRequestForm = Depends(),
            auth_service: 'AuthService' = Depends(get_auth_service)):
    """ログインして、トークンを発行する

    Parameters(form_data):
      - grant_type: 使用していない
      - username: このアプリではユーザーのメールアドレスとする。紛らわしいがユーザー名ではない。
        OAuthの仕様でメールアドレスがないため、仕方なくusernameに入れている。
      - password: ユーザーのパスワード
      - self.scopes: 使用していない
      - client_id: 使用していない
      - client_secret: 使用していない
    """

    try:
        user: 'UserModel' = auth_service.authenticate(
            email=form_data.username, password=form_data.password)
    except (RetroAppAuthenticationError, RetroAppRecordNotFoundError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail='メールアドレスまたはパスワードが間違っています。',
                            headers={'WWW-Authenticate': 'Bearer'})

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
    try:
        current_user: 'UserModel' = \
            auth_service.get_current_user_from_refresh_token(refresh_token=token)  # noqa: E501
    except RetroAppRecordNotFoundError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail='ユーザーが存在しません。',
                            headers={'WWW-Authenticate': 'Bearer'})
    except RetroAppAuthenticationError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail=str('Tokenが間違っています。'),
                            headers={'WWW-Authenticate': 'Bearer'})
    except RetroAppTokenExpiredError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail=str('ログイン有効期間を過ぎています。再度ログインしてください。'),
                            headers={'WWW-Authenticate': 'Bearer'})

    tokens = auth_service.generate_tokens(user_uuid=current_user.uuid)
    auth_service.save_refresh_token(current_user, tokens['refresh_token'])

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={**tokens}
    )


# FIXME:response_model追加
@app.post('/api/v1/logout')
def logout(current_user: 'UserModel' = Depends(get_current_user),
           auth_service: 'AuthService' = Depends(get_auth_service)):
    """ログアウトのエンドポイント。リフレッシュトークンを無効化する"""

    # NOTE:アクセストークンの無効化は、セキュリティ的に対応した方が良いかもしれないが、絶対必要な処理ではないため一旦対応しない。
    # アクセストークンを無効化するなら、アクセストークンのブロックリストを管理する必要がある。
    # ログアウト時と、リフレッシュトークン発行時にaccess_tokenの有効期限が切れていない場合にブロックリストに入れる必要あり。

    auth_service.delete_refresh_token(current_user)
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={'message': 'ログアウトしました'}
    )


handler = Mangum(app)
